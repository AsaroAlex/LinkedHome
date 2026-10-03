import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import { randomUUID } from "node:crypto";
import { buildApp } from "../server/app";
import { makePool, type DB } from "../server/db";
import { migrate } from "../scripts/migrate";
import { digest } from "../server/auth";
import type { RuntimeConfiguration } from "../server/config";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname) ||
  new URL(url).search
)
  throw new Error("Deployment tests require isolated local soglia_test.");
const db = makePool(url);
const runtime: RuntimeConfiguration = {
  environment: "staging",
  origin: "https://staging.example.test",
  mailTransport: "smtp",
  trustedProxies: false,
};
const password = "Synthetic-only-passphrase";
beforeAll(async () => {
  const target = (
    await db.query(
      "SELECT current_database() AS db,host(inet_server_addr()) AS host",
    )
  ).rows[0];
  if (
    target.db !== "soglia_test" ||
    !["127.0.0.1", "::1"].includes(target.host)
  )
    throw new Error("Unsafe deployment test connection.");
  await migrate(db);
});
beforeEach(async () => {
  await db.query("TRUNCATE users,events,audit_log RESTART IDENTITY CASCADE");
});
afterAll(async () => {
  await db.end();
});

describe("deployment HTTP boundary", () => {
  it("uses Secure Host cookies and exposes only the safe runtime fields", async () => {
    const app = await buildApp(db, {
      runtime,
      serveStatic: false,
      limits: false,
      mail: async () => {},
    });
    try {
      const config = await app.inject({ method: "GET", url: "/api/config" });
      expect(config.json()).toEqual({
        environment: "staging",
        mailTransport: "smtp",
      });
      expect(config.headers["strict-transport-security"]).toBe(
        "max-age=31536000",
      );
      expect(config.headers["cache-control"]).toBe("no-store");
      const result = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        headers: { origin: runtime.origin, "content-type": "application/json" },
        payload: {
          email: `${randomUUID()}@example.test`,
          display_name: "Test",
          role: "tenant",
          password,
        },
      });
      expect(result.statusCode).toBe(201);
      expect(result.cookies[0]).toMatchObject({
        name: "__Host-soglia",
        secure: true,
        httpOnly: true,
        path: "/",
        sameSite: "Strict",
      });
      expect(result.cookies[0]).not.toHaveProperty("domain");
      const rejected = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
        headers: {
          origin: "https://attacker.example.test",
          "content-type": "application/json",
        },
        payload: {},
      });
      expect(rejected.statusCode).toBe(403);
      const logout = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
        headers: { origin: runtime.origin, "content-type": "application/json" },
        payload: {},
      });
      expect(logout.statusCode).toBe(200);
      expect(logout.cookies[0]).toMatchObject({
        name: "__Host-soglia",
        secure: true,
        httpOnly: true,
        path: "/",
        value: "",
      });
    } finally {
      await app.close();
    }
  });
  it("expires Secure Host cookies after password reset and account deletion", async () => {
    let resetToken = "";
    const app = await buildApp(db, {
      runtime,
      serveStatic: false,
      limits: false,
      mail: async (_email, purpose, token) => {
        if (purpose === "reset") resetToken = token;
      },
    });
    const email = `${randomUUID()}@example.test`;
    const headers = {
      origin: runtime.origin,
      "content-type": "application/json",
    };
    const account = { email, display_name: "Test", role: "tenant", password };
    try {
      await app.inject({
        method: "POST",
        url: "/api/auth/register",
        headers,
        payload: account,
      });
      await app.inject({
        method: "POST",
        url: "/api/auth/forgot",
        headers,
        payload: { email },
      });
      const reset = await app.inject({
        method: "POST",
        url: "/api/auth/reset",
        headers,
        payload: { token: resetToken, password },
      });
      expect(reset.statusCode).toBe(200);
      expect(reset.cookies[0]).toMatchObject({
        name: "__Host-soglia",
        secure: true,
        path: "/",
        value: "",
      });
      const login = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        headers,
        payload: { email, password },
      });
      const deleted = await app.inject({
        method: "DELETE",
        url: "/api/account",
        headers: {
          ...headers,
          cookie: `${login.cookies[0].name}=${login.cookies[0].value}`,
        },
        payload: { password, confirm: "ELIMINA" },
      });
      expect(deleted.statusCode).toBe(200);
      expect(deleted.cookies[0]).toMatchObject({
        name: "__Host-soglia",
        secure: true,
        path: "/",
        value: "",
      });
    } finally {
      await app.close();
    }
  });
  it("rolls back failed registration and gives the same recovery HTTP response during SMTP failure", async () => {
    const email = `${randomUUID()}@example.test`;
    const silent = vi.spyOn(console, "error").mockImplementation(() => {});
    const good = await buildApp(db, {
      runtime,
      serveStatic: false,
      limits: false,
      mail: async () => {},
    });
    const failing = await buildApp(db, {
      runtime,
      serveStatic: false,
      limits: false,
      mail: async () => {
        throw new Error(
          "Remote response including private recipient and credentials.",
        );
      },
    });
    const request = (
      app: typeof good,
      path: string,
      payload: Record<string, unknown>,
    ) =>
      app.inject({
        method: "POST",
        url: `/api/auth/${path}`,
        headers: { origin: runtime.origin, "content-type": "application/json" },
        payload,
      });
    try {
      expect(
        (
          await request(failing, "register", {
            email,
            display_name: "Test",
            role: "tenant",
            password,
          })
        ).statusCode,
      ).toBe(500);
      expect(
        (await db.query("SELECT id FROM users WHERE email=$1", [email]))
          .rowCount,
      ).toBe(0);
      expect(
        (
          await request(good, "register", {
            email,
            display_name: "Test",
            role: "tenant",
            password,
          })
        ).statusCode,
      ).toBe(201);
      const id = (
        await db.query("SELECT id FROM users WHERE email=$1", [email])
      ).rows[0].id;
      const oldHash = digest("synthetic-token");
      await db.query(
        "INSERT INTO auth_tokens VALUES($1,$2,'reset',now()+interval '30 minutes')",
        [oldHash, id],
      );
      const known = await request(failing, "forgot", { email });
      const missing = await request(failing, "forgot", {
        email: "missing@example.test",
      });
      expect(known.statusCode).toBe(200);
      expect(missing.statusCode).toBe(200);
      expect(known.json()).toEqual(missing.json());
      expect(
        (
          await db.query(
            "SELECT token_hash FROM auth_tokens WHERE user_id=$1 AND purpose='reset'",
            [id],
          )
        ).rows,
      ).toEqual([{ token_hash: oldHash }]);
      expect(JSON.stringify(silent.mock.calls)).not.toContain(email);
      expect(JSON.stringify(silent.mock.calls)).not.toContain("credentials");
    } finally {
      silent.mockRestore();
      await good.close();
      await failing.close();
    }
  });
  it.each([false, ["127.0.0.1"]] as const)(
    "trusts forwarded addresses only from explicit upstreams %j",
    async (trustedProxies) => {
      const app = await buildApp(db, {
        runtime: {
          ...runtime,
          trustedProxies:
            trustedProxies === false ? false : [...trustedProxies],
        },
        serveStatic: false,
      });
      app.get("/test-ip", async (r) => ({ ip: r.ip }));
      try {
        const trusted = await app.inject({
          method: "GET",
          url: "/test-ip",
          remoteAddress: "127.0.0.1",
          headers: { "x-forwarded-for": "203.0.113.5" },
        });
        expect(trusted.json().ip).toBe(
          trustedProxies ? "203.0.113.5" : "127.0.0.1",
        );
        const spoofed = await app.inject({
          method: "GET",
          url: "/test-ip",
          remoteAddress: "198.51.100.7",
          headers: { "x-forwarded-for": "203.0.113.5" },
        });
        expect(spoofed.json().ip).toBe("198.51.100.7");
      } finally {
        await app.close();
      }
    },
  );
  it("keeps liveness available while database readiness fails", async () => {
    const unavailable = {
      query: async () => {
        throw new Error("Unavailable");
      },
    } as unknown as DB;
    const silent = vi.spyOn(console, "error").mockImplementation(() => {});
    const app = await buildApp(unavailable, { runtime, serveStatic: false });
    try {
      expect(
        (await app.inject({ method: "GET", url: "/api/live" })).statusCode,
      ).toBe(200);
      expect(
        (await app.inject({ method: "GET", url: "/api/health" })).statusCode,
      ).toBe(500);
    } finally {
      silent.mockRestore();
      await app.close();
    }
  });
});

import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { buildApp } from "../server/app";
import { digest, token } from "../server/auth";
import { makePool } from "../server/db";
import type { RuntimeConfiguration } from "../server/config";
import { migrate } from "../scripts/migrate";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname) ||
  new URL(url).search
)
  throw new Error("Preview tests require isolated local soglia_test.");
const db = makePool(url);
const runtime: RuntimeConfiguration = {
  environment: "preview",
  origin: "https://preview.example.test",
  mailTransport: "disabled",
  trustedProxies: false,
};
const workspaceCookie = "__Host-linkedhome-preview";
const sessionCookie = "__Host-soglia";
type App = Awaited<ReturnType<typeof buildApp>>;
type Jar = Map<string, string>;
async function request(
  app: App,
  jar: Jar,
  method: "GET" | "POST" | "PUT",
  path: string,
  payload?: Record<string, unknown>,
) {
  const result = await app.inject({
    method,
    url: "/api" + path,
    headers: {
      origin: runtime.origin,
      "content-type": "application/json",
      cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; "),
    },
    payload,
  });
  for (const cookie of result.cookies) jar.set(cookie.name, cookie.value);
  return result;
}
async function enter(app: App, jar: Jar, role: "tenant" | "landlord") {
  const response = await request(app, jar, "POST", "/auth/preview", { role });
  expect(response.statusCode).toBe(200);
  const { user } = (await request(app, jar, "GET", "/session")).json();
  expect(user).toMatchObject({ role, email_verified: true, staff_role: null });
  expect(user.email).toMatch(/@example\.test$/);
  return { response, user };
}

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
    throw new Error("Unsafe preview test connection.");
  await migrate(db);
});
beforeEach(async () => {
  await db.query("TRUNCATE users,events,audit_log RESTART IDENTITY CASCADE");
});
afterAll(async () => {
  await db.end();
});

describe("synthetic hosted preview", () => {
  it("creates an isolated synthetic pair using secure opaque cookies and no mail", async () => {
    const mail = vi.fn(async () => {});
    const app = await buildApp(db, {
      runtime,
      serveStatic: false,
      limits: false,
      mail,
    });
    try {
      const jar: Jar = new Map();
      const { response, user } = await enter(app, jar, "tenant");
      expect(response.cookies).toHaveLength(2);
      for (const name of [workspaceCookie, sessionCookie]) {
        const cookie = response.cookies.find((item) => item.name === name);
        expect(cookie).toMatchObject({
          secure: true,
          httpOnly: true,
          sameSite: "Strict",
          path: "/",
          maxAge: 7 * 86400,
        });
        expect(cookie).not.toHaveProperty("domain");
        expect(cookie?.value).toMatch(/^[a-f0-9]{64}$/);
      }
      expect(response.headers["strict-transport-security"]).toBe(
        "max-age=31536000",
      );
      const workspace = (await db.query("SELECT * FROM preview_workspaces"))
        .rows[0];
      expect(workspace.token_hash).toBe(digest(jar.get(workspaceCookie)!));
      expect(workspace.token_hash).not.toBe(jar.get(workspaceCookie));
      expect(workspace.tenant_id).toBe(user.id);
      const users = (await db.query("SELECT * FROM users")).rows;
      expect(users).toHaveLength(2);
      expect(users.every((item) => item.staff_role === null)).toBe(true);
      expect(
        users.every((item) => item.password_hash === "preview-disabled"),
      ).toBe(true);
      const profile = (await request(app, jar, "GET", "/profile")).json()
        .profile;
      expect(profile).toMatchObject({
        city: "Bologna",
        budget: 1100,
        duration: 12,
        occupants: 2,
        status: "published",
      });
      expect((await request(app, jar, "GET", "/config")).json()).toEqual({
        environment: "preview",
        mailTransport: "disabled",
      });
      expect(
        (await request(app, jar, "GET", "/income")).json().demo_available,
      ).toBe(true);
      expect(
        (
          await request(app, jar, "POST", "/income/demo", {
            scenario: "completed",
          })
        ).statusCode,
      ).toBe(201);
      expect((await request(app, jar, "GET", "/staff/users")).statusCode).toBe(
        403,
      );
      expect(mail).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it("switches roles in one workspace, preserves edits and keeps browser pairs separate", async () => {
    const app = await buildApp(db, {
      runtime,
      serveStatic: false,
      limits: false,
    });
    try {
      const first: Jar = new Map();
      const second: Jar = new Map();
      const tenant = (await enter(app, first, "tenant")).user;
      const otherTenant = (await enter(app, second, "tenant")).user;
      expect(otherTenant.id).not.toBe(tenant.id);
      const originalWorkspace = first.get(workspaceCookie);
      const previousSession = first.get(sessionCookie)!;
      const profile = (await request(app, first, "GET", "/profile")).json()
        .profile;
      expect(
        (
          await request(app, first, "PUT", "/profile", {
            city: profile.city,
            budget: 1200,
            move_in: profile.move_in,
            duration: profile.duration,
            occupants: profile.occupants,
          })
        ).statusCode,
      ).toBe(200);
      const { user: landlord } = await enter(app, first, "landlord");
      expect(landlord.id).not.toBe(tenant.id);
      expect(first.get(workspaceCookie)).toBe(originalWorkspace);
      expect(first.get(sessionCookie)).not.toBe(previousSession);
      expect(
        (
          await db.query("SELECT 1 FROM sessions WHERE token_hash=$1", [
            digest(previousSession),
          ])
        ).rowCount,
      ).toBe(0);
      expect(
        (await request(app, first, "PUT", "/profile", {})).statusCode,
      ).toBe(403);
      const [property] = (
        await request(app, first, "GET", "/properties")
      ).json().properties;
      expect(property).toMatchObject({
        city: "Bologna",
        rent: 850,
        status: "published",
        authority_attested: true,
      });
      const discovery = (
        await request(app, first, "GET", `/discover/${property.id}`)
      ).json();
      expect(discovery.profiles).toHaveLength(1);
      expect(discovery.profiles[0]).toMatchObject({
        id: tenant.id,
        budget: 1200,
        compatibility: { compatible: true },
      });
      const invitation = {
        property_id: property.id,
        tenant_id: tenant.id,
        property_revision: property.revision,
        profile_revision: discovery.profiles[0].revision,
      };
      expect(
        (
          await request(app, first, "POST", "/invitations", {
            ...invitation,
            tenant_id: otherTenant.id,
          })
        ).statusCode,
      ).toBe(403);
      const sent = await request(
        app,
        first,
        "POST",
        "/invitations",
        invitation,
      );
      expect(sent.statusCode).toBe(201);
      const id = sent.json().id;
      expect(
        (await request(app, second, "GET", `/invitations/${id}`)).statusCode,
      ).toBe(404);
      expect((await enter(app, first, "tenant")).user.id).toBe(tenant.id);
      expect(
        (await request(app, first, "GET", "/profile")).json().profile.budget,
      ).toBe(1200);
      expect((await request(app, first, "GET", "/properties")).statusCode).toBe(
        403,
      );
      expect(
        (
          await request(app, first, "POST", `/invitations/${id}/action`, {
            action: "accept",
            property_revision: property.revision,
            profile_revision: discovery.profiles[0].revision,
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (
          await request(app, first, "POST", `/conversations/${id}/messages`, {
            body: "Messaggio dimostrativo nella mia preview.",
          })
        ).statusCode,
      ).toBe(201);
      await enter(app, first, "landlord");
      expect(
        (await request(app, first, "GET", `/conversations/${id}`)).json()
          .messages,
      ).toHaveLength(1);
      expect((await db.query("SELECT 1 FROM users")).rowCount).toBe(4);
    } finally {
      await app.close();
    }
  });

  it("blocks password/email authentication and rejects privileged demo roles", async () => {
    const mail = vi.fn(async () => {});
    const app = await buildApp(db, {
      runtime,
      serveStatic: false,
      limits: false,
      mail,
    });
    try {
      const jar: Jar = new Map();
      for (const endpoint of [
        "register",
        "login",
        "forgot",
        "verify",
        "reset",
        "resend",
      ])
        expect(
          (await request(app, jar, "POST", `/auth/${endpoint}`, {})).statusCode,
        ).toBe(403);
      for (const role of ["admin", "moderator", "both"])
        expect(
          (await request(app, jar, "POST", "/auth/preview", { role }))
            .statusCode,
        ).toBe(400);
      expect((await db.query("SELECT 1 FROM users")).rowCount).toBe(0);
      expect((await db.query("SELECT 1 FROM auth_tokens")).rowCount).toBe(0);
      expect(mail).not.toHaveBeenCalled();
      const crossOrigin = await app.inject({
        method: "POST",
        url: "/api/auth/preview",
        headers: {
          origin: "https://attacker.example.test",
          "content-type": "application/json",
        },
        payload: { role: "tenant" },
      });
      expect(crossOrigin.statusCode).toBe(403);
    } finally {
      await app.close();
    }
  });

  it("requires the matching unexpired workspace even for a valid ordinary session", async () => {
    const app = await buildApp(db, {
      runtime,
      serveStatic: false,
      limits: false,
    });
    try {
      const first: Jar = new Map();
      const second: Jar = new Map();
      const tenant = (await enter(app, first, "tenant")).user;
      await enter(app, second, "tenant");
      const onlySession = new Map([[sessionCookie, first.get(sessionCookie)!]]);
      expect(
        (await request(app, onlySession, "GET", "/session")).json().user,
      ).toBeNull();
      const mismatched = new Map([
        [workspaceCookie, second.get(workspaceCookie)!],
        [sessionCookie, first.get(sessionCookie)!],
      ]);
      expect(
        (await request(app, mismatched, "GET", "/session")).json().user,
      ).toBeNull();
      const staff = (
        await db.query(
          "INSERT INTO users(email,password_hash,display_name,role,staff_role,email_verified) VALUES('old-staff@example.test','disabled','Staff sintetico','tenant','admin',true) RETURNING id",
        )
      ).rows[0];
      const staleSecret = token();
      await db.query(
        "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 day')",
        [digest(staleSecret), staff.id],
      );
      const staleJar = new Map([
        [workspaceCookie, first.get(workspaceCookie)!],
        [sessionCookie, staleSecret],
      ]);
      expect(
        (await request(app, staleJar, "GET", "/staff/users")).statusCode,
      ).toBe(401);
      await db.query(
        "UPDATE preview_workspaces SET expires_at=now()-interval '1 second' WHERE token_hash=$1",
        [digest(first.get(workspaceCookie)!)],
      );
      expect(
        (await request(app, first, "GET", "/session")).json().user,
      ).toBeNull();
      const nextTenant = (await enter(app, first, "tenant")).user;
      expect(nextTenant.id).not.toBe(tenant.id);
      expect(
        (await db.query("SELECT 1 FROM users WHERE id=$1", [tenant.id]))
          .rowCount,
      ).toBe(1);
      const logout = await request(app, first, "POST", "/auth/logout", {});
      expect(logout.statusCode).toBe(200);
      expect(logout.cookies).toHaveLength(1);
      expect(logout.cookies[0]).toMatchObject({
        name: sessionCookie,
        value: "",
        secure: true,
      });
      expect((await enter(app, first, "tenant")).user.id).toBe(nextTenant.id);
    } finally {
      await app.close();
    }
  });

  it.each(["local", "staging", "production"] as const)(
    "forbids demo entry in %s without creating accounts",
    async (environment) => {
      const app = await buildApp(db, {
        runtime: {
          ...runtime,
          environment,
          mailTransport: environment === "local" ? "local" : "smtp",
        },
        serveStatic: false,
        limits: false,
      });
      try {
        const response = await request(
          app,
          new Map(),
          "POST",
          "/auth/preview",
          {
            role: "tenant",
          },
        );
        expect(response.statusCode).toBe(403);
        expect(response.cookies).toHaveLength(0);
        expect((await db.query("SELECT 1 FROM users")).rowCount).toBe(0);
      } finally {
        await app.close();
      }
    },
  );
});

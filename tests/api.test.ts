import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { buildApp } from "../server/app";
import { makePool } from "../server/db";
import { migrate, checkMigrations } from "../scripts/migrate";
import { hashPassword, digest } from "../server/auth";
const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search !== "" ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error(
    "Refusing to run integration tests outside isolated local soglia_test.",
  );
const db = makePool(url),
  origin = "http://127.0.0.1:3000";
const mail: Array<{ email: string; purpose: string; token: string }> = [];
const app = await buildApp(db, {
  origin,
  limits: false,
  serveStatic: false,
  mail: async (email, purpose, token) => {
    mail.push({ email, purpose, token });
  },
});
const pwd = "Synthetic-only-passphrase";
let t: any,
  l: any,
  x: any,
  admin: any,
  moderator: any,
  property: any,
  profile: any;
function request(
  method: any,
  path: string,
  body?: any,
  cookie?: string,
  headers: Record<string, string> = {},
) {
  return app.inject({
    method,
    url: "/api" + path,
    headers: {
      origin,
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    payload: body,
  });
}
async function signup(role = "tenant", verified = true) {
  const email = `${randomUUID()}@example.test`;
  const r = await request("POST", "/auth/register", {
    email,
    password: pwd,
    display_name: "Persona sintetica",
    role,
  });
  expect(r.statusCode).toBe(201);
  const cookie = r.cookies[0].name + "=" + r.cookies[0].value;
  const user = (await request("GET", "/session", undefined, cookie)).json()
    .user;
  if (verified)
    expect(
      (await request("POST", "/auth/verify", { token: mail.at(-1)!.token }))
        .statusCode,
    ).toBe(200);
  return { ...user, cookie, email };
}
async function createProfile(user = t, patch = {}) {
  const input = {
    city: "Bologna",
    budget: 1100,
    move_in: "2027-01-01",
    duration: 12,
    occupants: 2,
    ...patch,
  };
  expect(
    (await request("PUT", "/profile", input, user.cookie)).statusCode,
  ).toBe(200);
  expect(
    (
      await request(
        "POST",
        "/profile/status",
        { status: "published" },
        user.cookie,
      )
    ).statusCode,
  ).toBe(200);
  return (await request("GET", "/profile", undefined, user.cookie)).json()
    .profile;
}
async function createProperty(user = l, patch = {}) {
  const input = {
    title: "Una casa sintetica",
    city: "Bologna",
    area: "Saragozza",
    description: "Immobile sintetico per prove locali.",
    rent: 850,
    available_from: "2026-12-01",
    min_months: 6,
    max_months: 36,
    capacity: 2,
    sqm: 65,
    rooms: 3,
    furnished: true,
    authority_attested: true,
    ...patch,
  };
  const r = await request("POST", "/properties", input, user.cookie);
  expect(r.statusCode).toBe(201);
  const id = r.json().id;
  expect(
    (
      await request(
        "POST",
        `/properties/${id}/status`,
        { status: "published" },
        user.cookie,
      )
    ).statusCode,
  ).toBe(200);
  return (await request("GET", "/properties", undefined, user.cookie))
    .json()
    .properties.find((p: any) => p.id === id);
}
async function send(p = property, tenant = t, pf = profile, owner = l) {
  const r = await request(
    "POST",
    "/invitations",
    {
      property_id: p.id,
      tenant_id: tenant.id,
      property_revision: p.revision,
      profile_revision: pf.revision,
    },
    owner.cookie,
  );
  expect(r.statusCode).toBe(201);
  return r.json().id;
}
async function accept(id: string, p = property, pf = profile, tenant = t) {
  return request(
    "POST",
    `/invitations/${id}/action`,
    {
      action: "accept",
      property_revision: p.revision,
      profile_revision: pf.revision,
    },
    tenant.cookie,
  );
}
async function accepted() {
  const id = await send();
  expect((await accept(id)).statusCode).toBe(200);
  return id;
}
const cleanProperty = (p: any) => {
  const {
    title,
    city,
    area,
    description,
    rent,
    available_from,
    min_months,
    max_months,
    capacity,
    sqm,
    rooms,
    furnished,
    authority_attested,
  } = p;
  return {
    title,
    city,
    area,
    description,
    rent,
    available_from,
    min_months,
    max_months,
    capacity,
    sqm,
    rooms,
    furnished,
    authority_attested,
  };
};
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
    throw new Error(
      `Unsafe effective test connection: ${target.db}, ${target.host}`,
    );
  await migrate(db);
  await app.ready();
});
afterAll(async () => {
  await app.close();
  await db.end();
});
beforeEach(async () => {
  await db.query("TRUNCATE users,events,audit_log RESTART IDENTITY CASCADE");
  mail.length = 0;
  t = await signup();
  l = await signup("landlord");
  x = await signup("both");
  admin = await signup("both");
  moderator = await signup("both");
  await db.query("UPDATE users SET staff_role='admin' WHERE id=$1", [admin.id]);
  await db.query("UPDATE users SET staff_role='moderator' WHERE id=$1", [
    moderator.id,
  ]);
  profile = await createProfile();
  property = await createProperty();
});
describe("authentication and request boundary", () => {
  it("hashes password/session and sets private cookie/cache headers", async () => {
    const r = await request("POST", "/auth/login", {
      email: t.email,
      password: pwd,
    });
    expect(r.statusCode).toBe(200);
    expect(r.headers["set-cookie"]).toContain("HttpOnly");
    expect(r.headers["set-cookie"]).toContain("SameSite=Strict");
    expect(r.headers["cache-control"]).toBe("no-store");
    const u = (
      await db.query("SELECT password_hash FROM users WHERE id=$1", [t.id])
    ).rows[0];
    expect(u.password_hash).not.toContain(pwd);
    expect(
      (
        await db.query("SELECT 1 FROM sessions WHERE token_hash=$1", [
          r.cookies[0].value,
        ])
      ).rowCount,
    ).toBe(0);
  });
  it("does not allow signup to grant staff privileges", async () => {
    const r = await request("POST", "/auth/register", {
      email: "bad@example.test",
      password: pwd,
      display_name: "No admin",
      role: "both",
      staff_role: "admin",
    });
    expect(r.statusCode).toBe(400);
  });
  it("rejects incorrect credentials and missing authentication", async () => {
    expect(
      (
        await request("POST", "/auth/login", {
          email: t.email,
          password: "wrong",
        })
      ).statusCode,
    ).toBe(401);
    expect((await request("GET", "/properties")).statusCode).toBe(401);
  });
  it.each(["https://evil.example", "null", ""])(
    "rejects mutation Origin %s",
    async (origin) =>
      expect(
        (await request("POST", "/auth/logout", {}, t.cookie, { origin }))
          .statusCode,
      ).toBe(403),
  );
  it("rejects a missing Origin and non-JSON mutations", async () => {
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/auth/logout",
          payload: {},
          headers: { cookie: t.cookie },
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/auth/logout",
          payload: "x",
          headers: { origin, "content-type": "text/plain" },
        })
      ).statusCode,
    ).toBe(415);
  });
  it("revokes logout and expired sessions", async () => {
    await request("POST", "/auth/logout", {}, t.cookie);
    expect(
      (await request("GET", "/profile", undefined, t.cookie)).statusCode,
    ).toBe(401);
    await db.query(
      "UPDATE sessions SET expires_at=now()-interval '1 second' WHERE user_id=$1",
      [l.id],
    );
    expect(
      (await request("GET", "/properties", undefined, l.cookie)).statusCode,
    ).toBe(401);
  });
  it("keeps email verification distinct and required for publication/contact", async () => {
    const u = await signup("both", false);
    const p = {
      city: "Bologna",
      budget: 900,
      move_in: "2027-01-01",
      duration: 12,
      occupants: 1,
    };
    expect((await request("PUT", "/profile", p, u.cookie)).statusCode).toBe(
      200,
    );
    expect(
      (
        await request(
          "POST",
          "/profile/status",
          { status: "published" },
          u.cookie,
        )
      ).statusCode,
    ).toBe(403);
    const result = await request("GET", "/verification", undefined, u.cookie);
    expect(result.json()).toMatchObject({
      email_verified: false,
      provider_available: false,
      checks: [],
    });
  });
  it("atomically consumes purpose-bound reset tokens and revokes all sessions", async () => {
    await request("POST", "/auth/forgot", { email: t.email });
    const secret = mail.at(-1)!.token;
    expect(
      (await request("POST", "/auth/verify", { token: secret })).statusCode,
    ).toBe(400);
    const results = await Promise.all([
      request("POST", "/auth/reset", { token: secret, password: pwd + "new" }),
      request("POST", "/auth/reset", { token: secret, password: pwd + "new" }),
    ]);
    expect(results.map((x) => x.statusCode).sort()).toEqual([200, 400]);
    expect(
      (await request("GET", "/profile", undefined, t.cookie)).statusCode,
    ).toBe(401);
    expect(
      (await request("POST", "/auth/login", { email: t.email, password: pwd }))
        .statusCode,
    ).toBe(401);
    expect(
      (
        await request("POST", "/auth/login", {
          email: t.email,
          password: pwd + "new",
        })
      ).statusCode,
    ).toBe(200);
  });
  it("rejects expired verification tokens", async () => {
    await signup("tenant", false);
    const secret = mail.at(-1)!.token;
    await db.query(
      "UPDATE auth_tokens SET expires_at=now()-interval '1 second' WHERE token_hash=$1",
      [digest(secret)],
    );
    expect(
      (await request("POST", "/auth/verify", { token: secret })).statusCode,
    ).toBe(400);
  });
  it("returns the same recovery response for unknown addresses", async () => {
    const unknown = await request("POST", "/auth/forgot", {
        email: "missing@example.test",
      }),
      known = await request("POST", "/auth/forgot", { email: t.email });
    expect(unknown.json()).toEqual(known.json());
  });
});
describe("publication and discovery privacy", () => {
  it("enforces roles and property ownership", async () => {
    expect(
      (await request("GET", "/properties", undefined, t.cookie)).statusCode,
    ).toBe(403);
    expect(
      (
        await request(
          "PUT",
          `/properties/${property.id}`,
          cleanProperty(property),
          x.cookie,
        )
      ).statusCode,
    ).toBe(404);
    expect(
      (await request("GET", `/discover/${property.id}`, undefined, x.cookie))
        .statusCode,
    ).toBe(400);
  });
  it("returns only compatible approved fields and no email/name/verification", async () => {
    const r = await request(
      "GET",
      `/discover/${property.id}`,
      undefined,
      l.cookie,
    );
    expect(r.statusCode).toBe(200);
    const candidates = r.json().profiles;
    expect(candidates).toHaveLength(1);
    expect(candidates[0].id).toBe(t.id);
    expect(Object.keys(candidates[0]).sort()).toEqual(
      [
        "alias",
        "budget",
        "city",
        "compatibility",
        "contract_preference",
        "duration",
        "id",
        "move_in",
        "move_in_precision",
        "move_in_end",
        "occupants",
        "revision",
      ].sort(),
    );
    expect(r.body).not.toContain(t.email);
    expect(r.body).not.toContain(t.display_name);
  });
  it("keeps a new draft private, and removes paused/incompatible profiles", async () => {
    await createProfile(x, { budget: 700 });
    expect(
      (
        await request("GET", `/discover/${property.id}`, undefined, l.cookie)
      ).json().profiles,
    ).toHaveLength(1);
    await request("POST", "/profile/status", { status: "paused" }, t.cookie);
    expect(
      (
        await request("GET", `/discover/${property.id}`, undefined, l.cookie)
      ).json().profiles,
    ).toHaveLength(0);
  });
  it("rejects stale properties even if still labelled published", async () => {
    await db.query(
      "UPDATE properties SET published_at=now()-interval '31 days' WHERE id=$1",
      [property.id],
    );
    expect(
      (await request("GET", `/discover/${property.id}`, undefined, l.cookie))
        .statusCode,
    ).toBe(400);
    expect(
      (
        await request(
          "POST",
          "/invitations",
          {
            property_id: property.id,
            tenant_id: t.id,
            property_revision: property.revision,
            profile_revision: profile.revision,
          },
          l.cookie,
        )
      ).statusCode,
    ).toBe(409);
  });
  it("requires authority attestation and rejects unknown protected criteria", async () => {
    const res = await request(
      "POST",
      "/properties",
      { ...cleanProperty(property), authority_attested: false },
      l.cookie,
    );
    expect(
      (
        await request(
          "POST",
          `/properties/${res.json().id}/status`,
          { status: "published" },
          l.cookie,
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await request(
          "PUT",
          "/profile",
          {
            city: "Bologna",
            budget: 900,
            move_in: "2027-01-01",
            duration: 12,
            occupants: 1,
            nationality: "any",
          },
          t.cookie,
        )
      ).statusCode,
    ).toBe(400);
  });
});
describe("invitations, conversations and races", () => {
  it("completes the mutual loop and denies early/private chat access", async () => {
    const id = await send();
    expect(
      (await request("GET", `/conversations/${id}`, undefined, t.cookie))
        .statusCode,
    ).toBe(404);
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          { body: "Premature" },
          l.cookie,
        )
      ).statusCode,
    ).toBe(403);
    const before = (
      await request("GET", "/invitations", undefined, t.cookie)
    ).json().invitations[0];
    expect(before.other_name).toBeNull();
    expect((await accept(id)).statusCode).toBe(200);
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          { body: "Ciao, esempio sintetico." },
          t.cookie,
        )
      ).statusCode,
    ).toBe(201);
    expect(
      (await request("GET", `/conversations/${id}`, undefined, l.cookie)).json()
        .messages[0].body,
    ).toContain("Ciao");
    expect(
      (await request("GET", `/conversations/${id}`, undefined, x.cookie))
        .statusCode,
    ).toBe(404);
    expect(
      (await request("GET", "/invitations", undefined, x.cookie)).json()
        .invitations,
    ).toHaveLength(0);
  });
  it("prevents unrelated recipients accepting and duplicate invitations", async () => {
    const id = await send();
    expect((await accept(id, property, profile, x)).statusCode).toBe(404);
    expect((await accept(id, property, profile, l)).statusCode).toBe(403);
    const duplicate = await request(
      "POST",
      "/invitations",
      {
        property_id: property.id,
        tenant_id: t.id,
        property_revision: property.revision,
        profile_revision: profile.revision,
      },
      l.cookie,
    );
    expect(duplicate.statusCode).toBe(409);
  });
  it("requires the exact displayed revision and cancels on compatible edit", async () => {
    const id = await send();
    expect(
      (
        await request(
          "POST",
          `/invitations/${id}/action`,
          {
            action: "accept",
            property_revision: 0,
            profile_revision: profile.revision,
          },
          t.cookie,
        )
      ).statusCode,
    ).toBe(409);
    await request(
      "PUT",
      `/properties/${property.id}`,
      { ...cleanProperty(property), rent: 900 },
      l.cookie,
    );
    expect((await accept(id)).statusCode).toBe(409);
    expect(
      (await request("GET", "/invitations", undefined, t.cookie)).json()
        .invitations[0].status,
    ).toBe("cancelled");
  });
  it("cancels pending on tenant pause and does not revive on republish", async () => {
    const id = await send();
    await request("POST", "/profile/status", { status: "paused" }, t.cookie);
    await request("POST", "/profile/status", { status: "published" }, t.cookie);
    expect((await accept(id)).statusCode).toBe(409);
  });
  it("cancels pending on property pause while preserving accepted chat", async () => {
    const id = await accepted();
    await request(
      "POST",
      `/properties/${property.id}/status`,
      { status: "paused" },
      l.cookie,
    );
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          { body: "Conversazione già accettata" },
          t.cookie,
        )
      ).statusCode,
    ).toBe(201);
  });
  it.each(["decline", "withdraw"])("keeps %s terminal", async (action) => {
    const id = await send();
    expect(
      (
        await request(
          "POST",
          `/invitations/${id}/action`,
          { action },
          action === "decline" ? t.cookie : l.cookie,
        )
      ).statusCode,
    ).toBe(200);
    expect((await accept(id)).statusCode).toBe(409);
  });
  it("enforces expiry on reads and acceptance without maintenance", async () => {
    const id = await send();
    await db.query(
      "UPDATE invitations SET expires_at=now()-interval '1 second' WHERE id=$1",
      [id],
    );
    expect(
      (await request("GET", "/invitations", undefined, t.cookie)).json()
        .invitations[0].status,
    ).toBe("expired");
    expect((await accept(id)).statusCode).toBe(409);
  });
  it("serializes concurrent acceptance and withdrawal into exactly one terminal result", async () => {
    const id = await send();
    const res = await Promise.all([
      accept(id),
      request(
        "POST",
        `/invitations/${id}/action`,
        { action: "withdraw" },
        l.cookie,
      ),
    ]);
    expect(res.map((x) => x.statusCode).sort()).toEqual([200, 409]);
  });
  it("blocks both directions, hides discovery and cannot reopen on unblock", async () => {
    const id = await accepted();
    expect(
      (await request("POST", "/blocks", { invitation_id: id }, t.cookie))
        .statusCode,
    ).toBe(200);
    for (const u of [t, l])
      expect(
        (
          await request(
            "POST",
            `/conversations/${id}/messages`,
            { body: "Blocked" },
            u.cookie,
          )
        ).statusCode,
      ).toBe(403);
    await request("DELETE", `/blocks/${l.id}`, {}, t.cookie);
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          { body: "Still closed" },
          t.cookie,
        )
      ).statusCode,
    ).toBe(403);
  });
  it("blocks new invitations to another property once block commits", async () => {
    const id = await accepted();
    const p = await createProperty();
    await request("POST", "/blocks", { invitation_id: id }, t.cookie);
    expect(
      (
        await request(
          "POST",
          "/invitations",
          {
            property_id: p.id,
            tenant_id: t.id,
            property_revision: p.revision,
            profile_revision: profile.revision,
          },
          l.cookie,
        )
      ).statusCode,
    ).toBe(403);
    expect(
      (await request("GET", `/discover/${p.id}`, undefined, l.cookie)).json()
        .profiles,
    ).toHaveLength(0);
  });
  it("permits at most a pre-block concurrent message and no post-block messages", async () => {
    const id = await accepted();
    const results = await Promise.all([
      request("POST", "/blocks", { invitation_id: id }, t.cookie),
      request(
        "POST",
        `/conversations/${id}/messages`,
        { body: "Race" },
        l.cookie,
      ),
    ]);
    expect(results[0].statusCode).toBe(200);
    expect([201, 403]).toContain(results[1].statusCode);
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          { body: "After" },
          l.cookie,
        )
      ).statusCode,
    ).toBe(403);
    expect(
      (await db.query("SELECT status FROM invitations WHERE id=$1", [id]))
        .rows[0].status,
    ).toBe("closed");
  });
  it("bounds messages and stores markup as plain text", async () => {
    const id = await accepted();
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          { body: " ".repeat(5) },
          t.cookie,
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          { body: "a".repeat(2001) },
          t.cookie,
        )
      ).statusCode,
    ).toBe(400);
    const text = "<img src=x onerror=alert(1)>";
    await request(
      "POST",
      `/conversations/${id}/messages`,
      { body: text },
      t.cookie,
    );
    expect(
      (await request("GET", `/conversations/${id}`, undefined, l.cookie)).json()
        .messages[0].body,
    ).toBe(text);
  });
});
describe("moderation, verification and data control", () => {
  it("restricts reporting to participants and moderators to selected case context", async () => {
    const id = await accepted();
    await request(
      "POST",
      `/conversations/${id}/messages`,
      { body: "Selected message" },
      l.cookie,
    );
    await request(
      "POST",
      `/conversations/${id}/messages`,
      { body: "Other private message" },
      t.cookie,
    );
    const mid = (
      await request("GET", `/conversations/${id}`, undefined, t.cookie)
    ).json().messages[0].id;
    const body = {
      invitation_id: id,
      message_id: mid,
      reason: "other",
      details: "Synthetic report only",
    };
    expect((await request("POST", "/reports", body, x.cookie)).statusCode).toBe(
      404,
    );
    expect((await request("POST", "/reports", body, t.cookie)).statusCode).toBe(
      201,
    );
    expect(
      (await request("GET", "/staff/reports", undefined, t.cookie)).statusCode,
    ).toBe(403);
    const reports = await request(
      "GET",
      "/staff/reports",
      undefined,
      moderator.cookie,
    );
    expect(reports.body).toContain("Selected message");
    expect(reports.body).not.toContain("Other private message");
    expect(
      (
        await request(
          "GET",
          `/conversations/${id}`,
          undefined,
          moderator.cookie,
        )
      ).statusCode,
    ).toBe(404);
    expect(
      (await request("GET", "/staff/users", undefined, moderator.cookie))
        .statusCode,
    ).toBe(403);
    const report = reports.json().reports[0];
    expect(
      (
        await request(
          "POST",
          `/staff/reports/${report.id}/resolve`,
          { resolution: "reviewed" },
          moderator.cookie,
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (await db.query("SELECT count(*)::int count FROM audit_log")).rows[0]
        .count,
    ).toBe(1);
  });
  it("suspends immediately, revokes sessions, closes contact and audits restore", async () => {
    const id = await accepted();
    expect(
      (
        await request(
          "POST",
          `/staff/users/${t.id}/status`,
          { suspended: true, reason: "abuse" },
          moderator.cookie,
        )
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await request(
          "POST",
          `/staff/users/${t.id}/status`,
          { suspended: true, reason: "abuse" },
          admin.cookie,
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (await request("GET", "/profile", undefined, t.cookie)).statusCode,
    ).toBe(401);
    const restricted = await request("POST", "/auth/login", {
      email: t.email,
      password: pwd,
    });
    expect(restricted.statusCode).toBe(200);
    const restrictedCookie =
      restricted.cookies[0].name + "=" + restricted.cookies[0].value;
    expect(
      (await request("GET", "/profile", undefined, restrictedCookie))
        .statusCode,
    ).toBe(423);
    expect(
      (await request("GET", "/account/export", undefined, restrictedCookie))
        .statusCode,
    ).toBe(200);
    expect(
      (
        await request(
          "POST",
          "/account/appeal",
          { reason: "Please review synthetic case" },
          restrictedCookie,
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          { body: "No" },
          l.cookie,
        )
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await request(
          "POST",
          `/staff/users/${t.id}/status`,
          { suspended: false, reason: "appeal_accepted" },
          admin.cookie,
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (await request("POST", "/auth/login", { email: t.email, password: pwd }))
        .statusCode,
    ).toBe(200);
  });
  it("does not offer fake verification, derives expiry and accepts scoped disputes", async () => {
    expect(
      (await request("POST", "/verification", { kind: "identity" }, t.cookie))
        .statusCode,
    ).toBe(404);
    const v = (
      await db.query(
        "INSERT INTO verification_checks(user_id,kind,status,provider,provider_reference,checked_at,expires_at) VALUES($1,'identity','VERIFIED','SYNTHETIC TEST','fixture',now()-interval '2 days',now()-interval '1 day') RETURNING id",
        [t.id],
      )
    ).rows[0];
    expect(
      (await request("GET", "/verification", undefined, t.cookie)).json()
        .checks[0].status,
    ).toBe("EXPIRED");
    expect(
      (
        await request(
          "POST",
          `/verification/${v.id}/dispute`,
          { reason: "Synthetic dispute" },
          x.cookie,
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await request(
          "POST",
          `/verification/${v.id}/dispute`,
          { reason: "Synthetic dispute" },
          t.cookie,
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await request("GET", `/discover/${property.id}`, undefined, l.cookie)
      ).json().profiles,
    ).toHaveLength(1);
  });
  it("exports only own data without credentials or counterpart email/messages", async () => {
    const id = await accepted();
    await request(
      "POST",
      `/conversations/${id}/messages`,
      { body: "Their private message" },
      l.cookie,
    );
    await request(
      "POST",
      `/conversations/${id}/messages`,
      { body: "My own message" },
      t.cookie,
    );
    const r = await request("GET", "/account/export", undefined, t.cookie);
    expect(r.statusCode).toBe(200);
    expect(r.body).toContain("My own message");
    expect(r.body).not.toContain("Their private message");
    expect(r.body).not.toContain(l.email);
    for (const key of [
      "password_hash",
      "token_hash",
      "resolved_by",
      "staff_role",
    ])
      expect(r.body).not.toContain(key);
  });
  it("deletes account and dependent content while keeping anonymous audit integrity", async () => {
    const id = await accepted();
    await request(
      "POST",
      `/conversations/${id}/messages`,
      { body: "Delete me" },
      t.cookie,
    );
    await request(
      "POST",
      "/reports",
      { invitation_id: id, reason: "other", details: "Synthetic details" },
      t.cookie,
    );
    await db.query(
      "INSERT INTO audit_log(actor_id,subject_id,action,reason_code) VALUES($1,$2,'reviewed','reviewed')",
      [admin.id, t.id],
    );
    expect(
      (
        await request(
          "DELETE",
          "/account",
          { password: pwd, confirm: "ELIMINA" },
          t.cookie,
        )
      ).statusCode,
    ).toBe(200);
    for (const table of [
      "profiles",
      "sessions",
      "auth_tokens",
      "verification_checks",
    ])
      expect(
        (await db.query(`SELECT 1 FROM ${table} WHERE user_id=$1`, [t.id]))
          .rowCount,
      ).toBe(0);
    expect((await db.query("SELECT 1 FROM reports")).rowCount).toBe(0);
    expect((await db.query("SELECT 1 FROM messages")).rowCount).toBe(0);
    expect(
      (await db.query("SELECT subject_id FROM audit_log")).rows[0].subject_id,
    ).toBeNull();
    expect(
      (await request("GET", `/conversations/${id}`, undefined, l.cookie))
        .statusCode,
    ).toBe(404);
  });
  it("restricts aggregate statistics to admin and contains no raw messages or emails", async () => {
    expect(
      (await request("GET", "/staff/analytics", undefined, moderator.cookie))
        .statusCode,
    ).toBe(403);
    const stats = await request(
      "GET",
      "/staff/analytics",
      undefined,
      admin.cookie,
    );
    expect(stats.statusCode).toBe(200);
    expect(stats.json().scope).toBe("local_workflow_counts_not_market_kpis");
    expect(stats.body).not.toContain(t.email);
  });
  it("re-running migrations preserves data and does not add duplicate versions", async () => {
    const before = (await db.query("SELECT count(*)::int n FROM users")).rows[0]
      .n;
    const versionsBefore = (
      await db.query("SELECT count(*)::int n FROM schema_migrations")
    ).rows[0].n;
    await migrate(db);
    expect(
      (await db.query("SELECT count(*)::int n FROM users")).rows[0].n,
    ).toBe(before);
    expect(
      (await db.query("SELECT count(*)::int n FROM schema_migrations")).rows[0]
        .n,
    ).toBe(versionsBefore);
  });
});

describe("review regression cases", () => {
  it("preserves a counterparty report if the accused deletes their account", async () => {
    const id = await accepted();
    await request(
      "POST",
      `/conversations/${id}/messages`,
      { body: "Selected synthetic evidence" },
      l.cookie,
    );
    const mid = (
      await request("GET", `/conversations/${id}`, undefined, t.cookie)
    ).json().messages[0].id;
    await request(
      "POST",
      "/reports",
      {
        invitation_id: id,
        message_id: mid,
        reason: "other",
        details: "Keep minimal case context",
      },
      t.cookie,
    );
    await request(
      "DELETE",
      "/account",
      { password: pwd, confirm: "ELIMINA" },
      l.cookie,
    );
    const cases = (
      await request("GET", "/staff/reports", undefined, moderator.cookie)
    ).json().reports;
    expect(cases).toHaveLength(1);
    expect(cases[0]).toMatchObject({
      selected_message: "Selected synthetic evidence",
      reported_user_id: null,
      invitation_id: null,
      selected_sender_id: null,
    });
  });
  it.each(["accepted", "closed"])(
    "keeps original %s terms and compatibility reasons after an owner edit",
    async (status) => {
      const id = await accepted();
      if (status === "closed")
        expect(
          (
            await request(
              "POST",
              `/invitations/${id}/action`,
              { action: "close" },
              t.cookie,
            )
          ).statusCode,
        ).toBe(200);
      expect(
        (
          await request(
            "PUT",
            `/properties/${property.id}`,
            {
              ...cleanProperty(property),
              city: "Roma",
              rent: 1200,
              available_from: "2027-02-01",
              min_months: 18,
              capacity: 1,
            },
            l.cookie,
          )
        ).statusCode,
      ).toBe(200);
      const list = await request("GET", "/invitations", undefined, t.cookie);
      const detail = await request(
        "GET",
        `/invitations/${id}`,
        undefined,
        t.cookie,
      );
      expect(list.statusCode).toBe(200);
      expect(detail.statusCode).toBe(200);
      for (const offer of [
        list.json().invitations[0],
        detail.json().invitation,
      ]) {
        expect(offer.property).toMatchObject({
          city: "Bologna",
          rent: 850,
          available_from: "2026-12-01",
          min_months: 6,
          max_months: 36,
          capacity: 2,
        });
        expect(offer.property_changed).toBe(true);
        expect(offer.status).toBe(status);
        expect(offer.compatibility).toMatchObject({
          compatible: true,
          checks: [
            { key: "city", matches: true, detail: "Bologna · Bologna" },
            {
              key: "budget",
              matches: true,
              detail: "€850 · budget fino a €1100",
            },
            {
              key: "date",
              matches: true,
              detail: "Disponibile dal 2026-12-01 · ingresso 2027-01-01",
            },
            {
              key: "duration",
              matches: true,
              detail: "12 mesi · offerta 6–36",
            },
            { key: "occupants", matches: true, detail: "2 · capienza 2" },
          ],
        });
      }
    },
  );
  it("compares current tenant preferences against the accepted offer snapshot", async () => {
    const id = await accepted();
    expect(
      (
        await request(
          "PUT",
          "/profile",
          {
            city: profile.city,
            budget: 800,
            move_in: profile.move_in,
            duration: profile.duration,
            occupants: profile.occupants,
          },
          t.cookie,
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await request(
          "PUT",
          `/properties/${property.id}`,
          { ...cleanProperty(property), rent: 1200 },
          l.cookie,
        )
      ).statusCode,
    ).toBe(200);
    const detail = await request(
      "GET",
      `/invitations/${id}`,
      undefined,
      t.cookie,
    );
    expect(detail.statusCode).toBe(200);
    const offer = detail.json().invitation;
    expect(offer.status).toBe("accepted");
    expect(offer.property.rent).toBe(850);
    expect(offer.compatibility.compatible).toBe(false);
    expect(
      offer.compatibility.checks.find((c: any) => c.key === "budget"),
    ).toMatchObject({ matches: false, detail: "€850 · budget fino a €800" });
  });
  it("preserves pending offers when unchanged availability is reconfirmed", async () => {
    const id = await send();
    await request(
      "POST",
      `/properties/${property.id}/status`,
      { status: "published" },
      l.cookie,
    );
    expect((await accept(id)).statusCode).toBe(200);
  });
  it("shows an actionable unavailable state when property freshness expires", async () => {
    await send();
    await db.query(
      "UPDATE properties SET published_at=now()-interval '31 days' WHERE id=$1",
      [property.id],
    );
    expect(
      (await request("GET", "/invitations", undefined, t.cookie)).json()
        .invitations[0].status,
    ).toBe("unavailable");
  });
  it("does not overcount suspended publication or expired pending invitations", async () => {
    const id = await send();
    await db.query(
      "UPDATE invitations SET expires_at=now()-interval '1 day' WHERE id=$1",
      [id],
    );
    let s = (
      await request("GET", "/staff/analytics", undefined, admin.cookie)
    ).json();
    expect(s.invitations).toContainEqual({ status: "expired", count: 1 });
    await request(
      "POST",
      `/staff/users/${l.id}/status`,
      { suspended: true, reason: "security" },
      admin.cookie,
    );
    await request(
      "POST",
      `/staff/users/${t.id}/status`,
      { suspended: true, reason: "security" },
      admin.cookie,
    );
    s = (
      await request("GET", "/staff/analytics", undefined, admin.cookie)
    ).json();
    expect(s.properties).toBe(0);
    expect(s.profiles).toBe(0);
  });
  it("retains every message across history pages beyond the old 500 cap", async () => {
    const id = await accepted();
    await db.query(
      "INSERT INTO messages(invitation_id,sender_id,body,created_at) SELECT $1,$2,'Message '||g,now()+g*interval '1 millisecond' FROM generate_series(1,510) g",
      [id, t.id],
    );
    const first = (
      await request("GET", `/conversations/${id}`, undefined, l.cookie)
    ).json();
    expect(first.messages.at(-1).body).toBe("Message 510");
    expect(first.hasMore).toBe(true);
    let all = first.messages,
      cursor = first.before;
    while (cursor) {
      const page = (
        await request(
          "GET",
          `/conversations/${id}?before=${cursor}`,
          undefined,
          l.cookie,
        )
      ).json();
      all = all.concat(page.messages);
      cursor = page.before;
    }
    expect(all).toHaveLength(510);
    expect(new Set(all.map((m: any) => m.id)).size).toBe(510);
  });
  it("does not skip discovery after an earlier candidate pauses between pages", async () => {
    await db.query(
      "INSERT INTO users(email,password_hash,display_name,role,email_verified) SELECT 'candidate-'||g||'@example.test','unusable','Synthetic','tenant',true FROM generate_series(1,50) g",
    );
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status) SELECT id,'Bologna',1000,'2027-01-01',12,1,'published' FROM users WHERE email LIKE 'candidate-%'",
    );
    const first = (
      await request("GET", `/discover/${property.id}`, undefined, l.cookie)
    ).json();
    expect(first.profiles).toHaveLength(24);
    const expected = (
      await request(
        "GET",
        `/discover/${property.id}?after=${first.nextCursor}`,
        undefined,
        l.cookie,
      )
    ).json();
    await db.query("UPDATE profiles SET status='paused' WHERE user_id=$1", [
      first.profiles[0].id,
    ]);
    const actual = (
      await request(
        "GET",
        `/discover/${property.id}?after=${first.nextCursor}`,
        undefined,
        l.cookie,
      )
    ).json();
    expect(actual.profiles.map((p: any) => p.id)).toEqual(
      expected.profiles.map((p: any) => p.id),
    );
  });
  it("makes older users and unresolved reports accessible through pagination", async () => {
    const id = await accepted();
    await db.query(
      "INSERT INTO reports(reporter_id,invitation_id,reason,details) SELECT $1,$2,'other','Synthetic case '||g FROM generate_series(1,101) g",
      [t.id, id],
    );
    const first = (
        await request(
          "GET",
          "/staff/reports?page=0",
          undefined,
          moderator.cookie,
        )
      ).json().reports,
      second = (
        await request(
          "GET",
          "/staff/reports?page=1",
          undefined,
          moderator.cookie,
        )
      ).json().reports;
    expect(first).toHaveLength(100);
    expect(second).toHaveLength(1);
    expect(new Set([...first, ...second].map((r: any) => r.id)).size).toBe(101);
  });
  it("allows a suspended user to delete through credential-checked restricted login", async () => {
    await request(
      "POST",
      `/staff/users/${t.id}/status`,
      { suspended: true, reason: "security" },
      admin.cookie,
    );
    const login = await request("POST", "/auth/login", {
      email: t.email,
      password: pwd,
    });
    const c = login.cookies[0].name + "=" + login.cookies[0].value;
    expect(
      (
        await request(
          "DELETE",
          "/account",
          { password: pwd, confirm: "ELIMINA" },
          c,
        )
      ).statusCode,
    ).toBe(200);
  });
  it("rejects missing applied migration files and changed checksums", async () => {
    await db.query(
      "INSERT INTO schema_migrations(name,checksum) VALUES('missing.sql','none')",
    );
    await expect(migrate(db)).rejects.toThrow("missing");
    await expect(checkMigrations(db)).rejects.toThrow("migrations");
    await db.query("DELETE FROM schema_migrations WHERE name='missing.sql'");
    const saved = (
      await db.query("SELECT * FROM schema_migrations ORDER BY name LIMIT 1")
    ).rows[0];
    await db.query("UPDATE schema_migrations SET checksum=$1 WHERE name=$2", [
      "changed",
      saved.name,
    ]);
    await expect(migrate(db)).rejects.toThrow("checksum");
    await db.query("UPDATE schema_migrations SET checksum=$1 WHERE name=$2", [
      saved.checksum,
      saved.name,
    ]);
  });
  it("enforces non-null result expiry in the database", async () => {
    await expect(
      db.query(
        "INSERT INTO verification_checks(user_id,kind,status,provider,provider_reference,checked_at) VALUES($1,'identity','VERIFIED','SYNTHETIC','fixture',now())",
        [t.id],
      ),
    ).rejects.toThrow();
  });
  it("recovers a suspended account without restoring ordinary access and exports its appeal", async () => {
    await request(
      "POST",
      `/staff/users/${t.id}/status`,
      { suspended: true, reason: "security" },
      admin.cookie,
    );
    expect(
      (await request("POST", "/auth/forgot", { email: t.email })).statusCode,
    ).toBe(200);
    const reset = mail.at(-1)!;
    expect(reset.purpose).toBe("reset");
    expect(
      (
        await request("POST", "/auth/reset", {
          token: reset.token,
          password: pwd + "new",
        })
      ).statusCode,
    ).toBe(200);
    const login = await request("POST", "/auth/login", {
      email: t.email,
      password: pwd + "new",
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies[0].name + "=" + login.cookies[0].value;
    expect(
      (await request("GET", "/profile", undefined, cookie)).statusCode,
    ).toBe(423);
    expect(
      (
        await request(
          "POST",
          "/account/appeal",
          { reason: "Review after password recovery" },
          cookie,
        )
      ).statusCode,
    ).toBe(200);
    const exported = (
      await request("GET", "/account/export", undefined, cookie)
    ).json();
    expect(exported.appeals).toEqual([
      expect.objectContaining({
        reason: "Review after password recovery",
        status: "open",
        resolved_at: null,
      }),
    ]);
    expect(exported.appeals[0].created_at).toBeTruthy();
    expect(
      (await request("GET", "/account/export", undefined, x.cookie)).json()
        .appeals,
    ).toEqual([]);
    expect(
      (await db.query("SELECT suspended FROM users WHERE id=$1", [t.id]))
        .rows[0].suspended,
    ).toBe(true);
  });
  it("counts all personal invitations beyond one page and distinguishes expired or stale offers", async () => {
    await db.query(
      "INSERT INTO users(email,password_hash,display_name,role,email_verified) SELECT 'count-'||g||'@example.test','unusable','Synthetic','tenant',true FROM generate_series(1,101) g",
    );
    await db.query(
      "INSERT INTO invitations(property_id,tenant_id,landlord_id,property_revision,profile_revision,property_snapshot) SELECT $1,id,$2,$3,1,$4 FROM users WHERE email LIKE 'count-%'",
      [property.id, l.id, property.revision, JSON.stringify(property)],
    );
    expect(
      (await request("GET", "/dashboard", undefined, l.cookie)).json(),
    ).toEqual({ pending: 101, accepted: 0 });
    expect(
      (await request("GET", "/dashboard", undefined, x.cookie)).json(),
    ).toEqual({ pending: 0, accepted: 0 });
    await db.query("UPDATE invitations SET status='accepted'");
    expect(
      (await request("GET", "/dashboard", undefined, l.cookie)).json(),
    ).toEqual({ pending: 0, accepted: 101 });
    const old = (
      await request("GET", "/invitations?page=1", undefined, l.cookie)
    ).json().invitations[0];
    expect(
      (
        await request("GET", `/invitations/${old.id}`, undefined, l.cookie)
      ).json().invitation.id,
    ).toBe(old.id);
    expect(
      (await request("GET", `/invitations/${old.id}`, undefined, x.cookie))
        .statusCode,
    ).toBe(404);
    await db.query(
      "UPDATE invitations SET status='pending',expires_at=now()-interval '1 day'",
    );
    expect(
      (await request("GET", "/dashboard", undefined, l.cookie)).json().pending,
    ).toBe(0);
    await db.query("UPDATE invitations SET expires_at=now()+interval '1 day'");
    await db.query(
      "UPDATE properties SET published_at=now()-interval '31 days' WHERE id=$1",
      [property.id],
    );
    expect(
      (await request("GET", "/dashboard", undefined, l.cookie)).json().pending,
    ).toBe(0);
  });
});

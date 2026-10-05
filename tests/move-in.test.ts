import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { buildApp } from "../server/app";
import { makePool } from "../server/db";
import { migrate } from "../scripts/migrate";
import { digest, hashPassword, token } from "../server/auth";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search !== "" ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error("Move-in tests require isolated local soglia_test.");

const db = makePool(url);
const origin = "http://127.0.0.1:3000";
const app = await buildApp(db, {
  origin,
  limits: false,
  serveStatic: false,
  mail: async () => {},
});
type Person = {
  id: string;
  cookie: string;
  email: string;
  displayName: string;
};
type Timing = {
  move_in: string;
  move_in_precision?: "day" | "month" | "range";
  move_in_end?: string;
};
const preferences = {
  city: "Bologna",
  budget: 1100,
  duration: 12,
  occupants: 2,
};
let passwordHash: string;
let tenant: Person, landlord: Person, outsider: Person;

function request(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: Record<string, unknown>,
  person?: Person,
) {
  return app.inject({
    method,
    url: "/api" + path,
    headers: {
      origin,
      "content-type": "application/json",
      ...(person ? { cookie: person.cookie } : {}),
    },
    payload: body,
  });
}
async function person(role: "tenant" | "landlord", displayName: string) {
  const id = randomUUID(),
    email = `${id}@example.test`,
    secret = token();
  await db.query(
    "INSERT INTO users(id,email,password_hash,display_name,role,email_verified) VALUES($1,$2,$3,$4,$5,true)",
    [id, email, passwordHash, displayName, role],
  );
  await db.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 day')",
    [digest(secret), id],
  );
  return { id, email, displayName, cookie: `soglia=${secret}` };
}
async function ownProfile() {
  const response = await request("GET", "/profile", undefined, tenant);
  expect(response.statusCode).toBe(200);
  return response.json().profile;
}
async function saveProfile(timing: Timing, publish = false) {
  const saved = await request(
    "PUT",
    "/profile",
    { ...preferences, ...timing },
    tenant,
  );
  expect(saved.statusCode).toBe(200);
  if (publish)
    expect(
      (
        await request(
          "POST",
          "/profile/status",
          { status: "published" },
          tenant,
        )
      ).statusCode,
    ).toBe(200);
  return ownProfile();
}
async function property(availableFrom: string) {
  return (
    await db.query(
      `INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at)
       VALUES($1,'Casa sintetica per gli ingressi','Bologna','Saragozza','Immobile sintetico per verificare gli ingressi flessibili.',850,$2,6,36,2,65,3,true,true,'published',now()) RETURNING *`,
      [landlord.id, availableFrom],
    )
  ).rows[0];
}
function propertyInput(p: any) {
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
}
async function discover(p: any, owner = landlord) {
  return request("GET", `/discover/${p.id}`, undefined, owner);
}
async function invite(p: any, profile: any) {
  return request(
    "POST",
    "/invitations",
    {
      property_id: p.id,
      tenant_id: tenant.id,
      property_revision: p.revision,
      profile_revision: profile.revision,
    },
    landlord,
  );
}
function accept(id: string, p: any, profile: any) {
  return request(
    "POST",
    `/invitations/${id}/action`,
    {
      action: "accept",
      property_revision: p.revision,
      profile_revision: profile.revision,
    },
    tenant,
  );
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
    throw new Error("Unsafe effective move-in test connection.");
  await migrate(db);
  passwordHash = await hashPassword("Synthetic-move-in-only-passphrase");
  await app.ready();
});
afterAll(async () => {
  await app.close();
  await db.end();
});
beforeEach(async () => {
  await db.query("TRUNCATE users,events,audit_log RESTART IDENTITY CASCADE");
  tenant = await person("tenant", "Inquilino sintetico privato");
  landlord = await person("landlord", "Proprietario sintetico privato");
  outsider = await person("landlord", "Estraneo sintetico privato");
});

describe("month and period move-in preferences", () => {
  it("persists a whole month and a period, including leap-year month ends", async () => {
    const month = await saveProfile({
      move_in: "2028-02-01",
      move_in_precision: "month",
    });
    expect(month).toMatchObject({
      ...preferences,
      move_in: "2028-02-01",
      move_in_precision: "month",
      move_in_end: "2028-02-29",
      status: "draft",
    });
    const range = await saveProfile({
      move_in: "2028-11-01",
      move_in_precision: "range",
      move_in_end: "2029-01-31",
    });
    expect(range).toMatchObject({
      move_in: "2028-11-01",
      move_in_precision: "range",
      move_in_end: "2029-01-31",
      revision: month.revision + 1,
    });
    expect(
      (
        await db.query(
          "SELECT move_in,move_in_precision,move_in_end FROM profiles WHERE user_id=$1",
          [tenant.id],
        )
      ).rows[0],
    ).toEqual({
      move_in: "2028-11-01",
      move_in_precision: "range",
      move_in_end: "2029-01-31",
    });
  });

  it("keeps existing exact dates exact and accepts legacy API payloads", async () => {
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'published',now())",
      [tenant.id],
    );
    const legacy = await ownProfile();
    expect(legacy).toMatchObject({
      move_in: "2028-01-15",
      move_in_precision: "day",
      move_in_end: null,
    });
    const before = await property("2028-01-15");
    const after = await property("2028-01-16");
    expect((await discover(before)).json().profiles).toHaveLength(1);
    expect((await discover(after)).json().profiles).toHaveLength(0);
    expect((await invite(after, legacy)).statusCode).toBe(409);
    const reloaded = await saveProfile({ move_in: "2028-01-20" });
    expect(reloaded).toMatchObject({
      move_in: "2028-01-20",
      move_in_precision: "day",
    });
    const later = await property("2028-01-21");
    expect((await discover(later)).json().profiles).toHaveLength(0);
    expect((await invite(later, reloaded)).statusCode).toBe(409);
  });

  it("rejects invalid periods without changing saved preferences or cancelling an invitation", async () => {
    const profile = await saveProfile(
      { move_in: "2028-02-01", move_in_precision: "month" },
      true,
    );
    const p = await property("2028-02-15");
    const sent = await invite(p, profile);
    expect(sent.statusCode).toBe(201);
    const id = sent.json().id;
    const before = (
      await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id])
    ).rows[0];
    const invalid = [
      { move_in: "2028-02-15", move_in_precision: "month" },
      {
        move_in: "2028-02-01",
        move_in_precision: "month",
        move_in_end: "2028-03-31",
      },
      { move_in: "2028-02-01", move_in_precision: "range" },
      {
        move_in: "2028-02-15",
        move_in_precision: "range",
        move_in_end: "2028-03-31",
      },
      {
        move_in: "2028-02-01",
        move_in_precision: "range",
        move_in_end: "2028-03-15",
      },
      {
        move_in: "2028-03-01",
        move_in_precision: "range",
        move_in_end: "2028-02-29",
      },
      {
        move_in: "2028-02-01",
        move_in_precision: "range",
        move_in_end: "2028-02-30",
      },
      {
        move_in: "2028-02-01",
        move_in_precision: "day",
        move_in_end: "2028-02-29",
      },
      { move_in: "2028-02-30", move_in_precision: "day" },
      { move_in: "2028-02-01", move_in_precision: "flexible" },
    ];
    for (const timing of invalid) {
      const response = await request(
        "PUT",
        "/profile",
        { ...preferences, ...timing },
        tenant,
      );
      expect(response.statusCode, JSON.stringify(timing)).toBe(400);
      expect(
        (await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id]))
          .rows[0],
      ).toEqual(before);
      expect(
        (await db.query("SELECT id,status FROM invitations")).rows,
      ).toEqual([{ id, status: "pending" }]);
    }
    expect((await accept(id, p, profile)).statusCode).toBe(200);
  });

  it.each([
    {
      label: "month",
      timing: {
        move_in: "2028-01-01",
        move_in_precision: "month" as const,
      },
      end: "2028-01-31",
      middle: "2028-01-15",
      after: "2028-02-01",
    },
    {
      label: "period",
      timing: {
        move_in: "2028-01-01",
        move_in_precision: "range" as const,
        move_in_end: "2028-02-29",
      },
      end: "2028-02-29",
      middle: "2028-02-15",
      after: "2028-03-01",
    },
  ])(
    "uses the $label end in discovery and invitation eligibility while keeping identity private",
    async ({ timing, end, middle, after }) => {
      const profile = await saveProfile(timing, true);
      for (const availableFrom of ["2027-12-01", middle, end]) {
        const p = await property(availableFrom);
        const response = await discover(p);
        expect(response.statusCode).toBe(200);
        expect(response.json().profiles).toHaveLength(1);
        const [candidate] = response.json().profiles;
        expect(candidate).toMatchObject({
          id: tenant.id,
          move_in: timing.move_in,
          move_in_precision: timing.move_in_precision,
          move_in_end: end,
          compatibility: { compatible: true },
        });
        expect(
          candidate.compatibility.checks.find(
            (check: any) => check.key === "date",
          ),
        ).toMatchObject({ matches: true });
        const allowed = new Set([
          "id",
          "alias",
          "city",
          "budget",
          "move_in",
          "move_in_precision",
          "move_in_end",
          "duration",
          "contract_preference",
          "pets",
          "furnishing_preference",
          "housing_needs",
          "occupants",
          "revision",
          "compatibility",
        ]);
        expect(Object.keys(candidate).every((key) => allowed.has(key))).toBe(
          true,
        );
        expect(response.body).not.toContain(tenant.email);
        expect(response.body).not.toContain(tenant.displayName);
        expect((await discover(p, outsider)).statusCode).toBe(400);
        expect((await invite(p, profile)).statusCode).toBe(201);
      }
      const tooLate = await property(after);
      expect((await discover(tooLate)).json().profiles).toHaveLength(0);
      expect((await invite(tooLate, profile)).statusCode).toBe(409);
      expect(
        (
          await db.query(
            "SELECT count(*)::int AS count FROM invitations WHERE property_id=$1",
            [tooLate.id],
          )
        ).rows[0].count,
      ).toBe(0);
    },
  );

  it("accepts a mid-month offer using the displayed revisions and preserves its snapshot", async () => {
    const profile = await saveProfile(
      { move_in: "2028-01-01", move_in_precision: "month" },
      true,
    );
    const p = await property("2028-01-15");
    const sent = await invite(p, profile);
    expect(sent.statusCode).toBe(201);
    const id = sent.json().id;
    expect(
      (await accept(id, p, { ...profile, revision: profile.revision - 1 }))
        .statusCode,
    ).toBe(409);
    expect((await accept(id, p, profile)).statusCode).toBe(200);
    expect(
      (
        await request(
          "PUT",
          `/properties/${p.id}`,
          {
            ...propertyInput(p),
            available_from: "2028-02-01",
          },
          landlord,
        )
      ).statusCode,
    ).toBe(200);
    const detail = await request(
      "GET",
      `/invitations/${id}`,
      undefined,
      tenant,
    );
    expect(detail.statusCode).toBe(200);
    expect(detail.json().invitation).toMatchObject({
      status: "accepted",
      property_changed: true,
      property: { available_from: "2028-01-15" },
      compatibility: { compatible: true },
    });
    await saveProfile({ move_in: "2028-01-01" });
    const changed = await request(
      "GET",
      `/invitations/${id}`,
      undefined,
      tenant,
    );
    expect(changed.json().invitation).toMatchObject({
      status: "accepted",
      property: { available_from: "2028-01-15" },
      compatibility: { compatible: false },
    });
    expect(
      (
        await request(
          "POST",
          `/conversations/${id}/messages`,
          {
            body: "Messaggio sintetico dopo il cambio di preferenze.",
          },
          tenant,
        )
      ).statusCode,
    ).toBe(201);
  });

  it("cancels pending offers when the period changes and refuses stale revisions", async () => {
    const profile = await saveProfile(
      { move_in: "2028-01-01", move_in_precision: "month" },
      true,
    );
    const p = await property("2028-01-15");
    const sent = await invite(p, profile);
    expect(sent.statusCode).toBe(201);
    const id = sent.json().id;
    const changed = await saveProfile({
      move_in: "2028-01-01",
      move_in_precision: "range",
      move_in_end: "2028-02-29",
    });
    expect(changed.revision).toBe(profile.revision + 1);
    expect(
      (await db.query("SELECT status FROM invitations WHERE id=$1", [id]))
        .rows[0].status,
    ).toBe("cancelled");
    expect((await accept(id, p, changed)).statusCode).toBe(409);
    const freshProperty = await property("2028-02-15");
    expect((await invite(freshProperty, profile)).statusCode).toBe(409);
    expect((await invite(freshProperty, changed)).statusCode).toBe(201);
  });
});

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
  throw new Error("Contract tests require isolated local soglia_test.");

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
const types = [
  "four_plus_four",
  "three_plus_two",
  "student",
  "transitory",
] as const;
type Contract = (typeof types)[number];
const preferences = {
  city: "Bologna",
  budget: 1100,
  move_in: "2028-01-15",
  duration: 12,
  occupants: 2,
};
const offer = {
  title: "Casa sintetica per i contratti",
  city: "Bologna",
  area: "Saragozza",
  description: "Immobile sintetico per verificare le preferenze sul contratto.",
  rent: 850,
  available_from: "2028-01-01",
  min_months: 6,
  max_months: 36,
  capacity: 2,
  sqm: 65,
  rooms: 3,
  furnished: true,
  authority_attested: true,
};
let passwordHash: string;
let tenant: Person, landlord: Person, outsider: Person;

function request(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: Record<string, unknown>,
  actor?: Person,
) {
  return app.inject({
    method,
    url: "/api" + path,
    headers: {
      origin,
      "content-type": "application/json",
      ...(actor ? { cookie: actor.cookie } : {}),
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
async function saveProfile(contract?: Contract | "any", publish = true) {
  const response = await request(
    "PUT",
    "/profile",
    {
      ...preferences,
      ...(contract === undefined ? {} : { contract_preference: contract }),
    },
    tenant,
  );
  expect(response.statusCode).toBe(200);
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
async function ownProperty(id: string) {
  const response = await request("GET", "/properties", undefined, landlord);
  expect(response.statusCode).toBe(200);
  return response.json().properties.find((p: any) => p.id === id);
}
async function property(
  contract?: Contract | "unspecified",
  patch: Record<string, unknown> = {},
) {
  const response = await request(
    "POST",
    "/properties",
    {
      ...offer,
      ...(contract === undefined ? {} : { contract_type: contract }),
      ...patch,
    },
    landlord,
  );
  expect(response.statusCode).toBe(201);
  const id = response.json().id;
  expect(
    (
      await request(
        "POST",
        `/properties/${id}/status`,
        { status: "published" },
        landlord,
      )
    ).statusCode,
  ).toBe(200);
  return ownProperty(id);
}
function discover(p: any, owner = landlord) {
  return request("GET", `/discover/${p.id}`, undefined, owner);
}
function invite(p: any, profile: any) {
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
    throw new Error("Unsafe effective contract test connection.");
  await migrate(db);
  passwordHash = await hashPassword("Synthetic-contract-only-passphrase");
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

describe("rental contract preferences", () => {
  it.each(types)(
    "persists %s with the appropriate duration while preserving property stay limits",
    async (contract) => {
      const profile = await saveProfile(contract, false);
      const p = await property(contract);
      const duration = ["four_plus_four", "three_plus_two"].includes(contract)
        ? null
        : 12;
      expect(profile).toMatchObject({
        ...preferences,
        duration,
        contract_preference: contract,
        status: "draft",
      });
      expect(p).toMatchObject({
        contract_type: contract,
        min_months: 6,
        max_months: 36,
      });
      expect(
        (
          await db.query(
            "SELECT duration,contract_preference FROM profiles WHERE user_id=$1",
            [tenant.id],
          )
        ).rows[0],
      ).toEqual({ duration, contract_preference: contract });
      expect(
        (
          await db.query(
            "SELECT min_months,max_months,contract_type FROM properties WHERE id=$1",
            [p.id],
          )
        ).rows[0],
      ).toEqual({ min_months: 6, max_months: 36, contract_type: contract });
      const next = types[(types.indexOf(contract) + 1) % types.length];
      expect(
        (
          await request(
            "PUT",
            `/properties/${p.id}`,
            { ...offer, contract_type: next },
            landlord,
          )
        ).statusCode,
      ).toBe(200);
      expect(await ownProperty(p.id)).toMatchObject({
        contract_type: next,
        min_months: 6,
        max_months: 36,
        revision: p.revision + 1,
      });
    },
  );

  it("keeps legacy profiles flexible and unknown offers unspecified", async () => {
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'published',now())",
      [tenant.id],
    );
    const id = (
      await db.query(
        "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) VALUES($1,'Casa precedente sintetica','Bologna','Saragozza','Immobile sintetico senza un tipo di contratto.',850,'2028-01-01',6,36,2,65,3,true,true,'published',now()) RETURNING id",
        [landlord.id],
      )
    ).rows[0].id;
    const legacy = await ownProfile();
    const p = await ownProperty(id);
    expect(legacy).toMatchObject({ duration: 12, contract_preference: "any" });
    expect(p).toMatchObject({
      contract_type: "unspecified",
      min_months: 6,
      max_months: 36,
    });
    expect((await discover(p)).json().profiles).toHaveLength(1);
    const sent = await invite(p, legacy);
    expect(sent.statusCode).toBe(201);
    expect((await accept(sent.json().id, p, legacy)).statusCode).toBe(200);
    expect(await saveProfile(undefined, false)).toMatchObject({
      contract_preference: "any",
      duration: 12,
    });
    expect(await property()).toMatchObject({ contract_type: "unspecified" });
  });

  it("rejects invalid contract values without mutating saved data or cancelling pending offers", async () => {
    const profile = await saveProfile("student");
    const p = await property("student");
    const sent = await invite(p, profile);
    expect(sent.statusCode).toBe(201);
    const id = sent.json().id;
    const beforeProfile = (
      await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id])
    ).rows[0];
    const beforeProperty = (
      await db.query("SELECT * FROM properties WHERE id=$1", [p.id])
    ).rows[0];
    for (const invalid of ["unknown", "", null, 12]) {
      expect(
        (
          await request(
            "PUT",
            "/profile",
            { ...preferences, contract_preference: invalid },
            tenant,
          )
        ).statusCode,
      ).toBe(400);
      expect(
        (
          await request(
            "PUT",
            `/properties/${p.id}`,
            { ...offer, contract_type: invalid },
            landlord,
          )
        ).statusCode,
      ).toBe(400);
      expect(
        (
          await request(
            "POST",
            "/properties",
            { ...offer, contract_type: invalid },
            landlord,
          )
        ).statusCode,
      ).toBe(400);
      expect(
        (await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id]))
          .rows[0],
      ).toEqual(beforeProfile);
      expect(
        (await db.query("SELECT * FROM properties WHERE id=$1", [p.id]))
          .rows[0],
      ).toEqual(beforeProperty);
      expect(
        (await db.query("SELECT id,status FROM invitations")).rows,
      ).toEqual([{ id, status: "pending" }]);
      expect(
        (await db.query("SELECT count(*)::int AS count FROM properties"))
          .rows[0].count,
      ).toBe(1);
    }
    expect((await accept(id, p, profile)).statusCode).toBe(200);
  });

  it.each(types)(
    "applies the %s preference consistently to discovery, invitation and acceptance",
    async (contract) => {
      const profile = await saveProfile(contract);
      const same = await property(contract);
      const different = await property(
        types[(types.indexOf(contract) + 1) % types.length],
      );
      const unknown = await property("unspecified");
      const response = await discover(same);
      expect(response.statusCode).toBe(200);
      expect(response.json().property).toMatchObject({
        contract_type: contract,
      });
      expect(response.json().profiles).toHaveLength(1);
      const [candidate] = response.json().profiles;
      expect(candidate).toMatchObject({
        id: tenant.id,
        contract_preference: contract,
        duration: ["four_plus_four", "three_plus_two"].includes(contract)
          ? null
          : 12,
        compatibility: { compatible: true },
      });
      expect(
        candidate.compatibility.checks.find(
          (check: any) => check.key === "contract",
        ),
      ).toMatchObject({ matches: true });
      expect(Object.keys(candidate).sort()).toEqual(
        [
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
        ].sort(),
      );
      expect(response.body).not.toContain(tenant.email);
      expect(response.body).not.toContain(tenant.displayName);
      expect(response.body).not.toContain(landlord.email);
      expect(response.json().property).not.toHaveProperty("owner_id");
      expect((await discover(same, outsider)).statusCode).toBe(400);
      for (const rejected of [different, unknown]) {
        expect((await discover(rejected)).json().profiles).toHaveLength(0);
        expect((await invite(rejected, profile)).statusCode).toBe(409);
        expect(
          (
            await db.query(
              "SELECT count(*)::int AS count FROM invitations WHERE property_id=$1",
              [rejected.id],
            )
          ).rows[0].count,
        ).toBe(0);
      }
      const sent = await invite(same, profile);
      expect(sent.statusCode).toBe(201);
      expect((await accept(sent.json().id, same, profile)).statusCode).toBe(
        200,
      );
    },
  );

  it.each(["four_plus_four", "three_plus_two"] as const)(
    "accepts omitted, null and legacy numeric duration for %s without filtering by an old month count",
    async (contract) => {
      const { duration: _duration, ...withoutDuration } = preferences;
      for (const durationInput of [{}, { duration: null }, { duration: 12 }]) {
        expect(
          (
            await request(
              "PUT",
              "/profile",
              {
                ...withoutDuration,
                ...durationInput,
                contract_preference: contract,
              },
              tenant,
            )
          ).statusCode,
        ).toBe(200);
        expect(await ownProfile()).toMatchObject({
          contract_preference: contract,
          duration: null,
        });
      }
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
      const profile = await ownProfile();
      const p = await property(contract, { min_months: 24, max_months: 60 });
      const discovery = await discover(p);
      expect(discovery.statusCode).toBe(200);
      expect(discovery.json().profiles).toHaveLength(1);
      expect(discovery.json().profiles[0].duration).toBeNull();
      expect(
        discovery
          .json()
          .profiles[0].compatibility.checks.some(
            (check: any) => check.key === "duration",
          ),
      ).toBe(false);
      const sent = await invite(p, profile);
      expect(sent.statusCode).toBe(201);
      expect((await accept(sent.json().id, p, profile)).statusCode).toBe(200);
    },
  );

  it.each(["four_plus_four", "three_plus_two"] as const)(
    "preserves a legacy numeric %s preference on reads and skips its month filter",
    async (contract) => {
      await db.query(
        "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,contract_preference,status,published_at) VALUES($1,'Bologna',1100,'2028-01-15',12,2,$2,'published',now())",
        [tenant.id, contract],
      );
      const profile = await ownProfile();
      expect(profile.duration).toBe(12);
      const p = await property(contract, { min_months: 24, max_months: 60 });
      const response = await discover(p);
      expect(response.json().profiles).toHaveLength(1);
      expect(
        response
          .json()
          .profiles[0].compatibility.checks.some(
            (check: any) => check.key === "duration",
          ),
      ).toBe(false);
      const sent = await invite(p, profile);
      expect(sent.statusCode).toBe(201);
      expect((await accept(sent.json().id, p, profile)).statusCode).toBe(200);
      expect((await ownProfile()).duration).toBe(12);
    },
  );

  it.each(["any", "student", "transitory"] as const)(
    "still requires a numeric stay duration for %s and applies its month limits",
    async (contract) => {
      const profile = await saveProfile(contract);
      const p = await property(contract === "any" ? "unspecified" : contract);
      const sent = await invite(p, profile);
      expect(sent.statusCode).toBe(201);
      const { duration: _duration, ...withoutDuration } = preferences;
      const before = (
        await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id])
      ).rows[0];
      for (const durationInput of [{}, { duration: null }]) {
        expect(
          (
            await request(
              "PUT",
              "/profile",
              {
                ...withoutDuration,
                ...durationInput,
                contract_preference: contract,
              },
              tenant,
            )
          ).statusCode,
        ).toBe(400);
        expect(
          (
            await db.query("SELECT * FROM profiles WHERE user_id=$1", [
              tenant.id,
            ])
          ).rows[0],
        ).toEqual(before);
        expect(
          (
            await db.query("SELECT status FROM invitations WHERE id=$1", [
              sent.json().id,
            ])
          ).rows[0].status,
        ).toBe("pending");
      }
      const tooLong = await property(
        contract === "any" ? "unspecified" : contract,
        { min_months: 18, max_months: 36 },
      );
      expect((await discover(tooLong)).json().profiles).toHaveLength(0);
      expect((await invite(tooLong, profile)).statusCode).toBe(409);
      expect((await accept(sent.json().id, p, profile)).statusCode).toBe(200);
    },
  );

  it("keeps calendar, budget, city and capacity checks for a long contract without a stay duration", async () => {
    await saveProfile("four_plus_four");
    expect(
      (
        await request(
          "PUT",
          "/profile",
          {
            ...preferences,
            duration: null,
            contract_preference: "four_plus_four",
            move_in: "2028-01-01",
            move_in_precision: "range",
            move_in_end: "2028-02-29",
          },
          tenant,
        )
      ).statusCode,
    ).toBe(200);
    const profile = await ownProfile();
    const accepted = await property("four_plus_four", {
      min_months: 24,
      max_months: 60,
      available_from: "2028-02-29",
    });
    expect((await discover(accepted)).json().profiles).toHaveLength(1);
    for (const patch of [
      { available_from: "2028-03-01" },
      { rent: 1200 },
      { city: "Roma" },
      { capacity: 1 },
    ]) {
      const rejected = await property("four_plus_four", {
        min_months: 24,
        max_months: 60,
        ...patch,
      });
      expect((await discover(rejected)).json().profiles).toHaveLength(0);
      expect((await invite(rejected, profile)).statusCode).toBe(409);
    }
    const sent = await invite(accepted, profile);
    expect(sent.statusCode).toBe(201);
    expect((await accept(sent.json().id, accepted, profile)).statusCode).toBe(
      200,
    );
  });

  it("lets a flexible profile meet every offered contract including one to be agreed", async () => {
    const profile = await saveProfile("any");
    for (const contract of [...types, "unspecified" as const]) {
      const p = await property(contract);
      expect((await discover(p)).json().profiles).toHaveLength(1);
      const sent = await invite(p, profile);
      expect(sent.statusCode).toBe(201);
      expect((await accept(sent.json().id, p, profile)).statusCode).toBe(200);
    }
  });

  it.each(["three_plus_two", "unspecified"] as const)(
    "rechecks %s contract eligibility at acceptance",
    async (changedType) => {
      const profile = await saveProfile("student");
      const p = await property("student");
      const sent = await invite(p, profile);
      expect(sent.statusCode).toBe(201);
      // Simulate drift outside the edit endpoint: acceptance must independently
      // recheck eligibility even if an administrative write kept the revision.
      await db.query("UPDATE properties SET contract_type=$1 WHERE id=$2", [
        changedType,
        p.id,
      ]);
      expect((await accept(sent.json().id, p, profile)).statusCode).toBe(409);
      expect(
        (
          await db.query("SELECT status FROM invitations WHERE id=$1", [
            sent.json().id,
          ])
        ).rows[0].status,
      ).toBe("pending");
    },
  );

  it("cancels pending offers after either side changes its contract choice and refuses stale revisions", async () => {
    const profile = await saveProfile("student");
    const p = await property("student");
    const first = await invite(p, profile);
    expect(first.statusCode).toBe(201);
    const changed = await saveProfile("three_plus_two", false);
    expect(changed.revision).toBe(profile.revision + 1);
    expect(
      (
        await db.query("SELECT status FROM invitations WHERE id=$1", [
          first.json().id,
        ])
      ).rows[0].status,
    ).toBe("cancelled");
    expect((await accept(first.json().id, p, changed)).statusCode).toBe(409);
    const newProperty = await property("three_plus_two");
    expect((await invite(newProperty, profile)).statusCode).toBe(409);
    const second = await invite(newProperty, changed);
    expect(second.statusCode).toBe(201);
    expect(
      (
        await request(
          "PUT",
          `/properties/${newProperty.id}`,
          { ...offer, contract_type: "four_plus_four" },
          landlord,
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await db.query("SELECT status FROM invitations WHERE id=$1", [
          second.json().id,
        ])
      ).rows[0].status,
    ).toBe("cancelled");
    expect(
      (await accept(second.json().id, newProperty, changed)).statusCode,
    ).toBe(409);
  });

  it.each(["accepted", "closed"] as const)(
    "retains the original %s contract and reasons after an owner edit",
    async (status) => {
      const profile = await saveProfile("student");
      const p = await property("student");
      const sent = await invite(p, profile);
      expect(sent.statusCode).toBe(201);
      const id = sent.json().id;
      expect((await accept(id, p, profile)).statusCode).toBe(200);
      if (status === "closed")
        expect(
          (
            await request(
              "POST",
              `/invitations/${id}/action`,
              { action: "close" },
              tenant,
            )
          ).statusCode,
        ).toBe(200);
      const before = (
        await request("GET", `/invitations/${id}`, undefined, tenant)
      ).json().invitation;
      expect(
        before.compatibility.checks.find(
          (check: any) => check.key === "contract",
        ),
      ).toMatchObject({ matches: true });
      expect(
        (
          await request(
            "PUT",
            `/properties/${p.id}`,
            { ...offer, contract_type: "three_plus_two" },
            landlord,
          )
        ).statusCode,
      ).toBe(200);
      const list = await request("GET", "/invitations", undefined, tenant);
      const detail = await request(
        "GET",
        `/invitations/${id}`,
        undefined,
        tenant,
      );
      for (const invitation of [
        list.json().invitations[0],
        detail.json().invitation,
      ]) {
        expect(invitation).toMatchObject({
          status,
          property_changed: true,
          property: { contract_type: "student" },
        });
        expect(invitation.compatibility).toEqual(before.compatibility);
      }
      // A new preference is compared with the agreed offer, not today's edited property.
      await saveProfile("three_plus_two", false);
      const changed = (
        await request("GET", `/invitations/${id}`, undefined, tenant)
      ).json().invitation;
      expect(changed).toMatchObject({
        status,
        property: { contract_type: "student" },
        compatibility: { compatible: false },
      });
      expect(
        changed.compatibility.checks.find(
          (check: any) => check.key === "contract",
        ),
      ).toMatchObject({ matches: false });
      if (status === "accepted")
        expect(
          (
            await request(
              "POST",
              `/conversations/${id}/messages`,
              { body: "Messaggio sintetico dopo il cambio di contratto." },
              tenant,
            )
          ).statusCode,
        ).toBe(201);
    },
  );
});

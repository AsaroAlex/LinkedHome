import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { buildApp } from "../server/app";
import { digest, token } from "../server/auth";
import { makePool } from "../server/db";
import { migrate } from "../scripts/migrate";
import { housingNeeds, accessibilityNeeds } from "../shared/profile-details";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search !== "" ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error("Housing-need tests require isolated local soglia_test.");

const db = makePool(url),
  origin = "http://127.0.0.1:3000";
const app = await buildApp(db, {
  origin,
  limits: false,
  serveStatic: false,
  mail: async () => {},
});
type Person = { id: string; cookie: string };
const preferences = {
  city: "Bologna",
  budget: 1100,
  move_in: "2028-01-15",
  duration: 12,
  occupants: 2,
  contract_preference: "any",
};
const details = {
  pets: "unspecified",
  pets_details: "",
  furnishing_preference: "any",
  housing_needs: ["balcony", "fiber_internet", "security_door"],
  about: "",
  accessibility_needs: ["step_free_entry", "accessible_bathroom"],
};
let tenant: Person, landlord: Person, outsider: Person, property: any;

function request(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  actor?: Person,
  payload?: Record<string, unknown>,
) {
  return app.inject({
    method,
    url: `/api${path}`,
    payload,
    headers: {
      origin,
      "content-type": "application/json",
      ...(actor ? { cookie: actor.cookie } : {}),
    },
  });
}
async function person(role: "tenant" | "landlord") {
  const id = randomUUID(),
    secret = token();
  await db.query(
    "INSERT INTO users(id,email,password_hash,display_name,role,email_verified) VALUES($1,$2,'test-only-disabled','Persona sintetica',$3,true)",
    [id, `${id}@example.test`, role],
  );
  await db.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 day')",
    [digest(secret), id],
  );
  return { id, cookie: `soglia=${secret}` };
}
async function ownProfile() {
  const response = await request("GET", "/profile", tenant);
  expect(response.statusCode).toBe(200);
  return response.json().profile;
}
async function save(patch: Record<string, unknown> = {}, publish = false) {
  expect(
    (await request("PUT", "/profile", tenant, { ...preferences, ...patch }))
      .statusCode,
  ).toBe(200);
  if (publish)
    expect(
      (
        await request("POST", "/profile/status", tenant, {
          status: "published",
        })
      ).statusCode,
    ).toBe(200);
  return ownProfile();
}
async function send(profile: any) {
  const response = await request("POST", "/invitations", landlord, {
    property_id: property.id,
    tenant_id: tenant.id,
    property_revision: property.revision,
    profile_revision: profile.revision,
  });
  expect(response.statusCode).toBe(201);
  return response.json().id as string;
}
async function accept(id: string, profile: any) {
  expect(
    (
      await request("POST", `/invitations/${id}/action`, tenant, {
        action: "accept",
        property_revision: property.revision,
        profile_revision: profile.revision,
      })
    ).statusCode,
  ).toBe(200);
}
async function invitation(id: string, actor = landlord) {
  const response = await request("GET", `/invitations/${id}`, actor);
  expect(response.statusCode).toBe(200);
  return response.json().invitation;
}
function expectNoAccessDetails(body: string) {
  expect(body).not.toContain("accessibility_needs");
  for (const need of accessibilityNeeds) expect(body).not.toContain(need);
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
    throw new Error("Unsafe effective housing-need test connection.");
  await migrate(db);
  await app.ready();
});
beforeEach(async () => {
  await db.query("TRUNCATE users,events,audit_log RESTART IDENTITY CASCADE");
  tenant = await person("tenant");
  landlord = await person("landlord");
  outsider = await person("landlord");
  property = (
    await db.query(
      "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) VALUES($1,'Casa sintetica','Bologna','Saragozza','Casa sintetica per verificare le preferenze.',850,'2028-01-01',6,36,2,65,3,true,true,'published',now()) RETURNING *",
      [landlord.id],
    )
  ).rows[0];
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("housing features and private access requirements", () => {
  it("roundtrips all 22 housing features and all six access choices, including export", async () => {
    const patch = {
      housing_needs: [...housingNeeds],
      accessibility_needs: [...accessibilityNeeds],
    };
    expect(housingNeeds).toHaveLength(22);
    expect(accessibilityNeeds).toHaveLength(6);
    const saved = await save(patch);
    expect(saved).toMatchObject(patch);
    expect(await ownProfile()).toMatchObject(patch);
    expect(
      (
        await db.query(
          "SELECT housing_needs,accessibility_needs FROM profiles WHERE user_id=$1",
          [tenant.id],
        )
      ).rows[0],
    ).toEqual(patch);
    const exported = await request("GET", "/account/export", tenant);
    expect(exported.statusCode).toBe(200);
    expect(exported.json().profile[0]).toMatchObject(patch);
  });

  it("keeps the original three values and safely defaults old rows and old API inserts", async () => {
    const legacy = ["elevator", "outdoor_space", "parking"];
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,housing_needs,status) VALUES($1,'Bologna',1100,'2028-01-15',12,2,$2,'draft')",
      [tenant.id, legacy],
    );
    const before = await ownProfile();
    expect(before).toMatchObject({
      housing_needs: legacy,
      accessibility_needs: [],
    });
    expect(await save({ budget: 1200 })).toMatchObject({
      housing_needs: legacy,
      accessibility_needs: [],
      revision: before.revision + 1,
    });
    const fresh = await person("tenant");
    expect(
      (await request("PUT", "/profile", fresh, preferences)).statusCode,
    ).toBe(200);
    expect(
      (await request("GET", "/profile", fresh)).json().profile,
    ).toMatchObject({
      housing_needs: [],
      accessibility_needs: [],
    });
  });

  it("preserves omitted access choices and independently clears explicitly empty arrays", async () => {
    await save(details);
    expect(await save({ budget: 1300 })).toMatchObject(details);
    expect(await save({ housing_needs: [] })).toMatchObject({
      housing_needs: [],
      accessibility_needs: details.accessibility_needs,
    });
    expect(await save({ accessibility_needs: [] })).toMatchObject({
      housing_needs: [],
      accessibility_needs: [],
    });
    expect((await ownProfile()).accessibility_needs).toEqual([]);
  });

  it("rejects invalid choices and diagnosis fields atomically while keeping a pending invitation", async () => {
    const profile = await save(details, true),
      id = await send(profile);
    const before = await ownProfile();
    const invalid = [
      { housing_needs: ["balcony", "balcony"] },
      { housing_needs: ["garden"] },
      { housing_needs: ["step_free_entry"] },
      { housing_needs: [...housingNeeds, "elevator"] },
      { housing_needs: null },
      { accessibility_needs: ["step_free_entry", "step_free_entry"] },
      { accessibility_needs: ["elevator"] },
      { accessibility_needs: ["unknown"] },
      { accessibility_needs: [...accessibilityNeeds, "wide_doorways"] },
      { accessibility_needs: "step_free_entry" },
      { accessibility_needs: [null] },
      { accessibility_needs: null },
      { disability: true },
      { is_disabled: true },
      { diagnosis: "Synthetic diagnosis must not be collected" },
      { health_details: "Synthetic health details must not be collected" },
    ];
    for (const patch of invalid) {
      const response = await request("PUT", "/profile", tenant, {
        ...preferences,
        ...patch,
      });
      expect(response.statusCode, JSON.stringify(patch)).toBe(400);
      expect(await ownProfile()).toEqual(before);
      expect(
        (await db.query("SELECT status FROM invitations WHERE id=$1", [id]))
          .rows[0].status,
      ).toBe("pending");
    }
    await accept(id, profile);
  });

  it("enforces allowed, non-null and unique choices in both database arrays", async () => {
    await save(details);
    for (const column of ["housing_needs", "accessibility_needs"]) {
      const valid = column === "housing_needs" ? "balcony" : "step_free_home";
      for (const value of [["unknown"], [valid, valid], [valid, null], null]) {
        await expect(
          db.query(
            `UPDATE profiles SET ${column}=$2::text[] WHERE user_id=$1`,
            [tenant.id, value],
          ),
        ).rejects.toMatchObject({ code: value === null ? "23502" : "23514" });
        expect(await ownProfile()).toMatchObject(details);
      }
    }
    const columns = (
      await db.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles'",
      )
    ).rows.map((row) => row.column_name);
    expect(columns).toContain("accessibility_needs");
    for (const name of [
      "disability",
      "is_disabled",
      "diagnosis",
      "health_details",
    ])
      expect(columns).not.toContain(name);
  });

  it("shares housing features in discovery without exposing access choices or affecting compatibility", async () => {
    await save(
      {
        housing_needs: [...housingNeeds],
        accessibility_needs: [...accessibilityNeeds],
      },
      true,
    );
    const response = await request("GET", `/discover/${property.id}`, landlord);
    expect(response.statusCode).toBe(200);
    expect(response.json().profiles).toHaveLength(1);
    const [candidate] = response.json().profiles;
    expect(candidate.housing_needs).toEqual([...housingNeeds]);
    expect(candidate.compatibility.compatible).toBe(true);
    expect(Object.keys(candidate).sort()).toEqual(
      [
        "id",
        "alias",
        "city",
        "locations",
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
    expect(
      candidate.compatibility.checks.some((check: any) =>
        ["housing_needs", "accessibility_needs", "disability"].includes(
          check.key,
        ),
      ),
    ).toBe(false);
    expectNoAccessDetails(response.body);
    expect(
      (await request("GET", `/discover/${property.id}`, outsider)).statusCode,
    ).toBe(400);
  });

  it.each([
    "pending",
    "declined",
    "withdrawn",
    "cancelled",
    "expired",
  ] as const)(
    "keeps access choices private for a %s invitation",
    async (status) => {
      const profile = await save(details, true),
        id = await send(profile);
      if (status === "declined" || status === "withdrawn")
        expect(
          (
            await request(
              "POST",
              `/invitations/${id}/action`,
              status === "declined" ? tenant : landlord,
              {
                action: status === "declined" ? "decline" : "withdraw",
              },
            )
          ).statusCode,
        ).toBe(200);
      else if (status === "cancelled") await save({ budget: 1200 });
      else if (status === "expired")
        await db.query(
          "UPDATE invitations SET expires_at=now()-interval '1 second' WHERE id=$1",
          [id],
        );
      for (const actor of [tenant, landlord]) {
        const one = await request("GET", `/invitations/${id}`, actor);
        expect(one.statusCode).toBe(200);
        expect(one.json().invitation).toMatchObject({
          status,
          tenant_details: null,
        });
        expectNoAccessDetails(one.body);
        const list = await request("GET", "/invitations", actor);
        expect(list.json().invitations[0].tenant_details).toBeNull();
        expectNoAccessDetails(list.body);
      }
      expect((await ownProfile()).accessibility_needs).toEqual(
        details.accessibility_needs,
      );
    },
  );

  it.each(["accepted", "closed"] as const)(
    "shares access choices only with both parties of an %s contact and keeps snapshots/logs clean",
    async (status) => {
      const profile = await save(details, true),
        id = await send(profile);
      await accept(id, profile);
      if (status === "closed")
        expect(
          (
            await request("POST", `/invitations/${id}/action`, tenant, {
              action: "close",
            })
          ).statusCode,
        ).toBe(200);
      for (const actor of [tenant, landlord]) {
        expect((await invitation(id, actor)).tenant_details).toEqual(details);
        expect(
          (await request("GET", "/invitations", actor)).json().invitations[0]
            .tenant_details,
        ).toEqual(details);
      }
      expect(
        (await request("GET", `/invitations/${id}`, outsider)).statusCode,
      ).toBe(404);
      const snapshot = (
        await db.query(
          "SELECT property_snapshot FROM invitations WHERE id=$1",
          [id],
        )
      ).rows[0].property_snapshot;
      expectNoAccessDetails(JSON.stringify(snapshot));
      expectNoAccessDetails(
        JSON.stringify((await db.query("SELECT * FROM audit_log")).rows),
      );
      expectNoAccessDetails(
        JSON.stringify((await db.query("SELECT * FROM events")).rows),
      );
      const changed = ["wide_doorways", "step_free_shower"];
      await save({ accessibility_needs: changed });
      expect((await invitation(id)).tenant_details).toEqual({
        ...details,
        accessibility_needs: changed,
      });
      expect((await invitation(id)).status).toBe(status);
      expect(
        (
          await db.query(
            "SELECT property_snapshot FROM invitations WHERE id=$1",
            [id],
          )
        ).rows[0].property_snapshot,
      ).toEqual(snapshot);
      expect(
        (await request("GET", "/account/export", tenant)).json().profile[0]
          .accessibility_needs,
      ).toEqual(changed);
      await save({ accessibility_needs: [] });
      const { accessibility_needs: _private, ...legacyShape } = details;
      for (const actor of [tenant, landlord])
        expect((await invitation(id, actor)).tenant_details).toEqual(
          legacyShape,
        );
    },
  );

  it.each(["tenant", "landlord"] as const)(
    "hides access choices from both parties when the %s blocks the contact",
    async (role) => {
      const profile = await save(details, true),
        id = await send(profile);
      await accept(id, profile);
      expect(
        (
          await request(
            "POST",
            "/blocks",
            role === "tenant" ? tenant : landlord,
            { invitation_id: id },
          )
        ).statusCode,
      ).toBe(200);
      for (const actor of [tenant, landlord]) {
        const response = await request("GET", `/invitations/${id}`, actor);
        expect(response.statusCode).toBe(200);
        expect(response.json().invitation.tenant_details).toBeNull();
        expectNoAccessDetails(response.body);
      }
      expect((await ownProfile()).accessibility_needs).toEqual(
        details.accessibility_needs,
      );
    },
  );

  it.each(["tenant", "landlord"] as const)(
    "hides access choices when the %s is suspended and restricts their session",
    async (role) => {
      const profile = await save(details, true),
        id = await send(profile);
      await accept(id, profile);
      const suspended = role === "tenant" ? tenant : landlord;
      const active = role === "tenant" ? landlord : tenant;
      await db.query("UPDATE users SET suspended=true WHERE id=$1", [
        suspended.id,
      ]);
      const response = await request("GET", `/invitations/${id}`, active);
      expect(response.statusCode).toBe(200);
      expect(response.json().invitation.tenant_details).toBeNull();
      expectNoAccessDetails(response.body);
      expect(
        (await request("GET", `/invitations/${id}`, suspended)).statusCode,
      ).toBe(423);
    },
  );

  it("keeps choices within a synthetic workspace, including forged accepted cross-workspace contacts", async () => {
    const previewOrigin = "https://preview.example.test";
    const hosted = await buildApp(db, {
      runtime: {
        environment: "preview",
        origin: previewOrigin,
        mailTransport: "disabled",
        trustedProxies: false,
      },
      limits: false,
      serveStatic: false,
      mail: async () => {},
    });
    type Jar = Map<string, string>;
    async function hostedRequest(
      jar: Jar,
      method: "GET" | "POST" | "PUT",
      path: string,
      payload?: Record<string, unknown>,
    ) {
      const response = await hosted.inject({
        method,
        url: `/api${path}`,
        payload,
        headers: {
          origin: previewOrigin,
          "content-type": "application/json",
          cookie: [...jar]
            .map(([name, value]) => `${name}=${value}`)
            .join("; "),
        },
      });
      for (const cookie of response.cookies) jar.set(cookie.name, cookie.value);
      return response;
    }
    try {
      const first: Jar = new Map(),
        second: Jar = new Map();
      for (const jar of [first, second])
        expect(
          (
            await hostedRequest(jar, "POST", "/auth/preview", {
              role: "tenant",
            })
          ).statusCode,
        ).toBe(200);
      const own = (await hostedRequest(first, "GET", "/profile")).json()
        .profile;
      expect(
        (
          await hostedRequest(first, "PUT", "/profile", {
            city: own.city,
            budget: own.budget,
            move_in: own.move_in,
            duration: own.duration,
            occupants: own.occupants,
            housing_needs: [...housingNeeds],
            accessibility_needs: [...accessibilityNeeds],
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (await hostedRequest(second, "GET", "/profile")).json().profile
          .accessibility_needs,
      ).toEqual([]);
      expect(
        (await hostedRequest(second, "GET", "/profile")).body,
      ).not.toContain(own.user_id);
      expect(
        (
          await hostedRequest(first, "POST", "/auth/preview", {
            role: "landlord",
          })
        ).statusCode,
      ).toBe(200);
      const offered = (await hostedRequest(first, "GET", "/properties")).json()
        .properties[0];
      const discovered = await hostedRequest(
        first,
        "GET",
        `/discover/${offered.id}`,
      );
      expect(discovered.statusCode).toBe(200);
      expect(discovered.json().profiles.map((p: any) => p.id)).toEqual([
        own.user_id,
      ]);
      expectNoAccessDetails(discovered.body);
      const current = (
        await db.query("SELECT * FROM profiles WHERE user_id=$1", [own.user_id])
      ).rows[0];
      const sent = await hostedRequest(first, "POST", "/invitations", {
        property_id: offered.id,
        tenant_id: own.user_id,
        property_revision: offered.revision,
        profile_revision: current.revision,
      });
      expect(sent.statusCode).toBe(201);
      const id = sent.json().id;
      expect(
        (
          await hostedRequest(first, "POST", "/auth/preview", {
            role: "tenant",
          })
        ).statusCode,
      ).toBe(200);
      const pending = await hostedRequest(first, "GET", `/invitations/${id}`);
      expect(pending.json().invitation.tenant_details).toBeNull();
      expectNoAccessDetails(pending.body);
      expect(
        (
          await hostedRequest(first, "POST", `/invitations/${id}/action`, {
            action: "accept",
            property_revision: offered.revision,
            profile_revision: current.revision,
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (await hostedRequest(first, "GET", `/invitations/${id}`)).json()
          .invitation.tenant_details.accessibility_needs,
      ).toEqual([...accessibilityNeeds]);
      expect(
        (
          await hostedRequest(first, "POST", "/auth/preview", {
            role: "landlord",
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (await hostedRequest(first, "GET", `/invitations/${id}`)).json()
          .invitation.tenant_details.accessibility_needs,
      ).toEqual([...accessibilityNeeds]);
      expect(
        (
          await hostedRequest(second, "POST", "/auth/preview", {
            role: "landlord",
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (await hostedRequest(second, "GET", `/invitations/${id}`)).statusCode,
      ).toBe(404);
      const remoteProperty = (
        await hostedRequest(second, "GET", "/properties")
      ).json().properties[0];
      const forged = (
        await db.query(
          "INSERT INTO invitations(property_id,tenant_id,landlord_id,property_revision,profile_revision,property_snapshot,status,accepted_at) VALUES($1,$2,$3,$4,$5,$6,'accepted',now()) RETURNING id",
          [
            remoteProperty.id,
            own.user_id,
            remoteProperty.owner_id,
            remoteProperty.revision,
            current.revision,
            JSON.stringify(remoteProperty),
          ],
        )
      ).rows[0];
      const cross = await hostedRequest(
        second,
        "GET",
        `/invitations/${forged.id}`,
      );
      expect(cross.statusCode).toBe(200);
      expect(cross.json().invitation.tenant_details).toBeNull();
      expectNoAccessDetails(cross.body);
      const landlordExport = await hostedRequest(
        second,
        "GET",
        "/account/export",
      );
      expect(landlordExport.json().profile).toEqual([]);
      expectNoAccessDetails(landlordExport.body);
    } finally {
      await hosted.close();
    }
  });
});

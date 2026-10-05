import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { buildApp } from "../server/app";
import { digest, token } from "../server/auth";
import { makePool } from "../server/db";
import { migrate } from "../scripts/migrate";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search !== "" ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error("Profile-detail tests require isolated local soglia_test.");

const db = makePool(url),
  origin = "http://127.0.0.1:3000";
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
const preferences = {
  city: "Bologna",
  budget: 1100,
  move_in: "2028-01-15",
  duration: 12,
  occupants: 2,
  contract_preference: "any",
};
const defaults = {
  pets: "unspecified",
  pets_details: "",
  furnishing_preference: "any",
  housing_needs: [],
  about: "",
};
const details = {
  pets: "dog",
  pets_details: "Un cane sintetico di taglia media.",
  furnishing_preference: "unfurnished",
  housing_needs: ["elevator", "outdoor_space"],
  about: "Presentazione sintetica privata da condividere dopo il contatto.",
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
    url: "/api" + path,
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
    email = `${id}@example.test`,
    secret = token();
  const displayName = "Persona sintetica privata";
  await db.query(
    "INSERT INTO users(id,email,password_hash,display_name,role,email_verified) VALUES($1,$2,'test-only-disabled',$3,$4,true)",
    [id, email, displayName, role],
  );
  await db.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 day')",
    [digest(secret), id],
  );
  return { id, email, displayName, cookie: `soglia=${secret}` };
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
    throw new Error("Unsafe effective profile-detail test connection.");
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
      "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) VALUES($1,'Casa sintetica','Bologna','Saragozza','Una casa per verificare i dettagli del profilo.',850,'2028-01-01',6,36,2,65,3,true,true,'published',now()) RETURNING *",
      [landlord.id],
    )
  ).rows[0];
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("optional profile details", () => {
  it("roundtrips trimmed details, preserves omitted fields and explicitly clears them", async () => {
    const profile = await save({
      ...details,
      pets_details: `  ${details.pets_details}  `,
      about: `  ${details.about}  `,
    });
    expect(profile).toMatchObject(details);
    expect(
      (
        await db.query(
          "SELECT pets,pets_details,furnishing_preference,housing_needs,about FROM profiles WHERE user_id=$1",
          [tenant.id],
        )
      ).rows[0],
    ).toEqual(details);
    const legacyEdit = await save({ budget: 1200 });
    expect(legacyEdit).toMatchObject({
      ...details,
      budget: 1200,
      revision: profile.revision + 1,
    });
    expect(
      (await request("GET", "/account/export", tenant)).json().profile[0],
    ).toMatchObject(details);
    const cleared = await save({
      ...defaults,
      pets_details: "  ",
      about: "  ",
    });
    expect(cleared).toMatchObject(defaults);
    expect((await ownProfile()).housing_needs).toEqual([]);
  });

  it("adds safe defaults to legacy rows and old API payloads without losing numeric duration", async () => {
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'draft')",
      [tenant.id],
    );
    expect(await ownProfile()).toMatchObject({ ...defaults, duration: 12 });
    expect(await save()).toMatchObject({ ...defaults, duration: 12 });
    const freshTenant = await person("tenant");
    expect(
      (await request("PUT", "/profile", freshTenant, preferences)).statusCode,
    ).toBe(200);
    expect(
      (await request("GET", "/profile", freshTenant)).json().profile,
    ).toMatchObject(defaults);
    expect(
      (await request("GET", "/profile", landlord)).json().profile,
    ).toBeNull();
  });

  it("supports every pets and furnishing choice and three distinct housing needs", async () => {
    for (const pets of [
      "unspecified",
      "none",
      "dog",
      "cat",
      "other",
      "multiple",
    ])
      expect(await save({ pets })).toMatchObject({ pets });
    for (const furnishing_preference of [
      "any",
      "furnished",
      "unfurnished",
      "partly_furnished",
    ])
      expect(await save({ furnishing_preference })).toMatchObject({
        furnishing_preference,
      });
    const housing_needs = ["elevator", "outdoor_space", "parking"];
    expect(
      await save({
        housing_needs,
        pets_details: ` ${"a".repeat(200)} `,
        about: ` ${"b".repeat(600)} `,
      }),
    ).toMatchObject({
      housing_needs,
      pets_details: "a".repeat(200),
      about: "b".repeat(600),
    });
  });

  it("rejects invalid details without updating the profile or cancelling an existing invitation", async () => {
    const profile = await save(details, true);
    const id = await send(profile);
    const before = (
      await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id])
    ).rows[0];
    const invalid = [
      { pets: "bird" },
      { pets: null },
      { pets_details: "x".repeat(201) },
      { furnishing_preference: "optional" },
      { furnishing_preference: null },
      { housing_needs: ["garden"] },
      { housing_needs: ["parking", "parking"] },
      { housing_needs: ["elevator", "outdoor_space", "parking", "parking"] },
      { housing_needs: "elevator" },
      { housing_needs: null },
      { about: "x".repeat(601) },
      { about: null },
      { pets_details: 1 },
    ];
    for (const patch of invalid) {
      const response = await request("PUT", "/profile", tenant, {
        ...preferences,
        ...patch,
      });
      expect(response.statusCode, JSON.stringify(patch)).toBe(400);
      expect(
        (await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id]))
          .rows[0],
      ).toEqual(before);
      expect(
        (await db.query("SELECT status FROM invitations WHERE id=$1", [id]))
          .rows[0].status,
      ).toBe("pending");
    }
    await accept(id, profile);
  });

  it("exposes only basic choices in discovery and keeps text, identities and photos private", async () => {
    await save(details, true);
    const discovery = await request(
      "GET",
      `/discover/${property.id}`,
      landlord,
    );
    expect(discovery.statusCode).toBe(200);
    expect(discovery.json().profiles).toHaveLength(1);
    const [candidate] = discovery.json().profiles;
    expect(candidate).toMatchObject({
      pets: details.pets,
      furnishing_preference: details.furnishing_preference,
      housing_needs: details.housing_needs,
      compatibility: { compatible: true },
    });
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
        "occupants",
        "revision",
        "compatibility",
        "pets",
        "furnishing_preference",
        "housing_needs",
      ].sort(),
    );
    expect(discovery.body).not.toContain(details.pets_details);
    expect(discovery.body).not.toContain(details.about);
    expect(discovery.body).not.toContain(tenant.email);
    expect(discovery.body).not.toContain(tenant.displayName);
    expect(discovery.body).not.toContain("profile-photos");
    // These choices provide context; an unfurnished preference does not silently
    // exclude this furnished property or introduce an undisclosed ranking.
    expect(
      candidate.compatibility.checks.some((check: any) =>
        ["pets", "furnishing", "housing_needs"].includes(check.key),
      ),
    ).toBe(false);
    expect(
      (await request("GET", `/discover/${property.id}`, outsider)).statusCode,
    ).toBe(400);
  });

  it.each(["accepted", "closed"] as const)(
    "shares the same current tenant details with both parties only after an %s contact",
    async (status) => {
      const profile = await save(details, true);
      const id = await send(profile);
      for (const actor of [landlord, tenant]) {
        const pending = await request("GET", `/invitations/${id}`, actor);
        expect(pending.statusCode).toBe(200);
        expect(pending.json().invitation.tenant_details).toBeNull();
        expect(pending.body).not.toContain(details.pets_details);
        expect(pending.body).not.toContain(details.about);
      }
      await accept(id, profile);
      if (status === "closed")
        expect(
          (
            await request("POST", `/invitations/${id}/action`, tenant, {
              action: "close",
            })
          ).statusCode,
        ).toBe(200);
      for (const actor of [landlord, tenant]) {
        expect((await invitation(id, actor)).tenant_details).toEqual(details);
        expect(
          (await request("GET", "/invitations", actor)).json().invitations[0]
            .tenant_details,
        ).toEqual(details);
      }
      expect(
        (await request("GET", `/invitations/${id}`, outsider)).statusCode,
      ).toBe(404);
      const beforeSnapshot = (
        await db.query(
          "SELECT property_snapshot FROM invitations WHERE id=$1",
          [id],
        )
      ).rows[0].property_snapshot;
      const updatedDetails = {
        ...details,
        about: "Nuova presentazione sintetica privata.",
        pets: "cat",
      };
      await save(updatedDetails);
      expect((await invitation(id)).tenant_details).toEqual(updatedDetails);
      expect((await invitation(id)).status).toBe(status);
      expect(
        (
          await db.query(
            "SELECT property_snapshot FROM invitations WHERE id=$1",
            [id],
          )
        ).rows[0].property_snapshot,
      ).toEqual(beforeSnapshot);
      if (status === "accepted")
        expect(
          (
            await request("POST", `/conversations/${id}/messages`, tenant, {
              body: "Messaggio sintetico dopo il cambio dei dettagli.",
            })
          ).statusCode,
        ).toBe(201);
    },
  );

  it("cancels pending offers when details change and refuses stale profile revisions", async () => {
    const profile = await save(details, true);
    const id = await send(profile);
    const changed = await save({ pets: "cat", housing_needs: ["parking"] });
    expect(changed.revision).toBe(profile.revision + 1);
    expect((await invitation(id)).status).toBe("cancelled");
    expect((await invitation(id)).tenant_details).toBeNull();
    expect(
      (
        await request("POST", `/invitations/${id}/action`, tenant, {
          action: "accept",
          property_revision: property.revision,
          profile_revision: profile.revision,
        })
      ).statusCode,
    ).toBe(409);
    expect(await ownProfile()).toMatchObject({
      pets: "cat",
      housing_needs: ["parking"],
      about: details.about,
    });
  });

  it.each(["tenant", "landlord"] as const)(
    "hides tenant details from both parties after the %s blocks the contact",
    async (role) => {
      const profile = await save(details, true);
      const id = await send(profile);
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
      for (const actor of [tenant, landlord])
        expect((await invitation(id, actor)).tenant_details).toBeNull();
      expect(await ownProfile()).toMatchObject(details);
    },
  );

  it.each(["tenant", "landlord"] as const)(
    "hides tenant details when the %s is suspended and restricts that session",
    async (role) => {
      const profile = await save(details, true);
      const id = await send(profile);
      await accept(id, profile);
      const suspended = role === "tenant" ? tenant : landlord;
      const active = role === "tenant" ? landlord : tenant;
      await db.query("UPDATE users SET suspended=true WHERE id=$1", [
        suspended.id,
      ]);
      expect((await invitation(id, active)).tenant_details).toBeNull();
      expect(
        (await request("GET", `/invitations/${id}`, suspended)).statusCode,
      ).toBe(423);
    },
  );

  it("keeps full tenant details inside their hosted preview workspace", async () => {
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
    });
    try {
      async function enter(role: "tenant" | "landlord") {
        const entered = await hosted.inject({
          method: "POST",
          url: "/api/auth/preview",
          headers: {
            origin: previewOrigin,
            "content-type": "application/json",
          },
          payload: { role },
        });
        expect(entered.statusCode).toBe(200);
        const cookie = entered.cookies
          .map((item) => `${item.name}=${item.value}`)
          .join("; ");
        const user = (
          await hosted.inject({
            method: "GET",
            url: "/api/session",
            headers: { cookie },
          })
        ).json().user;
        return { id: user.id, cookie };
      }
      const first = await enter("tenant"),
        second = await enter("landlord");
      const own = (
        await db.query("SELECT * FROM profiles WHERE user_id=$1", [first.id])
      ).rows[0];
      expect(
        (
          await hosted.inject({
            method: "PUT",
            url: "/api/profile",
            headers: {
              origin: previewOrigin,
              cookie: first.cookie,
              "content-type": "application/json",
            },
            payload: {
              city: own.city,
              budget: own.budget,
              move_in: own.move_in,
              duration: own.duration,
              occupants: own.occupants,
              ...details,
            },
          })
        ).statusCode,
      ).toBe(200);
      const p = (
        await db.query("SELECT * FROM properties WHERE owner_id=$1", [
          second.id,
        ])
      ).rows[0];
      const current = (
        await db.query("SELECT * FROM profiles WHERE user_id=$1", [first.id])
      ).rows[0];
      const contact = (
        await db.query(
          "INSERT INTO invitations(property_id,tenant_id,landlord_id,property_revision,profile_revision,property_snapshot,status,accepted_at) VALUES($1,$2,$3,$4,$5,$6,'accepted',now()) RETURNING id",
          [
            p.id,
            first.id,
            second.id,
            p.revision,
            current.revision,
            JSON.stringify(p),
          ],
        )
      ).rows[0];
      const crossWorkspace = await hosted.inject({
        method: "GET",
        url: `/api/invitations/${contact.id}`,
        headers: { cookie: second.cookie },
      });
      expect(crossWorkspace.statusCode).toBe(200);
      expect(crossWorkspace.json().invitation.tenant_details).toBeNull();
      expect(crossWorkspace.body).not.toContain(details.pets_details);
      expect(crossWorkspace.body).not.toContain(details.about);
    } finally {
      await hosted.close();
    }
  });
});

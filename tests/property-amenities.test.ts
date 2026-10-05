import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { buildApp } from "../server/app";
import { digest, token } from "../server/auth";
import { makePool } from "../server/db";
import { migrate } from "../scripts/migrate";
import { propertyAmenities } from "../shared/property-amenities";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search !== "" ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error(
    "Property-amenities tests require isolated local soglia_test.",
  );

const db = makePool(url),
  origin = "http://127.0.0.1:3000";
const app = await buildApp(db, {
  origin,
  limits: false,
  serveStatic: false,
  mail: async () => {},
});
type Person = { id: string; cookie: string };
const baseProperty = {
  title: "Una casa sintetica",
  city: "Bologna",
  area: "Saragozza",
  description: "Immobile sintetico per verificare le dotazioni della casa.",
  rent: 850,
  available_from: "2028-01-01",
  min_months: 6,
  max_months: 36,
  capacity: 2,
  sqm: 65,
  rooms: 3,
  furnished: true,
  authority_attested: true,
  contract_type: "unspecified",
};
const amenities = ["elevator", "balcony", "fiber_internet", "step_free_entry"];
const amenitiesDetails =
  "La casa sintetica ha due balconi e ingresso senza gradini.";
const address = {
  street: "Via Prova Sintetica",
  street_number: "12/B",
  address_visibility: "area",
};
let tenant: Person,
  landlord: Person,
  outsider: Person,
  property: any,
  profile: any;

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
async function ownProperty(id = property.id, owner = landlord) {
  const response = await request("GET", "/properties", owner);
  expect(response.statusCode).toBe(200);
  return response.json().properties.find((p: any) => p.id === id);
}
async function create(patch: Record<string, unknown> = {}) {
  const response = await request("POST", "/properties", landlord, {
    ...baseProperty,
    ...patch,
  });
  expect(response.statusCode).toBe(201);
  const id = response.json().id;
  expect(
    (
      await request("POST", `/properties/${id}/status`, landlord, {
        status: "published",
      })
    ).statusCode,
  ).toBe(200);
  return ownProperty(id);
}
async function edit(patch: Record<string, unknown> = {}) {
  expect(
    (
      await request("PUT", `/properties/${property.id}`, landlord, {
        ...baseProperty,
        ...patch,
      })
    ).statusCode,
  ).toBe(200);
  property = await ownProperty();
  return property;
}
async function send() {
  const response = await request("POST", "/invitations", landlord, {
    property_id: property.id,
    tenant_id: tenant.id,
    property_revision: property.revision,
    profile_revision: profile.revision,
  });
  expect(response.statusCode).toBe(201);
  return response.json().id as string;
}
async function accept(id: string) {
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
async function snapshot(id: string) {
  return (
    await db.query("SELECT property_snapshot FROM invitations WHERE id=$1", [
      id,
    ])
  ).rows[0].property_snapshot;
}
function expectAddressPrivate(body: string) {
  expect(body).not.toContain(address.street);
  expect(body).not.toContain('"street"');
  expect(body).not.toContain('"street_number"');
}
async function readInvitation(id: string, actor = tenant) {
  const response = await request("GET", `/invitations/${id}`, actor);
  expect(response.statusCode).toBe(200);
  return response;
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
    throw new Error("Unsafe effective property-amenities test connection.");
  await migrate(db);
  await app.ready();
});
beforeEach(async () => {
  await db.query("TRUNCATE users,events,audit_log RESTART IDENTITY CASCADE");
  tenant = await person("tenant");
  landlord = await person("landlord");
  outsider = await person("landlord");
  profile = (
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at,housing_needs,accessibility_needs) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'published',now(),ARRAY['outdoor_space','elevator'],ARRAY['step_free_entry']) RETURNING *",
      [tenant.id],
    )
  ).rows[0];
  property = await create();
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("owner-confirmed property amenities", () => {
  it("defaults old property payloads and legacy inserts without altering older address or profile fields", async () => {
    expect(property).toMatchObject({
      amenities: [],
      amenities_details: "",
      street: "",
      street_number: "",
      address_visibility: "area",
    });
    const legacy = (
      await db.query(
        "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished) VALUES($1,'Casa sintetica precedente','Bologna','Centro','Descrizione sintetica precedente.',850,'2028-01-01',6,36,2,65,3,true) RETURNING *",
        [landlord.id],
      )
    ).rows[0];
    expect(legacy).toMatchObject({
      amenities: [],
      amenities_details: "",
      street: "",
      street_number: "",
      address_visibility: "area",
      revision: 1,
      status: "draft",
    });
    const savedProfile = (await request("GET", "/profile", tenant)).json()
      .profile;
    expect(savedProfile).toMatchObject({
      housing_needs: ["outdoor_space", "elevator"],
      accessibility_needs: ["step_free_entry"],
    });
    expect(savedProfile).not.toHaveProperty("amenities");
  });

  it("creates, reloads and exports all 27 unique amenities with trimmed details", async () => {
    expect(propertyAmenities).toHaveLength(27);
    expect(propertyAmenities).not.toContain("outdoor_space");
    const saved = await create({
      amenities: [...propertyAmenities],
      amenities_details: ` ${amenitiesDetails} `,
      ...address,
    });
    expect(saved).toMatchObject({
      amenities: [...propertyAmenities],
      amenities_details: amenitiesDetails,
      ...address,
    });
    expect(await ownProperty(saved.id)).toMatchObject({
      amenities: [...propertyAmenities],
      amenities_details: amenitiesDetails,
    });
    expect(
      (
        await db.query(
          "SELECT amenities,amenities_details FROM properties WHERE id=$1",
          [saved.id],
        )
      ).rows[0],
    ).toEqual({
      amenities: [...propertyAmenities],
      amenities_details: amenitiesDetails,
    });
    const exported = await request("GET", "/account/export", landlord);
    expect(exported.statusCode).toBe(200);
    expect(
      exported.json().properties.find((p: any) => p.id === saved.id),
    ).toMatchObject({
      amenities: [...propertyAmenities],
      amenities_details: amenitiesDetails,
      ...address,
    });
  });

  it("preserves each omitted new field on old-client edits and independently clears explicit values", async () => {
    await edit({ amenities, amenities_details: amenitiesDetails, ...address });
    const before = property;
    expect(await edit({ rent: 900 })).toMatchObject({
      amenities,
      amenities_details: amenitiesDetails,
      ...address,
      rent: 900,
      revision: before.revision + 1,
    });
    expect(await edit({ amenities: ["dishwasher"] })).toMatchObject({
      amenities: ["dishwasher"],
      amenities_details: amenitiesDetails,
      ...address,
    });
    expect(
      await edit({ amenities_details: "  Dettagli sintetici aggiornati.  " }),
    ).toMatchObject({
      amenities: ["dishwasher"],
      amenities_details: "Dettagli sintetici aggiornati.",
      ...address,
    });
    expect(await edit({ amenities: [] })).toMatchObject({
      amenities: [],
      amenities_details: "Dettagli sintetici aggiornati.",
      ...address,
    });
    expect(await edit({ amenities_details: "  " })).toMatchObject({
      amenities: [],
      amenities_details: "",
      ...address,
    });
    expect(await edit({ address_visibility: "exact" })).toMatchObject({
      amenities: [],
      amenities_details: "",
      ...address,
      address_visibility: "exact",
    });
  });

  it("accepts the detail limit and rejects invalid creates without inserting a row", async () => {
    const maxed = await create({ amenities_details: "x".repeat(600) });
    expect(maxed.amenities_details).toHaveLength(600);
    const multiline =
      "Prima riga sintetica.\nSeconda riga.\tDue balconi.\rUltima riga.";
    const notes = await create({ amenities_details: ` \n${multiline}\n ` });
    expect(notes.amenities_details).toBe(multiline);
    expect(
      (
        await db.query("SELECT amenities_details FROM properties WHERE id=$1", [
          notes.id,
        ])
      ).rows[0].amenities_details,
    ).toBe(multiline);
    const count = Number(
      (await db.query("SELECT count(*) FROM properties")).rows[0].count,
    );
    const invalid = [
      { amenities: ["outdoor_space"] },
      { amenities: ["unknown"] },
      { amenities: ["balcony", "balcony"] },
      { amenities: [...propertyAmenities, "elevator"] },
      { amenities: [null] },
      { amenities: null },
      { amenities: "elevator" },
      { amenities_details: null },
      { amenities_details: 1 },
      { amenities_details: "x".repeat(601) },
      { amenities_details: "Dati\u0007con controllo" },
      { amenities_details: "Dati\u001bcon controllo" },
      { amenities_details: "Dati\u007fcon controllo" },
      { amenities_details: "Dati\u0085con controllo" },
      { amenities: ["disability"] },
      { disability: true },
      { health_details: "Dati sintetici" },
    ];
    for (const patch of invalid) {
      const response = await request("POST", "/properties", landlord, {
        ...baseProperty,
        ...patch,
      });
      expect(response.statusCode, JSON.stringify(patch)).toBe(400);
      expect(
        Number(
          (await db.query("SELECT count(*) FROM properties")).rows[0].count,
        ),
      ).toBe(count);
    }
  });

  it("rejects invalid merged edits atomically before revision or pending invitations change", async () => {
    await edit({ amenities, amenities_details: amenitiesDetails, ...address });
    const id = await send(),
      before = await ownProperty();
    const invalid = [
      { amenities: ["outdoor_space"] },
      { amenities: ["balcony", "balcony"] },
      { amenities: [...propertyAmenities, "elevator"] },
      { amenities: null },
      { amenities: [null] },
      { amenities_details: null },
      { amenities_details: "x".repeat(601) },
      { amenities_details: "Test\u0007controllo" },
      { amenities_details: "Test\u0085controllo" },
      { address_visibility: "exact", street: "" },
      { rent: 99 },
    ];
    for (const patch of invalid) {
      const response = await request(
        "PUT",
        `/properties/${property.id}`,
        landlord,
        { ...baseProperty, ...patch },
      );
      expect(response.statusCode, JSON.stringify(patch)).toBe(400);
      expect(await ownProperty()).toEqual(before);
      expect(
        (await db.query("SELECT status FROM invitations WHERE id=$1", [id]))
          .rows[0].status,
      ).toBe("pending");
    }
    await accept(id);
    expect(await snapshot(id)).toMatchObject({
      amenities,
      amenities_details: amenitiesDetails,
    });
  });

  it("enforces allowed, unique non-null arrays and trimmed bounded details in SQL", async () => {
    await edit({ amenities, amenities_details: amenitiesDetails });
    const before = await ownProperty();
    for (const value of [
      ["outdoor_space"],
      ["unknown"],
      ["balcony", "balcony"],
      ["balcony", null],
      null,
    ]) {
      await expect(
        db.query("UPDATE properties SET amenities=$2::text[] WHERE id=$1", [
          property.id,
          value,
        ]),
      ).rejects.toMatchObject({ code: value === null ? "23502" : "23514" });
      expect(await ownProperty()).toEqual(before);
    }
    for (const value of [
      "x".repeat(601),
      " leading",
      "trailing ",
      "Control\u0007text",
      "Control\u0085text",
      null,
    ]) {
      await expect(
        db.query("UPDATE properties SET amenities_details=$2 WHERE id=$1", [
          property.id,
          value,
        ]),
      ).rejects.toMatchObject({ code: value === null ? "23502" : "23514" });
      expect(await ownProperty()).toEqual(before);
    }
    await expect(
      db.query(
        "UPDATE profiles SET housing_needs=ARRAY['balcony','balcony'] WHERE user_id=$1",
        [tenant.id],
      ),
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      db.query(
        "UPDATE profiles SET accessibility_needs=ARRAY['step_free_entry','unknown'] WHERE user_id=$1",
        [tenant.id],
      ),
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      db.query("UPDATE properties SET address_visibility='exact' WHERE id=$1", [
        property.id,
      ]),
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("authorizes only the owner to edit or export the property", async () => {
    await edit({ amenities, amenities_details: amenitiesDetails });
    const before = await ownProperty();
    expect(
      (
        await request("PUT", `/properties/${property.id}`, outsider, {
          ...baseProperty,
          amenities: ["garage"],
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await request("PUT", `/properties/${property.id}`, tenant, {
          ...baseProperty,
          amenities: ["garage"],
        })
      ).statusCode,
    ).toBe(403);
    expect(await ownProperty()).toEqual(before);
    expect(
      (await request("GET", "/properties", outsider)).json().properties,
    ).toEqual([]);
    expect(
      (await request("GET", "/account/export", outsider)).json().properties,
    ).toEqual([]);
    expect(
      (await request("GET", "/account/export", tenant)).json().properties,
    ).toEqual([]);
  });

  it("returns public home facts in discovery and pending offers without changing candidate compatibility", async () => {
    await edit({ amenities: [], ...address });
    const initial = await request("GET", `/discover/${property.id}`, landlord);
    expect(initial.statusCode).toBe(200);
    expect(initial.json().profiles).toHaveLength(1);
    const originalCompatibility = initial.json().profiles[0].compatibility;
    expect(originalCompatibility.compatible).toBe(true);
    await edit({ amenities, amenities_details: amenitiesDetails });
    const discovery = await request(
      "GET",
      `/discover/${property.id}`,
      landlord,
    );
    expect(discovery.statusCode).toBe(200);
    expect(discovery.json().property).toMatchObject({
      amenities,
      amenities_details: amenitiesDetails,
    });
    expect(discovery.json().profiles[0].compatibility).toEqual(
      originalCompatibility,
    );
    expect(discovery.json().profiles[0]).not.toHaveProperty("amenities");
    expect(discovery.json().profiles[0]).not.toHaveProperty(
      "amenities_details",
    );
    expect(discovery.json().profiles[0]).not.toHaveProperty(
      "accessibility_needs",
    );
    expectAddressPrivate(discovery.body);
    const id = await send();
    expect(await snapshot(id)).toMatchObject({
      amenities,
      amenities_details: amenitiesDetails,
    });
    for (const actor of [tenant, landlord]) {
      const response = await readInvitation(id, actor),
        offer = response.json().invitation;
      expect(offer.property).toMatchObject({
        amenities,
        amenities_details: amenitiesDetails,
      });
      expect(offer.property_snapshot).toMatchObject({
        amenities,
        amenities_details: amenitiesDetails,
      });
      expectAddressPrivate(response.body);
      expect(
        (await request("GET", "/invitations", actor)).json().invitations[0]
          .property,
      ).toMatchObject({ amenities, amenities_details: amenitiesDetails });
    }
    expect(
      (await request("GET", `/invitations/${id}`, outsider)).statusCode,
    ).toBe(404);
    expect(
      JSON.stringify((await db.query("SELECT * FROM audit_log")).rows),
    ).not.toContain(amenitiesDetails);
    expect(
      JSON.stringify((await db.query("SELECT * FROM events")).rows),
    ).not.toContain(amenitiesDetails);
  });

  it.each(["accepted", "closed"] as const)(
    "preserves the original amenities for an %s contact after later owner edits",
    async (status) => {
      await edit({
        amenities,
        amenities_details: amenitiesDetails,
        ...address,
        address_visibility: "exact",
      });
      const id = await send();
      await accept(id);
      if (status === "closed")
        expect(
          (
            await request("POST", `/invitations/${id}/action`, tenant, {
              action: "close",
            })
          ).statusCode,
        ).toBe(200);
      const original = await snapshot(id);
      const updated = {
        amenities: ["garage", "dishwasher"],
        amenities_details: "Dotazioni sintetiche aggiornate dopo l'invito.",
      };
      await edit({ ...updated, address_visibility: "area" });
      for (const actor of [tenant, landlord]) {
        const response = await readInvitation(id, actor),
          offer = response.json().invitation;
        expect(offer).toMatchObject({ status, property_changed: true });
        expect(offer.property).toMatchObject({
          amenities,
          amenities_details: amenitiesDetails,
        });
        expect(offer.property_snapshot).toMatchObject({
          amenities,
          amenities_details: amenitiesDetails,
        });
        expect(response.body).not.toContain(updated.amenities_details);
        expectAddressPrivate(response.body);
      }
      expect(await snapshot(id)).toEqual(original);
      expect(await ownProperty()).toMatchObject(updated);
      expect(
        (await request("GET", "/account/export", landlord)).json()
          .properties[0],
      ).toMatchObject(updated);
      const tenantExport = await request("GET", "/account/export", tenant);
      expect(tenantExport.json().invitations[0]).not.toHaveProperty(
        "property_snapshot",
      );
      expect(tenantExport.body).not.toContain(amenitiesDetails);
      expect(tenantExport.body).not.toContain(updated.amenities_details);
    },
  );

  it("keeps historical offers without amenity fields empty instead of showing current owner choices", async () => {
    const id = await send();
    await accept(id);
    await db.query(
      "UPDATE invitations SET property_snapshot=property_snapshot - 'amenities' - 'amenities_details' WHERE id=$1",
      [id],
    );
    const original = await snapshot(id);
    expect(original).not.toHaveProperty("amenities");
    await edit({ amenities, amenities_details: amenitiesDetails });
    for (const actor of [tenant, landlord]) {
      const response = await readInvitation(id, actor),
        offer = response.json().invitation;
      expect(offer.property).toMatchObject({
        amenities: [],
        amenities_details: "",
      });
      expect(offer.property_snapshot).toMatchObject({
        amenities: [],
        amenities_details: "",
      });
      expect(response.body).not.toContain(amenitiesDetails);
    }
    expect(await snapshot(id)).toEqual(original);
  });

  it("cancels pending offers after a valid amenity update without rewriting their stored facts", async () => {
    await edit({ amenities, amenities_details: amenitiesDetails });
    const id = await send(),
      original = await snapshot(id),
      revision = property.revision;
    await edit({
      amenities: ["washing_machine"],
      amenities_details: "Nuovi dettagli sintetici.",
    });
    expect(property.revision).toBe(revision + 1);
    const invitation = (await readInvitation(id)).json().invitation;
    expect(invitation.status).toBe("cancelled");
    expect(invitation.property_snapshot).toMatchObject({
      amenities,
      amenities_details: amenitiesDetails,
    });
    expect(await snapshot(id)).toEqual(original);
    expect(
      (
        await request("POST", `/invitations/${id}/action`, tenant, {
          action: "accept",
          property_revision: revision,
          profile_revision: profile.revision,
        })
      ).statusCode,
    ).toBe(409);
  });
});

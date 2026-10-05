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
  throw new Error("Property-address tests require isolated local soglia_test.");

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
  description:
    "Immobile sintetico per verificare la condivisione dell'indirizzo.",
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
const address = { street: "Via Prova Sintetica", street_number: "12/B" };
const exactAddress = { ...address, address_visibility: "exact" };
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
function expectNoAddress(body: string) {
  expect(body).not.toContain(address.street);
  expect(body).not.toContain(address.street_number);
  expect(body).not.toContain('"street"');
  expect(body).not.toContain('"street_number"');
  expect(body).not.toContain('"address_visibility"');
  expect(body).not.toContain('"address_contact_allowed"');
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
    throw new Error("Unsafe effective property-address test connection.");
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
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'published',now()) RETURNING *",
      [tenant.id],
    )
  ).rows[0];
  property = await create();
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("optional property address and owner-controlled sharing", () => {
  it("defaults old payloads and directly inserted legacy properties to zone-only sharing", async () => {
    expect(property).toMatchObject({
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
      street: "",
      street_number: "",
      address_visibility: "area",
      revision: 1,
      status: "draft",
    });
    const response = await request("GET", `/discover/${property.id}`, landlord);
    expect(response.statusCode).toBe(200);
    expectNoAddress(JSON.stringify(response.json().property));
  });

  it("creates and exports trimmed precise addresses while keeping zone-only sharing by default", async () => {
    const saved = await create({
      street: ` ${address.street} `,
      street_number: ` ${address.street_number} `,
    });
    expect(saved).toMatchObject({ ...address, address_visibility: "area" });
    expect(await ownProperty(saved.id)).toMatchObject({
      ...address,
      address_visibility: "area",
    });
    const exported = await request("GET", "/account/export", landlord);
    expect(exported.statusCode).toBe(200);
    expect(
      exported.json().properties.find((p: any) => p.id === saved.id),
    ).toMatchObject({ ...address, address_visibility: "area" });
    expect(
      (await request("GET", "/properties", outsider)).json().properties,
    ).toEqual([]);
    expect(
      (await request("GET", "/account/export", tenant)).json().properties,
    ).toEqual([]);
  });

  it("preserves each omitted address field on old edits and allows explicit independent changes", async () => {
    await edit(exactAddress);
    const previous = property;
    expect(await edit({ rent: 900 })).toMatchObject({
      ...exactAddress,
      rent: 900,
      revision: previous.revision + 1,
    });
    expect(await edit({ street_number: "14/A" })).toMatchObject({
      ...exactAddress,
      street_number: "14/A",
    });
    expect(await edit({ street: "Via Altro Esempio" })).toMatchObject({
      street: "Via Altro Esempio",
      street_number: "14/A",
      address_visibility: "exact",
    });
    expect(await edit({ address_visibility: "area" })).toMatchObject({
      street: "Via Altro Esempio",
      street_number: "14/A",
      address_visibility: "area",
    });
    expect(await edit({ street: "", street_number: "" })).toMatchObject({
      street: "",
      street_number: "",
      address_visibility: "area",
    });
  });

  it("rejects malformed precise-address creations without inserting any property", async () => {
    const count = Number(
      (await db.query("SELECT count(*) FROM properties")).rows[0].count,
    );
    const invalid = [
      { address_visibility: "exact" },
      { address_visibility: "exact", street: address.street },
      { address_visibility: "exact", street_number: address.street_number },
      { ...exactAddress, street: " " },
      { ...exactAddress, street_number: " " },
      { ...exactAddress, street: "A" },
      { street: "x".repeat(121) },
      { street_number: "x".repeat(21) },
      { street: "Via\nProva" },
      { street_number: "12\tB" },
      { street: "Via\u007fProva" },
      { street: "Via\u0085Prova" },
      { street: null },
      { street_number: null },
      { address_visibility: null },
      { address_visibility: "public" },
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

  it("validates a merged edit atomically before changing revision or cancelling pending invitations", async () => {
    await edit(exactAddress);
    const id = await send(),
      before = await ownProperty();
    const invalid = [
      { street: "" },
      { street_number: "" },
      { street: "A" },
      { street: "x".repeat(121) },
      { street_number: "x".repeat(21) },
      { street: "Via\rProva" },
      { street_number: "12\nB" },
      { street: null },
      { street_number: null },
      { address_visibility: null },
      { address_visibility: "public" },
      { unknown_field: true },
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
    expect(
      (
        await request("PUT", `/properties/${property.id}`, outsider, {
          ...baseProperty,
          ...exactAddress,
        })
      ).statusCode,
    ).toBe(404);
    expect(await ownProperty()).toEqual(before);
    await accept(id);
  });

  it("requires both address parts after merging when an old zone-only property switches to exact", async () => {
    const before = await ownProperty();
    for (const patch of [
      { address_visibility: "exact" },
      { address_visibility: "exact", street: address.street },
    ]) {
      expect(
        (
          await request("PUT", `/properties/${property.id}`, landlord, {
            ...baseProperty,
            ...patch,
          })
        ).statusCode,
      ).toBe(400);
      expect(await ownProperty()).toEqual(before);
    }
    await edit({ ...address });
    expect(await edit({ address_visibility: "exact" })).toMatchObject(
      exactAddress,
    );
    expect(
      await edit({ address_visibility: "area", street: "", street_number: "" }),
    ).toMatchObject({
      street: "",
      street_number: "",
      address_visibility: "area",
    });
  });

  it("enforces trim, size, control-character and exact-address checks in the database", async () => {
    await edit(exactAddress);
    const before = await ownProperty();
    const invalid = [
      { column: "street", value: "A", code: "23514" },
      { column: "street", value: "x".repeat(121), code: "23514" },
      { column: "street", value: " Via Prova", code: "23514" },
      { column: "street", value: "Via Prova ", code: "23514" },
      { column: "street", value: "Via\nProva", code: "23514" },
      { column: "street", value: "Via\u007fProva", code: "23514" },
      { column: "street", value: "Via\u0085Prova", code: "23514" },
      { column: "street", value: "", code: "23514" },
      { column: "street", value: null, code: "23502" },
      { column: "street_number", value: "", code: "23514" },
      { column: "street_number", value: " 12", code: "23514" },
      { column: "street_number", value: "12\tA", code: "23514" },
      { column: "street_number", value: "x".repeat(21), code: "23514" },
      { column: "street_number", value: null, code: "23502" },
      { column: "address_visibility", value: "public", code: "23514" },
      { column: "address_visibility", value: null, code: "23502" },
    ];
    for (const { column, value, code } of invalid) {
      await expect(
        db.query(`UPDATE properties SET ${column}=$2 WHERE id=$1`, [
          property.id,
          value,
        ]),
      ).rejects.toMatchObject({ code });
      expect(await ownProperty()).toEqual(before);
    }
  });

  it("keeps a stored private address out of discovery, invitations and stored area-only snapshots", async () => {
    await edit(address);
    const discovery = await request(
      "GET",
      `/discover/${property.id}`,
      landlord,
    );
    expect(discovery.statusCode).toBe(200);
    expectNoAddress(discovery.body);
    const id = await send();
    expectNoAddress(JSON.stringify(await snapshot(id)));
    for (const actor of [tenant, landlord]) {
      expectNoAddress((await readInvitation(id, actor)).body);
      expectNoAddress((await request("GET", "/invitations", actor)).body);
    }
    await accept(id);
    expectNoAddress((await readInvitation(id)).body);
    expect(await ownProperty()).toMatchObject(address);
  });

  it("shares exact addresses for a valid pending invitation without leaking internal flags", async () => {
    await edit(exactAddress);
    const discovery = await request(
      "GET",
      `/discover/${property.id}`,
      landlord,
    );
    expect(discovery.json().property).toMatchObject(exactAddress);
    expect(discovery.json().profiles).toHaveLength(1);
    expectNoAddress(JSON.stringify(discovery.json().profiles));
    const id = await send();
    expect(await snapshot(id)).toMatchObject(exactAddress);
    for (const actor of [tenant, landlord]) {
      const response = await readInvitation(id, actor);
      expect(response.json().invitation.property).toMatchObject(exactAddress);
      expect(response.json().invitation.property_snapshot).toMatchObject(
        exactAddress,
      );
      expect(response.body).not.toContain("address_contact_allowed");
      expect(
        (await request("GET", "/invitations", actor)).json().invitations[0]
          .property,
      ).toMatchObject(exactAddress);
    }
    expect(
      (await request("GET", `/invitations/${id}`, outsider)).statusCode,
    ).toBe(404);
    expect(
      (await request("GET", `/discover/${property.id}`, outsider)).statusCode,
    ).toBe(400);
    expectNoAddress(
      JSON.stringify((await db.query("SELECT * FROM audit_log")).rows),
    );
    expectNoAddress(
      JSON.stringify((await db.query("SELECT * FROM events")).rows),
    );
  });

  it.each([
    "declined",
    "withdrawn",
    "cancelled",
    "expired",
    "unavailable",
  ] as const)(
    "redacts both the live property and raw snapshot when an invitation is %s",
    async (status) => {
      await edit(exactAddress);
      const id = await send();
      if (status === "declined" || status === "withdrawn")
        expect(
          (
            await request(
              "POST",
              `/invitations/${id}/action`,
              status === "declined" ? tenant : landlord,
              { action: status === "declined" ? "decline" : "withdraw" },
            )
          ).statusCode,
        ).toBe(200);
      else if (status === "cancelled") await edit({ rent: 900 });
      else if (status === "expired")
        await db.query(
          "UPDATE invitations SET expires_at=now()-interval '1 second' WHERE id=$1",
          [id],
        );
      else
        await db.query(
          "UPDATE properties SET published_at=now()-interval '31 days' WHERE id=$1",
          [property.id],
        );
      expect(await snapshot(id)).toMatchObject(exactAddress);
      for (const actor of [tenant, landlord]) {
        const response = await readInvitation(id, actor);
        expect(response.json().invitation.status).toBe(status);
        expectNoAddress(response.body);
        expectNoAddress((await request("GET", "/invitations", actor)).body);
      }
    },
  );

  it.each(["accepted", "closed"] as const)(
    "preserves the originally shared address for an %s contact and honors later hiding",
    async (status) => {
      await edit(exactAddress);
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
      const newAddress = { street: "Via Nuova Sintetica", street_number: "99" };
      await edit(newAddress);
      for (const actor of [tenant, landlord]) {
        const response = await readInvitation(id, actor);
        const item = response.json().invitation;
        expect(item).toMatchObject({ status, property_changed: true });
        expect(item.property).toMatchObject(exactAddress);
        expect(item.property_snapshot).toMatchObject(exactAddress);
        expect(response.body).not.toContain(newAddress.street);
      }
      await edit({ address_visibility: "area" });
      for (const actor of [tenant, landlord]) {
        expectNoAddress((await readInvitation(id, actor)).body);
        expectNoAddress((await request("GET", "/invitations", actor)).body);
      }
      expect(await snapshot(id)).toEqual(original);
      expect(await ownProperty()).toMatchObject({
        ...newAddress,
        address_visibility: "area",
      });
      await edit({ address_visibility: "exact" });
      const restored = await readInvitation(id);
      expect(restored.json().invitation.property).toMatchObject(exactAddress);
      expect(restored.json().invitation.property_snapshot).toMatchObject(
        exactAddress,
      );
      expect(restored.body).not.toContain(newAddress.street);
      expect(await snapshot(id)).toEqual(original);
      const chat = await request("GET", `/conversations/${id}`, tenant);
      expect(chat.statusCode).toBe(200);
      expectNoAddress(chat.body);
      const tenantExport = await request("GET", "/account/export", tenant);
      expectNoAddress(tenantExport.body);
      expect(tenantExport.json().invitations[0]).not.toHaveProperty(
        "property_snapshot",
      );
      expect(
        (await request("GET", "/account/export", landlord)).json()
          .properties[0],
      ).toMatchObject({ ...newAddress, address_visibility: "exact" });
    },
  );

  it("never adds a later exact address to an accepted offer originally shared as a zone", async () => {
    await edit(address);
    const id = await send();
    await accept(id);
    const original = await snapshot(id);
    expectNoAddress(JSON.stringify(original));
    await edit({ address_visibility: "exact" });
    for (const actor of [tenant, landlord])
      expectNoAddress((await readInvitation(id, actor)).body);
    expect(await snapshot(id)).toEqual(original);
  });

  it("redacts an address in a historical raw snapshot when the current policy is zone-only", async () => {
    const id = await send();
    await accept(id);
    await db.query(
      "UPDATE invitations SET property_snapshot=property_snapshot || $2::jsonb WHERE id=$1",
      [
        id,
        JSON.stringify({
          ...exactAddress,
          owner_id: landlord.id,
          internal_note: "PRIVATE-SNAPSHOT-EXTRA",
        }),
      ],
    );
    for (const actor of [tenant, landlord]) {
      const response = await readInvitation(id, actor);
      expectNoAddress(response.body);
      expect(response.body).not.toContain("PRIVATE-SNAPSHOT-EXTRA");
      expect(response.json().invitation.property_snapshot).not.toHaveProperty(
        "owner_id",
      );
    }
  });

  it.each(["tenant", "landlord"] as const)(
    "hides addresses from both parties after the %s blocks an accepted contact",
    async (role) => {
      await edit(exactAddress);
      const id = await send();
      await accept(id);
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
        expectNoAddress((await readInvitation(id, actor)).body);
        expectNoAddress((await request("GET", "/invitations", actor)).body);
      }
      expect(await ownProperty()).toMatchObject(exactAddress);
    },
  );

  it.each(["tenant", "landlord"] as const)(
    "hides both address representations when the %s is suspended",
    async (role) => {
      await edit(exactAddress);
      const id = await send();
      await accept(id);
      const suspended = role === "tenant" ? tenant : landlord;
      const active = role === "tenant" ? landlord : tenant;
      await db.query("UPDATE users SET suspended=true WHERE id=$1", [
        suspended.id,
      ]);
      expectNoAddress((await readInvitation(id, active)).body);
      expectNoAddress((await request("GET", "/invitations", active)).body);
      expect(
        (await request("GET", `/invitations/${id}`, suspended)).statusCode,
      ).toBe(423);
    },
  );

  it("shares exact addresses inside a synthetic workspace and redacts forged cross-workspace snapshots", async () => {
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
      expect(
        (
          await hostedRequest(first, "POST", "/auth/preview", {
            role: "tenant",
          })
        ).statusCode,
      ).toBe(200);
      const ownTenant = (await hostedRequest(first, "GET", "/session")).json()
        .user;
      const ownProfile = (await hostedRequest(first, "GET", "/profile")).json()
        .profile;
      expect(
        (
          await hostedRequest(first, "POST", "/auth/preview", {
            role: "landlord",
          })
        ).statusCode,
      ).toBe(200);
      const ownLandlord = (await hostedRequest(first, "GET", "/session")).json()
        .user;
      const p = (await hostedRequest(first, "GET", "/properties")).json()
        .properties[0];
      const editBody = {
        title: p.title,
        city: p.city,
        area: p.area,
        description: p.description,
        rent: p.rent,
        available_from: p.available_from,
        min_months: p.min_months,
        max_months: p.max_months,
        capacity: p.capacity,
        sqm: p.sqm,
        rooms: p.rooms,
        furnished: p.furnished,
        authority_attested: p.authority_attested,
        contract_type: p.contract_type,
        ...exactAddress,
      };
      expect(
        (await hostedRequest(first, "PUT", `/properties/${p.id}`, editBody))
          .statusCode,
      ).toBe(200);
      const current = (await hostedRequest(first, "GET", "/properties")).json()
        .properties[0];
      const sent = await hostedRequest(first, "POST", "/invitations", {
        property_id: p.id,
        tenant_id: ownTenant.id,
        property_revision: current.revision,
        profile_revision: ownProfile.revision,
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
      expect(
        (await hostedRequest(first, "GET", `/invitations/${id}`)).json()
          .invitation.property,
      ).toMatchObject(exactAddress);
      expect(
        (
          await hostedRequest(first, "POST", `/invitations/${id}/action`, {
            action: "accept",
            property_revision: current.revision,
            profile_revision: ownProfile.revision,
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (await hostedRequest(first, "GET", `/invitations/${id}`)).json()
          .invitation.property_snapshot,
      ).toMatchObject(exactAddress);
      expect(
        (
          await hostedRequest(second, "POST", "/auth/preview", {
            role: "tenant",
          })
        ).statusCode,
      ).toBe(200);
      const otherTenant = (
        await hostedRequest(second, "GET", "/session")
      ).json().user;
      const otherProfile = (
        await hostedRequest(second, "GET", "/profile")
      ).json().profile;
      expect(
        (await hostedRequest(second, "GET", `/invitations/${id}`)).statusCode,
      ).toBe(404);
      const forged = (
        await db.query(
          "INSERT INTO invitations(property_id,tenant_id,landlord_id,property_revision,profile_revision,property_snapshot,status,accepted_at) VALUES($1,$2,$3,$4,$5,$6,'accepted',now()) RETURNING id",
          [
            current.id,
            otherTenant.id,
            ownLandlord.id,
            current.revision,
            otherProfile.revision,
            JSON.stringify(current),
          ],
        )
      ).rows[0];
      for (const status of ["pending", "accepted", "closed"]) {
        await db.query("UPDATE invitations SET status=$2 WHERE id=$1", [
          forged.id,
          status,
        ]);
        const response = await hostedRequest(
          second,
          "GET",
          `/invitations/${forged.id}`,
        );
        expect(response.statusCode).toBe(200);
        expectNoAddress(response.body);
        expectNoAddress(
          (await hostedRequest(second, "GET", "/invitations")).body,
        );
      }
      const exported = await hostedRequest(second, "GET", "/account/export");
      expectNoAddress(exported.body);
      expect(exported.json().properties).toEqual([]);
    } finally {
      await hosted.close();
    }
  });
});

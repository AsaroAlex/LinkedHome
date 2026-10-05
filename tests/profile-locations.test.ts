import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { buildApp } from "../server/app";
import { digest, token } from "../server/auth";
import { makePool } from "../server/db";
import { migrate } from "../scripts/migrate";
import { cities, searchLocations } from "../shared/locations";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search !== "" ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error("Profile-location tests require isolated local soglia_test.");

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
const multiCity = [
  { city: "Bologna", areas: ["Centro storico", "Saragozza"] },
  { city: "Milano", areas: [] },
];
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
    secret = token(),
    displayName = "Nome sintetico privato";
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
async function discover(after?: string) {
  const response = await request(
    "GET",
    `/discover/${property.id}${after ? `?after=${after}` : ""}`,
    landlord,
  );
  expect(response.statusCode).toBe(200);
  return response.json();
}
function invitationPayload(profile: any, offeredProperty = property) {
  return {
    property_id: offeredProperty.id,
    tenant_id: tenant.id,
    property_revision: offeredProperty.revision,
    profile_revision: profile.revision,
  };
}
async function send(profile: any, offeredProperty = property) {
  const response = await request(
    "POST",
    "/invitations",
    landlord,
    invitationPayload(profile, offeredProperty),
  );
  expect(response.statusCode).toBe(201);
  return response.json().id as string;
}
function accept(id: string, profile: any) {
  return request("POST", `/invitations/${id}/action`, tenant, {
    action: "accept",
    property_revision: property.revision,
    profile_revision: profile.revision,
  });
}
async function status(id: string) {
  return (await db.query("SELECT status FROM invitations WHERE id=$1", [id]))
    .rows[0].status;
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
    throw new Error("Unsafe effective profile-location test connection.");
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
      "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) VALUES($1,'Casa sintetica','Bologna','Saragozza','Una casa per verificare città e zone.',850,'2028-01-01',6,36,2,65,3,true,true,'published',now()) RETURNING *",
      [landlord.id],
    )
  ).rows[0];
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("multiple profile cities and neighbourhoods", () => {
  it("saves, reloads and exports canonical locations, including a changed primary city", async () => {
    const saved = await save({ locations: multiCity });
    expect(saved).toMatchObject({ city: "Bologna", locations: multiCity });
    expect(
      (
        await db.query("SELECT locations FROM profiles WHERE user_id=$1", [
          tenant.id,
        ])
      ).rows[0].locations,
    ).toEqual(multiCity);
    expect(
      (await request("GET", "/account/export", tenant)).json().profile[0]
        .locations,
    ).toEqual(multiCity);
    const reordered = [multiCity[1], multiCity[0]];
    expect(await save({ city: "Milano", locations: reordered })).toMatchObject({
      city: "Milano",
      locations: reordered,
      revision: saved.revision + 1,
    });
    expect((await ownProfile()).locations).toEqual(reordered);
  });

  it("preserves omitted locations on a legacy edit and resets them when the legacy city changes", async () => {
    await save({ locations: multiCity });
    expect(await save({ budget: 1200 })).toMatchObject({
      locations: multiCity,
      budget: 1200,
    });
    const changed = await save({ city: "Torino" });
    expect(changed.city).toBe("Torino");
    expect(changed.locations).toBeNull();
    expect(searchLocations(changed)).toEqual([{ city: "Torino", areas: [] }]);
    expect((await save({ city: "Torino", budget: 1300 })).locations).toBeNull();
    expect(
      await save({
        city: "Torino",
        locations: [{ city: "Torino", areas: ["Crocetta"] }],
      }),
    ).toMatchObject({
      city: "Torino",
      locations: [{ city: "Torino", areas: ["Crocetta"] }],
    });
  });

  it("keeps old single-city rows unchanged and accepts old profile payloads", async () => {
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'published')",
      [tenant.id],
    );
    expect((await ownProfile()).locations).toBeNull();
    const legacy = await discover();
    expect(legacy.profiles).toHaveLength(1);
    expect(legacy.profiles[0]).toMatchObject({
      locations: [{ city: "Bologna", areas: [] }],
      compatibility: { compatible: true },
    });
    expect((await save()).locations).toBeNull();
    const fresh = await person("tenant");
    expect(
      (await request("PUT", "/profile", fresh, preferences)).statusCode,
    ).toBe(200);
    expect(
      (await request("GET", "/profile", fresh)).json().profile.locations,
    ).toBeNull();
  });

  it("rejects invalid locations atomically without changing a profile or pending invite", async () => {
    const profile = await save({ locations: multiCity }, true);
    const id = await send(profile);
    const before = (
      await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id])
    ).rows[0];
    const invalid = [
      null,
      [],
      {},
      [{ city: "Napoli", areas: [] }],
      [{ city: "Bologna" }],
      [{ city: "Bologna", areas: null }],
      [{ city: "Bologna", areas: "Saragozza" }],
      [{ city: "Bologna", areas: ["Zona non censita"] }],
      [{ city: "Bologna", areas: ["Navigli"] }],
      [{ city: "Bologna", areas: ["Saragozza", "Saragozza"] }],
      [{ city: "Bologna", areas: ["Centro"] }],
      [{ city: "Bologna", areas: Array(21).fill("Saragozza") }],
      [{ city: "Bologna", areas: [], note: "free text" }],
      [{ city: "Milano", areas: [] }],
      [
        { city: "Bologna", areas: [] },
        { city: "Bologna", areas: ["Saragozza"] },
      ],
      [
        ...cities.map((city) => ({ city, areas: [] })),
        { city: "Bologna", areas: [] },
      ],
    ];
    for (const locations of invalid) {
      expect(
        (
          await request("PUT", "/profile", tenant, {
            ...preferences,
            locations,
          })
        ).statusCode,
        JSON.stringify(locations),
      ).toBe(400);
      expect(
        (await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id]))
          .rows[0],
      ).toEqual(before);
      expect(await status(id)).toBe("pending");
    }
    expect((await accept(id, profile)).statusCode).toBe(200);
  });

  it("enforces a nonempty bounded JSON array in the database while allowing legacy null", async () => {
    await save();
    for (const invalid of [
      {},
      [],
      Array(7).fill({ city: "Bologna", areas: [] }),
    ])
      await expect(
        db.query("UPDATE profiles SET locations=$2::jsonb WHERE user_id=$1", [
          tenant.id,
          JSON.stringify(invalid),
        ]),
      ).rejects.toMatchObject({
        code: "23514",
        constraint: "profiles_locations",
      });
    expect((await ownProfile()).locations).toBeNull();
    expect(
      (await save({ locations: cities.map((city) => ({ city, areas: [] })) }))
        .locations,
    ).toHaveLength(6);
  });

  it("matches a secondary city and applies zones independently to each selected city", async () => {
    await save(
      {
        city: "Milano",
        locations: [
          { city: "Milano", areas: ["Navigli"] },
          { city: "Bologna", areas: ["Saragozza"] },
        ],
      },
      true,
    );
    expect((await discover()).profiles[0]).toMatchObject({
      city: "Milano",
      compatibility: { compatible: true },
    });
    await db.query(
      "UPDATE properties SET city='Milano',area='Navigli' WHERE id=$1",
      [property.id],
    );
    expect((await discover()).profiles).toHaveLength(1);
    await db.query("UPDATE properties SET area='Brera' WHERE id=$1", [
      property.id,
    ]);
    expect((await discover()).profiles).toEqual([]);
    await db.query(
      "UPDATE properties SET city='Torino',area='Centro' WHERE id=$1",
      [property.id],
    );
    expect((await discover()).profiles).toEqual([]);
  });

  it("accepts canonical property aliases but excludes other and unknown zones from discovery and invite creation", async () => {
    const profile = await save(
      {
        locations: [{ city: "Bologna", areas: ["Centro storico"] }],
      },
      true,
    );
    await db.query("UPDATE properties SET area='  CENTRO  ' WHERE id=$1", [
      property.id,
    ]);
    const visible = await discover();
    expect(visible.profiles).toHaveLength(1);
    expect(visible.profiles[0].compatibility.compatible).toBe(true);
    for (const area of ["Saragozza", "Zona non censita"]) {
      await db.query("UPDATE properties SET area=$2 WHERE id=$1", [
        property.id,
        area,
      ]);
      expect((await discover()).profiles).toEqual([]);
      const denied = await request(
        "POST",
        "/invitations",
        landlord,
        invitationPayload(profile),
      );
      expect(denied.statusCode).toBe(409);
      expect(denied.json().error).toBe("Preferenze non compatibili.");
    }
    expect(
      (await db.query("SELECT count(*)::int AS count FROM invitations")).rows[0]
        .count,
    ).toBe(0);
  });

  it("matches an unknown property zone only when the selected city has no zone restriction", async () => {
    await save({ locations: [{ city: "Bologna", areas: [] }] }, true);
    await db.query("UPDATE properties SET area='Una zona libera' WHERE id=$1", [
      property.id,
    ]);
    expect((await discover()).profiles[0].compatibility.compatible).toBe(true);
    await save({ locations: [{ city: "Bologna", areas: ["Saragozza"] }] });
    expect((await discover()).profiles).toEqual([]);
  });

  it("filters secondary cities and zones before page limits and stable cursors", async () => {
    const ids = Array.from({ length: 80 }, () => randomUUID());
    await db.query(
      "INSERT INTO users(id,email,password_hash,display_name,role,email_verified) SELECT id,id::text||'@example.test','test-only-disabled','Candidato sintetico','tenant',true FROM unnest($1::uuid[]) AS id",
      [ids],
    );
    const ordered = (
      await db.query(
        "SELECT id,md5(id::text||$2::text) AS sort_key FROM users WHERE id=ANY($1::uuid[]) ORDER BY md5(id::text||$2::text),id",
        [ids, property.id],
      )
    ).rows;
    const matching = ordered.slice(30, 56);
    const selected = new Set(matching.map((row) => row.id));
    const locations = ids.map((id) =>
      JSON.stringify([
        { city: "Milano", areas: [] },
        {
          city: "Bologna",
          areas: [selected.has(id) ? "Saragozza" : "Bolognina"],
        },
      ]),
    );
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,locations) SELECT id,'Milano',1100,'2028-01-15',12,2,'published',locations FROM unnest($1::uuid[],$2::jsonb[]) AS candidate(id,locations)",
      [ids, locations],
    );
    const first = await discover();
    expect(first.profiles.map((row: any) => row.id)).toEqual(
      matching.slice(0, 24).map((row) => row.id),
    );
    expect(
      first.profiles.every((row: any) => row.compatibility.compatible),
    ).toBe(true);
    expect(first.hasMore).toBe(true);
    expect(first.nextCursor).toBe(
      `${matching[23].sort_key}:${matching[23].id}`,
    );
    const second = await discover(first.nextCursor);
    expect(second.profiles.map((row: any) => row.id)).toEqual(
      matching.slice(24).map((row) => row.id),
    );
    expect(second.hasMore).toBe(false);
    expect(second.nextCursor).toBeNull();
  });

  it("uses the same secondary-city and zone match when inviting and accepting", async () => {
    const profile = await save(
      {
        city: "Milano",
        locations: [
          { city: "Milano", areas: [] },
          { city: "Bologna", areas: ["Saragozza"] },
        ],
      },
      true,
    );
    expect((await discover()).profiles[0].compatibility.compatible).toBe(true);
    const id = await send(profile);
    const pending = (await request("GET", `/invitations/${id}`, tenant)).json()
      .invitation;
    expect(pending.compatibility.compatible).toBe(true);
    expect((await accept(id, profile)).statusCode).toBe(200);
    expect(await status(id)).toBe("accepted");
  });

  it("rechecks zones on acceptance even when a stale stored invitation has matching revision numbers", async () => {
    const profile = await save(
      { locations: [{ city: "Bologna", areas: ["Saragozza"] }] },
      true,
    );
    const id = await send(profile);
    // Deliberately bypass the normal property save, which would increment its
    // revision and cancel this invitation, to exercise the final match gate.
    await db.query("UPDATE properties SET area='Bolognina' WHERE id=$1", [
      property.id,
    ]);
    expect(
      (await request("GET", `/invitations/${id}`, tenant)).json().invitation
        .compatibility.compatible,
    ).toBe(false);
    const denied = await accept(id, profile);
    expect(denied.statusCode).toBe(409);
    expect(denied.json().error).toBe("Preferenze non più compatibili.");
    expect(await status(id)).toBe("pending");
  });

  it("cancels pending invitations on location edits while retaining accepted conversations", async () => {
    const profile = await save({ locations: multiCity }, true);
    const accepted = await send(profile);
    expect((await accept(accepted, profile)).statusCode).toBe(200);
    const otherProperty = (
      await db.query(
        "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) SELECT owner_id,'Altra casa sintetica',city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at FROM properties WHERE id=$1 RETURNING *",
        [property.id],
      )
    ).rows[0];
    const pending = await send(profile, otherProperty);
    const changed = await save({
      locations: [{ city: "Bologna", areas: ["Bolognina"] }],
    });
    expect(changed.revision).toBe(profile.revision + 1);
    expect(await status(pending)).toBe("cancelled");
    expect(await status(accepted)).toBe("accepted");
    expect((await accept(pending, profile)).statusCode).toBe(409);
    expect(
      (
        await request("POST", `/conversations/${accepted}/messages`, tenant, {
          body: "Messaggio sintetico dopo il cambio delle zone.",
        })
      ).statusCode,
    ).toBe(201);
  });

  it("publishes only structured location choices and keeps names, email, private text and photos out of discovery", async () => {
    const privateText =
      "Una presentazione sintetica da non pubblicare in scoperta.";
    await save(
      { locations: multiCity, about: privateText, pets_details: privateText },
      true,
    );
    const photoId = randomUUID();
    await db.query(
      "INSERT INTO profile_photos(id,user_id,object_key,width,height,byte_size) VALUES($1,$2,'private-location-test.webp',10,10,100)",
      [photoId, tenant.id],
    );
    const response = await request("GET", `/discover/${property.id}`, landlord);
    expect(response.statusCode).toBe(200);
    expect(response.json().profiles[0].locations).toEqual(multiCity);
    for (const hidden of [
      tenant.email,
      tenant.displayName,
      privateText,
      photoId,
      "private-location-test.webp",
      "profile-photos",
    ])
      expect(response.body).not.toContain(hidden);
    expect(
      (await request("GET", `/discover/${property.id}`, outsider)).statusCode,
    ).toBe(400);
    expect((await request("GET", `/discover/${property.id}`)).statusCode).toBe(
      401,
    );
    expect(
      (await request("GET", "/profile", outsider)).json().profile,
    ).toBeNull();
  });

  it("keeps legacy preview seed searches working and new locations inside their workspace", async () => {
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
    async function previewRequest(
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
          cookie: [...jar].map(([key, value]) => `${key}=${value}`).join("; "),
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
            await previewRequest(jar, "POST", "/auth/preview", {
              role: "tenant",
            })
          ).statusCode,
        ).toBe(200);
      const own = (await previewRequest(first, "GET", "/profile")).json()
        .profile;
      const other = (await previewRequest(second, "GET", "/profile")).json()
        .profile;
      expect(own.locations).toBeNull();
      expect(other.locations).toBeNull();
      const allCities = cities.map((city) => ({ city, areas: [] }));
      expect(
        (
          await previewRequest(first, "PUT", "/profile", {
            city: own.city,
            budget: own.budget,
            move_in: own.move_in,
            duration: own.duration,
            occupants: own.occupants,
            locations: allCities,
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (await previewRequest(second, "GET", "/profile")).json().profile
          .locations,
      ).toBeNull();
      expect(
        (
          await previewRequest(first, "POST", "/auth/preview", {
            role: "landlord",
          })
        ).statusCode,
      ).toBe(200);
      const offered = (await previewRequest(first, "GET", "/properties")).json()
        .properties[0];
      const discovery = await previewRequest(
        first,
        "GET",
        `/discover/${offered.id}`,
      );
      expect(discovery.statusCode).toBe(200);
      expect(discovery.json().profiles).toHaveLength(1);
      expect(discovery.json().profiles[0]).toMatchObject({
        id: own.user_id,
        locations: allCities,
        compatibility: { compatible: true },
      });
      expect(discovery.body).not.toContain(other.user_id);
    } finally {
      await hosted.close();
    }
  });
});

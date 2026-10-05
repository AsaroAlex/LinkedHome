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
import sharp from "sharp";
import { buildApp } from "../server/app";
import { digest, token } from "../server/auth";
import { makePool } from "../server/db";
import { migrate } from "../scripts/migrate";
import {
  cleanupPhotoObjects,
  photoLimits,
  type PhotoStorage,
} from "../server/photos";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search !== "" ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error("Household-photo tests require isolated local soglia_test.");

const db = makePool(url),
  origin = "http://127.0.0.1:3000";
const objects = new Map<string, Buffer>();
const put = async (key: string, body: Buffer) => {
  objects.set(key, body);
};
const get = async (key: string) => {
  if (!objects.has(key)) throw new Error("Missing synthetic household photo.");
  return objects.get(key)!;
};
const remove = async (key: string) => {
  objects.delete(key);
};
const storage: PhotoStorage = {
  put: vi.fn(put),
  get: vi.fn(get),
  delete: vi.fn(remove),
};
const app = await buildApp(db, {
  origin,
  limits: false,
  serveStatic: false,
  photoStorage: storage,
  mail: async () => {},
});
type Person = { id: string; cookie: string };
type Photo = { id: string; url: string; width: number; height: number };
type Member = { id: string; display_name: string; photo: Photo | null };
type Household = { mode: "group" | "individual"; members: Member[] };
let tenant: Person,
  landlord: Person,
  outsider: Person,
  otherTenant: Person,
  property: any;
const png = await sharp({
  create: { width: 64, height: 48, channels: 3, background: "#bb8855" },
})
  .png()
  .toBuffer();

function request(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  actor?: Person,
  payload?: Record<string, unknown>,
  server = app,
  requestOrigin = origin,
) {
  return server.inject({
    method,
    url: "/api" + path,
    payload,
    headers: {
      origin: requestOrigin,
      "content-type": "application/json",
      ...(actor ? { cookie: actor.cookie } : {}),
    },
  });
}
function upload(
  memberId: string | null,
  actor: Person = tenant,
  options: {
    body?: Buffer;
    mimetype?: string;
    key?: string;
    origin?: string;
    extra?: Buffer;
  } = {},
  server = app,
) {
  const boundary = "linkedhome-household-photo-test";
  const file = (bytes: Buffer) =>
    Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="synthetic.png"\r\nContent-Type: ${options.mimetype || "image/png"}\r\n\r\n`,
      ),
      bytes,
      Buffer.from("\r\n"),
    ]);
  return server.inject({
    method: "POST",
    url: memberId
      ? `/api/profile/members/${memberId}/photo`
      : "/api/profile/photo",
    headers: {
      origin: options.origin || origin,
      "content-type": `multipart/form-data; boundary=${boundary}`,
      cookie: actor.cookie,
      ...(options.key ? { "idempotency-key": options.key } : {}),
    },
    payload: Buffer.concat([
      file(options.body || png),
      ...(options.extra ? [file(options.extra)] : []),
      Buffer.from(`--${boundary}--\r\n`),
    ]),
  });
}
async function person(role: "tenant" | "landlord" | "both") {
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
async function profile(actor = tenant) {
  const response = await request("GET", "/profile", actor);
  expect(response.statusCode).toBe(200);
  return response.json();
}
async function household(actor = tenant) {
  return (await profile(actor)).household as Household;
}
async function add(
  display_name = "Coinquilino sintetico privato",
  actor = tenant,
  id = randomUUID(),
) {
  const response = await request("POST", "/profile/members", actor, {
    id,
    display_name,
  });
  expect(response.statusCode).toBe(201);
  const member = (await household(actor)).members.find(
    (item) => item.id === id,
  );
  expect(member).toBeDefined();
  return member!;
}
async function mode(value: Household["mode"], actor = tenant) {
  expect(
    (await request("PUT", "/profile/household", actor, { mode: value }))
      .statusCode,
  ).toBe(200);
  return household(actor);
}
async function send() {
  const saved = (await profile()).profile;
  const response = await request("POST", "/invitations", landlord, {
    property_id: property.id,
    tenant_id: tenant.id,
    property_revision: property.revision,
    profile_revision: saved.revision,
  });
  expect(response.statusCode).toBe(201);
  return { id: response.json().id as string, saved };
}
async function accept(id: string, saved: any) {
  expect(
    (
      await request("POST", `/invitations/${id}/action`, tenant, {
        action: "accept",
        property_revision: property.revision,
        profile_revision: saved.revision,
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
    throw new Error("Unsafe effective household-photo test connection.");
  await migrate(db);
  await app.ready();
});
beforeEach(async () => {
  await db.query(
    "TRUNCATE users,events,audit_log,photo_object_deletions RESTART IDENTITY CASCADE",
  );
  objects.clear();
  vi.mocked(storage.put).mockReset().mockImplementation(put);
  vi.mocked(storage.get).mockReset().mockImplementation(get);
  vi.mocked(storage.delete).mockReset().mockImplementation(remove);
  tenant = await person("tenant");
  landlord = await person("landlord");
  outsider = await person("landlord");
  otherTenant = await person("tenant");
  await db.query(
    "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'published',now())",
    [tenant.id],
  );
  property = (
    await db.query(
      "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) VALUES($1,'Casa sintetica','Bologna','Saragozza','Una casa per verificare le foto dei coinquilini.',850,'2028-01-01',6,36,2,65,3,true,true,'published',now()) RETURNING *",
      [landlord.id],
    )
  ).rows[0];
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("household members and private photos", () => {
  it("saves members and presentation mode before preferences exist, and exports owner metadata", async () => {
    await db.query("DELETE FROM profiles WHERE user_id=$1", [tenant.id]);
    expect((await profile()).household).toEqual({ mode: "group", members: [] });
    const first = await add("  Primo coinquilino sintetico  ");
    expect(first).toEqual({
      id: first.id,
      display_name: "Primo coinquilino sintetico",
      photo: null,
    });
    const second = await add("Secondo coinquilino sintetico");
    expect((await mode("individual")).members).toEqual([first, second]);
    expect(
      (
        await request("PUT", `/profile/members/${first.id}`, tenant, {
          display_name: "  Nome aggiornato  ",
        })
      ).statusCode,
    ).toBe(200);
    const edited = await household();
    expect(edited).toMatchObject({
      mode: "individual",
      members: [{ id: first.id, display_name: "Nome aggiornato" }, second],
    });
    expect((await mode("group")).members).toEqual(edited.members);
    expect(
      (await request("GET", "/account/export", tenant)).json().household,
    ).toEqual(await household());
    expect((await profile()).profile).toBeNull();
  });

  it("validates names, modes and IDs and enforces origin, authentication and ownership", async () => {
    const member = await add();
    for (const payload of [
      { id: randomUUID(), display_name: "  " },
      { id: randomUUID(), display_name: "x".repeat(81) },
      { id: "invalid", display_name: "Nome valido" },
      { display_name: "Nome senza identificativo" },
      { id: randomUUID(), display_name: "Nome valido", extra: true },
    ])
      expect(
        (await request("POST", "/profile/members", tenant, payload)).statusCode,
      ).toBe(400);
    expect(
      (await request("PUT", "/profile/household", tenant, { mode: "public" }))
        .statusCode,
    ).toBe(400);
    expect(
      (
        await request("PUT", `/profile/members/${member.id}`, tenant, {
          display_name: "",
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await request("POST", "/profile/members", undefined, {
          id: randomUUID(),
          display_name: "Nome valido",
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (
        await request("PUT", "/profile/household", landlord, {
          mode: "individual",
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await request("POST", "/profile/members", landlord, {
          id: randomUUID(),
          display_name: "Nome valido",
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await request("PUT", `/profile/members/${member.id}`, otherTenant, {
          display_name: "Nome estraneo",
        })
      ).statusCode,
    ).toBe(404);
    expect((await upload(member.id, otherTenant)).statusCode).toBe(404);
    expect(
      (
        await upload(member.id, tenant, {
          origin: "https://other.example.test",
        })
      ).statusCode,
    ).toBe(403);
    expect([200, 404]).toContain(
      (
        await request(
          "DELETE",
          `/profile/members/${member.id}`,
          otherTenant,
          {},
        )
      ).statusCode,
    );
    expect((await household()).members).toEqual([member]);
    const dual = await person("both");
    expect(
      (await add("Coinquilino per entrambi i ruoli", dual)).display_name,
    ).toBe("Coinquilino per entrambi i ruoli");
    expect(objects.size).toBe(0);
  });

  it("caps concurrent member creation at eleven extras and rolls back a failed slot reservation", async () => {
    for (let index = 0; index < 10; index++)
      await add(`Coinquilino sintetico ${index + 1}`);
    const responses = await Promise.all(
      [1, 2].map((number) =>
        request("POST", "/profile/members", tenant, {
          id: randomUUID(),
          display_name: `Ultimo coinquilino ${number}`,
        }),
      ),
    );
    expect(responses.map((response) => response.statusCode).sort()).toEqual([
      201, 409,
    ]);
    expect((await household()).members).toHaveLength(11);
    const retryId = randomUUID();
    expect(
      (
        await request("POST", "/profile/members", tenant, {
          id: retryId,
          display_name: "Dodicesimo tentativo",
        })
      ).statusCode,
    ).toBe(409);
    const first = (await household()).members[0];
    expect(
      (await request("DELETE", `/profile/members/${first.id}`, tenant, {}))
        .statusCode,
    ).toBe(200);
    expect((await add("Nuovo slot disponibile", tenant, retryId)).id).toBe(
      retryId,
    );
    expect((await household()).members).toHaveLength(11);
  });

  it("retries a current client member ID without reverting an edit and never resurrects a removed member", async () => {
    const member = await add();
    expect(
      (
        await request("PUT", `/profile/members/${member.id}`, tenant, {
          display_name: "Nome modificato",
        })
      ).statusCode,
    ).toBe(200);
    const retried = await request("POST", "/profile/members", tenant, {
      id: member.id,
      display_name: member.display_name,
    });
    expect(retried.statusCode).toBe(201);
    expect(retried.json().member.display_name).toBe("Nome modificato");
    expect((await household()).members).toHaveLength(1);
    expect(
      (
        await request("POST", "/profile/members", otherTenant, {
          id: member.id,
          display_name: "Identificativo di un altro account",
        })
      ).statusCode,
    ).toBe(409);
    expect(
      (await request("DELETE", `/profile/members/${member.id}`, tenant, {}))
        .statusCode,
    ).toBe(200);
    expect(
      (await request("DELETE", `/profile/members/${member.id}`, tenant, {}))
        .statusCode,
    ).toBe(200);
    expect(
      (
        await request("POST", "/profile/members", tenant, {
          id: member.id,
          display_name: "Risposta tardiva",
        })
      ).statusCode,
    ).toBe(409);
    expect((await household()).members).toEqual([]);
  });

  it("keeps the main photo, preferences, revisions and pending invitation unchanged during household edits", async () => {
    const primary = (await upload(null)).json().photo as Photo;
    const { id } = await send();
    const beforeProfile = (
      await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id])
    ).rows[0];
    const beforeInvitation = (
      await db.query("SELECT * FROM invitations WHERE id=$1", [id])
    ).rows[0];
    const member = await add();
    await mode("individual");
    const first = (await upload(member.id)).json().photo as Photo;
    const second = (await upload(member.id)).json().photo as Photo;
    expect(second.id).not.toBe(first.id);
    expect(
      (
        await request("PUT", `/profile/members/${member.id}`, tenant, {
          display_name: "Nuovo nome sintetico",
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await request(
          "DELETE",
          `/profile/members/${member.id}/photo`,
          tenant,
          {},
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (await request("DELETE", `/profile/members/${member.id}`, tenant, {}))
        .statusCode,
    ).toBe(200);
    expect((await profile()).photo).toEqual(primary);
    expect(
      (await request("GET", `/profile-photos/${primary.id}`, tenant))
        .statusCode,
    ).toBe(200);
    expect(
      (await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id]))
        .rows[0],
    ).toEqual(beforeProfile);
    expect(
      (await db.query("SELECT * FROM invitations WHERE id=$1", [id])).rows[0],
    ).toEqual(beforeInvitation);
    expect(objects.size).toBe(1);
  });

  it("normalizes private member photos and returns only safe metadata before preferences exist", async () => {
    await db.query("DELETE FROM profiles WHERE user_id=$1", [tenant.id]);
    const member = await add();
    const jpeg = await sharp({
      create: { width: 2100, height: 1200, channels: 3, background: "#447788" },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const response = await upload(member.id, tenant, {
      body: jpeg,
      mimetype: "image/jpeg",
    });
    expect(response.statusCode).toBe(201);
    const photo = response.json().photo as Photo;
    expect(photo).toMatchObject({
      width: 914,
      height: 1600,
      url: `/api/profile-member-photos/${photo.id}`,
    });
    expect(Object.keys(photo).sort()).toEqual(
      ["id", "url", "width", "height"].sort(),
    );
    expect((await household()).members).toEqual([{ ...member, photo }]);
    expect(
      (await request("GET", "/account/export", tenant)).json().household,
    ).toEqual(await household());
    const image = await request(
      "GET",
      `/profile-member-photos/${photo.id}`,
      tenant,
    );
    expect(image.statusCode).toBe(200);
    expect(image.headers["content-type"]).toBe("image/webp");
    expect(image.headers["cache-control"]).toContain("no-store");
    const metadata = await sharp(image.rawPayload).metadata();
    expect(metadata.exif).toBeUndefined();
    expect(metadata.orientation).toBeUndefined();
    expect(
      (await request("GET", `/profile-member-photos/${photo.id}`)).statusCode,
    ).toBe(401);
    expect(
      (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
        .statusCode,
    ).toBe(404);
    expect((await profile()).profile).toBeNull();
    expect((await profile()).photo).toBeNull();
  });

  it("rejects invalid member images without replacing the current photo or changing a pending invite", async () => {
    const member = await add();
    const photo = (await upload(member.id)).json().photo as Photo;
    const { id } = await send();
    for (const { options, status } of [
      { options: { body: Buffer.from("not a photo") }, status: 400 },
      { options: { mimetype: "image/jpeg" }, status: 400 },
      { options: { body: Buffer.alloc(photoLimits.bytes + 1) }, status: 413 },
      { options: { extra: png }, status: 400 },
      { options: { key: "invalid" }, status: 400 },
    ]) {
      expect((await upload(member.id, tenant, options)).statusCode).toBe(
        status,
      );
      expect((await household()).members[0].photo).toEqual(photo);
      expect((await invitation(id)).status).toBe("pending");
      expect(objects.size).toBe(1);
    }
    expect(storage.put).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent photo retries and refuses tokens bound to another member or main photo", async () => {
    const first = await add("Primo coinquilino privato"),
      second = await add("Secondo coinquilino privato");
    const key = randomUUID();
    const responses = await Promise.all([
      upload(first.id, tenant, { key }),
      upload(first.id, tenant, { key }),
    ]);
    expect(responses.map((response) => response.statusCode)).toEqual([
      201, 201,
    ]);
    expect(responses[0].json().photo).toEqual(responses[1].json().photo);
    expect((await upload(first.id, tenant, { key })).json().photo).toEqual(
      responses[0].json().photo,
    );
    expect((await upload(second.id, tenant, { key })).statusCode).toBe(409);
    expect((await upload(null, tenant, { key })).statusCode).toBe(409);
    expect((await profile()).photo).toBeNull();
    expect(
      (await household()).members.find((member) => member.id === second.id)!
        .photo,
    ).toBeNull();
    expect(storage.put).toHaveBeenCalledTimes(1);
    expect(objects.size).toBe(1);
  });

  it("refuses stale photo retries after replacement, removal or deleting the member", async () => {
    const member = await add();
    const firstKey = randomUUID(),
      secondKey = randomUUID();
    const first = (await upload(member.id, tenant, { key: firstKey })).json()
      .photo as Photo;
    const second = (await upload(member.id, tenant, { key: secondKey })).json()
      .photo as Photo;
    expect(
      (await upload(member.id, tenant, { key: firstKey })).statusCode,
    ).toBe(409);
    expect(
      (await request("GET", `/profile-member-photos/${first.id}`, tenant))
        .statusCode,
    ).toBe(404);
    expect(
      (
        await request(
          "DELETE",
          `/profile/members/${member.id}/photo`,
          tenant,
          {},
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (await upload(member.id, tenant, { key: secondKey })).statusCode,
    ).toBe(409);
    expect(
      (await request("GET", `/profile-member-photos/${second.id}`, tenant))
        .statusCode,
    ).toBe(404);
    expect(
      (await request("DELETE", `/profile/members/${member.id}`, tenant, {}))
        .statusCode,
    ).toBe(200);
    expect(
      (await upload(member.id, tenant, { key: randomUUID() })).statusCode,
    ).toBe(404);
    expect(
      (await upload(member.id, tenant, { key: secondKey })).statusCode,
    ).toBe(404);
    expect((await household()).members).toEqual([]);
    expect(storage.put).toHaveBeenCalledTimes(2);
    expect(objects.size).toBe(0);
  });

  it("preserves the previous photo across a partial failed upload and retries durable cleanup", async () => {
    const member = await add();
    const current = (await upload(member.id)).json().photo as Photo;
    const key = randomUUID();
    vi.mocked(storage.put).mockImplementationOnce(async (objectKey, body) => {
      objects.set(objectKey, body);
      throw new Error("Synthetic partial write failure.");
    });
    vi.mocked(storage.delete).mockRejectedValueOnce(
      new Error("Synthetic transient cleanup failure."),
    );
    expect((await upload(member.id, tenant, { key })).statusCode).toBe(500);
    expect((await household()).members[0].photo).toEqual(current);
    expect(objects.size).toBe(2);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(1);
    expect(await cleanupPhotoObjects(db, storage)).toBe(1);
    const retry = await upload(member.id, tenant, { key });
    expect(retry.statusCode).toBe(201);
    expect((await household()).members[0].photo).toEqual(retry.json().photo);
    expect(objects.size).toBe(1);
  });

  it("queues member and account cascades durably while logical removal succeeds", async () => {
    const first = await add("Primo coinquilino"),
      second = await add("Secondo coinquilino");
    const photo = (await upload(first.id)).json().photo as Photo;
    await upload(second.id);
    vi.mocked(storage.delete).mockRejectedValueOnce(
      new Error("Synthetic storage unavailable."),
    );
    expect(
      (await request("DELETE", `/profile/members/${first.id}`, tenant, {}))
        .statusCode,
    ).toBe(200);
    expect(
      (await request("GET", `/profile-member-photos/${photo.id}`, tenant))
        .statusCode,
    ).toBe(404);
    expect((await household()).members.map((member) => member.id)).toEqual([
      second.id,
    ]);
    expect(objects.size).toBe(2);
    await db.query("DELETE FROM users WHERE id=$1", [tenant.id]);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(2);
    expect(await cleanupPhotoObjects(db, storage)).toBe(2);
    expect(objects.size).toBe(0);
  });

  it("never deletes a live member photo because of a stale cleanup entry", async () => {
    const member = await add();
    const photo = (await upload(member.id)).json().photo as Photo;
    const [key] = objects.keys();
    await db.query(
      "INSERT INTO photo_object_deletions(object_key) VALUES($1)",
      [key],
    );
    expect(await cleanupPhotoObjects(db, storage)).toBe(0);
    expect(storage.delete).not.toHaveBeenCalled();
    expect(
      (await request("GET", `/profile-member-photos/${photo.id}`, tenant))
        .statusCode,
    ).toBe(200);
    expect(objects.size).toBe(1);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(0);
  });

  it.each(["accepted", "closed"] as const)(
    "shares individual household photos only in an %s contact and immediately revokes them in group mode",
    async (status) => {
      const primary = (await upload(null)).json().photo as Photo;
      const member = await add();
      const photo = (await upload(member.id)).json().photo as Photo;
      const discovery = await request(
        "GET",
        `/discover/${property.id}`,
        landlord,
      );
      expect(discovery.statusCode).toBe(200);
      expect(discovery.body).not.toContain(member.id);
      expect(discovery.body).not.toContain(member.display_name);
      expect(discovery.body).not.toContain(photo.id);
      const { id, saved } = await send();
      expect((await invitation(id)).tenant_household).toBeNull();
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      await accept(id, saved);
      if (status === "closed")
        expect(
          (
            await request("POST", `/invitations/${id}/action`, tenant, {
              action: "close",
            })
          ).statusCode,
        ).toBe(200);
      expect((await invitation(id)).tenant_household).toEqual({
        mode: "group",
        members: [],
      });
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      const beforeSnapshot = (
        await db.query(
          "SELECT property_snapshot FROM invitations WHERE id=$1",
          [id],
        )
      ).rows[0].property_snapshot;
      const individual = await mode("individual");
      for (const actor of [tenant, landlord]) {
        expect((await invitation(id, actor)).tenant_household).toEqual(
          individual,
        );
        expect(
          (await request("GET", "/invitations", actor)).json().invitations[0]
            .tenant_household,
        ).toEqual(individual);
      }
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(200);
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, outsider))
          .statusCode,
      ).toBe(404);
      await mode("group");
      expect((await invitation(id)).tenant_household).toEqual({
        mode: "group",
        members: [],
      });
      expect((await invitation(id)).other_photo).toEqual(primary);
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, tenant))
          .statusCode,
      ).toBe(200);
      expect((await household()).members).toEqual(individual.members);
      await mode("individual");
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(200);
      expect(
        (await request("DELETE", `/profile/members/${member.id}`, tenant, {}))
          .statusCode,
      ).toBe(200);
      expect((await invitation(id)).tenant_household).toEqual({
        mode: "individual",
        members: [],
      });
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      expect(
        (
          await db.query(
            "SELECT property_snapshot FROM invitations WHERE id=$1",
            [id],
          )
        ).rows[0].property_snapshot,
      ).toEqual(beforeSnapshot);
    },
  );

  it("keeps a both-role landlord's own search household private from the tenant in its accepted offer", async () => {
    const dual = await person("both");
    const member = await add("Coinquilino privato del proprietario", dual);
    await mode("individual", dual);
    const uploaded = await upload(member.id, dual);
    expect(uploaded.statusCode).toBe(201);
    const photo = uploaded.json().photo as Photo;
    await db.query("UPDATE properties SET owner_id=$1 WHERE id=$2", [
      dual.id,
      property.id,
    ]);
    const saved = (await profile()).profile;
    const sent = await request("POST", "/invitations", dual, {
      property_id: property.id,
      tenant_id: tenant.id,
      property_revision: property.revision,
      profile_revision: saved.revision,
    });
    expect(sent.statusCode).toBe(201);
    await accept(sent.json().id, saved);
    expect(
      (await request("GET", `/profile-member-photos/${photo.id}`, dual))
        .statusCode,
    ).toBe(200);
    expect(
      (await request("GET", `/profile-member-photos/${photo.id}`, tenant))
        .statusCode,
    ).toBe(404);
    const contact = await request(
      "GET",
      `/invitations/${sent.json().id}`,
      tenant,
    );
    expect(contact.statusCode).toBe(200);
    expect(contact.json().invitation.tenant_household).toEqual({
      mode: "group",
      members: [],
    });
    expect(contact.body).not.toContain(member.id);
    expect(contact.body).not.toContain(member.display_name);
    expect(contact.body).not.toContain(photo.id);
  });

  it.each(["tenant", "landlord"] as const)(
    "revokes household metadata and member-photo access when the %s blocks the contact",
    async (role) => {
      const member = await add();
      const photo = (await upload(member.id)).json().photo as Photo;
      await mode("individual");
      const { id, saved } = await send();
      await accept(id, saved);
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(200);
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
        expect((await invitation(id, actor)).tenant_household).toBeNull();
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, tenant))
          .statusCode,
      ).toBe(200);
    },
  );

  it.each(["tenant", "landlord"] as const)(
    "hides household metadata when the %s is suspended and restricts that session",
    async (role) => {
      const member = await add();
      const photo = (await upload(member.id)).json().photo as Photo;
      await mode("individual");
      const { id, saved } = await send();
      await accept(id, saved);
      const suspended = role === "tenant" ? tenant : landlord,
        active = role === "tenant" ? landlord : tenant;
      await db.query("UPDATE users SET suspended=true WHERE id=$1", [
        suspended.id,
      ]);
      expect((await invitation(id, active)).tenant_household).toBeNull();
      expect(
        (await request("GET", `/profile-member-photos/${photo.id}`, suspended))
          .statusCode,
      ).toBe(423);
      if (role === "tenant") {
        expect(
          (await request("GET", `/profile-member-photos/${photo.id}`, landlord))
            .statusCode,
        ).toBe(404);
        expect((await upload(member.id)).statusCode).toBe(423);
      }
    },
  );

  it("keeps household metadata and member images inside the hosted preview workspace", async () => {
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
      photoStorage: storage,
    });
    try {
      async function enter(role: "tenant" | "landlord") {
        const response = await request(
          "POST",
          "/auth/preview",
          undefined,
          { role },
          hosted,
          previewOrigin,
        );
        expect(response.statusCode).toBe(200);
        const cookie = response.cookies
          .map((item) => `${item.name}=${item.value}`)
          .join("; ");
        const user = (
          await request(
            "GET",
            "/session",
            { id: "", cookie },
            undefined,
            hosted,
            previewOrigin,
          )
        ).json().user;
        return { id: user.id, cookie } as Person;
      }
      const first = await enter("tenant"),
        second = await enter("landlord");
      const memberId = randomUUID();
      expect(
        (
          await request(
            "POST",
            "/profile/members",
            first,
            {
              id: memberId,
              display_name: "Coinquilino privato della prima preview",
            },
            hosted,
            previewOrigin,
          )
        ).statusCode,
      ).toBe(201);
      expect(
        (
          await request(
            "PUT",
            "/profile/household",
            first,
            { mode: "individual" },
            hosted,
            previewOrigin,
          )
        ).statusCode,
      ).toBe(200);
      const uploaded = await upload(
        memberId,
        first,
        { origin: previewOrigin },
        hosted,
      );
      expect(uploaded.statusCode).toBe(201);
      const photo = uploaded.json().photo as Photo;
      const p = (
        await db.query("SELECT * FROM properties WHERE owner_id=$1", [
          second.id,
        ])
      ).rows[0];
      const saved = (
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
            saved.revision,
            JSON.stringify(p),
          ],
        )
      ).rows[0];
      const detail = await request(
        "GET",
        `/invitations/${contact.id}`,
        second,
        undefined,
        hosted,
        previewOrigin,
      );
      expect(detail.statusCode).toBe(200);
      expect(detail.json().invitation.tenant_household).toBeNull();
      expect(detail.body).not.toContain(memberId);
      expect(detail.body).not.toContain(photo.id);
      expect(
        (
          await request(
            "GET",
            `/profile-member-photos/${photo.id}`,
            second,
            undefined,
            hosted,
            previewOrigin,
          )
        ).statusCode,
      ).toBe(404);
      expect(
        (
          await request(
            "GET",
            `/profile-member-photos/${photo.id}`,
            first,
            undefined,
            hosted,
            previewOrigin,
          )
        ).statusCode,
      ).toBe(200);
    } finally {
      await hosted.close();
    }
  });
});

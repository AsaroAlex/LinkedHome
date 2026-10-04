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
  throw new Error("Profile-photo tests require isolated local soglia_test.");

const db = makePool(url),
  origin = "http://127.0.0.1:3000";
const objects = new Map<string, Buffer>();
const put = async (key: string, body: Buffer) => {
  objects.set(key, body);
};
const get = async (key: string) => {
  if (!objects.has(key)) throw new Error("Missing synthetic profile photo.");
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
type Person = {
  id: string;
  cookie: string;
  email: string;
  displayName: string;
};
type Photo = { id: string; url: string; width: number; height: number };
let tenant: Person,
  landlord: Person,
  other: Person,
  otherTenant: Person,
  property: any;
const png = await sharp({
  create: { width: 64, height: 48, channels: 3, background: "#bb8855" },
})
  .png()
  .toBuffer();

function request(
  method: "GET" | "POST" | "DELETE",
  path: string,
  person?: Person,
  payload?: Record<string, unknown>,
) {
  return app.inject({
    method,
    url: "/api" + path,
    payload,
    headers: {
      origin,
      "content-type": "application/json",
      ...(person ? { cookie: person.cookie } : {}),
    },
  });
}
function upload(
  person: Person | undefined = tenant,
  options: {
    body?: Buffer;
    mimetype?: string;
    key?: string;
    origin?: string;
    extra?: Buffer;
    field?: string;
  } = {},
  server = app,
) {
  const boundary = "linkedhome-profile-photo-test";
  const file = (bytes: Buffer) =>
    Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${options.field || "photo"}"; filename="synthetic.png"\r\nContent-Type: ${options.mimetype || "image/png"}\r\n\r\n`,
      ),
      bytes,
      Buffer.from("\r\n"),
    ]);
  return server.inject({
    method: "POST",
    url: "/api/profile/photo",
    headers: {
      origin: options.origin || origin,
      "content-type": `multipart/form-data; boundary=${boundary}`,
      ...(person ? { cookie: person.cookie } : {}),
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
    secret = token(),
    email = `${id}@example.test`;
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
async function ownPhoto(actor = tenant) {
  const response = await request("GET", "/profile", actor);
  expect(response.statusCode).toBe(200);
  return response.json().photo as Photo | null;
}
async function photoObjectKey(photo: Photo) {
  return (
    await db.query("SELECT object_key FROM profile_photos WHERE id=$1", [
      photo.id,
    ])
  ).rows[0].object_key as string;
}
async function send() {
  const profile = (await request("GET", "/profile", tenant)).json().profile;
  const response = await request("POST", "/invitations", landlord, {
    property_id: property.id,
    tenant_id: tenant.id,
    property_revision: property.revision,
    profile_revision: profile.revision,
  });
  expect(response.statusCode).toBe(201);
  return { id: response.json().id as string, profile };
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
    throw new Error("Unsafe effective profile-photo test connection.");
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
  other = await person("landlord");
  otherTenant = await person("tenant");
  await db.query(
    "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'published',now())",
    [tenant.id],
  );
  property = (
    await db.query(
      "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) VALUES($1,'Casa sintetica','Bologna','Saragozza','Una casa per verificare le foto del profilo.',850,'2028-01-01',6,36,2,65,3,true,true,'published',now()) RETURNING *",
      [landlord.id],
    )
  ).rows[0];
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("private profile photos", () => {
  it("stores a normalized photo before preferences exist and reloads safe metadata", async () => {
    await db.query("DELETE FROM profiles WHERE user_id=$1", [tenant.id]);
    const empty = await request("GET", "/profile", tenant);
    expect(empty.json()).toEqual({ profile: null, photo: null });
    const jpeg = await sharp({
      create: { width: 2100, height: 1200, channels: 3, background: "#447788" },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const response = await upload(tenant, {
      body: jpeg,
      mimetype: "image/jpeg",
    });
    expect(response.statusCode).toBe(201);
    const photo = response.json().photo as Photo;
    expect(photo).toMatchObject({
      width: 914,
      height: 1600,
      url: `/api/profile-photos/${photo.id}`,
    });
    expect(Object.keys(photo).sort()).toEqual(
      ["id", "url", "width", "height"].sort(),
    );
    expect((await request("GET", "/profile", tenant)).json()).toEqual({
      profile: null,
      photo,
    });
    const image = await request("GET", `/profile-photos/${photo.id}`, tenant);
    expect(image.statusCode).toBe(200);
    expect(image.headers["content-type"]).toBe("image/webp");
    expect(image.headers["cache-control"]).toBe("private, no-store");
    const metadata = await sharp(image.rawPayload).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.exif).toBeUndefined();
    expect(metadata.orientation).toBeUndefined();
    const exported = await request("GET", "/account/export", tenant);
    expect(exported.statusCode).toBe(200);
    expect(exported.json().profile_photo).toEqual(photo);
    expect(exported.body).not.toContain(await photoObjectKey(photo));
    expect(objects.size).toBe(1);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM profiles WHERE user_id=$1",
          [tenant.id],
        )
      ).rows[0].count,
    ).toBe(0);
  });

  it("checks origin, authentication and tenant role without widening multipart access", async () => {
    expect(
      (await upload(tenant, { origin: "https://other.example.test" }))
        .statusCode,
    ).toBe(403);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/profile/photo",
          headers: {
            origin,
            "content-type": "multipart/form-data; boundary=x",
          },
          payload: "--x--",
        })
      ).statusCode,
    ).toBe(401);
    expect((await upload(landlord)).statusCode).toBe(403);
    expect((await upload(tenant, { key: "not-a-uuid" })).statusCode).toBe(400);
    expect(
      (await request("POST", "/profile/photo", tenant, {})).statusCode,
    ).toBe(415);
    expect(
      (
        await app.inject({
          method: "PUT",
          url: "/api/profile",
          headers: {
            origin,
            cookie: tenant.cookie,
            "content-type": "multipart/form-data; boundary=x",
          },
          payload: "--x--",
        })
      ).statusCode,
    ).toBe(415);
    expect(objects.size).toBe(0);
    expect(storage.put).not.toHaveBeenCalled();
    const dual = await person("both");
    expect((await upload(dual, { field: "file" })).statusCode).toBe(201);
    expect(await ownPhoto(dual)).not.toBeNull();
  });

  it("rejects invalid, spoofed, oversized or multiple images without replacing a saved photo", async () => {
    const first = await upload();
    expect(first.statusCode).toBe(201);
    const photo = first.json().photo as Photo;
    const { id } = await send();
    const invalid = [
      { options: { mimetype: "image/jpeg" }, status: 400 },
      { options: { body: Buffer.from("not an image") }, status: 400 },
      {
        options: {
          body: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
          mimetype: "image/svg+xml",
        },
        status: 415,
      },
      { options: { extra: png }, status: 400 },
      { options: { body: Buffer.alloc(photoLimits.bytes + 1) }, status: 413 },
      { options: { field: "attachment" }, status: 400 },
    ];
    for (const { options, status } of invalid) {
      expect((await upload(tenant, options)).statusCode).toBe(status);
      expect(await ownPhoto()).toEqual(photo);
      expect((await invitation(id)).status).toBe("pending");
      expect(objects.size).toBe(1);
    }
    expect(storage.put).toHaveBeenCalledTimes(1);
  });

  it("adds, replaces and removes a photo without changing preferences, revisions or pending offers", async () => {
    const { id } = await send();
    const beforeProfile = (
      await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id])
    ).rows[0];
    const beforeInvitation = (
      await db.query("SELECT * FROM invitations WHERE id=$1", [id])
    ).rows[0];
    const first = (await upload()).json().photo as Photo;
    const second = (await upload()).json().photo as Photo;
    expect(second.id).not.toBe(first.id);
    expect(await ownPhoto()).toEqual(second);
    expect(
      (await request("GET", `/profile-photos/${first.id}`, tenant)).statusCode,
    ).toBe(404);
    expect(objects.size).toBe(1);
    expect(
      (await request("DELETE", "/profile/photo", tenant, {})).statusCode,
    ).toBe(200);
    expect(
      (await request("DELETE", "/profile/photo", tenant, {})).statusCode,
    ).toBe(200);
    expect(await ownPhoto()).toBeNull();
    expect(
      (await request("GET", `/profile-photos/${second.id}`, tenant)).statusCode,
    ).toBe(404);
    expect(objects.size).toBe(0);
    expect(
      (await db.query("SELECT * FROM profiles WHERE user_id=$1", [tenant.id]))
        .rows[0],
    ).toEqual(beforeProfile);
    expect(
      (await db.query("SELECT * FROM invitations WHERE id=$1", [id])).rows[0],
    ).toEqual(beforeInvitation);
  });

  it("deduplicates concurrent or lost-response retries without another storage write", async () => {
    const key = randomUUID();
    const responses = await Promise.all([
      upload(tenant, { key }),
      upload(tenant, { key }),
    ]);
    expect(responses.map((response) => response.statusCode)).toEqual([
      201, 201,
    ]);
    expect(responses[0].json().photo).toEqual(responses[1].json().photo);
    expect((await upload(tenant, { key })).json().photo).toEqual(
      responses[0].json().photo,
    );
    expect(storage.put).toHaveBeenCalledTimes(1);
    expect(objects.size).toBe(1);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM profile_photos WHERE user_id=$1",
          [tenant.id],
        )
      ).rows[0].count,
    ).toBe(1);
  });

  it("refuses a token reused after replacement, deletion or by another user", async () => {
    const firstKey = randomUUID();
    const first = (await upload(tenant, { key: firstKey })).json()
      .photo as Photo;
    const secondKey = randomUUID();
    const second = (await upload(tenant, { key: secondKey })).json()
      .photo as Photo;
    expect((await upload(tenant, { key: firstKey })).statusCode).toBe(409);
    expect((await upload(otherTenant, { key: secondKey })).statusCode).toBe(
      409,
    );
    expect(await ownPhoto()).toEqual(second);
    expect(await ownPhoto(otherTenant)).toBeNull();
    expect(
      (await request("GET", `/profile-photos/${first.id}`, tenant)).statusCode,
    ).toBe(404);
    expect(storage.put).toHaveBeenCalledTimes(2);
    expect(
      (await request("DELETE", "/profile/photo", tenant, {})).statusCode,
    ).toBe(200);
    expect((await upload(tenant, { key: secondKey })).statusCode).toBe(409);
    expect(await ownPhoto()).toBeNull();
    expect(objects.size).toBe(0);
    expect(storage.put).toHaveBeenCalledTimes(2);
  });

  it("preserves the current photo and durably cleans a partial failed replacement before a retry", async () => {
    const current = (await upload()).json().photo as Photo;
    const key = randomUUID();
    vi.mocked(storage.put).mockImplementationOnce(async (objectKey, body) => {
      objects.set(objectKey, body);
      throw new Error("Synthetic partial write failure.");
    });
    vi.mocked(storage.delete).mockRejectedValueOnce(
      new Error("Synthetic temporary deletion failure."),
    );
    expect((await upload(tenant, { key })).statusCode).toBe(500);
    expect(await ownPhoto()).toEqual(current);
    expect(objects.size).toBe(2);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(1);
    expect(await cleanupPhotoObjects(db, storage)).toBe(1);
    expect(objects.size).toBe(1);
    const retry = await upload(tenant, { key });
    expect(retry.statusCode).toBe(201);
    expect(await ownPhoto()).toEqual(retry.json().photo);
    expect(objects.size).toBe(1);
    expect(
      (await request("GET", `/profile-photos/${current.id}`, tenant))
        .statusCode,
    ).toBe(404);
  });

  it("acknowledges logical deletion and retains failed cleanup without touching unrelated queued objects", async () => {
    const photo = (await upload()).json().photo as Photo;
    const key = await photoObjectKey(photo);
    const unrelated = `property-photos/${randomUUID()}.webp`;
    await db.query(
      "INSERT INTO photo_object_deletions(object_key) VALUES($1)",
      [unrelated],
    );
    vi.mocked(storage.delete).mockRejectedValueOnce(
      new Error("Synthetic storage unavailable."),
    );
    expect(
      (await request("DELETE", "/profile/photo", tenant, {})).statusCode,
    ).toBe(200);
    expect(await ownPhoto()).toBeNull();
    expect(
      (await request("GET", `/profile-photos/${photo.id}`, tenant)).statusCode,
    ).toBe(404);
    expect(storage.delete).toHaveBeenCalledTimes(1);
    expect(storage.delete).toHaveBeenCalledWith(key);
    expect(storage.delete).not.toHaveBeenCalledWith(unrelated);
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

  it("queues account-cascade deletion and retries a storage failure", async () => {
    await upload();
    expect(objects.size).toBe(1);
    await db.query("DELETE FROM users WHERE id=$1", [tenant.id]);
    expect(
      (await db.query("SELECT count(*)::int AS count FROM profile_photos"))
        .rows[0].count,
    ).toBe(0);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM profile_photo_upload_requests",
        )
      ).rows[0].count,
    ).toBe(0);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(1);
    vi.mocked(storage.delete).mockRejectedValueOnce(
      new Error("Synthetic transient deletion failure."),
    );
    expect(await cleanupPhotoObjects(db, storage)).toBe(0);
    expect(objects.size).toBe(1);
    expect(await cleanupPhotoObjects(db, storage)).toBe(1);
    expect(objects.size).toBe(0);
  });

  it("discards stale cleanup entries without deleting a live photo committed by a retry", async () => {
    const photo = (await upload(tenant, { key: randomUUID() })).json()
      .photo as Photo;
    await db.query(
      "INSERT INTO photo_object_deletions(object_key) SELECT object_key FROM profile_photos WHERE id=$1",
      [photo.id],
    );
    expect(await cleanupPhotoObjects(db, storage)).toBe(0);
    expect(storage.delete).not.toHaveBeenCalled();
    expect(objects.size).toBe(1);
    expect(
      (await request("GET", `/profile-photos/${photo.id}`, tenant)).statusCode,
    ).toBe(200);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(0);
  });

  it.each(["accepted", "closed"] as const)(
    "shares the current photo only after an %s contact and preserves the property snapshot",
    async (status) => {
      const photo = (await upload()).json().photo as Photo;
      expect(
        (await request("GET", `/profile-photos/${photo.id}`)).statusCode,
      ).toBe(401);
      expect(
        (await request("GET", `/profile-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      expect(
        (await request("GET", `/profile-photos/${photo.id}`, other)).statusCode,
      ).toBe(404);
      const discovery = await request(
        "GET",
        `/discover/${property.id}`,
        landlord,
      );
      expect(discovery.statusCode).toBe(200);
      expect(discovery.json().profiles).toHaveLength(1);
      expect(discovery.body).not.toContain(photo.id);
      expect(discovery.body).not.toContain("profile-photos");
      expect(discovery.body).not.toContain(tenant.email);
      expect(discovery.body).not.toContain(tenant.displayName);
      const { id, profile } = await send();
      expect((await invitation(id)).other_photo).toBeNull();
      expect(
        (await request("GET", `/profile-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      const before = (
        await db.query(
          "SELECT property_snapshot FROM invitations WHERE id=$1",
          [id],
        )
      ).rows[0].property_snapshot;
      await accept(id, profile);
      if (status === "closed")
        expect(
          (
            await request("POST", `/invitations/${id}/action`, tenant, {
              action: "close",
            })
          ).statusCode,
        ).toBe(200);
      const accepted = await invitation(id);
      expect(accepted).toMatchObject({ status, other_photo: photo });
      expect(
        (await request("GET", "/invitations", landlord)).json().invitations[0]
          .other_photo,
      ).toEqual(photo);
      expect(
        (await request("GET", `/profile-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(200);
      expect((await invitation(id, tenant)).other_photo).toBeNull();
      const replacement = (await upload()).json().photo as Photo;
      expect((await invitation(id)).other_photo).toEqual(replacement);
      expect(
        (await request("GET", `/profile-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      expect(
        (await request("GET", `/profile-photos/${replacement.id}`, landlord))
          .statusCode,
      ).toBe(200);
      expect(
        (
          await db.query(
            "SELECT property_snapshot FROM invitations WHERE id=$1",
            [id],
          )
        ).rows[0].property_snapshot,
      ).toEqual(before);
      expect(
        (await request("DELETE", "/profile/photo", tenant, {})).statusCode,
      ).toBe(200);
      expect((await invitation(id)).other_photo).toBeNull();
      expect(
        (await request("GET", `/profile-photos/${replacement.id}`, landlord))
          .statusCode,
      ).toBe(404);
    },
  );

  it.each(["tenant", "landlord"] as const)(
    "revokes photo access and metadata after the %s blocks the contact",
    async (blockingRole) => {
      const photo = (await upload()).json().photo as Photo;
      const { id, profile } = await send();
      await accept(id, profile);
      expect(
        (await request("GET", `/profile-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(200);
      expect(
        (
          await request(
            "POST",
            "/blocks",
            blockingRole === "tenant" ? tenant : landlord,
            { invitation_id: id },
          )
        ).statusCode,
      ).toBe(200);
      expect(
        (await request("GET", `/profile-photos/${photo.id}`, landlord))
          .statusCode,
      ).toBe(404);
      expect((await invitation(id)).other_photo).toBeNull();
      expect(
        (await request("GET", `/profile-photos/${photo.id}`, tenant))
          .statusCode,
      ).toBe(200);
    },
  );

  it("revokes shared photo access for a suspended holder and restricts the holder's own session", async () => {
    const photo = (await upload()).json().photo as Photo;
    const { id, profile } = await send();
    await accept(id, profile);
    await db.query("UPDATE users SET suspended=true WHERE id=$1", [tenant.id]);
    expect(
      (await request("GET", `/profile-photos/${photo.id}`, landlord))
        .statusCode,
    ).toBe(404);
    expect((await invitation(id)).other_photo).toBeNull();
    expect(
      (await request("GET", `/profile-photos/${photo.id}`, tenant)).statusCode,
    ).toBe(423);
    expect((await upload()).statusCode).toBe(423);
    expect(
      (await request("DELETE", "/profile/photo", tenant, {})).statusCode,
    ).toBe(423);
    expect(objects.size).toBe(1);
  });

  it("isolates profile photos between hosted demo workspaces even with an inconsistent cross-workspace contact", async () => {
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
        const session = await hosted.inject({
          method: "GET",
          url: "/api/session",
          headers: { cookie },
        });
        const user = session.json().user;
        return {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          cookie,
        } as Person;
      }
      const first = await enter("tenant");
      const second = await enter("landlord");
      const uploaded = await upload(first, { origin: previewOrigin }, hosted);
      expect(uploaded.statusCode).toBe(201);
      const photo = uploaded.json().photo as Photo;
      expect(
        (
          await hosted.inject({
            method: "GET",
            url: photo.url,
            headers: { cookie: first.cookie },
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (
          await hosted.inject({
            method: "GET",
            url: photo.url,
            headers: { cookie: second.cookie },
          })
        ).statusCode,
      ).toBe(404);
      const p = (
        await db.query("SELECT * FROM properties WHERE owner_id=$1", [
          second.id,
        ])
      ).rows[0];
      const profile = (
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
            profile.revision,
            JSON.stringify(p),
          ],
        )
      ).rows[0];
      // A stale or administrative cross-workspace contact cannot bypass preview isolation.
      expect(
        (
          await hosted.inject({
            method: "GET",
            url: photo.url,
            headers: { cookie: second.cookie },
          })
        ).statusCode,
      ).toBe(404);
      const detail = await hosted.inject({
        method: "GET",
        url: `/api/invitations/${contact.id}`,
        headers: { cookie: second.cookie },
      });
      expect(detail.statusCode).toBe(200);
      expect(detail.json().invitation.other_photo).toBeNull();
    } finally {
      await hosted.close();
    }
  });
});

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
  normalizePhoto,
  photoLimits,
  readPhotoConfiguration,
  type PhotoStorage,
} from "../server/photos";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname) ||
  new URL(url).search
)
  throw new Error("Photo tests require isolated local soglia_test.");
const db = makePool(url),
  origin = "http://127.0.0.1:3000";
const objects = new Map<string, Buffer>();
const storage: PhotoStorage = {
  put: vi.fn(async (key, body) => {
    objects.set(key, body);
  }),
  get: vi.fn(async (key) => {
    if (!objects.has(key)) throw new Error("Missing test photo.");
    return objects.get(key)!;
  }),
  delete: vi.fn(async (key) => {
    objects.delete(key);
  }),
};
const app = await buildApp(db, {
  origin,
  limits: false,
  serveStatic: false,
  photoStorage: storage,
  mail: async () => {},
});
type Person = { id: string; cookie: string };
let owner: Person, tenant: Person, other: Person, property: any;
const png = await sharp({
  create: { width: 64, height: 48, channels: 3, background: "#bb8855" },
})
  .png()
  .toBuffer();
function request(
  method: "GET" | "POST" | "DELETE",
  path: string,
  person?: Person,
  payload?: any,
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
  body = png,
  mimetype = "image/png",
  person: Person | undefined = owner,
  options: {
    origin?: string;
    propertyId?: string;
    extra?: Buffer;
    key?: string;
  } = {},
) {
  const boundary = "linkedhome-photo-test";
  const file = (bytes: Buffer) =>
    Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="synthetic.png"\r\nContent-Type: ${mimetype}\r\n\r\n`,
      ),
      bytes,
      Buffer.from("\r\n"),
    ]);
  return app.inject({
    method: "POST",
    url: `/api/properties/${options.propertyId || property.id}/photos`,
    headers: {
      origin: options.origin || origin,
      "content-type": `multipart/form-data; boundary=${boundary}`,
      ...(person ? { cookie: person.cookie } : {}),
      ...(options.key ? { "idempotency-key": options.key } : {}),
    },
    payload: Buffer.concat([
      file(body),
      ...(options.extra ? [file(options.extra)] : []),
      Buffer.from(`--${boundary}--\r\n`),
    ]),
  });
}
async function person(role: "landlord" | "tenant") {
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
beforeAll(async () => {
  await migrate(db);
  await app.ready();
});
beforeEach(async () => {
  await db.query(
    "TRUNCATE users,events,audit_log,photo_object_deletions RESTART IDENTITY CASCADE",
  );
  objects.clear();
  vi.clearAllMocks();
  owner = await person("landlord");
  tenant = await person("tenant");
  other = await person("landlord");
  await db.query(
    "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2027-01-01',12,2,'published',now())",
    [tenant.id],
  );
  const result = await request("POST", "/properties", owner, {
    title: "Casa sintetica",
    city: "Bologna",
    area: "Saragozza",
    description: "Una casa per verificare le foto.",
    rent: 850,
    available_from: "2026-12-01",
    min_months: 6,
    max_months: 36,
    capacity: 2,
    sqm: 65,
    rooms: 3,
    furnished: true,
    authority_attested: true,
  });
  expect(result.statusCode).toBe(201);
  await request("POST", `/properties/${result.json().id}/status`, owner, {
    status: "published",
  });
  property = (await request("GET", "/properties", owner)).json().properties[0];
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("persistent property photo boundary", () => {
  it("normalizes and strips metadata, returns same-origin metadata and persists a private image", async () => {
    const jpeg = await sharp({
      create: { width: 2100, height: 1200, channels: 3, background: "#447788" },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const result = await upload(jpeg, "image/jpeg");
    expect(result.statusCode).toBe(201);
    const photo = result.json().photo;
    expect(photo).toMatchObject({
      width: 914,
      height: 1600,
      position: 0,
      url: `/api/property-photos/${photo.id}`,
    });
    expect(photo).not.toHaveProperty("object_key");
    const loaded = (await request("GET", "/properties", owner)).json()
      .properties[0];
    expect(loaded.photos).toEqual([photo]);
    expect(loaded.revision).toBe(property.revision + 1);
    const image = await request("GET", `/property-photos/${photo.id}`, owner);
    expect(image.statusCode).toBe(200);
    expect(image.headers["content-type"]).toBe("image/webp");
    expect(image.headers["cache-control"]).toBe("no-store");
    const metadata = await sharp(image.rawPayload).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.exif).toBeUndefined();
    expect(metadata.orientation).toBeUndefined();
    expect(
      (await request("GET", `/property-photos/${photo.id}`)).statusCode,
    ).toBe(401);
    expect(
      (await request("GET", `/property-photos/${photo.id}`, other)).statusCode,
    ).toBe(404);
    expect(
      (await request("GET", `/property-photos/${photo.id}`, tenant)).statusCode,
    ).toBe(404);
  });
  it("keeps same-origin and role/ownership checks before upload, without widening multipart access", async () => {
    expect(
      (
        await upload(png, "image/png", owner, {
          origin: "https://other.example.test",
        })
      ).statusCode,
    ).toBe(403);
    expect((await upload(png, "image/png", tenant)).statusCode).toBe(403);
    expect((await upload(png, "image/png", other)).statusCode).toBe(404);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/properties",
          headers: {
            origin,
            "content-type": "multipart/form-data; boundary=x",
            cookie: owner.cookie,
          },
          payload: "--x--",
        })
      ).statusCode,
    ).toBe(415);
    expect(objects.size).toBe(0);
  });
  it("rejects MIME spoofing, non-images, unsupported types, multiple files and oversized files", async () => {
    expect((await upload(png, "image/jpeg")).statusCode).toBe(400);
    expect((await upload(Buffer.from("not an image"))).statusCode).toBe(400);
    expect(
      (
        await upload(
          Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
          "image/svg+xml",
        )
      ).statusCode,
    ).toBe(415);
    expect(
      (await upload(png, "image/png", owner, { extra: png })).statusCode,
    ).toBe(400);
    const oversized = await upload(Buffer.alloc(photoLimits.bytes + 1));
    expect(oversized.statusCode).toBe(413);
    expect(oversized.json().error).toContain("5 MB");
    expect(objects.size).toBe(0);
    expect(
      (await db.query("SELECT count(*)::int AS count FROM property_photos"))
        .rows[0].count,
    ).toBe(0);
  });
  it("caps concurrent uploads at six, and a deleted slot can be replaced", async () => {
    for (let n = 0; n < 5; n++) expect((await upload()).statusCode).toBe(201);
    const responses = await Promise.all([upload(), upload()]);
    expect(responses.map((r) => r.statusCode).sort()).toEqual([201, 409]);
    const photos = (await request("GET", "/properties", owner)).json()
      .properties[0].photos;
    expect(photos).toHaveLength(6);
    expect(
      (
        await request(
          "DELETE",
          `/properties/${property.id}/photos/${photos[0].id}`,
          other,
          {},
        )
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await request(
          "DELETE",
          `/properties/${property.id}/photos/${photos[0].id}`,
          owner,
          {},
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (await request("GET", `/property-photos/${photos[0].id}`, owner))
        .statusCode,
    ).toBe(404);
    expect(objects.size).toBe(5);
    expect((await upload()).statusCode).toBe(201);
  });
  it("returns the same photo after a lost response retry without using another slot or overwriting another property", async () => {
    const key = randomUUID();
    const results = await Promise.all([
      upload(png, "image/png", owner, { key }),
      upload(png, "image/png", owner, { key }),
    ]);
    expect(results.map((r) => r.statusCode)).toEqual([201, 201]);
    expect(results[0].json().photo).toEqual(results[1].json().photo);
    expect(objects.size).toBe(1);
    expect(storage.put).toHaveBeenCalledTimes(1);
    expect(
      (await request("GET", "/properties", owner)).json().properties[0].photos,
    ).toHaveLength(1);
    await db.query("UPDATE properties SET owner_id=$1 WHERE id=$2", [
      other.id,
      property.id,
    ]);
    expect((await upload(png, "image/png", owner, { key })).statusCode).toBe(
      404,
    );
    const second = (
      await db.query(
        "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms) SELECT $1,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms FROM properties WHERE id=$2 RETURNING id",
        [owner.id, property.id],
      )
    ).rows[0];
    expect(
      (await upload(png, "image/png", owner, { key, propertyId: second.id }))
        .statusCode,
    ).toBe(409);
    expect(objects.size).toBe(1);
    expect(storage.put).toHaveBeenCalledTimes(1);
  });
  it("preserves accepted offer photos and keeps later uploads private to the owner", async () => {
    const photo = (await upload()).json().photo;
    const p = (await request("GET", "/properties", owner)).json().properties[0];
    const invitation = await request("POST", "/invitations", owner, {
      property_id: p.id,
      tenant_id: tenant.id,
      property_revision: p.revision,
      profile_revision: 1,
    });
    expect(invitation.statusCode).toBe(201);
    expect(
      (await request("GET", `/property-photos/${photo.id}`, tenant)).statusCode,
    ).toBe(200);
    expect(
      (
        await request(
          "POST",
          `/invitations/${invitation.json().id}/action`,
          tenant,
          {
            action: "accept",
            property_revision: p.revision,
            profile_revision: 1,
          },
        )
      ).statusCode,
    ).toBe(200);
    const next = (await upload()).json().photo;
    expect(
      (await request("GET", `/property-photos/${next.id}`, tenant)).statusCode,
    ).toBe(404);
    expect(
      (
        await request(
          "DELETE",
          `/properties/${p.id}/photos/${photo.id}`,
          owner,
          {},
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (await request("GET", `/property-photos/${photo.id}`, tenant)).statusCode,
    ).toBe(200);
    const offered = (
      await request("GET", `/invitations/${invitation.json().id}`, tenant)
    ).json().invitation.property;
    expect(offered.photos).toEqual([photo]);
    expect(
      (await request("GET", "/properties", owner)).json().properties[0].photos,
    ).toEqual([next]);
  });
  it("cancels pending invitations on photo edits and revokes their image access", async () => {
    const photo = (await upload()).json().photo,
      p = (await request("GET", "/properties", owner)).json().properties[0];
    const invitation = await request("POST", "/invitations", owner, {
      property_id: p.id,
      tenant_id: tenant.id,
      property_revision: p.revision,
      profile_revision: 1,
    });
    expect(invitation.statusCode).toBe(201);
    await upload();
    expect(
      (await request("GET", `/property-photos/${photo.id}`, tenant)).statusCode,
    ).toBe(404);
    const cancelled = (
      await request("GET", `/invitations/${invitation.json().id}`, tenant)
    ).json().invitation;
    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.property.photos).toEqual([]);
  });
  it("durably queues cascading deletion and retries storage failures", async () => {
    await upload();
    expect(objects.size).toBe(1);
    await db.query("DELETE FROM users WHERE id=$1", [owner.id]);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(1);
    vi.mocked(storage.delete).mockRejectedValueOnce(
      new Error("Transient storage failure."),
    );
    expect(await cleanupPhotoObjects(db, storage)).toBe(0);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(1);
    expect(await cleanupPhotoObjects(db, storage)).toBe(1);
    expect(objects.size).toBe(0);
  });
  it("discards stale cleanup entries without deleting a photo committed by a retry", async () => {
    const key = randomUUID(),
      photo = (await upload(png, "image/png", owner, { key })).json().photo;
    await db.query(
      "INSERT INTO photo_object_deletions(object_key) SELECT object_key FROM property_photos WHERE id=$1",
      [photo.id],
    );
    expect(await cleanupPhotoObjects(db, storage)).toBe(0);
    expect(storage.delete).not.toHaveBeenCalled();
    expect(objects.size).toBe(1);
    expect(
      (await request("GET", `/property-photos/${photo.id}`, owner)).statusCode,
    ).toBe(200);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(0);
  });
  it("acknowledges logical removal and queues a failed object deletion without blocking on unrelated cleanup", async () => {
    const photo = (await upload()).json().photo;
    const unrelated = `property-photos/${randomUUID()}.webp`;
    await db.query(
      "INSERT INTO photo_object_deletions(object_key) VALUES($1)",
      [unrelated],
    );
    vi.mocked(storage.delete).mockRejectedValueOnce(
      new Error("Storage temporarily unavailable."),
    );
    expect(
      (
        await request(
          "DELETE",
          `/properties/${property.id}/photos/${photo.id}`,
          owner,
          {},
        )
      ).statusCode,
    ).toBe(200);
    expect(storage.delete).toHaveBeenCalledTimes(1);
    expect(storage.delete).not.toHaveBeenCalledWith(unrelated);
    expect(
      (await request("GET", `/property-photos/${photo.id}`, owner)).statusCode,
    ).toBe(404);
    expect(
      (await request("GET", "/properties", owner)).json().properties[0].photos,
    ).toEqual([]);
    expect(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM photo_object_deletions",
        )
      ).rows[0].count,
    ).toBe(2);
    expect(await cleanupPhotoObjects(db, storage)).toBe(2);
  });
  it("isolates hosted preview uploads from other demo workspaces", async () => {
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
      async function enter() {
        const response = await hosted.inject({
          method: "POST",
          url: "/api/auth/preview",
          headers: {
            origin: previewOrigin,
            "content-type": "application/json",
          },
          payload: { role: "landlord" },
        });
        const cookie = response.cookies
          .map((c) => `${c.name}=${c.value}`)
          .join("; ");
        const properties = (
          await hosted.inject({
            method: "GET",
            url: "/api/properties",
            headers: { cookie },
          })
        ).json().properties;
        return { cookie, property: properties[0] };
      }
      const a = await enter(),
        b = await enter();
      const boundary = "synthetic-preview";
      const payload = Buffer.concat([
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`,
        ),
        png,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]);
      const post = (p: any, cookie: string) =>
        hosted.inject({
          method: "POST",
          url: `/api/properties/${p.id}/photos`,
          headers: {
            origin: previewOrigin,
            "content-type": `multipart/form-data; boundary=${boundary}`,
            cookie,
          },
          payload,
        });
      const uploaded = await post(a.property, a.cookie);
      expect(uploaded.statusCode).toBe(201);
      expect((await post(a.property, b.cookie)).statusCode).toBe(404);
      expect(
        (
          await hosted.inject({
            method: "GET",
            url: uploaded.json().photo.url,
            headers: { cookie: b.cookie },
          })
        ).statusCode,
      ).toBe(404);
    } finally {
      await hosted.close();
    }
  });
});
describe("photo decoding and deployment configuration", () => {
  it("rejects images whose decoded pixels exceed the limit", async () => {
    const huge = await sharp({
      create: { width: 6000, height: 6000, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    await expect(normalizePhoto(huge, "image/png")).rejects.toThrow(
      "Foto non valida",
    );
  });
  it("refuses ephemeral deployed storage and validates S3 without echoing credentials", () => {
    expect(readPhotoConfiguration({})).toEqual({ storage: "local" });
    expect(() => readPhotoConfiguration({ APP_ENV: "preview" })).toThrow(
      "persistent PHOTO_STORAGE=s3",
    );
    const configuration = {
      APP_ENV: "preview",
      PHOTO_STORAGE: "s3",
      S3_ENDPOINT: "https://storage.example.test",
      S3_REGION: "auto",
      S3_BUCKET: "photo-tests",
      S3_ACCESS_KEY_ID: "synthetic-key",
      S3_SECRET_ACCESS_KEY: "synthetic-secret",
    };
    expect(readPhotoConfiguration(configuration)).toMatchObject({
      storage: "s3",
      forcePathStyle: false,
    });
    expect(
      readPhotoConfiguration({ ...configuration, S3_FORCE_PATH_STYLE: "true" }),
    ).toMatchObject({ forcePathStyle: true });
    for (const patch of [
      { S3_ENDPOINT: "http://storage.example.test" },
      { S3_ENDPOINT: "https://user:synthetic-secret@storage.example.test" },
      { S3_SECRET_ACCESS_KEY: "" },
      { S3_FORCE_PATH_STYLE: "yes" },
    ]) {
      expect(() =>
        readPhotoConfiguration({ ...configuration, ...patch }),
      ).toThrow();
      try {
        readPhotoConfiguration({ ...configuration, ...patch });
      } catch (error) {
        expect(String(error)).not.toContain("synthetic-secret");
      }
    }
  });
});

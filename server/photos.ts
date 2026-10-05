import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { localDir } from "./config.js";
import { Problem } from "./domain.js";
import { tx, type DB } from "./db.js";
import type { PoolClient } from "pg";

export const photoLimits = {
  count: 6,
  bytes: 5 * 1024 * 1024,
  pixels: 25_000_000,
  dimension: 1600,
} as const;
export interface PropertyPhoto {
  id: string;
  url: string;
  width: number;
  height: number;
  position: number;
}
export interface ProfilePhoto {
  id: string;
  url: string;
  width: number;
  height: number;
}
export interface PhotoStorage {
  put(key: string, body: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  close?(): void;
}
export type PhotoConfiguration =
  | { storage: "local" }
  | {
      storage: "s3";
      endpoint: string;
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      forcePathStyle: boolean;
    };
export function readPhotoConfiguration(
  env: Record<string, string | undefined> = process.env,
): PhotoConfiguration {
  const storage = env.PHOTO_STORAGE || "local";
  if (!["local", "s3"].includes(storage))
    throw new Error("PHOTO_STORAGE must be local or s3.");
  if (env.APP_ENV && env.APP_ENV !== "local" && storage !== "s3")
    throw new Error(
      "Preview, staging and production require persistent PHOTO_STORAGE=s3.",
    );
  if (storage === "local") return { storage };
  let endpoint: URL;
  try {
    endpoint = new URL(env.S3_ENDPOINT || "");
  } catch {
    throw new Error("S3_ENDPOINT must be an HTTPS origin.");
  }
  if (
    endpoint.protocol !== "https:" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash ||
    endpoint.pathname !== "/"
  )
    throw new Error("S3_ENDPOINT must be an HTTPS origin.");
  for (const name of [
    "S3_REGION",
    "S3_BUCKET",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
  ])
    if (!env[name]?.trim())
      throw new Error(`${name} is required for persistent photo storage.`);
  if (
    env.S3_FORCE_PATH_STYLE &&
    !["true", "false"].includes(env.S3_FORCE_PATH_STYLE)
  )
    throw new Error("S3_FORCE_PATH_STYLE must be true or false.");
  return {
    storage: "s3",
    endpoint: endpoint.origin,
    region: env.S3_REGION!,
    bucket: env.S3_BUCKET!,
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
  };
}
const validKey = (key: string) => {
  if (
    !/^(?:(?:property|profile|profile-member)-photos\/[a-f0-9-]{36}\.webp|income-documents\/[a-f0-9-]{36}\.(?:pdf|webp))$/.test(
      key,
    )
  )
    throw new Error("Invalid photo object key.");
  return key;
};
export const photoObjectKey = (id: string = randomUUID()) =>
  `property-photos/${id}.webp`;
export const profilePhotoObjectKey = (id: string = randomUUID()) =>
  `profile-photos/${id}.webp`;
export const memberPhotoObjectKey = (id: string = randomUUID()) =>
  `profile-member-photos/${id}.webp`;
export function createPhotoStorage(
  config = readPhotoConfiguration(),
): PhotoStorage {
  if (config.storage === "local") {
    const target = (key: string) => path.join(localDir, validKey(key));
    return {
      async put(key, body) {
        await mkdir(path.dirname(target(key)), {
          recursive: true,
          mode: 0o700,
        });
        await writeFile(target(key), body, { mode: 0o600, flag: "wx" });
      },
      async get(key) {
        return readFile(target(key));
      },
      async delete(key) {
        try {
          await unlink(target(key));
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
        }
      },
    };
  }
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    maxAttempts: 2,
    requestHandler: {
      connectionTimeout: 5000,
      requestTimeout: 15000,
      throwOnRequestTimeout: true,
    },
  });
  return {
    async put(key, body) {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: validKey(key),
          Body: body,
          ContentType: key.endsWith(".pdf") ? "application/pdf" : "image/webp",
          ...(key.startsWith("income-documents/")
            ? { ContentDisposition: "attachment" }
            : {}),
          CacheControl: "private, no-store",
        }),
      );
    },
    async get(key) {
      const result = await client.send(
        new GetObjectCommand({ Bucket: config.bucket, Key: validKey(key) }),
      );
      if (!result.Body) throw new Error("Photo object unavailable.");
      return Buffer.from(await result.Body.transformToByteArray());
    },
    async delete(key) {
      await client.send(
        new DeleteObjectCommand({ Bucket: config.bucket, Key: validKey(key) }),
      );
    },
    close() {
      client.destroy();
    },
  };
}
export async function normalizePhoto(body: Buffer, mimetype: string) {
  if (body.length > photoLimits.bytes)
    throw new Problem(413, "Ogni foto può pesare al massimo 5 MB.");
  const formats: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (!formats[mimetype])
    throw new Problem(415, "Scegli una foto JPEG, PNG o WebP.");
  try {
    const image = sharp(body, {
      limitInputPixels: photoLimits.pixels,
      animated: false,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    if (metadata.format !== formats[mimetype] || (metadata.pages || 1) > 1)
      throw new Error("Invalid photo format.");
    const { data, info } = await image
      .rotate()
      .resize({
        width: photoLimits.dimension,
        height: photoLimits.dimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    if (data.length > photoLimits.bytes) throw new Error("Photo too large.");
    return { body: data, width: info.width, height: info.height };
  } catch {
    throw new Problem(
      400,
      "Foto non valida o troppo grande. Scegli un’immagine JPEG, PNG o WebP più piccola.",
    );
  }
}
export const photoView = (photo: any): PropertyPhoto => ({
  id: photo.id,
  url: `/api/property-photos/${photo.id}`,
  width: photo.width,
  height: photo.height,
  position: photo.position,
});
export const profilePhotoView = (photo: any): ProfilePhoto => ({
  id: photo.id,
  url: `/api/profile-photos/${photo.id}`,
  width: photo.width,
  height: photo.height,
});

// Callers use aliases ph (photo) and subject (its owner), with $1 as viewer.
// A photo is shared only after both parties have accepted a conversation.
export const profilePhotoVisibility = `subject.suspended=false AND
 (ph.user_id=$1 OR
  (EXISTS(SELECT 1 FROM users viewer WHERE viewer.id=$1 AND viewer.suspended=false)
   AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=ph.user_id) OR (b.blocker_id=ph.user_id AND b.blocked_id=$1))
   AND EXISTS(SELECT 1 FROM invitations i WHERE i.status IN ('accepted','closed') AND
    ((i.tenant_id=ph.user_id AND i.landlord_id=$1) OR (i.landlord_id=ph.user_id AND i.tenant_id=$1)))))`;

export async function profilePhotos(
  db: DB | PoolClient,
  viewerId: string,
  userIds: string[],
  allowedUserIds?: string[],
) {
  const photos = new Map<string, ProfilePhoto>();
  if (!userIds.length) return photos;
  const { rows } = await db.query(
    `SELECT ph.id,ph.user_id,ph.width,ph.height FROM profile_photos ph JOIN users subject ON subject.id=ph.user_id WHERE ph.user_id=ANY($2::uuid[]) AND ($3::uuid[] IS NULL OR ph.user_id=ANY($3)) AND ${profilePhotoVisibility}`,
    [viewerId, userIds, allowedUserIds || null],
  );
  for (const row of rows) photos.set(row.user_id, profilePhotoView(row));
  return photos;
}
export async function propertyPhotos(db: DB | PoolClient, ids: string[]) {
  const photos = new Map<string, PropertyPhoto[]>();
  if (!ids.length) return photos;
  const { rows } = await db.query(
    "SELECT id,property_id,width,height,position FROM property_photos WHERE property_id=ANY($1::uuid[]) AND deleted_at IS NULL ORDER BY position,id",
    [ids],
  );
  for (const row of rows)
    photos.set(row.property_id, [
      ...(photos.get(row.property_id) || []),
      photoView(row),
    ]);
  return photos;
}
export async function cleanupPhotoObjects(
  db: DB,
  storage: PhotoStorage,
  keys?: string[],
) {
  // Accepted offers retain the images originally shown, even after an owner removes a photo.
  await db.query(
    `DELETE FROM property_photos p WHERE ($1::text[] IS NULL OR p.object_key=ANY($1)) AND p.deleted_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM invitations i WHERE i.property_id=p.property_id AND i.status IN ('accepted','closed') AND i.property_snapshot->'photos' @> jsonb_build_array(jsonb_build_object('id',p.id::text)))`,
    [keys || null],
  );
  const { rows } = await db.query(
    "SELECT object_key FROM photo_object_deletions WHERE $1::text[] IS NULL OR object_key=ANY($1) ORDER BY created_at LIMIT 100",
    [keys || null],
  );
  let removed = 0;
  for (const { object_key } of rows) {
    try {
      validKey(object_key);
      const deleted = await tx(db, async (c) => {
        const photoId = path.basename(object_key, path.extname(object_key));
        await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
          photoId,
        ]);
        // A successful retry may have reused an object previously queued after rollback.
        const referenced = (
          await c.query(
            "SELECT 1 FROM property_photos WHERE object_key=$1 UNION ALL SELECT 1 FROM profile_photos WHERE object_key=$1 UNION ALL SELECT 1 FROM profile_member_photos WHERE object_key=$1 UNION ALL SELECT 1 FROM income_documents WHERE object_key=$1",
            [object_key],
          )
        ).rowCount;
        if (!referenced) await storage.delete(object_key);
        await c.query(
          "DELETE FROM photo_object_deletions WHERE object_key=$1",
          [object_key],
        );
        return !referenced;
      });
      if (deleted) removed++;
    } catch {
      /* Keep durable queue entries for the next maintenance retry. */
    }
  }
  return removed;
}

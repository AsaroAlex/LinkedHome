import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { PoolClient } from "pg";
import { z } from "zod";
import type { User } from "./auth.js";
import { lockUsers, tx, type DB } from "./db.js";
import { requireThat } from "./domain.js";
import {
  cleanupPhotoObjects,
  normalizePhoto,
  photoLimits,
  memberPhotoObjectKey,
  type PhotoStorage,
  type ProfilePhoto,
} from "./photos.js";

export type HouseholdMode = "group" | "individual";
export type HouseholdMember = {
  id: string;
  display_name: string;
  photo: ProfilePhoto | null;
};
export type Household = {
  mode: HouseholdMode;
  members: HouseholdMember[];
};
const uuid = z.string().uuid();
const memberName = z.string().trim().min(1).max(80);
const memberPhotoView = (photo: any): ProfilePhoto => ({
  id: photo.id,
  url: `/api/profile-member-photos/${photo.id}`,
  width: photo.width,
  height: photo.height,
});
const memberView = (member: any): HouseholdMember => ({
  id: member.id,
  display_name: member.display_name,
  photo: member.photo_id
    ? memberPhotoView({
        id: member.photo_id,
        width: member.photo_width,
        height: member.photo_height,
      })
    : null,
});
const memberColumns =
  "m.id,m.user_id,m.display_name,ph.id AS photo_id,ph.width AS photo_width,ph.height AS photo_height";

async function ownerMember(db: DB | PoolClient, userId: string, id: string) {
  return (
    await db.query(
      `SELECT ${memberColumns} FROM profile_household_members m LEFT JOIN profile_member_photos ph ON ph.member_id=m.id WHERE m.id=$1 AND m.user_id=$2`,
      [id, userId],
    )
  ).rows[0];
}

async function activeUser(c: PoolClient, userId: string) {
  const user = (
    await c.query("SELECT suspended FROM users WHERE id=$1", [userId])
  ).rows[0];
  requireThat(user && !user.suspended, "Account non disponibile.", 403);
}

async function lockPhotoIds(c: PoolClient, ids: (string | undefined)[]) {
  for (const id of [
    ...new Set(ids.filter((id): id is string => Boolean(id))),
  ].sort())
    await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [id]);
}

async function membersForUsers(db: DB | PoolClient, userIds: string[]) {
  const members = new Map<string, HouseholdMember[]>();
  if (!userIds.length) return members;
  const { rows } = await db.query(
    `SELECT ${memberColumns} FROM profile_household_members m LEFT JOIN profile_member_photos ph ON ph.member_id=m.id WHERE m.user_id=ANY($1::uuid[]) ORDER BY m.created_at,m.id`,
    [userIds],
  );
  for (const row of rows)
    members.set(row.user_id, [
      ...(members.get(row.user_id) || []),
      memberView(row),
    ]);
  return members;
}

export async function ownHousehold(
  db: DB | PoolClient,
  userId: string,
): Promise<Household> {
  const [settings, members] = await Promise.all([
    db.query("SELECT mode FROM profile_households WHERE user_id=$1", [userId]),
    membersForUsers(db, [userId]),
  ]);
  return {
    mode: settings.rows[0]?.mode || "group",
    members: members.get(userId) || [],
  };
}

export async function sharedTenantHouseholds(
  db: DB,
  viewerId: string,
  invitationIds: string[],
  allowedUserIds?: string[],
) {
  const result = new Map<string, Household>();
  if (!invitationIds.length) return result;
  const { rows } = await db.query(
    `SELECT i.id AS invitation_id,COALESCE(h.mode,'group') AS mode,m.id AS member_id,m.display_name,ph.id AS photo_id,ph.width AS photo_width,ph.height AS photo_height FROM invitations i LEFT JOIN profile_households h ON h.user_id=i.tenant_id LEFT JOIN profile_household_members m ON m.user_id=i.tenant_id AND h.mode='individual' LEFT JOIN profile_member_photos ph ON ph.member_id=m.id JOIN users tenant ON tenant.id=i.tenant_id JOIN users landlord ON landlord.id=i.landlord_id WHERE i.id=ANY($2::uuid[]) AND (i.tenant_id=$1 OR i.landlord_id=$1) AND i.status IN ('accepted','closed') AND tenant.suspended=false AND landlord.suspended=false AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker_id=i.tenant_id AND b.blocked_id=i.landlord_id) OR (b.blocker_id=i.landlord_id AND b.blocked_id=i.tenant_id)) AND ($3::uuid[] IS NULL OR (i.tenant_id=ANY($3) AND i.landlord_id=ANY($3))) ORDER BY i.id,m.created_at,m.id`,
    [viewerId, invitationIds, allowedUserIds || null],
  );
  for (const row of rows) {
    const household: Household = result.get(row.invitation_id) || {
      mode: row.mode,
      members: [],
    };
    if (row.member_id)
      household.members.push(memberView({ ...row, id: row.member_id }));
    result.set(row.invitation_id, household);
  }
  return result;
}

// $1 is the viewer; aliases m, subject and h represent member, owner and mode.
const memberPhotoVisibility = `subject.suspended=false AND
 (m.user_id=$1 OR
  (COALESCE(h.mode,'group')='individual'
   AND EXISTS(SELECT 1 FROM users viewer WHERE viewer.id=$1 AND viewer.suspended=false)
   AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=m.user_id) OR (b.blocker_id=m.user_id AND b.blocked_id=$1))
   AND EXISTS(SELECT 1 FROM invitations i WHERE i.status IN ('accepted','closed') AND
    i.tenant_id=m.user_id AND i.landlord_id=$1)))`;

export function registerHouseholdRoutes(
  app: FastifyInstance,
  db: DB,
  storage: PhotoStorage,
  options: {
    actor: (request: FastifyRequest, options?: { role?: "tenant" }) => User;
    preview: boolean;
  },
) {
  const { actor, preview } = options;
  app.put("/api/profile/household", async (r) => {
    const user = actor(r, { role: "tenant" });
    const { mode } = z
      .object({ mode: z.enum(["group", "individual"]) })
      .strict()
      .parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [user.id]);
      await activeUser(c, user.id);
      await c.query(
        "INSERT INTO profile_households(user_id,mode) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET mode=EXCLUDED.mode",
        [user.id, mode],
      );
    });
    return { ok: true };
  });
  app.post("/api/profile/members", async (r, reply) => {
    const user = actor(r, { role: "tenant" });
    const input = z
      .object({ id: uuid, display_name: memberName })
      .strict()
      .parse(r.body);
    const member = await tx(db, async (c) => {
      await lockUsers(c, [user.id]);
      await activeUser(c, user.id);
      await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        input.id,
      ]);
      const used = (
        await c.query(
          "SELECT user_id FROM profile_household_member_requests WHERE id=$1",
          [input.id],
        )
      ).rows[0];
      if (used) {
        const current = await ownerMember(c, user.id, input.id);
        requireThat(
          used.user_id === user.id && current,
          "Richiesta già utilizzata. Aggiungi nuovamente la persona.",
          409,
        );
        return memberView(current);
      }
      const count = (
        await c.query(
          "SELECT count(*)::int AS count FROM profile_household_members WHERE user_id=$1",
          [user.id],
        )
      ).rows[0].count;
      requireThat(count < 11, "Puoi aggiungere fino a 11 altre persone.", 409);
      await c.query(
        "INSERT INTO profile_household_member_requests(id,user_id) VALUES($1,$2)",
        [input.id, user.id],
      );
      const row = (
        await c.query(
          "INSERT INTO profile_household_members(id,user_id,display_name) VALUES($1,$2,$3) RETURNING id,display_name",
          [input.id, user.id, input.display_name],
        )
      ).rows[0];
      return memberView(row);
    });
    return reply.code(201).send({ member });
  });
  app.put("/api/profile/members/:id", async (r) => {
    const user = actor(r, { role: "tenant" });
    const id = uuid.parse((r.params as { id: string }).id);
    const { display_name } = z
      .object({ display_name: memberName })
      .strict()
      .parse(r.body);
    const member = await tx(db, async (c) => {
      await lockUsers(c, [user.id]);
      await activeUser(c, user.id);
      const updated = await c.query(
        "UPDATE profile_household_members SET display_name=$3 WHERE id=$1 AND user_id=$2 RETURNING id",
        [id, user.id, display_name],
      );
      requireThat(updated.rowCount, "Persona non trovata.", 404);
      return memberView(await ownerMember(c, user.id, id));
    });
    return { member };
  });
  app.delete("/api/profile/members/:id", async (r) => {
    const user = actor(r, { role: "tenant" });
    const id = uuid.parse((r.params as { id: string }).id);
    const key = await tx(db, async (c) => {
      await lockUsers(c, [user.id]);
      await activeUser(c, user.id);
      const photo = (
        await c.query(
          "SELECT ph.id,ph.object_key FROM profile_member_photos ph JOIN profile_household_members m ON m.id=ph.member_id WHERE m.id=$1 AND m.user_id=$2",
          [id, user.id],
        )
      ).rows[0];
      await lockPhotoIds(c, [photo?.id]);
      await c.query(
        "DELETE FROM profile_household_members WHERE id=$1 AND user_id=$2",
        [id, user.id],
      );
      return photo?.object_key as string | undefined;
    });
    if (key) await cleanupPhotoObjects(db, storage, [key]).catch(() => {});
    return { ok: true };
  });
  app.post(
    "/api/profile/members/:id/photo",
    { bodyLimit: photoLimits.bytes + 65536 },
    async (r, reply) => {
      const user = actor(r, { role: "tenant" });
      const memberId = uuid.parse((r.params as { id: string }).id);
      requireThat(
        await ownerMember(db, user.id, memberId),
        "Persona non trovata.",
        404,
      );
      let input: { body: Buffer; mimetype: string } | undefined;
      for await (const part of r.parts()) {
        requireThat(
          part.type === "file" &&
            ["photo", "file"].includes(part.fieldname) &&
            !input,
          "Carica una foto alla volta, senza altri campi.",
          400,
        );
        if (part.type === "file")
          input = { body: await part.toBuffer(), mimetype: part.mimetype };
      }
      requireThat(input, "Scegli una foto da caricare.", 400);
      const image = await normalizePhoto(input!.body, input!.mimetype);
      const photoId = r.headers["idempotency-key"]
        ? uuid.parse(r.headers["idempotency-key"])
        : randomUUID();
      const key = memberPhotoObjectKey(photoId);
      let attempted = false;
      try {
        const result = await tx(db, async (c) => {
          await lockUsers(c, [user.id]);
          await activeUser(c, user.id);
          requireThat(
            await ownerMember(c, user.id, memberId),
            "Persona non trovata.",
            404,
          );
          const previous = (
            await c.query(
              "SELECT id,object_key FROM profile_member_photos WHERE member_id=$1",
              [memberId],
            )
          ).rows[0];
          await lockPhotoIds(c, [photoId, previous?.id]);
          const used = (
            await c.query(
              "SELECT user_id,member_id FROM profile_photo_upload_requests WHERE id=$1",
              [photoId],
            )
          ).rows[0];
          if (used) {
            const current = (
              await c.query(
                "SELECT id,width,height FROM profile_member_photos WHERE id=$1 AND member_id=$2",
                [photoId, memberId],
              )
            ).rows[0];
            requireThat(
              used.user_id === user.id &&
                used.member_id === memberId &&
                current,
              "Richiesta foto già utilizzata. Seleziona nuovamente la foto.",
              409,
            );
            return { photo: memberPhotoView(current), replacedKey: null };
          }
          if (
            (
              await c.query(
                "SELECT 1 FROM photo_object_deletions WHERE object_key=$1",
                [key],
              )
            ).rowCount
          )
            await storage.delete(key);
          attempted = true;
          await storage.put(key, image.body);
          await c.query(
            "INSERT INTO profile_photo_upload_requests(id,user_id,member_id) VALUES($1,$2,$3)",
            [photoId, user.id, memberId],
          );
          const row = (
            await c.query(
              "INSERT INTO profile_member_photos(id,member_id,object_key,width,height,byte_size) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(member_id) DO UPDATE SET id=EXCLUDED.id,object_key=EXCLUDED.object_key,width=EXCLUDED.width,height=EXCLUDED.height,byte_size=EXCLUDED.byte_size,created_at=now() RETURNING id,width,height",
              [
                photoId,
                memberId,
                key,
                image.width,
                image.height,
                image.body.length,
              ],
            )
          ).rows[0];
          await c.query(
            "DELETE FROM photo_object_deletions WHERE object_key=$1",
            [key],
          );
          return {
            photo: memberPhotoView(row),
            replacedKey: previous?.object_key as string | undefined,
          };
        });
        if (result.replacedKey)
          await cleanupPhotoObjects(db, storage, [result.replacedKey]).catch(
            () => {},
          );
        return reply.code(201).send({ photo: result.photo });
      } catch (error) {
        if (attempted) {
          await db
            .query(
              "INSERT INTO photo_object_deletions(object_key) VALUES($1) ON CONFLICT DO NOTHING",
              [key],
            )
            .catch(() => {});
          await cleanupPhotoObjects(db, storage, [key]).catch(() => {});
        }
        throw error;
      }
    },
  );
  app.delete("/api/profile/members/:id/photo", async (r) => {
    const user = actor(r, { role: "tenant" });
    const memberId = uuid.parse((r.params as { id: string }).id);
    const key = await tx(db, async (c) => {
      await lockUsers(c, [user.id]);
      await activeUser(c, user.id);
      requireThat(
        await ownerMember(c, user.id, memberId),
        "Persona non trovata.",
        404,
      );
      const photo = (
        await c.query(
          "SELECT id FROM profile_member_photos WHERE member_id=$1",
          [memberId],
        )
      ).rows[0];
      await lockPhotoIds(c, [photo?.id]);
      return (
        await c.query(
          "DELETE FROM profile_member_photos WHERE member_id=$1 RETURNING object_key",
          [memberId],
        )
      ).rows[0]?.object_key as string | undefined;
    });
    if (key) await cleanupPhotoObjects(db, storage, [key]).catch(() => {});
    return { ok: true };
  });
  app.get("/api/profile-member-photos/:id", async (r, reply) => {
    const user = actor(r);
    const id = uuid.parse((r.params as { id: string }).id);
    const photo = (
      await db.query(
        `SELECT ph.object_key FROM profile_member_photos ph JOIN profile_household_members m ON m.id=ph.member_id JOIN users subject ON subject.id=m.user_id LEFT JOIN profile_households h ON h.user_id=m.user_id WHERE ph.id=$2 AND ($3::uuid[] IS NULL OR m.user_id=ANY($3)) AND ${memberPhotoVisibility}`,
        [
          user.id,
          id,
          preview
            ? [r.previewWorkspace!.tenant_id, r.previewWorkspace!.landlord_id]
            : null,
        ],
      )
    ).rows[0];
    requireThat(photo, "Foto non disponibile.", 404);
    return reply
      .type("image/webp")
      .header("Cache-Control", "private, no-store")
      .header("Content-Disposition", 'inline; filename="persona.webp"')
      .send(await storage.get(photo.object_key));
  });
}

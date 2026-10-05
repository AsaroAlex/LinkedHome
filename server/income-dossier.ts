import type { FastifyInstance, FastifyRequest } from "fastify";
import type { PoolClient } from "pg";
import { z } from "zod";
import type { User } from "./auth.js";
import { lockUsers, tx, type DB } from "./db.js";
import { requireThat } from "./domain.js";
import { cleanupPhotoObjects, type PhotoStorage } from "./photos.js";
import {
  normalizeIncomeDocument,
  incomeDocumentKey,
  incomeDocumentLimits,
} from "./income-documents.js";
import {
  incomeDossierInput,
  incomeReviewInput,
  documentKinds,
  incomeTotals,
  incomeComparison,
  type IncomePerson,
} from "../shared/income-dossier.js";

const uuid = z
  .string()
  .uuid()
  .transform((id) => id.toLowerCase());
const revision = z.coerce.number().int().positive();
const allowedUsers = (r: FastifyRequest, preview: boolean) =>
  preview
    ? [r.previewWorkspace!.tenant_id, r.previewWorkspace!.landlord_id]
    : null;
const people = (d: any): IncomePerson[] => [
  ...d.tenants,
  ...(d.guarantor ? [d.guarantor] : []),
];
const documentView = (d: any) => ({
  id: d.id,
  person_id: d.person_id,
  kind: d.kind,
  mime: d.mime,
  bytes: d.byte_size,
  created_at: d.created_at,
  url: `/api/income/dossier/documents/${d.id}`,
});
const reviewView = (r: any) => ({
  id: r.id,
  person_id: r.person_id,
  document_id: r.document_id,
  revision: r.revision,
  observed_net_cents: r.observed_net_cents,
  period_from: r.period_from,
  period_to: r.period_to,
  reviewed_at: r.reviewed_at,
  method: r.method,
});
const shareView = (s: any) => ({
  id: s.id,
  dossier_id: s.dossier_id,
  revision: s.revision,
  invitation_id: s.invitation_id,
  recipient_id: s.recipient_id,
  property_title: s.property_title,
  recipient_label: s.recipient_label,
  consent_version: s.consent_version,
  documents_consent: s.documents_consent,
  consented_at: s.consented_at,
  revoked_at: s.revoked_at,
  available: Boolean(s.available),
  status: s.revoked_at ? "revoked" : s.available ? "shared" : "unavailable",
});
// Parameters $1 and $2 always represent viewer and optional preview member IDs.
const shareSelect = `SELECT s.*,COALESCE(i.property_snapshot->>'title',p.title) AS property_title,
 CASE WHEN i.status='accepted' THEN recipient.display_name ELSE 'Proprietario dell’immobile' END AS recipient_label,
 (s.revoked_at IS NULL AND s.revision=d.revision AND d.user_id=s.owner_id
  AND i.tenant_id=s.owner_id AND i.landlord_id=s.recipient_id AND i.status='accepted'
  AND holder.suspended=false AND recipient.suspended=false
  AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker_id=s.owner_id AND b.blocked_id=s.recipient_id) OR (b.blocker_id=s.recipient_id AND b.blocked_id=s.owner_id))
  AND ($2::uuid[] IS NULL OR (s.owner_id=ANY($2) AND s.recipient_id=ANY($2)))) AS available
 FROM income_dossier_shares s JOIN income_dossiers d ON d.id=s.dossier_id
 JOIN invitations i ON i.id=s.invitation_id JOIN properties p ON p.id=i.property_id
 JOIN users holder ON holder.id=s.owner_id JOIN users recipient ON recipient.id=s.recipient_id`;

async function dossierView(c: DB | PoolClient, d: any) {
  if (!d) return null;
  const docs = await c.query(
    "SELECT * FROM income_documents WHERE dossier_id=$1 ORDER BY created_at,id",
    [d.id],
  );
  return {
    id: d.id,
    revision: d.revision,
    tenants: d.tenants,
    guarantor: d.guarantor,
    totals: incomeTotals(d.tenants),
    documents: docs.rows.map(documentView),
    updated_at: d.updated_at,
    synthetic: d.synthetic,
  };
}
export async function ownIncomeDossier(
  c: DB | PoolClient,
  userId: string,
  workspaceIds: string[] | null = null,
) {
  const d = (
    await c.query("SELECT * FROM income_dossiers WHERE user_id=$1", [userId])
  ).rows[0];
  const shares = await c.query(
    `${shareSelect} WHERE s.owner_id=$1 ORDER BY s.consented_at DESC,s.id DESC`,
    [userId, workspaceIds],
  );
  return {
    dossier: await dossierView(c, d),
    shares: shares.rows.map(shareView),
  };
}
async function active(c: PoolClient, userId: string) {
  const u = (await c.query("SELECT suspended FROM users WHERE id=$1", [userId]))
    .rows[0];
  requireThat(u && !u.suspended, "Account non disponibile.", 403);
}
async function revokeChanged(c: PoolClient, dossierId: string) {
  await c.query(
    "UPDATE income_dossier_shares SET revoked_at=now(),revocation_reason='changed' WHERE dossier_id=$1 AND revoked_at IS NULL",
    [dossierId],
  );
}
async function advance(c: PoolClient, dossierId: string) {
  await revokeChanged(c, dossierId);
  return (
    await c.query(
      "UPDATE income_dossiers SET revision=revision+1,updated_at=clock_timestamp() WHERE id=$1 RETURNING *",
      [dossierId],
    )
  ).rows[0];
}
async function contact(
  c: PoolClient,
  r: FastifyRequest,
  id: string,
  viewer: User,
  preview: boolean,
) {
  const before = (
    await c.query(
      "SELECT * FROM invitations WHERE id=$1 AND (tenant_id=$2 OR landlord_id=$2)",
      [id, viewer.id],
    )
  ).rows[0];
  requireThat(before, "Invito non disponibile.", 404);
  await lockUsers(c, [before.tenant_id, before.landlord_id]);
  const i = (
    await c.query(
      `SELECT i.*,(tenant.suspended=false AND landlord.suspended=false
     AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker_id=i.tenant_id AND b.blocked_id=i.landlord_id) OR (b.blocker_id=i.landlord_id AND b.blocked_id=i.tenant_id))
     AND ($3::uuid[] IS NULL OR (i.tenant_id=ANY($3) AND i.landlord_id=ANY($3)))) AS permitted
     FROM invitations i JOIN users tenant ON tenant.id=i.tenant_id JOIN users landlord ON landlord.id=i.landlord_id
     WHERE i.id=$1 AND (i.tenant_id=$2 OR i.landlord_id=$2) FOR UPDATE OF i`,
      [id, viewer.id, allowedUsers(r, preview)],
    )
  ).rows[0];
  return i;
}

export function registerIncomeDossierRoutes(
  app: FastifyInstance,
  db: DB,
  storage: PhotoStorage,
  options: {
    actor: (
      r: FastifyRequest,
      options?: { role?: "tenant"; allowSuspended?: boolean },
    ) => User;
    preview: boolean;
    synthetic: boolean;
  },
) {
  const { actor, preview, synthetic } = options;
  app.get("/api/income/dossier", async (r) => {
    const u = actor(r);
    return ownIncomeDossier(db, u.id, allowedUsers(r, preview));
  });
  app.put("/api/income/dossier", async (r) => {
    const u = actor(r, { role: "tenant" });
    const input = incomeDossierInput.parse(r.body);
    const d = await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      const prior = (
        await c.query(
          "SELECT * FROM income_dossiers WHERE user_id=$1 FOR UPDATE",
          [u.id],
        )
      ).rows[0];
      requireThat(
        prior
          ? input.expected_revision === prior.revision
          : input.expected_revision === null,
        "Il riepilogo è cambiato. Ricaricalo prima di salvare.",
        409,
      );
      if (!prior) {
        return (
          await c.query(
            "INSERT INTO income_dossiers(user_id,tenants,guarantor,people_permission,synthetic) VALUES($1,$2::jsonb,$3::jsonb,true,$4) RETURNING *",
            [
              u.id,
              JSON.stringify(input.tenants),
              input.guarantor ? JSON.stringify(input.guarantor) : null,
              synthetic,
            ],
          )
        ).rows[0];
      }
      await revokeChanged(c, prior.id);
      const ids = [
        ...input.tenants,
        ...(input.guarantor ? [input.guarantor] : []),
      ].map((p) => p.id);
      const removed = (
        await c.query(
          "SELECT id FROM income_documents WHERE dossier_id=$1 AND NOT(person_id=ANY($2::uuid[])) ORDER BY id",
          [prior.id, ids],
        )
      ).rows;
      for (const doc of removed)
        await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
          doc.id,
        ]);
      await c.query(
        "DELETE FROM income_documents WHERE dossier_id=$1 AND NOT(person_id=ANY($2::uuid[]))",
        [prior.id, ids],
      );
      return (
        await c.query(
          "UPDATE income_dossiers SET tenants=$2::jsonb,guarantor=$3::jsonb,people_permission=true,revision=revision+1,updated_at=clock_timestamp() WHERE id=$1 RETURNING *",
          [
            prior.id,
            JSON.stringify(input.tenants),
            input.guarantor ? JSON.stringify(input.guarantor) : null,
          ],
        )
      ).rows[0];
    });
    await cleanupPhotoObjects(db, storage).catch(() => {});
    return { dossier: await dossierView(db, d) };
  });
  app.post(
    "/api/income/dossier/people/:personId/documents",
    { bodyLimit: incomeDocumentLimits.bytes + 65536 },
    async (r, reply) => {
      const u = actor(r, { role: "tenant" });
      const personId = uuid.parse((r.params as any).personId);
      const input = z
        .object({ revision, kind: z.enum(documentKinds) })
        .strict()
        .parse(r.query);
      const uploadId = uuid.parse(r.headers["idempotency-key"]);
      let file: { body: Buffer; mime: string } | undefined;
      for await (const part of r.parts()) {
        requireThat(
          part.type === "file" &&
            ["document", "file"].includes(part.fieldname) &&
            !file,
          "Carica un documento alla volta, senza altri campi.",
          400,
        );
        if (part.type === "file")
          file = { body: await part.toBuffer(), mime: part.mimetype };
      }
      requireThat(file, "Scegli un documento da caricare.", 400);
      const normalized = await normalizeIncomeDocument(file!.body, file!.mime);
      const key = incomeDocumentKey(uploadId, normalized.extension);
      let attempted = false;
      try {
        const result = await tx(db, async (c) => {
          await lockUsers(c, [u.id]);
          await active(c, u.id);
          await c.query(
            "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
            [uploadId],
          );
          const used = (
            await c.query(
              "SELECT * FROM income_document_upload_requests WHERE id=$1",
              [uploadId],
            )
          ).rows[0];
          const d = (
            await c.query(
              "SELECT * FROM income_dossiers WHERE user_id=$1 FOR UPDATE",
              [u.id],
            )
          ).rows[0];
          requireThat(d, "Salva prima il riepilogo dei redditi.", 409);
          if (used) {
            requireThat(
              used.user_id === u.id &&
                used.dossier_id === d.id &&
                used.person_id === personId &&
                used.kind === input.kind &&
                used.mime === normalized.mime &&
                used.sha256 === normalized.sha256 &&
                used.document_id,
              "Richiesta già utilizzata. Scegli nuovamente il documento.",
              409,
            );
            const doc = (
              await c.query(
                "SELECT * FROM income_documents WHERE id=$1 AND dossier_id=$2",
                [used.document_id, d.id],
              )
            ).rows[0];
            requireThat(doc, "Documento rimosso. Sceglilo nuovamente.", 409);
            return {
              document: documentView(doc),
              dossier: await dossierView(c, d),
            };
          }
          requireThat(
            d.revision === input.revision,
            "Il riepilogo è cambiato. Ricaricalo prima di caricare il documento.",
            409,
          );
          requireThat(
            people(d).some((p) => p.id === personId),
            "Persona non presente nel riepilogo.",
            404,
          );
          const count = (
            await c.query(
              "SELECT count(*)::int AS count FROM income_documents WHERE dossier_id=$1 AND person_id=$2",
              [d.id, personId],
            )
          ).rows[0].count;
          requireThat(
            count < incomeDocumentLimits.countPerPerson,
            "Puoi caricare fino a tre documenti per persona.",
            409,
          );
          requireThat(
            !(
              await c.query("SELECT 1 FROM income_documents WHERE id=$1", [
                uploadId,
              ])
            ).rowCount,
            "Richiesta già utilizzata.",
            409,
          );
          // This UUID has no live metadata. Retrying a crashed first write may safely replace an orphan.
          await storage.delete(key);
          attempted = true;
          await storage.put(key, normalized.data);
          const doc = (
            await c.query(
              "INSERT INTO income_documents(id,dossier_id,person_id,kind,mime,byte_size,sha256,object_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
              [
                uploadId,
                d.id,
                personId,
                input.kind,
                normalized.mime,
                normalized.data.length,
                normalized.sha256,
                key,
              ],
            )
          ).rows[0];
          await c.query(
            "INSERT INTO income_document_upload_requests(id,user_id,dossier_id,person_id,document_id,kind,mime,sha256) VALUES($1,$2,$3,$4,$1,$5,$6,$7)",
            [
              uploadId,
              u.id,
              d.id,
              personId,
              input.kind,
              normalized.mime,
              normalized.sha256,
            ],
          );
          await c.query(
            "DELETE FROM photo_object_deletions WHERE object_key=$1",
            [key],
          );
          const changed = await advance(c, d.id);
          return {
            document: documentView(doc),
            dossier: await dossierView(c, changed),
          };
        });
        return reply.code(201).send(result);
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
  app.delete("/api/income/dossier/documents/:id", async (r) => {
    const u = actor(r, { role: "tenant" });
    const id = uuid.parse((r.params as any).id);
    const input = z.object({ revision }).strict().parse(r.query);
    const result = await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        id,
      ]);
      const d = (
        await c.query(
          "SELECT * FROM income_dossiers WHERE user_id=$1 FOR UPDATE",
          [u.id],
        )
      ).rows[0];
      requireThat(
        d && d.revision === input.revision,
        "Il riepilogo è cambiato. Ricaricalo prima di rimuovere il documento.",
        409,
      );
      const deleted = await c.query(
        "DELETE FROM income_documents WHERE id=$1 AND dossier_id=$2 RETURNING object_key",
        [id, d.id],
      );
      requireThat(deleted.rowCount, "Documento non disponibile.", 404);
      const changed = await advance(c, d.id);
      return {
        key: deleted.rows[0].object_key,
        dossier: await dossierView(c, changed),
      };
    });
    await cleanupPhotoObjects(db, storage, [result.key]).catch(() => {});
    return { dossier: result.dossier };
  });
  async function access(c: PoolClient, r: FastifyRequest, id: string, u: User) {
    const initial = (
      await c.query(
        "SELECT f.*,d.user_id FROM income_documents f JOIN income_dossiers d ON d.id=f.dossier_id WHERE f.id=$1",
        [id],
      )
    ).rows[0];
    requireThat(initial, "Documento non disponibile.", 404);
    await lockUsers(c, [u.id, initial.user_id]);
    const doc = (
      await c.query(
        "SELECT f.*,d.user_id FROM income_documents f JOIN income_dossiers d ON d.id=f.dossier_id WHERE f.id=$1",
        [id],
      )
    ).rows[0];
    requireThat(
      doc && doc.user_id === initial.user_id,
      "Documento non disponibile.",
      404,
    );
    const users = await c.query(
      "SELECT id,suspended FROM users WHERE id=ANY($1::uuid[])",
      [[...new Set([u.id, doc.user_id])]],
    );
    requireThat(
      users.rows.length === new Set([u.id, doc.user_id]).size &&
        users.rows.every((v) => !v.suspended),
      "Documento non disponibile.",
      404,
    );
    const permitted = allowedUsers(r, preview);
    requireThat(
      !permitted ||
        (permitted.includes(u.id) && permitted.includes(doc.user_id)),
      "Documento non disponibile.",
      404,
    );
    const shares =
      u.id === doc.user_id
        ? []
        : (
            await c.query(
              `${shareSelect} WHERE s.recipient_id=$1 AND s.dossier_id=$3 AND s.revoked_at IS NULL`,
              [u.id, permitted, doc.dossier_id],
            )
          ).rows.filter((s) => s.available);
    requireThat(
      u.id === doc.user_id || shares.length,
      "Documento non disponibile.",
      404,
    );
    return { doc, shares };
  }
  app.get("/api/income/dossier/documents/:id", async (r, reply) => {
    const u = actor(r),
      id = uuid.parse((r.params as any).id);
    const before = await tx(db, (c) => access(c, r, id, u));
    const bytes = await storage.get(before.doc.object_key);
    const current = await tx(db, async (c) => {
      const fresh = await access(c, r, id, u);
      requireThat(
        fresh.doc.object_key === before.doc.object_key,
        "Documento non disponibile.",
        404,
      );
      const shares = fresh.shares.filter((s) =>
        before.shares.some(
          (old) => old.id === s.id && old.revision === s.revision,
        ),
      );
      requireThat(
        u.id === fresh.doc.user_id || shares.length,
        "Documento non disponibile.",
        404,
      );
      for (const s of shares)
        await c.query(
          "INSERT INTO income_document_downloads(share_id,document_id,recipient_id,revision) VALUES($1,$2,$3,$4) ON CONFLICT(share_id,document_id,recipient_id,revision) DO UPDATE SET downloaded_at=now()",
          [s.id, id, u.id, s.revision],
        );
      return fresh.doc;
    });
    return reply
      .type(current.mime)
      .header("Cache-Control", "private, no-store")
      .header("Content-Security-Policy", "sandbox; default-src 'none'")
      .header("X-Content-Type-Options", "nosniff")
      .header(
        "Content-Disposition",
        `attachment; filename="documento.${current.mime === "application/pdf" ? "pdf" : "webp"}"`,
      )
      .send(bytes);
  });
  app.get("/api/invitations/:id/income-dossier", async (r) => {
    const u = actor(r),
      id = uuid.parse((r.params as any).id);
    return tx(db, async (c) => {
      const i = await contact(c, r, id, u, preview);
      const own = i.tenant_id === u.id;
      const d = (
        await c.query("SELECT * FROM income_dossiers WHERE user_id=$1", [
          i.tenant_id,
        ])
      ).rows[0];
      const shares = (
        await c.query(
          `${shareSelect} WHERE (s.owner_id=$1 OR s.recipient_id=$1) AND s.invitation_id=$3 AND s.revoked_at IS NULL`,
          [u.id, allowedUsers(r, preview), id],
        )
      ).rows;
      const share = shares.find((s) => s.available);
      const available = i.permitted && i.status === "accepted";
      const shown = own || (available && share);
      const view = shown && d ? await dossierView(c, d) : null;
      const reviews =
        available && share
          ? (
              await c.query(
                "SELECT DISTINCT ON(person_id) * FROM income_dossier_reviews WHERE share_id=$1 AND revision=$2 ORDER BY person_id,reviewed_at DESC,id DESC",
                [share.id, share.revision],
              )
            ).rows.map(reviewView)
          : [];
      return {
        status: available && share ? "available" : "unavailable",
        dossier: view,
        share: available && share ? shareView(share) : null,
        can_share: Boolean(own && available && d && !share),
        comparison:
          available && view
            ? incomeComparison(view.totals, Number(i.property_snapshot?.rent))
            : null,
        reviews,
      };
    });
  });
  app.post("/api/income/dossier/shares", async (r, reply) => {
    const u = actor(r);
    const input = z
      .object({
        invitation_id: uuid,
        dossier_id: uuid,
        revision: z.number().int().positive(),
        consent: z.literal(true),
        documents_consent: z.literal(true),
      })
      .strict()
      .parse(r.body);
    const result = await tx(db, async (c) => {
      const i = await contact(c, r, input.invitation_id, u, preview);
      requireThat(
        i.tenant_id === u.id,
        "Solo il referente può condividere questo riepilogo.",
        403,
      );
      requireThat(
        i.permitted && i.status === "accepted",
        "Apri una conversazione prima di condividere i redditi.",
        409,
      );
      const d = (
        await c.query(
          "SELECT * FROM income_dossiers WHERE id=$1 AND user_id=$2 FOR UPDATE",
          [input.dossier_id, u.id],
        )
      ).rows[0];
      requireThat(
        d && d.revision === input.revision,
        "Il riepilogo è cambiato. Rileggilo prima di condividerlo.",
        409,
      );
      requireThat(
        !(
          await c.query(
            "SELECT 1 FROM income_dossier_shares WHERE invitation_id=$1 AND revoked_at IS NULL",
            [i.id],
          )
        ).rowCount,
        "Il riepilogo è già condiviso.",
        409,
      );
      const s = (
        await c.query(
          "INSERT INTO income_dossier_shares(dossier_id,owner_id,recipient_id,invitation_id,revision,documents_consent) VALUES($1,$2,$3,$4,$5,true) RETURNING id",
          [d.id, u.id, i.landlord_id, i.id, d.revision],
        )
      ).rows[0];
      return shareView(
        (
          await c.query(`${shareSelect} WHERE s.owner_id=$1 AND s.id=$3`, [
            u.id,
            allowedUsers(r, preview),
            s.id,
          ])
        ).rows[0],
      );
    });
    return reply.code(201).send({ share: result });
  });
  app.delete("/api/income/dossier/shares/:id", async (r) => {
    const u = actor(r, { allowSuspended: true }),
      id = uuid.parse((r.params as any).id);
    z.object({}).strict().parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      requireThat(
        (
          await c.query(
            "UPDATE income_dossier_shares SET revoked_at=COALESCE(revoked_at,now()),revocation_reason=COALESCE(revocation_reason,'holder') WHERE id=$1 AND owner_id=$2 RETURNING id",
            [id, u.id],
          )
        ).rowCount,
        "Condivisione non disponibile.",
        404,
      );
    });
    return { ok: true };
  });
  app.post("/api/income/dossier/shares/:id/reviews", async (r, reply) => {
    const u = actor(r),
      id = uuid.parse((r.params as any).id);
    const input = incomeReviewInput.parse(r.body);
    const result = await tx(db, async (c) => {
      const before = (
        await c.query(
          "SELECT * FROM income_dossier_shares WHERE id=$1 AND (owner_id=$2 OR recipient_id=$2)",
          [id, u.id],
        )
      ).rows[0];
      requireThat(before, "Condivisione non disponibile.", 404);
      requireThat(
        before.recipient_id === u.id,
        "Solo il proprietario scelto può registrare il controllo.",
        403,
      );
      await lockUsers(c, [before.owner_id, u.id]);
      const s = (
        await c.query(`${shareSelect} WHERE s.recipient_id=$1 AND s.id=$3`, [
          u.id,
          allowedUsers(r, preview),
          id,
        ])
      ).rows[0];
      requireThat(
        s?.available && s.revision === input.revision,
        "La condivisione non è più disponibile. Ricarica la conversazione.",
        409,
      );
      const doc = (
        await c.query(
          "SELECT * FROM income_documents WHERE id=$1 AND dossier_id=$2 AND person_id=$3",
          [input.document_id, s.dossier_id, input.person_id],
        )
      ).rows[0];
      requireThat(doc, "Documento non disponibile per questa persona.", 404);
      requireThat(
        (
          await c.query(
            "SELECT 1 FROM income_document_downloads WHERE share_id=$1 AND document_id=$2 AND recipient_id=$3 AND revision=$4",
            [s.id, doc.id, u.id, s.revision],
          )
        ).rowCount,
        "Scarica prima il documento, poi conferma il controllo.",
        409,
      );
      return reviewView(
        (
          await c.query(
            "INSERT INTO income_dossier_reviews(share_id,document_id,person_id,reviewer_id,revision,observed_net_cents,period_from,period_to) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
            [
              s.id,
              doc.id,
              input.person_id,
              u.id,
              s.revision,
              input.observed_net_cents,
              input.period_from,
              input.period_to,
            ],
          )
        ).rows[0],
      );
    });
    return reply.code(201).send({ review: result });
  });
}

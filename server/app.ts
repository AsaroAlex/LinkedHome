import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import staticPlugin from "@fastify/static";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { type DB, tx, lockUsers } from "./db.js";
import {
  readRuntimeConfiguration,
  type RuntimeConfiguration,
} from "./config.js";
import {
  token,
  digest,
  hashPassword,
  checkPassword,
  type User,
  userColumns,
} from "./auth.js";
import {
  profileInput,
  propertyInput,
  compatibility,
  Problem,
  requireThat,
  verificationState,
} from "./domain.js";
import { sendMail } from "./mail.js";
import type { PoolClient } from "pg";

declare module "fastify" {
  interface FastifyRequest {
    actor: User | null;
  }
}
const uuid = z.string().uuid();
const password = z.string().min(12).max(128);
const actor = (
  r: FastifyRequest,
  options: {
    verified?: boolean;
    role?: "tenant" | "landlord";
    staff?: boolean;
    admin?: boolean;
    allowSuspended?: boolean;
  } = {},
) => {
  const u = r.actor;
  if (!u) throw new Problem(401, "Accedi per continuare.");
  if (u.suspended && !options.allowSuspended)
    throw new Problem(
      423,
      "Account sospeso. Richiedi una revisione all’operatore.",
      "suspended",
    );
  if (options.verified && !u.email_verified)
    throw new Problem(
      403,
      "Conferma la tua email prima di continuare.",
      "email_unverified",
    );
  if (options.role && u.role !== options.role && u.role !== "both")
    throw new Problem(403, "Questa funzione richiede un ruolo diverso.");
  if (
    (options.staff && !u.staff_role) ||
    (options.admin && u.staff_role !== "admin")
  )
    throw new Problem(403, "Accesso riservato.");
  return u;
};
const idParam = (r: FastifyRequest) =>
  uuid.parse((r.params as { id: string }).id);
async function active(c: PoolClient, id: string) {
  const { rows } = await c.query("SELECT suspended FROM users WHERE id=$1", [
    id,
  ]);
  requireThat(rows[0] && !rows[0].suspended, "Account non disponibile.", 403);
}
async function blocked(c: PoolClient, a: string, b: string) {
  const { rowCount } = await c.query(
    "SELECT 1 FROM blocks WHERE (blocker_id=$1 AND blocked_id=$2) OR (blocker_id=$2 AND blocked_id=$1)",
    [a, b],
  );
  return Boolean(rowCount);
}
async function event(c: PoolClient, name: string) {
  await c.query("INSERT INTO events(name) VALUES($1)", [name]);
}
async function cancelPending(
  c: PoolClient,
  field: "tenant_id" | "property_id",
  id: string,
) {
  await c.query(
    `UPDATE invitations SET status='cancelled' WHERE ${field}=$1 AND status='pending'`,
    [id],
  );
}
const publicProperty = (p: any) => ({
  id: p.id,
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
  status: p.status,
  revision: p.revision,
  published_at: p.published_at,
  authority_attested: p.authority_attested,
});
const currentProperty = (p: any) =>
  p &&
  p.status === "published" &&
  p.authority_attested &&
  p.published_at &&
  new Date(p.published_at).getTime() > Date.now() - 30 * 86400000;

export async function buildApp(
  db: DB,
  options: {
    origin?: string;
    mail?: typeof sendMail;
    runtime?: RuntimeConfiguration;
    limits?: boolean;
    serveStatic?: boolean;
  } = {},
) {
  const runtime = options.runtime || readRuntimeConfiguration();
  const secure = runtime.environment !== "local";
  const cookieName = secure ? "__Host-soglia" : "soglia";
  const app = Fastify({
    logger: false,
    bodyLimit: 16384,
    trustProxy: runtime.trustedProxies,
  });
  const origin = options.origin || runtime.origin;
  const mail = options.mail || sendMail;
  await app.register(cookie);
  await app.register(rateLimit, {
    max: options.limits === false ? 100000 : 180,
    timeWindow: "1 minute",
  });
  app.decorateRequest("actor", null);
  app.addHook("onRequest", async (r, reply) => {
    reply
      .header("X-Content-Type-Options", "nosniff")
      .header("Referrer-Policy", "no-referrer")
      .header("X-Frame-Options", "DENY");
    reply.header(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    if (secure) reply.header("Strict-Transport-Security", "max-age=31536000");
    if (r.url.startsWith("/api")) reply.header("Cache-Control", "no-store");
    if (["POST", "PUT", "PATCH", "DELETE"].includes(r.method)) {
      if (r.headers.origin !== origin)
        throw new Problem(403, "Origine della richiesta non consentita.");
      if (!r.headers["content-type"]?.startsWith("application/json"))
        throw new Problem(415, "Formato richiesta non valido.");
    }
  });
  app.addHook("preHandler", async (r) => {
    const secret = r.cookies[cookieName];
    if (secret && /^[a-f0-9]{64}$/.test(secret)) {
      const { rows } = await db.query(
        `SELECT ${userColumns
          .split(",")
          .map((x) => "u." + x)
          .join(
            ",",
          )} FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()`,
        [digest(secret)],
      );
      r.actor = rows[0] || null;
    }
  });
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError)
      return reply.code(400).send({
        error: "Controlla i campi inseriti.",
        details: error.issues.map((x) => ({
          field: x.path.join("."),
          message: x.message,
        })),
      });
    const e = error as Error & { statusCode?: number; code?: string };
    if (e.code === "23505")
      return reply
        .code(409)
        .send({ error: "Operazione già presente o dati non disponibili." });
    if (e instanceof Problem || (e.statusCode && e.statusCode < 500))
      return reply
        .code(e.statusCode || 400)
        .send({ error: e.message, code: e.code });
    // Log no request bodies, credentials, URLs, DB statements or message contents.
    console.error("API operation failed:", e.name, e.code || "internal");
    return reply
      .code(500)
      .send({ error: "Operazione non riuscita. Riprova tra poco." });
  });
  async function setSession(
    c: PoolClient,
    userId: string,
    reply: FastifyReply,
  ) {
    const secret = token();
    await c.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",
      [digest(secret), userId],
    );
    reply.setCookie(cookieName, secret, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 86400,
    });
  }
  async function issue(
    c: PoolClient,
    u: { id: string; email: string },
    purpose: "verify" | "reset",
  ) {
    const secret = token();
    await c.query("DELETE FROM auth_tokens WHERE user_id=$1 AND purpose=$2", [
      u.id,
      purpose,
    ]);
    await c.query(
      "INSERT INTO auth_tokens VALUES($1,$2,$3,now()+interval '30 minutes')",
      [digest(secret), u.id, purpose],
    );
    await mail(u.email, purpose, secret);
  }
  const authLimit = {
    rateLimit: {
      max: options.limits === false ? 10000 : 12,
      timeWindow: "15 minutes",
    },
  };
  app.get("/api/health", async () => {
    await db.query("SELECT 1");
    return { ok: true, environment: runtime.environment };
  });
  app.get("/api/live", async () => ({ ok: true }));
  app.get("/api/config", async () => ({
    environment: runtime.environment,
    mailTransport: runtime.mailTransport,
  }));
  app.get("/api/session", async (r) => ({ user: r.actor }));
  app.post("/api/auth/register", { config: authLimit }, async (r, reply) => {
    const input = z
      .object({
        email: z
          .email()
          .max(254)
          .transform((s) => s.toLowerCase()),
        password,
        display_name: z.string().trim().min(2).max(60),
        role: z.enum(["tenant", "landlord", "both"]),
      })
      .strict()
      .parse(r.body);
    const hash = await hashPassword(input.password);
    await tx(db, async (c) => {
      const { rows } = await c.query(
        `INSERT INTO users(email,password_hash,display_name,role) VALUES($1,$2,$3,$4) RETURNING ${userColumns}`,
        [input.email, hash, input.display_name, input.role],
      );
      await issue(c, rows[0], "verify");
      await setSession(c, rows[0].id, reply);
    });
    return reply.code(201).send({ ok: true });
  });
  app.post("/api/auth/login", { config: authLimit }, async (r, reply) => {
    const input = z
      .object({
        email: z
          .email()
          .max(254)
          .transform((s) => s.toLowerCase()),
        password: z.string().max(128),
      })
      .strict()
      .parse(r.body);
    const { rows } = await db.query("SELECT * FROM users WHERE email=$1", [
      input.email,
    ]);
    const u = rows[0];
    // A synthetic hash path avoids skipping the expensive work for absent accounts.
    const dummy = "0".repeat(64) + ":" + "0".repeat(128);
    const valid = await checkPassword(
      input.password,
      u?.password_hash || dummy,
    );
    if (!u || !valid) throw new Problem(401, "Email o password non corrette.");
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      const fresh = await c.query(
        "SELECT password_hash FROM users WHERE id=$1",
        [u.id],
      );
      requireThat(
        fresh.rows[0]?.password_hash === u.password_hash,
        "Credenziali cambiate. Accedi di nuovo.",
        401,
      );
      if (r.cookies[cookieName])
        await c.query("DELETE FROM sessions WHERE token_hash=$1", [
          digest(r.cookies[cookieName]),
        ]);
      await setSession(c, u.id, reply);
    });
    return { ok: true };
  });
  app.post("/api/auth/logout", async (r, reply) => {
    if (r.cookies[cookieName])
      await db.query("DELETE FROM sessions WHERE token_hash=$1", [
        digest(r.cookies[cookieName]),
      ]);
    reply.clearCookie(cookieName, {
      path: "/",
      secure,
      httpOnly: true,
      sameSite: "strict",
    });
    return { ok: true };
  });
  app.post("/api/auth/resend", { config: authLimit }, async (r) => {
    const u = actor(r);
    if (!u.email_verified)
      await tx(db, async (c) => {
        await lockUsers(c, [u.id]);
        await active(c, u.id);
        await issue(c, u, "verify");
      });
    return { ok: true };
  });
  app.post("/api/auth/forgot", { config: authLimit }, async (r) => {
    const { email } = z
      .object({
        email: z
          .email()
          .max(254)
          .transform((s) => s.toLowerCase()),
      })
      .strict()
      .parse(r.body);
    const { rows } = await db.query(
      "SELECT id,email FROM users WHERE email=$1",
      [email],
    );
    if (rows[0]) {
      try {
        await tx(db, async (c) => {
          await lockUsers(c, [rows[0].id]);
          const fresh = await c.query(
            "SELECT id,email FROM users WHERE id=$1",
            [rows[0].id],
          );
          if (fresh.rows[0]) await issue(c, fresh.rows[0], "reset");
        });
      } catch {
        // Preserve the same recovery response during provider outages; never
        // expose whether an address exists or log recipients/tokens.
        console.error("Password recovery delivery unavailable.");
      }
    }
    return { ok: true };
  });
  for (const purpose of ["verify", "reset"] as const)
    app.post(
      `/api/auth/${purpose}`,
      { config: authLimit },
      async (r, reply) => {
        const input = (
          purpose === "reset"
            ? z
                .object({ token: z.string().regex(/^[a-f0-9]{64}$/), password })
                .strict()
            : z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict()
        ).parse(r.body);
        const hash =
          "password" in input
            ? await hashPassword(String(input.password))
            : null;
        await tx(db, async (c) => {
          const lookup = await c.query(
            "SELECT user_id FROM auth_tokens WHERE token_hash=$1 AND purpose=$2",
            [digest(input.token), purpose],
          );
          requireThat(lookup.rows[0], "Link non valido o scaduto.", 400);
          const id = lookup.rows[0].user_id;
          await lockUsers(c, [id]);
          if (purpose === "verify") await active(c, id);
          const used = await c.query(
            "DELETE FROM auth_tokens WHERE token_hash=$1 AND purpose=$2 AND expires_at>now() RETURNING user_id",
            [digest(input.token), purpose],
          );
          requireThat(used.rowCount, "Link non valido o già usato.", 400);
          if (purpose === "verify")
            await c.query("UPDATE users SET email_verified=true WHERE id=$1", [
              id,
            ]);
          else {
            await c.query("UPDATE users SET password_hash=$1 WHERE id=$2", [
              hash,
              id,
            ]);
            await c.query("DELETE FROM sessions WHERE user_id=$1", [id]);
            await c.query(
              "DELETE FROM auth_tokens WHERE user_id=$1 AND purpose='reset'",
              [id],
            );
            reply.clearCookie(cookieName, {
              path: "/",
              secure,
              httpOnly: true,
              sameSite: "strict",
            });
          }
        });
        return { ok: true };
      },
    );
  app.get("/api/profile", async (r) => {
    const u = actor(r);
    return {
      profile:
        (await db.query("SELECT * FROM profiles WHERE user_id=$1", [u.id]))
          .rows[0] || null,
    };
  });
  app.put("/api/profile", async (r) => {
    const u = actor(r, { role: "tenant" });
    const p = profileInput.parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      await c.query(
        `INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id) DO UPDATE SET city=$2,budget=$3,move_in=$4,duration=$5,occupants=$6,revision=profiles.revision+1,updated_at=now()`,
        [u.id, p.city, p.budget, p.move_in, p.duration, p.occupants],
      );
      await cancelPending(c, "tenant_id", u.id);
    });
    return { ok: true };
  });
  app.post("/api/profile/status", async (r) => {
    const u = actor(r, { role: "tenant", verified: true });
    const { status } = z
      .object({ status: z.enum(["published", "paused"]) })
      .strict()
      .parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      const result = await c.query(
        "UPDATE profiles SET status=$2,revision=revision+1,published_at=CASE WHEN $2='published' THEN now() ELSE published_at END WHERE user_id=$1 RETURNING *",
        [u.id, status],
      );
      requireThat(result.rowCount, "Completa prima il profilo.", 400);
      await cancelPending(c, "tenant_id", u.id);
      if (status === "published") await event(c, "profile_published");
    });
    return { ok: true };
  });
  app.get("/api/properties", async (r) => {
    const u = actor(r, { role: "landlord" });
    return {
      properties: (
        await db.query(
          "SELECT * FROM properties WHERE owner_id=$1 ORDER BY created_at DESC",
          [u.id],
        )
      ).rows,
    };
  });
  app.post("/api/properties", async (r, reply) => {
    const u = actor(r, { role: "landlord" });
    const p = propertyInput.parse(r.body);
    const id = await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      const result = await c.query(
        "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id",
        [
          u.id,
          p.title,
          p.city,
          p.area,
          p.description,
          p.rent,
          p.available_from,
          p.min_months,
          p.max_months,
          p.capacity,
          p.sqm,
          p.rooms,
          p.furnished,
          p.authority_attested,
        ],
      );
      return result.rows[0].id;
    });
    return reply.code(201).send({ id });
  });
  app.put("/api/properties/:id", async (r) => {
    const u = actor(r, { role: "landlord" }),
      id = idParam(r),
      p = propertyInput.parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      const result = await c.query(
        "UPDATE properties SET title=$3,city=$4,area=$5,description=$6,rent=$7,available_from=$8,min_months=$9,max_months=$10,capacity=$11,sqm=$12,rooms=$13,furnished=$14,authority_attested=$15,revision=revision+1 WHERE id=$1 AND owner_id=$2 RETURNING id",
        [
          id,
          u.id,
          p.title,
          p.city,
          p.area,
          p.description,
          p.rent,
          p.available_from,
          p.min_months,
          p.max_months,
          p.capacity,
          p.sqm,
          p.rooms,
          p.furnished,
          p.authority_attested,
        ],
      );
      requireThat(result.rowCount, "Immobile non trovato.", 404);
      await cancelPending(c, "property_id", id);
    });
    return { ok: true };
  });
  app.post("/api/properties/:id/status", async (r) => {
    const u = actor(r, { role: "landlord", verified: true }),
      id = idParam(r);
    const { status } = z
      .object({ status: z.enum(["published", "paused"]) })
      .strict()
      .parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      const prior = (
        await c.query(
          "SELECT * FROM properties WHERE id=$1 AND owner_id=$2 FOR UPDATE",
          [id, u.id],
        )
      ).rows[0];
      requireThat(
        prior && (status === "paused" || prior.authority_attested),
        "Conferma di poter offrire l’immobile.",
        400,
      );
      const reconfirm = prior.status === "published" && status === "published";
      await c.query(
        "UPDATE properties SET status=$3,revision=revision+CASE WHEN $4 THEN 0 ELSE 1 END,published_at=CASE WHEN $3='published' THEN now() ELSE published_at END WHERE id=$1 AND owner_id=$2",
        [id, u.id, status, reconfirm],
      );
      if (!reconfirm) await cancelPending(c, "property_id", id);
      if (status === "published") await event(c, "property_published");
    });
    return { ok: true };
  });
  app.get("/api/discover/:id", async (r) => {
    const u = actor(r, { role: "landlord", verified: true }),
      id = idParam(r);
    const { after } = z
      .object({
        after: z
          .string()
          .regex(/^[a-f0-9]{32}:[a-f0-9-]{36}$/)
          .optional(),
      })
      .strict()
      .parse(r.query);
    const [afterHash, afterId] = (
      after ||
      "00000000000000000000000000000000:00000000-0000-0000-0000-000000000000"
    ).split(":");
    const p = (
      await db.query("SELECT * FROM properties WHERE id=$1 AND owner_id=$2", [
        id,
        u.id,
      ])
    ).rows[0];
    requireThat(
      currentProperty(p),
      "Pubblica o riconferma questo immobile per vedere i profili.",
      400,
    );
    const { rows } = await db.query(
      `SELECT p.user_id AS id,p.city,p.budget,p.move_in,p.duration,p.occupants,p.revision,md5(p.user_id::text || $8::text) AS sort_key FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.status='published' AND u.suspended=false AND u.email_verified=true AND p.user_id<>$1 AND p.city=$2 AND p.budget>=$3 AND p.move_in>=$4 AND p.duration BETWEEN $5 AND $6 AND p.occupants<=$7 AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=p.user_id) OR(b.blocker_id=p.user_id AND b.blocked_id=$1)) AND NOT EXISTS(SELECT 1 FROM invitations i WHERE i.property_id=$8::uuid AND i.tenant_id=p.user_id) AND (md5(p.user_id::text || $8::text),p.user_id)>($9,$10::uuid) ORDER BY md5(p.user_id::text || $8::text),p.user_id LIMIT 25`,
      [
        u.id,
        p.city,
        p.rent,
        p.available_from,
        p.min_months,
        p.max_months,
        p.capacity,
        id,
        afterHash,
        afterId,
      ],
    );
    return {
      property: publicProperty(p),
      profiles: rows.slice(0, 24).map(({ sort_key, ...pf }) => ({
        ...pf,
        alias: `Profilo ${pf.id.slice(0, 6).toUpperCase()}`,
        compatibility: compatibility(pf, p),
      })),
      hasMore: rows.length > 24,
      nextCursor:
        rows.length > 24 ? `${rows[23].sort_key}:${rows[23].id}` : null,
    };
  });
  app.post("/api/invitations", async (r, reply) => {
    const u = actor(r, { role: "landlord", verified: true });
    const b = z
      .object({
        property_id: uuid,
        tenant_id: uuid,
        property_revision: z.number().int(),
        profile_revision: z.number().int(),
      })
      .strict()
      .parse(r.body);
    requireThat(u.id !== b.tenant_id, "Non puoi invitare te stesso.", 400);
    const id = await tx(db, async (c) => {
      await lockUsers(c, [u.id, b.tenant_id]);
      await active(c, u.id);
      await active(c, b.tenant_id);
      requireThat(
        !(await blocked(c, u.id, b.tenant_id)),
        "Contatto non disponibile.",
        403,
      );
      const p = (
        await c.query(
          "SELECT * FROM properties WHERE id=$1 AND owner_id=$2 FOR UPDATE",
          [b.property_id, u.id],
        )
      ).rows[0];
      const pf = (
        await c.query(
          "SELECT p.* FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=$1 AND u.email_verified=true FOR UPDATE OF p",
          [b.tenant_id],
        )
      ).rows[0];
      requireThat(
        currentProperty(p) && pf?.status === "published",
        "Immobile o profilo non più disponibile.",
      );
      requireThat(
        p.revision === b.property_revision &&
          pf.revision === b.profile_revision,
        "Le preferenze sono cambiate. Aggiorna la pagina.",
      );
      requireThat(
        compatibility(pf, p).compatible,
        "Preferenze non compatibili.",
      );
      const result = await c.query(
        "INSERT INTO invitations(property_id,tenant_id,landlord_id,property_revision,profile_revision,property_snapshot) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
        [
          p.id,
          b.tenant_id,
          u.id,
          p.revision,
          pf.revision,
          JSON.stringify(publicProperty(p)),
        ],
      );
      await event(c, "invitation_sent");
      return result.rows[0].id;
    });
    return reply.code(201).send({ id });
  });
  async function invitationView(r: FastifyRequest, onlyId?: string) {
    const u = actor(r);
    const { rows } = await db.query(
      `SELECT i.*,row_to_json(p) AS property,CASE WHEN i.status IN ('accepted','closed') THEN other.display_name ELSE NULL END AS other_name FROM invitations i JOIN properties p ON p.id=i.property_id JOIN users other ON other.id=CASE WHEN i.tenant_id=$1 THEN i.landlord_id ELSE i.tenant_id END WHERE (i.tenant_id=$1 OR i.landlord_id=$1) AND ($3::uuid IS NULL OR i.id=$3) ORDER BY i.created_at DESC,i.id DESC LIMIT 100 OFFSET $2`,
      [
        u.id,
        z.coerce
          .number()
          .int()
          .min(0)
          .max(10000)
          .default(0)
          .parse((r.query as any).page) * 100,
        onlyId || null,
      ],
    );
    const profile = (
      await db.query("SELECT * FROM profiles WHERE user_id=$1", [u.id])
    ).rows[0];
    return rows.map((i) => ({
      ...i,
      property: publicProperty(
        ["accepted", "closed"].includes(i.status)
          ? i.property_snapshot
          : i.property,
      ),
      property_changed: i.property.revision !== i.property_revision,
      status:
        i.status === "pending"
          ? new Date(i.expires_at) <= new Date()
            ? "expired"
            : !currentProperty(i.property)
              ? "unavailable"
              : "pending"
          : i.status,
      compatibility:
        profile && i.tenant_id === u.id
          ? compatibility(profile, i.property)
          : null,
    }));
  }
  app.get("/api/dashboard", async (r) => {
    const u = actor(r);
    const { rows } = await db.query(
      `SELECT count(*) FILTER (WHERE i.status='pending' AND i.expires_at>now() AND p.status='published' AND p.authority_attested AND p.published_at>now()-interval '30 days')::int AS pending,
      count(*) FILTER (WHERE i.status='accepted')::int AS accepted
      FROM invitations i JOIN properties p ON p.id=i.property_id
      WHERE i.tenant_id=$1 OR i.landlord_id=$1`,
      [u.id],
    );
    return rows[0];
  });
  app.get("/api/invitations", async (r) => ({
    invitations: await invitationView(r),
  }));
  app.get("/api/invitations/:id", async (r) => {
    const items = await invitationView(r, idParam(r));
    requireThat(items[0], "Invito non disponibile.", 404);
    return { invitation: items[0] };
  });
  async function withInvitation<T>(
    r: FastifyRequest,
    id: string,
    fn: (c: PoolClient, i: any, u: User) => Promise<T>,
  ) {
    const u = actor(r, { verified: true });
    return tx(db, async (c) => {
      const before = (
        await c.query(
          "SELECT * FROM invitations WHERE id=$1 AND (tenant_id=$2 OR landlord_id=$2)",
          [id, u.id],
        )
      ).rows[0];
      requireThat(before, "Invito non trovato.", 404);
      await lockUsers(c, [before.tenant_id, before.landlord_id]);
      await active(c, u.id);
      const i = (
        await c.query("SELECT * FROM invitations WHERE id=$1 FOR UPDATE", [id])
      ).rows[0];
      requireThat(i, "Invito non disponibile.", 404);
      return fn(c, i, u);
    });
  }
  app.post("/api/invitations/:id/action", async (r) => {
    const id = idParam(r),
      b = z
        .object({
          action: z.enum(["accept", "decline", "withdraw", "close"]),
          property_revision: z.number().int().optional(),
          profile_revision: z.number().int().optional(),
        })
        .strict()
        .parse(r.body);
    return withInvitation(r, id, async (c, i, u) => {
      if (b.action === "close") {
        requireThat(i.status === "accepted", "Conversazione già chiusa.");
        await c.query("UPDATE invitations SET status='closed' WHERE id=$1", [
          id,
        ]);
        return { ok: true };
      }
      requireThat(
        i.status === "pending" && new Date(i.expires_at) > new Date(),
        "Invito non più disponibile.",
      );
      if (b.action === "withdraw")
        requireThat(
          i.landlord_id === u.id,
          "Non puoi ritirare questo invito.",
          403,
        );
      else
        requireThat(
          i.tenant_id === u.id,
          "Solo il destinatario può rispondere.",
          403,
        );
      if (b.action === "accept") {
        await active(c, i.landlord_id);
        requireThat(
          !(await blocked(c, i.tenant_id, i.landlord_id)),
          "Contatto non disponibile.",
          403,
        );
        const p = (
            await c.query("SELECT * FROM properties WHERE id=$1 FOR UPDATE", [
              i.property_id,
            ])
          ).rows[0],
          pf = (
            await c.query(
              "SELECT * FROM profiles WHERE user_id=$1 FOR UPDATE",
              [i.tenant_id],
            )
          ).rows[0];
        requireThat(
          currentProperty(p) && pf?.status === "published",
          "Immobile o profilo non più disponibile.",
        );
        requireThat(
          i.property_revision === p.revision &&
            i.profile_revision === pf.revision &&
            b.property_revision === p.revision &&
            b.profile_revision === pf.revision,
          "I dati sono cambiati. Aggiorna l’invito.",
        );
        requireThat(
          compatibility(pf, p).compatible,
          "Preferenze non più compatibili.",
        );
        await c.query(
          "UPDATE invitations SET status='accepted',accepted_at=now() WHERE id=$1",
          [id],
        );
        await event(c, "invitation_accepted");
      } else
        await c.query("UPDATE invitations SET status=$2 WHERE id=$1", [
          id,
          b.action === "decline" ? "declined" : "withdrawn",
        ]);
      return { ok: true };
    });
  });
  app.get("/api/conversations/:id", async (r) => {
    const u = actor(r),
      id = idParam(r);
    const i = (
      await db.query(
        "SELECT * FROM invitations WHERE id=$1 AND (tenant_id=$2 OR landlord_id=$2) AND status IN ('accepted','closed')",
        [id, u.id],
      )
    ).rows[0];
    requireThat(i, "Conversazione non disponibile.", 404);
    const { before } = z
      .object({ before: uuid.optional() })
      .strict()
      .parse(r.query);
    if (before)
      requireThat(
        (
          await db.query(
            "SELECT 1 FROM messages WHERE id=$1 AND invitation_id=$2",
            [before, id],
          )
        ).rowCount,
        "Pagina non disponibile.",
        404,
      );
    const messages = (
      await db.query(
        "SELECT id,sender_id,body,created_at FROM messages WHERE invitation_id=$1 AND ($2::uuid IS NULL OR (created_at,id)<(SELECT created_at,id FROM messages WHERE id=$2)) ORDER BY created_at DESC,id DESC LIMIT 101",
        [id, before || null],
      )
    ).rows;
    return {
      messages: messages.slice(0, 100).reverse(),
      status: i.status,
      hasMore: messages.length > 100,
      before: messages.length > 100 ? messages[99].id : null,
    };
  });
  app.post("/api/conversations/:id/messages", async (r, reply) => {
    const id = idParam(r);
    const { body } = z
      .object({ body: z.string().trim().min(1).max(2000) })
      .strict()
      .parse(r.body);
    await withInvitation(r, id, async (c, i, u) => {
      requireThat(
        i.status === "accepted",
        "Conversazione chiusa o non accettata.",
        403,
      );
      await active(c, i.tenant_id);
      await active(c, i.landlord_id);
      requireThat(
        !(await blocked(c, i.tenant_id, i.landlord_id)),
        "Contatto bloccato.",
        403,
      );
      await c.query(
        "INSERT INTO messages(invitation_id,sender_id,body) VALUES($1,$2,$3)",
        [id, u.id, body],
      );
      await event(c, "message_sent");
    });
    return reply.code(201).send({ ok: true });
  });
  app.post("/api/blocks", async (r) => {
    const u = actor(r),
      { invitation_id } = z
        .object({ invitation_id: uuid })
        .strict()
        .parse(r.body);
    return withInvitation(r, invitation_id, async (c, i) => {
      const other = i.tenant_id === u.id ? i.landlord_id : i.tenant_id;
      await c.query(
        "INSERT INTO blocks(blocker_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [u.id, other],
      );
      await c.query(
        "UPDATE invitations SET status=CASE WHEN status='pending' THEN 'cancelled' ELSE 'closed' END WHERE ((tenant_id=$1 AND landlord_id=$2) OR (tenant_id=$2 AND landlord_id=$1)) AND status IN ('pending','accepted')",
        [u.id, other],
      );
      return { ok: true };
    });
  });
  app.get("/api/blocks", async (r) => {
    const u = actor(r);
    return {
      blocks: (
        await db.query(
          "SELECT blocked_id,created_at FROM blocks WHERE blocker_id=$1",
          [u.id],
        )
      ).rows,
    };
  });
  app.delete("/api/blocks/:id", async (r) => {
    const u = actor(r),
      id = idParam(r);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id, id]);
      await active(c, u.id);
      await c.query(
        "DELETE FROM blocks WHERE blocker_id=$1 AND blocked_id=$2",
        [u.id, id],
      );
    });
    return { ok: true };
  });
  app.post("/api/reports", async (r, reply) => {
    const b = z
      .object({
        invitation_id: uuid,
        message_id: uuid.optional(),
        reason: z.enum(["scam", "harassment", "discrimination", "other"]),
        details: z.string().trim().min(5).max(500),
      })
      .strict()
      .parse(r.body);
    await withInvitation(r, b.invitation_id, async (c, i, u) => {
      if (b.message_id)
        requireThat(
          (
            await c.query(
              "SELECT 1 FROM messages WHERE id=$1 AND invitation_id=$2",
              [b.message_id, i.id],
            )
          ).rowCount,
          "Messaggio non disponibile.",
          404,
        );
      const message = b.message_id
        ? (
            await c.query(
              "SELECT body,sender_id FROM messages WHERE id=$1 AND invitation_id=$2",
              [b.message_id, i.id],
            )
          ).rows[0]
        : null;
      await c.query(
        "INSERT INTO reports(reporter_id,invitation_id,message_id,reason,details,reported_user_id,selected_message,selected_sender_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
        [
          u.id,
          i.id,
          b.message_id || null,
          b.reason,
          b.details,
          i.tenant_id === u.id ? i.landlord_id : i.tenant_id,
          message?.body || null,
          message?.sender_id || null,
        ],
      );
      await event(c, "report_submitted");
    });
    return reply.code(201).send({ ok: true });
  });
  app.get("/api/verification", async (r) => {
    const u = actor(r);
    const rows = (
      await db.query(
        "SELECT id,kind,status,provider,checked_at,expires_at,dispute_reason FROM verification_checks WHERE user_id=$1",
        [u.id],
      )
    ).rows;
    return {
      email_verified: u.email_verified,
      provider_available: false,
      checks: rows.map((v) => ({ ...v, status: verificationState(v) })),
    };
  });
  app.post("/api/verification/:id/dispute", async (r) => {
    const u = actor(r),
      id = idParam(r);
    const { reason } = z
      .object({ reason: z.string().trim().min(5).max(300) })
      .strict()
      .parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      const result = await c.query(
        "UPDATE verification_checks SET status='DISPUTED',dispute_reason=$3 WHERE id=$1 AND user_id=$2 AND status IN ('VERIFIED','FAILED','EXPIRED') RETURNING id",
        [id, u.id, reason],
      );
      requireThat(result.rowCount, "Verifica non contestabile.", 400);
    });
    return { ok: true };
  });
  app.post("/api/account/appeal", async (r) => {
    const u = actor(r, { allowSuspended: true });
    requireThat(u.suspended, "L’account non è sospeso.", 400);
    const { reason } = z
      .object({ reason: z.string().trim().min(5).max(500) })
      .strict()
      .parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await c.query(
        "INSERT INTO appeals(user_id,reason) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET reason=$2,status='open',created_at=now(),resolved_at=NULL",
        [u.id, reason],
      );
      await c.query(
        "INSERT INTO audit_log(actor_id,action,reason_code) VALUES($1,'appeal_requested','security')",
        [u.id],
      );
    });
    return { ok: true };
  });
  app.get("/api/account/export", async (r) => {
    const u = actor(r, { allowSuspended: true });
    const [
      profile,
      properties,
      invitations,
      messages,
      blocks,
      reports,
      checks,
      appeals,
    ] = await Promise.all([
      db.query("SELECT * FROM profiles WHERE user_id=$1", [u.id]),
      db.query("SELECT * FROM properties WHERE owner_id=$1", [u.id]),
      db.query(
        "SELECT id,property_id,status,created_at,accepted_at FROM invitations WHERE tenant_id=$1 OR landlord_id=$1",
        [u.id],
      ),
      db.query(
        "SELECT id,invitation_id,body,created_at FROM messages WHERE sender_id=$1",
        [u.id],
      ),
      db.query("SELECT blocked_id,created_at FROM blocks WHERE blocker_id=$1", [
        u.id,
      ]),
      db.query(
        "SELECT id,invitation_id,message_id,reason,details,status,created_at FROM reports WHERE reporter_id=$1",
        [u.id],
      ),
      db.query(
        "SELECT id,kind,status,provider,checked_at,expires_at,dispute_reason FROM verification_checks WHERE user_id=$1",
        [u.id],
      ),
      db.query(
        "SELECT reason,status,created_at,resolved_at FROM appeals WHERE user_id=$1",
        [u.id],
      ),
    ]);
    return {
      account: {
        id: u.id,
        email: u.email,
        display_name: u.display_name,
        role: u.role,
        email_verified: u.email_verified,
      },
      profile: profile.rows,
      properties: properties.rows,
      invitations: invitations.rows,
      messages: messages.rows,
      blocks: blocks.rows,
      reports: reports.rows,
      appeals: appeals.rows,
      verification: checks.rows.map((v) => ({
        ...v,
        status: verificationState(v),
      })),
    };
  });
  app.delete("/api/account", async (r, reply) => {
    const u = actor(r, { allowSuspended: true });
    const b = z
      .object({ password, confirm: z.literal("ELIMINA") })
      .strict()
      .parse(r.body);
    const hash = (
      await db.query("SELECT password_hash FROM users WHERE id=$1", [u.id])
    ).rows[0]?.password_hash;
    requireThat(
      hash && (await checkPassword(b.password, hash)),
      "Password non corretta.",
      403,
    );
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      const fresh = (
        await c.query("SELECT password_hash FROM users WHERE id=$1", [u.id])
      ).rows[0];
      requireThat(fresh?.password_hash === hash, "Credenziali cambiate.", 409);
      await c.query("DELETE FROM users WHERE id=$1", [u.id]);
      await event(c, "account_deleted");
    });
    reply.clearCookie(cookieName, {
      path: "/",
      secure,
      httpOnly: true,
      sameSite: "strict",
    });
    return { ok: true };
  });
  app.get("/api/staff/reports", async (r) => {
    actor(r, { staff: true });
    return {
      reports: (
        await db.query(
          "SELECT r.*,i.tenant_id,i.landlord_id FROM reports r LEFT JOIN invitations i ON i.id=r.invitation_id ORDER BY r.created_at DESC,r.id DESC LIMIT 100 OFFSET $1",
          [
            z.coerce
              .number()
              .int()
              .min(0)
              .max(10000)
              .default(0)
              .parse((r.query as any).page) * 100,
          ],
        )
      ).rows,
    };
  });
  app.post("/api/staff/reports/:id/resolve", async (r) => {
    const u = actor(r, { staff: true }),
      id = idParam(r);
    const { resolution } = z
      .object({
        resolution: z.enum([
          "reviewed",
          "action_taken",
          "insufficient_context",
        ]),
      })
      .strict()
      .parse(r.body);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id]);
      await active(c, u.id);
      const result = await c.query(
        "UPDATE reports SET status='resolved',resolution=$2,resolved_by=$3,resolved_at=now() WHERE id=$1 AND status='open' RETURNING id",
        [id, resolution, u.id],
      );
      requireThat(result.rowCount, "Caso non disponibile.", 404);
      await c.query(
        "INSERT INTO audit_log(actor_id,action,reason_code) VALUES($1,'report_resolved',$2)",
        [u.id, resolution],
      );
    });
    return { ok: true };
  });
  app.get("/api/staff/users", async (r) => {
    actor(r, { admin: true });
    return {
      users: (
        await db.query(
          "SELECT u.id,u.display_name,u.role,u.staff_role,u.suspended,u.suspension_reason,u.created_at,a.reason AS appeal_reason,a.status AS appeal_status FROM users u LEFT JOIN appeals a ON a.user_id=u.id ORDER BY u.created_at DESC,u.id DESC LIMIT 100 OFFSET $1",
          [
            z.coerce
              .number()
              .int()
              .min(0)
              .max(10000)
              .default(0)
              .parse((r.query as any).page) * 100,
          ],
        )
      ).rows,
    };
  });
  app.post("/api/staff/users/:id/status", async (r) => {
    const u = actor(r, { admin: true }),
      id = idParam(r);
    const b = z
      .object({
        suspended: z.boolean(),
        reason: z.enum(["abuse", "security", "appeal_accepted"]),
      })
      .strict()
      .parse(r.body);
    requireThat(id !== u.id, "Non puoi sospendere il tuo account.", 400);
    await tx(db, async (c) => {
      await lockUsers(c, [u.id, id]);
      await active(c, u.id);
      const result = await c.query(
        "UPDATE users SET suspended=$2,suspension_reason=$3 WHERE id=$1 AND staff_role IS NULL RETURNING id",
        [id, b.suspended, b.reason],
      );
      requireThat(result.rowCount, "Account non modificabile.", 400);
      if (!b.suspended)
        await c.query(
          "UPDATE appeals SET status='resolved',resolved_at=now() WHERE user_id=$1",
          [id],
        );
      if (b.suspended) {
        await c.query("DELETE FROM sessions WHERE user_id=$1", [id]);
        await c.query(
          "UPDATE invitations SET status=CASE WHEN status='pending' THEN 'cancelled' ELSE 'closed' END WHERE (tenant_id=$1 OR landlord_id=$1) AND status IN ('pending','accepted')",
          [id],
        );
      }
      await c.query(
        "INSERT INTO audit_log(actor_id,subject_id,action,reason_code) VALUES($1,$2,$3,$4)",
        [u.id, id, b.suspended ? "user_suspended" : "user_restored", b.reason],
      );
    });
    return { ok: true };
  });
  app.get("/api/staff/analytics", async (r) => {
    actor(r, { admin: true });
    const [users, properties, profiles, invites, reports, events, audit] =
      await Promise.all([
        db.query("SELECT count(*)::int AS count FROM users"),
        db.query(
          "SELECT count(*)::int AS count FROM properties p JOIN users u ON u.id=p.owner_id WHERE p.status='published' AND p.authority_attested=true AND p.published_at>now()-interval '30 days' AND u.email_verified=true AND u.suspended=false",
        ),
        db.query(
          "SELECT count(*)::int AS count FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.status='published' AND u.email_verified=true AND u.suspended=false",
        ),
        db.query(
          "SELECT CASE WHEN i.status='pending' AND i.expires_at<=now() THEN 'expired' WHEN i.status='pending' AND (p.status<>'published' OR NOT p.authority_attested OR p.published_at<=now()-interval '30 days') THEN 'unavailable' ELSE i.status END AS status,count(*)::int AS count FROM invitations i JOIN properties p ON p.id=i.property_id GROUP BY 1",
        ),
        db.query(
          "SELECT status,count(*)::int AS count FROM reports GROUP BY status",
        ),
        db.query(
          "SELECT name,count(*)::int AS count FROM events WHERE created_at>now()-interval '30 days' GROUP BY name",
        ),
        db.query(
          "SELECT action,reason_code,created_at FROM audit_log ORDER BY id DESC LIMIT 30",
        ),
      ]);
    return {
      users: users.rows[0].count,
      properties: properties.rows[0].count,
      profiles: profiles.rows[0].count,
      invitations: invites.rows,
      reports: reports.rows,
      events: events.rows,
      audit: audit.rows,
      scope: "local_workflow_counts_not_market_kpis",
    };
  });
  if (
    options.serveStatic !== false &&
    existsSync(path.resolve("dist/index.html"))
  ) {
    await app.register(staticPlugin, {
      root: path.resolve("dist"),
      wildcard: false,
    });
    app.setNotFoundHandler((r, reply) => {
      if (r.url.startsWith("/api/"))
        return reply.code(404).send({ error: "Risorsa non trovata." });
      return reply.header("Cache-Control", "no-store").sendFile("index.html");
    });
  }
  return app;
}

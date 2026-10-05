import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { buildApp } from "../server/app";
import { digest, token, hashPassword } from "../server/auth";
import { makePool } from "../server/db";
import { migrate } from "../scripts/migrate";
import type { PhotoStorage } from "../server/photos";
import { cleanupPhotoObjects } from "../server/photos";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error("Income-dossier tests require isolated local soglia_test.");
const db = makePool(url),
  origin = "http://127.0.0.1:3000";
const objects = new Map<string, Buffer>();
let failPut = false;
let failDelete = false;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
let pause: {
  reached: ReturnType<typeof deferred>;
  resume: ReturnType<typeof deferred>;
} | null = null;
const storage: PhotoStorage = {
  async put(key, body) {
    if (failPut) {
      failPut = false;
      objects.set(key, Buffer.from(body));
      throw new Error("Synthetic storage failure");
    }
    objects.set(key, Buffer.from(body));
  },
  async get(key) {
    const body = objects.get(key);
    if (!body) throw new Error("Synthetic object absent");
    const barrier = pause;
    if (barrier) {
      barrier.reached.resolve();
      await barrier.resume.promise;
    }
    return Buffer.from(body);
  },
  async delete(key) {
    if (failDelete) throw new Error("Synthetic object deletion failure");
    objects.delete(key);
  },
};
const app = await buildApp(db, {
  origin,
  limits: false,
  serveStatic: false,
  mail: async () => {},
  photoStorage: storage,
});
type Person = { id: string; cookie: string };
const month = (offset: number) => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1))
    .toISOString()
    .slice(0, 7);
};
const period = { period_from: month(-3), period_to: month(-1) };
function incomePerson(patch = {}) {
  return {
    id: randomUUID(),
    label: "Persona sintetica",
    source: "employment",
    monthly_net_cents: 180000,
    ...period,
    ...patch,
  };
}
const samplePdf = await PDFDocument.create();
samplePdf.addPage().drawText("Synthetic income evidence for automated tests");
const pdf = Buffer.from(await samplePdf.save());
const changedSamplePdf = await PDFDocument.create();
changedSamplePdf.addPage().drawText("Different synthetic income evidence");
const changedPdf = Buffer.from(await changedSamplePdf.save());
let tenant: Person,
  landlord: Person,
  outsider: Person,
  property: any,
  profile: any,
  roster: any[];
function request(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  actor?: Person,
  payload?: any,
  headers: Record<string, string> = {},
) {
  return app.inject({
    method,
    url: `/api${path}`,
    payload,
    headers: {
      origin,
      "content-type": "application/json",
      ...(actor ? { cookie: actor.cookie } : {}),
      ...headers,
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
async function own() {
  const r = await request("GET", "/income/dossier", tenant);
  expect(r.statusCode).toBe(200);
  return r.json();
}
async function save(patch: Record<string, unknown> = {}) {
  const previous = (await own()).dossier;
  const r = await request("PUT", "/income/dossier", tenant, {
    tenants: roster,
    guarantor: null,
    people_permission: true,
    expected_revision: previous?.revision ?? null,
    ...patch,
  });
  expect(r.statusCode, r.body).toBe(200);
  return r.json().dossier;
}
async function send(accepted = true) {
  const r = await request("POST", "/invitations", landlord, {
    property_id: property.id,
    tenant_id: tenant.id,
    property_revision: property.revision,
    profile_revision: profile.revision,
  });
  expect(r.statusCode).toBe(201);
  const id = r.json().id;
  if (accepted)
    expect(
      (
        await request("POST", `/invitations/${id}/action`, tenant, {
          action: "accept",
          property_revision: property.revision,
          profile_revision: profile.revision,
        })
      ).statusCode,
    ).toBe(200);
  return id as string;
}
async function share(id: string, d: any) {
  const r = await request("POST", "/income/dossier/shares", tenant, {
    invitation_id: id,
    dossier_id: d.id,
    revision: d.revision,
    consent: true,
    documents_consent: true,
  });
  expect(r.statusCode, r.body).toBe(201);
  return r.json().share;
}
function uploadResponse(
  d: any,
  personId = roster[0].id,
  key = randomUUID(),
  body = pdf,
  mime = "application/pdf",
  kind = "payslip",
) {
  const boundary = `synthetic-${randomUUID()}`;
  const payload = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="synthetic-private-file.pdf"\r\nContent-Type: ${mime}\r\n\r\n`,
    ),
    body,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  return request(
    "POST",
    `/income/dossier/people/${personId}/documents?revision=${d.revision}&kind=${kind}`,
    tenant,
    payload,
    {
      "content-type": `multipart/form-data; boundary=${boundary}`,
      "idempotency-key": key,
    },
  );
}
async function upload(d: any, personId = roster[0].id) {
  const r = await uploadResponse(d, personId);
  expect(r.statusCode, r.body).toBe(201);
  return r.json();
}
async function visible(id: string, viewer = landlord) {
  const r = await request("GET", `/invitations/${id}/income-dossier`, viewer);
  expect(r.statusCode).toBe(200);
  return r.json();
}
function reviewPayload(s: any, doc: any, patch = {}) {
  return {
    person_id: doc.person_id,
    document_id: doc.id,
    revision: s.revision,
    observed_net_cents: 175000,
    ...period,
    confirm: true,
    ...patch,
  };
}
function expectNoPrivateMetadata(body: string) {
  for (const value of [
    "object_key",
    "sha256",
    "synthetic-private-file.pdf",
    "income-documents/",
    "reviewer_id",
    "user_id",
  ])
    expect(body).not.toContain(value);
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
    throw new Error("Unsafe effective income-dossier connection.");
  await migrate(db);
  await app.ready();
});
beforeEach(async () => {
  await db.query(
    "TRUNCATE users,events,audit_log,photo_object_deletions RESTART IDENTITY CASCADE",
  );
  objects.clear();
  failPut = false;
  failDelete = false;
  pause = null;
  tenant = await person("tenant");
  landlord = await person("landlord");
  outsider = await person("landlord");
  roster = [
    incomePerson({ label: "Affittuario A", monthly_net_cents: 160000 }),
    incomePerson({ label: "Affittuario B", monthly_net_cents: 180000 }),
  ];
  profile = (
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2028-01-15',12,2,'published',now()) RETURNING *",
      [tenant.id],
    )
  ).rows[0];
  property = (
    await db.query(
      "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) VALUES($1,'Casa sintetica','Bologna','Saragozza','Casa sintetica per le prove dei redditi.',850,'2028-01-01',6,36,2,65,3,true,true,'published',now()) RETURNING *",
      [landlord.id],
    )
  ).rows[0];
});
afterAll(async () => {
  await app.close();
  await db.end();
});

describe("private income dossiers and chosen-landlord document review", () => {
  it("saves one or more tenants and a separate guarantor without summing the guarantor", async () => {
    expect(await own()).toEqual({ dossier: null, shares: [] });
    const guarantor = incomePerson({
      label: "Garante sintetico",
      monthly_net_cents: 500000,
    });
    const d = await save({ guarantor });
    expect(d).toMatchObject({
      revision: 1,
      tenants: roster,
      guarantor,
      synthetic: true,
      totals: {
        declared_total_cents: 340000,
        declared_count: 2,
        total_count: 2,
        complete: true,
      },
      documents: [],
    });
    expectNoPrivateMetadata(JSON.stringify(d));
    const only = await save({ tenants: [roster[0]] });
    expect(only).toMatchObject({
      revision: 2,
      guarantor: null,
      totals: { declared_total_cents: 160000, total_count: 1, complete: true },
    });
    expect((await own()).dossier).toEqual(only);
  });
  it("keeps missing income distinct from zero and suppresses incomplete comparisons", async () => {
    const d = await save({
      tenants: [
        roster[0],
        incomePerson({ source: "not_specified", monthly_net_cents: null }),
      ],
    });
    expect(d.totals).toEqual({
      declared_total_cents: 160000,
      declared_count: 1,
      total_count: 2,
      complete: false,
    });
    const id = await send();
    expect((await visible(id, tenant)).comparison).toBeNull();
    const zero = await save({
      tenants: [incomePerson({ source: "no_income", monthly_net_cents: 0 })],
    });
    expect(zero.totals).toEqual({
      declared_total_cents: 0,
      declared_count: 1,
      total_count: 1,
      complete: true,
    });
    expect((await visible(id, tenant)).comparison).toBeNull();
  });
  it("enforces CAS and strict inputs atomically, including duplicate IDs and permissions", async () => {
    const d = await save(),
      before = await own();
    const invalid = [
      { people_permission: false },
      { tenants: [] },
      { tenants: [roster[0], roster[0]] },
      { guarantor: roster[0] },
      { tenants: [incomePerson({ monthly_net_cents: -1 })] },
      {
        tenants: [
          incomePerson({ source: "no_income", monthly_net_cents: null }),
        ],
      },
      { tenants: [incomePerson({ period_to: month(1) })] },
      { reviewed: true },
    ];
    for (const patch of invalid) {
      expect(
        (
          await request("PUT", "/income/dossier", tenant, {
            tenants: roster,
            guarantor: null,
            people_permission: true,
            expected_revision: d.revision,
            ...patch,
          })
        ).statusCode,
      ).toBe(400);
      expect(await own()).toEqual(before);
    }
    expect(
      (
        await request("PUT", "/income/dossier", tenant, {
          tenants: roster,
          guarantor: null,
          people_permission: true,
          expected_revision: null,
        })
      ).statusCode,
    ).toBe(409);
    const results = await Promise.all(
      [1, 2].map(() =>
        request("PUT", "/income/dossier", tenant, {
          tenants: roster,
          guarantor: null,
          people_permission: true,
          expected_revision: d.revision,
        }),
      ),
    );
    expect(results.map((r) => r.statusCode).sort()).toEqual([200, 409]);
    expect((await own()).dossier.revision).toBe(2);
  });
  it("canonicalizes uppercase person IDs so their documents can be uploaded", async () => {
    const upper = { ...roster[0], id: roster[0].id.toUpperCase() };
    const d = await save({ tenants: [upper] });
    expect(d.tenants[0].id).toBe(roster[0].id);
    const result = await upload(d, upper.id);
    expect(result.document.person_id).toBe(roster[0].id);
  });
  it("stores normalized PDF and image evidence privately without inventing a verification", async () => {
    let d = await save();
    const first = await upload(d);
    d = first.dossier;
    expect(first.document).toMatchObject({
      person_id: roster[0].id,
      kind: "payslip",
      mime: "application/pdf",
      bytes: pdf.length,
    });
    const png = await sharp({
      create: { width: 48, height: 32, channels: 3, background: "#0066aa" },
    })
      .png()
      .toBuffer();
    const image = await uploadResponse(
      d,
      roster[1].id,
      randomUUID(),
      png,
      "image/png",
      "other",
    );
    expect(image.statusCode).toBe(201);
    expect(image.json().document.mime).toBe("image/webp");
    expect(image.json().dossier.revision).toBe(3);
    expectNoPrivateMetadata(image.body);
    expect(
      (await request("GET", first.document.url.replace("/api", ""), tenant))
        .rawPayload,
    ).toEqual(pdf);
    expect(
      (await db.query("SELECT count(*)::int AS n FROM income_dossier_reviews"))
        .rows[0].n,
    ).toBe(0);
  });
  it("replays an identical completed upload before checking a stale revision and rejects changed retries", async () => {
    const d = await save(),
      key = randomUUID();
    const first = await uploadResponse(d, roster[0].id, key);
    expect(first.statusCode).toBe(201);
    const retry = await uploadResponse(d, roster[0].id, key);
    expect(retry.statusCode).toBe(201);
    expect(retry.json()).toEqual(first.json());
    expect((await uploadResponse(d, roster[1].id, key)).statusCode).toBe(409);
    expect(
      (await uploadResponse(d, roster[0].id, key, changedPdf)).statusCode,
    ).toBe(409);
    expect((await own()).dossier.revision).toBe(2);
    expect(objects.size).toBe(1);
    const concurrentKey = randomUUID(),
      current = (await own()).dossier;
    const results = await Promise.all([
      uploadResponse(current, roster[0].id, concurrentKey),
      uploadResponse(current, roster[0].id, concurrentKey),
    ]);
    expect(results.map((r) => r.statusCode)).toEqual([201, 201]);
    expect(results[0].json()).toEqual(results[1].json());
    expect((await own()).dossier.revision).toBe(3);
  });
  it("enforces three documents per person and leaves failed uploads atomic and retryable", async () => {
    let d = await save();
    const key = randomUUID();
    failPut = true;
    expect((await uploadResponse(d, roster[0].id, key)).statusCode).toBe(500);
    expect((await own()).dossier.revision).toBe(1);
    expect(objects.size).toBe(0);
    let r = await uploadResponse(d, roster[0].id, key);
    expect(r.statusCode).toBe(201);
    d = r.json().dossier;
    for (let n = 0; n < 2; n++) d = (await upload(d)).dossier;
    expect((await uploadResponse(d)).statusCode).toBe(409);
    expect((await uploadResponse(d, randomUUID())).statusCode).toBe(404);
    expect((await own()).dossier.revision).toBe(4);
    expect(objects.size).toBe(3);
  });
  it("rejects malformed documents and stale uploads without revising the dossier", async () => {
    const d = await save();
    for (const [body, mime] of [
      [Buffer.from("not-pdf"), "application/pdf"],
      [Buffer.from("%PDF-1.4\n/JavaScript\n%%EOF"), "application/pdf"],
      [Buffer.from("not-image"), "image/png"],
      [pdf, "text/plain"],
    ] as const)
      expect(
        (await uploadResponse(d, roster[0].id, randomUUID(), body, mime))
          .statusCode,
      ).toBe(415);
    expect((await own()).dossier.revision).toBe(1);
    expect(objects.size).toBe(0);
    await save();
    expect((await uploadResponse(d)).statusCode).toBe(409);
  });
  it("requires an accepted conversation and both consents while hiding all private state beforehand", async () => {
    const first = await upload(await save()),
      d = first.dossier,
      id = await send(false);
    expect(await visible(id)).toEqual({
      status: "unavailable",
      dossier: null,
      share: null,
      can_share: false,
      comparison: null,
      reviews: [],
    });
    expect(
      (await request("GET", first.document.url.replace("/api", ""), landlord))
        .statusCode,
    ).toBe(404);
    expect(
      (
        await request("POST", "/income/dossier/shares", tenant, {
          invitation_id: id,
          dossier_id: d.id,
          revision: d.revision,
          consent: true,
          documents_consent: true,
        })
      ).statusCode,
    ).toBe(409);
    expect(
      (
        await request("POST", `/invitations/${id}/action`, tenant, {
          action: "accept",
          property_revision: property.revision,
          profile_revision: profile.revision,
        })
      ).statusCode,
    ).toBe(200);
    for (const patch of [
      { consent: false },
      { documents_consent: false },
      { documents_consent: undefined },
    ])
      expect(
        (
          await request("POST", "/income/dossier/shares", tenant, {
            invitation_id: id,
            dossier_id: d.id,
            revision: d.revision,
            consent: true,
            documents_consent: true,
            ...patch,
          })
        ).statusCode,
      ).toBe(400);
    expect(
      (
        await request("POST", "/income/dossier/shares", landlord, {
          invitation_id: id,
          dossier_id: d.id,
          revision: d.revision,
          consent: true,
          documents_consent: true,
        })
      ).statusCode,
    ).toBe(403);
    const s = await share(id, d);
    expect(s).toMatchObject({
      revision: d.revision,
      available: true,
      consent_version: "income-dossier-v1",
      documents_consent: true,
    });
    const shown = await visible(id);
    expect(shown.dossier).toEqual(d);
    expect(shown.reviews).toEqual([]);
    expect(shown.comparison).toEqual({
      rent: 850,
      declared_total_cents: 340000,
      percent_of_income: 25,
    });
    expectNoPrivateMetadata(JSON.stringify(shown));
    expect(
      (await request("GET", `/invitations/${id}/income-dossier`, outsider))
        .statusCode,
    ).toBe(404);
    expect(
      (await request("GET", first.document.url.replace("/api", ""), outsider))
        .statusCode,
    ).toBe(404);
  });
  it("records only a chosen recipient's manual review of a document actually downloaded for this revision", async () => {
    const result = await upload(await save()),
      id = await send(),
      s = await share(id, result.dossier);
    const payload = reviewPayload(s, result.document);
    expect(
      (
        await request(
          "POST",
          `/income/dossier/shares/${s.id}/reviews`,
          tenant,
          payload,
        )
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await request(
          "POST",
          `/income/dossier/shares/${s.id}/reviews`,
          outsider,
          payload,
        )
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await request(
          "POST",
          `/income/dossier/shares/${s.id}/reviews`,
          landlord,
          payload,
        )
      ).statusCode,
    ).toBe(409);
    const raw = await request(
      "GET",
      result.document.url.replace("/api", ""),
      landlord,
    );
    expect(raw.statusCode).toBe(200);
    expect(raw.rawPayload).toEqual(pdf);
    expect(raw.headers).toMatchObject({
      "cache-control": "private, no-store",
      "content-disposition": 'attachment; filename="documento.pdf"',
      "x-content-type-options": "nosniff",
      "content-security-policy": "sandbox; default-src 'none'",
    });
    for (const patch of [
      { confirm: false },
      { method: "independent_verification" },
      { observed_net_cents: -1 },
    ])
      expect(
        (
          await request(
            "POST",
            `/income/dossier/shares/${s.id}/reviews`,
            landlord,
            { ...payload, ...patch },
          )
        ).statusCode,
      ).toBe(400);
    const reviewed = await request(
      "POST",
      `/income/dossier/shares/${s.id}/reviews`,
      landlord,
      payload,
    );
    expect(reviewed.statusCode).toBe(201);
    expect(reviewed.json().review).toMatchObject({
      person_id: roster[0].id,
      document_id: result.document.id,
      observed_net_cents: 175000,
      revision: s.revision,
      method: "landlord_document_review",
    });
    const shown = await visible(id);
    expect(shown.reviews).toEqual([reviewed.json().review]);
    expect(shown.dossier.totals.declared_total_cents).toBe(340000);
    expect(shown.comparison.percent_of_income).toBe(25);
    expectNoPrivateMetadata(reviewed.body);
  });
  it("binds comparison to the accepted offer rather than later rent changes", async () => {
    const d = await save(),
      id = await send();
    await share(id, d);
    await db.query(
      "UPDATE properties SET rent=1000,revision=revision+1 WHERE id=$1",
      [property.id],
    );
    expect((await visible(id)).comparison).toEqual({
      rent: 850,
      declared_total_cents: 340000,
      percent_of_income: 25,
    });
  });
  it("revokes prior access on roster edits but retains evidence privately for surviving people", async () => {
    const first = await upload(await save()),
      id = await send(),
      s = await share(id, first.dossier);
    await request("GET", first.document.url.replace("/api", ""), landlord);
    await request(
      "POST",
      `/income/dossier/shares/${s.id}/reviews`,
      landlord,
      reviewPayload(s, first.document),
    );
    const changed = await save({
      tenants: [{ ...roster[0], monthly_net_cents: 170000 }, roster[1]],
    });
    expect(changed.documents).toEqual([first.document]);
    expect(objects.size).toBe(1);
    expect((await visible(id)).dossier).toBeNull();
    expect((await visible(id)).reviews).toEqual([]);
    expect(
      (await request("GET", first.document.url.replace("/api", ""), landlord))
        .statusCode,
    ).toBe(404);
    const fresh = await share(id, changed);
    expect(fresh.revision).toBe(changed.revision);
    expect(
      (
        await request(
          "POST",
          `/income/dossier/shares/${fresh.id}/reviews`,
          landlord,
          reviewPayload(fresh, first.document),
        )
      ).statusCode,
    ).toBe(409);
    expect((await visible(id)).reviews).toEqual([]);
  });
  it("revokes on upload/removal and retires deleted document tokens", async () => {
    const d = await save(),
      key = randomUUID(),
      first = await uploadResponse(d, roster[0].id, key);
    expect(first.statusCode).toBe(201);
    const id = await send();
    await share(id, first.json().dossier);
    const second = await upload(first.json().dossier, roster[1].id);
    expect((await visible(id)).dossier).toBeNull();
    await share(id, second.dossier);
    expect(
      (
        await request(
          "DELETE",
          `/income/dossier/documents/${first.json().document.id}?revision=${first.json().dossier.revision}`,
          tenant,
          {},
        )
      ).statusCode,
    ).toBe(409);
    const removed = await request(
      "DELETE",
      `/income/dossier/documents/${first.json().document.id}?revision=${second.dossier.revision}`,
      tenant,
      {},
    );
    expect(removed.statusCode).toBe(200);
    expect(removed.json().dossier.documents).toEqual([second.document]);
    expect(objects.size).toBe(1);
    expect((await uploadResponse(d, roster[0].id, key)).statusCode).toBe(409);
    expect((await visible(id)).dossier).toBeNull();
  });
  it("removes evidence when its person leaves the dossier without letting a late retry restore it", async () => {
    const d = await save(),
      key = randomUUID(),
      first = await uploadResponse(d, roster[0].id, key);
    expect(first.statusCode).toBe(201);
    const changed = await save({ tenants: [roster[1]] });
    expect(changed.documents).toEqual([]);
    expect(objects.size).toBe(0);
    expect((await uploadResponse(d, roster[0].id, key)).statusCode).toBe(409);
    expect(
      (
        await request(
          "GET",
          first.json().document.url.replace("/api", ""),
          tenant,
        )
      ).statusCode,
    ).toBe(404);
  });
  it("durably queues failed object cleanup while immediately removing document access", async () => {
    const result = await upload(await save()),
      id = await send(),
      s = await share(id, result.dossier);
    const key = [...objects.keys()][0];
    failDelete = true;
    const response = await request(
      "DELETE",
      `/income/dossier/documents/${result.document.id}?revision=${result.dossier.revision}`,
      tenant,
      {},
    );
    expect(response.statusCode).toBe(200);
    expect(response.json().dossier.documents).toEqual([]);
    expect(
      (await own()).shares.find((share: any) => share.id === s.id).status,
    ).toBe("revoked");
    expect(objects.has(key)).toBe(true);
    expect(
      (await db.query("SELECT object_key FROM photo_object_deletions")).rows,
    ).toEqual([{ object_key: key }]);
    for (const viewer of [tenant, landlord])
      expect(
        (await request("GET", result.document.url.replace("/api", ""), viewer))
          .statusCode,
      ).toBe(404);
    failDelete = false;
    await cleanupPhotoObjects(db, storage);
    expect(objects.size).toBe(0);
    expect(
      (await db.query("SELECT object_key FROM photo_object_deletions")).rows,
    ).toEqual([]);
  });
  it.each(["revoked", "closed", "blocked", "suspended"] as const)(
    "denies all subsequent document and review access when the contact is %s",
    async (state) => {
      const result = await upload(await save()),
        id = await send(),
        s = await share(id, result.dossier);
      await request("GET", result.document.url.replace("/api", ""), landlord);
      await request(
        "POST",
        `/income/dossier/shares/${s.id}/reviews`,
        landlord,
        reviewPayload(s, result.document),
      );
      if (state === "revoked") {
        expect(
          (
            await request(
              "DELETE",
              `/income/dossier/shares/${s.id}`,
              tenant,
              {},
            )
          ).statusCode,
        ).toBe(200);
        expect(
          (
            await request(
              "DELETE",
              `/income/dossier/shares/${s.id}`,
              tenant,
              {},
            )
          ).statusCode,
        ).toBe(200);
      } else if (state === "closed")
        await request("POST", `/invitations/${id}/action`, tenant, {
          action: "close",
        });
      else if (state === "blocked")
        await request("POST", "/blocks", tenant, { invitation_id: id });
      else
        await db.query("UPDATE users SET suspended=true WHERE id=$1", [
          tenant.id,
        ]);
      expect(await visible(id)).toEqual({
        status: "unavailable",
        dossier: null,
        share: null,
        can_share: false,
        comparison: null,
        reviews: [],
      });
      expect(
        (
          await request(
            "GET",
            result.document.url.replace("/api", ""),
            landlord,
          )
        ).statusCode,
      ).toBe(404);
      expect(
        (
          await request(
            "POST",
            `/income/dossier/shares/${s.id}/reviews`,
            landlord,
            reviewPayload(s, result.document),
          )
        ).statusCode,
      ).toBe(409);
    },
  );
  it.each(["revoke", "block", "delete_document"] as const)(
    "rechecks download authorization after a slow object read races with %s",
    async (action) => {
      const result = await upload(await save()),
        id = await send(),
        s = await share(id, result.dossier);
      const barrier = {
        reached: deferred(),
        resume: deferred(),
      };
      pause = barrier;
      const downloading = request(
        "GET",
        result.document.url.replace("/api", ""),
        landlord,
      );
      await barrier.reached.promise;
      if (action === "revoke")
        await request("DELETE", `/income/dossier/shares/${s.id}`, tenant, {});
      else if (action === "block")
        await request("POST", "/blocks", tenant, { invitation_id: id });
      else
        await request(
          "DELETE",
          `/income/dossier/documents/${result.document.id}?revision=${result.dossier.revision}`,
          tenant,
          {},
        );
      pause = null;
      barrier.resume.resolve();
      const response = await downloading;
      expect(response.statusCode).toBe(404);
      expect(response.body).not.toContain("%PDF");
      expect(
        (
          await db.query(
            "SELECT count(*)::int AS n FROM income_document_downloads",
          )
        ).rows[0].n,
      ).toBe(0);
    },
  );
  it("keeps discovery and the old income simulator unaffected, and exports only holder metadata", async () => {
    const before = (
      await request("GET", `/discover/${property.id}`, landlord)
    ).json().profiles;
    const result = await upload(await save()),
      id = await send(),
      s = await share(id, result.dossier);
    const exported = await request("GET", "/account/export", tenant);
    expect(exported.json().income_dossier).toEqual(result.dossier);
    expect(exported.json().income_dossier_shares).toEqual([s]);
    expectNoPrivateMetadata(
      JSON.stringify({
        dossier: exported.json().income_dossier,
        shares: exported.json().income_dossier_shares,
      }),
    );
    const recipientExport = await request("GET", "/account/export", landlord);
    expect(recipientExport.json()).not.toHaveProperty("income_dossier");
    expect(recipientExport.body).not.toContain(result.dossier.id);
    expect((await request("GET", "/income", tenant)).json()).toMatchObject({
      provider_available: false,
      status: "not_requested",
      attestation: null,
      history: [],
    });
    const untouched = before[0];
    expect(JSON.stringify(untouched)).not.toMatch(
      /dossier|document|income|review/,
    );
    await db.query("DELETE FROM invitations WHERE id=$1", [id]);
    expect(
      (await request("GET", `/discover/${property.id}`, landlord)).json()
        .profiles,
    ).toEqual(before);
    expect(
      JSON.stringify((await db.query("SELECT * FROM audit_log")).rows),
    ).not.toContain("180000");
    expect(
      (await db.query("SELECT name FROM events WHERE name LIKE 'income_%'"))
        .rows,
    ).toEqual([]);
  });
  it("deletes all private objects and metadata with the holder account", async () => {
    const result = await upload(await save()),
      id = await send();
    await share(id, result.dossier);
    const password = "Synthetic-only-income-passphrase";
    await db.query("UPDATE users SET password_hash=$2 WHERE id=$1", [
      tenant.id,
      await hashPassword(password),
    ]);
    expect(
      (
        await request("DELETE", "/account", tenant, {
          password,
          confirm: "ELIMINA",
        })
      ).statusCode,
    ).toBe(200);
    expect(objects.size).toBe(0);
    for (const table of [
      "income_dossiers",
      "income_documents",
      "income_document_upload_requests",
      "income_dossier_shares",
      "income_document_downloads",
      "income_dossier_reviews",
    ])
      expect(
        (await db.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n,
      ).toBe(0);
    expect(
      (await request("GET", result.document.url.replace("/api", ""), landlord))
        .statusCode,
    ).toBe(404);
  });
  it("keeps financially forged cross-workspace contacts and documents inaccessible", async () => {
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
      photoStorage: storage,
    });
    type Jar = Map<string, string>;
    async function hostedRequest(
      jar: Jar,
      method: "GET" | "POST" | "PUT",
      path: string,
      payload?: any,
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
      await hostedRequest(first, "POST", "/auth/preview", { role: "tenant" });
      const subject = (await hostedRequest(first, "GET", "/session")).json()
        .user;
      const saved = await hostedRequest(first, "PUT", "/income/dossier", {
        tenants: roster,
        guarantor: null,
        people_permission: true,
        expected_revision: null,
      });
      expect(saved.statusCode).toBe(200);
      const d = saved.json().dossier;
      await hostedRequest(second, "POST", "/auth/preview", {
        role: "landlord",
      });
      const recipient = (await hostedRequest(second, "GET", "/session")).json()
        .user;
      const p = (await hostedRequest(second, "GET", "/properties")).json()
        .properties[0];
      const i = (
        await db.query(
          "INSERT INTO invitations(property_id,tenant_id,landlord_id,property_revision,profile_revision,property_snapshot,status,accepted_at) VALUES($1,$2,$3,$4,1,$5,'accepted',now()) RETURNING id",
          [p.id, subject.id, recipient.id, p.revision, JSON.stringify(p)],
        )
      ).rows[0];
      await db.query(
        "INSERT INTO income_dossier_shares(dossier_id,owner_id,recipient_id,invitation_id,revision,documents_consent) VALUES($1,$2,$3,$4,$5,true)",
        [d.id, subject.id, recipient.id, i.id, d.revision],
      );
      const docId = randomUUID(),
        key = `income-documents/${docId}.pdf`;
      objects.set(key, pdf);
      await db.query(
        "INSERT INTO income_documents(id,dossier_id,person_id,kind,mime,byte_size,sha256,object_key) VALUES($1,$2,$3,'payslip','application/pdf',$4,$5,$6)",
        [docId, d.id, roster[0].id, pdf.length, "a".repeat(64), key],
      );
      const shown = await hostedRequest(
        second,
        "GET",
        `/invitations/${i.id}/income-dossier`,
      );
      expect(shown.statusCode).toBe(200);
      expect(shown.json()).toEqual({
        status: "unavailable",
        dossier: null,
        share: null,
        can_share: false,
        comparison: null,
        reviews: [],
      });
      expect(
        (
          await hostedRequest(
            second,
            "GET",
            `/income/dossier/documents/${docId}`,
          )
        ).statusCode,
      ).toBe(404);
      expect(
        (await hostedRequest(second, "GET", "/income/dossier")).json(),
      ).toEqual({ dossier: null, shares: [] });
    } finally {
      await hosted.close();
    }
  });
});

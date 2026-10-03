import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { buildApp } from "../server/app";
import { makePool } from "../server/db";
import { migrate } from "../scripts/migrate";
import { digest, hashPassword, token } from "../server/auth";
import {
  demoIncomeResult,
  incomeStatus,
  unavailableIncomeProvider,
} from "../server/income";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  process.env.DATABASE_URL ||
  new URL(url).search !== "" ||
  new URL(url).pathname !== "/soglia_test" ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw new Error("Refusing income tests outside isolated local soglia_test.");
const db = makePool(url);
const origin = "http://127.0.0.1:3000";
const app = await buildApp(db, { origin, limits: false, serveStatic: false });
const disabledDemoApp = await buildApp(db, {
  origin,
  limits: false,
  serveStatic: false,
  incomeDemo: false,
});
const pwd = "Synthetic-income-only-passphrase";
let passwordHash: string;
type Person = { id: string; cookie: string; email: string };
let tenant: Person, landlord: Person, outsider: Person;
let property: any, invitationId: string;
let currentAttestationId: string;
function request(
  method: any,
  path: string,
  body?: any,
  user?: Person,
  target = app,
) {
  return target.inject({
    method,
    url: "/api" + path,
    headers: {
      origin,
      "content-type": "application/json",
      ...(user ? { cookie: user.cookie } : {}),
    },
    payload: body,
  });
}
async function person(
  role: "tenant" | "landlord" | "both",
  displayName: string,
) {
  const id = randomUUID(),
    email = `${id}@example.test`,
    secret = token();
  await db.query(
    "INSERT INTO users(id,email,password_hash,display_name,role,email_verified) VALUES($1,$2,$3,$4,$5,true)",
    [id, email, passwordHash, displayName, role],
  );
  await db.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 day')",
    [digest(secret), id],
  );
  return { id, email, cookie: `soglia=${secret}` };
}
async function propertyFor(owner = landlord, title = "Casa sintetica privata") {
  return (
    await db.query(
      `INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at)
    VALUES($1,$2,'Bologna','Saragozza','Immobile sintetico per i test di condivisione.',850,'2026-12-01',6,36,2,65,3,true,true,'published',now()) RETURNING *`,
      [owner.id, title],
    )
  ).rows[0];
}
async function invite(p = property, owner = landlord) {
  const response = await request(
    "POST",
    "/invitations",
    {
      property_id: p.id,
      tenant_id: tenant.id,
      property_revision: p.revision,
      profile_revision: 1,
    },
    owner,
  );
  expect(response.statusCode).toBe(201);
  return response.json().id as string;
}
async function demo(scenario = "completed", category = "employment") {
  const response = await request(
    "POST",
    "/income/demo",
    { scenario, category },
    tenant,
  );
  expect(response.statusCode).toBe(201);
  const observation = response.json().attestation;
  currentAttestationId = observation.id;
  return observation;
}
async function share(id = invitationId) {
  const response = await request(
    "POST",
    "/income/shares",
    { invitation_id: id, attestation_id: currentAttestationId, consent: true },
    tenant,
  );
  expect(response.statusCode).toBe(201);
  return response.json().share;
}
const visible = (user = landlord, id = invitationId) =>
  request("GET", `/invitations/${id}/income`, undefined, user);
const unavailable = {
  status: "unavailable",
  attestation: null,
  share: null,
  can_share: false,
};

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
    throw new Error("Unsafe effective income test connection.");
  await migrate(db);
  passwordHash = await hashPassword(pwd);
  await Promise.all([app.ready(), disabledDemoApp.ready()]);
});
afterAll(async () => {
  await Promise.all([app.close(), disabledDemoApp.close()]);
  await db.end();
});
beforeEach(async () => {
  await db.query("TRUNCATE users,events,audit_log RESTART IDENTITY CASCADE");
  tenant = await person("tenant", "Candidato sintetico riservato");
  landlord = await person("landlord", "Proprietario sintetico riservato");
  outsider = await person("both", "Estraneo sintetico riservato");
  await db.query(
    "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2027-01-01',12,2,'published',now())",
    [tenant.id],
  );
  property = await propertyFor();
  invitationId = await invite();
});

describe("income source and private state", () => {
  it("distinguishes no request, an unavailable real provider, and the local-only simulator", async () => {
    expect((await request("GET", "/income", undefined, tenant)).json()).toEqual(
      {
        provider_available: false,
        demo_available: true,
        status: "not_requested",
        attestation: null,
        history: [],
        shares: [],
      },
    );
    expect(
      (await request("POST", "/income/checks", {}, tenant)).statusCode,
    ).toBe(503);
    expect(
      (await request("POST", "/income/checks", {}, landlord)).statusCode,
    ).toBe(403);
    expect(
      (
        await request(
          "POST",
          "/income/demo",
          { scenario: "completed" },
          landlord,
        )
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await request(
          "POST",
          "/income/demo",
          { scenario: "completed" },
          tenant,
          disabledDemoApp,
        )
      ).statusCode,
    ).toBe(503);
    expect(
      (
        await request("GET", "/income", undefined, tenant, disabledDemoApp)
      ).json().demo_available,
    ).toBe(false);
    expect((await visible()).json()).toEqual(unavailable);
    expect((await request("GET", "/income")).statusCode).toBe(401);
    await expect(
      unavailableIncomeProvider.request({
        subject_id: tenant.id,
        authorization_reference: "synthetic-only",
      }),
    ).rejects.toMatchObject({ statusCode: 503, code: "provider_unavailable" });
  });
  it.each([
    ["pending", "pending"],
    ["completed", "completed"],
    ["insufficient", "insufficient"],
    ["error", "failed"],
    ["expired", "expired"],
  ])(
    "keeps synthetic scenario %s scoped to its holder",
    async (scenario, expected) => {
      const observation = await demo(scenario);
      expect(observation).toMatchObject({
        status: expected,
        synthetic: true,
        provider: "Simulatore locale Soglia · dati sintetici",
        scope: "observed_net_income",
      });
      expect(new Date(observation.period_to).getTime()).toBeLessThan(
        new Date(observation.checked_at).getTime(),
      );
      expect(new Date(observation.expires_at).getTime()).toBeGreaterThan(
        new Date(observation.checked_at).getTime(),
      );
      expect(observation.caveat).toContain("Non garantisce redditi futuri");
      expect((await visible()).json()).toEqual(unavailable);
      if (scenario !== "completed")
        expect(
          (
            await request(
              "POST",
              "/income/shares",
              {
                invitation_id: invitationId,
                attestation_id: currentAttestationId,
                consent: true,
              },
              tenant,
            )
          ).statusCode,
        ).toBe(409);
    },
  );
  it("accepts only synthetic fixture categories and rejects financial/document inputs", async () => {
    for (const body of [
      { scenario: "completed", income: 999999 },
      { scenario: "completed", document: "synthetic.pdf" },
      { scenario: "completed", provider: "arbitrary" },
      { scenario: "completed", category: "arbitrary" },
    ])
      expect(
        (await request("POST", "/income/demo", body, tenant)).statusCode,
      ).toBe(400);
    const first = await demo("completed", "self_employment");
    expect(first.summary).toEqual({
      monthly_net_band: { min: 2500, max: 2999, currency: "EUR" },
      source_categories: ["self_employment"],
    });
    const second = await demo("completed", "variable");
    expect(second.summary).toEqual({
      monthly_net_band: { min: 1500, max: 1999, currency: "EUR" },
      source_categories: ["other"],
    });
    await expect(
      db.query(
        "UPDATE income_attestations SET monthly_net_min=1 WHERE check_id=$1",
        [first.id],
      ),
    ).rejects.toThrow("immutable");
    const original = (await request("GET", "/income", undefined, tenant))
      .json()
      .history.find((v: any) => v.id === first.id);
    expect(original.summary).toEqual(first.summary);
    const fixed = demoIncomeResult(
      "completed",
      "employment",
      new Date("2026-10-03T12:00:00Z"),
    );
    expect([fixed.period_from, fixed.period_to]).toEqual([
      "2026-07-01",
      "2026-09-30",
    ]);
  });
});

describe("deliberate invitation-specific income sharing", () => {
  it("requires explicit consent and exposes the minimal summary only to this invitation's owner", async () => {
    const observation = await demo();
    const preview = (await visible(tenant)).json();
    expect(preview).toMatchObject({
      status: "unavailable",
      can_share: true,
      share: null,
      attestation: { id: observation.id },
    });
    for (const consent of [false, undefined])
      expect(
        (
          await request(
            "POST",
            "/income/shares",
            {
              invitation_id: invitationId,
              attestation_id: observation.id,
              consent,
            },
            tenant,
          )
        ).statusCode,
      ).toBe(400);
    expect(
      (
        await request(
          "POST",
          "/income/shares",
          {
            invitation_id: invitationId,
            attestation_id: currentAttestationId,
            consent: true,
          },
          landlord,
        )
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await request(
          "POST",
          "/income/shares",
          {
            invitation_id: invitationId,
            attestation_id: currentAttestationId,
            consent: true,
          },
          outsider,
        )
      ).statusCode,
    ).toBe(404);
    const grant = await share();
    expect(grant).toMatchObject({
      attestation_id: observation.id,
      invitation_id: invitationId,
      recipient_id: landlord.id,
      available: true,
      status: "shared",
      consent_version: "income-summary-v1",
      property_title: property.title,
      recipient_label: "Proprietario dell’immobile",
    });
    const owner = (await visible()).json();
    expect(owner).toMatchObject({
      status: "available",
      can_share: false,
      attestation: observation,
      share: { id: grant.id },
    });
    for (const key of [
      "user_id",
      "provider_reference",
      "dispute_reason",
      "documents",
      "account_transactions",
      "score",
    ])
      expect(owner.attestation).not.toHaveProperty(key);
    expect(JSON.stringify(owner)).not.toContain(tenant.email);
    expect((await visible(outsider)).statusCode).toBe(404);
    expect(
      (
        await request(
          "POST",
          "/income/shares",
          {
            invitation_id: invitationId,
            attestation_id: currentAttestationId,
            consent: true,
          },
          tenant,
        )
      ).statusCode,
    ).toBe(409);
  });
  it("reuses an observation but requires a separate consent for each invitation and property", async () => {
    const observation = await demo();
    await share();
    const secondProperty = await propertyFor(
      landlord,
      "Seconda casa sintetica privata",
    );
    const secondId = await invite(secondProperty);
    expect((await visible(landlord, secondId)).json()).toEqual(unavailable);
    const thirdProperty = await propertyFor(
      outsider,
      "Terza casa sintetica privata",
    );
    const thirdId = await invite(thirdProperty, outsider);
    expect((await visible(outsider, thirdId)).json()).toEqual(unavailable);
    await share(secondId);
    await share(thirdId);
    expect((await visible(outsider, thirdId)).json().attestation.id).toBe(
      observation.id,
    );
    expect((await visible(landlord, thirdId)).statusCode).toBe(404);
    expect(
      (await request("GET", "/income", undefined, tenant)).json().history,
    ).toHaveLength(1);
  });
  it("supports the same explicit summary access after acceptance and removes it when contact closes", async () => {
    await demo();
    await share();
    const accepted = await request(
      "POST",
      `/invitations/${invitationId}/action`,
      { action: "accept", property_revision: 1, profile_revision: 1 },
      tenant,
    );
    expect(accepted.statusCode).toBe(200);
    const owner = (await visible()).json();
    expect(owner.status).toBe("available");
    expect(owner.share.recipient_label).toBe(
      "Proprietario sintetico riservato",
    );
    expect(
      (
        await request(
          "POST",
          `/invitations/${invitationId}/action`,
          { action: "close" },
          tenant,
        )
      ).statusCode,
    ).toBe(200);
    expect((await visible()).json()).toEqual(unavailable);
  });
  it.each(["declined", "withdrawn", "cancelled", "closed"])(
    "refuses creation and access when the invitation is %s",
    async (status) => {
      await demo();
      await share();
      await db.query("UPDATE invitations SET status=$2 WHERE id=$1", [
        invitationId,
        status,
      ]);
      expect((await visible()).json()).toEqual(unavailable);
      expect(
        (
          await request(
            "POST",
            "/income/shares",
            {
              invitation_id: invitationId,
              attestation_id: currentAttestationId,
              consent: true,
            },
            tenant,
          )
        ).statusCode,
      ).toBe(409);
      expect(
        (await request("GET", "/income", undefined, tenant)).json().shares[0],
      ).toMatchObject({ available: false, status: "unavailable" });
    },
  );
  it("enforces observation and pending invitation expiry at request time", async () => {
    const observation = await demo();
    await share();
    await db.query(
      "UPDATE verification_checks SET checked_at=now()-interval '92 days',expires_at=now()-interval '1 second' WHERE id=$1",
      [observation.id],
    );
    expect((await visible()).json()).toEqual(unavailable);
    expect(
      (await request("GET", "/income", undefined, tenant)).json(),
    ).toMatchObject({ status: "expired", shares: [{ available: false }] });
    expect(incomeStatus({ status: "VERIFIED", expires_at: null })).toBe(
      "expired",
    );
    await demo();
    await share();
    await db.query(
      "UPDATE invitations SET expires_at=now()-interval '1 second' WHERE id=$1",
      [invitationId],
    );
    expect((await visible()).json()).toEqual(unavailable);
    expect(
      (
        await request(
          "POST",
          "/income/shares",
          {
            invitation_id: invitationId,
            attestation_id: currentAttestationId,
            consent: true,
          },
          tenant,
        )
      ).statusCode,
    ).toBe(409);
  });
  it("never changes discovery fields or ordering when optional income states and grants change", async () => {
    const secondTenant = await person("tenant", "Altro candidato sintetico");
    await db.query(
      "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,'2027-01-01',12,2,'published',now())",
      [secondTenant.id],
    );
    const secondProperty = await propertyFor(
      landlord,
      "Casa per confronto sintetico",
    );
    const path = `/discover/${secondProperty.id}`;
    const baseline = (await request("GET", path, undefined, landlord)).json();
    await demo();
    await share();
    expect((await request("GET", path, undefined, landlord)).json()).toEqual(
      baseline,
    );
    await demo("insufficient");
    expect((await request("GET", path, undefined, landlord)).json()).toEqual(
      baseline,
    );
    expect(JSON.stringify(baseline)).not.toMatch(
      /income|verification|provider|synthetic|score|badge/,
    );
  });
});

describe("income rights, lifecycle and races", () => {
  it("revokes one grant without revoking the reusable observation", async () => {
    const observation = await demo(),
      grant = await share();
    expect(
      (await request("DELETE", `/income/shares/${grant.id}`, {}, outsider))
        .statusCode,
    ).toBe(404);
    expect(
      (await request("DELETE", `/income/shares/${grant.id}`, {}, tenant))
        .statusCode,
    ).toBe(200);
    expect((await visible()).json()).toEqual(unavailable);
    expect(
      (await request("GET", "/income", undefined, tenant)).json(),
    ).toMatchObject({
      status: "completed",
      attestation: { id: observation.id },
      shares: [{ status: "revoked", available: false }],
    });
    expect((await visible(tenant)).json().can_share).toBe(true);
  });
  it.each(["dispute", "revoke"])(
    "%s invalidates all current grants and cannot be performed by another user",
    async (action) => {
      const observation = await demo();
      await share();
      const body =
        action === "dispute"
          ? { reason: "La fascia sintetica è contestata" }
          : {};
      expect(
        (
          await request(
            "POST",
            `/income/${observation.id}/${action}`,
            body,
            outsider,
          )
        ).statusCode,
      ).toBe(404);
      expect(
        (
          await request(
            "POST",
            `/verification/${observation.id}/dispute`,
            { reason: "Tentativo tramite API generica" },
            tenant,
          )
        ).statusCode,
      ).toBe(400);
      expect(
        (
          await request(
            "POST",
            `/income/${observation.id}/${action}`,
            body,
            tenant,
          )
        ).statusCode,
      ).toBe(200);
      expect((await visible()).json()).toEqual(unavailable);
      expect(
        (await request("GET", "/income", undefined, tenant)).json(),
      ).toMatchObject({
        status: action === "dispute" ? "disputed" : "revoked",
        shares: [{ status: "revoked", available: false }],
      });
      expect(
        (
          await request(
            "POST",
            "/income/shares",
            {
              invitation_id: invitationId,
              attestation_id: currentAttestationId,
              consent: true,
            },
            tenant,
          )
        ).statusCode,
      ).toBe(409);
    },
  );
  it("requires fresh consent after renewal and preserves the previous observation's facts", async () => {
    const first = await demo();
    const grant = await share();
    const second = await demo("completed", "self_employment");
    expect(second.id).not.toBe(first.id);
    expect((await visible()).json()).toEqual(unavailable);
    const own = (await request("GET", "/income", undefined, tenant)).json();
    expect(own.attestation.id).toBe(second.id);
    expect(own.history.find((v: any) => v.id === first.id).summary).toEqual(
      first.summary,
    );
    expect(own.shares.find((v: any) => v.id === grant.id)).toMatchObject({
      status: "revoked",
      available: false,
    });
    await share();
    expect((await visible()).json().attestation.id).toBe(second.id);
  });
  it("binds consent to the exact preview and rejects an observation replaced in another tab", async () => {
    const first = await demo();
    expect((await visible(tenant)).json().attestation.id).toBe(first.id);
    const second = await demo("completed", "self_employment");
    const stale = await request(
      "POST",
      "/income/shares",
      {
        invitation_id: invitationId,
        attestation_id: first.id,
        consent: true,
      },
      tenant,
    );
    expect(stale.statusCode).toBe(409);
    expect((await visible()).json()).toEqual(unavailable);
    expect(
      (
        await request(
          "POST",
          "/income/shares",
          { invitation_id: invitationId, consent: true },
          tenant,
        )
      ).statusCode,
    ).toBe(400);
    await share();
    expect((await visible()).json().attestation.id).toBe(second.id);
  });
  it("serializes renewal with consent without sharing the replacement under old consent", async () => {
    const first = await demo();
    const race = await Promise.all([
      request(
        "POST",
        "/income/shares",
        {
          invitation_id: invitationId,
          attestation_id: first.id,
          consent: true,
        },
        tenant,
      ),
      request(
        "POST",
        "/income/demo",
        { scenario: "completed", category: "variable" },
        tenant,
      ),
    ]);
    expect([201, 409]).toContain(race[0].statusCode);
    expect(race[1].statusCode).toBe(201);
    expect((await visible()).json()).toEqual(unavailable);
    const own = (await request("GET", "/income", undefined, tenant)).json();
    expect(own.attestation.id).toBe(race[1].json().attestation.id);
    expect(own.shares.every((grant: any) => grant.available === false)).toBe(
      true,
    );
  });
  it("blocks access in either direction and hides suspension without revealing an income failure", async () => {
    await demo();
    await share();
    expect(
      (
        await request(
          "POST",
          "/blocks",
          { invitation_id: invitationId },
          landlord,
        )
      ).statusCode,
    ).toBe(200);
    expect((await visible()).json()).toEqual(unavailable);
    expect(
      (await request("DELETE", `/blocks/${tenant.id}`, {}, landlord))
        .statusCode,
    ).toBe(200);
    expect((await visible()).json()).toEqual(unavailable);
    await db.query("UPDATE invitations SET status='pending' WHERE id=$1", [
      invitationId,
    ]);
    await db.query("UPDATE users SET suspended=true WHERE id=$1", [tenant.id]);
    expect((await visible()).json()).toEqual(unavailable);
  });
  it("serializes share/block and share/revoke races and permits no subsequent recipient access", async () => {
    const observation = await demo();
    const race = await Promise.all([
      request(
        "POST",
        "/income/shares",
        {
          invitation_id: invitationId,
          attestation_id: currentAttestationId,
          consent: true,
        },
        tenant,
      ),
      request("POST", "/blocks", { invitation_id: invitationId }, landlord),
    ]);
    expect(race[1].statusCode).toBe(200);
    expect([201, 409]).toContain(race[0].statusCode);
    expect((await visible()).json()).toEqual(unavailable);
    await request("DELETE", `/blocks/${tenant.id}`, {}, landlord);
    await db.query("UPDATE invitations SET status='pending' WHERE id=$1", [
      invitationId,
    ]);
    const grants = (await request("GET", "/income", undefined, tenant)).json()
      .shares;
    for (const grant of grants)
      await request("DELETE", `/income/shares/${grant.id}`, {}, tenant);
    const second = await Promise.all([
      request(
        "POST",
        "/income/shares",
        {
          invitation_id: invitationId,
          attestation_id: currentAttestationId,
          consent: true,
        },
        tenant,
      ),
      request("POST", `/income/${observation.id}/revoke`, {}, tenant),
    ]);
    expect(second[1].statusCode).toBe(200);
    expect([201, 409]).toContain(second[0].statusCode);
    expect((await visible()).json()).toEqual(unavailable);
  });
  it("exports only the holder's income/grants, deletes dependent data, and records names-only events", async () => {
    const observation = await demo();
    const grant = await share();
    const own = (
      await request("GET", "/account/export", undefined, tenant)
    ).json();
    expect(own.income).toEqual([observation]);
    expect(own.income_shares).toEqual([grant]);
    const other = (
      await request("GET", "/account/export", undefined, landlord)
    ).json();
    expect(other.income).toEqual([]);
    expect(other.income_shares).toEqual([]);
    expect(JSON.stringify(other)).not.toContain(observation.id);
    const events = (
      await db.query(
        "SELECT * FROM events WHERE name LIKE 'income_%' ORDER BY id",
      )
    ).rows;
    expect(events.map((v) => v.name)).toEqual([
      "income_demo_created",
      "income_share_created",
    ]);
    expect(Object.keys(events[0]).sort()).toEqual(["created_at", "id", "name"]);
    expect(
      (
        await request(
          "DELETE",
          "/account",
          { password: pwd, confirm: "ELIMINA" },
          tenant,
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await db.query(
          "SELECT check_id FROM income_attestations WHERE check_id=$1",
          [observation.id],
        )
      ).rows,
    ).toEqual([]);
    expect(
      (await db.query("SELECT id FROM income_shares WHERE id=$1", [grant.id]))
        .rows,
    ).toEqual([]);
    expect((await visible()).statusCode).toBe(404);
  });
});

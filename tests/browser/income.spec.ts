import {
  test,
  expect,
  type Page,
  type APIRequestContext,
  type Browser,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { makePool } from "../../server/db";
import { databaseUrl } from "../../server/config";

const origin = "http://127.0.0.1:3000";
const password = "Browser-synthetic-passphrase";
const db = makePool(databaseUrl("soglia_e2e"));

test.afterAll(async () => {
  await db.end();
});

async function call(
  request: APIRequestContext,
  route: string,
  data: any = {},
  method = "POST",
) {
  const response = await request.fetch("/api" + route, {
    method,
    headers: { origin, "Content-Type": "application/json" },
    data: method === "GET" ? undefined : data,
  });
  expect(
    response.ok(),
    `${method} ${route}: ${response.status()}`,
  ).toBeTruthy();
  return response.json();
}

async function account(page: Page, role = "tenant") {
  const email = `income-browser-${randomUUID()}@example.test`;
  await call(page.request, "/auth/register", {
    email,
    password,
    display_name: role === "landlord" ? "Proprietario Demo" : "Persona Demo",
    role,
  });
  const user = (await call(page.request, "/session", {}, "GET")).user;
  await db.query("UPDATE users SET email_verified=true WHERE id=$1", [user.id]);
  return { ...user, email, password };
}

async function profile(request: APIRequestContext) {
  await call(
    request,
    "/profile",
    {
      city: "Bologna",
      budget: 1100,
      move_in: "2027-01-01",
      duration: 12,
      occupants: 2,
    },
    "PUT",
  );
  await call(request, "/profile/status", { status: "published" });
  return (await call(request, "/profile", {}, "GET")).profile;
}

async function property(request: APIRequestContext, title: string) {
  const { id } = await call(request, "/properties", {
    title,
    city: "Bologna",
    area: "Saragozza",
    description: "Un immobile sintetico per provare il consenso sul reddito.",
    rent: 850,
    available_from: "2026-12-01",
    min_months: 6,
    max_months: 36,
    capacity: 2,
    sqm: 68,
    rooms: 3,
    furnished: true,
    authority_attested: true,
  });
  await call(request, `/properties/${id}/status`, { status: "published" });
  return (await call(request, "/properties", {}, "GET")).properties.find(
    (item: any) => item.id === id,
  );
}

async function invitations(page: Page, browser: Browser, count = 1) {
  const tenantContext = await browser.newContext({ baseURL: origin });
  const tenantPage = await tenantContext.newPage();
  const tenant = await account(tenantPage);
  const tenantProfile = await profile(tenantPage.request);
  await account(page, "landlord");
  const items = [];
  for (let index = 0; index < count; index++) {
    const home = await property(
      page.request,
      index === 0 ? "Casa del consenso sintetico" : "Seconda casa sintetica",
    );
    const invite = await call(page.request, "/invitations", {
      property_id: home.id,
      tenant_id: tenant.id,
      property_revision: home.revision,
      profile_revision: tenantProfile.revision,
    });
    items.push({ ...invite, property: home });
  }
  return { tenantContext, tenantPage, tenant, items };
}

function card(page: Page, title: string) {
  return page.getByRole("article").filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
}

async function accessibility(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();
}

async function screenshot(page: Page, name: string) {
  await mkdir("test-results/visual", { recursive: true });
  await page.screenshot({
    path: `test-results/visual/income-${name}.png`,
    fullPage: true,
  });
}

test("a tenant can accept an invitation without income verification or a financial grant", async ({
  page,
  browser,
}) => {
  const fixture = await invitations(page, browser);
  const invite = fixture.items[0];
  await fixture.tenantPage.goto("/invitations");
  await card(fixture.tenantPage, invite.property.title)
    .getByRole("button", { name: "Accetta e apri la conversazione" })
    .click();
  await expect(
    fixture.tenantPage.getByRole("link", { name: "Apri conversazione" }),
  ).toBeVisible();
  const tenantIncome = await call(
    fixture.tenantPage.request,
    "/income",
    {},
    "GET",
  );
  expect(tenantIncome.status).toBe("not_requested");
  expect(tenantIncome.shares).toEqual([]);
  const ownerIncome = await call(
    page.request,
    `/invitations/${invite.id}/income`,
    {},
    "GET",
  );
  expect(ownerIncome.attestation).toBeNull();
  await fixture.tenantContext.close();
});

test("sharing requires a deliberate choice for one invitation and revocation removes the owner's preview", async ({
  page,
  browser,
}) => {
  const fixture = await invitations(page, browser, 2);
  const [first, second] = fixture.items;
  await call(fixture.tenantPage.request, "/income/demo", {
    scenario: "completed",
    category: "employment",
  });
  await fixture.tenantPage.goto("/invitations");
  const firstCard = card(fixture.tenantPage, first.property.title);
  await firstCard
    .getByText("Reddito: scegli cosa condividere", { exact: true })
    .click();
  const consent = firstCard.getByRole("checkbox", {
    name: "Scelgo di condividere questo esempio con questo proprietario.",
  });
  const share = firstCard.getByRole("button", {
    name: "Condividi con questo proprietario",
  });
  await expect(consent).not.toBeChecked();
  await expect(share).toBeDisabled();
  await expect(firstCard).toContainText(
    `Proprietario dell’immobile «${first.property.title}»`,
  );
  await expect(
    firstCard.getByRole("heading", {
      name: "Anteprima per questo proprietario",
    }),
  ).toBeVisible();
  await expect(firstCard).toContainText(
    "Esempio sintetico · nessun reddito reale verificato",
  );
  const preview = await call(
    fixture.tenantPage.request,
    `/invitations/${first.id}/income`,
    {},
    "GET",
  );
  const beforeConsent = await call(
    page.request,
    `/invitations/${first.id}/income`,
    {},
    "GET",
  );
  expect(beforeConsent.status).toBe("unavailable");
  expect(beforeConsent.attestation).toBeNull();
  expect(beforeConsent.share).toBeNull();
  await accessibility(fixture.tenantPage);
  await screenshot(fixture.tenantPage, "consent-desktop");
  await fixture.tenantPage.setViewportSize({ width: 390, height: 844 });
  await accessibility(fixture.tenantPage);
  await screenshot(fixture.tenantPage, "consent-mobile");

  // A keyboard user can opt in; receiving or accepting an invite never opts in.
  await consent.focus();
  await expect(consent).toBeFocused();
  await fixture.tenantPage.keyboard.press("Space");
  await expect(consent).toBeChecked();
  await expect(share).toBeEnabled();
  await fixture.tenantPage.keyboard.press("Tab");
  await expect(share).toBeFocused();
  await fixture.tenantPage.keyboard.press("Enter");
  await expect(
    firstCard.getByRole("button", { name: "Revoca accesso" }),
  ).toBeVisible();
  const granted = await call(
    page.request,
    `/invitations/${first.id}/income`,
    {},
    "GET",
  );
  expect(granted.status).toBe("available");
  expect(granted.attestation).toEqual(preview.attestation);
  expect(granted.attestation.synthetic).toBe(true);
  expect(granted.attestation.summary.monthly_net_band.currency).toBe("EUR");
  for (const privateField of [
    "user_id",
    "provider_reference",
    "dispute_reason",
    "document_url",
    "bank_account",
    "transactions",
    "exact_monthly_income",
  ]) {
    expect(granted.attestation).not.toHaveProperty(privateField);
  }
  expect(JSON.stringify(granted.attestation)).not.toContain(
    fixture.tenant.email,
  );
  const untouched = await call(
    page.request,
    `/invitations/${second.id}/income`,
    {},
    "GET",
  );
  expect(untouched.attestation).toBeNull();
  expect(untouched.share).toBeNull();

  await page.goto("/invitations");
  const ownerCard = card(page, first.property.title);
  await ownerCard
    .getByText("Informazioni sul reddito condivise", { exact: true })
    .click();
  await expect(
    ownerCard.getByRole("heading", {
      name: "Attestazione dimostrativa di reddito",
    }),
  ).toBeVisible();
  await expect(ownerCard).toContainText("€2000–2499");
  await expect(ownerCard).not.toContainText(fixture.tenant.email);
  await expect(ownerCard.getByRole("checkbox")).toHaveCount(0);
  await accessibility(page);
  await screenshot(page, "owner-preview-desktop");

  await firstCard.getByRole("button", { name: "Revoca accesso" }).click();
  await expect(consent).not.toBeChecked();
  await expect(share).toBeDisabled();
  const revoked = await call(
    page.request,
    `/invitations/${first.id}/income`,
    {},
    "GET",
  );
  expect(revoked.status).toBe("unavailable");
  expect(revoked.attestation).toBeNull();
  await page.reload();
  await ownerCard
    .getByText("Informazioni sul reddito condivise", { exact: true })
    .click();
  await expect(
    ownerCard.getByRole("heading", {
      name: "Attestazione dimostrativa di reddito",
    }),
  ).toHaveCount(0);
  await expect(ownerCard).toContainText("Qui vedrai un’attestazione solo se");
  await fixture.tenantContext.close();
});

test("contesting an attestation interrupts a previously consented recipient's access", async ({
  page,
  browser,
}) => {
  const fixture = await invitations(page, browser);
  const invite = fixture.items[0];
  const { attestation } = await call(
    fixture.tenantPage.request,
    "/income/demo",
    {
      scenario: "completed",
      category: "self_employment",
    },
  );
  await call(fixture.tenantPage.request, "/income/shares", {
    invitation_id: invite.id,
    attestation_id: attestation.id,
    consent: true,
  });
  await fixture.tenantPage.goto("/verification");
  await fixture.tenantPage
    .getByRole("button", { name: "Contesta esito" })
    .click();
  await fixture.tenantPage
    .getByLabel("Motivo della contestazione")
    .fill("Il periodo dell’esempio sintetico richiede una revisione.");
  await fixture.tenantPage
    .getByRole("button", { name: "Conferma contestazione" })
    .click();
  await expect(
    fixture.tenantPage.getByText("Contestata", { exact: true }),
  ).toBeVisible();
  const contested = await call(
    fixture.tenantPage.request,
    "/income",
    {},
    "GET",
  );
  expect(contested.status).toBe("disputed");
  const ownerIncome = await call(
    page.request,
    `/invitations/${invite.id}/income`,
    {},
    "GET",
  );
  expect(ownerIncome.status).toBe("unavailable");
  expect(ownerIncome.attestation).toBeNull();
  await screenshot(fixture.tenantPage, "disputed-desktop");
  await fixture.tenantContext.close();
});

test("a replaced attestation cannot inherit consent from an older invitation preview", async ({
  page,
  browser,
}) => {
  const fixture = await invitations(page, browser);
  const invite = fixture.items[0];
  const first = await call(fixture.tenantPage.request, "/income/demo", {
    scenario: "completed",
    category: "employment",
  });
  await fixture.tenantPage.goto("/invitations");
  const invitationCard = card(fixture.tenantPage, invite.property.title);
  await invitationCard
    .getByText("Reddito: scegli cosa condividere", { exact: true })
    .click();
  const consent = invitationCard.getByRole("checkbox", {
    name: "Scelgo di condividere questo esempio con questo proprietario.",
  });
  const share = invitationCard.getByRole("button", {
    name: "Condividi con questo proprietario",
  });
  await expect(invitationCard).toContainText("€2000–2499");
  await consent.check();

  // A separate tab can replace the holder's income while this preview remains open.
  const replacement = await call(fixture.tenantPage.request, "/income/demo", {
    scenario: "completed",
    category: "self_employment",
  });
  expect(replacement.attestation.id).not.toBe(first.attestation.id);
  await expect(invitationCard).toContainText("€2000–2499");
  const [rejected] = await Promise.all([
    fixture.tenantPage.waitForResponse(
      (response) =>
        response.url().endsWith("/api/income/shares") &&
        response.request().method() === "POST",
    ),
    share.click(),
  ]);
  expect(rejected.request().postDataJSON().attestation_id).toBe(
    first.attestation.id,
  );
  expect(rejected.status()).toBe(409);
  await expect(invitationCard.getByRole("alert")).toBeVisible();
  const income = await call(fixture.tenantPage.request, "/income", {}, "GET");
  expect(income.attestation.id).toBe(replacement.attestation.id);
  expect(income.shares).toEqual([]);
  const ownerIncome = await call(
    page.request,
    `/invitations/${invite.id}/income`,
    {},
    "GET",
  );
  expect(ownerIncome.attestation).toBeNull();

  // Refreshing shows the replacement and requires a fresh affirmative choice.
  await fixture.tenantPage.reload();
  await invitationCard
    .getByText("Reddito: scegli cosa condividere", { exact: true })
    .click();
  await expect(invitationCard).toContainText("€2500–2999");
  await expect(consent).not.toBeChecked();
  await expect(share).toBeDisabled();
  await consent.check();
  await share.click();
  await expect(
    invitationCard.getByRole("button", { name: "Revoca accesso" }),
  ).toBeVisible();
  const granted = await call(
    page.request,
    `/invitations/${invite.id}/income`,
    {},
    "GET",
  );
  expect(granted.attestation.id).toBe(replacement.attestation.id);
  await fixture.tenantContext.close();
});

test("synthetic examples explain completed and recoverable states with an accessible mobile flow", async ({
  page,
}) => {
  test.setTimeout(60000);
  await account(page);
  await page.goto("/verification");
  const workspace = page.getByRole("region", {
    name: "Il reddito, solo quando scegli tu.",
  });
  await expect(workspace).toBeVisible();
  await expect(
    workspace.getByText("Non richiesta", { exact: true }),
  ).toBeVisible();
  await expect(
    workspace.getByRole("button", { name: "Verifica reale non disponibile" }),
  ).toBeDisabled();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await workspace
    .getByText("Prova il percorso con dati sintetici", { exact: true })
    .click();
  const category = workspace.getByLabel("Tipo di esempio");
  const scenario = workspace.getByLabel("Esito da esplorare");
  const create = workspace.getByRole("button", {
    name: "Crea esempio sintetico",
  });
  const statusCard = workspace.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "La tua attestazione",
      exact: true,
    }),
  });

  await category.selectOption("self_employment");
  await scenario.selectOption("completed");
  await create.click();
  await expect(
    statusCard.getByText("Esempio completato", { exact: true }),
  ).toBeVisible();
  await expect(statusCard).toContainText("Lavoro autonomo");
  await expect(statusCard).toContainText("€2500–2999");
  await expect(statusCard).toContainText(
    "Esempio sintetico · nessun reddito reale verificato",
  );
  await expect(workspace).toContainText("Nessun accesso autorizzato");
  await accessibility(page);
  await screenshot(page, "workspace-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await accessibility(page);
  await screenshot(page, "workspace-mobile");
  await page.setViewportSize({ width: 320, height: 740 });
  await accessibility(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await category.selectOption("variable");
  await create.click();
  await expect(statusCard).toContainText("€1500–1999");
  const outcomes = [
    {
      scenario: "pending",
      status: "pending",
      label: "In corso",
      recovery: "Il controllo è in corso",
    },
    {
      scenario: "insufficient",
      status: "insufficient",
      label: "Dati insufficienti",
      recovery: "Non è un giudizio sulla tua situazione economica",
    },
    {
      scenario: "error",
      status: "failed",
      label: "Controllo non riuscito",
      recovery: "un problema tecnico non dice nulla sul tuo reddito",
    },
    {
      scenario: "expired",
      status: "expired",
      label: "Scaduta",
      recovery: "Il periodo di validità è terminato",
    },
  ];
  for (const outcome of outcomes) {
    await scenario.selectOption(outcome.scenario);
    await create.click();
    await expect(
      statusCard.getByText(outcome.label, { exact: true }),
    ).toBeVisible();
    await expect(statusCard).toContainText(outcome.recovery);
    const income = await call(page.request, "/income", {}, "GET");
    expect(income.status).toBe(outcome.status);
    expect(income.provider_available).toBe(false);
    expect(income.shares).toEqual([]);
    await accessibility(page);
    await screenshot(page, `${outcome.scenario}-mobile`);
  }
});

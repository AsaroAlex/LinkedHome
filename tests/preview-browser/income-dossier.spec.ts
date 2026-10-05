import {
  test,
  expect,
  type Page,
  type Locator,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { PDFDocument, StandardFonts } from "pdf-lib";
import sharp from "sharp";

type Person = {
  id: string;
  label: string;
  source: string;
  monthly_net_cents: number | null;
  period_from: string;
  period_to: string;
};
type Document = {
  id: string;
  person_id: string;
  kind: string;
  mime: string;
  bytes: number;
  url: string;
};
type Dossier = {
  id: string;
  revision: number;
  tenants: Person[];
  guarantor: Person | null;
  documents: Document[];
  totals: {
    declared_total_cents: number;
    declared_count: number;
    total_count: number;
    complete: boolean;
  };
  synthetic: boolean;
};

const people = [
  { label: "Affittuario sintetico Ada", amount: 1500 },
  { label: "Affittuario sintetico Luca", amount: 1600 },
  { label: "Garante sintetico Marta", amount: 2000 },
];

function completedPeriod() {
  const now = new Date();
  const month = (offset: number) =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1))
      .toISOString()
      .slice(0, 7);
  return { from: month(-3), to: month(-1) };
}

async function api(
  page: Page,
  path: string,
  method = "GET",
  body?: unknown,
  expectedStatus = 200,
) {
  const result = await page.evaluate(
    async ({ path, method, body }) => {
      const response = await fetch("/api" + path, {
        method,
        credentials: "same-origin",
        ...(method === "GET"
          ? {}
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }),
      });
      return { status: response.status, data: await response.json() };
    },
    { path, method, body },
  );
  expect(result.status, `${method} ${path}`).toBe(expectedStatus);
  return result.data;
}

async function role(page: Page, selected: "tenant" | "landlord") {
  await page.goto("/login");
  await page
    .getByRole("button", {
      name:
        selected === "tenant"
          ? "Prova come inquilino"
          : "Prova come proprietario",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const user = (await api(page, "/session")).user;
  expect(user.email).toMatch(/@example\.test$/);
  expect(user.role).toBe(selected);
  expect(await api(page, "/config")).toMatchObject({
    environment: "preview",
    mailTransport: "disabled",
  });
  return user;
}

function responseFor(page: Page, path: string, method: string) {
  return page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api" + path &&
      response.request().method() === method,
  );
}

async function openDetails(details: Locator) {
  await expect(details).toBeVisible();
  if (!(await details.evaluate((element) => element.hasAttribute("open"))))
    await details.locator("summary").click();
}

async function fillPerson(
  person: Locator,
  value: (typeof people)[number],
  period: ReturnType<typeof completedPeriod>,
) {
  await person
    .getByLabel("Nome o etichetta", { exact: true })
    .fill(value.label);
  await person
    .getByLabel("Da dove arrivano le entrate?", { exact: true })
    .selectOption("employment");
  await person
    .getByLabel("Netto al mese (€)", { exact: true })
    .fill(String(value.amount));
  await person.getByLabel("Dal mese", { exact: true }).fill(period.from);
  await person.getByLabel("Al mese", { exact: true }).fill(period.to);
}

async function save(page: Page, status = 200) {
  const workspace = page.locator(".income-dossier-workspace");
  await workspace
    .getByRole("checkbox", {
      name: "Ho il permesso delle persone indicate di inserire e condividere questi dati.",
      exact: true,
    })
    .check();
  const saved = responseFor(page, "/income/dossier", "PUT");
  await workspace
    .getByRole("button", { name: "Salva redditi", exact: true })
    .click();
  const response = await saved;
  expect(response.status()).toBe(status);
  return {
    payload: response.request().postDataJSON(),
    data: await response.json(),
  };
}

async function upload(
  page: Page,
  personIndex: number,
  file: { name: string; mimeType: string; buffer: Buffer },
) {
  const card = page
    .locator(".income-dossier-workspace .income-dossier-person")
    .nth(personIndex);
  await card
    .getByLabel("Tipo di documento", { exact: true })
    .selectOption("payslip");
  await card
    .getByLabel("Scegli un documento", { exact: true })
    .setInputFiles(file);
  const sent = page.waitForResponse(
    (response) =>
      /^\/api\/income\/dossier\/people\/[^/]+\/documents$/.test(
        new URL(response.url()).pathname,
      ) && response.request().method() === "POST",
  );
  await card
    .getByRole("button", { name: "Carica documento", exact: true })
    .click();
  const response = await sent;
  expect(response.status()).toBe(201);
  expect(response.request().headers()["idempotency-key"]).toMatch(
    /^[a-f0-9-]{36}$/i,
  );
  const result = (await response.json()) as {
    document: Document;
    dossier: Dossier;
  };
  await expect(card.locator(".income-dossier-document")).toHaveCount(1);
  return result;
}

async function syntheticPdf(
  amount: number,
  period: ReturnType<typeof completedPeriod>,
) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([400, 240]);
  page.drawText("SYNTHETIC TEST DOCUMENT - NO REAL PERSON", {
    x: 20,
    y: 200,
    size: 11,
    font,
  });
  page.drawText(`Net monthly income: EUR ${amount}`, {
    x: 20,
    y: 160,
    size: 14,
    font,
  });
  page.drawText(`Period: ${period.from} to ${period.to}`, {
    x: 20,
    y: 125,
    size: 12,
    font,
  });
  return Buffer.from(await pdf.save());
}

async function download(page: Page, card: Locator, document: Document) {
  const downloaded = page.waitForEvent("download");
  await card
    .getByRole("link", { name: "Scarica documento 1", exact: true })
    .click();
  const file = await downloaded;
  expect(await file.failure()).toBeNull();
  const path = await file.path();
  expect(path).not.toBeNull();
  const bytes = await readFile(path!);
  expect(bytes.length).toBe(document.bytes);
  // Chromium delivers native attachments through its download event without
  // a page response event. Keep the real click and downloaded bytes above;
  // a second authenticated browser GET verifies the private response headers.
  const fetched = await page.evaluate(async (url) => {
    const response = await fetch(url, { credentials: "same-origin" });
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      bytes: Array.from(new Uint8Array(await response.arrayBuffer())),
    };
  }, document.url);
  expect(fetched.status).toBe(200);
  expect(fetched.headers["content-type"]).toContain(document.mime);
  expect(fetched.headers["cache-control"]).toContain("no-store");
  expect(fetched.headers["content-disposition"]).toMatch(/^attachment;/);
  expect(fetched.headers["x-content-type-options"]).toBe("nosniff");
  expect(fetched.headers["content-security-policy"]).toContain("sandbox");
  expect(Buffer.from(fetched.bytes)).toEqual(bytes);
  if (document.mime === "application/pdf") {
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  } else {
    expect(bytes.subarray(0, 4).toString()).toBe("RIFF");
    expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
    expect((await sharp(bytes).metadata()).format).toBe("webp");
  }
}

async function views(
  page: Page,
  region: Locator,
  prefix: string,
  testInfo: TestInfo,
) {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 900 : 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await region.screenshot({
      path: testInfo.outputPath(`${prefix}-${width}.png`),
    });
    if (width === 320)
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations.map((violation) => ({
          id: violation.id,
          targets: violation.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
  }
}

async function share(
  page: Page,
  invitationId: string,
  revision: number,
  testInfo?: TestInfo,
) {
  await page.goto(`/conversations/${invitationId}`);
  const panel = page.locator(".income-dossier-invitation");
  await openDetails(panel);
  const summaryConsent = panel.getByRole("checkbox", {
    name: "Condivido questo riepilogo con il proprietario di questo invito.",
    exact: true,
  });
  const documentsConsent = panel.getByRole("checkbox", {
    name: "Condivido anche i documenti allegati con questo proprietario.",
    exact: true,
  });
  const button = panel.getByRole("button", {
    name: "Condividi redditi e documenti",
    exact: true,
  });
  await expect(summaryConsent).not.toBeChecked();
  await expect(documentsConsent).not.toBeChecked();
  await expect(button).toBeDisabled();
  if (testInfo) await views(page, panel, "income-consent", testInfo);
  await summaryConsent.check();
  await expect(button).toBeDisabled();
  await documentsConsent.check();
  const shared = responseFor(page, "/income/dossier/shares", "POST");
  await button.click();
  const response = await shared;
  expect(response.status()).toBe(201);
  expect(response.request().postDataJSON()).toMatchObject({
    invitation_id: invitationId,
    revision,
    consent: true,
    documents_consent: true,
  });
  const result = (await response.json()).share;
  await expect(
    panel.getByRole("button", {
      name: "Interrompi la condivisione",
      exact: true,
    }),
  ).toBeVisible();
  return result;
}

test("real income dossier keeps each person and guarantor separate, requires consent and document review, and revokes stale access", async ({
  page: tenantPage,
  browser,
}, testInfo) => {
  test.setTimeout(150000);
  const errors: string[] = [];
  const expectedFailures = new Set<string>();
  const watch = (page: Page) => {
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const location = message.location().url;
      const expected =
        location &&
        [...expectedFailures].some((entry) =>
          entry.endsWith(" " + new URL(location).pathname),
        );
      if (!expected || !message.text().startsWith("Failed to load resource:"))
        errors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        const failure = `${response.status()} ${response.request().method()} ${new URL(response.url()).pathname}`;
        if (!expectedFailures.has(failure)) errors.push(failure);
      }
    });
    page.on("requestfailed", (request) => {
      if (request.failure()?.errorText !== "net::ERR_ABORTED")
        errors.push(request.failure()?.errorText || "Request failed");
    });
  };
  watch(tenantPage);
  const tenant = await role(tenantPage, "tenant");
  const workspaceCookie = (await tenantPage.context().cookies()).find(
    (cookie) => cookie.name === "__Host-linkedhome-preview",
  );
  expect(workspaceCookie).toBeTruthy();
  // A second session belongs to the same newly created synthetic pair. Copy
  // only its workspace cookie; neither session authenticates as a real user.
  const ownerContext = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 1440, height: 1000 },
  });
  await ownerContext.addCookies([workspaceCookie!]);
  const ownerPage = await ownerContext.newPage();
  watch(ownerPage);
  const period = completedPeriod();
  try {
    await role(ownerPage, "landlord");
    expect((await api(tenantPage, "/income/dossier")).dossier).toBeNull();
    await tenantPage.goto("/verification");
    const workspace = tenantPage.locator(".income-dossier-workspace");
    await expect(
      workspace.getByRole("heading", {
        name: "Redditi per l’affitto",
        exact: true,
      }),
    ).toBeVisible();
    const personCards = workspace.locator(".income-dossier-person");
    await expect(personCards).toHaveCount(1);
    await fillPerson(personCards.nth(0), people[0], period);
    await workspace
      .getByRole("button", { name: "Aggiungi affittuario", exact: true })
      .click();
    await fillPerson(personCards.nth(1), people[1], period);
    await workspace
      .getByRole("checkbox", { name: "Aggiungi un garante", exact: true })
      .check();
    await fillPerson(personCards.nth(2), people[2], period);
    const firstSave = await save(tenantPage);
    expect(firstSave.payload.expected_revision).toBeNull();
    let dossier = firstSave.data.dossier as Dossier;
    expect(dossier.synthetic).toBe(true);
    expect(dossier.totals).toEqual({
      declared_total_cents: 310000,
      declared_count: 2,
      total_count: 2,
      complete: true,
    });
    expect(dossier.guarantor?.monthly_net_cents).toBe(200000);
    expect(dossier.documents).toEqual([]);
    const pdf = await syntheticPdf(1500, period);
    const photo = await sharp(
      Buffer.from(
        `<svg width="480" height="240" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="240" fill="#e5efff"/><text x="20" y="50" font-size="20">SYNTHETIC TEST INCOME PROOF</text><text x="20" y="100" font-size="22">Net monthly income: EUR 1600</text><text x="20" y="145" font-size="18">${period.from} to ${period.to}</text></svg>`,
      ),
    )
      .png()
      .toBuffer();
    const fixtures = [
      {
        name: "synthetic-income-1500.pdf",
        mimeType: "application/pdf",
        buffer: pdf,
      },
      {
        name: "synthetic-income-1600.png",
        mimeType: "image/png",
        buffer: photo,
      },
      {
        name: "synthetic-guarantor-2000.pdf",
        mimeType: "application/pdf",
        buffer: await syntheticPdf(2000, period),
      },
    ];
    for (const [index, file] of fixtures.entries()) {
      const before = dossier.revision;
      const result = await upload(tenantPage, index, file);
      expect(result.dossier.revision).toBe(before + 1);
      expect(result.document.person_id).toBe(
        index < 2 ? dossier.tenants[index].id : dossier.guarantor!.id,
      );
      expect(result.document.mime).toBe(
        index === 1 ? "image/webp" : "application/pdf",
      );
      dossier = result.dossier;
      await download(tenantPage, personCards.nth(index), result.document);
    }
    expect(dossier.documents).toHaveLength(3);
    const exported = await api(tenantPage, "/account/export");
    expect(exported.income_dossier).toMatchObject({
      id: dossier.id,
      revision: dossier.revision,
      totals: dossier.totals,
      tenants: dossier.tenants,
      guarantor: dossier.guarantor,
    });
    await tenantPage.reload();
    await expect(personCards).toHaveCount(3);
    for (const [index, person] of people.entries()) {
      await expect(
        personCards.nth(index).getByLabel("Nome o etichetta", { exact: true }),
      ).toHaveValue(person.label);
      await expect(
        personCards.nth(index).getByLabel("Netto al mese (€)", { exact: true }),
      ).toHaveValue(String(person.amount));
    }
    await expect(workspace).not.toContainText(
      "Confermato dal controllo del proprietario",
    );
    await views(tenantPage, workspace, "income-private", testInfo);

    const offered = (await api(ownerPage, "/properties")).properties.find(
      (property: { status: string }) => property.status === "published",
    );
    expect(offered).toBeTruthy();
    await ownerPage.goto(`/discover?property=${offered.id}`);
    const candidate = ownerPage.getByRole("article").filter({
      has: ownerPage.getByRole("heading", {
        name: `Profilo ${tenant.id.slice(0, 6).toUpperCase()}`,
        exact: true,
      }),
    });
    await expect(candidate).toBeVisible();
    for (const person of people)
      await expect(candidate).not.toContainText(person.label);
    const discovery = JSON.stringify(
      await api(ownerPage, `/discover/${offered.id}`),
    );
    expect(discovery).not.toContain(dossier.id);
    for (const person of people) expect(discovery).not.toContain(person.label);
    for (const document of dossier.documents)
      expect(discovery).not.toContain(document.id);
    const invitationSent = responseFor(ownerPage, "/invitations", "POST");
    await candidate
      .getByRole("button", { name: /Invita per questo immobile/ })
      .click();
    const sent = await invitationSent;
    expect(sent.status()).toBe(201);
    const invitationId = (await sent.json()).id as string;
    await tenantPage.goto("/invitations");
    await tenantPage
      .getByRole("button", {
        name: "Accetta e apri la conversazione",
        exact: true,
      })
      .click();
    await expect(
      tenantPage.getByRole("link", { name: /Apri conversazione/ }),
    ).toBeVisible();
    const incomePath = `/invitations/${invitationId}/income-dossier`;
    const unavailable = async () => {
      expect(await api(ownerPage, incomePath)).toMatchObject({
        status: "unavailable",
        dossier: null,
        share: null,
        comparison: null,
        reviews: [],
      });
      for (const document of dossier.documents) {
        expectedFailures.add(`404 GET ${document.url}`);
        await api(ownerPage, document.url.slice(4), "GET", undefined, 404);
      }
    };
    await unavailable();

    // The owner's current asking price can change, while the comparison must
    // continue using the offer accepted by this synthetic pair.
    await ownerPage.goto("/properties");
    await ownerPage
      .getByRole("article")
      .filter({
        has: ownerPage.getByRole("heading", {
          name: offered.title,
          exact: true,
        }),
      })
      .getByRole("button", { name: "Modifica", exact: true })
      .click();
    await ownerPage
      .getByLabel("Costo totale mensile (€), spese obbligatorie incluse", {
        exact: true,
      })
      .fill(String(offered.rent + 100));
    const propertySaved = responseFor(
      ownerPage,
      `/properties/${offered.id}`,
      "PUT",
    );
    await ownerPage
      .getByRole("button", { name: "Salva immobile", exact: true })
      .click();
    expect((await propertySaved).status()).toBe(200);
    expect(
      (await api(ownerPage, `/invitations/${invitationId}`)).invitation.property
        .rent,
    ).toBe(offered.rent);

    const originalRevision = dossier.revision;
    let shared = await share(
      tenantPage,
      invitationId,
      originalRevision,
      testInfo,
    );
    await ownerPage.goto(`/conversations/${invitationId}`);
    const ownerIncome = ownerPage.locator(".income-dossier-invitation");
    await openDetails(ownerIncome);
    let received = await api(ownerPage, incomePath);
    expect(received.dossier.totals).toEqual(dossier.totals);
    expect(received.dossier.guarantor.monthly_net_cents).toBe(200000);
    expect(received.reviews).toEqual([]);
    expect(await api(ownerPage, "/account/export")).not.toHaveProperty(
      "income_dossier",
    );
    expect(received.comparison).toEqual({
      rent: offered.rent,
      declared_total_cents: 310000,
      percent_of_income: Math.round((offered.rent / 3100) * 1000) / 10,
    });
    await expect(ownerIncome.locator(".income-dossier-totals")).toContainText(
      "3.100",
    );
    await expect(ownerIncome).not.toContainText(
      "Confermato dal controllo del proprietario",
    );
    await views(ownerPage, ownerIncome, "income-shared", testInfo);
    const ownerCards = ownerIncome.locator(".income-dossier-person");
    await expect(ownerCards).toHaveCount(3);
    const firstDocument = dossier.documents.find(
      (document) => document.person_id === dossier.tenants[0].id,
    )!;
    const reviewPayload = {
      person_id: firstDocument.person_id,
      document_id: firstDocument.id,
      revision: originalRevision,
      observed_net_cents: 150000,
      period_from: period.from,
      period_to: period.to,
      confirm: true,
    };
    expectedFailures.add(
      `409 POST /api/income/dossier/shares/${shared.id}/reviews`,
    );
    await api(
      ownerPage,
      `/income/dossier/shares/${shared.id}/reviews`,
      "POST",
      reviewPayload,
      409,
    );
    // The landlord types what each document shows: Italian grouping for Ada,
    // a lower reading for Luca and the guarantor's declared amount.
    const readings = [
      { typed: "1.500", cents: 150000 },
      { typed: "1300", cents: 130000 },
      { typed: "2000", cents: 200000 },
    ];
    for (const [index, person] of people.entries()) {
      const card = ownerCards.nth(index);
      const document = dossier.documents.find(
        (document) =>
          document.person_id ===
          (index < 2 ? dossier.tenants[index].id : dossier.guarantor!.id),
      )!;
      const form = card.locator(".income-dossier-review-form");
      await expect(
        form.getByRole("button", { name: "Conferma controllo", exact: true }),
      ).toBeDisabled();
      await download(ownerPage, card, document);
      await expect(
        form.getByLabel("Netto al mese letto nel documento (€)", {
          exact: true,
        }),
      ).toHaveValue("");
      await form
        .getByLabel("Netto al mese letto nel documento (€)", { exact: true })
        .fill(readings[index].typed);
      await form.getByLabel("Dal mese", { exact: true }).fill(period.from);
      await form.getByLabel("Al mese", { exact: true }).fill(period.to);
      await form
        .getByRole("checkbox", {
          name: "Ho letto il documento e confrontato l’importo e il periodo con la dichiarazione.",
          exact: true,
        })
        .check();
      const reviewed = responseFor(
        ownerPage,
        `/income/dossier/shares/${shared.id}/reviews`,
        "POST",
      );
      await form
        .getByRole("button", { name: "Conferma controllo", exact: true })
        .click();
      const response = await reviewed;
      expect(response.status()).toBe(201);
      expect((await response.json()).review).toMatchObject({
        person_id: document.person_id,
        document_id: document.id,
        revision: originalRevision,
        observed_net_cents: readings[index].cents,
        period_from: period.from,
        period_to: period.to,
        method: "landlord_document_review",
      });
      await expect(card).toContainText(
        index === 1
          ? "Il documento mostra meno del dichiarato"
          : "Confermato dal controllo del proprietario",
      );
      expect(person.amount * 100).toBeGreaterThanOrEqual(readings[index].cents);
    }
    received = await api(ownerPage, incomePath);
    expect(received.reviews).toHaveLength(3);
    expect(
      received.verification.people.map(
        (person: { status: string; guarantor: boolean }) => [
          person.status,
          person.guarantor,
        ],
      ),
    ).toEqual([
      ["confirmed", false],
      ["lower", false],
      ["confirmed", true],
    ]);
    expect(received.verification).toMatchObject({
      verified_total_cents: 280000,
      verified_count: 2,
      total_count: 2,
      complete: true,
      rent: offered.rent,
      percent_of_verified_income: Math.round((offered.rent / 2800) * 1000) / 10,
    });
    const verifiedBox = ownerIncome.locator(".income-dossier-verification");
    await expect(verifiedBox).toContainText("2.800,00");
    await expect(verifiedBox).toContainText("del reddito verificato");
    await expect(verifiedBox).toContainText("Garante, separato: 2.000,00");
    expect(received.dossier.totals.declared_total_cents).toBe(310000);
    expect(received.comparison.declared_total_cents).toBe(310000);
    await ownerPage.reload();
    await openDetails(ownerIncome);
    await expect(
      ownerIncome.getByText("Confermato dal controllo del proprietario", {
        exact: true,
      }),
    ).toHaveCount(2);
    await expect(
      ownerIncome.getByText("Il documento mostra meno del dichiarato", {
        exact: true,
      }),
    ).toHaveCount(1);
    await views(ownerPage, ownerIncome, "income-verified", testInfo);

    // A second tenant tab changes the genuine saved dossier while the first
    // tab still holds an old form. Both sharing and review must stop at once.
    await tenantPage.goto("/verification");
    await expect(personCards).toHaveCount(3);
    const changedPage = await tenantPage.context().newPage();
    watch(changedPage);
    await changedPage.goto("/verification");
    await changedPage
      .locator(".income-dossier-workspace .income-dossier-person")
      .nth(0)
      .getByLabel("Netto al mese (€)", { exact: true })
      .fill("1550");
    const changed = await save(changedPage);
    dossier = changed.data.dossier;
    expect(dossier.revision).toBe(originalRevision + 1);
    expect(dossier.totals.declared_total_cents).toBe(315000);
    expect(dossier.documents).toHaveLength(3);
    await changedPage.close();
    await unavailable();
    await api(
      ownerPage,
      `/income/dossier/shares/${shared.id}/reviews`,
      "POST",
      reviewPayload,
      409,
    );
    await ownerPage.reload();
    await openDetails(ownerIncome);
    await expect(
      ownerIncome.getByRole("link", { name: /Scarica documento/ }),
    ).toHaveCount(0);
    await expect(ownerIncome).not.toContainText(people[0].label);
    expectedFailures.add("409 PUT /api/income/dossier");
    await personCards
      .nth(0)
      .getByLabel("Netto al mese (€)", { exact: true })
      .fill("1501");
    await save(tenantPage, 409);
    await expect(workspace.getByRole("alert")).toContainText(
      "Il riepilogo è cambiato",
    );
    expect(
      (await api(tenantPage, "/income/dossier")).dossier.tenants[0]
        .monthly_net_cents,
    ).toBe(155000);
    await tenantPage.reload();
    await expect(
      personCards.nth(0).getByLabel("Netto al mese (€)", { exact: true }),
    ).toHaveValue("1550");
    expectedFailures.add("409 POST /api/income/dossier/shares");
    await api(
      tenantPage,
      "/income/dossier/shares",
      "POST",
      {
        invitation_id: invitationId,
        dossier_id: dossier.id,
        revision: originalRevision,
        consent: true,
        documents_consent: true,
      },
      409,
    );

    shared = await share(tenantPage, invitationId, dossier.revision);
    await ownerPage.reload();
    await openDetails(ownerIncome);
    received = await api(ownerPage, incomePath);
    expect(received.dossier.totals.declared_total_cents).toBe(315000);
    expect(received.reviews).toEqual([]);
    await expect(ownerIncome).not.toContainText(
      "Confermato dal controllo del proprietario",
    );
    await expect(
      ownerIncome
        .locator(".income-dossier-review-form")
        .first()
        .getByRole("button", { name: "Conferma controllo", exact: true }),
    ).toBeDisabled();
    expectedFailures.add(
      `409 POST /api/income/dossier/shares/${shared.id}/reviews`,
    );
    await api(
      ownerPage,
      `/income/dossier/shares/${shared.id}/reviews`,
      "POST",
      {
        ...reviewPayload,
        revision: dossier.revision,
        observed_net_cents: 155000,
      },
      409,
    );
    const revoked = responseFor(
      tenantPage,
      `/income/dossier/shares/${shared.id}`,
      "DELETE",
    );
    await tenantPage
      .locator(".income-dossier-invitation")
      .getByRole("button", { name: "Interrompi la condivisione", exact: true })
      .click();
    expect((await revoked).status()).toBe(200);
    await unavailable();

    await share(tenantPage, invitationId, dossier.revision);
    expect(
      (await api(ownerPage, incomePath)).dossier.totals.declared_total_cents,
    ).toBe(315000);
    await ownerPage.reload();
    const blocked = responseFor(ownerPage, "/blocks", "POST");
    await ownerPage
      .getByRole("button", { name: "Blocca contatto", exact: true })
      .click();
    expect((await blocked).status()).toBe(200);
    await expect(ownerPage.getByRole("status")).toContainText(
      "Contatto bloccato",
    );
    await unavailable();
    expect(
      (await api(tenantPage, "/income/dossier")).dossier.totals
        .declared_total_cents,
    ).toBe(315000);
    expect(errors).toEqual([]);
  } finally {
    await ownerContext.close();
  }
});

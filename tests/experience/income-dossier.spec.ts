import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { PDFDocument } from "pdf-lib";

const test = base.extend<{
  documentAttachment: { url: string; downloads: string[] };
}>({
  documentAttachment: async ({}, use) => {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText("Synthetic proof created for this test.", {
      x: 40,
      y: 700,
    });
    const bytes = Buffer.from(await pdf.save());
    const downloads: string[] = [];
    // Chromium's native download request bypasses Playwright API routes.
    const server = createServer((request, response) => {
      if (
        request.method !== "GET" ||
        request.url !== `/api/income/dossier/documents/${ids.document}`
      ) {
        response.writeHead(404).end();
        return;
      }
      downloads.push(ids.document);
      response.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="synthetic-proof.pdf"',
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
        "Content-Security-Policy": "sandbox",
      });
      response.end(bytes);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Synthetic attachment listener did not start.");
    try {
      await use({
        url: `http://127.0.0.1:${address.port}/api/income/dossier/documents/${ids.document}`,
        downloads,
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      });
    }
  },
});

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
  created_at: string;
  url: string;
};
type Dossier = {
  id: string;
  revision: number;
  tenants: Person[];
  guarantor: Person | null;
  documents: Document[];
  totals: {
    declared_total_cents: number | null;
    declared_count: number;
    total_count: number;
    complete: boolean;
  };
  updated_at: string;
  synthetic: boolean;
};
type Share = {
  id: string;
  dossier_id: string;
  revision: number;
  invitation_id: string;
  recipient_id: string;
  property_title: string;
  recipient_label: string;
  consent_version: string;
  documents_consent: boolean;
  consented_at: string;
  revoked_at: string | null;
  available: boolean;
  status: string;
};

const ids = {
  ada: "11111111-1111-4111-8111-111111111111",
  luca: "22222222-2222-4222-8222-222222222222",
  marta: "33333333-3333-4333-8333-333333333333",
  guarantor: "44444444-4444-4444-8444-444444444444",
  dossier: "bb8991a9-6aa6-42e0-a528-7888770a44bb",
  document: "8308a8e2-e8c0-4dc7-95a4-c002a3c0cba1",
  invitation: "18f6e5e1-3bb7-432a-8271-90a60c4ba713",
  share: "7f4c4064-4e5a-4618-b5d4-3c3c7a98e7ab",
};
const tenant = {
  id: "synthetic-dossier-tenant",
  display_name: "Ada di esempio",
  email: "income-dossier@example.test",
  role: "tenant",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const offeredProperty = {
  id: "synthetic-dossier-property",
  title: "Casa sintetica per due persone",
  city: "Bologna",
  area: "Saragozza",
  rent: 850,
  available_from: "2026-12-01",
  min_months: 6,
  max_months: 36,
  capacity: 3,
  sqm: 60,
  rooms: 2,
  furnished: true,
  description: "Immobile sintetico per verificare la condivisione dei redditi.",
  contract_type: "transitory",
  authority_attested: true,
  published_at: "2026-10-05T12:00:00.000Z",
  status: "published",
  revision: 1,
};

function person(
  id: string,
  label: string,
  amount: number | null,
  source = "employment",
): Person {
  return {
    id,
    label,
    source,
    monthly_net_cents: amount,
    period_from: "2026-07",
    period_to: "2026-09",
  };
}

function dossier(
  tenants = [person(ids.ada, "Ada", 200000), person(ids.luca, "Luca", 100000)],
  guarantor: Person | null = person(
    ids.guarantor,
    "Garante",
    400000,
    "pension",
  ),
): Dossier {
  const declared = tenants.filter((p) => p.monthly_net_cents !== null);
  return {
    id: ids.dossier,
    revision: 3,
    tenants,
    guarantor,
    documents: [],
    totals: {
      declared_total_cents: declared.length
        ? declared.reduce((sum, p) => sum + Number(p.monthly_net_cents), 0)
        : null,
      declared_count: declared.length,
      total_count: tenants.length,
      complete: declared.length === tenants.length,
    },
    updated_at: "2026-10-05T12:00:00.000Z",
    synthetic: true,
  };
}

function proof(personId = ids.ada): Document {
  return {
    id: ids.document,
    person_id: personId,
    kind: "payslip",
    mime: "application/pdf",
    bytes: 100,
    created_at: "2026-10-05T12:00:00.000Z",
    url: `/api/income/dossier/documents/${ids.document}`,
  };
}

async function fixtures(page: Page, initial: Dossier | null, role = "tenant") {
  const state = {
    dossier: structuredClone(initial),
    share: null as Share | null,
    reviews: [] as Record<string, unknown>[],
    saves: [] as Record<string, unknown>[],
    uploads: [] as {
      key: string | undefined;
      revision: string | null;
      kind: string | null;
      hasSyntheticProof: boolean;
    }[],
    shares: [] as Record<string, unknown>[],
    reviewWrites: [] as Record<string, unknown>[],
    downloads: [] as string[],
    reads: [] as string[],
    invitationStatus: "accepted",
    rejectNextSave: false,
    rejectNextShare: false,
    failNextUpload: false,
    delayNextDossierRead: null as Promise<void> | null,
    dossierReadBlocked: false,
    errors: [] as string[],
  };
  page.on("pageerror", (error) => state.errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !/[45]0[039]/.test(message.text()))
      state.errors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED")
      state.errors.push(request.failure()?.errorText || "Request failed");
  });
  await page.clock.setFixedTime(new Date("2026-10-05T12:00:00.000Z"));
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (request.method() === "GET") state.reads.push(path);
    if (
      path === "/api/income/dossier" &&
      request.method() === "GET" &&
      state.delayNextDossierRead
    ) {
      const pendingRead = state.delayNextDossierRead;
      state.delayNextDossierRead = null;
      state.dossierReadBlocked = true;
      await pendingRead;
      state.dossierReadBlocked = false;
    }
    if (path === "/api/income/dossier" && request.method() === "PUT") {
      const body = request.postDataJSON() as Record<string, unknown>;
      state.saves.push(body);
      if (state.rejectNextSave) {
        state.rejectNextSave = false;
        return route.fulfill({
          status: 400,
          json: {
            error: "Controlla gli importi e il periodo indicato.",
            details: [
              {
                field: "tenants.0.period_to",
                message: "Controlla il mese finale.",
              },
            ],
          },
        });
      }
      const next = dossier(
        body.tenants as Person[],
        body.guarantor as Person | null,
      );
      next.revision = (state.dossier?.revision || 0) + 1;
      next.documents = state.dossier?.documents || [];
      state.dossier = next;
      state.share = null;
      return route.fulfill({ json: { dossier: state.dossier } });
    }
    if (
      /^\/api\/income\/dossier\/people\/[^/]+\/documents$/.test(path) &&
      request.method() === "POST"
    ) {
      state.uploads.push({
        key: request.headers()["idempotency-key"],
        revision: url.searchParams.get("revision"),
        kind: url.searchParams.get("kind"),
        hasSyntheticProof: Boolean(
          request
            .postDataBuffer()
            ?.includes(Buffer.from("Synthetic proof created for this test.")),
        ),
      });
      if (state.failNextUpload) {
        state.failNextUpload = false;
        return route.fulfill({
          status: 503,
          json: { error: "Caricamento interrotto. Riprova il documento." },
        });
      }
      const document = proof(path.split("/").at(-2));
      document.kind = url.searchParams.get("kind") || "other";
      state.dossier!.documents = [document];
      state.dossier!.revision++;
      state.share = null;
      return route.fulfill({
        status: 201,
        json: { document, dossier: state.dossier },
      });
    }
    if (path === "/api/income/dossier/shares" && request.method() === "POST") {
      const body = request.postDataJSON() as Record<string, unknown>;
      state.shares.push(body);
      if (state.rejectNextShare) {
        state.rejectNextShare = false;
        state.dossier!.revision++;
        return route.fulfill({
          status: 409,
          json: {
            error:
              "Il riepilogo è cambiato. Controlla la nuova versione prima di condividere.",
          },
        });
      }
      state.share = {
        id: ids.share,
        dossier_id: ids.dossier,
        revision: state.dossier!.revision,
        invitation_id: ids.invitation,
        recipient_id: "synthetic-dossier-owner",
        property_title: offeredProperty.title,
        recipient_label: "Proprietario di esempio",
        consent_version: "income-dossier-v1",
        documents_consent: true,
        consented_at: "2026-10-05T12:00:00.000Z",
        revoked_at: null,
        available: true,
        status: "shared",
      };
      return route.fulfill({ status: 201, json: { share: state.share } });
    }
    if (
      path === `/api/income/dossier/documents/${ids.document}` &&
      request.method() === "GET"
    ) {
      state.downloads.push(ids.document);
      return route.fulfill({
        body: Buffer.from(
          "%PDF-1.4\nSynthetic document created for this test.\n%%EOF\n",
        ),
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="synthetic-proof.pdf"',
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store",
        },
      });
    }
    if (
      path === `/api/income/dossier/shares/${ids.share}/reviews` &&
      request.method() === "POST"
    ) {
      const body = request.postDataJSON() as Record<string, unknown>;
      state.reviewWrites.push(body);
      if (!state.downloads.length)
        return route.fulfill({
          status: 409,
          json: {
            error: "Scarica il documento prima di confermare il controllo.",
          },
        });
      const review = {
        id: "d1fb75bc-d1f6-4fa5-bfcc-07eaa84ed978",
        ...body,
        reviewed_at: "2026-10-05T12:00:00.000Z",
        method: "landlord_document_review",
      };
      state.reviews.push(review);
      return route.fulfill({ status: 201, json: { review } });
    }
    const invitation = {
      id: ids.invitation,
      tenant_id: tenant.id,
      other_name:
        role === "tenant" ? "Proprietario di esempio" : "Ada di esempio",
      status: state.invitationStatus,
      property: offeredProperty,
      expires_at: "2026-10-12T12:00:00.000Z",
    };
    const visible = role === "tenant" || !!state.share;
    const data: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": {
        user:
          role === "tenant"
            ? tenant
            : { ...tenant, id: "synthetic-dossier-owner", role: "landlord" },
      },
      "/api/verification": { email_verified: true, checks: [] },
      "/api/income/dossier": {
        dossier: state.dossier,
        shares: state.share ? [state.share] : [],
      },
      "/api/invitations": { invitations: [invitation] },
      [`/api/invitations/${ids.invitation}`]: { invitation },
      [`/api/conversations/${ids.invitation}`]: {
        status: state.invitationStatus,
        messages: [],
        hasMore: false,
      },
      [`/api/invitations/${ids.invitation}/income-dossier`]: {
        status: state.share ? "available" : "unavailable",
        dossier: visible ? state.dossier : null,
        share: state.share,
        can_share:
          role === "tenant" &&
          state.invitationStatus === "accepted" &&
          !!state.dossier,
        comparison:
          visible &&
          state.dossier?.totals.complete &&
          Number(state.dossier.totals.declared_total_cents) > 0
            ? {
                rent: offeredProperty.rent,
                declared_total_cents: state.dossier.totals.declared_total_cents,
                percent_of_income:
                  (offeredProperty.rent /
                    (Number(state.dossier.totals.declared_total_cents) / 100)) *
                  100,
              }
            : null,
        reviews: state.reviews,
      },
      "/api/income": {
        provider_available: false,
        demo_available: true,
        status: "not_requested",
        attestation: null,
        history: [],
        shares: [],
      },
      [`/api/invitations/${ids.invitation}/income`]: {
        status: "not_requested",
        attestation: null,
        share: null,
        can_share: false,
      },
    };
    return route.fulfill({
      status: request.method() === "GET" && path in data ? 200 : 404,
      json: data[path] ?? { error: "Unexpected mocked API request." },
    });
  });
  return state;
}

async function accessible(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

function editorPerson(page: Page, heading: string) {
  return page.locator(".income-dossier-form .income-dossier-person").filter({
    has: page.getByRole("heading", { name: heading, exact: true }),
  });
}

function permission(page: Page) {
  return page.getByRole("checkbox", {
    name: "Ho il permesso delle persone indicate di inserire e condividere questi dati.",
    exact: true,
  });
}

async function openIncome(page: Page, role = "tenant") {
  await page.goto("/invitations");
  const panel = page.locator(".income-dossier-invitation");
  await panel
    .locator("summary")
    .filter({
      hasText:
        role === "tenant"
          ? "Redditi: scegli cosa condividere"
          : "Redditi condivisi con te",
    })
    .click();
  return panel;
}

test("partial tenant income distinguishes missing amounts from zero and excludes the guarantor when saved", async ({
  page,
}) => {
  test.setTimeout(60000);
  const initial = dossier([
    person(ids.ada, "Ada", 180000),
    person(ids.luca, "Luca", null, "not_specified"),
    person(ids.marta, "Marta", 0, "no_income"),
  ]);
  const state = await fixtures(page, initial);
  await page.goto("/verification");
  const workspace = page.locator(".income-dossier-workspace");
  await expect(
    workspace.getByRole("heading", {
      name: "Redditi per l’affitto",
      exact: true,
    }),
  ).toBeVisible();
  await expect(workspace.locator(".income-dossier-total-value")).toContainText(
    "1.800,00",
  );
  await expect(workspace.locator(".income-dossier-coverage")).toContainText(
    "2 su 3",
  );
  const luca = editorPerson(page, "Affittuario 2");
  const missingAmount = luca.getByLabel("Netto al mese (€)", { exact: true });
  await expect(missingAmount).toHaveValue("");
  await expect(missingAmount).toBeDisabled();
  const zeroAmount = editorPerson(page, "Affittuario 3").getByLabel(
    "Netto al mese (€)",
    { exact: true },
  );
  await expect(zeroAmount).toHaveValue("0");
  await expect(zeroAmount).toBeDisabled();
  await luca
    .getByLabel("Da dove arrivano le entrate?", { exact: true })
    .selectOption("employment");
  await luca.getByLabel("Netto al mese (€)", { exact: true }).fill("800");
  await permission(page).check();
  await luca.getByLabel("Al mese", { exact: true }).fill("2026-06");
  await workspace
    .getByRole("button", { name: "Salva redditi", exact: true })
    .click();
  await expect(workspace.getByRole("alert")).toContainText(
    "Il mese finale deve essere uguale o successivo al primo.",
  );
  expect(state.saves).toEqual([]);
  await expect(missingAmount).toHaveValue("800");
  await luca.getByLabel("Al mese", { exact: true }).fill("2026-09");
  state.rejectNextSave = true;
  await workspace
    .getByRole("button", { name: "Salva redditi", exact: true })
    .click();
  await expect(workspace.getByRole("alert")).toContainText(
    "Controlla gli importi e il periodo indicato.",
  );
  await expect(
    luca.getByLabel("Netto al mese (€)", { exact: true }),
  ).toHaveValue("800");
  await expect(
    editorPerson(page, "Garante").getByLabel("Netto al mese (€)", {
      exact: true,
    }),
  ).toHaveValue("4000");
  expect(state.dossier!.revision).toBe(initial.revision);
  await workspace
    .getByRole("button", { name: "Salva redditi", exact: true })
    .click();
  await expect.poll(() => state.saves).toHaveLength(2);
  expect(state.saves[1]).toMatchObject({
    expected_revision: 3,
    people_permission: true,
  });
  expect(state.saves[1].tenants).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: ids.ada, monthly_net_cents: 180000 }),
      expect.objectContaining({ id: ids.luca, monthly_net_cents: 80000 }),
      expect.objectContaining({
        id: ids.marta,
        monthly_net_cents: 0,
        source: "no_income",
      }),
    ]),
  );
  expect(state.dossier!.totals).toEqual({
    declared_total_cents: 260000,
    declared_count: 3,
    total_count: 3,
    complete: true,
  });
  await expect(workspace.locator(".income-dossier-total-value")).toContainText(
    "2.600,00",
  );
  await luca.getByLabel("Netto al mese (€)", { exact: true }).fill("950");
  let resumeRead: () => void = () => {};
  state.delayNextDossierRead = new Promise<void>((resolve) => {
    resumeRead = resolve;
  });
  await workspace
    .getByRole("button", { name: "Ricarica i redditi salvati", exact: true })
    .click();
  await expect.poll(() => state.dossierReadBlocked).toBe(true);
  await expect(
    workspace.getByRole("button", { name: "Salvataggio…", exact: true }),
  ).toBeDisabled();
  await expect(missingAmount).toBeDisabled();
  expect(state.saves).toHaveLength(2);
  resumeRead();
  await expect(missingAmount).toHaveValue("800");
  await expect(missingAmount).toBeEnabled();
  expect(state.saves).toHaveLength(2);
  await mkdir(".local/income-dossier", { recursive: true });
  for (const width of [1440, 390, 320]) {
    await accessible(page, width);
    await workspace
      .locator(".income-dossier-totals")
      .screenshot({ path: `.local/income-dossier/totals-${width}.png` });
    await editorPerson(page, "Affittuario 1").screenshot({
      path: `.local/income-dossier/person-${width}.png`,
    });
  }
  await page.reload();
  await expect(workspace.locator(".income-dossier-total-value")).toContainText(
    "2.600,00",
  );
  expect(state.errors).toEqual([]);
});

test("a new dossier uses a past UTC period and saves missing and zero amounts separately with permission", async ({
  page,
}) => {
  const state = await fixtures(page, null);
  await page.goto("/verification");
  const first = editorPerson(page, "Affittuario 1");
  await first.getByLabel("Nome o etichetta", { exact: true }).fill("Ada");
  await first
    .getByLabel("Da dove arrivano le entrate?", { exact: true })
    .selectOption("not_specified");
  const from = await first.getByLabel("Dal mese", { exact: true }).inputValue();
  const to = await first.getByLabel("Al mese", { exact: true }).inputValue();
  expect(from).toMatch(/^\d{4}-\d{2}$/);
  expect(to).toMatch(/^\d{4}-\d{2}$/);
  expect(from <= to && to <= "2026-10").toBe(true);
  await page
    .getByRole("button", { name: "Aggiungi affittuario", exact: true })
    .click();
  const second = editorPerson(page, "Affittuario 2");
  await second.getByLabel("Nome o etichetta", { exact: true }).fill("Luca");
  await second
    .getByLabel("Da dove arrivano le entrate?", { exact: true })
    .selectOption("no_income");
  await page
    .getByRole("checkbox", { name: "Aggiungi un garante", exact: true })
    .check();
  const guarantor = editorPerson(page, "Garante");
  await guarantor
    .getByLabel("Da dove arrivano le entrate?", { exact: true })
    .selectOption("pension");
  await guarantor.getByLabel("Netto al mese (€)", { exact: true }).fill("2600");
  await expect(permission(page)).not.toBeChecked();
  expect(state.saves).toEqual([]);
  await permission(page).focus();
  await page.keyboard.press("Space");
  await expect(permission(page)).toBeChecked();
  await page
    .getByRole("button", { name: "Salva redditi", exact: true })
    .click();
  await expect.poll(() => state.saves).toHaveLength(1);
  expect(state.saves[0]).toMatchObject({
    expected_revision: null,
    people_permission: true,
    guarantor: expect.objectContaining({ monthly_net_cents: 260000 }),
  });
  expect(state.saves[0].tenants).toEqual([
    expect.objectContaining({
      label: "Ada",
      source: "not_specified",
      monthly_net_cents: null,
    }),
    expect.objectContaining({
      label: "Luca",
      source: "no_income",
      monthly_net_cents: 0,
    }),
  ]);
  expect(state.dossier!.totals).toEqual({
    declared_total_cents: 0,
    declared_count: 1,
    total_count: 2,
    complete: false,
  });
  expect(state.errors).toEqual([]);
});

test("a failed document upload keeps the selected proof and retries without changing its revision or idempotency key", async ({
  page,
}) => {
  const state = await fixtures(
    page,
    dossier([person(ids.ada, "Ada", 200000)], null),
  );
  await page.goto("/verification");
  const documents = page.locator(".income-dossier-documents").first();
  await documents
    .getByLabel("Tipo di documento", { exact: true })
    .selectOption("payslip");
  await documents
    .getByLabel("Scegli un documento", { exact: true })
    .setInputFiles({
      name: "proof-created-for-test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(
        "%PDF-1.4\nSynthetic proof created for this test.\n%%EOF\n",
      ),
    });
  state.failNextUpload = true;
  await documents
    .getByRole("button", { name: "Carica documento", exact: true })
    .click();
  await expect(documents.getByRole("alert")).toContainText(
    "Caricamento interrotto.",
  );
  await expect(
    documents.getByLabel("Tipo di documento", { exact: true }),
  ).toHaveValue("payslip");
  expect(state.uploads).toHaveLength(1);
  expect(state.uploads[0]).toMatchObject({
    revision: "3",
    kind: "payslip",
    hasSyntheticProof: true,
  });
  await documents
    .getByRole("button", { name: "Riprova caricamento", exact: true })
    .click();
  await expect.poll(() => state.uploads).toHaveLength(2);
  expect(state.uploads[1]).toEqual(state.uploads[0]);
  expect(state.uploads[0].key).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  await expect(
    documents.getByRole("link", { name: "Scarica documento 1", exact: true }),
  ).toBeVisible();
  await expect(documents).not.toContainText(
    "Documento controllato da questo proprietario",
  );
  expect(state.dossier!.documents).toHaveLength(1);
  expect(state.dossier!.revision).toBe(4);
  expect(state.reviewWrites).toEqual([]);
  expect(state.shares).toEqual([]);
  expect(state.saves).toEqual([]);
  expect(state.errors).toEqual([]);
});

test("sharing needs both explicit consents for an accepted invitation and a new revision resets them", async ({
  page,
}) => {
  const initial = dossier();
  initial.documents = [proof()];
  const state = await fixtures(page, initial);
  state.invitationStatus = "pending";
  const pending = await openIncome(page);
  await expect(pending).toContainText(
    "Puoi condividere solo da un invito accettato e disponibile.",
  );
  await expect(
    page.getByRole("button", {
      name: "Condividi redditi e documenti",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(state.shares).toEqual([]);
  state.invitationStatus = "accepted";
  const panel = await openIncome(page);
  const summaryConsent = panel.getByRole("checkbox", {
    name: "Condivido questo riepilogo con il proprietario di questo invito.",
    exact: true,
  });
  const documentConsent = panel.getByRole("checkbox", {
    name: "Condivido anche i documenti allegati con questo proprietario.",
    exact: true,
  });
  const share = panel.getByRole("button", {
    name: "Condividi redditi e documenti",
    exact: true,
  });
  await expect(share).toBeDisabled();
  await summaryConsent.check();
  await expect(share).toBeDisabled();
  await documentConsent.check();
  await expect(share).toBeEnabled();
  expect(state.shares).toEqual([]);
  state.rejectNextShare = true;
  await share.click();
  await expect(panel.getByRole("alert")).toContainText(
    "Il riepilogo è cambiato.",
  );
  await panel
    .getByRole("button", { name: "Ricarica anteprima", exact: true })
    .click();
  await expect(summaryConsent).not.toBeChecked();
  await expect(documentConsent).not.toBeChecked();
  await expect(share).toBeDisabled();
  expect(state.dossier!.revision).toBe(4);
  await summaryConsent.check();
  await documentConsent.check();
  await share.click();
  await expect.poll(() => state.shares).toHaveLength(2);
  expect(state.shares[1]).toEqual({
    invitation_id: ids.invitation,
    dossier_id: ids.dossier,
    revision: 4,
    consent: true,
    documents_consent: true,
  });
  await expect(panel).toContainText("Proprietario di esempio");
  expect(state.share!.revision).toBe(4);
  expect(state.reviews).toEqual([]);
  expect(state.errors).toEqual([]);
});

test("the recipient downloads proof before confirming a manual review and the declared total remains separate", async ({
  page,
  documentAttachment,
}) => {
  const initial = dossier();
  initial.documents = [proof()];
  const state = await fixtures(page, initial, "landlord");
  state.dossier!.documents[0].url = documentAttachment.url;
  state.downloads = documentAttachment.downloads;
  state.share = {
    id: ids.share,
    dossier_id: ids.dossier,
    revision: 3,
    invitation_id: ids.invitation,
    recipient_id: "synthetic-dossier-owner",
    property_title: offeredProperty.title,
    recipient_label: "Proprietario di esempio",
    consent_version: "income-dossier-v1",
    documents_consent: true,
    consented_at: "2026-10-05T12:00:00.000Z",
    revoked_at: null,
    available: true,
    status: "shared",
  };
  const panel = await openIncome(page, "landlord");
  await expect(panel.locator(".income-dossier-total-value")).toContainText(
    "3.000,00",
  );
  await expect(panel.locator(".income-dossier-comparison")).toContainText(
    /28[,.]3/,
  );
  await expect(panel).not.toContainText(
    "Documento controllato da questo proprietario",
  );
  const review = panel.locator(".income-dossier-review-form").first();
  const confirm = review.getByRole("button", {
    name: "Conferma controllo",
    exact: true,
  });
  await expect(confirm).toBeDisabled();
  const download = page.waitForEvent("download");
  await panel
    .getByRole("link", { name: "Scarica documento 1", exact: true })
    .click();
  const completedDownload = await download;
  expect(await completedDownload.failure()).toBeNull();
  expect(completedDownload.suggestedFilename()).toBe("synthetic-proof.pdf");
  await expect.poll(() => state.downloads).toEqual([ids.document]);
  await review
    .getByLabel("Netto letto nel documento (€)", { exact: true })
    .fill("1800");
  await review.getByLabel("Dal mese", { exact: true }).fill("2026-07");
  await review.getByLabel("Al mese", { exact: true }).fill("2026-09");
  await review
    .getByRole("checkbox", {
      name: "Ho letto il documento e confrontato l’importo e il periodo con la dichiarazione.",
      exact: true,
    })
    .check();
  await confirm.click();
  await expect.poll(() => state.reviewWrites).toHaveLength(1);
  expect(state.reviewWrites[0]).toEqual({
    person_id: ids.ada,
    document_id: ids.document,
    revision: 3,
    observed_net_cents: 180000,
    period_from: "2026-07",
    period_to: "2026-09",
    confirm: true,
  });
  await expect(panel).toContainText(
    "Documento controllato da questo proprietario",
  );
  await expect(panel.locator(".income-dossier-total-value")).toContainText(
    "3.000,00",
  );
  expect(state.dossier!.totals.declared_total_cents).toBe(300000);
  await accessible(page, 320);
  expect(state.errors).toEqual([]);
});

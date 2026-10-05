import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

type Photo = { id: string; url: string; width: number; height: number };
type Property = {
  id: string;
  title: string;
  city: string;
  area: string;
  rent: number;
  available_from: string;
  min_months: number;
  max_months: number;
  capacity: number;
  sqm: number;
  rooms: number;
  furnished: boolean;
  description: string;
  contract_type: string;
  authority_attested: boolean;
  status: string;
  revision: number;
  amenities?: string[];
  amenities_details?: string;
  photos?: Photo[];
};

const user = {
  id: "synthetic-amenities-owner",
  display_name: "Proprietario di esempio",
  email: "property-amenities@example.test",
  role: "landlord",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const legacyProperty: Property = {
  id: "synthetic-amenities-property",
  title: "Casa sintetica in Saragozza",
  city: "Bologna",
  area: "Saragozza",
  rent: 850,
  available_from: "2026-12-01",
  min_months: 6,
  max_months: 36,
  capacity: 2,
  sqm: 60,
  rooms: 2,
  furnished: true,
  description: "Una casa sintetica con balcone per provare le dotazioni.",
  contract_type: "unspecified",
  authority_attested: true,
  status: "draft",
  revision: 1,
};

async function fixtures(page: Page, properties: Property[] = []) {
  const image = await sharp({
    create: { width: 480, height: 320, channels: 3, background: "#b6c8de" },
  })
    .png()
    .toBuffer();
  const state = {
    properties: structuredClone(properties),
    writes: [] as { method: string; body: Record<string, unknown> }[],
    uploads: [] as (string | undefined)[],
    rejectNextSave: false,
    failedUploadsRemaining: 0,
    errors: [] as string[],
  };
  page.on("pageerror", (error) => state.errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("400") &&
      !message.text().includes("503")
    )
      state.errors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED")
      state.errors.push(request.failure()?.errorText || "Request failed");
  });
  await page.clock.setFixedTime(new Date("2026-10-05T12:00:00.000Z"));
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/property-photos/") && request.method() === "GET")
      return route.fulfill({ body: image, contentType: "image/png" });
    if (
      (path === "/api/properties" && request.method() === "POST") ||
      (path === `/api/properties/${legacyProperty.id}` &&
        request.method() === "PUT")
    ) {
      const body = request.postDataJSON() as Record<string, unknown>;
      state.writes.push({ method: request.method(), body });
      if (state.rejectNextSave) {
        state.rejectNextSave = false;
        return route.fulfill({
          status: 400,
          json: {
            error: "Controlla le dotazioni dell'immobile.",
            details: [
              {
                field: "amenities_details",
                message: "Controlla le informazioni sulle dotazioni.",
              },
            ],
          },
        });
      }
      state.properties = [
        {
          ...(body as unknown as Property),
          id: legacyProperty.id,
          status: state.properties[0]?.status || "draft",
          revision: (state.properties[0]?.revision || 0) + 1,
          photos: state.properties[0]?.photos || [],
        },
      ];
      return route.fulfill({ json: { id: legacyProperty.id, ok: true } });
    }
    if (
      path === `/api/properties/${legacyProperty.id}/photos` &&
      request.method() === "POST"
    ) {
      state.uploads.push(request.headers()["idempotency-key"]);
      if (state.failedUploadsRemaining > 0) {
        state.failedUploadsRemaining--;
        return route.fulfill({
          status: 503,
          json: { error: "Caricamento interrotto. Riprova la foto." },
        });
      }
      const photo = {
        id: "008492d3-12fc-4406-8f26-e179f8e05a4b",
        url: "/api/property-photos/008492d3-12fc-4406-8f26-e179f8e05a4b",
        width: 480,
        height: 320,
      };
      state.properties[0].photos = [photo];
      return route.fulfill({ status: 201, json: { photo } });
    }
    const data: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user },
      "/api/properties": { properties: state.properties },
      "/api/verification": { email_verified: true, checks: [] },
    };
    return route.fulfill({
      status: request.method() === "GET" && path in data ? 200 : 404,
      json: data[path] ?? { error: "Unexpected mocked API request." },
    });
  });
  return { state, image };
}

function fields(page: Page) {
  const block = page.locator(".property-amenities-fields");
  return {
    block,
    more: page.locator(".property-amenities-more"),
    notes: page.getByRole("textbox", {
      name: "Altre informazioni sulle dotazioni",
      exact: true,
    }),
    description: page.getByRole("textbox", {
      name: "Descrizione",
      exact: true,
    }),
    prefill: page.getByRole("button", {
      name: "Precompila dal testo",
      exact: true,
    }),
    checkbox: (label: string) =>
      block.getByRole("checkbox", { name: label, exact: true }),
  };
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

test("explicit text prefill respects negations and manual choices, then saves reviewed amenities and notes", async ({
  page,
}) => {
  test.setTimeout(60000);
  const { state } = await fixtures(page);
  await page.goto("/properties");
  await page.getByRole("button", { name: /Aggiungi immobile/ }).click();
  const amenities = fields(page);
  await expect(amenities.more).not.toHaveAttribute("open");
  await expect(amenities.notes).toHaveValue("");
  await expect(amenities.notes).toHaveAttribute("maxlength", "600");
  expect(
    await amenities.notes.evaluate(
      (input: HTMLTextAreaElement) => input.required,
    ),
  ).toBe(false);
  await expect(
    amenities.block.locator('input[name="amenities"]:checked'),
  ).toHaveCount(0);
  await amenities.more.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(amenities.more).toHaveAttribute("open");
  await expect(amenities.block.locator('input[name="amenities"]')).toHaveCount(
    27,
  );
  expect(
    await amenities.block
      .locator('input[name="amenities"]')
      .evaluateAll(
        (inputs) =>
          new Set(inputs.map((input) => (input as HTMLInputElement).value))
            .size,
      ),
  ).toBe(27);
  const description = "Balcone, ascensore, senza garage; lavatrice inclusa.";
  const notes = "Fibra ottica disponibile. Non c'è aria condizionata.";
  await page
    .getByRole("textbox", { name: "Titolo", exact: true })
    .fill(legacyProperty.title);
  await page
    .getByLabel("Quartiere o zona", { exact: true })
    .fill(legacyProperty.area);
  await amenities.description.fill(description);
  await amenities.notes.fill(notes);
  await amenities.checkbox("Ripostiglio").focus();
  await page.keyboard.press("Space");
  await expect(amenities.checkbox("Ripostiglio")).toBeChecked();
  for (const label of ["Ascensore", "Balcone", "Lavatrice", "Fibra ottica"])
    await expect(amenities.checkbox(label)).not.toBeChecked();
  await amenities.prefill.focus();
  await page.keyboard.press("Enter");
  for (const label of [
    "Ascensore",
    "Balcone",
    "Lavatrice",
    "Fibra ottica",
    "Ripostiglio",
  ])
    await expect(amenities.checkbox(label)).toBeChecked();
  for (const label of ["Box o garage", "Aria condizionata"])
    await expect(amenities.checkbox(label)).not.toBeChecked();
  await expect(amenities.description).toHaveValue(description);
  await expect(amenities.notes).toHaveValue(notes);
  expect(state.writes).toEqual([]);
  await amenities.checkbox("Ascensore").uncheck();
  await amenities.checkbox("Giardino privato").check();
  await amenities.checkbox("Ingresso senza gradini").check();
  await mkdir(".local/property-amenities", { recursive: true });
  for (const width of [1440, 390, 320]) {
    await accessible(page, width);
    await amenities.block.screenshot({
      path: `.local/property-amenities/amenities-fields-${width}.png`,
    });
  }
  await amenities.more.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(amenities.more).not.toHaveAttribute("open");
  await page.getByLabel("Dichiaro di essere autorizzato").check();
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  await expect.poll(() => state.writes).toHaveLength(1);
  const selected = [
    "balcony",
    "private_garden",
    "fiber_internet",
    "storage_room",
    "washing_machine",
    "step_free_entry",
  ];
  expect(state.writes[0]).toMatchObject({
    method: "POST",
    body: {
      description,
      amenities_details: notes,
      amenities: expect.arrayContaining(selected),
    },
  });
  expect(state.writes[0].body.amenities).toHaveLength(selected.length);
  const card = page.locator(".property-card");
  await expect(card.locator(".property-amenities-summary")).toContainText(
    "Ingresso senza gradini",
  );
  await expect(card.locator(".property-amenities-notes")).toHaveText(notes);
  await page.reload();
  await card.getByRole("button", { name: "Modifica", exact: true }).click();
  await expect(amenities.more).toHaveAttribute("open");
  for (const label of [
    "Balcone",
    "Giardino privato",
    "Fibra ottica",
    "Ripostiglio",
    "Lavatrice",
    "Ingresso senza gradini",
  ])
    await expect(amenities.checkbox(label)).toBeChecked();
  await expect(amenities.checkbox("Ascensore")).not.toBeChecked();
  await expect(amenities.notes).toHaveValue(notes);
  await expect(amenities.description).toHaveValue(description);
  expect(state.errors).toEqual([]);
});

test("legacy defaults and reviewed amenities survive rejected saves and photo retries while new choices change the saved fingerprint", async ({
  page,
}) => {
  const { state, image } = await fixtures(page, [legacyProperty]);
  await page.goto("/properties");
  const card = page.locator(".property-card");
  await expect(card.locator(".property-amenities-summary")).toHaveCount(0);
  await card.getByRole("button", { name: "Modifica", exact: true }).click();
  const amenities = fields(page);
  await expect(
    amenities.block.locator('input[name="amenities"]:checked'),
  ).toHaveCount(0);
  await expect(amenities.notes).toHaveValue("");
  await amenities.checkbox("Balcone").check();
  await amenities.notes.fill("Balcone esposto a sud. Lavatrice inclusa.");
  await page.getByLabel("Aggiungi foto", { exact: true }).setInputFiles({
    name: "casa-sintetica.png",
    mimeType: "image/png",
    buffer: image,
  });
  state.rejectNextSave = true;
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Controlla le dotazioni dell'immobile.",
  );
  await expect(amenities.checkbox("Balcone")).toBeChecked();
  await expect(amenities.notes).toHaveValue(
    "Balcone esposto a sud. Lavatrice inclusa.",
  );
  await expect(page.getByAltText("Foto 1 dell’immobile")).toBeVisible();
  expect(state.uploads).toEqual([]);
  state.failedUploadsRemaining = 2;
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  const retry = page.getByRole("button", {
    name: "Riprova foto e salva",
    exact: true,
  });
  await expect(retry).toBeVisible();
  expect(state.writes).toHaveLength(2);
  expect(state.writes[1].body.amenities).toEqual(["balcony"]);
  await retry.click();
  await expect.poll(() => state.uploads).toHaveLength(2);
  await expect(retry).toBeEnabled();
  expect(state.writes).toHaveLength(2);
  expect(state.uploads[1]).toBe(state.uploads[0]);
  await amenities.checkbox("Posto auto").check();
  await retry.click();
  await expect.poll(() => state.writes).toHaveLength(3);
  expect(state.writes[2]).toMatchObject({
    method: "PUT",
    body: {
      amenities: ["balcony", "parking"],
      amenities_details: "Balcone esposto a sud. Lavatrice inclusa.",
    },
  });
  await expect(card).toBeVisible();
  expect(state.uploads).toHaveLength(3);
  expect(state.uploads[2]).toBe(state.uploads[0]);
  expect(state.properties[0].photos).toHaveLength(1);
  await expect(card.locator(".property-amenities-tags")).toContainText(
    "Posto auto",
  );
  await page.reload();
  await card.getByRole("button", { name: "Modifica", exact: true }).click();
  await expect(amenities.checkbox("Balcone")).toBeChecked();
  await expect(amenities.checkbox("Posto auto")).toBeChecked();
  await expect(amenities.notes).toHaveValue(
    "Balcone esposto a sud. Lavatrice inclusa.",
  );
  expect(state.errors).toEqual([]);
});

test("accepted offers retain their original amenities and notes while legacy offers do not invent equipment", async ({
  page,
}) => {
  const current = {
    ...legacyProperty,
    amenities: ["balcony", "garage"],
    amenities_details: "Dotazioni attuali: il garage è stato aggiunto.",
  };
  const { state } = await fixtures(page, [current]);
  const snapshot = {
    ...legacyProperty,
    amenities: ["elevator", "fiber_internet"],
    amenities_details: "L'ascensore arriva al piano e la fibra è già attiva.",
  };
  const invitations = [
    snapshot,
    { ...legacyProperty, title: "Offerta precedente senza dotazioni" },
  ].map((property, index) => ({
    id: `synthetic-amenities-invite-${index}`,
    tenant_id: "synthetic-amenities-tenant",
    other_name: "Inquilino di esempio",
    status: "accepted",
    property,
    property_changed: index === 0,
  }));
  await page.route("**/api/invitations?*", (route) =>
    route.fulfill({ json: { invitations } }),
  );
  for (const invitation of invitations) {
    await page.route(`**/api/invitations/${invitation.id}`, (route) =>
      route.fulfill({ json: { invitation } }),
    );
    await page.route(`**/api/conversations/${invitation.id}`, (route) =>
      route.fulfill({
        json: { status: "accepted", messages: [], hasMore: false },
      }),
    );
  }
  await page.goto("/properties");
  await expect(
    page.locator(".property-card .property-amenities-summary"),
  ).toContainText("Box o garage");
  await expect(
    page.locator(".property-card .property-amenities-notes"),
  ).toHaveText(current.amenities_details);
  await page.goto("/invitations");
  const snapshotCard = page.locator(".invitation-card").filter({
    has: page.getByRole("heading", {
      name: legacyProperty.title,
      exact: true,
    }),
  });
  const legacyCard = page.locator(".invitation-card").filter({
    has: page.getByRole("heading", {
      name: "Offerta precedente senza dotazioni",
      exact: true,
    }),
  });
  await expect(snapshotCard.locator(".property-amenities-tags")).toContainText(
    "Ascensore",
  );
  await expect(snapshotCard.locator(".property-amenities-tags")).toContainText(
    "Fibra ottica",
  );
  await expect(
    snapshotCard.locator(".property-amenities-summary"),
  ).not.toContainText("Box o garage");
  await expect(snapshotCard.locator(".property-amenities-notes")).toHaveText(
    snapshot.amenities_details,
  );
  await expect(legacyCard.locator(".property-amenities-summary")).toHaveCount(
    0,
  );
  await snapshotCard.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(
    page.locator(".chat-property .property-amenities-tags"),
  ).toContainText("Ascensore");
  await expect(
    page.locator(".chat-property .property-amenities-notes"),
  ).toHaveText(snapshot.amenities_details);
  await expect(
    page.locator(".chat-property .property-amenities-summary"),
  ).not.toContainText("Box o garage");
  await page.goto("/invitations");
  await legacyCard.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(
    page.locator(".chat-property .property-amenities-summary"),
  ).toHaveCount(0);
  await accessible(page, 390);
  expect(state.writes).toEqual([]);
  expect(state.errors).toEqual([]);
});

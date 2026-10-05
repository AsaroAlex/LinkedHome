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
  street?: string;
  street_number?: string;
  address_visibility?: "area" | "exact";
  photos?: Photo[];
};

const user = {
  id: "synthetic-address-owner",
  display_name: "Proprietario di esempio",
  email: "property-address@example.test",
  role: "landlord",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const legacyProperty: Property = {
  id: "synthetic-address-property",
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
  description: "Immobile sintetico per verificare il controllo sull'indirizzo.",
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
            error: "Controlla l'indirizzo dell'immobile.",
            details: [{ field: "street", message: "Controlla via o piazza." }],
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
        id: "4be069c3-1d83-4c44-b0be-2307e734957b",
        url: "/api/property-photos/4be069c3-1d83-4c44-b0be-2307e734957b",
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
  return {
    block: page.locator(".property-address-fields"),
    street: page.getByLabel("Via o piazza", { exact: true }),
    number: page.getByLabel("Numero civico", { exact: true }),
    area: page.getByRole("radio", { name: "Solo quartiere", exact: true }),
    exact: page.getByRole("radio", { name: "Indirizzo completo", exact: true }),
    preview: page.locator(".property-address-preview"),
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

test("a new property saves its complete address only after the owner chooses to show it, and can return to neighbourhood visibility", async ({
  page,
}) => {
  test.setTimeout(60000);
  const { state } = await fixtures(page);
  await page.goto("/properties");
  await page.getByRole("button", { name: /Aggiungi immobile/ }).click();
  const address = fields(page);
  await expect(address.area).toBeChecked();
  await expect(address.street).toHaveValue("");
  await expect(address.number).toHaveValue("");
  expect(
    await address.street.evaluate((input: HTMLInputElement) => input.required),
  ).toBe(false);
  expect(
    await address.number.evaluate((input: HTMLInputElement) => input.required),
  ).toBe(false);
  await page.getByLabel("Titolo", { exact: true }).fill(legacyProperty.title);
  await page.getByLabel(/Quartiere o zona/).fill(legacyProperty.area);
  await page
    .getByLabel("Descrizione", { exact: true })
    .fill(legacyProperty.description);
  await page.getByLabel("Dichiaro di essere autorizzato").check();
  await address.street.fill("Via delle Case di Esempio");
  await address.number.fill("42/A");
  await expect(address.preview).not.toContainText("Via delle Case di Esempio");
  await address.exact.focus();
  await page.keyboard.press("Space");
  await expect(address.exact).toBeChecked();
  await expect(address.preview).toContainText("Via delle Case di Esempio");
  await expect(address.preview).toContainText("42/A");
  expect(
    await address.street.evaluate((input: HTMLInputElement) => input.required),
  ).toBe(true);
  expect(
    await address.number.evaluate((input: HTMLInputElement) => input.required),
  ).toBe(true);
  expect(state.writes).toEqual([]);
  await mkdir(".local/property-address", { recursive: true });
  for (const width of [1440, 390, 320]) {
    await accessible(page, width);
    await address.block.screenshot({
      path: `.local/property-address/address-fields-${width}.png`,
    });
  }
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  await expect.poll(() => state.writes).toHaveLength(1);
  expect(state.writes[0]).toMatchObject({
    method: "POST",
    body: {
      street: "Via delle Case di Esempio",
      street_number: "42/A",
      address_visibility: "exact",
      area: legacyProperty.area,
    },
  });
  const card = page.locator(".property-card");
  await expect(card.locator(".property-address-value")).toContainText(
    "Via delle Case di Esempio",
  );
  await expect(card.locator(".property-address-value")).toContainText("42/A");
  await page.reload();
  await card.getByRole("button", { name: "Modifica", exact: true }).click();
  await expect(address.street).toHaveValue("Via delle Case di Esempio");
  await expect(address.number).toHaveValue("42/A");
  await expect(address.exact).toBeChecked();
  await address.area.focus();
  await page.keyboard.press("Space");
  await expect(address.area).toBeChecked();
  await expect(address.preview).not.toContainText("Via delle Case di Esempio");
  await expect(address.street).toHaveValue("Via delle Case di Esempio");
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  await expect.poll(() => state.writes).toHaveLength(2);
  expect(state.writes[1]).toMatchObject({
    method: "PUT",
    body: {
      street: "Via delle Case di Esempio",
      street_number: "42/A",
      address_visibility: "area",
    },
  });
  await expect(card.locator(".property-address-summary")).toContainText(
    "Mostri solo il quartiere",
  );
  await expect(card.locator(".property-address-value")).toContainText("42/A");
  expect(state.errors).toEqual([]);
});

test("legacy properties stay private by default while address edits survive validation and photo retries without redundant saves", async ({
  page,
}) => {
  const { state, image } = await fixtures(page, [legacyProperty]);
  await page.goto("/properties");
  const card = page.locator(".property-card");
  await card.getByRole("button", { name: "Modifica", exact: true }).click();
  const address = fields(page);
  await expect(address.area).toBeChecked();
  await expect(address.street).toHaveValue("");
  await expect(address.number).toHaveValue("");
  await address.street.fill("Via della Prova");
  await address.exact.check();
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  expect(
    await address.number.evaluate(
      (input: HTMLInputElement) => input.validity.valueMissing,
    ),
  ).toBe(true);
  expect(state.writes).toEqual([]);
  await address.number.fill("17");
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
    "Controlla l'indirizzo dell'immobile.",
  );
  await expect(address.street).toHaveValue("Via della Prova");
  await expect(address.number).toHaveValue("17");
  await expect(address.exact).toBeChecked();
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
  expect(state.uploads).toHaveLength(1);
  await expect(address.preview).toContainText("Via della Prova");
  await expect(address.number).toHaveValue("17");
  await retry.click();
  await expect.poll(() => state.uploads).toHaveLength(2);
  await expect(retry).toBeEnabled();
  expect(state.writes).toHaveLength(2);
  expect(state.uploads[1]).toBe(state.uploads[0]);
  await address.number.fill("19");
  await retry.click();
  await expect.poll(() => state.writes).toHaveLength(3);
  expect(state.writes[2]).toMatchObject({
    method: "PUT",
    body: {
      street: "Via della Prova",
      street_number: "19",
      address_visibility: "exact",
    },
  });
  await expect(card).toBeVisible();
  expect(state.uploads).toHaveLength(3);
  expect(state.uploads[2]).toBe(state.uploads[0]);
  expect(state.uploads[0]).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  await expect(card.locator(".property-address-value")).toContainText("19");
  await expect(
    card.getByAltText(`Copertina di ${legacyProperty.title}`),
  ).toBeVisible();
  await page.reload();
  await card.getByRole("button", { name: "Modifica", exact: true }).click();
  await expect(address.street).toHaveValue("Via della Prova");
  await expect(address.number).toHaveValue("19");
  await expect(address.exact).toBeChecked();
  expect(state.properties[0].photos).toHaveLength(1);
  expect(state.errors).toEqual([]);
});

test("invites and conversations respect area-only visibility even when unexpected raw address fields are present", async ({
  page,
}) => {
  const { state } = await fixtures(page);
  const areaProperty = {
    ...legacyProperty,
    id: "synthetic-area-property",
    street: "Via Nascosta di Esempio",
    street_number: "93",
    address_visibility: "area",
  };
  const exactProperty = {
    ...legacyProperty,
    id: "synthetic-exact-property",
    title: "Casa con indirizzo condiviso",
    street: "Via Visibile di Esempio",
    street_number: "8/B",
    address_visibility: "exact",
  };
  const invitations = [areaProperty, exactProperty].map((property, index) => ({
    id: `synthetic-address-invite-${index}`,
    tenant_id: "synthetic-address-tenant",
    other_name: "Proprietario di esempio",
    status: "accepted",
    property,
    property_changed: false,
  }));
  await page.route("**/api/session", (route) =>
    route.fulfill({
      json: {
        user: { ...user, id: "synthetic-address-tenant", role: "tenant" },
      },
    }),
  );
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
  await page.goto("/invitations");
  const areaCard = page.locator(".invitation-card").filter({
    has: page.getByRole("heading", {
      name: legacyProperty.title,
      exact: true,
    }),
  });
  const exactCard = page.locator(".invitation-card").filter({
    has: page.getByRole("heading", {
      name: exactProperty.title,
      exact: true,
    }),
  });
  await expect(areaCard).toContainText("Saragozza");
  await expect(areaCard).not.toContainText(areaProperty.street);
  await expect(areaCard.locator(".property-address-value")).toHaveCount(0);
  await expect(exactCard.locator(".property-address-value")).toContainText(
    exactProperty.street,
  );
  await expect(exactCard.locator(".property-address-value")).toContainText(
    exactProperty.street_number,
  );
  await areaCard.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(page.locator(".chat-property")).toContainText("Saragozza");
  await expect(page.locator(".chat-property")).not.toContainText(
    areaProperty.street,
  );
  await expect(
    page.locator(".chat-property .property-address-value"),
  ).toHaveCount(0);
  await page.goto("/invitations");
  await exactCard.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(
    page.locator(".chat-property .property-address-value"),
  ).toContainText(exactProperty.street);
  await expect(
    page.locator(".chat-property .property-address-value"),
  ).toContainText(exactProperty.street_number);
  await accessible(page, 320);
  expect(state.writes).toEqual([]);
  expect(state.errors).toEqual([]);
});

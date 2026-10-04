import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

async function browserApi(page: Page, path: string) {
  // Secure preview cookies are sent by Chromium on its trusted loopback
  // origin; use the browser rather than Playwright's HTTP request context.
  const result = await page.evaluate(async (path) => {
    const response = await fetch("/api" + path, {
      credentials: "same-origin",
    });
    return { status: response.status, data: await response.json() };
  }, path);
  expect(result.status).toBe(200);
  return result.data;
}

async function chooseRole(page: Page, role: "tenant" | "landlord") {
  await page.goto("/login");
  await page
    .getByRole("button", {
      name:
        role === "tenant" ? "Prova come inquilino" : "Prova come proprietario",
    })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();
}

function observeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED")
      errors.push(
        `${request.method()} ${request.url()}: ${request.failure()?.errorText}`,
      );
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  return errors;
}

test("property photos persist after reload and can be removed in a mobile form", async ({
  page,
}) => {
  const errors = observeErrors(page);
  const title = "Casa sintetica con foto";
  const syntheticImage = await sharp({
    create: {
      width: 960,
      height: 640,
      channels: 3,
      background: { r: 205, g: 222, b: 205 },
    },
  })
    .png()
    .toBuffer();
  await mkdir(".local/photo-browser", { recursive: true });
  await chooseRole(page, "landlord");
  await page.getByRole("link", { name: "Immobili", exact: true }).click();
  await page.getByRole("button", { name: /Aggiungi immobile/ }).click();
  await expect(
    page.getByRole("heading", { name: "Descrivi il tuo immobile" }),
  ).toBeVisible();
  for (const legend of [
    "Posizione e descrizione",
    "Costi e disponibilità",
    "Spazi e dotazioni",
  ])
    await expect(page.getByRole("group", { name: legend })).toBeVisible();

  await page.getByLabel("Titolo", { exact: true }).fill(title);
  await page.getByLabel("Città", { exact: true }).selectOption("Bologna");
  await page.getByLabel("Quartiere o zona").fill("Saragozza");
  await page
    .getByLabel("Descrizione", { exact: true })
    .fill("Un immobile di esempio con una foto creata soltanto per il test.");
  await page.getByLabel("Costo totale mensile").fill("900");
  await page.getByLabel("Disponibile dal").fill("2027-01-15");
  await page.getByLabel("Permanenza minima (mesi)").fill("6");
  await page.getByLabel("Permanenza massima (mesi)").fill("24");
  await page.getByLabel("Capienza totale").fill("2");
  await page.getByLabel("Superficie").fill("65");
  await page.getByLabel("Numero locali").fill("3");
  await page.getByLabel("Dichiaro di essere autorizzato").check();
  await expect(page.getByLabel("Aggiungi foto")).toHaveAttribute(
    "accept",
    "image/jpeg,image/png,image/webp",
  );
  await page.getByLabel("Aggiungi foto").setInputFiles(
    Array.from({ length: 7 }, (_, index) => ({
      name: `foto-sintetica-${index + 1}.png`,
      mimeType: "image/png",
      buffer: syntheticImage,
    })),
  );
  await expect(page.getByRole("alert")).toContainText("al massimo 6 foto");
  await expect(page.getByAltText("Foto 1 dell’immobile")).toHaveCount(0);
  await expect(page.getByLabel("Titolo", { exact: true })).toHaveValue(title);
  await page.getByLabel("Aggiungi foto").setInputFiles({
    name: "salotto-sintetico.png",
    mimeType: "image/png",
    buffer: syntheticImage,
  });
  await expect(page.getByAltText("Foto 1 dell’immobile")).toBeVisible();
  await page.setViewportSize({ width: 320, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: ".local/photo-browser/property-form-320.png",
    fullPage: true,
  });
  const upload = page.waitForResponse(
    (response) =>
      /\/api\/properties\/[^/]+\/photos$/.test(
        new URL(response.url()).pathname,
      ) && response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  expect((await upload).status()).toBe(201);
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
  await expect(card).toBeVisible();
  const cover = card.getByAltText(`Copertina di ${title}`);
  await expect(cover).toBeVisible();
  await expect
    .poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await noOverflow(page);
  await page.screenshot({
    path: ".local/photo-browser/property-card-320.png",
    fullPage: true,
  });

  const saved = (await browserApi(page, "/properties")).properties.find(
    (property: { title: string }) => property.title === title,
  );
  expect(saved).toBeTruthy();
  expect(saved.photos).toHaveLength(1);
  expect(saved.photos[0]).toMatchObject({ width: 960, height: 640 });
  expect(saved.photos[0].url).toMatch(/^\/api\/property-photos\//);
  const normalized = await page.evaluate(async (url: string) => {
    const response = await fetch(url, { credentials: "same-origin" });
    const bytes = new Uint8Array(await response.arrayBuffer());
    return {
      status: response.status,
      contentType: response.headers.get("content-type"),
      signature: String.fromCharCode(...bytes.slice(0, 4)),
      format: String.fromCharCode(...bytes.slice(8, 12)),
    };
  }, saved.photos[0].url);
  expect(normalized).toEqual({
    status: 200,
    contentType: "image/webp",
    signature: "RIFF",
    format: "WEBP",
  });

  await page.reload();
  await expect(card.getByAltText(`Copertina di ${title}`)).toBeVisible();
  await card.getByRole("button", { name: "Modifica", exact: true }).click();
  await expect(page.getByAltText("Foto 1 dell’immobile")).toBeVisible();
  await page
    .getByRole("button", { name: "Rimuovi foto 1", exact: true })
    .click();
  await expect(page.getByAltText("Foto 1 dell’immobile")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  await expect(card).toBeVisible();
  await expect(card.getByAltText(`Copertina di ${title}`)).toHaveCount(0);
  await page.reload();
  const edited = (await browserApi(page, "/properties")).properties.find(
    (property: { id: string }) => property.id === saved.id,
  );
  expect(edited.photos).toEqual([]);
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("profile form explains inputs and keeps invalid values from being saved", async ({
  page,
}) => {
  const errors = observeErrors(page);
  await chooseRole(page, "tenant");
  await page.getByRole("link", { name: "Il mio profilo", exact: true }).click();
  const original = (await browserApi(page, "/profile")).profile;
  const budget = page.getByLabel("Budget totale mensile");
  await expect(budget).toHaveAttribute("aria-describedby", /\S+/);
  await budget.fill("99");
  await page.getByRole("button", { name: "Salva preferenze" }).click();
  expect(
    await budget.evaluate(
      (input: HTMLInputElement) => input.validity.rangeUnderflow,
    ),
  ).toBeTruthy();
  expect((await browserApi(page, "/profile")).profile.budget).toBe(
    original.budget,
  );
  await expect(
    page.getByText("Modifiche non salvate.", { exact: false }),
  ).toBeVisible();
  await budget.fill("1250");
  const saved = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/profile" &&
      response.request().method() === "PUT",
  );
  await page.getByRole("button", { name: "Salva preferenze" }).click();
  expect((await saved).status()).toBe(200);
  await expect(
    page.getByRole("status").filter({ hasText: "Preferenze salvate." }),
  ).toBeVisible();
  await page.reload();
  await expect(budget).toHaveValue("1250");
  await page.setViewportSize({ width: 320, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: ".local/photo-browser/profile-form-320.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("retrying a photo after its saved response is lost creates no duplicates", async ({
  page,
}) => {
  // This deliberately aborts one request after the server has committed it.
  // The resulting browser network error is expected; uncaught script errors
  // still indicate a broken recovery flow.
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const title = "Casa sintetica con upload da riprovare";
  const syntheticImage = await sharp({
    create: {
      width: 720,
      height: 480,
      channels: 3,
      background: { r: 227, g: 210, b: 188 },
    },
  })
    .png()
    .toBuffer();
  await chooseRole(page, "landlord");
  await page.getByRole("link", { name: "Immobili", exact: true }).click();
  await page.getByRole("button", { name: /Aggiungi immobile/ }).click();
  await page.getByLabel("Titolo", { exact: true }).fill(title);
  await page.getByLabel("Quartiere o zona").fill("Centro");
  await page
    .getByLabel("Descrizione", { exact: true })
    .fill(
      "Immobile sintetico per verificare il recupero di un upload interrotto.",
    );
  await page.getByLabel("Aggiungi foto").setInputFiles({
    name: "stanza-sintetica.png",
    mimeType: "image/png",
    buffer: syntheticImage,
  });
  const uploadKeys: (string | undefined)[] = [];
  let firstUpload = true;
  let resolveCommitted!: (result: {
    status: number;
    photo: { id: string };
  }) => void;
  const committed = new Promise<{
    status: number;
    photo: { id: string };
  }>((resolve) => {
    resolveCommitted = resolve;
  });
  await page.route(/\/api\/properties\/[^/]+\/photos$/, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    uploadKeys.push(route.request().headers()["idempotency-key"]);
    if (!firstUpload) {
      await route.continue();
      return;
    }
    firstUpload = false;
    const response = await route.fetch();
    const body = await response.json();
    await route.abort("failed");
    resolveCommitted({ status: response.status(), photo: body.photo });
  });
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  const first = await committed;
  expect(first.status).toBe(201);
  await expect(
    page.getByRole("button", { name: "Riprova foto e salva", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Titolo", { exact: true })).toHaveValue(title);
  await expect(page.getByAltText("Foto 1 dell’immobile")).toBeVisible();
  const beforeRetry = (await browserApi(page, "/properties")).properties.filter(
    (property: { title: string }) => property.title === title,
  );
  expect(beforeRetry).toHaveLength(1);
  expect(beforeRetry[0].photos).toHaveLength(1);
  expect(beforeRetry[0].photos[0].id).toBe(first.photo.id);

  const retry = page.waitForResponse(
    (response) =>
      /\/api\/properties\/[^/]+\/photos$/.test(
        new URL(response.url()).pathname,
      ) && response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Riprova foto e salva", exact: true })
    .click();
  const retryResponse = await retry;
  expect(retryResponse.ok()).toBeTruthy();
  expect((await retryResponse.json()).photo.id).toBe(first.photo.id);
  expect(uploadKeys).toHaveLength(2);
  expect(uploadKeys[0]).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  expect(uploadKeys[1]).toBe(uploadKeys[0]);
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
  await expect(card.getByAltText(`Copertina di ${title}`)).toBeVisible();
  await page.reload();
  await expect(card.getByAltText(`Copertina di ${title}`)).toBeVisible();
  const afterRetry = (await browserApi(page, "/properties")).properties.filter(
    (property: { title: string }) => property.title === title,
  );
  expect(afterRetry).toHaveLength(1);
  expect(afterRetry[0].id).toBe(beforeRetry[0].id);
  expect(afterRetry[0].photos).toHaveLength(1);
  expect(afterRetry[0].photos[0].id).toBe(first.photo.id);
  expect(pageErrors).toEqual([]);
});

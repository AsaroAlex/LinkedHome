import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

async function browserApi(page: Page, path: string) {
  // Chromium sends Secure cookies to its trustworthy HTTP loopback origin;
  // APIRequestContext does not apply that browser-specific exception.
  const result = await page.evaluate(async (path) => {
    const response = await fetch("/api" + path, {
      credentials: "same-origin",
    });
    return { status: response.status, data: await response.json() };
  }, path);
  expect(result.status).toBe(200);
  return result.data;
}

async function session(page: Page) {
  return (await browserApi(page, "/session")).user;
}

async function chooseRole(page: Page, role: "tenant" | "landlord") {
  const response = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/auth/preview" &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", {
      name:
        role === "tenant" ? "Prova come inquilino" : "Prova come proprietario",
    })
    .click();
  const result = await response;
  expect(result.ok()).toBeTruthy();
  expect(result.request().postDataJSON()).toEqual({ role });
  await expect(page).toHaveURL(/\/dashboard$/);
  const user = await session(page);
  expect(user).toMatchObject({
    role,
    email_verified: true,
    suspended: false,
    staff_role: null,
  });
  expect(user.email).toMatch(/@example\.test$/);
  return user;
}

async function switchRole(page: Page, role: "tenant" | "landlord") {
  await page.getByRole("link", { name: "Cambia ruolo demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Prova LinkedHome" }),
  ).toBeVisible();
  return chooseRole(page, role);
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();
}

test("synthetic preview preserves both roles through invitation and conversation", async ({
  page,
}) => {
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

  await page.goto("/login");
  expect(await browserApi(page, "/config")).toEqual({
    environment: "preview",
    mailTransport: "disabled",
  });
  await expect(
    page.getByRole("heading", { name: "Prova LinkedHome" }),
  ).toBeVisible();
  await expect(page.locator(".environment")).toContainText(/dati di prova/);
  await expect(page.locator(".environment")).toContainText(/email/i);
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await mkdir(".local/preview-browser", { recursive: true });
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow(page);
  await page.screenshot({
    path: ".local/preview-browser/login-320.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const tenant = await chooseRole(page, "tenant");
  await expect(
    page.getByRole("heading", {
      name: `Ciao, ${tenant.display_name}.`,
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: ".local/preview-browser/dashboard-1440.png",
    fullPage: true,
  });
  const cookies = await page.context().cookies();
  const pairCookie = cookies.find(
    (cookie) => cookie.name === "__Host-linkedhome-preview",
  );
  expect(pairCookie).toMatchObject({
    secure: true,
    httpOnly: true,
    path: "/",
    sameSite: "Strict",
  });
  expect(
    cookies.find((cookie) => cookie.name === "__Host-soglia"),
  ).toMatchObject({
    secure: true,
    httpOnly: true,
    path: "/",
    sameSite: "Strict",
  });

  const profile = (await browserApi(page, "/profile")).profile;
  expect(profile.status).toBe("published");
  await page.getByRole("link", { name: "Il mio profilo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Il tuo profilo di ricerca" }),
  ).toBeVisible();
  await expect(page.getByLabel("Budget totale mensile")).toHaveValue(
    String(profile.budget),
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await noOverflow(page);
  }

  const landlord = await switchRole(page, "landlord");
  expect(landlord.id).not.toBe(tenant.id);
  expect(
    (await page.context().cookies()).find(
      (cookie) => cookie.name === pairCookie?.name,
    )?.value,
  ).toBe(pairCookie?.value);
  const property = (await browserApi(page, "/properties")).properties.find(
    (property: { status: string; city: string }) =>
      property.status === "published" && property.city === profile.city,
  );
  expect(property).toBeTruthy();
  await page.getByRole("link", { name: "Immobili", exact: true }).click();
  const propertyCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: property.title, exact: true }),
  });
  await expect(
    propertyCard.getByText("Disponibilità confermata", { exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  await propertyCard.getByRole("link", { name: /Scopri profili/ }).click();
  const tenantCard = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: `Profilo ${tenant.id.slice(0, 6).toUpperCase()}`,
    }),
  });
  await expect(tenantCard).toBeVisible();
  await expect(tenantCard).not.toContainText(tenant.email);
  await expect(tenantCard).not.toContainText(tenant.display_name);
  await noOverflow(page);
  await tenantCard
    .getByRole("button", { name: /Invita per questo immobile/ })
    .click();
  await expect(
    page.getByText("Invito inviato.", { exact: false }),
  ).toBeVisible();

  expect((await switchRole(page, "tenant")).id).toBe(tenant.id);
  await page
    .getByRole("link", { name: "Inviti e messaggi", exact: true })
    .click();
  const invitation = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: property.title, exact: true }),
  });
  await invitation
    .getByRole("button", { name: "Accetta e apri la conversazione" })
    .click();
  await invitation.getByRole("link", { name: /Apri conversazione/ }).click();
  const message = "Un saluto nella preview sintetica.";
  await page.getByLabel("Il tuo messaggio").fill(message);
  await page.getByRole("button", { name: "Invia messaggio" }).click();
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  await noOverflow(page);

  expect((await switchRole(page, "landlord")).id).toBe(landlord.id);
  await page
    .getByRole("link", { name: "Inviti e messaggi", exact: true })
    .click();
  await page.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  await noOverflow(page);
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Account dimostrativo" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Scegli un ruolo demo" }),
  ).toHaveAttribute("href", "/login");
  await expect(
    page.getByRole("button", { name: "Voglio eliminare l’account" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Password attuale")).toHaveCount(0);
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("preview replaces registration and rejects real account signup", async ({
  page,
}) => {
  await page.goto("/register");
  await expect(
    page.getByRole("heading", { name: "Prova LinkedHome" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Prova come inquilino" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Prova come proprietario" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  const registration = await page.request.post("/api/auth/register", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: {
      display_name: "Un account esterno",
      email: "external@example.test",
      password: "External-account-passphrase",
      role: "tenant",
    },
  });
  expect(registration.status()).toBe(403);
  expect((await registration.json()).error).toMatch(/preview/i);
  expect(await session(page)).toBeNull();
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow(page);
});

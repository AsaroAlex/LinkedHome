import { test, expect, type Page } from "@playwright/test";

async function browserApi(page: Page, path: string) {
  const result = await page.evaluate(async (path) => {
    const response = await fetch("/api" + path, { credentials: "same-origin" });
    return { status: response.status, data: await response.json() };
  }, path);
  expect(result.status).toBe(200);
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
    })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("long contract and optional profile details persist and share only the intended fields", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED")
      errors.push(request.failure()?.errorText || "Request failed");
  });
  const about = "Presentazione sintetica del test: cerco una casa a Bologna.";
  const petDetails = "Un gatto sintetico adulto abituato a vivere in casa.";
  await role(page, "tenant");
  const tenant = (await browserApi(page, "/session")).user;
  await page.goto("/profile");
  await page
    .getByLabel("Che contratto cerchi?", { exact: true })
    .selectOption("four_plus_four");
  await expect(
    page.getByLabel("Per quanti mesi cerchi casa?", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Hai animali domestici?", { exact: true })
    .selectOption("cat");
  await page
    .getByLabel("Qualche dettaglio sui tuoi animali", { exact: true })
    .fill(petDetails);
  await page
    .getByLabel("Preferisci una casa arredata?", { exact: true })
    .selectOption("furnished");
  await page.getByLabel("Ascensore", { exact: true }).check();
  await page.getByLabel("Posto auto", { exact: true }).check();
  await page
    .getByLabel("Presentati al proprietario", { exact: true })
    .fill(about);
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Preferenze salvate.");
  const profile = (await browserApi(page, "/profile")).profile;
  expect(profile).toMatchObject({
    duration: null,
    contract_preference: "four_plus_four",
    pets: "cat",
    pets_details: petDetails,
    furnishing_preference: "furnished",
    housing_needs: ["elevator", "parking"],
    about,
  });
  await page.reload();
  await expect(
    page.getByLabel("Per quanti mesi cerchi casa?", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".profile-summary")).not.toContainText("null mesi");
  await expect(page.getByLabel("Ascensore", { exact: true })).toBeChecked();
  await expect(page.getByLabel("Posto auto", { exact: true })).toBeChecked();
  await expect(
    page.getByLabel("Presentati al proprietario", { exact: true }),
  ).toHaveValue(about);
  await page.setViewportSize({ width: 320, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();

  await role(page, "landlord");
  await page.goto("/properties");
  await page.getByRole("button", { name: "Modifica", exact: true }).click();
  await page
    .getByLabel("Tipo di contratto offerto", { exact: true })
    .selectOption("four_plus_four");
  await page.getByLabel("Permanenza minima (mesi)", { exact: true }).fill("24");
  await page
    .getByLabel("Permanenza massima (mesi)", { exact: true })
    .fill("60");
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Modifica", exact: true }),
  ).toBeVisible();
  const property = (await browserApi(page, "/properties")).properties[0];
  await page.goto(`/discover?property=${property.id}`);
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: `Profilo ${tenant.id.slice(0, 6).toUpperCase()}`,
    }),
  });
  await expect(card).toBeVisible();
  await expect(card).toContainText("Animali: Un gatto");
  await expect(card).toContainText("Casa: Arredata");
  await expect(card).toContainText("Ascensore");
  await expect(card).toContainText("Posto auto");
  await expect(card).not.toContainText(about);
  await expect(card).not.toContainText(petDetails);
  const publicProfile = (await browserApi(page, `/discover/${property.id}`))
    .profiles[0];
  expect(publicProfile).not.toHaveProperty("about");
  expect(publicProfile).not.toHaveProperty("pets_details");
  await card
    .getByRole("button", { name: /Invita per questo immobile/ })
    .click();
  await expect(
    page.getByText("Invito inviato.", { exact: false }),
  ).toBeVisible();
  const pending = (await browserApi(page, "/invitations")).invitations[0];
  expect(pending.tenant_details).toBeNull();

  await role(page, "tenant");
  await page.goto("/invitations");
  await page
    .getByRole("button", {
      name: "Accetta e apri la conversazione",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("link", { name: /Apri conversazione/ }),
  ).toBeVisible();
  await role(page, "landlord");
  await page.goto("/invitations");
  await expect(page.getByText(about, { exact: false })).toBeVisible();
  await expect(page.getByText(petDetails, { exact: false })).toBeVisible();
  await page.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(page.locator(".chat-aside")).toContainText(about);
  await expect(page.locator(".chat-aside")).toContainText(petDetails);
  const accepted = (await browserApi(page, `/invitations/${pending.id}`))
    .invitation;
  expect(accepted.tenant_details).toMatchObject({
    pets: "cat",
    about,
    pets_details: petDetails,
    housing_needs: ["elevator", "parking"],
  });
  expect(errors).toEqual([]);
});

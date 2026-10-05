import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function browserApi(page: Page, path: string) {
  // Browser fetch preserves the preview's Secure loopback cookies.
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
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return (await browserApi(page, "/session")).user;
}

function cityCard(page: Page, city: string) {
  return page.getByRole("region", { name: city, exact: true });
}

async function addCity(page: Page, city: string) {
  await page
    .getByLabel("Città da aggiungere", { exact: true })
    .selectOption(city);
  await page
    .getByRole("button", { name: "Aggiungi città", exact: true })
    .click();
  await expect(cityCard(page, city)).toBeVisible();
}

async function zones(page: Page, city: string, zone: string) {
  const card = cityCard(page, city);
  await card.locator("summary").click();
  await card
    .getByRole("radio", { name: "Scegli le zone", exact: true })
    .check();
  await card.getByRole("checkbox", { name: zone, exact: true }).check();
}

async function save(page: Page) {
  const response = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/profile" &&
      response.request().method() === "PUT",
  );
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  expect((await response).status()).toBe(200);
  await expect(page.getByRole("status")).toContainText("Preferenze salvate.");
  return (await browserApi(page, "/profile")).profile;
}

test("secondary cities match real discovery and selected zones restrict it until whole-city search is restored", async ({
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
  const tenant = await role(page, "tenant");
  const initial = (await browserApi(page, "/profile")).profile;
  await page.goto("/profile");
  await addCity(page, "Milano");
  await zones(page, "Milano", "Navigli");
  await page
    .getByRole("button", { name: "Rimuovi Bologna", exact: true })
    .click();
  await addCity(page, "Bologna");
  await zones(page, "Bologna", "Saragozza");
  const locations = [
    { city: "Milano", areas: ["Navigli"] },
    { city: "Bologna", areas: ["Saragozza"] },
  ];
  const saved = await save(page);
  expect(saved).toMatchObject({
    city: "Milano",
    locations,
    budget: initial.budget,
    occupants: initial.occupants,
  });
  await page.reload();
  await expect(page.locator(".profile-summary")).toContainText(
    "Milano: Navigli",
  );
  await expect(page.locator(".profile-summary")).toContainText(
    "Bologna: Saragozza",
  );
  await expect(
    cityCard(page, "Bologna").getByRole("list", {
      name: "Zone scelte a Bologna",
      exact: true,
    }),
  ).toContainText("Saragozza");
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations.map((violation) => violation.id),
  ).toEqual([]);

  await role(page, "landlord");
  const property = (await browserApi(page, "/properties")).properties.find(
    (candidate: { city: string; area: string; status: string }) =>
      candidate.city === "Bologna" &&
      candidate.area === "Saragozza" &&
      candidate.status === "published",
  );
  expect(property).toBeTruthy();
  await page.goto(`/discover?property=${property.id}`);
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: `Profilo ${tenant.id.slice(0, 6).toUpperCase()}`,
      exact: true,
    }),
  });
  await expect(card).toBeVisible();
  await expect(card).toContainText("Milano: Navigli");
  await expect(card).toContainText("Bologna: Saragozza");
  expect(
    (await browserApi(page, `/discover/${property.id}`)).profiles.find(
      (profile: { id: string }) => profile.id === tenant.id,
    ),
  ).toMatchObject({ city: "Milano", locations });

  await role(page, "tenant");
  await page.goto("/profile");
  await cityCard(page, "Bologna").locator("summary").click();
  await cityCard(page, "Bologna")
    .getByRole("checkbox", { name: "San Vitale", exact: true })
    .check();
  await cityCard(page, "Bologna")
    .getByRole("checkbox", { name: "Saragozza", exact: true })
    .uncheck();
  const restricted = await save(page);
  expect(restricted.locations).toEqual([
    locations[0],
    { city: "Bologna", areas: ["San Vitale"] },
  ]);
  await role(page, "landlord");
  await page.goto(`/discover?property=${property.id}`);
  await expect(
    page.getByRole("heading", {
      name: "Nessun nuovo profilo compatibile",
      exact: true,
    }),
  ).toBeVisible();
  await expect(card).toHaveCount(0);
  expect((await browserApi(page, `/discover/${property.id}`)).profiles).toEqual(
    [],
  );

  await role(page, "tenant");
  await page.goto("/profile");
  await cityCard(page, "Bologna").locator("summary").click();
  await cityCard(page, "Bologna")
    .getByRole("radio", { name: "Tutta la città", exact: true })
    .check();
  expect((await save(page)).locations).toEqual([
    locations[0],
    { city: "Bologna", areas: [] },
  ]);
  await role(page, "landlord");
  await page.goto(`/discover?property=${property.id}`);
  await expect(card).toBeVisible();
  await expect(card).toContainText("Bologna · tutta la città");
  expect(errors).toEqual([]);
});

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function browserApi(page: Page, path: string) {
  const result = await page.evaluate(async (path) => {
    const response = await fetch("/api" + path, { credentials: "same-origin" });
    return { status: response.status, data: await response.json() };
  }, path);
  expect(result.status).toBe(200);
  return result.data;
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
  await expect(page.locator(".draft-notice")).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Preferenze salvate." }),
  ).toBeVisible();
  return (await browserApi(page, "/profile")).profile;
}

function advancedOptions(page: Page) {
  return page.locator("details").filter({
    has: page.locator("summary").filter({
      hasText: /^Periodo o data precisa$/,
    }),
  });
}

async function openAdvancedOptions(page: Page) {
  const details = advancedOptions(page);
  if (!(await details.evaluate((element) => element.hasAttribute("open")))) {
    await details.locator("summary").click();
  }
  await expect(details).toHaveAttribute("open", "");
  return details;
}

function shiftedMonth(month: string, offset: number) {
  const date = new Date(`${month}-01T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

function lastDay(month: string) {
  const date = new Date(`${month}-01T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
}

test("move-in shortcuts and optional period or exact date save real preferences without changing legacy dates", async ({
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

  // The preview role chooser creates a fresh isolated synthetic workspace.
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Prova come inquilino", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const initial = (await browserApi(page, "/profile")).profile;
  expect(initial.move_in_precision).toBe("day");
  await page.goto("/profile");

  const details = advancedOptions(page);
  const exactDay = page.getByLabel("Giorno di ingresso", { exact: true });
  await expect(details).not.toHaveAttribute("open", "");
  await expect(exactDay).toBeVisible();
  await expect(exactDay).toHaveValue(initial.move_in);
  // Reading the optional choices must not turn saved preferences into a draft.
  await openAdvancedOptions(page);
  await expect(
    page.getByRole("radio", { name: "Un giorno preciso", exact: true }),
  ).toBeChecked();
  await details.locator("summary").click();
  await expect(page.locator(".draft-notice")).toHaveCount(0);
  await page
    .getByLabel("Budget totale mensile (€), spese obbligatorie incluse", {
      exact: true,
    })
    .fill(String(initial.budget + 50));
  const budgetOnly = await save(page);
  expect(budgetOnly).toMatchObject({
    budget: initial.budget + 50,
    move_in: initial.move_in,
    move_in_precision: "day",
    move_in_end: initial.move_in,
  });
  await page.reload();
  await expect(exactDay).toHaveValue(initial.move_in);
  await expect(details).not.toHaveAttribute("open", "");

  const currentMonth = await page.evaluate(() =>
    new Date().toISOString().slice(0, 7),
  );
  const nextMonth = shiftedMonth(currentMonth, 1);
  await page.getByRole("button", { name: /Il prossimo mese/ }).click();
  const monthInput = page.getByLabel("Mese di ingresso", { exact: true });
  await expect(monthInput).toBeVisible();
  await expect(monthInput).toHaveValue(nextMonth);
  await expect(exactDay).toHaveCount(0);
  await expect(page.locator(".draft-notice")).toBeVisible();
  // A shortcut changes only the form until the user saves it.
  expect((await browserApi(page, "/profile")).profile).toMatchObject({
    move_in: initial.move_in,
    move_in_precision: "day",
  });
  expect(await save(page)).toMatchObject({
    move_in: `${nextMonth}-01`,
    move_in_precision: "month",
    move_in_end: lastDay(nextMonth),
  });
  await page.reload();
  await expect(monthInput).toHaveValue(nextMonth);
  await expect(details).not.toHaveAttribute("open", "");
  await openAdvancedOptions(page);
  await expect(
    page.getByRole("radio", { name: "Un mese", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".draft-notice")).toHaveCount(0);

  const rangeStart = shiftedMonth(currentMonth, 3);
  const rangeEnd = shiftedMonth(currentMonth, 5);
  await page.getByRole("radio", { name: "Un periodo", exact: true }).check();
  const from = page.getByLabel("Dal mese", { exact: true });
  const until = page.getByLabel("Al mese", { exact: true });
  await from.selectOption(rangeStart);
  await until.selectOption(rangeEnd);
  await details.locator("summary").click();
  // The selected fields remain visible when optional settings are closed.
  await expect(from).toBeVisible();
  await expect(until).toBeVisible();
  expect(await save(page)).toMatchObject({
    move_in: `${rangeStart}-01`,
    move_in_precision: "range",
    move_in_end: lastDay(rangeEnd),
  });
  await page.reload();
  await expect(details).not.toHaveAttribute("open", "");
  await expect(from).toHaveValue(rangeStart);
  await expect(until).toHaveValue(rangeEnd);

  // Month, period and exact-day drafts retain their own values while switching.
  const draftedMonth = shiftedMonth(currentMonth, 7);
  const draftedDay = `${shiftedMonth(currentMonth, 4)}-17`;
  await openAdvancedOptions(page);
  await page.getByRole("radio", { name: "Un mese", exact: true }).check();
  await monthInput.selectOption(draftedMonth);
  await page
    .getByRole("radio", { name: "Un giorno preciso", exact: true })
    .check();
  await exactDay.fill(draftedDay);
  await page.getByRole("radio", { name: "Un periodo", exact: true }).check();
  await expect(from).toHaveValue(rangeStart);
  await expect(until).toHaveValue(rangeEnd);
  await page.getByRole("radio", { name: "Un mese", exact: true }).check();
  await expect(monthInput).toHaveValue(draftedMonth);
  await page
    .getByRole("radio", { name: "Un giorno preciso", exact: true })
    .check();
  await expect(exactDay).toHaveValue(draftedDay);
  await details.locator("summary").click();
  await expect(exactDay).toBeVisible();
  expect((await browserApi(page, "/profile")).profile).toMatchObject({
    move_in: `${rangeStart}-01`,
    move_in_precision: "range",
    move_in_end: lastDay(rangeEnd),
  });

  await page.setViewportSize({ width: 320, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
  await openAdvancedOptions(page);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations.map((violation) => violation.id),
  ).toEqual([]);
  await details.locator("summary").click();
  expect(await save(page)).toMatchObject({
    move_in: draftedDay,
    move_in_precision: "day",
    move_in_end: draftedDay,
  });
  await page.reload();
  await expect(exactDay).toHaveValue(draftedDay);
  await expect(details).not.toHaveAttribute("open", "");
  await expect(page.locator(".draft-notice")).toHaveCount(0);
  expect(errors).toEqual([]);
});

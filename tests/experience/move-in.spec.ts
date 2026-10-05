import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

type Preferences = {
  city: string;
  budget: number;
  move_in: string;
  move_in_precision?: "day" | "month" | "range";
  move_in_end?: string | null;
  duration: number;
  occupants: number;
};
type Profile = Preferences & {
  user_id: string;
  status: "draft" | "published" | "paused";
  revision: number;
};

const user = {
  id: "synthetic-move-in-tenant",
  display_name: "Persona di esempio",
  email: "move-in@example.test",
  role: "tenant",
  email_verified: true,
  suspended: false,
  staff_role: null,
};

async function fixtures(page: Page, profile: Profile | null = null) {
  const state = {
    profile,
    saves: [] as Preferences[],
    publications: [] as string[],
    browserErrors: [] as string[],
    failedRequests: [] as string[],
  };
  page.on("pageerror", (error) => state.browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") state.browserErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText;
    if (error !== "net::ERR_ABORTED")
      state.failedRequests.push(`${new URL(request.url()).pathname}: ${error}`);
  });
  await page.clock.setFixedTime(new Date("2026-10-04T12:00:00.000Z"));
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === "/api/profile" && request.method() === "PUT") {
      const payload = request.postDataJSON() as Preferences;
      state.saves.push(payload);
      state.profile = {
        ...payload,
        user_id: user.id,
        status: state.profile?.status ?? "draft",
        revision: (state.profile?.revision ?? 0) + 1,
      };
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile/status" && request.method() === "POST") {
      const { status } = request.postDataJSON() as {
        status: Profile["status"];
      };
      state.publications.push(status);
      if (state.profile)
        state.profile = {
          ...state.profile,
          status,
          revision: state.profile.revision + 1,
        };
      return route.fulfill({ json: { ok: true } });
    }
    const responses: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user },
      "/api/profile": { profile: state.profile },
      "/api/verification": { email_verified: true, checks: [] },
    };
    return route.fulfill({
      status: path in responses ? 200 : 404,
      json: responses[path] ?? { message: "Unexpected mocked API request." },
    });
  });
  return state;
}

async function screenshots(page: Page, name: string) {
  await mkdir(".local/move-in", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: `.local/move-in/${name}-desktop.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: `.local/move-in/${name}-mobile.png`,
    fullPage: true,
  });
}

async function accessibleOnMobile(page: Page) {
  await page.setViewportSize({ width: 320, height: 740 });
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

test("a new profile saves a whole month and a period across years before publication", async ({
  page,
}) => {
  const state = await fixtures(page);
  await page.goto("/profile");
  await expect(
    page.getByRole("radio", { name: "Un mese", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toHaveValue("2026-11");
  await expect(
    page.getByLabel("Giorno di ingresso", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Mese di ingresso", { exact: true })
    .selectOption("2028-02");
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves)
    .toEqual([
      {
        city: "Bologna",
        budget: 1000,
        move_in: "2028-02-01",
        move_in_precision: "month",
        move_in_end: "2028-02-29",
        duration: 12,
        contract_preference: "any",
        pets: "unspecified",
        pets_details: "",
        furnishing_preference: "any",
        housing_needs: [],
        about: "",
        occupants: 1,
      },
    ]);
  const summary = page.locator(".profile-summary");
  await expect(summary).toContainText("Ingresso: febbraio 2028");
  await screenshots(page, "month");
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Un mese", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toHaveValue("2028-02");
  const publish = page.getByRole("button", {
    name: "Pubblica queste preferenze",
    exact: true,
  });
  await expect(publish).toBeEnabled();
  await page.getByRole("radio", { name: "Un periodo", exact: true }).check();
  await page.getByLabel("Dal mese", { exact: true }).selectOption("2028-11");
  await expect(page.getByLabel("Al mese", { exact: true })).toHaveValue(
    "2028-11",
  );
  await page.getByLabel("Al mese", { exact: true }).selectOption("2029-01");
  await expect(publish).toBeDisabled();
  await expect(summary).toContainText("Ingresso: febbraio 2028");
  expect(state.publications).toEqual([]);
  await accessibleOnMobile(page);
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves.at(-1))
    .toEqual({
      city: "Bologna",
      budget: 1000,
      move_in: "2028-11-01",
      move_in_precision: "range",
      move_in_end: "2029-01-31",
      duration: 12,
      contract_preference: "any",
      pets: "unspecified",
      pets_details: "",
      furnishing_preference: "any",
      housing_needs: [],
      about: "",
      occupants: 1,
    });
  await expect(summary).toContainText("Ingresso: novembre 2028 – gennaio 2029");
  await expect(publish).toBeEnabled();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Un periodo", exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Dal mese", { exact: true })).toHaveValue(
    "2028-11",
  );
  await expect(page.getByLabel("Al mese", { exact: true })).toHaveValue(
    "2029-01",
  );
  await expect(summary).toContainText("Ingresso: novembre 2028 – gennaio 2029");
  await screenshots(page, "period");
  await publish.click();
  await expect.poll(() => state.publications).toEqual(["published"]);
  await expect(
    page.getByRole("button", {
      name: "Metti in pausa e annulla inviti",
      exact: true,
    }),
  ).toBeEnabled();
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("legacy exact dates survive switching modes and saving a different budget", async ({
  page,
}) => {
  const state = await fixtures(page, {
    user_id: user.id,
    city: "Bologna",
    budget: 1100,
    move_in: "2026-12-03",
    duration: 12,
    occupants: 2,
    status: "published",
    revision: 4,
  });
  await page.goto("/profile");
  const exact = page.getByRole("radio", {
    name: "Un giorno preciso",
    exact: true,
  });
  await expect(exact).toBeChecked();
  await expect(
    page.getByLabel("Giorno di ingresso", { exact: true }),
  ).toHaveValue("2026-12-03");
  await page.getByRole("radio", { name: "Un mese", exact: true }).check();
  await page
    .getByLabel("Mese di ingresso", { exact: true })
    .selectOption("2028-02");
  await page.getByRole("radio", { name: "Un periodo", exact: true }).check();
  await page.getByLabel("Dal mese", { exact: true }).selectOption("2028-03");
  await page.getByLabel("Al mese", { exact: true }).selectOption("2028-05");
  await page
    .getByRole("button", {
      name: "Metti in pausa e annulla inviti",
      exact: true,
    })
    .click();
  await expect.poll(() => state.publications).toEqual(["paused"]);
  const publish = page.getByRole("button", {
    name: "Pubblica queste preferenze",
    exact: true,
  });
  await expect(publish).toBeDisabled();
  await expect(
    page.getByRole("radio", { name: "Un periodo", exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Dal mese", { exact: true })).toHaveValue(
    "2028-03",
  );
  await expect(page.getByLabel("Al mese", { exact: true })).toHaveValue(
    "2028-05",
  );
  await expect(
    page.getByText("Modifiche non salvate.", { exact: false }),
  ).toBeVisible();
  await exact.check();
  await expect(
    page.getByLabel("Giorno di ingresso", { exact: true }),
  ).toHaveValue("2026-12-03");
  await page
    .getByLabel("Budget totale mensile (€), spese obbligatorie incluse", {
      exact: true,
    })
    .fill("1200");
  await expect(page.locator(".profile-summary")).toContainText(
    "Ingresso: 3 dicembre 2026",
  );
  await expect(publish).toBeDisabled();
  await accessibleOnMobile(page);
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves)
    .toEqual([
      {
        city: "Bologna",
        budget: 1200,
        move_in: "2026-12-03",
        move_in_precision: "day",
        move_in_end: "2026-12-03",
        duration: 12,
        contract_preference: "any",
        pets: "unspecified",
        pets_details: "",
        furnishing_preference: "any",
        housing_needs: [],
        about: "",
        occupants: 2,
      },
    ]);
  await expect(page.locator(".profile-summary")).toContainText(
    "Fino a €1200 al mese",
  );
  await page.reload();
  await expect(exact).toBeChecked();
  await expect(
    page.getByLabel("Giorno di ingresso", { exact: true }),
  ).toHaveValue("2026-12-03");
  await expect(page.locator(".profile-summary")).toContainText(
    "Ingresso: 3 dicembre 2026",
  );
  await expect(publish).toBeEnabled();
  expect(state.publications).toEqual(["paused"]);
  await screenshots(page, "legacy-day");
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

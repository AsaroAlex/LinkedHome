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

async function fixtures(
  page: Page,
  profile: Profile | null = null,
  now = "2026-10-04T12:00:00.000Z",
) {
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
  await page.clock.setFixedTime(new Date(now));
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

function precision(page: Page, name: string) {
  return page.getByRole("radio", { name, exact: true, includeHidden: true });
}

async function choosePrecision(page: Page, name: string) {
  const details = page.locator(".move-in-choice details");
  if (!(await details.evaluate((element) => element.hasAttribute("open"))))
    await details.locator("summary").click();
  await precision(page, name).check();
}

async function screenshots(page: Page, name: string) {
  await mkdir(".local/move-in-simple", { recursive: true });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.locator(".move-in-choice").screenshot({
      path: `.local/move-in-simple/${name}-${width}.png`,
    });
  }
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
  await expect(precision(page, "Un mese")).toBeChecked();
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
        locations: [{ city: "Bologna", areas: [] }],
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
        accessibility_needs: [],
        about: "",
        occupants: 1,
      },
    ]);
  const summary = page.locator(".profile-summary");
  await expect(summary).toContainText("Ingresso: febbraio 2028");
  await screenshots(page, "month");
  await page.reload();
  await expect(precision(page, "Un mese")).toBeChecked();
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toHaveValue("2028-02");
  const publish = page.getByRole("button", {
    name: "Pubblica queste preferenze",
    exact: true,
  });
  await expect(publish).toBeEnabled();
  await choosePrecision(page, "Un periodo");
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
      locations: [{ city: "Bologna", areas: [] }],
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
      accessibility_needs: [],
      about: "",
      occupants: 1,
    });
  await expect(summary).toContainText("Ingresso: novembre 2028 – gennaio 2029");
  await expect(publish).toBeEnabled();
  await page.reload();
  await expect(precision(page, "Un periodo")).toBeChecked();
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
  const exact = precision(page, "Un giorno preciso");
  await expect(exact).toBeChecked();
  await expect(
    page.getByLabel("Giorno di ingresso", { exact: true }),
  ).toHaveValue("2026-12-03");
  await choosePrecision(page, "Un mese");
  await page
    .getByLabel("Mese di ingresso", { exact: true })
    .selectOption("2028-02");
  await choosePrecision(page, "Un periodo");
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
  await expect(precision(page, "Un periodo")).toBeChecked();
  await expect(page.getByLabel("Dal mese", { exact: true })).toHaveValue(
    "2028-03",
  );
  await expect(page.getByLabel("Al mese", { exact: true })).toHaveValue(
    "2028-05",
  );
  await expect(
    page.getByText("Modifiche non salvate.", { exact: false }),
  ).toBeVisible();
  await choosePrecision(page, "Un giorno preciso");
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
        locations: [{ city: "Bologna", areas: [] }],
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
        accessibility_needs: [],
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

test("quick choices and the advanced disclosure are usable with a keyboard without unnecessary unsaved changes", async ({
  page,
}) => {
  const state = await fixtures(page, {
    user_id: user.id,
    city: "Bologna",
    budget: 1100,
    move_in: "2026-11-01",
    move_in_precision: "month",
    move_in_end: "2026-11-30",
    duration: 12,
    occupants: 2,
    status: "draft",
    revision: 4,
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/profile");
  const block = page.getByRole("group", {
    name: "Quando vuoi trasferirti?",
    exact: true,
  });
  const details = block.locator("details");
  const summary = details.locator("summary");
  const current = block.getByRole("button", { name: /^Questo mese/ });
  const next = block.getByRole("button", { name: /^Il prossimo mese/ });
  const publish = page.getByRole("button", {
    name: "Pubblica queste preferenze",
    exact: true,
  });
  await expect(summary).toHaveText("Periodo o data precisa");
  await expect(details).not.toHaveAttribute("open");
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toBeVisible();
  await expect(next).toHaveAttribute("aria-pressed", "true");
  await expect(next).toContainText("novembre 2026");
  await expect(current).toContainText("ottobre 2026");
  await expect(publish).toBeEnabled();

  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open");
  await expect(precision(page, "Un mese")).toBeChecked();
  await page.keyboard.press("Enter");
  await expect(details).not.toHaveAttribute("open");
  await expect(publish).toBeEnabled();
  await expect(page.locator(".draft-notice")).toHaveCount(0);

  await next.focus();
  await page.keyboard.press("Space");
  await expect(publish).toBeEnabled();
  await expect(page.locator(".draft-notice")).toHaveCount(0);
  expect(state.saves).toEqual([]);

  await current.focus();
  await page.keyboard.press("Enter");
  await expect(current).toHaveAttribute("aria-pressed", "true");
  await expect(next).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toHaveValue("2026-10");
  await expect(details).not.toHaveAttribute("open");
  await expect(publish).toBeDisabled();
  await expect(page.locator(".draft-notice")).toBeVisible();
  await accessibleOnMobile(page);
  await screenshots(page, "quick-choice");

  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves.at(-1))
    .toMatchObject({
      move_in: "2026-10-01",
      move_in_precision: "month",
      move_in_end: "2026-10-31",
    });
  await expect(publish).toBeEnabled();
  await expect(page.locator(".draft-notice")).toHaveCount(0);
  await current.click();
  await expect(publish).toBeEnabled();
  await expect(page.locator(".draft-notice")).toHaveCount(0);
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("month, period and exact day retain independent values when quick choices or precision change", async ({
  page,
}) => {
  const state = await fixtures(page);
  await page.goto("/profile");
  const details = page.locator(".move-in-choice details");
  const current = page.getByRole("button", { name: /^Questo mese/ });
  const next = page.getByRole("button", { name: /^Il prossimo mese/ });
  await expect(details).not.toHaveAttribute("open");
  await page
    .getByLabel("Mese di ingresso", { exact: true })
    .selectOption("2027-02");
  await expect(current).toHaveAttribute("aria-pressed", "false");
  await expect(next).toHaveAttribute("aria-pressed", "false");

  await choosePrecision(page, "Un periodo");
  await page.getByLabel("Dal mese", { exact: true }).selectOption("2027-03");
  await page.getByLabel("Al mese", { exact: true }).selectOption("2027-06");
  await choosePrecision(page, "Un giorno preciso");
  const exactDay = page.getByLabel("Giorno di ingresso", { exact: true });
  await expect(exactDay).toHaveValue("");
  await exactDay.fill("2027-08-19");

  await choosePrecision(page, "Un mese");
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toHaveValue("2027-02");
  await choosePrecision(page, "Un periodo");
  await expect(page.getByLabel("Dal mese", { exact: true })).toHaveValue(
    "2027-03",
  );
  await expect(page.getByLabel("Al mese", { exact: true })).toHaveValue(
    "2027-06",
  );
  await expect(current).toHaveAttribute("aria-pressed", "false");
  await expect(next).toHaveAttribute("aria-pressed", "false");

  await current.click();
  await expect(precision(page, "Un mese")).toBeChecked();
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toHaveValue("2026-10");
  await choosePrecision(page, "Un periodo");
  await expect(page.getByLabel("Dal mese", { exact: true })).toHaveValue(
    "2027-03",
  );
  await expect(page.getByLabel("Al mese", { exact: true })).toHaveValue(
    "2027-06",
  );
  await next.click();
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toHaveValue("2026-11");
  await choosePrecision(page, "Un giorno preciso");
  await expect(exactDay).toHaveValue("2027-08-19");
  await expect(current).toBeVisible();
  await expect(next).toBeVisible();
  await details.locator("summary").click();
  await expect(details).not.toHaveAttribute("open");
  await expect(exactDay).toBeVisible();
  await accessibleOnMobile(page);
  await screenshots(page, "independent-day");

  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves.at(-1))
    .toMatchObject({
      move_in: "2027-08-19",
      move_in_precision: "day",
      move_in_end: "2027-08-19",
    });
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("a saved period outside the rolling month choices stays visible and survives another field edit", async ({
  page,
}) => {
  const state = await fixtures(page, {
    user_id: user.id,
    city: "Bologna",
    budget: 1100,
    move_in: "2031-01-01",
    move_in_precision: "range",
    move_in_end: "2031-03-31",
    duration: 12,
    occupants: 2,
    status: "draft",
    revision: 4,
  });
  await page.goto("/profile");
  await expect(page.locator(".move-in-choice details")).not.toHaveAttribute(
    "open",
  );
  const first = page.getByLabel("Dal mese", { exact: true });
  const last = page.getByLabel("Al mese", { exact: true });
  await expect(first).toBeVisible();
  await expect(last).toBeVisible();
  await expect(first).toHaveValue("2031-01");
  await expect(last).toHaveValue("2031-03");
  await expect(first.locator("option[value='2031-01']")).toHaveCount(1);
  await expect(last.locator("option[value='2031-03']")).toHaveCount(1);
  await choosePrecision(page, "Un mese");
  await expect(
    page.getByLabel("Mese di ingresso", { exact: true }),
  ).toHaveValue("2031-01");
  await choosePrecision(page, "Un periodo");
  await expect(first).toHaveValue("2031-01");
  await expect(last).toHaveValue("2031-03");
  await page
    .getByLabel("Budget totale mensile (€), spese obbligatorie incluse", {
      exact: true,
    })
    .fill("1300");
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves.at(-1))
    .toMatchObject({
      budget: 1300,
      move_in: "2031-01-01",
      move_in_precision: "range",
      move_in_end: "2031-03-31",
    });
  await page.reload();
  await expect(first).toHaveValue("2031-01");
  await expect(last).toHaveValue("2031-03");
  await expect(page.locator(".move-in-choice details")).not.toHaveAttribute(
    "open",
  );
  await screenshots(page, "saved-period");
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("the default next month and quick choices use calendar months across the end of the year", async ({
  page,
}) => {
  const state = await fixtures(page, null, "2026-12-31T12:00:00.000Z");
  await page.goto("/profile");
  const current = page.getByRole("button", { name: /^Questo mese/ });
  const next = page.getByRole("button", { name: /^Il prossimo mese/ });
  const month = page.getByLabel("Mese di ingresso", { exact: true });
  await expect(month).toHaveValue("2027-01");
  await expect(next).toHaveAttribute("aria-pressed", "true");
  await expect(current).toContainText("dicembre 2026");
  await expect(next).toContainText("gennaio 2027");
  await expect(month.locator("option")).toHaveCount(36);
  await current.click();
  await expect(month).toHaveValue("2026-12");
  await next.click();
  await expect(month).toHaveValue("2027-01");
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves.at(-1))
    .toMatchObject({
      move_in: "2027-01-01",
      move_in_precision: "month",
      move_in_end: "2027-01-31",
    });
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

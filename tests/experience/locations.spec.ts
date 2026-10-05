import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";

type Location = { city: string; areas: string[] };
const user = {
  id: "synthetic-locations-tenant",
  display_name: "Persona di esempio",
  email: "locations@example.test",
  role: "tenant",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const originalProfile = {
  user_id: user.id,
  city: "Bologna",
  budget: 1100,
  move_in: "2026-12-03",
  move_in_precision: "day",
  move_in_end: "2026-12-03",
  duration: 12 as number | null,
  contract_preference: "any",
  occupants: 2,
  status: "published",
  revision: 4,
};

async function fixtures(page: Page) {
  const image = await sharp({
    create: { width: 320, height: 320, channels: 3, background: "#90b5df" },
  })
    .png()
    .toBuffer();
  const state = {
    profile: { ...originalProfile } as typeof originalProfile & {
      locations?: Location[];
    },
    photo: null as null | {
      id: string;
      url: string;
      width: number;
      height: number;
    },
    household: {
      mode: "group",
      members: [] as { id: string; display_name: string; photo: null }[],
    },
    saves: [] as Record<string, unknown>[],
    publications: [] as string[],
    uploads: 0,
    rejectNextSave: false,
    errors: [] as string[],
  };
  page.on("pageerror", (error) => state.errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("400"))
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
    if (path.startsWith("/api/profile-photos/") && request.method() === "GET")
      return route.fulfill({ body: image, contentType: "image/png" });
    if (path === "/api/profile" && request.method() === "PUT") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      state.saves.push(payload);
      if (state.rejectNextSave) {
        state.rejectNextSave = false;
        return route.fulfill({
          status: 400,
          json: {
            error: "Controlla le città e le zone scelte.",
            details: [{ field: "locations", message: "Controlla le zone." }],
          },
        });
      }
      state.profile = {
        ...(payload as unknown as typeof state.profile),
        user_id: user.id,
        status: state.profile.status,
        revision: state.profile.revision + 1,
      };
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile/status" && request.method() === "POST") {
      state.profile.status = request.postDataJSON().status;
      state.publications.push(state.profile.status);
      state.profile.revision++;
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile/photo" && request.method() === "POST") {
      state.uploads++;
      state.photo = {
        id: "c8a138a5-9cae-447c-9fdd-69ccfe1d2c22",
        url: "/api/profile-photos/c8a138a5-9cae-447c-9fdd-69ccfe1d2c22",
        width: 320,
        height: 320,
      };
      return route.fulfill({ status: 201, json: { photo: state.photo } });
    }
    if (path === "/api/profile/household" && request.method() === "PUT") {
      state.household.mode = request.postDataJSON().mode;
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile/members" && request.method() === "POST") {
      const member = { ...request.postDataJSON(), photo: null };
      state.household.members.push(member);
      return route.fulfill({ status: 201, json: { member } });
    }
    const data: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user },
      "/api/profile": {
        profile: state.profile,
        photo: state.photo,
        household: state.household,
      },
      "/api/verification": { email_verified: true, checks: [] },
    };
    return route.fulfill({
      status: request.method() === "GET" && path in data ? 200 : 404,
      json: data[path] ?? { error: "Unexpected mocked API request." },
    });
  });
  return { state, image };
}

function cityCard(page: Page, city: string) {
  return page.getByRole("region", { name: city, exact: true });
}

async function addCity(page: Page, city: string) {
  await page
    .getByLabel("Città da aggiungere", { exact: true })
    .selectOption(city);
  const button = page.getByRole("button", {
    name: "Aggiungi città",
    exact: true,
  });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(cityCard(page, city)).toBeVisible();
}

async function chooseZones(page: Page, city: string, zones: string[]) {
  const card = cityCard(page, city);
  const summary = card.locator("summary");
  if (
    !(await card
      .locator("details")
      .evaluate((details) => details.hasAttribute("open")))
  ) {
    await summary.focus();
    await page.keyboard.press("Enter");
  }
  const scoped = card.getByRole("radio", {
    name: "Scegli le zone",
    exact: true,
  });
  await scoped.check();
  for (const zone of zones) {
    const checkbox = card.getByRole("checkbox", { name: zone, exact: true });
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).toBeChecked();
  }
}

async function accessible(page: Page, width: number) {
  await page.setViewportSize({ width, height: 844 });
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

test("multiple cities and zones survive photo, household and pause reloads before an explicit save", async ({
  page,
}) => {
  const { state, image } = await fixtures(page);
  await page.goto("/profile");
  await expect(cityCard(page, "Bologna")).toContainText("Tutta la città");
  await addCity(page, "Milano");
  await chooseZones(page, "Bologna", ["San Vitale", "Saragozza"]);
  await chooseZones(page, "Milano", ["Navigli"]);
  const locations = [
    { city: "Bologna", areas: ["San Vitale", "Saragozza"] },
    { city: "Milano", areas: ["Navigli"] },
  ];
  const budget = page.getByLabel(
    "Budget totale mensile (€), spese obbligatorie incluse",
    { exact: true },
  );
  await budget.fill("1250");
  await page
    .getByLabel("Che contratto cerchi?", { exact: true })
    .selectOption("four_plus_four");
  await expect(
    page.getByLabel("Per quanti mesi cerchi casa?", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Hai animali domestici?", { exact: true })
    .selectOption("dog");
  await page
    .getByLabel("Qualche dettaglio sui tuoi animali", { exact: true })
    .fill("Un cane piccolo.");
  await page
    .getByLabel("Presentati al proprietario", { exact: true })
    .fill("Cerchiamo casa in due città.");
  const photo = page.getByRole("region", {
    name: "Foto del gruppo",
    exact: true,
  });
  await photo.getByLabel("Scegli una foto", { exact: true }).setInputFiles({
    name: "gruppo.png",
    mimeType: "image/png",
    buffer: image,
  });
  await photo.getByRole("button", { name: "Salva foto", exact: true }).click();
  await expect(photo.getByRole("status")).toHaveText("Foto salvata.");
  await page
    .getByRole("radio", { name: "Una foto per persona", exact: true })
    .click();
  await expect.poll(() => state.household.mode).toBe("individual");
  await expect(
    page.getByRole("radio", { name: "Una foto per persona", exact: true }),
  ).toBeChecked();
  await page.getByLabel("Nome della persona", { exact: true }).fill("Alessio");
  await page
    .getByRole("button", { name: "Aggiungi persona", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Alessio", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Metti in pausa e annulla inviti",
      exact: true,
    })
    .click();
  await expect.poll(() => state.publications).toEqual(["paused"]);
  for (const { city, areas } of locations) {
    for (const area of areas)
      await expect(
        cityCard(page, city).getByRole("checkbox", { name: area, exact: true }),
      ).toBeChecked();
  }
  await expect(budget).toHaveValue("1250");
  await expect(
    page.getByLabel("Qualche dettaglio sui tuoi animali", { exact: true }),
  ).toHaveValue("Un cane piccolo.");
  await expect(page.locator(".profile-summary")).not.toContainText("Milano");
  await expect(
    page.getByRole("button", {
      name: "Pubblica queste preferenze",
      exact: true,
    }),
  ).toBeDisabled();
  expect(state.saves).toEqual([]);
  expect(state.uploads).toBe(1);
  await accessible(page, 320);
  await accessible(page, 390);
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves)
    .toEqual([
      {
        city: "Bologna",
        locations,
        budget: 1250,
        move_in: "2026-12-03",
        move_in_precision: "day",
        move_in_end: "2026-12-03",
        duration: null,
        contract_preference: "four_plus_four",
        occupants: 2,
        pets: "dog",
        pets_details: "Un cane piccolo.",
        furnishing_preference: "any",
        housing_needs: [],
        about: "Cerchiamo casa in due città.",
      },
    ]);
  await expect(
    page.getByRole("button", {
      name: "Pubblica queste preferenze",
      exact: true,
    }),
  ).toBeEnabled();
  await page.reload();
  await expect(page.locator(".profile-summary")).toContainText(
    "Bologna: San Vitale, Saragozza",
  );
  await expect(page.locator(".profile-summary")).toContainText(
    "Milano: Navigli",
  );
  await expect(
    cityCard(page, "Milano").getByRole("list", {
      name: "Zone scelte a Milano",
      exact: true,
    }),
  ).toContainText("Navigli");
  await expect(
    page.getByLabel("Giorno di ingresso", { exact: true }),
  ).toHaveValue("2026-12-03");
  expect(state.errors).toEqual([]);
});

test("zone filtering, whole-city reset and removing a city preserve a rejected draft for retry", async ({
  page,
}) => {
  const { state } = await fixtures(page);
  await page.goto("/profile");
  await expect(
    page.getByRole("button", { name: "Rimuovi Bologna", exact: true }),
  ).toBeDisabled();
  await addCity(page, "Milano");
  await chooseZones(page, "Milano", []);
  const milano = cityCard(page, "Milano");
  const search = milano.getByLabel("Cerca una zona a Milano", { exact: true });
  await search.fill("navigli");
  await expect(
    milano.getByRole("checkbox", { name: "Navigli", exact: true }),
  ).toBeVisible();
  await expect(
    milano.getByRole("checkbox", { name: "Brera", exact: true }),
  ).toHaveCount(0);
  await milano.getByRole("checkbox", { name: "Navigli", exact: true }).check();
  await search.fill("");
  await expect(
    milano.getByRole("checkbox", { name: "Brera", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Rimuovi Bologna", exact: true })
    .click();
  await expect(cityCard(page, "Bologna")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Rimuovi Milano", exact: true }),
  ).toBeDisabled();
  state.rejectNextSave = true;
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Controlla le città e le zone scelte.",
  );
  await expect(page.getByRole("alert")).toBeFocused();
  await expect(
    milano.getByRole("checkbox", { name: "Navigli", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".profile-summary")).not.toContainText("Milano");
  expect(state.profile.city).toBe("Bologna");
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.profile.locations)
    .toEqual([{ city: "Milano", areas: ["Navigli"] }]);
  expect(state.saves[1]).toEqual(state.saves[0]);
  expect(state.profile.city).toBe("Milano");
  await page.reload();
  await milano.locator("summary").click();
  await milano
    .getByRole("radio", { name: "Tutta la città", exact: true })
    .check();
  await expect(milano.getByRole("checkbox")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.profile.locations)
    .toEqual([{ city: "Milano", areas: [] }]);
  await expect(page.locator(".profile-summary")).toContainText(
    "Milano · tutta la città",
  );
  await accessible(page, 320);
  expect(state.errors).toEqual([]);
});

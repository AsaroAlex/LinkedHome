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
  contract_preference?: string;
};
type Profile = Preferences & {
  user_id: string;
  status: "draft" | "published" | "paused";
  revision: number;
};
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
  authority_attested: boolean;
  status: "draft" | "published";
  revision: number;
  contract_type?: string;
};

const user = {
  id: "synthetic-contract-tenant",
  display_name: "Persona di esempio",
  email: "contracts@example.test",
  role: "tenant",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const property: Property = {
  id: "synthetic-contract-property",
  title: "Bilocale di esempio",
  city: "Bologna",
  area: "Centro",
  rent: 850,
  available_from: "2026-12-01",
  min_months: 6,
  max_months: 36,
  capacity: 2,
  sqm: 60,
  rooms: 2,
  furnished: false,
  description: "Una casa sintetica per provare le preferenze di contratto.",
  authority_attested: true,
  status: "draft",
  revision: 1,
};

async function fixtures(
  page: Page,
  {
    profile = null,
    role = "tenant",
    properties = [],
  }: {
    profile?: Profile | null;
    role?: string;
    properties?: Property[];
  } = {},
) {
  const state = {
    profile,
    properties,
    saves: [] as Preferences[],
    propertySaves: [] as Record<string, unknown>[],
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
    if (
      (path === "/api/properties" && request.method() === "POST") ||
      (path === `/api/properties/${property.id}` && request.method() === "PUT")
    ) {
      const payload = request.postDataJSON() as Omit<
        Property,
        "id" | "status" | "revision"
      >;
      state.propertySaves.push(payload);
      state.properties = [
        {
          ...payload,
          id: property.id,
          status: state.properties[0]?.status ?? "draft",
          revision: (state.properties[0]?.revision ?? 0) + 1,
        },
      ];
      return route.fulfill({ json: { id: property.id, ok: true } });
    }
    const responses: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user: { ...user, role } },
      "/api/profile": { profile: state.profile },
      "/api/properties": { properties: state.properties },
      "/api/verification": { email_verified: true, checks: [] },
    };
    return route.fulfill({
      status: path in responses ? 200 : 404,
      json: responses[path] ?? { message: "Unexpected mocked API request." },
    });
  });
  return state;
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

async function screenshots(page: Page, name: string) {
  await mkdir(".local/contracts", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: `.local/contracts/${name}-desktop.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.screenshot({
    path: `.local/contracts/${name}-mobile.png`,
    fullPage: true,
  });
}

test("tenant contract choice saves separately from stay length and survives an unsaved pause", async ({
  page,
}) => {
  const state = await fixtures(page, {
    profile: {
      user_id: user.id,
      city: "Bologna",
      budget: 1100,
      move_in: "2026-12-03",
      duration: 12,
      occupants: 2,
      status: "published",
      revision: 4,
    },
  });
  await page.goto("/profile");
  const contract = page.getByLabel("Che contratto cerchi?", { exact: true });
  const duration = page.getByLabel("Per quanti mesi cerchi casa?", {
    exact: true,
  });
  const summary = page.locator(".profile-summary");
  await expect(contract).toHaveValue("any");
  await expect(contract.locator("option")).toHaveText([
    "Sono flessibile",
    "4+4 · canone libero",
    "3+2 · canone concordato",
    "Studenti universitari",
    "Transitorio",
  ]);
  await expect(summary).toContainText("Contratto: Sono flessibile");
  await contract.selectOption("four_plus_four");
  await expect(duration).toHaveValue("12");
  await expect(
    page.getByText("Durata iniziale di 4 anni, con rinnovo di altri 4 anni.", {
      exact: true,
    }),
  ).toBeVisible();
  await contract.selectOption("student");
  await expect(duration).toHaveValue("12");
  await expect(summary).toContainText("Contratto: Sono flessibile");
  await accessibleOnMobile(page);
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves)
    .toEqual([
      {
        city: "Bologna",
        budget: 1100,
        move_in: "2026-12-03",
        move_in_precision: "day",
        move_in_end: "2026-12-03",
        duration: 12,
        occupants: 2,
        contract_preference: "student",
      },
    ]);
  await expect(summary).toContainText("Contratto: Studenti universitari");
  await page.reload();
  await expect(contract).toHaveValue("student");
  await expect(duration).toHaveValue("12");
  await contract.selectOption("three_plus_two");
  await page
    .getByRole("button", {
      name: "Metti in pausa e annulla inviti",
      exact: true,
    })
    .click();
  await expect.poll(() => state.publications).toEqual(["paused"]);
  await expect(contract).toHaveValue("three_plus_two");
  await expect(duration).toHaveValue("12");
  await expect(summary).toContainText("Contratto: Studenti universitari");
  await expect(
    page.getByText("Modifiche non salvate.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Pubblica queste preferenze",
      exact: true,
    }),
  ).toBeDisabled();
  expect(state.saves).toHaveLength(1);
  await accessibleOnMobile(page);
  await screenshots(page, "tenant-contract");
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("landlord creates and edits the offered contract without replacing the stay range", async ({
  page,
}) => {
  const state = await fixtures(page, { role: "landlord" });
  await page.goto("/properties");
  await page.getByRole("button", { name: "Aggiungi immobile" }).click();
  const contract = page.getByLabel("Tipo di contratto offerto", {
    exact: true,
  });
  const minimum = page.getByLabel("Permanenza minima (mesi)", { exact: true });
  const maximum = page.getByLabel("Permanenza massima (mesi)", { exact: true });
  await expect(contract).toHaveValue("unspecified");
  await page.getByLabel("Titolo", { exact: true }).fill(property.title);
  await page
    .getByLabel("Quartiere o zona (senza indirizzo preciso)", { exact: true })
    .fill(property.area);
  await page
    .getByLabel("Descrizione", { exact: true })
    .fill(property.description);
  await page.getByLabel("Dichiaro di essere autorizzato").check();
  await contract.selectOption("student");
  await expect(minimum).toHaveValue("6");
  await expect(maximum).toHaveValue("36");
  await accessibleOnMobile(page);
  await screenshots(page, "owner-contract");
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  await expect.poll(() => state.propertySaves).toHaveLength(1);
  expect(state.propertySaves[0]).toMatchObject({
    contract_type: "student",
    min_months: 6,
    max_months: 36,
  });
  const card = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: property.title }) });
  await expect(card).toContainText("Contratto: Studenti universitari");
  await page.reload();
  await card.getByRole("button", { name: "Modifica", exact: true }).click();
  await expect(contract).toHaveValue("student");
  await expect(minimum).toHaveValue("6");
  await expect(maximum).toHaveValue("36");
  await contract.selectOption("three_plus_two");
  await expect(minimum).toHaveValue("6");
  await expect(maximum).toHaveValue("36");
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  await expect.poll(() => state.propertySaves).toHaveLength(2);
  expect(state.propertySaves[1]).toMatchObject({
    contract_type: "three_plus_two",
    min_months: 6,
    max_months: 36,
  });
  await expect(card).toContainText("Contratto: 3+2 · canone concordato");
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("invitation and chat show the offered contract alongside the stay range", async ({
  page,
}) => {
  const state = await fixtures(page);
  const invitation = {
    id: "synthetic-contract-invite",
    tenant_id: user.id,
    other_name: "Proprietario di esempio",
    status: "accepted",
    property: { ...property, contract_type: "student" },
    property_changed: true,
  };
  await page.route("**/api/invitations?*", (route) =>
    route.fulfill({ json: { invitations: [invitation] } }),
  );
  await page.route(`**/api/invitations/${invitation.id}`, (route) =>
    route.fulfill({ json: { invitation } }),
  );
  await page.route(`**/api/conversations/${invitation.id}`, (route) =>
    route.fulfill({
      json: { status: "accepted", messages: [], hasMore: false },
    }),
  );
  await page.goto("/invitations");
  const card = page.locator(".invitation-card");
  await expect(card).toContainText("Contratto: Studenti universitari");
  await expect(card).toContainText("6–36 mesi");
  await expect(card).toContainText(
    "Qui sono conservati i dettagli dell’offerta accettata",
  );
  await card.getByRole("link", { name: /Apri conversazione/ }).click();
  const details = page.locator(".chat-property");
  await expect(details).toContainText("Contratto: Studenti universitari");
  await expect(details).toContainText("6–36 mesi");
  await expect(details).toContainText("Qui vedi l’offerta dell’invito");
  await accessibleOnMobile(page);
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

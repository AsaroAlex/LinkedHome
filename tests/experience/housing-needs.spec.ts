import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

type Profile = {
  user_id: string;
  city: string;
  budget: number;
  move_in: string;
  move_in_precision: string;
  move_in_end: string;
  duration: number | null;
  contract_preference: string;
  occupants: number;
  status: string;
  revision: number;
  housing_needs: string[];
  accessibility_needs?: string[];
  pets?: string;
  pets_details?: string;
  furnishing_preference?: string;
  about?: string;
};

const user = {
  id: "synthetic-housing-tenant",
  display_name: "Persona di esempio",
  email: "housing-needs@example.test",
  role: "tenant",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const originalProfile: Profile = {
  user_id: user.id,
  city: "Bologna",
  budget: 1100,
  move_in: "2026-12-03",
  move_in_precision: "day",
  move_in_end: "2026-12-03",
  duration: 12,
  contract_preference: "any",
  occupants: 2,
  status: "published",
  revision: 4,
  housing_needs: [],
};
const publicChoices = [
  ["elevator", "Ascensore"],
  ["balcony", "Balcone"],
  ["fiber_internet", "Fibra ottica"],
  ["washing_machine", "Lavatrice"],
  ["security_door", "Porta blindata"],
] as const;
const accessChoices = [
  ["step_free_entry", "Ingresso senza gradini"],
  ["step_free_home", "Casa senza scale interne"],
  ["wheelchair_lift", "Ascensore adatto a una sedia a rotelle"],
  ["wide_doorways", "Porte e passaggi ampi"],
  ["accessible_bathroom", "Bagno accessibile"],
  ["step_free_shower", "Doccia senza gradino"],
] as const;

async function fixtures(page: Page, overrides: Partial<Profile> = {}) {
  const image = await sharp({
    create: { width: 320, height: 320, channels: 3, background: "#90b5df" },
  })
    .png()
    .toBuffer();
  const state = {
    profile: { ...originalProfile, ...overrides },
    photo: null as null | {
      id: string;
      url: string;
      width: number;
      height: number;
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
            error: "Controlla le esigenze di accessibilità.",
            details: [
              {
                field: "accessibility_needs",
                message: "Controlla le opzioni.",
              },
            ],
          },
        });
      }
      state.profile = {
        ...(payload as unknown as Profile),
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
        id: "37ec49ca-0b43-44f8-bf62-a20fae079045",
        url: "/api/profile-photos/37ec49ca-0b43-44f8-bf62-a20fae079045",
        width: 320,
        height: 320,
      };
      return route.fulfill({ status: 201, json: { photo: state.photo } });
    }
    const data: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user },
      "/api/profile": { profile: state.profile, photo: state.photo },
      "/api/verification": { email_verified: true, checks: [] },
    };
    return route.fulfill({
      status: request.method() === "GET" && path in data ? 200 : 404,
      json: data[path] ?? { error: "Unexpected mocked API request." },
    });
  });
  return { state, image };
}

async function toggleWithKeyboard(page: Page, selector: string) {
  await page.locator(`${selector} > summary`).focus();
  await page.keyboard.press("Enter");
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

test("grouped home options and private access needs retain keyboard edits through photo, pause and rejected-save retry", async ({
  page,
}) => {
  test.setTimeout(60000);
  const { state, image } = await fixtures(page);
  await page.goto("/profile");
  const more = page.locator(".housing-needs-more");
  const access = page.locator(".profile-accessibility");
  await expect(more).not.toHaveAttribute("open");
  await expect(access).not.toHaveAttribute("open");
  await toggleWithKeyboard(page, ".housing-needs-more");
  await toggleWithKeyboard(page, ".profile-accessibility");
  await expect(more).toHaveAttribute("open");
  await expect(access).toHaveAttribute("open");
  await expect(page.locator(".draft-notice")).toHaveCount(0);
  const housing = page.locator(".housing-needs");
  await expect(housing.locator('input[name="housing_needs"]')).toHaveCount(22);
  expect(
    await housing
      .locator('input[name="housing_needs"]')
      .evaluateAll(
        (inputs) =>
          new Set(inputs.map((input) => (input as HTMLInputElement).value))
            .size,
      ),
  ).toBe(22);
  await expect(access.locator('input[name="accessibility_needs"]')).toHaveCount(
    6,
  );
  for (const [, label] of publicChoices) {
    const checkbox = housing.getByRole("checkbox", {
      name: label,
      exact: true,
    });
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).toBeChecked();
  }
  for (const [, label] of accessChoices) {
    const checkbox = access.getByRole("checkbox", { name: label, exact: true });
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).toBeChecked();
    expect(
      await checkbox.evaluate((input: HTMLInputElement) => input.required),
    ).toBe(false);
  }
  await expect(page.locator(".draft-notice")).toBeVisible();
  await mkdir(".local/housing-needs", { recursive: true });
  for (const width of [1440, 390, 320]) {
    await accessible(page, width);
    await housing.screenshot({
      path: `.local/housing-needs/home-options-${width}.png`,
    });
    await access.screenshot({
      path: `.local/housing-needs/access-options-${width}.png`,
    });
  }
  const photo = page.getByRole("region", {
    name: "Foto del profilo",
    exact: true,
  });
  await photo.getByLabel("Scegli una foto", { exact: true }).setInputFiles({
    name: "foto-sintetica.png",
    mimeType: "image/png",
    buffer: image,
  });
  await photo.getByRole("button", { name: "Salva foto", exact: true }).click();
  await expect(photo.getByRole("status")).toHaveText("Foto salvata.");
  await page
    .getByRole("button", {
      name: "Metti in pausa e annulla inviti",
      exact: true,
    })
    .click();
  await expect.poll(() => state.publications).toEqual(["paused"]);
  expect(state.saves).toEqual([]);
  expect(state.uploads).toBe(1);
  for (const [, label] of publicChoices)
    await expect(
      housing.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  for (const [, label] of accessChoices)
    await expect(
      access.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  await toggleWithKeyboard(page, ".housing-needs-more");
  await toggleWithKeyboard(page, ".profile-accessibility");
  await expect(more).not.toHaveAttribute("open");
  await expect(access).not.toHaveAttribute("open");
  state.rejectNextSave = true;
  const save = page.getByRole("button", {
    name: "Salva preferenze",
    exact: true,
  });
  await save.click();
  await expect(page.getByRole("alert")).toContainText(
    "Controlla le esigenze di accessibilità.",
  );
  await expect(page.getByRole("alert")).toBeFocused();
  const payload = state.saves[0];
  expect(payload.housing_needs).toEqual(
    expect.arrayContaining(publicChoices.map(([key]) => key)),
  );
  expect(payload.housing_needs).toHaveLength(publicChoices.length);
  expect(payload.accessibility_needs).toEqual(
    accessChoices.map(([key]) => key),
  );
  expect(state.profile.accessibility_needs).toBeUndefined();
  await save.click();
  await expect.poll(() => state.saves).toHaveLength(2);
  expect(state.saves[1]).toEqual(payload);
  await expect
    .poll(() => state.profile.accessibility_needs)
    .toEqual(accessChoices.map(([key]) => key));
  await page.reload();
  await expect(more).toHaveAttribute("open");
  await expect(access).toHaveAttribute("open");
  for (const [, label] of publicChoices)
    await expect(
      housing.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  for (const [, label] of accessChoices)
    await expect(
      access.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  const publicPreview = page.locator(
    ".profile-summary > .profile-details-summary",
  );
  for (const [, label] of publicChoices)
    await expect(publicPreview).toContainText(label);
  for (const [, label] of accessChoices)
    await expect(publicPreview).not.toContainText(label);
  await page.locator(".saved-private-details > summary").click();
  const privatePreview = page.locator(
    ".saved-private-details .profile-accessibility-tags",
  );
  for (const [, label] of accessChoices)
    await expect(privatePreview).toContainText(label);
  expect(state.errors).toEqual([]);
});

test("saved legacy home preferences remain selectable and access-only details can be cleared deliberately", async ({
  page,
}) => {
  const { state } = await fixtures(page, {
    housing_needs: ["outdoor_space", "built_in_wardrobes", "dishwasher"],
    accessibility_needs: ["step_free_entry"],
  });
  await page.goto("/profile");
  const more = page.locator(".housing-needs-more");
  const access = page.locator(".profile-accessibility");
  await expect(more).toHaveAttribute("open");
  await expect(access).toHaveAttribute("open");
  for (const label of [
    "Balcone, terrazzo o giardino",
    "Armadi a muro",
    "Lavastoviglie",
  ])
    await expect(
      more.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  await expect(
    access.getByRole("checkbox", {
      name: "Ingresso senza gradini",
      exact: true,
    }),
  ).toBeChecked();
  await expect(page.locator(".saved-private-details")).toBeVisible();
  await page.locator(".saved-private-details > summary").click();
  await expect(
    page.locator(".saved-private-details .profile-accessibility-tags"),
  ).toContainText("Ingresso senza gradini");
  await expect(
    page.locator(".profile-summary > .profile-details-summary"),
  ).not.toContainText("Ingresso senza gradini");
  await access
    .getByRole("checkbox", { name: "Ingresso senza gradini", exact: true })
    .uncheck();
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect.poll(() => state.profile.accessibility_needs).toEqual([]);
  expect(state.saves[0].housing_needs).toEqual(
    expect.arrayContaining([
      "outdoor_space",
      "built_in_wardrobes",
      "dishwasher",
    ]),
  );
  await page.reload();
  await expect(access).not.toHaveAttribute("open");
  await expect(page.locator(".saved-private-details")).toHaveCount(0);
  await expect(
    more.getByRole("checkbox", {
      name: "Balcone, terrazzo o giardino",
      exact: true,
    }),
  ).toBeChecked();
  await accessible(page, 320);
  expect(state.errors).toEqual([]);
});

test("private access needs are hidden from discovery and pending invites, then displayed in the accepted conversation", async ({
  page,
}) => {
  const { state } = await fixtures(page);
  let accepted = false;
  const tenantDetails = {
    housing_needs: ["balcony", "fiber_internet", "washing_machine"],
    accessibility_needs: ["step_free_entry", "accessible_bathroom"],
  };
  const property = {
    id: "synthetic-access-property",
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
    furnished: true,
    description: "Immobile sintetico per verificare le preferenze della casa.",
    contract_type: "transitory",
    authority_attested: true,
    published_at: "2026-10-05T12:00:00.000Z",
    status: "published",
    revision: 1,
  };
  const invitation = () => ({
    id: "synthetic-access-invite",
    tenant_id: "other-synthetic-tenant",
    status: accepted ? "accepted" : "pending",
    other_name: accepted ? "Inquilino di esempio" : null,
    // Unexpected private fields must still be hidden by the UI's status gate.
    tenant_details: tenantDetails,
    property,
    expires_at: "2026-10-12T12:00:00.000Z",
  });
  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { user: { ...user, role: "landlord" } } }),
  );
  await page.route("**/api/properties", (route) =>
    route.fulfill({ json: { properties: [property] } }),
  );
  await page.route(`**/api/discover/${property.id}`, (route) =>
    route.fulfill({
      json: {
        property,
        profiles: [
          {
            id: "other-synthetic-tenant",
            alias: "Profilo di esempio",
            city: "Bologna",
            ...tenantDetails,
            compatibility: { checks: [] },
          },
        ],
        hasMore: false,
      },
    }),
  );
  await page.route("**/api/invitations?*", (route) =>
    route.fulfill({ json: { invitations: [invitation()] } }),
  );
  await page.route("**/api/invitations/synthetic-access-invite", (route) =>
    route.fulfill({ json: { invitation: invitation() } }),
  );
  await page.route("**/api/conversations/synthetic-access-invite", (route) =>
    route.fulfill({
      json: { status: "accepted", messages: [], hasMore: false },
    }),
  );
  await page.goto("/discover");
  const card = page.locator(".tenant-card");
  for (const label of ["Balcone", "Fibra ottica", "Lavatrice"])
    await expect(card).toContainText(label);
  for (const label of ["Ingresso senza gradini", "Bagno accessibile"])
    await expect(card).not.toContainText(label);
  await expect(card.locator(".profile-accessibility-tags")).toHaveCount(0);
  await page.goto("/invitations");
  const invite = page.locator(".invitation-card");
  await expect(invite).toBeVisible();
  await expect(invite.locator(".profile-accessibility-tags")).toHaveCount(0);
  accepted = true;
  await page.reload();
  for (const label of ["Ingresso senza gradini", "Bagno accessibile"])
    await expect(invite.locator(".profile-accessibility-tags")).toContainText(
      label,
    );
  await invite.getByRole("link", { name: /Apri conversazione/ }).click();
  for (const label of ["Ingresso senza gradini", "Bagno accessibile"])
    await expect(
      page.locator(".chat-aside .profile-accessibility-tags"),
    ).toContainText(label);
  await accessible(page, 390);
  expect(state.saves).toEqual([]);
  expect(state.errors).toEqual([]);
});

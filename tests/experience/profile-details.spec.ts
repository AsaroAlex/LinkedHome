import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

type Details = {
  pets?: string;
  pets_details?: string;
  furnishing_preference?: string;
  housing_needs?: string[];
  about?: string;
};
type Profile = Details & {
  user_id: string;
  city: string;
  budget: number;
  move_in: string;
  move_in_precision?: string;
  move_in_end?: string | null;
  duration: number | null;
  contract_preference?: string;
  occupants: number;
  status: "draft" | "published" | "paused";
  revision: number;
};
type Photo = { id: string; url: string; width: number; height: number };

const user = {
  id: "synthetic-details-tenant",
  display_name: "Persona di esempio",
  email: "profile-details@example.test",
  role: "tenant",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const legacyProfile: Profile = {
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
};
const originalPhoto: Photo = {
  id: "bb3a7081-8cb9-4d85-8b93-ea8d4690827a",
  url: "/api/profile-photos/bb3a7081-8cb9-4d85-8b93-ea8d4690827a",
  width: 320,
  height: 320,
};
const details = {
  pets: "dog",
  pets_details: "Vivo con un cane piccolo abituato a stare in appartamento.",
  furnishing_preference: "partly_furnished",
  housing_needs: ["elevator", "outdoor_space"],
  about:
    "Mi trasferisco a Bologna e cerco una casa dove fermarmi per un periodo.",
};

async function fixtures(page: Page, role = "tenant") {
  const image = await sharp({
    create: {
      width: 320,
      height: 320,
      channels: 3,
      background: { r: 160, g: 197, b: 235 },
    },
  })
    .png()
    .toBuffer();
  const state = {
    profile: { ...legacyProfile } as Profile,
    photo: { ...originalPhoto } as Photo,
    saves: [] as Record<string, unknown>[],
    publications: [] as string[],
    uploads: 0,
    rejectNextSave: false,
    browserErrors: [] as string[],
    consoleErrors: [] as string[],
    failedRequests: [] as string[],
  };
  page.on("pageerror", (error) => state.browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") state.consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText;
    if (error !== "net::ERR_ABORTED")
      state.failedRequests.push(`${new URL(request.url()).pathname}: ${error}`);
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
            error: "Controlla i dettagli del profilo.",
            details: [
              { field: "about", message: "Controlla la presentazione." },
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
      const status = request.postDataJSON().status as Profile["status"];
      state.publications.push(status);
      state.profile = {
        ...state.profile,
        status,
        revision: state.profile.revision + 1,
      };
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile/photo" && request.method() === "POST") {
      state.uploads++;
      const id = randomUUID();
      state.photo = {
        id,
        url: `/api/profile-photos/${id}`,
        width: 320,
        height: 320,
      };
      return route.fulfill({ status: 201, json: { photo: state.photo } });
    }
    const responses: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user: { ...user, role } },
      "/api/profile": { profile: state.profile, photo: state.photo },
      "/api/verification": { email_verified: true, checks: [] },
    };
    return route.fulfill({
      status: request.method() === "GET" && path in responses ? 200 : 404,
      json: responses[path] ?? { error: "Unexpected mocked API request." },
    });
  });
  return { state, image };
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

function inputs(page: Page) {
  return {
    pets: page.getByLabel("Hai animali domestici?", { exact: true }),
    petDetails: page.getByLabel("Qualche dettaglio sui tuoi animali", {
      exact: true,
    }),
    furniture: page.getByLabel("Preferisci una casa arredata?", {
      exact: true,
    }),
    about: page.getByLabel("Presentati al proprietario", { exact: true }),
    elevator: page.getByRole("checkbox", { name: "Ascensore", exact: true }),
    outdoor: page.getByRole("checkbox", {
      name: "Balcone, terrazzo o giardino",
      exact: true,
    }),
    parking: page.getByRole("checkbox", { name: "Posto auto", exact: true }),
  };
}

test("optional details persist after a photo upload, an unsaved pause and a deliberate preference save", async ({
  page,
}) => {
  const { state, image } = await fixtures(page);
  await page.goto("/profile");
  const fields = inputs(page);
  await expect(
    page.getByRole("group", { name: "Qualcosa in più su di te", exact: true }),
  ).toBeVisible();
  await expect(fields.pets).toHaveValue("unspecified");
  await expect(fields.petDetails).toHaveCount(0);
  await expect(fields.furniture).toHaveValue("any");
  await expect(fields.about).toHaveValue("");
  await expect(fields.elevator).not.toBeChecked();
  await expect(fields.outdoor).not.toBeChecked();
  await expect(fields.parking).not.toBeChecked();
  await page
    .getByLabel("Budget totale mensile (€), spese obbligatorie incluse", {
      exact: true,
    })
    .fill("1250");
  await page
    .getByLabel("Che contratto cerchi?", { exact: true })
    .selectOption("transitory");
  await page
    .getByLabel("Per quanti mesi cerchi casa?", { exact: true })
    .fill("8");
  await fields.pets.selectOption("dog");
  await fields.petDetails.fill(details.pets_details);
  await fields.furniture.selectOption("partly_furnished");
  await fields.elevator.check();
  await fields.outdoor.check();
  await fields.about.fill(details.about);
  const photoEditor = page.getByRole("region", {
    name: "Foto del profilo",
    exact: true,
  });
  await photoEditor.getByLabel("Cambia foto", { exact: true }).setInputFiles({
    name: "foto-sintetica.png",
    mimeType: "image/png",
    buffer: image,
  });
  await photoEditor
    .getByRole("button", { name: "Salva foto", exact: true })
    .click();
  await expect(photoEditor.getByRole("status")).toHaveText("Foto salvata.");
  expect(state.uploads).toBe(1);
  expect(state.saves).toEqual([]);
  await expect(fields.pets).toHaveValue("dog");
  await expect(fields.petDetails).toHaveValue(details.pets_details);
  await expect(fields.furniture).toHaveValue("partly_furnished");
  await expect(fields.elevator).toBeChecked();
  await expect(fields.outdoor).toBeChecked();
  await expect(fields.about).toHaveValue(details.about);
  await page
    .getByRole("button", {
      name: "Metti in pausa e annulla inviti",
      exact: true,
    })
    .click();
  await expect.poll(() => state.publications).toEqual(["paused"]);
  await expect(fields.petDetails).toHaveValue(details.pets_details);
  await expect(fields.about).toHaveValue(details.about);
  await expect(fields.elevator).toBeChecked();
  await expect(
    page.getByRole("button", {
      name: "Pubblica queste preferenze",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.locator(".profile-summary")).toContainText(
    "Fino a €1100 al mese",
  );
  await accessibleOnMobile(page);
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves)
    .toEqual([
      {
        city: "Bologna",
        budget: 1250,
        move_in: "2026-12-03",
        move_in_precision: "day",
        move_in_end: "2026-12-03",
        duration: 8,
        contract_preference: "transitory",
        occupants: 2,
        ...details,
      },
    ]);
  await expect(
    page.getByRole("button", {
      name: "Pubblica queste preferenze",
      exact: true,
    }),
  ).toBeEnabled();
  const uploadedPhoto = state.photo;
  await page.reload();
  await expect(fields.pets).toHaveValue("dog");
  await expect(fields.petDetails).toHaveValue(details.pets_details);
  await expect(fields.furniture).toHaveValue("partly_furnished");
  await expect(fields.elevator).toBeChecked();
  await expect(fields.outdoor).toBeChecked();
  await expect(fields.parking).not.toBeChecked();
  await expect(fields.about).toHaveValue(details.about);
  await expect(
    photoEditor.locator(`img[src="${uploadedPhoto.url}"]`),
  ).toBeVisible();
  await mkdir(".local/profile-details", { recursive: true });
  await page.screenshot({
    path: ".local/profile-details/details-320.png",
    fullPage: true,
  });
  await fields.pets.selectOption("none");
  await expect(fields.petDetails).toHaveCount(0);
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.saves.at(-1))
    .toMatchObject({ ...details, pets: "none", pets_details: "" });
  expect(state.photo).toEqual(uploadedPhoto);
  expect(state.browserErrors).toEqual([]);
  expect(state.consoleErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("detail limits and server field errors preserve the draft; long contracts require no months", async ({
  page,
}) => {
  const { state } = await fixtures(page);
  await page.goto("/profile");
  const fields = inputs(page);
  await fields.pets.selectOption("cat");
  await expect(fields.petDetails).toHaveAttribute("maxlength", "200");
  await expect(fields.about).toHaveAttribute("maxlength", "600");
  expect(
    await fields.petDetails.evaluate(
      (input: HTMLInputElement) => input.required,
    ),
  ).toBe(false);
  expect(
    await fields.about.evaluate((input: HTMLTextAreaElement) => input.required),
  ).toBe(false);
  await fields.petDetails.fill("Un gatto che vive in casa.");
  await fields.about.fill("Cerco una casa tranquilla a Bologna.");
  const duration = page.getByLabel("Per quanti mesi cerchi casa?", {
    exact: true,
  });
  await duration.fill("");
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  expect(
    await duration.evaluate(
      (input: HTMLInputElement) => input.validity.valueMissing,
    ),
  ).toBe(true);
  expect(state.saves).toEqual([]);
  await page
    .getByLabel("Che contratto cerchi?", { exact: true })
    .selectOption("four_plus_four");
  await expect(duration).toHaveCount(0);
  state.rejectNextSave = true;
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Controlla i dettagli del profilo.",
  );
  await expect(fields.about).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toBeFocused();
  await expect(fields.about).toHaveValue(
    "Cerco una casa tranquilla a Bologna.",
  );
  await expect(fields.petDetails).toHaveValue("Un gatto che vive in casa.");
  expect(state.saves[0]).toMatchObject({
    duration: null,
    contract_preference: "four_plus_four",
    pets: "cat",
  });
  await accessibleOnMobile(page);
  await fields.about.fill("Cerco una casa a Bologna per stabilirmi in città.");
  await page
    .getByRole("button", { name: "Salva preferenze", exact: true })
    .click();
  await expect
    .poll(() => state.profile.contract_preference)
    .toBe("four_plus_four");
  expect(state.profile.duration).toBeNull();
  await expect(fields.about).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(".profile-summary")).not.toContainText("null mesi");
  await page.reload();
  await expect(duration).toHaveCount(0);
  await expect(fields.about).toHaveValue(
    "Cerco una casa a Bologna per stabilirmi in città.",
  );
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
  expect(
    state.consoleErrors.filter((message) => !message.includes("400")),
  ).toEqual([]);
});

test("discovery shows household preferences while private details appear only after acceptance", async ({
  page,
}) => {
  const { state } = await fixtures(page, "landlord");
  let accepted = false;
  const offeredProperty = {
    id: "synthetic-details-property",
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
    description: "Immobile sintetico per verificare i dettagli condivisi.",
    contract_type: "transitory",
    authority_attested: true,
    published_at: "2026-10-05T12:00:00.000Z",
    status: "published",
    revision: 1,
  };
  const invitation = () => ({
    id: "synthetic-details-invite",
    tenant_id: "other-synthetic-tenant",
    status: accepted ? "accepted" : "pending",
    other_name: accepted ? "Inquilino di esempio" : null,
    tenant_details: accepted ? details : null,
    property: offeredProperty,
    expires_at: "2026-10-12T12:00:00.000Z",
  });
  await page.route("**/api/properties", (route) =>
    route.fulfill({ json: { properties: [offeredProperty] } }),
  );
  await page.route(`**/api/discover/${offeredProperty.id}`, (route) =>
    route.fulfill({
      json: {
        property: offeredProperty,
        profiles: [
          {
            id: "other-synthetic-tenant",
            alias: "Profilo di esempio",
            city: "Bologna",
            pets: details.pets,
            furnishing_preference: details.furnishing_preference,
            housing_needs: details.housing_needs,
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
  await page.route("**/api/invitations/synthetic-details-invite", (route) =>
    route.fulfill({ json: { invitation: invitation() } }),
  );
  await page.route("**/api/conversations/synthetic-details-invite", (route) =>
    route.fulfill({
      json: { status: "accepted", messages: [], hasMore: false },
    }),
  );
  await page.goto("/discover");
  const card = page.locator(".tenant-card");
  await expect(card).toContainText(/cane/i);
  await expect(card).toContainText(/parzialmente arredata/i);
  await expect(card).toContainText("Ascensore");
  await expect(card).toContainText("Balcone, terrazzo o giardino");
  await expect(card).not.toContainText(details.about);
  await expect(card).not.toContainText(details.pets_details);
  await page.goto("/invitations");
  const invite = page.locator(".invitation-card");
  await expect(invite).toBeVisible();
  await expect(invite).not.toContainText(details.about);
  await expect(invite).not.toContainText(details.pets_details);
  accepted = true;
  await page.reload();
  await expect(invite).toContainText(details.about);
  await expect(invite).toContainText(details.pets_details);
  await expect(invite).toContainText("Ascensore");
  await invite.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(
    page.locator(".chat-aside .profile-details-summary"),
  ).toContainText(details.about);
  await expect(
    page.locator(".chat-aside .profile-details-summary"),
  ).toContainText(details.pets_details);
  await accessibleOnMobile(page);
  expect(state.saves).toEqual([]);
  expect(state.browserErrors).toEqual([]);
  expect(state.consoleErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

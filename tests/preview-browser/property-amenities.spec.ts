import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const description =
  "Casa sintetica con balcone, aria condizionata e lavatrice. Senza ascensore. Bagno con box-doccia.";
const notes =
  "Lavastoviglie, fibra ottica e ingresso senza gradini. Nota sintetica sulle dotazioni.";
const changedNotes =
  "Dotazioni sintetiche aggiornate: una terrazza per il nuovo annuncio.";
const privateAddress = {
  street: "Via delle Dotazioni Sintetiche",
  street_number: "65-SYN",
};
const choices = [
  ["Posto auto", "parking"],
  ["Balcone", "balcony"],
  ["Aria condizionata", "air_conditioning"],
  ["Box o garage", "garage"],
  ["Fibra ottica", "fiber_internet"],
  ["Lavastoviglie", "dishwasher"],
  ["Ingresso senza gradini", "step_free_entry"],
  ["Porte e passaggi ampi", "wide_doorways"],
] as const;
const selected = choices.map(([, value]) => value).sort();

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
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const user = (await browserApi(page, "/session")).user;
  expect(user.email).toMatch(/@example\.test$/);
  return user;
}

function propertyCard(page: Page, title: string) {
  return page.getByRole("article").filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
}

async function edit(page: Page, title: string) {
  await page.goto("/properties");
  await propertyCard(page, title)
    .getByRole("button", { name: "Modifica", exact: true })
    .click();
  await expect(page.locator(".property-amenities-fields")).toBeVisible();
}

async function more(page: Page, open = true) {
  const details = page.locator(".property-amenities-more");
  if (
    (await details.evaluate((element) => element.hasAttribute("open"))) !== open
  )
    await details.locator("summary").click();
  return details;
}

async function save(page: Page, property: { id: string; title: string }) {
  const response = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/properties/${property.id}` &&
      response.request().method() === "PUT",
  );
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  const saved = await response;
  expect(saved.status()).toBe(200);
  await expect(propertyCard(page, property.title)).toBeVisible();
  return {
    payload: saved.request().postDataJSON(),
    property: (await browserApi(page, "/properties")).properties.find(
      (candidate: { id: string }) => candidate.id === property.id,
    ),
  };
}

async function expectOriginalSummary(summary: Locator) {
  await expect(summary).toBeVisible();
  for (const [label] of choices)
    await expect(summary.locator(".property-amenities-tags")).toContainText(
      label,
    );
  await expect(summary.locator(".property-amenities-tags")).not.toContainText(
    "Ascensore",
  );
  await expect(summary.locator(".property-amenities-tags")).not.toContainText(
    "Lavatrice",
  );
  await expect(summary.locator(".property-amenities-notes")).toContainText(
    notes,
  );
}

function expectOriginalOffer(invitation: any) {
  for (const property of [invitation.property, invitation.property_snapshot]) {
    expect(property.amenities.slice().sort()).toEqual(selected);
    expect(property.amenities_details).toBe(notes);
    expect(property).not.toHaveProperty("street");
    expect(property).not.toHaveProperty("street_number");
  }
  expect(JSON.stringify(invitation)).not.toContain(privateAddress.street);
  expect(JSON.stringify(invitation)).not.toContain(
    privateAddress.street_number,
  );
  expect(JSON.stringify(invitation)).not.toContain(changedNotes);
}

test("property amenities can be prefilled, corrected and saved, then shared as the original offer after acceptance", async ({
  page,
}, testInfo) => {
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
  await role(page, "landlord");
  const initial = (await browserApi(page, "/properties")).properties.find(
    (property: { status: string }) => property.status === "published",
  );
  expect(initial).toBeTruthy();
  expect(initial.amenities).toEqual([]);
  expect(initial.amenities_details).toBe("");
  await edit(page, initial.title);
  const fields = page.locator(".property-amenities-fields");
  await expect(fields.locator('input[name="amenities"]')).toHaveCount(27);
  await expect(fields.locator('input[type="checkbox"]:checked')).toHaveCount(0);
  const detailNotes = page.getByLabel("Altre informazioni sulle dotazioni", {
    exact: true,
  });
  await expect(detailNotes).toHaveAttribute("maxlength", "600");
  await page.getByLabel("Descrizione", { exact: true }).fill(description);
  await detailNotes.fill(notes);
  await fields
    .getByRole("checkbox", { name: "Posto auto", exact: true })
    .check();
  // Typing text does not silently change the owner's choices. Prefilling is
  // explicit, adds suggestions to manual choices, and leaves them editable.
  await expect(
    fields.getByRole("checkbox", { name: "Balcone", exact: true }),
  ).not.toBeChecked();
  await page
    .getByRole("button", { name: "Precompila dal testo", exact: true })
    .click();
  for (const label of [
    "Posto auto",
    "Balcone",
    "Aria condizionata",
    "Lavatrice",
    "Lavastoviglie",
    "Fibra ottica",
    "Ingresso senza gradini",
  ])
    await expect(
      fields.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  await expect(
    fields.getByRole("checkbox", { name: "Ascensore", exact: true }),
  ).not.toBeChecked();
  await expect(
    fields.getByRole("checkbox", { name: "Box o garage", exact: true }),
  ).not.toBeChecked();
  await more(page);
  await fields
    .getByRole("checkbox", { name: "Lavatrice", exact: true })
    .uncheck();
  await fields
    .getByRole("checkbox", { name: "Box o garage", exact: true })
    .check();
  await fields
    .getByRole("checkbox", { name: "Porte e passaggi ampi", exact: true })
    .check();
  await page
    .getByLabel("Via o piazza", { exact: true })
    .fill(privateAddress.street);
  await page
    .getByLabel("Numero civico", { exact: true })
    .fill(privateAddress.street_number);
  await expect(
    page.getByRole("radio", { name: "Solo quartiere", exact: true }),
  ).toBeChecked();
  await more(page, false);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await fields.screenshot({
      path: testInfo.outputPath(`property-amenities-${width}.png`),
    });
    if (width === 320)
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations.map((violation) => violation.id),
      ).toEqual([]);
  }
  const saved = await save(page, initial);
  expect(saved.payload.amenities.slice().sort()).toEqual(selected);
  expect(saved.payload.amenities_details).toBe(notes);
  expect(saved.property.amenities.slice().sort()).toEqual(selected);
  expect(saved.property).toMatchObject({
    amenities_details: notes,
    ...privateAddress,
    address_visibility: "area",
    city: initial.city,
    rent: initial.rent,
    available_from: initial.available_from,
    status: "published",
  });
  await expectOriginalSummary(
    propertyCard(page, initial.title).locator(".property-amenities-summary"),
  );
  const exported = (await browserApi(page, "/account/export")).properties.find(
    (property: { id: string }) => property.id === initial.id,
  );
  expect(exported.amenities.slice().sort()).toEqual(selected);
  expect(exported.amenities_details).toBe(notes);
  await page.reload();
  await edit(page, initial.title);
  await more(page);
  for (const [label] of choices)
    await expect(
      fields.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  await expect(
    fields.getByRole("checkbox", { name: "Lavatrice", exact: true }),
  ).not.toBeChecked();
  await expect(
    fields.getByRole("checkbox", { name: "Ascensore", exact: true }),
  ).not.toBeChecked();
  await expect(detailNotes).toHaveValue(notes);
  await page.getByRole("button", { name: "Annulla", exact: true }).click();

  await page.goto(`/discover?property=${initial.id}`);
  const candidate = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: `Profilo ${tenant.id.slice(0, 6).toUpperCase()}`,
      exact: true,
    }),
  });
  await expect(candidate).toBeVisible();
  const sent = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/invitations" &&
      response.request().method() === "POST",
  );
  await candidate
    .getByRole("button", { name: /Invita per questo immobile/ })
    .click();
  const response = await sent;
  expect(response.status()).toBe(201);
  const id = (await response.json()).id;
  await role(page, "tenant");
  await page.goto("/invitations");
  const invitationCard = propertyCard(page, initial.title);
  await expectOriginalSummary(
    invitationCard.locator(".property-amenities-summary"),
  );
  const pending = (await browserApi(page, `/invitations/${id}`)).invitation;
  expect(pending.status).toBe("pending");
  expectOriginalOffer(pending);
  await invitationCard
    .getByRole("button", {
      name: "Accetta e apri la conversazione",
      exact: true,
    })
    .click();
  await expect(
    invitationCard.getByRole("link", { name: /Apri conversazione/ }),
  ).toBeVisible();
  const accepted = (await browserApi(page, `/invitations/${id}`)).invitation;
  expect(accepted.status).toBe("accepted");
  expectOriginalOffer(accepted);
  await invitationCard
    .getByRole("link", { name: /Apri conversazione/ })
    .click();
  await expectOriginalSummary(
    page.locator(".chat-aside .property-amenities-summary"),
  );

  await role(page, "landlord");
  await edit(page, initial.title);
  await more(page);
  await fields
    .getByRole("checkbox", { name: "Box o garage", exact: true })
    .uncheck();
  await fields
    .getByRole("checkbox", { name: "Lavastoviglie", exact: true })
    .uncheck();
  await fields.getByRole("checkbox", { name: "Terrazzo", exact: true }).check();
  await detailNotes.fill(changedNotes);
  const updated = await save(page, initial);
  expect(updated.property.amenities.slice().sort()).toEqual(
    [
      ...selected.filter(
        (value) => value !== "garage" && value !== "dishwasher",
      ),
      "terrace",
    ].sort(),
  );
  expect(updated.property.amenities_details).toBe(changedNotes);
  await role(page, "tenant");
  const historical = (await browserApi(page, `/invitations/${id}`)).invitation;
  expect(historical.status).toBe("accepted");
  expect(historical.property_changed).toBe(true);
  expectOriginalOffer(historical);
  await page.goto(`/conversations/${id}`);
  await expectOriginalSummary(
    page.locator(".chat-aside .property-amenities-summary"),
  );
  await expect(
    page.locator(".chat-aside .property-amenities-summary"),
  ).not.toContainText(changedNotes);
  expect(errors).toEqual([]);
});

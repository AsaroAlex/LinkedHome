import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const housingChoices = [
  ["Ascensore", "elevator"],
  ["Balcone", "balcony"],
  ["Terrazzo", "terrace"],
  ["Posto auto", "parking"],
  ["Aria condizionata", "air_conditioning"],
  ["Box o garage", "garage"],
  ["Lavastoviglie", "dishwasher"],
] as const;

const accessibilityChoices = [
  ["Ingresso senza gradini", "step_free_entry"],
  ["Casa senza scale interne", "step_free_home"],
  ["Ascensore adatto a una sedia a rotelle", "wheelchair_lift"],
  ["Porte e passaggi ampi", "wide_doorways"],
  ["Bagno accessibile", "accessible_bathroom"],
  ["Doccia senza gradino", "step_free_shower"],
] as const;

async function browserApi(page: Page, path: string) {
  // Browser fetch uses the same preview workspace and its Secure cookies.
  const result = await page.evaluate(async (path) => {
    const response = await fetch("/api" + path, {
      credentials: "same-origin",
    });
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

test("housing choices persist while accessibility needs stay private until acceptance and can be removed or blocked", async ({
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
  const more = page.locator(".housing-needs-more");
  await expect(more).not.toHaveAttribute("open", "");
  // Frequent choices are available immediately, and additional groups expand
  // without hiding or resetting the selections above them.
  for (const [label] of housingChoices.slice(0, 5))
    await page.getByRole("checkbox", { name: label, exact: true }).check();
  await more.getByText("Altre caratteristiche", { exact: true }).click();
  for (const [label] of housingChoices.slice(5))
    await page.getByRole("checkbox", { name: label, exact: true }).check();
  for (const [label] of housingChoices)
    await expect(
      page.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();

  const accessibility = page.locator(".profile-accessibility");
  await expect(accessibility).not.toHaveAttribute("open", "");
  await accessibility
    .getByText("Ti serve una casa accessibile?", { exact: true })
    .click();
  for (const [label] of accessibilityChoices)
    await accessibility
      .getByRole("checkbox", { name: label, exact: true })
      .check();

  const housingNeeds = housingChoices.map(([, value]) => value).sort();
  const accessibilityNeeds = accessibilityChoices.map(([, value]) => value);
  const saved = await save(page);
  expect(saved.housing_needs.slice().sort()).toEqual(housingNeeds);
  expect(saved.accessibility_needs).toEqual(accessibilityNeeds);
  expect(saved).toMatchObject({
    budget: initial.budget,
    occupants: initial.occupants,
    move_in: initial.move_in,
    move_in_precision: initial.move_in_precision,
    contract_preference: initial.contract_preference,
    duration: initial.duration,
  });
  expect((await browserApi(page, "/account/export")).profile[0]).toMatchObject({
    housing_needs: saved.housing_needs,
    accessibility_needs: accessibilityNeeds,
  });
  await page.reload();
  for (const [label] of housingChoices)
    await expect(
      page.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  await expect(accessibility).toHaveAttribute("open", "");
  for (const [label] of accessibilityChoices)
    await expect(
      accessibility.getByRole("checkbox", { name: label, exact: true }),
    ).toBeChecked();
  // The public preview excludes private access needs even though the owner
  // can review those saved details in the separate private disclosure.
  const publicSummary = page.locator(
    ".profile-summary > .profile-details-summary",
  );
  for (const [label] of housingChoices)
    await expect(publicSummary).toContainText(label);
  for (const [label] of accessibilityChoices)
    await expect(publicSummary).not.toContainText(label);
  await expect(
    publicSummary.locator(".profile-accessibility-tags"),
  ).toHaveCount(0);
  const privateSummary = page.locator(".saved-private-details");
  for (const [label] of accessibilityChoices)
    await expect(privateSummary).toContainText(label);
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
    (candidate: { city: string; status: string }) =>
      candidate.city === initial.city && candidate.status === "published",
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
  for (const [label] of housingChoices) await expect(card).toContainText(label);
  for (const [label] of accessibilityChoices)
    await expect(card).not.toContainText(label);
  const discovery = (
    await browserApi(page, `/discover/${property.id}`)
  ).profiles.find((candidate: { id: string }) => candidate.id === tenant.id);
  expect(discovery.housing_needs.slice().sort()).toEqual(housingNeeds);
  expect(discovery).not.toHaveProperty("accessibility_needs");
  expect(discovery.compatibility.compatible).toBe(true);
  for (const value of accessibilityNeeds)
    expect(JSON.stringify(discovery)).not.toContain(value);
  expect(
    discovery.compatibility.checks.some((check: { key: string }) =>
      /accessib|step_free|wheelchair|wide_doorways/.test(check.key),
    ),
  ).toBe(false);
  await card
    .getByRole("button", { name: /Invita per questo immobile/ })
    .click();
  await expect(
    page.getByText("Invito inviato.", { exact: false }),
  ).toBeVisible();
  const pending = (await browserApi(page, "/invitations")).invitations.find(
    (invitation: { tenant_id: string }) => invitation.tenant_id === tenant.id,
  );
  expect(pending.status).toBe("pending");
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
  expect(
    (await browserApi(page, `/invitations/${pending.id}`)).invitation
      .tenant_details.accessibility_needs,
  ).toEqual(accessibilityNeeds);
  await role(page, "landlord");
  await page.goto("/invitations");
  for (const [label] of accessibilityChoices)
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  const accepted = (await browserApi(page, `/invitations/${pending.id}`))
    .invitation;
  expect(accepted.status).toBe("accepted");
  expect(accepted.tenant_details.accessibility_needs).toEqual(
    accessibilityNeeds,
  );
  await page.getByRole("link", { name: /Apri conversazione/ }).click();
  for (const [label] of accessibilityChoices)
    await expect(page.locator(".chat-aside")).toContainText(label);
  await page
    .getByRole("button", { name: "Chiudi conversazione", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Conversazione chiusa.");
  const closed = (await browserApi(page, `/invitations/${pending.id}`))
    .invitation;
  expect(closed.status).toBe("closed");
  expect(closed.tenant_details.accessibility_needs).toEqual(accessibilityNeeds);

  await role(page, "tenant");
  await page.goto("/profile");
  for (const [label] of accessibilityChoices)
    await accessibility
      .getByRole("checkbox", { name: label, exact: true })
      .uncheck();
  expect((await save(page)).accessibility_needs).toEqual([]);
  expect(
    (await browserApi(page, "/account/export")).profile[0].accessibility_needs,
  ).toEqual([]);
  await role(page, "landlord");
  await page.goto("/invitations");
  const cleared = (await browserApi(page, `/invitations/${pending.id}`))
    .invitation;
  expect(cleared.status).toBe("closed");
  expect(cleared.tenant_details).not.toHaveProperty("accessibility_needs");
  expect(cleared.tenant_details.housing_needs.slice().sort()).toEqual(
    housingNeeds,
  );
  for (const [label] of accessibilityChoices)
    await expect(page.getByText(label, { exact: true })).toHaveCount(0);

  // Blocking must revoke details even when a previously accepted contact is
  // already closed, without deleting the owner's saved accessibility choice.
  await role(page, "tenant");
  await page.goto("/profile");
  await accessibility.locator("summary").click();
  await accessibility
    .getByRole("checkbox", { name: "Ingresso senza gradini", exact: true })
    .check();
  expect((await save(page)).accessibility_needs).toEqual(["step_free_entry"]);
  await role(page, "landlord");
  await page.goto("/invitations");
  await expect(
    page.getByText("Ingresso senza gradini", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Blocca contatto", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Contatto bloccato.");
  expect(
    (await browserApi(page, `/invitations/${pending.id}`)).invitation
      .tenant_details,
  ).toBeNull();
  await expect(
    page.getByText("Ingresso senza gradini", { exact: true }),
  ).toHaveCount(0);
  await role(page, "tenant");
  expect(
    (await browserApi(page, `/invitations/${pending.id}`)).invitation
      .tenant_details,
  ).toBeNull();
  expect(
    (await browserApi(page, "/profile")).profile.accessibility_needs,
  ).toEqual(["step_free_entry"]);
  expect(errors).toEqual([]);
});

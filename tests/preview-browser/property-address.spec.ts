import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const firstAddress = {
  street: "Via del Test Sintetico Uno",
  street_number: "73-SYN",
};
const changedAddress = {
  street: "Via del Test Sintetico Due",
  street_number: "84-SYN",
};

async function browserApi(page: Page, path: string) {
  // Use browser fetch so local preview Secure cookies and the deployed
  // preview workspace are exercised in the same way as the real interface.
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

function observeErrors(page: Page) {
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
  return errors;
}

function propertyCard(page: Page, title: string) {
  return page.getByRole("article").filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });
}

async function editProperty(page: Page, title: string) {
  await page.goto("/properties");
  await propertyCard(page, title)
    .getByRole("button", { name: "Modifica", exact: true })
    .click();
  await expect(page.getByLabel("Via o piazza", { exact: true })).toBeVisible();
}

async function fillAddress(
  page: Page,
  address: { street: string; street_number: string },
) {
  await page.getByLabel("Via o piazza", { exact: true }).fill(address.street);
  await page
    .getByLabel("Numero civico", { exact: true })
    .fill(address.street_number);
}

async function saveProperty(page: Page, title: string, id?: string) {
  const response = page.waitForResponse(
    (response) =>
      /\/api\/properties(?:\/[^/]+)?$/.test(new URL(response.url()).pathname) &&
      ["POST", "PUT"].includes(response.request().method()),
  );
  await page
    .getByRole("button", { name: "Salva immobile", exact: true })
    .click();
  expect((await response).ok()).toBeTruthy();
  await expect(propertyCard(page, title)).toBeVisible();
  const property = (await browserApi(page, "/properties")).properties.find(
    (candidate: { id: string; title: string }) =>
      id ? candidate.id === id : candidate.title === title,
  );
  expect(property).toBeTruthy();
  return property;
}

async function invite(page: Page, property: { id: string }, tenantId: string) {
  await page.goto(`/discover?property=${property.id}`);
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: `Profilo ${tenantId.slice(0, 6).toUpperCase()}`,
      exact: true,
    }),
  });
  await expect(card).toBeVisible();
  const response = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/invitations" &&
      response.request().method() === "POST",
  );
  await card
    .getByRole("button", { name: /Invita per questo immobile/ })
    .click();
  const sent = await response;
  expect(sent.status()).toBe(201);
  await expect(
    page.getByText("Invito inviato.", { exact: false }),
  ).toBeVisible();
  return (await sent.json()).id as string;
}

function expectPrivateAddress(invitation: unknown) {
  const value = invitation as {
    property: Record<string, unknown>;
    property_snapshot: Record<string, unknown>;
  };
  for (const property of [value.property, value.property_snapshot]) {
    expect(property).not.toHaveProperty("street");
    expect(property).not.toHaveProperty("street_number");
  }
  const serialized = JSON.stringify(invitation);
  for (const address of [firstAddress, changedAddress]) {
    expect(serialized).not.toContain(address.street);
    expect(serialized).not.toContain(address.street_number);
  }
}

function expectOriginalAddress(invitation: unknown) {
  const value = invitation as {
    property: Record<string, unknown>;
    property_snapshot: Record<string, unknown>;
  };
  for (const property of [value.property, value.property_snapshot])
    expect(property).toMatchObject({
      ...firstAddress,
      address_visibility: "exact",
    });
  expect(JSON.stringify(invitation)).not.toContain(changedAddress.street);
  expect(JSON.stringify(invitation)).not.toContain(
    changedAddress.street_number,
  );
}

async function accept(page: Page, title: string) {
  await page.goto("/invitations");
  const card = propertyCard(page, title);
  await card
    .getByRole("button", {
      name: "Accetta e apri la conversazione",
      exact: true,
    })
    .click();
  await expect(
    card.getByRole("link", { name: /Apri conversazione/ }),
  ).toBeVisible();
}

async function createExactProperty(page: Page, source: any) {
  const title = "Casa sintetica con indirizzo condiviso";
  await page.goto("/properties");
  await page.getByRole("button", { name: /Aggiungi immobile/ }).click();
  await page.getByLabel("Titolo", { exact: true }).fill(title);
  await page.getByLabel("Città", { exact: true }).selectOption(source.city);
  await page.getByLabel("Quartiere o zona").fill(source.area);
  await fillAddress(page, firstAddress);
  await page
    .getByRole("radio", { name: "Indirizzo completo", exact: true })
    .check();
  await page
    .getByLabel("Descrizione", { exact: true })
    .fill(
      "Una casa creata soltanto per verificare la condivisione dell’indirizzo.",
    );
  await page.getByLabel("Costo totale mensile").fill(String(source.rent));
  await page.getByLabel("Disponibile dal").fill(source.available_from);
  await page
    .getByLabel("Permanenza minima (mesi)")
    .fill(String(source.min_months));
  await page
    .getByLabel("Permanenza massima (mesi)")
    .fill(String(source.max_months));
  await page
    .getByLabel("Tipo di contratto offerto", { exact: true })
    .selectOption(source.contract_type);
  await page.getByLabel("Capienza totale").fill(String(source.capacity));
  await page.getByLabel("Superficie").fill(String(source.sqm));
  await page.getByLabel("Numero locali").fill(String(source.rooms));
  await page
    .getByLabel("Arredato", { exact: true })
    .setChecked(source.furnished);
  await page.getByLabel("Dichiaro di essere autorizzato").check();
  const property = await saveProperty(page, title);
  const published = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname ===
        `/api/properties/${property.id}/status` &&
      response.request().method() === "POST",
  );
  await propertyCard(page, title)
    .getByRole("button", { name: "Pubblica", exact: true })
    .click();
  expect((await published).ok()).toBeTruthy();
  await expect(
    propertyCard(page, title).getByRole("button", {
      name: "Metti in pausa",
      exact: true,
    }),
  ).toBeVisible();
  return { ...property, title };
}

test("private addresses stay off pending invitations and exact sharing preserves the accepted address behind the current privacy setting", async ({
  page,
}, testInfo) => {
  const errors = observeErrors(page);
  const tenant = await role(page, "tenant");
  await role(page, "landlord");
  const initial = (await browserApi(page, "/properties")).properties.find(
    (property: { status: string }) => property.status === "published",
  );
  expect(initial).toBeTruthy();
  await editProperty(page, initial.title);
  await expect(
    page.getByRole("radio", { name: "Solo quartiere", exact: true }),
  ).toBeChecked();
  for (const label of ["Via o piazza", "Numero civico"])
    await expect(page.getByLabel(label, { exact: true })).not.toHaveAttribute(
      "required",
      "",
    );
  await fillAddress(page, firstAddress);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await page.locator(".property-address-fields").screenshot({
      path: testInfo.outputPath(`property-address-form-${width}.png`),
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
  const hidden = await saveProperty(page, initial.title, initial.id);
  expect(hidden).toMatchObject({ ...firstAddress, address_visibility: "area" });
  await expect(propertyCard(page, initial.title)).toContainText(
    firstAddress.street,
  );
  await expect(propertyCard(page, initial.title)).toContainText(
    "Mostri solo il quartiere",
  );
  const exported = (await browserApi(page, "/account/export")).properties.find(
    (property: { id: string }) => property.id === initial.id,
  );
  expect(exported).toMatchObject({
    ...firstAddress,
    address_visibility: "area",
  });
  await page.reload();
  await editProperty(page, initial.title);
  await expect(page.getByLabel("Via o piazza", { exact: true })).toHaveValue(
    firstAddress.street,
  );
  await expect(page.getByLabel("Numero civico", { exact: true })).toHaveValue(
    firstAddress.street_number,
  );
  await page.getByRole("button", { name: "Annulla", exact: true }).click();
  const hiddenId = await invite(page, initial, tenant.id);
  await role(page, "tenant");
  await page.goto("/invitations");
  const hiddenCard = propertyCard(page, initial.title);
  await expect(hiddenCard).toBeVisible();
  await expect(hiddenCard).not.toContainText(firstAddress.street);
  await expect(hiddenCard).not.toContainText(firstAddress.street_number);
  const hiddenInvitation = (await browserApi(page, `/invitations/${hiddenId}`))
    .invitation;
  expect(hiddenInvitation.status).toBe("pending");
  expectPrivateAddress(hiddenInvitation);
  expectPrivateAddress((await browserApi(page, "/invitations")).invitations[0]);

  await role(page, "landlord");
  await editProperty(page, initial.title);
  await page
    .getByRole("radio", { name: "Indirizzo completo", exact: true })
    .check();
  for (const label of ["Via o piazza", "Numero civico"])
    await expect(page.getByLabel(label, { exact: true })).toHaveAttribute(
      "required",
      "",
    );
  await saveProperty(page, initial.title, initial.id);
  await role(page, "tenant");
  const cancelled = (await browserApi(page, `/invitations/${hiddenId}`))
    .invitation;
  expect(cancelled.status).toBe("cancelled");
  expectPrivateAddress(cancelled);

  // A cancelled invitation is not reused by this product. A second property
  // provides a genuine new invitation without bypassing that lifecycle rule.
  await role(page, "landlord");
  const exactProperty = await createExactProperty(page, initial);
  const exactId = await invite(page, exactProperty, tenant.id);
  await role(page, "tenant");
  await page.goto("/invitations");
  const exactCard = propertyCard(page, exactProperty.title);
  await expect(exactCard).toContainText(
    `${firstAddress.street} ${firstAddress.street_number}`,
  );
  const exactPending = (await browserApi(page, `/invitations/${exactId}`))
    .invitation;
  expect(exactPending.status).toBe("pending");
  expectOriginalAddress(exactPending);
  await accept(page, exactProperty.title);
  expectOriginalAddress(
    (await browserApi(page, `/invitations/${exactId}`)).invitation,
  );
  await exactCard.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(page.locator(".chat-aside")).toContainText(
    `${firstAddress.street} ${firstAddress.street_number}`,
  );

  await role(page, "landlord");
  await editProperty(page, exactProperty.title);
  await fillAddress(page, changedAddress);
  const changed = await saveProperty(
    page,
    exactProperty.title,
    exactProperty.id,
  );
  expect(changed).toMatchObject({
    ...changedAddress,
    address_visibility: "exact",
  });
  await role(page, "tenant");
  const historical = (await browserApi(page, `/invitations/${exactId}`))
    .invitation;
  expect(historical.status).toBe("accepted");
  expect(historical.property_changed).toBe(true);
  expectOriginalAddress(historical);
  await page.goto(`/conversations/${exactId}`);
  await expect(page.locator(".chat-aside")).toContainText(firstAddress.street);
  await expect(page.locator(".chat-aside")).not.toContainText(
    changedAddress.street,
  );

  await role(page, "landlord");
  await editProperty(page, exactProperty.title);
  await page
    .getByRole("radio", { name: "Solo quartiere", exact: true })
    .check();
  await saveProperty(page, exactProperty.title, exactProperty.id);
  await role(page, "tenant");
  const restricted = (await browserApi(page, `/invitations/${exactId}`))
    .invitation;
  expect(restricted.status).toBe("accepted");
  expectPrivateAddress(restricted);
  await page.goto(`/conversations/${exactId}`);
  await expect(page.locator(".chat-aside")).toBeVisible();
  await expect(page.locator(".chat-aside")).not.toContainText(
    firstAddress.street,
  );
  await expect(page.locator(".chat-aside")).not.toContainText(
    changedAddress.street,
  );

  await role(page, "landlord");
  await editProperty(page, exactProperty.title);
  await page
    .getByRole("radio", { name: "Indirizzo completo", exact: true })
    .check();
  await saveProperty(page, exactProperty.title, exactProperty.id);
  await role(page, "tenant");
  expectOriginalAddress(
    (await browserApi(page, `/invitations/${exactId}`)).invitation,
  );
  await page.goto(`/conversations/${exactId}`);
  await expect(page.locator(".chat-aside")).toContainText(firstAddress.street);
  await expect(page.locator(".chat-aside")).not.toContainText(
    changedAddress.street,
  );
  await page
    .getByRole("button", { name: "Chiudi conversazione", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Conversazione chiusa.");
  const closed = (await browserApi(page, `/invitations/${exactId}`)).invitation;
  expect(closed.status).toBe("closed");
  expectOriginalAddress(closed);
  // Use the invitation screen so blocking does not intentionally request a
  // now-forbidden chat, keeping genuine network failures easy to distinguish.
  await page.goto("/invitations");
  await exactCard
    .getByRole("button", { name: "Blocca contatto", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Contatto bloccato.");
  expectPrivateAddress(
    (await browserApi(page, `/invitations/${exactId}`)).invitation,
  );
  await expect(exactCard).not.toContainText(firstAddress.street);
  await role(page, "landlord");
  expectPrivateAddress(
    (await browserApi(page, `/invitations/${exactId}`)).invitation,
  );
  expect(errors).toEqual([]);
});

test("an accepted invitation created with only the area never gains a street when exact sharing is enabled later", async ({
  page,
}) => {
  const errors = observeErrors(page);
  const tenant = await role(page, "tenant");
  await role(page, "landlord");
  const initial = (await browserApi(page, "/properties")).properties.find(
    (property: { status: string }) => property.status === "published",
  );
  expect(initial).toBeTruthy();
  await editProperty(page, initial.title);
  await fillAddress(page, firstAddress);
  await page
    .getByRole("radio", { name: "Solo quartiere", exact: true })
    .check();
  await saveProperty(page, initial.title, initial.id);
  const id = await invite(page, initial, tenant.id);
  await role(page, "tenant");
  await accept(page, initial.title);
  const accepted = (await browserApi(page, `/invitations/${id}`)).invitation;
  expect(accepted.status).toBe("accepted");
  expectPrivateAddress(accepted);
  await role(page, "landlord");
  await editProperty(page, initial.title);
  await page
    .getByRole("radio", { name: "Indirizzo completo", exact: true })
    .check();
  expect(await saveProperty(page, initial.title, initial.id)).toMatchObject({
    ...firstAddress,
    address_visibility: "exact",
  });
  await role(page, "tenant");
  const unchanged = (await browserApi(page, `/invitations/${id}`)).invitation;
  expect(unchanged.status).toBe("accepted");
  expect(unchanged.property_changed).toBe(true);
  expectPrivateAddress(unchanged);
  await page.goto(`/conversations/${id}`);
  await expect(page.locator(".chat-aside")).toBeVisible();
  await expect(page.locator(".chat-aside")).not.toContainText(
    firstAddress.street,
  );
  await expect(page.locator(".chat-aside")).not.toContainText(
    firstAddress.street_number,
  );
  expect(errors).toEqual([]);
});

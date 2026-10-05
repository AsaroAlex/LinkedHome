import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

async function browserApi(page: Page, path: string) {
  // Chromium sends this preview's Secure cookies on trusted HTTP loopback.
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
  return (await browserApi(page, "/session")).user;
}

async function imageStatus(page: Page, url: string) {
  return page.evaluate(async (url) => {
    const response = await fetch(url, { credentials: "same-origin" });
    return {
      status: response.status,
      contentType: response.headers.get("content-type"),
    };
  }, url);
}

async function loadedImage(page: Page, url: string) {
  const image = page.locator(`img[src="${url}"]`);
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0);
}

test("preview preserves group and individual photos while exposing member names and images only after acceptance", async ({
  page,
}) => {
  const errors: string[] = [];
  const expectedHiddenImages = new Set<string>();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("404"))
      errors.push(message.text());
  });
  page.on("response", (response) => {
    const path = new URL(response.url()).pathname;
    if (
      response.status() >= 400 &&
      !(response.status() === 404 && expectedHiddenImages.has(path))
    )
      errors.push(`${response.status()} ${path}`);
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED")
      errors.push(request.failure()?.errorText || "Request failed");
  });
  const syntheticImage = await sharp({
    create: { width: 320, height: 320, channels: 3, background: "#90b5df" },
  })
    .png()
    .toBuffer();
  const tenant = await role(page, "tenant");
  const initial = await browserApi(page, "/profile");
  expect(initial.profile.occupants).toBe(2);
  await page.goto("/profile");
  const group = page.getByRole("radio", { name: "Una sola foto", exact: true });
  const individual = page.getByRole("radio", {
    name: "Una foto per persona",
    exact: true,
  });
  await expect(group).toBeChecked();
  const groupEditor = page.getByRole("region", {
    name: "Foto del gruppo",
    exact: true,
  });
  await groupEditor
    .getByLabel("Scegli una foto", { exact: true })
    .setInputFiles({
      name: "gruppo-sintetico.png",
      mimeType: "image/png",
      buffer: syntheticImage,
    });
  await groupEditor
    .getByRole("button", { name: "Salva foto", exact: true })
    .click();
  await expect(groupEditor.getByRole("status")).toHaveText("Foto salvata.");
  const primaryPhoto = (await browserApi(page, "/profile")).photo;
  await individual.click();
  await expect(individual).toBeChecked();
  const ownEditor = page.getByRole("region", {
    name: "La tua foto",
    exact: true,
  });
  await expect(ownEditor.locator("img")).toHaveAttribute(
    "src",
    primaryPhoto.url,
  );
  await expect(
    page.getByText("La foto principale è stata mantenuta", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Nome della persona", { exact: true }).fill("Alessio");
  await page
    .getByRole("button", { name: "Aggiungi persona", exact: true })
    .click();
  const memberCard = page.getByRole("region", { name: "Alessio", exact: true });
  await expect(memberCard).toBeVisible();
  await memberCard
    .getByLabel("Scegli una foto", { exact: true })
    .setInputFiles({
      name: "alessio-sintetico.png",
      mimeType: "image/png",
      buffer: syntheticImage,
    });
  await memberCard
    .getByRole("button", { name: "Salva foto", exact: true })
    .click();
  await expect(memberCard.getByRole("status")).toHaveText("Foto salvata.");
  const household = (await browserApi(page, "/profile")).household;
  expect(household.mode).toBe("individual");
  expect(household.members).toHaveLength(1);
  const member = household.members[0];
  expect(member.display_name).toBe("Alessio");
  expect(member.photo.url).toMatch(/^\/api\/profile-member-photos\//);
  expect((await browserApi(page, "/profile")).profile).toEqual(initial.profile);
  await page.reload();
  await expect(individual).toBeChecked();
  await loadedImage(page, member.photo.url);
  await page.setViewportSize({ width: 320, height: 844 });
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
    ).violations.map((item) => item.id),
  ).toEqual([]);
  await mkdir(".local/household-photos", { recursive: true });
  await page.screenshot({
    path: ".local/household-photos/preview-individual-320.png",
    fullPage: true,
  });

  await role(page, "landlord");
  const property = (await browserApi(page, "/properties")).properties.find(
    (candidate: { status: string; city: string }) =>
      candidate.status === "published" &&
      candidate.city === initial.profile.city,
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
  await expect(card).not.toContainText("Alessio");
  await expect(card).not.toContainText(tenant.display_name);
  await expect(card.locator("img")).toHaveCount(0);
  const publicProfile = (await browserApi(page, `/discover/${property.id}`))
    .profiles[0];
  for (const field of ["household", "members", "tenant_household", "photo"])
    expect(publicProfile).not.toHaveProperty(field);
  expect(JSON.stringify(publicProfile)).not.toContain(member.photo.url);
  expect(JSON.stringify(publicProfile)).not.toContain("Alessio");
  await card
    .getByRole("button", { name: /Invita per questo immobile/ })
    .click();
  await expect(
    page.getByText("Invito inviato.", { exact: false }),
  ).toBeVisible();
  const pending = (await browserApi(page, "/invitations")).invitations[0];
  expect(pending.tenant_household).toBeNull();
  expect(pending.other_photo).toBeNull();
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
  await role(page, "landlord");
  await page.goto("/invitations");
  await expect(
    page.getByRole("heading", { name: "Chi abiterà in casa", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Alessio", { exact: true })).toBeVisible();
  await loadedImage(page, member.photo.url);
  const accepted = (await browserApi(page, `/invitations/${pending.id}`))
    .invitation;
  expect(accepted.tenant_household).toEqual(household);
  await page.getByRole("link", { name: /Apri conversazione/ }).click();
  await expect(
    page.getByRole("heading", { name: "Chi abiterà in casa", exact: true }),
  ).toBeVisible();
  await loadedImage(page, member.photo.url);

  await role(page, "tenant");
  await page.goto("/profile");
  await group.click();
  await expect(group).toBeChecked();
  expect((await browserApi(page, "/profile")).household.members).toEqual(
    household.members,
  );
  await role(page, "landlord");
  await page.goto("/invitations");
  await expect(
    page.getByRole("heading", { name: "Chi abiterà in casa", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("Alessio", { exact: true })).toHaveCount(0);
  expect(
    (await browserApi(page, `/invitations/${pending.id}`)).invitation
      .tenant_household,
  ).toEqual({ mode: "group", members: [] });
  expectedHiddenImages.add(member.photo.url);
  expect((await imageStatus(page, member.photo.url)).status).toBe(404);
  expect((await imageStatus(page, primaryPhoto.url)).status).toBe(200);

  await role(page, "tenant");
  await page.goto("/profile");
  await individual.click();
  await expect(individual).toBeChecked();
  await loadedImage(page, member.photo.url);
  await role(page, "landlord");
  await page.goto("/invitations");
  await expect(page.getByText("Alessio", { exact: true })).toBeVisible();
  await loadedImage(page, member.photo.url);
  expect(await imageStatus(page, member.photo.url)).toEqual({
    status: 200,
    contentType: "image/webp",
  });

  await role(page, "tenant");
  await page.goto("/profile");
  await memberCard
    .getByRole("button", { name: "Rimuovi foto", exact: true })
    .click();
  await expect(memberCard.getByRole("status")).toHaveText("Foto rimossa.");
  await memberCard
    .getByRole("button", { name: "Rimuovi persona", exact: true })
    .click();
  await expect(memberCard).toHaveCount(0);
  await ownEditor
    .getByRole("button", { name: "Rimuovi foto", exact: true })
    .click();
  await expect(ownEditor.getByRole("status")).toHaveText("Foto rimossa.");
  await group.click();
  await expect(group).toBeChecked();
  const cleaned = await browserApi(page, "/profile");
  expect(cleaned.photo).toBeNull();
  expect(cleaned.household.mode).toBe("group");
  expect(cleaned.household.members).toEqual([]);
  expect(cleaned.profile).toEqual(initial.profile);
  expect(errors).toEqual([]);
});

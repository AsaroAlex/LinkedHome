import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

type Photo = { id: string; url: string; width: number; height: number };
type Upload = {
  key: string | undefined;
  contentType: string | undefined;
  filename: string | undefined;
  hasPhotoPart: boolean;
};

const user = {
  id: "synthetic-profile-photo-tenant",
  display_name: "Persona di esempio",
  email: "profile-photo@example.test",
  role: "tenant",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const profile = {
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
const savedPhoto: Photo = {
  id: "991f8b29-8a1b-492c-8ae4-fb2b512e6f5b",
  url: "/api/profile-photos/991f8b29-8a1b-492c-8ae4-fb2b512e6f5b",
  width: 480,
  height: 480,
};
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function syntheticImage(format: "png" | "jpeg" | "webp" = "png") {
  return sharp({
    create: {
      width: 480,
      height: 480,
      channels: 3,
      background: { r: 169, g: 203, b: 237 },
    },
  })
    [format]()
    .toBuffer();
}

async function fixtures(page: Page, photo: Photo | null = null) {
  const image = await syntheticImage("webp");
  const state = {
    photo,
    uploads: [] as Upload[],
    deletions: 0,
    preferenceWrites: [] as unknown[],
    statusWrites: [] as unknown[],
    failNextUpload: false,
    uploadGate: null as Promise<void> | null,
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
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/profile-photos/") && request.method() === "GET")
      return route.fulfill({ contentType: "image/webp", body: image });
    if (path === "/api/profile/photo" && request.method() === "POST") {
      const body = request.postDataBuffer()?.toString("latin1") ?? "";
      state.uploads.push({
        key: request.headers()["idempotency-key"],
        contentType: request.headers()["content-type"],
        filename: body.match(/filename="([^"]+)"/)?.[1],
        hasPhotoPart: body.includes('name="photo"'),
      });
      if (state.uploadGate) await state.uploadGate;
      if (state.failNextUpload) {
        state.failNextUpload = false;
        return route.fulfill({
          status: 503,
          json: {
            error: "Caricamento temporaneamente non disponibile. Riprova.",
          },
        });
      }
      const id = randomUUID();
      state.photo = {
        id,
        url: `/api/profile-photos/${id}`,
        width: 480,
        height: 480,
      };
      return route.fulfill({ status: 201, json: { photo: state.photo } });
    }
    if (path === "/api/profile/photo" && request.method() === "DELETE") {
      state.deletions++;
      state.photo = null;
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile" && request.method() === "PUT") {
      state.preferenceWrites.push(request.postDataJSON());
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile/status" && request.method() === "POST") {
      state.statusWrites.push(request.postDataJSON());
      return route.fulfill({ json: { ok: true } });
    }
    const responses: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user },
      "/api/profile": { profile, photo: state.photo },
      "/api/verification": { email_verified: true, checks: [] },
    };
    return route.fulfill({
      status: request.method() === "GET" && path in responses ? 200 : 404,
      json: responses[path] ?? { message: "Unexpected mocked API request." },
    });
  });
  return state;
}

function editor(page: Page) {
  return page.getByRole("region", { name: "Foto del profilo", exact: true });
}

async function savedImage(page: Page, photo: Photo) {
  const image = editor(page).locator(`img[src="${photo.url}"]`);
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0);
  return image;
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

test("profile photo uploads explicitly, preserves preference drafts and persists through replacement and removal", async ({
  page,
}) => {
  const state = await fixtures(page);
  const png = await syntheticImage();
  await page.goto("/profile");
  const photoEditor = editor(page);
  await expect(
    photoEditor.getByRole("heading", { name: "Foto del profilo", exact: true }),
  ).toBeVisible();
  await expect(photoEditor).toContainText(
    "La foto sarà visibile ai proprietari con cui apri una conversazione.",
  );
  const picker = photoEditor.getByLabel("Scegli una foto", { exact: true });
  await expect(picker).toHaveAttribute(
    "accept",
    "image/jpeg,image/png,image/webp",
  );
  const budget = page.getByLabel(
    "Budget totale mensile (€), spese obbligatorie incluse",
    { exact: true },
  );
  await budget.fill("1250");
  await picker.setInputFiles({
    name: "foto-sintetica.png",
    mimeType: "image/png",
    buffer: png,
  });
  await expect(photoEditor.locator('img[src^="blob:"]')).toBeVisible();
  expect(state.uploads).toEqual([]);
  await expect(page.locator(".profile-summary")).toContainText(
    "Fino a €1100 al mese",
  );
  let release!: () => void;
  state.uploadGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await photoEditor
    .getByRole("button", { name: "Salva foto", exact: true })
    .click();
  await expect(
    photoEditor.getByRole("button", { name: "Caricamento…", exact: true }),
  ).toBeDisabled();
  await expect(photoEditor.locator('input[type="file"]')).toBeDisabled();
  release();
  state.uploadGate = null;
  await expect(photoEditor.getByRole("status")).toHaveText("Foto salvata.");
  await expect.poll(() => state.uploads).toHaveLength(1);
  expect(state.uploads[0]).toMatchObject({
    filename: "foto-sintetica.png",
    hasPhotoPart: true,
  });
  expect(state.uploads[0].contentType).toMatch(
    /^multipart\/form-data; boundary=/,
  );
  expect(state.uploads[0].key).toMatch(uuid);
  const firstPhoto = state.photo!;
  await savedImage(page, firstPhoto);
  await expect(budget).toHaveValue("1250");
  await expect(
    page.getByText("Modifiche non salvate.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".profile-summary")).toContainText(
    "Fino a €1100 al mese",
  );
  expect(state.preferenceWrites).toEqual([]);
  expect(state.statusWrites).toEqual([]);
  await accessibleOnMobile(page);
  await mkdir(".local/profile-photo", { recursive: true });
  await page.screenshot({
    path: ".local/profile-photo/editor-draft-320.png",
    fullPage: true,
  });
  await page.reload();
  await savedImage(page, firstPhoto);
  await photoEditor.getByLabel("Cambia foto", { exact: true }).setInputFiles({
    name: "foto-sintetica-nuova.jpg",
    mimeType: "image/jpeg",
    buffer: await syntheticImage("jpeg"),
  });
  expect(state.uploads).toHaveLength(1);
  expect(state.photo).toEqual(firstPhoto);
  await photoEditor
    .getByRole("button", { name: "Salva foto", exact: true })
    .click();
  await expect.poll(() => state.uploads).toHaveLength(2);
  expect(state.uploads[1].key).toMatch(uuid);
  expect(state.uploads[1].key).not.toBe(state.uploads[0].key);
  await expect.poll(() => state.photo?.id).not.toBe(firstPhoto.id);
  const replacement = state.photo!;
  await savedImage(page, replacement);
  await page.reload();
  await savedImage(page, replacement);
  await photoEditor
    .getByRole("button", { name: "Rimuovi foto", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(photoEditor.getByRole("status")).toHaveText("Foto rimossa.");
  expect(state.deletions).toBe(1);
  await expect(photoEditor.locator("img")).toHaveCount(0);
  await expect(
    photoEditor.getByLabel("Scegli una foto", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(photoEditor.locator("img")).toHaveCount(0);
  expect(state.photo).toBeNull();
  expect(state.preferenceWrites).toEqual([]);
  expect(state.statusWrites).toEqual([]);
  expect(state.browserErrors).toEqual([]);
  expect(state.consoleErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("failed profile-photo upload keeps its preview and retries with the same idempotency key", async ({
  page,
}) => {
  const state = await fixtures(page, savedPhoto);
  state.failNextUpload = true;
  await page.goto("/profile");
  const photoEditor = editor(page);
  await photoEditor.getByLabel("Cambia foto", { exact: true }).setInputFiles({
    name: "foto-da-riprovare.webp",
    mimeType: "image/webp",
    buffer: await syntheticImage("webp"),
  });
  const preview = photoEditor.locator('img[src^="blob:"]');
  await expect(preview).toBeVisible();
  const previewUrl = await preview.getAttribute("src");
  await photoEditor
    .getByRole("button", { name: "Salva foto", exact: true })
    .click();
  await expect(photoEditor.getByRole("alert")).toContainText(
    "Caricamento temporaneamente non disponibile. Riprova.",
  );
  expect(state.photo).toEqual(savedPhoto);
  expect(state.uploads).toHaveLength(1);
  expect(state.uploads[0].key).toMatch(uuid);
  await expect(preview).toHaveAttribute("src", previewUrl!);
  await expect(
    photoEditor.getByRole("button", { name: "Salva foto", exact: true }),
  ).toBeEnabled();
  await accessibleOnMobile(page);
  await photoEditor
    .getByRole("button", { name: "Salva foto", exact: true })
    .click();
  await expect(photoEditor.getByRole("status")).toHaveText("Foto salvata.");
  expect(state.uploads).toHaveLength(2);
  expect(state.uploads[1].key).toBe(state.uploads[0].key);
  expect(state.uploads[1].filename).toBe(state.uploads[0].filename);
  await savedImage(page, state.photo!);
  await expect(photoEditor.getByRole("alert")).toHaveCount(0);
  expect(state.preferenceWrites).toEqual([]);
  expect(state.statusWrites).toEqual([]);
  expect(state.browserErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
  expect(
    state.consoleErrors.filter((message) => !message.includes("503")),
  ).toEqual([]);
});

test("invalid or cancelled photo choices preserve the existing photo without writing preferences", async ({
  page,
}) => {
  const state = await fixtures(page, savedPhoto);
  await page.goto("/profile");
  const photoEditor = editor(page);
  const picker = photoEditor.getByLabel("Cambia foto", { exact: true });
  await savedImage(page, savedPhoto);
  await picker.setInputFiles({
    name: "documento.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Synthetic invalid image format."),
  });
  await expect(photoEditor.getByRole("alert")).toContainText(/JPG|JPEG/);
  await savedImage(page, savedPhoto);
  await expect(
    photoEditor.getByRole("button", { name: "Salva foto", exact: true }),
  ).toHaveCount(0);
  await picker.setInputFiles({
    name: "foto-troppo-grande.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(photoEditor.getByRole("alert")).toContainText("5 MB");
  await savedImage(page, savedPhoto);
  expect(state.photo).toEqual(savedPhoto);
  expect(state.uploads).toEqual([]);
  await picker.setInputFiles({
    name: "foto-da-annullare.png",
    mimeType: "image/png",
    buffer: await syntheticImage(),
  });
  await expect(photoEditor.locator('img[src^="blob:"]')).toBeVisible();
  await expect(photoEditor.getByRole("alert")).toHaveCount(0);
  const cancel = photoEditor.getByRole("button", {
    name: "Annulla",
    exact: true,
  });
  await cancel.focus();
  await page.keyboard.press("Enter");
  await expect(photoEditor.locator('img[src^="blob:"]')).toHaveCount(0);
  await savedImage(page, savedPhoto);
  await expect(
    photoEditor.getByRole("button", { name: "Salva foto", exact: true }),
  ).toHaveCount(0);
  await accessibleOnMobile(page);
  expect(state.uploads).toEqual([]);
  expect(state.deletions).toBe(0);
  expect(state.preferenceWrites).toEqual([]);
  expect(state.statusWrites).toEqual([]);
  expect(state.browserErrors).toEqual([]);
  expect(state.consoleErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

type Photo = { id: string; url: string; width: number; height: number };
type Member = { id: string; display_name: string; photo: Photo | null };
type Upload = { memberId: string; key: string | undefined };
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const user = {
  id: "synthetic-household-tenant",
  display_name: "Persona di esempio",
  email: "household@example.test",
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
const primaryPhoto: Photo = {
  id: "e973eea1-14c2-4785-9dd3-5cb73e6bfe92",
  url: "/api/profile-photos/e973eea1-14c2-4785-9dd3-5cb73e6bfe92",
  width: 320,
  height: 320,
};
const existingMember: Member = {
  id: "ef1cc64a-4d55-42a1-9b42-e0ad5bdf6295",
  display_name: "Alessio",
  photo: {
    id: "a542d643-96af-47fa-ae9a-7d78584eb8b0",
    url: "/api/profile-member-photos/a542d643-96af-47fa-ae9a-7d78584eb8b0",
    width: 320,
    height: 320,
  },
};

async function fixtures(
  page: Page,
  mode: "group" | "individual" = "group",
  members: Member[] = [],
) {
  const image = await sharp({
    create: { width: 320, height: 320, channels: 3, background: "#89b6df" },
  })
    .png()
    .toBuffer();
  const state = {
    mode,
    members: structuredClone(members),
    primaryPhoto,
    modeWrites: [] as string[],
    adds: [] as { id: string; display_name: string }[],
    renames: [] as string[],
    deletions: [] as string[],
    uploads: [] as Upload[],
    preferenceWrites: [] as unknown[],
    failModeNext: false,
    failAddNext: false,
    failPhotoNext: false,
    renameGate: null as Promise<void> | null,
    pageErrors: [] as string[],
    consoleErrors: [] as string[],
    failedRequests: [] as string[],
  };
  page.on("pageerror", (error) => state.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") state.consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED")
      state.failedRequests.push(
        `${new URL(request.url()).pathname}: ${request.failure()?.errorText}`,
      );
  });
  await page.route("**/api/**", async (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname;
    if (
      request.method() === "GET" &&
      (/^\/api\/profile-photos\//.test(path) ||
        /^\/api\/profile-member-photos\//.test(path))
    )
      return route.fulfill({ body: image, contentType: "image/png" });
    if (path === "/api/profile/household" && request.method() === "PUT") {
      const chosen = request.postDataJSON().mode as "group" | "individual";
      state.modeWrites.push(chosen);
      if (state.failModeNext) {
        state.failModeNext = false;
        return route.fulfill({
          status: 503,
          json: { error: "Modalità non salvata. Riprova." },
        });
      }
      state.mode = chosen;
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile/members" && request.method() === "POST") {
      const input = request.postDataJSON() as {
        id: string;
        display_name: string;
      };
      state.adds.push(input);
      if (state.failAddNext) {
        state.failAddNext = false;
        return route.fulfill({
          status: 503,
          json: { error: "Persona non aggiunta. Riprova." },
        });
      }
      let member = state.members.find((member) => member.id === input.id);
      if (!member) {
        member = { ...input, photo: null };
        state.members.push(member);
      }
      return route.fulfill({ status: 201, json: { member } });
    }
    const photoMatch = path.match(/^\/api\/profile\/members\/([^/]+)\/photo$/);
    if (photoMatch && request.method() === "POST") {
      state.uploads.push({
        memberId: photoMatch[1],
        key: request.headers()["idempotency-key"],
      });
      if (state.failPhotoNext) {
        state.failPhotoNext = false;
        return route.fulfill({
          status: 503,
          json: { error: "Foto non salvata. Riprova." },
        });
      }
      const id = request.headers()["idempotency-key"] || randomUUID();
      const photo = {
        id,
        url: `/api/profile-member-photos/${id}`,
        width: 320,
        height: 320,
      };
      state.members.find((member) => member.id === photoMatch[1])!.photo =
        photo;
      return route.fulfill({ status: 201, json: { photo } });
    }
    const memberMatch = path.match(/^\/api\/profile\/members\/([^/]+)$/);
    if (memberMatch && request.method() === "PUT") {
      if (state.renameGate) await state.renameGate;
      const member = state.members.find(
        (member) => member.id === memberMatch[1],
      )!;
      member.display_name = request.postDataJSON().display_name;
      state.renames.push(member.display_name);
      return route.fulfill({ json: { member } });
    }
    if (memberMatch && request.method() === "DELETE") {
      state.deletions.push(memberMatch[1]);
      state.members = state.members.filter(
        (member) => member.id !== memberMatch[1],
      );
      return route.fulfill({ json: { ok: true } });
    }
    if (path === "/api/profile" && request.method() === "PUT") {
      state.preferenceWrites.push(request.postDataJSON());
      return route.fulfill({ json: { ok: true } });
    }
    const data: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user },
      "/api/profile": {
        profile,
        photo: state.primaryPhoto,
        household: { mode: state.mode, members: state.members },
      },
      "/api/verification": { email_verified: true, checks: [] },
    };
    return route.fulfill({
      status: path in data ? 200 : 404,
      json: data[path] ?? { error: "Unexpected mocked API request." },
    });
  });
  return { state, image };
}

function memberCard(page: Page, name = "Alessio") {
  return page.getByRole("region", { name, exact: true });
}
async function accessible(page: Page) {
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
    ).violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test("individual photos preserve the main photo and preference drafts across adding, renaming and switching modes", async ({
  page,
}) => {
  const { state, image } = await fixtures(page);
  await page.goto("/profile");
  const group = page.getByRole("radio", { name: "Una sola foto", exact: true });
  const individual = page.getByRole("radio", {
    name: "Una foto per persona",
    exact: true,
  });
  const budget = page.getByLabel(
    "Budget totale mensile (€), spese obbligatorie incluse",
    { exact: true },
  );
  const about = page.getByLabel("Presentati al proprietario", { exact: true });
  await expect(group).toBeChecked();
  await budget.fill("1250");
  await about.fill("Una presentazione ancora da salvare.");
  await individual.click();
  await expect.poll(() => state.mode).toBe("individual");
  const ownPhoto = page.getByRole("region", {
    name: "La tua foto",
    exact: true,
  });
  await expect(
    ownPhoto.locator(`img[src="${primaryPhoto.url}"]`),
  ).toBeVisible();
  await expect(
    page.getByText("La foto principale è stata mantenuta", { exact: false }),
  ).toBeVisible();
  const name = page.getByLabel("Nome della persona", { exact: true });
  await name.fill("Alessio");
  expect(state.adds).toEqual([]);
  await page
    .getByRole("button", { name: "Aggiungi persona", exact: true })
    .click();
  await expect(memberCard(page)).toBeVisible();
  expect(state.adds[0].id).toMatch(uuid);
  await memberCard(page)
    .getByLabel("Scegli una foto", { exact: true })
    .setInputFiles({
      name: "alessio-sintetico.png",
      mimeType: "image/png",
      buffer: image,
    });
  await expect(group).toBeDisabled();
  await expect(individual).toBeDisabled();
  await expect(
    memberCard(page).getByRole("button", {
      name: "Rimuovi persona",
      exact: true,
    }),
  ).toBeDisabled();
  await memberCard(page)
    .getByRole("button", { name: "Salva foto", exact: true })
    .click();
  await expect(memberCard(page).getByRole("status")).toHaveText(
    "Foto salvata.",
  );
  expect(state.uploads[0].key).toMatch(uuid);
  const photo = state.members[0].photo!;
  await expect(
    memberCard(page).locator(`img[src="${photo.url}"]`),
  ).toBeVisible();
  const memberName = memberCard(page).getByLabel("Nome da mostrare", {
    exact: true,
  });
  await memberName.fill("Alessio Draft");
  await expect(group).toBeDisabled();
  await expect(individual).toBeDisabled();
  await memberCard(page)
    .getByRole("button", { name: "Annulla modifiche al nome", exact: true })
    .click();
  await expect(memberName).toHaveValue("Alessio");
  await expect(group).toBeEnabled();
  await expect(individual).toBeEnabled();
  expect(state.renames).toEqual([]);
  await memberName.fill("Alessio Demo");
  let finishRename!: () => void;
  state.renameGate = new Promise<void>((resolve) => {
    finishRename = resolve;
  });
  await memberCard(page)
    .getByRole("button", { name: "Salva nome", exact: true })
    .click();
  await expect(group).toBeDisabled();
  await expect(individual).toBeDisabled();
  finishRename();
  state.renameGate = null;
  await expect(memberCard(page, "Alessio Demo")).toBeVisible();
  await expect(group).toBeEnabled();
  await group.click();
  await expect.poll(() => state.mode).toBe("group");
  await expect(memberCard(page, "Alessio Demo")).toHaveCount(0);
  expect(state.members).toHaveLength(1);
  await expect(
    page
      .getByRole("region", { name: "Foto del gruppo", exact: true })
      .locator(`img[src="${primaryPhoto.url}"]`),
  ).toBeVisible();
  await individual.click();
  await expect(
    memberCard(page, "Alessio Demo").locator(`img[src="${photo.url}"]`),
  ).toBeVisible();
  await expect(budget).toHaveValue("1250");
  await expect(about).toHaveValue("Una presentazione ancora da salvare.");
  await expect(page.locator(".profile-summary")).toContainText(
    "Fino a €1100 al mese",
  );
  expect(state.preferenceWrites).toEqual([]);
  await accessible(page);
  await mkdir(".local/household-photos", { recursive: true });
  await page.screenshot({
    path: ".local/household-photos/individual-320.png",
    fullPage: true,
  });
  await page.reload();
  await expect(individual).toBeChecked();
  await expect(
    memberCard(page, "Alessio Demo").locator(`img[src="${photo.url}"]`),
  ).toBeVisible();
  await memberCard(page, "Alessio Demo")
    .getByRole("button", { name: "Rimuovi persona", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(memberCard(page, "Alessio Demo")).toHaveCount(0);
  expect(state.deletions).toEqual([state.adds[0].id]);
  expect(state.preferenceWrites).toEqual([]);
  expect(state.pageErrors).toEqual([]);
  expect(state.consoleErrors).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("a failed member-photo upload preserves its preview and reuses its key on retry", async ({
  page,
}) => {
  const { state, image } = await fixtures(page, "individual", [existingMember]);
  state.failPhotoNext = true;
  await page.goto("/profile");
  const card = memberCard(page);
  await card.getByLabel("Cambia foto", { exact: true }).setInputFiles({
    name: "alessio-da-riprovare.png",
    mimeType: "image/png",
    buffer: image,
  });
  const preview = card.locator('img[src^="blob:"]');
  const previewUrl = await preview.getAttribute("src");
  await card.getByRole("button", { name: "Salva foto", exact: true }).click();
  await expect(card.getByRole("alert")).toHaveText(
    "Foto non salvata. Riprova.",
  );
  expect(state.members[0].photo).toEqual(existingMember.photo);
  await expect(preview).toHaveAttribute("src", previewUrl!);
  await expect(
    page.getByRole("radio", { name: "Una sola foto", exact: true }),
  ).toBeDisabled();
  await card.getByRole("button", { name: "Salva foto", exact: true }).click();
  await expect(card.getByRole("status")).toHaveText("Foto salvata.");
  expect(state.uploads).toHaveLength(2);
  expect(state.uploads[0].key).toMatch(uuid);
  expect(state.uploads[1]).toEqual(state.uploads[0]);
  await expect(
    page.getByRole("radio", { name: "Una sola foto", exact: true }),
  ).toBeEnabled();
  await card.getByLabel("Cambia foto", { exact: true }).setInputFiles({
    name: "foto-annullata.png",
    mimeType: "image/png",
    buffer: image,
  });
  await card.getByRole("button", { name: "Annulla", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Una sola foto", exact: true }),
  ).toBeEnabled();
  expect(state.uploads).toHaveLength(2);
  await accessible(page);
  expect(state.preferenceWrites).toEqual([]);
  expect(state.pageErrors).toEqual([]);
  expect(
    state.consoleErrors.filter((message) => !message.includes("503")),
  ).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

test("failed mode and member creation remain recoverable without duplicate people", async ({
  page,
}) => {
  const { state } = await fixtures(page);
  state.failModeNext = true;
  await page.goto("/profile");
  const group = page.getByRole("radio", { name: "Una sola foto", exact: true });
  const individual = page.getByRole("radio", {
    name: "Una foto per persona",
    exact: true,
  });
  await individual.click();
  await expect(page.getByRole("alert")).toContainText(
    "Modalità non salvata. Riprova.",
  );
  await expect(group).toBeChecked();
  expect(state.mode).toBe("group");
  await individual.click();
  await expect(individual).toBeChecked();
  const name = page.getByLabel("Nome della persona", { exact: true });
  await expect(name).toHaveAttribute("maxlength", "80");
  await name.fill("");
  await page
    .getByRole("button", { name: "Aggiungi persona", exact: true })
    .click();
  expect(state.adds).toEqual([]);
  state.failAddNext = true;
  await name.fill("Alessio");
  await page
    .getByRole("button", { name: "Aggiungi persona", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Persona non aggiunta. Riprova.",
  );
  await expect(name).toHaveValue("Alessio");
  expect(state.adds).toHaveLength(1);
  await page
    .getByRole("button", { name: "Aggiungi persona", exact: true })
    .click();
  await expect(memberCard(page)).toBeVisible();
  expect(state.adds).toHaveLength(2);
  expect(state.adds[0].id).toMatch(uuid);
  expect(state.adds[1]).toEqual(state.adds[0]);
  expect(state.members).toHaveLength(1);
  expect(state.preferenceWrites).toEqual([]);
  await accessible(page);
  expect(state.pageErrors).toEqual([]);
  expect(
    state.consoleErrors.filter((message) => !message.includes("503")),
  ).toEqual([]);
  expect(state.failedRequests).toEqual([]);
});

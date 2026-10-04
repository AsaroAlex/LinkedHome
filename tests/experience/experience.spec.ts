import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

const user = {
  id: "experience-tenant",
  display_name: "Ada di esempio",
  email: "ada@example.test",
  role: "tenant",
  email_verified: true,
  suspended: false,
  staff_role: null,
};
const property = {
  id: "example-property",
  title: "Bilocale di esempio",
  city: "Bologna",
  area: "Centro",
  rent: 850,
  available_from: "2027-01-01",
  min_months: 6,
  max_months: 36,
  capacity: 2,
  sqm: 68,
  rooms: 3,
  furnished: true,
  description: "Una casa di esempio per le verifiche dell’interfaccia.",
  status: "published",
  published_at: new Date().toISOString(),
  authority_attested: true,
};

async function fixtures(page: Page, currentUser: typeof user | null = null) {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data: Record<string, unknown> = {
      "/api/config": { environment: "local", mailTransport: "local" },
      "/api/session": { user: currentUser },
      "/api/dashboard": { pending: 0, accepted: 0 },
      "/api/profile": { profile: null },
      "/api/properties": { properties: [] },
      "/api/invitations": { invitations: [] },
      "/api/verification": { email_verified: false, checks: [] },
      "/api/income": {
        provider_available: false,
        demo_available: false,
        status: "not_requested",
        attestation: null,
        history: [],
        shares: [],
      },
    };
    return route.fulfill({ json: data[path] ?? { ok: true } });
  });
}

async function accessible(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
}

test("role guide leads to the right signup and FAQ explains the commitment", async ({
  page,
}) => {
  await fixtures(page);
  await page.goto("/");
  const guide = page.getByRole("region", {
    name: "Dalle preferenze al primo messaggio.",
  });
  await expect(
    guide.getByRole("heading", { name: "Indica cosa cerchi" }),
  ).toBeVisible();
  await guide.getByRole("button", { name: "Voglio affittare" }).click();
  await expect(
    guide.getByRole("button", { name: "Voglio affittare" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    guide.getByRole("heading", { name: "Trova profili compatibili" }),
  ).toBeVisible();
  await expect(
    guide.getByRole("link", { name: "Aggiungi il tuo immobile" }),
  ).toHaveAttribute("href", "/register?role=landlord");
  await page
    .getByText("Accettare un invito mi impegna ad affittare?", { exact: true })
    .click();
  await expect(
    page.getByText("L’invito non è una prenotazione o un contratto.", {
      exact: false,
    }),
  ).toBeVisible();
  await accessible(page);
  await mkdir("test-results/experience-visual", { recursive: true });
  await page.screenshot({
    path: "test-results/experience-visual/landing-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await accessible(page);
  await page.screenshot({
    path: "test-results/experience-visual/landing-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await accessible(page);
  await guide.getByRole("link", { name: "Aggiungi il tuo immobile" }).click();
  await expect(
    page.getByRole("radio", { name: /Offro un immobile/ }),
  ).toBeChecked();
});

test("signup preserves selected role and reveals a password without submitting", async ({
  page,
}) => {
  await fixtures(page);
  let payload: Record<string, string> | null = null;
  await page.route("**/api/auth/register", (route) => {
    payload = route.request().postDataJSON();
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("/register?role=landlord");
  await expect(
    page.getByRole("radio", { name: /Offro un immobile/ }),
  ).toBeChecked();
  await page.getByRole("radio", { name: /Entrambe le cose/ }).check();
  await page.getByLabel("Come vuoi essere chiamato?").fill("Ada");
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("Synthetic-UI-passphrase");
  await page.getByRole("button", { name: "Mostra password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  expect(payload).toBeNull();
  await page.getByRole("button", { name: "Nascondi password" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.setViewportSize({ width: 320, height: 740 });
  await accessible(page);
  await page.getByRole("button", { name: "Crea account" }).click();
  await expect
    .poll(() => payload)
    .toMatchObject({ role: "both", password: "Synthetic-UI-passphrase" });
});

test("tenant progress follows verification and deliberate profile publication", async ({
  page,
}) => {
  let verified = false;
  let published = false;
  let propertyRequests = 0;
  await fixtures(page);
  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { user: { ...user, email_verified: verified } } }),
  );
  await page.route("**/api/profile", (route) =>
    route.fulfill({
      json: { profile: published ? { status: "published" } : null },
    }),
  );
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/properties")
      propertyRequests++;
  });
  await page.goto("/dashboard");
  const progress = page.getByRole("region", { name: "Completa i primi passi" });
  await expect(
    progress.getByRole("link", { name: "Conferma email" }),
  ).toHaveAttribute("href", "/verification");
  verified = true;
  await page.reload();
  await expect(
    progress.getByRole("link", { name: "Prepara il tuo profilo" }),
  ).toHaveAttribute("href", "/profile");
  await expect(
    progress.getByRole("img", { name: "Completato", exact: true }),
  ).toHaveCount(1);
  await expect(
    progress.getByRole("img", { name: "Da completare", exact: true }),
  ).toHaveCount(1);
  published = true;
  await page.reload();
  const complete = page.getByRole("region", { name: "È tutto pronto" });
  await expect(
    complete.getByRole("link", { name: "Controlla gli inviti" }),
  ).toHaveAttribute("href", "/invitations");
  expect(propertyRequests).toBe(0);
  await page.setViewportSize({ width: 320, height: 740 });
  const marker = complete
    .getByRole("img", { name: "Completato", exact: true })
    .first();
  const markerBox = await marker.boundingBox();
  const iconBox = await marker.locator("svg").boundingBox();
  expect(markerBox).not.toBeNull();
  expect(iconBox).not.toBeNull();
  expect(
    Math.abs(
      markerBox!.x + markerBox!.width / 2 - iconBox!.x - iconBox!.width / 2,
    ),
  ).toBeLessThan(0.5);
  expect(
    Math.abs(
      markerBox!.y + markerBox!.height / 2 - iconBox!.y - iconBox!.height / 2,
    ),
  ).toBeLessThan(0.5);
  await accessible(page);
});

test("landlord progress requires current property availability", async ({
  page,
}) => {
  let fresh = false;
  let profileRequests = 0;
  await fixtures(page, { ...user, role: "landlord" });
  await page.route("**/api/properties", (route) =>
    route.fulfill({
      json: {
        properties: [
          {
            ...property,
            published_at: fresh
              ? new Date().toISOString()
              : "2000-01-01T00:00:00Z",
          },
        ],
      },
    }),
  );
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/profile") profileRequests++;
  });
  await page.goto("/dashboard");
  await expect(
    page
      .getByRole("region", { name: "Completa i primi passi" })
      .getByRole("link", { name: "Gestisci i tuoi immobili" }),
  ).toHaveAttribute("href", "/properties");
  fresh = true;
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "È tutto pronto" })
      .getByRole("link", { name: "Scopri profili compatibili" }),
  ).toHaveAttribute("href", "/discover");
  expect(profileRequests).toBe(0);
  await accessible(page);
});

test("progress failures stay recoverable without claiming completion", async ({
  page,
}) => {
  await fixtures(page, user);
  let failing = true;
  await page.route("**/api/profile", (route) =>
    failing
      ? route.abort("failed")
      : route.fulfill({ json: { profile: { status: "published" } } }),
  );
  await page.goto("/dashboard");
  await expect(
    page.getByText("Non riusciamo a caricare i tuoi progressi. Riprova."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "È tutto pronto" }),
  ).toHaveCount(0);
  failing = false;
  await page.getByRole("button", { name: "Ricarica i progressi" }).click();
  await expect(
    page.getByRole("heading", { name: "È tutto pronto" }),
  ).toBeVisible();
});

test("chat templates preserve drafts and require explicit send; failed sends retain text", async ({
  page,
}) => {
  await fixtures(page, user);
  const messages: Array<{
    id: string;
    sender_id: string;
    body: string;
    created_at: string;
  }> = [];
  const sent: string[] = [];
  let failing = false;
  await page.route("**/api/invitations/example-invite", (route) =>
    route.fulfill({
      json: {
        invitation: {
          id: "example-invite",
          tenant_id: user.id,
          other_name: "Proprietario di esempio",
          property,
          property_changed: true,
        },
      },
    }),
  );
  await page.route("**/api/conversations/example-invite", (route) =>
    route.fulfill({ json: { status: "accepted", messages, hasMore: false } }),
  );
  await page.route("**/api/conversations/example-invite/messages", (route) => {
    const body = route.request().postDataJSON().body;
    if (failing)
      return route.fulfill({
        status: 503,
        json: { error: "Invio temporaneamente non disponibile." },
      });
    sent.push(body);
    messages.push({
      id: "example-message",
      sender_id: user.id,
      body,
      created_at: new Date().toISOString(),
    });
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("/conversations/example-invite");
  const draft = page.getByLabel("Il tuo messaggio");
  await draft.fill("La mia domanda personale.");
  await page
    .getByRole("button", { name: "Spese incluse", exact: true })
    .click();
  await expect(draft).toHaveValue(
    /La mia domanda personale\.\n\nPotresti indicarmi/,
  );
  await expect(draft).toBeFocused();
  expect(sent).toEqual([]);
  await expect(
    page.getByText("I dettagli attuali sono cambiati.", { exact: false }),
  ).toBeVisible();
  const text = await draft.inputValue();
  await page.getByRole("button", { name: "Invia messaggio" }).click();
  await expect(page.getByText(text, { exact: true })).toBeVisible();
  expect(sent).toEqual([text]);
  await expect(draft).toHaveValue("");
  await page.setViewportSize({ width: 390, height: 844 });
  await accessible(page);
  await page.screenshot({
    path: "test-results/experience-visual/chat-mobile.png",
    fullPage: true,
  });
  failing = true;
  await draft.fill("Una bozza da conservare.");
  await page.getByRole("button", { name: "Invia messaggio" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Invio temporaneamente non disponibile.",
  );
  await expect(draft).toHaveValue("Una bozza da conservare.");
  await draft.fill("a".repeat(2000));
  await expect(
    page.getByRole("button", { name: "Spese incluse", exact: true }),
  ).toBeDisabled();
  await page.setViewportSize({ width: 390, height: 844 });
  await accessible(page);
});

test("switching conversations cannot carry a draft to a different contact", async ({
  page,
}) => {
  await fixtures(page, { ...user, role: "both" });
  await page.route("**/api/invitations/*", (route) =>
    route.fulfill({
      json: {
        invitation: {
          tenant_id: "other-tenant",
          other_name: "Contatto di esempio",
          property,
        },
      },
    }),
  );
  await page.route("**/api/conversations/*", (route) =>
    route.fulfill({
      json: { status: "accepted", messages: [], hasMore: false },
    }),
  );
  await page.goto("/conversations/first");
  await page.getByRole("button", { name: "Proponi una visita" }).click();
  await expect(page.getByLabel("Il tuo messaggio")).toHaveValue(
    /Ciao, grazie per aver accettato/,
  );
  await page.evaluate(() => {
    history.pushState({}, "", "/conversations/second");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByLabel("Il tuo messaggio")).toHaveValue("");
});

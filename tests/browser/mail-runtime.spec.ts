import { test, expect, type Page } from "@playwright/test";

const user = {
  id: "runtime-test-account",
  display_name: "Persona di test",
  email: "runtime@example.test",
  role: "tenant",
  email_verified: false,
  suspended: false,
  staff_role: null,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/income", (route) =>
    route.fulfill({
      json: {
        provider_available: false,
        demo_available: false,
        status: "not_requested",
        attestation: null,
        history: [],
        shares: [],
      },
    }),
  );
});

async function config(
  page: Page,
  environment: "local" | "staging" | "production",
  mailTransport: "local" | "smtp",
) {
  await page.route("**/api/config", (route) =>
    route.fulfill({ json: { environment, mailTransport } }),
  );
}

test("SMTP signup and resend use mailbox instructions and one runtime request", async ({
  page,
}) => {
  let registered = false,
    configRequests = 0;
  await page.route("**/api/config", (route) => {
    configRequests++;
    return route.fulfill({
      json: { environment: "production", mailTransport: "smtp" },
    });
  });
  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { user: registered ? user : null } }),
  );
  await page.route("**/api/auth/register", (route) => {
    registered = true;
    return route.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/dashboard", (route) =>
    route.fulfill({ json: { pending: 0, accepted: 0 } }),
  );
  await page.route("**/api/verification", (route) =>
    route.fulfill({ json: { email_verified: false, checks: [] } }),
  );
  await page.route("**/api/auth/resend", (route) =>
    route.fulfill({ json: { ok: true } }),
  );

  await page.goto("/register");
  await page.getByLabel("Come vuoi essere chiamato?").fill(user.display_name);
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Runtime-test-passphrase");
  await page.getByRole("button", { name: "Crea account" }).click();
  await expect(
    page.getByRole("heading", { name: "Ciao, Persona di test." }),
  ).toBeVisible();
  await expect(
    page.getByText("Apri il link di conferma dalla tua casella email."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Vai alle verifiche" }).click();
  await expect(
    page.getByRole("heading", { name: "Email da confermare" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Invia di nuovo la conferma" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Richiesta ricevuta. Controlla la tua casella email",
  );
  await expect(page.locator("body")).not.toContainText(
    "Nessuna email viene inviata",
  );
  await expect(page.locator("body")).not.toContainText("dati sintetici");
  await expect(page.locator("body")).not.toContainText("messaggio locale");
  await expect(
    page.getByText("Nessun servizio di verifica è collegato."),
  ).toBeVisible();
  expect(configRequests).toBe(1);
});

test("SMTP recovery and confirmation keep real email wording without claiming delivery", async ({
  page,
}) => {
  await config(page, "production", "smtp");
  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { user: null } }),
  );
  await page.route("**/api/auth/forgot", (route) =>
    route.fulfill({ json: { ok: true } }),
  );
  await page.route("**/api/auth/verify", (route) =>
    route.fulfill({ json: { ok: true } }),
  );

  await page.goto("/forgot");
  await page.getByLabel("La tua email").fill(user.email);
  await page.getByRole("button", { name: "Invia istruzioni" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Se l’indirizzo è registrato, controlla la tua casella email e la cartella spam",
  );
  await expect(page.locator("body")).not.toContainText("messaggio locale");
  await page.goto("/account/reset#%");
  await expect(
    page.getByText("Apri il link completo di conferma o recupero."),
  ).toBeVisible();
  await page.goto("/account/verify#" + "a".repeat(64));
  await expect(
    page.getByText("Apri il link di conferma dalla tua casella email."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Conferma email" }).click();
  await expect(page.getByRole("status")).toContainText("Email confermata.");
  await expect(page.locator("body")).not.toContainText("Conferma locale");
});

test("unavailable runtime avoids inventing local mail or SMTP readiness", async ({
  page,
}) => {
  await page.route("**/api/config", (route) => route.abort("failed"));
  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { user: null } }),
  );
  await page.route("**/api/auth/forgot", (route) =>
    route.fulfill({ json: { ok: true } }),
  );

  await page.goto("/forgot");
  await page.getByLabel("La tua email").fill(user.email);
  await page.getByRole("button", { name: "Invia istruzioni" }).click();
  await expect(page.getByRole("status")).toContainText(
    "la richiesta di recupero è stata ricevuta",
  );
  await expect(page.locator("body")).not.toContainText("messaggio locale");
  await expect(page.locator("body")).not.toContainText(
    "Nessuna email viene inviata",
  );
  await expect(page.locator("body")).not.toContainText("cartella spam");
  await expect(page.locator("body")).not.toContainText("dati sintetici");
});

test("staging uses test environment wording while SMTP remains mailbox based", async ({
  page,
}) => {
  await config(page, "staging", "smtp");
  await page.route("**/api/session", (route) =>
    route.fulfill({ json: { user } }),
  );
  await page.route("**/api/verification", (route) =>
    route.fulfill({ json: { email_verified: false, checks: [] } }),
  );

  await page.goto("/verification");
  await expect(
    page.getByText("Ambiente di test · non usare dati o documenti reali"),
  ).toBeVisible();
  await expect(
    page.getByText("Apri il link di conferma dalla tua casella email."),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("messaggio locale");
  await expect(page.locator("body")).not.toContainText("nessun annuncio reale");
});

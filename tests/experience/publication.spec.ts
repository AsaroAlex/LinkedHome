import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type Environment = "local" | "preview" | "staging" | "production";
const account = {
  id: "publication-account",
  display_name: "Ada",
  email: "ada@example.test",
  role: "tenant",
  email_verified: false,
  suspended: false,
  staff_role: null,
};
const legacyPresentation =
  /preview|\bdemo\b|dimostrativ|sintetic|prototipo|nome di lavoro|ambiente di test|area di prova|nessuna email inviata|nessuna offerta reale|nessun annuncio reale/i;

async function fixtures(page: Page, environment: Environment) {
  let currentUser: typeof account | null = null;
  const submissions: { path: string; body: unknown }[] = [];
  const unexpected: string[] = [];
  const responses: Record<string, unknown> = {
    "/api/config": {
      environment,
      mailTransport:
        environment === "preview"
          ? "disabled"
          : environment === "local"
            ? "local"
            : "smtp",
    },
    "/api/dashboard": { pending: 0, accepted: 0 },
    "/api/profile": { profile: null },
    "/api/properties": { properties: [] },
    "/api/blocks": { blocks: [] },
    "/api/verification": { email_verified: false, checks: [] },
    "/api/income": {
      provider_available: false,
      demo_available: environment === "local" || environment === "preview",
      status: "not_requested",
      attestation: null,
      history: [],
      shares: [],
    },
  };
  await page.route("**/api/**", (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === "/api/session")
      return route.fulfill({ json: { user: currentUser } });
    if (
      request.method() === "POST" &&
      ["/api/auth/preview", "/api/auth/register"].includes(path)
    ) {
      const body = request.postDataJSON();
      submissions.push({ path, body });
      currentUser = {
        ...account,
        role: body.role,
        email_verified: path === "/api/auth/preview",
      };
      return route.fulfill({ json: { ok: true } });
    }
    if (request.method() === "GET" && path in responses)
      return route.fulfill({ json: responses[path] });
    unexpected.push(`${request.method()} ${path}`);
    return route.fulfill({
      status: 500,
      json: { error: "Unexpected fixture request" },
    });
  });
  return {
    responses,
    submissions,
    unexpected,
    signIn: () => {
      currentUser = { ...account, email_verified: true };
    },
  };
}

async function accessible(page: Page) {
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
    ).violations.map((violation) => violation.id),
  ).toEqual([]);
}

for (const environment of [
  "local",
  "preview",
  "staging",
  "production",
] as const) {
  test(`${environment} public pages explain the product without deployment labels`, async ({
    page,
  }) => {
    const fixture = await fixtures(page, environment);
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto("/");
    await expect(
      page.getByRole("link", {
        name: environment === "preview" ? "Inizia" : "Crea account",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator(".environment")).toHaveCount(0);
    await page
      .getByText("Come funziona la verifica del reddito?", { exact: true })
      .click();
    await expect(page.getByRole("main")).toContainText(
      "La verifica del reddito reale non è ancora disponibile.",
    );
    await expect(page.locator("body")).not.toContainText(legacyPresentation);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute(
      "content",
      legacyPresentation,
    );
    await expect(page.getByRole("contentinfo")).toContainText(
      `© ${new Date().getFullYear()} LinkedHome`,
    );
    await accessible(page);
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Controllo e trasparenza" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Profili, inviti e verifica del reddito",
      }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText(legacyPresentation);
    await expect(page.locator(".environment")).toHaveCount(0);
    await expect(page.getByRole("main")).toContainText(
      "La verifica d’identità non è disponibile.",
    );
    await accessible(page);
    expect(fixture.unexpected).toEqual([]);
    expect(fixture.submissions).toEqual([]);
  });
}

test("test access stays explicit while role access and the private workspace remain usable", async ({
  page,
}) => {
  const fixture = await fixtures(page, "preview");
  await page.goto("/register?role=landlord");
  await expect(page.getByText("AREA DI PROVA", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Scegli come provare il sito" }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText(
    "Gli account sono di prova",
  );
  await expect(page.getByRole("main")).toContainText(
    "non ci sono annunci reali",
  );
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Prova come proprietario" }).click();
  await expect(
    page.getByRole("heading", { name: "Ciao, Ada.", exact: true }),
  ).toBeVisible();
  expect(fixture.submissions).toEqual([
    { path: "/api/auth/preview", body: { role: "landlord" } },
  ]);
  await expect(page.locator(".environment")).toContainText("Area di prova");
  await expect(page.locator(".environment")).toContainText(
    "nessuna email inviata",
  );
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Account di prova" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Scegli un ruolo", exact: true }),
  ).toHaveAttribute("href", "/login");
  await expect(page.getByLabel("Password attuale")).toHaveCount(0);
  await page.locator("header .logo").click();
  await expect(page.locator(".environment")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(legacyPresentation);
  expect(fixture.unexpected).toEqual([]);
});

test("production signup sends the chosen role and credentials and requires email confirmation", async ({
  page,
}) => {
  const fixture = await fixtures(page, "production");
  await page.goto("/register?role=landlord");
  await expect(
    page.getByRole("radio", { name: /Offro un immobile/ }),
  ).toBeChecked();
  await expect(
    page.getByRole("heading", { name: "Scegli come provare il sito" }),
  ).toHaveCount(0);
  await page.getByLabel("Come vuoi essere chiamato?").fill("Ada");
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Publication-test-passphrase");
  await page.getByRole("radio", { name: /Entrambe le cose/ }).check();
  await page.getByRole("button", { name: "Crea account" }).click();
  await expect(
    page.getByRole("heading", { name: "Ciao, Ada.", exact: true }),
  ).toBeVisible();
  expect(fixture.submissions).toEqual([
    {
      path: "/api/auth/register",
      body: {
        display_name: "Ada",
        email: account.email,
        password: "Publication-test-passphrase",
        role: "both",
      },
    },
  ]);
  await expect(page.locator(".environment")).toHaveCount(0);
  await expect(page.getByRole("main")).toContainText(
    "Apri il link di conferma dalla tua casella email.",
  );
  await page.getByRole("link", { name: "Verifiche", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Email da confermare", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Verifica reale non disponibile",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.getByRole("main")).toContainText(
    "Nessuna verifica d’identità disponibile",
  );
  await expect(
    page.getByText("Prova con dati di esempio", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(legacyPresentation);
  expect(fixture.unexpected).toEqual([]);
});

test("financial examples keep their sample label and cannot be presented as a real verification", async ({
  page,
}) => {
  const fixture = await fixtures(page, "preview");
  fixture.signIn();
  const sample = {
    id: "income-example",
    status: "completed",
    synthetic: true,
    provider: "Fonte di esempio",
    category: "employment",
    source_description: "Movimenti generati come esempio",
    period_from: "2026-01-01",
    period_to: "2026-06-30",
    checked_at: "2026-07-01",
    expires_at: "2027-07-01",
    summary: { monthly_net_band: { min: 2000, max: 2499 } },
  };
  fixture.responses["/api/income"] = {
    provider_available: false,
    demo_available: true,
    status: "completed",
    attestation: sample,
    history: [sample],
    shares: [],
  };
  await page.goto("/verification");
  await expect(
    page.getByText("Dati di esempio · nessun reddito reale verificato", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Riepilogo del reddito di esempio" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Verifica reale non disponibile",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByText("Prova con dati di esempio", { exact: true }).click();
  await expect(
    page.getByText("Solo esempi generati: non inserire il tuo reddito.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText(
    "Non hai condiviso il riepilogo con nessuno.",
  );
  expect(fixture.submissions).toEqual([]);
  expect(fixture.unexpected).toEqual([]);
});

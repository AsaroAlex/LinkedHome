import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { readdir, readFile, mkdir } from "node:fs/promises";
import { makePool } from "../../server/db";
import { databaseUrl, localDir } from "../../server/config";
import path from "node:path";
const origin = "http://127.0.0.1:3000",
  password = "Browser-synthetic-passphrase";
const db = makePool(databaseUrl("soglia_e2e"));
test.afterAll(async () => {
  await db.end();
});
async function call(
  request: APIRequestContext,
  route: string,
  data: any = {},
  method = "POST",
) {
  const r = await request.fetch("/api" + route, {
    method,
    headers: { origin, "Content-Type": "application/json" },
    data: method === "GET" ? undefined : data,
  });
  expect(r.ok(), `${method} ${route}: ${r.status()}`).toBeTruthy();
  return r.json();
}
async function account(page: Page, role = "tenant", staff?: string) {
  const email = `browser-${randomUUID()}@example.test`;
  await call(page.request, "/auth/register", {
    email,
    password,
    display_name: "Persona Demo",
    role,
  });
  const user = (await call(page.request, "/session", {}, "GET")).user;
  await db.query(
    "UPDATE users SET email_verified=true,staff_role=$2 WHERE id=$1",
    [user.id, staff || null],
  );
  return { ...user, email, password };
}
const pInput = {
  title: "Casa luminosa di esempio",
  city: "Bologna",
  area: "Saragozza",
  description:
    "Una casa sintetica con spazio per leggere, lavorare e stare insieme.",
  rent: 850,
  available_from: "2026-12-01",
  min_months: 6,
  max_months: 36,
  capacity: 2,
  sqm: 68,
  rooms: 3,
  furnished: true,
  authority_attested: true,
};
async function profile(request: APIRequestContext) {
  await call(
    request,
    "/profile",
    {
      city: "Bologna",
      budget: 1100,
      move_in: "2027-01-01",
      duration: 12,
      occupants: 2,
    },
    "PUT",
  );
  await call(request, "/profile/status", { status: "published" });
  return (await call(request, "/profile", {}, "GET")).profile;
}
async function property(request: APIRequestContext) {
  const { id } = await call(request, "/properties", pInput);
  await call(request, `/properties/${id}/status`, { status: "published" });
  return (await call(request, "/properties", {}, "GET")).properties.find(
    (p: any) => p.id === id,
  );
}
async function localToken(email: string, purpose: string) {
  const files = (await readdir(path.join(localDir, "mail"))).sort().reverse();
  for (const file of files) {
    const msg = JSON.parse(
      await readFile(path.join(localDir, "mail", file), "utf8"),
    );
    if (msg.to === email && msg.purpose === purpose)
      return msg.url.split("#")[1];
  }
  throw new Error("Local mail not found");
}
async function axe(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();
}

test("landing, keyboard and mobile visual accessibility", async ({ page }) => {
  await mkdir("test-results/visual", { recursive: true });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /La prossima casa/ }),
  ).toBeVisible();
  await axe(page);
  await page.screenshot({
    path: "test-results/visual/landing-desktop.png",
    fullPage: true,
  });
  for (let n = 0; n < 8; n++) {
    await page.keyboard.press("Shift+Tab");
    if (
      await page
        .getByRole("link", { name: "Vai al contenuto" })
        .evaluate((el) => el === document.activeElement)
    )
      break;
  }
  await expect(
    page.getByRole("link", { name: "Vai al contenuto" }),
  ).toBeFocused();
  await page.getByRole("heading", { name: /La prossima casa/ }).focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await axe(page);
  await page.screenshot({
    path: "test-results/visual/landing-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow(page);
});

test("new tenant registers, confirms local token, edits and deliberately publishes", async ({
  page,
}) => {
  const email = `signup-${randomUUID()}@example.test`;
  await page.goto("/register");
  await page.getByLabel("Come vuoi essere chiamato?").fill("Ada Sintetica");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crea account" }).click();
  await expect(
    page.getByRole("heading", { name: "Ciao, Ada Sintetica." }),
  ).toBeVisible();
  await page.goto("/account/verify#" + (await localToken(email, "verify")));
  await page.getByRole("button", { name: "Conferma email" }).click();
  await expect(page.getByText("Conferma locale completata.")).toBeVisible();
  await page.getByRole("link", { name: "Continua", exact: true }).click();
  await page.getByRole("link", { name: "Il mio profilo", exact: true }).click();
  await page.getByLabel("Budget totale mensile").fill("1000");
  await page.getByRole("button", { name: "Salva preferenze" }).click();
  await expect(
    page.getByRole("button", { name: "Pubblica queste preferenze" }),
  ).toBeVisible();
  await expect(page.getByText("Bozza privata", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Pubblica queste preferenze" })
    .click();
  await expect(page.getByText("Pubblicato", { exact: true })).toBeVisible();
  await axe(page);
  await page.screenshot({
    path: "test-results/visual/profile-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow(page);
  await axe(page);
});

test("landlord creates property, sees useful validation and publishes", async ({
  page,
}) => {
  await account(page, "landlord");
  await page.goto("/properties");
  await page.getByRole("button", { name: "Aggiungi immobile" }).click();
  await expect(page.getByLabel("Titolo", { exact: true })).toBeFocused();
  await page.getByLabel("Titolo", { exact: true }).fill("Casa in giardino");
  await page.getByLabel("Quartiere o zona").fill("Centro");
  await page
    .getByLabel("Descrizione", { exact: true })
    .fill("Solo un esempio sintetico per provare la pubblicazione.");
  await page.getByLabel("Dichiaro di essere autorizzato").check();
  await page.getByLabel("Durata minima (mesi)").fill("48");
  await page.getByRole("button", { name: "Salva immobile" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Durata massima inferiore alla minima",
  );
  await page.getByLabel("Durata minima (mesi)").fill("6");
  await page.getByRole("button", { name: "Salva immobile" }).click();
  await page.getByRole("button", { name: "Pubblica", exact: true }).click();
  await expect(page.getByText("Pubblicato", { exact: true })).toBeVisible();
  await axe(page);
  await page.screenshot({
    path: "test-results/visual/property-desktop.png",
    fullPage: true,
  });
});

test("two users discover, invite, accept, converse, report and block", async ({
  page,
  browser,
}) => {
  const tenantContext = await browser.newContext({ baseURL: origin }),
    tenantPage = await tenantContext.newPage();
  const tenant = await account(tenantPage);
  const pf = await profile(tenantPage.request);
  await account(page, "landlord");
  const p = await property(page.request);
  await page.goto("/discover");
  await expect(
    page.getByRole("heading", {
      name: `Profilo ${tenant.id.slice(0, 6).toUpperCase()}`,
    }),
  ).toBeVisible();
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: `Profilo ${tenant.id.slice(0, 6).toUpperCase()}`,
    }),
  });
  await expect(card).not.toContainText(tenant.email);
  await expect(card).not.toContainText("Persona Demo");
  await axe(page);
  await page.screenshot({
    path: "test-results/visual/discovery-desktop.png",
    fullPage: true,
  });
  await card
    .getByRole("button", { name: "Invita per questo immobile" })
    .click();
  await tenantPage.goto("/invitations");
  await expect(
    tenantPage.getByText("68 m² · 3 locali · Arredato"),
  ).toBeVisible();
  await tenantPage
    .getByRole("button", { name: "Accetta e apri la conversazione" })
    .click();
  await tenantPage.getByRole("link", { name: "Apri conversazione" }).click();
  await tenantPage
    .getByLabel("Il tuo messaggio")
    .fill("Ciao! Possiamo parlare della casa sintetica?");
  await tenantPage.getByRole("button", { name: "Invia messaggio" }).click();
  await expect(
    tenantPage.getByText("Ciao! Possiamo parlare della casa sintetica?", {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/invitations");
  await page.getByRole("link", { name: "Apri conversazione" }).click();
  await page
    .getByLabel("Il tuo messaggio")
    .fill("<img src=x onerror=alert(1)>");
  await page.getByRole("button", { name: "Invia messaggio" }).click();
  await tenantPage.getByRole("button", { name: "Messaggi recenti" }).click();
  await expect(
    tenantPage.getByText("<img src=x onerror=alert(1)>", { exact: true }),
  ).toBeVisible();
  await expect(tenantPage.locator(".message img")).toHaveCount(0);
  await axe(tenantPage);
  await tenantPage.screenshot({
    path: "test-results/visual/chat-desktop.png",
    fullPage: true,
  });
  await tenantPage
    .getByRole("button", { name: "Segnala messaggio" })
    .last()
    .click();
  await tenantPage
    .getByLabel("Descrivi il problema")
    .fill("Messaggio sintetico da esaminare.");
  await tenantPage.getByRole("button", { name: "Invia segnalazione" }).click();
  await expect(tenantPage.getByText("Segnalazione ricevuta.")).toBeVisible();
  await tenantPage
    .getByRole("button", { name: "Blocca contatto", exact: true })
    .click();
  await expect(tenantPage.getByText("Conversazione chiusa.")).toBeVisible();
  await tenantPage.setViewportSize({ width: 390, height: 844 });
  await noOverflow(tenantPage);
  await tenantPage.screenshot({
    path: "test-results/visual/chat-mobile.png",
    fullPage: true,
  });
  await tenantContext.close();
});

test("compatible offer edit invalidates pending acceptance", async ({
  page,
  browser,
}) => {
  const tc = await browser.newContext({ baseURL: origin }),
    tp = await tc.newPage(),
    t = await account(tp),
    pf = await profile(tp.request);
  await account(page, "landlord");
  const p = await property(page.request);
  await call(page.request, "/invitations", {
    property_id: p.id,
    tenant_id: t.id,
    property_revision: p.revision,
    profile_revision: pf.revision,
  });
  await call(
    page.request,
    `/properties/${p.id}`,
    { ...pInput, rent: 900 },
    "PUT",
  );
  await tp.goto("/invitations");
  await expect(tp.getByText("Annullato", { exact: true })).toBeVisible();
  await expect(
    tp.getByRole("button", { name: "Accetta e apri la conversazione" }),
  ).toHaveCount(0);
  await tc.close();
});

test("staff navigation preserves response shape and restricted case context", async ({
  page,
}) => {
  await account(page, "both", "admin");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/staff");
  await expect(
    page.getByRole("heading", { name: "Uno spazio da proteggere." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Attività", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Attività dell’ambiente." }),
  ).toBeVisible();
  await expect(page.getByText("Conteggi del workflow locale")).toBeVisible();
  await axe(page);
  await page.getByRole("link", { name: "Account", exact: true }).last().click();
  await expect(
    page.getByRole("heading", { name: "Gestione degli account." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Segnalazioni", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Uno spazio da proteggere." }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/visual/staff-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
  await axe(page);
});

test("reset password through local mail and handle malformed links safely", async ({
  page,
}) => {
  const u = await account(page);
  await call(page.request, "/auth/logout");
  await page.goto("/account/reset#%");
  await expect(page.getByText("Apri il link completo")).toBeVisible();
  await page.goto("/forgot");
  await page.getByLabel("La tua email").fill(u.email);
  await page.getByRole("button", { name: "Invia istruzioni" }).click();
  await expect(page.getByText("Se l’indirizzo è registrato")).toBeVisible();
  await page.goto("/account/reset#" + (await localToken(u.email, "reset")));
  await page.getByLabel("Nuova password").fill(password + "-new");
  await page.getByRole("button", { name: "Salva password" }).click();
  await expect(page.getByText("Password aggiornata.")).toBeVisible();
  await page.getByRole("link", { name: "Continua", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill(u.email);
  await page.getByLabel("Password", { exact: true }).fill(password + "-new");
  await page.getByRole("button", { name: "Entra nel tuo spazio" }).click();
  await expect(
    page.getByRole("heading", { name: "Ciao, Persona Demo." }),
  ).toBeVisible();
});

test("suspended account keeps own-data access and an appeal route", async ({
  page,
}) => {
  const u = await account(page);
  await db.query(
    "UPDATE users SET suspended=true,suspension_reason='security' WHERE id=$1",
    [u.id],
  );
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Il tuo account è sospeso." }),
  ).toBeVisible();
  await page
    .getByLabel("Motivo della richiesta")
    .fill("Richiesta di revisione sintetica.");
  await page.getByRole("button", { name: "Richiedi revisione" }).click();
  await expect(
    page.getByText("Richiesta di revisione registrata"),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Esporta i dati o elimina l’account" })
    .click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Scarica i miei dati" }).click();
  expect((await download).suggestedFilename()).toBe("soglia-dati.json");
  await page
    .getByRole("button", { name: "Voglio eliminare l’account" })
    .click();
  await page.getByLabel("Password attuale").fill(password);
  await page.getByLabel("Scrivi ELIMINA").fill("ELIMINA");
  await page.getByRole("button", { name: "Elimina definitivamente" }).click();
  await expect(
    page.getByRole("heading", { name: /La prossima casa/ }),
  ).toBeVisible();
});

test("session outage has a retry path instead of pretending logout", async ({
  page,
}) => {
  await page.route("**/api/session", (route) => route.abort("failed"));
  await page.goto("/dashboard");
  await expect(
    page.getByText("Impossibile verificare l’accesso."),
  ).toBeVisible();
  await page.unroute("**/api/session");
  await page.getByRole("button", { name: "Riprova" }).click();
  await expect(
    page.getByRole("heading", { name: "Bentornato a casa." }),
  ).toBeVisible();
});

test("measures bounded local landing performance", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__metrics = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        (window as any).__metrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any)
        if (!entry.hadRecentInput) (window as any).__metrics.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });
  const results = [];
  for (const mobile of [false, true]) {
    await page.setViewportSize(
      mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
    );
    await session.send("Emulation.setCPUThrottlingRate", {
      rate: mobile ? 4 : 1,
    });
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: mobile ? 80 : 0,
      downloadThroughput: mobile ? 200000 : 10000000,
      uploadThroughput: 1000000,
    });
    await page.goto("/");
    await page.getByRole("heading", { name: /La prossima casa/ }).waitFor();
    await page.waitForLoadState("networkidle");
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        ...(window as any).__metrics,
        domContentLoaded: nav.domContentLoadedEventEnd,
        transferBytes: performance
          .getEntriesByType("resource")
          .reduce(
            (sum, e) => sum + (e as PerformanceResourceTiming).transferSize,
            0,
          ),
      };
    });
    expect(metrics.lcp).toBeGreaterThan(0);
    expect(metrics.lcp).toBeLessThan(5000);
    expect(metrics.cls).toBeLessThan(0.1);
    expect(metrics.transferBytes).toBeLessThan(500000);
    results.push({
      scenario: mobile
        ? "mobile emulation:4x CPU,200kB/s,80ms"
        : "desktop loopback",
      ...metrics,
    });
  }
  await mkdir("test-results/metrics", { recursive: true });
  const { writeFile } = await import("node:fs/promises");
  await writeFile(
    "test-results/metrics/performance.json",
    JSON.stringify(
      {
        measured_at: new Date().toISOString(),
        scope:
          "local Chromium cold-load; not field Core Web Vitals or load at scale",
        results,
      },
      null,
      2,
    ),
  );
});

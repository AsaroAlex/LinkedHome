# LinkedHome

A working local MVP of an Italy-first reverse rental marketplace: publish preferences, discover compatible profiles for a property, invite, accept and converse. Built with TypeScript, React, Fastify and real PostgreSQL. Local development uses synthetic data; external PostgreSQL, authenticated SMTP and staging deployment templates are prepared. Real-user release conditions remain open. **LinkedHome is the product brand approved by the user.** `linkedhome.eu` is the proposed future main domain; `.it` is optional, while `linkedhome.com` is already registered and is not pending purchase. No domain has been purchased, and this brand update does not change a real application origin or SMTP sender. Trademark clearance remains pending, including the nearby names Linkhome and Linkedhomes. See [naming research](docs/product/03-naming.md), [domain setup](docs/operations/domain-setup.md) and the [domain checks of 2026-10-04 at 00:17 CEST](docs/operations/evidence/linkedhome-domain-research.json). Earlier naming evidence retains its original names and dates.

## Develop in this Codex cloud workspace

The current workflow stays in this Codex chat and the same cloud checkout. Codex edits the project, reproduces feedback, applies focused fixes and keeps the development service ready for the next test. Vite provides frontend hot reload; the API watcher restarts backend code while PostgreSQL preserves synthetic data.

Development startup, with Node24/npm11 available:

```bash
npm ci
npm run dev
```

One supervisor manages Vite3000, API3001 and PostgreSQL55432. API and database stay on loopback. A manual browser preview requires an incoming URL provided by the Codex runtime for UI port3000, with `APP_ORIGIN` matching that browser origin; `npm run dev:cloud` enables the UI binding for forwarding when such a URL exists.

The app can run inside the current cloud environment, but the available runtime tools provide no incoming preview URL. Manual testing from the user's computer is currently blocked by that access limitation; the cloud's `127.0.0.1` is not the computer's localhost. Continue working in this checkout and record the preview limitation explicitly. No Git push is needed after every edit; Git is used for requested versioning/export. See the [development guide](docs/operations/development.md) for the feedback loop and diagnostics.

Codex's [Browser preview instructions](https://developers.openai.com/codex/browser#preview-a-page) describe an integrated-terminal development server; they do not establish an incoming route to this managed runtime. Manual preview remains pending an actual accessible runtime URL.

## Local alternative

Requirements: Node24, npm11, a supported non-root Linux/macOS environment. Docker is not required. The verified cloud target is Linux x64 with Node24.19.0/npm11.9.0.

For iterative development with frontend hot reload and automatic API restarts:

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:3000` on the computer running this local alternative. The command bootstraps the local database and synthetic accounts if needed, preserves existing data and manages Vite, the API and PostgreSQL. Keep its terminal running; Ctrl+C stops the services. The [development guide](docs/operations/development.md) documents configurable ports, ignored `.env.development.local` settings and existing Dev Container/Codespaces support as technical references. Codespaces derives its forwarded origin automatically; generic forwarding uses `APP_ORIGIN=https://YOUR-PREVIEW-HOST npm run dev:cloud` and only frontend port3000.

The earlier macOS/Codex-local setup remains a technical alternative. The current choice is this Codex cloud workspace. `AGENTS.md` and `PROJECT_STATE.md` preserve the working conventions and earlier fixes.

To test the compiled application:

```bash
npm ci
npm run bootstrap
npm run build
npm start
```

Bootstrap creates an ignored `.local/` directory with a random PostgreSQL password, migrations and synthetic accounts. Credentials are in `.local/demo-accounts.json` with mode0600; they are never printed or committed. The database binds loopback on port55432 and the application on port3000. `npm start` serves the compiled app; `npm run dev` uses Vite on3000 and API on loopback3001 through Vite's proxy. Stop with Ctrl+C. Restarting preserves local data. Never remove `.local/postgres` to fix a startup error.

Email messages are local files under `.local/mail/`, not deliveries to real addresses. Read the intended synthetic account's message locally to use its confirmation/reset link. There is no HTTP mailbox endpoint. Real identity/income providers, document uploads, payments and guarantees are unavailable. The optional income flow uses server-generated examples explicitly labelled synthetic, with private preview and invitation-specific sharing.

## Prepare a hosted beta

The recommended combination is **Render Frankfurt + Brevo SMTP**. The [provider decision](docs/adr/0002-deployment-providers.md) compares alternatives and current prices; budget roughly $30/month for one operator or $55 with Render Pro, plus email, domain, taxes and usage beyond the baseline.

[Deployment instructions](docs/operations/deployment.md) cover the staging [Render Blueprint](render.yaml), non-root [Docker image](Dockerfile) and portable [Compose/Caddy configuration](deploy/compose.yaml). No services have been provisioned. Staging/production startup requires HTTPS `APP_ORIGIN`, external `DATABASE_URL` and valid SMTP settings. There is no automatic demo seeding or migration of external databases at web startup. After configuring secrets, run migrations explicitly, then `npm run deploy:check`; it checks database/schema and SMTP authentication without sending email. `npm run deploy:check -- --config-only` validates configuration only.

SMTP uses verified TLS on ports465/587 with bounded connection deadlines. The UI displays mailbox instructions when SMTP is configured and local-file instructions in the default demo. Verify actual inbox delivery, DNS, backups/restore, maintenance and trusted ingress in the target environment before real-user use. Identity/income checks and payment processing remain unavailable.

## Validate

```bash
npm run build
npm test
npm run test:e2e
npm run test:e2e:experience
npm audit
```

Integration tests use only the generated local `soglia_test` database; browser tests manage `soglia_e2e`, start their own server and need port3000 free. Neither suite resets the application database. Chromium is needed: the cloud uses `/usr/bin/chromium`; set `CHROMIUM_PATH` if necessary or install the browser with `npx playwright install chromium`. See [validation evidence](docs/operations/validation.md) for the actual tested outcomes and limits. CI instructions are provided but are not claimed to have run remotely.

The experience suite serves the built frontend on loopback3017 with mocked APIs and no PostgreSQL connection. It covers role selection, guided account setup, FAQ and editable chat starters. `npm run check` runs build, backend tests and both browser suites sequentially.

Earlier development setup validation, 2026-10-04: build/typecheck, **179 unit/integration tests**, **22 main browser checks** and **11 experience/mail-runtime checks** passed; HMR, API/SQL watch, session retention, shutdown/restart and data preservation were checked in the Linux cloud environment. [Development evidence](docs/operations/evidence/development-2026-10-04.json) records those outcomes and limits; it does not establish an accessible manual preview in the current runtime.

The [earlier Replit investigation](docs/operations/evidence/replit-development-2026-10-04.json) is historical evidence from an abandoned route, with187 tests on that earlier source. Its Vite privacy fix and regression coverage are retained; its simulated origin checks do not verify a Codex preview or the current source after removing the provider configuration.

The corrected Codex-cloud configuration passed build/typecheck and **180 unit/integration tests**, retaining development and private-file regression coverage. Seven tests belonged to the removed provider adapter. [Current evidence](docs/operations/evidence/codex-cloud-development-2026-10-04.json) records the internal runtime checks and the unresolved incoming-preview limitation.

The preceding combined-MVP integration passed frozen install, bootstrap, build/typecheck,163 unit/integration tests and the same browser configurations; its dependency audit reported zero known vulnerabilities. [Integration evidence](docs/operations/evidence/mvp-push-2026-10-04/readiness.json) identifies both parents and the tested source diff. The merged fixes add retry for property/discovery/chat loads, readable network errors, the selected text in message reports and draft reset when the report or conversation changes. Earlier standalone follow-up results are retained in the validation history.

## What is implemented

- Tenant, landlord and both-role accounts; operator-provisioned admin/moderator, sessions, local or SMTP confirmation/reset and restricted suspended-account access.
- Private-by-default profiles, deliberate publication/pause, owned properties,30-day availability reconfirmation.
- Explained compatibility on city, total monthly cost, dates, duration and occupancy; pseudonymous discovery with stable cursor pagination.
- Revision-bound invitations, immutable offered property snapshot, mutual conversations and paginated history.
- Blocking, scoped reporting, moderation/audit, suspension/appeal/restore, own-data export/deletion and minimal demo activity counts.
- Optional private reusable income examples: explicit consent for the exact preview and recipient, provenance/period/expiry, revocation, dispute, renewal without automatic sharing, and an unavailable real-provider contract.
- Honest identity verification foundation, with no fake live verification.

Optional checks never improve visibility. No person score or protected matching fields. Editing preferences/property facts or pausing cancels pending invitations; unchanged property reconfirmation preserves them. Terminal invitation pairs cannot be reopened in this single-search-episode prototype. Accepted/closed conversations retain the offered property facts and warn when current details have changed. Their compatibility explanations compare current tenant preferences with those same offered facts.

## External PostgreSQL

Set `DATABASE_URL` through your local environment without committing it. Bootstrap and demo seed refuse external databases. Run `npm run db:migrate` explicitly after reviewing the destination; application startup checks migration names/checksums and does **not** apply external DDL. Supply `APP_ORIGIN` matching the browser origin. The default HTTP host remains loopback. No remote production environment was provisioned.

## Project map

[Execution ledger](PLAN.md) · [Italian handoff](PROJECT_STATE.md) · [Product](docs/product/01-product-thesis.md) · [Economics and proposed paid test](docs/research/12-sustainable-economics.md) · [UX](docs/design/01-ux.md) · [Architecture](docs/adr/0001-modular-monolith.md) · [Demo walkthrough](docs/operations/demo.md) · [Security/operations](docs/operations/security.md) · [Release gates](docs/operations/release-checklist.md) · [Independent reviews](docs/reviews/README.md)

## Optional income attestation extension

Open **Verifiche → Prova il percorso con dati sintetici** as a tenant/both account. Create a generated example, review it, then open **Inviti e messaggi → Reddito: scegli cosa condividere** on a pending/accepted invitation. The checkbox starts unchecked. Sharing is bound to the exact attestation preview and that invitation; the landlord can read only its consented summary. Revocation, dispute, expiry, replacement, block/suspension and terminal invitation states remove future access. New examples never inherit old sharing choices.

No income or verification badge is exposed in discovery; acceptance works without an attestation. The demo supports employment, self-employment and variable income examples and recoverable states. It accepts no income amount, financial file, banking credential or arbitrary provider result from the client. `POST /api/income/checks` returns 503; real issuance remains unavailable. Adding a provider needs a reviewed adapter, source/method semantics and a separate migration because current observations are constrained to synthetic data.

[Research and provider comparison](docs/research/11-income-verification.md) · [Product decision and user experiment](docs/product/04-income-attestation.md) · [UX audit](docs/design/03-ux-audit-income.md) · [Extension validation](docs/operations/income-validation.md).

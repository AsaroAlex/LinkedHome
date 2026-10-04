# LinkedHome

A working local MVP of an Italy-first reverse rental marketplace: publish preferences, discover compatible profiles for a property, invite, accept and converse. Built with TypeScript, React, Fastify and real PostgreSQL. Local development uses synthetic data; external PostgreSQL, authenticated SMTP and staging deployment templates are prepared. Real-user release conditions remain open. **LinkedHome is the product brand approved by the user.** `linkedhome.eu` is the proposed future main domain; `.it` is optional, while `linkedhome.com` is already registered and is not pending purchase. No domain has been purchased, and this brand update does not change a real application origin or SMTP sender. Trademark clearance remains pending, including the nearby names Linkhome and Linkedhomes. See [naming research](docs/product/03-naming.md), [domain setup](docs/operations/domain-setup.md) and the [domain checks of 2026-10-04 at 00:17 CEST](docs/operations/evidence/linkedhome-domain-research.json). Earlier naming evidence retains its original names and dates.

## Develop in the cloud with Replit

The current choice is a cloud workspace with a live preview. [Import LinkedHome into Replit](https://replit.com/github.com/AsaroAlex/LinkedHome) once, or use [Replit's GitHub import](https://replit.com/import): `AsaroAlex/LinkedHome`, default/source branch `claude/sweet-goldberg-5lwng7`. Keep the existing implementation and architecture; this is not a prompt to rebuild the app. The imported source contains no local database, mailbox or generated credentials.

In the imported workspace, with Node24/npm11 available:

```bash
npm ci
```

`.replit` selects the `nodejs-24` module and sets **Run** to `npm run dev:cloud`: one command manages Vite HMR, API watch and the synthetic PostgreSQL database. Only UI port3000 is exposed; API3001 and PostgreSQL55432 stay on loopback. The development origin is derived from Replit's `REPLIT_DEV_DOMAIN`, unless `APP_ORIGIN` is supplied explicitly. Open the preview URL returned by Replit in a new browser tab for authenticated testing: the editor's embedded preview can block the existing `SameSite=Strict` session cookie.

Once that workspace exists, changes saved there appear through hot reload without pushing to GitHub after every edit. Git remains available for requested versioning/export. The Replit app, imported runtime and accessible preview have not yet been created or verified; the current Codex cloud listener has no incoming URL reachable from the user's computer. See the [development guide](docs/operations/development.md) for the initial import and subsequent feedback loop. This is a synthetic development environment, not a production deployment.

## Local alternative

Requirements: Node24, npm11, a supported non-root Linux/macOS environment. Docker is not required. The verified cloud target is Linux x64 with Node24.19.0/npm11.9.0.

For iterative development with frontend hot reload and automatic API restarts:

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. The command bootstraps the local database and synthetic accounts if needed, preserves existing data and manages Vite, the API and PostgreSQL. Keep its terminal running; Ctrl+C stops the services. See the [development guide](docs/operations/development.md) for configurable ports, ignored `.env.development.local` settings and the included Node24 Dev Container/Codespaces alternative. Replit and Codespaces derive their development origins automatically; other cloud environments use `APP_ORIGIN=https://YOUR-PREVIEW-HOST npm run dev:cloud` and forward only frontend port3000.

The earlier macOS/Codex-local setup remains an alternative: open this same repository as a local Codex project and keep the preview beside the chat. Codex edits local files directly; HMR/API watch apply changes without a push or manual build per iteration. The current requested route is cloud/Replit. `AGENTS.md` and `PROJECT_STATE.md` preserve the working conventions and earlier fixes.

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

Development setup validation, 2026-10-04: build/typecheck, **179 unit/integration tests**, **22 main browser checks** and **11 experience/mail-runtime checks** passed; HMR, API/SQL watch, session retention, shutdown/restart and data preservation were checked in the Linux cloud environment. [Development evidence](docs/operations/evidence/development-2026-10-04.json) records the tested outcomes and limits; these checks do not verify the subsequent Replit import/runtime/preview or startup on the user's Mac.

The subsequent cloud configuration passed build/typecheck and **187 unit/integration tests**, including a real Vite regression denying24 private-file URLs while serving public files. A simulated Replit origin passed host/origin checks and login/session/logout in the managed Linux environment; the actual Replit import and preview remain unverified. See [cloud development evidence](docs/operations/evidence/replit-development-2026-10-04.json).

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

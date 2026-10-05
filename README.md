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

Email messages are local files under `.local/mail/`, not deliveries to real addresses. Read the intended synthetic account's message locally to use its confirmation/reset link. There is no HTTP mailbox endpoint. Independent identity/income providers, payments and guarantees are unavailable. The separate [manual income workflow](docs/product/12-income-dossier.md) lets tenants prepare declared income and private supporting documents, then share them with the landlord of an accepted invitation for a recorded document comparison. Use only generated data and documents in the current test environment. The earlier server-generated income examples remain separate and explicitly synthetic.

## Prepare a hosted beta

The recommended combination is **Render Frankfurt + Brevo SMTP**. The [provider decision](docs/adr/0002-deployment-providers.md) compares alternatives and current prices; budget roughly $30/month for one operator or $55 with Render Pro, plus email, domain, taxes and usage beyond the baseline.

[Deployment instructions](docs/operations/deployment.md) cover the staging [Render Blueprint](render.yaml), non-root [Docker image](Dockerfile) and portable [Compose/Caddy configuration](deploy/compose.yaml). No services have been provisioned. Staging/production startup requires HTTPS `APP_ORIGIN`, external `DATABASE_URL` and valid SMTP settings. There is no automatic demo seeding or migration of external databases at web startup. After configuring secrets, run migrations explicitly, then `npm run deploy:check`; it checks database/schema and SMTP authentication without sending email. `npm run deploy:check -- --config-only` validates configuration only.

SMTP uses verified TLS on ports465/587 with bounded connection deadlines. The UI displays mailbox instructions when SMTP is configured and local-file instructions in the default demo. Verify actual inbox delivery, DNS, backups/restore, maintenance and trusted ingress in the target environment before real-user use. Independent identity/income checks and payment processing remain unavailable; a landlord's manual document comparison is a separate workflow.

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
- Private income declarations for each tenant, a separate optional guarantor, document uploads and explicit recipient consent after an accepted invitation; the chosen landlord can download evidence and record the amount/period read. This manual comparison does not certify identity, authenticity or future payment.
- Optional private reusable income examples: explicit consent for the exact preview and recipient, provenance/period/expiry, revocation, dispute, renewal without automatic sharing, and an unavailable real-provider contract.
- Honest identity verification foundation, with no fake live verification.

Optional checks never improve visibility. No person score or protected matching fields. Editing preferences/property facts or pausing cancels pending invitations; unchanged property reconfirmation preserves them. Terminal invitation pairs cannot be reopened in this single-search-episode prototype. Accepted/closed conversations retain the offered property facts and warn when current details have changed. Their compatibility explanations compare current tenant preferences with those same offered facts.

## External PostgreSQL

Set `DATABASE_URL` through your local environment without committing it. Bootstrap and demo seed refuse external databases. Run `npm run db:migrate` explicitly after reviewing the destination; application startup checks migration names/checksums and does **not** apply external DDL. Supply `APP_ORIGIN` matching the browser origin. The default HTTP host remains loopback. No remote production environment was provisioned.

## Project map

[Execution ledger](PLAN.md) · [Italian handoff](PROJECT_STATE.md) · [Product](docs/product/01-product-thesis.md) · [Economics and proposed paid test](docs/research/12-sustainable-economics.md) · [UX](docs/design/01-ux.md) · [Architecture](docs/adr/0001-modular-monolith.md) · [Demo walkthrough](docs/operations/demo.md) · [Security/operations](docs/operations/security.md) · [Release gates](docs/operations/release-checklist.md) · [Independent reviews](docs/reviews/README.md)

## Optional income workflows

### Declared income and manual document comparison

Open **Verifiche → Redditi per l’affitto** as a tenant/both account. Add one income card for every tenant contributing to the rent, with source, average monthly net amount and the period it represents. An unknown amount is distinct from zero. An optional guarantor has a separate card and never enters the tenant total. Coverage describes the people entered in this dossier, rather than automatically certifying that all property occupants are included.

Save privately and attach up to three supporting documents per person: PDF or JPG/PNG/WebP, up to 5 MB each. PDF files undergo bounded structural parsing, with a 50-page limit and rejection of encryption and identified active document features; images are re-encoded without embedded metadata. This is not an authenticity or malware certification. Documents are download-only attachments through authenticated routes; no original filenames or storage keys enter recipient responses.

After accepting an invitation, inspect the exact dossier and explicitly consent to sharing both its summary and documents with that invitation's landlord. That landlord must download the selected document before recording the amount and period read and confirming the manual comparison. The display distinguishes declared amounts, uploaded documents and a document checked by this landlord. It provides no person score, automatic eligibility decision, identity verification or payment guarantee. A rent/income percentage is shown only for a complete, positive tenant total, using the accepted offer's rent.

Changes to people, amounts or documents advance the dossier revision and interrupt existing shares. Revocation, a closed invitation, blocking or suspension prevent further recipient access; a new share requires new consent and a new review. Downloaded copies already held by the recipient cannot be recalled. Own-data export includes the holder's dossier; account/person/document deletion queues private document objects for storage cleanup. [The current data and API contract](docs/product/12-income-dossier.md) documents this workflow. These source-level capabilities do not establish that real-user release conditions are met.

### Separate synthetic examples

In local/preview environments, open **Riepiloghi di esempio** to access the earlier simulator. Create a generated example, review it, then use its separate sharing controls on a pending/accepted invitation. Its checkbox starts unchecked. Sharing is bound to the exact synthetic summary and that invitation; the landlord can read only its consented summary. Revocation, dispute, expiry, replacement, block/suspension and terminal invitation states remove future access. New examples never inherit old sharing choices.

Neither income workflow exposes income or verification badges in discovery; accepting an invitation works without either. The simulator supports employment, self-employment and variable income examples and recoverable states. Its earlier APIs still accept no client-supplied income amount, financial file, banking credential or arbitrary provider result. `POST /api/income/checks` still returns 503; independent provider issuance remains unavailable. The manual dossier uses separate `/api/income/dossier` routes and additive migration017, leaving the simulator's synthetic-only observations unchanged. Adding an independent provider requires a reviewed adapter, source/method semantics and a separate data contract.

[Research and provider comparison](docs/research/11-income-verification.md) · [Product decision and user experiment](docs/product/04-income-attestation.md) · [UX audit](docs/design/03-ux-audit-income.md) · [Extension validation](docs/operations/income-validation.md).

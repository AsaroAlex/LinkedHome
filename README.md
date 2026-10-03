# Soglia · LinkedHome

A prototype of an Italy-first reverse rental marketplace: publish preferences, discover compatible profiles for a property, invite, accept and converse. Built with TypeScript, React, Fastify and real PostgreSQL. Local development uses synthetic data; external PostgreSQL, authenticated SMTP and staging deployment templates are prepared. Real-user release conditions remain open. Soglia is a replaceable working name, without trademark/domain clearance.

## Run locally

Requirements: Node24, npm11, a supported non-root Linux/macOS environment. Docker is not required. The verified cloud target is Linux x64 with Node24.19.0/npm11.9.0.

```bash
npm ci
npm run bootstrap
npm run build
npm start
```

Bootstrap creates an ignored `.local/` directory with a random PostgreSQL password, migrations and synthetic accounts. Credentials are in `.local/demo-accounts.json` with mode0600; they are never printed or committed. The database binds loopback on port55432 and the application on port3000. `npm start` serves the compiled app; `npm run dev` uses Vite on3000 and API on3001. Stop with Ctrl+C. Restarting preserves local data. Never remove `.local/postgres` to fix a startup error.

Email messages are local files under `.local/mail/`, not deliveries to real addresses. Read the intended synthetic account's message locally to use its confirmation/reset link. There is no HTTP mailbox endpoint. Real identity/income providers, document uploads, payments and guarantees are unavailable.

## Prepare a hosted beta

The recommended combination is **Render Frankfurt + Brevo SMTP**. The [provider decision](docs/adr/0002-deployment-providers.md) compares alternatives and current prices; budget roughly $30/month for one operator or $55 with Render Pro, plus email, domain, taxes and usage beyond the baseline.

[Deployment instructions](docs/operations/deployment.md) cover the staging [Render Blueprint](render.yaml), non-root [Docker image](Dockerfile) and portable [Compose/Caddy configuration](deploy/compose.yaml). No services have been provisioned. Staging/production startup requires HTTPS `APP_ORIGIN`, external `DATABASE_URL` and valid SMTP settings. There is no automatic demo seeding or migration of external databases at web startup. After configuring secrets, run migrations explicitly, then `npm run deploy:check`; it checks database/schema and SMTP authentication without sending email. `npm run deploy:check -- --config-only` validates configuration only.

SMTP uses verified TLS on ports465/587 with bounded connection deadlines. The UI displays mailbox instructions when SMTP is configured and local-file instructions in the default demo. Verify actual inbox delivery, DNS, backups/restore, maintenance and trusted ingress in the target environment before real-user use. Identity/income checks and payment processing remain unavailable.

## Validate

```bash
npm run build
npm test
npm run test:e2e
npm audit
```

Integration tests use only the generated local `soglia_test` database; browser tests manage `soglia_e2e`, start their own server and need port3000 free. Neither suite resets the application database. Chromium is needed: the cloud uses `/usr/bin/chromium`; set `CHROMIUM_PATH` if necessary or install the browser with `npx playwright install chromium`. See [validation evidence](docs/operations/validation.md) for the actual tested outcomes and limits. CI instructions are provided but are not claimed to have run remotely.

## What is implemented

- Tenant, landlord and both-role accounts; operator-provisioned admin/moderator, sessions, local or SMTP confirmation/reset and restricted suspended-account access.
- Private-by-default profiles, deliberate publication/pause, owned properties,30-day availability reconfirmation.
- Explained compatibility on city, total monthly cost, dates, duration and occupancy; pseudonymous discovery with stable cursor pagination.
- Revision-bound invitations, immutable offered property snapshot, mutual conversations and paginated history.
- Blocking, scoped reporting, moderation/audit, suspension/appeal/restore, own-data export/deletion and minimal demo activity counts.
- Honest verification foundation: separate states, expiry/dispute/provenance, no fake live verification.

Optional checks never improve visibility. No person score or protected matching fields. Editing preferences/property facts or pausing cancels pending invitations; unchanged property reconfirmation preserves them. Terminal invitation pairs cannot be reopened in this single-search-episode prototype. Accepted conversations retain the offered property facts and warn when current details have changed.

## External PostgreSQL

Set `DATABASE_URL` through your local environment without committing it. Bootstrap and demo seed refuse external databases. Run `npm run db:migrate` explicitly after reviewing the destination; application startup checks migration names/checksums and does **not** apply external DDL. Supply `APP_ORIGIN` matching the browser origin. The default HTTP host remains loopback. No remote production environment was provisioned.

## Project map

[Execution ledger](PLAN.md) · [Italian handoff](PROJECT_STATE.md) · [Product](docs/product/01-product-thesis.md) · [UX](docs/design/01-ux.md) · [Architecture](docs/adr/0001-modular-monolith.md) · [Demo walkthrough](docs/operations/demo.md) · [Security/operations](docs/operations/security.md) · [Release gates](docs/operations/release-checklist.md) · [Independent reviews](docs/reviews/README.md)

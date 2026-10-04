# Deployment preparation

The repository supports an external PostgreSQL database and authenticated SMTP delivery. The default deployment templates use `APP_ENV=staging` and HTTPS, and are intended for explicitly created synthetic test accounts. They do not seed accounts. Infrastructure preparation does not resolve the real-user release conditions in [release-checklist.md](release-checklist.md). No hosting account, database, domain, certificate or external email was provisioned by this work.

## Container

### Synthetic Railway preview

`APP_ENV=preview` is a separate hosted demo mode. Set `MAIL_TRANSPORT=disabled`,
an explicit HTTPS `APP_ORIGIN`, an external `DATABASE_URL`, `HOST=0.0.0.0` and
Railway's routed `PORT`. Keep the predeploy migration and full `deploy:check`
steps. Preview checks the database/schema without opening an SMTP connection or
writing mail files. Staging and production continue to require authenticated SMTP.

The login page offers tenant and landlord demo roles. Each browser receives an
opaque secure cookie identifying its own pair of synthetic accounts, profile and
property; role switching preserves that demo workspace. No passwords or staff
accounts are exposed. Registration, password login and email recovery are disabled
in preview, and discovery/invitations are scoped to the demo pair. Use only test
data. Existing local bootstrap/seed restrictions remain in place; the preview
creates its accounts through the dedicated endpoint without resetting the database.

The current service is `linkedhome-staging` in the `observant-ambition` project;
the Railway environment is named `production` independently of `APP_ENV`.
Its managed domain is `https://linkedhome-staging-production.up.railway.app`.
This is a compiled deployment updated from the configured GitHub branch;
the Codex development process still uses local HMR.

Run `npm run test:e2e:preview` after a build to exercise the browser demo against
the isolated local `soglia_e2e` database. It requires port3000 free and runs
separately from the development supervisor and other database lifecycle suites.

`Dockerfile` builds the frontend with Node 24 and installs production dependencies in a separate stage. The runtime runs as the `node` user and starts with `npm start`. It contains the application, migrations and the migrate/maintenance/preflight scripts; it does not contain embedded-database or demo-seed tooling, the local database, generated mail, environment files or research evidence. `tsx` is required at runtime because the server and scripts execute TypeScript.

`DATABASE_URL` is mandatory in staging and production. The web process verifies the migration ledger and does not migrate, bootstrap or seed the external database. Run `npm run db:migrate` as a distinct deployment step, followed by `npm run deploy:check`. The preflight checks configuration, database migrations and SMTP connectivity/authentication without sending a message. Demo seeding is exclusively a local development operation.

`/api/health` includes a live database query. Container health checks call it every 30 seconds, with a five-second request deadline. SMTP is verified by deployment preflight, rather than by every health check.

Ordinary builds:

```sh
docker build -t linkedhome:RELEASE .
```

The standard Dockerfile uses ordinary `RUN npm ci` instructions, without secret mounts, so builders that support only cache mounts can parse it. Keep certificate verification enabled. Builds must not receive SMTP credentials as build arguments.

The managed Codex environment requires its provided public proxy CA for networked build stages. For verification there, make an untracked temporary copy of the Dockerfile outside the repository, add a BuildKit secret mount and `NODE_EXTRA_CA_CERTS` only to the two npm install instructions, and select that copy with Docker's `--file` option while retaining this repository as the build context. Supply the CA as a build secret to that verification build; do not copy it into a layer or alter the deployment Dockerfile. The temporary adaptation requires a builder that supports secret mounts. Remove the temporary file after verification.

## Railway build and service selection

The Railway Metal build log supplied on 2026-10-04 rejected `--mount=type=secret,id=proxy_ca` in both npm install instructions: that builder accepts cache mounts, but rejects this secret mount type. The failure occurred while parsing the Dockerfile, before dependency installation or application compilation. Removing those optional mounts from the standard Dockerfile addresses this build incompatibility; a successful Railway rebuild still needs to be checked on the service.

The corrected Dockerfile passed `docker buildx build --check`. An image build using the managed-CA temporary adaptation passed dependency installation and typecheck/Vite; that image passed migrations, configuration preflight, web readiness/liveness/frontend/asset checks and the maintenance command against a disposable PostgreSQL18 container. The final image retained its non-root user and contained no local demo database or proxy CA. [Verification evidence](evidence/railway-metal-build-2026-10-04.json) records these checks and the pending Railway rebuild.

The reported service, `linkedhome-staging-maintenance`, appeared under **Cron Runs** and was **Unexposed**. A maintenance job runs database cleanup and does not serve the frontend or an HTTP endpoint. Browser preview requires a separate web service running `npm start`, with a reachable URL and the configuration below. The Railway environment name `production` is separate from the application's `APP_ENV` setting. External database migrations and SMTP configuration remain explicit setup steps; a repaired image build does not complete them or make the local synthetic demo available in this deployment image.

## Required configuration

| Variable                     | Value / constraint                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `APP_ENV`                    | `staging` during infrastructure verification; `production` only for an operationally ready release         |
| `APP_ORIGIN`                 | The exact public HTTPS origin, without a path; links and origin checks depend on it                        |
| `DATABASE_URL`               | PostgreSQL connection string for the target environment; keep staging and production separate              |
| `HOST`, `PORT`               | Containers use `0.0.0.0` and `3000`                                                                        |
| `MAIL_TRANSPORT`             | `smtp`                                                                                                     |
| `SMTP_HOST`                  | Provider hostname, for example the hostname in the provider's authenticated SMTP settings                  |
| `SMTP_PORT`                  | `465` for implicit TLS or `587` for mandatory STARTTLS                                                     |
| `SMTP_USER`, `SMTP_PASSWORD` | Provider-issued SMTP login and key; never use an ordinary account password unless required by the provider |
| `MAIL_FROM`                  | A sender address verified by the provider on the selected domain                                           |
| `TRUST_PROXY`                | `false` by default, or a comma-separated list of verified proxy IP addresses/CIDRs                         |

For the recommended Brevo integration use `smtp-relay.brevo.com` and the console's SMTP login/key (the SMTP key differs from the API key). Activate transactional sending, verify the sender and publish Brevo's generated domain code, DKIM and DMARC records. Inspect SPF for the actual MAIL FROM route; do not add a second SPF record to an existing domain blindly. Keep provider tracking disabled for authentication links when configurable. Monitor daily quota and bounce suppression: the free plan queues messages after credits are exhausted, potentially delaying a 30-minute reset token beyond its expiry. Separate staging recipients from real customers and check delivery before real-user use. A successful SMTP authentication check does not prove inbox delivery.

## Render staging Blueprint

`render.yaml` defines a Docker web service, PostgreSQL 18 and a daily retention-maintenance cron job, all in Frankfurt. The paid compute plan identifiers are `0.5c-512mb` for web/cron and `0.1c-256mb` for PostgreSQL. Database storage starts at 5 GB with automatic growth disabled; assign an operator to monitor capacity and raise it before exhaustion. These small plans are a starting point for staging, without a throughput or availability guarantee.

The web service runs migrations and preflight in `preDeployCommand`; failures prevent the new version starting. The database allows private connections within Render and has an empty external IP allow list. The app receives its private connection string through `fromDatabase`. There is no application disk or demo seed hook. Manual deployment is selected with `autoDeployTrigger: "off"`; applying the Blueprint creates paid services.

Before applying it, select the repository/branch and inspect the resource names so an existing service is not accidentally adopted. Enter the prompted `sync: false` values through the Render Dashboard. Set `APP_ORIGIN` to the eventual Render HTTPS origin or a configured custom domain. A custom domain still needs DNS verification and a certificate; do not change the origin until that hostname works. The approved product brand is **LinkedHome**, with **linkedhome.eu** proposed as the future main domain and `.it` optional. `linkedhome.com` is already registered and is not a pending new registration. No domain has been purchased and the brand update changes no real origin or SMTP sender. Trademark clearance remains pending, including nearby Linkhome and Linkedhomes names. [Domain setup](domain-setup.md) records the proposed origins, DNS and sender sequence, backed by the [2026-10-04 00:17 CEST checks](evidence/linkedhome-domain-research.json). Keep the configured working origin until domain control, DNS and TLS have been verified.

Set `TRUST_PROXY=false` until the incoming Render load-balancer addresses or CIDRs have been verified with Render. The reviewed official documentation explains forwarding headers but does not supply a stable incoming proxy allow list. Service outbound IPs and Cloudflare's public IP ranges do not establish the address of the immediate proxy seen by this app. With forwarding disabled, rate limits group callers by their socket proxy address; resolve and verify this configuration before real-user traffic. Do not substitute `true`, a numeric hop count, or a broad private-network range.

The cron job receives only database configuration and runs `npm run maintenance` at `02:15 UTC` daily (03:15 in Rome in winter, 04:15 in summer). Check its first successful run after migrations and monitor failures. It removes expired auth records and the existing retention-limited reports/events/audit records; it does not send mail, perform database backups or delete provider delivery logs. Coordinate web and cron releases on the same commit to avoid schema drift.

## Portable Compose alternative

`deploy/compose.yaml` is a portable alternative for a server with Docker Compose 2.30 or later. PostgreSQL 18 has a persistent volume and publishes no host port. Caddy alone publishes ports 80/443, issues HTTPS certificates and proxies the app on a dedicated network. Its fixed address `172.30.0.2/32` is the only trusted forwarding source. If `172.30.0.0/24` conflicts with the server's routes, change the subnet, Caddy address and `TRUST_PROXY` together.

Store the environment file outside the repository and Docker build context, readable only by the deployment operator. For example, `/etc/linkedhome/runtime.env`:

```dotenv
LINKEDHOME_ENV_FILE=/etc/linkedhome/runtime.env
LINKEDHOME_IMAGE_TAG=RELEASE
APP_ENV=staging
DOMAIN=staging.example.com
ACME_EMAIL=operations@example.com
POSTGRES_PASSWORD=REPLACE_WITH_RANDOM_HEX
SMTP_HOST=REPLACE_WITH_PROVIDER_HOST
SMTP_PORT=587
SMTP_USER=REPLACE_WITH_SMTP_LOGIN
SMTP_PASSWORD=REPLACE_WITH_SMTP_KEY
MAIL_FROM=no-reply@example.com
```

Generate the database password with `openssl rand -hex 32`. Use hexadecimal characters because Compose constructs a connection URL from it; arbitrary punctuation must be URL-encoded before use. The SMTP env file uses Compose's `raw` format so `$` characters in provider credentials are preserved. Restrict this file to mode `0600`. Docker environment access is equivalent to secret access: only the deployment operator should control the Docker daemon.

Point the domain's DNS at the server, allow inbound TCP 80/443 (and optionally UDP 443 for HTTP/3), and check for conflicting listeners. From the repository, with the real values substituted only in the external file:

```sh
docker compose --env-file /etc/linkedhome/runtime.env -f deploy/compose.yaml config --quiet
docker compose --env-file /etc/linkedhome/runtime.env -f deploy/compose.yaml build
docker compose --env-file /etc/linkedhome/runtime.env -f deploy/compose.yaml up -d db
docker compose --env-file /etc/linkedhome/runtime.env -f deploy/compose.yaml run --rm migrate
docker compose --env-file /etc/linkedhome/runtime.env -f deploy/compose.yaml run --rm --no-deps app npm run deploy:check
docker compose --env-file /etc/linkedhome/runtime.env -f deploy/compose.yaml up -d app proxy
```

The `migrate` dependency also guards first startup: Caddy waits for the app's health check, and the app waits for a healthy database and successful migration job. On subsequent releases, explicitly run migrations and preflight again before recreating app/proxy; review migration compatibility with the previous app version. Compose does not provide a zero-downtime rollout guarantee. Avoid `docker compose down -v`, which deletes persisted data and certificate state.

Schedule this command once daily through the server's existing cron/systemd scheduler, with an absolute checkout path and the operator's permissions:

```sh
docker compose --project-directory /srv/linkedhome --env-file /etc/linkedhome/runtime.env -f /srv/linkedhome/deploy/compose.yaml run --rm --no-deps maintenance
```

Record failures in the server's operational alerting. The maintenance service has no public endpoint or timer in the web process.

## Verification and recovery before use

Confirm the public HTTPS health endpoint, valid certificate, correct origin checks, secure cookies, verified proxy client IPs, and registration/reset/invitation mail with explicitly selected test recipients. `deploy:check` itself sends no mail. Configure uptime alerts, database capacity/connection alerts, SMTP failure alerts and maintenance failure alerts without logging credentials or verification/reset tokens.

Assign backup and restore ownership. On Render, configure and inspect the paid database's backup/recovery features and test recovery to a separate database. For Compose, a persistent volume alone is insufficient: schedule encrypted PostgreSQL backups to a separate failure domain, record retention and access restrictions, and restore one to an isolated PostgreSQL 18 instance. Verify the migration ledger and representative records against the restored copy. The portable template uses a database owner role for setup/migrations; review least-privilege runtime credentials before real-user deployment.

Record the deployed image/commit and migration set. Reverting an image does not revert a database migration. Review forward/backward compatibility first; use a tested restore procedure if data recovery is necessary. These backup, restore, provider-delivery and external HTTPS checks remain operator tasks until evidenced on the selected target environment.

## Validation of these templates

On 2026-10-03, the Blueprint passed JSON Schema validation against the [current official Render schema](https://render.com/schema/render.yaml.json). The normalized [schema snapshot](evidence/render-blueprint.schema.json) and [validation record with repeat commands](evidence/deployment-templates.json) are preserved. Compose passed `config --quiet` and topology checks with fake values in an external fixture file; no credentials were printed. At that time, container build/runtime and Caddy certificate issuance were not verified because the managed environment's Docker socket was inaccessible to the task user. The templates had not been applied to any hosting provider by that validation work.

Technical references checked on 2026-10-03: [Render Blueprint fields](https://render.com/docs/blueprint-spec), [pre-deploy commands](https://render.com/docs/deploys#pre-deploy-command), [PostgreSQL connections/access](https://render.com/docs/postgresql-creating-connecting), [cron jobs](https://render.com/docs/cronjobs).

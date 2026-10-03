# Validation — 2026-10-03

The adopted local scope in [PLAN](../../PLAN.md) is implemented and verified with synthetic data. These results establish a usable local MVP, not commercial validation or public deployment readiness.

The original completion evidence below is retained as history. The newer authorized SMTP/deployment work and its current checks are recorded in the continuation section at the end of this document.

## Executed checks

| Check | Observed outcome |
|---|---|
| Frozen install | `npm ci` succeeded with the committed lockfile; no dependency range resolution needed |
| Bootstrap/repeat | `npm run bootstrap` succeeded repeatedly; migrations and generated seed preserved existing records |
| Build | Strict TypeScript check and Vite build passed; JS363.61kB raw/108.36kB gzip, CSS21.84kB raw/5.85kB gzip |
| Unit/integration | `npm test`: **71 passed** across domain20, API50 and migration-recovery1; real isolated PostgreSQL |
| Browser | `npm run test:e2e`: **10 passed**, final complete run at09:45 UTC,18.6s |
| Lifecycle | Actual `npm start`, Ctrl+C, bootstrap, `npm run dev`, Ctrl+C and `npm start` passed functional probes |
| Data preservation | Same user identities and counts after restart/dev/bootstrap:5 users,2 profiles,1 property,3 applied migrations |
| HTTP probes | Health, HTML, JS asset, synthetic landlord login, owned-property read, compatible-profile discovery, dashboard and logout passed in compiled and dev modes |
| Maintenance | `npm run maintenance` completed against the running local DB; no scheduler provisioned |
| Dependency check | `npm audit --json`: **0 known vulnerabilities**,222 dependency records; [registry result](evidence/dependency-audit.json) |
| Repository hygiene | Diff/relative-link checks; generated credentials, local database, browser traces and caches excluded from commits |

Runtime: Node24.19.0, npm11.9.0, native PostgreSQL18.4 (embedded-postgres18.4.0-beta.17), Chromium151.0.7922.173, non-root Linux x64. Only loopback3000/55432 remained listening after dev shutdown; dev API3001 stopped. The interactive npm wrapper returns interruption status on Ctrl+C; no application error dump or leftover active dev listener was observed.

The exact reusable install script is [cloud-install.sh](../../scripts/cloud-install.sh); [cloud-start.md](cloud-start.md) contains the saved startup instructions. Cloud draft persistence is recorded in PROJECT_STATE. Saving a draft does not publish, restore or execute it. Following explicit user authorization, the complete commit history was pushed normally to `claude/sweet-goldberg-5lwng7` and its remote SHA verified. Source recovery no longer depends on retaining unpublished local commits; cloud snapshot publication/restoration remains a separate unexecuted operation.

## Coverage and regressions

API tests cover password/session hashing, cookie/cache headers, roles/ownership, exact Origin, token purpose/single-use/reset revocation, deliberate publication, private discovery, compatibility boundaries, invitation races and revisions, blocked contact, reporting, staff scope, suspension/appeal/restore, own-data export/deletion and verification expiry. Final regressions cover suspended password recovery without lifting restrictions, exported own appeals, counts beyond100 invitations, older invitation lookup and guaranteed client release on migration cleanup failure. History beyond500 messages, changing discovery pages, missing/changed migration files and independent report retention are also checked.

Browser scenarios cover landing/keyboard/mobile, signup/local confirmation/profile publication, property validation/publication, two-user discovery→invitation→acceptance→chat→report→block, edited-offer invalidation, staff navigation, reset/malformed links, suspended rights/appeal/export/delete, session-outage retry and cold-load performance. The malicious-looking chat string in screenshots is an intentional synthetic XSS test rendered as text.

## Accessibility and visual inspection

Automated axe checks reported zero violations for the configured WCAG2A/AA and WCAG2.1AA rules on landing desktop/mobile, profile, property, discovery, chat and staff screens. Browser checks also cover keyboard skip navigation/focus, error guidance and horizontal overflow at320px for landing/profile and390px chat. This is not a full accessibility certification or a substitute for assistive-technology/user testing.

The coordinator inspected the following final screenshots for layout, hierarchy, visible controls and synthetic-only content:

- [Landing desktop](evidence/landing-desktop.png) and [landing mobile](evidence/landing-mobile.png).
- [Tenant profile](evidence/profile-desktop.png) and [compatible discovery](evidence/discovery-desktop.png).
- [Mobile closed/blocked chat](evidence/chat-mobile.png) and [staff selected case](evidence/staff-desktop.png).

Visual corrections included mobile illustration overlap, skip-link capture, SVG arrows instead of a missing glyph, mounted-heading focus and public content rendering without a session-loading layout shift.

## Measured local performance

[Machine-readable measurements](evidence/performance.json), final run2026-10-03T09:45:59Z. Cold Chromium cache, same local server; throttling via CDP.

| Scenario | Largest contentful paint | Cumulative layout shift | DOM content loaded | Resource transfer |
|---|---:|---:|---:|---:|
| Desktop loopback |244ms|0|122ms|386,900bytes|
|390px mobile emulation,4×CPU,200kB/s,80ms latency|2,252ms|0|2,160ms|386,900bytes|

Test budgets were LCP<5s, CLS<0.1 and resource transfer<500kB. Transfer is the sum of Resource Timing entries, excluding the navigation document. These are single synthetic runs, not field Core Web Vitals, percentile estimates, mobile hardware measurements or load-at-scale results. The first performance run exposed CLS0.1239 from session-gated rendering; fixing initial public rendering produced CLS0 in both scenarios, then the full suite passed.

## Independent review and remaining release work

Eight independent implementation reviewers and eight final reviewers inspected the work; the coordinator made the fixes and ran tests. [Review04](../reviews/review-04-implementation.md) and [review05](../reviews/review-05-final.md) record findings and resolutions. No critical or material local-scope issue remains identified by that panel.

CI configuration exists but no remote CI run is claimed. No public deploy, real email/identity/income integration, penetration test, production restore drill, full English translation, market-demand study, exposure-fairness validation, legal/naming clearance or production retention scheduler has been completed. Their owners and evidence requirements remain in the [release checklist](release-checklist.md).


## Completion follow-up: clean installation and logical recovery

On 2026-10-03 a fresh `git archive` of commit `de15065` was extracted into a temporary directory without node_modules, dist, database files or credentials. Frozen installation, bootstrap, build and actual startup all passed. Health, HTML/JS, login, owned properties, compatible discovery, dashboard and logout succeeded using newly generated accounts. The temporary service was stopped and the original application restarted. [Clean-install evidence](evidence/clean-install.json).

A consistent custom-format `pg_dump` snapshot of the original local database was restored using `pg_restore --exit-on-error --single-transaction` into a newly created disposable database. All 14 public tables and sequence values matched; the migration ledger passed validation. The restored application passed login, property/discovery and own-data export checks. The original database remained unchanged. The disposable database, dump and password file were removed. [Recovery evidence](evidence/recovery.json).

PostgreSQL client18.6 was downloaded through APT using the signed Debian unstable repository metadata and extracted without a system upgrade; it is compatible with server major18. No artifact-signature or checksum checks were disabled. The recovered seed contains5 users,2 profiles,1 property and3 migration records; contact/report tables are empty in this fixture. This proves local logical recovery of that fixture, not a production disaster-recovery exercise or cloud snapshot restore.

The cloud platform's publication/reconnection step is owned by the product interface. The available tools save/read configuration drafts and cannot publish a snapshot or start a restored task. The prepared environment is ready for that platform step; no further chat approval or credential is required for the completed local workflow.

## Continuation: real transport and deployment preparation

On 2026-10-03 the user selected real integrations and deployment preparation and requested a researched provider recommendation. [ADR0002](../adr/0002-deployment-providers.md) recommends Render Frankfurt, Brevo SMTP and OVHcloud for a future Italian domain. [Deployment instructions](deployment.md) describe the concrete staging templates; none was applied to a provider.

| Current check | Observed outcome |
|---|---|
| Frozen dependency installation | Updated lockfile installed successfully; nodemailer runtime and types added, tsx moved into runtime dependencies |
| Local bootstrap | Existing synthetic application records preserved; no remote destination used |
| Build | Strict TypeScript and Vite passed; JS366.34kB raw/108.92kB gzip, CSS21.84kB raw/5.85kB gzip |
| Unit/integration/SMTP | **136 passed across6 files**,15.29s: domain20, API50, migration recovery1, configuration26, deployment HTTP6, mail33 |
| SMTP protocol | Controlled loopback STARTTLS/SMTPS servers and test CA; authentication, accepted/refused recipient, refused certificate/auth and effective socket termination on deadline checked; no real recipient or provider used |
| Deployment HTTP | Secure Host-cookie creation and logout/reset/delete expiry attributes, exact origin checks, safe config response, trusted/untrusted forwarding and database-readiness failure checked |
| Browser | **14 passed**,20.7s after final cookie fixes: previous10 workflows plus4 mocked runtime/email scenarios, without external sends |
| Production-only runtime | `npm ci --omit=dev` in a temporary copy; no embedded database, bootstrap/seed or local state. Actual staging startup with external synthetic PostgreSQL passed frontend/health/live/config/HSTS-header probes; [runtime evidence](evidence/deployment-runtime.json) |
| Data preservation | Production-runtime probe observed unchanged counts:5 users,2 profiles,1 property,3 migration records; app DB was read only in that probe |
| Render/Compose | Official Render JSON Schema and Compose `config --quiet`/topology checks passed using fake fixture values; [template evidence](evidence/deployment-templates.json) and [schema snapshot](evidence/render-blueprint.schema.json) |
| Dependencies | npm audit **0 known vulnerabilities**,224 dependency records; [updated audit](evidence/deployment-dependency-audit.json) |
| Independent review | [Review06](../reviews/review-06-deployment-preparation.md): missing runtime brand module, cookie expiry and SMTP socket deadline findings corrected; no further material finding identified in its focused scope |

New [performance measurements](evidence/deployment-performance.json) use the same bounded Chromium setup, not field data: desktopLCP228ms/CLS0.0225; mobile4×CPU,200kB/s,80ms LCP2,264ms/CLS0.0345,389,975bytes of resource transfer. The new async runtime banner adds a small layout shift; the previous CLS0 result does not describe this revision. Axe/keyboard/responsive checks included in the browser suite passed within their configured scope.

The runtime smoke test occurred on this machine with a private HTTP listener; asserting an HSTS response header does not verify public TLS. Docker image build/run and certificate issuance were **not tested** because the environment's Docker socket was inaccessible. No SMTP provider credentials, domain, service account, paid resource, actual inbox delivery, public rollout or remote CI result exists for this continuation. No further push or cloud-draft update is claimed. Actual target checks for Render ingress trust/rate limits, provider delivery/quota, monitoring, maintenance execution and backup/restore remain open alongside the real-user release checklist.

SMTP token issuance remains synchronous, without a durable queue. Generic password-recovery status/body and rollback behavior are verified, but timing indistinguishability and provider acceptance-to-inbox delivery are not established. The source is prepared for the next configured staging verification, not declared production-ready.


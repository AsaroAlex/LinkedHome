# Validation — local MVP

The adopted local scope in [PLAN](../../PLAN.md) is implemented and verified with synthetic data. These results establish a usable local MVP, not commercial validation or public deployment readiness.

## Latest verification — 2026-10-04 (Europe/Rome)

The user explicitly confirmed a complete, verified local demo as the target. The current working tree passed `npm run build`, `npm test` (**73 tests in 3 files**), and `npm run test:e2e` (**13 scenarios**, final run 27.6 seconds). Repeated bootstrap preserved the fixture. `npm audit --json` reported zero known vulnerabilities across 222 dependency records; dependency files did not change.

The follow-up repairs three concrete issues: accepted/closed invitation explanations now use the same offered property snapshot as the displayed facts; failed property/discovery/chat loads offer retry without false loading or conversation states; message reports show their selected text and reset draft/result state when the target changes. Switching conversations clears the previous report and composer. Network and non-JSON failures have readable Italian messages, and long property titles/descriptions fit at 320px.

API regressions cover all five compatibility criteria, invitation list/detail, accepted/closed states and later tenant-preference edits. New browser scenarios simulate dropped requests, an HTML 503 response and a held conversation response; verify report contents actually saved in PostgreSQL; and exercise draft reset across messages and conversations. An independent static review of the complete diff found no further material issue. The final browser run includes the existing axe, keyboard, responsive and performance checks.

Compiled `npm start` passed health, HTML/JS delivery, tenant login/profile/invitation/export, landlord login/property/discovery/dashboard, admin login/report/analytics and logout probes. Application user identities and fixture counts remained unchanged: 5 users, 2 profiles, 1 property and 3 migrations. The app is running on loopback port 3000 at handoff; process persistence across tasks is not assumed.

[Readiness evidence](evidence/mvp-2026-10-04/readiness.json) records the base commit, SHA-256 of the tested source diff, runtime probes and screenshot hashes. [Performance](evidence/mvp-2026-10-04/performance.json): desktop LCP 308ms, throttled mobile LCP 2,312ms, CLS 0 in both runs; transfer 387,832 bytes. Raw timestamps are UTC; the heading uses the user's Europe/Rome date. These remain single synthetic runs.

Inspected current screenshots: [mobile landing](evidence/mvp-2026-10-04/landing-mobile.png), [mobile discovery after retry](evidence/mvp-2026-10-04/discovery-retry-mobile.png), and [selected-message report](evidence/mvp-2026-10-04/report-target-mobile.png). Earlier evidence below is retained as history. No production release, remote CI run, push of this follow-up or new cloud snapshot is claimed.

## Original validation — 2026-10-03

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

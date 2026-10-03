# Validation — 2026-10-03

The adopted local scope in [PLAN](../../PLAN.md) is implemented and verified with synthetic data. These results establish a usable local MVP, not commercial validation or public deployment readiness.

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

The exact reusable install script is [cloud-install.sh](../../scripts/cloud-install.sh); [cloud-start.md](cloud-start.md) contains the saved startup instructions. Cloud draft persistence is recorded in PROJECT_STATE. Saving a draft does not publish, restore or execute it. Local-only commits are not guaranteed to restore into another task; no push was performed to work around that limitation.

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

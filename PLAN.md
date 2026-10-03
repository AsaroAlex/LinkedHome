# Execution ledger — LinkedHome / Soglia

Updated 2026-10-03. User instruction: **execute all repository phases**. The original52-section brief is absent from the checkout; this ledger and the adopted feature contract define the reviewable local scope. Working name Soglia is not cleared for public use.

Research passed an independent bounded gate for synthetic local development. Production deployment, live provider integrations, outside studies and legal/brand clearance are separate [release gates](docs/operations/release-checklist.md).

| # | Phase | Status / evidence |
|---|---|---|
| 0 | Environment/repository inspection | DONE — current checkout, Node24/npm11/Git; existing isolated `work` branch preserved |
| 1 | International research | DONE — dossiers01/02/04/06; current source corrections and explicit unverified claims |
| 2 | Competitor analysis | DONE — Homeflow pre-launch, LocService29€/month corrections; no moat/traction inference |
| 3 | Italian market | DONE —17 totals/four scenarios checked; current Eurostat/Idealista slices; city remains hypothesis |
| 4 | Legal/privacy research | DONE for desk scope — inspected primary baseline, no deployment clearance; review02 |
| 5 | Product thesis | DONE — docs/product/01; independently reviewed |
| 6 | Priorities | DONE — docs/product/02 acceptance contract; external features deferred explicitly |
| 7 | Naming/branding | DONE as working name — Soglia centralized; no availability/clearance claim |
| 8 | UX architecture | DONE — docs/design/01, review03 |
| 9 | Design system | DONE — docs/design/02 and implemented responsive CSS |
| 10 | Technical ADR | DONE — Fastify/React/TypeScript/PostgreSQL; review03 and amendments |
| 11 | Scaffolding | DONE — manifest/lockfile/pinned runtime, scripts, CI definition |
| 12 | Database/domain | DONE — three SQL migrations, checksum ledger, native PostgreSQL, generated seed |
| 13 | Authentication | DONE — sessions, local confirmation/reset, role/rights controls |
| 14 | Tenant profile | DONE — private draft, publish/pause, approved matching fields |
| 15 | Landlord/property | DONE — owner edits, self-attestation, availability expiry/reconfirm |
| 16 | Matching | DONE — deterministic explained criteria, no person score, stable cursor order |
| 17 | Invitations | DONE — exact revisions, terminal-state contract and offer snapshot |
| 18 | Messaging | DONE — accepted participants, bounded history, block/close |
| 19 | Verification foundation | DONE — typed states/provenance/expiry/dispute; providers truthfully unavailable |
| 20 | Trust/safety/admin | DONE — case-scoped context, suspension/appeal/restore, export/delete and audit |
| 21 | Analytics | DONE — minimal local action counts, no market KPI claims |
| 22 | Tests | DONE — 71 unit/integration tests and 10 browser scenarios passed; operations/validation |
| 23 | Visual QA | DONE — final desktop/mobile screenshots inspected and retained in operations/evidence |
| 24 | Security | DONE for local scope — independent E/F review, fixes and dependency audit with 0 known vulnerabilities |
| 25 | Performance/accessibility | DONE — axe/keyboard/narrow-screen checks; measured desktop LCP244ms, throttled mobile2252ms, CLS0 |
| 26 | Documentation | DONE — README, demo, operations, evidence and tested cloud install/start instructions; install/start draft saved and repository membership aligned to the verified final local HEAD |
| 27 | Final adversarial review | DONE — eight independent final reviewers; review05 PASS for local synthetic scope |
| 28 | Fix material issues | DONE — material findings corrected and regressions passed; external release gates remain separate |

## Milestones and operating constraints

Local commits: `a5d4e80` research consolidation; `d47a214` independent research corrections; `c0180de` reviewed product/design/ADR; `0185593` implemented and tested local MVP. Final evidence is committed separately in this history. No push or PR was created. Remote target remains only `claude/sweet-goldberg-5lwng7`; never reset/switch the platform checkout or create a worktree unless explicitly requested.

Only generated local data: `.local/` and credentials remain ignored. Test DBs are `soglia_test` and `soglia_e2e`, distinct from `soglia`. Do not run database-owning lifecycle commands concurrently. The tested cloud install/start instructions are saved in the configuration draft. Saving is not publication or validation of a restored new task; restoration of unpublished local-only commits is not guaranteed.

## Completion and follow-on scope

All phases0–28 are complete for the adopted local synthetic scope. Run instructions are in README and cloud-start; exact verification is in docs/operations/validation.md. The current app is usable locally. Work toward real users must address the separately owned release gates; no current evidence establishes their completion. No public deployment, remote CI, outside study or fresh-task restoration is claimed.


Completion follow-up: clean-source install/start and isolated PostgreSQL logical recovery passed; see operations/validation. Platform snapshot publication remains an interface action unavailable through the current tools, not an unfinished repository implementation phase.

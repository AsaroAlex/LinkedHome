# Product decisions log

High-level product decisions, in chronological order. Each entry records the decision, the reasoning, the evidence it rests on, and the result. Technical decisions live in `docs/adr/`; this file is for product, market, brand and scope.

Format: **D-NNN — title** · date · status (`proposed` / `accepted` / `superseded by D-xxx`).

---

## D-001 — Research before product, brand or code

- **Date:** 2026-10-02 · **Status:** accepted
- **Decision:** No positioning, naming, design or implementation decision is taken until the research dossier in `docs/research/` exists and has passed the first critical review.
- **Reason:** The founding brief contains strong assumptions (reverse marketplace, Tenant Passport defensibility, Milan as obvious launch city). Each is cheap to validate now and expensive to unwind later.
- **Evidence:** Preliminary search identified an Italian competitor (Homeflow). Correction on 2026-10-03: its current FAQ says pre-launch; funding and operational launch were not established. See the primary-evidence recheck.
- **Result:** Research gate opened with seven parallel streams (see `PLAN.md` §1–4).

## D-002 — Local development must not require Docker

- **Date:** 2026-10-02 · **Status:** accepted
- **Decision:** The one-command bootstrap must work with either a native PostgreSQL or Docker Compose.
- **Reason:** The build environment used for this project has no Docker daemon; contributor machines vary. Requiring Docker would make the "clone → configure → start" promise false for some developers.
- **Result:** Bootstrap script will detect a reachable Postgres, otherwise try Compose, otherwise print precise instructions.

## Research checkpoint — 2026-10-02

D-001 remains in force. Research documents 01–10 and the single-agent A–H assessment in [review 01](reviews/review-01-research.md) are complete as documents; the research gate has **not passed**. Primary legal/market evidence and independent review remain outstanding. Bologna, pricing, providers and the technical stack are provisional research inputs, not approved product decisions. See [the synthesis](research/01-market-landscape.md) for reconciled conclusions.

## D-003 — Bounded research gate and full implementation scope

- **Date:** 2026-10-03 · **Status:** accepted
- **Decision:** Research gate passed for internal design and local synthetic development, after eight independent reviewers and strategy/legal follow-ups. The user requested the entire repository plan.
- **Evidence:** Review 02 and primary recheck, including competitor corrections and legal source hashes.
- **Boundary:** No proven market demand, moat, city superiority, trademark clearance, live identity/income provider or legal approval. These are launch conditions, not claims made by a local MVP.


## D-004 — Complete the synthetic local MVP with explicit release boundaries

- **Date:** 2026-10-03 · **Status:** accepted
- **Decision:** Implement the reviewed feature contract under the replaceable working name Soglia, using the accepted TypeScript/Fastify/React/PostgreSQL ADR. Local generated-token email confirmation demonstrates a workflow only; identity/income providers remain unavailable.
- **Evidence:** Independent product/implementation/final panels (reviews03–05),71 unit/integration tests,10 browser scenarios, actual install/start/dev/restart checks and recorded visual/performance evidence.
- **Result:** Phases0–28 complete for the adopted local scope. D-002's Docker-free requirement is met by native embedded PostgreSQL; the earlier proposed Compose fallback is superseded by the tested explicit local/external modes. Tests use isolated databases and preserve the application seed. Suspended users retain recovery/rights/appeal access. Report cleanup is manual, never promised as a hard retention maximum.
- **Boundary:** [Release gates](operations/release-checklist.md) remain outstanding. No public deployment, outside messaging, paid services or unrequested push/PR. Cloud draft saving does not verify fresh-task restoration of local-only commits.

## D-005 — Prepare real transport and hosted staging

- **Date:** 2026-10-03 · **Status:** accepted for implementation/preparation; provider choice recommended
- **Decision:** Following the user's selected scope «Integrazioni reali e preparazione del deploy» and request «Ricerca e dammi la migliore opzione», add authenticated SMTP, explicit local/staging/production runtime configuration, secure-cookie/proxy boundaries and deployment templates. Prefer Render Frankfurt, Brevo SMTP and OVHcloud for a future Italian domain; [ADR0002](adr/0002-deployment-providers.md) records alternatives, sources, costs and limits.
- **Result:** Real SMTP transport is implemented and tested against controlled loopback servers; staging templates include external PostgreSQL, explicit migrations/preflight, HTTPS and maintenance. Default local development remains synthetic and Docker-free.
- **Boundary:** No provider credentials, domain purchase, paid resource, public deployment or real email delivery is claimed. The release checklist still applies; Render ingress, delivery, backup/restore and live operations require verification on the selected target.

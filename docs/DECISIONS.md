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

## D-006 — Select Doorluma after international brand and domain research

- **Date:** 2026-10-03 · **Status:** superseded by D-007
- **Decision:** Following the user's domain/repository request, English/European preference and «Ricerca il miglior nome per il brand», select **Doorluma** with **doorluma.com** primary. `doorluma.eu` and `doorluma.it` are optional defensive domains. Supersedes the Soglia working-name portion of D-004.
- **Reason:** Eight letters, English “door” root and a warm coined ending; suitable for a housing brand beyond the invitation feature. “Luma” evokes light, rather than being presented as a universal English translation. [The historical comparison](product/03-naming-doorluma-2026-10-03.md) records pronunciation, dictation and category risks; NestInvite and Doorliva remain researched alternatives.
- **Evidence:** Official Verisign RDAP404 for `.com` and exact new-registration offers from Dominiofaidate for `.com`/`.eu`/`.it`; dated [domain evidence](operations/evidence/domain-research.json). No exact Doorluma use emerged in the bounded reviewed search, with nearby names explicitly recorded. No user naming study or legal clearance is claimed.
- **Result:** UI, HTML metadata, mail display name, service log and export filename use Doorluma; payoff “Affitti che iniziano da un invito.” [Domain setup](operations/domain-setup.md) prepares the future web/sender configuration. Technical storage/session identifiers remain stable; the narrow mobile header adapts to brand length.
- **Boundary:** Availability is time-sensitive, with no reservation, purchase, activated origin, public deployment or trademark clearance.

## D-007 — Adopt LinkedHome at the user's explicit request

- **Date:** 2026-10-04 · **Status:** accepted for naming and repository changes
- **Decision:** The user selected **LinkedHome** with «Procedi con linkedhome e procedi alle modifiche necessarie». Supersedes D-006's product name and proposed domain. Retain the payoff “Affitti che iniziano da un invito.” Prepare **linkedhome.eu** as the proposed future main domain; `.it` is optional and `.com` is already registered.
- **Reason:** The user prefers a natural, clear English compound with a logical connection to the service. “Linked” expresses connection and “home” covers residential living, including apartments, for both marketplace roles.
- **Evidence:** Exact registrar checks on 2026-10-04 confirmed new-registration offers for `.eu` and `.it`; Verisign returned a registered `.com` object. [Current naming research](product/03-naming.md) records the nearby real-estate brands Linkhome and Linkedhomes. This choice follows the user's preference and is not trademark clearance, a market validation result or a guarantee of international pronunciation.
- **Result:** The centralized name and slug update UI, mail, service logs, new synthetic income issuers and export downloads. HTML metadata and future domain/sender guidance use LinkedHome. Technical database/session/package identifiers and historical immutable observations are preserved; no migration is needed for the brand change.
- **Boundary:** No domain reservation or purchase, activated custom origin or sender, public deployment, provider activation or remote publication is implied. Trademark and similarity checks remain open.

## D-008 — Test a bounded installation before further commercial development

- **Date:** 2026-10-03 · **Status:** proposed; research integrated, demand unvalidated
- **Recommendation:** Test 790 € + IVA for one installed rental-intake workflow on an agency's own tools, with 49 € + IVA/month genuinely optional maintenance. Prioritize independent rental agencies with recurring requests and measurable work left unresolved by their CRM. Direct distribution first; Bologna remains a possible observation basin.
- **Reason:** Charge for a delivered process using existing agency demand; avoid financing a new renter audience or income-provider integration before a paid problem is proved. A 490 € setup model leaves little economic profit after founder time and startup.
- **Evidence:** [Consolidated analysis](research/12-sustainable-economics.md), [v1/v2 models and sources](research/economics-2026-10-03/README.md), [independent review08](reviews/review-08-economics.md). Numerical audits validate arithmetic; all commercial volumes, willingness to pay, savings and support inputs remain hypotheses.
- **Boundary:** This is not an implemented commercial pivot, approved city launch, validated price or permission for outreach/purchases. The existing LinkedHome marketplace and optional synthetic-income contract are preserved. F790 can outperform G mathematically under unproven price, activation and startup assumptions; G is the first experiment with limited investment, not a demonstrated universal profit maximum.

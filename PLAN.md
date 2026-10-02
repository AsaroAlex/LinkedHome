# PLAN.md — Execution Ledger

> Project: reverse rental marketplace, Italy-first (working name: TBD after Phase 7 naming research).
> Repository: `AsaroAlex/LinkedHome` — branch `claude/sweet-goldberg-5lwng7`.
> Started: 2026-10-02. This file is the single source of truth for phase status.
>
> Status legend: `TODO` · `IN PROGRESS` · `DONE` (verified) · `BLOCKED`
> Nothing is marked DONE unless it has been run, tested, or reviewed as stated.

## Phase ledger

| # | Phase | Status | Verified by |
|---|-------|--------|-------------|
| 0 | Environment / repository inspection | DONE | `git status`, tool version checks (see §0) |
| 1 | Market research (international) | IN PROGRESS | — |
| 2 | Competitor analysis | IN PROGRESS | — |
| 3 | Italian-market analysis | IN PROGRESS | — |
| 4 | Legal / privacy research | IN PROGRESS | — |
| 5 | Product thesis | TODO | — |
| 6 | Feature prioritisation | TODO | — |
| 7 | Naming / branding | TODO | — |
| 8 | UX architecture | TODO | — |
| 9 | Design system | TODO | — |
| 10 | Technical ADR | TODO | — |
| 11 | Repository scaffolding | TODO | — |
| 12 | Database / domain model | TODO | — |
| 13 | Authentication | TODO | — |
| 14 | Tenant onboarding / profile | TODO | — |
| 15 | Landlord / property flow | TODO | — |
| 16 | Matching engine | TODO | — |
| 17 | Invitations / mutual matching | TODO | — |
| 18 | Messaging | TODO | — |
| 19 | Verification foundation | TODO | — |
| 20 | Trust / safety / admin | TODO | — |
| 21 | Analytics | TODO | — |
| 22 | Testing | TODO | — |
| 23 | Visual QA | TODO | — |
| 24 | Security review | TODO | — |
| 25 | Performance / accessibility review | TODO | — |
| 26 | Documentation | TODO | — |
| 27 | Final adversarial review | TODO | — |
| 28 | Fix all material issues | TODO | — |

## §0 Environment inspection (DONE — 2026-10-02)

**Decision:** Repository is empty (no commits, no files). Initialise from scratch on the designated branch.

**Evidence:**
- `git status` → "No commits yet", working tree contains only `.git/`.
- Remote: `https://github.com/AsaroAlex/LinkedHome`.

**Toolchain available in the session container:**

| Tool | Version | Note |
|------|---------|------|
| Node.js | 22.22.0 | LTS |
| pnpm | 10.28.0 | preferred package manager |
| npm / yarn / bun | 10.9.4 / 1.22.22 / 1.3.14 | available |
| PostgreSQL | 16.14 (local cluster, started with `pg_ctlcluster`) | Docker daemon NOT running in this container → local dev must work without Docker |
| Docker / Compose | 29.6.2 / v5.3.1 (CLI only) | Compose file will be provided for developers who have Docker |
| Playwright Chromium | `/opt/pw-browsers/chromium-1194` | E2E + visual QA |
| Python | 3.11.15 | scripts only |
| Web research | WebSearch + WebFetch verified working | research date recorded in each doc |

**Resulting constraints:**
- One-command bootstrap must detect either a local Postgres or Docker Compose Postgres.
- No paid infrastructure is provisioned. Deployment is documented, not executed.

## §1–4 Research gate (IN PROGRESS)

Research date: **2026-10-02**. Fan-out across parallel research streams, each writing into `docs/research/`:

| Stream | Output | Status |
|--------|--------|--------|
| Direct reverse-rental competitors (Homeflow, MyTenant, Renter30, Want2Rent + discovered) | `02-competitor-matrix.md` | IN PROGRESS |
| Traditional portals + user pain points | `03-user-pain-points.md` + portal section of `02` | IN PROGRESS |
| Tenant screening / rental passport products | `04-feature-benchmark.md` | IN PROGRESS |
| Italian market data + launch-city matrix | `05-market-opportunity-italy.md` | IN PROGRESS |
| Business models + cross-industry matching patterns | `06-business-models.md`, part of `08` | IN PROGRESS |
| Legal / privacy / fairness (GDPR, Art. 22, Garante, anti-discrimination, AI Act) | `07-legal-privacy-risks.md` | IN PROGRESS |
| Synthesis: landscape, opportunities, sources | `01-market-landscape.md`, `08-product-opportunities.md`, `09-sources.md` | TODO (after streams) |
| First independent critical review (Reviewers A–H) | `docs/reviews/review-01-research.md` | TODO |

**Early signal (2026-10-02):** Homeflow (Brescia) launched September 2025 in Milan/Brescia/Bergamo with an AI "compatibility score" — an opaque numeric score is already in-market, which sharpens our explainable-signals differentiation. To be validated in stream 1.

## Decisions log (short form — see `docs/DECISIONS.md` for full rationale)

| Date | Decision | Reason |
|------|----------|--------|
| 2026-10-02 | Research gate before any product/branding/code | Mandated by brief; also the only way to not build on stale assumptions |
| 2026-10-02 | Local dev must work without Docker | Docker daemon unavailable in the build container; developers' machines vary |

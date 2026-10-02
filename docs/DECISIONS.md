# Product decisions log

High-level product decisions, in chronological order. Each entry records the decision, the reasoning, the evidence it rests on, and the result. Technical decisions live in `docs/adr/`; this file is for product, market, brand and scope.

Format: **D-NNN — title** · date · status (`proposed` / `accepted` / `superseded by D-xxx`).

---

## D-001 — Research before product, brand or code

- **Date:** 2026-10-02 · **Status:** accepted
- **Decision:** No positioning, naming, design or implementation decision is taken until the research dossier in `docs/research/` exists and has passed the first critical review.
- **Reason:** The founding brief contains strong assumptions (reverse marketplace, Tenant Passport defensibility, Milan as obvious launch city). Each is cheap to validate now and expensive to unwind later.
- **Evidence:** Preliminary search on 2026-10-02 already showed a funded Italian competitor (Homeflow) live in three cities with an opaque AI compatibility score, which materially changes the differentiation question.
- **Result:** Research gate opened with seven parallel streams (see `PLAN.md` §1–4).

## D-002 — Local development must not require Docker

- **Date:** 2026-10-02 · **Status:** accepted
- **Decision:** The one-command bootstrap must work with either a native PostgreSQL or Docker Compose.
- **Reason:** The build environment used for this project has no Docker daemon; contributor machines vary. Requiring Docker would make the "clone → configure → start" promise false for some developers.
- **Result:** Bootstrap script will detect a reachable Postgres, otherwise try Compose, otherwise print precise instructions.

## Research checkpoint — 2026-10-02

D-001 remains in force. Research documents 01–10 and the single-agent A–H assessment in [review 01](reviews/review-01-research.md) are complete as documents; the research gate has **not passed**. Primary legal/market evidence and independent review remain outstanding. Bologna, pricing, providers and the technical stack are provisional research inputs, not approved product decisions. See [the synthesis](research/01-market-landscape.md) for reconciled conclusions.

# 08 — Product opportunities and validation agenda

**Date:** 2026-10-02. **Status:** research-derived hypotheses, not an approved MVP scope or product thesis. Read [01](01-market-landscape.md), [07](07-legal-privacy-risks.md) and [review 01](../reviews/review-01-research.md) first. No customer interviews, experiments or implementation described here have been executed.

## 1. Candidate opportunities

| ID | Opportunity and proposed benefit | Evidence lead | Main uncertainty | Cheapest useful validation |
|---|---|---|---|---|
| O1 | Reusable structured profile with deliberate, revocable sharing; less repeated disclosure | 03 T5; 04 reusable dossier and export examples | Landlords may reject unfamiliar evidence; recipient copies cannot be revoked | Walk through synthetic dossiers with consenting users; observe information requests and explain limits |
| O2 | Landlord invitation and tenant acceptance for a specific current property | 02 reverse products; 03 L3 | Browsing cost, supply activation and tenant response | Compare mock invitation and inbound-application workflows on equivalent synthetic scenarios |
| O3 | Explainable compatibility on declared area, budget, dates, duration and occupancy | 02 scoring critique; 07 §§2–3 | Filtering/ordering can still exclude and reproduce proxies | Adversarial scenarios covering unknown data, changed criteria and exposure order |
| O4 | Scoped verification result rather than a raw document or global reliability score | 04 referencing vendors; 07 §§8–9 | Provider authorisation, cost, coverage, retention, false results and appeals | Obtain published terms and official authorisation evidence before any real-data trial |
| O5 | Credible current property and accountable landlord identity | 03 T1–T2 | Identity is not ownership, permission to rent or availability | Define separate check scopes; review synthetic fraud and stale-vacancy cases |
| O6 | Safe mutual-match messaging, blocking and reporting | 03 T8; 07 §§4, 12, 14 | Staff capacity and timely incident response | Tabletop abuse, impersonation and mistaken-ban scenarios |
| O7 | Landlord workflow that is useful before network density exists | 06 §C.3 | Legal classification of screening/concierge activity; scarce-side willingness to pay | Problem interviews and service-cost modelling after legal scope review |

The order is a research sequence: consent/control and contact value can be explored before committing to expensive regulated integrations. O4 is a dependency to assess, not permission to call unverified evidence verified. No novelty, adoption or revenue claim follows from a benchmark feature existing elsewhere.

## 2. Boundaries that apply to every opportunity

- Core discovery/invitations remain available without paid tenant visibility or optional financial verification.
- No opaque person-level score, learned matching/ranking or public negative-tenant registry. A categorical tier must not recreate the same judgment under another name.
- Pre-match cards use approved structured fields and an opaque identifier, without names/photos, employer, nationality, age or household-type filtering. Review budget, geography and occupancy for indirect effects.
- Missing data, pending checks, disputed outcomes and failures have different meanings and must stay distinct.
- Consent to publication, acceptance of an invitation and sharing a document are separate user decisions; do not release a dossier automatically on match.
- Italian-first product language with English prepared; avoid a nationality-dependent onboarding path.
- No real documents, bank credentials or personal data in research examples or development fixtures.
- No success/per-match fees, deposit handling, guarantees or negotiation services in the current research recommendation; flat verification fees still need a legal activity assessment.

These boundaries consolidate the founding constraints and research corrections. They do not certify legal compliance or settle feature prioritisation for Phase 6.

## 3. Experiment backlog and disconfirming outcomes

All counts and windows below are **proposed study designs**, not achieved sample sizes or industry benchmarks. A founder/research owner must approve a recruitment and consent plan before contacting people.

| Experiment | Proposed design | Decision evidence | Outcome that weakens the opportunity |
|---|---|---|---|
| E1 — Problem/disclosure study | Start with 6 tenants and 6 landlords in the Bologna catchment; include varied household and income situations; explicit consent, minimal notes | Concrete recent workflows, repeated effort, evidence recipients accept, actual workarounds | Main pain is solely unaffordable/absent stock, or dossier reuse is rejected by intended recipients |
| E2 — Contact-flow comparison | Counterbalance two synthetic workflows; keep property, applicant facts and task identical | Completion, errors, information demands, perceived control and effort; report raw observations | Invitation browsing adds work without improved relevance or control |
| E3 — Inclusion and explanation | Synthetic cases varying one approved matching criterion at a time; separately vary prohibited attributes with compatibility fixed | Which results change and whether the user can understand/correct them | Name, origin, language, income-check absence or an irrelevant proxy alters eligibility |
| E4 — Provider feasibility | Compare at least two candidate routes if available; read official terms, scope, fees and coverage; no live user data | Covered users, authorisation, costs per outcome, retention, failure/appeal path | A material target group has no equivalent route, or costs/staff effort make the service unattractive |
| E5 — Operating economics | Model free and paid usage, rechecks, refunds, support and acquisition with ranges | Break-even service volume and sensitivity to adverse assumptions | Profitability depends on free staff labour, repeated subsidies or an unsupported fee assumption |
| E6 — Limited pilot, later | Only after research, legal, privacy and implementation gates; explicit city/cohort definition | Observed invitation and viewing outcomes, harms, costs, cohort maturity | Many published profiles receive no relevant invitation; repeated supply inactivity or unresolved harms |

Twelve interviews are an initial qualitative sample, not statistical validation. Do not infer market rates from it. Stop or redesign a study if it needs sensitive data without an approved purpose and handling protocol. Research does not include impersonating a tenant, submitting false applications or paying for competitor accounts.

## 4. Measurement definitions for a later pilot

These definitions reconcile 06 §D; they are **not adopted KPI targets**. Use property-level vacancies and tenant search episodes rather than lifetime account counts. A new move creates a new episode; a relisted property needs a deduplication rule.

| Measure | Numerator / observation | Denominator / population | Important exclusions and caveats |
|---|---|---|---|
| Tenant opportunity within 14 days | Eligible published search episodes receiving at least one relevant, non-test property invitation | Published episodes with a full 14-day observation window in the pilot catchment | Report early withdrawals separately; no zero-day cohorts mixed in; no required paid/optional verification |
| Supply conversation within 7 days | Published genuine vacancies with at least one accepted invitation | Vacancies with a full 7-day window | Deduplicate property relists and users; disclose withdrawn/let-elsewhere records |
| Invitation acceptance within 72 hours | Unique invitations accepted within 72 hours of delivery | Valid delivered invitations with 72-hour observation | Track expired, withdrawn, blocked and undeliverable separately |
| Time to first invitation / accepted invitation | Elapsed time from publication, reported separately for tenant and vacancy | Full defined cohort, including observations without an event | Report censored/no-event counts; median among successes alone exaggerates performance |
| Viewing progression | Matches with a viewing explicitly reported by a participant | Mature mutual matches, with reporting coverage | Self-report is not confirmed tenancy; avoid counting duplicate events |
| Service contribution | Net revenue minus provider, review, support, processing, refund and variable subsidy costs | Paid and free checks separately, same period/currency | Separate acquisition and fixed costs; no inference of LTV from one check |
| Control/safety | Unwanted contacts, reports, appeals, deletion failures and resolution times | Define exposure denominators such as delivered invitations or active episodes | A low report rate may mean underreporting; do not optimise reports away |

Publication activation means a usable, deliberately published profile containing only required compatibility fields. It does **not** mean identity plus income verification. No live aggregate targets are set from the Airbnb 300-listing/100-reviewed analogy; local supply capacity and response rates must determine the pilot size.

Fairness assessment should first verify specified invariants and observe barriers without inferring protected characteristics. Group outcome comparisons require an independently justified data-collection protocol; aggregate invitation parity alone cannot prove fairness.

## 5. Provider and operational dependencies

| Dependency | What must be known before treating it as available |
|---|---|
| Identity / CIE / SPID / wallet | Private-provider admission, actual prices, released attributes, alternative routes and support |
| Income checks | Authorised service and downstream rights, country/account coverage, what the result proves, costs, raw-data exposure and disputes |
| Trust operations | Who reviews a false result, impersonation report or appeal, with staffing and access controls |
| Landlord/property checks | Distinguish person identity, authority over the property, and current availability |
| Portability | Recipient permission, expiry, intended evidence meaning and clear limits of downloaded copies |
| Economics | Willingness to pay, refresh frequency and all variable/fixed costs; no hardcoded €15–25 forecast |

No provider account, credential, contract, partner commitment or operating team has been provisioned by this research.

## 6. Explicitly deferred choices

Brand/name, product thesis, final MUST/SHOULD list, design system, data model, framework versions and production deployment remain later phases. Inherited technology recommendations are candidate inputs: six npm versions were rechecked, but no integrated application was built. Guarantee/insurance products, rent collection, contract filing, bureau reports and biometric processing remain separate feasibility tracks.

The immediate next action is to resolve the critical evidence items in [review 01](../reviews/review-01-research.md), then conduct the required independent review. Move to Phase 5 only with a recorded gate decision. Completing these research documents does not authorise beginning implementation.

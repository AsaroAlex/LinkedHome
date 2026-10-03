# 01 — Market landscape synthesis: reverse rental discovery in Italy

> Current correction: see [primary recheck](evidence/primary-recheck.md) and [independent review](../reviews/review-02-independent-research.md). Homeflow says pre-launch; LocService is €29/month and advertises a verified dossier; Bologna is a research catchment hypothesis. No verified moat, payer WTP, launch-city superiority or provider availability is claimed.


**Review date:** 2026-10-02. **Status:** research synthesis complete; evidence gate pending. This document consolidates [competitors](02-competitor-matrix.md), [user problems](03-user-pain-points.md), [features](04-feature-benchmark.md), [Italy and cities](05-market-opportunity-italy.md), [business models](06-business-models.md), [legal risks](07-legal-privacy-risks.md) and [technology](10-technology-landscape.md). It does not approve a product thesis, launch city or pricing.

## 1. What the evidence can support

**HYPOTHESIS:** a reusable, selectively shared tenant profile could reduce repeated disclosure and the effort of arranging relevant conversations. The inversion of contact—landlord invites, tenant accepts—needs to prove that it saves landlords time and gives tenants useful opportunities. It does not increase the housing stock or guarantee payment.

The dossiers suggest a crowded landscape rather than an empty category. Their search excerpts and vendor statements provide leads for research, not proof of adoption, profitability or customer preference. This continuation retrieved selected primary legal, competitor and market sources (see the recheck). Other sources remain inaccessible or unrefreshed. No interviews, live product walkthroughs or pilot transactions have been conducted.

**Evidence labels:** FACT = directly checked in this continuation or an explicitly stated reproducible computation; REPORTED = attributed to an inherited dossier, not newly confirmed; CLAIM = vendor/third-party assertion; HYPOTHESIS = explanation to test; ASSUMPTION = a chosen input. Original dossier labels do not automatically carry over as FACT. Source identifiers are namespaced in [09](09-sources.md).

## 2. Competitive structure

| Category | Examples reported in the dossiers | Relevant mechanism | What remains uncertain |
|---|---|---|---|
| Reverse discovery | Homeflow, LocService, Renter30, Preferred Tenants; Kamernet's profile browsing | Tenant profile; property criteria; landlord-initiated contact | Current geography, prices, active vacancies, invitation rates, checks and commercial viability |
| Portals with applications/profiles | Idealista, Immobiliare.it, Zillow, Leboncoin | Existing discovery distribution plus applications and messaging | Exact Italian scope; whether features create a comparable end-to-end workflow |
| Reusable dossiers / referencing | DossierFacile, Canopy, Goodlord, OpenRent; Italian certificate vendors | Collect once, share evidence, sometimes integrate identity/income providers | Cross-border legal fit, coverage, buyer acceptance and true verification scope |
| Managed / guaranteed rental | Zappyrent and other management/guarantee providers | Sell risk transfer or managed service as well as discovery | Economics and regulatory obligations differ from a neutral software service |
| Informal substitutes | Agencies, personal networks, social groups, email and messaging | Distribution, local trust and manual screening | Cohort-specific switching cost, privacy exposure and willingness to change |

Sources: 02 §§1–3; 03 §2; 04 §§2–7. **MyTenant and Want2Rent remain unconfirmed identities**, not proven absent competitors. Do not count them as established products or silently substitute namesakes.

Homeflow's advertised AI compatibility is an inherited **CLAIM**, not an audited algorithm or evidence of unlawful processing. Its expansion beyond the reported cities is unknown. LocService demonstrates a reported precedent for reverse contact, not a causal proof that this business will work in Italy. International prices and fee restrictions require jurisdiction-specific treatment.

## 3. Problem synthesis

| Actor | Working job-to-be-done | Supporting lead | Alternative explanation / disconfirming evidence needed |
|---|---|---|---|
| Tenant | Present relevant information once and control who sees it | Repeated-document and disclosure complaints, 03 T5; passport precedents, 04 | Landlords may refuse external evidence; repetition may be a minor problem relative to rent and availability |
| Tenant | Receive relevant, current invitations without exposing identity publicly | Stale-listing, response and discrimination themes, 03 T1–T4 | A reverse flow may yield fewer opportunities when few landlords actively browse |
| Landlord | Arrange viewings with interested candidates with less effort | Screening/no-show themes, 03 L2–L3 | Browsing tenants may take longer than responding to inbound leads |
| Landlord | Understand the scope of available evidence without handling excess documents | Trust and forgery concerns, 03 L1–L2 | A check cannot guarantee payment, contract compliance or vacant possession |
| Both | Decide whether to proceed without pressure, scams or irrelevant disclosure | Cross-dossier themes in 02–04 | Verification badges can create misplaced confidence or exclude thin-file applicants |

These are **HYPOTHESES**, not measured Italian population frequencies. Public reviews are selected, often negative, and mix product, agency and market experiences. Search summaries cannot establish survey sample size or causality. The numerical examples in legacy jobs-to-be-done are illustrative unless traced to a specific cohort and source.

Do not infer that all Italy suffers from hundreds of applicants per listing. National portal indicators, city averages, room searches and peak-season anecdotes describe different populations. Nor do national vacant-home counts measure stock available to a new service: condition, geography, ownership and willingness to rent constrain access.

## 4. City choice and sensitivity

The 05 §C model gives **Bologna 4.32, Padua 3.74, Pisa 3.53 and Milan 3.50 out of 5**. These are calculated weighted judgments, not measured market outcomes. All 17 totals were recomputed from the published 11 scores and weights; each matched.

| Weight scenario | Bologna | Padua | Milan |
|---|---:|---:|---:|
| Published base | 4.32 | 3.74 | 3.50 |
| Competition and CAC weights halved | 4.40 | 3.72 | 3.73 |
| Student weight removed | 4.24 | 3.71 | 3.33 |
| Equal weights | 4.27 | 3.73 | 3.45 |
| Young-professional, rent-pressure and availability weights doubled; competition/CAC removed | 4.31 | 3.52 | 4.17 |

Method: sum(score × weight) / sum(weights); round only the final result. The last scenario uses total weight 109. The checked arithmetic establishes reproducibility, **not validity of the input judgments**. Original confidence labels count reported facts, not independent primary-source verification. Competition/CAC assumptions and uncertain landlord availability may materially change the scores themselves.

**HYPOTHESIS:** use Bologna as the first research location because the model favours compact, concentrated demand. Keep Padua and Milan as comparators. Padua is not a proven second-city decision: Milan slightly overtakes it in one scenario, and Pisa's base score sits between them with low evidence confidence. The earlier Milan-first proposal in 06 §C.5 is superseded as a research default, not disproved as a possible launch strategy.

Before selecting a launch city, verify OMI flows versus housing stock, current local vacancy channels, comparable demand periods, supplier accessibility and the exact catchment. Interview consenting users across varied income/document situations. No promised partnership or cheap acquisition channel is assumed from the existence of a university or municipal programme.

## 5. What may differentiate—and what is easy to copy

**HYPOTHESIS:** the useful combination is controlled disclosure, accurate and contestable evidence, and a relevant mutual-contact workflow. A profile form, badge or reversed invitation button alone is readily copied. Vendor integrations can be purchased by competitors; portability can reduce lock-in rather than create a moat.

Possible defensibility would have to emerge from local active supply, operational trust, genuinely useful partner integration and sustained outcomes. Do not claim a network effect from registrations, total stored profiles or data hoarding. A verified profile that is never considered is not liquidity; a mutual match is not a signed lease.

Privacy and fairness are design obligations and hypotheses for user value, not guarantees of differentiation. Assessment must include unknown/unverified evidence, foreigners, students, families and non-standard income without classifying people as inherently good or bad tenants.

## 6. Business-model synthesis

**PROPOSED FOR VALIDATION:** free core access for tenants and landlords, with no tenant fee for visibility or invitations. Investigate a flat verification service paid by landlords only if buyers value its precise scope and provider, support and compliance costs permit it. The inherited €15–25 bracket is a pricing **ASSUMPTION**, not willingness-to-pay evidence.

A useful contribution expression is:

`net service revenue − provider costs − review/support cost − refunds/fraud/processing cost − variable acquisition subsidy`.

Use revenue excluding VAT and consistent currency/time units; avoid mixing one-off checks with monthly landlord revenue. A positive per-check margin is not lifetime profitability: repeat use, acquisition, fixed compliance/operations costs and churn remain unknown. No TAM/SAM/SOM or financial forecast is established by these dossiers.

No success/per-match fee is recommended. Flat fees also require an assessment of the actual activity under Italian mediation rules; they do not supply a safe harbour. Guarantees, rent collection, contract filing and insurance referral bring distinct obligations and are not validated revenue lines. See 07 §§11–12.

## 7. Reconciled research conclusions

| Conflict / overstatement in legacy dossiers | Controlling research conclusion |
|---|---|
| Milan-first sequencing in 06 versus Bologna matrix in 05 | Bologna-first **research hypothesis**; launch and expansion remain undecided |
| Success/per-match fees in 05 versus their rejection in 06 | Exclude from current recommendation; no fee model is declared mediation-exempt |
| SPID/CIE "free" and mandatory; biometric/open-banking checks as MUST | Costs, inclusion and access unverified; evaluate optional providers and equivalent alternatives |
| Result-only "score/tier" and future ML in 04 | No tenant-worth score or ML matching; separate scoped check results from compatibility |
| Income/identity verification required for tenant activation in 06 | Optional checks cannot define core activation or hide unverified tenants |
| Generic large-market critical-mass benchmark from Airbnb | No transferable 300/100 threshold for Italian long-term rental liquidity |
| English-first sentence in 05 | Italian-first with English prepared; language is not a matching attribute |
| Automatic five-year event retention / mandatory biometrics | No universal adoption; purpose-based assessment and minimisation in 07 |

These are research corrections and scope boundaries, not completion of Phase 5 or a technical ADR. The targeted source-dossier notes point here and to 08 to prevent contradictory implementation instructions.

## 8. What closes the research gate

See [review 01](../reviews/review-01-research.md) for owners, severity and resolution evidence. Current primary corrections and the independent reviewer resolutions are recorded in review 02. Interviews, provider eligibility/costs and legal advice remain explicitly separate validation work; no contact or spending is authorised merely by listing them.

The research documents are now assembled and reviewed from eight perspectives. **Independent strategy and legal follow-up found no remaining critical blocker for internal design with synthetic data, subject to the recorded editorial corrections. No real-user launch is approved by this desk-research gate.**

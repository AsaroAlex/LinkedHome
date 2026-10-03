# 06 — Business models, unit economics and cold-start strategy

> **Research review — 2026-10-02:** This dossier contains inherited evidence and provisional recommendations. Except for the specifically logged checks in [09](09-sources.md), source access has not been repeated in this continuation. [01](01-market-landscape.md) reconciles conclusions; [08](08-product-opportunities.md) records hypotheses and boundaries; [07](07-legal-privacy-risks.md) controls legal caveats. These documents supersede conflicting implementation/pricing suggestions below. Current primary corrections and access limits are recorded in [the recheck](evidence/primary-recheck.md); the current gate decision is in [review 02](../reviews/review-02-independent-research.md).
> **City correction:** the Milan-first sequence in §C.5 is retained as an earlier hypothesis; use Bologna as the provisional research location, not an approved launch decision.

Reverse rental marketplace, Italy-first (tenants build profiles → landlords discover and invite → mutual match → chat → viewing → rental).

| Field | Value |
|---|---|
| Research date / access date for all sources | **2026-10-02** |
| Stream | Business models + cross-industry matching patterns (PLAN.md §1–4) |
| Status | Draft v0.1 — evidence-constrained (see "Research constraints" below) |
| Evidence labels | **FACT** = read from a primary source or a verbatim mirror of one · **FACT-S** = read from a secondary/tertiary source (verify before external use) · **HYPOTHESIS** = our inference from evidence · **ASSUMPTION** = unverified input, carried from the brief or prior knowledge, to be replaced · **NOT FOUND** = searched, no usable source reachable |

## Research constraints (read first)

1. The session's `WebSearch` budget was exhausted after the first two queries of this stream (ImmoScout24 Suchen+ pricing; SpareRoom Early Bird pricing). Those two results are used as search-snippet evidence [S1]–[S4].
2. The network egress proxy blocked every direct `WebFetch` to commercial, government, academic and media domains tested (immobiliare.it, idealista.it, zappyrent.com, openrent.co.uk, zillow.com, housinganywhere.com, spareroom.co.uk, avail.co, turbotenant.com, goodlord.co, rentila.com, rentger.com, rentberry.com, gov.uk, normattiva.it, gazzettaufficiale.it, agenziaentrate.gov.it, istat.it, bancaditalia.it, eur-lex, confedilizia.it, polimi.it, esn.it, milanoabitare.org, crif.it, dossierfacile.logement.gouv.fr, a16z.com, lennysnewsletter.com, medium.com, nfx.com, cdixon.org, abovethecrowd.com, techcrunch.com, news.ycombinator.com, arxiv.org, reddit.com, wikipedia.org, web.archive.org, bing.com, duckduckgo.com). Per the proxy README these are organisation policy denials and were not routed around.
3. Reachable channels: `github.com` / `raw.githubusercontent.com` (public repositories, read via WebFetch), the GitHub code-search API, and PubMed. Evidence below therefore comes from (a) verbatim GitHub mirrors of primary documents (Lenny's Newsletter issues, a Lenny's Podcast transcript, UK statutory instruments, Italian ministerial decrees, the DossierFacile source repositories, a beta.gouv.fr blog post), (b) secondary research documents published in public repositories, each labelled FACT-S, and (c) peer-reviewed papers via PubMed.
4. **The 35-source target is met numerically (55 entries in §G) but not qualitatively**: most first-party pricing pages in the brief could not be fetched. Every such gap is marked NOT FOUND with the exact URL to re-fetch in §H. Numbers are never invented; where the brief itself supplied a figure (e.g., "OpenRent £49", "Milan 1-bed €1,000–1,400") it is carried as ASSUMPTION, not FACT.

---

## A. Monetisation models — model-by-model analysis

### A.0 Summary table

| # | Model | Who pays | Price evidence (label) | Willingness-to-pay evidence | Effect on liquidity | MVP fit | Long-term fit | Regulatory risk (IT) |
|---|---|---|---|---|---|---|---|---|
| 1 | Tenant subscription | Tenant | ImmoScout24 Suchen+ €12.99–39.99/mo by tier/term [S1][S2] FACT-S; WG-Gesucht Plus €13.90–20.90/mo [S7] FACT-S; SpareRoom Early Bird £15/7d, £27/14d, £30/28d [S3] FACT; dozens of DE/FR auto-apply tools €9–149/wk [S7] FACT-S | Strong in supply-starved cities (Berlin, Paris, Munich): a whole paid-tool ecosystem exists [S7]; IS24 claims "at least 54% more viewing invitations" for subscribers [S7] | **Suppresses demand-side volume and creates two-class tenants**; paywalled "MieterPlus-exclusive" listings provoked a user-built browser extension to hide them [S5] | Poor (tenants are the abundant side; pay-to-apply backlash) | Only for non-core conveniences; never for applying or being seen | Medium: a fee contingent on finding a home looks like *provvigione* (L. 39/1989) [S22][S23] HYPOTHESIS; UK bans tenant fees tied to a tenancy [S8] |
| 2 | Landlord subscription / per-listing fee | Landlord | OpenRent: tenants free, referencing £30 paid by landlord, Rent Now holds deposit [S7] FACT-S; Rent Now £49 ASSUMPTION (brief; page blocked); Immobiliare.it / Idealista private-listing prices NOT FOUND; Zillow Rental Manager listing fee conflicting tertiary claims [S51] NOT VERIFIED | Zillow "subsidised leads in almost all marketplaces, slowly turned on pricing as value was proved" [S18] FACT | Charging the scarce side early suppresses supply; charge only after value is proven | Free at MVP; optional paid add-ons | Core long-term revenue (per-property or per-month) | Activity-dependent; a flat fee is not a mediation exemption (07) |
| 3 | Pay-per-match / per-contact / unlock | Landlord (or tenant) | Flatfox: optional landlord "bid paid only if tenant is chosen" [S7] FACT-S (reported); Zazume (ES) 50% of one month's rent, success-based [S7] FACT-S; Nestraq £0.49 per address reveal (B2B) [S7] FACT-S; Idealista Spain pay-per-lead NOT FOUND; Zumper PowerSearch $24.99 [S7] reported | Thin; dating-style unlocks exist but no pricing fetched | Per-contact fees raise the cost of the first invitation → fewer invitations → lower match rate (HYPOTHESIS) | Poor | Possible as "invite credits" for high-volume agencies only | **High if contingent on the deal** (= provvigione → mediazione) [S22]; low if priced per contact regardless of outcome |
| 4 | Success fee on rental | Landlord and/or tenant | Italian norm: *provvigione* due from both parties "on conclusione dell'affare" (artt. 1754–1755 c.c.) [S22] FACT-S; "1 month + VAT per side" ASSUMPTION (brief; verify); Spain analog "agency fee 1 month + IVA" [S50] FACT-S; Zappyrent / Housfy / Dove.it / Casavo pricing NOT FOUND | Market-proven (every agency) | Highest take per transaction, but requires the platform to *conclude* deals → operational drag | No | Only via a licensed partner (agency/mediatore) or own licence | **Highest**: unlicensed mediation → no right to the fee + sanctions; chamber of commerce commissions must report abusive mediators [S23][S24] FACT-S |
| 5 | Agency / property-manager SaaS seats | Agency / PM | Goodlord referencing "variable" [S7] FACT-S; Rentila, Rentger NOT FOUND; Hired "subscription model for employers plus success fees" [S38] FACT-S | B2B SaaS WTP generally robust (no Italian datapoint found) | Neutral-to-positive: brings professional supply with many units | Later (needs product maturity) | Strong second-stage revenue | Low (software licence) |
| 6 | Verification fee | Tenant or landlord | Zillow reusable application $35 for 30 days [S7] FACT-S; TransUnion SmartMove $25–49 [S7]; SingleKey CAD 29.99 one-time reusable [S7]; Idealista "solvency certificate" €9.99 in ES/PT/**IT** [S7] FACT-S; Flatfox debt-register extract CHF 29.90 [S7]; DossierFacile (FR) free, state-run [S26][S29] FACT; CRIF visura cost NOT FOUND | Proven on both sides; public free alternative (DossierFacile) sets the price ceiling in FR | Positive if the dossier is reusable (one fee, many applications); negative if per-application | **Yes — best MVP revenue line**, charged to landlords "bring your own applicants", tenant basic dossier free | Keep; add premium verifications | Activity-dependent: assess GDPR, credit-data rights and mediation together (07) |
| 7 | Insurance / rent-guarantee referral | Landlord (or tenant) | Garantme (FR) ~€270/yr [S7] FACT-S; Flatfair deposit alternative 28% of one month [S7]; Visale (FR) free, state-backed [S7]; DossierFacile auto-validates Visale-eligible dossiers free [S28] FACT; Zappyrent / Garantitaly / Affitto Sicuro / Idealista Garanzia commissions NOT FOUND | Guarantees are a top landlord anxiety; referral commissions standard in FR (no IT figure found) | Positive: lowers landlord risk → more invitations to "thin-file" tenants | Partner referral only (no own underwriting) | Strong adjacency | Medium: insurance intermediation rules (legal stream) |
| 8 | Contract services (registration, cedolare secca, e-sign) | Landlord | Cedolare secca 21% ordinary / 10% canone concordato; registration tax (~2% of annual rent) waived under cedolare [S25] FACT-S; prices of Immobiliare.it contract service / Rentila NOT FOUND | Every letting needs registration → recurring need | Positive: "come for the tool" hook for landlords [S21] | Yes as free tool (single-player value) | Paid tier later | Low |
| 9 | Property-management upsell | Landlord | DoveVivo / Zappyrent management % NOT FOUND; US tertiary "7–10% monthly + placement fee" [S51] NOT VERIFIED | Market-proven (co-living operators) | Positive but operationally heavy | No | Partner referral | Medium (mediation/management licences) |
| 10 | B2B API / "Tenant Passport" licensing | Portals, agencies, PMs | DossierFacile Connect: partner demo tooling [S27], OAuth2 integration by a third-party tool [S30], partner API in backend [S28] FACT; Experian Rental Exchange exists as a fixed-width batch data exchange (v2.5) [S52] FACT-S; Canopy API pricing NOT FOUND | Precedent of adoption (state-run, free); commercial pricing unknown | Strongly positive: dossier becomes useful off-platform → tenants complete profiles even at zero liquidity | Design for it (export/share link) at MVP; licence later | Potential moat | Medium–high: data-sharing consent, profiling (legal stream) |

### A.1 Tenant subscription — detail

- **ImmoScout24 (DE), "Suchen+" (formerly MieterPlus).** Search-snippet evidence dated September 2026: three tiers × three terms: Standard €29.99 (3 mo) / €19.99 (6 mo) / €12.99 (12 mo); Pro €34.99 / €24.99 / €17.99; Unlimited €39.99 / €34.99 / €29.99 per month [S1][S2] (FACT-S; both aggregator pages were blocked for direct fetch, so prices come from the search result summary). Features per an ImmoScout24 working-student report and a Dutch competitor study: increased visibility of applications, SCHUFA credit check, auto-apply "Bewerbungsassistent" (Unlimited), AXA key emergency service, storage service [S6][S7]. IS24 markets "at least 54% more viewing invitations" and a 40% SCHUFA discount [S7].
- **Backlash evidence.** A public browser extension, *HideMieterPlus*, exists solely to "hide MieterPlus exclusive and sponsored listings on ImmoScout24", targeting listing cards with `paywall-label` / `plusBooking` classes [S5] (FACT). This confirms (i) ImmoScout24 gates some listings behind the tenant subscription and (ii) users resent it enough to build tooling against it. In a reverse marketplace, the analogue would be gating *invitations* behind a tenant paywall — the same resentment with an added fairness/discrimination angle (legal stream).
- **SpareRoom "Early Bird" (UK/US).** £15 for 7 days, £27 for 14 days, £30 for 28 days; US $14 / $25 / $28; new free ads under 7 days old are reserved for Early Bird users [S3][S4] (FACT via snippet of SpareRoom's own help pages). Operating in the UK after the Tenant Fees Act 2019 (in full force since 1 June 2019 [S8]) — HYPOTHESIS: a platform search-visibility subscription not tied to a specific tenancy sits outside the Act's prohibitions on landlords/agents (s.1–s.3); needs legal confirmation.
- **The "auto-apply" tool market** (Germany/France) shows extreme tenant WTP in supply-starved cities: WG-Gesucht Plus €20.90 (1 mo) / €19.90 (3 mo) / €13.90 (12 mo); Wohnly €19.99–39.99/mo; Get The Flat €78–82/mo; Prems (FR) €29–149/week; LocService €29/mo; Sherlok €34–48/mo [S7] (FACT-S, research date 2026-09-23). Read-across: tenants will pay when supply is the bottleneck — but what they pay for is *reach*, which a reverse marketplace gives them for free by design. Monetising it would cannibalise the core promise.
- **Italy-relevant datapoint:** Idealista sells a "solvency certificate" to tenants for €9.99 (within 12 h) in ES/PT/IT [S7] (FACT-S) — i.e., a tenant-paid *verification*, not a subscription.
- HousingAnywhere, Uniplaces, Badi Pro, Spotahome, Rentberry pricing pages: **NOT FOUND** (searched: WebFetch to each pricing page → egress blocked; GitHub code search). Secondary: HousingAnywhere tenant fee "~25%" is marked *reported, unverified* in [S7]; Uniplaces and Spotahome "no tenant subscription stated" [S7]; an Italian founder's competitor notes describe HousingAnywhere as "fee alta per inquilino" and Spotahome as "costoso per landlord" [S45] (tertiary opinion).
- **Italian fee classification:** assess the actual activities and relevant current rules; neither flat subscriptions nor outcome-independent charges establish an exemption (07).

### A.2 Landlord subscription / per-property fees — detail

- **OpenRent (UK).** Verified by the Dutch competitor study: free for tenants; masked messaging and "Book Viewing"; "Rent Now" holds the holding deposit; referencing £30 paid by the landlord; digital contracts; free utilities concierge [S7] (FACT-S). The brief's "£49 Rent Now" price is **ASSUMPTION** (pricing page blocked).
- **Immobiliare.it / Idealista (IT) private-landlord prices:** NOT FOUND (searched: both publish-ad pages blocked; GitHub code search for Italian listing-price mentions → nothing usable). An Italian founder's competitor matrix characterises Idealista's private-landlord experience as "contatto diretto (spam di chiamate), niente profili inquilini" [S45] (tertiary) — supportive of the reverse-marketplace pain point but not a pricing fact.
- **Zillow Rental Manager / Apartments.com / Avail / TurboTenant:** pricing pages NOT FOUND. Tertiary and *conflicting* GitHub claims (Zillow "listing syndication (free)" in one persona document vs "$520/year" in another startup's launch plan; Apartments.com "~$29–58 per successful lease") [S51] — do not cite externally. Verified datapoint: Zillow reusable rental application $35 for 30 days, paid by the applicant [S7].
- **Pricing-timing precedent (strong):** Zillow "subsidised leads in almost all marketplaces, slowly turned on pricing as value was proved" [S18] (FACT, Lenny's 2019 marketplace study). HYPOTHESIS: the same taper applies to landlord fees here; Chen's advice is to "subsidize the scarce side early — guarantees, bonuses, zero fees — and publish the taper so trust survives the rollback" [S56] (digest of *The Cold Start Problem*).

### A.3 Pay-per-match / pay-per-contact — detail

- Flatfox (CH) lets landlords auto-invite applicants and offers an "optional bid paid only if tenant is chosen" [S7] (reported). Zazume (ES) charges 50% of one month's rent, success-based [S7] (verified by that study). Nestraq (UK, agents) charges £0.49 per address reveal [S7]. Idealista Spain agency pay-per-lead: NOT FOUND.
- Dating-app unlock mechanics: pricing NOT FOUND; behavioural evidence from PubMed: the probability of receiving a reply "drops markedly with increasing difference in desirability between the pursuer and the pursued" [S33] — read-across: if landlords must pay per invitation, they will rationally target only the most "desirable" (highest-income) profiles, worsening fairness and lowering overall match rates (HYPOTHESIS).
- **Regulatory scope (IT):** inherited internal competitor notes [S22] are not authoritative law. Per-contact, subscription and success pricing all require activity-specific mediation assessment; no fee formula alone decides status.

### A.4 Success fee on rental — detail

- Italian structure: the *mediatore* "puts two or more parties in relation to conclude a deal" (art. 1754 c.c.); provvigione is due by both parties on *conclusione dell'affare* (art. 1755 c.c.) [S22]. Enrolment: SCIA via Comunicazione Unica, REA registration (ATECO 68.31), moral + professional requisites, exam, mandatory RC insurance; every *preposto* who mediates must be registered [S22][S23]. Chamber-of-commerce commissions "are required to report to the judicial authority those who abusively exercise, even discontinuously, the profession of mediator" (L. 39/1989 art. 7 c.6, quoted in the ministerial decree notes) [S24] (FACT, mirror of Gazzetta Ufficiale text). Unlicensed actors cannot claim the fee and face sanctions [S23].
- Typical fee level "one month + VAT per side": **ASSUMPTION** (brief). Analog: Barcelona guide "Agency fee: 1 month + IVA" [S50] (FACT-S, Spain). The 1994 Italian research note found only a *sale* figure (2–3% of price) [S53] — not rents. **NOT FOUND** for Italian rental norms via reachable sources.
- Zappyrent, Housfy, Dove.it, Casavo models: NOT FOUND (all domains blocked; GitHub mentions of Zappyrent are only scrapers and hiring tests [S44]).
- **Product boundary:** no success fee, paid contact unlock or mediated transaction in this local scope. A separate entity, licence or partner arrangement is not an automatic exemption for the platform; assess each actual role before offering services.

### A.5 Agency / property-manager SaaS seats — detail

- Goodlord's pricing page was blocked; the Dutch study recorded only "referencing: variable (30% instant)" [S7]. Rentila and Rentger: NOT FOUND.
- **SaaS fee caveat:** a non-contingent software charge does not establish exclusion from mediation rules. Apply 07 to actual activities.

### A.6 Verification fee — detail

- Price points (FACT-S, [S7], research date 2026-09-23): Zillow reusable application $35 / 30 days (tenant); TransUnion SmartMove $25–49 (tenant); SingleKey CAD 29.99 one-time, reusable across landlords (tenant); Idealista solvency certificate €9.99 in ES/PT/IT (tenant); Flatfox eSchKG debt-register extract CHF 29.90 (tenant); OpenRent referencing £30 (landlord); Canopy RentPassport "pricing not stated".
- **DossierFacile (France) — the free state benchmark.** Operated by the Ministère de la Transition écologique, open-source (MIT) [S29]; "vérifie gratuitement le dossier des locataires"; by 23 Nov 2020: 635,000 documents uploaded, 234,000 dossiers created, 92.2% user satisfaction [S26] (FACT). A later third-party business plan cites "250 000 dossiers validés" and dropped its own dossier vault because "DossierFacile le fait mieux, gratuitement, avec le label de l'État" [S31] (FACT-S). Product facts from the backend repo: dossiers can be shared by link/mail; a "full PDF" export exists with distinct rendering for unverified vs validated dossiers (validated PDF carries République Française / DossierFacile logos); Visale-eligible dossiers are auto-validated free [S28] (FACT).
- CRIF visura (IT) cost: NOT FOUND (crif.it blocked).
- Verdict: the reusable verified dossier is both the single-player value for tenants (§C) and the first revenue line — charged to landlords per applicant check ("bring your own applicants"), with the tenant's basic dossier free. HYPOTHESIS on price: €9.99 (Idealista IT tenant certificate) to €30 (OpenRent landlord referencing) brackets the market; model at €15–25 per landlord check until tested.

### A.7 Insurance / rent-guarantee referral — detail

- Garantme (FR, guarantor) ~€270/year, certified in 24 h [S7]; Flatfair deposit replacement 28% of one month's rent [S7]; Visale free, state-backed [S7]; DossierFacile integrates Visale eligibility and auto-validates such dossiers [S28]. Italian products (Zappyrent guarantee, Garantitaly, Affitto Sicuro, Idealista Garanzia) and commission structures: NOT FOUND.
- Verdict: referral-only at MVP (no underwriting). The guarantee is the lever that makes landlords invite thin-file tenants (students, foreigners, freelancers) — directly raising invitation rates on the demand side.

### A.8 Contract services — detail

- Cedolare secca: 21% ordinary rate on free-market residential leases between private individuals; 10% on *canone concordato* leases in high-tension municipalities (3+2, student, transitory 1–18 months), subject to territorial agreements and association certification; reserved to natural persons outside business activity; under cedolare the ~2% registration tax on annual rent is waived; since 1 Jan 2024 short lets are taxed 21% on the first property and 26% from the second [S25] (FACT-S, tax-advisor article). Service prices (Immobiliare.it contract service, "Contratto Semplice", Rentila): NOT FOUND.
- Verdict: a free contract/registration/cedolare helper is a classic "come for the tool" hook for the scarce side [S21][S18] and a later paid tier.

### A.9 Property-management upsell — detail

- DoveVivo / Zappyrent full-management percentages: NOT FOUND. Only unverified US tertiary figures exist [S51]. Verdict: partner referral, not own operations, until post-PMF.

### A.10 B2B API / Tenant Passport licensing — detail

- **DossierFacile Connect** is a partner integration: the ministry publishes "Outils de démonstration de DossierFacileConnect à destination des partenaires" [S27]; a third-party landlord tool lists "DossierFacile Connect OAuth2" integration in its roadmap [S30]; the backend distinguishes partner visibility (`tenant_userapi`) from link/mail sharing [S28] (FACT). This is the closest precedent to a "Tenant Passport" API — adoption driven by being free and state-labelled.
- **Experian Rental Exchange (UK)** exists as a batch data exchange (a public repo implements its "v2.5 fixed-width layout", one detail record per tenancy) [S52] (FACT-S). Canopy API, Rightmove tenant referencing: NOT FOUND.
- Verdict: build export/share-link from day one (it is also the tenant's single-player value), expose a partner API once there are >1,000 verified dossiers, and treat licensing as a long-term line.

---

## B. Unit-economics inputs (Italy)

### B.1 Price and fee inputs

| Input | Value | Label | Source |
|---|---|---|---|
| Agency fee per rental, Italy | "1 month + VAT per side" | ASSUMPTION (brief; verify with FIAIP/Altroconsumo/Idealista guides — see §H) | — |
| Legal basis for fee from both parties | provvigione due by both parties on conclusione dell'affare (artt. 1754–1755 c.c.) | FACT-S | [S22] |
| Analog (Spain) agency fee | 1 month + IVA | FACT-S | [S50] |
| Analog (Spain) tenant-paid success-based placement | Zazume: 50% of one month's rent | FACT-S | [S7] |
| Cedolare secca | 21% (ordinary), 10% (concordato); registration tax (~2% of annual rent) waived under cedolare | FACT-S | [S25] |
| Lease types / durations | 4+4 free-market; 3+2 concordato; student; transitory 1–18 months | FACT-S | [S25] |
| Milan 1-bed rent | "~€1,000–1,400/month" | ASSUMPTION (brief). Reachable evidence only qualitative: Corriere della Sera, 30 Jan 2026, reports Milan prices "fly" with the Olympics and "rents are also rising", citing Immobiliare.it Insights, without figures in the mirrored feed [S49] | [S49] |
| Verification price bracket | tenant certificate €9.99 (Idealista IT) … landlord referencing £30 (OpenRent) … tenant application $35/30 d (Zillow) | FACT-S | [S7] |
| Tenant subscription bracket (DE) | €12.99–39.99/mo (IS24 Suchen+); €13.90–20.90/mo (WG-Gesucht Plus) | FACT-S | [S1][S2][S7] |
| Guarantee referral analog (FR) | Garantme ~€270/yr | FACT-S | [S7] |
| Take-rate reference points | Airbnb 15% (hosts); Substack ~13%; Toptal ~40%; "marketplaces that drive demand start at ~20%, platforms ~10%"; rule "Take rate = Convenience + Demand − Competition" | FACT (Lenny, 2021-04-06) | [S13] |

### B.2 Acquisition-cost inputs

| Input | Value | Label | Source |
|---|---|---|---|
| Portal marketing spend (Immobiliare.it, Idealista, Zillow, OpenRent, Rightmove) | NOT FOUND (annual reports / 10-K blocked; GitHub code search → nothing) | NOT FOUND | — |
| Meta ads CPC/CPL Italy real estate | NOT FOUND (WordStream/Meta benchmarks blocked) | NOT FOUND | — |
| Reverse-marketplace paid channels | Hired: "We saw success with ads on LinkedIn, FB, and Google. Also niche podcasts and newsletters. Surprisingly effective and low CAC." Vettery: "Paid social was extremely effective early on. LinkedIn Sponsored Updates and Text Ads were top performers." Job boards ≈ 50% of Vettery's early supply | FACT (Lenny, 2021-07-13) | [S11] |
| Performance marketing for *supply* in classic marketplaces | Uber: least efficient channel (worst signup-to-participation conversion); Lyft used SEM/display/Facebook | FACT-S (digest of Lenny 2019) | [S18] |
| Referral share of supply | Airbnb: referrals ≈ 10–15% of all new supply; Uber: ≈ 33% of first trips from referrals and highest-quality drivers; Uber growth mix at scale "50% paid, 15% referrals, 35% WOM" (early: "30% referrals, 50–60% WOM") | FACT | [S16][S18] |
| Referral bonus examples (labour marketplaces) | Pared $50 per activated professional; Roo $300 per referred vet completing first shift | FACT | [S11] |
| Manual onboarding cost proxy | Vettery: 20-minute phone calls to build candidate profiles | FACT | [S11] |
| Paid-acquisition evaluation metric | DoorDash "time to contribution-margin break-even": how many months to earn back $5 of CAC | FACT | [S16] |

### B.3 Lifetime-value logic

| Side | Frequency / tenure logic | Evidence | Label |
|---|---|---|---|
| Landlord | Repeat need every tenancy turnover; Italian leases 4+4 / 3+2 / transitory 1–18 months [S25]; turnover every ~2–4 years (brief). French landlord-tool study assumes rotation "~2–3 ans" [S32] | FACT-S / ASSUMPTION | Repeat use → subscription/SaaS logic viable; multi-unit landlords and agencies have the highest frequency |
| Tenant | One-time need per move; low frequency; Gurley: "monogamous, infrequent" categories struggle to build habit [S20] | FACT-S | Low LTV → do not build the model on tenant payments; monetise the dossier's reuse (B2B) instead |
| Cross-side conversion | Demand → supply loops: Square ~1% of buyers became merchants; Eventbrite 34% of creators discovered it as attendees; Aalto (real estate) 11% of buyers also want to sell [S15] | FACT | HYPOTHESIS: tenants who later buy/let (or landlords who are also tenants) are a small but real loop; design the "I also own a flat" prompt |

### B.4 Parametrised contribution model (template — all inputs to be replaced)

```
Per landlord-year (scenario variables, not observed outcomes):
  units u; turnover per unit/year t; shortlisted applicants c
  proportion needing a new or refreshed check n; paid uptake a; net price p
  subscription s (zero in the local MVP); referral revenue excluded
  Billable checks = u * t * c * n * a
  Gross revenue = billable checks * p + 12 * s
  Contribution = revenue - paid AND free check/provider/review/support/refund costs
  Then assess acquisition and fixed costs separately.
  Earlier €33/€800 illustrations assume n=a=1 and zero costs: upper scenarios,
  not profit, measured WTP, or evidence that any segment can carry CAC.
```

---

## C. Cold-start and network-effects findings

### C.1 Framework evidence (what the canon says)

| Principle | Statement | Source (label) |
|---|---|---|
| Atomic network | "The 'atomic network' is the smallest network needed that can stand on its own." "Your product's first atomic network is probably smaller and more specific than you think." Slack: "under ten in a single company"; Uber: "5pm at the Caltrain station at 5th and King St."; credit cards needed "an entire city" | Andrew Chen excerpt, Lenny's Newsletter 2021-12-09 [S9] FACT |
| Hard side | "the hard side by work done, not money paid: a few percent of users create most of the value"; "build product and economics for the hard side first; the easy side mostly needs a clean consumer experience"; "subsidize the scarce side early — guarantees, bonuses, zero fees — and publish the taper" | Digest of *The Cold Start Problem* [S56] FACT-S |
| Single-player mode / Flintstoning | "a single-player tool… recruits the hard side one by one before any network exists"; "Founders manually supply content, inventory, or matchmaking until the network stands alone" (never fake users) | [S56] FACT-S; Dixon 2015 "Come for the tool, stay for the network" [S21] (not fetched; cited via mirrors) |
| Supply-first | 80% (14 of 17) of marketplaces studied started with supply; exceptions: supply trivially easy (Rover, TaskRabbit — which "had to charge application fee to slow supply") or supply is public data (Zillow) | Digest of Lenny 2019 [S18] FACT-S |
| Constraint patterns | ~40% always supply-constrained (Uber, Lyft, OpenTable, DoorDash); ~40% vary by geography/category (GrubHub, Thumbtack, Airbnb); a few always demand-constrained (Rover, TaskRabbit, AngelList) | [S18] FACT-S |
| Levers | Direct sales (~60% of companies), referrals (~33%), piggybacking existing networks (~33%), word of mouth (~25%), employees as supply, single-player mode (OpenTable: software "90% of pitch"), events, loops, SEO, community, performance marketing; "Median number of levers per company = 2… find your 1–2 working levers and double down" | [S18] FACT-S |
| Critical mass | Airbnb: "300 listings, with 100 reviewed listings" per market; "less than three reviews, nothing changes… more than ten, everything changes"; Paul Graham: ~30 days of in-person engagement made the difference | Lenny 2019-06-26 [S12] FACT |
| Constrain the market | Level 1 "thimble": "getting the product market fit really, really right with this… small, constrained market"; DoorDash "went after the suburbs… very little competition"; measure "happy GMV", cohort retention and organic growth, not raw volume | Sarah Tavel, Lenny's Podcast 2023-12-27 [S10] FACT |
| Market quality | Gurley's 10 factors: new experience vs status quo; economic advantage both sides; room for tech to add value; fragmentation both sides; low supplier sign-up friction; market size; ability to expand the market; frequency; payment flow; network effects | Above the Crowd 2012-11-13 [S20] (digest) FACT-S |
| Evaluating the idea | 7 marketplace-specific criteria incl. supply-side PMF, demand-side PMF, scalability with quality, frequency × AOV, on-platform retention, "non-monogamous" repeat behaviour, fragmentation | Lenny 2020-06-23 [S17] FACT |
| Piggybacking | Airbnb posted ~60,000 listings to Craigslist via automation; Uber recruited drivers on Craigslist; Uber paid drivers $30/hour to be online in new cities; OpenTable built reservation software first | [S19] FACT-S (cites HBS Working Knowledge, not fetched); [S18] |
| Zero-downside pitch | GrubHub: "you only pay when you receive orders… no hidden fees… cancel any time"; list every objection and remove it | [S18] FACT-S |
| Guarantees > bonuses | Uber "$40/hr guarantee with 70% acceptance rate" requirement; income floors anchor supply behaviour | [S18] FACT-S |

### C.2 Which side is scarcer in Italian rentals — and which side to subsidise

**Finding (HYPOTHESIS, evidence-backed): homes (landlords) are the scarce *and* hard side; subsidise landlords; keep tenants free but never pay them.**

1. In the reverse model, the landlord is the party that must *act* (search, invite, screen, show). By Chen's definition the hard side is the minority doing disproportionate work [S56]; here that is unambiguously the landlord.
2. Supply is the binding constraint in big-city Italian rentals: a January 2026 Corriere della Sera report describes Milan prices "flying" with the Olympics and rents rising [S49]; the German/French "auto-apply bot" economy [S7] shows what demand-side desperation looks like when supply is short. The read-across for Milan (HYPOTHESIS) is that tenants will come if landlords are there, not vice-versa.
3. Reverse marketplaces fail when the *courted* side stops being scarce: Hired's model "required tight labor markets; post-2022 tech layoffs inverted supply-demand dynamics", alongside a narrow vertical and "high acquisition and assessment costs versus per-hire revenue"; Hired was absorbed into LHH by 2024 and "didn't survive independently" [S37][S38] (FACT-S; verify with TechCrunch/Underdog.io — §H). **Lesson:** in Italian rentals the courted side (tenants) is *not* scarce, so the reverse mechanic cannot be sold to landlords as "access to scarce tenants". It must be sold as *time saved and risk reduced* (pre-verified, pre-filtered, no phone spam) — which is a tool proposition, hence "come for the tool".
4. Student-housing analogue reasoning (tertiary but apt): "For Roost that is owners. There are fewer of them, each is worth many bookings, and they can be recruited by hand… Students arrive in a burst each June and cannot be stockpiled… Subsidize the hard side, with free listing and verification for the first season" [S47].
5. Caveat from Lenny's data: markets "vary by geography/category" (~40%) [S18]. In secondary Italian cities with slack rental markets the constraint may flip; the sequencing in §C.5 therefore starts in a supply-constrained city where the thesis is strongest.

**Subsidy design (HYPOTHESIS):** zero fees for landlords for the first season in the launch district; free verification credits for each posted vacancy; a published taper ("free until N invitations / until month 6") per [S56]; no cash bonuses to tenants (they are the easy side; "the easy side mostly needs a clean consumer experience" [S56]).

### C.3 Single-player value hypotheses at zero liquidity

Tool-to-marketplace conversion must be measured separately: among consenting tool users with a current vacancy, how many publish it, invite a previously unknown platform tenant and return voluntarily at their next eligible opportunity? Existing-applicant checks are not new supply, matches or marketplace retention. The examples below are candidates, not adopted MVP scope; no importing third-party applicants or automatic dossier disclosure.

| Side | Single-player value | Precedent | Label |
|---|---|---|---|
| Tenant | **Reusable verified dossier** with a share link and a PDF export, usable today on Idealista/Immobiliare/WhatsApp. The dossier carries explainable, verified signals (identity, income proof, references) and a "verified by" mark | DossierFacile: share by link/mail, full-PDF export, distinct rendering for verified vs unverified, 234k dossiers by Nov 2020 while free [S26][S28]; third parties abandoned competing vaults because the free, state-labelled dossier won [S31] | HYPOTHESIS (product), FACT (precedent) |
| Tenant | Tenant-side "deal-breaker" filters that save time (budget, pets, contract type) | Online-dating research shows users apply non-compensatory "deal breakers" in multistage screening [S35]; applied here to both sides | FACT (research) / HYPOTHESIS (application) |
| Landlord | **Free screening tool — "bring your own applicants"**: paste the applicants from any channel, send them a link to build the dossier, get a comparable, verified shortlist. Zero network needed | OpenTable's software was "90% of pitch" before the marketplace [S18]; Dixon's "come for the tool, stay for the network" [S21]; Zillow attracted demand with public data before listings [S18] | HYPOTHESIS / FACT (precedents) |
| Landlord | Free contract + registration + cedolare-secca helper; reminder of the 10% concordato option in high-tension cities | Tax facts [S25] | HYPOTHESIS |
| Landlord | "Zero downside" promise: no fee until a tenant moves in, no exclusivity, cancel anytime | GrubHub pitch [S18] | HYPOTHESIS |

### C.4 Partnership candidates to seed supply (Italy)

Precedent of partnership-led seeding: HousingAnywhere + universities — **NOT FOUND** (housinganywhere.com blocked; GitHub search → 0); DossierFacile Connect partner programme [S27] (FACT). The named Italian organisations below are **ASSUMPTION** candidates from prior knowledge, except where a reachable source confirms existence (noted).

| Channel | Candidate organisations (Italy) | Why | Evidence status |
|---|---|---|---|
| Landlord associations | **Confedilizia** (Confederazione italiana della proprietà edilizia) — existence confirmed by Constitutional Court records and as CCNL signatory [S54]; **UPPI**; **APPC**; **ASPPI** | Direct access to small private landlords; co-branded free verification/contract tool; they also certify concordato leases [S25] | FACT (existence of Confedilizia) / ASSUMPTION (others; partnership) |
| Condominium administrators | **ANACI**, **ANAPI**, local *amministratori di condominio* | One administrator touches hundreds of units; vacancies surface early | ASSUMPTION |
| Municipal social-rental agencies | **Milano Abitare** ("agenzia sociale per la locazione", cited as a model by a civic programme [S46]) | Public-interest alignment on concordato leases; landlord trust | FACT-S (existence) / ASSUMPTION (partnership) |
| Universities / student services | Politecnico di Milano, Università Statale, Bocconi, Università di Bologna, housing offices; **ESN Italia** / Erasmus offices | Demand bursts at semester start (cannot be stockpiled [S47]); universities distribute the dossier tool to incoming students | ASSUMPTION (all sites blocked) |
| Employers / relocation | HR teams of large Milan employers; relocation agencies; co-living operators (DoveVivo and peers) for overflow | Pre-verified, salaried tenants are the profiles landlords most want; employers can bulk-onboard dossiers | ASSUMPTION |
| Small agencies / property managers | Independent agencies holding mandates | Bring 20+ units each (see B.4 economics) and may have relevant licences; platform activity and each party’s mandate still require review (07) | HYPOTHESIS |
| Job boards / newsletters (reverse-marketplace precedent) | City newsletters, expat groups, LinkedIn/Meta ads | Hired/Vettery: job boards ≈ 50% of early supply; LinkedIn sponsored updates top performer; "surprisingly low CAC" [S11] | FACT (labour analog) |

### C.5 Sequencing recommendation: city → segment → channel

1. **City:** Bologna is a proposed research catchment, not an approved launch city. Use the corrected comparable indicators and input uncertainty in 05. Homeflow currently says pre-launch; no outside funding, live score or three-city liquidity has been established.
2. **Segment:** supply = private landlords with 1–3 units plus 3–5 small agencies in those districts; demand = salaried relocators and graduate students with complete, verified dossiers. Do not adopt the Airbnb 300/100 analogy [S12] as a launch threshold; determine pilot capacity from local cohorts and observed outcomes (08 §4).
3. **Channel (supply):** direct sales + landlord associations + condominium administrators (direct sales was the #1 lever for ~60% of marketplaces [S18]); Vettery-style 20-minute onboarding calls [S11]; founder-hosted landlord meetups [S12]; referrals with a modest activation bonus for landlords who bring landlords (Airbnb 10–15% of supply from referrals [S16]).
4. **Channel (demand):** university/ESN/employer distribution of the free dossier; SEO on "dossier affitto / documenti per affittare"; the dossier's share link is itself a viral loop (every off-platform use advertises the product).
5. **Flintstone the first matches:** investigate a manually supported workflow only after mediation, privacy and recruitment review; no live shortlisting is authorised by this research [S56]; report "time-to-first-invitation" weekly.

---

## D. Marketplace metrics — definitions and benchmarks

### D.1 Definitions (our proposed instrumentation; HYPOTHESIS unless sourced)

| Metric | Definition for this product | Rationale / source |
|---|---|---|
| Supply liquidity | % of posted vacancies that receive ≥1 accepted invitation within 7 days; % let within 30 days | Tavel: measure happiness of each transaction and cohort retention, not raw GMV [S10] |
| Demand liquidity | % of completed tenant dossiers that receive ≥1 invitation within 14 days of completion | Reverse of the above; the "empty feed" failure mode [S56] |
| Time-to-first-match | Median hours from vacancy post → first mutual match; from dossier completion → first invitation | Chen's atomic network must "stand on its own" [S9] |
| Happy-match rate | % of mutual matches that progress to a viewing; % of viewings that progress to a signed lease | "Happy GMV" [S10] |
| Activation (landlord) | Deliberately published current vacancy; report tool-only use separately | A check on an existing applicant does not establish marketplace supply |
| Activation (tenant) | Usable profile with required compatibility fields deliberately published; identity/income checks optional | Deliberate publication with required compatibility fields; optional evidence must not gate invitations |
| Invitation acceptance | % of landlord invitations accepted by tenants within 72 h | Reverse-recruiting analog (Hired interview requests) [S37] |
| Supply critical mass per district | No adopted threshold; the 300/100 analogy is not a validated Italian pilot requirement | Historical Airbnb analogy [S12], not a transferable target |
| Paid-acquisition health | Months to contribution-margin break-even per landlord cohort | DoorDash metric [S16] |

### D.2 Benchmarks found

| Benchmark | Value | Source (label) |
|---|---|---|
| Share of marketplaces starting supply-first | 80% (14/17) | [S18] FACT-S |
| Airbnb critical mass | 300 listings / 100 reviewed per market; >10 reviews changes conversion | [S12] FACT |
| Referral share of new supply | Airbnb 10–15%; Uber ~33% of first trips | [S16][S18] FACT / FACT-S |
| Demand→supply conversion | Square ~1%; Eventbrite 34% of creators discovered via events, 17% convert within 12 months; Aalto 11% of buyers also want to sell | [S15][S18] FACT / FACT-S |
| Supply guarantee acceptance threshold | Uber $40/hr guarantee conditional on 70% acceptance rate | [S18] FACT-S |
| Reverse-recruiting selectivity | Hired admitted ~5% of candidates to the marketplace; employers sent "interview requests" with salary upfront | [S37] FACT-S |
| Hired employer outcome claim | "employers on their platform hired candidates 4x faster" (marketing claim) | [S38] FACT-S (unverified claim) |
| InMail response rate | 10–15% typical, 15–25% good, 25%+ excellent (sales-outreach playbooks); another playbook: <5% poor, 5–10%, 10–15%, >15% | [S39][S40] FACT-S (tertiary; LinkedIn's own figures NOT FOUND) |
| Dating reply dynamics | Reply probability "drops markedly with increasing difference in desirability"; users pursue partners ~25% more desirable than themselves | Bruch & Newman 2018 [S33] FACT |
| Dating market structure | Geographic proximity is the strongest driver; markets partition into submarkets by age/ethnicity | Bruch & Newman 2019 [S34] FACT |
| Screening behaviour | Multistage "deal-breaker" screening rules identified from 1.1 M decisions | Bruch, Feinberg & Lee 2016 [S35] FACT |
| Dating funnel variables | Number of matches, contacts and resulting offline dates are measured stages (no public rates) | Vera Cruz et al. 2024 [S36] FACT |
| Airbnb host service levels | Superhost: 90% response rate within 24 h + 4.8 rating; Vrbo Premier Host: 90%+ acceptance rate (one source says 99% for 2026 — conflicting) | [S42] FACT-S (Airbnb/Vrbo pages NOT FOUND) |
| Profile completeness effect (LinkedIn "40x") | Flagged as "very old LinkedIn statistic… treat as unverifiable folklore" by an independent research note | [S41] FACT-S (negative finding) |
| DossierFacile adoption while free | 234,000 dossiers; 635,000 documents; 92.2% satisfaction (Nov 2020) | [S26] FACT |
| Tenant subscription uplift claim | IS24 Suchen+: "at least 54% more viewing invitations" (vendor claim) | [S7] FACT-S |
| Take rates | Airbnb 15%, Substack ~13%, Toptal ~40%; marketplaces that drive demand ~20%, platforms ~10% | [S13] FACT |

### D.3 How reverse-recruiting marketplaces measured success — and why Hired declined

- Mechanics (FACT-S [S37]): pre-assessed candidates build profiles with target salary/role/location; companies send *interview requests* with salary upfront; candidates only receive offers at or above their stated minimum; ~5% candidate acceptance into the marketplace created scarcity and quality signalling.
- Growth tactics (FACT [S11]): job boards, targeted direct outreach, paid referrals, paid social; Vettery's 20-minute profile-building calls; Hired "concentrated on select geographies first".
- Decline (FACT-S [S37][S38]; verify §H): founded 2012; Vettery (Adecco) acquired Hired in November 2020; rebranded Hired March 2021; "absorbed into LHH Recruitment Solutions by 2024". Stated structural causes: model required tight labour markets and inverted after the 2022 tech layoffs; narrow vertical; high acquisition/assessment cost per hire; only ~5% overlap between the merged customer bases.
- Read-across for rentals (HYPOTHESIS): (i) do not depend on scarcity of the courted side; (ii) keep assessment cost per tenant near zero (self-serve verification, automated document checks as DossierFacile does with OCR/file-analysis components [S29]); (iii) monetise the inviting side on *frequency* (agencies/PMs) not only on one-off private landlords; (iv) Otta/Wellfound metrics: NOT FOUND.

---

## E. Recommendation

### E.1 MVP monetisation (months 0–9)

- **Free core for both sides**: tenant dossier, landlord discovery, invitations, chat, viewing scheduling. Rationale: landlords are the scarce/hard side to be subsidised [S56][S18]; tenants are the abundant side and charging them to apply/be seen reproduces the MieterPlus backlash [S5] and risks the provvigione reading [S22].
- **One paid line: verification credits for landlords, "bring your own applicants"** — a per-applicant verified check in the €15–25 bracket (HYPOTHESIS; brackets from Idealista IT €9.99 tenant certificate and OpenRent £30 landlord referencing [S7]), with N free credits per posted vacancy during the launch season and a published taper [S56]. This is single-player (works with zero liquidity), non-contingent on any letting (no mediation exemption established; legal classification remains open under 07 §11), and tests WTP on the scarce side without suppressing supply.
- **Zero success fees, zero per-match fees, zero tenant fees.** Partner referrals for guarantee/insurance and contract registration may be wired in but generate no revenue target at MVP.
- Liquidity impact: positive on supply (free listing + free tool), neutral on demand (free), and the dossier share link acts as off-platform distribution for tenants.

### E.2 Long-term monetisation (after liquidity in ≥2 districts)

1. **Landlord/agency SaaS**: per-property monthly or per-vacancy flat fee (never % of rent, never contingent) [S22]; agency seats with bulk verification — the Hired "subscription for employers" structure [S38] without the contingent component.
2. **Verification and trust products**: tiered checks, re-verification, "verified landlord" badge (OpenRent/Spotahome/HousingAnywhere all badge verified landlords [S7]).
3. **Guarantee / deposit-alternative referrals** (Garantme/Flatfair-type partners; Italian partners TBD) — raises invitation rates to thin-file tenants and earns commission.
4. **Contract services**: paid e-sign, registration filing, cedolare option handling [S25].
5. **Tenant Passport API / licensing** to portals, agencies and PMs once dossier volume is meaningful (DossierFacile Connect precedent [S27][S28]; Experian Rental Exchange as the data-exchange analog [S52]).
6. **Optional tenant conveniences** only (e.g., instant re-verification, document storage) — never visibility or invitation access; keep the SpareRoom-style "early access" model out, since gating invitations is both a fairness risk and a backlash risk [S5].
- Liquidity impact: fees land on the side with repeat use (landlords/agencies, B.3) after value is proven [S18]; tenants remain free, keeping demand abundant.

---

## F. Risks

| Risk | Evidence | Mitigation |
|---|---|---|
| **Intermediation licence (L. 39/1989)** triggered by any fee contingent on a letting, by "collecting or transmitting offers", or by negotiating terms | [S22][S23][S24] FACT-S | Assess the actual activity with Italian counsel; flat fees do not establish exemption. No success/per-match fees or payment/negotiation services are adopted (07 §11) |
| **Pay-to-apply backlash / two-class tenants** | HideMieterPlus extension [S5]; paid auto-apply arms race [S7] | No tenant paywall on applying/being seen; publish fairness rules |
| **Courted side not scarce → reverse mechanic loses its pitch** | Hired decline [S37] | Sell time/risk reduction to landlords; measure time-to-first-match, not "exclusive access" |
| **Fairness/discrimination in invitation targeting** | Reply-probability gradients by desirability in dating markets [S33]; submarket partitioning [S34] | Explainable signals only; test specified fairness invariants; protected-group monitoring requires a separately lawful research protocol (07 §3) |
| **Free public competitor for the dossier** | DossierFacile displaced private vaults in France [S31] | If an Italian public dossier emerges, pivot to integration (Connect-style API) rather than competition |
| **Subsidy rollback kills supply** | Chen: publish the taper [S56] | Announce free-period end dates at signup; convert to SaaS with grandfathering |
| **Big-bang multi-city launch** | Homeflow advertises proposed first cities but currently says pre-launch; no operational multi-city case established | A single research catchment is a hypothesis, not a proven optimum |
| **Evidence gaps in this document** | §Research constraints | Run §H verification queue before any pricing or legal decision |

---

## G. Sources

Access date for all entries: **2026-10-02**. "Mirror" = verbatim copy of a primary document hosted on GitHub; "Digest" = third-party summary (FACT-S).

| # | Source | Publisher | Publication date | URL | Type |
|---|---|---|---|---|---|
| S1 | "ImmoScout MieterPlus: Kosten, Nutzen & Kündigung (2026)" (read via search snippet; direct fetch blocked) | wohnticker.de | Sept 2026 (per snippet) | https://wohnticker.de/ratgeber/immoscout-mieterplus-kosten | Secondary (pricing aggregator) |
| S2 | "Lohnt sich ImmoScout Plus? MieterPlus bzw. SuchenPlus im Check" (search snippet) | immobilien-ranking.de | 2026 | https://www.immobilien-ranking.de/lohnt-sich-immoscout-plus-2026-mieterplus-suchenplus-check/ | Secondary |
| S3 | "Early Bird explained" (search snippet of help page) | SpareRoom UK | n.d. | https://www.spareroom.co.uk/content/info-advice/early-bird-explained/ | Primary (vendor) |
| S4 | "Early Bird explained" (search snippet) | SpareRoom US | n.d. | https://www.spareroom.com/content/info-faq/early-bird-explained/ | Primary (vendor) |
| S5 | HideMieterPlus — browser extension README | itacentury (GitHub) | n.d. | https://github.com/itacentury/HideMieterPlus | Primary (artefact of user backlash) |
| S6 | Praxisbericht (working-student report at ImmoScout24): "kontext-arbeit.md" | fheinrich03 (GitHub) | n.d. (2026) | https://github.com/fheinrich03/praxisbericht/blob/main/daten/chosen/kontext-arbeit.md | Secondary |
| S7 | "competitors-international.md" — rental-platform pricing research, research date 2026-09-23 ([V]/[R] marks preserved) | danieltyukov/nl-property-finder (GitHub) | 2026-09-23 | https://github.com/danieltyukov/nl-property-finder/blob/main/docs/research/competitors-international.md | Secondary (fetched pricing pages) |
| S8 | The Tenant Fees Act 2019 (Commencement No. 3) Regulations 2019, SI 2019/857 (mirror of legislation.gov.uk) | legalize-dev/legalize-uk (GitHub) | 2019-04-11 | https://github.com/legalize-dev/legalize-uk/blob/main/uk/uksi-2019-857.md | Mirror of primary |
| S9 | "The Atomic Network" — exclusive excerpt from Andrew Chen, *The Cold Start Problem* | Lenny's Newsletter (mirror: joeseesun/lennys-podcast-newsletter) | 2021-12-09 | https://www.lennysnewsletter.com/p/the-atomic-network · mirror: https://github.com/joeseesun/lennys-podcast-newsletter/blob/main/references/02-newsletters/the-atomic-network.md | Mirror of primary |
| S10 | Lenny's Podcast — Sarah Tavel (Benchmark): hierarchy of engagement / hierarchy of marketplaces (transcript) | Lenny's Podcast (mirror: ChatPRD/lennys-podcast-transcripts) | 2023-12-27 | https://github.com/ChatPRD/lennys-podcast-transcripts/blob/main/episodes/sarah-tavel/transcript.md | Mirror of primary |
| S11 | "Kickstarting supply in a labor marketplace" (Hired, Vettery, Thumbtack, Instawork, etc.) | Lenny's Newsletter (mirror) | 2021-07-13 | https://github.com/joeseesun/lennys-podcast-newsletter/blob/main/references/02-newsletters/kickstarting-supply-in-a-labor-marketplace.md | Mirror of primary |
| S12 | "28 ways to grow supply in a marketplace" | Lenny's Newsletter (mirror) | 2019-06-26 | https://github.com/joeseesun/lennys-podcast-newsletter/blob/main/references/02-newsletters/28-ways-to-grow-supply-in-a-marketplace.md | Mirror of primary |
| S13 | "Choosing a take rate" | Lenny's Newsletter (mirror) | 2021-04-06 | https://github.com/joeseesun/lennys-podcast-newsletter/blob/main/references/02-newsletters/choosing-a-take-rate.md | Mirror of primary |
| S14 | "How marketplaces win" | Lenny's Newsletter (mirror) | 2021-08-03 | https://github.com/joeseesun/lennys-podcast-newsletter/blob/main/references/02-newsletters/how-marketplaces-win.md | Mirror of primary |
| S15 | "Demand driving supply: the little-understood growth loop…" | Lenny's Newsletter (mirror) | 2021-09-14 | https://github.com/joeseesun/lennys-podcast-newsletter/blob/main/references/02-newsletters/demand-driving-supply-the-little-understood-growth-loop-behind-a-surprising-numb.md | Mirror of primary |
| S16 | "Accelerating growth at scale — Phase 2 of kickstarting and scaling a marketplace" (17 companies) | Lenny's Newsletter (mirror) | 2019-12-13 | https://github.com/joeseesun/lennys-podcast-newsletter/blob/main/references/02-newsletters/accelerating-growth-at-scale--phase-2-of-kickstarting-and-scaling-a-marketplace.md | Mirror of primary |
| S17 | "Evaluating a marketplace business idea" (issue 31) | Lenny's Newsletter (mirror) | 2020-06-23 | https://github.com/joeseesun/lennys-podcast-newsletter/blob/main/references/02-newsletters/evaluating-a-marketplace-business-idea.md | Mirror of primary |
| S18 | Digest of "How to kickstart and scale a marketplace business" (Lenny, 2019: 17 companies; 12 levers; supply-first 80%) | RefoundAI/lenny-skills (GitHub) | n.d.; original 2019 | https://github.com/RefoundAI/lenny-skills/blob/main/skills/supply-demand-balance/references/artifacts.md · original: https://www.lennysnewsletter.com/p/how-to-kickstart-and-scale-a-marketplace | Digest |
| S19 | "marketplace-flywheel-research.md" (cold-start tactics; cites HBS Working Knowledge, NFX) | GodMode-Team/godmode (GitHub) | n.d. (2026) | https://github.com/GodMode-Team/godmode/blob/main/autoresearch/marketplace-flywheel-research.md · cites https://www.library.hbs.edu/working-knowledge/how-uber-airbnb-and-etsy-attracted-their-first-1-000-customers | Digest |
| S20 | Bill Gurley, "All Markets Are Not Created Equal: 10 Factors…" (not fetched; 10 factors via digest) | Above the Crowd; digest: cgallic/kai-cmo-harness | 2012-11-13 | https://abovethecrowd.com/2012/11/13/all-markets-are-not-created-equal-10-factors-to-consider-when-evaluating-digital-marketplaces/ · digest: https://github.com/cgallic/kai-cmo-harness/blob/main/knowledge/people/bill-gurley-knowledge.md | Primary (unfetched) + digest |
| S21 | Chris Dixon, "Come for the tool, stay for the network" (not fetched; cited via mirrors) | cdixon.org; reference list: moonlightwork/marketplace-resources | 2015-01-31 | https://cdixon.org/2015/01/31/come-for-the-tool-stay-for-the-network · https://github.com/moonlightwork/marketplace-resources | Primary (unfetched) |
| S22 | "T04 — Mediazione boundary" and "mediation-disclosure.md" — internal legal matrix of an Italian property portal (Mundida S.r.l. / EasyCasa) | aziz-mubasher/EasyCasa (GitHub) | 2026-08-13 | https://github.com/aziz-mubasher/EasyCasa/blob/main/docs/legal/T04_mediazione_boundary.md | Secondary (legal analysis) |
| S23 | "RICERCA_intermediazione_e_1341.md" — research on L. 39/1989 and artt. 1754–1759 c.c. for platforms | UnicorniDiBob/Bob_webapp (GitHub) | n.d. | https://github.com/UnicorniDiBob/Bob_webapp/blob/main/docs/legal/RICERCA_intermediazione_e_1341.md | Secondary (legal analysis) |
| S24 | Ministerial decree amending D.M. 21-02-1990 n. 300 (exams for *agenti d'affari in mediazione*), with notes quoting L. 39/1989 artt. 2 and 7 (mirror of Gazzetta Ufficiale 094G0120) | legalize-dev/legalize-it (GitHub) | 1994 | https://github.com/legalize-dev/legalize-it/blob/main/it/094G0120.md | Mirror of primary |
| S25 | "Cedolare secca" (Settimana fiscale n. 17) | amattavelli (GitHub) | 2024–2025 | https://github.com/amattavelli/amattavelli/blob/main/Articoli/Settimana%20fiscale/17%20-%20Cedolare%20secca/Cedolare%20secca.md | Secondary (tax advisor) |
| S26 | "Accélération des Startups d'État : retour sur le lancement du programme Gamma" (DossierFacile figures) | blog.beta.gouv.fr (mirror: betagouv/blog.beta.gouv.fr) | 2020-11-23 | https://github.com/betagouv/blog.beta.gouv.fr/blob/master/content/_posts/2020-11-23-acceleration-des-startups-d-etat-retour-sur-le-lancement-du-programme-d-accompagnement-gamma-1.md | Mirror of primary (government blog) |
| S27 | dossierfacile-dfconnect-demo — "Outils de démonstration de DossierFacileConnect à destination des partenaires" | MTES-MCT (French ministry, GitHub) | n.d. | https://github.com/MTES-MCT/dossierfacile-dfconnect-demo | Primary |
| S28 | dossierfacile-backend — docs/completed-optin.md (share links, full PDF, partner API, Visale auto-validation) | MTES-MCT (GitHub) | 2026 | https://github.com/MTES-MCT/dossierfacile-backend/blob/main/docs/completed-optin.md | Primary |
| S29 | Dossier-Facile-Frontend README (operator, licence) | MTES-MCT (GitHub) | n.d. | https://github.com/MTES-MCT/Dossier-Facile-Frontend | Primary |
| S30 | bailbot TODO.md — "DossierFacile Connect OAuth2" integration | vvorreit (GitHub) | n.d. | https://github.com/vvorreit/bailbot/blob/main/TODO.md | Tertiary |
| S31 | GroupAppart BUSINESS-PLAN.MD — dropped dossier vault in favour of DossierFacile ("250 000 dossiers validés") | RocmaDL (GitHub) | n.d. | https://github.com/RocmaDL/GroupAppart/blob/main/BUSINESS-PLAN.MD | Tertiary |
| S32 | bailleurverif "etude-marche.md" — landlord pains, rotation ~2–3 years, DossierFacile free | Creariax5 (GitHub) | n.d. | https://github.com/Creariax5/bailleurverif/blob/main/etude-marche.md | Tertiary |
| S33 | Bruch EE, Newman MEJ. "Aspirational pursuit of mates in online dating markets." *Science Advances* 4(8): eaap9815 — according to PubMed (PMID 30101188) | AAAS | 2018-08-08 | https://doi.org/10.1126/sciadv.aap9815 | Peer-reviewed |
| S34 | Bruch EE, Newman MEJ. "Structure of Online Dating Markets in U.S. Cities." *Sociological Science* 6:219–234 — according to PubMed (PMID 31363485) | Sociological Science | 2019-04-02 | https://doi.org/10.15195/v6.a9 | Peer-reviewed |
| S35 | Bruch E, Feinberg F, Lee KY. "Extracting multistage screening rules from online dating activity data." *PNAS* 113(38):10530–5 — according to PubMed (PMID 27578870) | PNAS | 2016-08-30 | https://doi.org/10.1073/pnas.1522494113 | Peer-reviewed |
| S36 | Vera Cruz G et al. "Online dating: predictors of problematic tinder use." *BMC Psychology* 12:106 — according to PubMed (PMID 38424651) | BMC | 2024-02-29 | https://doi.org/10.1186/s40359-024-01566-3 | Peer-reviewed |
| S37 | "job-platforms-comparison.md" — Hired history and decline (cites Wikipedia, Underdog.io "The Rise and Fall of Vettery and Hired", TechCrunch 2020, HR Dive) | heyimcarlos/lazyjob (GitHub) | n.d. (2026) | https://github.com/heyimcarlos/lazyjob/blob/main/specs/job-platforms-comparison.md | Tertiary |
| S38 | "AGENT_RECRUITING_LANDSCAPE.md" — Hired acquired by Adecco's LHH (2024); pricing "subscription… plus success fees"; "4x faster" claim | jensbosseparra/multi-agent-expert-sourcing (GitHub) | n.d. (2025) | https://github.com/jensbosseparra/multi-agent-expert-sourcing/blob/main/backend/docs/AGENT_RECRUITING_LANDSCAPE.md | Tertiary |
| S39 | LinkedIn outreach benchmarks (InMail response 10–15% / 15–25% / 25%+) | TheCraigHewitt/skills (GitHub) | n.d. | https://github.com/TheCraigHewitt/skills/blob/main/sales/linkedin-outreach/SKILL.md | Tertiary |
| S40 | GTMOS BENCHMARKS.md (InMail response bands) | shyftai/GTMOS (GitHub) | n.d. | https://github.com/shyftai/GTMOS/blob/main/.claude/gtmos/references/BENCHMARKS.md | Tertiary |
| S41 | "research-03-linkedin.md" — flags LinkedIn "40x" completeness figure as unverifiable | queirozlc/find-me-a-job (GitHub) | 2026 | https://github.com/queirozlc/find-me-a-job/blob/main/research/research-03-linkedin.md | Tertiary (negative finding) |
| S42 | Airbnb Superhost / Vrbo Premier Host thresholds (mirrors of rapideyeinspections.com and RentTools.io blog posts) | Metzpapa/vacation-rental-operations-corpus; Gribadan/RentTools.io (GitHub) | 2026 | https://github.com/Metzpapa/vacation-rental-operations-corpus/blob/main/documents/airbnb-superhost-response-time-requirements.md · https://github.com/Gribadan/RentTools.io/blob/main/content/blog/vrbo-premier-host-requirements-math.md | Tertiary |
| S43 | Scout24 (G24.DE) company overview — MieterPlus under Financial Services; revenue ~€600M | perjmi/eustocks (GitHub) | n.d. | https://github.com/perjmi/eustocks/blob/main/analysis/scout24_G24.DE.md | Tertiary |
| S44 | GitHub code search "Zappyrent" — only scrapers, hiring tests and a remote-jobs list (zappyrent.com career page) | GitHub | 2026-10-02 | https://github.com/search?q=%22Zappyrent%22&type=code | Search record (no pricing found) |
| S45 | roommate TODO.md — Italian founder's competitor matrix (Immobiliare.it, Idealista, HousingAnywhere, Spotahome, Bakeca) | AG4MA (GitHub) | n.d. (2026) | https://github.com/AG4MA/roommate/blob/main/TODO.md | Tertiary (opinion) |
| S46 | sbt-2026 goals.md — "Creazione di un'agenzia sociale per la locazione (modello 'Milano Abitare')" | robbisg (GitHub) | 2026 | https://github.com/robbisg/sbt-2026/blob/main/goals.md | Tertiary |
| S47 | "pm-network-effects.md" — student-housing marketplace hard-side reasoning (owners vs students) | sidgaikwad/be-better-dev (GitHub) | n.d. | https://github.com/sidgaikwad/be-better-dev/blob/main/packages/scripts/src/course/product-management/content/pm-network-effects.md | Tertiary |
| S48 | LinkedHome internal: `docs/DECISIONS.md` D-001 and `PLAN.md` §1–4 early signal (Homeflow, Brescia; historical press launch claim; superseded by current pre-launch FAQ) | This repository | 2026-10-02 | /home/user/LinkedHome/docs/DECISIONS.md · /home/user/LinkedHome/PLAN.md | Internal (preliminary search) |
| S49 | Italian news feed mirror, 30 Jan 2026 — Corriere della Sera headline: Milan house prices and rents rise with the 2026 Olympics, citing Immobiliare.it Insights | p1va/news-in-brief (GitHub) | 2026-01-30 | https://github.com/p1va/news-in-brief/blob/main/italy-today/artifacts/2026-01-30/2026-01-30-user-message.md | Mirror of headline (no figures) |
| S50 | Barcelona "neighborhoods-choosing.md" — "Agency fee: 1 month + IVA" | clawic/skills (GitHub) | n.d. | https://github.com/clawic/skills/blob/main/skills/barcelona/neighborhoods-choosing.md | Tertiary (Spain analog) |
| S51 | Conflicting tertiary claims on Zillow Rental Manager / Apartments.com / RentSpree pricing | blackskyi/farmhouse LAUNCH_STRATEGY.md; Salus-Ventures-Projects/apartmentdibs-mock docs/Personas.md (GitHub) | n.d. | https://github.com/blackskyi/farmhouse/blob/main/LAUNCH_STRATEGY.md · https://github.com/Salus-Ventures-Projects/apartmentdibs-mock/blob/main/docs/Personas.md | Tertiary (NOT VERIFIED) |
| S52 | RentLedger — "Experian Rental Exchange Integration (v2.5 fixed-width layout)" | Alguire11/RL (GitHub) | n.d. | https://github.com/Alguire11/RL | Tertiary (existence/format of the exchange) |
| S53 | "04_analisi_finanziaria.md" — provvigione agenzia (vendita) 2–3% | TheNeuralWars (GitHub) | n.d. | https://github.com/TheNeuralWars/Via-Valpantena-135-Quinto-Verona/blob/main/docs/04_analisi_finanziaria.md | Tertiary (sale, not rent) |
| S54 | Existence of Confedilizia: Corte costituzionale orders (O. 226/1994; O. 169/2016; S. 333/2001) naming "Confederazione italiana della proprietà edilizia (Confedilizia)"; CCNL "Dipendenti da Proprietari di Fabbricati (Confedilizia)" | Synthos-Logic/giurisprudenza-db; lucas-puerari/ccnl-engine (GitHub mirrors) | 1994–2016; 2025 | https://github.com/Synthos-Logic/giurisprudenza-db/blob/main/CONSULTA/2016/O_169_2016.md · https://github.com/lucas-puerari/ccnl-engine/blob/main/docs/contracts/portieri-fabbricati-confedilizia.md | Mirror of primary / secondary |
| S55 | Andrew Chen persona/digest notes ("Big Bang failures", "hard side", "hyperlocal density") | philipjoubert/dojo-public; coco-research/coco (GitHub) | n.d. | https://github.com/philipjoubert/dojo-public/blob/main/dojo/personas/andrew-chen/persona.md · https://github.com/coco-research/coco/blob/main/systems/superintelligence/product-design/research/lenny-rachitsky/notes.md | Digest |
| S56 | "cold-start-problem" SKILL.md — digest of Andrew Chen, *The Cold Start Problem* (hard side, subsidy taper, single-player, flintstoning, five stages) | wondelai/skills (GitHub) | n.d. (v1.2.0) | https://github.com/wondelai/skills/blob/main/cold-start-problem/SKILL.md · book: https://www.amazon.com/Cold-Start-Problem-Andrew-Chen/dp/0062969749 | Digest |

PubMed attribution: items S33–S36 were retrieved via PubMed; DOIs are given as links above.

---

## H. Verification queue (re-run when egress allows; highest value first)

| Priority | Claim to verify | URL(s) |
|---|---|---|
| 1 | Italian rental agency fee norms (1 month + VAT per side) | https://www.idealista.it/news/ (search "provvigione affitto") · https://www.altroconsumo.it/casa-energia/affitto · https://www.fiaip.it |
| 1 | Immobiliare.it and Idealista private-landlord listing prices (IT) | https://www.immobiliare.it/pubblica-annuncio/ · https://www.idealista.it/pubblica-annuncio/ |
| 1 | Zappyrent model (landlord commission, guarantee) | https://www.zappyrent.com/ · https://zappyrent.zendesk.com/hc/en-us |
| 1 | Legge 39/1989 text and L. 57/2001 amendments | https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1989-02-03;39 |
| 1 | Milan rent levels (€/m² and 1-bed) | https://www.immobiliare.it/mercato-immobiliare/lombardia/milano/ · https://www.idealista.it/mercato-immobiliare/lombardia/milano/ |
| 2 | OpenRent Rent Now £49 and referencing | https://www.openrent.co.uk/landlords/pricing |
| 2 | ImmoScout24 Suchen+ official page | https://www.immobilienscout24.de/lp/suchen-plus.html |
| 2 | HousingAnywhere / Uniplaces / Spotahome / Badi / Rentberry fees | https://housinganywhere.com/pricing · https://help.uniplaces.com · https://www.spotahome.com · https://badi.com · https://rentberry.com/pricing |
| 2 | Zillow Rental Manager listing fee; $35 application | https://www.zillow.com/rental-manager/pricing/ |
| 2 | Avail / TurboTenant / Apartments.com pricing | https://www.avail.co/pricing · https://www.turbotenant.com/pricing/ · https://www.apartments.com/rental-manager/ |
| 2 | Goodlord / Rentila / Rentger pricing | https://www.goodlord.co/pricing · https://www.rentila.com/it/prezzi · https://www.rentger.com/precios |
| 2 | Canopy, Experian Rental Exchange, Rightmove referencing | https://www.canopy.rent · https://www.experian.co.uk/consumer/rental-exchange.html |
| 2 | CRIF visura price; Garantitaly; Affitto Sicuro; Idealista Garanzia | https://www.crif.it · https://www.garantitaly.it · https://www.affittosicuro.it · https://www.idealista.it/garanzia |
| 2 | Hired trajectory 2020–2024 | https://techcrunch.com/?s=hired+vettery · https://underdog.io/blog |
| 3 | DossierFacile current volumes and Connect partner terms | https://www.dossierfacile.logement.gouv.fr/ · https://partenaire.dossierfacile.logement.gouv.fr/ |
| 3 | Lenny "How to kickstart and scale a marketplace" (original) | https://www.lennysnewsletter.com/p/how-to-kickstart-and-scale-a-marketplace |
| 3 | HousingAnywhere university partnerships; PoliMi / Unibo housing offices; ESN Italia; Milano Abitare; Confedilizia/UPPI/ANACI services | https://housinganywhere.com/universities · https://www.polimi.it · https://www.unibo.it · https://esn.it · https://www.milanoabitare.org · https://www.confedilizia.it · https://www.uppi.it · https://www.anaci.it |
| 3 | Airbnb host acceptance/response definitions; LinkedIn InMail official stats | https://www.airbnb.com/help/article/ (Superhost) · https://www.linkedin.com/business/talent/blog |
| 3 | Meta ads benchmarks Italy real estate; portal marketing spend | https://www.wordstream.com/blog/facebook-ads-benchmarks · Scout24 / Zillow annual reports |

# 07 — Legal, Privacy & Fairness Research for a Reverse Rental Marketplace (Italy)

| | |
|---|---|
| **Project** | Reverse rental marketplace, Italy-first (working name TBD) — tenants build optionally-verified profiles; landlords discover and invite them |
| **Document type** | Product-engineering research (Phase 4 of PLAN.md). **This is not legal advice.** It is intended to shape the data model, matching engine and trust/verification design, and to produce a checklist for external counsel. |
| **Research date / access date for all sources** | 2026-10-02 |
| **Author** | Research agent (privacy engineering + GDPR + fairness lens) |
| **Status** | Draft v1 — awaiting external legal validation (see §16) |

## 0. How to read this document, and a note on verification

Every substantive claim is tagged:

- **FACT** — a sourced statement of law, official guidance, case law or a published study, cited as `[S#]`.
- **INTERPRETATION** — the author's reading of how the FACTs apply to *this* product.
- **ASSUMPTION** — something the author believes but could not verify in this session; it goes on the §16 validation list.

**Verification caveat (important).** On 2026-10-02 the research session's egress proxy blocked direct retrieval of most primary sources (eur-lex.europa.eu, curia.europa.eu, garanteprivacy.it, normattiva.it, edpb.europa.eu, agid.gov.it, etc.) and the web-search budget was exhausted after the first batch of queries. Consequently each source in §17 carries a verification status:

- `[V-search]` — existence and key content confirmed through search-engine result snippets retrieved on 2026-10-02;
- `[B]` — primary page could not be opened in this session (blocked); the citation is to the canonical URL and the content is cited from the author's working knowledge of the instrument. **These must be re-checked against the live text before anything in this document is relied on.**
- `[K]` — knowledge-only citation (no live confirmation this session).

Where paragraph numbers of judgments or article numbers are given from memory, they are marked "(para. numbers to verify)".

---

## 1. Lawful bases per processing activity (GDPR Art. 6, Art. 9; Italian Codice privacy)

### 1.1 Framework

**FACT.** Art. 6(1) GDPR offers six lawful bases; for a consumer platform the realistic candidates are (a) consent, (b) contract necessity, (c) legal obligation, (f) legitimate interest [S1]. Consent must be freely given, specific, informed, unambiguous and as easy to withdraw as to give (Art. 7; EDPB Guidelines 05/2020) [S6]. Contract necessity is read narrowly: processing must be *objectively necessary* for the service the user asked for, not merely useful to the controller, and cannot be bundled with unrelated purposes (EDPB Guidelines 2/2019 on Art. 6(1)(b)) [S11]. Legitimate interest requires a three-step test — legitimate interest, necessity, balancing — with special weight on the data subject's reasonable expectations (EDPB Guidelines 1/2024) [S10].

**FACT.** Art. 9 special-category data cannot be processed unless an Art. 9(2) exception applies; for a private platform the practical exception is explicit consent, 9(2)(a) [S1]. Italy's Codice privacy (D.Lgs. 196/2003 as amended by D.Lgs. 101/2018) adds art. 2-septies on genetic, biometric and health data (Garante "misure di garanzia"), art. 122 (cookies/terminal equipment) and art. 130 (unsolicited communications) [S15] `[B]`.

### 1.2 Mapping

| Processing activity | Recommended basis | Why / what EDPB would say | Alternatives rejected |
|---|---|---|---|
| **Account creation & tenant profile** (contact data, search preferences, budget, move-in date, household size, pets, smoking, employment category) | **Art. 6(1)(b) contract** | The tenant signs up precisely to build a profile that landlords can find. Under Guidelines 2/2019 the test is whether the processing is objectively necessary for *the service as described to the user*; profile data that drives matching passes [S11]. | Consent would make the whole profile withdrawable at any moment and is also weaker ("freely given" doubts when the service cannot function without it) [S6]. |
| **Making the profile discoverable to landlords** | **Art. 6(1)(b) contract, scoped by an explicit, user-controlled visibility setting** (default: visible only to authenticated, verified landlords; never publicly indexed) | Discoverability *is* the product; it is not an add-on. But Art. 25(2) requires that by default personal data are "not made accessible without the individual's intervention to an indefinite number of natural persons" [S1][S7]. INTERPRETATION: a closed, verified landlord audience plus a one-click "pause visibility" satisfies both contract necessity and default-privacy. The visibility toggle is a *contract-scope choice*, not GDPR consent, so it should be described as "publish / unpublish my profile", not as a consent checkbox. | Consent (6(1)(a)) is defensible but fragile: withdrawal mid-negotiation would have to unwind matches and hide data from landlords already in conversation. Legitimate interest fails the reasonable-expectation step if the tenant did not actively publish. |
| **Verification processing — identity** (SPID/CIE/eID assertion, or document + liveness via vendor) | **Art. 6(1)(b)** for the verification *service* the tenant requests; **Art. 9(2)(a) explicit consent** for any biometric face-match/liveness step; **no** Art. 6(1)(c) (the platform has no statutory KYC duty — see §11.5 on AML) | Verification is an optional feature the tenant actively requests, and the badge is part of the service. Biometric comparison of a selfie with an ID photo is "biometric data for the purpose of uniquely identifying" (Art. 4(14), Art. 9(1)) [S1]. A non-biometric path (SPID/CIE/EUDI Wallet) must exist so that consent to biometrics is genuinely free [S6]. | Legitimate interest for biometrics is unavailable (Art. 9 has no LI exception). |
| **Verification processing — income/affordability** (open-banking one-shot check through a licensed AISP, or document upload) | **Art. 6(1)(b)** (feature requested by tenant) + PSD2 explicit consent to the AISP for account access (sector rule, not GDPR consent) [S55] | See §9. Store the *result band*, not transactions. | — |
| **Matching & "signals" shown to landlords** | **Art. 6(1)(b)** for deterministic matching on the tenant's declared criteria; **Art. 21/22 safeguards apply if any evaluative profiling is introduced** (see §2) | Deterministic filtering on data the tenant typed in is the essence of the contract. Anything *predictive* about the tenant (e.g., a reliability score) is profiling (Art. 4(4)) and needs its own purpose, notice and DPIA [S5]. | — |
| **Messaging between tenant and landlord** | **Art. 6(1)(b)** | Core function after a mutual match. Automated safety scanning of messages (spam, scams, harassment) rests on **Art. 6(1)(f)**, must be disclosed, proportionate and preferably metadata/heuristic-first [S10]. | — |
| **Fraud prevention, security logging, abuse/ban lists** | **Art. 6(1)(f)** | Recital 47 names fraud prevention as a legitimate interest [S1]; Guidelines 1/2024 confirm but demand documentation of the balancing test [S10]. | — |
| **Marketing (email/SMS/push/calls)** | **Consent** (Art. 6(1)(a) + art. 130 Codice privacy opt-in) with the "soft spam" exception of art. 130(4) only for e-mail about *similar* services to existing customers, with opt-out in every message | Italy enforces this hard in the real-estate sector: in 2025 the Garante fined a data vendor €100,000 and nine estate agencies up to €40,000 each for contacting owners (using scraped cadastral data) without valid consent, ordering deletion in the worst cases [S16][S17][S18][S65]; a 2021 decision fined an agency €10,000 for unsolicited e-mails and missing privacy notices [S66]. | Legitimate interest for electronic direct marketing is not available in Italy because art. 130 is lex specialis (ePrivacy) [S15] `[B]`. |
| **Analytics / product telemetry** | Server-side, first-party, pseudonymised metrics: **Art. 6(1)(f)**. Any cookie/SDK that is not strictly necessary: **consent** under art. 122 Codice privacy and the Garante's 2021 cookie guidelines | See §1.3. | — |
| **Sharing data with a landlord after mutual match** | Covered by the tenant's contract (it is the purpose of the service). The landlord becomes an **independent controller** for what they receive; the platform is **not** their processor | INTERPRETATION: a private landlord renting out a flat is engaged in an economic activity, so the household exemption (Art. 2(2)(c)) is unlikely to apply; the landlord should receive a short "your obligations" notice. `ASSUMPTION` — confirm with counsel; Italian practice treats landlords/agencies as controllers [S19]. | — |

### 1.3 ePrivacy / cookies in Italy (Garante Guidelines of 10 June 2021)

**FACT.** The Garante's "Linee guida cookie e altri strumenti di tracciamento" (provv. n. 231, 10 June 2021, doc. web 9677876, GU n. 163 of 9 July 2021) set the Italian reading of art. 122 Codice privacy [S14] `[V-search]`. From the author's knowledge of the text `[B]`: technical cookies need no consent; **analytics cookies may be used without consent only if** they are first-party or third-party with the provider acting as processor, the IP address is masked (at least the last octet), no cross-site combination is done and data are not shared with third parties for their own purposes; otherwise consent is required. Banner rules: closing the banner ("X") must count as refusal, scrolling is not consent, no cookie walls, the choice must be re-asked no sooner than 6 months later unless conditions change, and a "reject all" must be as prominent as "accept all".

> **RECOMMENDATION 1 — Lawful bases.**
> 1. Run tenant profile, discoverability, matching and messaging on **contract necessity (Art. 6(1)(b))**, with discoverability gated by an explicit, user-controlled visibility toggle and a closed, verified landlord audience (Art. 25(2)).
> 2. Treat **verification** as an opt-in feature (contract) and require **explicit consent (Art. 9(2)(a))** only for the biometric step; always offer a non-biometric eID route.
> 3. Use **legitimate interest** only for security/fraud/abuse and first-party pseudonymised analytics, with a written balancing test per Guidelines 1/2024.
> 4. **Marketing = opt-in consent**, granular per channel, logged with timestamp/version; never telemarket landlords from scraped or purchased lists.
> 5. Ship with **zero non-essential cookies by default**; if a product-analytics SDK is used, run it in cookieless/consent-gated mode compliant with the 2021 guidelines.

---

## 2. Article 22 GDPR and the SCHUFA judgment: scores vs. signals vs. ranking

### 2.1 The law

**FACT.** Art. 22(1): the data subject has the right not to be subject to a decision based *solely* on automated processing, including profiling, which produces legal effects concerning them or *similarly significantly affects* them. Exceptions (22(2)): necessary for a contract, authorised by Union/Member State law, or explicit consent — and in the first and third cases the controller must implement safeguards including "at least the right to obtain human intervention, to express his or her point of view and to contest the decision" (22(3)). Special-category data may ground such decisions only under 9(2)(a) or (g) with safeguards (22(4)) [S1]. Arts. 13(2)(f), 14(2)(g) and 15(1)(h) require "meaningful information about the logic involved, as well as the significance and the envisaged consequences" of such processing [S1]. Recital 71 lists "automatic refusal of an online credit application or e-recruiting practices without any human intervention" as examples [S1].

**FACT.** WP29/EDPB Guidelines WP251rev.01 [S5] `[B]`: (i) "decision" and "similarly significant effect" are read broadly — effects that "affect someone's financial circumstances, such as their eligibility to credit", "access to health services", "employment opportunities", "access to education" qualify; (ii) token human involvement does not take a decision outside Art. 22 — the human must have "meaningful" oversight, authority and competence to change the decision; (iii) profiling that is used by *another* person to decide can still fall under Art. 22 for the controller that decides; (iv) Art. 22 is a prohibition, not merely a right to be invoked; (v) even where Art. 22 does not apply, profiling remains subject to Arts. 5, 6, 13-15 and 21 and often to a DPIA (Art. 35(3)(a)).

**FACT — SCHUFA (CJEU C-634/21, 7 December 2023, ECLI:EU:C:2023:957)** [S2] `[B]`, cross-checked via [S3][S4] `[V-search]`. The Court held that the *automated establishment by a credit-reference agency of a probability value* (score) concerning a person's ability to meet payment obligations constitutes an "automated individual decision" within Art. 22(1) **where a third party, to which that value is transmitted, "draws strongly" on it to establish, implement or terminate a contractual relationship** with the data subject (operative part; para. 73 — para. numbers to verify). Reasoning: the three cumulative conditions of Art. 22(1) — a "decision", based "solely" on automated processing including profiling, with legal or similarly significant effects (para. 43); "decision" has a broad meaning and can include the score itself (paras 44-46); where the score "plays a determining role" in the third party's decision, establishing the score is *itself* the decision (paras 48-50); a narrow reading would create a *lacuna* and allow circumvention, because the data subject could not exercise Art. 15(1)(h) rights against the agency (which would say "we only prepare") nor against the bank (which would say "we don't know the logic") (paras 61-63) [S3][S4].

**FACT.** CJEU C-203/22 *Dun & Bradstreet Austria* (27 February 2025) `[K]`: "meaningful information about the logic involved" (Art. 15(1)(h)) means explaining the procedure and principles actually applied so that the data subject can understand which of their data were used and how, in an intelligible form; trade secrets cannot justify blanket refusal — disclosure to the supervisory authority or court may be ordered to balance interests [S83].

### 2.2 Application to the three candidate designs

**INTERPRETATION.** The "third party draws strongly on it" test from SCHUFA is the pivot. In a reverse marketplace the *landlord* decides whom to invite; the platform's output is the SCHUFA-like input. Housing is at least as "significant" as consumer credit (Recital 71 analogues; WP251's list is non-exhaustive and the Garante's DPIA list explicitly covers decisions that prevent someone "from availing of a good or service" [S12]).

| Design | Art. 22 exposure | Analysis |
|---|---|---|
| **(a) Opaque numeric "compatibility score" (0-100 or stars) shown to landlords** | **HIGH** | Functionally identical to the SCHUFA score: an automated probability-like value, transmitted to a third party who will predictably rank/filter on it. If landlords draw strongly on it (and they will — it is the only summary signal), the platform is the author of an Art. 22 decision with significant effects (access to housing). Consequences: must fit an exception (22(2)(a) contract necessity is doubtful because the score is not necessary to *perform* the tenant's contract; explicit consent is the only realistic route and is revocable), must provide human intervention/contestation, meaningful logic explanation (Dun & Bradstreet standard), DPIA mandatory (Garante list items 1 and 2) [S12]. It also creates indirect-discrimination risk because any trained model will absorb proxies (§3). If the score estimates ability to pay rent it is additionally a *creditworthiness* evaluation under AI Act Annex III 5(b) (§10.4). |
| **(b) Explainable boolean/categorical signals** ("identity verified", "income verified ≥ 3× rent: yes", "move-in date fits", "pets OK", "household size fits property") | **LOW-MEDIUM** | Each signal is either a *verification fact* (identity verified) or a *transparent rule applied to tenant-declared criteria* (budget ≥ rent). Facts are not profiling. Threshold rules on economic data *are* profiling in the Art. 4(4) sense (evaluating economic situation) but: the logic is fully explainable in one sentence; the landlord sees several independent signals and makes a human choice; there is no single determinative value to "draw strongly" on. Residual risk arises if (i) the UI lets landlords *auto-filter* on the signals so that non-matching tenants are never seen (then the platform's automated filter *is* the decision), or (ii) the threshold is set by the platform rather than by the landlord/tenant. Mitigation: landlord-set thresholds, no hidden exclusion, "show all with signals" default, tenant can see and contest every signal about them. |
| **(c) Ranking / ordering of candidates** | **MEDIUM** (depends entirely on the ordering key) | Ordering by *objective, tenant-controlled, disclosed* keys (recency of activity, number of hard-criteria matches, mutual preference overlap, random tie-break) is not an evaluative decision about the person and is a normal search function — but under Italian consumer law the main ranking parameters must be disclosed (§12). Ordering by a *learned desirability/response-probability model* (collaborative filtering on which tenants landlords tend to invite) is profiling with potentially significant effect (tenants ranked low are effectively invisible) and will reproduce landlords' historical biases (the "Airbnb effect", §3). WP251 treats visibility/targeting effects as significant when they affect vulnerable people or access to essential goods [S5]. |

### 2.3 Required safeguards if any profiling is kept

**FACT.** Arts 13/14/15(1)(h) (logic, significance, consequences); Art. 21(1) right to object to profiling based on 6(1)(f); Art. 22(3) human intervention / own view / contest; Art. 35(3)(a) DPIA; Art. 25 by-design measures [S1]. The Garante applied these to algorithmic management in *Foodinho* (provv. 10 June 2021, n. 234, €2.6m) — ordering transparency of the logic, measures to verify accuracy and absence of discrimination, and a human review channel [S64] `[B]`.

> **RECOMMENDATION 2 — Art. 22 posture.**
> 1. **Do not build a numeric compatibility score** in v1. Replace it with a small set of **explainable, binary or categorical signals**, each derived from (i) a verification fact or (ii) a deterministic rule on criteria the *tenant* declared and the *landlord* set for the property.
> 2. **No hidden exclusion**: every tenant whose declared criteria overlap the property is listable; landlords may sort/filter but the UI must make non-matching candidates reachable (e.g., "show 12 more who don't meet your income filter").
> 3. **Ordering keys must be objective, disclosed, and free of learned personal evaluation**: default = mutual-criteria overlap count → recency → random. No model trained on landlord invite behaviour.
> 4. **Tenant-side transparency**: each tenant sees exactly which signals are shown about them, the rule behind each, and can (a) fix the input, (b) hide an optional signal, (c) request human review of a verification outcome (Art. 22(3)-style channel even where Art. 22 is not strictly triggered).
> 5. Record in the DPIA why the design is *not* an Art. 22 decision, and re-run it before introducing any ML ranking.
> 6. Landlord-facing copy must say signals are *inputs*, that the landlord decides, and must link to the §12 ranking-parameters disclosure.

---

## 3. Special-category data (Art. 9), protected characteristics and proxy variables

### 3.1 What is "special" under GDPR vs. "protected" under anti-discrimination law

**FACT.** Art. 9(1) GDPR: racial or ethnic origin, political opinions, religious or philosophical beliefs, trade-union membership, genetic data, biometric data (for unique identification), health data, sex life or sexual orientation [S1]. Nationality/citizenship and residence-permit status are **not** Art. 9 categories, but (i) they are protected grounds under art. 43 D.Lgs. 286/1998 (race, colour, ancestry, national or ethnic origin, religion) and D.Lgs. 215/2003 (racial/ethnic origin) [S38][S42], and (ii) "non-EU residence permit" is a near-perfect proxy for national origin. Family status, age, marital status and parenthood are not Art. 9 data and are not covered by the EU housing directives, but Italian constitutional law (art. 3 Cost.: "sesso, razza, lingua, religione, opinioni politiche, condizioni personali e sociali") and general tort law make refusals on those grounds attackable [S45]; disability is additionally protected by L. 67/2006 for access to goods and services [S44].

**FACT.** Data from which special categories can be *inferred* are treated as special-category data when the controller intends to infer or the inference is reasonably certain (EDPB/CJEU C-184/20 *Vyriausioji tarnybinės etikos komisija*, 1 Aug 2022: publication of a spouse/partner's name "liable to reveal" sexual orientation is processing of Art. 9 data) [S84] `[K]`. Therefore a "couple" profile with two first names of the same gender, or a free-text bio ("my husband and I"), can constitute Art. 9 processing even though no field says "sexual orientation".

### 3.2 Rental-relevant data: classification and proxy risk

| Data element | GDPR class | Anti-discrimination relevance | Proxy risk | Verdict |
|---|---|---|---|---|
| Accessibility needs / mobility ("need lift / step-free") | **Art. 9 health** | Disability (L. 67/2006) | Direct | Do **not** store as a tenant attribute. Model as a *property* attribute ("step-free access: yes/no") that the tenant can filter on client-side; if the tenant insists on declaring a need, store under explicit consent in a separate, non-indexed field never shown pre-match. |
| Religion, ethnicity, political views, union membership | Art. 9 | Protected | Direct | Never collect; block in free text via guidance + moderation. |
| Sexual orientation (incl. inferred from co-applicant names/pronouns) | Art. 9 (inferred) | Protected (Cost. art. 3; no EU housing directive) | Direct/inferred | Do not display co-applicant names pre-match; represent household as counts ("2 adults, 0 children"). |
| Nationality / citizenship / residence permit / country of birth | Ordinary data | **Protected** (286/1998 art. 43; 215/2003; Dir. 2000/43) | Direct | Do not collect pre-contract. Needed only by the landlord for post-signature legal duties (cessione di fabbricato, art. 7 D.Lgs. 286/1998 48-hour hospitality notice for non-EU nationals) `[K]` — handle off-platform or in a post-match "contract pack" shared tenant→landlord. |
| **Codice fiscale** | Ordinary data but **encodes sex and place/country of birth** (foreign-born = "Z" country code) `[K]` | Reveals national origin and sex | **Direct, often overlooked** | Never collect pre-contract; if collected for a contract module, store encrypted, never display to landlord before signature, never derive anything from it. |
| Full name / surname | Ordinary | Ethnic-origin proxy (field experiments below) | **High** | Pre-match: first name only or initials/pseudonym; full name after mutual match. |
| Profile photo | Ordinary (may reveal race, religion, age, disability) | Multiple grounds | **Very high** (Airbnb evidence) | No photo pre-match. Optional after mutual match. Never used by any algorithm. |
| Mother tongue / languages spoken | Ordinary | Ethnic/national origin proxy | High | Not collected. (Interface language preference is stored but never exposed to landlords or used in matching.) |
| Current city / previous address | Ordinary | Origin proxy if granular (neighbourhood) | Medium | Store at city/province level only; never show previous address pre-match. |
| Age / date of birth | Ordinary | Age (constitutional ground; AI-ethics) | Medium | Collect only "over 18 — verified" flag (plus DOB inside the eID assertion, discarded after check). No age shown pre-match. |
| Household composition (adults/children count) | Ordinary | Family status; children (indirect gender/age) | Medium | Collect counts only, because occupancy limits are a legitimate property constraint (DM 5 luglio 1975 habitability m² rules) `[K]`. Never allow "no children" filters; allow "max occupants" derived from property size. |
| Employment status / contract type (permanent, fixed-term, self-employed, student, retired) | Ordinary (economic situation) | Indirect proxy for age, nationality, gender | Medium-high | Collect coarse category; show verified-income band instead of contract type where possible; never filter by "tempo indeterminato only". |
| Verified income band (e.g., "≥ 3× rent") | Ordinary (economic) | Indirect proxy (migrants, women, young people earn less) | Medium | Acceptable as a *landlord-set* affordability threshold against rent, disclosed; do not expose exact income pre-match. |
| Guarantor present (yes/no) | Ordinary | Proxy for student/young/foreign status | Medium | Optional, tenant-controlled, shown only as "has guarantor: yes" when the tenant opts in; never a ranking key. |
| Pets (yes/no, type) | Ordinary | Not protected (assistance animals = disability proxy) | Low | Collect; property-level "pets allowed" filter is legitimate. Treat "assistance animal" as health data — do not create the field. |
| Smoking | Ordinary | Not protected | Low | Collect; property rule. |
| Free-text bio | Ordinary but **uncontrolled** | Leaks every proxy above | **Very high** | Pre-match: structured, controlled-vocabulary fields only (e.g., "working professional", "remote worker", "quiet household"); free text only post-match, never machine-analysed for ranking. |
| Messages | Ordinary; may contain Art. 9 content | — | — | Never fed into matching/ranking. |
| Open-banking transaction data | Ordinary but **extremely revealing** (donations to religious bodies, medical payments, union dues, dating apps) | Multiple Art. 9 inferences | **Very high** | Process transiently inside the AISP flow; persist only the derived income band + verification timestamp. |

### 3.3 Evidence that proxies produce discrimination in housing

- **FACT.** Edelman, Luca & Svirsky (AEJ: Applied Economics 9(2), 2017) ran a field experiment on Airbnb: guest requests from distinctively African-American names were about **16 % less likely to be accepted** than identical requests with distinctively white names; the effect persisted across host types [S46] `[K]`. Airbnb's response (Community Commitment 2016; hiding guest photos until booking acceptance from 2018) is the direct precedent for "no photo pre-match" `[K]`.
- **FACT.** Baldini & Federici (Journal of Housing Economics 20(1), 2011) sent e-mails to Italian rental ads from Italian-, Arab/Muslim- and Eastern-European-sounding names; foreign-sounding names received markedly fewer positive replies, with the strongest penalty for Arab/Muslim names [S49] `[K]`. **Name alone is a discriminatory channel in the Italian rental market.**
- **FACT.** FRA, *Being Black in the EU* (2023, EU-MIDIS-style survey of people of African descent in 13 Member States): roughly one in three respondents reported racial discrimination when looking for housing in the previous five years, up from the 2016 wave; Italy is among the surveyed countries [S48] `[K]`.
- **FACT.** *United States v. Meta Platforms* (S.D.N.Y., settlement announced by DOJ/HUD 21 June 2022): HUD charged (2019) that Facebook's ad-delivery tools enabled and *themselves caused* discriminatory housing-ad targeting; Meta agreed to withdraw "Special Ad Audience" and build a "Variance Reduction System" to reduce demographic skew in housing-ad delivery [S47] `[K]`. Lesson: a platform's *tooling* (filters, lookalike models) can be the discriminatory act even when advertisers/landlords make the final choice.
- **FACT.** *Louis v. SafeRent Solutions* (D. Mass., settlement 2024, ≈ $2.3m): a tenant-screening score was alleged to disparately exclude Black and Hispanic applicants using housing vouchers; SafeRent agreed to stop presenting a score for voucher holders [S82] `[K]`. Lesson: opaque scores invite disparate-impact litigation; "no score" is a litigation-avoidance design.
- **FACT.** Italian courts have treated the mere *insertion of a discriminatory selection criterion* as actionable: Tribunale di Milano, 30 March 2000 (Immobiliare Bonomelli) — an agency that recorded owners' instruction not to rent to non-white non-EU citizens was held to have committed racial discrimination by the sole fact of adopting the criterion [S40] `[V-search]`; ASGI documents a later "no stranieri, no animali" case where landlord/agency conduct was sanctioned under arts 43-44 TU immigrazione [S39] `[V-search]`.

> **RECOMMENDATION 3 — Collect / don't collect / never use.**
> **Collect (structured):** budget range; move-in window; desired duration; areas (zones, not addresses); household counts (adults/children); pets (y/n + type); smoking; employment category (coarse); optional guarantor flag; verification facts (identity verified, income band verified, references verified); interface language (internal only).
> **Do not collect pre-contract:** nationality/citizenship/permit; country/place of birth; codice fiscale; full DOB; photo; surname; mother tongue; marital status; health/disability; religion; union/political; sexual orientation or partner names; previous street address; exact salary; employer name; IBAN; ID document numbers.
> **Never use in matching, filtering, ordering or any signal:** every Art. 9 category; name; photo; language; age; gender; household *type* (vs. counts); nationality or any proxy; free text; message content; behavioural "responsiveness" scores; landlord invite history.
> **Data-model rule:** fields that are legitimately needed later (contract stage) live in a separate, encrypted "contract pack" entity with its own lifecycle, never joined to the discoverable profile.

---

## 4. Data minimisation and progressive disclosure (Art. 5(1)(c), Art. 25, EDPB 4/2019)

**FACT.** Art. 5(1)(c): data must be "adequate, relevant and limited to what is necessary". Art. 25(1): data-protection by design, "taking into account the state of the art, the cost of implementation and the nature, scope, context and purposes". Art. 25(2): by default only data necessary for *each specific purpose* are processed — "that obligation applies to the amount of personal data collected, the extent of their processing, the period of their storage and their accessibility"; in particular data must not by default be made accessible "without the individual's intervention to an indefinite number of natural persons" [S1]. EDPB Guidelines 4/2019 (v2.0, 20 Oct 2020) list "key design and default elements" for minimisation: **data avoidance, limitation, access limitation, relevance, necessity, aggregation, pseudonymisation, anonymisation and deletion, data flow (mapping), and 'state of the art'**; and for transparency: clarity, semantics, accessibility, contextual and relevant information, multi-channel, layered [S7] `[B]`.

### 4.1 Stage model

| Stage | Who can see | Data elements (and purpose) | Notes |
|---|---|---|---|
| **S0 — Account** | Platform only | e-mail (login, notices); password hash or passkey; "I am ≥ 18" attestation; T&C/privacy acceptance log; consent flags (marketing, each channel) | No name required. Age attestation suffices until verification. |
| **S1 — Discoverable profile ("tenant card")** | Authenticated, verified landlords whose property overlaps the tenant's criteria; **not** public, not indexable | display handle (first name or chosen pseudonym); budget range; move-in window; duration; areas; household counts; pets; smoking; employment category; verification badges (booleans); 1-3 controlled-vocabulary tags | This is the *only* entity the matching engine reads. Nothing in it is a proxy by design (§3). Visibility toggle; auto-pause after N days of inactivity. |
| **S2 — Mutual match (landlord invited, tenant accepted)** | The two parties | first + last name; optional photo; chat; optional richer self-description (free text); optional income band detail; optional references summary; viewing scheduling | Disclosure is **tenant-initiated** per element (progressive reveal UI). Name reveal can be a single "share my full name" action. |
| **S3 — Contract pack (post-agreement, optional module)** | Tenant → landlord, time-limited link | legal name, DOB, codice fiscale, ID document data (ideally eID-derived), address, employer, income evidence summary, IBAN for deposit | Separate encrypted entity; landlord access expires (e.g., 30 days); platform retains *that* a pack was shared, not its contents, unless the contract module needs them. |
| **S4 — Verification internals** | Platform (+ vendor as processor) | eID assertion (transient); document images (transient at vendor); biometric templates (transient at vendor); bank transaction data (transient at AISP); derived results | Result-only persistence pattern (§8.4, §9.1). |

### 4.2 Design-by-default specifics

1. **Default visibility = off until profile is complete and the tenant clicks "publish"** (Art. 25(2); EDPB 4/2019 "default" examples).
2. **Pseudonymous card identifiers** (opaque IDs; no sequential IDs that leak sign-up order).
3. **Field-level purpose tags** in the schema (`purpose: matching | contract | verification | security`) and a build-time check that the matching service can only read `matching`-tagged columns (technical enforcement of minimisation).
4. **Aggregation for analytics**: dashboards from k-anonymised aggregates (k ≥ 10) — never per-tenant demographics.
5. **Data-flow map** maintained as a living artefact (EDPB 4/2019 "data flow" element) — it is also the DPIA's Annex A.

> **RECOMMENDATION 4 — Progressive disclosure.** Implement the S0-S4 stage model as *separate entities with separate access-control policies and retention clocks*, not as nullable columns on one `users` table. The discoverable card must be generated from a whitelist, not by hiding fields at render time.

---

## 5. Retention periods per data class

**FACT.** Art. 5(1)(e) storage limitation; Art. 17(3)(e) erasure can be refused where processing is necessary for legal claims [S1]. Italian limitation periods: ordinary 10 years (art. 2946 c.c.); 5 years for tort claims (art. 2947) and for periodic payments such as rent (art. 2948 n. 3) [S61] `[B]`. Accounting/tax records: 10 years (art. 2220 c.c.) and until the tax-assessment deadline (art. 22 DPR 600/1973) [S61] `[K]`. Garante benchmark practice: loyalty/marketing programmes — marketing data 24 months, profiling data 12 months (provv. 24 Feb 2005 "Fidelity card", still used as the reference) `[K]`; system-administrator access logs ≥ 6 months (provv. 27 Nov 2008) `[K]`. AML 10-year retention (art. 31 D.Lgs. 231/2007) applies **only to obliged entities** — the platform is not one unless it becomes a registered estate agent (§11.5) [S36].

| Data class | Recommended retention | Trigger / justification |
|---|---|---|
| Identity document images, selfies, biometric templates | **Do not persist.** Vendor-side TTL ≤ 72 h for manual-review fallback, then hard delete | Garante line that keeping ID copies is "eccedente" unless a law requires it (e.g., employment-agency decision reported in [S19]); breach-impact minimisation; Art. 9 for biometrics |
| Verification **result** (status, method, date, vendor transaction ID, document type, last 4 chars of document number, expiry date) | Life of account + **12 months** (fraud window); then anonymise to a counter | Needed to show badge and to re-verify; 12-month tail for dispute/fraud investigation (6(1)(f)) |
| eID assertion attributes (name, DOB, CF from SPID/CIE) | Keep only name + "age ≥ 18 verified" + assertion ID; discard DOB/CF immediately unless the tenant opens a contract pack | Minimisation |
| Open-banking raw transactions | **0 — never stored by the platform** (processed in the AISP session) | §9 |
| Derived income band + verification date | Rolling **6 months** validity, retained while account active; delete band on expiry | Freshness; minimisation |
| Discoverable profile | While account active; **auto-pause after 90 days inactivity, delete profile after 24 months inactivity** following two warnings | Storage limitation; Garante expects defined inactivity rules |
| Messages | Duration of the match + **24 months** after last message, then delete; one party's deletion pseudonymises their side for the counterparty | Dispute window (deposit/contract disputes typically arise within the lease); balances the counterparty's own access right |
| Contract pack contents | Until landlord access expires (30 days) or module completion; if a contract module stores the signed lease: 10 years (art. 2946/2220) | Civil limitation |
| Match/invite/decision events (who invited whom, signals shown, ordering key snapshot) | **5 years** (pseudonymised after account deletion) | Evidence to defend/refute discrimination claims (5-year tort limitation) and Art. 22/15 explanation duties — see §10 |
| Security & access logs | 12 months (minimum 6 per Garante sysadmin rules) | Security 6(1)(f) |
| Abuse/ban records (hashed e-mail/phone, reason) | 24 months after ban | Fraud prevention 6(1)(f); allow re-review |
| Billing records, invoices, T&C acceptance proofs | 10 years | art. 2220 c.c.; tax |
| Marketing consent & preference logs | Life of consent + 24 months after withdrawal (proof) | Accountability (Art. 7(1)) |
| Deleted account residual | Within 30 days: delete or irreversibly anonymise everything except the classes above with legal holds; keep a tombstone (hash + deletion date) for 24 months | Art. 17; prevent re-registration abuse |
| Backups | Encrypted; rotated so that deleted data ages out within ≤ 90 days; documented in the privacy notice | EDPB 4/2019 "deletion" element |

> **RECOMMENDATION 5 — Retention.** Encode retention as *per-entity TTL policies executed by a scheduler*, with the retention table above checked into the repo and referenced by the DPIA and the privacy notice. Never keep document images; keep verification *results*. Keep match-decision event logs (pseudonymised) for 5 years because they are the platform's only evidence in a discrimination dispute.

---

## 6. Data-subject rights and implementation notes

**FACT.** Arts 12-23 GDPR: transparent information (12-14), access (15), rectification (16), erasure (17), restriction (18), notification of rectification/erasure to recipients (19), portability (20), objection (21), automated decisions (22); response within one month, extendable by two (12(3)); free of charge unless manifestly unfounded/excessive (12(5)) [S1]. EDPB Guidelines 01/2022 on the right of access (v2.0, 28 Mar 2023): access covers *all* data, including derived/inferred data and logs, and must come with a copy in an intelligible form [S76] `[B]`. WP242rev.01 on portability: Art. 20 covers data "provided by" the data subject — both actively provided *and observed* (e.g., activity logs) — but **not** data *inferred or derived* by the controller (scores, verification results); it applies to processing based on consent or contract and carried out by automated means; it does not oblige the controller to keep data longer; receiving controllers are not obliged to accept the data [S75] `[B]`.

| Right | Product implementation |
|---|---|
| **Access (15)** | Self-service "Download my data" (JSON + human-readable PDF) covering profile, verification results, messages, match/invite events *and the signal rules applied* (15(1)(h) — Dun & Bradstreet standard [S83]); landlord-side equivalent. Identity check = authenticated session; for e-mail requests, verify via the account. |
| **Rectification (16)** | All profile fields editable; verification results are not editable but a "dispute / re-verify" flow exists (ties to Art. 22(3)-style human review). |
| **Erasure (17)** | "Delete account" → immediate unpublish, 30-day grace (soft delete), then hard delete / anonymise per §5; propagate to processors (verification vendor, AISP, e-mail provider, analytics) via documented API calls; messages: delete own content, counterparty keeps a pseudonymised copy ("Deleted user") — disclose this in the notice. Legal-hold flag blocks deletion of the specific records needed for a live dispute (17(3)(e)). |
| **Restriction (18)** | "Freeze profile" state: not discoverable, not processed for matching, retained. |
| **Portability (20) — the "tenant passport"** | Export the *provided* data (profile answers, documents the tenant uploaded, messages they wrote) in a documented JSON schema. Verification *results* are derived data — outside Art. 20 strictly — but **should be exported voluntarily as a signed, time-stamped attestation** (e.g., a JSON-LD/W3C Verifiable Credential-style object with the platform's signature) so the tenant can show it elsewhere; this is also the bridge to the EUDI Wallet model (§8.3). State clearly that other platforms are not obliged to accept it. |
| **Objection (21)** | One-click objection to every 6(1)(f) processing (analytics, safety scanning beyond legal minimum); marketing objection absolute and immediate (21(2)-(3)). |
| **Art. 22 channel** | Even without an Art. 22 decision, provide "ask a human to review this signal / this suspension" with SLA (e.g., 5 working days) and a written outcome. |
| **Transparency (12-14)** | Layered notice; a "Why do landlords see this about me?" page per field; a "How ordering works" page (also required by §12 consumer rules). |
| **Children** | Hard 18+ gate (§13.4); no Art. 8 flow needed. |

> **RECOMMENDATION 6 — Rights.** Build a `rights_requests` entity (type, received_at, identity_verified_at, due_at, status, outcome, handler) from day one, plus deletion-propagation hooks for every processor. Treat the portability export as a *product feature* (tenant passport), not a compliance afterthought, and version its schema.

---

## 7. DPIA: mandatory, and an outline

**FACT.** Art. 35(1): a DPIA is required where processing "is likely to result in a high risk"; Art. 35(3)(a) singles out "a systematic and extensive evaluation of personal aspects relating to natural persons which is based on automated processing, including profiling, and on which decisions are based that produce legal effects... or similarly significantly affect" the person; 35(3)(b) large-scale special-category data [S1]. WP248rev.01 lists nine criteria (evaluation/scoring; automated decision-making with significant effect; systematic monitoring; sensitive or highly personal data; large scale; matching/combining datasets; vulnerable data subjects; innovative use/new technology; preventing exercise of a right or access to a service/contract) — two criteria usually trigger a DPIA [S8] `[B]`.

**FACT.** The Garante's list (provv. n. 467, 11 Oct 2018, doc. web 9058979, GU n. 269 of 19 Nov 2018) has 12 categories [S12][S13] `[V-search]`. From the author's knowledge of the text `[B]`, the ones engaged here are:
1. **Evaluation or scoring on a large scale, and profiling/predictive activity carried out online or via apps relating to "professional performance, economic situation, health, personal preferences or interests, reliability or behaviour, location or movements"** — engaged by any score and by income/affordability evaluation.
2. **Automated processing for decisions with legal or similarly significant effects, "including decisions that prevent exercising a right or availing of a good or a service or continuing to be party to a contract"** — engaged by any automated exclusion/filtering of tenants.
4. **Large-scale processing of highly personal data** (financial data; electronic-communications content) — engaged by messaging and income verification.
7. **Innovative technologies (IoT, AI systems, ...) when at least one other WP248 criterion is present** — engaged if any ML is used.
9. **Interconnection, combination or comparison of information** — engaged by combining eID, open-banking and self-declared data.
11. **Systematic processing of biometric data** — engaged by liveness/face-match.
(Item 6 — vulnerable persons — may also be engaged: tenants in housing need, asylum seekers, people with disabilities.)

**INTERPRETATION.** A DPIA is **mandatory** for this product under Art. 35(3)(a)/(b) and at least four Garante-list items, independently of whether a numeric score exists. If the residual risk remains high after mitigation, prior consultation of the Garante is required (Art. 36).

### 7.1 DPIA outline (WP248 structure)

1. **Systematic description** — purposes, actors (tenant, landlord, agencies, vendors), data inventory by stage (§4), data-flow diagram, retention (§5), processors and transfers (eID/verification vendor, AISP, e-mail, hosting region), assets.
2. **Necessity & proportionality** — lawful bases (§1), minimisation choices (§3-4), information to data subjects, rights (§6), processor contracts (Art. 28), international transfers (Chapter V) — expect EU-only hosting.
3. **Risk assessment** (likelihood × severity) for: (a) discrimination via proxies or landlord filters; (b) unlawful Art. 22 decisions; (c) identity-document breach; (d) financial-data breach; (e) harassment/stalking through messaging and location; (f) re-identification of pseudonymous cards; (g) vendor failure; (h) scraping of tenant cards; (i) function creep (data reused for marketing/credit).
4. **Measures** — technical (field-level purpose tags, access control, encryption, result-only verification, no-photo pre-match, rate-limited landlord browsing, audit logs) and organisational (fairness testing of ordering keys, moderation, DPO, training, incident response).
5. **Consultation** — DPO opinion; views of data subjects (tenant & landlord interviews; tenant associations such as SUNIA/Unione Inquilini; anti-discrimination NGOs such as ASGI) — WP248 expects this "where appropriate".
6. **Sign-off, residual risk, review triggers** — re-run before: any ML in ordering; any score; biometrics vendor change; new data source (credit bureau, social media); expansion to agencies at scale; DAC7/payments module.

> **RECOMMENDATION 7 — DPIA.** Start the DPIA *now* (template in `docs/legal/`), keep it versioned alongside the data model, and make "DPIA updated" a merge-gate for PRs touching matching, verification or messaging.

---

## 8. Identity verification: SPID/CIE, EUDI Wallet, biometrics, document copies

### 8.1 SPID and CIE for private service providers

**FACT.** Private entities may become SPID service providers ("fornitori di servizi privati") by signing AgID's convention and a contract with each identity provider; AgID publishes the convention schema, the SP-IdP standard contract, service-level indicators and a tariff schedule (Allegato 4 "Prezzario SPID") with annual pricing tiers from a pay-per-use tier (€0 fixed) upward [S51][S52][S53] `[V-search]`. ASSUMPTION: the per-authentication / per-tier fees changed in 2023-2024 (AgID revised tariffs in favour of private SPs [S53]) — obtain the current schedule before budgeting. CIE ("Entra con CIE") is also open to private SPs through the Ministero dell'Interno/IPZS federation `[K]` — verify current onboarding terms and fees.

**FACT / ASSUMPTION.** Italy's "IT-Wallet" (art. 20 D.L. 19/2024, in the IO app) began issuing digital versions of national documents in late 2024 and is the national implementation path toward the EU Digital Identity Wallet `[K]`.

### 8.2 eIDAS 2 / EUDI Wallet timeline

**FACT.** Regulation (EU) 2024/1183 (eIDAS 2, OJ L 30.4.2024, in force 20 May 2024) obliges each Member State to provide at least one EUDI Wallet within 24 months of the adoption of the implementing acts (adopted end of November 2024) — i.e., **by late 2026**; relying parties (which would include this platform) must **register** in their Member State, declaring the intended use and the data they will request (art. 5b), and may request only data consistent with that registration; wallet users get a dashboard and the ability to report misuse [S54] `[B]`. Obligatory acceptance of the wallet applies to specific sectors and very large platforms, not to a small marketplace; voluntary acceptance is allowed `[K]`.

**INTERPRETATION.** The wallet model (selective disclosure of "over 18", "name", "address" attributes with cryptographic proof; no document copy) is exactly the result-only pattern below. Design the verification abstraction so that SPID/CIE today and EUDI Wallet in 2027 are interchangeable providers, and so that the tenant passport (§6) could later be issued *as* a wallet attestation.

### 8.3 Biometric / liveness constraints

**FACT.** Face-matching a selfie to an ID photo and liveness detection are biometric processing for unique identification → Art. 9; the only workable basis is explicit consent (9(2)(a)); Italian art. 2-septies Codice privacy subjects biometric processing to Garante guarantee measures `[B]`; the Garante has repeatedly sanctioned private biometric deployments that lacked necessity, alternatives or DPIAs (e.g., facial-recognition and workplace-biometrics decisions) and the DPIA list item 11 is engaged [S12][S15] `[K]`. Under the AI Act, biometric *verification* (1:1 confirmation of a claimed identity) is explicitly excluded from the "remote biometric identification" high-risk category (Art. 3(35)-(36) read with Annex III 1) `[K]`, so a 1:1 face-match used for onboarding is not high-risk per se [S20].

**Design rules:** (1) always offer a non-biometric route (SPID/CIE/wallet); (2) biometric step via a vendor acting as processor, templates and images deleted after the match, with contractual TTL ≤ 72 h; (3) store only `match_result`, `confidence_band`, `vendor_tx_id`, `timestamp`; (4) separate explicit-consent screen, with the alternative route displayed with equal prominence; (5) DPIA section; (6) no "silent" re-use for fraud models.

### 8.4 Document copies vs. "verification result only"

**FACT.** The Garante's consistent position is that acquiring and *keeping* copies of identity documents is excessive unless a specific legal provision requires it or indispensability is demonstrated — restated in a decision against an employment agency (reported in [S19] `[V-search]`) and reflected in sectoral guidance (hotels, telcos, condominium administrators). Real-estate guidance echoes that agencies may keep tenants' income documentation only with authorisation and must destroy it on request `[V-search]` [S19].

> **RECOMMENDATION 8 — Identity verification.**
> 1. Primary route: **SPID/CIE (and EUDI Wallet when available)** — zero document images, result-only storage.
> 2. Fallback route: document + liveness through a certified vendor (processor), explicit consent, 72-hour TTL, result-only persistence.
> 3. Schema: `verification { subject_id, method (spid|cie|eudi|doc_bio), status, verified_at, expires_at, provider_tx_id, document_type, document_last4, assertion_hash }` — **no** image or template columns anywhere in the platform's database.
> 4. Register as an eIDAS 2 relying party as soon as the Italian registry opens; keep the requested-attributes list minimal ("over 18", given name, family name).
> 5. Never let the platform's database contain ID numbers in clear; last-4 plus hash is enough for duplicate detection.

---

## 9. Income / financial verification

### 9.1 Open banking (PSD2 AIS)

**FACT.** Account-information services require authorisation/registration as an AISP under PSD2 (Directive 2015/2366, art. 33), transposed in Italy by D.Lgs. 218/2017 (TUB art. 114-novies and following); Banca d'Italia keeps the register. The AISP may access account data only with the user's explicit consent and only the data the user designates; strong customer authentication renewal for AIS access was extended from 90 to **180 days** by the amended EBA RTS (Delegated Regulation (EU) 2022/2360) [S55][S78] `[B]`.

**INTERPRETATION.** The platform must **not** touch bank credentials or raw transactions itself; it integrates a licensed AISP (or a "credit-passport" product built on one) and receives only the derived result. One-shot verification (single consent, 3-6 months of history read inside the AISP, categorisation done there) is more defensible than continuous access. Persist only `income_band`, `income_source_type` (salary/pension/self-employed/other), `verified_at`, `method`, and let it expire after 6 months.

### 9.2 Credit bureaus (SIC) in Italy

**FACT.** Private credit-information systems (CRIF/EURISC, Experian, CTC, Consorzio Tutela Credito) operate under the Garante-approved *Codice di condotta per i sistemi informativi gestiti da soggetti privati in tema di crediti al consumo, affidabilità e puntualità nei pagamenti* (approved 12 Sept 2019, doc. web 9141941) [S56] `[B]`. Access is reserved to participating lenders ("partecipanti": banks, financial intermediaries, lessors, other credit grantors) for creditworthiness assessment in connection with a credit relationship; the data subject has access rights and a maximum retention schedule. **Neither a private landlord nor a marketplace can query a SIC** for tenant screening `[K]`. Public registers (Registro informatico dei protesti at the Chamber of Commerce; conservatoria for mortgages/foreclosures) are consultable by anyone but using them to build a tenant score is profiling and raises Art. 22/SCHUFA exposure (§2). ASSUMPTION: some vendors market "tenant reliability" reports to landlords built on public registers and self-declared data — validate the legal basis of any such vendor before integrating.

### 9.3 What landlords may ask tenants in Italy

**FACT.** Italy has **no statutory list** of permissible tenant documents (unlike France's décret n° 2015-1437 under the loi ALUR) `[K]`. Practice (ID, codice fiscale, payslips/CU/730, employment contract, guarantor, references) is governed only by GDPR minimisation and the Garante's "excessive data" doctrine [S19] `[V-search]`; a landlord's request is lawful to the extent it is proportionate to assessing ability to pay and to the landlord's own legal duties (lease registration, art. 7 TU immigrazione notice for non-EU tenants) `[K]`.

**FACT.** Enforcement in the real-estate sector is active: the 2025 telemarketing/cadastral-data decisions (€100,000 to the data vendor; up to €40,000 per agency; deletion orders) [S16][S17][S18][S65]; a 2021 agency fine for marketing e-mails without consent and missing notices [S66]. ASSUMPTION: a Garante decision specifically on *documents demanded from prospective tenants* exists in practitioner commentary but could not be retrieved this session; the employment-agency ID-copy decision [S19] is the closest verified analogue.

> **RECOMMENDATION 9 — Financial verification.**
> 1. Integrate a **licensed AISP** for a one-shot income check; store the band, not the data.
> 2. **No credit-bureau integration**; no "reliability score" from public registers.
> 3. Affordability signal = landlord-set threshold vs. verified band ("income ≥ 3× rent: yes/no"), explained, contestable, never a ranking key.
> 4. Document-upload fallback (payslips) must be result-only: OCR → band → delete file within 72 h.
> 5. Provide landlords with a "what you may ask" guide and an in-product contract pack so they stop asking for WhatsApp photos of ID cards.

---

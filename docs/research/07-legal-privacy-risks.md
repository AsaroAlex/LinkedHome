# 07 — Legal, privacy and fairness research for an Italian reverse rental marketplace

Research review: **2026-10-02**. Scope: product research, not a legal clearance or a completed DPIA. **Status: document complete; primary-text verification and counsel review outstanding.**

## 0. Evidence and scope

The previous draft stopped at section 9 without its bibliography. This revision covers the missing topics and replaces unsupported categorical conclusions with scoped research questions. Its source identifiers are **L01–L21**; old S-number references from the incomplete draft are not carried forward as verified evidence.

- **LEGAL REFERENCE**: a named instrument and provision to check in the official text. It is not a statement that the current text was retrieved.
- **INTERPRETATION**: an application of that framework to the proposed product; counsel must assess the actual processing and business activity.
- **PROPOSAL**: a conservative design choice, not a statutory requirement.
- **OPEN**: a condition that remains unresolved.

Direct HTTPS retrieval of GDPR, SCHUFA, the AI Act and DSA on EUR-Lex, the Garante cookie guidelines and Law 39/1989 on Normattiva returned proxy **403** on 2026-10-02. No live search tool is available in this session. The other references below are identified reading targets, not newly accessed sources. Historical search excerpts are not a substitute for consolidated law. See [the evidence register](09-sources.md) and [review 01](../reviews/review-01-research.md).

## 1. Purposes, lawful bases and controller roles

**LEGAL REFERENCE:** GDPR Arts. 5, 6, 7, 9, 13–14, 24–28 [L01]. A purpose must have a documented lawful basis. An agreement to terms is not a blanket consent; a privacy notice is information, not a waiver of rights. Consent for one optional use does not authorise unrelated processing.

| Processing | Candidate basis / condition to assess | Proposed boundary |
|---|---|---|
| Account, requested profile and messaging | Contract necessity, limited to objectively necessary processing | No unrelated marketing or financial dossier bundled into signup |
| Discoverability | Assess necessity for the service explicitly requested by the tenant | Visibility off until deliberate publication; pausing immediately removes discovery access |
| Optional identity or income check | Separate requested service; assess each party's purpose and basis | Unverified tenants retain core discovery and invitation access |
| Biometrics for unique identification | Requires an applicable Art. 9 condition as well as an Art. 6 basis | No biometric deployment before necessity, genuine alternatives and provider review |
| Security, fraud prevention and moderation | Legitimate-interest assessment where appropriate; any specific legal obligation separately identified | Limited access, purpose-specific logs, contestable enforcement |
| Marketing | Assess Codice privacy Art. 130 and channel-specific consent rules [L06] | Separate opt-in; no scraping or purchased contact lists |
| Analytics | Assess actual identifiers, purpose and terminal access [L01, L06, L07] | Aggregate minimum necessary events; no assumption that server-side or cookieless means exempt |

**OPEN:** platform, identity provider, AISP and landlord roles depend on their actual decisions about purposes and means. Vendors are not automatically processors; a landlord is not automatically the platform's processor. Document separate or joint controllership where applicable. Do not assume an economic activity or a household exemption resolves every landlord's status.

## 2. Automated decisions, profiling and explanation

**LEGAL REFERENCES:** GDPR Arts. 4(4), 13–15, 21–22; SCHUFA C-634/21; Dun & Bradstreet Austria C-203/22 [L01–L03]. Evaluate significance, the role of automation and whether any human review can genuinely change the outcome.

**INTERPRETATION:** replacing a score with booleans does not automatically remove profiling or significant exclusion. A deterministic affordability threshold, automatic rejection or effectively invisible ranking can still affect access to housing. A landlord choosing a threshold is not a legal exemption. "Human in the loop" is insufficient if the platform has already irreversibly excluded the person.

**PROPOSAL:** no reliability score, no learned desirability ranking, no automatic refusal based on verification status or income. Keep property/tenant-declared compatibility criteria explicit, explain each result to the tenant, support correction and a staffed dispute route. Separate declared budget compatibility from predictions of future solvency. Optional unknown evidence must remain **unknown**, not become **failed**.

Assess filtering, ordering, pagination and exposure together. Default ordering and tie-breaking require a documented rationale; recency can disadvantage users with limited digital access. Do not claim an Art. 22 exemption before reviewing the actual end-to-end flow.

## 3. Protected data and proxy discrimination

**LEGAL REFERENCES:** GDPR Arts. 5 and 9; Directive 2000/43/EC; D.Lgs. 215/2003; D.Lgs. 286/1998 Arts. 43–44; Law 67/2006 [L01, L08–L11]. GDPR special categories and legally protected grounds are different sets; ordinary personal data can still enable discrimination.

| Data / feature | Research recommendation |
|---|---|
| Name, photo, origin, nationality, language, employer, age | Exclude from matching inputs and pre-match discovery; keep interface language internal |
| Household | Occupant count for justified capacity constraints; no children/adults split, marital status or "family type" as discovery filters |
| Employment or contract type | Do not turn permanent employment or salaried status into eligibility requirements |
| Accessibility | Describe property accessibility; minimise and avoid logging sensitive search needs. Client-side processing alone does not prove no processing occurs |
| Income, guarantor, bank information | Optional, purpose-limited evidence; no automatic rank boost or exclusion; never equate a missing check with inability to pay |
| Free text, messages, references | No inference of protected attributes or training of ranking models; moderation and safe reporting still needed |
| Pets / assistance animals | Review accommodation needs separately; a generic pet prohibition must not silently exclude assistance needs |

**INTERPRETATION:** hiding names reduces one exposure channel, but does not make budget, location or occupancy "proxy-free". Do not promise a discrimination-free outcome. Do not collect protected attributes just to build a fairness dashboard; obtain a separate legal and ethical protocol if such a study is justified. Synthetic cases can test intended invariants without storing users' inferred ethnicity.

## 4. Minimisation and progressive disclosure

**LEGAL REFERENCE:** GDPR Arts. 5(1)(c), 25 and 32 [L01].

| Stage | Audience | Proposed information |
|---|---|---|
| Account / draft | Account holder and narrowly authorised staff | Contact channel, access controls, draft preferences; no public profile |
| Published discovery | Authenticated landlords with an appropriate, current property and reviewed access | Opaque profile identifier, coarse area, budget, dates, duration, total occupants, optional accurately labelled check status |
| Mutual match | The two authorised parties | Chat and deliberately shared identity/contact details; no automatic financial-document disclosure |
| Verification | Approved provider and necessary review staff | Minimum evidence for the specific check; platform receives scoped result and freshness metadata |
| Contract stage | Separate future workflow | Only legally necessary contract information; outside the proposed research-stage core |

**PROPOSAL:** enforce disclosure on the server and exports, not merely by hiding UI fields. Use revocable sharing, purpose-based access, rate limits, staff audit trails and deletion propagation. A download already received by a counterparty cannot be technically revoked; disclose that limitation. Public SEO pages must never expose tenant cards.

## 5. Retention and deletion

**LEGAL REFERENCE:** GDPR storage limitation, erasure and legal-claims exceptions [L01]. Civil limitation periods and accounting duties do not automatically justify retaining every message or matching event for the same period.

The following are **proposals to validate**, not legal deadlines:

| Data class | Default approach | Required decision before real-data use |
|---|---|---|
| Raw identity, selfie and bank evidence | Do not ingest into the marketplace where a result suffices | Provider retention, support access, backups, legal duties and deletion confirmation |
| Verification result | Minimum scope, method, timestamp, expiry and dispute status | Appropriate validity by check type; no unnecessary document-number suffix or biometric confidence field |
| Published profile | Immediate removal on unpublish; inactivity reminder and expiry | Choose and justify inactivity and deletion periods with users and counsel |
| Messages / invitation events | Purpose-limited retention with deletion and dispute support | Counterparty rights, abuse investigation need and bounded legal holds |
| Security and abuse records | Minimum necessary, restricted access | Separate event types, documented retention and proportionality; hashes remain potentially personal data |
| Billing records | Applicable accounting/tax requirements if billing exists | Exact records and statutory periods; no extension to unrelated profile data |
| Backups | Documented rotation and restoration deletion replay | Maximum deletion lag, restore procedure and access controls |

The old draft's universal five-year match-event retention, 72-hour vendor TTL and ten-year contract-pack retention are **not adopted**. Set enforceable schedules before launch and test erasure, holds, processor deletion and restored backups.

## 6. Rights and disputes

**LEGAL REFERENCES:** GDPR Arts. 12–22 [L01]. Verify exact deadlines and exceptions against the live text; the framework generally provides a one-month response period with a reasoned extension in qualifying cases.

**PROPOSAL:** provide access and correction, unpublish/delete, processing restriction, objections where applicable, and a staffed verification/moderation appeal. Track receipt, identity checks, legal due date, handler, outcome and processor propagation. No fabricated response-time promise without operational coverage.

Separate access from portability: derived results can be personal data accessible under Art. 15 even where Art. 20 does not compel their portability. A voluntary export may include scoped verification attestations, but neither signature nor watermark proves solvency or obliges another platform to accept them. Avoid a mandatory deletion "grace period" that delays an otherwise valid request.

## 7. DPIA and governance

**LEGAL REFERENCES:** GDPR Arts. 35–36 and Garante DPIA list [L01, L12]. **INTERPRETATION:** the proposed combination of housing selection, financial evidence and possible biometrics warrants a DPIA as a project gate. Whether each specific deployment is legally required to perform one depends on scope, scale and the actual processing; do not present an undeveloped architecture as an already established legal classification.

The assessment must cover purposes and data flows, necessity, vulnerable users, scraping, discrimination, financial/document breaches, vendor access, stalking, rights, residual risk and review triggers. Determine DPO requirements from Art. 37 rather than assuming every startup requires one. Record prior consultation if the conditions of Art. 36 apply. This dossier is input to that assessment, **not a completed or approved DPIA**.

## 8. Identity verification and digital wallets

**LEGAL REFERENCES:** GDPR; eIDAS as amended by Regulation 2024/1183; official SPID and CIE onboarding material [L01, L13–L15].

**OPEN:** commercial eligibility, accreditation, attribute release, costs, relying-party terms, foreign-document coverage, accessibility and current wallet availability. Free use by a citizen does not establish free integration by a private service provider. Do not state that every Italian or foreign user can complete an available non-biometric route without testing it.

**PROPOSAL:** maintain separate `UNVERIFIED`, `PENDING`, `VERIFIED`, `FAILED` and expired/disputed handling, with the precise check scope. Email confirmation is not identity verification; identity is not ownership of a property; a valid document is not proof of future rent payment. Design an equivalent route for users who lack supported credentials. Any biometric processing needs its own necessity assessment and lawful condition; consent alone does not resolve every constraint.

## 9. Income, bank information and credit data

**LEGAL REFERENCES:** PSD2 Art. 67 and the relevant account-information registration regime; GDPR; Garante SIC code [L01, L16–L18]. Check the provider's actual authorisation and countries covered through official registers before integration.

**PROPOSAL:** never request bank login credentials. Consider an authorised provider performing a scoped check; retain only necessary results. Transactions can reveal health, religion, unions and other sensitive information. A regulated provider does not automatically make every downstream use lawful. Explicit permission for bank access is not interchangeable with a GDPR lawful basis.

Bank inflows, documents and OCR do not establish future solvency and are not "forgery-proof". Define what was checked, when, and with which limitations. Handle self-employment, benefits, pensions, foreign income and guarantors without a hierarchy of people.

Do not integrate credit-bureau lookups or build a negative-tenant registry without a separately validated legal and contractual entitlement. Do not assert a universal statutory ban for every possible provider arrangement. Receiving a tenant-purchased report also requires necessity and lawful processing; it is not automatically permissible because the tenant uploaded it.

## 10. AI Act and deterministic systems

**LEGAL REFERENCE:** Regulation (EU) 2024/1689, including Art. 3, Art. 5, Art. 6, Annex III and application/transitional provisions [L04]. **OPEN:** consolidated text, applicable dates and any subsequent amendments as of deployment.

No-AI matching is a project constraint. Whether other vendor software qualifies as AI and whether a use falls into a regulated category must be assessed independently. A housing recommendation is not automatically an Annex III creditworthiness system; a financial-evaluation feature may change the analysis. Nor does avoiding a numeric score establish exemption. Biometric verification and remote biometric identification are distinct categories, without removing GDPR obligations.

**PROPOSAL:** inventory OCR, identity, fraud and moderation services; record purpose, provider, relevant classification and human safeguards. Never infer sensitive traits or predict tenant worth from social behaviour. Do not activate a service based only on a vendor's "compliant AI" badge.

## 11. Mediation, payments and regulated services

**LEGAL REFERENCES:** Civil Code Art. 1754, Law 39/1989 and any applicable sector rules [L05]. **INTERPRETATION:** classification depends on the actual activity, relationships and remuneration. Flat fees, SaaS terminology, free access or disclaimers do not create a general exemption from real-estate mediation requirements.

**PROPOSAL pending counsel:** exclude success and per-match fees, negotiations on behalf of parties, deposits, rent collection, guarantees and insurance distribution from the initial research recommendation. Verification charges remain a hypothesis subject to legal classification and unit economics. Manual introductions/shortlists also need review; "concierge" is not an exemption.

Obtain advice on the exact intended flows, including invitations and matching, before operating with real users or charging. Separately assess payment-services, insurance-distribution, anti-money-laundering and DAC7 implications if the scope changes. Do not declare those regimes either universally applicable or universally excluded at the current stage.

## 12. Platform, consumer and marketing duties

**LEGAL REFERENCES:** DSA; Italian Consumer Code and Codice privacy [L06, L19–L20]. Classification as hosting service, online platform or marketplace depends on features; size-based exemptions must be assessed provision by provision. Do not assume all platform duties apply equally or that being small removes all duties.

**PROPOSAL:** transparent service identity and pricing, accurate check descriptions, clear ranking and sponsorship information, reporting of illegal/discriminatory content, reasoned moderation decisions and a complaint channel. Review traders versus private landlords, cancellation/refund rights and distance-contract duties if paid services are introduced. A "verified" badge must explain its limits and expiry.

Do not contact landlords or agencies through scraped contacts as part of this research. No mailing campaigns, customer outreach, account creation or purchases have been performed.

## 13. Rental rules, inclusion and product boundaries

**LEGAL REFERENCES:** tenancy law, anti-discrimination frameworks and applicable consumer rules must be checked for the specific contract type [L08–L11, L20–L21]. Do not transplant French permitted-document rules into Italy or apply short-let identifiers indiscriminately to long-term housing.

**PROPOSAL:** collect declared rent, area, availability, duration and total occupancy relevant to an actual property. A product rule on adults, capacity or pets is not itself proof of legal compliance. Set an adult-account policy without excluding households with children. Occupancy standards, deposit limits, registration and contract templates require their own current, local assessment before implementation.

Provide an accessible correction and support route. No lawful-basis or fairness claim should depend on all users having Italian credentials, a permanent contract or the same digital skills.

## 14. Security, vendors and international transfers

**LEGAL REFERENCES:** GDPR Arts. 28, 32–34 and Chapter V [L01]. **PROPOSAL:** authorisation by role and relationship, least-privilege staff access, secure sessions, encrypted transport/storage, upload controls if needed, audit trails, rate limits and tested restore/deletion operations.

Map hosting, support access, subprocessors and telemetry. An EU datacentre does not by itself eliminate international transfers. Assess contractual roles, transfer mechanisms, safeguards, incidents and deletion at each provider. Avoid production personal data in development and tests.

Prepare breach triage and the applicable notification workflow; do not treat every incident as automatically requiring every notification. No infrastructure security or privacy implementation has been tested at the document-only stage.

## 15. Research-derived acceptance criteria

These are proposed checks for later design/implementation, **not executed software tests**:

1. Draft/unpublished profiles are inaccessible to discovery and direct-ID requests.
2. Matching receives only approved fields; changing names, photos or internal language cannot alter results.
3. Missing optional evidence remains unknown and does not silently remove a candidate.
4. Every displayed check identifies scope, freshness, status and contestation path.
5. Sharing is deliberate and relationship-scoped; mutual match does not release raw documents.
6. Appeals, deletion, processor propagation and legal holds have accountable owners and demonstrable outcomes.
7. No app copies, stores or forwards bank credentials; vendor-result payloads are minimised.
8. Ranking, filters and staff moderation are reviewed for exclusion and proxy effects, not only code correctness.

## 16. Open decisions and release gates

| Gate | Owner to appoint | Evidence required | Status |
|---|---|---|---|
| Primary legal-text verification | Research lead | Retrieved consolidated texts, exact provisions, current amendment/application checks | BLOCKED by current egress policy for tested hosts |
| Real-estate mediation / regulated activity | Qualified Italian counsel + founder | Written assessment of actual flows and fees, including manual matching | NOT PERFORMED |
| Data protection / controller roles | Privacy lead + counsel | Purpose map, bases, vendors, DPIA and residual-risk decision | NOT PERFORMED |
| Identity and financial checks | Engineering + procurement | Provider terms, authorisation, inclusion, costs and trial evidence | NOT PERFORMED |
| Retention and rights operations | Privacy + operations | Justified schedules, staffed procedures and later implementation tests | PROPOSED |
| Platform / consumer obligations | Counsel + operations | Feature-specific classification and duties | NOT PERFORMED |

Document completion does not close these gates. Research synthesis may identify hypotheses; it must not announce legal compliance, launch approval or a validated business model.

## 17. Sources and retrieval status

**B** = direct retrieval attempted on 2026-10-02 and proxy returned 403. **R** = identified official reading target; not retrieved in this continuation. None of these entries is a newly verified legal-text quote. Provision references above must be confirmed against the current text; homepage targets require locating the exact current guidance.

| ID | Instrument / official reading target | URL | Status |
|---|---|---|---|
| L01 | GDPR, Regulation (EU) 2016/679 | https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng | B |
| L02 | CJEU C-634/21, SCHUFA, 7 December 2023 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62021CJ0634 | B |
| L03 | CJEU C-203/22, Dun & Bradstreet Austria, 27 February 2025 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62022CJ0203 | R |
| L04 | AI Act, Regulation (EU) 2024/1689 | https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng | B |
| L05 | Law 39/1989; consult Civil Code Art. 1754 alongside it | https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1989-02-03;39 | B |
| L06 | D.Lgs. 196/2003, Codice privacy, consolidated text | https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2003-06-30;196 | R |
| L07 | Garante, cookie guidelines, 10 June 2021, doc. 9677876 | https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876 | B |
| L08 | Directive 2000/43/EC | https://eur-lex.europa.eu/eli/dir/2000/43/oj/eng | R |
| L09 | D.Lgs. 215/2003 | https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2003-07-09;215 | R |
| L10 | D.Lgs. 286/1998, especially Arts. 43–44 | https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-07-25;286 | R |
| L11 | Law 67/2006, disability discrimination | https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2006-03-01;67 | R |
| L12 | Garante DPIA list, 11 October 2018, doc. 9058979 | https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9058979 | R |
| L13 | Regulation (EU) 2024/1183, European Digital Identity Framework | https://eur-lex.europa.eu/eli/reg/2024/1183/oj/eng | R |
| L14 | AgID: locate current private SPID service-provider terms | https://www.agid.gov.it/ | R — discovery target |
| L15 | CIE: locate current private service-provider onboarding | https://www.cartaidentita.interno.gov.it/ | R — discovery target |
| L16 | PSD2, Directive (EU) 2015/2366 | https://eur-lex.europa.eu/eli/dir/2015/2366/oj/eng | R |
| L17 | Banca d'Italia: locate authorised institution registers | https://www.bancaditalia.it/compiti/vigilanza/albi-elenchi/ | R |
| L18 | Garante, SIC code, doc. 9141941 | https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9141941 | R |
| L19 | DSA, Regulation (EU) 2022/2065 | https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng | B |
| L20 | D.Lgs. 206/2005, Consumer Code | https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2005-09-06;206 | R |
| L21 | Law 431/1998, residential tenancy framework | https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1998-12-09;431 | R |

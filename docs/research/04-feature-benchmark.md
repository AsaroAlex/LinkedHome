# 04 — Feature Benchmark: Tenant Screening, Reusable Rental Applications and "Tenant Passport" Products

**Access date for all sources:** 2026-10-02
**Author role:** PropTech + fintech product analyst (LinkedHome research track)
**Status:** Draft v1 — evidence-based, gaps explicitly marked

---

## 1. Header and methodology

### 1.1 Scope

Benchmark of tenant-screening, reusable rental-application and "rental passport" products in the UK, USA, France, Germany, Netherlands, Spain and Italy, plus Italian verification building blocks (eID, open banking, credit bureau, guarantees) and cross-industry matching/marketplace UX patterns (recruiting, dating, Airbnb, fintech onboarding, marketplace cold-start literature).

### 1.2 Method

- Fresh web research performed on 2026-10-02 using web search (≈95 distinct queries across product, pricing, legal and UX topics).
- **Important limitation:** in this research environment every direct page fetch (official product pages, pricing pages, app stores, help centres, government sites, Trustpilot) was blocked by the network egress proxy (HTTP 403 CONNECT), and the per-session search budget was exhausted before the final ~15 queries (fintech onboarding case studies, marketplace cold-start literature, NN/g articles, profile-completion research, several traction/complaint queries) could run. Consequently:
  - Every fact below comes from **search-engine result summaries and snippets** of the cited URL, not from a full read of the page. Facts are labelled **FACT** only when the snippet was explicit and from a primary or reputable secondary source; **CLAIM** when it is a vendor's own marketing statement; **HYPOTHESIS** when it is an inference by the analyst.
  - Where a query could not be run or returned nothing useful, the entry reads **NOT FOUND (searched: …)** or **NOT SEARCHED (budget exhausted)**. Nothing has been filled from memory; the few well-known references I could not verify are listed separately in §8.3 as "unverified".
- Prices are quoted exactly as found, with currency and the source. "n.d." = publication date not visible in the result.
- Citation format: `[S#]` refers to the numbered list in §8.

### 1.3 Definitions used

- **Reusable**: the tenant completes verification once and can present it to more than one landlord/listing without re-doing it, within a validity window.
- **Portable**: the verified package can leave the platform where it was created (e.g., PDF, share-link, SSO/API) and be accepted by third-party landlords/agents/portals.
- **Result-only vs. docs**: whether the landlord sees underlying documents (payslips, statements) or only a pass/fail, score, or tiered summary.

---

## 2. Big benchmark table

Legend — verifies: **ID** identity · **Inc** income/affordability · **Emp** employment · **RH** rental history · **Cr** credit · **Ref** references · **Gu** guarantor. Values: Y = yes (sourced), N = no, ? = not found, (p) = partial.

| # | Product | Country | ID | Inc | Emp | RH | Cr | Ref | Gu | Method | Payer & price | Reusable? | Portable? | Landlord sees | Traction / status | Src |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Canopy Rent Passport | UK | Y | Y | (p) | Y | Y (soft, Experian) | ? | ? | Open Banking + Experian credit data; 10–15 min self-serve | Free for tenants; "free and unlimited instant tenant screening" for agents (CLAIM) | Y — share "every time they move rather than start from scratch" | Y — integrated into OnTheMarket portal | Income, credit history, rent payments shared with agent | Portal integration (OnTheMarket); user numbers NOT SEARCHED | [S1][S2][S3][S5][S10] |
| 2 | Rightmove Tenant Passport / "Rent Ready Passport" | UK | (p) | (p) | ? | ? | ? | ? | ? | Web form linked to referencing companies; sent to agents as email lead | Free lead-gen (tenant); agents paid for referencing via Van Mildert | (p) — pre-qualification form | N — Rightmove-only | Lead summary | Launched Jun 2018; Van Mildert acquired Jul 2019; standalone passport reported ended 2020, folded into Viewings Manager; 2025–26 status NOT SEARCHED | [S6][S7][S8][S9][S10][S11] |
| 3 | Goodlord referencing (incl. Vouch, absorbed 2025) | UK | Y | Y | Y | Y | Y | Y | Y | Income from HMRC, payroll providers and Open Banking (Tink); no reliance on payslips/employer refs; avg 24h, 1 in 3 instant | Agent/landlord pays (tenant fees banned); price not public; Vouch legacy "from £6" per reference | N — per tenancy | N | Full reference report | "Largest referencing provider in UK" (CLAIM); Vouch merged into Goodlord 2025 | [S12][S13][S14][S19][S20] |
| 4 | Homeppl (Thirdfort) | UK | Y | Y | Y (Konfir) | ? | Y | ? | Y | 150+ fraud tests (email tracking, reaction tests, font detection); Konfir payroll/HMRC income+employment (Nov 2025) | Agent pays; price NOT FOUND | N | N | Risk assessment report | Acquired by Thirdfort Feb 2025; remainder rebranded "Fraud Finder" | [S15][S16][S17][S18] |
| 5 | RentProfile | UK | Y | Y | Y | Y | Y | Y | Y | Automated referencing; e-passport check; AML | Agent/landlord pays: £13/tenant, £19/guarantor, £40 company tenant, £7 Right to Rent, £3 e-passport, £3 AML | N | N | Full report | Claims 24h turnaround, "20% uplift in approvals" (CLAIM) | [S22] |
| 6 | OpenRent referencing | UK | Y | Y (comprehensive) | Y (comprehensive) | Y (prev. landlord) | Y | Y | ? | Speedy (credit, ID/fraud, CCJs, RtR advice, ~1 day) vs Comprehensive (+income, affordability, prev. landlord; 3–5 days) | Landlord pays; historically £20, now reported ~£30 (uncertain) | N | N | Full report | Large DIY-landlord platform | [S23][S24] |
| 7 | Movem Passport | UK | Y | Y | ? | Y | Y | ? | ? | Automated referencing + tenant passport | Agent pays | Y (design intent) | (p) | Report | Acquired by Barbon/HomeLet "for several million"; integrated into HomeLet; founder left | [S25][S26] |
| 8 | Lettings Hub Property Passport | UK | Y | Y | ? | ? | Y | ? | ? | Tenant-owned referencing profile shared at enquiry | Free for tenants; agents pre-vet free | Y — uncertified 30 days, certified 90 days | (p) — shared with any agent on platform | Profile + certified result | Announced 2019, launch 2020; agent sign-ups (Chancellors) | [S27][S28][S29] |
| 9 | Zoopla "Tenant Passport" | UK | – | – | – | – | – | – | – | – | – | – | – | – | NOT FOUND (searched: `Zoopla "tenant passport" OR "rental passport"`) — no Zoopla product surfaced | – |
| 10 | Ideal Flatmate | UK | N | N | N | N | N | N | N | Personality-survey matching for flatshares | Free | n/a | n/a | n/a | TechCrunch 2017; no verification passport found | [S30] |
| 11 | CreditLadder / Experian Rental Exchange | UK | – | – | – | Y (rent reporting) | Y (builds score) | – | – | Open Banking read-only; payments matched and reported to Experian, Equifax, TransUnion; 6–8 weeks to appear; no backdating | Tenant: free for one bureau, £5/month for all three; Rental Exchange free for tenants and landlords | n/a (continuous) | Y — appears on statutory credit files | Credit file, not docs | >£2bn rent reported for 200k+ tenants (CLAIM); Experian announced Nov 2025 that rent counts in new 1,250-point score | [S31][S32][S33][S34] |
| 12 | Zillow Rental Applications | USA | Y | (p) | (p) | ? | Y | ? | ? | Online application + credit & background reports | Tenant pays $35 one-time, 30 days, unlimited participating rentals | Y — 30 days | N — Zillow "participating" listings only | Application + reports | Largest US rental portal (context) | [S39][S40][S41] |
| 13 | Apartments.com Applications | USA | Y | (p) | (p) | ? | Y (TransUnion) | ? | ? | Reusable application + TransUnion credit and background | Tenant pays $29 + tax; 10 participating listings; 30 days | Y — 30 days / 10 listings | N | Application + reports | CoStar-owned portal (context) | [S42][S43] |
| 14 | RentSpree | USA | Y | Y (+$10 bank-verified) | ? | Y (eviction) | Y (TransUnion) | ? | ? | TransUnion credit/criminal/eviction; Plaid-type bank income add-on | Tenant pays $39.99 (+$10 income = $49.99); free for agents/landlords | (p) | N | Full reports | California fee cap $65.86 (2026) | [S44][S45][S46] |
| 15 | TransUnion SmartMove | USA | Y (Premium) | Y (Income Insights, Premium) | ? | Y (eviction) | Y (ResidentScore) | N | N | Bureau data; applicant-initiated | Basic $25 / Plus $40 / Premium $49 per screening; landlord or tenant pays | N | N | Reports | Incumbent bureau product | [S47] |
| 16 | Avail (Realtor.com) | USA | Y (SSN) | (p) | (p) | Y (eviction, address history) | Y (ResidentScore) | N | N | TransUnion credit, criminal, eviction, OFAC, sex-offender | $55 bundle or $30 each; tenant typically pays | Y — shareable across Avail landlords, 30 days | N | Reports | – | [S48] |
| 17 | TurboTenant | USA | Y (expires 30 days) | (p) | (p) | Y (eviction) | Y (TransUnion) | N | N | TransUnion; Snappt partnership for doc fraud | Applicant pays $45 or $55 depending on landlord plan; landlord pays $0 | (p) — PTSR accepted where state law requires | (p) — state-mandated PTSR | Reports | – | [S49][S50] |
| 18 | Snappt | USA | Y (via CLEAR partnership) | Y (income verification, "99.8% accuracy" CLAIM) | Y | N | N | N | N | AI document-fraud detection: metadata, font consistency, PDF origin, digital signatures | Landlord pays; published marketing "$18/unit/year"; enterprise pricing unpublished | n/a | n/a | Fraud verdict + income verification | 2026 report: ~5% of 1.4M+ 2025 applications flagged; 2024: 6.4%; TenantCloud (Sep 2025) and TurboTenant partnerships | [S52][S53][S54][S55][S56][S57] |
| 19 | Boom (BoomReport) | USA | – | – | – | Y (rent reporting, up to 24 months back) | Y | – | – | Reports to Equifax, Experian, TransUnion; only on-time payments | Tenant $5/month (billed $60/yr) + $25 back-report; PM $2/renter/month (1,000+ units) | n/a | Y (credit file) | Credit file | – | [S58][S59] |
| 20 | Payscore (fka The Closing Docs) | USA | N | Y | (p) | N | N | N | N | Bank-linked income analysis (99% of N. American banks) | ~$10 per report, volume discounts | (p) | N | Income report | – | [S60][S61] |
| 21 | Plaid Income | USA | N | Y | Y (payroll) | N | N | N | N | Payroll API (ADP, Gusto…) or bank-transaction income | $1–3+ per successful verification (estimate); resold at $10 (RentRedi) | n/a | n/a | Income data | – | [S62][S63][S64] |
| 22 | Argyle / Truv | USA | N | Y | Y | N | N | N | N | Direct payroll connections: Argyle 90%+ of US workforce, Truv 85%+ | Contact sales / pay-per-success | n/a | n/a | Income + employment data | – | [S65][S66][S67] |
| 23 | Clara "Rental Passport"; Rent.com.au "Renter Resume" | USA / AU | ? | ? | ? | ? | ? | ? | ? | Apply once, share with multiple landlords | NOT FOUND | Y | (p) | ? | Small players; details NOT FOUND | [S68][S69] |
| 24 | Nestment | USA | – | – | – | – | – | – | – | Co-buying platform, **not** a rental passport | – | – | – | – | Scope mismatch | [S70] |
| 25 | Apartment List / Rent.com | USA | – | – | – | – | – | – | – | – | – | – | – | – | NOT FOUND (searched: "Apartment List renter profile verification OR Rent.com application screening fee") | – |
| 26 | DossierFacile | France | Y | Y | Y | (p) | N | N | Y (caution) | State-run digital dossier; documents per legal allow-list; validated; shared via link / DossierFacile Connect SSO | Free (state) | Y — one dossier for all applications | Y — PDF/link + SSO "Connect" to partner sites (PAP, Leboncoin dossier flow) | Validated documents (not score) | >1.7M dossiers (partner site) / >2M tenant accounts (other sources); >40,000 landlords and pros; 2025 goal +50% accounts, FranceConnect auto-creation | [S72][S73][S74][S75][S76][S77][S78][S79][S80] |
| 27 | Visale (Action Logement) | France | – | Y (eligibility) | – | – | – | – | Y (state guarantor) | State guarantee: 36 months unpaid rent, first 3 years | Free; ≤30 y.o. or >30 with ≤€1,500 net; caps €1,940 IDF / €1,575 / €1,365 | Y (visa valid for search period) | Y | Visale certificate | Public scheme | [S83][S88] |
| 28 | Garantme / Cautioneo / Unkle | France | Y | Y | Y | – | – | – | Y (institutional) | Private guarantor underwriting | Tenant pays: Garantme 3–4.5% of annual rent (€432/yr on €800); Cautioneo 4.1% + €12 (3.75% students/civil servants); SmartGarant ~€288 | Y (certificate reused during search) | Y | Guarantee certificate | **Unkle has stopped** offering tenant guarantees | [S84][S85][S86][S87] |
| 29 | ImmoScout24 MieterPlus → "Suchen+" + SCHUFA-BonitätsCheck | Germany | (p) | (p) (self-declared) | (p) | N | Y (SCHUFA, separate) | N | N | Digital Bewerbermappe (self-declaration + uploads); SCHUFA tenant-specific certificate | Tenant pays: Suchen+ €12.99–39.99/month (3/6/12-month terms); SCHUFA-BonitätsCheck €29.95, not included | Y (subscription period; SCHUFA cert reusable) | (p) (SCHUFA PDF portable) | Docs + SCHUFA certificate (landlord-relevant data only) | Dominant German portal (context) | [S89][S90] |
| 30 | Mieterselbstauskunft (standard) | Germany | Y | Y | Y | (p) (Mietschuldenfreiheit) | Y (SCHUFA Bonitätsauskunft) | N | N | Paper/PDF self-declaration; 3 payslips; SCHUFA; phase-dependent questions under DSGVO | Free form; SCHUFA cert paid by tenant | Y (de facto) | Y (PDF) | Docs | Industry norm, not a product | [S91][S92][S93] |
| 31 | Pararius / Funda tenant selection | Netherlands | Y | Y | Y | Y (landlord declaration) | N | Y | N | Documents: ID copy, tax-authority income statement, employer declaration, payslips, bank statements, landlord declaration | Free form; agent screens | N | N | Docs | Pararius publishes protocol; Funda specifics NOT FOUND | [S94][S95] |
| 32 | Finaer | Spain (also AR) | Y | Y | Y | – | – | – | Y (guarantee company) | Caución/garantía; "Inquilino 10" (May 2025) protects rent up to 10 years at €0 for landlords | Tenant pays; Spain price NOT FOUND (Argentina ≈140% of one month's rent) | Y (approval reused in search) | Y | Guarantee | Since 2011 | [S96][S97] |
| 33 | Idealista (ES): precalificación, BDMI, Seguro Garantía de Inquilino | Spain | Y | Y | Y | Y (BDMI delinquency DB; "no moroso" certificate checks 5 DBs) | (p) | N | Y (tenant-paid insurance) | Pre-qualification certificate; morosidad database | Tenant pays insurance (12 months' rent cover); certificate price NOT FOUND | Y (certificate) | (p) | Certificate | Portal-level scale | [S98][S99][S100][S103][S104] |
| 34 | Housfy (ES) | Spain | Y | Y | Y | Y | Y (scoring) | – | – | Proprietary scoring (payment history, mobility, criminal records claim) | Landlord pays: 1 month rent + VAT marketing; 5% (collection guarantee) / 6.5% (full mgmt) | N | N | Score + candidate | "1% default vs 14% OCU average" (CLAIM) | [S101][S102] |
| 35 | Alquiler Seguro / Badi Pro | Spain | – | – | – | – | – | – | – | – | – | – | – | – | NOT FOUND (searched: "Finaer … Alquiler Seguro precio 2025"; "Badi Pro verificación") | – |
| 36 | CRIF "Affittabile" (MisterCredit) | Italy | (p) | Y (sustainable rent) | – | – | Y (EURISC negatives, protests, pregiudizievoli) | – | – | Tenant buys PDF report; 5-level reliability rating | Tenant pays €39; 1 business day | Y (PDF, validity not stated) | Y (PDF handed to any landlord) | Rating + sustainable rent + negatives (not raw file) | Landlord cannot query CRIF directly | [S105][S106][S107] |
| 37 | Immobiliare.it "Affitto Sicuro" | Italy | – | – | – | – | – | – | – | – | – | – | – | – | NOT FOUND as a product (searched: `Immobiliare.it "Affitto Sicuro"`) — only a generic news article on "polizze affitto sicuro" surfaced | [S108] |
| 38 | Idealista Italia rental protection (with ARAG) | Italy | – | Y (automated solvency analysis) | – | – | – | – | Y (insurance) | Legal-protection + indemnity policy incl. automated solvency analysis | Premiums 1.4–2.5% of annual rent (€84–150/yr on €500/month); usually charged to tenant | N | N | Solvency outcome | Published 22 Sep 2026 | [S109][S110][S111] |
| 39 | Zappyrent | Italy | Y | Y | Y | ? | ? | – | Y (guaranteed rent) | In-house team verifies tenant; landlord receives detailed tenant profile sheet; rent paid on the 12th regardless | Landlord pays 100% of first month + 8% monthly | N | N | Profile sheet (economic stability) | "Only service in Europe paying rent if tenant stops" (CLAIM) | [S112][S113][S114] |
| 40 | Rentila (IT) | Italy | N | N | N | N | N | N | N | Landlord management SaaS; guidance only (rent ≤25–33% gross income) | Freemium | n/a | n/a | n/a | 50,000+ landlords in Europe (CLAIM) | [S115][S116] |
| 41 | Garantitaly / "Affitto Garantito" / fideiussioni | Italy | – | – | – | – | – | – | Y | Bank fideiussione: €50 fixed + 2–3% of annual rent per year; insurance fideiussione ≈ one month's rent for whole contract | Tenant pays | Y (instrument) | Y | Guarantee | Garantitaly specifics NOT FOUND; generic sites only | [S109][S110][S111] |

---

## 3. Detailed notes per notable product

### 3.1 DossierFacile (France) — the only state-run reusable tenant dossier found

- **What it is.** A free public service (beta.gouv.fr start-up, Ministry of Housing) that lets a tenant build one digital rental file ("dossier de location numérique") and share it with any landlord. **FACT** [S72][S73].
- **Scale.** The official partner site states "more than 1,700,000 files created to date"; other sources cite >2 million tenant accounts since the 2018 launch; >40,000 landlords and real-estate professionals use it; in April 2024 the file count passed one million. An older snippet (500,000 candidates) shows the growth curve. 2025 objective: +50% tenant accounts year-on-year and automatic file creation via FranceConnect. **FACT (figures vary by counting method)** [S72][S73][S79][S80][S77].
- **Verification method.** Document upload per legal allow-list; files are validated by the service (operator review is widely described but the exact validation mechanism was **not directly verified in this session** — label CLAIM). The Ministry of the Interior's "Ma Sécurité" portal recommends DossierFacile specifically to "avoid fake rental files" and to "protect your rental documents", which supports the presence of anti-fraud protection (watermarking is widely reported; **CLAIM**) [S74].
- **Sharing / portability.** The former "API Partenaire" was decommissioned on 31 March 2025; partners now integrate **DossierFacile Connect**, an SSO where the candidate logs in on the partner site and consents to share the dossier data (JSON examples published). PAP launched a service built on DossierFacile (government press release); Leboncoin exposes a "send my tenant file" flow. **FACT** [S75][S76][S77][S78].
- **Legal basis.** Article 22-2 of the Law of 6 July 1989 as amended by the ALUR law, implemented by **Décret n° 2015-1437 of 5 November 2015**, which fixes the exhaustive list of documents a landlord may request from a candidate and a guarantor (identity, professional situation, domicile, resources). Any request outside the list is illegal and exposes the landlord to a fine; in force since 8 November 2015. **FACT** [S81][S82]. DossierFacile's document checklist is a direct implementation of that allow-list (**HYPOTHESIS** — consistent with all sources, not read in the decree text itself).
- **What the landlord sees.** The validated documents themselves (not a score) — France has no consumer credit bureau; income is proven by documents, and risk is transferred to guarantees (Visale, private guarantors). **HYPOTHESIS** supported by [S81][S83][S84].
- **Complaints.** NOT SEARCHED (budget exhausted before "DossierFacile avis … Trustpilot" ran).
- **Lesson.** A reusable dossier reached mass adoption where (a) it was free, (b) the state defined the legal document allow-list, (c) the dossier became the integration standard for portals (Connect SSO), and (d) no credit-bureau gatekeeper existed to monetise "the result".

### 3.2 Canopy Rent Passport (UK)

- Tenants build a Rent Passport in 10–15 minutes and share it with agents; powered by Open Banking and Experian credit data; verifies income, rental affordability and historical rent payments in 5–15 minutes; soft credit check. **CLAIM/FACT** [S1][S2].
- Free for tenants; agents get "free and unlimited instant tenant screening" for Rent Passport holders (**CLAIM**) [S1][S2]. The economic model is therefore not referencing fees but financial products (deposit replacement, rent tracking, insurance) sold to the renter via the app (**FACT** from Silicon Canals description of RentPassport as "a free digital rental profile that lets renters access all the financial products from a single app") [S5].
- Portability: OnTheMarket integrated Canopy's RentPassport so movers can arrive "rent ready" [S3][S10]. A MoneySavingExpert forum thread titled "Have you heard of CANOPY and PLAID?" indicates that tenants are being asked by agents to use it and are unsure about the Open-Banking connection (**HYPOTHESIS** from title only).
- Traction numbers, app-store ratings and Trustpilot complaints: NOT SEARCHED (budget exhausted).

### 3.3 Goodlord (UK) — the incumbent "per-tenancy" referencing model

- Income verified directly from HMRC, payroll providers and Open Banking (Tink partnership); explicitly does not rely on payslips or employer references "which can be forged"; average turnaround 24h, one in three references instant. **CLAIM** [S12][S13][S14].
- Under the Tenant Fees Act 2019 the tenant cannot be charged, so the agent/landlord pays; many agents choose Goodlord because referencing is embedded in a broader tenancy workflow (contracts, deposits, insurance). Price not public. **FACT/CLAIM** [S12].
- Vouch (previously "from £6" per full reference; agents could earn "up to £300 per property" from ancillary revenue) was absorbed by Goodlord in 2025 and survives only as a tier name. **FACT** [S19][S20][S21].
- No reusable or portable artefact: references are tied to a specific tenancy. **HYPOTHESIS** (no reusable feature surfaced in any Goodlord source).
- Traction (references/year, agent count): NOT SEARCHED.

### 3.4 Homeppl (Thirdfort) and Konfir — the fraud-first model

- 150+ fraud tests per applicant (email tracking, reaction tests, data enrichment, font detection, integrity analysis); positions itself as making "invisible" applicants (internationals, students, thin files) assessable. **CLAIM** [S16].
- Acquired by Thirdfort (client due diligence / AML) in February 2025; the remaining business rebranded "Fraud Finder". **FACT** [S15].
- November 2025 partnership with Konfir for instant employment and income verification (UK payroll/HMRC-linked). **FACT** [S17]. Konfir pricing: NOT SEARCHED.
- Industry context: "tenancy fraud attempts double" (The Negotiator) [S18].

### 3.5 Zillow Rental Applications (USA) — platform-bounded reusable application

- $35, one-time purchase, apply to unlimited **participating** rentals for 30 days; includes credit and background reports; charge may appear as "recurring" on statements but is not auto-renewed. **FACT** (Zillow help centre snippets) [S39][S40][S41].
- Bureau/vendor behind the credit and background report: NOT FOUND in snippets.
- Reusable (30 days) but **not portable**: only Zillow-participating listings. Apartments.com's equivalent is $29 + tax for 10 listings / 30 days with TransUnion reports [S42][S43].
- Complaints: NOT SEARCHED ("paid $35, landlords never responded" query did not run). Context: Upturn's "Tenants Pay the Price" report on screening-fee burden exists [S51] (title only).
- **US legal driver of portability:** Portable Tenant Screening Report (PTSR) statutes — Colorado, California, Illinois, Maryland, Rhode Island, New York, Washington — let applicants submit a reusable report (validity generally 30–90 days) and a landlord that accepts one may not charge an application fee [S50]. California caps application fees at $65.86 in 2026 [S46]. FCRA/FTC guidance for landlords: NOT SEARCHED.

### 3.6 ImmoScout24 MieterPlus / "Suchen+" and SCHUFA-BonitätsCheck (Germany)

- MieterPlus was renamed "Suchen+"; €12.99–39.99 per month depending on plan and term (3/6/12 months); includes a digital application folder (Bewerbermappe) and exclusive listings. The SCHUFA-BonitätsCheck is **not** included and costs €29.95 separately; it is a tenant-specific certificate containing only landlord-relevant information, downloadable immediately. **FACT** [S89][S90].
- The German norm is the *Mieterselbstauskunft*: not mandatory; questions are phase-dependent (basic data at viewing, income only after serious interest); permitted evidence includes three payslips, a SCHUFA Bonitätsauskunft and a Mietschuldenfreiheitsbescheinigung; landlords may **not** demand the Art. 15 GDPR data copy; questions on religion, nationality, pregnancy etc. are prohibited. **FACT** [S91][S92][S93].
- Model: tenant-pays subscription + tenant-pays credit certificate — i.e. the opposite of the UK model. Portability is de facto (PDF), not technical.

### 3.7 Snappt (USA) — document fraud detection as a layer

- Detects altered pay stubs and bank statements via metadata, font consistency, file-creation data, PDF origin and digital signatures. **CLAIM** [S52][S56].
- 2026 Multifamily Fraud Report: ~5% of 1.4M+ applications analysed in 2025 showed fraud signs; 2024 report: 6.4%. **FACT (vendor research)** [S52][S53].
- Marketing cites "$18 per year per unit"; enterprise pricing is unpublished and judged unsuitable for small landlords by a competitor blog. **CLAIM** [S56][S57]. Distribution via TenantCloud (Sep 2025) and TurboTenant partnerships [S54][S49]. Identity layer via CLEAR partnership [S55].
- Relevance: a passport that accepts uploaded documents needs this layer; one that uses open-banking/payroll data largely avoids the need (**HYPOTHESIS**; consistent with Goodlord's stated reasoning [S12]).

### 3.8 CRIF Italy — "Affittabile" and the CRIF access constraint

- CRIF's consumer brand MisterCredit sells **Affittabile**: the tenant pays €39 and receives within one business day a PDF with a 5-level reliability rating (high → low), an indication of the sustainable monthly rent, and verification of absence of negative records in EURISC and public negative data (protests, enforcement). The tenant hands the report to the landlord/agency. **FACT** [S105][S106][S107].
- Constraint: a landlord **cannot query CRIF directly**; the report is accessible only to the data subject or on explicit written mandate [S107]. A protest search (visura protesti) costs €8–15 via Infocamere/Chamber of Commerce [S107].
- This is the closest existing Italian artefact to a "tenant passport": tenant-initiated, portable PDF, result-oriented (rating, not raw data). Validity period and adoption numbers: NOT FOUND.

### 3.9 Italian eID vendors (SPID / CIE) and IDV fallbacks

- **SPID (consumer side):** Namirial €19.90 + VAT with webcam recognition, renewal €9.99/yr; InfoCert free until 2025, then €5.98/yr from 28 July 2025 (CIE/CNS/signature recognition free); Aruba first year free then €4.90 + VAT/yr; Poste free (per truenumbers). **FACT** [S117][S118][S119][S120]. **Service-provider-side (relying party) pricing for private SPs/aggregators: NOT SEARCHED** (query did not run).
- **CIE "Entra con CIE":** federated model with a single IdP (Ministry of the Interior); open to public and private service providers; SAML v2 technical rules published; automated federation portal; integration described as free for third-party providers. **FACT** [S121][S122][S123].
- **Commercial IDV (document + selfie) for non-Italian tenants:** Veriff self-serve from $0.80/verification; Sumsub $1.35 (≈$149/month minimum); Onfido enterprise ≈$2–4; Stripe Identity $1.50 per document+selfie, first 50 free, US SSN lookup $0.50. **FACT (published list prices; Italy-specific pricing NOT FOUND)** [S130][S131][S132][S133][S134].

### 3.10 Other notable items

- **Visale vs private guarantors (France).** Visale is free (state), 36 months' cover, with age/income eligibility and rent caps; private guarantors cost 3–4.5% of annual rent; Unkle has exited. [S83][S84][S85][S86][S87][S88]
- **Zappyrent (Italy).** Guaranteed rent (paid on the 12th) with in-house tenant vetting; landlord pays 100% of month one plus 8%/month and receives a detailed tenant profile sheet. [S112][S113][S114]
- **Housfy (Spain).** Scoring + guaranteed collection from 5% of monthly rent plus one month's rent marketing fee; claims 1% default vs 14% OCU market average. [S101][S102]
- **Pararius (NL).** Publishes its tenant-selection protocol: ID, household, net income, tax-authority income statement, employment contract/employer declaration, payslips, bank statements, landlord declaration; highest joint income preferred after a minimum. [S94]
- **Rent reporting (UK/US).** CreditLadder (free for one bureau, £5/month for three; 6–8 weeks to show; no backdating) and Boom ($5/month, $25 for 24-month back-report; on-time only) turn rent history into bureau data; Experian UK announced in Nov 2025 that rent will count in a new 1,250-point score. [S31][S33][S34][S58][S59]

---

## 4. Does the reusable "Tenant Passport" already exist?

**Short answer: Yes — in at least four distinct forms — but no single product is simultaneously (a) free for the tenant, (b) verified with hard data (open banking / payroll / eID), (c) portable across competing portals and agencies, and (d) result-only (privacy-preserving). Each existing passport sacrifices at least one of those.**

| Form | Examples | Reusable | Portable | Verified by hard data | Result-only | Outcome |
|---|---|---|---|---|---|---|
| State-run document dossier | DossierFacile (FR) | Y | Y (PDF/link/SSO) | N (documents, validated) | N (docs) | **Works at scale** (>1.7–2M dossiers) [S72][S79] |
| Platform-bounded paid application | Zillow $35/30d; Apartments.com $29/30d/10 listings; Avail $55/30d | Y | N (participating listings only) | (p) bureau credit/background | N (reports) | Works commercially; portability only where PTSR laws force it [S39][S42][S48][S50] |
| Free-for-tenant private passport (financial-products model) | Canopy Rent Passport (UK); Lettings Hub Property Passport (30/90 d) | Y | (p) (portal partnerships) | Y (open banking + Experian) | (p) | Alive; traction numbers not verified [S1][S3][S27] |
| Tenant-bought certificate | CRIF Affittabile €39 (IT); SCHUFA-BonitätsCheck €29.95 (DE); Idealista precalificación / no-moroso cert (ES) | Y | Y (PDF) | Y (bureau) | Y | Works as a niche artefact; no integration standard [S105][S89][S98] |
| Portal-run passport (lead-gen) | Rightmove Tenant Passport 2018–2020 | (p) | N | N | N | **Ended as standalone**; folded into viewings tooling [S6][S8][S10] |
| Standalone passport start-up | Movem (UK) | Y | (p) | Y | (p) | **Acquired and absorbed** into HomeLet [S25][S26] |

### 4.1 Where it works, and why

1. **France / DossierFacile** — a legal allow-list (ALUR, décret 2015-1437) plus a free state service and an SSO integration standard created a de-facto national format; portals (PAP, Leboncoin) adopted it rather than compete with it. **FACT** [S72]–[S82].
2. **US portals** — reusable 30-day applications work because the tenant already expects to pay $25–65 per application; "apply to unlimited participating listings" converts a fee into a value proposition. Portability is being forced by PTSR statutes, not by product design. **FACT** [S39][S42][S46][S50].
3. **Tenant-bought certificates (DE/IT/ES)** — succeed where a credit bureau exists but landlords cannot query it (Italy: CRIF requires the data subject to request; Germany: Art. 15 copy may not be demanded). The passport is the tenant's workaround for an access asymmetry. **FACT/HYPOTHESIS** [S105][S107][S92].

### 4.2 Where it failed or stalled, and why (HYPOTHESIS unless marked)

- **Rightmove (UK, 2018–2020):** the passport was an email-lead pre-qualification form, not a verified artefact, and agents already received free referencing economics elsewhere; the standalone product was discontinued and merged into Viewings Manager. [S6][S8][S10] (FACT on timeline; reason is HYPOTHESIS)
- **Movem (UK):** a well-regarded standalone passport was bought by the incumbent (Barbon/HomeLet) and migrated into the per-tenancy referencing platform; the founder left — evidence that the incumbent's unit of value is "the tenancy", not "the tenant". [S25][S26]
- **UK Tenant Fees Act 2019** removed the tenant-pays referencing model (banned since 1 June 2019 for new tenancies, 1 June 2020 for all). Any UK passport must therefore be free to the tenant and monetised via agents or financial products — the Canopy model — which weakens tenant pull. [S35][S36][S37]
- **Low reuse frequency:** tenants move every few years, so a 30–90-day validity window and verification decay (identity expires after 30 days at TurboTenant [S49]) mean the "passport" is really a "visa": re-issued per search, not a durable identity.
- **Guarantor start-ups churn:** Unkle (FR) exited [S87]; "reverse" marketplaces in adjacent sectors (Hired) failed to scale because demand is cyclical while supply is steady [S137][S139].

### 4.3 Legal constraints by country (what a passport may contain and who may pay)

| Country | Constraint | Implication for a passport | Src |
|---|---|---|---|
| UK | Tenant Fees Act 2019: referencing, credit-check, guarantor and admin fees charged to tenants are banned (new tenancies from 1 Jun 2019; all from 1 Jun 2020). Right-to-Rent checks are a landlord legal duty. Renters' Rights Act 2025 is the next reform (not analysed). | Tenant cannot be charged; landlord/agent-pays or financial-product monetisation only. | [S35][S36][S37][S38] |
| France | Art. 22-2 Law 6 July 1989 (ALUR) + Décret 2015-1437: exhaustive allow-list of documents from candidate and guarantor; requests outside the list are illegal (fine). State offers DossierFacile and Visale free. | A dossier format is legally pre-defined; private passports must stay inside the allow-list and compete with a free public one. | [S81][S82][S83] |
| USA | FCRA governs consumer reports (NOT SEARCHED this session); state PTSR laws (CO, CA, IL, MD, RI, NY, WA) require acceptance of a portable report (30–90 days) and forbid charging a fee if accepted; CA fee cap $65.86 (2026). | Portability is a compliance feature; tenant-pays is normal. | [S46][S50] |
| Germany | DSGVO data minimisation; phase-dependent questions; SCHUFA Bonitätsauskunft allowed, Art. 15 copy not demandable; forbidden topics (religion, nationality, pregnancy…). | Passport must stage disclosure (viewing → serious interest → contract). | [S92][S93] |
| Netherlands | Agents publish protocols (Pararius); "Wet goed verhuurderschap" context NOT VERIFIED. | Document-heavy, income-ranked selection. | [S94][S95] |
| Italy | No statutory allow-list found (NOT FOUND: Garante-specific guidance on tenant selection); practice = ID, codice fiscale, buste paga, dichiarazione dei redditi, with a privacy informativa and data minimisation; landlord cannot query CRIF directly (data-subject request or written mandate only); fideiussione costs borne by tenant. | A tenant-initiated, consent-based, result-only passport fits the legal gap; CRIF access asymmetry is a feature, not a bug. | [S105][S107][S128][S129][S110] |

---

## 5. Verification building blocks available in Italy today

| Block | Options available now | Rough price (as found) | Integration notes | Reliability caveats | Src |
|---|---|---|---|---|---|
| **Identity (strong)** | CIE 3.0 "Entra con CIE" (Ministry of Interior IdP; open to private SPs; SAML v2; federation portal). SPID via an accredited identity provider / aggregator. | CIE: integration described as free for third-party SPs. SPID consumer issuance: Namirial €19.90+VAT, InfoCert €5.98/yr, Aruba €4.90+VAT/yr after year 1. **Relying-party (SP) fees for SPID: NOT SEARCHED.** | eIDAS "high" assurance; CIE needs NFC phone or CieID app; SPID coverage is near-universal for Italian adults (not verified numerically). | Non-residents / new arrivals have neither SPID nor CIE → need fallback. | [S117][S118][S119][S120][S121][S122][S123] |
| **Identity (fallback, foreigners)** | Document + selfie IDV: Veriff, Sumsub, Onfido, Stripe Identity | Veriff from $0.80; Sumsub $1.35 (min $149/mo); Onfido ≈$2–4 (enterprise); Stripe Identity $1.50 (first 50 free) | SDK-level; minutes to integrate; Stripe covers Italian IDs (CLAIM; country list not verified) | Deepfake/synthetic-ID risk; not legally equivalent to SPID/CIE. | [S130][S131][S132][S133][S134] |
| **Income / affordability (data)** | PSD2 open banking (AISP): Tink (income verification product, Italian site), CRIF RealTime (AISP licensed in Ireland, used by CRIF Italia), Fabrick (Italian open-finance platform), Salt Edge | Per-connection pricing NOT FOUND (vendor quotes). Benchmark: Plaid Income $1–3+ per successful verification (US). | Read-only consent; salary inflows and rent outflows can be classified; CRIF reports 20% process-efficiency gains in lending. | 90-day re-consent under PSD2 RTS (**CLAIM, not verified this session**); cash-paid workers and multi-bank users yield partial pictures; self-employed income irregular. | [S124][S125][S126][S127][S63] |
| **Income (documents)** | Busta paga, CU (Certificazione Unica), Modello 730/Redditi; employer letter | Free (tenant-supplied) | Needs a Snappt-style document-fraud layer if accepted at scale | Forgeable; Snappt finds ~5–6.4% of US applications fraudulent. | [S128][S52][S53] |
| **Credit / negatives** | CRIF Affittabile (tenant-purchased PDF: 5-level rating, sustainable rent, EURISC negatives, protests); visura protesti (Infocamere) | Affittabile €39; protesti €8–15 | Tenant-initiated only; no landlord API. A passport can ask the tenant to upload the Affittabile PDF or (future) mandate CRIF. | Thin files for young/foreign tenants; CRIF negative-only view in this product. | [S105][S106][S107] |
| **Employment** | No Italian Argyle/Truv/Konfir-style payroll API found (**NOT FOUND**, searched: open-banking/Italy queries only). Proxies: open-banking salary pattern (regular inflow from employer name), CU, contract. | – | Employer-name matching on bank inflows is feasible with AISP data | Fixed-term/agency/gig workers mis-classified. | [S124] |
| **Rental history** | No bureau rental data in Italy (**NOT FOUND**). Proxies: open-banking rent outflows; previous landlord reference; registered-contract evidence (Agenzia delle Entrate registration) — tenant-supplied. | – | – | Cash rent and unregistered contracts are common in some segments (**HYPOTHESIS**). | – |
| **Guarantees** | Fideiussione bancaria (€50 fixed + 2–3% of annual rent/yr); fideiussione assicurativa (≈1 month's rent for whole contract); rent-default insurance (1.4–2.5% of annual rent, Idealista/ARAG); guaranteed-rent operators (Zappyrent: 100% first month + 8%/month, landlord-paid) | as stated | Partner/referral integration, not API | Tenant usually bears cost; insurance pays only after eviction judgment (up to 6–12 months). | [S108][S109][S110][S111][S112] |

**Recommended Italy MVP stack (HYPOTHESIS, derived from the above):** CIE/SPID for residents + Stripe Identity/Veriff fallback → Tink or CRIF RealTime AISP for income/rent-pattern → optional CRIF Affittabile upload for negatives → document upload (CU/busta paga) only as secondary evidence with fraud checks → guarantee marketplace (fideiussione/insurance/Zappyrent-type) as a conversion lever for thin-file tenants.

---

## 6. Cross-industry UX principles (Part B)

| # | Pattern | Evidence (source) | Label | How it transfers to a rental reverse-marketplace |
|---|---|---|---|---|
| B1 | **Opt-in availability signal with audience control** — LinkedIn "Open to Work": share with all members (green frame) or recruiters only; job preferences (titles, locations, start date) attached; privacy best-effort vs own employer. | [S135][S136] | FACT | "Open to rent" toggle: tenant publishes a verified profile visible only to verified landlords/agents, with preferences (area, budget, move-in date); never public. |
| B2 | **Reverse recruiting is fragile** — Hired ($133M raised, ~$500M valuation) wound down 2020, sold to Vettery/Adecco, folded into LHH June 2024; reverse job boards struggle because demand is cyclical while candidate supply is steady. Otta sold to Welcome to the Jungle (Jan 2024), brand retired. | [S137][S138][S139][S140] | FACT | Don't make "landlords apply to tenants" the only mode; keep a conventional listing/apply path and treat reverse matching as an accelerator for verified, high-intent tenants. |
| B3 | **Invitation systems narrow competition** — Upwork clients search, filter and invite freelancers; freelancer can accept, decline, or decline-and-refer. Toptal pre-vets ("top 3%") and human-matches two candidates in 24–48h. | [S141][S142][S143] | FACT | Landlord "invites to apply/view" sent to shortlisted verified tenants; tenant can accept, decline, or refer a flatmate; limited invites per listing to keep signal high. |
| B4 | **Bilateral (stable) matching + explanation** — Hinge "Most Compatible" uses Gale-Shapley stable matching + ML, refreshed every 24h; trials showed 8x more likely to lead to a date. | [S144][S145] | FACT (vendor) | Daily "best mutual fit" between tenant preferences and landlord criteria, with a one-line "why this match" (budget fit, move-in date, pets policy). |
| B5 | **Lower the first-move burden** — Bumble "Opening Moves" (Apr 2024): women set a prompt; 9/10 women were sending "hey" anyway; 66% preferred men to make the first move. | [S146][S147][S148] | FACT | Pre-set prompts ("Ask me about my guarantor", "Available from 1 Nov") so landlords can open conversations without free-text; reduces ghosting of cold applications. |
| B6 | **Trust badges with explicit criteria** — Airbnb Guest Favorite: ≥5 reviews, >4.9 average, ≤1% host cancellation, evaluated daily; "Identity verified" badge on guest profiles; Verified Listing. | [S149][S150][S151][S152] | FACT | Tiered badges: "ID verified (CIE/SPID)", "Income verified (open banking)", "Guarantee attached"; publish the criteria; re-evaluate on expiry. |
| B7 | **Verification pricing is cheap and should be invisible** — Stripe Identity $1.50/verification, first 50 free; Veriff from $0.80; Sumsub $1.35. | [S130][S133][S134] | FACT | Absorb IDV cost in the free tier; never surface a fee for identity — monetise on the landlord side or on guarantees. |
| B8 | **Document fraud is a measurable base rate** — Snappt: ~5% (2025) / 6.4% (2024) of applications fraudulent. | [S52][S53] | FACT | Prefer data-source verification over uploads; where uploads are allowed, show a "document integrity checked" state. |
| B9 | **Staged disclosure is a legal requirement in some markets** — German Mieterselbstauskunft: basic data at viewing, income only after serious interest; GDPR minimisation. | [S92][S93] | FACT | Progressive disclosure by stage: profile summary → verified badges → full dossier only after landlord shortlists and tenant consents. |
| B10 | **Portability is being mandated** — US PTSR statutes (CO, CA, IL, MD, RI, NY, WA), 30–90-day validity, no fee if accepted; DossierFacile Connect SSO as the portability standard in France. | [S50][S76] | FACT | Design the passport as an exportable, time-boxed, consent-scoped artefact (PDF + share-link + SSO) from day one. |
| B11 | **Marketplace cold-start: constrain the market, single-player value, subsidise the hard side; "come for the tool, stay for the network"** | NOT VERIFIED this session (fetch blocked; see §8.3 unverified references) | CLAIM (well-known literature, unverified) | Launch in one city/segment; make the passport useful alone (tenant gets a PDF/certificate even with zero landlords); subsidise landlords/agents (free screening) as the hard side. |
| B12 | **Fintech onboarding (Revolut/N26/Monzo), profile-completion meters, empty-state design (NN/g)** | NOT SEARCHED (budget exhausted before queries ran) | — | Not evidenced here; treat as hypotheses to validate in usability tests. |

---

## 7. Feature classification draft (MVP triage)

Complexity: S/M/L. Network effect: how much the feature strengthens two-sided liquidity. Classification: MUST / SHOULD / EXPERIMENT / AVOID / POST-MVP.

| # | Feature | Competitors that have it | Why users value it | Downside | Cx | Legal / privacy | Network effect | MVP class | Reasoning |
|---|---|---|---|---|---|---|---|---|---|
| 1 | One reusable, time-boxed tenant dossier (30–90 d) | DossierFacile [S72]; Zillow/Apartments.com/Avail (30 d) [S39][S42][S48]; Lettings Hub (30/90 d) [S27]; Canopy [S1] | Apply once; no repeat uploads | Validity decay; re-verification friction | M | Consent + retention schedule (GDPR) | High — the core asset | **MUST** | It is the product; validated at scale in FR and US. |
| 2 | eID identity (CIE/SPID) | None of the benchmarked products; Italian public sector | Strong, free, legally recognised | Excludes foreigners/newcomers | M | eIDAS; minimal data | Medium | **MUST** | Unique Italian advantage; cheapest "hard" trust signal. |
| 3 | Document+selfie IDV fallback | Airbnb [S151]; Snappt/CLEAR [S55]; Stripe/Veriff [S133][S130] | Includes non-Italian tenants | Cost $0.80–1.50; deepfakes | S | Biometric data → explicit consent, DPIA | Medium | **MUST** | Students/expats are a key early segment. |
| 4 | Open-banking income & affordability | Canopy [S1]; Goodlord/Tink [S14]; RentSpree+Plaid [S44]; Payscore [S60] | Instant, forgery-proof | Consent anxiety; multi-bank gaps; re-consent | M | PSD2 AISP partner; data minimisation (derive ratios, discard transactions) | High | **MUST** | Replaces payslips; main differentiator vs Italian status quo. |
| 5 | Rent-payment history from bank data | Canopy [S1]; CreditLadder [S31] | Proves behaviour, not just income | Cash rent invisible | S (on top of #4) | Same as #4 | Medium | **SHOULD** | Cheap once #4 exists. |
| 6 | Credit-negatives via tenant-purchased CRIF report | CRIF Affittabile €39 [S105]; SCHUFA €29.95 [S89] | Landlord-grade signal | Tenant cost; thin files | S (upload) / L (mandate API) | Data-subject initiated only | Low | **SHOULD (upload)**, POST-MVP (API) | Landlord cannot query CRIF; accept PDF now. |
| 7 | Payroll/employer API verification | Argyle/Truv (US) [S65][S66]; Konfir/Goodlord (UK) [S17][S12] | Employment certainty | **No Italian provider found** | L | Employer data | Medium | **POST-MVP** | Not available; use bank inflow pattern. |
| 8 | Document upload (CU/busta paga/730) with fraud detection | Snappt [S52]; Homeppl 150 tests [S16] | Familiar to Italian landlords | Fraud 5–6% base rate; manual review | M | Sensitive financial docs; retention | Low | **SHOULD** | Secondary evidence only; needs integrity checks. |
| 9 | Result-only sharing (score/tier, not raw docs) | CRIF Affittabile rating [S105]; SmartMove ResidentScore [S47]; Housfy scoring [S101] | Privacy; faster landlord decision | Opaque scores → discrimination risk; explainability | M | GDPR Art. 22 (automated decisions) → keep human decision + explanation | High (lowers landlord effort) | **MUST** | Core of "passport ≠ dossier"; default to tiers with drill-down on consent. |
| 10 | Staged / progressive disclosure by funnel step | German Mieterselbstauskunft rules [S92] | Legal in DE; less exposure | More UI states | S | Strong GDPR fit | Medium | **MUST** | Cheap and compliance-positive. |
| 11 | Watermarked / tamper-evident PDF export | DossierFacile (CLAIM) [S74]; SCHUFA cert [S89] | Portability beyond platform; anti-reuse-fraud | PDFs can still be altered | S | – | High (portability) | **MUST** | Single-player value even with zero landlords. |
| 12 | Share-link with expiry and revocation; SSO "Connect" for partners | DossierFacile Connect [S76]; Leboncoin flow [S78] | Tenant control; partner integration | Partner BD effort | M | Consent logging | High | **SHOULD** (link) / POST-MVP (SSO) | Link now; SSO when a portal partner exists. |
| 13 | "Rent-ready" pre-qualification before viewing | Rightmove 2018 [S6]; Lettings Hub [S27]; OnTheMarket+Canopy [S3] | Fewer wasted viewings | Rightmove's standalone version failed | S | – | High | **SHOULD** | Only valuable if landlords honour it; pair with #3/#4. |
| 14 | Legal document allow-list / request guard | ALUR décret [S81]; DE forbidden questions [S92] | Protects tenants from over-collection | Italy has no statutory list | S | Builds GDPR minimisation in | Medium | **SHOULD** | Encode a self-imposed allow-list; marketing asset. |
| 15 | Guarantor / co-signer module | RentProfile (£19) [S22]; Goodlord [S12]; DossierFacile caution [S81] | Unlocks students/thin files | Doubles verification scope | M | Guarantor consent | Medium | **SHOULD** | Common in Italy (garante). |
| 16 | Guarantee / insurance marketplace (fideiussione, Visale-like, guaranteed rent) | Garantme/Cautioneo [S84][S86]; Finaer [S97]; Zappyrent [S112]; Idealista/ARAG [S109] | Converts "risky" tenants; revenue | Regulatory (insurance distribution), partner dependency | L | IDD/insurance rules | High (landlord pull) | **POST-MVP** | Revenue line; needs partners. |
| 17 | Rent reporting to credit bureau | CreditLadder [S31]; Boom [S58]; Experian 2025 score change [S33] | Long-term tenant benefit | No Italian bureau rent-data scheme found | L | Bureau contracts | Low | **AVOID (for now)** | No infrastructure in Italy. |
| 18 | "Open to rent" visibility (landlord-only audience) | LinkedIn Open to Work [S135] | Reverse discovery without public exposure | Stalking/discrimination risk | M | Visibility controls; anti-discrimination | High | **MUST** (the reverse-marketplace core) | Mirrors LinkedIn's recruiter-only mode. |
| 19 | Landlord → tenant invitations (limited, trackable) | Upwork [S141]; Toptal [S143] | Signal quality; tenant control | Spam if unlimited | S | – | High | **MUST** | Pair with #18; cap invites. |
| 20 | Mutual-fit ranking + "why this match" | Hinge Most Compatible [S144] | Reduces noise both sides | Opaque ranking → bias | M | Explainability, Art. 22 | High | **EXPERIMENT** | Start with rules (budget, date, pets); ML later. |
| 21 | Opening prompts / structured first message | Bumble Opening Moves [S146] | Reduces ghosting | Templated feel | S | – | Medium | **EXPERIMENT** | Cheap A/B. |
| 22 | Verification badges with published criteria | Airbnb [S149][S151] | Instant trust reading | Badge inflation | S | Criteria must be non-discriminatory | High | **MUST** | Low cost, high clarity. |
| 23 | Tenant reviews / reputation (Guest-Favorite style) | Airbnb [S150]; Idealista BDMI delinquency DB [S99] | Landlord comfort | Blacklisting, defamation, GDPR | L | High risk (negative registries) | Medium | **AVOID** | Delinquency databases are legally fraught; use verified data instead. |
| 24 | Profile completion meter | (LinkedIn — NOT VERIFIED) | Drives completion | Gamification fatigue | S | – | Medium | **SHOULD** | Low cost; validate in tests. |
| 25 | Human validation of dossier (operator review) | DossierFacile (CLAIM) [S74]; Zappyrent team [S113]; Toptal human matchers [S143] | Accuracy; trust | Ops cost; delay | M (ops) | Staff access to docs | Medium | **EXPERIMENT** | Use for edge cases only; automate the rest. |
| 26 | Tenant-pays certificate (€29–39) | CRIF Affittabile [S105]; SCHUFA [S89]; Zillow $35 [S40] | Revenue; commitment signal | UK-style fee bans; adoption friction | S | – | Negative (friction) | **EXPERIMENT** | Test willingness-to-pay in Italy; keep core free. |
| 27 | Landlord-pays per screening | Goodlord/RentProfile £13 [S22]; SmartMove $25–49 [S47] | Aligns with UK/agent norms | Italian small landlords price-sensitive | S | – | Medium | **POST-MVP** | After demand side is proven. |
| 28 | Household / co-applicant linking | DossierFacile (couple/colocation — CLAIM); Pararius joint income [S94] | Flatshares, couples | Consent per person | M | Multi-subject consent | Medium | **SHOULD** | Common in Italian student/expat market. |

---

## 8. Sources

All accessed 2026-10-02. Publication date given when visible in the result/URL; otherwise "n.d.". Each source was consulted via search-result summary (see §1.2). Label after each entry indicates the nature of what was taken from it.

### 8.1 Product, pricing and legal sources (verified via search summaries)

**United Kingdom**
- [S1] Canopy — "How technology is helping to qualify potential tenants faster", canopy.rent, n.d. https://www.canopy.rent/resource/how-technology-is-helping-to-qualify-potential-tenants-faster — CLAIM/FACT
- [S2] Canopy — "Features & Benefits 2.0", info.canopy.rent, n.d. https://info.canopy.rent/features-benefits-2-0 — CLAIM
- [S3] OnTheMarket — "OnTheMarket integrates lead-qualifying Canopy passport to help movers get rent ready" (PDF), expert.onthemarket.com, n.d. https://expert.onthemarket.com/wp-content/uploads/OnTheMarket-integrates-lead-qualifying-Canopy-passport-to-help-movers-get-rent-ready.pdf — FACT
- [S4] Apple App Store — "Canopy Renter", n.d. https://apps.apple.com/gb/app/canopy-renter/id1462403350 — (listing only; ratings NOT READ)
- [S5] Silicon Canals — "Canopy: New app lets you replace rental deposits with rent passports", n.d. https://siliconcanals.com/canopy-new-app-lets-you-replace-rental-deposits-with-rent-passports/ — FACT
- [S6] Property Industry Eye — "Rightmove unveils 'Rent Ready Passport' to help pre-qualify tenants for agents", 2018. https://propertyindustryeye.com/rightmove-unveils-rent-ready-passport-to-help-pre-qualify-tenants-for-agents/ — FACT
- [S7] The Negotiator — "Rightmove given green light to buy tenant referencing firm", 2019. https://thenegotiator.co.uk/news/rightmove-van-mildert/ — FACT
- [S8] Rightmove plc — Preliminary results announcement (RNS PDF), 25 Feb 2021. https://www.rns-pdf.londonstockexchange.com/rns/4184Q_1-2021-2-25.pdf — FACT
- [S9] Wikipedia — "Rightmove", n.d. https://en.wikipedia.org/wiki/Rightmove — FACT
- [S10] LandlordZone — "Major portal launches national 'rent passport' initiative for tenants and agents", n.d. https://www.landlordzone.co.uk/news/major-portal-launches-national-rent-passport-initiative-for-tenants-and-agents — FACT
- [S11] OpenRent Community — "The Rightmove Passport", n.d. https://community.openrent.co.uk/t/the-rightmove-passport/5988 — context
- [S12] Goodlord — "The UK's Best Tenant Referencing Company", n.d. https://www.goodlord.com/letting-agent-solutions/tenant-referencing — CLAIM
- [S13] Goodlord blog — "Letting agents' guide to Open Banking", n.d. https://blog.goodlord.co/your-guide-to-open-banking — CLAIM
- [S14] IBS Intelligence — "Goodlord partners with Tink to streamline Tenant Referencing", n.d. https://ibsintelligence.com/ibsi-news/goodlord-partners-with-tink-to-streamline-tenant-referencing/ — FACT
- [S15] Legal IT Insider — "Thirdfort acquires Homeppl to bolster rental fraud detection", 10 Feb 2025. https://legaltechnology.com/2025/02/10/thirdfort-acquires-homeppl-to-bolster-rental-fraud-detection/ — FACT
- [S16] Homeppl — "Advanced Tenant Referencing for Letting Agencies", n.d. https://www.homeppl.com/business/tenant-referencing/ — CLAIM
- [S17] Konfir — "Homeppl, a Thirdfort business, partners with Konfir…", Nov 2025. https://www.konfir.com/resources/blogs/homeppl-a-thirdfort-business-partners-with-konfir-to-strengthen-tenant-referencing-with-instant-employment-and-income-verification — FACT
- [S18] The Negotiator — "Referencing firm launches initiatives as tenancy fraud attempts 'double'", n.d. https://thenegotiator.co.uk/news/referencing-firm-launches-initiatives-as-tenancy-fraud-attempts-double/ — CLAIM
- [S19] August — "Best tenant referencing services UK landlords 2026", 2026. https://www.augustapp.com/blog/best-tenant-referencing-services — FACT (Vouch→Goodlord)
- [S20] LinkedIn Products — "Vouch Tenant Referencing", n.d. https://www.linkedin.com/products/vouch.co.uk-tenant-referencing/ — CLAIM
- [S21] Rentfig — "RentFig vs Vouch for tenant referencing", n.d. https://www.rentfig.co.uk/compare/rentfig-vs-vouch — CLAIM
- [S22] RentProfile — "Referencing" (pricing), n.d. https://www.rentprofile.co/referencing — FACT (prices)
- [S23] OpenRent — "Tenant Referencing & Credit Checks", n.d. https://www.openrent.co.uk/tenant-referencing — FACT
- [S24] OpenRent Help — "What is included in referencing?", n.d. https://help.openrent.co.uk/hc/en-gb/articles/115000417831-What-is-included-in-referencing — FACT
- [S25] Property Industry Eye — "Tenants' passport firm acquired 'for millions' by giant referencing firm", n.d. https://propertyindustryeye.com/tenants-passport-firm-acquired-for-millions-by-giant-referencing-firm/ — FACT
- [S26] The Negotiator — "Homelet - Why referencing still needs the human touch" (Barbon/Movem), n.d. https://thenegotiator.co.uk/news/barbon-movem/ — FACT
- [S27] The Lettings Hub — "Property Passport – Pre-vet tenants for free", n.d. https://lettingshub.co.uk/letting-agents/property-passport/index.php — CLAIM
- [S28] Property Industry Eye — "New tenants' passports to be trialled with 25 letting agents", 2019. https://propertyindustryeye.com/new-tenants-passports-to-be-trialled-with-25-letting-agents/ — FACT
- [S29] Letting Agent Today — "Portal launches 'passport' service for renters on the move", May 2023. https://www.lettingagenttoday.co.uk/breaking-news/2023/05/portal-launches-passport-service-for-renters-on-the-move/ — FACT
- [S30] TechCrunch — "Ideal Flatmate wants to be a matchmaking platform for UK flatshares", 8 Feb 2017. https://techcrunch.com/2017/02/08/ideal-flatmate-wants-to-be-a-matchmaking-platform-for-uk-flatshares/ — FACT
- [S31] CreditLadder — "Experian rent payment credit reports", n.d. https://creditladder.co.uk/blog/experian-rent-payment-credit-reports — CLAIM
- [S32] Experian UK — "Can paying rent build your credit score?", n.d. https://www.experian.co.uk/consumer/guides/can-paying-rent-build-credit-score.html — FACT
- [S33] GB News — "Experian to include rent in credit scores as system expands to 1,250 scale", Nov 2025. https://www.gbnews.com/money/experian-credit-score-rent-update — FACT
- [S34] August — "CreditLadder Review: Does Paying Rent Build Credit?", n.d. https://www.augustapp.com/blog/creditladder-review-does-paying-rent-build-credit — FACT/CLAIM
- [S35] UK Government — "Tenant Fees Act 2019: Guidance for landlords and agents" (PDF), 2019. https://assets.publishing.service.gov.uk/media/5f745d308fa8f5189a93d141/Tenant_Fees_Act_2019_-_Guidance_for_landlords_and_agents.pdf — FACT
- [S36] NRLA — "Tenant Fee Ban Guide for Landlords", n.d. https://www.nrla.org.uk/resources/pre-tenancy/tenant-fee-ban-toolkit — FACT
- [S37] mydeposits — "Tenant Fees Act: A complete guide to banned and permitted fees", n.d. https://www.mydeposits.co.uk/content-hub/what-you-need-to-know-about-the-tenant-fees-act-2019/ — FACT
- [S38] Wikipedia — "Renters' Rights Act 2025", n.d. https://en.wikipedia.org/wiki/Renters%27_Rights_Act_2025 — context

**United States**
- [S39] Zillow — "Apply for Rentals Online", n.d. https://www.zillow.com/rent/apply-for-rentals/ — FACT
- [S40] Zillow Help — "How much does the application service cost?", n.d. https://zillow.zendesk.com/hc/en-us/articles/360000613847-How-much-does-the-application-service-cost — FACT
- [S41] Zillow Help — "Is the application a subscription or recurring fee?", n.d. https://zillow.zendesk.com/hc/en-us/articles/1500003374322-Is-the-application-a-subscription-or-recurring-fee — FACT
- [S42] Apartments.com Renter Help — "How to apply to rentals through Apartments.com", n.d. https://renterhelp.apartments.com/article/136-how-to-apply-to-rentals-on-apartments-com — FACT
- [S43] Apartments.com Property Help — "How much do the applications and reports cost?", n.d. https://propertyhelp.apartments.com/article/13-applicant-cost — FACT
- [S44] RentSpree Support — "How much does it cost to use RentSpree?", n.d. https://support.rentspree.com/en/cost-to-use-rentspree — FACT
- [S45] RentSpree — "Free Tenant Screening Reports & Background Checks", n.d. https://www.rentspree.com/tenant-screening — CLAIM
- [S46] RentSpree — "California rental application fees: 2026 rules and limits", 2026. https://www.rentspree.com/blog/guide-to-california-rental-application-fees — FACT
- [S47] iPropertyManagement — "TransUnion SmartMove Tenant Screening Review (2026)", 2026. https://ipropertymanagement.com/reviews/transunion-smartmove-tenant-screening — FACT (prices)
- [S48] iPropertyManagement — "Avail Tenant Screening Review [2026]", 2026. https://ipropertymanagement.com/reviews/avail-tenant-screening — FACT
- [S49] TurboTenant — "Tenant Screening Services & Tenant Background Checks", n.d. https://www.turbotenant.com/tenant-screening/ — FACT
- [S50] TurboTenant — "Portable Tenant Screening Report: 2025 Guide for Landlords", 2025. https://www.turbotenant.com/rental-screening/portable-tenant-screening-report/ — FACT
- [S51] Upturn — "Tenants Pay the Price", n.d. https://www.upturn.org/work/tenants-pay-the-price/ — context (title only)
- [S52] Snappt — "Top US Cities for Application Fraud: 2026", 2026. https://snappt.com/blog/fraudulent-cities/ — FACT (vendor research)
- [S53] Multifamily Executive — "Snappt Report: 6.4% of Rental Applications Were Fraudulent in 2024", 2025. https://www.multifamilyexecutive.com/technology/snappt-report-6-4-of-rental-applications-were-fraudulent-in-2024_o — FACT
- [S54] BusinessWire — "Snappt and TenantCloud Partner…", 10 Sep 2025. https://www.businesswire.com/news/home/20250910558211/en/Snappt-and-TenantCloud-Partner-to-Deliver-Enterprise-Grade-Fraud-Prevention-to-Independent-Landlords-Nationwide — FACT
- [S55] CLEAR — "How Snappt & CLEAR1 Combat Rental Fraud" (case study), n.d. https://identity.clearme.com/post/case-study-snappt — CLAIM
- [S56] Findigs — "Snappt vs VERO… [2026]", 2026. https://www.findigs.com/compare/snappt-vs-vero — CLAIM (competitor)
- [S57] Proofscore — "Why Snappt Doesn't Work for Small Landlords 2026", 2026. https://proofscore.virtutools.com/blog/snappt-small-landlords.html — CLAIM (competitor)
- [S58] Boom — "Rent Reporting to Build Credit (BoomReport)", n.d. https://www.boompay.app/boomreport — CLAIM
- [S59] FinMasters — "Boom Review: Cheapest Way to Pay (and Report) Rent", n.d. https://finmasters.com/boom-review/ — FACT (prices)
- [S60] Payscore — "The Closing Docs Becomes Payscore", n.d. https://www.payscore.com/post/the-closing-docs-becomes-payscore — FACT
- [S61] GetApp — "Payscore 2026 Pricing, Features, Reviews", 2026. https://www.getapp.com/real-estate-property-software/a/the-closing-docs-1/ — FACT (≈$10/report)
- [S62] Plaid — "Tenant screening & rent payments for property management", n.d. https://plaid.com/industries/property-management/ — CLAIM
- [S63] Vendr — "Plaid Software Pricing & Plans 2026", 2026. https://www.vendr.com/marketplace/plaid — estimate
- [S64] RentRedi Help — "Tenant Income & Assets Verification Reports", n.d. https://help.rentredi.com/en/articles/8863080-tenant-income-assets-verification-reports — FACT
- [S65] Argyle — "Tenant Screening & Income Verification Solutions", n.d. https://www.argyle.com/industries/tenant-screening — CLAIM
- [S66] Truv Docs — "Income & Employment for Screening", n.d. https://docs.truv.com/screening/products/income-employment — CLAIM
- [S67] Truv — "Truv vs Argyle", n.d. https://truv.com/vs/argyle — CLAIM
- [S68] Clara — "Online Rental Application Form for Tenants / Rental Passport", n.d. https://www.rentwithclara.com/portable-rental-application — CLAIM
- [S69] Wikipedia — "Rent.com.au" (Renter Resume), n.d. https://en.wikipedia.org/wiki/Rent.com.au — FACT
- [S70] CB Insights — "Nestment", n.d. https://www.cbinsights.com/company/nestment — FACT
- [S71] RentPrep — "Rental Application Fees: Rules & Procedures In All 50 States", n.d. https://rentprep.com/blog/tenant-screening-news/the-landlord-guide-to-charging-rental-application-fees/ — context

**France**
- [S72] DossierFacile — Partner site "Qu'est-ce que DossierFacile ?", n.d. https://partenaire.dossierfacile.logement.gouv.fr/ — FACT
- [S73] beta.gouv.fr — "DossierFacile", n.d. https://beta.gouv.fr/startups/dossierfacile.html — FACT
- [S74] Ma Sécurité (Ministère de l'Intérieur) — "Éviter les faux dossiers de location grâce à DossierFacile", n.d. https://www.masecurite.interieur.gouv.fr/fr/fiches-pratiques/habitation/eviter-faux-dossiers-location-grace-dossierfacile — FACT
- [S75] Ministère de la Transition écologique — "PAP lance un nouveau service en partenariat avec DossierFacile…", n.d. https://www.ecologie.gouv.fr/presse/pap-lance-nouveau-service-partenariat-dossierfacile-dossier-location-numerique-letat — FACT
- [S76] DossierFacile — "DossierFacile Connect" (technical documentation), n.d. https://partenaire.dossierfacile.logement.gouv.fr/documentation-technique/dossierfacile-connect — FACT
- [S77] DossierFacile — "API Partenaire" (decommissioned 31 Mar 2025), n.d. https://partenaire.dossierfacile.logement.gouv.fr/documentation-technique/api — FACT
- [S78] Leboncoin Assistance — "Comment envoyer mon dossier locataire à un propriétaire ?", n.d. https://assistance.leboncoin.info/hc/fr/articles/4415017554578-Comment-envoyer-mon-dossier-locataire-%C3%A0-un-propri%C3%A9taire — FACT
- [S79] aide-sociale.fr — "Dossier Facile : créer son dossier de location en ligne", n.d. https://www.aide-sociale.fr/site-dossierfacile-location/ — FACT (figures)
- [S80] jedeclaremonmeuble.com — "DossierFacile : Guide complet…", n.d. https://www.jedeclaremonmeuble.com/dossierfacile/ — FACT (figures)
- [S81] Légifrance — "Décret n° 2015-1437 du 5 novembre 2015 fixant la liste des pièces justificatives…", 5 Nov 2015. https://www.legifrance.gouv.fr/loda/id/JORFTEXT000031444493 — FACT
- [S82] ANIL — "Candidat locataire et sa caution : liste des pièces justificatives exigibles", 2015. https://www.anil.org/documentation-experte/analyses-juridiques-jurisprudence/analyses-juridiques/analyses-juridiques-2015/candidat-locataire-et-sa-caution-liste-des-pieces-justificatives-exigibles/ — FACT
- [S83] Action Logement — "Garantie Visale", n.d. https://www.actionlogement.fr/la-garantie-visale — FACT
- [S84] Luko — "Organismes garant en location : lequel choisir ?", n.d. https://www.fr.luko.eu/assurance-habitation/locataire/organismes-garant-location/ — FACT (prices)
- [S85] Qoridor — "Organisme garant location : le comparatif 2026", 2026. https://blog.qoridor.fr/article/organisme-garant-location — FACT (prices)
- [S86] Cautioneo — "Garantie Locataire : cautioneo ou garantme ?", n.d. https://www.cautioneo.com/blog/cautioneo-ou-garantme/ — CLAIM (prices)
- [S87] Cleerly — "Notre avis sur Unkle", n.d. https://cleerly.fr/immobilier/garant/unkle — FACT (Unkle exit)
- [S88] Actual-Immo — "Garantie Visale : Action Logement relève ses plafonds à 1 940 €", n.d. https://www.actual-immo.fr/garantie-visale-locataire/ — FACT

**Germany / Netherlands**
- [S89] ImmoScout24 — "SCHUFA-BonitätsCheck", n.d. https://bonitaetscheck.immobilienscout24.de/ — FACT
- [S90] Wohnticker — "ImmoScout MieterPlus: Kosten, Nutzen & Kündigung (2026)", 2026. https://wohnticker.de/ratgeber/immoscout-mieterplus-kosten — FACT (prices)
- [S91] ImmoScout24 — "Mieterselbstauskunft: Kostenlose Vorlage als PDF", n.d. https://www.immobilienscout24.de/wissen/vermieten/mieter-selbstauskunft.html — FACT
- [S92] Objego — "Mieterselbstauskunft: Erlaubte Fragen & Vorlage", n.d. https://www.objego.de/blog/mieterselbstauskunft-diese-fragen-duerfen-vermieter-stellen/ — FACT
- [S93] IT-Kanzlei Lutz — "Mieterselbstauskunft 2026 – was Vermieter wirklich fragen dürfen", 2026. https://datenschutz-rv.de/mieterselbstauskunft-2026-was-vermieter-wirklich-fragen-duerfen-und-was-nicht/ — FACT
- [S94] Pararius — "Pararius protocol toewijzing huurwoning", n.d. https://www.pararius.nl/info/selectieprocedure-huurder — FACT
- [S95] Het CCV — "Screeningsmogelijkheden verhuur woonruimte", n.d. https://hetccv.nl/themas/georganiseerde-criminaliteit-en-ondermijning/vastgoedcriminaliteit/screeningsmogelijkheden/screeningsmogelijkheden-verhuur-woonruimte/ — FACT

**Spain**
- [S96] Finaer — "Garantía de alquiler para propietarios", n.d. https://finaer.es/es/propietario — CLAIM
- [S97] El Economista (branded content) — "Finaer lanza 'Inquilino 10'", May 2025. https://www.eleconomista.es/branded-content/noticias/13371512/05/25/finaer-lanza-inquilino-10-la-llave-de-acceso-al-alquiler-garantizado.html — CLAIM
- [S98] idealista/news — "Precalificación de inquilinos: todo lo que debes saber", 9 Aug 2025. https://www.idealista.com/news/inmobiliario/vivienda/2025/08/09/854834-precalificacion-de-inquilinos-que-es-como-funciona-y-por-que-hacerla — CLAIM
- [S99] idealista — "Base de datos de morosidad inmobiliaria idealista (BDMI)", n.d. https://www.idealista.com/tools/centrodeayuda/articulos/base-de-datos-de-morosidad-inmobiliaria-idealista-bdmi/ — FACT
- [S100] idealista — "Seguro Garantía de Inquilino", n.d. https://www.idealista.com/seguros/seguro-garantia-inquilino/ — CLAIM
- [S101] Housfy — "Gestión integral de alquiler de viviendas", n.d. https://housfy.com/alquileres — CLAIM
- [S102] Housfy — "La alternativa al seguro de impago de alquiler", n.d. https://housfy.com/alquileres/seguro-impago-alquiler — CLAIM
- [S103] idealista/news — "Así puedes detectar inquilinos fraudulentos", 12 Nov 2025. https://www.idealista.com/news/inmobiliario/vivienda/2025/11/12/870559-como-detectar-documentacion-falsa-de-un-potencial-inquilino — FACT
- [S104] idealista/news — "Morosidad inmobiliaria: scoring, garantías y calendario de reclamación", 15 Mar 2026. https://www.idealista.com/news/inmobiliario/vivienda/2026/03/15/875968-morosidad-inmobiliaria-scoring-garantias-y-calendario-de-reclamacion — CLAIM

**Italy**
- [S105] CRIF / MisterCredit — "Affittabile – Dimostra la tua affidabilità come inquilino", n.d. https://www.mistercredit.it/servizi/affittabile/ — FACT
- [S106] Fidoaffitti — "Verifica della solvibilità dell'inquilino: i cinque livelli", n.d. https://www.fidoaffitti.it/blog/verifica-solvibilita-inquilino — FACT
- [S107] Pro-aiuto — "Visura CRIF per Affitto Residenziale 2026", 2026. https://pro-aiuto.com/blog/visura-crif-per-affitto-residenziale-2026-guida-per-proprietari-e-inquilini — FACT
- [S108] Immobiliare.it News — "Polizze affitto sicuro: ecco come funzionano e i rischi", n.d. https://www.immobiliare.it/news/economia/mutui-prestiti-e-assicurazioni/polizze-affitto-sicuro-ecco-come-funzionano-e-i-rischi-83697/ — FACT
- [S109] idealista/news (IT) — "Affitto garantito, come funziona e perché viene scelto dai proprietari", 22 Sep 2026. https://www.idealista.it/news/immobiliare/residenziale/2026/09/22/451188-affitto-garantito-come-funziona-e-perche-viene-scelto-dai-proprietari — FACT/CLAIM
- [S110] idealista/news (IT) — "Fideiussione bancaria per l'affitto, come funziona?", 9 Jan 2024. https://www.idealista.it/news/immobiliare/residenziale/2024/01/09/177242-fideiussione-bancaria-per-l-affitto-come-funziona — FACT
- [S111] HousingAnywhere — "Fideiussione affitto: cos'è e come funziona", n.d. https://housinganywhere.com/it/Italia/fideiussione-affitto — FACT
- [S112] Zappyrent — "Protezione Zappyrent", n.d. https://www.zappyrent.com/it/protezione-zappyrent — CLAIM
- [S113] Zappyrent — "Come funziona Zappyrent", n.d. https://www.zappyrent.com/it/blog/zappyrent-tutto-quello-che-ce-da-sapere/ — CLAIM
- [S114] Il Giorno — "L'inquilino è moroso? La startup paga l'affitto", n.d. https://www.ilgiorno.it/economia/l-inquilino-%C3%A8-moroso-la-startup-paga-l-affitto-1.5998986 — FACT
- [S115] Rentila — "Chi siamo?", n.d. https://www.rentila.it/about — CLAIM
- [S116] Rentila — "Casa in affitto: come scegliere un buon inquilino?", 24 Sep 2016. https://www.rentila.it/blog/2016/09/24/casa-affitto-scegliere-un-buon-inquilino/ — context
- [S117] Namirial — "SPID • Sistema Pubblico di Identità Digitale", n.d. https://www.namirial.it/spid/ — FACT (prices)
- [S118] Money.it — "Quanto costa fare lo SPID? I prezzi aggiornati dei provider per il 2026", 2026. https://www.money.it/quanto-costa-fare-lo-spid-prezzi-aggiornati-2026 — FACT
- [S119] Facile.it — "Spid, Aruba e Infocert a pagamento", 2025. https://www.facile.it/adsl/news/spid-a-pagamento-con-aruba-e-infocert-tariffe-applicate.html — FACT
- [S120] Agenda Digitale — "Spid a pagamento: che possono fare gli utenti", 2025. https://www.agendadigitale.eu/cittadinanza-digitale/identita-digitale/spid-a-pagamento-da-luglio-che-possono-fare-gli-utenti/ — FACT
- [S121] docs.italia.it — "CIE – Manuale Tecnico per gli erogatori di servizi pubblici e privati", n.d. https://docs.italia.it/italia/cie/cie-manuale-tecnico-docs/it/master/overview.html — FACT
- [S122] Ministero dell'Interno — "Integrate 'Entra con CIE' access", n.d. https://www.cartaidentita.interno.gov.it/en/public-and-business-administration/operating-manual-entra-con-cie/ — FACT
- [S123] Intesys — "Carta Identità Elettronica 3.0: autenticazione e onboarding per tutti", n.d. https://www.intesys.it/journal/information-technology/carta-identita-elettronica-3-0-autenticazione-onboarding-tutti/ — FACT
- [S124] Tink — Italian site, n.d. https://tink.com/it/ — CLAIM
- [S125] Tink — "L'open banking per i prestiti", n.d. https://tink.com/it/casi-uso/prestiti/ — CLAIM
- [S126] CRIF — "Open Banking / Open Finance soluzioni 2024" (PDF), 2024. https://www.crif.it/media/isontvef/open-banking-open-finance-soluzioni-2024.pdf — FACT
- [S127] Open Banking Tracker — "Open Banking Providers & API Directory (2026)", 2026. https://www.openbankingtracker.com/open-banking-providers — context
- [S128] CAF Uno — "Garanzie nell'affitto – redditi, garanti e privacy", n.d. https://www.successionifirenzealcaf.it/affitto-quando-il-proprietario-chiede-garanzie/ — FACT
- [S129] Propit forum — "Policy privacy per raccolta dati sensibili dell'inquilino durante selezione affittuario", n.d. https://www.propit.it/threads/policy-privacy-per-raccolta-dati-sensibili-dell-inquilino-durante-selezione-affittuario.50806/ — context

**Identity-verification vendors**
- [S130] Tech Insider — "Sumsub vs Onfido vs Jumio vs Veriff: $0.80 vs $5 [2026]", 2026. https://tech-insider.org/igt-sumsub-vs-onfido-vs-jumio-vs-veriff-for-igaming-kyc-202-en-d181/ — FACT (list prices)
- [S131] Zyphe — "Identity Verification Software 2026: 7 Platforms Compared", 2026. https://www.zyphe.com/resources/blog/identity-verification-software-comparison-2026 — CLAIM
- [S132] TrustSwiftly — "Identity Verification Pricing Comparison (2026 Update)", 2026. https://trustswiftly.com/blog/identity-verification-pricing-comparison-and-alternatives/ — CLAIM
- [S133] Stripe — "Stripe Identity", n.d. https://www.stripe.com/identity — FACT
- [S134] Start with Identity — "Stripe Identity Review 2026: Pricing, Limits & Alternatives", 2026. https://startwithidentity.com/vendors/identity-verification/stripe-identity/ — FACT

### 8.2 Cross-industry UX sources (Part B)
- [S135] LinkedIn Help — "Let recruiters know you're Open to Work", n.d. https://www.linkedin.com/help/linkedin/answer/a507508/let-recruiters-know-you-re-open-to-work — FACT
- [S136] Forbes (R. Hellmann) — "Job Seekers: Be Careful Using LinkedIn's New 'Open To Work' Feature", 20 Jul 2020. https://www.forbes.com/sites/roberthellmann/2020/07/20/job-seekers-be-careful-using-linkedins-new-open-to-work-feature/ — FACT
- [S137] Wikipedia — "Hired (company)", n.d. https://en.wikipedia.org/wiki/Hired_(company) — FACT
- [S138] The Information — "Job Site Hired, Once Valued at $500 Million, Discusses Winding Down", Nov 2020. https://www.theinformation.com/articles/job-site-hired-once-valued-at-500-million-discusses-winding-down — FACT
- [S139] Cavuno — "What Is a Reverse Job Board? …Who Tried It, and What Operators Should Learn", n.d. https://cavuno.com/blog/what-is-a-reverse-job-board — CLAIM/analysis
- [S140] Welcome to the Jungle (press) — "UK recruitment platform Otta acquired by Welcome to the Jungle", Jan 2024. https://press.welcometothejungle.com/en/news/uk-recruitment-platform-otta-acquired-by-welcome-to-the-jungle — FACT
- [S141] Upwork Support — "How to invite freelancers to your job", n.d. https://support.upwork.com/hc/en-us/articles/211063518-How-to-invite-freelancers-to-your-job — FACT
- [S142] Upwork Resources — "How To Reply to an Upwork Job Invitation", n.d. https://www.upwork.com/resources/job-invitation-reply — FACT
- [S143] Flexiple — "Toptal Reviews in 2025", 2025. https://flexiple.com/reviews/toptal — CLAIM
- [S144] TechCrunch — "Hinge employs new algorithm to find your 'most compatible' match", 2018. https://techcrunch.com/?p=1668547 — FACT
- [S145] The Hustle — "Dating app Hinge recruited a Nobel prize winning algorithm…", n.d. https://thehustle.co/hinge-machine-learning-algorithm — FACT
- [S146] CNN — "Dating app Bumble will no longer require women to make the first move", 30 Apr 2024. https://www.cnn.com/2024/04/30/tech/bumble-relaunch-men-make-first-move — FACT
- [S147] BusinessWire — "Bumble Gives Women More Choice to Make the First Move", 30 Apr 2024. https://www.businesswire.com/news/home/20240430323928/en/Bumble-Gives-Women-More-Choice-to-Make-the-First-Move — FACT
- [S148] TechCrunch — "Bumble's Opening Move feature takes the pressure off women…", 30 Apr 2024. https://techcrunch.com/2024/04/30/bumbles-opening-move-feature-takes-the-pressure-off-women-to-come-up-with-a-new-message-every-time — FACT
- [S149] Airbnb Newsroom — "Airbnb 2024 Spring Update", 2024. https://news.airbnb.com/airbnb-2024-spring-update — FACT
- [S150] Hostaway — "How to Earn Airbnb Guest Favorite Status", n.d. https://www.hostaway.com/blog/how-to-earn-airbnb-guest-favorite-status/ — FACT (criteria)
- [S151] Airbnb Community — "'Identity Verified' vs 'Government ID' verified", n.d. https://community.withairbnb.com/t5/Help-with-your-business/quot-Identity-Verified-quot-vs-quot-Government-ID-quot-verified/m-p/1606017 — context
- [S152] TechCrunch — "Airbnb has another label to tell you about a property's quality", 4 Mar 2024. https://techcrunch.com/2024/03/04/airbnb-has-another-label-to-tell-you-about-a-propertys-quality/amp — FACT

### 8.3 Unverified references (fetch blocked / search budget exhausted — NOT used as evidence)

These are well-known works the brief asked for; they could not be fetched or searched in this session, so no claim above relies on them. Listed only so a follow-up pass can verify them:
- Lenny Rachitsky, "How to kickstart and scale a marketplace business" (lennysnewsletter.com) — NOT VERIFIED.
- Chris Dixon / a16z, "Come for the tool, stay for the network" (cdixon.org, 2015) — NOT VERIFIED.
- Andrew Chen, *The Cold Start Problem* (andrewchen.com) — NOT VERIFIED.
- Nielsen Norman Group, "Progressive Disclosure" and "Empty-State" articles — NOT VERIFIED.
- Revolut / N26 / Monzo onboarding case studies; LinkedIn profile-completeness research — NOT SEARCHED.
- FTC, "Using Consumer Reports: What Landlords Need to Know" (FCRA) — NOT SEARCHED.
- Colorado HB23-1099 (portable tenant screening report statute) — NOT SEARCHED (state list taken from [S50]).
- Garante Privacy (Italy) guidance on tenant selection; SPID relying-party/aggregator pricing; Konfir pricing; Immobiliare.it tenant-verification product; Italian reusable-dossier start-ups; Belgium/Portugal rules; app-store and Trustpilot complaint data for Canopy, Goodlord, Zillow, DossierFacile — NOT SEARCHED / NOT FOUND.

---

*End of 04-feature-benchmark.md*

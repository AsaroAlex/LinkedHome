# 02 — Reverse Rental Marketplace Competitor Matrix

**Research / access date:** 2026-10-02
**Scope:** Direct "reverse rental marketplace" competitors (tenants publish profiles; landlords discover / invite them), plus adjacent products that must be classified so the team does not confuse them with true reverse marketplaces.
**Author:** PropTech market analyst (LinkedHome project), fresh web research only — no training-knowledge claims are presented as fact.

---

## 0. Methodology and confidence notes

### How the research was done

1. **Search engine queries** (English, Italian, German, French, Dutch, Spanish, Norwegian) via the WebSearch tool. Roughly 60 queries were run before the session's shared search budget (200 calls) was exhausted.
2. **Direct page fetches were attempted** for every primary site (homeflow.it, renter30.com, inquilinofacile.it, preferredtenants.au, App Store, Google Play, Crunchbase, Wikipedia, Il Sole 24 Ore, Giornale di Brescia, uspto.report, TechCrunch, web.archive.org). **Every one was blocked by the sandbox's network egress policy** (only github.com was reachable). Therefore every quotation in this document comes from **search-engine result excerpts of the cited page**, not from a full read of the page. Excerpts are literal page text in most cases, but I could not read pricing tables, FAQ pages or app-store listings end to end.
3. Consequences:
   - **App-store ratings and review counts could not be retrieved for any product** (apps.apple.com and play.google.com are blocked). Where a third-party review aggregate surfaced in search excerpts (Capterra, Trustpilot) it is reported with its source.
   - **Publication dates** are given only when the URL or excerpt carried one; otherwise "n.d. (not retrieved)".
   - Several candidate names on the brief could not be researched at all before the search budget ran out. They are listed in §2.30 as **NOT RESEARCHED** (distinct from NOT FOUND, which means queries were run and returned nothing relevant).

### Labelling convention used throughout

- **FACT** — stated on a cited page (company site, registry, press). Company-site facts about *how the product works* and *pricing* are treated as FACT; company-site *numbers* (users, properties) are marked **self-reported**.
- **CLAIM** — company marketing self-description that cannot be independently verified (e.g. "AI compatibility score", "no. 1 app").
- **HYPOTHESIS** — my inference.
- **NOT FOUND (searched: …)** — queries run, nothing relevant returned.
- **NOT RESEARCHED** — not searched (budget exhausted).

### Overall confidence

| Area | Confidence | Why |
|---|---|---|
| Homeflow existence, founders, launch, model | High | Regional newspaper + company site excerpts agree [S1][S2] |
| Homeflow pricing / users / app / funding | Low | Not found in any excerpt |
| MyTenant (Italy) | High that *no public trace exists* | 5 distinct queries, only name collisions |
| Renter30 | High (model, legal entity, launch date) | Company site + USPTO filing [S9][S10] |
| Want2Rent (Australia) | High that *no public trace exists* | 5 distinct queries, only name collisions |
| LocService (France) | High | Pricing page + 7 independent review sites [S13]–[S20] |
| Other discovered products | Medium | Mostly one or two sources each |
| App-store data | None | Blocked |

---

## 1. Summary comparison table

Legend for "Model": **RM** = true reverse marketplace (tenant profile is the primary object; landlord browses/invites). **RM-section** = a reverse "wanted ads" section inside a conventional portal. **Screen** = tenant-screening / referencing tool. **Profile-attach** = reusable tenant profile attached to applications to *landlord-posted* listings (not reverse). **Managed** = managed/guaranteed rental operator. **Portal** = classic listing portal. **Roommate** = flat-share matching.

| # | Product | Country | Model | Status (2026-10-02) | Launch | Who pays, how much | Verification | Matching logic | Traction evidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Homeflow** (homeflow.it) | IT (Milan, Brescia, Bergamo) | **RM** (+ sales side) | Active (site + blog indexed) [S1][S3][S4][S5] | Sept 2025 [S2] | NOT FOUND | Self-declared by tenant (job, references) [S2] | CLAIM: AI "punteggio di compatibilità" [S2] | None public |
| 2 | **MyTenant** | IT? | — | **NOT FOUND** (only a Nigerian app and a generic landlord tool share the name) [S7][S8] | — | — | — | — | — |
| 3 | **Renter30** (renter30.com) | US (LLC in Northfield, MA) | **RM** | Active, just launched [S9][S10] | First use 2026-02-13 [S10] | 100 % free both sides [S9] | None described | Zip-code search, no score [S9] | None public |
| 4 | **Want2Rent** | AU? | — | **NOT FOUND** (only a Florida rent-to-own site shares the name) [S12] | — | — | — | — | — |
| 5 | **LocService** (locservice.fr) | FR | **RM** (since 1997) | Active [S13][S14] | 1997 [S15][S18] | Tenant one-off €34 / €29 student; landlord free [S13][S14] | Tenant declares guarantees/budget [S14] | Rule-based: rent, property type, area [S14] | 250k landlords, 6,000 matches/day (self-reported) [S15][S17]; Trustpilot 3.9/5, 22k+ reviews [S17][S19] |
| 6 | **Kamernet** (kamernet.nl) | NL | Portal **+ RM feature** (landlord browses seeker profiles) | Active [S22] | n.d. | Landlord Premium €34/month; seekers also behind a paywall [S22][S24] | n.d. | Filters in "Kamernet Data" dashboard [S22] | Trustpilot page exists (rating not retrieved) [S25] |
| 7 | **Preferred Tenants** (preferredtenants.au) | AU | **RM** ("premium directory of low-risk renters") | Active [S26][S27] | n.d. | Tenant pays to activate profile (amount NOT FOUND); landlord free [S26][S27] | Exclusion rules (late rent, breach, eviction, income source) [S26] | Landlord enters property → sees only "suitable" profiles [S26] | None public |
| 8 | **FindaFlat.co.uk** | UK | **RM-section** ("flat wanted" adverts) | Active (page indexed) [S28] | n.d. | NOT FOUND | n.d. | Landlord searches wanted ads [S28] | None public |
| 9 | **Finn.no "Bolig ønskes leid"** | NO | **RM-section** inside national portal | Active [S21] | n.d. | NOT FOUND | n.d. | Browse by location | 107 wanted ads in Gamle Oslo, 38 in Stavanger at access [S21] |
| 10 | **InquilinoGiusto.it** | IT | **RM** ("database di inquilini certificati") | Active (page indexed) [S30][S31] | n.d. | Free, no commissions [S30] | Pay slips, family composition [S30] | Automatic evaluation on income, family, pets, etc. [S30] | "oltre 50.000 persone validate" (self-reported) [S30] |
| 11 | **InquilinoFacile.it** | IT | **RM / matching** ("profilo inquilino verificato") | Active (page indexed) [S32] | n.d. | Free for tenants and private landlords [S32] | "documenti verificati" [S32] | CLAIM: "scoring trasparente" [S32] | None public |
| 12 | **Affitto Certificato** | IT | **Screen** + free listings + tenant references | Active (page indexed) [S33]–[S37] | n.d. | Landlord €59 IVA incl. (PayPal or via agency); tenant free [S36] | Registry data (Camere di Commercio, Conservatorie) + landlord feedback [S33] | Reliability rating | Equity-crowdfunding campaign [S37] |
| 13 | **doMate** | ES (Valencia, Alcoy) | **Roommate** matching + landlord channel | Launched July 2026 [S45][S46] | 2026-07 | Tenants free; landlords 2 free listings then volume fee [S45][S47] | Mutual ratings [S45] | Compatibility on schedules/habits [S45] | University-backed, 2 cities |
| 14 | **Flow** (flow.rent) | ZA | **RM → pivoted** to B2B ad-tech for agents | Pivoted (2021), funded 2023 [S50][S51] | 2019 [S52][S53] | Was free for tenants (rewards) [S53] | n.d. | "Matching great tenants with top-rated landlords" (2020) [S49] | $1.5M (2019), $4.5M (2023); 300 clients / 6,000 agents post-pivot [S51][S52] |
| 15 | **Rentberry** | US / global | **Portal with bidding** (not reverse) | Active; crowdfunding on Republic 2026 [S55] | n.d. | n.d. | Screening offered [S54] | Custom offers / auction [S54] | Capterra 4.8/5 (61 reviews) [S54]; "5M users, 20M properties" (self-reported) [S55] |
| 16 | **Zappyrent** | IT | **Managed** (guaranteed rent) | Active [S39][S40] | n.d. | Landlord: 1 month's rent + 8 % of following months; €139 canone-concordato fee [S39][S40] | AI tenant risk rating [S41] | Risk score, not matching | Press 2021 [S42] |
| 17 | **ImmoScout24** | DE | **Portal** + tenant premium + "Gesuche" (partially verified) | Active | — | Tenants €12.99–39.99/month (Suchen+/MieterPlus); landlords €0 basic or €129.99–629.99 [S63][S64] | Credit info in MieterPlus [S63] | "Chance check", prioritised contact [S63][S67] | Market leader (not quantified here) |
| 18 | **RentProfile** | UK | **Screen** + landlord directory | Active [S58] | 2016 [S60] | £19/tenant referencing; landlord profile free; £50/yr premium [S58] | Referencing, Right to Rent | — | — |
| 19 | **Tenant Options** | AU | **Profile-attach** (agents only) | Active [S61] | n.d. | Free for tenants; not open to private landlords [S61] | Automated referee checks [S61] | — | — |
| 20 | **Zillow / Avail / Trulia / TenantCloud "Renter Profile"** | US | **Profile-attach** | Active [S73]–[S76] | — | Free to renters | Varies | — | — |
| 21 | **Huurwoningen.nl / TenePass / Verhuurtbeter / mijnhuurprofiel.be / Rentio** | NL/BE | **Profile-attach** | Active [S68]–[S72] | — | — | Income, guarantor fields [S68] | — | — |
| 22 | **Badi** | ES/IT | **Roommate** marketplace | Status 2026 NOT RESEARCHED | ~2021 in Italy [S79] | n.d. | — | AI "smart recommendation" on social data [S79] | — |

---

## 2. Detailed profiles

### 2.1 Homeflow (homeflow.it) — Italy

| Field | Finding |
|---|---|
| **Current status** | **Active** (FACT): homepage "HomeFlow — Il mercato immobiliare reinventato" is indexed [S1]; the blog publishes practical rental guides (e.g. "Come trovare casa in affitto senza agenzia", "Tapparelle rotte affitto: chi paga", "Danni all'immobile: quando trattenerli dalla caparra") [S3][S4][S5]. No evidence of shutdown. Direct fetch of homeflow.it was blocked, so I could not confirm that sign-up is live today. |
| **Launch date** | FACT: "La piattaforma ha debuttato a settembre in contemporanea a Milano, Brescia e Bergamo" — i.e. September 2025 [S2]. Company founded "nell'estate del 2025" at the Polo Innovativo di Brescia (MIMIT-certified incubator) [S2]. |
| **Legal / ownership** | FACT: "Srl innovativa" with Marco Copeta (amministratore, 34 %), Fabrizio Tudisco (33 %), Polo Innovativo (33 %) [S2]. Stefano Patelli also named among the leadership [S2]. |
| **Geographic coverage** | FACT: Milan, Brescia, Bergamo [S2]. |
| **Tenant flow** | FACT (from company and press text): tenants create a profile and "a loro discrezione potranno dichiarare situazione lavorativa, referenze, preferenze e altre informazioni utili"; the platform surfaces "profilo, budget, zona e tempistiche di chi cerca" before any message [S1][S2]. |
| **Landlord flow** | FACT: "è il proprietario a vedere un feed di profili qualificati di potenziali inquilini" [S2]; landlords publish "condizioni, regole e disponibilità" so "il primo contatto è già informato"; "chi offre decide con più elementi: meno candidature generiche, più segnali utili per scegliere" [S1]. |
| **Sales side** | FACT: "oltre alla locazione c'è anche la compravendita, dove viene applicata la stessa logica del marketplace invertito" [S2]. |
| **Pricing / monetisation** | **NOT FOUND** (searched: "homeflow.it prezzi gratis proprietari inquilini"; "HomeFlow Brescia affitti compatibilità"; "homeflow.it come funziona feed profili punteggio"). No pricing text surfaced in any excerpt. HYPOTHESIS: pre-revenue or free during launch. |
| **Target customer** | FACT (press framing): private landlords "che ricevono centinaia di candidature anonime senza alcuno strumento per capire chi è davvero affidabile" and tenants hit by room rents "cresciute del 38 % in tre anni" [S2]. |
| **Identity / income / property verification** | NOT FOUND. Press text says tenant information is declared "a loro discrezione" (at the tenant's discretion) [S2] — HYPOTHESIS: self-declaration, no document verification at launch. |
| **Matching logic** | CLAIM: "un motore di intelligenza artificiale che analizza i profili e restituisce un punteggio di compatibilità che l'utente, proprietario o inquilino, potrà valutare in funzione delle proposte" [S2]. Methodology not published anywhere I could find. The homepage frames it as "compatibilità leggibile" and "segnali dichiarati" [S1]. |
| **Messaging / application workflow** | FACT: contact happens after compatibility is visible ("prima ancora di scambiarsi un messaggio") [S1]. Details of chat, invitations or application states NOT FOUND. |
| **Privacy model** | NOT FOUND beyond "a loro discrezione" disclosure [S2]. |
| **Mobile / web** | Web site confirmed [S1]. **No iOS/Android app found under this brand** (searched App Store / Play excerpts: the apps named "HomeFlow Pro" (US real-estate agent tours) [S6], "Home-Flow" (family tasks), "Home Flow" and "HomeFlow" (household organisers) [S91] are unrelated name collisions). |
| **Funding** | NOT FOUND. Ownership structure (incubator holds 33 %) suggests incubator equity rather than cash VC [S2] — HYPOTHESIS. |
| **Users / properties** | NOT FOUND. |
| **Traction signals** | Regional press coverage (Giornale di Brescia) [S2]; active SEO blog [S3][S4][S5]. No national press, no LinkedIn company data surfaced in searches. |
| **App-store ratings** | N/A (no app found). |
| **Complaints / positive feedback** | NOT FOUND (no reviews surfaced). |
| **Likely strengths (HYPOTHESIS)** | First Italian company to own the "marketplace invertito" narrative; two-sided (rent + sale) widens TAM; incubator support; founders with local real-estate background (Copeta described elsewhere as "Advisor Immobiliare" in Brescia). |
| **Apparent weaknesses (HYPOTHESIS)** | Three-city footprint; no app; no published pricing; "AI compatibility score" without methodology is an opaque-score risk (see §3.2); self-declared data with no verification lowers landlord trust — the very problem it claims to solve. |
| **Differentiation vs. a new entrant** | Narrative identical to LinkedHome's; the gap is in verification, transparency of the score, and tenant-side control. |

### 2.2 MyTenant — Italy (claimed)

**Status: NOT FOUND.** Queries run: "MyTenant Italia affitto inquilini profilo proprietari piattaforma"; "\"mytenant\" affitto startup Italia inquilino"; "\"mytenant.it\" OR \"my-tenant.it\" OR \"mytenant\" inquilini proprietari app Italia 2025"; "\"MyTenant\" startup Italia inquilini \"profilo\" affitto Milano Roma"; "\"MyTenant\" app Italy rental \"tenant profile\" landlords 2025 2026".

What the name actually resolves to:
- **MyTenant — Google Play (ng.mytenant.app)**: a Nigerian property app operated by Kraiga Services [S7]. Not Italian.
- **mytenants.app**: "The simple web app for managing tenants" — a generic landlord-management tool, no country or reverse-marketplace feature [S8].
- Italian results returned only adjacent products (Tenantivo, Rentadia, AffittoMio, Plinthos, Rentila, Domopay) — all landlord-management or rent-collection tools, not reverse marketplaces [S7][S86][S87].

HYPOTHESIS: the "MyTenant Italy" the brief refers to is either (a) a pre-launch or stealth project with no indexed web presence, (b) a mis-remembered name for one of the Italian products in §2.10–§2.12 (InquilinoGiusto, InquilinoFacile, Affitto Certificato), or (c) defunct and de-indexed. Recommendation: ask whoever supplied the name for a URL or LinkedIn page before treating it as a competitor.

### 2.3 Renter30 (renter30.com) — USA

| Field | Finding |
|---|---|
| **Current status** | **Active, newly launched** (FACT): site tagline "Renters Post Profiles, Landlords Search" [S9]; "Renter30 just launched recently in 2026" [S9]. |
| **Launch date** | FACT: USPTO trademark application serial 99675372 for RENTER30 states date of first use and first use in commerce **2026-02-13**, filed **2026-02-27**; goods/services "providing online non-downloadable computer software platforms for connecting landlords and renters" [S10]. |
| **Legal entity** | FACT: Renter30 LLC, 99 School St, Northfield, Massachusetts [S10]. Legal/terms page exists at renter30.com/legal [S11]. |
| **Geographic coverage** | FACT: US, zip-code based ("landlords enter the zip code of their rental property") [S9]. |
| **Tenant flow** | FACT: "Renters tell landlords what type of rental they're looking for (room, apartment, or house) and provide their desired move-in date, number of bedrooms needed, household size, pet info, and any other information they wish to share. When a landlord is interested in a renter's profile, they message directly, and the renter is notified through email" [S9]. |
| **Landlord flow** | FACT: "Landlords enter the zip code of their rental property to see renters actively looking in that area, with no account or posting required … send messages directly to renters through the platform with no middleman, no spam" [S9]. |
| **Pricing / monetisation** | FACT: "100 % free for both renters and landlords" [S9]. No revenue model disclosed. HYPOTHESIS: pre-monetisation; likely future landlord-side fees. |
| **Target customer** | Small private landlords and individual renters (HYPOTHESIS from zip-code / no-account design) [S9]. |
| **Tenant / landlord onboarding** | Tenant: create free profile. Landlord: **no account required** to search [S9] — notable low-friction choice. |
| **Identity / income / property verification** | NOT FOUND; none described in excerpts [S9]. |
| **Matching logic** | FACT: geographic (zip) search; profile fields are structured (move-in date, bedrooms, household size, pets, optional bio) [S9]. No score. |
| **Messaging** | FACT: in-platform messaging, email notification to renter [S9]. |
| **Privacy model** | Profiles are visible to anyone searching a zip without an account (FACT, by design) [S9] — HYPOTHESIS: this is a privacy weakness (no gating of tenant data). |
| **Mobile / web** | Web. App NOT FOUND. |
| **Funding / users / traction** | NOT FOUND. No reviews surfaced (searched: "Renter30 review landlords"). |
| **Strengths (HYPOTHESIS)** | Radical simplicity; zero landlord friction; clean positioning ("flips the traditional rental process"). |
| **Weaknesses (HYPOTHESIS)** | No verification, no monetisation, no privacy gating, no app; eight months old with no visible traction. |

### 2.4 Want2Rent — Australia (claimed)

**Status: NOT FOUND.** Queries run: "Want2Rent Australia tenant profile landlords"; "\"want2rent\" rental Australia"; "want2rent.com.au OR want2rent.au tenants create profile landlords invite"; "\"Want2Rent\" OR \"Want 2 Rent\" app tenants landlords Australia launch"; "\"want2rent\" tenant"; "\"want2rent.com.au\"".

The only entity using the string is **want2rent2own.com**, a Florida (US) rent-to-own home company [S12] — unrelated. Australian searches instead surfaced **Preferred Tenants** (§2.7), **Tenant Options** (§2.19), tApp/2Apply application tools [S62] and the Rent.com.au portal.

HYPOTHESIS: as with MyTenant, the name may be wrong, pre-launch, or defunct. Preferred Tenants is the closest Australian analogue and is profiled below.

### 2.5 LocService (locservice.fr) — France — the longest-running reverse marketplace found

| Field | Finding |
|---|---|
| **Status** | **Active** (FACT): pricing page live [S13]; multiple 2026-dated review articles [S14][S15][S16][S17]. |
| **Launch** | FACT: created in **1997**; publisher GOBOCOM, RCS Vannes 414 438 192 [S15][S18]. |
| **Coverage** | FACT: all of France ("partout en France") [S13]. |
| **Model** | FACT: "modèle inversé où le locataire publie sa recherche et ce sont les propriétaires qui le contactent" [S14]. |
| **Tenant flow** | FACT: tenant registers a "candidature" stating needs, budget and guarantees; the candidature is broadcast for a period the tenant chooses, up to 12 months [S14]. |
| **Landlord flow** | FACT: landlords consult candidatures that already match "au loyer, au type de bien, au secteur" and contact tenants; benefit framed as "éviter d'être noyé sous les appels" [S14]. |
| **Pricing** | FACT: **tenant pays once: €34 standard / €29 student (rates since 2025-07-22); not a subscription**. **Landlords: entirely free — no commission, no publication fee, no fee to access files** [S13][S14]. |
| **Verification** | Tenant self-declares guarantees; no third-party verification described in excerpts [S14]. |
| **Matching** | Rule-based filters (rent, property type, area) [S14]. No AI score claimed. |
| **Traction** | Self-reported: "plus de 250 000 propriétaires inscrits", "6 000 mises en relation par jour", 91,000+ on-site reviews at 4.1/5 [S15][S17]. Independent: **Trustpilot 3.9/5 with 22,000+ reviews**, "94 % des retours positifs" [S17][S19]. |
| **Complaints** | FACT (review-site synthesis): negative reviews come "essentiellement de locataires en zone tendue qui attendaient des contacts garantis, ce que le service ne promet pas" [S17]; recurring "arnaque?" questions answered as "site légitime et ancien … pas une arnaque" [S17][S18]. |
| **Positive feedback** | No agency fees for tenants; landlords get pre-qualified demand [S14][S16]. |
| **Mobile / web** | Web confirmed; app not retrieved. |
| **Strengths (HYPOTHESIS)** | 28-year survival proves the reverse model is viable at national scale; one-off tenant fee is simple and defensible; landlord side free maximises supply. |
| **Weaknesses (HYPOTHESIS)** | In tight markets (Paris, Lyon) tenant pays and may get zero contacts → refund/expectation complaints; no verification layer; dated UX (inference from review-site tone, low confidence). |
| **Relevance to Italy** | Highest. Same civil-law landlord mindset, same "no agency fee" hook. Tenant-pays-once is a proven price point (~€30). |

### 2.6 Kamernet (kamernet.nl) — Netherlands

| Field | Finding |
|---|---|
| **Status** | Active (FACT) [S22][S23]. |
| **Model** | Portal (landlords post rooms/flats) **plus a reverse feature**: "Huurders kunnen een uitgebreid profiel aanmaken … Als verhuurder heb je de mogelijkheid om onbeperkt op deze huurders te reageren via een Premium Account" [S23]. |
| **Landlord flow / pricing** | FACT: **Premium Account for landlords €34 per month** — "view profiles of all housing seekers in your city and contact them directly by sending a personal message", unlimited approaches, access to the "Kamernet Data" dashboard (compare rent, time-to-let), monthly auto-renewal, cancel anytime [S22]. |
| **Tenant pricing** | Seekers are also behind a paywall ("Kamernet Premium: de betaalmuur uitgelegd") [S24]; exact tenant price NOT RETRIEVED. |
| **Verification / matching** | Not retrieved; data-dashboard filters [S22]. |
| **Reviews** | Trustpilot page exists [S25]; score not retrieved. |
| **Relevance** | Shows the **landlord-pays-subscription-to-unlock-profiles** model (€34/month) coexisting with a classic portal. |

### 2.7 Preferred Tenants (preferredtenants.au / .com.au) — Australia

| Field | Finding |
|---|---|
| **Status** | Active (FACT) [S26][S27]. |
| **Positioning** | FACT: "Premium Directory of Reliable, Low-Risk Renters"; "promotes good tenants to agents and landlords who don't want to waste time dealing with bad tenants" [S26]. |
| **Tenant flow** | FACT: "Tenants can create their profile for free, and then pay and activate the profile when they want" [S26][S27]. Activation price **NOT FOUND** (searched: "preferredtenants.au price activate profile"). |
| **Landlord flow** | FACT: "landlords enter property details which shows only suitable tenant profiles, and then landlords can contact tenants for a private inspection"; "free to landlords when reviewing tenant profiles and shortlisting" [S26][S27]. |
| **Verification / eligibility** | FACT — hard exclusion rules: more than 7 days late with rent in last 12 months; breach notice in last 12 months; evicted in last 2 years; main income from government assistance or unstable household income in last year [S26]. |
| **Matching** | Property-criteria filter → "only suitable" profiles [S26]. |
| **Traction / reviews / app** | NOT FOUND. |
| **Observations (HYPOTHESIS)** | A "curated directory" variant of the reverse model: tenant pays for visibility, landlord free. The eligibility rules are explicit (transparent, if exclusionary) — contrast with Homeflow's opaque AI score. The income-source exclusion would be legally risky in Italy/EU (discrimination) — open question in §4. |

### 2.8 FindaFlat.co.uk — UK (reverse "wanted" section)

FACT: "Tenants can post a flat wanted advert to create a search profile, which helps landlords looking for tenants find and contact them … Landlords can search the flats wanted ads to proactively seek out tenants" [S28]. Pricing, verification, traction NOT FOUND. Status: page indexed, apparently a small long-tail site (HYPOTHESIS). SpareRoom offers a comparable "room wanted ad" for flat-shares [S29].

### 2.9 Finn.no "Bolig ønskes leid" — Norway (reverse section in the national portal)

FACT: FINN Eiendom runs a "housing wanted" category where renters post ads describing themselves ("responsible tenant looking for housing near Molde", "quiet, tidy, financially secure") and landlords contact them; at access there were 38 ads in Stavanger and 107 in Gamle Oslo [S21]. Pricing for posting NOT FOUND. Relevance: proof that incumbents can bolt a reverse section onto a portal at near-zero cost (HYPOTHESIS: this is the most likely incumbent response in Italy from Immobiliare.it/Idealista).

### 2.10 InquilinoGiusto.it — Italy

| Field | Finding |
|---|---|
| **Status** | Active (FACT): site indexed at inquilinogiusto.it and a registration flow at inquilinogiusto.grownnectia.com [S30][S31]. Launch year NOT FOUND. |
| **Positioning** | FACT: "il primo database in Italia di inquilini certificati e immobili liberi" [S30]. |
| **Landlord flow** | FACT: "find a list of certified tenants (including family composition, interests, and pay stubs), receive applications for your property, and choose which tenants to contact. Each profile has an automatic evaluation based on income, family members, presence of pets and other parameters" [S30]. |
| **Tenant flow** | FACT: tenants see available properties, apply, and wait to be evaluated [S30]. |
| **Pricing** | FACT: "completely free — no commission costs … direct contact without intermediaries" [S30]. |
| **Traction** | Self-reported: "over 50,000 validated people searching for rental housing" [S30]. |
| **Observations** | The closest existing Italian reverse marketplace in spirit (landlord browses a certified-tenant database with an automatic score). Hybrid: also lists properties. The automatic evaluation is rule-based on declared parameters (income, family, pets) — more transparent than an AI score but still a black box to the tenant (HYPOTHESIS). The second domain (grownnectia.com) suggests a white-label/agency build (HYPOTHESIS). |

### 2.11 InquilinoFacile.it — Italy

FACT: "consente di creare un profilo inquilino verificato o trovare l'inquilino ideale, ed è gratuito per inquilini e locatori privati in tutta Italia"; "profili verificati con scoring trasparente e documenti verificati"; tenant profile "completamente gratuito e permette di caricare documenti e candidarsi agli immobili senza costi"; described as "piattaforma di matching tra inquilini verificati e locatori" [S32]. Founder, launch date, agency pricing, user numbers: NOT FOUND (the site fetch was blocked; the follow-up search budget was exhausted). CLAIM to note: "scoring trasparente" — the only Italian product found that *markets transparency of the score* as a feature.

### 2.12 Affitto Certificato (affittocertificato.it) — Italy (screening + references + free listings)

| Field | Finding |
|---|---|
| **Model** | FACT: "il primo sistema per verificare l'affidabilità e la solvibilità dell'inquilino e per selezionare inquilini referenziati … pensato per i proprietari e dedicato alle agenzie immobiliari" [S33]. Not a pure reverse marketplace: landlords publish free ads and check applicants; tenants build "referenze digitali certificate" [S33][S34]. |
| **Data sources** | FACT: landlord feedback on past tenants + "banche dati ufficiali delle Camere di Commercio, delle Conservatorie e di società specializzate nella profilazione" [S33]. |
| **Pricing** | FACT: landlord purchases on-platform via PayPal or pays the agency **€59.00 IVA inclusa**; tenant-side functions free [S36]. |
| **Funding** | Equity-crowdfunding campaign on BacktoWork [S37]; covered by Economyup as "la startup che crea la banca dati dei buoni inquilini" [S38]. Year not retrieved. |
| **Relevance** | Demonstrates an Italian landlord willingness-to-pay anchor (~€59 per check) and a tenant-reference primitive ("chiedere gratuitamente il rilascio di una referenza dal suo attuale locatore") that a reverse marketplace could reuse. |

### 2.13 doMate — Spain (roommate matching with landlord channel; launched July 2026)

FACT: built by three Universitat Politècnica de València students; press on 2026-07-21 [S45][S46]; live in Valencia and Alcoy [S47]. "Connects landlords with tenant groups that are pre-matched for compatibility" by crossing "schedules, habits, and preferences"; mutual rating system; landlord–tenant channel "where the landlord doesn't expose their phone number or bank account" [S45][S47]. Pricing: "completely free for tenants" (founders argue charging seekers would worsen access); "private landlords and agencies can publish up to two properties for free, and from the third property onwards … a fee whose amount depends on the volume"; visibility "doesn't depend on additional payments" but on ratings [S45]. Classification: roommate marketplace; partially reverse (landlord receives matched tenant groups). Relevance: a 2026 data point for **free-for-tenants, volume-fee-for-landlords** and for **privacy-preserving contact channels**.

### 2.14 Flow (flow.rent) — South Africa — the pivot case study

Timeline (all FACT):
- 2019: founded by Daniel Levy, Gil Sperling, Jonathan Liebmann; "Tinder-like" tenant–landlord matching plus "up to 20 % of rent back in rewards … whether or not their landlord has the app"; $1.5M pre-Series A (Jan 2019) [S52][S53].
- March 2020: "Flow 2.0 … a full-stack rental platform … matching great tenants with top-rated landlords" [S49].
- Key admission: "Prior to launching the matching search feature, the rental platform was working with institutional landlords and state agencies, but they found out that **the critical mass required was not near what was needed**" [S48].
- Dec 2021: repositioned as a tool "helping real estate agents and developers automate social media advertising" [S50].
- Jan 2023: $4.5M pre-Series A to expand into Europe; "over 300 clients … about 6,000 agents … in South Africa, Namibia, Botswana, Mauritius, and Australia"; revenue "+20 % month after month" [S51].

Lesson (HYPOTHESIS): a consumer-side matching marketplace with tenant rewards could not reach liquidity even with VC money and 23M daily Facebook users to target; the company survived only by pivoting to B2B SaaS for agents. This is the clearest documented reverse-marketplace pivot found.

### 2.15 Rentberry — USA / global (bidding portal, NOT reverse)

FACT: "rental and price negotiation services"; "ability for tenants to make custom offers"; also "property marketing, tenant screening, rental auction, e-contracts, rental payments" [S54]. Capterra: 4.8/5 from 61 verified reviews; complaints "limited listings in rural areas and occasional delays in support" [S54]. Raising on Republic in 2026 [S55]. CLAIM (via Republic/Kingscrowd, unverified): "$118M raised … valuation of $1B … more than 5 million users and 20 million properties across 90 countries … path towards more than $50 million in ARR" [S55]. Crunchbase and Tracxn profiles exist but could not be fetched [S56][S57]. Classification: listing portal with auction mechanics; the *landlord* still posts the supply. Not a direct competitor; relevant as a cautionary example of "tenant bidding" being perceived as anti-tenant (HYPOTHESIS; not verified in this research).

### 2.16 Zappyrent — Italy (managed / guaranteed rental, NOT reverse)

FACT: "portale di affitti a medio-lungo termine" where listing is free and "viene applicata una fee pari a una mensilità dell'affitto per il primo mese e l'8 % dell'affitto per i mesi successivi" [S39]; €139 fee for canone-concordato contracts [S39]; "Zappyrent Protection" pays rent monthly regardless of tenant default, legal eviction costs covered [S40]; an older report quotes "50 % of the rent for the first month and 8 % for subsequent months (up to a maximum of 24)" [S42]; algorithmic tenant risk rating [S41]; "i proprietari ricevono, per ogni prenotazione, una scheda dettagliata del potenziale inquilino" [S39]. Classification: managed rental with guarantee; monetises the landlord via rent-share. Relevant as the Italian high-ARPU benchmark.

### 2.17 Pronto Inquilino — Italy (human "Relocation Strategist" network, NOT reverse)

FACT: franchising network; a "Relocation Strategist" collects the tenant's needs "per tracciare un profilo di alta affidabilità e solvibilità" and places them with landlords/agencies; founders claim 15 years of lettings experience managing income for "oltre ventimila proprietari" (self-reported) [S43][S44]. A Trustpilot page exists. Classification: human-mediated placement service; interesting because it sells the *tenant profile* concept offline.

### 2.18 ImmoScout24 — Germany (portal; tenant subscription; "Gesuche" partially verified)

FACT: tenant premium "MieterPlus", now "Suchen+", €12.99–39.99 per month depending on tier and term (Standard €12.99 at 12 months to €29.99 at 3 months; Pro €17.99–34.99; Unlimitiert €29.99–39.99) [S63]; benefits include "chance checks, prioritized contact requests, early access to listings, application folders (Bewerbermappe), and credit information"; "at the beginning of free basic listings, only tenants with MieterPlus membership can contact the landlord" [S63][S67]. Landlord side: free basic listing 14 days with max 10 contact requests, max two free ads per six months; paid private listings €129.99–629.99 [S64][S66]. **Gesuche:** ImmoScout24's "Immobiliengesuche privat" page says posting a request "reaches property owners who haven't yet advertised their properties" [S65] — so a tenant-posted "wanted" object exists, but **I could not verify that landlords can search tenant profiles as a product feature** (the brief's "Mietersuche" claim). Status: PARTIALLY VERIFIED; treat "ImmoScout24 lets landlords search tenant profiles" as unconfirmed.

### 2.19 Tenant Options, tApp, 2Apply — Australia (application profiles, NOT reverse)

FACT: Tenant Options is "100 % free to use for Tenants", offers a reusable Rental Profile and automated "Smart Referencing"; "not available to Landlords directly but they can be directed to an agency" [S61]. tApp is an online tenancy application form [S62]. Classification: profile-attach tools for agent-posted listings.

### 2.20 RentProfile — UK (referencing + landlord directory)

FACT: founded 2016 [S60]; "landlords sign up and be added to a directory, which is then searchable by renters" (a *landlord-checking* reverse, not tenant-side) [S59]; pricing £19 per tenant referencing PAYG, £40 company-as-tenant, £240 rent guarantee, £7 Right to Rent; landlord profile free for first property, tenant checks £15, Premium £50/year [S58]. Classification: B2B screening.

### 2.21 US "Renter Profile" products — Zillow, Avail, Trulia, TenantCloud, Renter-Profile.com, TenantsLookup (profile-attach, NOT reverse)

FACT: Zillow Rental Manager promotes a "Renter Profile" as "a win-win for landlords and renters" [S73]; Avail offers a "Renter Profile & Universal Rental Resume" [S74]; Trulia launched a "Rental Resume" [S75]; TenantCloud a reusable renter profile [S76]; renter-profile.com sells "structured renter profiles for rental applications" [S77]; tenantslookup.com positions as a "Landlords & Tenants Website" [S78]. In all of these the *landlord still posts the listing*; the profile travels with the application. Not reverse marketplaces, but they set tenant expectations for a reusable profile.

### 2.22 Dutch / Belgian "Huurprofiel" tools — Huurwoningen.nl, TenePass, Verhuurtbeter.nl, mijnhuurprofiel.be (Dewaele), Rentio (profile-attach)

FACT: Huurwoningen.nl's Huurprofiel collects employment situation, gross income, guarantor, household, pets, move-in date, lease period, current housing, personal message [S68]; TenePass "create it once … share it when you apply" [S69]; Verhuurtbeter "see directly for which homes you qualify" [S70]; mijnhuurprofiel.be is an agency-side "huurders-CV" [S71]; Rentio is a Belgian rental-management platform with a tenant side [S72]. Classification: profile-attach / qualification tools.

### 2.23 Badi — Spain / Italy (roommate marketplace)

FACT (Il Sole 24 Ore, ~2023): Spanish app that debuted in Italy, "uses artificial intelligence on social network information to help users find … the 'ideal' roommate based on age, tastes, and interests without intermediaries or commissions"; "smart recommendation" refined as users accept/reject matches [S79]. Status 2026 and "Badi Match" NOT RESEARCHED (budget).

### 2.24 Sytes — USA (commercial real-estate reverse marketplace; adjacent evidence only)

Surfaced in search as "the first reverse commercial real estate marketplace … tenants post exactly where they want to be … Landlords and brokers then compete to bring them sites" [S81]. Commercial, not residential; low confidence (single short-form source). Included only as evidence that the "reverse" framing is being used in 2026 marketing.

### 2.25 Other Italian products surfaced and classified (none are reverse marketplaces)

| Product | Classification | Evidence |
|---|---|---|
| RoomMate (IT/LU) | Tenant household-management app; ~20,000 users (self-reported, Dec 2020) | [S80] |
| Rent2Cash | Rent-advance financing for landlords (up to 3 years) | [S90] |
| Domopay | Tenant verification + automated rent collection | [S86] |
| Rentila | Landlord management software; "50,000 owners / ~200,000 properties" (self-reported) | [S87] |
| Mioaffitto.it | Classic portal with community Q&A | [S88] |
| Domeo | AI rental management (StartupItalia) | [S89] |
| Locare | Agency-side rental platform | surfaced in [S42]-adjacent results; not profiled |
| SoloAffitti "Affitto Sicuro", Affitti Sicuri (Rome) | Agency guarantee products / agencies | surfaced via search; not profiled |
| Alquiler Seguro (ES) | 60+ office managed-rental network | [S85] |

### 2.26 Candidates searched and NOT FOUND

- **Vemo / Vemigo (Italy)** — searched "Vemo Vemigo Italia affitto startup inquilini proprietari": nothing.
- **Housit** — searched "Housit affitto come funziona inquilini proprietari startup Italia": nothing relevant.
- **Immobiliare.it "Affitto Sicuro"** — searched; results only describe *insurance* products (premium ≈10 % of annual rent, paid by tenant, replaces deposit; "evaluating up to 3 candidates") offered by agencies/SoloAffitti, not an Immobiliare.it tenant-profile feature.

### 2.27–2.30 NOT RESEARCHED (search budget exhausted before these could be queried)

Roomster, Bungalow, Apartment List "Rental Profile", Rentable, RentMatch, Homepapp, Vlocka, Tenant Reference, Idealista "Buscador de inquilinos", Housfy, Spotahome, Nestpick, Hemnet, HousingAnywhere "Verified Tenant", Zumper, Wunderflats (only a referral page surfaced [S92]), Rentola (only aggregator pages surfaced [S93]), Wohnungsgesuch / Mietgesuche portals, Qasa (SE), Movebubble (UK), the UK "swipe" portal reported by Landlord Today in Feb 2026 [S83], Affittala.com, Roomless, DoveVivo, Habyt, UniAffitti, Dove.it, Casavo affitto, Affitto Garantito. These should be the first items of a follow-up pass.

---

## 3. Cross-cutting insights

### 3.1 What reverse marketplaces consistently do — and where they consistently fail

**Consistent design pattern (FACT across LocService, Renter30, Preferred Tenants, Kamernet, InquilinoGiusto, Homeflow):**
1. Structured tenant profile with a small fixed schema: budget, area, move-in date, household size, pets, job/income declaration, free-text bio [S1][S9][S14][S26][S30].
2. Landlord enters *property criteria* (zip/area, rent, type) and sees only matching profiles [S9][S14][S26].
3. Landlord initiates contact; tenant is notified; conversation stays in-platform [S9][S14][S22].
4. Landlord side is **free or nearly free** in most pure reverse products (LocService, Renter30, Preferred Tenants, InquilinoGiusto, InquilinoFacile for private landlords) [S9][S13][S26][S30][S32]. The only landlord-pays reverse feature found is Kamernet's €34/month profile-browsing subscription, and that sits on top of a portal [S22].

**Consistent failure modes (FACT where cited, otherwise HYPOTHESIS):**
- **Liquidity in tight markets.** LocService's negative reviews concentrate on tenants in "zone tendue" who paid and got no contacts [S17]. Flow (ZA) abandoned matching because "the critical mass required was not near what was needed" [S48]. HYPOTHESIS: reverse marketplaces invert the usual cold-start problem — supply (landlords) is now the scarce, lazy side that has to be pulled in to browse, and landlords only browse when they have a vacancy *right now*.
- **Verification is thin.** Homeflow (self-declared "a loro discrezione") [S2], Renter30 (none) [S9], LocService (declared guarantees) [S14]. Only the Italian screening-adjacent products (Affitto Certificato — registry data [S33]; InquilinoGiusto — pay slips [S30]; InquilinoFacile — "documenti verificati" [S32]) describe document checks. HYPOTHESIS: the landlord's real pain ("centinaia di candidature anonime senza alcuno strumento per capire chi è davvero affidabile" [S2]) is *trust*, and self-declared profiles do not solve it.
- **Privacy exposure.** Renter30 shows profiles to anyone with a zip code and no account [S9]; Finn.no wanted ads are public [S21]. doMate is the only product found that explicitly hides phone and bank details until later [S45]. HYPOTHESIS: GDPR-grade gating (what is visible pre- vs post-invite) is an open differentiator in Italy.
- **No mobile apps** among the small reverse players (Homeflow, Renter30, InquilinoGiusto, InquilinoFacile, Preferred Tenants: none found). HYPOTHESIS: web-first is adequate for landlords; tenants may expect an app.

### 3.2 The "opaque score" question

- Homeflow markets an **AI compatibility score** returned by "un motore di intelligenza artificiale che analizza i profili" [S2] — no methodology, inputs or appeal process surfaced (CLAIM).
- InquilinoGiusto uses an **automatic evaluation** on declared parameters (income, family members, pets, "other parameters") [S30] — rule-based but still unexplained to the tenant.
- InquilinoFacile explicitly markets **"scoring trasparente"** [S32] — the only product found that treats transparency as a selling point.
- Zappyrent uses an algorithmic **risk rating** to underwrite its guarantee [S41] — the score is internal and backs a financial product, which is a defensible use.
- Preferred Tenants uses **published hard rules** (late rent, breach, eviction, income source) instead of a score [S26] — transparent, but the income-source rule would be discriminatory under EU/Italian anti-discrimination norms (HYPOTHESIS; legal review needed).
- LocService, Renter30, Kamernet, Finn.no use **no score at all** — pure filtering [S9][S14][S21][S22].

HYPOTHESIS: an opaque AI score on self-declared data is the weakest position — landlords cannot trust it (inputs unverified) and tenants cannot contest it (EU AI Act / GDPR Art. 22 exposure for automated decisions with significant effect — to be confirmed by legal). Explainable, document-backed, tenant-visible scoring is the gap.

### 3.3 Monetisation patterns observed (all FACT, cited)

| Pattern | Example | Price point | Who pays |
|---|---|---|---|
| One-off tenant fee for visibility | LocService | €34 / €29 student, up to 12 months [S13][S14] | Tenant |
| Tenant pays to "activate" a curated profile | Preferred Tenants | amount not found [S26] | Tenant |
| Tenant subscription for contact priority | ImmoScout24 Suchen+/MieterPlus | €12.99–39.99 / month [S63] | Tenant |
| Landlord subscription to browse seeker profiles | Kamernet Premium | €34 / month [S22] | Landlord |
| Landlord pays per screening check | Affitto Certificato | €59 IVA incl. [S36] | Landlord |
| Landlord pays per referencing | RentProfile | £19 / tenant [S58] | Landlord/agent |
| Landlord volume fee after free tier | doMate | 2 free listings, then volume fee [S45] | Landlord |
| Rent share for managed/guaranteed rental | Zappyrent | 1 month + 8 % of subsequent months [S39] | Landlord |
| Free (pre-monetisation) | Renter30, InquilinoGiusto, InquilinoFacile (private), Homeflow (unknown) | €0 [S9][S30][S32] | — |

**Dominant model among pure reverse marketplaces: tenant pays a small one-off (~€30) or activation fee; landlord is free.** The oldest survivor (LocService) and the Australian curated directory both chose this. Landlord-pays appears only as (a) a subscription bolted onto a portal that already has landlord traffic (Kamernet) or (b) per-check screening (Affitto Certificato, RentProfile). HYPOTHESIS for Italy: tenant-pays is socially fragile (doMate's founders explicitly refuse it [S45]; Italian tenant advocacy is strong), so a landlord-pays-per-verified-contact or per-check model with a free tenant side is more defensible, but it requires solving landlord liquidity first.

### 3.4 Evidence of shutdowns and pivots

- **Flow (South Africa)** — the only documented pivot: consumer matching + rewards (2019) → "full-stack marketplace" (2020) → B2B social-ad automation for agents (2021) → $4.5M raise on the B2B model (2023). Stated reason: lack of critical mass [S48][S49][S50][S51]. Lesson: the team monetised the *agent* side where budgets exist.
- **Name churn / long tail** — FindaFlat.co.uk, tenantslookup.com, renter-profile.com: small reverse or profile sites with no visible traction [S28][S77][S78]. HYPOTHESIS: the model is cheap to build and routinely attempted, rarely liquid.
- **Survivors** are either very old with a national brand built pre-portal era (LocService, 1997 [S15]) or reverse *sections inside* dominant portals (Finn.no, Kamernet) [S21][S22].
- No Italian reverse-marketplace shutdown was documented in this pass; MyTenant could be one (see §2.2) but there is no evidence either way. Movebubble, Bungalow, Roomster status: NOT RESEARCHED.

---

## 4. Implications and open questions for a new Italian reverse-rental entrant

### 4.1 Implications (HYPOTHESIS unless cited)

1. **Homeflow is a narrative competitor, not yet a traction competitor.** It owns the "marketplace invertito" story in Lombardy press since Sept 2025 [S2] and is building SEO content [S3][S4][S5], but shows no public pricing, app, user numbers or outside funding. A new entrant in the same cities would fight for the same early-adopter landlords; entering elsewhere (Rome, Turin, Bologna, university towns) avoids a head-on launch.
2. **Verification is the open flank.** Every Italian reverse/profile product either self-declares (Homeflow) or is a screening tool without a marketplace (Affitto Certificato). Combining document-verified profiles (ID, payslips, previous-landlord reference as Affitto Certificato does for free [S34]) with the reverse feed is not yet done well by anyone found.
3. **Make the score explainable or drop it.** See §3.2. InquilinoFacile already markets "scoring trasparente" [S32]; the entrant should go further (show tenants their own score and the factors).
4. **Price point anchors:** ~€30 one-off (tenant, LocService [S13]); €34/month (landlord browse, Kamernet [S22]); €59 per check (landlord, Affitto Certificato [S36]); 1 month + 8 % (managed, Zappyrent [S39]). A landlord-side price between €0 (browse) and €15–€30 per verified contact/unlock sits between these anchors.
5. **Expect incumbents to copy cheaply.** Finn.no and Kamernet show that a "wanted"/profile section can be added to a portal [S21][S22]; Immobiliare.it and Idealista could do the same. Defensibility must come from verification data and workflow (invites, applications, references), not from the feed itself.
6. **Privacy-by-design is both a legal requirement and a feature.** Renter30's open profiles [S9] would not be acceptable under GDPR for income/household data; doMate's hidden-contact channel [S45] is the right direction.
7. **Liquidity strategy must target landlords with a vacancy *now*.** Flow's failure [S48] and LocService's complaints [S17] both stem from landlords not showing up. Seeding via agencies (Affitto Certificato and Pronto Inquilino both go through agencies [S33][S43]) or via managed-rental partners may be necessary before a pure C2C flywheel works.

### 4.2 Open questions (to resolve in follow-up research or customer discovery)

1. What does Homeflow actually charge, how many profiles/landlords does it have, and is the AI score live or a roadmap item? (Requires a direct site visit / sign-up from a non-sandboxed environment.)
2. Does "MyTenant Italy" exist at all? Obtain a URL from whoever supplied the name.
3. Does "Want2Rent Australia" exist? Same.
4. Does ImmoScout24 really let landlords search tenant profiles ("Mietersuche"), or only receive Gesuche? Needs a German-language product walkthrough.
5. What is Preferred Tenants' activation fee, and would its eligibility rules be lawful in Italy?
6. App-store ratings for LocService, Kamernet, Badi, Rentberry — blocked in this environment.
7. Status of Badi, Roomster, Bungalow, Movebubble, Qasa, the Feb-2026 UK "swipe" portal [S83], and the Italian list in §2.27–2.30.
8. Legal: EU AI Act / GDPR Art. 22 implications of an automated tenant compatibility score; anti-discrimination constraints on filters such as income source, nationality, family status.
9. Is "tenant pays" culturally acceptable in Italy, or does it trigger the "caparra/agenzia" resentment that doMate's founders cite [S45]?

---

## 5. Sources

All accessed 2026-10-02 via search-engine excerpts (direct fetch blocked by sandbox egress policy; see §0). "n.d." = publication date not retrieved.

| # | URL | Publisher | Pub. date |
|---|---|---|---|
| S1 | https://homeflow.it/ | HomeFlow (company site) | n.d. |
| S2 | https://www.giornaledibrescia.it/economia/imprese/homeflow-startup-brescia-intelligenza-artificiale-affitti-qux3zmo0 | Giornale di Brescia | n.d. (content refers to Sept 2025 launch; likely autumn 2025) |
| S3 | https://homeflow.it/blog/come-trovare-casa-senza-agenzia/ | HomeFlow blog | n.d. |
| S4 | https://homeflow.it/blog/tapparelle-rotte-affitto-chi-paga/ | HomeFlow blog | n.d. |
| S5 | https://homeflow.it/blog/danni-immobile-trattenere-caparra/ | HomeFlow blog | n.d. |
| S6 | https://apps.apple.com/us/app/homeflow-pro/id6761082016 | Apple App Store (unrelated "HomeFlow Pro", US agent tool) | n.d. |
| S7 | https://play.google.com/store/apps/details?id=ng.mytenant.app | Google Play (Nigerian "MyTenant" by Kraiga Services) | n.d. |
| S8 | https://www.mytenants.app/ | mytenants.app | n.d. |
| S9 | https://www.renter30.com/ | Renter30 LLC (company site) | n.d. (launched 2026) |
| S10 | https://uspto.report/TM/99675372 | uspto.report (USPTO filing serial 99675372) | filed 2026-02-27 |
| S11 | https://www.renter30.com/legal | Renter30 LLC | n.d. |
| S12 | https://www.want2rent2own.com/ | Want2Rent2Own (Florida; name collision) | n.d. |
| S13 | https://www.locservice.fr/tarifs | LocService (company pricing page) | rates effective 2025-07-22 |
| S14 | https://www.etudierendroit.fr/locservice-avis-prix-et-acces-a-son-compte/ | EtudierEnDroit | 2026 |
| S15 | https://coeurdorly.com/locservice/ | Cœur d'Orly | 2026 |
| S16 | https://investissement-locatif-avis.fr/locservice-avis/ | Investissement Locatif Avis | 2026 |
| S17 | https://www.lestutosdelimmo.fr/locservice-avis-analyse/ | Les Tutos de l'Immo | 2026 |
| S18 | https://www.info-immobilier.net/avis-loc-service-enquete-complete-sur-la-fiabilite-du-site/ | Info Immobilier | n.d. |
| S19 | https://ca.trustpilot.com/review/locservice.fr | Trustpilot | live page |
| S20 | https://immocompare.org/home/investissement-immobilier-outils/locservice-avis/ | Immocompare | n.d. |
| S21 | https://www.finn.no/realestate/wanted/search.html (and location variants for Stavanger, Gamle Oslo) | FINN.no | live page |
| S22 | https://kamernet.nl/data-dashboard/betaling-stap1 | Kamernet ("Premium voor verhuurders") | live page |
| S23 | https://kamernet.nl/tips/verhuurders/adverteren/verhuren-aan-starters-en-expats_1 | Kamernet | n.d. |
| S24 | https://househunter.online/nl/blog/kamernet-premium-abonnement-internationals-betaalmuur | HouseHunter | n.d. |
| S25 | https://www.trustpilot.com/review/www.kamernet.nl | Trustpilot | live page |
| S26 | https://preferredtenants.au/ | Preferred Tenants (company site) | n.d. |
| S27 | https://preferredtenants.com.au/faq | Preferred Tenants FAQ | n.d. |
| S28 | https://www.findaflat.com/content/about/our-services-findaflat/ | FindaFlat.co.uk | n.d. |
| S29 | https://www.spareroom.co.uk/newlandlords | SpareRoom | n.d. |
| S30 | https://inquilinogiusto.it/ (also https://www.inquilinogiusto.it/index.htm) | InquilinoGiusto | n.d. |
| S31 | https://inquilinogiusto.grownnectia.com/registrazione/ | InquilinoGiusto (registration) | n.d. |
| S32 | https://www.inquilinofacile.it/ | InquilinoFacile | n.d. |
| S33 | https://www.affittocertificato.it/ | Affitto Certificato | n.d. |
| S34 | https://www.affittocertificato.it/faq.html | Affitto Certificato FAQ | n.d. |
| S35 | https://www.affittocertificato.it/condizioni_generali.html | Affitto Certificato T&C | n.d. |
| S36 | https://www.affittocertificato.it/news/dettaglio-art-l_inquilino_cosa_deve_pagare-articolo-15.html | Affitto Certificato news | n.d. |
| S37 | https://www.backtowork24.com/online-campaign.php?c=89-affitto+certificato | BacktoWork (equity crowdfunding) | n.d. |
| S38 | https://www.economyup.it/startup/affitto-certificato-la-startup-che-crea-la-banca-dati-dei-buoni-inquilini/ | Economyup | n.d. |
| S39 | https://www.zappyrent.com/it/blog/zappyrent-tutto-quello-che-ce-da-sapere/ | Zappyrent blog | n.d. |
| S40 | https://zappyrent.zendesk.com/hc/it/articles/14882181401489-FAQ-Proprietari | Zappyrent help centre | n.d. |
| S41 | https://startupitalia.eu/economy/economia-digitale/zappyrent-lalgoritmo-da-il-rating-allinquilino-e-la-startup-paga-al-suo-posto-se-moroso/ | StartupItalia | n.d. |
| S42 | https://www.agi.it/innovazione/news/2021-12-21/come-farsi-pagare-affitto-da-inquilini-14988493/ | AGI | 2021-12-21 |
| S43 | https://www.prontoinquilino.it/chi-siamo | Pronto Inquilino | n.d. |
| S44 | https://www.milanofinanza.it/news/il-ruolo-del-relocation-strategist-nella-crescente-domanda-di-affitti-in-italia-202401121213481705 | Milano Finanza | 2024-01-12 |
| S45 | https://www.upv.es/noticias-upv/noticia-15978-domate-es.html | Universitat Politècnica de València | 2026-07 |
| S46 | https://www.eldebate.com/espana/comunidad-valenciana/20260721/estudiantes-upv-lanzan-app-acabar-pesadillas-pisos-compartidos_441782.html | El Debate | 2026-07-21 |
| S47 | https://alicanteplaza.es/alicanteplaza/alcoy-el-comtat/asi-es-domate-la-app-creada-en-la-upv-para-hacer-match-con-companeros-de-piso-que-ya-funciona-en-alcoy-y-valencia | Alicante Plaza | 2026-07 |
| S48 | https://techbuild.africa/proptech-flow-social-platforms-africas-property/ | TechBuild Africa | n.d. |
| S49 | https://propertywheel.co.za/2020/03/flow-2-0-to-provide-a-rental-platform-for-the-property-rental-marketplace/ | Property Wheel | 2020-03 |
| S50 | https://techpoint.africa/2021/12/08/flow-social-media/ | Techpoint Africa | 2021-12-08 |
| S51 | https://techpoint.africa/2023/01/18/south-african-proptech-flow-4-5mpreseriesa/ | Techpoint Africa | 2023-01-18 |
| S52 | https://weetracker.com/2019/01/28/flow-the-s-a-app-that-rewards-tenants-for-good-behavior-has-raised-usd-1-5-mn-pre-series-a/ | WeeTracker | 2019-01-28 |
| S53 | https://www.news24.com/business/Entrepreneurs/dont-punish-bad-tenants-reward-good-ones-say-brains-behind-new-proptech-app-20190407 | News24 | 2019-04-07 |
| S54 | https://www.capterra.com/p/153151/Rentberry/reviews/ | Capterra | 2026 |
| S55 | https://kingscrowd.com/rentberry-on-republic-2026/ | KingsCrowd | 2026 |
| S56 | https://www.crunchbase.com/organization/rentberry | Crunchbase (not fetchable) | — |
| S57 | https://tracxn.com/d/companies/rentberry/__Rfe-O3iIvncmj9xtrMsSIvgWR8G-zQOD6vJ0Wdd0R8U | Tracxn | 2026 |
| S58 | https://www.rentprofile.co/landlords | RentProfile | n.d. |
| S59 | https://blog.rentprofile.co/rentprofile-the-first-uk-online-landlord-checking-service-launches/ | RentProfile blog | n.d. |
| S60 | https://tracxn.com/d/companies/rentprofile/__39XF6rLPcM1wNtO3n5N9KM-a94NRgzEPfoGa5qHafjc | Tracxn | 2025 |
| S61 | https://tenantoptions.com.au/tenants/ and https://tenantoptions.com.au/faqs/ | Tenant Options | n.d. |
| S62 | https://t-app.com.au/ | tApp | n.d. |
| S63 | https://wohnticker.de/ratgeber/immoscout-mieterplus-kosten | Wohnticker | 2026 |
| S64 | https://nunc.immo/immoscout24-kosten | nunc.immo | 2026 |
| S65 | https://www.immobilienscout24.de/anbieten/private-anbieter/immobilien-inserieren/anzeige-aufgeben/immobiliensuche.html | ImmoScout24 ("Immobiliengesuche privat") | n.d. |
| S66 | https://www.immobilienscout24.de/wissen/vermieten/anzeige-aufgeben.html | ImmoScout24 | n.d. |
| S67 | https://vodies.de/immoscout24-mieterplus-lohnt-sich-die-mitgliedschaft/ ; https://zeitundwert.de/aktuelles/was-taugt-die-mieterplus-mitgliedschaft-von-immoscout | Vodies; Zeit und Wert | n.d. |
| S68 | https://www.huurwoningen.nl/info/huurprofiel/ | Huurwoningen.nl | n.d. |
| S69 | https://tenepass.com/nl/je-huurprofiel-in-nederland/ | TenePass | n.d. |
| S70 | https://www.verhuurtbeter.nl/ | Verhuurtbeter | n.d. |
| S71 | https://www.dewaele.com/nl/advies/veelgestelde-vragen-mijnhuurprofiel-als-huurder | Dewaele | n.d. |
| S72 | https://www.rentio.be/nl-be | Rentio | n.d. |
| S73 | https://www.zillow.com/rental-manager/resources/renter-profile-win-win/ | Zillow Rental Manager | n.d. |
| S74 | https://www.avail.com/tenants/renter-profile | Avail | n.d. |
| S75 | https://www.trulia.com/blog/tech/trulia-rental-resume/ | Trulia blog | n.d. |
| S76 | https://www.tenantcloud.com/tenant | TenantCloud | n.d. |
| S77 | https://www.renter-profile.com/ | Renter-Profile.com | n.d. |
| S78 | https://tenantslookup.com/ | TenantsLookup | n.d. |
| S79 | https://www.ilsole24ore.com/art/se-l-inquilino-perfetto-si-trova-le-app-AEADwXND | Il Sole 24 Ore | ~2023 (excerpt: "approximately 3 years ago") |
| S80 | https://startupitalia.eu/142950-20201210-roommate-affitto-digitale-intervista | StartupItalia | 2020-12-10 |
| S81 | https://www.youtube.com/shorts/ADZVopvCCwc ("The Reverse Listing Marketplace" — Sytes) | YouTube (low confidence) | n.d. |
| S82 | https://www.landlordzone.co.uk/news/portal-launches-in-uk-offering-landlords-direct-online-advertising-to-find-tenants | LandlordZone (context only) | n.d. |
| S83 | https://www.landlordtoday.co.uk/breaking-news/2026/02/new-rental-portal-allows-tenants-to-swipe-to-select-homes/ | Landlord Today (title only; not researched further) | 2026-02 |
| S84 | https://www.moncloa.com/2026/05/29/inquilino-vivienda-compartida-3380550/ | Moncloa (Spanish tenant-profile context) | 2026-05-29 |
| S85 | https://www.alquilerseguro.es/ | Alquiler Seguro | n.d. |
| S86 | https://domopay.com/en/for-landlords-real-estate-agencies/ | Domopay | n.d. |
| S87 | https://www.rentila.it/ | Rentila | n.d. |
| S88 | https://www.mioaffitto.it/community/inquilini | Mioaffitto.it | n.d. |
| S89 | https://startupitalia.eu/startup/domeo-intelligenza-artificiale-affitti/ | StartupItalia | n.d. |
| S90 | https://www.startupmagazine.it/index.php/2024/01/30/rent2cash-arriva-la-startup-che-anticipa-per-tre-anni-laffitto-ai-proprietari/ | Startup Magazine | 2024-01-30 |
| S91 | https://play.google.com/store/apps/details?id=com.laugramaglia.home_flow ; https://play.google.com/store/apps/details?id=com.DamoTools.homeflow | Google Play (unrelated "Home Flow"/"HomeFlow" household apps; name collisions) | n.d. |
| S92 | https://wunderflats.com/page/referral/en-landlords | Wunderflats (referral page only) | n.d. |
| S93 | https://rentola.com/for-rent/australia | Rentola (aggregator page only) | n.d. |

---

*End of dossier. Follow-up pass required for §2.27–2.30 and for app-store data once a non-sandboxed browser is available.*

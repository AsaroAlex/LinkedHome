# 05 — Market opportunity: Italian long-term residential rentals and launch-city decision matrix

> **Research review — 2026-10-02:** This dossier contains inherited evidence and provisional recommendations. Except for the specifically logged checks in [09](09-sources.md), source access has not been repeated in this continuation. [01](01-market-landscape.md) reconciles conclusions; [08](08-product-opportunities.md) records hypotheses and boundaries; [07](07-legal-privacy-risks.md) controls legal caveats. These documents supersede conflicting implementation/pricing suggestions below. Current primary corrections and access limits are recorded in [the recheck](evidence/primary-recheck.md); the current gate decision is in [review 02](../reviews/review-02-independent-research.md).

| | |
|---|---|
| **Project** | LinkedHome — reverse rental marketplace, Italy-first (PLAN.md Phase 3) |
| **Research date / access date for all sources** | **2026-10-02** |
| **Author role** | PropTech market analyst / data researcher (research stream "Italian market data + launch-city matrix") |
| **Status** | Draft v1 — ready for Reviewer pass (`docs/reviews/review-01-research.md`) |
| **Labels used** | **FACT** = figure as published by the cited source · **HYPOTHESIS** = inference from facts, falsifiable · **ASSUMPTION** = working value not retrieved this session, must be verified |

## 0. Method and limitations (read first)

1. All figures below were collected on 2026-10-02 through 45 web-search passes targeting primary publishers (ISTAT, Agenzia delle Entrate/OMI, Eurostat, Banca d'Italia, Ministero dell'Interno, Ministero del Turismo, Comune di Bologna/Milano, universities) and the two dominant portals' research units (Immobiliare.it Insights, Idealista Ufficio Studi), plus Nomisma/CRIF, SoloAffitti, Tecnocasa, UDU/SUNIA, UNAR, Polizia Postale.
2. **Limitation:** the session's egress policy denied every direct page fetch (immobiliare.it, idealista.it, istat.it, bancaditalia.it, agenziaentrate.gov.it, ec.europa.eu, interno.gov.it, comune portals and all secondary press were all returned `EGRESS_BLOCKED`). Every number is therefore taken from the search engine's digest of the cited page, **not from the opened page**. Each figure is tagged FACT only in the sense "reported by [S#]"; the Reviewer pass must open the PDFs listed in §E before any number is used in investor material.
3. Where two digests disagree (e.g. contract-type counts in the OMI Rapporto 2025 vs 2026), both are shown and the discrepancy is logged in §E.
4. City-level data for the second-tier candidates (Bergamo, Brescia, Verona, Genoa, Trieste, Bari, Pisa, Parma, Modena, Trento) is thin: their matrix scores carry **Low confidence** and are explicitly provisional.
5. No number in this document is invented. Where a value was not retrieved it is written **n/r** and listed in §E.

---

## A. National picture

### A1. Tenure, affordability and household structure

| Indicator | Value | Year | Label | Source |
|---|---|---|---|---|
| Share of population owning their home (Italy) | **75.9%** | 2024 | PRIMARY: population, all income groups / household types | [R-EU](evidence/primary-recheck.md#r-eu) |
| Share of population renting | **24.1%** | 2024 | PRIMARY: population, not households | [R-EU](evidence/primary-recheck.md#r-eu) |
| Split market-rate vs reduced/free rent | **16.0% / 8.1%** of population | 2024 | PRIMARY: same dataset slice | [R-EU](evidence/primary-recheck.md#r-eu) |
| Housing-cost overburden rate, tenants at market price (share spending > 40 % of disposable income on housing) | **19.4 %** | 2024 | FACT | [S3] |
| Households living in owned homes (Agenzia delle Entrate / MEF) | "Tre famiglie su quattro" (≈ 75 %) | 2019 data | FACT | [S4] |
| Households renting by necessity (not choice) | **53.6 %** of tenants say renting is forced by insufficient resources to buy | 2025 | FACT | [S31] |
| Share of families "in affitto per periodi superiori ai sei mesi" | rose from 3.3 % to 5.5 % in one year (wording ambiguous in digest — likely "searching for > 6 months") | 2025 | FACT (wording to verify) | [S31] |

**Reading:** Italy is a ~75/25 owner/renter country, but the renter quarter is under measurable stress: one in five market-rate tenants is overburdened [S3] and more than half rent because they cannot buy [S31]. This is the tenant-side pain the product monetises.

### A2. Registered residential lease contracts (Agenzia delle Entrate – OMI)

Source: *Rapporto Immobiliare* residential editions (2025 edition = 2024 data; 2026 edition = 2025 data), as digested by [S8], [S9]; quarterly *Statistiche OMI Residenziale* [S7].

| Metric | 2024 (Rapporto 2025) | 2025 (Rapporto 2026) | Label |
|---|---|---|---|
| Real-estate units with a **new registered lease, all uses** | **1,610,779** | n/r | FACT [S9] |
| Of which **residential-use units** (incl. pertinenze) | ≈ 1.3 M (≈ 80 % of total), **-0.6 %** YoY | **1,289,369**, **+1.2 %** YoY | FACT [S8][S9] |
| **Dwellings** (abitazioni only) with a new contract | ≈ 1.04 M (implied) | **> 1.0 M, +1.5 %** YoY | FACT [S8] |
| Ordinary long-term (4+4, "canone libero") | 409,986 units ≈ 39.5 % of dwellings; **-3.3 %** (2024) | share n/r; **-2.4 %** YoY | FACT, counts to verify [S8][S9] |
| Ordinary transitory (transitorio, 1-18 months) | 289,422 units ≈ 28.6 %; **+2.0 %** | **300,003 units = 28.9 %; +2.3 %** | FACT [S8][S9] |
| Agreed rent (3+2 "canone concordato") | number **+1.0 %**, annual rent **+4.9 %** | **257,636 units = 24.8 %; +6.0 %** | FACT [S8][S9] |
| Student contracts (contratti per studenti) | growing in number and rent; **+10 %** for partial-unit (room) rentals | growing (no count in digest) | FACT [S9] |

**Trend 2019 → 2025:** only the 2024 (-0.6 %) and 2025 (+1.2 %) residential deltas were retrievable; the 2019-2023 series must be pulled from the OMI PDFs (see §E). **Structural fact:** the long-term 4+4 segment has now shrunk two years running while transitory, concordato and student contracts grow — the market is migrating to shorter, more frequently re-matched tenancies, which raises the number of matching events per dwelling per year (HYPOTHESIS: good for a matching marketplace's transaction frequency).

**Note on the digest discrepancy:** the 2024 count "289,422 transitory" and the 2025 count "300,003 (+2.3 %)" are not arithmetically consistent (+3.7 %); one of the two base years is likely mis-attributed in the digest. Flagged in §E.

### A3. Demand vs supply indicators from the two national portals (chronological)

| Period | Immobiliare.it Insights | Idealista Ufficio Studi | Label |
|---|---|---|---|
| Q1 2025 | Rents **+8.1 %** YoY; "more homes on the market, demand pressure slightly down" [S10] | **+2.6 %** QoQ, **+7.8 %** YoY [S22] | FACT |
| H1 2025 | Rents **+5.5 %** H1 to **€14.3/m²**; supply had fallen **-50 % over six years** and is now **+18 % YoY**; demand **-9 %** vs six months earlier, **-21 % in large cities**; listing stock **+15.6 %** [S11][S12] | Q2 2025: **+4.6 %** QoQ, **+5.5 %** YoY [S21]; May 2025: **+5.9 %** YoY [S19 family] | FACT |
| Q2 2025 | Rents **+6.6 %** YoY "but less than previous years"; Centre **+9.4 %**, North-West **+3.8 %** (most expensive area at **€16.3/m²**), North-East **+3.6 %** [S11] | — | FACT |
| Q3 2025 | "Purchase demand up, **rental demand down** in Q3 2025" [S13]; Milan "lieve tregua" on rents [S18] | Oct 2025 city ranking: Milano **€23.3**, Firenze **€22.9**, Venezia **€21.9**, Roma **€18.6**, Bologna **€17.7**, Napoli **€15.6** €/m² [S25] | FACT |
| FY 2025 | — | National **+2.5 %** YoY to **€14.2/m²**, but **Q4 -4.0 %**, Dec **-0.5 %** MoM: "stop alla crescita dopo quattro anni di rialzi" [S19]. Milan **€22.8 (-2.3 %)**, Bologna **€17.1 (-7.7 %)**, Firenze **€22.6**, Venezia **€21.6** [S19][S20] | FACT |
| Q1 2026 | Time-to-rent lengthening (see A4) | Rental searches **-9.4 %**, purchase searches **+22.5 %** [S24]; Milan relative-demand index **6.9 vs national 12 (-19.2 %)** [S24] | FACT |
| Banca d'Italia agent survey | Q2 2025: ~**half** of agents report rent increases vs **7 %** decreases; average discount on asking rent **2.8 %** (highest since early 2022) [S30]. Q4 2025 (pub. 26-02-2026): rents still rising but slower; **short-term rentals remain a major driver of rent growth in many cities**; agents expect further increases in early 2026 [S29] | | FACT |
| Nomisma–CRIF–Confabitare | Rents **+3.5 %** in 2025; "offerta insufficiente rispetto alla domanda"; growth driven by stock reduction, short-term rentals, household budgets [S31] | | FACT |

**Reading (HYPOTHESIS):** 2022-2024 was a supply-starved market (listings -50 % in six years). 2025-2026 is a *normalising* market: listings are returning (+15-18 %), rent growth has stalled nationally and turned negative in Milan and Bologna, and time-to-rent is lengthening. For a two-sided marketplace this is favourable: landlords again have to *compete* for good tenants, so a tool that surfaces vetted tenant profiles has a buyer, whereas in 2023 a landlord with 100 applicants needed nothing.

### A4. Time to rent, speed and contacts per listing

| Indicator | Value | Period | Source / Label |
|---|---|---|---|
| National average **time-to-rent** (Immobiliare.it) | **2.8 months**, up **+10 %** from 2.6 | H1 2026 vs H1 2025 | FACT [S14] |
| Milan time-to-rent | **2.6 months** (from 2.3; **+12 %**) | H1 2026 | FACT [S14][S15] |
| Rome | **66 %** of listings rented within 90 days (-0.4 pp) | H1 2026 | FACT [S14] |
| Share of homes rented **within 24 h** — Italy | **13 %** ("affitti lampo in calo") | Q1 2025 | FACT [S16] |
| Share rented within 24 h — Milan | **33 %** | Q1 2025 | FACT [S16] |
| Bologna | "tra le città più fast" (ranked among fastest; value n/r) | 2025 | FACT (qualitative) [S17] |
| SoloAffitti network: average time to let | "poco più di un mese" | 2025 | FACT [S33] |
| SoloAffitti: average tenant permanence | **26.4 months** (24.1 in 2023) | 2025 | FACT [S33] |
| Idealista **relative demand index** (contacts per listing, e-mail + shares) — Bologna | **11.9** vs national **9.7** | Q4 2025 | FACT [S23] |
| Idealista relative demand index — Milan | **6.9** vs national **12** (-19.2 %) | Q1 2026 | FACT [S24] |
| Absolute "contacts per listing" counts for Milan/Bologna | **n/r** (Idealista publishes the index, not raw counts in the digests) | — | GAP |

### A5. Students and fuorisede

| Indicator | Value | Source / Label |
|---|---|---|
| Fuorisede (out-of-town) university students, Italy | **≈ 900,000** (UDU census) | FACT [S48] |
| Beds in student residences available to them | **46,193** (≈ 5 % of fuorisede) | FACT [S48] |
| Share of surveyed fuorisede who found a place in a studentato | **17 %** (survey respondents) / **4.9 %** (Skuola.net headline on total fuorisede) | FACT [S48] |
| National bed shortage estimate | **≈ 130,000 beds missing** | FACT [S47] |
| PNRR target | 60,000 new beds; operators say unreachable, propose 20,000 | FACT [S47][S48] |
| Average monthly cost of a student room, Italy | **€446.50** (2025); **> €500** in Milan, Bologna, Rome | FACT [S49][S48] |
| Main difficulty cited by fuorisede | **52 %**: finding an affordable solution | FACT [S48] |
| Bonus affitto fuorisede 2025 | +€9.5 M added by the Senate | FACT [S48] |
| Share of all rental contracts signed by students — Bologna | **30.6 %** (Tecnocasa network) | FACT [S52] |

"Caro affitti" tent protests (Milan Politecnico, Bologna, Rome, Padua, Florence) since May 2023 are the public face of the figures above; the 2025 reports [S47][S48] show no structural improvement.

### A6. Young workers and internal migration (ISTAT)

| Indicator | Value | Source / Label |
|---|---|---|
| Young Italian graduates (25-34) lost by the Mezzogiorno, 2019-2025 | **-150,000** (-122,000 to Centre-North, -28,000 abroad) | FACT [S39] |
| Net gain of the North from the South, same cohort | **≈ +108,000** (Centre +14,000) | FACT [S39] |
| 2024 alone: young qualified movers to Centre-North / abroad | **23,000 / > 8,000** | FACT [S39][S40] |
| Destination concentration | "for every Southern graduate choosing abroad, **four choose Milan, Bologna or Rome**" | FACT (press paraphrase of ISTAT) [S39] |
| Milan residents end-2025 | **1,399,079**, of which **295,805 foreign (≈ 21 %)** | FACT [S41] |
| Rome | **2,746,984** residents, **354,922 foreign (12.9 %)** | FACT [S42] |
| Turin | **856,745** residents, **137,198 foreign (16.0 %)** | FACT [S42] |

### A7. Landlord structure, empty stock and short-term rentals

| Indicator | Value | Year | Source / Label |
|---|---|---|---|
| Dwellings owned by natural persons | **32.7 M = 92.8 %** of all cadastral dwellings; 7.2 % owned by companies/entities | 2020 | FACT [S6] |
| Residential units in the leased-dwellings database | **3.6 M**, of which **≈ 3.2 M (87 %) leased by natural persons**, ≈ 0.5 M (13 %) by companies/entities | 2023 ed. | FACT [S5] |
| Number of individual landlords (locatori persone fisiche) | **4.3 M** (slightly down vs 2014) | 2016 | FACT [S5] |
| Leased units per individual landlord | **WITHHELD**: 3.2M units / 4.3M persons mix reference years and populations; cannot establish mean or mode | — | No one-flat-landlord inference |
| Total dwellings (ISTAT census) | **35,271,829** (2021) → **35,610,473** (2023) | 2021/2023 | FACT [S37][S38] |
| Non-occupied dwellings | **9,581,772 = 27.2 %** (2021) → **9,558,791 ≈ 26.8 %** (2023); Islands 34.9 %, South 32 %, North-West 26 %, North-East 23.1 % | 2021/2023 | FACT [S37][S38] |
| SoloAffitti claim: empty homes | "8 milioni di case sfitte", owners deterred by **morosità and uncertain recovery times** | 2025 | FACT (industry estimate) [S33] |
| Short-term rental structures in the national database (BDSR) | **686,645 registered; 610,686 CIN issued (88.9 %)** | 23-09-2025 | FACT [S43] |
| Airbnb listings per city (Inside Airbnb, 2025-26 scrapes) | Roma **34,409** · Milano **≈ 22,000** · Firenze **11,138** · Napoli **7,520** · Bologna **3,895**; density comparisons withheld: reported Roma/Milano densities do not match the populations above, and geography/period compatibility is unverified; the five largest tourist cities hold **≈ 100,000** apartments (Aug 2026) | 2025-26 | FACT [S44] |
| Banca d'Italia agents: short-term rentals | "rilevanza elevata in molte città", significant driver of rent growth | Q4 2025 | FACT [S29] |

**Reading:** natural persons appear important in the inherited figures, but neither the modal landlord holding nor a Western-Europe fragmentation ranking is established. Manual screening and agency aggregation remain research hypotheses; do not derive city fragmentation scores from the invalid ratio.

### A8. Risk and trust

**Evictions (Ministero dell'Interno, "Gli sfratti in Italia – anno 2024", published Nov 2025, as reported by [S34][S35])**

| Metric | 2024 | Label |
|---|---|---|
| Provvedimenti esecutivi di sfratto emessi | **40,158** (+2 % vs 2023) | FACT |
| Richieste di esecuzione | **81,054** | FACT |
| Sfratti eseguiti (with ufficiale giudiziario) | **21,337** | FACT |
| Cause: morosità / necessità del locatore / finita locazione | **≈ 30,000 (≈ 75 %) / ≈ 2,000 / > 8,000** | FACT |
| Regions | Lombardia **6,574** (1st), then Lazio, Campania | FACT |
| Provinces | Roma **5,286**, Napoli **3,159**, Torino **2,350**, Milano **1,726** (of which **1,317 = 76 % morosità**) | FACT |
| Per 1,000 renting families (SoloAffitti elaboration) | Roma **16**, Torino **10**, Napoli **9**, Bologna **6**, Milano **5**; Imperia prov. **30.2**; Turin = province with most evictions relative to population | FACT |
| Daily rate | **WITHHELD**: inherited 153/day implies 55,845/year, inconsistent with ≈30,000 arrears orders and 40,158 total orders | Categories/period must be reconciled before use [S35] |

**Eviction duration** (legal-practice sources, 2026) [S36]: best case (no opposition) **2-4 months**; typical **6-12 months** in efficient courts, **18-24 months** in large cities; worst case with opposition and forced execution **3-4 years**; in Milan/Rome/Naples **3-12 months** between validation hearing and actual release; "termine di grazia" adds ~4 months, humanitarian deferrals +2-3 months.

**Landlord/tenant arrears experience (SoloAffitti 2025 survey)** [S33]: 60 % of tenants always paid on time, 31 % on time with difficulty, 3 % currently late/in arrears; but **28 % of landlords experienced delays and 8 % morosità** — the perception gap that makes landlords over-screen.

**Rental scams** [S57][S73]: Polizia Postale handled **> 14,000** online-fraud cases in the first eleven months of the reporting year, **> 60 %** of them e-commerce frauds including "phantom" rental listings, **≈ €9 M** stolen, **> 2,500** persons reported; Guardia di Finanza Rome dismantled a ring with **1,600** fake holiday-rental frauds (€575 k). No official count specific to long-term rental scams was retrievable (GAP).

**Discrimination** [S56]: a UNAR / Università degli Studi di Milano field experiment found that, with identical economic profile, an applicant with an **Arab name receives 35 % fewer replies** to rental ads than an Italian name; exclusion increases with skin colour, perceived religion, number of children. ASGI documents "no stranieri, no animali" ads, especially in the North; refusing housing on grounds of nationality is unlawful discrimination (D.Lgs. 215/2003; art. 43 TU Immigrazione). Portal policy statements on removal of discriminatory ads: **n/r** (GAP).

**Guarantee products** [S58][S33]: security deposit present in **88 %** of contracts; bank/insurance **fideiussione only in 14-20 %**; in Milan **65 %** of landlords say they scrutinise the tenant's financial stability but only **11 %** require a bank guarantee. Guaranteed-rent intermediaries (Zappyrent "Protezione": landlord paid on the 12th of each month regardless; fee 100 % of first month + 8 %/month) [S65] exist but no uptake figure was retrievable.

### A9. Regulatory context relevant to the product (in force as of 2026-10-02 unless stated)

| Topic | Rule | Status | Source |
|---|---|---|---|
| Contract types | L. 431/1998: **4+4** canone libero; **3+2** canone concordato (rent set by local *accordi territoriali*); **transitorio** 1-18 months; **studenti universitari** 6-36 months | In force | [S8][S60] |
| Security deposit | Max **3 months' rent**, bears legal interest (art. 11 L. 392/1978); for free-market residential leases parties may agree more after L. 431/98 repealed art. 79 | In force | [S59] |
| Registration | Within **30 days** via Modello RLI (Agenzia delle Entrate); unregistered contracts are void and expose landlord to sanctions | In force | [S60] |
| Cedolare secca | **21 %** free-market; **10 %** concordato in high-tension municipalities (list of *comuni ad alta tensione abitativa* — includes all candidate cities); short-term: **21 % on one unit, 26 % from the second** | In force 2026 | [S61] |
| Short-term rentals, business threshold | Legge di Bilancio 2026 lowered the non-business ceiling from **4 to 2** apartments: from the third unit the activity is presumed entrepreneurial (P.IVA) | In force 2026 (digest; verify article number) | [S61] |
| Short-term 26 % on all units | **Proposed** in the 2026 budget draft, **not enacted** (21 % first unit retained) | Dropped | [S61] |
| CIN (Codice Identificativo Nazionale) | Mandatory since **1 Jan 2025** for every short-let/tourist unit; must appear in listings; fines **€500-8,000** | In force | [S43] |
| Agency fee | **No statutory tariff**; market practice **one month's rent + 22 % VAT from each side** (some agencies quote 10-15 % of annual rent) | Custom | [S62] |
| Evictions reform ("sfratti veloci") | DDL approved by Council of Ministers **30-04-2026**: release decree within **15 days**, daily penalty for overstaying, new *ingiunzione di rilascio*; **not yet law** (parliamentary passage pending in Sept 2026) | Pending | [S63] |
| Piano Casa Italia | Published in Gazzetta Ufficiale **03-07-2026**; measures on social/affordable rental supply and concordato incentives (details n/r) | In force (framework) | [S63] |
| Anti-discrimination | D.Lgs. 215/2003, art. 43-44 TU Immigrazione: refusal on nationality/ethnicity unlawful; applies to landlords **and** to any platform that filters tenants | In force | [S56] |
| Local: Bologna | Renewed metropolitan *accordo territoriale* (same rent bands); Comune allocates **€1.3 M** to incentivise new concordato contracts; "Piano per l'Abitare"; Unibo *Sportello affitti* with registered-listing service | In force 2025-26 | [S53][S54][S55] |

---

## B. City profiles

### B1. Comparison table (latest retrievable values; n/r = not retrieved this session)

| City | Pop. (comune) | Foreign share | Univ. students / fuorisede | Asking rent €/m² (Idealista) | YoY rent | Demand pressure | Time-to-rent / speed | Evictions 2024 (prov.; per 1,000 renting fam.) | Airbnb listings (per 100 res.) | Named competitors present | Local policy signal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Milan** | 1,399,079 (end-2025) [S41] | 21 % [S41] | n/r (ASSUMPTION: largest in Italy; verify MUR) | **22.8** (Dec-25); 23.3 (Oct-25) [S19][S25] | **-2.3 %** 2025 [S20] | Idealista Q4-25 index **7.8 vs 9.7** national [S23]; different-period Q1-26 excerpt remains unverified [S24]; but 33 % let in < 24 h (Q1-25) [S16] | **2.6 mo** (+12 %) [S14] | 1,726; **5**/1,000 [S35] | ≈ 22,000 (density withheld) [S44] | **Homeflow**, Zappyrent, Joivy, Habyt, +6,000 coliving beds by 2026 [S64][S65][S66] | Startup capital: 72 % of Lombardy's innovative startups [S67] |
| **Bologna** | n/r | n/r | **> 90,000** students; **57 % fuorisede**; new enrolments 26,748 (+3 %), out-of-region **-6 %** [S51] | **17.1** (Dec-25); 17.7 (Oct-25) [S19][S25] | **-7.7 %** 2025 [S19] | Idealista index **11.9 vs 9.7** nat. (Q4-25) — above national, below e.g. Rome 19 and Turin 14.1 [S23] | "among the fastest" [S17] | n/r; **6**/1,000 [S35] | 3,895 [S44] | Zappyrent, Joivy; Homeflow operations unverified | 30.6 % of contracts to students [S52]; €1.3 M concordato incentive, Piano per l'Abitare, 3,100 beds + 2,300 pipeline [S53][S54] |
| **Rome** | 2,746,984 [S42] | 12.9 % [S42] | n/r (ASSUMPTION: largest student body after Milan) | **18.6** (Oct-25) [S25] | n/r | n/r | 66 % let within 90 days [S14] | **5,286**; **16**/1,000 (highest) [S34][S35] | **34,409** (density withheld) [S44] | Zappyrent, Joivy | — |
| **Turin** | 856,745 [S42] | 16.0 % [S42] | n/r | **11.5** (Dec-25) [S26] | n/r (FQ May-26: "crescono anche Bologna e Torino" [S28]) | n/r | n/r | **2,350**; **10**/1,000; highest relative to population [S34][S35] | n/r | Zappyrent, Joivy; +4,600 coliving beds by 2026 [S66] | — |
| **Florence** | n/r | n/r | n/r | **22.6** (Dec-25); 22.9 (Oct-25) [S19][S25] | n/r | n/r | n/r | n/r | **11,138 (3.03 — highest density)** [S44] | Zappyrent, Joivy | STR saturation [S44] |
| **Padua** | n/r | n/r | n/r (ASSUMPTION: large; verify UniPD) | **14.1** centre [S27] | **+4.5 %** in Q3-25 (among fastest-rising) [S27] | n/r | n/r | n/r | n/r | none of the named players confirmed | — |
| **Naples** | n/r | n/r | n/r | **15.6** (Oct-25) [S25] | n/r | n/r | n/r | **3,159**; **9**/1,000 [S34][S35] | 7,520 [S44] | Zappyrent (4 listings) | — |
| Bergamo / Brescia | n/r | n/r | n/r | n/r | n/r | n/r | n/r | n/r | n/r | **Homeflow proposed first cities** [S64] | 2nd/3rd startup hubs of Lombardy [S67] |
| Verona, Genoa, Trieste, Bari, Pisa, Parma, Modena, Trento | n/r | n/r | n/r | n/r | n/r | n/r | n/r | n/r | n/r | Zappyrent in Genoa [S65] | — |

Average monthly rents (SoloAffitti network, 2025): Italy **€680**, Milan **€1,278**, Rome **€999** [S33]. Typical 1-bed/2-bed asking rents per city were not retrievable as a table (GAP, §E).

### B2. City notes

**Milan.** Comparable Q4-2025 demand index 7.8 is below national 9.7. Current Homeflow operations, landlord acquisition cost and paid demand are unresolved; no inference that Milan should automatically be excluded.

**Bologna.** Research catchment candidate. Verified Q4-2025 demand index 11.9 is above 9.7 national, below Rome/Turin and many smaller cities. Historical student, rent, vacancy and municipal-channel figures need current primary confirmation. Institutional existence would not prove acquisition access or free tenant acquisition.

**Rome.** Largest absolute stock and the biggest short-term-rental drain (34,409 listings), highest eviction intensity (16/1,000, 5,286 orders) and the slowest, most sprawling market (66 % let within 90 days). Rent €18.6/m². Operationally hard for a density-dependent marketplace (HYPOTHESIS). **Scarce side: trustworthy supply (STR displacement + morosità fear).**

**Turin.** Cheapest big city (€11.5/m²), 16 % foreign, large technical universities, 4,600 coliving beds coming. Highest eviction rate relative to population (10/1,000; 2,350 orders) — i.e., the landlord-side fear of arrears is most acute here, which is both the problem a screening product solves and a signal of lower tenant solvency. **Scarce side: landlord trust rather than physical supply.**

**Florence.** Second-most expensive city (€22.6/m²) with the highest Airbnb density in Italy (3.03 per 100 residents). The long-term stock is structurally cannibalised; demand (students + expats) is strong but the supply side is the binding constraint. **Scarce side: supply, extremely.**

**Padua.** Mid-priced (€14.1/m² centre) but among the fastest-rising cities in Q3 2025 (+4.5 %), large university, compact, within the Veneto employment basin, and with no named PropTech competitor confirmed. Data thin (students, evictions, Airbnb all n/r). **Scarce side: supply in the September student peak (HYPOTHESIS).**

**Naples.** €15.6/m², 3,159 eviction orders (9/1,000), 7,520 Airbnb units, net out-migration of graduates. High informality in contracts is widely reported but no figure was retrieved. **Scarce side: formal, trustworthy supply.**

**Bergamo / Brescia.** Homeflow's founding territory (Brescia Innovation Hub) and launch cities; Lombardy's 2nd/3rd startup hubs. Entering here means fighting the only direct reverse-matching competitor on its home ground with thin data.

**Pisa, Trento, Parma, Modena, Verona, Trieste, Bari, Genoa.** All plausible second-wave cities (Pisa and Trento for student density per capita; Parma/Modena for the Emilia employment corridor adjacent to Bologna; Verona for Veneto; Trieste for its international/research community; Bari for the South; Genoa cheap but ageing). No city-level figures retrieved; scores in §C are Low-confidence placeholders.

---

## C. Launch-city decision matrix

### C1. Criteria and weights

| # | Criterion | Weight | What it measures | Main evidence used |
|---|---|---|---|---|
| 1 | Rental demand intensity | 15 | Contacts per listing, time-to-rent, rent-growth momentum | A3, A4, B1 |
| 2 | Turnover / churn | 10 | Share of transitory/student contracts, tenant permanence, mobility | A2, A5, A6 |
| 3 | Student population & fuorisede | 10 | Absolute and relative student demand | A5, B1 |
| 4 | Young-professional inflow | 10 | Graduate migration destinations, foreign share, employers | A6 |
| 5 | Rent level / affordability pressure | 8 | Tenant affordability pressure; does not measure landlord willingness to pay | A1, B1 |
| 6 | Competition (inverse) | 10 | Presence of Homeflow, Zappyrent, Joivy/Habyt, coliving pipeline, agency density | A7, B1 |
| 7 | Property availability | 8 | Listing volumes, supply trend, STR displacement | A3, A7 |
| 8 | Landlord fragmentation | 7 | Private-landlord reachability; one-flat distribution unverified | A7 |
| 9 | Ability to acquire both sides | 8 | Institutional funnels (universities, Comune programmes), community density | B2 |
| 10 | CAC risk (inverse) | 7 | Advertising saturation, competitor spend, noise | B1 |
| 11 | Network-effect density / compactness | 7 | Geographic compactness, single-market liquidity | B2 |
| | **Total** | **100** | | |

### C2. Historical scores (1 = worst, 5 = best) — not a launch recommendation

The 17 totals and four weight scenarios are arithmetically correct. Input validity is not: Homeflow status, landlord fragmentation, payer WTP and institutional access are unresolved or corrected. Preserve this table as an audit trail, not current evidence of the best city. A new launch decision needs comparable reachable vacancies, observed landlord participation and uncertainty in inputs as well as weights. Bologna is a research catchment hypothesis only.

Confidence: **H** = three or more retrieved city-specific facts; **M** = one or two; **L** = none, scored by analogy (must be re-scored after §E gaps are closed).

| City | Conf. | 1 Demand | 2 Turnover | 3 Students | 4 Young prof. | 5 Rent pressure | 6 Competition (inv.) | 7 Availability | 8 Fragmentation | 9 Both sides | 10 CAC (inv.) | 11 Density | **Weighted (max 5)** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Bologna** | H | 5 — index 11.9 vs 9.7 [S23]; "fast" [S17] | 5 — 57 % fuorisede, 30.6 % contracts to students [S51][S52] | 5 — > 90k students [S51] | 4 — named top-3 destination for Southern graduates [S39] | 4 — €17.1/m², rooms 2nd most expensive [S19][S11] | 3 — Zappyrent, Joivy; Homeflow operations unverified [S65][S66] | 3 — small stock; rents -7.7 % = supply returning [S19] | 4 — student lets by small private owners (HYPOTHESIS from [S52]) | 5 — Unibo sportello, Piano Abitare, accordo territoriale [S53-55] | 4 — institutional access and lower CAC are untested hypotheses | 5 — compact, bike/walk city | **4.32** |
| **Padua** | M | 4 — +4.5 % Q3-25 among fastest [S27] | 4 — student city (ASSUMPTION) | 4 — large university (ASSUMPTION) | 3 — Veneto employment basin (ASSUMPTION) | 3 — €14.1/m² [S27] | 4 — no named player confirmed | 3 — n/r | 4 — n/r (national pattern [S5]) | 4 — single university, compact | 4 — low competitor spend | 4 — compact | **3.74** |
| **Pisa** | L | 4 | 4 | 4 — very high students-per-resident (ASSUMPTION) | 1 — weak employer base | 3 | 4 | 2 — tiny stock | 4 | 4 | 4 | 5 | **3.53** |
| **Milan** | H | 3 — historical mixed-period index (superseded above), TTR 2.6 mo [S24][S14]; 33 % < 24 h [S16] | 5 — transitory/expat heavy, 21 % foreign [S41] | 5 — largest (ASSUMPTION) | 5 — primary graduate destination [S39] | 5 — €22.8/m², €1,278 avg [S19][S33] | 1 — Homeflow + Zappyrent + Joivy + Habyt + 6,000 coliving beds [S64-66] | 4 — large stock, listings rising [S11] | 3 — more agency/institutional share (HYPOTHESIS) | 3 — dense but noisy | 1 — most contested ad market | 3 — large metro | **3.50** |
| **Trento** | L | 4 | 3 | 3 | 3 | 3 | 4 | 2 — tight stock | 4 | 3 | 4 | 4 | **3.38** |
| Parma | L | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 4 | 3 | 4 | 4 | **3.31** |
| Modena | L | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 4 | 3 | 4 | 4 | **3.31** |
| **Florence** | M | 4 — €22.6/m² [S19] | 4 | 3 | 2 | 5 | 3 — Zappyrent, Joivy | 1 — Airbnb 3.03/100 [S44] | 4 | 3 | 3 | 4 | **3.29** |
| Verona | L | 3 | 3 | 3 | 3 | 3 | 4 | 2 — tourism STR | 4 | 3 | 4 | 4 | **3.23** |
| **Turin** | M | 3 — €11.5/m² [S26] | 3 | 4 | 3 — 16 % foreign [S42] | 2 — cheap | 3 — Zappyrent, 4,600 coliving beds [S66] | 4 — cheap, abundant | 4 | 3 | 3 | 3 | **3.17** |
| **Rome** | M | 3 — 66 % < 90 days [S14] | 3 | 5 | 3 | 4 — €18.6 [S25] | 3 | 4 — but 34k STR [S44] | 4 | 2 — sprawl | 2 | 1 | **3.14** |
| Trieste | L | 3 | 3 | 3 | 2 | 2 | 4 | 3 | 4 | 3 | 4 | 4 | **3.13** |
| **Naples** | M | 3 — €15.6 [S25] | 3 | 4 | 1 — net outflow [S39] | 3 | 4 | 3 | 4 | 2 | 3 | 3 | **2.99** |
| Bergamo | L | 3 | 3 | 2 | 3 | 3 | 2 — Homeflow turf [S64] | 3 | 4 | 3 | 3 | 4 | **2.94** |
| Brescia | L | 3 | 3 | 2 | 3 | 3 | 2 — Homeflow HQ [S64] | 3 | 4 | 3 | 3 | 4 | **2.94** |
| Bari | L | 3 | 3 | 4 | 1 | 2 | 4 | 3 | 4 | 2 | 3 | 3 | **2.91** |
| Genoa | L | 2 | 2 | 3 | 1 | 2 | 3 — Zappyrent [S65] | 4 | 4 | 2 | 3 | 3 | **2.54** |

Sensitivity (original scratchpad not present in this checkout; all totals and the scenarios below independently recomputed from this table on 2026-10-02, with weights renormalised in each scenario; see 01 §4): halving the competition and CAC weights (i.e., assuming competition barely matters) gives Milan 3.73 vs Bologna 4.40; setting the student weight to zero gives Milan 3.33 vs Bologna 4.24; equal weights for all eleven criteria give Bologna 4.27, Padua 3.73, Milan 3.45; even a deliberately Milan-favouring scenario (young-professional, rent-pressure and availability weights doubled, competition and CAC removed) still gives Bologna 4.31 vs Milan 4.17. Bologna's lead survives every reweighting tested; the ranking is driven by the scores, not by the weights.

### C3. Recommendation — single-city beachhead in Bologna, with Padua pre-wired as city two (Emilia–Veneto corridor), Milan deferred

**Strategy: single city first (Bologna), second city (Padua) only after a liquidity threshold, no simultaneous two-city launch.** Reasons:

1. **Density is a hypothesis to test.** Bologna may permit geographically focused learning, but neither cheap acquisition nor liquidity with a few hundred landlords is established. Compare reachable current vacancies and actual participation before selecting a launch city.
2. **Supply is the scarce side and the city already pays landlords to list** (€1.3 M concordato incentive, empty-homes measure [S54]). A product that de-risks tenants for one-flat landlords is aligned with public policy; co-marketing with the Comune/Unibo is plausible (HYPOTHESIS to test in discovery interviews).
3. **No second city is selected.** Padua and other candidates require comparable evidence; proximity or score arithmetic does not establish a defensible corridor.

**Arguments AGAINST Milan as launch city (why it is deferred, not excluded):**
- Homeflow advertises a similar idea but currently says pre-launch; operational competition is unverified [R-HF](evidence/primary-recheck.md#r-hf); Zappyrent's guaranteed-rent model is strongest there [S65]; Joivy/Habyt and 6,000 new coliving beds absorb the mobile tenant [S66].
- Agency share and higher Milan CAC are hypotheses; no comparable measured acquisition-cost evidence was retrieved.
- The cycle has turned: rents -2.3 % (2025), demand index -19 %, time-to-rent +12 % [S20][S24][S14]. Landlords now have more time to find tenants, which lowers urgency for a screening tool exactly where it is most contested.
- Low eviction rate (5/1,000) means the "arrears-fear" value proposition is weaker than in Turin/Rome/Naples.

**Milan trade-off hypothesis:** scale may matter, but rent levels do not establish payer WTP. No city-three schedule, cheaper Bologna acquisition or weakness of Homeflow in relocation is verified.

**Other candidates:** Turin and Rome need comparable reachable-supply and participation research; no solvency comparison or automatic second-wave classification is adopted.

### C4. Which side is scarce, city by city (determines which side to subsidise)

| City | Scarce side | Evidence | Implication |
|---|---|---|---|
| Bologna | Supply is a hypothesis | Q4-2025 index above national, not highest; institutional access unverified | Test reachable vacancies and repeat participation, not assumed free acquisition |
| Padua | **Supply** (seasonal, Sept-Oct) | +4.5 % rent momentum [S27] | Same as Bologna; pre-load landlords before September |
| Florence | **Supply** (structural) | Airbnb 3.03/100 residents [S44] | Landlord-first, position against STR hassle after 26 %/P.IVA rules [S61] |
| Rome | **Trustworthy supply** | 34,409 STR, 16 evictions/1,000 [S44][S35] | Guarantee/screening product has pull; density low |
| Turin | **Landlord trust** | 10 evictions/1,000 [S35] | Screening/guarantee is the hook; supply physically abundant (€11.5/m²) |
| Naples | **Formal supply** | 9/1,000 evictions; informality | Formalisation (registered contract, cedolare) as value prop |
| Milan | **Landlord attention** (not physical supply in 2026) | Listings +, demand index 6.9, TTR 2.6 mo, many intermediaries [S11][S24][S14] | Landlords must be won from agencies/Homeflow/Zappyrent; tenant side abundant |

### C5. Risks of the recommendation

| Risk | Likelihood | Mitigation |
|---|---|---|
| Bologna rent correction (-7.7 % in 2025) signals demand softening, not just supply return | Medium | Track Idealista demand index quarterly; threshold to pause: index below national average for two quarters |
| Market-size ceiling: Bologna's absolute volume limits GMV | High (certain) | Corridor expansion plan; investigate flat service pricing only after activity classification; no match/success fee recommendation |
| Fuorisede from other regions falling (-6 % in 2025 enrolments [S51]) | Medium | International students rising ("boom dall'estero") — product remains Italian-first with English prepared; validate accessibility across languages |
| Homeflow expands to Bologna before liquidity is reached | Medium | Speed; exclusive university/Comune partnerships; explainable-signals differentiation |
| Regulatory: being deemed an unlicensed *mediatore* (L. 39/1989) if charging a success fee | Medium | Legal stream (doc 07) to decide fee structure (SaaS/subscription vs success fee) |
| Anti-discrimination exposure of any matching score | High | Exclude protected attributes; explainability; audit logs (doc 07) |
| Numbers above are from digests, not opened PDFs | Certain | §E verification pass before external use |

---

## D. Implications for the product

1. **Test supply participation.** No modal one-flat holding or automatic exception for Milan is established. Compare landlord workflows and voluntary participation; concierge, fiscal and registration services are separate unapproved candidates.
2. **The tenant profile is the asset; sell its *verifiability*, not a score.** Landlords in Milan already check finances (65 %) but almost never get a guarantee (11 %) [S58]. Give them structured, explainable evidence (income band, contract type, employer category, references, deposit readiness, guarantor availability) rather than a single opaque number — this is both the differentiation vs Homeflow and the anti-discrimination safeguard (UNAR: Arab-name applicants get 35 % fewer replies [S56]).
3. **Design for high turnover.** 4+4 contracts are shrinking; transitory (28.9 %), concordato (24.8 %) and student contracts grow [S8]. Tenant permanence is ~26 months [S33]. Re-matching events are frequent — the product should retain both sides across moves (tenant profile persists; landlord relists in one click).
4. **Price against the agency fee, not against the portal.** Market custom is one month's rent + VAT from each side [S62]; on a €680 average rent (Bologna/Padua will be €600-900 for 1-2 beds — ASSUMPTION) the landlord's alternative costs €830 per let. This comparison is a pricing hypothesis, not willingness-to-pay evidence. No per-match/success fee is recommended; assess any flat service fee and regulated guarantee activity separately (07 §11).
5. **Guarantee partnerships as a phase-2 lever.** Only 14-20 % of contracts carry a fideiussione [S58]; a guarantee/insurance partner (not building it in-house) converts the screening signal into cash certainty, especially in Turin/Rome/Naples where eviction intensity is 9-16/1,000 [S35].
6. **Student-season operations.** In Bologna and Padua, demand peaks August-October; supply must be pre-loaded in June-July. The Unibo *Sportello affitti* and Comune Piano per l'Abitare are the distribution channels to approach [S53][S55].
7. **Legal requirements to investigate before modelling:** distinguish long-term and short-let rules; do not require CIN for all long-term homes. Verify contract, deposit and registration rules for the actual service. Exclude prohibited matching attributes and assess remaining proxy risks; no schema alone is discrimination-safe.
8. **Milan later, via a segment.** When entering Milan, lead with expat/relocation tenants (21 % foreign residents, English-speaking, poorly served by agencies and by Homeflow's Italian-first UX — HYPOTHESIS) rather than head-on.

---

## E. Open data gaps (to close in the Reviewer pass; all URLs in §F)

| # | Gap | Where to get it | Why it matters |
|---|---|---|---|
| G1 | Eurostat `ilc_lvho02` Italy 2024 exact split: owner / tenant market / tenant reduced-free | [S1] data browser | Tenure table A1 |
| G2 | OMI *Rapporto Immobiliare* residential PDFs 2020-2026: lease counts by contract type for 2019-2025 (resolves the 289,422 / 300,003 inconsistency) and the 8-city tables (Roma, Milano, Torino, Genova, Napoli, Palermo, Bologna, Firenze) | [S7][S8][S9] | Trend 2019→latest; city turnover proxy |
| G3 | Ministero dell'Interno "Gli sfratti in Italia 2024" PDF: provincial table incl. Bologna, Firenze, Padova, Genova, Bari; 2019-2023 series | interno.gov.it (blocked this session) [S34] | City risk scores |
| G4 | Idealista Q4 2025 / Q1 2026 relative-demand index for all capoluoghi (only Bologna and Milan retrieved) | [S23][S24] | Criterion 1 for Padua, Turin, Florence, Naples |
| G5 | Immobiliare.it Insights H1 2026 time-to-rent by city; Q1 2025 "affitti lampo" city table | [S14][S16] | Criterion 1 |
| G6 | Idealista Dec-2025 full capoluoghi rent table (Padova, Genova, Verona, Bari, Bergamo, Brescia, Trieste, Trento, Parma, Modena, Pisa) and YoY | [S19][S71] | Table B1 |
| G7 | Typical 1-bed / 2-bed monthly asking rents per city | Immobiliare.it mercato-immobiliare city pages / Idealista | Pricing model |
| G8 | Student counts and fuorisede share for Milan, Rome, Turin, Padua, Florence, Pisa, Naples, Trento, Parma, Modena | MUR *Portale dei dati dell'istruzione superiore*; university annual reports | Criterion 3 |
| G9 | Population (comune + città metropolitana) for all candidate cities, 1-1-2025 | ISTAT demo.istat.it [S76] | Table B1 |
| G10 | Share of renting households by city (Census 2021 "titolo di godimento" by comune) | ISTAT census warehouse | Criterion 1/5 |
| G11 | Inside Airbnb counts for Torino, Padova, Verona, Bergamo, Brescia, Trieste, Bari, Pisa, Parma, Modena, Trento | insideairbnb.com city pages [S44] | Criterion 7 |
| G12 | Agenzia Entrate quaderno on short-term rentals (city-level STR share of stock) | [S45] | Criterion 7 |
| G13 | Polizia Postale: long-term rental scam counts (separate from holiday lets), year of the 14,000-case figure | poliziadistato.it annual report | Trust narrative |
| G14 | Immobiliare.it / Idealista written policy on discriminatory listings | portals' terms | Compliance benchmark |
| G15 | Nomisma–CRIF Osservatorio Affitti 2025 full PDF (landlord guarantee demand, time-to-let, city data) | CRIF press room [S31] | A8 |
| G16 | Legge di Bilancio 2026: exact law number/article for the 2-unit threshold and 26 % rate; DDL sfratti parliamentary status at 2026-10-02 | Gazzetta Ufficiale; senato.it (blocked) | A9 |
| G17 | Homeflow traction (users, listings, pricing) and whether it has expanded beyond Milan/Brescia/Bergamo | homeflow.it (blocked) [S64] | Competition score |
| G18 | Facebook group sizes ("Affitti Milano", "Affitti Bologna", "Cerco casa Padova", etc.) | facebook.com (manual) | CAC proxy |
| G19 | Comune di Milano housing-crisis statements / Piano Casa Milano 2026 figures | comune.milano.it | Milan policy column |
| G20 | Fuorisede housing survey (Alma Mater / Piano Abitare Bologna): room rents, share of unregistered contracts | [S53] | Bologna product fit |

---

## F. Sources

All accessed **2026-10-02**. "Digest" = figure read from the search-engine summary of the page because direct fetch was blocked. Publication dates are as shown by the publisher or inferred from the URL; "n.d." = not displayed.

| # | Publisher — title | URL | Pub. date |
|---|---|---|---|
| S1 | Eurostat — `ilc_lvho02` Distribution of population by tenure status, type of household and income group (EU-SILC); DBnomics mirror | https://db.nomics.world/Eurostat/ilc_lvho02 · https://ec.europa.eu/eurostat/databrowser/product/view/ilc_lvho02 | 2025 release (2024 data) |
| S2 | Eurostat Statistics Explained — Living conditions in Europe – housing | https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Living_conditions_in_Europe_-_housing | 2025 ed. |
| S3 | Eurostat — `ilc_lvho07c` Housing cost overburden rate by tenure status (Trading Economics mirror for Italy, tenants at market price, 2024 = 19.4 %) | https://ec.europa.eu/eurostat/databrowser/view/ilc_lvho07c__custom_22933279/default/table · https://tradingeconomics.com/italy/housing-cost-overburden-rate-tenant-rent-at-market-price-eurostat-data.html | 2025 |
| S4 | MEF / Agenzia delle Entrate — "Tre famiglie su quattro vivono in una casa di proprietà" (Gli immobili in Italia) | https://www.mef.gov.it/inevidenza/Tre-famiglie-su-quattro-vivono-in-una-casa-di-proprieta/ · https://www.agenziaentrate.gov.it/portale/documents/20143/2242438/001_Com.+st.+Gli+immobili+in+Italia++02.01.20/42e5130b-52b5-8378-bfa8-4708b11dfba8 | 02-01-2020 |
| S5 | Agenzia delle Entrate — Gli immobili in Italia 2023, cap. 5 "Le locazioni delle abitazioni" | https://www.agenziaentrate.gov.it/portale/documents/20143/5327584/Gli+immobili+in+Italia_2023_cap_5.pdf/393cd967-8910-5ed7-a13b-7b3257adb09e | 2023 |
| S6 | Agenzia delle Entrate — "L'utilizzo delle abitazioni in Italia" (Gli immobili in Italia, cap. 2) | https://www.agenziaentrate.gov.it/portale/documents/20143/5768425/2+L_utilizzo+delle+abitazioni+in+Italia.pdf/ab5ff83c-dc5d-8420-fe34-8afb34110f9f | 2023 |
| S7 | Agenzia delle Entrate OMI — Statistiche OMI Residenziale, IV trimestre 2025 (and IV 2024) | https://www.agenziaentrate.gov.it/portale/documents/d/guest/statisticheomi_res_iv_2025 · https://www.agenziaentrate.gov.it/portale/documents/20143/6208646/StatisticheOMI_RES_IV_2024.pdf | 03-2026 / 03-2025 |
| S8 | Agenzia delle Entrate OMI — Rapporto Immobiliare 2026, residenziale (2025 data); digests: Idealista News 26-05-2026; Studio Delle Vittorie; UIPA | https://www.idealista.it/news/immobiliare/residenziale/2026/05/26/378958-rapporto-immobiliare-dell-agenzia-delle-entrate-nel-2025-locazioni-in-crescita · https://m.dellevittorie.it/locazione-residenziale-rapporto-omi-2025/ · https://www.uipa.it/omi-nel-2025-lieve-rialzo-per-le-locazioni-di-tipo-residenziale/ | 05-2026 |
| S9 | Agenzia delle Entrate OMI — Rapporto Immobiliare 2025, residenziale (2024 data); digests: Casa.it blog 21-05-2025; Studio Delle Vittorie; BlogAffitto | https://blog.casa.it/2025/05/21/rapporto-immobiliare-2025/ · https://m.dellevittorie.it/locazione-residenziale-rapporto-omi-2024/ · https://blogaffitto.it/mercato-affitto/affitto-un-mercato-da-oltre-1-6-milioni-di-contratti-all-anno-tutti-i-dati-dell-agenzia-delle-entrate.html | 05-2025 |
| S10 | Immobiliare.it Insights — "Affitti in Italia a inizio 2025: prezzi ancora in crescita (+8 %) ma con aumenti più lenti; più immobili sul mercato e pressione di domanda in lieve calo" | https://www.immobiliare.it/news/osservatorio-immobiliare/report-immobiliari/affitti-in-italia-ad-inizio-2025-prezzi-ancora-in-crescita-8-ma-con-aumenti-piu-lenti-piu-immobili-sul-mercato-e-pressione-di-domanda-in-lieve-calo-356251/ | 04-2025 |
| S11 | Immobiliare.it Insights — "L'offerta di affitti continua ad aumentare, i canoni crescono (+6,6 % annuo) ma meno degli anni precedenti" | https://www.immobiliare.it/news/osservatorio-immobiliare/report-immobiliari/lofferta-di-affitti-continua-ad-aumentare-i-canoni-crescono-66-annuo-ma-meno-degli-anni-precedenti-384477/ | 07-2025 |
| S12 | Immobiliare.it — Osservatorio semestrale del mercato residenziale (press release) | https://www.immobiliare.it/info/ufficio-stampa/2025/l-osservatorio-semestrale-del-mercato-residenziale-di-immobiliare-it-2710/ | 07-2025 |
| S13 | Monitorimmobiliare — "Immobiliare.it: domanda di acquisto in aumento, affitti in calo nel terzo trimestre 2025" | https://www.monitorimmobiliare.it/monitorimmobiliare/notizia/immobiliare-it-domanda-di-acquisto-in-aumento-affitti-in-calo-nel-terzo-trimestre-2025_2025-10-15111454/ | 15-10-2025 |
| S14 | Studio Delle Vittorie (on Immobiliare.it Insights) — "Mercato Locazione 2026: Tempi di Affitto a 2,8 Mesi" | https://m.dellevittorie.it/locazione-time-to-rent-h1-2026-insights/ | 2026 (H1 data) |
| S15 | MilanoToday — "Per affittare casa a Milano serve più tempo rispetto all'anno scorso: i nuovi dati" (Immobiliare.it Insights) | https://www.milanotoday.it/attualita/affitti-milano-tempi-casa-immobiliare-it.html | 2026 |
| S16 | MilanoToday — "Milano città degli affitti express, il 33 % delle case viene affittato in meno di 24 ore"; Quotidiano.net — "Affitti lampo in calo: nel primo trimestre 2025 solo il 13 % delle case locato in 24 ore" (Immobiliare.it Insights Q1 2025) | https://www.milanotoday.it/economia/affitti-express-report-primo-trimestre-2025.html · https://www.quotidiano.net/economia/affitti-lampo-in-calo-primo-trimestre-2025-agy8ur8a | 04/05-2025 |
| S17 | BolognaToday — "Ricerca casa e tempistiche di affitto, lo studio rivela: Bologna tra le città più 'fast'" | https://www.bolognatoday.it/casa/affitti-Casa-bologna-tempistiche.html | 2025 |
| S18 | MilanoToday — "Immobiliare, a Milano lieve tregua sugli affitti ma resta la più cara" (tasso di sforzo Q3 2025) | https://www.milanotoday.it/economia/tasso-sforzo-affitti-terzo-trimestre-2025.html | 10-2025 |
| S19 | Idealista News — "Affitti in Italia 2025: stop alla crescita dei canoni dopo quattro anni di rialzi" | https://www.idealista.it/news/immobiliare/residenziale/2026/01/17/312677-affitti-in-italia-2025-stop-alla-crescita-dei-canoni-dopo-quattro-anni-di-rialzi | 17-01-2026 |
| S20 | Idealista News — "Affitti a Milano, dopo anni di rialzi il mercato frena: canoni in calo del 2,3 % nel 2025" | https://www.idealista.it/news/immobiliare/residenziale/2026/01/14/311141-affitti-a-milano-dopo-anni-di-rialzi-il-mercato-frena-canoni-in-calo-del-2-3-nel | 14-01-2026 |
| S21 | Idealista News — "Affitti: impennata dei canoni nel secondo trimestre 2025, +4,6 %. Su base annua +5,5 %" | https://www.idealista.it/news/immobiliare/residenziale/2025/07/03/251094-affitti-impennata-dei-canoni-nel-secondo-trimestre-2025-4-6-su-base-annua-5-5 | 03-07-2025 |
| S22 | Idealista press release — "affitti in aumento del 2,6 % nel I trimestre 2025; boom del 7,8 % in un anno" | https://www.idealista.it/sala-stampa/comunicati-stampa/2025/04/03/395134-idealista-affitti-in-aumento-del-2-6-nel-i-trimestre-2025-boom-del-7-8-in | 03-04-2025 |
| S23 | Idealista News — "Case in vendita e in affitto: i capoluoghi più richiesti a fine 2025" (relative demand index) | https://www.idealista.it/news/immobiliare/residenziale/2026/01/20/312325-case-in-vendita-e-in-affitto-i-capoluoghi-piu-richiesti-a-fine-2025 | 20-01-2026 |
| S24 | Studio Delle Vittorie (on Idealista) — "Mercato residenziale: crescita delle ricerche per l'acquisto (+22,5 %), diminuzione per l'affitto (-9,4 %), nel Q1 2026" | https://m.dellevittorie.it/mercato-immobiliare-q1-2026-ricerche-vendite-affitto-idealista/ | 04-2026 |
| S25 | Idealista News — "L'impatto dell'inflazione di ottobre 2025 sui rinnovi annuali d'affitto: i canoni per città" | https://www.idealista.it/news/immobiliare/residenziale/2025/11/18/290721-l-impatto-dell-inflazione-di-ottobre-2025-sui-rinnovi-annuali-d-affitto-i-canoni | 18-11-2025 |
| S26 | Idealista — Evoluzione del prezzo delle case in affitto, Torino (Dec 2025 = €11.5/m²) | https://www.idealista.it/sala-stampa/report-prezzo-immobile/affitto/piemonte/torino-provincia/torino/ | 12-2025 |
| S27 | Idealista News (EN) — "Renting in Italy: the most expensive neighbourhoods and the fastest-rising rents in 2025" (Padua centre €14.1/m², +4.5 % Q3) | https://www.idealista.it/en/news/property-for-rent-in-italy/2025/10/22/279218-renting-in-italy-the-most-expensive-neighbourhoods-and-the-fastest-rising | 22-10-2025 |
| S28 | Il Fatto Quotidiano — "Affitti alle stelle: Milano la più cara, ma crescono anche Bologna e Torino" | https://www.ilfattoquotidiano.it/2026/05/04/affitti-italia-prezzi-aumento-notizie/8374942/ | 04-05-2026 |
| S29 | Banca d'Italia — Sondaggio congiunturale sul mercato delle abitazioni in Italia, IV trimestre 2025 | https://www.bancaditalia.it/pubblicazioni/sondaggio-abitazioni/2025-sondaggio-abitazioni/04/index.html · PDF mirror https://inumeridibolognametropolitana.it/sites/inumeridibolognametropolitana.it/files/altri_enti/banca_italia/abitazioni/2025_iv_trimestresondcong.pdf | 26-02-2026 |
| S30 | Banca d'Italia — Sondaggio congiunturale, II trimestre 2025 (mirror on agenziaentrate.gov.it) | https://www.agenziaentrate.gov.it/portale/documents/20143/8760008/statistiche_SAB_20250811.pdf/6bdbc151-5800-3012-238a-77d3d5c7db57 | 11-08-2025 |
| S31 | Nomisma – CRIF – Confabitare — Osservatorio Affitti 2025 (press: CRIF; Simplybiz; Wall Street Italia) | https://www.crif.it/risorse/rassegna-stampa/affitti-l-offerta-resta-insufficiente-rispetto-alla-domanda-e-spinge-i-canoni-di-locazione-su-del-plus3-5/ · https://www.simplybiz.eu/affitti-osservatorio-nomisma-crif-confabitare-aprile-2026/ · https://www.wallstreetitalia.com/immobilare-affitti-alle-stelle-35-nel-2025/ | 04-2026 |
| S32 | Nomisma — 18° Rapporto sull'Abitare 2025 (Monitorimmobiliare digest) | https://www.monitorimmobiliare.it/monitorimmobiliare/notizia/nomisma-18-rapporto-abitare-mercato-residenziale-stabile-accesso-piu-difficile_2026-02-19122821/ | 19-02-2026 |
| S33 | SoloAffitti — Osservatorio/Ricerca sugli affitti 2025 (Rentvolution; Adnkronos; La Sintesi) | https://www.rentvolution.it/ricerca-sugli-affitti-2025/ · https://www.adnkronos.com/economia/casa-soloaffitti-morosita-spinge-agli-sfratti-debito-resta-anche-dopo_16KV00fNzVLf5Ozc0zItNy · https://lasintesi.online/soloaffitti-in-italia-8-milioni-di-case-sfitte-proprietari-frenati-da-morosita-e-tempi-incerti-rientro/ | 2025 |
| S34 | Ministero dell'Interno — "Gli sfratti in Italia: andamento delle procedure di rilascio di immobili ad uso abitativo – anno 2024" as reported by Sky TG24, LaC News24, Metropolisweb (CGIL) | https://tg24.sky.it/economia/2025/11/09/case-sfratti-dati-italia · https://www.lacnews24.it/economia-e-lavoro/nel-2024-oltre-40mila-sfratti-in-italia-tre-su-quattro-per-morosita-calabria-virtuosa-solo-172-provvedimenti-in-un-anno-si68833s · https://www.metropolisweb.it/2025/11/02/sfratti-la-cgil-oltre-40mila-provvedimenti-nel-2024/ | 11-2025 |
| S35 | SoloAffitti Centro Studi (Ministero dell'Interno 2024 data) — MilanoToday; IlPescara; La Voce di Imperia; Simplybiz | https://www.milanotoday.it/economia/sfratti-report-soloaffitti.html · https://www.ilpescara.it/attualita/sfratti-dati-ministeriali-pescara-record-centro-studi-soloaffitti.html · https://www.lavocediimperia.it/2025/11/10/leggi-notizia/argomenti/attualita-5/articolo/imperia-tra-le-province-con-piu-sfratti-e-la-seconda-in-italia.html · https://www.simplybiz.eu/sfratti-solo-affitti-italia-ogni-giorno-153-provvedimenti/ | 11-2025 |
| S36 | Idealista News — "Sfratto per morosità: i tempi reali città per città"; CDC Law — "Sfratto per morosità 2026: procedura, tempi e costi"; Everyone Law | https://www.idealista.it/news/immobiliare/residenziale/2026/05/29/375027-sfratto-per-morosita-quali-sono-i-tempi-reali-citta-per-citta · https://cdclaw.org/Articoli/sfratto-per-morosita-procedura-tempi-costi-2026 · https://everyonelaw.it/blog/sfratto-morosita-tempi | 2026 |
| S37 | ISTAT — Censimento permanente 2021: caratteristiche delle abitazioni (press release) | https://www.istat.it/comunicato-stampa/censimento-permanente-2021-caratteristiche-delle-abitazioni/ | 2024 |
| S38 | ISTAT — "Quasi un'abitazione su tre non è occupata" (Today, 01-08-2024) and 2023 update digests (Delle Vittorie; SICET Caserta) | https://www.istat.it/wp-content/uploads/2024/08/Today-Abitazioni_01_08-2024.pdf · https://m.dellevittorie.it/istat-patrimonio-abitativo-utilizzate-2021-2023/ · https://www.sicetcaserta.it/2026/02/17/censimento-istat-sulle-abitazioni/ | 08-2024 / 02-2026 |
| S39 | ISTAT — Migrazioni interne e internazionali della popolazione residente, anni 2024-2025 (report) + ANSA/MUR + QuiFinanza digests | https://www.istat.it/wp-content/uploads/2026/08/Statistica-report_Migrazioni-interne-e-internazionali-della-popolazione-residente_ANNI-2024-2025.pdf · https://www.ansa.it/canale_legalita_scuola/notizie/mur/2026/08/03/istat-il-mezzogiorno-in-6-anni-perde-150mila-giovani-laureati_ebe8230c-9344-41fb-888c-b6fcf80da552.html · https://quifinanza.it/attualita/fuga-giovani-laureati-sud-dati-istat-2026/1010992/ | 08-2026 |
| S40 | ISTAT — Migrazioni interne e internazionali, anni 2023-2024 | https://www.istat.it/wp-content/uploads/2025/06/Report-MIGRAZIONI-INTERNE-E-INTERNAZIONALI-DELLA-POPOLAZIONE-RESIDENTE-ANNI-2023-2024-1.pdf | 20-06-2025 |
| S41 | Comune di Milano, Portale del Dato — "La popolazione a Milano nel 2025" | https://dati.comune.milano.it/en/web/portale-del-dato/w/la-popolazione-a-milano-nel-2025 | 2026 |
| S42 | Tuttitalia (ISTAT data) — Cittadini stranieri in Italia 2025; ItaliaInNumeri — città con più stranieri | https://www.tuttitalia.it/statistiche/cittadini-stranieri-2025/ · https://www.italiainnumeri.it/citta-italiane-con-piu-stranieri/ | 2025 |
| S43 | Ministero del Turismo BDSR/CIN figures (23-09-2025) via UfficioCommercio; Fiscomania CIN guide | https://www.ufficiocommercio.it/cin-e-affitti-brevi-quasi-700mila-le-strutture-registrate-nella-banca-dati-nazionale/ · https://fiscomania.com/cin-affitti-brevi/ | 09-2025 |
| S44 | Inside Airbnb city dashboards (Bologna etc.) and digests: Truenumbers; Trend-online 04-08-2025; Geopop | https://insideairbnb.com/bologna/ · https://www.truenumbers.it/airbnb-roma-prima-citta-per-annunci-quasi-25-mila/ · https://www.trend-online.com/2025/08/04/citta-italiana-con-piu-airbnb/ · https://www.geopop.it/dove-si-concentrano-maggiormente-gli-affitti-brevi-in-italia-e-quanto-rendono-rispetto-a-un-44/ | 2025-2026 |
| S45 | Agenzia delle Entrate OMI — Quaderno "Locazioni brevi: un'analisi del fenomeno in alcune città italiane" | https://www.agenziaentrate.gov.it/portale/documents/d/guest/3_q_osservatorio_locazionibrevi | n.d. |
| S46 | Lavoce.info — "Città sull'orlo di una crisi d'affitti" | https://lavoce.info/archives/106778/citta-sullorlo-di-una-crisi-daffitti/ | n.d. |
| S47 | Il Sole 24 Ore — "In Italia mancano 130mila posti letto per gli universitari fuori sede"; AziendaBanca digest | https://www.ilsole24ore.com/art/in-italia-mancano-130mila-posti-letto-gli-universitari-fuori-sede-AEyxfsGD · https://www.aziendabanca.it/notizie/investimenti-risparmio/student-housing | 2025 |
| S48 | UDU / Skuola.net — "Università, solo il 4,9 % dei fuori sede trova alloggio in uno studentato"; TGCOM24-Skuola — "Alloggi universitari: PNRR flop" | https://www.skuola.net/news/skuola-originals/universita-alloggi-affitti-fuori-sede.html · https://www.tgcom24.mediaset.it/skuola/alloggi-universitari-pnrr-flop-i-posti-letto-negli-studentati-restano-un-miraggio-per-quasi-tutti_95344291-202502k.shtml | 02-2025 |
| S49 | La Scuola Oggi — "Affitti studenti fuorisede: spesa media a 450 euro" | https://www.lascuolaoggi.it/affitti-studenti-fuorisede/ | 2025 |
| S50 | SUNIA – CGIL – UDU — Guida fuorisede 2024 | https://www.sunia.info/wp-content/uploads/2024/05/Guida-fuorisede-CGIL-UDU-SUNIA-2024.pdf | 05-2024 |
| S51 | Gazzetta di Bologna — "A Bologna uno studente su due è fuori sede"; BolognaToday — "Università di Bologna, iscrizioni in crescita: boom dall'estero ma calano i fuorisede" | https://gazzettadibologna.it/primo-piano/uno-studente-su-due-e-fuori-sede-ecco-i-dati-delluniversita-di-bologna/ · https://www.bolognatoday.it/cronaca/universita-bologna-iscrizioni-aumento.html | 02-2025 |
| S52 | BolognaToday / Tecnocasa — "Affitti universitari in crescita: a Bologna il 30,6 % va agli studenti" | https://www.bolognatoday.it/economia/affitti-studenti-universitari-bologna-tecnocasa.html | 2025 |
| S53 | Comune di Bologna — Piano per l'Abitare; "Student Housing: il caso di Bologna"; "Abitare da fuorisede: indagine Alma Mater" | https://www.pianoabitarebologna.it/ · https://www.pianoabitarebologna.it/notizie_omsa/student-housing-caso-bologna/ · https://www.pianoabitarebologna.it/notizie_omsa/abitare-fuorisede-indagine-studenti-studentesse-alma-mater/ | 2025 |
| S54 | BolognaToday — "Casa e canoni concordati, siglato accordo a Bologna"; Il Resto del Carlino — "Affitti, cosa cambia a Bologna per le case vuote"; Città Metropolitana di Bologna — accordo territoriale | https://www.bolognatoday.it/casa/affitti-canone-concordato-bologna-universita.html · https://www.ilrestodelcarlino.it/bologna/economia/affitti-case-vuote-vantaggi-proprietari-w9n0dh4v · https://www.cittametropolitana.bo.it/pianificazione/Engine/RAServeFile.php/f/accordo_affitto.pdf | 2025 |
| S55 | Università di Bologna — Alloggi e Sportello registrazione affitti; bando contributi locazione fuori sede 2025/26 | https://www.unibo.it/it/studiare/vivere-luniversita-e-la-citta/alloggi-e-sportello-registrazione-affitti/alloggi · https://bandi.unibo.it/s/abis1/bando-concorso-assegnazione-contributi-spese-locazione-abitativa-sostenute-studenti-studentesse-fuori-sede-iscritti-anno-accademico-2025-2026 | 2025 |
| S56 | UNAR / Università degli Studi di Milano field experiment as reported by Antirazzismo.com; ASGI — "No stranieri, no animali" | https://www.antirazzismo.com/discriminazione-abitativa-italia/ · https://www.asgi.it/antidiscriminazione/no-stranieri-no-animali-la-impossibile-ricerca-di-una-casa-in-affitto-per-una-cittadina-straniera/ | n.d. |
| S57 | Polizia Postale figures and vademecum — L'Aquila Blog; Questura di Firenze; Il Messaggero ("case fantasma", Velletri) | https://www.laquilablog.it/truffe-cibernetiche-la-guida-della-polizia-postale/ · https://questure.poliziadistato.it/it/Firenze/articolo/11646691032f23a48214786667 · https://www.ilmessaggero.it/roma/metropoli/case_fantasma_truffa_vendite_agente_velletri-8890553.html | 2025 |
| S58 | Hostsereno — "Garanzie contratto d'affitto: cosa sapere nel 2025"; Rent2Cash — "Guida alla locazione 2025" | https://hostsereno.it/garanzie-contratto-daffitto-cosa-sapere-nel-2025/ · https://www.rent2cash.it/guida-alla-locazione-2025-affitto-immobiliare/ | 2025 |
| S59 | Legge 27 luglio 1978 n. 392, art. 11 (deposito cauzionale) — Ministero del Lavoro text; Brocardi commentary | https://www.lavoro.gov.it/documenti-e-norme/normative/Documents/anniPrecedenti/19780727_L_392.pdf · https://www.brocardi.it/legge-equo-canone/titolo-i/capo-i/art11.html | 1978 / n.d. |
| S60 | Agenzia delle Entrate — Cedolare secca (area tematica); Modello RLI istruzioni (Oct 2025) | https://www.agenziaentrate.gov.it/portale/aree-tematiche/casa/affitto/cedolare-secca · https://www.agenziaentrate.gov.it/portale/documents/20143/9390371/RLI_istruzioni.pdf/9e4a3f27-43bd-9f5d-e3a8-92a5a14fab72?t=1760546481878 | 10-2025 |
| S61 | PMI.it — "Cedolare secca 2026: regole, aliquote e adempimenti"; Dokicasa — "Affitti brevi 2026: cosa cambia con la Legge di Bilancio (cedolare 26 % e P.IVA dal 3° immobile)"; Fiscal Focus — contratti transitori 2026; ANBBA — proposal 26 % (not enacted) | https://www.pmi.it/impresa/contabilita-e-fisco/486282/cedolare-secca-2026-regole-aliquote-affitti.html · https://dokicasa.it/approfondimenti/affitti-brevi-2026-legge-bilancio-cedolare-26-piva · https://www.fiscal-focus.it/l-esperto/l-esperto/casi-fiscali/affitti-con-cedolare-secca-cosa-succede-nel-2026-ai-contratti-transitori,3,179210 · https://www.anbba.it/legge-bilancio-2026-cedolare-secca-26-locazioni-turistiche/ | 12-2025 / 01-2026 |
| S62 | MN Agenzia Immobiliare — "Costi agenzia immobiliare affitto: chi paga e quanto"; Sognando Casa — "Quanto costa prendere un appartamento in affitto" | https://mnagenziaimmobiliare.it/costi-agenzia-immobiliare-affitto/ · https://sognandocasa.it/quanto-costa-prendere-un-appartamento-affitto/ | n.d. |
| S63 | Sky TG24 — "Piano Casa 2026, dagli affitti agli sfratti"; Edilportale — "Sfratti più rapidi…"; PMI.it — "Sfratti veloci, ok al Ddl di Governo"; Assoedilizia — "DDL sfratti: la lettura" | https://tg24.sky.it/economia/2026/07/03/piano-casa-2026-affitti-sfratti-cosa-prevede · https://www.edilportale.com/news/2026/07/normativa/sfratti-piu-rapidi-cosa-prevede-la-legge_111135_15.html · https://www.pmi.it/impresa/normativa/480957/sfratti-veloci-disegno-di-legge-in-senato.html · https://assoedilizia.wordpress.com/2026/05/12/ddl-sfratti-la-lettura-di-assoedilizia/ | 05/07-2026 |
| S64 | Giornale di Brescia — "HomeFlow, la startup che rivoluziona gli affitti con l'AI"; HomeFlow site | https://www.giornaledibrescia.it/economia/imprese/homeflow-startup-brescia-intelligenza-artificiale-affitti-qux3zmo0 · https://homeflow.it/ | 2025 |
| S65 | Zappyrent — "Chi siamo"; "Come funziona Zappyrent"; StartupItalia funding rounds (€1.2 M; €2.5 M) | https://www.zappyrent.com/it/who-we-are · https://www.zappyrent.com/it/blog/zappyrent-tutto-quello-che-ce-da-sapere/ · https://startupitalia.eu/startup/round-da-12-milioni-di-euro-per-zappyrent-che-si-espande-in-tutta-italia/ · https://startupitalia.eu/economy/economia-digitale/round-da-25-milioni-di-euro-per-zappyrent/ | n.d. |
| S66 | EverythingColiving — "State of Coliving Italy 2026"; Wikipedia — Joivy; Innovation Nation — Roomie acquired by Habyt; Napoli Monitor — "Le città come albergo" | https://www.everythingcoliving.com/state-of-coliving-italy · https://en.wikipedia.org/wiki/Joivy · https://www.innovation-nation.it/co-living-exit-roomie-habyt/ · https://napolimonitor.it/le-citta-come-albergo-coliving-studentati-di-lusso-e-nuova-rendita-urbana/ | 2026 |
| S67 | Il Giorno — "Startup a senso unico: Milano hub pigliatutto. Nel capoluogo il 72 % delle nuove imprese innovative, poi Brescia e Bergamo" | https://www.ilgiorno.it/milano/economia/startup-roculb1s | 2025 |
| S68 | OECD — Affordable Housing Database, HC1.2 Housing costs over income | https://www.oecd.org/content/dam/oecd/en/data/datasets/affordable-housing-database/hc1-2-housing-costs-over-income.pdf | 2024 |
| S69 | Ministero dell'Interno — "Sospesi per due mesi a Pisa gli sfratti esecutivi per morosità incolpevole" | https://www.interno.gov.it/it/notizie/sospesi-due-mesi-pisa-sfratti-esecutivi-morosita-incolpevole | n.d. |
| S70 | Napoli Monitor — "L'Italia è un 'paese di proprietari'? Cosa sappiamo sulla proprietà residenziale in Italia" | https://napolimonitor.it/un-paese-di-proprietari-sulla-proprieta-residenziale-in-italia/ | n.d. |
| S71 | Idealista News — "Il 2025 dell'immobiliare in Italia sotto la lente del database di idealista" (19-12-2025); "Report annuale di idealista: la fotografia del mercato residenziale nel 2025" (12-03-2026) | https://www.idealista.it/news/immobiliare/residenziale/2025/12/19/299025-il-2025-dell-immobiliare-in-italia-sotto-la-lente-d-ingrandimento-del-database · https://www.idealista.it/news/immobiliare/residenziale/2026/03/12/337027-report-annuale-di-idealista-la-fotografia-del-mercato-residenziale-nel-2025 | 12-2025 / 03-2026 |
| S72 | Immobiliare.it — "Cresce il prezzo degli affitti e Milano è la città più cara" (borsino) | https://www.immobiliare.it/news/osservatorio-immobiliare/borsino-immobiliare/cresce-il-prezzo-degli-affitti-rispetto-a-un-anno-fa-la-citta-piu-cara-milano-346016/ | 2025 |
| S73 | Commissariato di PS online (Polizia Postale) — "Falsi affitti e pacchetti vacanze: arrestato dalla Polizia Postale di Roma un uomo di 40 anni" | https://www.commissariatodips.it/notizie/articolo/falsi-affitti-e-pacchetti-vacanze-arrestato-dalla-polizia-postale-di-roma-un-uomo-di-40-anni/index.html | n.d. |
| S74 | Gruppo Casa — "Sfratti per morosità a Milano: dati e andamento dal 2022 in poi" | https://www.gruppocasa.it/blog/sfratti-morosita-milano-andamento-dal-2022-in-poi/ | 2025 |
| S75 | IDOS — Dossier Statistico Immigrazione 2025, dati Lombardia (CISL Brescia mirror) | https://cislbrescia.it/wp-content/uploads/2025/11/I-dati-della-Lombardia-nel-Dossier-Immigrazione-2025.pdf | 11-2025 |
| S76 | ISTAT — "Censimento e dinamica della popolazione – Anno 2024" | https://www.istat.it/wp-content/uploads/2025/12/Censimento-e-dinamica-della-popolazione-Anno-2024.pdf | 12-2025 |
| S77 | Fiscomania — "Cedolare secca affitti brevi: aliquota al 21 % anche per piattaforme"; Lodgify — CIN 2026 guide | https://fiscomania.com/cedolare-secca-affitti-brevi-aliquota-al-21-piattaforme/ · https://www.lodgify.com/blog/it/codice-cin-affitti-brevi/ | 2025-2026 |
| S78 | ItaliaOggi / Today.it — early reporting on the "sfratti veloci" proposal and the proposed housing Authority | https://www.italiaoggi.it/economia-e-politica/attualita/affitti-sfratti-veloci-in-quattro-mesi-cosa-prevede-la-proposta-di-fdi-e-la-nuova-authority-ad-hoc-unione-inquilini-attacco-ai-diritti-mqx1pofj · https://www.today.it/politica/sfratti-inquilini-morosi-procedura-tempi-novita.html | 2025-2026 |

*End of document.*

# Execution ledger — LinkedHome

Updated 2026-10-04. User instruction: **execute all repository phases**, followed by the explicit selection of **LinkedHome** and authorization for the necessary repository changes. The original52-section brief is absent from the checkout; this ledger and the adopted feature contract define the reviewable local scope. LinkedHome supersedes Doorluma as the product name; domain purchase and trademark clearance remain open. Earlier continuation sections retain their historical names and validation results. The local-MVP follow-up explicitly targets **a complete, verified local demo**; the latest request **«Pusha che buildo in locale»** authorizes publication on the existing remote branch.

Research passed an independent bounded gate for synthetic local development. Production deployment, live provider integrations, outside studies and legal/brand clearance are separate [release gates](docs/operations/release-checklist.md).

| # | Phase | Status / evidence |
|---|---|---|
| 0 | Environment/repository inspection | DONE — current checkout, Node24/npm11/Git; existing isolated `work` branch preserved |
| 1 | International research | DONE — dossiers01/02/04/06; current source corrections and explicit unverified claims |
| 2 | Competitor analysis | DONE — Homeflow pre-launch, LocService29€/month corrections; no moat/traction inference |
| 3 | Italian market | DONE —17 totals/four scenarios checked; current Eurostat/Idealista slices; city remains hypothesis |
| 4 | Legal/privacy research | DONE for desk scope — inspected primary baseline, no deployment clearance; review02 |
| 5 | Product thesis | DONE — docs/product/01; independently reviewed |
| 6 | Priorities | DONE — docs/product/02 acceptance contract; external features deferred explicitly |
| 7 | Naming/branding | DONE — LinkedHome selected by the user; centralized brand and future `.eu` guidance updated and verified; purchase and trademark clearance pending |
| 8 | UX architecture | DONE — docs/design/01, review03 |
| 9 | Design system | DONE — docs/design/02 and implemented responsive CSS |
| 10 | Technical ADR | DONE — Fastify/React/TypeScript/PostgreSQL; review03 and amendments |
| 11 | Scaffolding | DONE — manifest/lockfile/pinned runtime, scripts, CI definition |
| 12 | Database/domain | DONE — three SQL migrations, checksum ledger, native PostgreSQL, generated seed |
| 13 | Authentication | DONE — sessions, local confirmation/reset, role/rights controls |
| 14 | Tenant profile | DONE — private draft, publish/pause, approved matching fields |
| 15 | Landlord/property | DONE — owner edits, self-attestation, availability expiry/reconfirm |
| 16 | Matching | DONE — deterministic explained criteria, no person score, stable cursor order |
| 17 | Invitations | DONE — exact revisions, terminal-state contract and offer snapshot |
| 18 | Messaging | DONE — accepted participants, bounded history, block/close |
| 19 | Verification foundation | DONE — typed states/provenance/expiry/dispute; providers truthfully unavailable |
| 20 | Trust/safety/admin | DONE — case-scoped context, suspension/appeal/restore, export/delete and audit |
| 21 | Analytics | DONE — minimal local action counts, no market KPI claims |
| 22 | Tests | DONE — 71 unit/integration tests and 10 browser scenarios passed; operations/validation |
| 23 | Visual QA | DONE — final desktop/mobile screenshots inspected and retained in operations/evidence |
| 24 | Security | DONE for local scope — independent E/F review, fixes and dependency audit with 0 known vulnerabilities |
| 25 | Performance/accessibility | DONE — axe/keyboard/narrow-screen checks; measured desktop LCP244ms, throttled mobile2252ms, CLS0 |
| 26 | Documentation | DONE — README, demo, operations, evidence and tested cloud install/start instructions; install/start draft saved and repository membership aligned to the verified final local HEAD |
| 27 | Final adversarial review | DONE — eight independent final reviewers; review05 PASS for local synthetic scope |
| 28 | Fix material issues | DONE — material findings corrected and regressions passed; external release gates remain separate |

## Milestones and operating constraints

Project commits: `a5d4e80` research consolidation; `d47a214` independent research corrections; `c0180de` reviewed product/design/ADR; `0185593` implemented and tested local MVP. Final evidence is committed separately in this history. The user-authorized normal push published the complete history to the requested branch; no PR was created. Remote target remains only `claude/sweet-goldberg-5lwng7`; never reset/switch the platform checkout or create a worktree unless explicitly requested.

Only generated local data: `.local/` and credentials remain ignored. Test DBs are `soglia_test` and `soglia_e2e`, distinct from `soglia`. Do not run database-owning lifecycle commands concurrently. The tested cloud install/start instructions are saved in the configuration draft. Saving is not publication or validation of a restored new task; source commits are now available on the authorized remote branch independently of a cloud snapshot.

## Completion and follow-on scope

All phases0–28 are complete for the adopted local synthetic scope. Run instructions are in README and cloud-start; exact verification is in docs/operations/validation.md. The current app is usable locally. Work toward real users must address the separately owned release gates; no current evidence establishes their completion. No public deployment, remote CI, outside study or fresh-task restoration is claimed.


Completion follow-up: clean-source install/start and isolated PostgreSQL logical recovery passed; see operations/validation. Platform snapshot publication remains an interface action unavailable through the current tools, not an unfinished repository implementation phase.

## Authorized continuation — integrations and deployment preparation

On 2026-10-03 the user selected **«Integrazioni reali e preparazione del deploy»** and asked **«Ricerca e dammi la migliore opzione»**. This extends the completed local scope; it does not establish a real-user release.

| Work | Status / evidence |
|---|---|
| Hosting/email/domain comparison | DONE — ADR0002 recommends Render Frankfurt, Brevo SMTP and OVHcloud for a future Italian domain; official sources, prices and residency limits recorded |
| Real transactional transport | DONE — authenticated SMTP465/587, verified TLS, bounded/aborted connections, no deployed local fallback; 33 mail tests including controlled live protocol servers |
| Deployment boundary and UI | DONE — explicit environment, HTTPS origin/external DB/SMTP validation, Secure Host cookies including deletion, narrow proxy trust, liveness/readiness and safe public runtime config; mailbox wording follows configuration |
| Deployable source configuration | DONE for preparation — non-root Docker, Render staging/DB/migrate/preflight/daily-maintenance Blueprint and Compose/Caddy alternative; templates unapplied |
| Verification | DONE — build, 136 unit/integration/SMTP tests and 14 browser scenarios; npm audit0 known vulnerabilities; production-only dependency runtime smoke passed with synthetic external PostgreSQL and unchanged application counts |
| Independent technical review | DONE — review06; missing Docker brand module, Secure cookie deletion and SMTP deadline cancellation corrected |

The default local environment remains synthetic and Docker-free. No real SMTP credentials, verified domain, paid service or public deploy exists. Docker schema/configuration and production-dependency startup were checked, but actual image build/run could not be checked because the environment does not permit access to its Docker socket. Render ingress/rate-limit trust, live email delivery, hosted backup/restore, monitoring and real-user release gates remain target-environment work. Exact follow-on evidence is in operations/validation and deployment.md.

The existing remote/cloud configuration references the earlier published commit. This continuation is saved in the local checkout; additional remote publication is not claimed.

## Authorized continuation — domain research and naming

The user requested autonomous selection of an available domain and the resulting repository changes. **Doorluma / doorluma.com** is selected; optional `doorluma.it` is also offered for new registration. [Naming evidence](docs/product/03-naming.md) distinguishes registry availability, registrar offers and bounded collision research. Public branding and deployment guidance are updated; persistent technical identifiers are unchanged. No domain purchase, verified sender, custom-origin activation or additional push is implied. Verification results are recorded in operations/validation.

## Authorized continuation — saved rental UX integration

The user requested the UX work saved in `codex/rental-ux-save-20261003` at `504a809d7795d340cb639adad60a059c5fba1d40`, while retaining the newer Doorluma/domain/deployment work. The shared checkout already contained the exact saved UX source; integration adopts those files in the current branch and extends the existing verification commands, without replacing the newer project snapshot.

| Work | Status / evidence |
|---|---|
| Home, signup, guided dashboard, FAQ and chat starters | DONE — saved UX source preserved; role-aware guidance, actual account-state progress, editable explicit-send drafts |
| Test integration | DONE — `test:e2e:experience` included in `npm run check` and CI definition; no new dependencies |
| Integrated verification | DONE — build/typecheck,136 backend tests,14 existing browser scenarios and11 mocked-API experience scenarios passed sequentially; four mail-runtime scenarios shared between browser suites |
| Preservation and visual review | DONE — Doorluma/domain/server/deploy files unchanged, synthetic application counts retained, desktop/mobile screenshots inspected; [evidence](docs/operations/evidence/rental-ux-integration.json) |

This continuation is saved locally. Remote CI, a further push and a public deployment were not performed.

## Nuovo incarico: UX e reddito facoltativo — 2026-10-03

Implementata l’estensione richiesta localmente: ricerca mirata, audit browser, confronto A/B/C, anteprima/condivisione per destinatario, revoca/contestazione/scadenza e miglioramenti al percorso principale. `npm run check` PASS (96 unit/API, 15 browser); dettaglio e limiti in [income-validation](docs/operations/income-validation.md). Nessun provider reale, upload finanziario, pagamento, deploy o push. Le fasi storiche restano il ledger originario; questo incarico ne estende lo scope locale senza considerare chiusi i gate reali.

## Integrazione e pubblicazione richieste

Il lavoro reddito `f4cf518` è unito alla storia remota Doorluma/UX/SMTP fino a `65f38ee` mediante merge nel checkout corrente. Verifica integrata completata: build/typecheck, 161 test backend, 19 scenari browser core/reddito/mail e 11 esperienza/mail, tutti passati; quattro scenari mail ripetuti. Review07 e [evidenza](docs/operations/evidence/income-integration.json) registrano correzioni runtime, fixture e marchio. Il branch da pubblicare è quello esistente `claude/sweet-goldberg-5lwng7`; `work` è il nome locale del checkout. Dati e credenziali locali restano preservati e ignorati; nessun deploy o provider reale attivato.

## Ricerca economica e pull richiesto — 2026-10-03

La richiesta di massimizzare redditività e contenere spesa è seguita da «Fai pull e unisci il lavoro». Eseguito pull ordinario fast-forward da `6d4805c` a `9db6a9c` su `origin/claude/sweet-goldberg-5lwng7`, mantenendo il checkout locale `work`. Nessun conflitto o sostituzione della storia.

- [x] Ricerca ampliata su concorrenza, clienti, alternative gratuite, distribuzione, provider e partner.
- [x] Due modelli riproducibili a 12/24 mesi con coorti, ore founder, costi iniziali, cassa, scenari e sensibilità; audit numerici indipendenti.
- [x] [Sintesi economica](docs/research/12-sustainable-economics.md), [allegati](docs/research/economics-2026-10-03/README.md) e [review08](docs/reviews/review-08-economics.md) integrati nel repository.
- [x] Verifica nuova del codice ottenuto dal pull: build/typecheck, 161 backend, 19 browser core/reddito/mail e 11 esperienza/mail, 26 scenari distinti. Evidenza in [pull-economics-integration](docs/operations/evidence/pull-economics-integration.json).

La prima offerta da provare è un'installazione 790 € con manutenzione facoltativa, D-008 proposto. Nessuna vendita/intervista/campagna/acquisto o implementazione del pivot è effettuata. La ricerca reddituale e il flusso sintetico già implementati restano distinti dalla validazione economica. I comandi di test preservano dati e credenziali applicativi; gli esiti del controllo di avvio/migrazione sono registrati nell'evidenza dedicata.

## Authorized continuation — LinkedHome branding, 2026-10-04

Following an explicit user-requested pull, the checkout contains the integrated UX, SMTP and synthetic income history at `9db6a9c`. The user then selected LinkedHome and requested the necessary changes. The product name/slug, HTML metadata, existing mail/export expectations and current product/deployment guidance are updated. [D-007](docs/DECISIONS.md) records the decision; [current domain evidence](docs/operations/evidence/linkedhome-domain-research.json) distinguishes available `.eu`/`.it` from registered `.com` and documents nearby names. Older evidence and immutable synthetic observations retain the names they actually recorded. `npm run check` passed: build/typecheck,161 backend tests,19 application browser scenarios and11 experience scenarios, with4 mail scenarios repeated. Desktop,390px and320px visual checks passed. [Validation](docs/operations/validation.md) records this continuation; no purchase, deployment or further push occurred.

## Pubblicazione e pulizia dei branch richieste — 2026-10-04

Alla richiesta «Unisci, mergia e pulisci i branch», inventario completo: un solo ramo remoto/default `claude/sweet-goldberg-5lwng7`, un solo locale `work`, nessuna PR aperta. Il remoto è avanzato durante il push a `25d02c6`, con il naming LinkedHome. Integrato tramite merge insieme alla ricerca `3658f8a`; risolti i conflitti documentali, con D-007 naming e D-008 proposta economica. Nessun branch aggiuntivo da cancellare. Nuova verifica del codice integrato in [branch-merge-validation](docs/operations/branch-merge-validation.md); pubblicazione ordinaria sul ramo remoto esistente.

## Authorized publication and branch cleanup — 2026-10-04

DONE — following «Unisci, mergia e pulisci i branch», published LinkedHome `25d02c6` normally to the existing default `claude/sweet-goldberg-5lwng7`. All income, SMTP and rental UX histories remain preserved in merge `9db6a9c`. Integrated the concurrent Git-operation records `b5fa6d2` and `dcb665f` with a documentation-only merge. Fetch/prune and full remote-head inventory confirmed one remote branch and no open PR or additional branch to delete. Renamed this checkout's local `work` branch to the same shared name, retaining upstream and data. Build/typecheck and 33 mail tests passed on the synchronized LinkedHome source; previously recorded complete checks remain attributed to their actual execution. Publish the consolidated record on the same branch; no force push or deployment required.

Consolidamento finale: inclusi `c1fefe2` e `cfc849f`, anche i registri operativi concorrenti. Naming LinkedHome e ricerca economica D-008 conservati; codice e modelli invariati dopo la verifica completa161/26. Unico branch locale/remoto con nome comune e upstream; push ordinario e inventario finale.

## Local MVP follow-up and requested push — 2026-10-04

The user confirmed **«Demo locale completa e verificata»**. The follow-up saved in `d566adb`, based on `6d4805c`, corrects snapshot/compatibility consistency for accepted/closed invitations, recovery from property/discovery/chat load failures, selected-message report context and draft reset when the message or conversation changes. Long property content fits narrow screens.

Before merging the newer remote LinkedHome/income/UX/SMTP history, that source passed build/typecheck, **73 unit/integration tests**, **13 browser scenarios**, repeated bootstrap and compiled runtime probes. The synthetic fixture stayed at 5 users, 2 profiles, 1 property and 3 migrations. [Historical evidence](docs/operations/evidence/mvp-2026-10-04/readiness.json) records the base commit and tested source-diff hash; it does not validate the combined source or the newer migration.

The user requested **«Pusha che buildo in locale»**. The existing target remains `origin/claude/sweet-goldberg-5lwng7`; incoming history through `8891fea` preserves LinkedHome branding, optional synthetic income, UX, staging/SMTP preparation and prior branch-consolidation records. Verification and publication of this integration are recorded separately from those earlier checks; no public deployment or cloud-snapshot publication is implied.

The combined source passed frozen install, bootstrap, build/typecheck, 163 unit/integration tests, 22 main browser checks and 11 experience/mail-runtime checks. Dependency audit: zero known vulnerabilities, 224 dependency records. Compiled startup and tenant/landlord/admin probes passed; all five original account IDs, two profiles and one property were preserved, with migration004 bringing the ledger to four. [Integration evidence](docs/operations/evidence/mvp-push-2026-10-04/readiness.json) records the tested source and both merge parents. Static backend/UI merge reviews found no material issue. These results support the user-authorized ordinary push to the existing branch for local builds.

## Foto e form nella preview Railway — 2026-10-04

La richiesta «Rendi possibile caricare foto e rendi i form migliori» estende gli
immobili con foto private persistenti: fino a 6 JPEG/PNG/WebP, normalizzazione e
rimozione metadati, anteprime/copertina/galleria, rimozione, snapshot e retry senza
duplicati. Form immobili e preferenze migliorati con sezioni, suggerimenti ed
errori accessibili. Restano pseudonimia e isolamento della preview sintetica.
Implementazione e revisione completate; passati 220 backend e 34 scenari browser
distinti (38 esecuzioni), build/typecheck e audit. [Verifica](docs/operations/photo-forms-validation.md).
Provisionato storage S3 sul progetto Railway esistente; il deploy e la verifica
HTTPS completano l'aggiornamento richiesto sullo stesso dominio.

## Copy della landing richiesto — 2026-10-04

Sostituite le tre frasi generiche sotto la hero con ricerca avviata dai
proprietari, compatibilità con il budget e conversazione diretta. Confronto
mirato delle home ufficiali LocService/Spotahome/HousingAnywhere;
[fonti e motivazione](docs/design/03-landing-copy.md). Leggibilità mobile
migliorata; build, scenario landing, browser/accessibilità a quattro larghezze
e revisione indipendente passati. Aggiornamento della preview Railway nel
percorso iterativo già autorizzato.

## Reddito e tranquillità del proprietario — 2026-10-04

Il feedback browser richiede di valorizzare la valutazione economica, evitando
la negazione della solvibilità come messaggio della home. Presentata
l'attestazione con entrate/canone, allineate FAQ e pagina informativa, reso
visibile al proprietario il collegamento agli attestati negli inviti. Il flusso
sintetico già esistente mantiene consenso, revoca e isolamento; l'emissione
reale richiede ancora un servizio collegato. Build/typecheck, scenario landing,
nove controlli browser responsive/accessibilità e revisione indipendente
passati. Aggiornamento sul dominio Railway esistente.

## FAQ ispirate ai competitor — 2026-10-04

Alla seconda annotazione browser confrontate le FAQ ufficiali di LocService,
HousingAnywhere e Spotahome. Titolo «Domande frequenti», intro per entrambi i
ruoli, CTA esplicito e prima domanda sul funzionamento del servizio. Build,
scenario landing e verifiche responsive/accessibilità/tastiera passati;
revisione indipendente senza rilievi. [Fonti](docs/design/03-landing-copy.md).
Pubblicazione nello stesso flusso Railway, preservando reddito, foto e form.

## Monetizzazione dell’incontro — 2026-10-04

Richiesta browser: trovare un modello di ricavo per il contatto tra le parti.
Confrontati listini ufficiali e flusso inviti attuale. Proposta: inquilino
gratuito, proprietario pagante per invito accettato, primo incontro gratuito
come promozione di lancio circoscritta,
prezzo iniziale da testare 9,90 €. [Modello](docs/product/05-contact-monetization.md)
e D-009 distinguono fatti, ipotesi, condizioni di pagamento e prova economica.
Nessuna modifica UI, attivazione di billing o deploy impliciti nella proposta.

## Palette immobiliare — 2026-10-04

Richiesta di colori più vicini a idealista/Immobiliare.it. Applicati bianco,
testo ardesia, blu per azioni/marchio, azzurro per informazioni e piccoli
accenti caldi. Titoli sans e titolo mobile leggibile; aggiornati tutti i
componenti, favicon e theme-color. Build/typecheck, 11 scenari browser,
controlli responsive/contrasto e review indipendente passati.
[Riferimenti e verifica](docs/design/04-real-estate-palette.md). Aggiornamento
della preview Railway nel percorso iterativo già autorizzato.

## Spunte dei progressi dashboard — 2026-10-04

Feedback browser «Spunte inguardabili». Sostituito il carattere testuale con
SVG a tratto arrotondato, cerchio azzurro e geometria fissa. Corretto il
conflitto CSS che annullava il centraggio; stati accessibili e numeri dei
passaggi incompleti preservati. Build, tre scenari progressi e sette controlli
UI responsive/accessibilità passati; regressione del centraggio coperta nel
test esistente. Pubblicazione nella stessa preview Railway autorizzata.

## Gerarchia e carattere della dashboard — 2026-10-04

Feedback browser «Tutto molto piatto». Saluto su fascia blu con case SVG
originali, testo/azioni specifici per ruolo, attività in due card autonome
collegate agli inviti. Primi passi con intro azzurra, lista bianca e CTA
compatta; titoli delle altre card ridotti. Conteggi dalle API esistenti,
nessun dato fittizio aggiunto al prodotto. Retry dei riepiloghi falliti e
test funzionale dedicato; pubblicazione nella preview Railway esistente.

## Italiano comune per la verifica del reddito — 2026-10-04

Feedback «Che significa attestazione? Usa parole comuni in italiano».
Processo chiamato «verifica del reddito», risultato «riepilogo del reddito».
Semplificati titoli, azioni, stati, spiegazioni e messaggi d’errore; allineati
workspace, inviti, conversazioni, homepage, FAQ e guida. API e consenso
preservati. Build/typecheck, scenario landing e27 controlli UI con API
simulate passati. Aggiornamento della stessa preview Railway autorizzata.


## Mese o periodo di ingresso — 2026-10-04

Il feedback sul giorno preciso richiede una scelta più immediata. Nuovi
profili con «Un mese» predefinito; alternative «Un periodo» tra due mesi e
«Un giorno preciso». Selettori mese/anno in italiano, anteprima aderente alla
scelta e fine mese inclusiva negli abbinamenti, invio e accettazione inviti.
Date preesistenti e payload API legacy mantengono il giorno originale.
Modifiche non salvate conservate anche mettendo in pausa il profilo.
Migrazioni additive007/008 e nessuna nuova dipendenza. Build/typecheck,
247 test backend,22 scenari browser principali verificati e14 esperienza
passati; pubblicazione nella stessa preview Railway autorizzata.


## Tipi di contratto nel profilo e negli immobili — 2026-10-04

Feedback sulla durata generica: selezione di4+4,3+2,studenti universitari
oppure transitorio, con spiegazioni brevi e opzione flessibile. Formula
separata dalla permanenza numerica; stesso tipo offerto dall’immobile
richiesto quando il profilo esprime una preferenza specifica. API, discovery,
inviti e riepiloghi allineati; snapshot accettati/chiusi preservati.
Migrazione009 aggiuntiva, durate preesistenti invariate. Build/typecheck,
311 test backend,22 browser principali e17 esperienza passati. Fonti e
semantica in [contract-preferences](docs/product/06-contract-preferences.md).
Pubblicazione nella preview Railway esistente già autorizzata.

## Foto facoltativa nel profilo — 2026-10-04

Il profilo di ricerca consente di scegliere una foto, vederne l’anteprima,
salvarla, sostituirla e rimuoverla senza salvare o modificare le preferenze.
Una sola immagine JPEG/PNG/WebP fino a5 MB, normalizzata senza metadati.
Storage privato persistente già disponibile; visibilità limitata al titolare
e ai contatti con conversazione accettata/chiusa, attivi e non bloccati.
Nessuna foto nella scoperta anonima. Migrazione010 aggiuntiva, cleanup
persistente e retry che non ripristinano foto precedenti. Build/typecheck,
327 backend,22 browser principali,5 preview e20 experience passati;
immagine Docker production e conservazione dei dati verificati.
Pubblicazione nella stessa preview Railway autorizzata.

## Durata condizionale e informazioni del profilo — 2026-10-05

Feedback: chiedere i mesi solo quando servono e aggiungere animali e altre
informazioni utili. Campo mesi nascosto per4+4/3+2; nuovi salvataggi null e
criterio numerico escluso da discovery/inviti per queste formule. Durate
storiche preservate dalla migrazione011. Informazioni facoltative su animali,
arredamento, ascensore, spazio esterno e posto auto; presentazione e dettagli
animali condivisi solo dopo accettazione, con controlli di accesso. Bozze
preservate cambiando formula, caricando foto e mettendo in pausa. Nessun
nuovo filtro automatico sui dettagli. Build/typecheck,380 backend e23
experience,6 preview e22 browser principali passati. Runtime Docker e dati
locali verificati. Pubblicazione nella stessa preview Railway autorizzata.

## Accenti blu — 2026-10-05

Il marrone residuo del titolo homepage e degli accenti del marchio viene
sostituito dal blu primario. Avvisi di bozza con il proprio token warning.
Build/typecheck e controlli browser homepage desktop/mobile passati;
pubblicazione nella stessa preview Railway autorizzata.

## Foto di gruppo o per persona — 2026-10-05

Feedback sulle foto per più affittuari; l’utente vuole lasciare la scelta
a chi cerca casa. Un solo profilo con una foto propria/di gruppo oppure
foto individuali, fino a11 altre persone con nome e foto facoltativa.
Scelte e immagini persistono; il cambio modalità conserva le schede e
ne controlla la condivisione. Metadata e immagini dei membri solo al
titolare e ai proprietari di inviti accettati/chiusi, in modalità individuale,
con controlli su blocchi, sospensioni e preview. Bozze conservate e nessun
aggiornamento implicito al numero di persone o alle revisioni. Migrazione012
aggiuntiva e storage esistente. Dettagli in `docs/product/07-household-photos.md`.
Verificare API, retry/cleanup, browser reale, mobile e deploy nella preview.

Build/typecheck,399 backend e20 API mirati con regressione privacy,26 UI
experience e3 casi mirati,7 flussi preview e22 browser principali passati.
Review indipendente, packaging Docker, screenshot/accessibilità mobile e
conservazione dati verificati; dev con HMR/watch pronto. Pubblicazione
nella stessa preview Railway autorizzata.

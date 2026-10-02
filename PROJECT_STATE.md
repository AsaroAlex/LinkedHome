# PROJECT STATE

> Memoria operativa del progetto. Fonte di verità per riprendere il lavoro in qualsiasi sessione, chat o modello.
> Chi riprende: leggi questo file, verifica la coerenza con il repository (`git log`, `PLAN.md`, `docs/`), esegui la "Prossima azione".
> Aggiornato automaticamente durante il lavoro. Non contiene segreti.

## Obiettivo

Costruire le fondamenta di una startup PropTech: marketplace degli affitti "al contrario" per l'Italia (prima città consigliata: Bologna). L'inquilino crea un profilo strutturato e verificabile e diventa scopribile dai proprietari compatibili; il proprietario invita; interesse reciproco = match; chat → visita → affitto. Non un prototipo: ricerca → decisione → documentazione → implementazione → test → revisione critica → miglioramento, in autonomia.

## Risultato finale atteso

Repository `AsaroAlex/LinkedHome` (branch `claude/sweet-goldberg-5lwng7`) contenente: dossier di ricerca di mercato con fonti; tesi di prodotto e MVP definito; ricerca naming e brand; design system e flussi; ADR tecnici; monolite modulare TypeScript funzionante in locale con un comando (bootstrap, migrazioni, seed); flussi critici implementati (onboarding inquilino, proprietà, matching spiegabile, inviti/match, messaggi, verifiche, trust & safety, admin, analytics); test unit/integrazione/E2E/accessibilità; QA visiva; revisione sicurezza/privacy; documentazione coerente con il codice; `docs/FINAL_REPORT.md`. Definizione di "fatto" completa nel brief originale (sezione 48) riportata in `PLAN.md`.

## Contesto essenziale

- Brief del fondatore (2026-10-02): 52 sezioni; richiede research gate PRIMA di prodotto/brand/codice; 8 revisori critici (A–H) a fine di ogni fase; matching deterministico e spiegabile (mai score opaco); privacy by design con disclosure progressiva; nome del brand centralizzato (nessun hardcoding); localizzazione IT prima, EN preparata; monolite modulare; tecnologia "noiosa" e provata.
- Il nome "LinkedHome" è solo il nome del repository: il nome del prodotto va deciso nella fase naming (Fase 7).
- Lingua dei documenti: inglese (docs/), tranne questo file (italiano, su richiesta del fondatore).

## Vincoli

- Non iniziare implementazione prima di: ricerca → revisione critica 01 → tesi di prodotto → naming → design → ADR.
- Mai score numerico opaco sulle persone; segnali di compatibilità booleani e spiegabili; nessun attributo protetto nel matching.
- Nessuna fee contingente alla locazione (rischio licenza mediatore L. 39/1989); nessun paywall per gli inquilini su visibilità/inviti.
- Sviluppo locale deve funzionare SENZA Docker (il container non ha daemon Docker) e con Docker Compose in alternativa.
- Mai committare `.env`, credenziali, dati personali reali. Commit per milestone logici (conventional commits), push su `claude/sweet-goldberg-5lwng7`, mai altri branch.
- Ogni commit termina con le righe di attribuzione (Co-Authored-By Claude + Claude-Session) richieste dall'ambiente.
- Ricerca: non fabbricare mai fatti, numeri, disponibilità domini, clearance trademark; etichettare FACT / HYPOTHESIS / ASSUMPTION / CLAIM.
- **Limite ambiente (critico):** il proxy di rete blocca il fetch diretto di quasi tutti i siti esterni (403 policy). Raggiungibili: github.com, registry.npmjs.org, pypi.org. La ricerca web funziona solo via WebSearch (estratti dei motori di ricerca). Tutte le cifre nei dossier sono quindi "di seconda mano" e vanno ri-verificate sulle pagine primarie prima di uso esterno (investitori/legale). Documentato in ogni dossier (§0/§metodo).
- Ultracode attivo: per task sostanziali usare il tool Workflow (fan-out agenti + verifica avversaria).

## Ambiente

- Container cloud Linux; cwd `/home/user/LinkedHome`; repo git remoto `https://github.com/AsaroAlex/LinkedHome`.
- Node 22.22.0, pnpm 10.28.0, PostgreSQL 16.14 locale (cluster `16/main` avviato con `pg_ctlcluster 16 main start`; utente `postgres` via `sudo -u postgres psql`), Docker CLI 29 SENZA daemon, Playwright Chromium in `/opt/pw-browsers`, Python 3.11.
- Versioni npm verificate il 2026-10-02 (registry): next 16.3.8, react 19.3.0, typescript 7.0.2, drizzle-orm 0.45.3, drizzle-kit 0.31.11, better-auth 1.7.7, zod 4.6.5, tailwindcss 4.3.3, next-intl 4.14.9, pg-boss 12.35.1, vitest 5.0.3, @playwright/test 1.63.0, @biomejs/biome 2.5.15, shadcn 4.21.1, @base-ui/react 1.8.0, lucide-react 1.50.0, @conform-to/react 1.21.1, sharp 0.35.5, file-type 22.1.1, pino 10.3.1, msw 3.0.1, eslint 10.11.0, fast-check 4.10.2, @axe-core/playwright 4.13.0, pg 8.23.1. Attenzione: next-auth latest = 4.24.15 (v5 ancora beta); prisma latest = 8.0.0-rc.
- Stack consigliato dalla ricerca tecnica (da confermare in ADR-001): Next.js 16 App Router (`output: standalone`, `proxy.ts`, Cache Components off), TypeScript 7 (verificare compatibilità typescript-eslint; alternativa Biome), PostgreSQL 16 + Drizzle, Better Auth (email OTP/magic link, sessioni DB), Tailwind 4 + shadcn/ui su Base UI + Lucide + font self-hosted, Zod 4 + Conform, next-intl, pg-boss (niente Redis), `StorageProvider` (filesystem in dev, S3-compatibile EU in prod), SMTP astratto (MailDev in dev), Vitest 5 + Playwright + axe + fast-check, Biome o ESLint 10, lefthook, Renovate, GitHub Actions con service Postgres.

## Stato corrente

Fase 0 completata. Research gate (Fasi 1–4) quasi completo: 6 dossier su 7 scritti e committati; il settimo (legale/privacy) è in scrittura da un agente in background. Nessun codice applicativo ancora scritto (per vincolo del brief).

## Ultima attività

Attesa del completamento del dossier legale `docs/research/07-legal-privacy-risks.md` (file parziale presente, non committato finché non completo). Creazione di questo file di stato.

## Prossima azione

1. Verificare che `docs/research/07-legal-privacy-risks.md` sia completo (deve avere ~14 sezioni + SOURCES; se ancora parziale e nessun agente attivo, completarlo con nuova ricerca). Committarlo.
2. Scrivere la sintesi: `docs/research/01-market-landscape.md`, `08-product-opportunities.md`, `09-sources.md` (consolidare le fonti di tutti i dossier).
3. Eseguire la revisione critica 01 (8 revisori A–H) → `docs/reviews/review-01-research.md`; risolvere le CRITICAL prima di passare alla tesi di prodotto.

## Piano

1. Fase 0 — ispezione ambiente/repo — COMPLETATO
2. Fasi 1–4 — ricerca mercato, competitor, Italia, legale — IN CORSO (manca sintesi + legale)
3. Revisione critica 01 — DA FARE
4. Fase 5 — tesi di prodotto (`docs/product/product-thesis.md`), problem tree, posizionamento (A–D), wedge/core loop/network effect/monetizzazione/moat, MVP scope, feature matrix, `docs/product/metrics.md`, criteri di successo — DA FARE
5. Fase 6 — prioritizzazione feature (MUST/SHOULD/EXPERIMENT/AVOID/POST-MVP) — DA FARE (bozza già in `04-feature-benchmark.md` §7)
6. Fase 7 — naming (30+ nomi, controlli preliminari, scoring, 1 nome + 2 alternative) e brand strategy — DA FARE
7. Fasi 8–9 — UX flows, screen inventory, design principles, design system (token, WCAG) — DA FARE
8. Fase 10 — ADR stack tecnologico — DA FARE
9. Fasi 11–21 — scaffolding, bootstrap un comando, CI, modello dati + migrazioni + seed, auth/ruoli, onboarding inquilino, proprietà, matching engine, inviti/match, messaggi, verifiche, trust & safety/admin, analytics — DA FARE
10. Fasi 22–28 — test (unit/integrazione/E2E/a11y), QA visiva, security review, performance/a11y, documentazione, revisione avversaria finale, fix, `docs/FINAL_REPORT.md` — DA FARE

## Completato

- Repo inizializzato sul branch designato; `.gitignore`, `PLAN.md` (ledger fasi), `docs/DECISIONS.md`, `docs/reviews/README.md` (protocollo revisori A–H).
- `docs/research/02-competitor-matrix.md` — 22 prodotti, 93 fonti.
- `docs/research/03-user-pain-points.md` — portali, dolori inquilini/proprietari, JTBD, problem tree, 82 fonti.
- `docs/research/04-feature-benchmark.md` — screening/passport, stack verifiche Italia, pattern UX cross-settore, triage feature, 152 fonti.
- `docs/research/05-market-opportunity-italy.md` — dati nazionali, 17 città, matrice decisionale, 78 fonti.
- `docs/research/06-business-models.md` — 10 modelli, unit economics, cold start, metriche, 56 fonti.
- `docs/research/10-technology-landscape.md` — stack, hosting EU, versioni verificate, 84 fonti.

## In corso

- `docs/research/07-legal-privacy-risks.md` (agente in background; alle 200 righe/6 sezioni all'ultimo controllo).

## Da fare

- Sintesi 01/08/09; revisione critica 01; tutte le fasi 5–28 (vedi Piano).

## Da verificare

- Ri-verifica delle cifre chiave dei dossier contro le pagine primarie quando l'accesso di rete lo permette (elenchi gap in `05` §E, `06` §H, `04` §8.3, `02` §2.26–2.30).
- Esistenza di "MyTenant" (Italia) e "Want2Rent" (Australia): non trovati; chiedere URL al fondatore se li ritiene reali.
- Compatibilità TypeScript 7 con typescript-eslint/Next (da testare in scaffolding).

## Decisioni

- D-001 Research gate prima di prodotto/brand/codice. Motivo: assunzioni del brief da validare; competitor (Homeflow) già live con score opaco.
- D-002 Dev locale senza Docker obbligatorio. Motivo: container senza daemon; macchine sviluppatori eterogenee. Conseguenza: bootstrap rileva Postgres nativo o Compose.
- Risultati di ricerca che orientano il prodotto (da confermare nella tesi di prodotto):
  - Dolore primario = gap di fiducia al primo contatto (proprietari usano proxy discriminatori; inquilini sovra-espongono documenti). Non "centinaia di candidati sempre": in Italia la pressione è stagionale/segmentale (contatti per annuncio −9/−21% nel 2025).
  - Il form "profilo inquilino" NON è un moat (Idealista, Leboncoin, Zillow lo hanno); difendibile = dati verificati alla fonte + flusso di contatto invertito + fairness by design + passport esportabile.
  - Lato scarso/difficile del marketplace = proprietari (1 immobile, 87% delle unità locate): sussidiare i proprietari, inquilini gratis, mai paywall su visibilità.
  - Monetizzazione MVP: core gratuito per entrambi; unica linea a pagamento = crediti di verifica per proprietari ("bring your own applicants", €15–25 ipotesi). Lungo termine: SaaS proprietari/agenzie a tariffa fissa (mai % del canone), referral garanzie, servizi contratto, API Tenant Passport.
  - Città di lancio consigliata: Bologna (4.32/5) > Padova (3.74) > Milano (3.50, Homeflow presente, CAC alto, ciclo in raffreddamento). Il dossier 06 ha citato Milano senza dati città: prevale il 05.
  - Rischio da non fare: modalità "solo reverse" (Hired è fallito quando il lato corteggiato non era più scarso): prevedere valore single-player (dossier esportabile per l'inquilino; screening gratuito per il proprietario).
  - Verifica identità: CIE/SPID per residenti + IDV documento+selfie come fallback per stranieri; reddito via open banking (AISP licenziato) o documenti con controllo integrità; mai mostrare documenti originali al proprietario (solo risultati).

## Problemi aperti

- Rete: fetch diretto bloccato → qualità evidenze "tier B"; da dichiarare nel FINAL_REPORT.
- Budget WebSearch degli agenti in background limitato (alcuni agenti lo hanno esaurito); la sessione principale può ancora cercare. Usare le ricerche con parsimonia (servono per i controlli domini/nomi).
- Conflitto città di lancio tra dossier 05 (Bologna) e 06 (Milano): risolto a favore di Bologna nella sintesi (da scrivere).

## File importanti

- `PLAN.md` — ledger delle fasi (TODO/IN PROGRESS/DONE/BLOCKED) con evidenze.
- `docs/DECISIONS.md` — decisioni di prodotto ad alto livello (D-001, D-002).
- `docs/reviews/README.md` — protocollo delle revisioni critiche (revisori A–H, formato).
- `docs/research/02..07, 10` — dossier di ricerca (vedi Completato / In corso).
- `docs/research/01-market-landscape.md`, `08-product-opportunities.md`, `09-sources.md` — DA SCRIVERE (sintesi).

## Componenti importanti

Nessun componente software ancora creato. Directory `docs/{research,reviews,product,legal,brand,design,adr,architecture,security,growth}` esistono (vuote salvo research/reviews).

## Modifiche effettuate

- 2026-10-02: creati `.gitignore`, `PLAN.md`, `docs/DECISIONS.md`, `docs/reviews/README.md`, 6 dossier di ricerca; 8 commit sul branch, tutti pushati.

## Test e verifiche

- Eseguiti: verifica versioni npm (curl registry); verifica blocco proxy (curl a 28 host: solo GitHub/npm raggiungibili); avvio PostgreSQL locale (ok).
- Risultato: ambiente idoneo; ricerca solo via WebSearch.
- Ancora necessari: nessun test software finché non esiste codice.

## Informazioni critiche da non perdere

- Il brief del fondatore impone: NON aggiungere AI al matching; matching deterministico con vincoli hard (zona, budget, occupanti, data, tipo) e preferenze soft, ogni match spiegabile ("Perché vedo questo?").
- Disclosure progressiva: prima del match solo ID profilo, nucleo, zona, budget, finestra ingresso, durata, badge verifiche, requisiti legittimi; dopo match reciproco nome e chat; documenti solo quando necessario e mai esposti di default.
- Stati di verifica da distinguere: UNVERIFIED / PENDING / VERIFIED / FAILED, senza implicare verifiche più forti di quelle eseguite.
- Ruoli: tenant, landlord, both, admin, moderator; autorizzazione server-side; matrice di autorizzazione da documentare e testare.
- Il nome del prodotto deve essere centralizzato in un unico token/config (rinominabile).
- Non creare pull request a meno che il fondatore lo chieda esplicitamente.

## Recent Changes

- 2026-10-02 — Creato PROJECT_STATE.md; research gate a 6/7 dossier; dossier legale in scrittura.

## Ultimo aggiornamento

2026-10-02 — Prima stesura dello stato; in attesa del dossier legale per la sintesi e la revisione critica 01.

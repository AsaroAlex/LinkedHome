# PROJECT STATE

> Memoria operativa per riprendere il lavoro. Aggiornato il 2026-10-02 dopo la ripresa della ricerca in Codex.
> Leggere questo file, `PLAN.md` e `docs/reviews/review-01-research.md`; verificare sempre la coerenza con Git e i file effettivi.

## Obiettivo

Costruire le fondamenta di un marketplace degli affitti al contrario per l'Italia: profilo inquilino, scoperta da parte di proprietari pertinenti, invito, accettazione reciproca e conversazione. Ricerca → decisioni → design → implementazione → verifiche. LinkedHome è il nome del repository, non un brand approvato.

Il risultato finale di progetto resta un monolite modulare TypeScript avviabile in locale, con bootstrap, migrazioni, seed, autenticazione, profili, proprietà, matching spiegabile, inviti, messaggi, verifiche, amministrazione, analytics, test e QA. Le scelte tecniche restano candidate fino all'ADR. Il brief integrale di 52 sezioni citato nella memoria precedente **non è presente nel checkout**; PLAN.md è il registro delle fasi, non una copia verificata della sua sezione 48.

## Richiesta attuale e ambito

L'utente ha chiesto di leggere questo file e riprendere il lavoro. Alla domanda sul perimetro ha scelto esplicitamente: **«Completa ricerca e revisione»**. Questa ripresa riguarda i dossier e il review gate; non avvia prodotto, naming o MVP.

L'onboarding cloud precedente ha verificato Git e il workflow documentale e salvato istruzioni di avvio. La successiva richiesta di ripresa autorizza le modifiche ai documenti di ricerca qui registrate.

## Stato corrente

- I dossier 01–10 sono ora presenti: completata la stesura legale, aggiunte sintesi 01 e 08 e registro 09.
- Revisione 01 scritta con le prospettive A–H e registro delle risoluzioni. **Un solo agente ha effettuato i passaggi: non sono otto revisioni indipendenti.**
- Otto problemi critici documentali corretti; **R01-C1 e R01-C2 restano aperti** per assenza dei riscontri primari decisivi.
- **Research gate BLOCCATO**, non approvato. Fasi 5–28 ancora TODO.
- Nessun codice applicativo, manifest, lockfile o suite software presente. Nessun servizio applicativo avviato.
- Il dossier legale parziale era già committato in `9b0f42a`; non esiste un ricercatore ancora attivo di quella vecchia sessione.

## Vincoli da conservare

- Ricerca e revisione precedono tesi di prodotto, naming, design, ADR e codice.
- Matching deterministico e spiegabile; nessuno score opaco sulle persone e nessun ML nel matching. Escludere attributi protetti e verificare anche i proxy indiretti.
- Pubblicazione del profilo deliberata; pre-match identificatore opaco e campi approvati. Match reciproco non significa rilascio automatico di documenti o dati finanziari.
- Nessun paywall inquilino per visibilità o inviti. Nessuna fee per successo/per-match nella raccomandazione corrente. Una tariffa fissa **non** prova un'esenzione dalle regole sulla mediazione.
- Verifiche opzionali: distinguere UNVERIFIED, PENDING, VERIFIED, FAILED, scadenza e contestazione. Non trasformare l'assenza di verifica in esclusione o esito negativo.
- Valutare alternative inclusive a credenziali italiane, biometria e reddito da lavoro dipendente; nessun provider è già disponibile o contrattualizzato.
- Sviluppo locale deve poter funzionare senza Docker, con eventuale alternativa Compose. Non inferire la disponibilità di database/browser/toolchain dai dati della vecchia macchina.
- Nome prodotto centralizzato quando sarà deciso; IT prima, EN preparata; lingua interfaccia esclusa dal matching.
- Ruoli previsti tenant, landlord, both, admin, moderator; futura autorizzazione server-side e matrice permessi da verificare.
- Mai committare `.env`, credenziali o dati personali reali. Non inventare citazioni, prezzi, interviste, verifiche, disponibilità domini o clearance trademark.
- Documenti in `docs/` in inglese; questa memoria in italiano.
- Commit per milestone coerenti. Destinazione remota prevista: solo `claude/sweet-goldberg-5lwng7`, mai altri branch. Nessuna pull request senza richiesta esplicita. Non inventare attribuzioni o identificativi di sessioni Claude per lavoro svolto qui.
- Ogni task cloud è già isolato: usare il checkout esistente; niente worktree salvo richiesta esplicita.

## Ambiente effettivamente verificato

- Checkout: `/workspace/LinkedHome`; branch locale predisposto dalla piattaforma: `work`.
- HEAD iniziale e branch remoto richiesto coincidevano: `9b0f42a6303cdb5f5176cc7cdbb06787665e859b`.
- Git 2.52.0; Python 3.12.14; Node 24.19.0; npm 11.9.0.
- `git fsck --full` e lettura remota HTTPS riusciti. Credenziali Git fornite dalla piattaforma: nessun token aggiuntivo richiesto.
- Nessuna installazione necessaria per i documenti. PostgreSQL, pnpm, Docker e Playwright della vecchia memoria non sono servizi verificati in questa istanza.
- In questa sessione non sono disponibili WebSearch/Context7/Ultracode Workflow. Le indicazioni precedenti su questi strumenti e sul budget di ricerca non descrivono questa macchina.
- Fetch diretto con TLS verificato: 6 metadati npm riusciti; 9 URL legali/mercato bloccati dal proxy con 403. Non confondere un blocco di rete con una pagina inesistente.

## Configurazione cloud salvata

- `start_skill`: directory di lavoro, uso del checkout isolato, controllo Git, lettura memoria/piano, limiti della fase documentale e istruzioni per rivalutare il setup quando comparirà codice.
- `network.allowed_domains`: 12 domini mirati per fonti normative e di mercato, elencati in `docs/research/09-sources.md`; mantenuto il preset package manager.
- Nessun `install_script` né segreto applicativo richiesto.
- Salvataggio della bozza confermato. Non sono stati applicati dal tool cambiamenti alla rete dell'istanza, pubblicati snapshot o verificati ripristini in nuovi task.

## Completato in questa ripresa

1. Riletto lo stato effettivo e individuati dossier legale tronco, fonti mancanti e indicazioni d'ambiente obsolete.
2. Riscritto `07-legal-privacy-risks.md` con sezioni 0–17 e 21 riferimenti normativi/ufficiali, distinguendo interpretazioni, proposte e verifiche bloccate. Nessuna approvazione legale dichiarata.
3. Creato `01-market-landscape.md`: sintesi delle evidenze, concorrenza, problemi, città, monetizzazione e contraddizioni.
4. Creato `08-product-opportunities.md`: opportunità da validare, esperimenti non eseguiti, definizioni dei denominatori e dipendenze.
5. Creato `09-sources.md`: 566 riferimenti con namespace per dossier, 684 stringhe URL estratte e 17 URL ricorrenti; provenienza e stato di accesso espliciti.
6. Corrette raccomandazioni incompatibili in 04/05/06: provider obbligatori, SPID dichiarato gratuito, verifiche infallibili, score/tier, ML, fee considerate sicure, inglese prima, CIN indiscriminato, verifica reddito come attivazione, soglia Airbnb importata.
7. Ricontrollati tutti i 17 punteggi città e quattro scenari sui pesi: aritmetica corretta. Bologna resta un'ipotesi di luogo di ricerca, non una città di lancio approvata; Padova non è automaticamente la seconda scelta.
8. Scritta revisione `review-01-research.md` con prospettive A–H, criticità, risoluzioni ed evidenze. Aggiornati piano, indice revisioni e checkpoint delle decisioni.

## Risultati di ricerca da trattare come ipotesi

- Possibile valore: ridurre disclosure ripetuta e lavoro necessario per conversazioni pertinenti. Non crea case né garantisce solvibilità.
- Form profilo e inviti sono copiabili; vantaggio competitivo, liquidità e disponibilità a pagare non dimostrati.
- Bologna guida la matrice soggettiva verificata; serve riscontro su offerta raggiungibile, domanda comparabile e acquisizione locale.
- Core gratuito; eventuale servizio di verifica per proprietari da valutare legalmente ed economicamente. €15–25 è un'ipotesi, non prezzo validato.
- Verifiche CIE/SPID, biometriche e bancarie richiedono termini commerciali, copertura, alternative, basi giuridiche e costi reali.
- Una verifica documentale non prova affidabilità futura; una carta pseudonima non elimina tutti i proxy; hosting UE e vendor esterno non risolvono automaticamente privacy e trasferimenti.

## Problemi aperti e prossima azione

1. **R01-C1:** applicare nelle impostazioni ambiente i domini salvati, poi recuperare testi normativi consolidati e disposizioni esatte. Il dossier legale contiene target di lettura, non nuove citazioni lette sul primario. Valutazione delle attività concreta da affidare successivamente a consulente qualificato.
2. **R01-C2:** recuperare fonti primarie correnti su concorrenti e indicatori decisivi città. Separare periodi, popolazioni, stock e flussi; aggiornare le ipotesi se contraddette. Coda dettagliata in 09 §3 e 05 §E.
3. Ottenere la revisione indipendente prevista, senza presentare i passaggi di un solo agente come revisori diversi. Registrare esito e risoluzioni prima del gate.
4. Solo dopo chiusura esplicita del gate e nel perimetro del task successivo: tesi di prodotto, priorità, naming, UX/design, ADR e implementazione.

Ulteriori attività future: ricerca utenti consensuale, WTP/costi, condizioni provider, DPIA, ruoli privacy, retention e operatività supporto. Non sono state eseguite interviste, contattati partner, creati account o sostenute spese.

## File per riprendere

- `PLAN.md` — ledger e gate.
- `docs/reviews/review-01-research.md` — problemi critici e registro risoluzioni.
- `docs/research/01-market-landscape.md` — sintesi di riferimento.
- `docs/research/07-legal-privacy-risks.md` — copertura legale e questioni aperte.
- `docs/research/08-product-opportunities.md` — agenda di validazione.
- `docs/research/09-sources.md` — provenienza e richieste bloccate.
- `docs/research/02..06, 10` — dossier di base con note correttive.
- `docs/DECISIONS.md` — D-001 ricerca prima del codice; D-002 sviluppo senza Docker obbligatorio.

## Verifiche e limiti

Passati: integrità/accesso Git, lettura dei documenti, aritmetica matrice e sensibilità, sei metadati npm. Riferimenti bibliografici e collegamenti Markdown locali controllati in chiusura.

Bloccati: nove fetch legali/mercato per policy di rete. Non eseguiti: ricerca primaria successiva allo sblocco, peer review indipendente, opinione legale, esperimenti clienti, build/test applicativi. Nessuna di queste attività è marcata come superata. La stesura dei documenti è completa; la validazione della ricerca resta aperta.

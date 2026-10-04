# LinkedHome: sviluppo iterativo

Mantieni il contesto in `PROJECT_STATE.md`, il perimetro in `PLAN.md` e le istruzioni in `docs/operations/development.md`. Ogni segnalazione dell’utente riguarda lo stato corrente, incluse le modifiche precedenti.

L’utente ha scelto Codex locale su macOS per lavorare come in Replit. Usa la stessa cartella dell’app e apri la preview locale nel browser affiancato; verifica prima che la chat abbia davvero accesso al checkout sul Mac. Il trasferimento iniziale via Git è distinto dalle iterazioni successive: niente push/pull o build manuali a ogni modifica. Non rifare il progetto e non migrare a Replit. Se si parte in un checkout locale nuovo, verifica Node24, installa le dipendenze mancanti, avvia il comando dev e apri l’esatto URL del runner.

- Analizza e riproduci quando possibile; trova la causa e applica la modifica minima, rispettando architettura e convenzioni. Nessun refactoring o nuova dipendenza senza necessità.
- Verifica build/typecheck e test pertinenti; aggiungi un test di regressione per bug automatizzabili. Per UI controlla il flusso reale, console e rete; per API controlla input/output, log e condizioni limite.
- Usa `npm run dev` per il ciclo modifica/test: avvia database locale, API watch e Vite HMR. Mantieni un processo gestito dal terminale e lascialo pronto per il prossimo test manuale. Per E2E libera prima3000 arrestando soltanto il tuo servizio, poi riavvialo. Non eseguire in parallelo comandi che possiedono il ciclo start/stop del database.
- Conserva dati e segreti ignorati in `.local/` e `.env.development.local`; non stamparli né committarli. Non cancellare il cluster per correggere un errore. Usa dati sintetici, nessuna modifica ad ambienti o dati di produzione.
- Per cloud inoltra solo il frontend, con `APP_ORIGIN` esatto. Non dichiarare raggiungibile una preview senza un URL effettivo della piattaforma. API e PostgreSQL restano su loopback.
- Preserva il checkout e le modifiche esistenti; niente reset, switch, worktree o operazioni distruttive. Push, deploy e PR seguono le richieste esplicite dell’utente.
- Rispondi sinteticamente in italiano: causa, modifica, test eseguiti, file principali e cosa verificare manualmente.

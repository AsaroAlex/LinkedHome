# LinkedHome: sviluppo iterativo

Mantieni il contesto in `PROJECT_STATE.md`, il perimetro in `PLAN.md` e le istruzioni in `docs/operations/development.md`. Ogni segnalazione dell’utente riguarda lo stato corrente, incluse le modifiche precedenti.

L’utente vuole un’esperienza «Replit style» **qui in Codex, in cloud**, e ha esplicitamente escluso la piattaforma Replit. Restare in questa chat e sullo stesso checkout; nessuna migrazione, import o nuova app esterna. Modifiche, test e processo dev devono usare questo workspace, con HMR/watch e senza push/build manuali a ogni iterazione. Il percorso locale resta tecnicamente compatibile, ma non è la scelta corrente. Questo runtime cloud non espone attualmente un URL di preview in ingresso e gli strumenti disponibili non creano un port forwarding: app avviata e scheda browser aperta non provano accessibilità dal computer. Dichiarare questo limite senza promettere una preview funzionante o presentare una piattaforma alternativa come scelta dell’utente. Non aprire di nuovo Replit.

- Analizza e riproduci quando possibile; trova la causa e applica la modifica minima, rispettando architettura e convenzioni. Nessun refactoring o nuova dipendenza senza necessità.
- Verifica build/typecheck e test pertinenti; aggiungi un test di regressione per bug automatizzabili. Per UI controlla il flusso reale, console e rete; per API controlla input/output, log e condizioni limite.
- Usa `npm run dev` per il ciclo modifica/test: avvia database locale, API watch e Vite HMR. Mantieni un processo gestito dal terminale e lascialo pronto per il prossimo test manuale. Per E2E libera prima3000 arrestando soltanto il tuo servizio, poi riavvialo. Non eseguire in parallelo comandi che possiedono il ciclo start/stop del database.
- Conserva dati e segreti ignorati in `.local/` e `.env.development.local`; non stamparli né committarli. Non cancellare il cluster per correggere un errore. Usa dati sintetici, nessuna modifica ad ambienti o dati di produzione.
- Quando un inoltro cloud è effettivamente disponibile, esporre solo il frontend con `APP_ORIGIN` esatto. Non dichiarare raggiungibile una preview senza un URL effettivo verificato. API e PostgreSQL restano su loopback; Vite deve continuare a negare l’accesso HTTP ai dati privati `.local/`.
- Preserva il checkout e le modifiche esistenti; niente reset, switch, worktree o operazioni distruttive. Push, deploy e PR seguono le richieste esplicite dell’utente.
- Rispondi sinteticamente in italiano: causa, modifica, test eseguiti, file principali e cosa verificare manualmente.

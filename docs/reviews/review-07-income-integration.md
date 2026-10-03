# Review statica — integrazione reddito, UX e runtime

Data: 2026-10-03. Ambito: integrazione del lavoro locale `f4cf518` con la storia remota Doorluma, UX affitti e preparazione SMTP/deployment fino a `65f38ee`.

**Stato: PASS per il risultato integrato locale con dati sintetici.** Il reviewer ha letto i sorgenti e i test e ha corretto le fixture di due suite browser. Non ha avviato database, server, build o test. Il coordinatore ha eseguito la validazione descritta sotto sul risultato integrato; i risultati delle precedenti review 06 restano attribuiti ai rispettivi snapshot.

## Finding e risoluzioni

| Priorità | Finding | Risoluzione riesaminata | Verifica |
|---|---|---|---|
| Importante | La demo reddito precedente dipendeva da `APP_ENV` globale e consentiva staging. Dopo l'introduzione di `RuntimeConfiguration` poteva divergere dall'ambiente dell'istanza HTTP. | `server/app.ts` abilita il simulatore soltanto se `runtime.environment === "local"` e l'opzione non lo disabilita. `tests/income.test.ts` include richieste staging e produzione, con cookie Secure, e verifica che demo ed emissione reale rispondano 503. | Lettura statica; regressione API passata nell'esecuzione del coordinatore. |
| Importante | Le fixture SMTP browser non fornivano `/api/income`, ora caricato da `VerificationPage`. Il preview Vite poteva rispondere HTML e mostrare un errore estraneo al test. La fixture generica `{ ok: true }` della suite esperienza non rispetta il DTO richiesto da `IncomeWorkspace` e può provocare un errore su `shares.length` quando si apre la pagina verifiche. | Aggiunto un DTO completo `not_requested`, con provider e demo indisponibili, a `tests/browser/mail-runtime.spec.ts` e `tests/experience/experience.spec.ts`. Il percorso sintetico completo resta coperto dalla suite browser reddito che usa l'API reale locale. | Diff riesaminato; entrambe le suite browser passate nell'esecuzione del coordinatore. |
| Minore | Il nome Soglia era incorporato nell'emittente sintetico e nel fallback dell'interfaccia dopo il passaggio a Doorluma. | `server/income.ts` e `src/Income.tsx` usano `brand.name`; il test dell'emittente usa lo stesso nome di prodotto. Identificatori tecnici e dati storici non richiedono migrazioni per questo cambio. | Lettura statica; nessuna nuova attestazione creata dal reviewer. |

## Compatibilità riesaminata

- Il runner unitario combina i controlli locali del ramo remoto con la propagazione dell'exit code del ramo reddito: la chiusura del database precede `process.exit(resultCode)`. Gli ambienti distribuiti, il mail transport SMTP e un `DATABASE_URL` esterno vengono rifiutati dal runner.
- `src/api.ts` conserva i dati durante un reload dello stesso URL e li elimina quando cambia URL o la richiesta fallisce. Questo resta compatibile con i progressi per ruolo di `NextSteps` e impedisce di trasferire una vecchia anteprima fra destinatari. Le proiezioni reddito e il consenso legato all'ID dell'attestazione restano presenti.
- `src/style.css` conserva gli stili reddito e aggiunge gli adattamenti della testata a 320 px; `src/experience.css` mantiene guide, progressi e risposte suggerite. Responsive, focus e axe richiedono comunque l'esecuzione browser sul risultato integrato.
- `VerificationPage` conserva istruzioni diverse per mail locale, SMTP e configurazione sconosciuta, più il workspace reddito per candidato/entrambi. L'identità resta separata e indisponibile. Nessun provider reale di reddito è attivo: `unavailableIncomeProvider` risponde 503 e la migrazione consente soltanto attestazioni sintetiche.
- L'accettazione dell'invito e le risposte suggerite in chat non concedono accesso al reddito. Discovery, ordine dei profili e progressi iniziali non dipendono dalla verifica finanziaria. La sostituzione dell'attestazione interrompe i grant e richiede un nuovo consenso.
- Le segnalazioni restano limitate a invito, motivo, descrizione ed eventuale messaggio selezionato; il prodotto invita a non inserire dati sensibili. Il workspace spiega che la contestazione sintetica registra il problema e non attiva assistenza o revisione di un provider. Nessuna nuova integrazione di supporto finanziario è dichiarata.
- Fastify mantiene `logger: false`. Gli errori API registrano solo nome/codice, il recupero email registra un messaggio fisso e SMTP evita logger/debug, sostituendo errori del trasporto con messaggi generici. Gli eventi reddito contengono soltanto nome e timestamp; la relativa regressione API resta presente. Nessun log finanziario aggiunto è stato identificato staticamente.

## Prospettive A–H

Queste sono prospettive di un singolo reviewer, non otto ricerche indipendenti.

| Prospettiva | CRITICAL ISSUES | IMPORTANT ISSUES | NICE-TO-HAVE IMPROVEMENTS |
|---|---|---|---|
| A — Strategia | Nessun nuovo blocco statico individuato. | Beneficio della verifica sulle conversazioni non dimostrato; permane il piano utenti già documentato. | Nessuna aggiunta richiesta per l'integrazione. |
| B — Prodotto | Nessun nuovo blocco statico individuato. | Mantenere la verifica facoltativa e l'emissione reale esplicitamente indisponibile. | Nessuna. |
| C — UX | Nessun nuovo blocco statico individuato. | Responsive, focus e recupero errori devono passare sul risultato integrato. | Nome emittente sintetico allineato al brand. |
| D — Engineering | Nessun nuovo blocco statico individuato dopo le risoluzioni sopra. | Eseguire build/typecheck, unit/API, browser core/reddito e suite esperienza/mail runtime. | Nessuna. |
| E — Sicurezza/privacy | Nessun nuovo blocco statico individuato. | Verificare a runtime il guard demo staging/produzione; nessuna autorizzazione a usare dati finanziari reali deriva da questa review. | Nessuna. |
| F — Fairness | Nessun nuovo blocco statico individuato. | Preservare neutralità di discovery, partecipazione e assenza di punteggi finanziari. | Nessuna. |
| G — Marketplace | Nessun nuovo blocco statico individuato. | Non attribuire a questa integrazione prove su liquidità o conversione. | Nessuna. |
| H — Competitor | Nessun nuovo blocco statico individuato. | L'integrazione tecnica non prova differenziazione o difendibilità. | Nessuna. |

## Chiusura del gate

Non resta un difetto statico critico aperto nel perimetro letto. Il coordinatore ha completato in sequenza `npm run build`, `npm test` (**161 test su 7 file**), `npm run test:e2e` (**19 scenari**) e `npm run test:e2e:experience` (**11 scenari**): tutti exit 0. Quattro scenari mail-runtime sono ripetuti fra le due suite, quindi sono **26 scenari browser distinti**. I controlli axe/tastiera/responsive configurati passano; le schermate selezionate sono state ispezionate. L'app compilata è riavviata: health/config 200, marchio Doorluma e quattro migrazioni, senza seed o reset del database applicativo. Evidenza: [income-integration.json](../operations/evidence/income-integration.json).

La pubblicazione Git conserva entrambe le storie e usa il branch remoto esistente `claude/sweet-goldberg-5lwng7`. Deploy, consegna SMTP presso un provider esterno, test con persone reali e abilitazione di un provider reddito non sono stati eseguiti e mantengono i gate già documentati.

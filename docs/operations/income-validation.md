# Estensione reddito — risultato, verifica e limiti

Data: 2026-10-03. Repository `/workspace/LinkedHome`. Miglioramento locale con dati sintetici; nessun deploy, acquisto, contatto esterno, documento finanziario reale o provider collegato.

## Cosa funziona oggi

- Preferenze: modifiche non salvate esplicite, anteprima salvata distinta, pubblicazione bloccata finché salva, pausa senza perdere quanto digitato.
- Proprietari: conferma di pubblicazione, azione verso la discovery dello specifico immobile, data di validità e riconferma; gli immobili scaduti portano al recupero.
- Percorso: date dei confronti leggibili in italiano, errori durata associati ai campi, stati di caricamento reali, recupero link invalidi e focus sugli esiti delle azioni.
- Reddito: esempio privato riutilizzabile e immutabile, anteprima del riepilogo minimo, consenso inizialmente vuoto per **esatta attestazione e invito**, destinatario definito dal server, accesso del solo proprietario destinatario. Un altro invito dello stesso proprietario non eredita il consenso.
- Dipendenti/autonomi/entrate variabili sono categorie di fixture sintetiche. Tutti gli otto stati sono rappresentati: non richiesta, in corso, completata, dati insufficienti, errore, scaduta, revocata, contestata.
- Revoca, contestazione, scadenza, sostituzione, blocco/sospensione e invito terminale interrompono le letture future del riepilogo. Un rinnovo non eredita accessi. Il titolare può esportare/cancellare i propri dati; il proprietario non esporta riepiloghi reddituali altrui.
- Il riepilogo dichiara sempre «Esempio sintetico · nessun reddito reale verificato». Nessun badge o dato finanziario in discovery, nessun requisito per accettare/parlare, nessun punteggio della persona.

Percorso: **Verifiche → Prova il percorso con dati sintetici → Crea esempio sintetico → Inviti e messaggi → Reddito: scegli cosa condividere**. Scegli un invito pendente o una conversazione accettata. Il proprietario usa **Informazioni sul reddito condivise** nello stesso invito/conversazione.

## Evidenze di ricerca e decisione

[Ricerca](../research/11-income-verification.md): 29 riferimenti ufficiali con estratti/retrieval e limiti; Tink documenta IT e API, Experian presenta offerte italiane documentali/payroll/transazionali, CRIF indica entitlement Banks & Financial da chiarire. Prezzi, copertura per fonte/categoria e retention concreta dipendono dai contratti; nessuna verifica reale eseguita. Comparabili LocService, DossierFacile e SoloAffittiPAY sono osservati attraverso guide/pagine pubbliche, non account autenticati.

[Decisione di prodotto](../product/04-income-attestation.md): confronto A/B/C e scelta A privata riutilizzabile con accesso per invito. Il twist è ancora un’ipotesi: il proprietario invia prima un invito; l’attestato può aiutare a proseguire il contatto, ma non abbiamo provato che aumenti il primo invito o la conversione. La condivisione può avvenire prima o dopo l’accettazione, mai per pubblicazione automatica.

## Controlli eseguiti dal coordinatore

| Controllo | Risultato e limiti |
|---|---|
| `npm run check` | PASS, exit 0: build/typecheck, **96 test unitari/API** e **15 scenari browser**, inclusi 25 test dedicati reddito e 5 scenari browser reddito |
| Build finale | PASS dopo rifinitura della separazione testo negli step e microcopy della conferma locale |
| Browser mirato finale | PASS, 5 scenari reddito dopo la rifinitura visiva; risultato registrato nel [manifest](evidence/income-final-manifest.json) |
| Runner test | Probe isolato volutamente fallito: restituisce exit 1; file temporaneo rimosso. [Evidenza](evidence/income-runner-exit.json). Il runner accetta ora anche un percorso test come argomento |
| Responsive/tastiera/axe | Test browser a 1440, 390 e 320 px sui flussi selezionati; nessun overflow o violazione axe configurata. Consenso con Space/Tab/Enter e scelta esplicita; screenshot ispezionati |
| App compilata preservata | PASS: loading/error retry verifiche, preferenze dirty, recupero link invalido, esempio sintetico privato; zero errori browser/violazioni axe e niente overflow a 390 px. [QA](evidence/income-final-qa.json) |
| Audit percorso principale | [Audit](../design/03-ux-audit-income.md) e JSON/screenshot baseline: onboarding tre ruoli, preferenze, immobile, discovery, inviti accetta/rifiuta, chat, verifiche e dati; 24 scansioni axe senza violazioni configurate |
| Review indipendente | [Review reddito](../reviews/review-06-income.md): difetto del consenso su anteprima sostituita corretto con binding ID, limite contestazione allineato a 300 caratteri; nessun finding materiale statico residuo. Runtime attribuito al coordinatore |

I test di sicurezza verificano accesso anonimo/estraneo, proprietà dell’attestato/grant, isolamento fra inviti/destinatari, consenso vero e ID della preview, impossibilità di inviare importi/documenti/provider arbitrari, provider 503 e demo disabilitata, scadenza a runtime, revoca, contestazione, rinnovo e corse con blocco/revoca/rinnovo, export e cancellazione. Le corse sospensione/cancellazione sono supportate dal protocollo di lock già usato e controllate staticamente, non descritte come ulteriori stress test.

Durante il primo run sono emersi un test storico con numero fisso di migrazioni e la perdita del testo dell’errore sulle durate: corretti e riprovati. Non si cambia il ledger storico: sono quattro migrazioni, la quarta aggiunge le nuove tabelle.

## File e architettura

- `src/Income.tsx`: pagina/anteprima/accessi e condivisione per invito; `App.tsx`, `api.ts`, `style.css`: integrazione, miglioramenti UX e responsive.
- `server/income.ts`: tipi risultato/provider, fixture sintetiche, stati e proiezione minima; `server/app.ts`: autorizzazioni, lifecycle, grant, export ed eventi senza contenuto finanziario.
- `migrations/004_income_attestations.sql`: stati, osservazioni immutabili sintetiche, concessioni/revoca e nomi evento; `tests/income.test.ts`, `tests/browser/income.spec.ts`: regressioni significative.
- Documenti di prodotto, UX, architettura, demo, lancio, README e stato aggiornati per distinguere questa estensione dai rinvii storici delle integrazioni reali.

## Cosa richiede un servizio esterno

`POST /api/income/checks` risponde **503 provider_unavailable**. Nessun endpoint upload o webhook abilita emissione reale. La migrazione accetta solo osservazioni `synthetic=true`; non basta inserire una API key. Servono contratto per uso locativo/riuso, copertura italiana per fonti e categorie, metodo netto/periodo per autonomi e variabili, adattatore con risposte autenticate e callback idempotenti, schema/proiezione reale, costo e payer validati, retention/diritti/privacy e operatore per contestazioni/alternative. Il risultato storico non garantisce redditi o pagamenti futuri. La revoca ferma nuove letture al server, non copie già ottenute.

Nessuna prova con Safari/iOS, lettore di schermo o dispositivo mobile fisico; nessuna certificazione WCAG/sicurezza, prestazione provider o risultato commerciale. Il termine «attestazione» resta dimostrativo oggi. Bologna non è una città di lancio approvata.

## Prossimo esperimento reale

Nel [piano utenti](../product/04-income-attestation.md) sono definite domande neutrali e attività con dati sintetici: pubblicare senza verifica, interpretare periodo/emittente/limiti, scegliere un destinatario, revocare e gestire prova insufficiente. Fissare criteri prima della prova, osservando comprensione e condivisioni involontarie, senza inventare soglie validate. Pilot successivo: conversazioni pertinenti avviate, accettazione, tempo attivo/attesa, abbandono per fase e comprensione. Confrontare offerta facoltativa del percorso con baseline, evitando inferenze causali da gruppi autoselezionati.

## Schermate finali

[Dettaglio desktop dell’attestazione](evidence/income-final-workspace-detail-desktop.png) · [Consenso mobile](evidence/income-consent-mobile.png) · [Vista proprietario](evidence/income-owner-preview-desktop.png) · [Contestazione](evidence/income-disputed-desktop.png) · [Scadenza](evidence/income-expired-mobile.png) · [Profilo con modifiche non salvate](evidence/income-final-profile-dirty-desktop.png) · [Recupero link](evidence/income-final-link-recovery-desktop.png). Il [manifest](evidence/income-final-manifest.json) elenca altre acquisizioni e limiti.

L’app compilata è stata riavviata su loopback, porta 3000 (`npm start`) e osservata con il database locale preservato. Il percorso crea oggi un esempio esplicito anche nell’account demo candidato, senza condividerlo automaticamente. Non presumere che il processo resti attivo fra chat/task; README documenta come riavviarlo.

## Integrazione con il lavoro remoto Doorluma

Alla richiesta di unire/pulire il repository e rendere visibile il branch è stata integrata la storia remota fino a `65f38ee` con il commit reddito `f4cf518`, conservando entrambi. Restano marchio Doorluma, home e registrazione guidata, progressi per ruolo, risposte rapide modificabili e preparazione SMTP/runtime/deploy. Gli identificatori tecnici e i dati persistenti sono preservati. Il simulatore reddito ora usa la configurazione della singola istanza ed è disponibile **soltanto nell'ambiente locale**; staging e produzione rifiutano l'emissione sintetica anche se l'opzione demo è richiesta.

Verifica del risultato integrato: build/typecheck, **161 test backend su 7 file**, **19 scenari browser core/reddito/mail** (38,7 s) e **11 scenari esperienza/mail con API simulate** (14,8 s), tutti passati in sequenza. Quattro scenari mail sono ripetuti, quindi i browser coprono 26 scenari distinti. Screenshot selezionati ispezionati, controlli axe/tastiera/overflow configurati passati fino a 320 px. L'app compilata locale risponde health/config 200 e mantiene quattro migrazioni; nessun reset o nuovo seed. [Evidenza integrata](evidence/income-integration.json) e [review](../reviews/review-07-income-integration.md).

Le evidenze precedenti con il nome Soglia descrivono lo snapshot reddito originale e restano storiche. Le nuove schermate dell'integrazione sono [workspace mobile](evidence/income-integration-workspace-mobile.png), [consenso mobile](evidence/income-integration-consent-mobile.png), [vista proprietario](evidence/income-integration-owner-preview-desktop.png) e [chat guidata mobile](evidence/income-integration-chat-mobile.png). Nessun deploy, acquisto, verifica finanziaria reale, invio SMTP esterno o CI remota è stato eseguito.

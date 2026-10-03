# Review indipendente — reddito, consenso e accessi

Data: 2026-10-03. Ambito: estensione locale con dati sintetici. Il reviewer ha letto sorgenti, migrazione, contratto di prodotto e nuovi test; non ha scritto l’implementazione né avviato database, server o suite. L’esecuzione e la raccolta delle evidenze runtime sono affidate al coordinatore.

**Stato: PASS per il perimetro locale sintetico**, sulla base della review statica dopo le correzioni e del risultato finale di `npm run check` comunicato dal coordinatore: build/typecheck, 96 test unitari/API e 15 scenari browser, di cui 5 sul reddito, completati con exit 0. Il reviewer non ha eseguito queste prove. Il giudizio non è una certificazione di sicurezza né il via libera a dati reali; evidenze e limiti sono riportati nella [validazione dell’estensione](../operations/income-validation.md).

## Finding e correzioni riesaminate

| Gravità | Evidenza e conseguenza | Correzione verificata nel sorgente | Evidenza runtime |
|---|---|---|---|
| Importante, risolto | Inizialmente `POST /income/shares` riceveva soltanto invito e consenso e selezionava l’attestazione corrente. Anteprima A → sostituzione con B in un altro tab → conferma della vecchia anteprima poteva condividere B mai letta. | Il payload richiede `attestation_id` e il server lo confronta con l’attestazione corrente sotto il lock del titolare; una sostituzione produce 409. Il client invia l’ID del riepilogo mostrato. Riferimenti: `server/app.ts:1162`, `server/app.ts:1189`, `src/Income.tsx:499`. | Il coordinatore conferma pass delle regressioni API per anteprima obsoleta e corsa rinnovo/condivisione e della regressione browser con anteprima A ancora visibile. |
| Minore, risolto | Il form ammetteva motivi di contestazione fino a 500 caratteri, ma l’API ne accettava 300: un testo valido nel form falliva dopo l’invio. | `maxLength={300}` coerente con lo schema server. Riferimenti: `src/Income.tsx:251`, `server/app.ts:1240`. | Il coordinatore conferma pass del normale percorso browser di contestazione. L’allineamento del limite è stato riesaminato staticamente; non si rivendica una prova dedicata del carattere 301. |

Nessun altro difetto critico o materiale identificato nell’ambito statico esaminato. Le righe si riferiscono ai file letti dopo la correzione e prima di ulteriori eventuali modifiche del coordinatore.

## Autorizzazione e ciclo di vita

- Creazione demo ed emissione reale richiedono il ruolo candidato o entrambi. I dati demo arrivano da fixture server: scenario e categoria sono enum e gli oggetti sono strict; il client non può dichiarare importi, fornitori o documenti.
- `withInvitation` verifica partecipazione all’invito, email confermata e account attivo, blocca entrambi gli utenti in ordine e rilegge l’invito. Solo il candidato dell’invito può concedere accesso; il destinatario è ricavato dall’invito e non accettato dal client. La lettura destinatario lega grant, titolare, destinatario e invito.
- La fascia viene consegnata soltanto con grant non revocato, attestazione completata e non scaduta, contatto pendente valido oppure accettato, utenti attivi e nessun blocco. Le condizioni vengono ricontrollate a ogni richiesta; `clock_timestamp()` nella query evita di congelare la scadenza all’inizio della transazione. Un destinatario senza accesso riceve un riepilogo nullo e lo stesso stato generico, senza apprendere se il titolare abbia fallito, contestato o rifiutato il controllo.
- Revoca e contestazione sono limitate al titolare. Rinnovo, revoca e contestazione interrompono i grant precedenti nella stessa transazione; il rinnovo non trasferisce il consenso. Il trigger della migrazione impedisce di riscrivere le osservazioni. L’indice parziale impedisce più grant attivi sullo stesso invito.
- Il protocollo `lockUsers` è condiviso con blocco, sospensione e cancellazione, oltre che con rinnovo e revoca: le operazioni concorrenti si serializzano sul titolare o destinatario interessato. I test nuovi esercitano le corse con blocco, revoca e rinnovo; la compatibilità del protocollo con sospensione/cancellazione è stata esaminata staticamente, senza rivendicare una nuova prova di quelle corse.
- Cancellazione degli account, verifiche e inviti rimuove le attestazioni/grant dipendenti via foreign key. Il titolare sospeso conserva API proprie di consultazione/revoca ed export/cancellazione; un destinatario sospeso non conserva letture ordinarie. Blocco e sospensione chiudono/cancellano il contatto, quindi ripristinare l’account o rimuovere il blocco non riapre il vecchio invito.

I controlli riguardano accessi futuri al server. Un riepilogo già ottenuto, visualizzato o copiato non viene richiamato; il prodotto lo dichiara. Il client ricarica riaprendo il pannello, elimina dati quando cambia URL e li elimina in caso di errore; una pagina già aperta non è una prova di revoca remota delle copie.

## Minimizzazione, etichette e contratto provider

- `incomeAttestation` usa una proiezione esplicita comune all’anteprima e al destinatario. Esclude identificativo del titolare, riferimento provider, motivo della contestazione, documenti, conti, movimenti, importo esatto e punteggi. Export reddito e grant interroga solo il titolare autenticato; l’export del proprietario non incorpora gli attestati dei candidati.
- Discovery e compatibilità non consultano attestazioni o grant e non aggiungono badge o penalità. Pubblicazione, inviti e accettazione restano disponibili senza verifica del reddito. Gli eventi contengono soltanto nome e timestamp; il logger Fastify è disabilitato e il gestore errori registra nome/codice, senza corpo, URL, query o messaggi. Queste conclusioni sui log derivano da lettura del codice, non da intercettazione runtime.
- La migrazione accetta solo osservazioni `synthetic=true`. Il riepilogo e il provider dichiarano esplicitamente dati sintetici; l’etichetta completata è «Esempio completato». Non viene presentato un badge reale «certificato» e non esiste un controllo documentale o caricamento finanziario abilitato.
- `IncomeProvider` definisce richiesta tramite riferimento di autorizzazione e risultato con emittente, riferimento, periodo, data, scadenza e fascia. L’implementazione reale è indisponibile e restituisce 503; la demo è esclusa in produzione. Il contratto locale non equivale a un’integrazione reale: autentica dei callback, idempotenza, autorizzazione d’uso, copertura Italia, metodo per autonomi/entrate variabili, retention e assistenza restano dipendenze esplicite nel [contratto di prodotto](../product/04-income-attestation.md).

## Chiusura del gate

I nuovi sorgenti test coprono consenso esplicito, isolamento per destinatario/invito, input vietati, stati sintetici, scadenza a runtime, revoca, contestazione, sostituzione, corse e diritti sui dati. Il browser aggiunge percorso senza reddito, scelta da tastiera, responsive/axe, anteprima destinatario, revoca, contestazione e anteprima obsoleta.

Il coordinatore ha confermato il risultato finale di `npm run check`: build/typecheck, 96 test unitari/API e 15 scenari browser passati, con exit 0. La [validazione dell’estensione](../operations/income-validation.md) contiene l’evidenza runtime del coordinatore; il reviewer si è limitato alla lettura del sorgente e dei test. Le correzioni finali al messaggio di durata, al conteggio delle migrazioni e alla propagazione dell’exit code del runner non cambiano i controlli di accesso del reddito.

**Chiusura locale: PASS.** Nessun finding critico o materiale resta aperto nel perimetro esaminato. Rimangono i limiti dichiarati: concurrency sospensione/cancellazione verificata nel protocollo sorgente, nessuna certificazione di penetration test e nessuna integrazione reale. Nessun deploy, acquisto, contatto con utenti/provider o prova con dati finanziari reali è incluso.

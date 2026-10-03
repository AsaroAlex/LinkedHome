# Audit UX/UI e accessibilità — percorso principale e reddito

Audit eseguito il 3 ottobre 2026 sull’app locale avviata dal coordinatore, con Chromium `/usr/bin/chromium`, Playwright e axe. Non sono stati intervistati utenti reali. Le osservazioni identificano comportamenti e rischi del prototipo; non misurano frequenza dei problemi, conversione o domanda.

## Metodo ed evidenza

Desktop 1440×1000, mobile 390×844; ulteriore controllo della landing a 320×740. Account sintetici separati per chi cerca, chi offre e il doppio ruolo, con sessioni browser indipendenti. I messaggi locali sono stati letti solo per confermare quegli account; token, password e caselle locali non compaiono negli artefatti. Il pannello con l’email in Account è mascherato negli screenshot.

L’audit e l’implementazione erano contemporanei: il controllo delle modifiche non salvate al profilo è entrato via HMR prima della sua acquisizione. Di conseguenza `income-baseline-profile-dirty-desktop.png` documenta la prima correzione, non una schermata precedente al fix. Il rischio iniziale U01 deriva dal codice letto prima della modifica; il comportamento corretto è stato poi verificato nel browser. Gli altri screenshot precedono l’integrazione dell’attestazione reddituale nella navigazione. I file con prefisso `income-baseline-*` sono un gruppo di evidenze di questa sessione, non una promessa di un’unica revisione Git immutabile.

Risultati grezzi: [audit browser](../operations/evidence/income-baseline-audit.json) e [supplemento tastiera/invito/scadenza](../operations/evidence/income-baseline-supplement.json). Le scansioni axe coprono WCAG 2 A/AA e WCAG 2.1 AA; zero violazioni rilevate in 24 acquisizioni non prova piena conformità, né sostituisce prove con tecnologie assistive e partecipanti.

## Percorsi realmente osservati

| Percorso | Attività ed esito | Evidenza |
|---|---|---|
| Onboarding | Registrazione via UI dei ruoli tenant, landlord e both; dashboard non confermato; conferma tramite token locale sintetico; navigazione differente per ruolo | `income-baseline-register-desktop.png`, `income-baseline-register-mobile.png`, `income-baseline-both-dashboard-desktop.png` |
| Preferenze | Primo stato senza preferenze, salvataggio privato, anteprima, modifica successiva, pubblicazione deliberata. Con il fix attivo, budget 1800 non poteva essere pubblicato prima di salvarlo; la risposta server finale conteneva 1800 | `income-baseline-profile-empty-desktop.png`, `income-baseline-profile-dirty-desktop.png`, `income-baseline-profile-mobile.png` |
| Immobile | Stato senza immobile, creazione via UI, errore reale durata minima 24 / massima 12, correzione, autodichiarazione, salvataggio in bozza e pubblicazione separata | `income-baseline-discovery-empty-desktop.png`, `income-baseline-property-validation-desktop.png`, `income-baseline-property-draft-desktop.png`, `income-baseline-property-published-desktop.png` |
| Discovery | Scelta del proprio immobile, soli profili pseudonimi, confronto dei cinque criteri, assenza di nomi/email. Invito via pulsante della UI nel supplemento; conferma e rimozione del profilo invitato | `income-baseline-discovery-desktop.png`, `income-baseline-discovery-mobile.png`, `income-baseline-invitation-sent-mobile.png` |
| Inviti | Offerta e scadenza leggibili, confronto apribile, accettazione via UI e link alla conversazione; su un’altra coppia rifiuto via UI e stato terminale | `income-baseline-invitation-pending-mobile.png`, `income-baseline-invitation-comparison-mobile.png`, `income-baseline-invitation-accepted-mobile.png`, `income-baseline-invitation-declined-desktop.png` |
| Conversazione | Stato iniziale vuoto, invio da entrambe le sessioni, recupero del messaggio altrui con “Messaggi recenti”, blocco con rimozione del compositore | `income-baseline-chat-empty-mobile.png`, `income-baseline-chat-mobile.png`, `income-baseline-chat-blocked-mobile.png` |
| Verifiche | Provider identità/reddito dichiarato assente; account localmente confermato; caricamento con rete ritardata; errore reale con token sintetico invalido | `income-baseline-verification-mobile.png`, `income-baseline-verification-loading-mobile.png`, `income-baseline-verification-invalid-mobile.png` |
| Controllo dati | Download reale dell’export `soglia-dati.json`; apertura della conferma password + ELIMINA senza cancellare l’account; lista blocchi vuota | `income-baseline-settings-desktop.png`, `income-baseline-settings-mobile.png` |

La prima coppia di inviti del percorso esteso era predisposta via API per isolare accettazione, chat e rifiuto; l’invio attraverso il controllo della UI è stato eseguito separatamente nel supplemento. Nessun evento sintetico dimostra un incontro commerciale.

La schermata di invito scaduto è stata verificata con una **risposta API trasformata soltanto nel browser di audit**: `income-baseline-invitation-expired-fixture-mobile.png`. Il badge è “Scaduto”, l’accettazione è assente e la non riapertura è spiegata. Non è una verifica del passaggio server allo scadere del tempo. L’errore “Link non valido o scaduto” è invece una risposta server reale a un token invalido, non una prova di un token valido lasciato scadere. I controlli backend della nuova estensione devono coprire separatamente la scadenza effettiva.

## Problemi e priorità

Gravità: **S2** ostacolo significativo o rischio di comprensione/controllo; **S3** attrito circoscritto. Nessun blocco S1 è stato osservato nel percorso principale sintetico. P1 indica una correzione da includere nel lavoro corrente; P2 una correzione successiva o valutabile in base alla capacità disponibile.

| ID | Evidenza | Conseguenza per l’attività | Gravità / priorità | Correzione proposta |
|---|---|---|---|---|
| U01 | Nel codice iniziale `ProfilePage` pubblicava il record salvato mentre il form permetteva altre modifiche, senza stato dirty. Il browser ha osservato il fix HMR: form 1800, anteprima salvata 1200, pulsante bloccato e spiegazione | L’utente poteva credere di pubblicare le nuove preferenze e condividere invece una versione precedente | S2 / P1, prima correzione verificata | Distinguere dati salvati e modifiche; bloccare la pubblicazione finché non si salva; mantenere il testo digitato se si mette in pausa |
| U02 | Ritardo di 1500 ms di `/api/verification`: su account già confermato appaiono “Conferma locale da confermare” e “Invia di nuovo la conferma”, senza stato di caricamento. JSON `states` e screenshot loading | Un dato ancora sconosciuto diventa un’affermazione falsa e suggerisce un’azione inutile; con stati reddituali sarebbe una perdita di fiducia maggiore | S2 / P1 | Caricamento esplicito prima di leggere lo stato; errore con possibilità di riprovare; nessun esito o CTA derivato dall’assenza temporanea dei dati |
| U03 | Dopo pubblicazione profilo, accettazione/rifiuto invito e invio messaggio, `document.activeElement` torna a BODY. `useLoad.reload()` azzera i dati e smonta i controlli prima di caricarli di nuovo | La persona che usa la tastiera perde la posizione e deve ritrovare l’azione successiva | S2 / P1 | Conservare i dati durante il ricaricamento della stessa URL, oppure spostare deliberatamente il focus sul nuovo esito/azione; preservare la gestione separata dei cambi di percorso |
| U04 | Token invalido: alert “Link non valido o scaduto”, ma l’unica azione resta “Conferma email” e ripete lo stesso token | Il recupero dopo errore/scadenza non è immediatamente disponibile, proprio prima di pubblicare o contattare | S2 / P1 | Offrire nell’errore il percorso pertinente per nuova conferma o nuovo recupero; spiegare che il link precedente non può essere usato |
| U05 | In discovery le date del criterio Ingresso sono ISO (`2026-12-01`, `2027-01-01`) e spezzano su mobile, mentre i dettagli dell’invito usano date italiane | Confronto più lento e meno uniforme tra compatibilità e offerta | S3 / P2 | Formattare entrambe le date con il formatter italiano già usato nel prodotto |
| U06 | Durata massima 12 inferiore alla minima 24: alert corretto e focalizzato, ma il refine senza field non associa l’errore ai due campi | Chi torna al form deve cercare da solo i campi da correggere; meno guida per lettori di schermo | S3 / P2 | Associare la validazione a `max_months` e/o `min_months`, mantenendo il riepilogo accessibile |
| U07 | Dopo Declina, feedback “Invito aggiornato”. La coppia è terminale e il testo “non può essere riaperto” compare dopo l’azione | Il rifiuto non conferma chiaramente la decisione e la limitazione della demo può sorprendere | S3 / P2 | Feedback “Invito declinato”; spiegare prima l’effetto terminale della demo e indicare una strada comprensibile per una nuova ricerca nel modello futuro |
| U08 | Immobile pubblicato richiede riconferma entro 30 giorni; card mostra azione ma non ultima riconferma o data di validità | Il proprietario deve ricordare quando agire e può scoprirne il bisogno entrando in discovery | S3 / P2 | Mostrare ultimo aggiornamento e data di validità, con CTA coerente vicino allo stato |

La verifica del reddito non va aggiunta come badge di scoperta né come precondizione di pubblicazione: l’attuale discovery senza classifiche e senza verifiche visibili costituisce un vincolo positivo da preservare. La nuova schermata deve rendere separati esito del controllo, validità e accesso di uno specifico destinatario; non può riutilizzare l’assenza di dati come “non verificato”.

## Risultati positivi da preservare

Nessun overflow orizzontale nelle acquisizioni desktop/mobile; landing anche a 320 px. Form, card e principali controlli si dispongono in una colonna su mobile. I colori di testo e controlli hanno superato i controlli di contrasto axe nelle acquisizioni; non è stata svolta una prova con utenti ipovedenti.

Etichette native, focus visibile, errori con `role=alert` e focus sull’alert, informazioni di privacy prima di pubblicare/accettare, compatibilità basata su fatti e nomi pseudonimi sono già utili. Il confronto dell’invito si apre con Enter sul summary; il link “Vai al contenuto” è raggiungibile e visibile con la tastiera. I cambi di percorso focalizzano l’h1. La continuità del focus dopo azioni nello stesso percorso rimane il problema U03. Lo stato di blocco impedisce visivamente nuovi messaggi e spiega la chiusura.

Il download dei dati e la conferma di cancellazione sono distinguibili; nel test non è stata eseguita la cancellazione. La moderazione e la sicurezza dell’export non sono state rivalutate in questo audit UX: richiedono gli specifici controlli tecnici del repository.

## Limiti e prossima verifica

Sono stati osservati Chrome desktop e mobile emulato, non Safari/iOS, Android fisico, zoom elevato o lettori di schermo. Gli stati economici della nuova estensione sono fuori da queste evidenze iniziali e devono avere screenshot e prove successivi. Il ritardo di rete e l’invito scaduto erano perturbazioni controllate e sono esplicitamente indicati; non sono episodi reali di utenti.

Nessuna intervista o soglia di successo è inventata. Nel prossimo test moderato far completare ai due ruoli un percorso neutrale: preparare preferenze/immobile, comprendere una compatibilità, decidere su un invito, spiegare cosa vedrà il destinatario di un esempio reddituale, concedere accesso e poi revocarlo. Rilevare completamento, tempo, punti di esitazione e comprensione di provenienza/periodo/scadenza; chiedere “Quali informazioni ti servono per decidere il passo successivo?” prima di nominare il reddito. Separare il valore dichiarato dal comportamento osservato e dalla propensione al pagamento.

## Correzioni e verifica successive del coordinatore

U01–U08 sono stati affrontati nel codice: blocco pubblicazione dirty; loading/errori affidabili nelle verifiche; dati conservati durante reload stessa URL e focus sull’esito; nuova conferma/recupero da errore link; date italiane; associazione errore durata ai campi con spiegazione preservata; feedback rifiuto esplicito; validità e riconferma immobili. La limitazione terminale dell’invito resta un contratto della demo, descritta nell’interfaccia e non riaperta dalla verifica.

La suite completa successiva passa 96 unit/API e 15 browser. I nuovi stati e controlli reddituali, le schermate finali e i limiti sono in [income-validation](../operations/income-validation.md); le immagini baseline restano evidenza del momento originario e non vengono sostituite retroattivamente.

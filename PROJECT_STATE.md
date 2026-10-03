# PROJECT STATE

Aggiornato il 2026-10-03. Repository `/workspace/LinkedHome`, branch locale `work`, riferimento remoto richiesto `claude/sweet-goldberg-5lwng7`. L’utente ha autorizzato **«Esegui tutto il piano del repository»**, incluse revisioni indipendenti A–H. Le fasi 0–28 sono **completate per il perimetro locale con dati sintetici** adottato in PLAN e nel contratto delle funzionalità.

Preservare questo checkout isolato: niente reset, switch, worktree, pull automatici o perdita dei dati ignorati. Nessun push, PR, deploy pubblico, servizio a pagamento o contatto esterno è stato effettuato.

## Risultato

Dossier di ricerca consolidato e verificato nei limiti dichiarati, seguito da prodotto, naming provvisorio **Soglia**, UX, design e architettura. Implementato un monolite TypeScript/Fastify/React/Vite con PostgreSQL nativo, senza Docker obbligatorio. Il nome non ha clearance; italiano completo, struttura locale EN preparata senza traduzione completa.

Funzionano bootstrap/migrazioni/seed, autenticazione e conferma/reset con messaggi locali, ruoli tenant/landlord/both e staff separato, profili privati/pubblicati, immobili, compatibilità spiegata, inviti con revisioni e snapshot, chat paginata, blocchi/segnalazioni, moderazione/sospensione/ricorso, export/cancellazione e conteggi locali. Nessun documento reale, pagamento, punteggio persona, ML o provider identità/reddito. La posta locale non prova il controllo di una vera casella.

Quattro panel indipendenti sono documentati: ricerca (review02), prodotto/design/ADR (review03), implementazione (review04), revisione finale (review05). Il gate finale è PASS per lo scope locale; i rilievi materiali sono corretti. I revisori hanno ispezionato il lavoro; il coordinatore ha eseguito i test.

## Verifiche concluse

- `npm run check`: build/typecheck, **71 test unitari/integrati** e **10 scenari browser** passati.
- Axe senza violazioni nei controlli configurati, navigazione da tastiera e controlli responsive; screenshot finali ispezionati e conservati.
- LCP locale desktop 244 ms; mobile emulato 2.252 ms con CPU4×, rete200kB/s e latenza80ms; CLS0. Sono misure sintetiche, non dati sul campo.
- `npm audit`: 0 vulnerabilità note nel registro consultato, 222 dipendenze censite; nessuna certificazione di sicurezza implicita.
- `npm ci`, bootstrap ripetuto e script completo `scripts/cloud-install.sh` eseguiti con successo.
- Avvio compilato, avvio dev, arresto e riavvio verificati tramite health, HTML/asset, login, immobili, discovery, dashboard e logout. Preservati gli stessi 5 utenti, 2 profili, 1 immobile e 3 migrazioni.
- Manutenzione manuale eseguita; nessuno scheduler configurato.

Evidenze e limiti: `docs/operations/validation.md`. Correzioni finali includono recupero password dei sospesi senza ripristinare i contatti, export dei propri ricorsi, dashboard oltre 100 inviti, rilascio garantito del client dopo errore di migrazione e wording corretto della conservazione manuale.

## Ambiente e ripresa

Node24.19.0, npm11.9.0, PostgreSQL18.4, Chromium151.0.7922.173 in `/usr/bin/chromium`. Installazione: `bash scripts/cloud-install.sh`; avvio: `npm start`, oppure `npm run dev`. PostgreSQL su loopback55432, UI/API3000; in dev API3001 con proxy. Al termine del lavoro l’app compilata è avviata, ma non presumere che i processi persistano fra task.

`.local/database.json`, `.local/demo-accounts.json` e `.local/mail/` sono generati e ignorati; non stampare né committare credenziali/token. Credenziali con permessi0600. Il bootstrap è ripetibile e rifiuta database esterni. Con `DATABASE_URL`, migrare solo esplicitamente; startup controlla il ledger senza DDL.

`npm test` usa soltanto `soglia_test`; E2E usa `soglia_e2e` e necessita porta3000 libera. Non eseguire in parallelo processi proprietari del ciclo start/stop del DB. L’app usa `soglia`, preservato dai test. Non cancellare il cluster per risolvere errori: il recupero dei lock è limitato a processi dimostrabilmente morti nel cluster generato.

## Configurazione cloud

Bozza salvata e riletta con successo, **revisione 5**: install_script completo identico a `scripts/cloud-install.sh`, start_skill in `docs/operations/cloud-start.md`. Conservati i 12 domini personalizzati e il preset package_managers; nessun segreto esterno richiesto. Le vecchie istruzioni che descrivevano un repository soltanto documentale sono sostituite.

Salvare la bozza non pubblica lo snapshot né valida il ripristino in un nuovo task. I commit sono locali e il remoto non è aggiornato; il ripristino dei commit locali non pubblicati non è garantito dalla piattaforma. Non aggirare questo limite con reset o push non richiesti. Nessun nuovo task ripristinato o CI remota è stato verificato.

## Contratti da mantenere

- Profili privati fino a pubblicazione deliberata. Prima del match solo campi approvati; dopo accettazione nome scelto e chat, senza email/documenti.
- Edit e pausa annullano inviti pendenti; riconferma immobile senza modifiche li conserva. Le coppie con invito terminale non vengono riaperte in questo prototipo a singolo episodio.
- Ordine fisso per hash immobile/profilo con cursore: non rotazione o equità dimostrata. Nessun badge aumenta visibilità.
- Sessioni revocate alla sospensione; login e recupero consentono soltanto diritti/ricorso, senza riattivare contatti. I ricorsi propri sono esportabili.
- Report altrui mantengono il solo contesto selezionato dopo eliminazione dell’accusato. La manutenzione manuale elimina casi oltre 30 giorni; nessuna cancellazione automatica o durata massima garantita localmente.
- Inviti accettati/chiusi mantengono lo snapshot dell’offerta; cambi successivi sono indicati.

## Commit e lavoro successivo

`a5d4e80`: consolidamento ricerca; `d47a214`: evidenze/revisione indipendente; `c0180de`: prodotto/design/ADR; `0185593`: MVP e suite di test. Evidenze finali, stato e configurazione sono nel commit documentale successivo. Nessun push.

Non rimangono fasi locali aperte o approvazioni pendenti. Per un futuro rilascio reale seguire `docs/operations/release-checklist.md`: ricerca utenti, consulenza aggiornata, ruoli/informative/DPIA, provider, operazioni e supporto, infrastruttura/restore, retention, naming e misure su coorti. Non inventare questi risultati né considerarli verificati dalla demo.

Il brief integrale originario di 52 sezioni non è nel checkout: PLAN e il contratto adottato delimitano il lavoro verificabile. La ricerca conserva le distinzioni fra fonti lette, bloccate e ipotesi: 566 riferimenti bibliografici non equivalgono a 566 fonti verificate. Non ricominciare la ricerca o chiedere nuove approvazioni per correzioni già autorizzate.


## Completamento successivo alla richiesta «Completa»

Verificate installazione e avvio da export pulito di `de15065`, senza riuso di dipendenze/database/credenziali, e un backup/ripristino PostgreSQL reale in database usa e getta. Tutte le 14 tabelle e le sequenze coincidevano; login/discovery/export sul ripristinato riusciti. Database originale invariato e file/database temporanei sensibili rimossi. Evidenze in `docs/operations/evidence/clean-install.json` e `recovery.json`; il primo è una prova sulla stessa macchina, non un nuovo task.

Per rendere attivo uno snapshot cloud rimane un’operazione dell’interfaccia della piattaforma: pubblicazione e riconnessione. Gli strumenti disponibili salvano/leggono bozze, non pubblicano né creano un task ripristinato. Non manca un’approvazione da ripetere in chat. Le istruzioni aggiornate documentano esplicitamente questo confine operativo. Nessun deploy pubblico o push implicito effettuato.

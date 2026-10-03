# Verifica indipendente dell'integrazione dopo pull

**Stato finale:** schema locale aggiornato a 4 migrazioni, dati e credenziali preservati; avvio e probe HTTP passati. App e DB sono fermi dopo i controlli.

Verifica eseguita il 2026-10-03 nel checkout `/workspace/LinkedHome`, commit `9db6a9cc80706049a39be6c56ee42ecdfbabe379`, con Node 24.19.0 e npm 11.9.0. È una nuova esecuzione dei controlli sul risultato integrato, non una ripresa dei numeri presenti nei documenti storici. Il verificatore non ha modificato codice applicativo.

## 1. Verifica del codice, prima della migrazione applicativa

| Controllo osservato | Risultato |
|---|---|
| Installazione bloccata | `npm ci`: exit 0 |
| Comando completo | `npm run check`: exit 0 |
| Build/typecheck | Passati; 117 moduli, JS 393,82 kB / 116,59 kB gzip, CSS 27,94 kB / 7,00 kB gzip |
| Backend/unità/integrati/SMTP | 161 test passati, 7 file, 16,28 s |
| Browser core/reddito/mail | 19 scenari passati, 33,9 s |
| Browser esperienza/mail | 11 scenari passati, 12,7 s |
| Scenari browser distinti | 26: i quattro scenari mail sono eseguiti in entrambe le suite |
| Preservazione dell'app | Conteggi e fingerprint aggregati delle righe identici per tutte le 14 tabelle pubbliche, prima/dopo |
| Record principali preservati | 5 utenti, 2 profili, 1 immobile, 3 migrazioni |
| File locali | Configurazione DB e credenziali demo identiche, permessi compresi; nessun contenuto stampato |
| Processi | Nessun listener residuo su 3000, 3017 o 55432 al termine della verifica |

I runner adottati rifiutano un `DATABASE_URL` esterno e usano i database generati `soglia_test` e `soglia_e2e`. La suite esperienza usa API simulate e un server frontend su loopback 3017. La preservazione è stata verificata con letture SQL impostate in modalità read-only sul database applicativo `soglia`: in questa prima fase nessun bootstrap, seed, reset o migrazione è stato applicato all'app. Le snapshot temporanee di confronto sono state eliminate dopo aver salvato il risultato, senza pubblicare righe o credenziali.

Non sono emersi errori dei controlli. Il warning Node relativo a `NO_COLOR` e `FORCE_COLOR` è non bloccante. Le verifiche browser configurate includono accessibilità/responsività nelle pagine campionate; non equivalgono a certificazione WCAG, collaudo su dispositivi fisici o studio con utenti.

**Stato prima del completamento:** il database applicativo conservava tre migrazioni. I test usavano fixture isolate aggiornate. La migrazione 004 è stata successivamente applicata e l’avvio verificato nella sezione 2; il codice locale già esegue migrazioni al normale avvio.

Non sono stati eseguiti invii SMTP esterni, integrazioni provider reddito o pagamenti, deploy pubblico, CI remoto o push. Questi risultati stabiliscono l'integrazione locale del codice controllato; non validano redditività, domanda o disponibilità commerciale delle integrazioni.

Evidenza strutturata: [JSON](evidence/pull-economics-integration.json). Log del comando: [npm run check](evidence/pull-economics-check.log). Le snapshot private di confronto non sono pubblicate.

## 2. Completamento: schema locale e avvio dopo pull

Su istruzione del coordinatore, dopo i controlli sopra è stata applicata anche la migrazione incrementale dell'app. Il precedente stato a tre migrazioni è conservato qui come evidenza storica; **lo schema locale è ora aggiornato e l'avvio verificato**.

Prima di qualsiasi DDL sono stati verificati il target reale `soglia`, indirizzo server `127.0.0.1`, porta `55432`, e l'assenza di `DATABASE_URL`, impostazioni SMTP o ambiente esterno. La migrazione 004 non elimina dati/tabelle/colonne: aggiunge due tabelle e metadati, amplia due CHECK sostituendoli e aggiunge un vincolo coerente con gli stati preesistenti. I CHECK correnti sono stati letti dal catalogo; `verification_checks` ed `events` erano vuoti. L'esecuzione adottata è `npm run db:migrate`, exit 0, con il servizio DB locale avviato tramite `npm run db:start`; nessun bootstrap, seed o reset.

| Controllo dopo migrazione e avvio | Risultato osservato |
|---|---|
| Vecchie tabelle dati | Tutte le 13 tabelle preesistenti diverse dal ledger: conteggi e fingerprint delle righe invariati |
| Ledger | Tre vecchi record invariati; unica nuova migrazione `004_income_attestations.sql`, quattro totali |
| Tabelle reddito | `income_attestations`: 0; `income_shares`: 0; sedici tabelle pubbliche totali |
| Config/credenziali | Contenuti e permessi invariati; nessun dato stampato |
| Avvio compilato | `npm start`: Doorluma pronta, ambiente locale |
| Readiness | `/api/health`: 200, `ok=true`, ambiente `local` |
| Config sicura | `/api/config`: 200, ambiente `local`, trasporto mail `local` |
| Frontend | `/`: 200, titolo Doorluma, `noindex,nofollow`; asset JavaScript compilato: 200 |
| Effetto delle probe | Snapshot di tutte le sedici tabelle identica prima/dopo le richieste GET |
| Stato finale processi | App e servizio DB fermati con SIGINT; nessun listener residuo su 3000/3017/55432 |

L'app era ferma all'inizio ed è stata lasciata nello stesso stato dopo le prove. Il wrapper interattivo npm riporta exit 1 su Ctrl+C; le probe di avvio sono passate e non è comparso alcun errore applicativo. `server/main.ts` esegue già la migrazione automaticamente nel solo ambiente locale: la nota iniziale descriveva correttamente lo schema ancora vecchio, ma attribuiva un limite troppo severo all'avvio. Per i database esterni l'app continua soltanto a verificare il ledger e non applica DDL automatico.

Il comando completo `npm run check` non è stato ripetuto: nessun codice è cambiato e la sola 004 era già stata esercitata sui DB di test dal comando passato. Il completamento verifica invece l'esecuzione della stessa migrazione sull'app preservata e il runtime risultante. Nessun esempio reddituale è stato creato, nessun destinatario contattato e nessun provider/deploy/push eseguito.

Evidenze aggiuntive: [preservazione dopo migrazione](evidence/pull-economics-migration.json) e [probe runtime](evidence/pull-economics-runtime.json). Il JSON principale mantiene integralmente il primo risultato in `initial_verification` e aggiunge lo stato finale aggiornato. Le snapshot private del secondo confronto sono state eliminate dopo l'aggregazione.

# Sviluppo iterativo di LinkedHome

Questa guida descrive il checkout corrente e il ciclo modifica → test → feedback. Il percorso di sviluppo usa dati sintetici e gli strumenti già presenti nel repository. La configurazione di staging e i servizi per utenti reali restano nel percorso separato di [deployment](deployment.md).

## Questa chat Codex in cloud: percorso corrente

La richiesta corrente è un'esperienza iterativa in questa chat Codex, sullo stesso checkout cloud. L'assistente modifica i file, riproduce il feedback, corregge la causa e mantiene pronto il servizio per il test successivo. Frontend, API, database e convenzioni esistenti restano il punto di partenza di ogni iterazione.

Il comando ordinario è `npm run dev`: un supervisor mantiene PostgreSQL, API watch e Vite HMR. I dati sintetici persistono in `.local/`; le modifiche frontend si aggiornano con hot reload e le API si riavviano senza fermare il database. Non serve un push dopo ogni modifica: Git resta disponibile per salvataggi/versioni richiesti.

Per il test manuale dal computer serve un URL di preview in ingresso fornito dal runtime Codex verso Vite3000. API3001 e PostgreSQL55432 restano loopback; l'origin del browser deve corrispondere ad `APP_ORIGIN`. Quando il runtime fornisce effettivamente un URL, `npm run dev:cloud` abilita il binding della UI per quel forwarding.

Limite corrente: l'app è eseguibile nell'ambiente cloud, ma gli strumenti del runtime disponibili non forniscono un URL di preview in ingresso. La prova manuale dal computer è quindi bloccata dall'accesso alla preview. `127.0.0.1` del cloud non è il localhost del computer. Continuare il lavoro e le verifiche interne in questo checkout, riportando il limite senza dichiarare raggiungibile un URL non disponibile.

La [guida alla preview Browser di Codex](https://developers.openai.com/codex/browser#preview-a-page) descrive l'avvio dal terminale integrato; non fornisce un collegamento in ingresso a questo runtime cloud. Le [limitazioni cloud](https://developers.openai.com/codex/environments/cloud-environments#current-limitations) relative a Computer/browser use riguardano l'automazione dell'agente e sono distinte dalla preview manuale. Il blocco qui identificato è la mancanza di una route/URL in ingresso negli strumenti disponibili. Anche l'[handoff tra host](https://developers.openai.com/codex/remote-connections#hand-off-a-chat-between-hosts) non supporta il cloud: non presumere un trasferimento automatico della chat o dei processi. La preview manuale resta da verificare quando il runtime fornisce effettivamente l'accesso.

## Riferimento tecnico: avvio locale

Richiesti Node24, npm11 e un ambiente Linux/macOS non-root compatibile con il pacchetto PostgreSQL nativo. `.nvmrc` indica Node24.19.0; `package.json` richiede Node `>=24 <25`. Il devcontainer è disponibile anche per lavorare da un computer senza questi prerequisiti installati sull'host.

```bash
npm ci
npm run dev
```

`npm run dev` prepara la configurazione locale mancante, applica le migrazioni e crea gli account sintetici solo al primo setup. Poi mantiene PostgreSQL avviato, avvia l'API con riavvio automatico e Vite con React Fast Refresh. Le credenziali generate restano in `.local/demo-accounts.json`, ignorato da Git e con permessi0600.

Apri `http://127.0.0.1:3000` sul computer che esegue il servizio. Usa quell'origin anche durante login, salvataggi e altri test manuali: l'API verifica esattamente l'header `Origin` delle richieste che modificano dati.

Il terminale mostra output di avvio, errori di Vite e diagnostica del backend. Lascialo aperto durante le prove. Ctrl+C arresta UI, API e il database locale quando il comando ne possiede l'avvio. I dati salvati in `.local/postgres` sopravvivono al riavvio; sessioni e account sono nel database, non nella memoria del processo API.

## Riferimenti tecnici: Codex locale e Dev Container

Le configurazioni locali e Dev Container/Codespaces restano riferimenti tecnici già presenti. La scelta corrente rimane questa chat cloud; questi riferimenti non costituiscono il passaggio successivo richiesto all'utente.

Nel percorso locale app e assistente condividono la cartella del computer e possono usare l'azione **Run** di Codex con `npm run dev`; i dettagli dell'interfaccia sono nella [guida degli ambienti locali](https://developers.openai.com/codex/app/local-environments/). La chat cloud corrente non può eseguire comandi sul Mac. Non trasferire `.local/` o credenziali tramite Git.

## Esecuzione cloud interattiva

Il modello adatto al progetto è un singolo ambiente di sviluppo con tre processi: Vite accessibile attraverso la preview della piattaforma, API e PostgreSQL su loopback. Vite inoltra `/api` al backend sullo stesso origin; il browser non ha bisogno di una seconda porta esposta o di CORS.

```bash
npm run dev:cloud
```

Questo comando abilita il binding Vite su `0.0.0.0` e richiede un `APP_ORIGIN` esplicito oppure un origin ricavabile dal supporto Codespaces esistente. La piattaforma deve inoltre inoltrare la porta3000: il binding da solo non produce un indirizzo pubblico. PostgreSQL e API restano su `127.0.0.1`.

Il supporto Codespaces già esistente ricava l'origin dalle variabili della piattaforma e dalla porta configurata. Per un URL generico di preview si imposta `APP_ORIGIN` all'esatto origin del browser prima di avviare il servizio. Controllare i permessi di accesso della preview sulla piattaforma. Le email di conferma/reset usano questo stesso origin nei loro link.

La configurazione `.devcontainer/devcontainer.json` usa Node24 e un utente non-root e installa le dipendenze dopo la creazione. Apri un terminale del workspace ed esegui `npm run dev`: il terminale gestisce la sessione e conserva i log. La porta3000 è inoltrata con visibilità privata predefinita e apertura nel browser; il forwarding locale richiede la stessa porta3000. Non viene aggiunto un daemon in background. Evita un secondo comando dev finché il primo usa quelle porte.

I processi restano attivi durante la sessione dell'ambiente. La sospensione o ricreazione dell'host può fermarli; la durata e conservazione del filesystem dipendono dalla piattaforma. Dopo un riavvio si rilancia `npm run dev` dopo aver verificato i listener. Non è garantita la persistenza dei dati se la piattaforma elimina il volume di lavoro.

Nel cloud Codex la chiusura del terminale temporaneo può interrompere il supervisor anche fra due messaggi. Per lasciare il servizio pronto durante la stessa sessione dell’host, l’agente avvia direttamente `node --import tsx scripts/dev.ts` tramite un processo Node separato dal PTY (`spawn` con `detached: true`, stdin ignorato, stdout/stderr su un file privato, poi `unref()`). Il PID esatto e il log sono in `.local/dev-runtime.pid` e `.local/dev-runtime.log`, ignorati da Git. Prima di riavviare controllare PID, comando e listener; arrestare con SIGTERM soltanto il supervisor verificato. Una nuova chiamata shell deve confermare health e frontend. Questo avvio non crea un URL pubblico né mantiene il servizio dopo la sospensione dell’host. Sul computer locale il terminale aperto con `npm run dev` resta il percorso ordinario.

Nell'ambiente cloud Codex corrente non è disponibile un URL di preview in ingresso. Un listener locale verificato non dimostra che il browser del computer dell'utente possa raggiungerlo. Il percorso resta questa chat e questo checkout; la preview manuale dipende dal runtime, mentre analisi, modifiche e verifiche interne possono continuare.

## Configurazione di sviluppo

Il comando di sviluppo legge il file facoltativo `.env.development.local`, ignorato da Git. Le variabili già presenti nell'ambiente hanno precedenza. Gli altri comandi backend non caricano automaticamente `.env`: per quei comandi le variabili vanno fornite attraverso il terminale o il gestore di ambiente della piattaforma. `.env.example` resta un riferimento di configurazione, non contiene segreti e non è una configurazione attiva.

Esempio per una preview con un origin fornito dalla piattaforma:

```dotenv
DEV_HOST=0.0.0.0
DEV_PORT=3000
DEV_API_PORT=3001
APP_ORIGIN=https://preview.example.test
```

Sostituisci l'origin di esempio con quello reale della preview. Un URL con percorso, query, credenziali o frammento non è un origin valido. Dopo una modifica a questo file o alle porte, riavvia l'intero comando di sviluppo.

| Variabile        | Uso nello sviluppo                                                                                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEV_HOST`       | Binding Vite; default `127.0.0.1`, `0.0.0.0` per port forwarding cloud.                                                                                                                                                                                                                                         |
| `DEV_PORT`       | Porta Vite, default3000; la porta richiesta deve essere libera.                                                                                                                                                                                                                                                 |
| `DEV_API_PORT`   | Porta privata dell'API, default3001; deve differire dalla porta UI.                                                                                                                                                                                                                                             |
| `APP_ORIGIN`     | Origin esatto del browser; default `http://127.0.0.1:<DEV_PORT>` con binding loopback, `http://localhost:<DEV_PORT>` con `DEV_HOST=0.0.0.0` o origin Codespaces derivato. Il valore esplicito prevale; `dev:cloud` richiede un valore esplicito o Codespaces. Usato per controllo delle mutazioni e link email. |
| `APP_ENV`        | `local` per questo workflow; simulatori sintetici disponibili.                                                                                                                                                                                                                                                  |
| `MAIL_TRANSPORT` | `local` per questo workflow; email scritte in file privati.                                                                                                                                                                                                                                                     |

`npm run dev` rifiuta configurazioni con database esterno, SMTP reale o ambiente staging/production. Non rimuove o sostituisce silenziosamente queste variabili. Il percorso iterativo gestisce soltanto il cluster locale generato: se il terminale eredita configurazione di altri ambienti, usa una sessione dedicata con le variabili corrette.

Altre variabili già supportate dal repository:

| Variabile                                                           | Componente e significato                                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HOST`, `PORT`                                                      | Binding e porta di `npm start`; default loopback3000. Il supervisor di sviluppo mantiene il backend su loopback e assegna `DEV_API_PORT`.         |
| `DATABASE_URL`                                                      | PostgreSQL esterno per il percorso esplicito separato dal dev. Startup esterno verifica lo schema; le migrazioni richiedono `npm run db:migrate`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Trasporto SMTP separato, con TLS465/STARTTLS587 e mittente verificato. Non richiesti per lo sviluppo sintetico.                                   |
| `TRUST_PROXY`                                                       | Default `false`; accetta soltanto IP/CIDR espliciti di proxy verificati. Non abilita wildcard o fiducia generale negli header.                    |
| `TEST_DATABASE_URL`                                                 | Impostata dal runner dei test per `soglia_test`; non è il database dell'app.                                                                      |
| `CHROMIUM_PATH`                                                     | Percorso facoltativo al browser per Playwright; il fallback cloud è `/usr/bin/chromium` se presente.                                              |

La password e porta PostgreSQL locali sono generate in `.local/database.json`; non sono variabili da committare. Non inserire valori sensibili in variabili `VITE_*`: Vite può includerle nel codice consegnato al browser. Il frontend usa URL relativi `/api` e non richiede credenziali o configurazione segreta nel bundle.

## Stack, dipendenze e struttura

Il progetto è un monolite modulare TypeScript ESM. Nel servizio compilato un processo Fastify serve API e frontend statico; il percorso dev separa il processo Vite per il reload dell'interfaccia. Non servono orchestratori, Redis o framework aggiuntivi.

| Area         | Implementazione                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Frontend     | React19, ReactDOM19, TypeScript/TSX, CSS, Vite8 e plugin React6.                                     |
| Backend      | Node24, Fastify5, validazione Zod4, TypeScript eseguito con `tsx`4.                                  |
| Persistenza  | PostgreSQL18 reale; `pg`8 e query SQL parametrizzate, senza ORM.                                     |
| Server HTTP  | `@fastify/cookie`11, `@fastify/rate-limit`11, `@fastify/static`10.                                   |
| Posta        | File locali privati oppure Nodemailer10 nel percorso SMTP.                                           |
| Database dev | `embedded-postgres`18.4.0-beta.17, binari nativi del pacchetto npm, cluster persistente su loopback. |
| Controlli    | TypeScript7, Vitest5, Playwright1.63 e axe-core; Prettier3 è disponibile.                            |

Le versioni esatte e le dipendenze di tipo sono in `package.json`; `package-lock.json` è il riferimento riproducibile per `npm ci`. Non è presente un linter ESLint né uno script di formattazione globale. I file Python/CSV nella ricerca economica sono modelli di ricerca e audit, non processi richiesti dall'applicazione.

| Percorso                                                      | Responsabilità                                                                          |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/App.tsx`, `src/Income.tsx`                               | Flussi applicativi, account, immobili, discovery, inviti, chat e reddito sintetico.     |
| `src/experience.tsx`, `src/experience.css`                    | Landing, onboarding guidato e supporto ai flussi UX.                                    |
| `src/api.ts`, `src/main.tsx`, `src/style.css`, `src/brand.ts` | Client API, entry point, stile e marchio condiviso.                                     |
| `server/main.ts`                                              | Avvio HTTP, database, migrazioni/check schema e shutdown.                               |
| `server/app.ts`                                               | Route HTTP, validazione, autorizzazione, transazioni e proiezioni per destinatario.     |
| `server/auth.ts`, `server/domain.ts`                          | Hash/token e contratti/compatibilità del dominio.                                       |
| `server/db.ts`, `server/config.ts`                            | Pool PostgreSQL, transazioni, lock ordinati e validazione runtime.                      |
| `server/mail.ts`, `server/income.ts`                          | Adattatori posta, contratti reddito e simulatore sintetico.                             |
| `migrations/`                                                 | Migrazioni SQL ordinate e ledger con checksum.                                          |
| `shared/move-in.ts`                                            | Calendario e testi comuni per giorno, mese e periodo di ingresso.                       |
| `shared/contracts.ts`                                          | Formule di contratto, spiegazioni e confronto delle preferenze dichiarate.              |
| `scripts/`                                                    | Bootstrap, sviluppo, database, migrazioni, seed, test, manutenzione e preflight deploy. |
| `tests/*.test.ts`                                             | Test unitari, API, configurazione, migrazioni e SMTP controllato.                       |
| `tests/browser/`, `tests/experience/`                         | Flussi browser reali e flussi UX con API simulate.                                      |
| `dist/`, `.local/`                                            | Build e dati/credenziali generati, ignorati da Git.                                     |
| `.github/workflows/check.yml`                                 | Definizione CI Node24 con installazione, bootstrap, build e suite.                      |
| `.devcontainer/`                                              | Ambiente di sviluppo portabile e forwarding privato.                                    |
| `Dockerfile`, `render.yaml`, `deploy/`                        | Template di staging con PostgreSQL esterno e SMTP; non necessari al dev.                |
| `docs/`, `PLAN.md`, `PROJECT_STATE.md`                        | Decisioni, specifiche, istruzioni ed evidenze delle iterazioni precedenti.              |

## Processi, porte e database

| Componente              | Listener predefinito                           | Ciclo di vita                                                             |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Vite dev                | `127.0.0.1:3000`, opzionalmente `0.0.0.0:3000` | Gestito da `npm run dev`, HMR/frontend. Unica porta da inoltrare.         |
| Fastify dev             | `127.0.0.1:3001`                               | Watcher `tsx`; restart del codice API, database mantenuto dal supervisor. |
| PostgreSQL locale       | `127.0.0.1:55432`                              | Cluster persistente in `.local/postgres`, non inoltrato.                  |
| App compilata           | `127.0.0.1:3000`                               | `npm start`: API e asset in un processo.                                  |
| Browser test principali | `127.0.0.1:3000`                               | Server isolato Playwright; la porta deve essere libera.                   |
| Browser experience      | `127.0.0.1:3017`                               | Preview della build con API mock; nessuna connessione DB.                 |

Il supervisor dev possiede il database per l'intera sessione. Un riavvio API lo riusa e non lo spegne: questo evita che il reload interrompa connessioni di altri processi. Chi trova già avviato il cluster locale lo riusa senza acquisirne lo shutdown. Il salvataggio frontend usa Fast Refresh; le nuove migrazioni SQL locali vengono rilevate dal watcher backend e applicate al riavvio.

Le migrazioni sono verificate con SHA-256, ledger `schema_migrations`, lock PostgreSQL globale e transazione per file. Aggiungi un nuovo file SQL per un cambiamento di schema: modificare un file già applicato provoca un errore di checksum. Le migrazioni devono preservare i dati sintetici esistenti. Non cancellare il cluster o i file di lock per aggirare un errore: lo script può recuperare soltanto lock del proprio cluster dopo aver provato che il processo registrato è morto.

Prima di creare o rifinire una nuova migrazione, arresta soltanto il supervisor dev posseduto dalla sessione: il watcher può applicare immediatamente il primo salvataggio. Riprendi il dev dopo aver completato il file e i test. Se una versione è già applicata, conserva quel file byte per byte e aggiungi una migrazione correttiva; non riscrivere il checksum del ledger.

Database distinti:

- `soglia`: app e test manuali, da preservare tra iterazioni.
- `soglia_test`: unit/integration API con dati di fixture e controlli sulla destinazione.
- `soglia_e2e`: browser reali; il runner prepara/resetta soltanto questo database isolato.

Le tabelle applicative sono `users`, `sessions`, `auth_tokens`, `profiles`, `properties`, `invitations`, `messages`, `blocks`, `reports`, `verification_checks`, `audit_log`, `events`, `appeals`, `income_attestations` e `income_shares`, più il ledger migrazioni. Inviti e messaggi usano transazioni/lock ordinati; le offerte hanno snapshot, le osservazioni di reddito sono immutabili e le condivisioni hanno consenso/revoca separati.

Non ci sono worker, code o servizi secondari da avviare. La manutenzione è un comando manuale separato; i template di cron remoto non sono stati applicati. Scadenze di inviti, sessioni e attestazioni vengono controllate nelle letture/azioni anche quando la manutenzione non viene eseguita.

## API, autenticazione e servizi

Tutte le chiamate del frontend usano `/api`. I gruppi di route coprono sessione e autenticazione, profilo, immobili, discovery compatibile, inviti, conversazioni/messaggi, blocchi, segnalazioni, verifiche, reddito, controlli account e moderazione staff.

- `GET /api/live` controlla il processo HTTP senza usare PostgreSQL.
- `GET /api/health` verifica anche PostgreSQL ed espone l'ambiente; utile per readiness.
- `GET /api/config` restituisce solo ambiente e trasporto posta per la UI.

L'autenticazione è gestita server-side: password scrypt, sessioni opache casuali memorizzate come hash SHA-256, cookie HttpOnly/SameSiteStrict con TTL7giorni. Il cookie locale si chiama `soglia`; staging/production usano `__Host-soglia` e `Secure`. Token di conferma/reset sono monouso, legati allo scopo e scadono dopo30minuti. Reset, sospensione e altri controlli revocano le sessioni secondo il contratto corrente.

La pubblicazione e il contatto richiedono email confermata, ruolo e autorizzazione server-side; privilegi staff non vengono assegnati dalla registrazione. Le mutazioni richiedono JSON e l'origin configurato. Limiti richieste e CSP restano attivi; una preview cloud non richiede di allargare l'autorizzazione o accettare origini arbitrarie.

Con la posta locale, conferma/reset generano file0600 in `.local/mail/`. Apri localmente il messaggio dell'account sintetico interessato per usare il link. Non esiste un endpoint HTTP pubblico per sfogliare la casella. Vite blocca `.local/**` anche tramite URL diretti, `/@fs` e import raw, conservando i blocchi predefiniti per ambiente, certificati e Git. Gli account demo iniziali sono già confermati come dati sintetici. Non mostrare password, cookie, token o contenuto privato nei log, nelle evidenze o in chat.

SMTP, identità/reddito reali, pagamenti e garanzie non servono al workflow dev. SMTP è un adattatore già implementato nel percorso separato; provider identità/reddito reali restano indisponibili (`POST /api/income/checks` restituisce503). La demo reddito genera soltanto esempi sintetici server-side, senza upload o connessioni finanziarie.

## Comandi e verifiche

| Comando                       | Risultato                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm ci`                      | Installa le versioni del lockfile, incluse dipendenze dev.                                                   |
| `npm run dev`                 | Bootstrap locale necessario, database persistente, API watch e Vite HMR.                                     |
| `npm run dev:cloud`           | Stesso flusso, con Vite accessibile al forwarding della piattaforma.                                         |
| `npm run bootstrap`           | Setup locale esplicito/idempotente, migrazioni e seed sintetico; rifiuta DB esterno.                         |
| `npm run build`               | Typecheck TypeScript e build frontend in `dist/`; non connette il DB.                                        |
| `npm run typecheck`           | Controllo TypeScript senza build o emissione.                                                                |
| `npm start`                   | Serve build/API; esegui `npm run build` dopo modifiche frontend prima di usare questo percorso.              |
| `npm test`                    | Vitest completo con runner/DB locale isolato `soglia_test`. Accetta argomenti/file della suite.              |
| `npm run test:unit`           | Solo test del dominio, senza database.                                                                       |
| `npm run test:e2e`            | Playwright con app reale e DB `soglia_e2e`; build necessaria, porta3000 libera.                              |
| `npm run test:e2e:experience` | Playwright con frontend compilato e API simulate sulla3017.                                                  |
| `npm run check`               | Build, Vitest, browser reali e browser experience in sequenza.                                               |
| `npm run db:start`            | Avvio PostgreSQL esplicito in primo piano.                                                                   |
| `npm run db:migrate`          | Migrazioni esplicite; richiede DB già raggiungibile. Verificare prima eventuale destinazione esterna.        |
| `npm run db:seed`             | Seed sintetico esplicito; solo database generato locale.                                                     |
| `npm run maintenance`         | Pulizia scadenze/retention; modifica i dati previsti e richiede DB avviato. Eseguire solo quando necessario. |
| `npm audit`                   | Verifica dipendenze; i risultati valgono al momento dell'esecuzione.                                         |

Playwright necessita Chromium. Se non è disponibile:

```bash
npx playwright install chromium
```

Non avviare contemporaneamente comandi che possiedono il ciclo start/stop del database. Per la suite browser reale interrompi il servizio dev gestito da questa sessione, verifica che3000 sia libera, esegui i controlli e riavvia `npm run dev` per il test manuale successivo. Non terminare processi di altri progetti. `npm run check` non è un comando da eseguire sopra un servizio che occupa3000.

I test presenti coprono compatibilità e limiti, validazione, autenticazione/privacy, permessi, revisioni e snapshot, transizioni concorrenti, chat/paginazione, blocchi/moderazione, export/delete, stati/consenso reddito, migrazioni, configurazione deploy e SMTP controllato. I browser test includono flussi principali, responsive/accessibilità, recupero errori, compositore/segnalazioni e onboarding. Usa i risultati della verifica corrente; i pass storici in [validation](validation.md) non certificano nuove modifiche.

## Workflow di ogni iterazione

1. Leggere la segnalazione sullo stato corrente del checkout e delle iterazioni precedenti. Controllare `git status`, configurazione e processi prima di cambiare file.
2. Riprodurre quando possibile lo stesso flusso, ruolo/account, pagina e sequenza di azioni. Per un problema visuale osservare anche viewport e refresh; per un problema dati verificare richiesta, risposta e stato persistito.
3. Individuare la causa nel confine corretto: UI/stato, chiamata `/api`, autorizzazione, dominio, transazione, migrazione o processo. Usare la console del browser, Network e il terminale gestito; il logger Fastify non produce access log completi e gli errori API sono sanificati.
4. Correggere il minimo codice necessario mantenendo stile, contratti e architettura. Preservare i dati dell'app e usare fixture sintetiche per le prove. Aggiungere una regressione quando verifica un comportamento significativo.
5. Eseguire typecheck/build e test pertinenti. Usare le suite complete quando la portata o un dubbio di regressione lo richiede; evitare ripetizioni senza nuovi cambiamenti o fallimenti.
6. Riprovare il comportamento corretto, controllare errori runtime/network e riavviare il servizio dev se è stato fermato per i test. Verificare `/api/health` e rendere disponibili URL/istruzioni realmente raggiungibili dall'utente.
7. Rispondere brevemente con causa, modifica, controlli eseguiti, file principali e cosa verificare manualmente. Distinguere verifiche superate, limiti non verificati e stato del servizio.

Una segnalazione breve riguarda la versione corrente e avvia l'indagine: non richiede di ricostruire il progetto dall'inizio. Le modifiche e le evidenze utili restano nel repository. Non fare reset, refactoring ampi, push/deploy, acquisti, cambi di produzione o uso di dati reali come parte implicita di un fix locale.

## Diagnostica rapida

La verifica iniziale del setup è registrata in [development-2026-10-04.json](evidence/development-2026-10-04.json): build/typecheck,179 test unitari/integrati,22 browser principali e11 experience/mail-runtime passati, più prove reali di HMR, watch API/SQL, sessione, stop/restart e conservazione dei dati. Questi sono risultati storici del sorgente allora verificato; le modifiche successive richiedono i controlli pertinenti della nuova iterazione. L’immagine Dev Container è presente nel registro; la creazione effettiva del container e un URL di preview pubblico non sono stati verificati su questo host.

Un errore403 durante login o salvataggio con UI visibile spesso indica un `APP_ORIGIN` diverso dall'origin della preview; controllare il messaggio API e l'header `Origin`, poi correggere la configurazione e riavviare. Non disabilitare il controllo.

Se l'interfaccia risponde ma `/api/health` fallisce, controllare API/proxy e log di startup/migrazioni. Se il processo HTTP è vivo ma il database non risponde, `/api/live` e `/api/health` distinguono i due livelli. Un errore di checksum va risolto preservando la migrazione applicata e aggiungendone una nuova quando necessario.

Una porta occupata richiede l'identificazione del processo e del comando che lo ha avviato. Riutilizzare o fermare il proprio servizio, oppure scegliere `DEV_PORT`/`DEV_API_PORT` libere e coerenti con il forwarding e `APP_ORIGIN`. Non cancellare dati o uccidere indiscriminatamente processi per liberarla.

Per dati apparentemente persi dopo refresh, verificare prima risposta del salvataggio, account/sessione, database corrente e lettura successiva. Per chat/inviti controllare lo stato dell'invito, revisioni, blocchi, sospensioni e scadenze; queste regole sono parte del comportamento corrente, non errori da aggirare.

## Foto del profilo

In `/profile` il riquadro «Foto del profilo» funziona separatamente dal form
preferenze. Scegliere una foto mostra l’anteprima; «Salva foto» effettua
l’upload. «Annulla» conserva la foto già salvata. «Cambia foto» e «Rimuovi
foto» non cambiano la revisione del profilo né gli inviti in attesa.
JPG, PNG e WebP, massimo5 MB; il server controlla il contenuto e ricodifica
in WebP senza metadati. La foto può essere salvata prima delle preferenze.

`GET /api/profile` include `photo`; upload e rimozione usano
`POST` multipart e `DELETE /api/profile/photo`. Le immagini passano da
`GET /api/profile-photos/:id`, con sessione e cache privata disabilitata.
Solo il titolare e i contatti di inviti accettati/chiusi attivi e non
bloccati possono leggerle; la scoperta anonima non include foto.
Gli inviti accettati/chiusi includono `other_photo` per il contatto.
La migrazione010 aggiunge il record corrente e i token di upload già usati:
un retry con lo stesso token recupera il risultato corrente, mentre un
vecchio token non ripristina una foto rimossa o sostituita. La coda comune
di cleanup gestisce sostituzioni, rimozioni e cancellazioni dell’account.
Non cambiare il namespace delle foto immobili o la loro retention nelle
offerte accettate. Le stesse variabili dello storage privato servono per
entrambi i tipi di immagine; non è necessaria una nuova configurazione.

Regressioni specifiche: `tests/profile-photos.test.ts`,
`tests/experience/profile-photo.spec.ts` e il flusso reale in
`tests/preview-browser/preview.spec.ts`. Fermare il supervisor dev posseduto
prima di creare/applicare migrazioni o avviare suite che gestiscono il DB;
riavviarlo al termine e controllare i dati del database dell’app.

## Durata condizionale e dettagli del profilo

`shared/contracts.durationRequired` stabilisce se chiedere i mesi: false
per4+4 e3+2, true per scelta flessibile, studenti e transitorio. Il parser
accetta anche payload long precedenti con un numero ma normalizza i nuovi
salvataggi a `null`. La migrazione011 conserva i numeri delle righe precedenti.
Matching in TypeScript e SQL ignorano entrambi i mesi per le formule lunghe;
le altre formule richiedono1–120. Non valorizzare una durata nascosta36/48.

`shared/profile-details.ts` centralizza animali, arredamento e tre esigenze
della casa. `src/ProfileDetails.tsx` gestisce input e riepiloghi. Il form usa
`FormData.getAll('housing_needs')` per conservare le selezioni multiple;
la chiave del form include tutti i dati salvati e resta invariata durante
foto/pausa, così le modifiche non salvate non spariscono. I campi facoltativi
sono validati lato server; PUT che li omettono preservano i valori precedenti,
stringhe vuote e array vuoto li cancellano esplicitamente.

Discovery include soltanto pets/furnishing_preference/housing_needs tra i
nuovi campi. `tenant_details` contiene i cinque dettagli correnti soltanto
negli inviti accettati/chiusi, con parti attive, non bloccate e del medesimo
workspace preview. Testi liberi assenti da discovery/inviti pending. Il
blocco nella chat ricarica anche i dettagli dell’invito per nasconderli.
Riepiloghi ed export restano riferiti al profilo corrente, non allo snapshot
immobiliare. Regressioni: domain/contract/profile-details API, experience
contracts/move-in/profile-details e preview-browser/profile-details.

## Colori del marchio

Gli accenti decorativi in `src/style.css` usano `--accent: var(--primary)`.
I colori di avvisi, errori e conferme restano nei rispettivi token semantici;
in particolare testo e bordo degli avvisi di bozza usano `--warning`.
Per cambi soltanto cromatici verificare build/typecheck, colori calcolati,
contrasto, screenshot desktop/mobile, console e rete senza modificare dati
o riavviare il database. QA privata dell’iterazione in `.local/blue-accent`.

## Foto di più persone

`server/household.ts` gestisce modalità e schede, `src/ProfileHousehold.tsx`
la scelta e gli editor. `GET /api/profile` include `household`; PUT
`/api/profile/household` salva la modalità, POST `/api/profile/members`
crea una scheda con UUID client stabile al retry. PUT/DELETE della scheda
usano `/api/profile/members/:id`; POST multipart/DELETE della sua foto
usano lo stesso percorso con `/photo`. L’URL privato è
`/api/profile-member-photos/:photoId`. Foto principale e API precedenti
restano disponibili. Nessun cambio a preferenze/revisioni/inviti.

La modalità group restituisce le schede conservate soltanto al titolare;
negli inviti `tenant_household` condivide un array vuoto. La modalità
individual condivide membri solo negli inviti accettati/chiusi e con
parti attive, non bloccate e del medesimo workspace. L’accesso media
nonowner richiede che il titolare sia l’inquilino e il viewer il proprietario.
Non aggiungere questi dati alla discovery. La migrazione012 aggiunge
settings, membri, tombstone e foto con trigger nella coda di cleanup.

Regressioni: `tests/household-photos.test.ts`, experience/household-photos
e preview-browser/household-photos. Evidenze private `.local/household-photos`.
Per le suite con DB fermare soltanto il dev posseduto e poi riavviarlo,
verificando che i dati dell’app siano invariati.

## Fascia vantaggi della homepage

`section.principles` contiene una lista `.principle-row` a tre colonne,
con icone SVG decorative e divisori verticali. Sotto700px la lista passa
a righe allineate a sinistra con divisori orizzontali. Conservare il padding
di `.container` e `role=list` per la semantica con list-style disabilitato.
Per le verifiche visuali usare HMR senza riavviare il database; evidenze
private dell’iterazione in `.local/mobile-benefits`.

## Testi delle FAQ

`ProductFAQ` in `src/experience.tsx` mostra la domanda «Come funziona
LinkedHome?» una sola volta, come summary espandibile. Evitare un link
introduttivo con la stessa frase; i collegamenti alla guida sono già
disponibili altrove. Verifica privata `.local/faq-copy`: apertura da tastiera,
assenza duplicato e layout/accessibilità mobile/desktop, senza scritture DB.

## Testo del footer

Il footer condiviso in `src/App.tsx` usa «Cerchi casa. I proprietari
cercano te.», coerente con la scoperta dei profili pubblicati e gli inviti
dei proprietari. Per cambi di copy riutilizzare HMR e verificare il testo
sulle pagine, layout mobile/desktop e link esistenti senza scritture DB.
Evidenze private dell’iterazione in `.local/footer-copy`.

## Preparazione dei testi per la pubblicazione

`src/App.tsx` mantiene i testi di ambiente soltanto nei percorsi privati
non produttivi e nell’accesso di prova; le pagine pubbliche usano copy e
footer condivisi indipendenti dal runtime. `src/experience.tsx` e
`src/Income.tsx` dichiarano le funzioni non disponibili senza riferimenti
a demo in produzione. Non rimuovere le etichette degli esempi finanziari
o cambiare APP_ENV per nascondere avvisi: l’isolamento è parte dell’auth.
Il piano operativo corrente è `publication.md`; `index.html` conserva
noindex durante questa fase. Regressioni UI in experience/publication.spec.ts
e mail-runtime, senza possedere il DB. QA reale privata `.local/publication-ready`
riutilizza HMR e sole richieste in lettura.

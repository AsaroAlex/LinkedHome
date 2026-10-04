# Sviluppo iterativo di LinkedHome

Questa guida descrive il checkout corrente e il ciclo modifica → test → feedback. Il percorso di sviluppo usa dati sintetici e gli strumenti già presenti nel repository. La configurazione di staging e i servizi per utenti reali restano nel percorso separato di [deployment](deployment.md).

## Cloud Replit: percorso corrente

La richiesta corrente è lavorare in cloud con preview raggiungibile dal computer. Il percorso è importare in Replit **questo repository esistente**, mantenendo frontend, API e PostgreSQL già implementati. Non va ricreata l'app da un prompt né attivato un deployment di produzione.

Il solo passaggio iniziale che richiede l'interfaccia dell'utente è [importare LinkedHome in Replit](https://replit.com/github.com/AsaroAlex/LinkedHome), oppure usare l'[import GitHub guidato](https://replit.com/import): repository pubblico `AsaroAlex/LinkedHome`, branch predefinito/sorgente `claude/sweet-goldberg-5lwng7`. L'[import ufficiale](https://docs.replit.com/build/import-from-providers) trasferisce file e dipendenze, non segreti o dati dei servizi. `.local/`, `.env.development.local` e le credenziali demo non viaggiano con Git; il nuovo workspace genera i propri dati sintetici.

`.replit` seleziona il modulo `nodejs-24`, presente nel [catalogo ufficiale Replit](https://github.com/replit/nixmodules/blob/main/pkgs/modules/default.nix). Nel workspace importato verificare il runtime Node24/npm e installare una volta, se l'import non ha già installato le dipendenze:

```bash
npm ci
```

Poi **Run** esegue `npm run dev:cloud`. Il comando avvia bootstrap necessario, PostgreSQL, API watch e Vite HMR. La configurazione Replit espone soltanto la UI sulla3000; API3001 e PostgreSQL55432 restano loopback. `APP_ORIGIN` viene derivato da `https://<REPLIT_DEV_DOMAIN>`, salvo valore esplicito; questa variabile appartiene alla preview del Project Editor ed è [documentata separatamente dai Deployments](https://docs.replit.com/features/project-setup/configuration). Aprire l'URL effettivo della preview Replit **in una nuova scheda del browser** per login e sessioni persistenti, usando gli account sintetici del workspace. Il riquadro incorporato dell'editor è un contesto cross-site e può bloccare il cookie di sessione esistente `SameSite=Strict`; il contratto di autenticazione resta invariato.

Dopo l'import, l'assistente lavora sull'app Replit esistente e le modifiche salvate in quel workspace diventano provabili con HMR/restart API. Non occorre un push per ogni iterazione; Git resta disponibile per salvataggi/versioni o esportazioni richieste. Fornire alla chat il collegamento dell'app importata permette di identificare il workspace corretto. Un import una tantum non sincronizza automaticamente altri checkout: i file modificati devono essere quelli del workspace in prova.

Stato attuale: configurazione preparata, app Replit/import/runtime/preview ancora da creare e verificare. Il listener del cloud Codex corrente non è raggiungibile dal computer dell'utente e non equivale alla preview Replit. Disponibilità dell'ambiente, permessi della preview e conservazione del volume dipendono dalla piattaforma; si verificano all'avvio effettivo, senza promettere un servizio sempre attivo.

## Alternativa: avvio locale

Richiesti Node24, npm11 e un ambiente Linux/macOS non-root compatibile con il pacchetto PostgreSQL nativo. `.nvmrc` indica Node24.19.0; `package.json` richiede Node `>=24 <25`. Il devcontainer è disponibile anche per lavorare da un computer senza questi prerequisiti installati sull'host.

```bash
npm ci
npm run dev
```

`npm run dev` prepara la configurazione locale mancante, applica le migrazioni e crea gli account sintetici solo al primo setup. Poi mantiene PostgreSQL avviato, avvia l'API con riavvio automatico e Vite con React Fast Refresh. Le credenziali generate restano in `.local/demo-accounts.json`, ignorato da Git e con permessi0600.

Apri `http://127.0.0.1:3000` sul computer che esegue il servizio. Usa quell'origin anche durante login, salvataggi e altri test manuali: l'API verifica esattamente l'header `Origin` delle richieste che modificano dati.

Il terminale mostra output di avvio, errori di Vite e diagnostica del backend. Lascialo aperto durante le prove. Ctrl+C arresta UI, API e il database locale quando il comando ne possiede l'avvio. I dati salvati in `.local/postgres` sopravvivono al riavvio; sessioni e account sono nel database, non nella memoria del processo API.

## Alternativa Codex locale su macOS

Questa era la scelta precedente e resta un'alternativa; l'ultima richiesta seleziona il cloud. Nel percorso locale app e assistente condividono la stessa cartella, con preview affiancata e ciclo modifica → test → feedback. La chat cloud non può eseguire comandi sul Mac; aprire il repository come progetto locale nell’app Codex è il passaggio iniziale necessario. Poi l’agente locale può installare le dipendenze, avviare il servizio e aprire la preview sullo stesso computer.

Richiesto Node24; il PostgreSQL di sviluppo viene fornito dal pacchetto npm, senza installazione separata o Docker. Per una nuova copia del progetto, da una cartella adatta sul Mac:

```bash
git clone --branch claude/sweet-goldberg-5lwng7 https://github.com/AsaroAlex/LinkedHome.git LinkedHome-dev
```

Se il repository è già presente sul Mac, usare quella cartella e aggiornare il branch esistente senza sovrascrivere modifiche locali; non clonare sopra una cartella esistente. Aprire la cartella del repository in Codex, scegliere l’esecuzione locale e fornire questo messaggio iniziale:

> Continua LinkedHome da questo checkout. Leggi AGENTS.md e PROJECT_STATE.md; verifica Node24, installa le dipendenze se mancanti, avvia npm run dev e apri http://127.0.0.1:3000 nella preview. Mantieni il servizio durante i test manuali e applica il workflow iterativo già documentato. Non fare push a ogni modifica.

Il contesto delle iterazioni e i controlli effettuati sono nei file del repository. Non occorre rifare analisi o implementazione iniziali. La copia sul Mac genera il proprio database e le proprie credenziali demo al primo avvio; dati e credenziali ignorati del cloud restano nel cloud, senza essere trasferiti tramite Git.

Per avere un pulsante di avvio come in Replit, nelle impostazioni dell’ambiente locale di Codex configurare l’azione **Run** con `npm run dev`. L’azione apre il servizio nel terminale integrato dell’app, che va lasciato attivo durante le prove. L’installazione iniziale resta `npm ci`. Le azioni e gli script di setup si configurano nell’interfaccia desktop e vengono salvati nella cartella `.codex`; qui non viene scritto uno schema di configurazione non verificato. Riferimento: [ambienti locali di Codex](https://developers.openai.com/codex/app/local-environments/). L’esecuzione sul Mac e il pulsante Run devono essere verificati nel progetto locale; questa chat non li ha attivati sul computer.

Durante il lavoro ordinario Codex modifica direttamente i file di quella cartella, verifica il cambiamento e mantiene `npm run dev` attivo. Vite aggiorna il frontend e il watcher riavvia le API. Non servono `npm run build`, push/pull o reinstallazione delle dipendenze a ogni modifica: build e test si eseguono quando pertinenti alla verifica. Cambi alle porte o al file ambiente richiedono il riavvio del comando. Aprire la preview con l’esatto indirizzo indicato dal runner.

## Esecuzione cloud interattiva

Il modello adatto al progetto è un singolo ambiente di sviluppo con tre processi: Vite accessibile attraverso la preview della piattaforma, API e PostgreSQL su loopback. Vite inoltra `/api` al backend sullo stesso origin; il browser non ha bisogno di una seconda porta esposta o di CORS.

```bash
npm run dev:cloud
```

Questo comando abilita il binding Vite su `0.0.0.0` e richiede un `APP_ORIGIN` esplicito oppure un origin ricavabile da Replit/Codespaces. La piattaforma deve inoltre inoltrare la porta3000: il binding da solo non produce un indirizzo pubblico. PostgreSQL e API restano su `127.0.0.1`.

In Replit l'origin viene ricavato da `REPLIT_DEV_DOMAIN`; in GitHub Codespaces dalle variabili dell'ambiente Codespaces e dalla porta configurata. Per un'altra piattaforma imposta `APP_ORIGIN` all'esatto origin del browser prima di avviare il servizio, per esempio nella configurazione locale descritta sotto. Controllare i permessi di accesso della preview sulla piattaforma. Le email di conferma/reset usano questo stesso origin nei loro link.

La configurazione `.devcontainer/devcontainer.json` usa Node24 e un utente non-root e installa le dipendenze dopo la creazione. Apri un terminale del workspace ed esegui `npm run dev`: il terminale gestisce la sessione e conserva i log. La porta3000 è inoltrata con visibilità privata predefinita e apertura nel browser; il forwarding locale richiede la stessa porta3000. Non viene aggiunto un daemon in background. Evita un secondo comando dev finché il primo usa quelle porte.

I processi restano attivi durante la sessione dell'ambiente. La sospensione o ricreazione dell'host può fermarli; la durata e conservazione del filesystem dipendono dalla piattaforma. Dopo un riavvio si rilancia `npm run dev` dopo aver verificato i listener. Non è garantita la persistenza dei dati se la piattaforma elimina il volume di lavoro.

Nel cloud Codex la chiusura del terminale temporaneo può interrompere il supervisor anche fra due messaggi. Per lasciare il servizio pronto durante la stessa sessione dell’host, l’agente avvia direttamente `node --import tsx scripts/dev.ts` tramite un processo Node separato dal PTY (`spawn` con `detached: true`, stdin ignorato, stdout/stderr su un file privato, poi `unref()`). Il PID esatto e il log sono in `.local/dev-runtime.pid` e `.local/dev-runtime.log`, ignorati da Git. Prima di riavviare controllare PID, comando e listener; arrestare con SIGTERM soltanto il supervisor verificato. Una nuova chiamata shell deve confermare health e frontend. Questo avvio non crea un URL pubblico né mantiene il servizio dopo la sospensione dell’host. Sul computer locale il terminale aperto con `npm run dev` resta il percorso ordinario.

Nell'ambiente cloud Codex corrente non è disponibile un URL di preview in ingresso. Un listener locale verificato non dimostra che il browser del computer dell'utente possa raggiungerlo. Per la richiesta corrente la prova manuale avverrà nella preview Replit dopo l'import; devcontainer/Codespaces e checkout locale restano alternative. `127.0.0.1` dell'ambiente cloud non è `127.0.0.1` del computer dell'utente.

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

| Variabile           | Uso nello sviluppo                                                                                                                                                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEV_HOST`          | Binding Vite; default `127.0.0.1`, `0.0.0.0` per port forwarding cloud.                                                                                                                                                                                                                                                       |
| `DEV_PORT`          | Porta Vite, default3000; la porta richiesta deve essere libera.                                                                                                                                                                                                                                                               |
| `DEV_API_PORT`      | Porta privata dell'API, default3001; deve differire dalla porta UI.                                                                                                                                                                                                                                                           |
| `APP_ORIGIN`        | Origin esatto del browser; default `http://127.0.0.1:<DEV_PORT>` con binding loopback, `http://localhost:<DEV_PORT>` con `DEV_HOST=0.0.0.0` o origin Replit/Codespaces derivato. Il valore esplicito prevale; `dev:cloud` richiede un valore esplicito o Replit/Codespaces. Usato per controllo delle mutazioni e link email. |
| `REPLIT_DEV_DOMAIN` | Dominio preview fornito da Replit; deriva l'origin HTTPS dello sviluppo. Non contiene credenziali e non configura un deployment.                                                                                                                                                                                              |
| `APP_ENV`           | `local` per questo workflow; simulatori sintetici disponibili.                                                                                                                                                                                                                                                                |
| `MAIL_TRANSPORT`    | `local` per questo workflow; email scritte in file privati.                                                                                                                                                                                                                                                                   |

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
| `migrations/`                                                 | Quattro migrazioni SQL ordinate e ledger con checksum.                                  |
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

L’ultima verifica completa è registrata in [development-2026-10-04.json](evidence/development-2026-10-04.json): build/typecheck,179 test unitari/integrati,22 browser principali e11 experience/mail-runtime passati, più prove reali di HMR, watch API/SQL, sessione, stop/restart e conservazione dei dati. L’immagine Dev Container è presente nel registro; la creazione effettiva del container e un URL di preview pubblico non sono stati verificati su questo host.

Un errore403 durante login o salvataggio con UI visibile spesso indica un `APP_ORIGIN` diverso dall'origin della preview; controllare il messaggio API e l'header `Origin`, poi correggere la configurazione e riavviare. Non disabilitare il controllo.

Se l'interfaccia risponde ma `/api/health` fallisce, controllare API/proxy e log di startup/migrazioni. Se il processo HTTP è vivo ma il database non risponde, `/api/live` e `/api/health` distinguono i due livelli. Un errore di checksum va risolto preservando la migrazione applicata e aggiungendone una nuova quando necessario.

Una porta occupata richiede l'identificazione del processo e del comando che lo ha avviato. Riutilizzare o fermare il proprio servizio, oppure scegliere `DEV_PORT`/`DEV_API_PORT` libere e coerenti con il forwarding e `APP_ORIGIN`. Non cancellare dati o uccidere indiscriminatamente processi per liberarla.

Per dati apparentemente persi dopo refresh, verificare prima risposta del salvataggio, account/sessione, database corrente e lettura successiva. Per chat/inviti controllare lo stato dell'invito, revisioni, blocchi, sospensioni e scadenze; queste regole sono parte del comportamento corrente, non errori da aggirare.

# PROJECT STATE

Aggiornato il 2026-10-04 (Europe/Rome). Repository `/workspace/LinkedHome`, branch locale di questo checkout `work`, target remoto `claude/sweet-goldberg-5lwng7`, anche branch predefinito GitHub. Le precedenti registrazioni di rinomina del branch riguardano il checkout del rispettivo incarico. Marchio corrente: **LinkedHome**, scelto esplicitamente dall'utente dopo il pull a `9db6a9c`; vedere la continuazione naming e D-007. L’utente ha autorizzato **«Esegui tutto il piano del repository»**, incluse revisioni indipendenti A–H. Le fasi 0–28 sono **completate per il perimetro locale con dati sintetici** adottato in PLAN e nel contratto delle funzionalità. Per il follow-up l’utente ha confermato **«Demo locale completa e verificata»** e poi richiesto **«Pusha che buildo in locale»**, autorizzando la pubblicazione sul target esistente.

Preservare questo checkout isolato: niente reset, switch, worktree, pull automatici o perdita dei dati ignorati. L’utente ha autorizzato il push su `claude/sweet-goldberg-5lwng7`, eseguito e verificato il 2026-10-03. Nessuna PR, deploy pubblico, servizio a pagamento o contatto esterno.

## Workflow iterativo corrente — 2026-10-04

L’utente ha richiesto un ciclo continuo modifica → prova manuale → feedback → fix, preservando lo stato corrente e correggendo la causa con modifiche minime. Le istruzioni persistenti sono in `AGENTS.md`; inventario completo, configurazione e diagnostica in [development.md](docs/operations/development.md).

`npm run dev` ora esegue il bootstrap idempotente e gestisce PostgreSQL locale, API con `tsx watch` e Vite/HMR. Il database resta avviato durante i reload API; arresto, porte occupate e codici d’errore sono gestiti esplicitamente. Il comando carica `.env.development.local`, con precedenza alle variabili del terminale. `npm run dev:cloud` ascolta su0.0.0.0 per la sola UI e richiede l’origin della preview; la compatibilità Codespaces esistente lo ricava automaticamente. API3001 e PostgreSQL55432 restano su loopback. Dev Container Node24 non-root preparato; manifest dell’immagine verificato, creazione effettiva del container non eseguita. Nessuna nuova dipendenza.

Passati build/typecheck, **179 test unitari/integrati**, **22 controlli browser principali**, **11 experience/mail-runtime**, formattazione dei file nuovi/modificati e controllo diff. Il launcher finale è stato verificato nuovamente con typecheck,16 regressioni di sviluppo e lifecycle reale dopo gli ultimi aggiustamenti ai segnali. Verificati proxy, login/logout, HMR nel browser, watch API/SQL, sessione conservata, dati invariati e porte libere dopo arresto. Ctrl+C arresta tutto; il wrapper del terminale riporta interruzione, mentre le sonde dirette SIGINT/SIGHUP al supervisor escono0. Evidenza: [development-2026-10-04.json](docs/operations/evidence/development-2026-10-04.json).

Al termine della prima iterazione il comando dev era avviato in un terminale gestito con UI su `http://127.0.0.1:3000`; non presumere che sopravviva alla sospensione dell’host. Il loopback cloud non è il loopback del computer dell’utente. Questo ambiente Codex non fornisce un URL di preview in ingresso; questo limite blocca la prova manuale richiesta nella stessa chat cloud, anche quando l’app è avviata. La scelta corrente è descritta sotto.

Alla segnalazione «Vedo questo», lo screenshot mostrava una scheda browser vuota senza URL. Il controllo ha rilevato frontend/supervisor/database non più attivi e il precedente watcher API orfano. Arrestato soltanto quel gruppo di processi appartenente a questa chat e riavviato il supervisor Node separato dal PTY con `spawn` detached, stdin ignorato e log privato `.local/dev-runtime.log`; PID registrato in `.local/dev-runtime.pid`. Le verifiche da chiamate successive confermano health/HTML200 e frontend nel browser senza errori runtime. Per le prossime iterazioni cloud verificare quel PID e i listener, riusare il supervisor se sano e mantenere questo avvio separato dal terminale temporaneo. Non stampare il log completo: richieste future potrebbero contenere dati privati. La sospensione dell’host può comunque fermare i processi. `open_in_codex` restituisce `queued`: non prova che la preview sia caricata sul computer e non fornisce un tunnel.

Alla richiesta «Voglio avere un esperienza replit style», l’utente aveva scelto **Codex locale sul computer**, confermando **macOS**. La configurazione di sviluppo e il passaggio locale sono stati pubblicati con `70c5e17` sul branch remoto esistente. L’avvio sul Mac non è stato verificato; rimane un’alternativa compatibile.

L’ultima correzione **«No, non voglio usare replit. Voglio un esperienza qua su codex replit style»** chiarisce la scelta: **Codex, in questa chat cloud e sullo stesso checkout**, con app avviata, preview live e feedback iterativo. Non migrare a una piattaforma esterna o creare un’altra app. Il commit `b5ae376` aveva preparato Replit per un’interpretazione errata dell’assistente: rimosse `.replit`, derivazione `REPLIT_DEV_DOMAIN` e istruzioni d’import, conservando le correzioni utili di privacy. Nessuna app Replit è stata creata/importata o pubblicata. Il repository resta `AsaroAlex/LinkedHome`, branch remoto `claude/sweet-goldberg-5lwng7`. Questo runtime cloud non espone un URL di preview in ingresso; gli strumenti disponibili aprono soltanto il pannello browser e non creano port forwarding o un handoff verso un altro runtime cloud. Stato verificato: servizio interno funzionante, preview manuale nel browser del computer ancora bloccata dal collegamento mancante. Non spacciare localhost, una scheda aperta o il binding0.0.0.0 per una preview raggiungibile. Istruzioni e fonti ufficiali in [development.md](docs/operations/development.md).

La revisione cloud ha individuato e riprodotto l’accesso HTTP ai file `.local/` attraverso Vite, senza stampare il contenuto privato. Corretto con `server.fs.deny`, conservando i blocchi predefiniti Vite8. La regressione usa fixture innocue e verifica24 URL diretti, `/@fs` e raw: tutti403, frontend e modulo pubblico200. I risultati precedenti (**187 test**, incluso l’adapter Replit ora rimosso) e l’origin HTTPS simulato sono conservati come evidenza storica in [replit-development-2026-10-04.json](docs/operations/evidence/replit-development-2026-10-04.json); non descrivono una preview attiva né la scelta corrente.

Dopo la correzione del percorso passati build/typecheck e **180 test unitari/integrati**, inclusi16 controlli di configurazione sviluppo e la regressione di privacy Vite. I7 test dell’adapter rimosso spiegano il conteggio inferiore. Nessun cambiamento alle funzionalità, contratti API/autenticazione o dati della demo. L’evidenza corrente è [codex-cloud-development-2026-10-04.json](docs/operations/evidence/codex-cloud-development-2026-10-04.json); la preview manuale resta bloccata dall’assenza del collegamento in ingresso.

L’utente ha poi chiesto **«Railway?»** e segnalato **«Ho provato ma da build faild»**. L’assistente resta in Codex; Railway è una possibilità di hosting/preview dell’app esistente. Le sandbox documentano processi persistenti, scrittura file e domini HTTPS: raggiunti gli endpoint HTTPS/WSS tramite il proxy gestito, ma autenticazione e preview/HMR non sono stati verificati. Non confondere questa possibilità con un servizio ordinario, che aggiorna una versione compilata tramite deploy.

I log forniti dall’utente identificano un errore preciso del builder Railway Metal nel servizio cron `linkedhome-staging-maintenance`: `RUN --mount=type=secret,id=proxy_ca` viene rifiutato ai due passaggi npm, prima dell’installazione/compilazione. Rimossi i mount opzionali dal `Dockerfile` standard, conservando `npm ci` bloccato dal lockfile e TLS verificato. La CA specifica di Codex viene usata soltanto su una copia temporanea del Dockerfile per le verifiche nel proxy gestito. Nessuna modifica al progetto Railway o ai suoi dati/configurazione; nuovo build del provider da confermare dopo il push. Il servizio cron è indicato come Unexposed e non offre la preview frontend: questa appartiene a un servizio web. Istruzioni in [deployment.md](docs/operations/deployment.md).

La nuova disponibilità del daemon Docker28.4 ha permesso check del Dockerfile senza avvisi, build reale dell’immagine con dipendenze complete/produzione e typecheck/Vite, quindi migrazioni, preflight di configurazione, readiness/liveness/HTML/JS200 e comando maintenance su PostgreSQL18 Docker usa e getta. Container e fixture rimossi; dati e servizio dev originali conservati. Verificati utente non-root e assenza di DB embedded, `.local/` e CA del proxy nell’immagine finale. Nessun invio SMTP reale. Evidenza: [railway-metal-build-2026-10-04.json](docs/operations/evidence/railway-metal-build-2026-10-04.json). L’utente ha collegato il plugin Railway, confermato come installato dal catalogo; i relativi tool e skill non risultavano ancora esposti in quella sessione. Non dichiarare eseguito un rebuild remoto sulla base di quelle sole verifiche locali.

### Ripresa Railway — 2026-10-04

Alla richiesta «Continua con railway», il connettore Railway è disponibile e autenticato. Progetto esistente `observant-ambition` (`6047ad41-5ab1-4aa2-ad0b-35386934d678`), ambiente Railway denominato `production` (`30559f26-8d4b-4c76-abb6-7a6a69e7f630`), con applicazione configurata come **staging**. Il servizio web `linkedhome-staging` (`4734c7f2-4252-4382-97fe-395a256d0fe5`) usa `AsaroAlex/LinkedHome@claude/sweet-goldberg-5lwng7`, commit `70cc523`. Il checkout corrente è stato aggiornato con fast-forward a quel commit, senza cambiare branch o perdere dati ignorati.

Il deployment web `e129ac16-4562-4e85-b470-e55434df1815` ha superato la build ma fallito il predeploy: `DATABASE_URL` vuota/assente provoca la ricerca della configurazione locale. Impostati, senza avviare deploy, il riferimento `${{linkedhome-staging-db.DATABASE_URL}}`, `APP_ORIGIN=https://linkedhome-staging-production.up.railway.app`, `APP_ENV=staging`, `HOST=0.0.0.0`, `PORT=3000`; avvio `npm start`, healthcheck `/api/health`, predeploy `/bin/sh -c "npm run db:migrate && npm run deploy:check"`. Rimosso `exec` prima di migrate, che avrebbe impedito il controllo successivo. Configurazione riletta dal connettore; OAuth oscura i valori, quindi risoluzione del riferimento e avvio remoto restano da verificare nel prossimo deploy.

PostgreSQL `linkedhome-staging-db` è `SUCCESS`. Il cron `linkedhome-staging-maintenance` è `cronReady`, build `SUCCESS`, schedule `15 2 * * *`; nessuna prima esecuzione osservata. Anche il cron riceve il riferimento al DB e `APP_ENV=staging`, senza redeploy. Nessuna modifica a volume o dati remoti. Il web risponde ancora404: la preview non è online. Mancano `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`; completare la configurazione SMTP tramite Railway e verificare il deploy fino a `SUCCESS`, oppure attendere la scelta dell'utente per una preview esclusivamente sintetica. Non disabilitare implicitamente il contratto staging/SMTP.

Verifiche della prima ripresa: `npm ci`, build/typecheck e **59 test di configurazione/posta** passati. Supervisor dev riavviato tramite processo detached con PID/log privati in `.local/`; health e frontend locali200. Questi risultati non provano accessibilità pubblica o consegna email. Nessun push, PR o deploy era stato eseguito in quella prima ripresa.

### Preview sintetica richiesta — 2026-10-04

Alla richiesta «Risolvi i problemi di deploy» è stato rilanciato il deploy remoto `5672e035-2ee2-4b23-be5d-be3fd1b6b55c`: build e migrazioni riuscite, avvio fallito perché manca `SMTP_HOST`. L'utente ha scelto esplicitamente **«Voglio una preview con dati sintetici»**. Implementato quindi `APP_ENV=preview` con `MAIL_TRANSPORT=disabled`, HTTPS e PostgreSQL esterno obbligatori. Staging e produzione mantengono il requisito SMTP; nessun invio o file di posta nella preview.

La pagina di accesso propone inquilino e proprietario demo. `POST /api/auth/preview` crea una coppia sintetica separata per browser, con profilo/immobile compatibili a Bologna e nessun ruolo staff. Migrazione `005_preview_workspaces.sql`, token workspace memorizzato come hash, cookie `__Host-` Secure/HttpOnly/SameSiteStrict, sessione ordinaria e cambio ruolo preservando dati. Discovery, inviti e blocchi restano nella coppia; registrazione/password/conferma/reset email sono vietati. Simulatore reddito disponibile soltanto come dati sintetici. Il banner avverte di non inserire dati reali; impostazioni preview non propongono la cancellazione tramite una password inesistente.

Passati build/typecheck, **207 test unitari/integrati**, **2 scenari browser preview** (ruoli, invito, accettazione, chat, isolamento, cookie, niente registrazione) e **22 scenari browser standard**. Layout320/390 senza overflow, console/rete pulite, screenshot locali ispezionati e revisione indipendente senza blocchi. Suite eseguite in sequenza sul solo DB locale isolato; dati dev preservati. Configurato Railway per preview e pubblicato il commit `b842146e3990c71fd949f563d834ede8a4eedb02` sul branch esistente. Nessuna PR o nuova infrastruttura.

Il deployment web `195de728-a4bd-4ca8-a591-e202c0852251` è **SUCCESS**: migrazioni, preflight preview e healthcheck passati; una replica online. HTTPS sul dominio esistente risponde200. Verificato anche il percorso reale tramite16 richieste HTTPS: accesso inquilino/proprietario, cambio ruolo con dati conservati, invito, accettazione e chat. Cookie sicuri, nessuna credenziale esposta. Evidenza operativa locale senza token/password in `.local/railway-preview-verification.json`. Il cron aggiornato `8293c5c0-a0e6-4075-8970-034cfbc36147` è `SUCCESS`/`cronReady`; prima esecuzione pianificata ancora da osservare. I fallimenti storici mostrati da Railway non sono deploy correnti. Supervisor dev ripristinato, health locale200. Questo ultimo aggiornamento dello stato resta locale per non avviare un altro deploy soltanto documentale.

Ultima integrazione verificata per la richiesta di push: uniti `d566adb` (correzioni MVP) e `8891fea` (storia LinkedHome/reddito/UX/SMTP). Installazione, bootstrap, build/typecheck, **163 test unitari/integrati**, **22 controlli browser principali** e **11 controlli experience/mail-runtime** passati. Audit: zero vulnerabilità note su224 dipendenze. Avvio compilato e sonde tenant/landlord/admin riusciti; preservati tutti gli ID dei5 account originali,2 profili e1 immobile, con4 migrazioni dopo l’aggiunta della004. Evidenze in `docs/operations/evidence/mvp-push-2026-10-04/readiness.json`. Il push ordinario di questa integrazione sul target esistente è autorizzato esplicitamente; non è un deploy o un aggiornamento della bozza cloud.

## Risultato

Dossier di ricerca consolidato e verificato nei limiti dichiarati, seguito da prodotto, naming iniziale **Soglia**, poi **Doorluma** e ora **LinkedHome** per scelta esplicita dell'utente, UX, design e architettura. Implementato un monolite TypeScript/Fastify/React/Vite con PostgreSQL nativo, senza Docker obbligatorio. Il nome non ha clearance; italiano completo, struttura locale EN preparata senza traduzione completa. Le sezioni storiche mantengono le decisioni e i risultati osservati nelle rispettive date.

Funzionano bootstrap/migrazioni/seed, autenticazione e conferma/reset con messaggi locali, ruoli tenant/landlord/both e staff separato, profili privati/pubblicati, immobili, compatibilità spiegata, inviti con revisioni e snapshot, chat paginata, blocchi/segnalazioni, moderazione/sospensione/ricorso, export/cancellazione e conteggi locali. Nessun documento reale, pagamento, punteggio persona, ML o provider identità/reddito. La posta locale non prova il controllo di una vera casella.

Quattro panel indipendenti sono documentati: ricerca (review02), prodotto/design/ADR (review03), implementazione (review04), revisione finale (review05). Il gate finale è PASS per lo scope locale; i rilievi materiali sono corretti. I revisori hanno ispezionato il lavoro; il coordinatore ha eseguito i test.

## Foto immobili e miglioramento form — 2026-10-04

Richiesta corrente: «Rendi possibile caricare foto e rendi i form migliori» e apertura della preview nel pannello browser destro. Implementate fino a 6 foto per immobile (JPEG/PNG/WebP, massimo 5 MiB), anteprime, copertina, galleria negli inviti, rimozione e recupero degli upload falliti senza duplicati. Immagini normalizzate in WebP senza metadati, storage privato S3 obbligatorio nei deploy; conservati isolamento preview, permessi e foto negli snapshot accettati. Cleanup con coda persistente, retry e lock che proteggono gli oggetti riutilizzati. Nuova migrazione006, senza modificare quelle applicate.

Form immobili/preferenze organizzati in sezioni con suggerimenti, esempi, limiti, errori associati ai campi e controlli bloccati durante il salvataggio. Passati build/typecheck, 220 backend, 5 browser preview, 22 standard e 11 esperienza/mail; screenshot320px ispezionati, audit dipendenze senza vulnerabilità note e revisione indipendente conclusa. Preservati 5 utenti/2 profili/1 immobile del dev, 6 migrazioni; supervisor ripristinato, health 200. [Verifica](docs/operations/photo-forms-validation.md).

Provisionato il bucket Railway `linkedhome-photos` (`88ac2af5-03e0-4447-9970-8bedd156550b`, `sjc`) nello stesso progetto/ambiente. Web e cron ricevono riferimenti S3, senza leggere credenziali. Preflight controlla scrittura/lettura/cancellazione. Pubblicato e verificato il commit `8722ff27ad6f2d1e2adf4835c42fc56d69fbe8da` sul branch esistente. Il deploy web `4a50a06c-6ef7-41b0-8a93-29b35cd7ba7c` è **SUCCESS**, una replica online e zero crash; il cron `2b15d5e3-86b8-4c79-a40d-2db5b12ddb8c` è **SUCCESS**/`cronReady`. Completati15 controlli HTTPS sul dominio esistente: upload PNG sintetico, lettura WebP, retry senza duplicati, isolamento dal browser anonimo/altro workspace, rimozione e reload. Evidenza privata senza cookie/token in `.local/photo-browser/railway-photo-verification.json`. I fallimenti mostrati da Railway restano storici. `open_in_codex` per il dominio esistente con `placement: "right"` restituisce `queued`: non prova che il pannello sia già visibile sul computer. Questo esito operativo resta locale per evitare un deploy soltanto documentale.

## Copy dei vantaggi nella landing — 2026-10-04

Feedback dell'utente sulla fascia «Preferenze chiare / Inviti legati a un immobile / Condivisione sotto controllo», ritenuta generica. Confrontate tramite la skill Search di Exa le home ufficiali di LocService, Spotahome e HousingAnywhere; adottati benefici concreti coerenti con il prodotto: «Sono i proprietari a cercarti», «Proposte nel tuo budget», «Parla direttamente con il proprietario». Fascia mobile su tre righe a0.85rem, al posto della precedente compressione a0.61rem. [Fonti e motivazione](docs/design/03-landing-copy.md).

Build/typecheck e scenario browser della landing passati; browser reale1440/768/390/320px senza overflow, zero violazioni axe configurate ed errori console/rete, screenshot desktop/mobile ispezionati. Revisione indipendente senza blocchi. Dev preservato e pronto; backend/API, foto e flussi applicativi invariati. Pubblicato il commit `abef7de79da37d7b7195c5903cf1dedb621b9673` sul branch esistente; deploy Railway `fd459ee6-c48c-4f26-8729-2444ec1af177` **SUCCESS**. Verificati via HTTPS bundle aggiornato, presenza dei tre nuovi messaggi, rimozione dei precedenti e health200/preview; evidenza in `.local/landing-copy/railway-verification.json`. Il contesto UI dell'utente ora indica il browser in-app aperto sulla home Railway: preservare la scheda corrente per il feedback. Esito operativo salvato localmente dopo il deploy, senza avviare un deploy soltanto documentale.

## Verifiche storiche del primo MVP

- `npm run check`: build/typecheck, **71 test unitari/integrati** e **10 scenari browser** passati.
- Axe senza violazioni nei controlli configurati, navigazione da tastiera e controlli responsive; screenshot finali ispezionati e conservati.
- LCP locale desktop 244 ms; mobile emulato 2.252 ms con CPU4×, rete200kB/s e latenza80ms; CLS0. Sono misure sintetiche, non dati sul campo.
- `npm audit`: 0 vulnerabilità note nel registro consultato, 222 dipendenze censite; nessuna certificazione di sicurezza implicita.
- `npm ci`, bootstrap ripetuto e script completo `scripts/cloud-install.sh` eseguiti con successo.
- Avvio compilato, avvio dev, arresto e riavvio verificati tramite health, HTML/asset, login, immobili, discovery, dashboard e logout. Preservati gli stessi 5 utenti, 2 profili, 1 immobile e 3 migrazioni.
- Manutenzione manuale eseguita; nessuno scheduler configurato.

Evidenze e limiti: `docs/operations/validation.md`. Correzioni finali includono recupero password dei sospesi senza ripristinare i contatti, export dei propri ricorsi, dashboard oltre 100 inviti, rilascio garantito del client dopo errore di migrazione e wording corretto della conservazione manuale.

## Ambiente e ripresa

Node24.19.0, npm11.9.0, PostgreSQL18.4, Chromium151.0.7922.173 in `/usr/bin/chromium`. Installazione: `bash scripts/cloud-install.sh`; avvio: `npm start`, oppure `npm run dev`. PostgreSQL su loopback55432, UI/API3000; in dev API3001 con proxy. Le evidenze storiche registrano l’avvio dell’app compilata; non presumere che i processi persistano fra task.

`.local/database.json`, `.local/demo-accounts.json` e `.local/mail/` sono generati e ignorati; non stampare né committare credenziali/token. Credenziali con permessi0600. Il bootstrap è ripetibile e rifiuta database esterni. Con `DATABASE_URL`, migrare solo esplicitamente; startup controlla il ledger senza DDL.

`npm test` usa soltanto `soglia_test`; E2E usa `soglia_e2e` e necessita porta3000 libera. Non eseguire in parallelo processi proprietari del ciclo start/stop del DB. L’app usa `soglia`, preservato dai test. Non cancellare il cluster per risolvere errori: il recupero dei lock è limitato a processi dimostrabilmente morti nel cluster generato.

## Configurazione cloud

Bozza salvata e riletta con successo (revisioni delle istruzioni 4–5; leggere la revisione corrente nella configurazione): install_script completo identico a `scripts/cloud-install.sh`, start_skill in `docs/operations/cloud-start.md`. Conservati i 12 domini personalizzati e il preset package_managers; nessun segreto esterno richiesto. Le vecchie istruzioni che descrivevano un repository soltanto documentale sono sostituite.

Salvare la bozza non pubblica lo snapshot né valida il ripristino in un nuovo task. I commit dell’implementazione e delle evidenze sono ora pubblicati nel branch remoto autorizzato: i sorgenti si possono recuperare da GitHub anche senza uno snapshot cloud. La bozza registra l’esatto HEAD verificato. Preservare dati locali e non eseguire reset o push aggiuntivi non richiesti. Nessun nuovo task ripristinato o CI remota è stato verificato.

## Contratti da mantenere

- Profili privati fino a pubblicazione deliberata. Prima del match solo campi approvati; dopo accettazione nome scelto e chat, senza email/documenti.
- Edit e pausa annullano inviti pendenti; riconferma immobile senza modifiche li conserva. Le coppie con invito terminale non vengono riaperte in questo prototipo a singolo episodio.
- Ordine fisso per hash immobile/profilo con cursore: non rotazione o equità dimostrata. Nessun badge aumenta visibilità.
- Sessioni revocate alla sospensione; login e recupero consentono soltanto diritti/ricorso, senza riattivare contatti. I ricorsi propri sono esportabili.
- Report altrui mantengono il solo contesto selezionato dopo eliminazione dell’accusato. La manutenzione manuale elimina casi oltre 30 giorni; nessuna cancellazione automatica o durata massima garantita localmente.
- Inviti accettati/chiusi mantengono lo snapshot dell’offerta; cambi successivi sono indicati.

## Commit e lavoro successivo

`a5d4e80`: consolidamento ricerca; `d47a214`: evidenze/revisione indipendente; `c0180de`: prodotto/design/ADR; `0185593`: MVP e suite di test. Evidenze finali, stato e configurazione sono nei commit successivi. Il push autorizzato pubblica questa cronologia su `claude/sweet-goldberg-5lwng7`.

Non rimangono fasi locali aperte o approvazioni pendenti. Per un futuro rilascio reale seguire `docs/operations/release-checklist.md`: ricerca utenti, consulenza aggiornata, ruoli/informative/DPIA, provider, operazioni e supporto, infrastruttura/restore, retention, naming e misure su coorti. Non inventare questi risultati né considerarli verificati dalla demo.

Il brief integrale originario di 52 sezioni non è nel checkout: PLAN e il contratto adottato delimitano il lavoro verificabile. La ricerca conserva le distinzioni fra fonti lette, bloccate e ipotesi: 566 riferimenti bibliografici non equivalgono a 566 fonti verificate. Non ricominciare la ricerca o chiedere nuove approvazioni per correzioni già autorizzate.

## Ripresa autorizzata: integrazioni reali e preparazione deploy

Nel nuovo task del 2026-10-03 l'utente ha scelto **«Integrazioni reali e preparazione del deploy»** e alla domanda sui servizi ha risposto **«Ricerca e dammi la migliore opzione»**. Il perimetro locale precedente è completo; questo è il lavoro successivo autorizzato.

Scelta raccomandata: **Render Frankfurt + Brevo SMTP**; per un futuro dominio italiano **OVHcloud**. Confronto e fonti in `docs/adr/0002-deployment-providers.md`. Budget esemplificativo hosting circa $30/mese per operatore singolo, $55 con Render Pro, più email (Brevo Free per staging entro300/giorno o Starter da$9), dominio, imposte e consumo eccedente. La ricerca dominio successiva e la preferenza per un nome inglese/europeo hanno selezionato Doorluma / doorluma.com, disponibile in nuova registrazione secondo Dominiofaidate e senza record nel RDAP ufficiale il 2026-10-03; nessun acquisto o clearance del marchio.

Implementati adapter SMTP reale con TLS465/STARTTLS587, configurazione local/staging/production, originHTTPS/DBesterno/SMTP obbligatori fuori locale, cookieSecureHost e relativa cancellazione, proxy fidati solo per IP/CIDR espliciti, `/api/live`, `/api/health` con queryDB e `/api/config` senza segreti. La UI distingue posta locale/SMTP e ambiente di test. Sono preparati `Dockerfile`, `render.yaml`, Compose/Caddy e `npm run deploy:check` (connessione DB/schema e autenticazione SMTP, senza invio); `--config-only` controlla soltanto la configurazione.

Verificati build, **136 test unitari/integrati/SMTP**, **14 scenari browser**, audit npm0 vulnerabilità note; test SMTP usano esclusivamente server loopback controllati e certificati di test. Runtime con sole dipendenze di produzione avviato in copia temporanea con PostgreSQL sintetico esterno, senza embedded-postgres o seed; health/frontend/config/HSTSheader funzionano e gli stessi5 utenti/2 profili/1 immobile/3 migrazioni sono preservati. Revisione tecnica indipendente06 ha portato alle correzioni dell'import brand nel Docker runtime, cancellazione cookieSecure e reale interruzione socket al timeoutSMTP.

Template Render validato con schema ufficiale e Compose validato con fixture falsa; **build/run Docker non verificati**, socket non accessibile all'utente del task. Nessuna credenziale/provider/account reale, acquisto dominio, servizio a pagamento o deploy pubblico attivato. La configurazione SMTP è implementata ma **la consegna a caselle reali non è provata**. Su Render `TRUST_PROXY=false` può aggregare utenti sotto l'IP del load balancer: ottenere topologia/IP fidati e provare header contraffatti prima del traffico reale. SMTP è sincrono, senza coda durevole; risposta recovery generica non prova indistinguibilità temporale. Backup/restore/monitoraggio/retention nell'hosting e i gate legali/prodotto rimangono da verificare.

Le evidenze sono in `docs/operations/validation.md`, `evidence/deployment-runtime.json`, `deployment-templates.json` e nella review06. Il vecchio push e la bozza cloud si riferiscono alla fase precedente: non presumere che contengano questa continuazione. Non resettare/switchare il checkout né creare worktree. Nessun push ulteriore o PR è stato eseguito in questa ripresa.

## Completamento successivo alla richiesta «Completa»

Verificate installazione e avvio da export pulito di `de15065`, senza riuso di dipendenze/database/credenziali, e un backup/ripristino PostgreSQL reale in database usa e getta. Tutte le 14 tabelle e le sequenze coincidevano; login/discovery/export sul ripristinato riusciti. Database originale invariato e file/database temporanei sensibili rimossi. Evidenze in `docs/operations/evidence/clean-install.json` e `recovery.json`; il primo è una prova sulla stessa macchina, non un nuovo task.

Per rendere attivo uno snapshot cloud rimane un’operazione dell’interfaccia della piattaforma: pubblicazione e riconnessione. Gli strumenti disponibili salvano/leggono bozze, non pubblicano né creano un task ripristinato. Non manca un’approvazione da ripetere in chat. Le istruzioni aggiornate documentano esplicitamente questo confine operativo. Nessun deploy pubblico o push implicito effettuato.

## Allineamento finale del repository nella configurazione cloud

Censita completamente `/workspace`: un solo checkout Git, `AsaroAlex/LinkedHome`, host `github.com`, percorso relativo `LinkedHome`; nessun worktree, submodule o checkout sovrapposto. Il campo repositories viene allineato al commit locale completo verificato dopo questo aggiornamento documentale, preservando la cronologia completa, ora pubblicata sul branch autorizzato. Il salvataggio finale mantiene install_script, rete e credenziali esistenti. La revisione corrente e il relativo SHA sono verificati rileggendo la bozza, senza ulteriori commit che ne cambino il riferimento.

La pubblicazione dello snapshot resta un’operazione del prodotto chiamata Review and Publish: non esiste un tool disponibile che possa eseguirla in questa chat. Il checkout non viene sostituito con un vecchio commit remoto per aggirare il limite di ripristino dei commit locali.

## Push autorizzato da mobile

Alla richiesta «pusha no?» è stato eseguito un push ordinario (senza force) su `origin/claude/sweet-goldberg-5lwng7`. Il remoto iniziale `9b0f42a` era un antenato del lavoro locale; il primo push ha pubblicato `5c78b05`. Questo aggiornamento documentale viene pubblicato nello stesso branch e il relativo SHA viene confrontato con `git ls-remote`. Nessuna PR o modifica al branch principale. L’implementazione è quindi recuperabile da GitHub; la pubblicazione dello snapshot cloud è un’operazione distinta e non serve per conservare il codice.

## Ripresa autorizzata: brand internazionale Doorluma e dominio

L'utente ha richiesto ricerca autonoma di un dominio disponibile e modifica del repository, preferenza per un nome inglese/europeo e infine «Ricerca il miglior nome per il brand». Scelta finale: **Doorluma**, otto lettere, radice inglese “door” e finale coniato che evoca luce/calore. Payoff italiano: **Affitti che iniziano da un invito.** Domini: **doorluma.com** principale; `.eu` e `.it` facoltativi. Interfaccia ancora italiana e perimetro iniziale Italy-first: nessuna espansione internazionale verificata.

Il registrar conferma nuova registrazione per tutti e tre i domini; il RDAP ufficiale `.com`404 conferma assenza di record. Dominiofaidate quota il `.com` a €13,99+IVA/anno anche al rinnovo. Disponibilità/prezzi sono temporanei, senza prenotazione. La ricerca bounded non ha trovato uso esatto Doorluma nel campione; documenta rischi di pronuncia, dettatura e vicinanza al settore porte/illuminazione, senza clearance del marchio o test con utenti. Confronto con Doorliva, NestInvite, Abituno e fonti in `docs/product/03-naming.md`; prove dei domini e ricerche precedenti in `docs/operations/evidence/domain-research.json`. Gandi403 nell'ultimo passaggio è documentato e non aggirato; le prove Gandi precedenti riguardano i candidati precedenti.

Marchio aggiornato in UI, titolo/descrizione HTML, email, log e nome export `doorluma-dati.json`. `docs/operations/domain-setup.md` e gli esempi commentati preparano origin, DNS e mittente dopo acquisto e verifica. Repository LinkedHome, package, database, cookie, sessioni e dati persistenti mantengono gli identificatori tecnici precedenti; nessuna nuova migrazione. Nessun acquisto, DNS reale, mittente attivato, deploy pubblico o push aggiuntivo. Header mobile corretto per consentire nomi più lunghi senza nascondere accesso/registrazione.

Nel checkout sono apparse anche modifiche UX indipendenti (`experience`): vengono preservate e non incluse nel commit del naming. Verifiche sullo snapshot dei soli sorgenti di questa modifica, evidenze e limiti in `docs/operations/validation.md` e `evidence/doorluma-validation.json`.

Verifica finale Doorluma: bootstrap isolato, build/typecheck, **136 test su6 file** e **14 scenari browser** passati; schermate desktop/390px/320px ispezionate, startup/health/metadati verificati. Header320px senza overflow, entrambi controlli visibili. Revisione indipendente senza finding materiale residuo nel perimetro naming. Commit locale, senza push; le modifiche UX indipendenti restano nel checkout.

## Ripresa autorizzata: integrazione dei miglioramenti UX salvati

L'utente ha richiesto di integrare `AsaroAlex/LinkedHome`, ramo `codex/rental-ux-save-20261003`, commit `504a809d7795d340cb639adad60a059c5fba1d40`, conservando marchio, dominio e deploy più recenti. Il confronto iniziale ha trovato i sorgenti UX già identici al commit salvato nel workspace condiviso. Sono stati adottati nel ramo corrente senza sostituire il checkout o applicare l'intero vecchio snapshot; i documenti più recenti di Doorluma sono conservati.

Integrati home con percorsi per ruolo, registrazione guidata, dashboard con prossimi passi basati sullo stato effettivo, FAQ e risposte rapide modificabili in chat. Le risposte richiedono invio esplicito; gli errori conservano la bozza e il cambio contatto la isola. La suite dedicata è ora disponibile con `npm run test:e2e:experience`, inclusa in `npm run check` e nella definizione CI.

Verifica dell'intero checkout integrato: build/typecheck, **136 test su6 file**, **14 scenari nella suite browser esistente** e **11 nella suite UX con API simulate**, tutti passati. Quattro scenari mail-runtime sono condivisi dalle due suite browser. Controlli axe/responsive configurati passati; schermate home desktop/mobile e chat mobile ispezionate. Revisione tecnica indipendente senza finding P1/P2 residuo nel perimetro UX. Evidenze in `docs/operations/evidence/rental-ux-integration.json` e `docs/operations/validation.md`.

App locale compilata riavviata, health200 e metadati Doorluma verificati; database applicativo invariato nei conteggi:5 utenti,2 profili,1 immobile,3 migrazioni. Nessuna nuova dipendenza, modifica a database/cookie/server/SMTP/template deploy o attivazione dominio. Integrazione salvata con commit locale; nessun push, CI remota o deploy pubblico eseguito per questa richiesta.

## Estensione UX e attestazione reddituale facoltativa — 2026-10-03

Il nuovo brief autorizza ricerca, audit e implementazione dell’estensione reddito: i precedenti rinvii riguardano l’emissione reale, non il flusso locale ora implementato. Scelta A: attestazione privata riutilizzabile, condivisione distinta per esatta anteprima e invito/destinatario; niente reddito/badge in discovery o modifica compatibilità/ranking. Migrazione 004 crea osservazioni immutabili sintetiche e grant, con scadenza/revoca/contestazione/sostituzione/contatto applicati lato server. Emissione reale: 503, nessun upload, provider o garanzia. Le categorie dipendenti/autonomi/variabili e gli esiti sono fixture server esplicite, non verifiche di persone reali.

Risolti i principali problemi UX dell’audit: pubblicazione di preferenze non salvate, validità/riconferma immobile, loading delle verifiche, continuità del focus/esiti, date leggibili, errori di durata e recupero link invalidi. Ricerca con fonti ufficiali e limiti in docs/research/11-income-verification.md; decisione A/B/C, provider dependencies e prossimo studio in docs/product/04-income-attestation.md. Nessun risultato o prezzo validato, contatto esterno, acquisto, deploy o push in questo incarico.

`npm run check` PASS: 96 test unit/API, 15 browser (5 nuovi reddito); review indipendente risolve il rischio di condividere un attestato aggiornato dopo una preview superata. Evidenze e limiti attuali in docs/operations/income-validation.md. Questa estensione è locale utilizzabile con esempi, non clearance per un pilot con redditi reali. Preservato checkout e dati locali; le suite usano database separati.

## Consolidamento e pulizia richiesti

L’estensione UX/reddito e le evidenze sono consolidate nel branch locale `work`. Rimossi i report browser generati e lo script temporaneo di QA; conservati database, credenziali locali ignorate, dipendenze, build funzionante ed evidenze permanenti. Manifest degli screenshot completato e fonti di ricerca collegate. Nessun reset, cambio checkout, push o deploy. I controlli funzionali precedenti restano validi: questa pulizia non modifica il comportamento del codice.

## Integrazione e visibilità del branch

Alla segnalazione «Non vedo quel branch» è stato verificato che `work` era solo locale e che il branch GitHub del progetto `claude/sweet-goldberg-5lwng7` era avanzato a `65f38ee`. Il risultato unisce tale storia con `f4cf518`, preservando Doorluma, la nuova UX e SMTP/runtime/deploy insieme al flusso reddito. Nessun reset, cambio checkout, nuovo worktree o force push. Il nome locale rimane `work`; il target di pubblicazione resta il branch remoto esistente.

Build/typecheck, **161 test backend su 7 file**, **19 scenari browser core/reddito/mail** e **11 esperienza/mail** passati in sequenza (26 scenari browser distinti). Review07 ed evidence/income-integration.json descrivono i limiti. Il simulatore reddito è limitato all'ambiente locale della singola istanza; staging/produzione rifiutano anche una richiesta esplicita di abilitarlo. Nuove emissioni sintetiche usano il nome Doorluma; le osservazioni storiche restano immutabili.

App compilata riavviata su loopback3000; health/config200 e titolo Doorluma verificati. Letture del database applicativo:16 utenti,7 profili,4 immobili,4 migrazioni, inclusi i dati sintetici dell'audit precedente; nessun seed o reset eseguito in questa integrazione. Credenziali e dati locali ignorati sono conservati; i report temporanei sono rimossi dopo il salvataggio delle evidenze. La pubblicazione Git non attiva hosting, dominio, provider reddito o invii SMTP esterni; nessuna CI remota è dichiarata.

## Ricerca economica, pull e lavoro unificato — 2026-10-03

Alla richiesta «Fai pull e unisci il lavoro» eseguito `git pull --ff-only origin claude/sweet-goldberg-5lwng7`: fast-forward da `6d4805c` a `9db6a9c`, senza conflitti, cambio checkout o reset. Sono presenti Doorluma/UX/SMTP/deploy e l'estensione reddituale sintetica del remoto. L'analisi iniziale chiamava il progetto Soglia e leggeva il vecchio snapshot: [la sintesi attuale](docs/research/12-sustainable-economics.md) riconcilia questi stati.

Ricerca, fonti, modelli B/D/E e F/G/H, CSV, parametri e audit sono in [economics-2026-10-03](docs/research/economics-2026-10-03/README.md). Raccomandazione D-008 **proposta**: testare installazione 790 € + IVA e manutenzione 49 € facoltativa su strumenti dell'agenzia. È un esperimento con investimento limitato; non è implementazione del pivot né prova di prezzo, domanda o profitto. Nessuna persona contattata, acquisto o campagna eseguiti. L'audit v2 ha 12.920 confronti senza scostamenti; non valida le assunzioni commerciali.

Nuovo `npm ci` e `npm run check` passati nel checkout aggiornato: build/typecheck, 161 test backend, 19 browser core/reddito/mail e 11 esperienza/mail, 26 scenari distinti. Dati e credenziali locali preservati, nessun seed/reset. [Evidenza nuova](docs/operations/evidence/pull-economics-integration.json) e [report](docs/operations/pull-economics-integration.md) riportano anche il controllo di compatibilità schema/avvio. I conteggi locali di questa macchina non sono quelli del precedente task remoto.

Il lavoro economico è salvato con un commit locale dopo il pull; nessun nuovo push, PR, deploy, provider reddito o invio SMTP esterno è implicito in questa integrazione. I gate del rilascio reale rimangono aperti.

## Nome LinkedHome scelto dall'utente — 2026-10-04

Dopo «Fai pull e unisci il lavoro», eseguito un pull fast-forward da `65f38ee` a `9db6a9c`, senza conflitti o modifiche locali da perdere. L'utente ha quindi richiesto «Procedi con linkedhome e procedi alle modifiche necessarie». Il marchio corrente è **LinkedHome**, slug `linkedhome`, payoff invariato **Affitti che iniziano da un invito.** Il nome centralizzato aggiorna UI, email, log, nuove emissioni sintetiche e download `linkedhome-dati.json`; metadati HTML e documentazione corrente sono allineati. Il contenuto storico delle attestazioni e delle evidenze resta immutato; non è necessaria una migrazione di database, cookie o identificatori tecnici.

Dominio futuro proposto: **linkedhome.eu**, con `.it` facoltativo; entrambi disponibili nel controllo nominale del registrar del 4 ottobre, mentre `.com` è registrato. Nessun acquisto o configurazione DNS/origin/mittente effettiva. Linkhome e Linkedhomes sono usi immobiliari vicini documentati; l'approvazione del nome non è una clearance legale. [Naming corrente](docs/product/03-naming.md), [dominio](docs/operations/domain-setup.md) e [D-007](docs/DECISIONS.md) conservano decisione, fonti e limiti.

`npm run check` passato in sequenza: build/typecheck, **161 test backend su7 file**, **19 scenari browser applicativi** e **11 esperienza/mail**; quattro scenari mail ripetuti,26 distinti. Nome e controlli di accesso verificati visivamente a1440px,390px e320px senza overflow. [Verifica corrente](docs/operations/validation.md) e [evidenza LinkedHome](docs/operations/evidence/linkedhome-validation.json) registrano risultati e limiti. Nessun seed/reset del database applicativo, invio esterno, deploy o ulteriore push.

## Unificazione e pulizia dei branch — 2026-10-04

La richiesta «Unisci, mergia e pulisci i branch» autorizza la pubblicazione del lavoro consolidato e la rimozione dei rami confluiti. Inventario completo via `git ls-remote --symref`, fetch di tutti i branch e GitHub: un solo ramo remoto, `claude/sweet-goldberg-5lwng7`, anche default; un solo ramo locale, `work`; nessuna PR aperta. Non esistono rami aggiuntivi da eliminare.

Il primo push ordinario è stato rifiutato perché il remoto era avanzato nel frattempo a `25d02c6`, con il marchio LinkedHome. Integrati questo commit e la ricerca locale `3658f8a` tramite merge, conservando entrambe le storie. Risolti i conflitti in PLAN, PROJECT_STATE e DECISIONS: D-007 resta il naming accettato; la proposta economica diventa D-008. La sintesi economica usa il marchio corrente; gli allegati e le evidenze storiche conservano i nomi osservati. La pubblicazione usa un push ordinario sul ramo esistente. Nuova verifica funzionale del risultato e preservazione dati sono registrate nel [report di merge](docs/operations/branch-merge-validation.md).

## Consolidamento, pubblicazione e pulizia dei branch — 2026-10-04

L'utente ha richiesto «Unisci, mergia e pulisci i branch». Il rebrand `25d02c64e40becc33d04b04cc139e8984b26b35c` è pubblicato sul branch GitHub preesistente e predefinito `claude/sweet-goldberg-5lwng7`, verificato rileggendo il remoto. La storia include UX `504a809d`, SMTP `b769c79` e reddito `f4cf518`, tutti antenati del merge `9db6a9c`. Incluso il rebrand con fast-forward; unite le registrazioni operative concorrenti `b5fa6d2` e `dcb665f` mediante merge documentale, risolvendo soltanto PLAN e PROJECT_STATE. Nessun codice applicativo cambiato dalla pulizia.

Eseguito fetch/prune e controllate tutte le teste remote e le PR aperte: un solo branch remoto, nessuna PR aperta, nessun branch aggiuntivo con lavoro residuo da eliminare. In questo checkout il locale `work` è rinominato `claude/sweet-goldberg-5lwng7`, mantenendo upstream e dati. Nessun reset, switch, worktree, force push o cancellazione di dati locali. Build/typecheck e 33 test email rieseguiti con successo dopo il fast-forward; la suite completa 161/19/11 rimane attribuita all'evidenza naming precedente. App compilata riavviata con LinkedHome e health200. La registrazione consolidata viene pubblicata sul branch condiviso, senza deploy o CI remota dichiarati.

## Esito del consolidamento completo — 2026-10-04

Uniti il merge locale `c1fefe2` (ricerca economica e naming LinkedHome) e il remoto `cfc849f` (registrazioni operative concorrenti). Conservate tutte le storie UX, SMTP, reddito, naming e ricerca; D-007 riguarda il naming accettato e D-008 resta una proposta commerciale. Il branch locale è allineato nel nome al ramo remoto/default `claude/sweet-goldberg-5lwng7`. Un solo branch locale e remoto, nessuna PR aperta o ramo residuo da cancellare.

Il codice applicativo resta identico a `25d02c6`, verificato byte per byte; i successivi merge riguardano soltanto documenti. La nuova suite completa è passata (161 backend, 26 scenari browser distinti) e l’avvio LinkedHome risponde 200; [report](docs/operations/branch-merge-validation.md). In questa macchina sono preservati 5 utenti, 2 profili, 1 immobile, 4 migrazioni e credenziali. App e DB fermati dopo le prove. Pubblicazione ordinaria e verifica di uguaglianza SHA locale/remoto completano l’unificazione.

## Follow-up MVP locale e push richiesto — 2026-10-04

Il commit `d566adb`, basato su `6d4805c`, salva le correzioni del follow-up locale: compatibilità spiegata sullo stesso snapshot dell’offerta accettata/chiusa, caricamenti immobili/discovery/chat riprovabili, errori di rete leggibili e segnalazioni con testo selezionato e reset della bozza al cambio del messaggio. Anche il cambio conversazione azzera segnalazione e compositore; contenuti lunghi verificati a 320px.

Prima della riconciliazione con il remoto, il codice del follow-up ha superato build/typecheck, **73 test unitari/integrati** e **13 scenari browser**, bootstrap ripetuto e sonde di avvio compilato. In quella prova erano preservati 5 utenti, 2 profili, 1 immobile e 3 migrazioni; LCP sintetico desktop 308ms, mobile 2.312ms e CLS0. [Evidenza storica](docs/operations/evidence/mvp-2026-10-04/readiness.json) con hash del diff sorgente e screenshot. Questi risultati descrivono il sorgente precedente alla fusione e non la successiva integrazione LinkedHome/reddito/UX/SMTP.

La richiesta **«Pusha che buildo in locale»** autorizza verifica e push ordinario sul branch remoto esistente. Integrata la storia remota fino a `8891fea`, conservando marchio LinkedHome, flusso reddito sintetico, UX, configurazione staging/SMTP, ricerca economica e registri della precedente pulizia dei branch. I risultati della verifica e pubblicazione del nuovo merge sono registrati separatamente; non è implicito un deploy, una PR, un acquisto o l’attivazione di provider reali.

## Feedback browser: informazioni economiche — 2026-10-04

L'utente vuole la valutazione economica come feature utile al proprietario e
respinge la home «nessuna promessa sulla solvibilità». Sostituita la sezione con
**«Affitta con più tranquillità»**, riepilogo entrate/canone e CTA alla
spiegazione dell'attestazione. Aggiunta una FAQ, corrette le negazioni generiche
del reddito e introdotto un pannello informativo per il proprietario in
«Verifiche e reddito», con link agli inviti. La feature esistente resta
facoltativa, con anteprima, consenso per destinatario/invito e revoca; nella
preview usa dati sintetici, chiaramente indicati. Verifica di redditi reali
ancora da collegare; nessuna nuova emissione, garanzia o modifica del ranking.

Passati build/typecheck, scenario browser della landing e nove controlli UI:
home/CTA informativo a1440/768/390/320px e area proprietario a320px con API
simulate. Nessun overflow, violazione axe configurata o errore console/rete;
screenshot ispezionati e revisione indipendente senza rilievi materiali.
Backend, dati e supervisor dev preservati. [Dettagli](docs/design/03-landing-copy.md).
Pubblicato il commit `a39766af7663c6949c93f5858dee57211d4a359c` sul branch
esistente. Il deploy web `f20fd75e-5813-4194-8c46-e701e0e69c3f` è **SUCCESS**;
HTTPS/health preview200 e bundle `index-D8fuYMXK.js` verificati: nuova home,
FAQ e pannello proprietario presenti, vecchia negazione della solvibilità
assente. Evidenza senza credenziali in `.local/income-copy/railway-verification.json`.
La scheda è già aperta nel browser dell'utente. Questo esito operativo resta
locale per evitare un deploy soltanto documentale.

## Feedback browser: FAQ — 2026-10-04

L'utente rifiuta titolo e sottotitolo generici delle FAQ e chiede di riprendere
i competitor. Confrontate tre pagine ufficiali tramite Exa; la sezione ora usa
**«Domande frequenti»**, **«Come cercare casa o proporre il tuo immobile su
LinkedHome.»** e CTA **«Come funziona LinkedHome →»**. Una nuova prima domanda
spiega i due ruoli, gli inviti e la chat dopo l'accettazione. Altre risposte,
attestazione di reddito e modifiche precedenti conservate.

Passati build/typecheck, scenario browser esistente della landing, controlli
FAQ a1440/768/390/320px, tastiera su tutte le domande e collegamento alla guida.
Nessun overflow, violazione axe configurata o errore console/rete; screenshot
ispezionati e revisione indipendente senza rilievi materiali. Sorgente UI
principale `src/experience.tsx`; [fonti e motivazione](docs/design/03-landing-copy.md).
Dati e supervisor dev preservati. Pubblicato il commit
`340569b148b82e3448acab3a97506fcefecefbb5` sul branch esistente. Web
`417e07ce-9654-43b1-b5a0-a78501601de3` **SUCCESS**, una replica online senza
crash; cron `c055133c-ab8e-4091-a3ec-e4e30aae0aee` **SUCCESS**/`cronReady`.
HTTPS e health preview200, bundle `index-CbriJTGg.js`: titolo/intro/nuova
domanda presenti, vecchio titolo assente e sezione reddito conservata.
Evidenza senza credenziali in `.local/faq-copy/railway-verification.json`.
Esito operativo conservato localmente per evitare un deploy solo documentale.

## Proposta di monetizzazione dell’incontro — 2026-10-04

Il nuovo commento browser chiede «Trova un modo per monetizzare l’incontro tra
le parti». Ricerca mirata su listini ufficiali LocService, HousingAnywhere,
Spotahome e SpareRoom; confronto con il trigger `pending → accepted` esistente.
La proposta D-009 lascia gratuito l’inquilino e fa pagare il proprietario per
invito accettato: 9,90 € come prezzo da testare e primo incontro gratuito solo
come promozione di lancio circoscritta, con periodo/platea/budget da definire.
Rifiuto/scadenza/ritiro prima dell’accettazione non generano un contatto pagato;
conversazione successiva inclusa. D-008 riguarda una distinta proposta per
agenzie, mai implementata come pivot.

Il [modello](docs/product/05-contact-monetization.md) include fonti, condizioni,
limiti e prova del prezzo. Calcolo aritmetico rieseguito: con IVA 22% ipotetica e
fee Stripe carte SEE standard, circa 7,72 € residui prima di tutti gli altri
costi per contatto pagato; non è utile o prova di domanda. Nessun pagamento,
provider, contatto esterno, UI o deploy attivati. La scelta del pagante è stata
chiesta come preferenza facoltativa; la raccomandazione assume proprietario
pagante finché non arriva un’indicazione diversa. Review indipendente del
modello svolta; recepite le precisazioni su rimborsi separati, promozione
gratuita limitata/atomica e margine per proprietario/coorte inclusi i contatti
gratuiti. Dati e preview preservati.

## Colori e stile immobiliare — 2026-10-04

L’utente giudica la precedente palette simile ai siti di consulenze
psicologiche e chiede riferimenti a idealista/Immobiliare.it. Confrontate le
home ufficiali e il media kit Immobiliare.it. Scegliamo una palette coerente
blu/bianco/ardesia/azzurro, con dettagli caldi limitati; sans già disponibile
per titoli/marchio/prezzi e titolo mobile su due righe a390/320px. Aggiornati
home, form/foto, dashboard, chat, reddito, favicon e theme-color. Corretto
l’hover dei bottoni distruttivi. Flussi, API, dati e dipendenze preservati.

Build/typecheck e11 scenari esperienza/mail-runtime passati; scenario landing
rieseguito sul risultato finale. Sedici controlli UI e verifica finale home
alle quattro larghezze, sette contrasti, focus e hover: nessun overflow,
violazione axe configurata o errore console/rete. Viste autenticate con API
simulate, senza scritture DB. Screenshot home/form ispezionati e review
indipendente senza blocchi. [Dettagli](docs/design/04-real-estate-palette.md).
Pubblicato il commit `3a5be9319266ec43e23831d19a1a63db249662a0` sul branch
esistente. Web `8509a445-f426-4cd1-9e5a-94b62425a147` **SUCCESS**, una replica
online senza crash; cron `cronReady`, database online e nessun lavoro pending.
HTTPS/health preview200, CSS `index-BusrCaxZ.css`, theme-color e favicon
verificati: nuova palette presente, vecchi verde/crema assenti. Verificata
anche la home pubblica con Chromium a390px: blu `rgb(0,107,179)`, fondo bianco,
titoli sans e nessun overflow. Evidenze ignorate senza credenziali in
`.local/real-estate-palette/railway-verification.json` e `railway-browser.json`.
Supervisor dev attivo. Questo esito operativo resta locale per evitare un
deploy soltanto documentale.

## Spunte dei progressi dashboard — 2026-10-04

Il feedback «Spunte inguardabili» riguarda i primi passi nella dashboard.
La regola `.onboarding-steps span { display:block }` prevaleva sul grid del
marker e annullava il centraggio. Corretto con selector specifico, box fisso
30x30 senza compressione, SVG18px arrotondato e blu su cerchio azzurro.
Marker con ruolo immagine/etichetta di stato, SVG e numeri decorativi nascosti
agli screen reader. I passaggi da fare mantengono numero e bordo neutro.
Nessuna modifica ai criteri di completamento o ai dati.

Build/typecheck e tre scenari progressi passati. Il test tenant ora verifica
anche stati accessibili e centraggio reale a320px. Sette verifiche UI con
API simulate (tenant completo/parziale/iniziale, landlord e doppio ruolo,
1440/390/320px), screenshot completi/parziali ispezionati: nessun overflow,
violazione axe configurata o errore console/rete. Review indipendente senza
rilievi. Evidenze ignorate in `.local/progress-markers`; supervisor dev pronto.

Pubblicato `8e53fe6ed8bebec610e5905d1090f63b3b12d015`: web
`feb7ad42-c1d1-406f-ba06-96e4d8b97085` **SUCCESS**, una replica online senza
crash, cron pronto e nessun lavoro pending. HTTPS/health preview200 e nuovi
bundle CSS/JS verificati. Dashboard della build pubblica a390px con API
sintetiche simulate: spunte centrate, nessun overflow, errore console/rete o
violazione axe configurata. Evidenze `railway-verification.json` e
`railway-browser.json` nella cartella ignorata. Esito operativo locale per
evitare un secondo deploy soltanto documentale.

## Dashboard con maggiore gerarchia visiva — 2026-10-04

Feedback «Tutto molto piatto» sul saluto della dashboard. Aggiunta fascia
blu con illustrazione architettonica SVG originale/decorativa, titolo più
compatto, badge e azioni per tenant/landlord/both. Due card autonome per
pending/accepted, collegate a `/invitations`; accepted è descritto come
«Inviti accettati», aderendo alla query. Nessun numero o risultato inventato:
dati mancanti mantengono «—», lettura fallita ripetibile con pulsante.
Onboarding con intro azzurra, passi/divisori su bianco e CTA compatta; testo
del profilo/immobile pronto soltanto dopo fetch riuscito e requisiti completi.
Titoli delle card inferiori ridotti anche su mobile. CSS circoscritto alla
dashboard, senza modifiche a API, dati, altre pagine o dipendenze.

Build/typecheck passati; 12 scenari esperienza/mail-runtime passati, poi
quattro scenari dashboard/progressi rieseguiti sulle rifiniture finali.
Test funzionale aggiunto per errore/retry del riepilogo, conteggi sconosciuti
e destinazione dei link. Nove controlli UI finali alle larghezze
1440/768/390/320px, tutti i ruoli, nome lungo e email non confermata: nessun
overflow, errore console/rete o violazione axe configurata. Due ulteriori
prove loading/error a320px con fallimenti di rete simulati intenzionalmente:
nessun overflow, violazione axe o errore JavaScript. Screenshot desktop/mobile
ispezionati e review indipendenti di stile e contenuti senza rilievi.
Evidenze ignorate in `.local/dashboard-refresh`; dev preservato e pronto.

Pubblicato `9eb45d07c5bae6c58763fa1cfbc0c5a6d6b9d74d`: web
`2063a4dc-f5a4-4622-a4dc-9aa696de2a39` **SUCCESS**, una replica online senza
crash, cron pronto, database online e nessun lavoro pending. HTTPS/health
preview200, CSS `index-D6dUpZXj.css` e JS `index-BnL7umUG.js` verificati.
Dashboard della build pubblica controllata con Chromium a1440/390px e API
sintetiche simulate: nessun overflow, errore console/rete o violazione axe
configurata; screenshot salvati. Esito operativo locale per evitare un deploy
soltanto documentale. La scheda browser già aperta richiede aggiornamento per
vedere il nuovo bundle.

## Parole comuni nella verifica del reddito — 2026-10-04

L’utente chiede termini comuni italiani al posto di «attestazione».
Il titolo diventa «La verifica del tuo reddito»; il risultato condivisibile
è il «riepilogo del reddito». Semplificati anche emittente/evidenze/provider,
stati e azioni («Segnala un errore», «Interrompi la condivisione», «Ritira il
riepilogo»). La demo usa «dati di esempio». Rimossi dettagli interni su futuri
provider/costi dal pannello del servizio; limiti della demo e delle copie
salvate restano espliciti. Landing, FAQ, guida, messaggi negli inviti e sette
errori API allineati. Nessuna rinomina di campi/API, modifica a logica,
layout, dati o requisiti di consenso. I testi per utenti dovranno continuare
a distinguere il controllo dal risultato usando parole comuni.

Build/typecheck e scenario landing experience passati. QA indipendente con
API completamente simulate:27 controlli, tenant/both/landlord a1440/390/320px,
otto stati, creazione di esempio, ritiro confermato, segnalazione e consenso
per invito. Checkbox obbligatoria e reset verificati, come visibilità al
proprietario dopo condivisione. Zero overflow, violazioni axe configurate,
errori console/JavaScript e vecchi termini nelle viste controllate. Tutte le
177 richieste API, inclusi cinque POST/DELETE, intercettate; nessuna scrittura
DB. Screenshot mobile ispezionato. Evidenze ignorate in `.local/plain-income`.
Aggiornati i locator della suite browser reddito alle nuove etichette;
questa suite con database non rieseguita per una modifica solo di testi,
preservando il dev attivo. Backend modificato soltanto nei sette messaggi
d’errore: la QA verifica interfaccia/richieste, non riesegue gli handler DB.

Pubblicato `8faefc26cd8b0b409f0a695b92a2ef80a1d910fa`: web
`6f563b09-4b5e-444b-923a-e8dac50ffc5d` **SUCCESS**, una replica online senza
crash; cron pronto, DB online e nessun lavoro pending. Health preview200 e
bundle `index-CY6EstsN.js` verificati, senza «attestazione». Pagina verifiche
della build pubblica a390px con API simulate: nuovo titolo visibile, nessun
vecchio termine, overflow, errore console o violazione axe configurata.
Evidenze Railway in `.local/plain-income`; dev locale ancora pronto. Esito
operativo conservato locale per evitare un deploy soltanto documentale.


## Ingresso per mese o periodo — 2026-10-04

Feedback sul campo «Giorno desiderato di ingresso»: nuove preferenze con
mese predefinito, intervallo tra due mesi oppure giorno preciso. Mesi/anni
in italiano in un select nativo,36 mesi disponibili più eventuali valori
salvati fuori intervallo. Fine del mese inclusiva: una casa disponibile il
15 dicembre è compatibile con «dicembre», ma una dal1 gennaio non lo è.
Calendario e formattazione comuni in `shared/move-in.ts`; API valida e
normalizza inizio/fine e precisione. Discovery SQL e compatibilità inviti
usano lo stesso limite finale. Date/payload legacy restano precisi; vecchio
testo di compatibilità del giorno preservato. Pubblicazione dirty bloccata,
anteprima degli ultimi dati salvati e annullamento pending alla modifica;
conversazioni accettate preservate, come prima.

Review indipendente ha rilevato la perdita del nuovo draft calendario alla
pausa: la chiave del form ora dipende dalle preferenze, non dalla revisione
di stato. Regressione UI coperta, incluso il giorno ricordato durante i
toggle. Nessuna nuova dipendenza, modifica ai redditi o a foto/pagamenti.

Il watcher locale ha applicato007 al primo salvataggio, prima di una
rifinitura del cast calendario SQL. Ripristinato il file byte per byte al
checksum originale e aggiunta008 correttiva transazionale; nessuna modifica
al ledger o reset del cluster. Dev fermato per i test DB e riavviato con
HMR/watch. Otto migrazioni applicate;5 utenti,2 profili,1 immobile e hash
completo dei campi data identici prima/dopo. Procedura documentata in
`docs/operations/development.md` per evitare altri salvataggi intermedi.

Build/typecheck e247 test backend passati. Suite browser principale:
21/22 passati inizialmente, unico fallimento un locator del vecchio testo
«provider» sostituito nel lavoro precedente; aggiornato al testo italiano
corrente e tutti e quattro i test mail-runtime rieseguiti con successo.
Totale22 scenari principali verificati.14/14 esperienza passati, inclusi
due nuovi flussi mese bisestile/reload, periodo tra anni/pubblicazione e
legacy/toggle/pausa/budget. Nessun errore console/JavaScript/rete inatteso
nei due nuovi flussi, overflow320px o violazione axe configurata.
Sei screenshot desktop/mobile salvati e ispezionati. Evidenze ignorate in
`.local/move-in`; dev pronto e dati sintetici preservati. Pubblicazione
nella preview Railway esistente, da verificare sul commit finale.


Primo deploy `411cdb2` / `5244561e-82fb-45ce-8aa4-bcd05231fb48`
fermato nel preflight: migrazioni applicate, ma `shared/move-in.ts` assente
dallo stadio Docker runtime. Aggiunto `COPY shared`, verificata la chiusura
delle importazioni di web/preflight/cron. Build Docker locale riuscita con
CA di sessione montata solo nei passi npm; dipendenze di produzione e utente
node. Smoke nel container senza rete/DB: import API/foto e matching del mese
bisestile passato. File CA, log e immagine di prova restano fuori dal repo;
il Dockerfile pubblicato non incorpora certificati di sessione.

Regressione automatizzata aggiunta: `tests/runtime-files.test.ts` ricostruisce
in una cartella temporanea i sorgenti runtime selezionati dal Dockerfile e
importa realmente l'API in un processo isolato. Nessun avvio server o DB;
non confronta una stringa COPY fissa. Test passato e typecheck finale
riuscito. Le dipendenze installate sono riusate nel test; la verifica delle
sole dipendenze production è invece quella del container costruito sopra.


Pubblicato il fix finale `fc7c70f8f0f79cba7c10dd61450de902eaf8f17e`:
web `223d3f5b-e40d-4fea-a66d-0d201329382e` **SUCCESS**, una replica
online senza crash; cron `3105c1a3-f264-4315-bd62-de4c8f3b045a` pronto,
DB online, nessun warning/critical attivo o lavoro pending. I fallimenti
storici restano nella finestra operativa; il deploy corrente è riuscito.
Log preflight confermano migrazioni e storage privato pronti. Health/config
HTTPS preview200 e hash dei due asset identici alla build locale finale.
Form della build pubblica a390px verificato con sessione/profilo sintetici
intercettati e config runtime reale: nuovo default mese, legacy giorno03,
passaggio al periodo e selettori leggibili. Zero overflow, errori browser/
rete inattesi o violazioni axe configurate. Nessuna scrittura nel DB pubblico
per questi controlli. Evidenze Railway in `.local/move-in`; dev locale
pronto. Aggiornare la scheda `/profile` per caricare il nuovo bundle.
Esito operativo salvato localmente per evitare un deploy solo documentale.


## Contratti distinti dalla permanenza — 2026-10-04

Richiesta browser: distinguere studenti,4+4,3+2 e temporanei invece di una
sola durata in mesi. Aggiunti `contract_preference` al profilo e
`contract_type` all’immobile. Select nativo con descrizione dinamica in
italiano; formule standard verificate su Legge431/1998 art2 e DM16/1/2017
art2–3. Gli studenti sono universitari fuori sede; transitorio legato a
esigenza temporanea. Dettagli e fonti in `docs/product/06-contract-preferences.md`.
Permanenza numerica distinta dalla durata legale, senza auto36/48 o altre
modifiche ai valori salvati. I contratti non vengono generati o verificati.

Profilo precedente/payload senza campo: «Sono flessibile»; immobile:
«Da concordare». Preferenza specifica richiede la stessa formula dell’offerta,
quindi un tipo non definito non è dichiarato compatibile con una specifica.
Query discovery e invio/accettazione inviti usano la stessa regola.
Contratto incluso in proiezioni pubbliche e snapshot; inviti accettati/chiusi
mantengono quello originale, snapshot vecchi senza formula non ereditano il
tipo attuale. Modifiche annullano pending come prima. Tipo nei riepiloghi
profilo, immobili, inviti e chat; privacy e guida aggiornate. Draft conservato
alla pausa, con chiave form basata sulle preferenze salvate e non sullo stato.

Migrazione009 solo additiva; supervisor dev fermato prima di scrivere il
file. Review indipendente senza rilievi. Build/typecheck e311 test backend
passati, con16 nuovi test API e matrice dei tipi. Prima esecuzione310/311:
una fixture ripubblicava un profilo dopo l’edit, contando due revisioni;
corretta per simulare il solo salvataggio del form, suite completa311/311.
22 browser principali e17 esperienza passati. Tre nuovi scenari mockati
coprono selezione/salvataggio/reload/pausa, proprietario e offerta in inviti/
chat; zero errori console/rete inattesi, overflow320 o violazioni axe.
Screenshot desktop/mobile ispezionati. Immagine Docker con dipendenze
production costruita, helper shared incluso; import API e matching contratti
verificati nel container senza rete/DB. Evidenze private in `.local/contracts`.


Anche5/5 scenari browser preview/foto passati (persistenza/rimozione,
retry senza duplicati, validazione profilo e ruoli demo). Riavviato il
supervisor dev con HMR/watch: health locale200,9 migrazioni presenti.
5 utenti,2 profili e1 immobile invariati; hash delle preferenze, date,
durate, revisioni e dati immobile precedente identico prima/dopo.
Nuovi campi preesistenti valorizzati soltanto ai default any/unspecified.
Nessun segreto o dato sintetico generato tracciato. Deploy Railway da
verificare sul commit finale, nello stesso percorso autorizzato.


Pubblicato `4a65a8dcaf017c094cf26fb81aff55f85e951436`: web
`8affecc2-3a96-4f49-a53c-6eb45b86f621` **SUCCESS**, una replica online
senza crash; cron `d775fbb9-ab37-449d-9788-e2b63e4727b3` pronto, DB
online, nessun warning/critical attivo o lavoro pending. Preflight conferma
migrazioni e storage privato pronti. Health/config HTTPS preview200 e hash
JS `index-B84-NzKt.js`/CSS `index-DFbERW4G.css` identici alla build locale.
QA della build pubblica con config reale e sole API GET session/profile/
properties sintetiche intercettate: tutte le formule nel profilo, hint,
12 mesi invariati, anteprima salvata intatta; proprietario da non definito
a studenti senza modificare6–36. Zero scritture/tentativi POST/PUT pubblici,
errori console/JavaScript/rete, overflow390px o violazioni axe configurate.
Screenshot e metadati in `.local/contracts`; dev pronto e dati locali
preservati. Aggiornare `/profile` per caricare il nuovo bundle. Esito
operativo conservato localmente per evitare un deploy soltanto documentale.


## Feedback sullo slogan della dashboard — 2026-10-04

Annotazione «Le tue scelte restano tue. Puoi fermarti quando vuoi.»:
la frase e il vecchio riquadro risultano già rimossi da `9eb45d0`.
Nessun altro cambiamento di codice necessario. Verificati nuovamente
health preview e bundle pubblici identici a `4a65a8d`; dashboard pubblica
con API sintetiche a1440/390px senza quella frase, overflow, errori browser
o violazioni axe configurate. Evidenze in `.local/dashboard-slogan`.
Lo screenshot annotato mostra una versione precedente. Richiesta di
riapertura browser tramite UI non confermata: attesa interrotta senza
asserire una navigazione avvenuta. Per vedere la versione corrente usare
`/dashboard?v=4a65a8d` o aggiornare la scheda. Dev e dati preservati,
nessun nuovo push/deploy per una correzione già pubblicata.

## Foto del profilo — 2026-10-04

Feedback browser «Rendi possibile aggiungere una foto» sul profilo di
ricerca. Aggiunta una foto facoltativa con anteprima, salvataggio esplicito,
sostituzione, rimozione e recupero degli errori. Uploader separato dalle
preferenze: non altera le modifiche non salvate, le revisioni o gli inviti.
Una foto JPEG/PNG/WebP fino a5 MB, WebP normalizzato senza metadati nello
storage privato esistente; può precedere il salvataggio delle preferenze.
Titolare e contatti con invito accettato/chiuso, attivi e non bloccati,
possono vederla. Non appare nella scoperta anonima. Avatar negli inviti e
in chat, spiegazioni della condivisione aggiornate. Migrazione010 aggiuntiva,
retry con token e cleanup persistente per sostituzioni/rimozioni/cascade.
Build/typecheck,327 test backend,22 browser principali,5 preview e20
experience passati. Un’asserzione della nuova fixture adattata all’header
esplicito private,no-store; suite completa poi verde. Revisione indipendente
su visibilità, retry, cleanup e ordine dei lock senza rilievi materiali.
Immagine Docker production costruita e import API/helper foto/migrazione010
verificati senza rete né DB. Screenshot mobile320 e controlli axe/layout,
console/rete passati. Il flusso reale preview prova upload, refresh,
scoperta senza foto, condivisione dopo match e rimozione anche dal lato
proprietario. Dev riavviato con HMR/watch, health locale200;5 utenti,
2 profili e1 immobile con hash dei dati e delle revisioni identico prima/dopo.
Evidenze private in `.local/profile-photo`. Pubblicazione e verifica nella
stessa preview Railway autorizzata sul commit finale.

Pubblicato `e2f4bdbe2ea35d84960034dab154c4e679a37dc1`: web
`bf8cb518-e242-47a2-aaa7-bb53392bfc79` SUCCESS, una replica online senza
crash; cron `59093572-e515-4431-8e03-20e035932185` SUCCESS/cronReady,
DB online e nessun warning/critical attivo o lavoro pending. Migrazioni e
preflight storage privato passati. Health/config HTTPS preview200 e bundle
JS `index-DNwan2Up.js`/CSS `index-YbHV1Cf5.css` identici alla build locale.
Il flusso browser reale sulla preview pubblica, senza API intercettate, passa:
nuovo workspace sintetico, upload nello storage persistente, refresh con
immagine leggibile, preferenze/revisione invariate, discovery anonima senza
foto, invito/accettazione/chat, immagine visibile al proprietario e rimozione
verificata da entrambi i lati. Nessun errore console/rete o overflow nei
viewport320/390; zero dati personali reali o email inviate. Nuovo oggetto
foto del test rimosso tramite il prodotto; solo account/dati sintetici del
workspace di prova. Evidenze in `.local/profile-photo`, test pubblico1/1.
Dev locale resta pronto con HMR/watch e health200. Esito operativo conservato
localmente per evitare un deploy soltanto documentale. Aggiornare `/profile`
oppure usare `/profile?v=e2f4bdb` per vedere la nuova funzionalità.

## Ripresa del ciclo feedback — 2026-10-05

Richiesta «Riprendi». Confermati checkout e2f4bdb e foto profilo già
pubblicata: stessa deployment web SUCCESS/online, una replica senza crash,
DB online, cron con ultima esecuzione riuscita, nessun warning/critical
attivo o lavoro pending. Health/config HTTPS preview200 e hash bundle
identici alla build locale. Supervisor40573 ancora attivo con API watch,
Vite/HMR e PostgreSQL loopback; health API/proxy e client Vite200,
accesso HTTP ai dati privati `.local` negato403. Nessun nuovo test o deploy
necessario per riprendere. Dati e modifiche preesistenti conservati.
Tentativo di apertura del profilo nel pannello browser destro non eseguito:
`codex_app.open_in_codex` restituisce «No handler registered for tool».
Il sito resta raggiungibile via `/profile?v=e2f4bdb`; nessuna apertura
laterale dichiarata come riuscita. Pronto per nuovi feedback dell’utente.

## Durata condizionale e dettagli del profilo — 2026-10-05

Feedback «Quanti mesi cerchi casa… solo quando serve… non4+4» e richiesta
animali/altre informazioni. Mesi nascosti per4+4 e3+2, nuovi salvataggi null,
criterio numerico escluso coerentemente dal matching e dalla discovery.
Scelta flessibile/studenti/transitorio richiedono la permanenza indicativa.
Migrazione011 mantiene le durate esistenti; non aggiunge valori nascosti36/48.
Aggiunti animali, arredamento, ascensore, spazio esterno, posto auto,
presentazione e dettagli sugli animali. Scelte strutturate nella scoperta;
testi liberi solo al titolare e dopo accettazione, con controlli su blocchi,
sospensioni e workspace. LegacyPUT preservano i campi omessi; UI permette
cancellazione esplicita. Riepiloghi profilo/discovery/inviti/chat e copy
condivisione allineati. La bozza sopravvive a cambi formula/foto/pausa.
Build/typecheck,380 backend e23 experience passati. Una nuova fixture export
corretta per leggere il primo profilo dall’array esistente; suite completa
poi verde. Review indipendente positiva, copyinvito corretto per non
subordinare presentazione alla foto. Passati anche6 scenari preview con browser reale e22 browser principali.
Il nuovo flusso esercita4+4 senza mesi, roundtrip/reload dei5extra, selezioni
multiple, discovery senza testi privati, invito/accettazione e chat con
presentazione/dettagli. Immagine Docker production costruita, import API,
helper e migrazione011 verificati senza rete/DB. Formattazione/diffpassati.
Supervisor dev riavviato con HMR/watch, health locale200;5 utenti,2 profili
e1 immobile preservati, hash dati/revisioni/durate identico prima/dopo.
Nuovi campi solo ai default. Evidenze private in `.local/profile-details`.
Deploy nella stessa preview Railway autorizzata sul commit finale.

Pubblicato `03d5991a032629036b9730b9d0741fc22e9bc1a5`: web
`213206f4-c0df-4f46-969e-5034f3e696b9` SUCCESS, una replica online senza
crash; cron `7b8bd9e5-477a-4c50-a25b-5f6961b70ff2` SUCCESS/cronReady,
DB online, nessun warning/critical attivo o pending. Migrazioni e preflight
storage privato pronti. Health/config HTTPS preview200 e hashJS
`index-BnbsQsyS.js`/CSS `index-BG6mlpf8.css` identici alla build locale.
Nuovo flusso browser reale sulla preview pubblica, senza API intercettate,
1/1 passato:4+4 senza mesi, tutti i nuovi campi persistenti dopo refresh,
selezioni multiple, discovery compatibile anche con offerta24–60 mesi e
senza testi privati; invito, accettazione e presentazione/dettagli visibili
nelle card e nella chat del proprietario. Zero errori console/rete o
overflow320px. Solo nuovo workspace e dati sintetici, nessuna email inviata.
Evidenze in `.local/profile-details`. Dev locale health200 e HMR/watch
pronto. Esito operativo conservato localmente per evitare un deploy solo
documentale. Aggiornare `/profile?v=03d5991` per vedere il form corrente.

## Accenti blu coerenti — 2026-10-05

Feedback sul marrone di «da te.» nella homepage. Il token decorativo accent
ora usa il blu primario del marchio, allineando titolo, punto del logo,
lineette, asterischi e numeri dei passaggi. Il bordo degli avvisi di bozza
usa invece il token warning, coerente con testo e sfondo. Nessun cambio
ai dati o ai flussi. Build/typecheck passati; browser reale sulla homepage
a1440/390/320px con colori calcolati uguali al primario, zero overflow,
violazioni axe o errori console/rete. Screenshot controllati; review
indipendente positiva. Evidenze private in `.local/blue-accent`.
Pubblicazione nella stessa preview Railway autorizzata sul commit finale.

Accenti blu pubblicati sul commit `1ac986d763bc9c5a62545101fee01b216da52bb4`:
web `b339ae40-e6ee-4ebe-a319-605bf20dcdbc` SUCCESS/online e cron
`880c137a-00ea-4d69-9d1f-7f9373483338` SUCCESS/cronReady; DB online,
nessun problema o pending. Health/config preview200, asset identici alla
build locale e controlli browser pubblici1440/390/320px passati, zero
errori/overflow/violazioni axe. Evidenze in `.local/blue-accent`.

## Foto di gruppo o per persona — 2026-10-05

Feedback foto per più affittuari; l’utente chiede di lasciare la scelta a
chi cerca casa. Il profilo offre una sola foto propria/di gruppo oppure
foto individuali con fino a11 persone aggiuntive. Nomi richiesti solo per
creare una scheda, immagini facoltative. Foto principale mantenuta con
spiegazione al cambio, schede conservate ma nascoste ai contatti scegliendo
una sola foto. Upload/salvataggi/nome in bozza bloccano il cambio opzione;
annullamento disponibile. Le preferenze non vengono rimontate o salvate
implicitamente. Il numero totale resta esplicito, con promemoria quando
le schede superano le persone indicate.

Migrazione012 aggiuntiva, namespace privato persistente, token/tombstone
per retry senza duplicati o ripristini, cleanup su rimozione/sostituzione e
cascade account. `tenant_household` negli inviti/chat soltanto dopo
accettazione/chiusura, parti attive, senza blocchi e stesso workspace
preview. Nomi/foto aggiuntivi assenti dalla discovery. In modalità group
il contatto vede membri vuoti e gli URL foto rispondono404; il titolare
può recuperare le schede conservate. Nessun nuovo account o verifica di
identità, nessuna modifica a revisioni/inviti.

Build/typecheck,399 backend e26 experience passati. Review indipendente
ha rilevato due casi corretti: nomi in bozza durante cambio modalità e
foto dei coinquilini di un account both esposte al suo inquilino locatario.
Guard UI estesa e accesso media limitato al proprietario del profilo di
ricerca;20 test API mirati e3 UI ripassati con regressioni aggiunte.
Sette flussi preview reali passati. Due fixture precedenti allineate ai
nuovi copy/alt; eliminato un ruolo status superfluo dal suggerimento di
cambio modalità, che duplicava temporaneamente la conferma foto.
Screenshot mobile e controlli axe/layout/console/rete passati. Immagine
Docker con CA cloud costruita, import API/helper e migrazione012 presenti
verificati senza rete né DB. Tentativo Docker senza CA interrotto e
corretto secondo istruzioni runtime; nessun cambio al Dockerfile pubblicato.
Evidenze private `.local/household-photos`. Verifica browser principale,
conservazione dati e deploy nella stessa preview Railway autorizzata.

Passati anche22 scenari browser principali; formattazione e diff verificati.
Supervisor dev60272 riavviato con API watch, Vite/HMR e migrazione012;
health locale200. Conservati5 utenti,2 profili e1 immobile, hash di dati,
revisioni e preferenze identico prima/dopo. Nessun dato dell’app cancellato.
Pubblicazione e prova browser reale sulla preview sul commit finale.

Pubblicato `7b12b525303d9762dc1c7d61a2f23d12d8122368`: web
`81b6fe48-0fe5-4e11-9ffc-807f94b9b170` SUCCESS/online, una replica senza
crash; cron `c17a5a04-6abe-4a74-8717-a3518509982e` SUCCESS/cronReady,
DB online, nessun warning/critical o pending. Migrazioni e preflight storage
privato pronti. Health/config HTTPS preview200; JS `index-B8bo41Hp.js` e
CSS `index-B85J2ebA.css` identici alla build locale. Flusso browser reale
sul sito pubblico, senza API intercettate,1/1 passato: foto principale
di gruppo, scelta individuale, persona/foto persistenti dopo refresh,
discovery anonima senza nomi/immagini, invito/accettazione/chat con membri,
ritorno gruppo che nasconde metadata e nega URL foto404, ritorno individuale
che ripristina le schede, rimozione finale di foto/persona/foto principale.
Console/rete/layout320px e axe verificati; richieste404 di privacy attese.
Solo nuovo workspace sintetico, nessuna email inviata; oggetti caricati dal
test rimossi via prodotto. Evidenze in `.local/household-photos`.
Dev locale60272 resta pronto con HMR/watch e health200. Esito operativo
conservato localmente per evitare un deploy solo documentale. Aggiornare
`/profile?v=7b12b52` per provare entrambe le opzioni; homepage blu confermata.

## Vantaggi della homepage separati su mobile — 2026-10-05

Feedback sulle tre frasi percepite come testo senza struttura. La fascia
ora è una lista di tre vantaggi con icone SVG, testo allineato a sinistra
e divisori orizzontali sotto700px. Desktop su tre colonne con divisori
verticali. Sostituite le vecchie regole che centravano le frasi e nascondevano
gli asterischi; stessi testi e token della palette. Lista accessibile e
icone decorative. Build/typecheck e scenario landing esistente passati.
Browser reale320/390/650/768/1440px: layout e divisori calcolati corretti,
zero overflow, errori console/rete o violazioni axe; screenshot mobile e
desktop controllati. Nessun cambiamento a dati o API; dev60272 con HMR
riutilizzato e lasciato pronto. Evidenze private in `.local/mobile-benefits`.
Pubblicazione nella stessa preview Railway autorizzata sul commit finale.

Fascia vantaggi pubblicata `fc4eb3d27dc8b645d7b1e3e6da3bfda6472b71ea`:
web `a878d0a5-56cb-4620-b0fb-42fdd9e0a74f` SUCCESS/online, una replica senza
crash; cron `985e9c17-2c63-4ce4-bfa8-53c82154f6f3` SUCCESS/cronReady,
DB online e nessun warning/critical o pending. Health/config HTTPS
preview200, JS `index-11Ri2YQ_.js` e CSS `index-CS1L1i4p.css` identici alla
build locale. Browser pubblico320/390/650/768/1440px: tre voci con icone,
divisori orizzontali mobile e verticali desktop, zero overflow/errori o
violazioni axe. Evidenze in `.local/mobile-benefits`; nessuna scrittura
dati. Dev60272 continua con HMR/watch e health200. Esito conservato
localmente per evitare un deploy soltanto documentale. Aggiornare la
homepage con `/?v=fc4eb3d`.

## Frase ripetuta nelle FAQ — 2026-10-05

Feedback sulla coppia link «Come funziona LinkedHome →» e prima domanda
«Come funziona LinkedHome?». Rimosso soltanto il link introduttivo di
`ProductFAQ`; la domanda espandibile resta l’unica voce nella sezione.
La guida è raggiungibile dagli altri collegamenti esistenti. Build/typecheck
e scenario landing passati. Browser reale320/390/650/1440px: nessun link
duplicato, domanda unica e toggle da tastiera funzionante, zero overflow,
errori console/rete o violazioni axe. Screenshot mobile controllato e review
indipendente senza rilievi. Nessuna modifica a dati/API; dev60272 con HMR
riutilizzato e pronto. Evidenze private in `.local/faq-copy`.
Pubblicazione nella stessa preview Railway autorizzata sul commit finale.

Pubblicato `74e427b1cbb248696fccce92af7359d2bb5e2848`: web
`eab33320-b69b-4187-8b1a-c65bd696e62e` SUCCESS/online, una replica senza
crash; cron `6f38a9d7-dfcd-40ad-9c3b-10bd69d979a0` SUCCESS/cronReady,
DB online, nessun warning/critical o pending. Health/config HTTPS preview200
e asset JS `index-DsG9JE_f.js`/CSS `index-CS1L1i4p.css` identici alla build
locale. Browser pubblico320/390/650/1440px: duplicato assente, domanda
unica e toggle da tastiera funzionante, zero errori/overflow/violazioni axe.
Nessuna scrittura DB o email, dev60272 HMR/watch pronto con health200.
Esito conservato localmente per evitare deploy documentale; aggiornare
`/?v=74e427b` per vedere la sezione corrente.

## Frase del footer — 2026-10-05

Sostituito il testo generico «Profili, immobili e inviti. Il primo contatto
parte da qui.» con «Cerchi casa. I proprietari cercano te.», che esprime
il vantaggio del prodotto. Stessa frase nel footer condiviso delle pagine.
Build/typecheck e scenario landing esistente passati. Browser reale
320/390/1440px: nuovo testo unico, vecchio testo assente, link alla guida
funzionante, nessun overflow, errore console/rete o violazione axe.
Review indipendente senza rilievi; nessuna modifica a dati/API.
Dev60272 HMR/watch riutilizzato e pronto; evidenze `.local/footer-copy`.
Pubblicazione nella stessa preview Railway autorizzata sul commit finale.

Pubblicato `937894f2951b7d0cc73e0f090aeecee30670db34`: web
`30bf3510-ea8d-4431-9afc-627aaee244ad` SUCCESS/online, una replica senza
crash; cron `81a8e612-349e-4513-a37b-0500a8370044` SUCCESS/cronReady,
DB online, nessun warning/critical o pending. Health/config HTTPS preview200;
JS `index-CXFdPpMi.js` e CSS `index-CS1L1i4p.css` identici alla build locale.
Browser pubblico320/390/1440px: nuova frase unica nel footer, vecchio copy
assente, collegamento alla guida funzionante, zero overflow/errori o
violazioni axe. Evidenze `.local/footer-copy`, nessuna scrittura DB o email.
Dev60272 HMR/watch pronto con health200. Esito conservato localmente
per evitare un deploy documentale; aggiornare `/?v=937894f`.

## Preparazione alla pubblicazione — 2026-10-05

Richiesta di eliminare i riferimenti alla preview e preparare il lancio.
Homepage, footer, guida pubblica e metadati ora presentano il prodotto senza
etichette preview/demo/prototipo o «nome di lavoro». Rimossa la didascalia
di prova della hero; le schede restano chiaramente esempi di profilo/invito.
Footer con copyright LinkedHome. Rimossi anche i testi demo che comparivano impropriamente in
produzione nelle FAQ e nel percorso reddito. La disponibilità del reddito
reale resta dichiarata; gli esempi finanziari restano identificati.
Accesso e workspace di prova riconoscibili in italiano comune, senza
modificare auth, isolamento, dati, credenziali o runtime Railway. La barra
dell’ambiente compare solo nei percorsi privati non produttivi.

Build/typecheck,7 regressioni browser nuove,4 scenari mail/runtime esistenti
e landing1 passati (12 totali, API simulate, nessuna email inviata).
Browser reale HMR320/390/1440px su homepage, guida e accesso: nessun
vecchio riferimento sulle pagine pubbliche, footer/link funzionanti,
zero overflow/errori console/rete/violazioni axe o richieste mutative.
Screenshot mobile controllati; dev60272 con HMR/watch mantenuto.
Evidenze private `.local/publication-ready`; nessuna scrittura dati.

Audit infrastruttura in sola lettura: web/DB online, cron pronto, nessun
problema/pending; sito ancora APP_ENV=preview con email disabilitate e
solo dominio Railway. Piano concreto in `docs/operations/publication.md`:
produzione separata con DB vuoto e storage privato, SMTP/mittente e prove
di consegna, contatti/informative e configurazione operativa. Non convertire
il database sintetico alla produzione. Noindex resta durante la preparazione.
Domanda inviata sui dati di dominio, mittente/assistenza e titolare; nessuna
credenziale richiesta in chat. Nuovi servizi, acquisti, email reali e apertura
agli utenti reali non eseguiti. Pubblicazione dei testi nella stessa istanza
Railway già autorizzata sul commit finale.

Review indipendente senza blocchi al deploy; corrette nel piano le risposte
403 dell’accesso di prova in produzione e il percorso /api/income/checks.
Dopo l’ultima pulizia della hero ripassati7 casi browser, build/typecheck
e QA HMR responsive completa. Nessuna nuova dipendenza o modifica server.

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

Provisionato il bucket Railway `linkedhome-photos` (`88ac2af5-03e0-4447-9970-8bedd156550b`, `sjc`) nello stesso progetto/ambiente. Web e cron ricevono riferimenti S3, senza leggere credenziali. Preflight controlla scrittura/lettura/cancellazione. Pubblicazione sul branch esistente in preparazione; verificare il nuovo deployment e upload HTTPS prima di dichiararlo online. `open_in_codex` per il dominio esistente con `placement: "right"` restituisce `queued`: non prova che il pannello sia già visibile sul computer.

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

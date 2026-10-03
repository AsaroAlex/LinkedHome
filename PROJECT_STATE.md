# PROJECT STATE

Aggiornato il 2026-10-04. Repository `/workspace/LinkedHome`, branch locale `work`, riferimento remoto richiesto `claude/sweet-goldberg-5lwng7`. Marchio corrente: **LinkedHome**, scelto esplicitamente dall'utente dopo il pull a `9db6a9c`; vedere l'ultima continuazione e D-007. L’utente ha autorizzato **«Esegui tutto il piano del repository»**, incluse revisioni indipendenti A–H. Le fasi 0–28 sono **completate per il perimetro locale con dati sintetici** adottato in PLAN e nel contratto delle funzionalità.

Preservare questo checkout isolato: niente reset, switch, worktree, pull automatici o perdita dei dati ignorati. L’utente ha autorizzato il push su `claude/sweet-goldberg-5lwng7`, eseguito e verificato il 2026-10-03. Nessuna PR, deploy pubblico, servizio a pagamento o contatto esterno.

## Risultato

Dossier di ricerca consolidato e verificato nei limiti dichiarati, seguito da prodotto, naming iniziale **Soglia**, poi **Doorluma** e ora **LinkedHome** per scelta esplicita dell'utente, UX, design e architettura. Implementato un monolite TypeScript/Fastify/React/Vite con PostgreSQL nativo, senza Docker obbligatorio. Il nome non ha clearance; italiano completo, struttura locale EN preparata senza traduzione completa. Le sezioni storiche mantengono le decisioni e i risultati osservati nelle rispettive date.

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

## Nome LinkedHome scelto dall'utente — 2026-10-04

Dopo «Fai pull e unisci il lavoro», eseguito un pull fast-forward da `65f38ee` a `9db6a9c`, senza conflitti o modifiche locali da perdere. L'utente ha quindi richiesto «Procedi con linkedhome e procedi alle modifiche necessarie». Il marchio corrente è **LinkedHome**, slug `linkedhome`, payoff invariato **Affitti che iniziano da un invito.** Il nome centralizzato aggiorna UI, email, log, nuove emissioni sintetiche e download `linkedhome-dati.json`; metadati HTML e documentazione corrente sono allineati. Il contenuto storico delle attestazioni e delle evidenze resta immutato; non è necessaria una migrazione di database, cookie o identificatori tecnici.

Dominio futuro proposto: **linkedhome.eu**, con `.it` facoltativo; entrambi disponibili nel controllo nominale del registrar del 4 ottobre, mentre `.com` è registrato. Nessun acquisto o configurazione DNS/origin/mittente effettiva. Linkhome e Linkedhomes sono usi immobiliari vicini documentati; l'approvazione del nome non è una clearance legale. [Naming corrente](docs/product/03-naming.md), [dominio](docs/operations/domain-setup.md) e [D-007](docs/DECISIONS.md) conservano decisione, fonti e limiti.

`npm run check` passato in sequenza: build/typecheck, **161 test backend su7 file**, **19 scenari browser applicativi** e **11 esperienza/mail**; quattro scenari mail ripetuti,26 distinti. Nome e controlli di accesso verificati visivamente a1440px,390px e320px senza overflow. [Verifica corrente](docs/operations/validation.md) e [evidenza LinkedHome](docs/operations/evidence/linkedhome-validation.json) registrano risultati e limiti. Nessun seed/reset del database applicativo, invio esterno, deploy o ulteriore push.

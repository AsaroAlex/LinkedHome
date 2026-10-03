# Avvio di LinkedHome / Soglia nell’ambiente cloud

Usa `/workspace/LinkedHome`, checkout isolato già fornito dalla piattaforma. Preserva modifiche, dati ignorati e commit locali. Non creare worktree, non fare reset, switch, pull o push automatici. Il branch locale `work` può differire dal riferimento remoto richiesto `claude/sweet-goldberg-5lwng7` senza essere un errore. Nessuna PR senza richiesta.

Leggi eventuali AGENTS.md applicabili, `PROJECT_STATE.md`, `PLAN.md` e `README.md`. Il piano autorizzato comprende ricerca e MVP locale completo, non è più limitato alla documentazione. Lo stack implementato è TypeScript/Fastify/React/Vite/PostgreSQL. Le revisioni indipendenti sono nei file review02–05. Nessun provider reale o rilascio pubblico è disponibile.

## Installazione

Runtime verificato: Node24.19.0, npm11.9.0, Linux x64 non-root; PostgreSQL nativo dal pacchetto bloccato. Docker non serve. Esegui lo script salvato, equivalente a:

```bash
cd /workspace/LinkedHome
npm ci
npm run bootstrap
npm run build
```

Il bootstrap crea soltanto il cluster locale su loopback55432, migrazioni con checksum e account sintetici. È ripetibile e preserva i dati. Genera credenziali in `.local/database.json` e `.local/demo-accounts.json` con permessi0600; non stamparle, copiarle nella chat o committarle. Nessun segreto esterno richiesto. Se `DATABASE_URL` è configurato, il bootstrap rifiuta: verificare la destinazione e seguire le istruzioni per database esterni nel README; mai svuotarla automaticamente.

## Servizio e verifica funzionale

I processi non sopravvivono al ripristino. Verifica se l’app è già in esecuzione con una richiesta locale a `/api/health` sulla porta3000 e ispeziona il processo prima di riutilizzarlo. Per avviare UI compilata/API:

```bash
cd /workspace/LinkedHome
npm start
```

In alternativa `npm run dev` avvia Vite3000 e API3001, con proxy sullo stesso origin. Usare un processo gestito dal terminale e conservarne l’identificatore. Default HTTP su127.0.0.1; `APP_ORIGIN` deve corrispondere all’origin del browser. Non esporre pubblicamente questo ambiente sintetico. `APP_ENV=production` è intenzionalmente bloccato.

Verificare health, HTML e asset, poi login di un account sintetico e lettura dei suoi immobili/profili compatibili. Credenziali e cookie restano locali e non vanno stampati. La posta di conferma/reset è in `.local/mail/`; nessuna email reale parte e nessun endpoint HTTP espone la casella. Ctrl+C arresta i processi; riavvio e bootstrap conservano gli account. Non cancellare il cluster per rimediare a un errore di lock.

## Controlli

```bash
npm run build
npm test
npm run test:e2e
```

Eseguire in sequenza. Per E2E fermare prima il proprio servizio e liberare3000; non terminare processi altrui. Non avviare contemporaneamente comandi che possiedono lo start/stop del DB. Unit/integration usano `soglia_test`, Playwright `soglia_e2e`, app `soglia`. I test rifiutano database esterni e verificano la destinazione effettiva prima delle scritture. Chromium verificato: `/usr/bin/chromium`; se assente, `npx playwright install chromium` oppure `CHROMIUM_PATH` verso un binario installato.

`npm run maintenance` richiede il DB avviato e rimuove dati oltre le soglie documentate. Non esiste scheduler: la pulizia è responsabilità dell’operatore; nessun limite massimo di conservazione è garantito localmente. Per dati persistenti leggere `docs/operations/security.md`.

## Stato verificato e limiti

Il 2026-10-03: frozen install, bootstrap ripetuto, build,71 test unitari/integrati,10 scenari browser, avvio/dev/riavvio e richieste funzionali riusciti. Dati applicativi preservati:5 utenti,2 profili,1 immobile,3 migrazioni. Evidenze e limiti in `docs/operations/validation.md`; risultati precedenti non sostituiscono i controlli necessari per nuove modifiche.

Questa configurazione è una bozza salvata: non pubblica lo snapshot e non dimostra un ripristino su nuovo task. I commit dell’implementazione sono locali; il branch remoto non è stato aggiornato. Il ripristino di commit locali non pubblicati non è garantito dalla piattaforma: non risolvere con reset o push non richiesti. La pubblicazione/ripresa effettiva va verificata separatamente. Conservare rete e credenziali piattaforma esistenti; usare HTTPS Git già autenticato senza estrarre token.

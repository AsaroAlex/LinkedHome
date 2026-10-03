# Avvio di LinkedHome nell’ambiente cloud

Usa `/workspace/LinkedHome`, checkout isolato già fornito dalla piattaforma. Preserva modifiche, dati ignorati e commit locali. Non creare worktree, non fare reset, switch, pull o push automatici. Il branch locale `work` può differire dal riferimento remoto richiesto `claude/sweet-goldberg-5lwng7` senza essere un errore. Nessuna PR senza richiesta.

Leggi eventuali AGENTS.md applicabili, `PROJECT_STATE.md`, `PLAN.md` e `README.md`. Il piano autorizzato comprende ricerca e MVP locale completo; il lavoro successivo autorizzato prepara integrazioni reali e deploy. Lo stack implementato è TypeScript/Fastify/React/Vite/PostgreSQL. Le revisioni indipendenti locali sono nei file review02–05. SMTP reale e template staging sono implementati; account, dominio, credenziali e infrastruttura remota non sono stati provisionati. Segui [deployment.md](deployment.md) per quel percorso, mantenendo locale il default di questa macchina.

Il brand approvato dall'utente è **LinkedHome**. Il dominio principale futuro proposto è `linkedhome.eu`, `.it` facoltativo; `linkedhome.com` è già registrato e non è in attesa di nuova registrazione. Nessun dominio acquistato o origin/mittente SMTP reale modificato. La clearance del marchio resta aperta, comprese le vicinanze Linkhome e Linkedhomes: seguire [domain-setup.md](domain-setup.md) e i [controlli del 4 ottobre 2026 alle 00:17 CEST](evidence/linkedhome-domain-research.json). Evidenze e risultati delle precedenti scelte di nome conservano nomi e date originali.

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

In alternativa `npm run dev` avvia Vite3000 e API3001, con proxy sullo stesso origin. Usare un processo gestito dal terminale e conservarne l’identificatore. Default HTTP su127.0.0.1; `APP_ORIGIN` deve corrispondere all’origin del browser. Non esporre pubblicamente questo ambiente sintetico. Staging/production richiedono origin HTTPS esplicito, PostgreSQL esterno e SMTP valido; non impostarli per avviare la demo locale.

Verificare health, HTML e asset, poi login di un account sintetico e lettura dei suoi immobili/profili compatibili. Credenziali e cookie restano locali e non vanno stampati. Con il default `MAIL_TRANSPORT=local`, la posta di conferma/reset è in `.local/mail/`; nessuna email reale parte e nessun endpoint HTTP espone la casella. SMTP usa credenziali configurate separatamente e non va abilitato nei test automatici locali. Ctrl+C arresta i processi; riavvio e bootstrap conservano gli account. Non cancellare il cluster per rimediare a un errore di lock.

## Controlli

```bash
npm run build
npm test
npm run test:e2e
```

Eseguire in sequenza. Per E2E fermare prima il proprio servizio e liberare3000; non terminare processi altrui. Non avviare contemporaneamente comandi che possiedono lo start/stop del DB. Unit/integration usano `soglia_test`, Playwright `soglia_e2e`, app `soglia`. I test rifiutano database esterni e verificano la destinazione effettiva prima delle scritture. Chromium verificato: `/usr/bin/chromium`; se assente, `npx playwright install chromium` oppure `CHROMIUM_PATH` verso un binario installato.

`npm run maintenance` richiede il DB avviato e rimuove dati oltre le soglie documentate. Lo scheduler Render è soltanto un template non applicato: la pulizia locale è responsabilità dell’operatore; nessun limite massimo di conservazione è garantito localmente. Per dati persistenti leggere `docs/operations/security.md`.

## Stato verificato e limiti

Il 2026-10-03: frozen install, bootstrap ripetuto, build,71 test unitari/integrati,10 scenari browser, avvio/dev/riavvio e richieste funzionali riusciti. Dati applicativi preservati:5 utenti,2 profili,1 immobile,3 migrazioni. Evidenze e limiti in `docs/operations/validation.md`; risultati precedenti non sostituiscono i controlli necessari per nuove modifiche.

Questa configurazione è una bozza salvata: non pubblica lo snapshot e non dimostra un ripristino su nuovo task. Il push autorizzato ha pubblicato implementazione e documentazione nel branch `claude/sweet-goldberg-5lwng7`. La bozza usa l’esatto SHA verificato sul remoto. I sorgenti sono recuperabili da GitHub indipendentemente dallo snapshot; dati locali e processi restano separati. Non eseguire reset o ulteriori push automatici non richiesti. La pubblicazione/ripresa effettiva va verificata separatamente. Conservare rete e credenziali piattaforma esistenti; usare HTTPS Git già autenticato senza estrarre token.


## Verifiche aggiuntive di completamento

Il 2026-10-03 anche un export pulito dei sorgenti, senza dipendenze, dati o credenziali preesistenti, ha superato installazione, bootstrap, build, avvio e richieste funzionali. Un backup logico PostgreSQL è stato ripristinato in un database separato: tutte le tabelle/sequenze coincidevano, login/discovery/export funzionavano e il database originale è rimasto invariato. I dati temporanei sensibili sono stati rimossi. Evidenze in `docs/operations/evidence/clean-install.json` e `recovery.json`.

Queste prove si svolgono sulla macchina corrente: non equivalgono alla pubblicazione o al ripristino di uno snapshot cloud. La pubblicazione dell’ambiente avviene attraverso l’interfaccia del prodotto, dopo il salvataggio della configurazione; gli strumenti di questa chat non espongono tale operazione. Non occorre chiedere un’altra approvazione in chat. Dopo un’effettiva pubblicazione, verificare il nuovo ambiente e riavviare i servizi seguendo queste istruzioni.


## Repository salvato

La configurazione precedentemente salvata registra `AsaroAlex/LinkedHome` su `github.com`, con mount_path `LinkedHome` e il SHA dell’implementazione locale allora verificata. Il nuovo lavoro SMTP/deploy è successivo a quel riferimento; non presumere che la bozza o GitHub lo contengano finché non sono aggiornati esplicitamente. Non cambiare il checkout al vecchio branch remoto per aggirare il ripristino. Per attivare uno snapshot usare Review and Publish nell’interfaccia del prodotto; questa operazione non è disponibile attraverso i tool della chat.

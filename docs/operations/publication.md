# Pubblicazione di LinkedHome su Railway

Stato verificato il 2026-10-05. Il sito attuale è raggiungibile su
https://linkedhome-staging-production.up.railway.app e continua a usare
`APP_ENV=preview`, `MAIL_TRANSPORT=disabled`. Web e database online, cron
pronto, nessun problema o operazione in attesa. La pulizia dei testi pubblici
non abilita registrazioni reali.

## Destinazione per gli utenti reali

Preparare web, database PostgreSQL vuoto e storage privato dedicati alla
produzione, conservando l’istanza corrente per le prove. Non convertire il
database attuale cambiando soltanto `APP_ENV`: l’isolamento dei workspace
di prova è condizionale al runtime e i profili sintetici pubblicati potrebbero
entrare nella discovery normale. Non copiare account, profili o foto di prova.

La destinazione prevista è nello stesso progetto Railway
`6047ad41-5ab1-4aa2-ad0b-35386934d678`, con servizi separati e nomi
`linkedhome-production`, `linkedhome-production-db` e
`linkedhome-production-maintenance`. Questi servizi non sono stati creati.
Il dominio Railway corrente non viene trasferito o interrotto.

## Configurazione da applicare alla destinazione

| Impostazione | Valore o origine |
|---|---|
| `APP_ENV` | `production` |
| `APP_ORIGIN` | Origin HTTPS esatto del dominio funzionante |
| `DATABASE_URL` | Riferimento al nuovo PostgreSQL privato |
| `MAIL_TRANSPORT` | `smtp` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Provider SMTP; credenziali soltanto nelle variabili Railway |
| `MAIL_FROM` | Mittente verificato dal provider |
| `PHOTO_STORAGE` | `s3` |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Riferimenti allo storage privato dedicato |
| `HOST`, `PORT` | `0.0.0.0`, porta instradata da Railway |
| `TRUST_PROXY` | IP/CIDR dell’ingress verificati, mai `true` o intervalli generici |

Usare il Dockerfile esistente, `npm start` per il web e
`npm run db:migrate && npm run deploy:check` prima dell’avvio. Web e
maintenance devono usare lo stesso commit; maintenance esegue
`npm run maintenance` alle 02:15 UTC e deve poter ripulire foto e documenti
reddituali privati tramite la coda degli oggetti eliminati.
Non eseguire bootstrap o seed sulla destinazione. Verificare backup e
ripristino del nuovo database e assegnare monitoraggio/moderazione.

## Prove prima dell’apertura

1. Migrazioni, preflight database/storage/SMTP e deploy terminale SUCCESS.
2. `/api/health` indica `production`; `/api/config` indica `smtp`.
3. Con destinatari scelti, registrazione, consegna effettiva della conferma,
   accesso, recupero password e logout. Autenticazione SMTP da sola non
   dimostra consegna nella casella. Accesso di prova rifiutato: `/api/auth/preview` restituisce 403.
4. Due account reali di collaudo: profilo, immobile/foto, discovery, invito,
   accettazione, messaggio, blocco e cancellazione; nessun dato sintetico
   nella discovery. Verificare limite richieste da clienti distinti. Per il
   [riepilogo reddituale](../product/12-income-dossier.md), collaudare anche
   salvataggio privato, caricamento e download, consenso per il destinatario,
   controllo manuale e interruzione degli accessi dopo modifica, revoca,
   chiusura o blocco. Verificare export del titolare e pulizia degli oggetti
   dopo la cancellazione.
5. Titolare del servizio, contatto assistenza, condizioni e informativa
   visibili e coerenti con il trattamento effettivo dei dati.
6. HTTPS e dominio definitivi funzionanti; dopo questi controlli sostituire
   `noindex,nofollow` in `index.html` per il solo rilascio pubblico. Il sito
   corrente rimane escluso dall’indicizzazione durante la preparazione.

## Funzioni al lancio

Profilo di ricerca, immobili/foto, inviti e chat sono implementati. Il codice
include un [flusso reddituale manuale](../product/12-income-dossier.md):
entrate dichiarate per ogni affittuario, garante separato, prove private e
consenso esplicito a riepilogo e documenti dopo un invito accettato. Solo il
proprietario scelto può scaricare le prove e registrare importo e periodo
letti. Caricare un documento non lo rende verificato; il controllo manuale
non certifica autenticità o identità e non garantisce pagamenti futuri.
Modifiche e revoca interrompono l’accesso; le copie già scaricate non possono
essere richiamate. Il confronto economico usa il costo dell’offerta accettata,
senza somme del garante, soglie, classifiche o filtri nella discovery.

La verifica indipendente del reddito resta indisponibile: nessun provider
è collegato e `/api/income/checks` restituisce503. Le API del precedente
simulatore rimangono distinte e sintetiche; in produzione il simulatore è
disabilitato. I nuovi moduli e la migrazione017 non dimostrano da soli
collaudo o deploy del flusso sul dominio corrente. Contratti, depositi e
pagamenti restano esterni alla piattaforma.
La proposta di monetizzazione in `docs/product/05-contact-monetization.md`
non è un checkout attivo: il lancio base può iniziare gratuitamente.

Restano da definire con il titolare dominio, mittente e assistenza, soggetto
che gestisce il servizio e documenti legali definitivi, includendo il nuovo
trattamento dei riepiloghi e documenti reddituali, i destinatari scelti e i
tempi di conservazione/pulizia. Nessun acquisto,
invio email, apertura agli utenti reali o modifica ai dati è stato eseguito
per preparare questo aggiornamento.

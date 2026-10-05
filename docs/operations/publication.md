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
`npm run maintenance` alle 02:15 UTC e deve poter ripulire le foto private.
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
   nella discovery. Verificare limite richieste da clienti distinti.
5. Titolare del servizio, contatto assistenza, condizioni e informativa
   visibili e coerenti con il trattamento effettivo dei dati.
6. HTTPS e dominio definitivi funzionanti; dopo questi controlli sostituire
   `noindex,nofollow` in `index.html` per il solo rilascio pubblico. Il sito
   corrente rimane escluso dall’indicizzazione durante la preparazione.

## Funzioni al lancio

Profilo di ricerca, immobili/foto, inviti e chat sono implementati. Il reddito
reale non è verificato: il provider non è collegato e `/api/income/checks`
restituisce 503. In produzione il simulatore è disabilitato; i testi pubblici
dichiarano la disponibilità attuale senza presentare esempi come risultati
reali. Contratti, depositi e pagamenti restano esterni alla piattaforma.
La proposta di monetizzazione in `docs/product/05-contact-monetization.md`
non è un checkout attivo: il lancio base può iniziare gratuitamente.

Restano da definire con il titolare dominio, mittente e assistenza, soggetto
che gestisce il servizio e documenti legali definitivi. Nessun acquisto,
invio email, apertura agli utenti reali o modifica ai dati è stato eseguito
per preparare questo aggiornamento.

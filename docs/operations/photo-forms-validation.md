# Foto immobili e form — 2026-10-04

Richiesta: «Rendi possibile caricare foto e rendi i form migliori», nel percorso
della preview Railway con dati sintetici già autorizzato.

Gli immobili ora possono avere sei foto JPEG/PNG/WebP da massimo 5 MiB ciascuna.
Il server verifica il contenuto, ruota e ridimensiona a 1600 px, converte in WebP
e rimuove i metadati. Storage privato S3 su Railway, filesystem privato ignorato
in sviluppo; autorizzazioni lato API e isolamento dei workspace demo. La prima
foto è la copertina. Gli inviti accettati conservano la galleria originale.
Rimozioni e cancellazioni account accodano la pulizia, con retry e protezione
degli oggetti ancora referenziati. Il preflight verifica upload/lettura/cancellazione.

UI: selezione multipla con anteprime, rimozione, avanzamento dei caricamenti,
errori per foto e retry con chiave idempotente. Un salvataggio parziale conserva
l'immobile e le foto riuscite; il retry non le duplica. I form di immobile e
preferenze hanno sezioni, suggerimenti, limiti, indicatori obbligatori ed errori
associati ai campi. I controlli sono bloccati durante il salvataggio. I nomi dei
campi restano separati da suggerimenti e asterischi, conservando le associazioni.

Verifiche sul sorgente finale:

- Build e typecheck passati.
- **220 test backend** passati, inclusi 13 nuovi su immagini, accesso, limiti
  concorrenti, retry, snapshot, workspace e cleanup dopo errori/commit incerti.
- **5 scenari browser preview** passati: upload/rimozione/reload a 320px, budget
  invalido e salvataggio, risposta upload persa senza duplicati, ruoli/chat e
  accesso demo. Console/rete pulite nei flussi ordinari; interruzione di rete
  deliberata soltanto nella regressione retry.
- **22 browser standard** e **11 esperienza/mail** passati (quattro scenari
  mail ripetuti: 34 scenari browser distinti considerando la preview).
- Screenshot dei form/immobili a 320px ispezionati, senza overflow; conservati
  in `.local/photo-browser`, ignorato da Git.
- Guard dei runner verificati: `PHOTO_STORAGE=s3` è rifiutato prima di avviare
  il database di test. I test non usano bucket remoti.
- Audit dipendenze: zero vulnerabilità note, 282 record censiti.
- Revisione indipendente conclusa senza problemi materiali residui.

Le suite DB sono state eseguite in sequenza, con il supervisor dev fermato.
La suite esperienza usa una porta separata e API simulate. Supervisor ripristinato;
preservati 5 utenti, 2 profili e 1 immobile del DB di sviluppo, con 6 migrazioni.

Railway: bucket `linkedhome-photos`, regione `sjc`, provisionato nel progetto
esistente `observant-ambition`; web e manutenzione usano riferimenti alle variabili
del bucket. Nessuna credenziale è stata letta o copiata. La pubblicazione e la
verifica HTTPS finale sono registrate in PROJECT_STATE dopo il deploy.

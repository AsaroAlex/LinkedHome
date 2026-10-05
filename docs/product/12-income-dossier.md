# Redditi e controllo dei documenti per l’affitto

Richiesta del 2026-10-05: verificare in modo semplice il reddito di uno o
più affittuari. Percorso operativo con dichiarazione e controllo manuale
del proprietario scelto; nessun collegamento bancario o provider acquistato.
Il precedente simulatore e le sue API restano distinti.

## Percorso

1. Una scheda per ogni affittuario: nome o etichetta, fonte principale,
   netto medio al mese e periodo. Un importo non indicato è distinto da zero.
   Eventuale garante in una scheda separata, esclusa dal totale affittuari.
   Il referente dichiara di avere il permesso delle persone indicate.
2. Salvare il riepilogo privato; caricare fino a tre prove per persona,
   PDF oppure JPG/PNG/WebP, massimo 5 MB ciascuna. Suggerimenti: ultime
   tre buste paga, pensione, dichiarazione fiscale per autonomi o altra prova.
   I documenti caricati non diventano automaticamente verificati.
3. Dopo l’accettazione di un invito, anteprima e consenso esplicito per
   condividere **riepilogo e documenti** con quel proprietario e quell’invito.
   Il proprietario può scaricare la prova, indicare netto e periodo letti,
   e confermare di averla confrontata con la dichiarazione.

«Documenti controllati da questo proprietario» è un controllo manuale
registrato con data e metodo, distinto da autenticità, identità, verifica
indipendente o garanzia di pagamento. Nessun esito automatico sul candidato.

## Contratto dati

`shared/income-dossier.ts`: `IncomePerson` con UUID `id`, `label` (2–60),
`source`, `monthly_net_cents` (intero 0–10.000.000 oppure null),
`period_from` e `period_to` (YYYY-MM dal1900, ordinati, non futuri,
massimo 24 mesi inclusivi). Gli UUID delle persone sono canonicalizzati
in minuscolo, anche nelle richieste di controllo.
Fonti: employment, self_employment, pension, support, mixed, other,
no_income, not_specified. no_income richiede zero; not_specified richiede null.

`IncomeDossierInput`: `tenants` (1–12 persone), `guarantor` (persona o null),
`people_permission: true`, `expected_revision` (intero positivo o null
per la creazione). UUID unici tra affittuari e garante.

Riepilogo server: `{id, revision, tenants, guarantor, totals, documents,
updated_at, synthetic}`. totals contiene `declared_total_cents`,
`declared_count`, `total_count`, `complete`. Copertura riferita alle persone
indicate nel riepilogo, non ai componenti fotografici o agli occupanti.
Documenti: `{id, person_id, kind, mime, bytes, created_at, url}` senza
chiave storage, nome del file originale o dati estratti automaticamente.
Tipi documento: payslip, pension, tax_return, other.

Confronto con **il costo dell’offerta accettata**: percentuale
`rent / (declared_total_cents / 100) * 100` soltanto se i dati sono completi
e la somma è positiva. Nessun semaforo, soglia, classifica o filtro.
Importi letti nei documenti e importi dichiarati sono due rappresentazioni
dello stesso reddito: non si sommano. Garanti sempre separati.

## API nuova, parallela al simulatore

- GET `/api/income/dossier`: `{dossier: value|null, shares: [...]}`.
- PUT `/api/income/dossier`: input sopra; ritorna `{dossier}`.
- POST `/api/income/dossier/people/:personId/documents`:
  multipart di un solo file; query `revision` e `kind`; Idempotency-Key UUID.
  Ritorna `{document, dossier}`; upload riuscito incrementa la revisione.
- DELETE `/api/income/dossier/documents/:id`: query `revision`; `{dossier}`.
- GET `/api/income/dossier/documents/:id`: allegato privato, no-store,
  attachment, nosniff e CSP sandbox. Solo referente o destinatario autorizzato.
- GET `/api/invitations/:id/income-dossier`: `{status, dossier, share,
can_share, comparison, reviews}`. Senza consenso, proprietario riceve
  dossier/share/comparison null e reviews vuote; non vede stati privati.
- POST `/api/income/dossier/shares`: `{invitation_id, dossier_id,
revision, consent: true, documents_consent: true}`; `{share}`.
- DELETE `/api/income/dossier/shares/:id`: revoca idempotente.
- POST `/api/income/dossier/shares/:id/reviews`: `{person_id, document_id,
revision, observed_net_cents, period_from, period_to, confirm: true}`.
  Solo proprietario destinatario, invito accettato, condivisione/revisione
  correnti e documento realmente scaricato dallo stesso proprietario.
  Ritorna `{review}`. Metodo fissato dal server `landlord_document_review`.

Ogni modifica a persone, importi o documenti incrementa la revisione e
interrompe le condivisioni precedenti; le prove delle persone mantenute
restano private e richiedono una nuova condivisione e un nuovo controllo.
Le revisioni protegono da form vecchi e richieste concorrenti. Il retry
idempotente di un upload già riuscito non duplica file né revisioni.

## Protezioni e compatibilità

Tabelle additive in017: dossiers, documents, shares, reviews e download
registrati senza valori economici nei log/eventi. Nessun cambiamento alla004.
Consenso legato alla revisione e all’invito. Accessi limitati a utenti attivi,
stesso workspace, nessun blocco e invito accettato; chiusura o revoca
interrompono anche i download. Nessun dato nella discovery. Export solo
dati del titolare; cancellazione account elimina anche gli oggetti privati.
Vecchi riepiloghi sintetici restano riconoscibili e non si mescolano ai nuovi.

Usare soltanto dati e documenti creati per i test sull’istanza corrente.
Nessun cambio a runtime, SMTP, bucket o identità; produzione supportata
dalla stessa logica manuale con storage privato persistente già configurato.

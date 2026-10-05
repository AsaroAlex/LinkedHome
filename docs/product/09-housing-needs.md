# Caratteristiche della casa e accessibilità

Il profilo propone sei caratteristiche frequenti e una sezione «Altre
caratteristiche», con gruppi per spazi esterni, parcheggio, comfort, spazi
interni, elettrodomestici e sicurezza. Le 22 scelte sono facoltative e
multiple. Balcone, terrazzo, giardino privato e giardino condominiale sono
distinti. La scelta storica «Balcone, terrazzo o giardino» resta disponibile
e conserva il suo significato.

## Riferimenti di prodotto

Filtri e schede ufficiali consultati il 5 ottobre 2026:

- [Idealista, affitti a Bologna](https://www.idealista.it/affitto-case/bologna-bologna/):
  ascensore, balcone, terrazzo, garage, giardino, climatizzazione, cantina,
  armadi a muro e accessibilità.
- [Immobiliare.it, scheda immobile](https://www.immobiliare.it/annunci/129126860/)
  e [seconda scheda](https://www.immobiliare.it/annunci/123678565/): dotazioni
  distinte, riscaldamento, fibra, doppi vetri, porta blindata e videocitofono.
- [Idealista, immobile accessibile](https://www.idealista.it/immobile/30856846/):
  accesso e casa adattati a persone con mobilità ridotta.

Le categorie riprendono convenzioni utili dei portali immobiliari. Le
etichette sono adattate a LinkedHome. Spazio per biciclette, lavoro/studio
e i dettagli di accessibilità sono scelte funzionali del prodotto.

## Esigenze di accessibilità

La domanda facoltativa «Ti serve una casa accessibile?» permette di
indicare ingresso senza gradini, casa senza scale interne, ascensore
adatto a una sedia a rotelle, porte/passaggi ampi, bagno accessibile e
doccia senza gradino. Non chiede disabilità, diagnosi o dati sanitari.
Nessuna selezione significa soltanto che non sono state indicate esigenze.

Queste scelte restano private nella scoperta e nell’anteprima pubblica.
Il proprietario le riceve dopo l’accettazione dell’invito, come la
presentazione e i dettagli personali sugli animali. Sono consultabili
anche in una conversazione chiusa; blocco, sospensione e isolamento del
workspace revocano l’accesso con le stesse regole già applicate agli altri
dettagli personali. Le scelte vuote sono omesse dai dettagli condivisi.
L’inquilino può modificarle o rimuoverle; GET del proprio profilo ed export
includono sempre il campo.

## Dati e comportamento

La migrazione014 amplia il vincolo di `housing_needs` e aggiunge
`accessibility_needs` come array non nullo con valore iniziale vuoto.
Gli array accettano soltanto valori del catalogo, unici; controlli coerenti
in API e database. Omettere un campo conserva le scelte già salvate;
inviare `[]` le cancella. Nessuna riscrittura dei valori preesistenti.

Le caratteristiche pubbliche aiutano il proprietario a leggere il profilo,
ma non sono nuovi filtri di compatibilità: il modello dell’immobile non
contiene ancora tutte queste dotazioni verificabili. Accessibilità esclusa
da compatibilità, ordine, snapshot dell’immobile, eventi e audit.

Chiudere una sezione non perde le checkbox selezionate. Foto, gruppo,
pausa e errori del server conservano le bozze; soltanto il salvataggio
aggiorna il riepilogo. Cambiare le preferenze annulla gli inviti pendenti,
mentre i contatti già accettati restano disponibili. Controlli nativi con
target di almeno 48 px e una colonna sui telefoni stretti.

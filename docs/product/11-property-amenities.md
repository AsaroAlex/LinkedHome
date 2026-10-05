# Dotazioni dell’immobile

Il form distingue «Spazi e arredo» (capienza, metratura, locali e arredo)
da «Dotazioni della casa». Il proprietario può selezionare le dotazioni
e aggiungere informazioni a testo libero. Sei scelte frequenti sono
subito visibili; le altre sono raggruppate in una sezione espandibile.
Aprire o chiudere la sezione conserva le selezioni.

Il catalogo contiene 21 caratteristiche specifiche già utilizzate nelle
preferenze di ricerca e sei caratteristiche funzionali di accessibilità
della casa. Descrivono l’immobile offerto; non raccolgono informazioni
sulla salute di chi lo abita. L’arredo resta un campo distinto e non è
dedotto dal testo. Le nuove dotazioni sono facoltative e inizialmente
vuote per gli immobili preesistenti.

## Precompilazione dal testo

«Precompila dal testo» legge la descrizione dell’immobile e le note sulle
dotazioni. Una funzione locale riconosce termini e sinonimi italiani e
aggiunge le dotazioni trovate alle scelte già fatte. Non modifica il
testo né rimuove le selezioni manuali. Prima del salvataggio il
proprietario può deselezionare le proposte o aggiungere altre dotazioni.

La precompilazione parte soltanto dopo il clic, non all’apertura o
durante la scrittura. Indicazioni negative, future o ambigue vengono
trattate in modo conservativo: «senza ascensore», «predisposizione per
l’aria condizionata» e «giardino» senza specificare quale non bastano
per selezionare quelle dotazioni. Un risultato vuoto invita a scegliere
manualmente. Non si tratta di una verifica indipendente dell’immobile.

Il campo «Altre informazioni sulle dotazioni» accetta al massimo 600
caratteri e conserva le note, comprese le righe separate. Anche le
dotazioni non previste nel catalogo possono essere descritte qui.

## Salvataggio e condivisione

Le selezioni e le note si salvano con il resto dell’immobile; errori del
server e retry delle foto conservano la bozza. Cambiare le dotazioni
richiede un nuovo salvataggio, mentre un retry delle stesse foto non
duplica la modifica dell’immobile.

Scheda del proprietario, inviti e conversazioni mostrano le dotazioni
salvate. Gli inviti accettati conservano quelle dell’offerta originale:
un aggiornamento successivo non riscrive lo snapshot. Gli inviti
precedenti senza questi campi mostrano una lista vuota; le nuove
dotazioni non vengono retroattivamente aggiunte alle vecchie offerte.
Una modifica annulla gli inviti ancora pendenti, secondo la regola
esistente.

La migrazione016 aggiunge `amenities` (array inizialmente vuoto) e
`amenities_details` (testo inizialmente vuoto), con controlli API e SQL
su catalogo, valori unici e lunghezza. Ogni campo omesso dai client
precedenti conserva il proprio valore in modifica; `[]` e `""` lo
cancellano esplicitamente. Nessuna riscrittura dei dati esistenti e
nessuna variazione di filtri o punteggi di compatibilità.

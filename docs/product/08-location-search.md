# Cerca casa in più città e zone

Un profilo può includere fino a sei città e le zone di ciascuna. Ogni città
può comprendere tutta la città (`areas: []`) oppure un insieme di quartieri.
Budget, ingresso, contratto e numero di persone valgono per tutta la ricerca.
Il selettore mostra schede per città, ricerca delle zone, checkbox e riepilogo;
la città finale non si può rimuovere. Modifiche salvate prima della pubblicazione.

Il catalogo contiene quartieri comuni delle sei città già disponibili:
Bologna, Milano, Roma, Torino, Firenze e Padova. Non è un elenco completo
di quartieri né un disegno di confini amministrativi. Nessuna mappa o
geolocalizzazione precisa viene presentata. Per altre aree della stessa
città si può usare la scelta «Tutta la città».

## Compatibilità

Un immobile deve trovarsi in una delle città scelte. Quando per quella città
sono selezionate zone, deve corrispondere a una di esse. Città e zone sono
criteri di compatibilità, applicati prima di limite e paginazione della
discovery e ricontrollati all’invio e all’accettazione dell’invito.
I form degli immobili suggeriscono gli stessi nomi di quartiere; restano
ammessi altri nomi in testo libero. Alias espliciti, spazi, maiuscole e
accenti vengono normalizzati: «Centro» a Bologna corrisponde a
«Centro storico». Una zona sconosciuta non soddisfa un filtro specifico,
ma viene inclusa se si cerca in tutta la città. Nessun indirizzo preciso
e nessuna deduzione geografica per somiglianza di testo.

## Dati e comportamento

`profiles.locations` è JSONB facoltativo, aggiunto dalla migrazione013.
Ogni voce contiene soltanto `city` e `areas`; schema API rigoroso, città
uniche, zone canoniche uniche (massimo20 per città) e prima città coerente
con il campo storico `city`. Il campo storico resta disponibile ai client
precedenti. Migrazione senza riscrittura dei profili; null significa
la singola città storica senza limitazioni di zona.

Un payload precedente che omette `locations` conserva le scelte già
salvate se `city` non cambia; se cambia, imposta una nuova ricerca singola
senza zone. Cambiare città/zone salva una nuova revisione e annulla
inviti pendenti; conversazioni accettate restano disponibili. La scoperta
condivide città/zone, non nomi, email, foto o presentazione.
Bozze del selettore restano durante foto, modifiche al gruppo, pausa o
errori di salvataggio, come gli altri campi del profilo.

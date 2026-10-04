# Palette ispirata ai portali immobiliari

Feedback del 4 ottobre 2026: i colori salvia/crema e il verde scuro evocano
prenotazioni di consulenze psicologiche. L’utente chiede uno stile più vicino
a idealista o Immobiliare.it, conservando il sito attuale.

## Riferimenti osservati

Home ufficiali lette e ispezionate con Chromium: [idealista](https://www.idealista.it/)
e [Immobiliare.it](https://www.immobiliare.it/). Entrambi usano fondi bianchi,
testi scuri, titoli sans serif e colori d’azione decisi. idealista abbina lime
`#E1F56E` e magenta `#B62682`; Immobiliare.it ha blu `#0074C1`, azzurro
`#E6F1F9`, grigi `#373C47`/`#60687A` e rosso `#E50013`. Quest’ultimo è anche
il colore del pulsante di ricerca osservato sulla home: il blu scelto per
LinkedHome riprende la famiglia del marchio, non quel pulsante specifico.
I colori Immobiliare.it sono pubblicati nel [media kit ufficiale](https://www.immobiliare.it/info/media-kit/).
Non sono riutilizzati loghi, fotografie o altri asset dei competitor; questi
riferimenti non provano risultati di conversione per LinkedHome.

## Scelta per LinkedHome

| Ruolo                          | Colore                       |
| ------------------------------ | ---------------------------- |
| Pagina e card                  | Bianco `#FFFFFF`             |
| Superficie neutra              | `#F4F7FA`                    |
| Selezione e informazioni       | Azzurro `#EAF3FB`            |
| Testo principale / secondario  | `#203246` / `#5B6877`        |
| Azioni, focus, marchio / hover | Blu `#006BB3` / `#00558F`    |
| Accento caldo                  | `#9C4A10`, dettagli limitati |
| Divisori / bordi dei controlli | `#CCD8E4` / `#7B8796`        |

Il blu delle azioni è leggermente più scuro del riferimento per un contrasto
bianco/blu di 5,59:1. Il testo secondario su azzurro raggiunge 5,07:1; il bordo
operativo su bianco 3,65:1. Gli stati restano distinti: rosso per errori e
distruzione, verde per conferme, ambra per avvisi e demo sintetica.

Aggiornati home, form, selezioni, foto, card immobili, dashboard, chat e
attestazione, compresi i colori prima hardcoded. I titoli, il marchio e i
prezzi usano lo stack sans già disponibile, senza nuove dipendenze. Il titolo
mobile è ridimensionato per leggere le due righe complete a 390 e 320px.
La nota della hero riusa l’icona casa del marchio. L’illustrazione conserva
piccoli dettagli caldi architettonici e foglie verdi, senza dominare l’interfaccia.
Theme-color e favicon sono allineati; geometria e flussi rimangono quelli
esistenti. Corretto l’hover distruttivo, che ereditava il colore generico.

## Verifica

Build/typecheck e 11 scenari esperienza/mail-runtime passati; lo scenario
landing è rieseguito sul risultato finale. Sedici controlli UI aggiuntivi:
home a 1440/768/390/320px, dashboard/card/form immobile a 1440/390/320px,
preferenze, attestazione e stati a 320px. Le viste autenticate usano API simulate,
senza scritture sul database dev. Controllati focus e hover; sette contrasti
calcolati superano le soglie applicabili. Nessun overflow, violazione axe nei
criteri configurati o errore console/rete. Ultima correzione del titolo
verificata separatamente alle quattro larghezze, con due righe a 390/320px.
Screenshot home e form mobile ispezionati; audit indipendente senza blocchi.
Evidenze temporanee ignorate in `.local/real-estate-palette`.

# Vantaggi nella landing — 2026-10-04

L'utente ha indicato «Preferenze chiare / Inviti legati a un immobile /
Condivisione sotto controllo» come frasi generiche e ha chiesto di riprendere
ciò che funziona nei competitor. Confronto mirato delle pagine ufficiali tramite
la skill Search di Exa, senza una classifica quantitativa o dati di conversione.

| Fonte consultata                                   | Messaggio osservato                                                                               | Principio applicato                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [LocService](https://www.locservice.fr/)           | Una ricerca unica; sono i proprietari a contattare l'inquilino; «En direct avec le propriétaire». | Rendere evidente la ricerca inversa e il contatto diretto. È il modello più vicino al flusso LinkedHome. |
| [Spotahome](https://www.spotahome.com/it)          | «Su misura per il tuo budget».                                                                    | Parlare di un requisito concreto della casa cercata.                                                     |
| [HousingAnywhere](https://housinganywhere.com/it/) | «La tua prossima casa ti aspetta» e spiegazione del collegamento fra inquilini e proprietari.     | Mettere l'esito desiderato prima dei dettagli della piattaforma.                                         |

La fascia sotto la hero ora comunica:

- **Sono i proprietari a cercarti**: il proprietario vede profili compatibili e
  sceglie a chi inviare un invito.
- **Proposte nel tuo budget**: la compatibilità degli inviti include costo totale
  mensile inferiore o uguale al budget pubblicato.
- **Parla direttamente con il proprietario**: dopo l'accettazione si apre la
  conversazione fra i due partecipanti.

I testi descrivono il flusso implementato. Garanzie, verifiche proprietari e
pagamenti offerti da altri servizi non fanno parte di questo cambiamento.
Sotto 700px i tre vantaggi sono su righe separate a 0.85rem, per evitare la
precedente compressione a 0.61rem. Hero, CTA e flussi restano quelli esistenti.

Verifica: build/typecheck e scenario browser esistente della landing passati;
controllo con browser reale a1440/768/390/320px senza overflow, zero violazioni
axe nei criteri WCAG configurati e nessun errore console/rete. Screenshot della
fascia desktop/mobile ispezionati in `.local/landing-copy`. Revisione indipendente
dei messaggi e del layout senza rilievi materiali. Nessun test backend rieseguito
per questa modifica di testo/stile; la verifica220/34 della funzionalità foto
rimane attribuita all'iterazione precedente.

## Reddito come elemento per scegliere — feedback browser

L'utente vuole che le informazioni economiche aiutino il proprietario a
valutare l'affitto e ha respinto il messaggio principale «nessuna promessa
sulla solvibilità». La home ora presenta **«Affitta con più tranquillità»** e
spiega fascia di entrate, fonte e periodo, con un collegamento alla spiegazione
dell'attestazione. La pagina informativa e una nuova FAQ descrivono il percorso;
il proprietario trova anche un pannello in «Verifiche e reddito» che rimanda agli
inviti dove può leggere le attestazioni condivise.

La feature esistente permette già anteprima, consenso per destinatario/invito e
revoca. La preview usa dati sintetici, indicati accanto al messaggio della home.
Il controllo di redditi reali rimane da collegare; questo intervento non
introduce scoring, controllo del credito o garanzie sui pagamenti. Il limite
temporale delle evidenze rimane nella spiegazione dettagliata. Corrette le
precedenti negazioni generiche della funzione reddito nelle FAQ e nella pagina
informativa.

Build/typecheck e scenario browser esistente della landing passati. Nove
controlli browser aggiuntivi: home e destinazione del CTA a1440/768/390/320px,
pannello proprietario a320px con sessione/API simulate. Nessun overflow,
violazione axe nei criteri WCAG configurati o errore console/rete. Screenshot
della sezione desktop/mobile ispezionati; revisione indipendente del testo e
dei permessi senza rilievi materiali. Dati dev e logica di emissione/condivisione
invariati. Evidenze temporanee ignorate in `.local/income-copy`.

## FAQ più dirette — secondo feedback browser

Il feedback riguarda titolo e introduzione delle FAQ, percepiti come generici.
Confrontate tramite Exa tre pagine ufficiali:

- [LocService](https://www.locservice.fr/): «Comment fonctionne LocService ?»;
  domanda diretta sul modello di ricerca inversa.
- [HousingAnywhere](https://housinganywhere.com/): «How does HousingAnywhere work?»;
  domande sul funzionamento e sul passo successivo all'accettazione.
- [Spotahome](https://www.spotahome.com/how-it-works): «Your questions, answered»;
  introduzione breve e collegamento alla guida.

Applicati titolo riconoscibile **«Domande frequenti»**, introduzione
**«Come cercare casa o proporre il tuo immobile su LinkedHome.»** e CTA
**«Come funziona LinkedHome →»**. La prima domanda ora spiega il funzionamento
per entrambi i ruoli: preferenze/immobile, invito e chat dopo l'accettazione.
Le altre risposte e la feature reddito dell'iterazione precedente sono
conservate. Il riferimento alla visita riguarda l'accordo fra partecipanti;
non introduce prenotazioni o assistenza di altri servizi.

Build/typecheck e scenario browser esistente della landing passati. FAQ
verificate con browser reale a1440/768/390/320px, apertura/chiusura da tastiera
di tutte le domande e link alla guida. Nessun overflow, violazione axe
configurata o errore console/rete. Screenshot desktop/mobile ispezionati e
revisione indipendente senza rilievi materiali. Evidenze temporanee ignorate in
`.local/faq-copy`; nessun cambiamento a backend o database.

# Monetizzare l’incontro su LinkedHome

Proposta del 4 ottobre 2026, in risposta al feedback browser «Trova un modo per
monetizzare l’incontro tra le parti». **Modello e prezzo da testare; nessun
pagamento attivo o cambiamento alle condizioni della preview.**

## Proposta

L’inquilino cerca casa gratuitamente. Il proprietario paga per l’avvio di una
conversazione relativa a un immobile, dopo che l’inquilino ha accettato
l’invito. Prezzo iniziale proposto: **9,90 € per invito accettato**, con **il
primo incontro gratuito soltanto come promozione di lancio circoscritta**.
Date, platea e budget della promozione sono da definire prima di offrirla.
Per i proprietari privati l’importo esposto deve
essere il totale da pagare; qui si assume IVA inclusa al 22%, da confermare per
il soggetto che venderà il servizio.

Invio dell’invito, rifiuto, scadenza o ritiro prima dell’accettazione non
generano un contatto pagato. L’incontro acquistato comprende la conversazione
su quell’immobile; i messaggi successivi non si pagano separatamente. Non si
promette che la persona risponderà a ogni messaggio o firmerà un contratto.
La condivisione dell’attestazione di reddito resta facoltativa e distinta.

La promessa da usare dopo l’attivazione del modello è:

> 9,90 € quando il tuo invito viene accettato e si apre la conversazione.

Nella promozione aggiungere «Il primo incontro è gratuito», insieme alle
condizioni e al periodo. Non presentare la promozione come permanente.

La preview attuale non propone questo prezzo come servizio acquistabile.

## Perché questo evento

LinkedHome registra già l’accettazione e abilita nome scelto e chat. Il
proprietario ha scelto un profilo compatibile e l’inquilino ha mostrato
interesse per l’immobile. L’evento è osservabile anche se visita e contratto
avvengono successivamente fuori dalla piattaforma.

Una commissione sulla firma sarebbe difficile da attribuire e incassare con
il flusso attuale. L’abbonamento del proprietario occasionale avrebbe valore
soprattutto nei pochi giorni della ricerca. Far pagare subito l’inquilino
richiederebbe una rete di immobili pertinente già sufficiente a sostenere
l’acquisto. Nessuna di queste considerazioni prova la disponibilità a pagare
del proprietario: quella resta la principale ipotesi del modello consigliato.

## Confronto con le fonti ufficiali

Pagine consultate il 4 ottobre 2026. I listini provano offerte pubblicate,
non conversioni, redditività o equivalenza con il mercato italiano.

| Servizio e fonte                                                                                        | Chi paga e cosa compra                                                                                                       | Implicazione                                                                             |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [LocService](https://www.locservice.fr/tarifs)                                                          | Inquilino: 29 €/mese per la candidatura distribuita; proprietario gratuito.                                                  | Ricerca inversa monetizzata, sostenuta da una rete e servizi dichiarati dal concorrente. |
| [HousingAnywhere](https://answers.housinganywhere.com/en/articles/2267534-commission-fee-for-landlords) | Proprietario: commissione standard 8% del valore del contratto più IVA, variabile per località; trattenuta dal primo canone. | La commissione si appoggia a prenotazione/incasso integrati.                             |
| [Spotahome](https://spotahome.zohodesk.com/portal/en/kb/articles/how-much-is-the-spotahome-commission)  | Proprietario: commissione sulla prenotazione; aliquota variabile per paese/piano.                                            | La pagina non stabilisce una percentuale universale da replicare.                        |
| [SpareRoom UK](https://www.spareroom.co.uk/content/info-advice/early-bird-explained)                    | Accesso anticipato ai contatti: £14 / 7 giorni, £25 / 14 giorni, £28 / 28 giorni.                                            | Si può vendere accesso al contatto; il mercato e l’unità acquistata sono differenti.     |

9,90 € è un’ipotesi LinkedHome, non un prezzo attribuito a questi competitor.

## Cosa deve succedere prima di un addebito reale

- Il proprietario vede e accetta importo e condizione prima dell’invio.
  La tariffa/versione accettata resta legata all’invito; nessuna retroattività
  sugli inviti esistenti. Il ruolo `both` paga soltanto come proprietario.
- Preparare il pagamento prima dell’invito, con mandato appropriato e
  gestione dell’eventuale autenticazione. Addebito sull’accettazione. Una
  semplice autorizzazione sulla carta non può essere considerata valida per
  tutta la durata degli inviti: durata e comportamento vanno definiti con il
  provider. Un saldo prepagato è un’alternativa, ma allora il denaro viene
  versato prima e la promessa deve distinguere acquisto e consumo dei crediti.
- L’attuale accettazione apre subito la chat. Non inserire un paywall
  successivo descritto come «sblocco del contatto» senza aggiornare in modo
  esplicito il contratto UX per entrambe le parti. Il fallimento del pagamento
  richiede uno stato e un recupero comprensibili, senza addebiti duplicati.
- Registrare un solo addebito per invito, con eventuali rimborsi come movimenti
  separati, idempotenza, esiti del provider e riconciliazione. Gli eventi
  aggregati attuali non sono
  una contabilità. Chiarire il prezzo per lo stesso candidato invitato su
  immobili diversi; proposta iniziale: ogni invito distinto è un incontro
  distinto, spiegato prima dell’invio.
- Definire un solo beneficio gratuito per proprietario nella promozione,
  compresi il ruolo `both` e gli inviti simultanei. Prenotare il beneficio
  atomicamente e rendere chiaro il costo prima di ogni invio; le accettazioni
  contemporanee non devono duplicarlo o cambiare il prezzo già concordato.
- Definire assistenza e rimborsi per contatti falsi o inutilizzabili e guasti.
  La semplice mancata locazione non dà un rimborso automatico nella proposta;
  recesso e altri diritti del compratore vanno definiti nelle condizioni.
  Blocco e segnalazione restano immediati e gratuiti.

La [ricerca normativa esistente](../research/economics-2026-10-03/v1/legal-primary.md)
riporta che la qualificazione italiana dipende dall’attività concreta di
mettere in relazione le parti: una tariffa fissa non prova l’esenzione dalla
mediazione immobiliare. Verificare l’inquadramento del modello effettivo prima
di incassi reali. Questo non impedisce di provare il flusso con dati e denaro
simulati. Stripe è un possibile strumento di pagamento, non una soluzione di
questa qualificazione.

## Sostenibilità e prova del prezzo

Con 9,90 € IVA inclusa al 22% e carte standard SEE, il
[listino Stripe](https://stripe.com/it/pricing) di 1,5% + 0,25 € dà circa
**8,11 € al netto IVA**, **0,40 € di fee** e **7,72 € residui per contatto pagato**.
Il calcolo usa gli importi non arrotondati fino al risultato finale. Il residuo
è prima di assistenza, rimborsi, contestazioni, acquisizione, infrastruttura,
costi fissi e imposte sui redditi: non è utile. Carte diverse e altri prodotti
Stripe possono avere costi differenti. Il primo incontro gratuito ha ricavo
zero e costi da sostenere; non è incluso nel margine del contatto pagato.
Un proprietario che conclude la ricerca con il solo incontro gratuito può
non generare alcun ricavo. Misurare la contribuzione anche per proprietario e
per coorte, includendo conversazioni gratuite e tutti i costi: la promozione
serve alla prova iniziale e ha un budget, non sostituisce il modello a pagamento.
I controlli di reddito reali non sono inclusi nel prezzo e il loro costo non
è ancora noto.

Per il pilot, misurare proprietari con profili pertinenti effettivamente
disponibili, prova del primo incontro, passaggio al secondo incontro pagato,
primo messaggio dell’inquilino, contatti inutilizzabili, rimborsi e minuti di
assistenza. Il risultato da osservare è una conversazione usata, non soltanto
un click su «Accetta». Confrontare 9,90 € e 19,90 € a parità di funzione in gruppi
comparabili, mostrando a ciascun compratore un prezzo stabile. I prezzi e il
pilot sono proposti; nessun cliente o esperimento commerciale è già osservato.
Con pochi utenti, riferire conteggi e casi effettivi senza stimare conversioni
di mercato. Continuare solo quando i contatti pagati coprono i costi effettivi
e i proprietari tornano a usare il servizio.

Questa proposta riguarda il marketplace esistente. D-008 resta la precedente
ipotesi di installazione per agenzie, mai implementata come pivot. La proposta
attuale non autorizza outreach, acquisti, addebiti o integrazioni finanziarie
attive. La domanda sul pagante è facoltativa; in assenza di indicazioni diverse
la raccomandazione assume proprietario pagante e inquilino gratuito.

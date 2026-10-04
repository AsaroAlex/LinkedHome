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

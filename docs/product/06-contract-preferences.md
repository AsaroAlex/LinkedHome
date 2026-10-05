# Contratto e permanenza

Il feedback del 4 ottobre 2026 chiede di distinguere studenti,4+4,3+2 e
temporanei nel profilo. Il tipo di contratto è una preferenza separata dal
tempo per cui una persona pensa di abitare nell’immobile. Non si può
dedurre una formula da un numero come «12 mesi».

| Formula                 | Spiegazione mostrata                                                              |
| ----------------------- | --------------------------------------------------------------------------------- |
| 4+4 · canone libero     | Durata iniziale di 4 anni, rinnovo di altri 4.                                    |
| 3+2 · canone concordato | Durata iniziale di 3 anni, rinnovo di altri 2; canone secondo gli accordi locali. |
| Studenti universitari   | Per studenti universitari fuori sede, da 6 a 36 mesi.                             |
| Transitorio             | Per un’esigenza temporanea, fino a 18 mesi.                                       |

Il profilo permette anche «Sono flessibile». L’immobile permette «Da
concordare» quando la formula non è ancora definita. Il feedback del5 ottobre
chiede i mesi solo quando servono: con4+4 e3+2 il campo è nascosto e i nuovi
salvataggi usano `duration:null`. Scelta flessibile, studenti e transitorio
richiedono ancora una permanenza indicativa da1 a120 mesi. Passare tra le
formule conserva i mesi digitati finché non si salva il form.

La migrazione011 mantiene i numeri già presenti nei profili. Anche quando
una vecchia riga conserva un numero, i mesi non sono un criterio per4+4 e3+2.
Il numero diventa `null` al successivo salvataggio di una formula lunga;
non viene sostituito con36/48 mesi. Payload precedenti senza formula
mantengono la scelta flessibile e richiedono i mesi.

Una preferenza specifica si abbina solo alla stessa formula offerta dal
proprietario. «Sono flessibile» si abbina a tutte, compresa «Da concordare».
Un immobile senza formula definita non viene presentato come compatibile
con un contratto specifico: il proprietario può precisarlo modificando
l’immobile. Città, budget, ingresso e capienza restano gli altri criteri;
la permanenza numerica conta solo per scelta flessibile, studenti e
transitorio. La regola è identica nella scoperta e nell’invio/accettazione inviti.

Il contratto offerto viene incluso nei dettagli e nello snapshot dell’invito.
Un invito accettato o chiuso conserva il tipo originario anche se il
proprietario lo modifica dopo. Uno snapshot precedente senza tipo mostra
«Da concordare» e non eredita quello dell’immobile attuale.

Queste scelte raccolgono intenzioni dichiarate. Non generano un contratto,
non verificano i requisiti della formula e non determinano automaticamente
condizioni di rinnovo o recesso. Il campo mesi per le formule temporanee
descrive la permanenza cercata e non certifica i requisiti del contratto.

## Informazioni aggiuntive facoltative

Il profilo può indicare animali domestici, arredamento preferito e più
esigenze sulla casa: ascensore, balcone/terrazzo/giardino e posto auto.
Queste scelte sono visibili ai proprietari che scoprono il profilo; aiutano
la valutazione manuale, senza filtri automatici o modifiche all’ordine.
I dettagli sugli animali (massimo200 caratteri) e la presentazione
(massimo600) sono visibili al titolare e ai contatti di inviti accettati o
chiusi, con entrambi gli utenti attivi, nessun blocco e isolamento preview.
Non compaiono nella scoperta né negli inviti ancora in attesa.

I riepiloghi mostrano le informazioni salvate correnti, anche nelle
conversazioni già aperte; lo snapshot dell’offerta immobiliare resta
separato. Un vecchio client che omette i nuovi campi conserva i dati già
salvati. Il form corrente può cancellarli esplicitamente. Le normali
modifiche del profilo aggiornano la revisione e annullano gli inviti pendenti;
foto e pausa conservano la bozza del form come nelle iterazioni precedenti.

Fonti ufficiali consultate il 4 ottobre 2026:

- [Legge 431/1998, articolo 2](https://www.parlamento.it/parlam/leggi/98431l.htm): durata minima 4 anni e rinnovo 4; canone concordato almeno 3 e proroga 2. Le formule riportano gli schemi ordinari.
- [DM 16 gennaio 2017, articolo 2](https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticolo?art.versione=1&art.idGruppo=0&art.flagTipoArticolo=0&art.codiceRedazionale=17A01858&art.idArticolo=2&art.idSottoArticolo=1&art.idSottoArticolo1=10&art.dataPubblicazioneGazzetta=2017-03-15&art.progressivo=0): transitorio fino a 18 mesi con esigenza temporanea reale; oltre 30 giorni è prevista documentazione.
- [Stesso decreto, articolo 3](https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticolo?art.versione=1&art.idGruppo=0&art.flagTipoArticolo=0&art.codiceRedazionale=17A01858&art.idArticolo=3&art.idSottoArticolo=1&art.idSottoArticolo1=10&art.dataPubblicazioneGazzetta=2017-03-15&art.progressivo=0): studenti universitari 6–36 mesi, con requisiti di iscrizione/residenza e condizioni territoriali.

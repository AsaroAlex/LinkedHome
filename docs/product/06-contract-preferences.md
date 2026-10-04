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
concordare» quando la formula non è ancora definita. Campi precedenti e
payload API senza tipo mantengono questi valori; le permanenze numeriche
non vengono cambiate né convertite in 36/48 mesi.

Una preferenza specifica si abbina solo alla stessa formula offerta dal
proprietario. «Sono flessibile» si abbina a tutte, compresa «Da concordare».
Un immobile senza formula definita non viene presentato come compatibile
con un contratto specifico: il proprietario può precisarlo modificando
l’immobile. Città, budget, ingresso, permanenza e capienza restano gli altri
criteri. La regola è identica nella scoperta e nell’invio/accettazione inviti.

Il contratto offerto viene incluso nei dettagli e nello snapshot dell’invito.
Un invito accettato o chiuso conserva il tipo originario anche se il
proprietario lo modifica dopo. Uno snapshot precedente senza tipo mostra
«Da concordare» e non eredita quello dell’immobile attuale.

Queste scelte raccolgono intenzioni dichiarate. Non generano un contratto,
non verificano i requisiti della formula e non determinano automaticamente
condizioni di rinnovo o recesso. La permanenza indicativa non promette che
un contratto 4+4 termini al raggiungimento dei mesi indicati.

Fonti ufficiali consultate il 4 ottobre 2026:

- [Legge 431/1998, articolo 2](https://www.parlamento.it/parlam/leggi/98431l.htm): durata minima 4 anni e rinnovo 4; canone concordato almeno 3 e proroga 2. Le formule riportano gli schemi ordinari.
- [DM 16 gennaio 2017, articolo 2](https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticolo?art.versione=1&art.idGruppo=0&art.flagTipoArticolo=0&art.codiceRedazionale=17A01858&art.idArticolo=2&art.idSottoArticolo=1&art.idSottoArticolo1=10&art.dataPubblicazioneGazzetta=2017-03-15&art.progressivo=0): transitorio fino a 18 mesi con esigenza temporanea reale; oltre 30 giorni è prevista documentazione.
- [Stesso decreto, articolo 3](https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticolo?art.versione=1&art.idGruppo=0&art.flagTipoArticolo=0&art.codiceRedazionale=17A01858&art.idArticolo=3&art.idSottoArticolo=1&art.idSottoArticolo1=10&art.dataPubblicazioneGazzetta=2017-03-15&art.progressivo=0): studenti universitari 6–36 mesi, con requisiti di iscrizione/residenza e condizioni territoriali.

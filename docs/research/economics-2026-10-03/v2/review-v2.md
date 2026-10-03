# Revisione indipendente v2

3 ottobre 2026. **Il modello è aritmeticamente coerente. La redditività commerciale resta da dimostrare.** G è il primo test con minore startup e minore complessità da approfondire: installazione standard negli strumenti del cliente, pagata alla consegna. Non è dimostrata come configurazione che massimizza sempre il profitto.

L'audit [independent_audit_v2.py](independent_audit_v2.py) **non importa `economics_v2.py`**. Ricalcola coorti con una ricorrenza mensile, tutte216 righe mensili,18 aggregazioni e tutte le righe di sensibilità: **12.920 confronti, zero scostamenti**, nessuna sensibilità non verificata. Risultati completi in [independent_audit_v2.json](independent_audit_v2.json). Questo conferma i conti delle ipotesi, non domanda, saving, prezzi o conversioni.

## Risultati confrontabili

Coorti centrali uguali:24,5 installazioni consegnate a12 mesi;73,5 a24. Prezzi, attach/churn, ore e costi sono H. I ricavi setup sono riconosciuti nel mese della consegna; manutenzione riconosciuta mese per mese. Il modello **non contiene annuali prepagati**. Setup non è MRR.

| Offerta centrale base | Progetto12mesi incluso startup cash/ore | Progetto24mesi | Rendimento founder24mesi | Cassa con riserva, founder non pagato |
|---|---:|---:|---:|---:|
| F €149 setup +€49/mese obbligatorio | −€11.990,23 | −€12.096,82 | €18,68/h | €4.162,87 |
| G €490 setup +€49/mese facoltativo | −€4.883,87 | +€2.800,71 | €32,67/h | €3.500 |
| H stessa G tramite partner, quota30% | −€9.008,61 | −€12.000,05 | €19,09/h | €3.500 |

G centrale base ha operativo24mesi **+€6.500,71**, prima di startup cash€2.500 e40 ore startup×€30. Impiega **1.047,27 ore founder**. La cassa con remunerazione founder€30/h e riserva sale a **€12.049,53**;€3.500 non è un budget di sostentamento. Il mese24 operativo+€1.007,43 non descrive il risultato cumulato dei primi12 mesi.

Manutenzione G/H attach60% è una vendita ipotizzata, non automatica. I40% che non comprano manutenzione ricevono il servizio del primo mese contabilizzato una volta e conservano la configurazione; non sono utenti ospitati/supportati gratuitamente ogni mese. H a24mesi richiede15 partner:120 ore di abilitazione e75 ore di vendita partner sono addebitate una sola volta quando il cumulato installazioni supera la capacità ipotizzata5/partner; supporto0,5h/partner/mese continua. Non esiste un accordo partner o evidenza di quei volumi.

## G€790 è più robusta nei conti, non nel mercato

Con stesso perimetro e domanda centrale invariata, prezzo setup€790 produce progetto24mesi **+€22.736,45**. Se le installazioni si riducono30%, risultato **+€10.413,51**; togliendo anche tutta la manutenzione, **+€4.478,12**. Sono stress scelti, **non una curva di domanda o elasticità stimata**. Le51,45 installazioni di questo stress rimangono un obiettivo non verificato. A12mesi, con−30%installazioni, il progetto resta negativo:−€2.073,04 con manutenzione60%;−€3.413,96 senza.

A€790, caso centrale per nuova installazione senza manutenzione:
`790×0,95×0,97 −13,98415 pagamenti −120 consegna −90 vendita −40 CACcash −20,50 tool/supporto primo mese = €443,50085` di contribuzione prima dei fissi. Questo margine non è utile del progetto. Nella tariffa/supporto occorre specificare perimetro, proprietà degli account, errori tecnici, manutenzione e richieste extra; chiudere il supporto commerciale dopo un mese non elimina eventuali obblighi di correzione o responsabilità.

F a€790, stesse coorti, ottiene matematicamente progetto24mesi **+€30.499,20**, e **+€15.157,44** con−30%installazioni: supera G. Richiede però100 ore startup invece40, due ore di consegna invece quattro, hosting/SaaS e tutti i clienti in abbonamento. Queste assunzioni e la medesima disponibilità a pagare€790 per F non sono dimostrate. **G è il test iniziale a minore investimento; F può diventare la configurazione successiva più redditizia se le condizioni si osservano.** Non nascondere il confronto F790 per chiamare G massimo assoluto.

## Soglie che cambiano la decisione

Il positivo centrale G490 è sottile. A parità di tutte le altre ipotesi, il progetto24mesi perde già con una di queste condizioni:

- Gestione fissa oltre **15,89h/mese**, contro12h ipotizzate.
- Consegna media oltre **5,27h/installazione**, contro4h.
- Eccezioni oltre **8,99%** degli ingressi, contro5%, se richiedono quattro minuti ciascuna.
- Installazioni inferiori di oltre **13,25%**, mantenendo identiche forma della rampa e manutenzione/churn.

Gli stress più severi confermano: gestione40h→progetto−€17.359,29; eccezioni25%→−€11.240,78; installazioni−50%→−€7.769,65; vendita6h+CACcash100→−€8.224,29. Passare dalle precedenti40h di gestione a12h modifica il risultato24mesi di **€20.160**: è una delle principali ipotesi economiche, non una conseguenza già provata del pivot.

Nel caso G790 con−30%installazioni e nessuna manutenzione, soglie corrispondenti: gestione circa **18,22h/mese** o consegna **6,90h/installazione** azzerano il positivo. Non sono soglie di domanda validate e gli shock non vanno letti come indipendenti.

Manutenzione centrale€49: ricavo dopo sconto/rimborsi€45,1535, pagamenti€1,101865, tool€3, lavoro(0,25h supporto+100×5%×4min/60)×€30=€17,50; contribuzione **€23,551635/mese prima fissi/CAC**. Con25%eccezioni diventa **−€16,448365**: limitare il volume non basta se supporto e software legacy generano tempi crescenti.

Il TCO buyer G790+12mesi manutenzione è€1.378 netto, prima di licenze CRM/form/automazioni/verifiche. Coprirlo con solo tempo valorizzato€35/h richiede **3,28 ore/mese** nel primo anno. Chiedere prova di4–5 ore incrementali recuperabili è un criterio prudenziale per il test; non promettere quel ROI. €790 pagabile,3h di vendita completa e costo4h di consegna non sono conoscibili dalle sole pagine ufficiali.

## Primo passo coerente

Vendere il medesimo lavoro delimitato ad aziende con volume alto e un passaggio effettivamente manuale, **prima di nuovo sviluppo**. Consegna pagata, confronto con il CRM già disponibile, minuti completi del founder e licenze a carico del cliente dichiarate. Un interesse verbale o una lista di100 candidati non produce ricavi. Nessuna vendita, campagna o contatto è stato eseguito in questa ricerca; nessun ROI garantito o autovalutazione di conformità è assunto.

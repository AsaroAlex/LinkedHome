# Economia di Soglia — ipotesi riproducibili, non previsione

Data di riferimento: 2026-10-03. Valori netti IVA; il trattamento IVA al 22% è un’ipotesi fiscale. Tutti gli input commerciali e operativi sono **H (ipotizzati)**; solo la tariffa carte SEE standard di Stripe è **V (verificata)**. Nessun cliente, fatturato, provider attivo per Soglia o disponibilità a pagare è affermato dal modello. La copertura italiana documentata per alcuni fornitori non prova accesso API/condizioni commerciali per Soglia, copertura degli utenti del pilot o diritto di condivisione; i costi restano H (ipotizzati).

## Offerte confrontate

| Modello | Pagante/unità | Prezzo da testare, netto IVA | Contenuto e limite |
|---|---|---:|---|
| B | Agenzia/proprietario ripetente; singolo rapporto | 29 € | Un candidato volontario già trovato dal cliente; attestazione solo con provider/ambito realmente supportati. Nessuna garanzia. |
| D | Piccola agenzia specializzata in affitti; vacancy/pratica | 99 € | Preparazione documentale, chiarimenti e stato della pratica per massimo 2 candidati volontari; verifica esterna facoltativa. Nessuna selezione automatizzata né garanzia. |
| E | Operatore con volume dimostrato; cliente/mese + vacancy | 79 €/mese + 39 €/vacancy | Flusso self-service, supporto ridotto; 1 candidato/controllo incluso per vacancy. Nessun controllo illimitato. |

La verifica D produce rispettivamente 1,0 / 1,3 / 1,6 controlli richiesti per pratica nei tre scenari, sotto il tetto di 2; un’adozione maggiore aumenta i costi. B/D non hanno abbonamento. E è self-service e non offre la gestione assistita D: nel centrale dedica 32,3 minuti/pratica più 9 minuti per cliente-mese contro 64,1 minuti/pratica D (attivazione e vendita del cliente pagante aggiuntive). Il canone richiede un beneficio autonomo dimostrato: E centrale, a 1 vacancy/mese, paga 118 € contro 99 € per D assistito, ipotesi commerciale debole; chiedere almeno 2 vacancy pagate/mese o provare il valore del tool separatamente. E non sostituisce un CRM completo. A 40 vacancy pagate/anno E costa 62,70 €/vacancy; a 8/mese, 48,88 €; a 1/mese, 118 €; il canone richiede valore autonomo dimostrato. Tutti i tre modelli funzionano su candidati reperiti dal cliente, quindi non richiedono liquidità del marketplace.

## Formule e contabilità

- Le acquisizioni mensili sono interpolazioni lineari dei punti in `parameters.json`; valori frazionari = valore atteso di una coorte, non clienti osservati.
- Per ogni coorte k: clienti vivi nel mese t = nuovi_k × (1 − churn_mensile)^(t−k). Clienti attivi = somma delle coorti vive.
- B/D: pratiche_t = nuovi_t + clienti trattenuti_t × frequenza di riacquisto mensile. Ogni nuovo pagante genera una prima pratica; la sua ricerca/attivazione infruttuosa è inclusa nel CAC dei paganti acquisiti. Il churn indica la perdita del rapporto commerciale, non la cancellazione di un abbonamento.
- E: pratiche_t = clienti attivi_t × frequenza mensile; ricavo lordo netto IVA = 79 × clienti attivi + 39 × pratiche.
- Ricavi netti = ricavi listino × (1 − sconto) × (1 − rimborsi). Tentativi provider = controlli richiesti × (1 + gratuiti) × (1 + ripetizioni). Successi e fallimenti hanno costi distinti; le ripetizioni sono tentativi aggiuntivi attesi, non una probabilità geometrica nascosta.
- I controlli gratuiti sono extra non fatturati; le ripetizioni includono anche tali extra. Il numero di candidati resta 1 / massimo 2 / 1, quindi ripetere un controllo non introduce altri candidati.
- Stripe = 1,5% × incassato lordo IVA prima dei rimborsi + 0,25 € per transazione: una transazione per pratica, più una per cliente/mese E. Le commissioni originarie restano anche sui rimborsi. Fonte ufficiale: https://stripe.com/it/pricing (consultata 2026-10-03). Carte premium, estere, strumenti e chargeback con tariffe diverse richiedono un aggiornamento.
- Margine di contribuzione economico prima acquisizione = ricavi − provider − commissioni − costi contestazioni − lavoro di consegna/revisione/supporto/attivazione di entrambe le parti. Dopo acquisizione sottrae CAC monetario dei paganti e tempo/costo commerciale. Il CAC cash degli inquilini è 0 perché portati dal cliente; il loro tempo di attivazione non è 0.
- Sono previsti sia CAC cash sia ore commerciali per pagante: canali diversi possono richiedere entrambi. Il supporto agli operatori E è mensile anche senza pratiche. Nessuna formula di LTV SaaS viene applicata a B/D.
- Fondatore: 30 €/h economici per consegna/acquisizione più 40 h/mese di gestione fissa, che escludono vendita diretta, supporto e consegna già conteggiati nei costi variabili. Massimo 160 h/mese totali; le ore eccedenti sono affidate a un collaboratore a 35 €/h, costo cash. Il lavoro viene ripartito proporzionalmente tra consegna e acquisizione; un’ora non compare mai come costo del fondatore e collaboratore contemporaneamente.
- Costi fissi cash distinti: strumenti/infrastruttura, consulenze giuridiche e conformità, amministrazione. Non includono i costi provider o lavoro già variabili. Consulenze sono budget ipotetici, non pareri o preventivi.
- Risultato operativo economico = margine dopo acquisizione − fissi cash − gestione fondatore. Il risultato cash esclude il valore del lavoro del fondatore non pagato: **non è profitto sostenibile**.
- Setup mese 0: B 2.000 € + 120 h, D 3.000 € + 180 h, E 5.000 € + 300 h; ore startup distinte da 40 h/mese. Non sono costi mensili o ricavi; il risultato di progetto sottrae anche setup cash e valore ore setup. Il setup cash è al mese 0; le ore founder sono esplicitamente distribuite nei mesi 1–3: 40 h/mese B, 60 h/mese D, 100 h/mese E, prima di allocare capacità alle attività commerciali. Questo riduce la capacità operativa disponibile e può generare collaboratori già nei primi mesi; tutte le ore rientrano nel limite di 160 h/mese.
- Cash principale: pagamento anticipato immediato, costi nel mese; IVA segregata e fiscalmente neutra, nessun credito bancario, remunerazione founder cash o imposta sui redditi. Fabbisogno = peggior deficit cumulato (incluso setup) + riserva pari al maggiore tra 1.000 € e 3 mesi di fissi cash. Tale riserva non copre tre mesi di tutte le uscite variabili.
- Cash a 30 giorni: sposta tutti gli incassi netti di un mese e lascia i costi immediati; il mese 24 non incassa ancora il proprio fatturato. La sensitivity con prelievi founder paga 30 €/h incluse setup e gestione e aggiunge una riserva di tre mesi di fissi + prelievo founder del mese d’uscita: è un budget di sostentamento, non uno stipendio fiscalmente simulato.
- Rendimento delle ore = (cash operativo cumulato − setup cash) / (ore effettive founder operative + setup, già incluse nel totale mensile), dopo tutte le uscite esterne, CAC e collaboratori. È ante imposte e può essere negativo. Il target di 30 €/h corrisponde al pareggio economico di progetto.

## Input degli scenari

| Input | Prudente | Centrale | Favorevole |
|---|---:|---:|---:|
| Costo successo provider € | 15,0 | 10,0 | 6,0 |
| Costo fallimento provider € | 4,0 | 3,0 | 2,0 |
| Fallimenti tentativi | 18,0% | 10,0% | 5,0% |
| Tentativi di ripetizione extra | 25,0% | 15,0% | 7,0% |
| Controlli gratuiti extra | 8,0% | 4,0% | 2,0% |
| Sconti | 10,0% | 5,0% | 2,0% |
| Rimborsi sullo scontato | 5,0% | 3,0% | 1,5% |
| Contestazioni per pratica | 4,0% | 2,5% | 1,5% |

### Coorti B

| Input | Prudente | Centrale | Favorevole |
|---|---|---|---|
| Nuovi clienti/mese, punti [mese: nuovi] | 1:1, 6:2, 12:3, 18:3, 24:4 | 1:2, 6:4, 12:6, 18:7, 24:8 | 1:3, 6:7, 12:11, 18:14, 24:16 |
| Churn logo mensile | 10,0% | 6,0% | 3,5% |
| Pratiche riacquisto/cliente/mese B-D; pratiche/cliente/mese E | 0,20 | 0,35 | 0,50 |
| CAC cash per pagante € | 30,00 | 18,00 | 12,00 |
| Ore vendita/nuovo pagante | 2,00 | 1,50 | 0,80 |
| Ore attivazione/nuovo pagante | 0,30 | 0,20 | 0,15 |
| Ore revisione/pratica | 0,25 | 0,18 | 0,12 |
| Ore supporto/pratica | 0,20 | 0,12 | 0,08 |
| Controlli richiesti/pratica | 1,00 | 1,00 | 1,00 |

Fissi mensili cash: strumenti/infrastruttura 100 €, legale/conformità 100 €, amministrazione 70 €.

### Coorti D

| Input | Prudente | Centrale | Favorevole |
|---|---|---|---|
| Nuovi clienti/mese, punti [mese: nuovi] | 1:1, 6:2, 12:3, 18:4, 24:5 | 1:1, 6:2, 12:3, 18:4, 24:5 | 1:2, 6:5, 12:9, 18:12, 24:15 |
| Churn logo mensile | 8,0% | 5,0% | 3,0% |
| Pratiche riacquisto/cliente/mese B-D; pratiche/cliente/mese E | 0,20 | 1,00 | 2,00 |
| CAC cash per pagante € | 45,00 | 30,00 | 20,00 |
| Ore vendita/nuovo pagante | 4,00 | 3,00 | 1,50 |
| Ore attivazione/nuovo pagante | 0,50 | 0,35 | 0,25 |
| Ore revisione/pratica | 0,90 | 0,55 | 0,35 |
| Ore supporto/pratica | 0,35 | 0,20 | 0,12 |
| Controlli richiesti/pratica | 1,00 | 1,30 | 1,60 |

Fissi mensili cash: strumenti/infrastruttura 140 €, legale/conformità 200 €, amministrazione 110 €.

### Coorti E

| Input | Prudente | Centrale | Favorevole |
|---|---|---|---|
| Nuovi clienti/mese, punti [mese: nuovi] | 1:0, 3:1, 6:1, 12:2, 18:2, 24:3 | 1:1, 6:2, 12:3, 18:4, 24:5 | 1:1, 6:3, 12:5, 18:7, 24:9 |
| Churn logo mensile | 8,0% | 5,0% | 3,0% |
| Pratiche riacquisto/cliente/mese B-D; pratiche/cliente/mese E | 0,50 | 1,00 | 1,70 |
| CAC cash per pagante € | 75,00 | 50,00 | 35,00 |
| Ore vendita/nuovo pagante | 5,00 | 4,00 | 2,00 |
| Ore attivazione/nuovo pagante | 1,00 | 0,70 | 0,50 |
| Ore revisione/pratica | 0,30 | 0,22 | 0,15 |
| Ore supporto/pratica | 0,20 | 0,15 | 0,10 |
| Controlli richiesti/pratica | 1,00 | 1,00 | 1,00 |

Fissi mensili cash: strumenti/infrastruttura 200 €, legale/conformità 300 €, amministrazione 150 €.

## Risultati cumulati, separati dalla redditività del mese finale

| Modello/scenario | Mesi | Attivi finali | Clienti-mese | Pratiche | Ricavi netti | Margine economico dopo acquisizione | Operativo economico | Progetto incl. setup | Cash con riserva | €/h founder | Operativo mese finale |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| B/prudente | 12 | 16,2 | 98,9 | 39,4 | 977 € | -2.998 € | -20.638 € | -26.238 € | 6.732 € | -8,4 | -1.849 € |
| B/prudente | 24 | 29,1 | 378,3 | 126,9 | 3.145 € | -8.179 € | -43.459 € | -49.059 € | 10.617 € | -7,3 | -1.997 € |
| B/centrale | 12 | 38,0 | 221,8 | 109,5 | 2.926 € | -3.317 € | -20.957 € | -26.557 € | 5.518 € | -6,2 | -1.874 € |
| B/centrale | 24 | 81,0 | 964,3 | 424,6 | 11.347 € | -8.998 € | -44.278 € | -49.878 € | 5.901 € | -3,1 | -2.002 € |
| B/favorevole | 12 | 74,3 | 409,3 | 247,6 | 6.932 € | -623 € | -18.263 € | -23.863 € | 3.779 € | -1,5 | -1.423 € |
| B/favorevole | 24 | 188,9 | 2035,3 | 1144,4 | 32.037 € | 2.950 € | -32.330 € | -37.930 € | 3.779 € | 7,3 | -935 € |
| D/prudente | 12 | 17,5 | 104,7 | 40,5 | 3.431 € | -3.836 € | -23.636 € | -32.036 € | 8.223 € | -8,2 | -2.106 € |
| D/prudente | 24 | 40,0 | 458,7 | 150,5 | 12.742 € | -11.097 € | -50.697 € | -59.097 € | 8.948 € | -4,3 | -2.380 € |
| D/centrale | 12 | 19,8 | 114,2 | 114,2 | 10.421 € | 1.662 € | -18.138 € | -26.538 € | 5.475 € | -0,7 | -1.200 € |
| D/centrale | 24 | 49,2 | 536,1 | 536,1 | 48.904 € | 13.210 € | -26.390 € | -34.790 € | 5.475 € | 12,2 | -212 € |
| D/favorevole | 12 | 57,6 | 303,1 | 541,1 | 51.711 € | 29.359 € | 9.559 € | 1.159 € | 4.673 € | 31,0 | 4.389 € |
| D/favorevole | 24 | 166,9 | 1671,7 | 3131,5 | 299.257 € | 178.790 € | 139.190 € | 130.790 € | 4.673 € | 73,2 | 16.719 € |
| E/prudente | 12 | 10,4 | 55,9 | 28,0 | 4.708 € | -514 € | -22.714 € | -36.714 € | 11.704 € | -10,9 | -1.794 € |
| E/prudente | 24 | 22,7 | 257,9 | 128,9 | 21.717 € | 3.516 € | -40.884 € | -54.884 € | 11.704 € | -2,9 | -1.375 € |
| E/centrale | 12 | 19,8 | 114,2 | 114,2 | 12.422 € | 3.797 € | -18.403 € | -32.403 € | 8.853 € | -3,3 | -956 € |
| E/centrale | 24 | 49,2 | 536,1 | 536,1 | 58.290 € | 25.737 € | -18.663 € | -32.663 € | 8.853 € | 13,5 | 842 € |
| E/favorevole | 12 | 32,8 | 172,7 | 293,6 | 24.222 € | 14.025 € | -8.175 € | -22.175 € | 8.106 € | 7,7 | 1.037 € |
| E/favorevole | 24 | 97,1 | 959,5 | 1631,1 | 134.573 € | 87.003 € | 42.603 € | 28.603 € | 8.106 € | 42,7 | 7.337 € |

Un risultato positivo nel mese 12/24 non cancella le perdite accumulate. I valori in `scenarios.csv` distinguono operativo, progetto, cash senza remunerazione founder, cash 30 giorni e budget con prelievi founder.

## Cash, tempo e costi su 24 mesi

| Modello/scenario | Margine prima acquisizione economico | Provider | CAC cash | Ore founder incl. setup | Ore collaboratore | Costi collaboratore | Cash immediato +riserva | Cash a30gg +riserva | Cash con prelievi founder |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| B/prudente | -2.419 € | 2.230 € | 1.920 € | 1314,7 | 0,0 | 0 € | 10.617 € | 10.841 € | 54.857 € |
| B/centrale | -556 € | 4.723 € | 2.412 € | 1506,8 | 0,0 | 0 € | 5.901 € | 6.651 € | 56.927 € |
| B/favorevole | 12.076 € | 7.244 € | 3.042 € | 1672,7 | 0,0 | 0 € | 3.779 € | 4.285 € | 46.543 € |
| D/prudente | 1.030 € | 2.646 € | 3.308 € | 1725,1 | 0,0 | 0 € | 8.948 € | 9.807 € | 67.898 € |
| D/centrale | 22.030 € | 7.751 € | 2.205 € | 1959,1 | 0,0 | 0 € | 5.475 € | 6.120 € | 45.976 € |
| D/favorevole | 192.875 € | 31.716 € | 4.240 € | 3029,4 | 603,2 | 21.110 € | 4.673 € | 5.297 € | 29.460 € |
| E/prudente | 12.853 € | 2.266 € | 3.112 € | 1668,9 | 0,0 | 0 € | 11.704 € | 12.630 € | 63.320 € |
| E/centrale | 38.232 € | 5.963 € | 3.675 € | 1974,7 | 0,0 | 0 € | 8.853 € | 9.729 € | 45.981 € |
| E/favorevole | 98.688 € | 10.325 € | 4.305 € | 2246,6 | 0,0 | 0 € | 8.106 € | 8.921 € | 37.879 € |

## Pareggio annuale a regime, senza confonderlo con il cumulato

A regime il churn va rimpiazzato: nuovi paganti = attivi × churn. B/D hanno le prime pratiche dei clienti sostitutivi e i riacquisti degli altri; E paga CAC sostitutivo e canone di tutti gli attivi. Si includono gestione founder, fissi e collaboratori se oltre 160 h. Le soglie sono matematiche, non prova che il bacino di clienti esista. Non recuperano setup o perdite iniziali.

| Modello/scenario | Attivi al pareggio | Pratiche/mese | Pratiche/anno | Ricavi annui netti | Ore founder/mese | Ore collaboratore/mese |
|---|---:|---:|---:|---:|---:|---:|
| B/prudente | Nessun pareggio ≤10.000 attivi | — | — | — | — | — |
| B/centrale | Nessun pareggio ≤10.000 attivi | — | — | — | — | — |
| B/favorevole | 322,5 | 166,9 | 2002,4 | 56.055 € | 102,0 | 0,0 |
| D/prudente | Nessun pareggio ≤10.000 attivi | — | — | — | — | — |
| D/centrale | 45,8 | 45,8 | 549,8 | 50.161 € | 96,6 | 0,0 |
| D/favorevole | 13,5 | 26,7 | 320,1 | 30.587 € | 58,8 | 0,0 |
| E/prudente | 54,0 | 27,0 | 323,9 | 54.553 € | 99,4 | 0,0 |
| E/centrale | 28,6 | 28,6 | 343,4 | 37.339 € | 66,4 | 0,0 |
| E/favorevole | 18,2 | 31,0 | 371,9 | 30.683 € | 54,3 | 0,0 |

## Sensibilità su scenario centrale a 24 mesi

Ogni riga cambia un solo input/gruppo rispetto al centrale. I minimi di provider 250/500/1.000 €/mese sono stress ipotetici, non preventivi o condizioni contrattuali rilevate. Il valore effettivo è da acquisire: nel caso base il minimo non è quantificato e viene omesso, rendendo la cassa potenzialmente sottostimata.

| Modello | Variante | Operativo economico cumulato | Progetto incl. setup | Operativo mese24 | Cash +riserva | €/h founder |
|---|---:|---:|---:|---:|---:|
| B | centrale | -44.278 € | -49.878 € | -2.002 € | 5.901 € | -3,1 |
| B | domanda -50% | -39.779 € | -45.379 € | -1.736 € | 7.577 € | -5,1 |
| B | domanda +50% | -48.777 € | -54.377 € | -2.269 € | 5.184 € | -1,6 |
| B | prezzo -20% | -46.505 € | -52.105 € | -2.178 € | 7.900 € | -4,6 |
| B | prezzo +20% | -42.052 € | -47.652 € | -1.826 € | 4.954 € | -1,6 |
| B | provider 20 euro/successo | -48.848 € | -54.448 € | -2.364 € | 10.244 € | -6,1 |
| B | minimo provider 250 euro/mese | -46.140 € | -51.740 € | -2.002 € | 7.763 € | -4,3 |
| B | minimo provider 500 euro/mese | -51.555 € | -57.155 € | -2.129 € | 12.951 € | -7,9 |
| B | minimo provider 1000 euro/mese | -63.555 € | -69.155 € | -2.629 € | 24.951 € | -15,9 |
| B | gestione founder20h/mese | -29.878 € | -35.478 € | -1.402 € | 5.901 € | -4,6 |
| B | setup cash +5000 euro | -44.278 € | -54.878 € | -2.002 € | 10.901 € | -6,4 |
| B | tempo manuale +50% | -45.424 € | -51.024 € | -2.093 € | 5.901 € | -3,0 |
| B | riacquisto/frequenza -50% | -44.363 € | -49.963 € | -2.010 € | 7.801 € | -4,7 |
| D | centrale | -26.390 € | -34.790 € | -212 € | 5.475 € | 12,2 |
| D | prezzo D79 / B-E invariati | -36.083 € | -44.483 € | -1.101 € | 5.851 € | 7,3 |
| D | prezzo D129 / B-E invariati | -11.850 € | -20.250 € | 1.122 € | 5.140 € | 19,7 |
| D | domanda -50% | -32.995 € | -41.395 € | -931 € | 6.378 € | 3,3 |
| D | domanda +50% | -19.785 € | -28.185 € | 507 € | 5.124 € | 18,1 |
| D | prezzo -20% | -35.987 € | -44.387 € | -1.092 € | 5.846 € | 7,3 |
| D | prezzo +20% | -16.794 € | -25.194 € | 668 € | 5.246 € | 17,1 |
| D | provider 20 euro/successo | -33.891 € | -42.291 € | -900 € | 5.745 € | 8,4 |
| D | minimo provider 250 euro/mese | -27.780 € | -36.180 € | -212 € | 6.505 € | 11,5 |
| D | minimo provider 500 euro/mese | -31.333 € | -39.733 € | -212 € | 8.141 € | 9,7 |
| D | minimo provider 1000 euro/mese | -42.639 € | -51.039 € | -501 € | 12.571 € | 3,9 |
| D | gestione founder20h/mese | -11.990 € | -20.390 € | 388 € | 5.475 € | 16,2 |
| D | setup cash +5000 euro | -26.390 € | -39.790 € | -212 € | 10.475 € | 9,7 |
| D | tempo manuale +50% | -30.813 € | -39.213 € | -617 € | 5.475 € | 11,4 |
| D | riacquisto/frequenza -50% | -36.228 € | -44.628 € | -1.151 € | 6.081 € | 3,9 |
| E | centrale | -18.663 € | -32.663 € | 842 € | 8.853 € | 13,5 |
| E | domanda -50% | -31.531 € | -45.531 € | -504 € | 10.298 € | 1,8 |
| E | domanda +50% | -5.794 € | -19.794 € | 2.188 € | 8.309 € | 21,5 |
| E | prezzo -20% | -30.101 € | -44.101 € | -207 € | 9.422 € | 7,7 |
| E | prezzo +20% | -7.225 € | -21.225 € | 1.891 € | 8.478 € | 19,3 |
| E | provider 20 euro/successo | -24.433 € | -38.433 € | 313 € | 9.114 € | 10,5 |
| E | minimo provider 250 euro/mese | -20.398 € | -34.398 € | 842 € | 10.045 € | 12,6 |
| E | minimo provider 500 euro/mese | -24.764 € | -38.764 € | 842 € | 11.783 € | 10,4 |
| E | minimo provider 1000 euro/mese | -36.700 € | -50.700 € | 389 € | 16.244 € | 4,3 |
| E | gestione founder20h/mese | -4.263 € | -18.263 € | 1.442 € | 8.853 € | 17,8 |
| E | setup cash +5000 euro | -18.663 € | -37.663 € | 842 € | 13.853 € | 10,9 |
| E | tempo manuale +50% | -20.432 € | -34.432 € | 680 € | 8.853 € | 13,1 |
| E | riacquisto/frequenza -50% | -20.680 € | -34.680 € | 657 € | 9.142 € | 11,1 |

## Prezzo D e tempo risparmiato al cliente

Il valore di un’ora del cliente è H: 35 €/h. Se l’unico valore fosse il tempo, 79/99/129 € richiedono almeno 2,26/2,83/3,69 ore risparmiate per vacancy; la verifica esterna può aggiungere valore solo se dimostrato e non contato due volte. Il prezzo di 99 € rimane H in tutti gli scenari: favorevole non presuppone un aumento di prezzo. La selezione di agenzie con 40 locazioni/anno non implica 40 acquisti: la frequenza centrale di 1 pratica/mese equivale a 12/anno, cioè 30% di adozione su 40 locazioni. Acquisti, churn e acquisizioni sono ipotesi separate.

## Limiti che decidono il test

I prezzi hanno valore solo se il cliente paga per risparmio verificato. Per B il prezzo retail concorrente e il costo di acquisto del rapporto possono annullare la contribuzione; per D la preparazione deve ridurre davvero il tempo dell’operatore; E richiede operatori con bisogni ripetuti e valore del canone anche nei mesi tranquilli. Contratti provider, copertura di redditi autonomi/studenti e gestione degli errori vanno verificati prima di vendere l’attestazione. Il modello non mette un prezzo a un provider non ancora autorizzato/collegato.

Non sono inclusi sinistri da garanzia perché l’offerta non concede garanzie. Non sono inclusi ricavi da intermediazione, interessi, depositi, classifiche di affidabilità, sovvenzioni o affari concluse nel marketplace. Normativa e condizioni provider possono imporre un perimetro diverso o costi iniziali superiori: le stime fisse e setup non costituiscono una conclusione legale.

Le rate di acquisizione non derivano da un mercato validato: sono obiettivi H per testare soglie. Il CAC cash a pagante acquisito deve incorporare outreach infruttuoso e test di prezzo; le ore includono lo stesso lavoro distinto dalle spese cash. Il fatto che il modello assuma un pagante acquisito implica un pagamento, non una conversione garantita da un lead. Si sostituiscono i punti della rampa solo con misure reali di pipeline, accessibilità e conversione. D centrale acquisisce 24,5 paganti nei primi 12 mesi e 73,5 nei 24 mesi: un tasso finale H del 12% su 250 prospect (40% qualificati × 30% convertiti) genera 30 paganti, quindi l’obiettivo a 24 mesi richiede ampliare il bacino oltre 250 prospect/una sola città; non è implicita una sufficienza del primo elenco di 40 nominativi.

## Riproducibilità

`python3 economics.py --parameters parameters.json --output-dir .`

Output: `monthly.csv` (216 righe mensili, 9 scenari), `scenarios.csv` (18 aggregazioni 12/24 mesi), `break_even.csv`, `sensitivity.csv`. I CSV conservano più precisione delle tabelle. Le verifiche interne controllano somme, ricavi, costo founder, vincoli ore e cassa. A volumi e costi centrali invariati, D richiederebbe 103,76 € per azzerare il solo mese 24, 153,45 € per azzerare l’operativo cumulato a 24 mesi e 170,78 € per azzerare il progetto incluso setup: sono soglie di calcolo, non prezzi validati; cambiare prezzo può ridurre le vendite. Il recupero del costo commerciale D centrale richiede 4 pratiche pagate per nuovo cliente prima dei fissi: contribuzione ricorrente di 42,53 €/pratica, acquisizione/attivazione cash + lavoro pari a 130,50 € aggiuntivi alla prima pratica.

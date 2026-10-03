# Allegati all'analisi economica del 3 ottobre 2026

Documento principale: [Redditività di LinkedHome](../12-sustainable-economics.md). Si integra con la ricerca esistente e con il prototipo a `9db6a9c`. Nessuna nuova offerta commerciale è implementata o validata.

I file conservano il nome Soglia usato nel brief e nei primi studi. Il primo esame del checkout era a `6d4805c`; dopo il pull sono presenti brand Doorluma, UX, SMTP/staging e flusso reddituale **sintetico**. Il successivo merge del commit `25d02c6` adotta LinkedHome per scelta dell'utente; il documento principale usa il marchio corrente e distingue questi fatti dalle proposte economiche. Gli allegati sono snapshot di ricerca, non uno stato aggiornato dell'applicazione.

## V1: controlli e servizio per vacancy

[Concorrenza](v1/competition.md) · [Provider e condizioni](v1/providers-legal.md) · [Fonti legali](v1/legal-primary.md) · [Segmenti e città](v1/segments-cities.md) · [Modello B/D/E](v1/economics.md) · [Revisione](v1/review.md).

[Parametri](v1/parameters.json), [input tabellari](v1/inputs.csv), [mensili](v1/monthly.csv), [scenari](v1/scenarios.csv), [pareggio](v1/break_even.csv), [sensibilità](v1/sensitivity.csv) e [audit](v1/independent_audit.json).

## V2: installazione, microSaaS e distribuzione

[Distribuzione e alternative](v2/distribution-widget.md) · [Comparabili esteri](v2/foreign-workflow.md) · [Compratori e processo](v2/buyers-workflow.md) · [Partner](v2/partners-legal.md) · [Perimetro assicurativo](v2/partner-law.md) · [Critica delle opzioni](v2/critical-options.md) · [Modello F/G/H](v2/economics_v2.md) · [Audit e limiti](v2/review-v2.md).

[Parametri](v2/inputs_v2.json), [mensili](v2/monthly_v2.csv), [scenari](v2/scenarios_v2.csv), [sensibilità](v2/sensitivity_v2.csv) e [audit indipendente](v2/independent_audit_v2.json).

Le nuove ricerche richiedono complessivamente 205 risultati: 75 distribuzione/comparabili, 55 partner/normativa, 40 compratori, 20 critica, 15 integrazioni/prezzi. Comprendono duplicati e non equivalgono a 205 fonti lette. I dossier riportano URL primari, condizioni, date e lacune. Le estrazioni integrali delle pagine e i file temporanei di ricerca non sono copiati nel repository; i riferimenti a tali estrazioni nei dossier descrivono il processo originario. I documenti con citazioni locali consultabili sono collegati sopra.

## Riproduzione, solo standard library Python

Dalla radice del repository:

```bash
python3 docs/research/economics-2026-10-03/v1/economics.py
python3 docs/research/economics-2026-10-03/v1/independent_audit.py
python3 docs/research/economics-2026-10-03/v2/economics_v2.py
python3 docs/research/economics-2026-10-03/v2/independent_audit_v2.py
```

Gli script usano la propria cartella per default; rigenerano report/CSV/audit, senza database, credenziali, rete o provider. Python 3.9 o successivo per gli audit. Ricavi, coorti, tempo, costi e cassa sono ipotesi esplicite: un audit aritmetico positivo non le rende previsioni. I costi iniziali e la cassa includono distintamente il valore del lavoro del fondatore e l'alternativa con prelievi.

Il v1 assume 40 h/mese di gestione; il v2, a perimetro ridotto, 12 h. Non confrontare i risultati come se l'efficienza fosse osservata. Il v2 include lo stress a 40 h, che può annullare la raccomandazione.

I CSV conservano i separatori CRLF prodotti dalla standard library Python; l'attributo Git locale riconosce questo formato per i controlli di whitespace. Nessun valore o byte dei CSV viene modificato per la pubblicazione.

`v1/economic-validation.json` conserva `output_dir` della prima esecuzione come metadato storico. Nessuno script lo usa per leggere o scrivere: input e output correnti sono risolti rispetto alla cartella dello script.

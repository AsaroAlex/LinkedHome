# Economia v2 — vendere un’installazione utile prima di costruire software

Data: 2026-10-03. File separati dal modello precedente. Tutti i prezzi, volumi, percentuali e tempi sono H (ipotizzati); solo la tariffa Stripe è V. Nessuna vendita, intervista, richiesta d’offerta, conversione o unicità del prodotto viene affermata. Le funzionalità di CRM e moduli già disponibili possono rendere la disponibilità a pagare **zero**. Il problema pagabile proposto è una configurazione consegnata e adottata, non l’accesso a un modulo generico.

| Offerta | Setup cliente netto IVA | Mensile netto IVA | Costo startup cash / ore founder | Consegna / vendita per installazione |
|---|---:|---:|---:|---:|
| F microSaaS diretto |149 €|49 €, tutti gli attivi|3.000 € /100 h|2 h /3 h|
| G installazione negli strumenti dell’agenzia |490 €|49 € facoltativi,60% acquista|2.500 € /40 h|4 h /3 h|
| H installazione via web agency |490 €|49 € facoltativi,60% acquista|2.500 € /40 h|3 h /1 h + attivazione partner|

G/H hanno stesso perimetro: preferenze, appuntamenti, campi mancanti e notifiche con dati minimi negli strumenti dell’agenzia. Un massimo di un workflow, un modulo, un calendario/e-mail ed esportazione CRM nativa se disponibile; nessuna API o integrazione personalizzata inclusa. Se il passaggio nativo non è supportato si usa CSV: il lavoro di esportazione dell’agenzia resta nel confronto con il suo processo attuale. Non offrono istruttorie reddituali, scoring, garanzie o mediazione. F comporta sviluppo/hosting e rinnovi obbligatori per restare attivi; G/H consegnano un workflow che resta all’agenzia. Senza manutenzione si riceve solo assistenza commerciale nel primo mese, poi nessun supporto/hosting continuativo Soglia. La durata commerciale ipotizzata non elimina obblighi inderogabili di correzione, responsabilità o diritti previsti dal contratto/legge: da verificare con consulente, e costi ulteriori aggiornerebbero il modello. Verifiche reddituali facoltative sono acquistate direttamente dall’agenzia: ricavo e COGS Soglia sono 0, ma il costo per il compratore non è 0. Licenze CRM/form/automazioni necessarie sono del cliente; preventivo complessivo deve indicarle. Insurance/referral revenue=0.

## Formule e unità

- Confronto a coorti identiche: nuove installazioni pagate consegnate/mese uguali F/G/H. Centrale:1 nel mese 1,2 al 6,3 al 12,4 al 18,5 al 24, interpolazione lineare;24,5 installazioni a 12 mesi,73,5 a 24. Prudente:0 fino al 3,1 al 6/12,2 al 18/24. Favorevole:1/3/5/7/9 ai mesi 1/6/12/18/24. Nessuna evidenza sostiene queste rampe.
- F: abbonati attivi=sum(nuovi_coorte × (1−churn)^(età_coorte)). G/H: manutentori attivi=sum(nuovi_coorte × 60% × (1−churn)^(età_coorte)). Churn mensile 8%/5%/3%. Il cliente che termina manutenzione conserva l’installazione; non viene riacquisito o rivenduto ogni mese.
- Ricavo setup=nuove installazioni × prezzo_setup; ricavo mensile=abbonati/mantenutori attivi × prezzo_mese. Ricavi netti=(setup+mensile)×(1−sconto)×(1−rimborso); sconti 10%/5%/2%, rimborsi 5%/3%/1,5%. La manutenzione acquistata comincia subito; chi non la compra non genera ricavi mensili.
- Setup una tantum: non è MRR, non è LTV SaaS e non è canone annuale incassato anticipatamente. Nessun rinnovo d’installazione viene ipotizzato.
- Clienti serviti F=tutti gli attivi. G/H=manutentori attivi + nuove installazioni senza manutenzione per garanzia primo mese. Gli aderenti alla manutenzione nel primo mese non vengono duplicati. Assumiamo 100 ingressi candidati per ciascun cliente servito in ogni mese, compreso l’intero primo mese: da verificare, non attività osservata.
- Eccezioni tecniche del workflow, non screening/lettura documenti/chiamate agli inquilini: l’agenzia gestisce candidati e domande. Sono H: ingressi × 5% × 4 minuti/60=0,333 h/cliente servito-mese; supporto 0,25 h aggiuntive. Nessuna istruttoria finanziaria né revisione di persone. Stress 25% eccezioni dà 1,667 h extra/cliente-mese.
- H: partner abilitati=ceil(installazioni cumulative/5). Solo il nuovo partner genera 8 h abilitazione +5 h vendita e 50 € CAC cash; tutti i partner abilitati richiedono 0,5 h/mese supporto. Nessun accordo, cliente/partner reale o produttività del canale è verificato. La commissione 30% riguarda setup e canone netti dopo sconto/rimborso, prima dei costi Stripe.
- Stripe ipotizza Soglia come venditore anche H:1,5% sul lordo IVA 22% incassato prima dei rimborsi +0,25 € per pagamento setup e 0,25 € per abbonato/mese. Commissioni originarie non rimborsate. Tariffa V: https://stripe.com/it/pricing consultata 2026-10-03; IVA 22% H, regime da definire. Il modello può cambiare con reseller diverso merchant.
- Hosting/servizio 3 € per cliente servito-mese; CAC pagante 40 € F/G,15 € H; le ore di vendita includono prospecting fallito e sono distinte da tali spese cash. Nessun CAC inquilini: portati dall’agenzia, attivazione self-service e gestione delle eccezioni contata.
- Founder 30 €/h; gestione fissa 12 h/mese esclusa dai tempi variabili; stress 40 h. Fissi cash 250 €/mese=conformità 100+infrastruttura 50+amministrazione 100; H, non preventivi. Le licenze del cliente non sono implicitamente gratuite e non diventano COGS Soglia.
- Startup cash al mese 0, ore startup distribuite nei mesi 1-3 e comprese nel limite totale 160 h founder/mese. Ore eccedenti affidate a collaboratori 35 €/h, cash, ripartite in proporzione tra consegna e acquisizione: nessun doppio conteggio con lavoro founder.
- Margine economico prima acquisizione=ricavi−commissione partner−Stripe−tool−lavoro consegna/supporto/eccezioni/abilitazione e supporto partner; dopo acquisizione sottrae CAC cash e ore vendita clienti/partner. Abilitazione partner è consegna una tantum; il relativo CAC comprende separatamente tempo vendita e spesa 50 €.
- Operativo economico=contribuzione dopo acquisizione−fissi cash−gestione founder. Progetto=operativo cumulato−startup cash−lavoro startup. Cash non remunera founder nel caso principale e non equivale a profitto. Rendimento founder=(cash operativo−startup cash)/ore effettive founder incluse startup, dopo tutte le spese esterne.
- Incassi anticipati immediati per installazione consegnata e canone mensile; nessun finanziamento di clienti o incasso annuale anticipato. Alternativa 30 giorni rinvia tutti gli incassi di un mese. IVA segregata/fiscalmente neutra, imposte sui redditi escluse. Riserva=max(1.000 €,3 mesi fissi cash). Non copre 3 mesi di tutte le uscite.
- Scenario con prelievi founder 30 €/h paga anche startup/gestione e tiene 3 mesi di riserva di fissi+prelievo del mese finale. Tale budget non simula uno stipendio fiscale.

## Risultati cumulati

|Offerta/scenario|Mesi|Installazioni|Abbonati finali|Ricavi netti|Operativo economico|Progetto incluso startup|Cash +riserva founder non pagato|€/h founder|Operativo mese finale|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
|F/prudente|12|8,0|6,1|2.284 €|-7.228 €|-13.228 €|5.308 €|-13,9|-552 €|
|F/prudente|24|29,5|16,9|11.056 €|-13.024 €|-19.024 €|5.308 €|0,1|-397 €|
|F/centrale|12|24,5|19,8|8.522 €|-5.990 €|-11.990 €|4.163 €|2,3|-311 €|
|F/centrale|24|73,5|49,2|34.297 €|-6.097 €|-12.097 €|4.163 €|18,7|270 €|
|F/favorevole|12|37,0|32,8|13.490 €|-4.703 €|-10.703 €|4.112 €|9,8|-13 €|
|F/favorevole|24|123,0|97,1|63.074 €|3.952 €|-2.048 €|4.112 €|28,7|1.442 €|
|G/prudente|12|8,0|3,6|4.111 €|-5.732 €|-9.432 €|4.369 €|-7,4|-384 €|
|G/prudente|24|29,5|10,2|16.738 €|-8.018 €|-11.718 €|4.369 €|10,5|-99 €|
|G/centrale|12|24,5|11,9|14.157 €|-1.184 €|-4.884 €|3.500 €|17,8|223 €|
|G/centrale|24|73,5|29,5|47.711 €|6.501 €|2.801 €|3.500 €|32,7|1.007 €|
|G/favorevole|12|37,0|19,7|22.402 €|2.953 €|-747 €|3.500 €|28,5|924 €|
|G/favorevole|24|123,0|58,3|85.408 €|25.447 €|21.747 €|3.500 €|44,0|2.738 €|
|H/prudente|12|8,0|3,6|4.111 €|-7.105 €|-10.805 €|4.511 €|-11,5|-470 €|
|H/prudente|24|29,5|10,2|16.738 €|-13.231 €|-16.931 €|4.511 €|2,8|-338 €|
|H/centrale|12|24,5|11,9|14.157 €|-5.309 €|-9.009 €|3.500 €|8,0|-74 €|
|H/centrale|24|73,5|29,5|47.711 €|-8.300 €|-12.000 €|3.500 €|19,1|-159 €|
|H/favorevole|12|37,0|19,7|22.402 €|-3.693 €|-7.393 €|3.500 €|16,0|-50 €|
|H/favorevole|24|123,0|58,3|85.408 €|-646 €|-4.346 €|3.500 €|27,3|414 €|

Un mese finale positivo non recupera le perdite iniziali. Il setup monetizza una consegna: continuare a vendere installazioni è una necessità commerciale, non ricorrenza garantita.

## Composizione ricavi, cassa e tempo a 24 mesi

|Offerta/scenario|Ricavi setup|Ricavi canoni|Ore founder incl.startup|Ore collaboratori|Quota partner|Cash immediato +riserva|Cash 30 gg +riserva|Cash con prelievi founder|
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|F/prudente|3.758 €|7.298 €|637,1|0,0|0 €|5.308 €|5.620 €|22.642 €|
|F/centrale|10.092 €|24.205 €|1068,2|0,0|0 €|4.163 €|4.487 €|19.588 €|
|F/favorevole|17.691 €|45.383 €|1562,7|0,0|0 €|4.112 €|4.457 €|21.682 €|
|G/prudente|12.359 €|4.379 €|602,4|0,0|0 €|4.369 €|4.655 €|15.382 €|
|G/centrale|33.188 €|14.523 €|1047,3|0,0|0 €|3.500 €|3.802 €|12.050 €|
|G/favorevole|58.179 €|27.230 €|1553,5|0,0|0 €|3.500 €|3.803 €|15.362 €|
|H/prudente|12.359 €|4.379 €|623,4|0,0|5.021 €|4.511 €|4.931 €|20.326 €|
|H/centrale|33.188 €|14.523 €|1099,8|0,0|14.313 €|3.500 €|3.971 €|19.128 €|
|H/favorevole|58.179 €|27.230 €|1630,0|0,0|25.622 €|3.500 €|3.987 €|19.176 €|

## Sensibilità centrale a 24 mesi

Ogni riga modifica un solo parametro/gruppo. Cambiare prezzo lascia volumi invariati per misurare una soglia matematica: la domanda può crollare, nessuna elasticità o accettazione è affermata. La variante con setup 790 e 30% di clienti in meno è un test congiunto ipotetico, non elasticità stimata. Setup 249/490/790 e canone 79 sono H. Il mantenimento 0% riguarda G/H, senza trasformare una garanzia di un mese in supporto gratuito permanente.

|Offerta|Variante|Progetto 24 mesi|Cash +riserva|Cash con prelievi|€/h founder|Operativo mese 24|Ore collaboratori|
|---|---|---:|---:|---:|---:|---:|---:|
|F|centrale|-12.097 €|4.163 €|19.588 €|18,7|270 €|0,0|
|F|zero clienti|-20.640 €|10.000 €|22.470 €|-23,2|-610 €|0,0|
|F|installazioni -50%|-16.368 €|4.552 €|20.614 €|7,5|-170 €|0,0|
|F|installazioni +50%|-7.825 €|4.047 €|20.533 €|24,4|710 €|0,0|
|F|setup 249|-5.452 €|4.024 €|16.436 €|24,9|722 €|0,0|
|F|setup 490|10.563 €|4.000 €|13.520 €|39,9|1.812 €|0,0|
|F|setup 790|30.499 €|4.000 €|12.449 €|58,6|3.168 €|0,0|
|F|setup 790 e installazioni -30%|15.157 €|4.000 €|11.612 €|47,5|2.034 €|0,0|
|F|mensile 79|2.443 €|4.087 €|15.938 €|32,3|1.603 €|0,0|
|F|commerciale 6 h/cliente|-18.712 €|4.163 €|26.722 €|15,5|-180 €|0,0|
|F|installazione 8 h/cliente|-25.327 €|4.163 €|34.687 €|13,2|-630 €|0,0|
|F|CACcash 80/cliente|-15.037 €|4.283 €|21.790 €|15,9|70 €|0,0|
|F|commerciale 6 h e CACcash 100|-23.122 €|4.355 €|31.132 €|12,1|-480 €|0,0|
|F|rimborsi 10%|-14.572 €|4.196 €|21.310 €|16,4|60 €|0,0|
|F|eccezioni 25%|-33.539 €|4.163 €|46.098 €|11,2|-1.696 €|0,0|
|F|gestione 40 h/mese|-32.257 €|4.163 €|41.437 €|11,5|-570 €|0,0|
|F|avvio cash+5000|-17.097 €|9.163 €|24.588 €|14,0|270 €|0,0|
|G|centrale|2.801 €|3.500 €|12.050 €|32,7|1.007 €|0,0|
|G|zero clienti|-18.340 €|9.500 €|20.170 €|-25,9|-610 €|0,0|
|G|installazioni -50%|-7.770 €|3.537 €|12.684 €|18,7|199 €|0,0|
|G|installazioni +50%|13.371 €|3.500 €|13.492 €|39,5|1.816 €|0,0|
|G|setup 249|-13.214 €|3.542 €|19.848 €|17,4|-82 €|0,0|
|G|setup 790|22.736 €|3.500 €|10.429 €|51,7|2.364 €|0,0|
|G|setup 790 e installazioni -30%|10.414 €|3.500 €|9.560 €|42,5|1.472 €|0,0|
|G|setup 790, installazioni -30%, mantenimento 0%|4.478 €|3.500 €|8.796 €|36,2|942 €|0,0|
|G|mensile 79|11.525 €|3.500 €|11.547 €|41,0|1.807 €|0,0|
|G|commerciale 6 h/cliente|-3.814 €|3.500 €|15.073 €|27,0|557 €|0,0|
|G|installazione 8 h/cliente|-6.019 €|3.500 €|16.415 €|25,5|407 €|0,0|
|G|CACcash 80/cliente|-139 €|3.500 €|12.650 €|29,9|807 €|0,0|
|G|commerciale 6 h e CACcash 100|-8.224 €|3.500 €|17.113 €|23,5|257 €|0,0|
|G|rimborsi 10%|-642 €|3.500 €|12.661 €|29,4|748 €|0,0|
|G|eccezioni 25%|-11.241 €|3.500 €|21.653 €|22,6|-252 €|0,0|
|G|gestione 40 h/mese|-17.359 €|3.500 €|26.810 €|19,9|167 €|0,0|
|G|mantenimento 30%|-1.439 €|3.500 €|11.865 €|28,5|629 €|0,0|
|G|mantenimento 0%|-5.678 €|3.500 €|12.149 €|23,6|251 €|0,0|
|G|avvio cash+5000|-2.199 €|8.500 €|17.050 €|27,9|1.007 €|0,0|
|H|centrale|-12.000 €|3.500 €|19.128 €|19,1|-159 €|0,0|
|H|zero clienti|-18.340 €|9.500 €|20.170 €|-25,9|-610 €|0,0|
|H|installazioni -50%|-15.495 €|3.722 €|20.582 €|8,6|-612 €|0,0|
|H|installazioni +50%|-9.005 €|3.500 €|19.494 €|24,0|-162 €|0,0|
|H|setup 249|-23.118 €|3.690 €|30.247 €|9,0|-916 €|0,0|
|H|setup 790|1.840 €|3.500 €|12.448 €|31,7|782 €|0,0|
|H|setup 790 e installazioni -30%|-4.491 €|3.500 €|12.697 €|24,9|225 €|0,0|
|H|setup 790, installazioni -30%, mantenimento 0%|-7.377 €|3.500 €|12.795 €|20,3|-25 €|0,0|
|H|mensile 79|-5.944 €|3.500 €|15.276 €|24,6|396 €|0,0|
|H|commerciale 6 h/cliente|-23.025 €|3.500 €|32.403 €|14,3|-909 €|0,0|
|H|installazione 8 h/cliente|-23.025 €|3.500 €|32.403 €|14,3|-909 €|0,0|
|H|CACcash 80/cliente|-16.778 €|3.557 €|23.906 €|14,7|-484 €|0,0|
|H|commerciale 6 h e CACcash 100|-29.273 €|3.577 €|38.651 €|10,0|-1.334 €|0,0|
|H|rimborsi 10%|-14.410 €|3.517 €|21.539 €|16,9|-341 €|0,0|
|H|eccezioni 25%|-26.042 €|3.500 €|36.949 €|13,4|-1.419 €|0,0|
|H|gestione 40 h/mese|-32.160 €|3.500 €|41.808 €|11,8|-999 €|0,0|
|H|mantenimento 30%|-14.061 €|3.502 €|20.494 €|16,2|-338 €|0,0|
|H|mantenimento 0%|-16.122 €|3.511 €|21.860 €|12,8|-516 €|0,0|
|H|avvio cash+5000|-17.000 €|8.500 €|24.128 €|14,5|-159 €|0,0|
|H|quota partner 15%|-4.843 €|3.500 €|14.337 €|25,6|379 €|0,0|
|H|quota partner 40%|-16.771 €|3.540 €|23.900 €|14,8|-518 €|0,0|
|H|produttività partner 2 clienti|-24.920 €|3.500 €|34.208 €|13,3|-929 €|0,0|

## Perché testare G prima, senza affermare superiorità universale

G è il test iniziale di costo e complessità ridotti: startup 40 h/2.500 € e installazione su strumenti posseduti dal cliente. Questo non dimostra superiorità economica universale. F a 790 € può generare più profitto se sostiene la stessa pagabilità con 2 h di attivazione e gli stessi clienti, ipotesi ancora ignote; diventa candidato dopo la validazione di G. Il prezzo F 790 è già presente nella sensibilità e non va nascosto.

### G a 790 € con 30% di installazioni in meno: cumulato 12/24 mesi

| Mantenimento | Mesi | Installazioni | Ricavi netti | Operativo economico | Progetto incluso startup | Cash +riserva, founder non pagato | €/h founder | Operativo mese finale |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|60% H|12|17,1|14.651 €|1.627 €|-2.073 €|3.500 €|23,8|543 €|
|60% H|24|51,4|47.621 €|14.114 €|10.414 €|3.500 €|42,5|1.472 €|
|Nessun acquisto|12|17,1|12.485 €|286 €|-3.414 €|3.500 €|19,1|321 €|
|Nessun acquisto|24|51,4|37.455 €|8.178 €|4.478 €|3.500 €|36,2|942 €|

Il 30% di calo installazioni e il prezzo 790 sono ipotesi combinate, non risultati di un test. La perdita del primo anno conta anche se il mese finale diventa positivo.

## Condizioni che decidono il test

TCO per cliente G/H che mantiene 12 mesi:490 +49 × 12=1.078 € nell’anno 1, prima delle licenze degli strumenti e di verifiche eventualmente acquistate direttamente. Con valore H 35 €/h, il solo risparmio di tempo deve superare 2,57 ore/mese; a 790 € setup+49 €/mese il TCO anno 1 è 1.378 € e richiede 3,28 ore/mese; target da misurare 4–5 ore/mese nette a≥100 richieste/mese (circa 2,4–3 minuti per richiesta). Deve trattarsi di tempo incrementale risparmiato rispetto al CRM/moduli esistenti, sottraendo CSV, manutenzione e nuove attività, non confrontando contro un processo manuale che l’agenzia non usa. Budget del compratore e beneficio non sono provati.

La principale incertezza è pagare per attività che l’agenzia può svolgere con il proprio CRM o con moduli gratuiti. Dimostrare che il servizio risolve configurazione, adozione, errori e tempo oggi speso; non vendere una presunta invenzione. Acquisizioni identiche rendono confrontabili gli economics, ma non provano che F/G/H trovino gli stessi clienti: il vantaggio distributivo H va misurato separatamente. Commissione partner 30% non è quotata e non dovrebbe essere promessa prima del test.

Il prezzo del pacchetto include soltanto il perimetro concordato: campi/automazioni/proprietà degli strumenti, periodo di garanzia e manutenzione devono essere espliciti. Richieste extra, software legacy e migrazioni ampliano le ore: stress 8 h di consegna. Il budget conformità 100 €/mese e startup 2.500 € è H; stress+5.000 € copre un costo iniziale superiore ma non risolve un requisito normativo non supportato.

Il modello non dimostra un business “senza lavoro” o una rendita: la crescita G/H richiede nuove installazioni. Assenza di clienti è simulata; non effettuare sviluppo prima di pagamenti, non assumere rinnovi per contratti non comprati. Lo scenario favorevole è un limite condizionato, non una previsione.

## Riproducibilità

`python3 economics_v2.py --inputs inputs_v2.json --output-dir .`

Output:monthly_v2.csv (216righe),scenarios_v2.csv (18aggregati),sensitivity_v2.csv. Controlli su coorti identiche, cap ore, avvio/cassa, formule dei ricavi e conteggio dei partner. Il modello precedente è conservato intatto.

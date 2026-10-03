# 12 — Redditività di LinkedHome: la prima offerta da mettere alla prova

Data della ricerca: **3 ottobre 2026**; riconciliazione del progetto: **4 ottobre 2026**. Sintesi di due analisi economiche e dei filoni concorrenza, distribuzione, segmenti, provider e normativa. Il brief usava LinkedHome/Soglia; il nome corrente è **LinkedHome**, scelto dall'utente nel commit `25d02c6` integrato dopo il pull di `9db6a9c`, che usava Doorluma. Gli allegati conservano i nomi storici.

**Raccomandazione: testare un'installazione a perimetro fisso da 790 € + IVA, con manutenzione realmente facoltativa da 49 € + IVA/mese, per piccole agenzie che lavorano molti affitti.** Il compratore è il titolare; gli agenti usano il processo e i candidati lo completano gratuitamente. Il problema da dimostrare è il tempo perso tra richiesta, informazioni complete e visita confermata. Prima distribuzione diretta, da remoto, su un solo stack di strumenti; Bologna rimane un possibile bacino per osservare il lavoro, non una città di lancio approvata.

La scelta è un **primo esperimento con investimento limitato**, non un massimo di profitto già provato. Serve un'agenzia con un problema che il suo CRM e la relativa assistenza non risolvono già. Nessuna vendita, intervista o disponibilità a pagare è stata osservata. Non sono stati contattati operatori, aperti account, acquistati servizi o avviate campagne.

## 1. L'intuizione economica e il perimetro dell'offerta

Vendere la configurazione e l'adozione di un processo riutilizzabile, usando gli strumenti e le richieste che l'agenzia possiede già. L'incasso di installazione remunera una consegna concreta; la manutenzione si vende solo a chi ne ha bisogno. Questa configurazione evita di finanziare una nuova platea di inquilini prima di poter dare valore al cliente pagante.

Il pacchetto iniziale comprende **un workflow, un modulo, un calendario/e-mail e il passaggio al CRM tramite funzione nativa o esportazione**. Il candidato può dichiarare budget, date, durata e occupanti, aggiornare la disponibilità e confermare uno slot. L'agenzia riceve i dati strutturati e gestisce proposte, selezione, domande, visite e contratti. La compatibilità resta sulle preferenze abitative: niente punteggio della persona.

Account e configurazione consegnata restano all'agenzia. Migrazioni, API personalizzate, assistenza ai candidati e istruttorie documentali ampliano il perimetro e devono avere un preventivo diverso. Il tempo dell'agenzia per importare CSV, inviare link o correggere dati va sottratto al risparmio: spostare lavoro non equivale a eliminarlo.

Il cliente prioritario da cercare è un'agenzia indipendente con **almeno 100 richieste lavorate al mese e 4–5 ore mensili di lavoro eliminabile**. Sono criteri ipotetici di qualificazione. Quaranta locazioni annuali, da sole, non dimostrano questa frequenza. Proprietari occasionali hanno un bisogno troppo episodico per rendere facile un canone; grandi gestori, BTR e student housing hanno spesso piattaforme e procedure proprie, oltre a integrazione e acquisti più complessi.

## 2. Evidenze che limitano l'idea

Tutte le fonti seguenti sono state consultate il 3 ottobre 2026. Un listino prova un prezzo esposto; una pagina di prodotto prova la funzione dichiarata. Nessuno dei due dimostra vendite, efficacia o domanda incrementale per LinkedHome.

| Evidenza ufficiale | Conseguenza economica |
| --- | --- |
| [Immobiliare.it: Match e Ricerche Attive](https://help-crm.immobiliare.it/contatta-i-clienti/match-e-ricerche-attive) consente contatti su preferenze espresse volontariamente e proposte tracciate. | Il discovery inverso non è una funzione unica del progetto. |
| [Gestim](https://www.gestim.it/panoramica-delle-funzioni/), [Getrix](https://www.getrix.it/gestionale-immobiliare/gestione-richieste-e-incroci/) e [Agim](https://www.agimgestionaleimmobiliare.it/) descrivono richieste, matching, agenda e comunicazioni. [Gestim include assistenza nel canone](https://www.gestim.it/prezzi/). | Bisogna misurare un problema residuo e confrontare l'intervento con l'aiuto già incluso nel CRM. |
| [Miogest](https://www.miogest.com/it/prezzi) espone 499 € + IVA/anno per il piano descritto; Agim propone anche un piano gratuito. | Un addon da 49 €/mese può costare più di un CRM ampio: il valore aggiuntivo deve essere evidente. |
| [Tally](https://tally.so/pricing) offre moduli e risposte gratuiti nel fair use, [embed](https://tally.so/help/embed-your-form), [API](https://tally.so/help/api) e [webhook](https://tally.so/help/webhooks). Branding e retention automatica hanno limiti/piani diversi. | Il prototipo può costare poco; il semplice modulo è facilmente sostituibile. Gratis non significa che tutte le necessità operative siano coperte. |
| [Formulr](https://www.formulr.io/it/use-cases/real-estate) offre link, raccolta, solleciti e integrazioni; [il listino](https://www.formulr.io/it/pricing) include Collect gratuito e Plus 99 €/mese + IVA. La pagina italiana non dimostra supporto normativo o integrazioni italiane. | Il dossier documentale è già un'offerta adiacente, non una novità difendibile. |
| [Tenant Turner](https://tenantturner.com/plans-pricing/) e [ShowMojo](https://hello.showmojo.com/pricing/) descrivono pre-domande, appuntamenti e promemoria. | Il processo è tecnicamente plausibile; il mercato estero non prova la disponibilità a pagare italiana. |
| [Zappyrent referral](https://zappyrent.zendesk.com/hc/it/articles/9926451038097-Programma-di-Referral-Termini-e-Condizioni) pubblica premi ma prescrive uso personale e non commerciale. Per gli altri programmi esaminati manca un payout pubblico applicabile a LinkedHome. | Ricavi da referral e assicurazioni sono **zero** nel modello, finché non esiste un accordo utilizzabile. |

La ricerca ampliata ha richiesto 205 risultati di ricerca, con possibili duplicati, e recuperato pagine ufficiali nei vari filoni. Non sono 205 fonti indipendenti lette integralmente. Metodo, URL e limiti sono nei [dossier allegati](economics-2026-10-03/README.md).

## 3. Modelli selezionati e alternative

| Configurazione | Chi paga e per cosa | Valore prima della liquidità | Valutazione |
| --- | --- | --- | --- |
| A. Marketplace inverso pubblico | Proprietari/operatori per servizi facoltativi. | Limitato senza profili e immobili pertinenti. | Rimandare acquisizione simultanea delle due parti e monetizzazione della rete. |
| B. Verifica acquistabile anche per candidati esterni | Operatore per singolo controllo. | Disponibile se provider, uso e contratto sono supportati. | Prezzo retail, minimi ignoti e assistenza possono consumare il margine. Non prima offerta. |
| C. Software con verifiche integrate | Agenzia/gestore per software e controlli. | Possibile sui propri candidati. | Aggiunge provider, dati finanziari e integrazione prima di aver provato il bisogno. |
| D. Servizio per vacancy/pratica | Agenzia per preparazione circoscritta. | Disponibile sui candidati già acquisiti. | La prima analisi lo preferiva al marketplace; rimane molto dipendente da lavoro per pratica e riacquisto. |
| E. Abbonamento operativo | Operatore con bisogno ricorrente. | Possibile indipendentemente dalla rete. | Canone giustificato solo da uso e lavoro ricorrenti reali. |
| F. MicroSaaS diretto | Agenzia, setup e canone obbligatorio. | Disponibile sui propri candidati. | Candidato dopo una prova pagante; sviluppo, hosting e supporto restano da sostenere. |
| **G. Installazione sullo stack dell'agenzia** | **Agenzia per processo consegnato; manutenzione opzionale.** | **Immediato se il problema esiste.** | **Primo test raccomandato: costo iniziale e perimetro limitati.** |
| H. Stessa installazione tramite web agency | Agenzia finale; quota a partner e sua attivazione. | Come G, con canale aggiuntivo. | Non promettere commissioni prima di dimostrare vendite aggiuntive o lavoro realmente trasferito al partner. |

Le prime tre configurazioni quantificate erano B/D/E; gli allegati [v1](economics-2026-10-03/v1/economics.md) ne conservano formule e risultati. L'approfondimento [v2](economics-2026-10-03/v2/economics_v2.md) quantifica F/G/H con le stesse coorti per evitare di attribuire al canale vendite gratuite.

## 4. Conti a 12 e 24 mesi

Tutti gli input commerciali e operativi sono **H, ipotizzati**. È verificata la [tariffa Stripe](https://stripe.com/it/pricing) usata per carte SEE standard; IVA al 22% e applicabilità del regime sono ipotesi. I conti sono al netto di IVA, sconti e rimborsi, prima delle imposte sui redditi. Il fondatore vale 30 €/h, incluse vendita infruttuosa, consegna, supporto, gestione e avvio.

Nel centrale F/G/H: 24,5 installazioni attese a 12 mesi e 73,5 a 24, numeri frazionari di un modello a valori attesi, non clienti osservati. Per G/H il 60% acquista manutenzione, con churn mensile 5%. G richiede 4 h di consegna, 3 h di vendita per compratore e 40 € di acquisizione cash; 250 €/mese di fissi cash e 12 h/mese di gestione, oltre al lavoro variabile. Avvio G: 2.500 € cash + 40 h. F assume 3.000 € + 100 h e 2 h di attivazione. H assume quota partner 30%, mai quotata o concordata.

**Risultato di progetto = operativo economico cumulato − costi e lavoro iniziali.** Il canone è riconosciuto mensilmente; l'installazione alla consegna. Un deposito non è un secondo ricavo. I ricavi di setup non sono MRR.

| Configurazione centrale | Ricavi netti 24 mesi | Progetto 12 mesi | Progetto 24 mesi | Rendimento fondatore a 24 mesi |
| --- | ---: | ---: | ---: | ---: |
| F: 149 € setup + 49 €/mese | 34.297 € | −11.990 € | −12.097 € | 18,7 €/h |
| G: 490 € setup + 49 €/mese opzionali | 47.711 € | −4.884 € | +2.801 € | 32,7 €/h |
| H: come G, quota partner 30% | 47.711 € | −9.009 € | −12.000 € | 19,1 €/h |

G490 ha un operativo cumulato di +6.501 € a 24 mesi, ma dopo l'avvio rimangono soltanto +2.801 €. Il fabbisogno di cassa con riserva è 3.500 € se il fondatore non si paga; sale a circa 12.050 € con prelievi di 30 €/h. Una cassa contenuta non dimostra un lavoro ben remunerato.

| G490: scenario ipotetico | Installazioni a 24 mesi | Progetto 12 mesi | Progetto 24 mesi | Rendimento fondatore a 24 mesi |
| --- | ---: | ---: | ---: | ---: |
| Prudente | 29,5 | −9.432 € | −11.718 € | 10,5 €/h |
| Centrale | 73,5 | −4.884 € | +2.801 € | 32,7 €/h |
| Favorevole | 123 | −747 € | +21.747 € | 44,0 €/h |

Il prezzo più interessante da mettere alla prova è **790 €**. Per evitare di aumentarlo mantenendo implicitamente tutte le vendite, una sensibilità congiunta riduce le installazioni del 30%: 17,15 nel primo anno e 51,45 in due anni. Il calo non è un'elasticità misurata.

| G790 con 30% meno installazioni | Ricavi netti 24 mesi | Progetto 12 mesi | Progetto 24 mesi | Rendimento fondatore a 24 mesi |
| --- | ---: | ---: | ---: | ---: |
| Manutenzione acquistata dal 60% | 47.621 € | −2.073 € | +10.414 € | 42,5 €/h |
| **Nessuna manutenzione acquistata** | **37.455 €** | **−3.414 €** | **+4.478 €** | **36,2 €/h** |

Il pareggio cumulato arriva rispettivamente al mese 15 e 19, sotto quelle ipotesi. Nella seconda variante la cassa con riserva è 3.500 € senza remunerazione del fondatore, circa 8.796 € con prelievi di 30 €/h. La riserva ordinaria copre almeno 1.000 € o tre mesi di fissi cash, non tutte le possibili uscite. Il modello prevede anche incassi a 30 giorni.

**G non vince universalmente:** F790 con 30% meno compratori arriva a +15.157 € di progetto, contro +10.414 € di G. Richiede però che lo stesso prezzo sia accettato per il SaaS con canone obbligatorio e che bastino 100 h iniziali e 2 h per attivazione. Prima si prova l'acquisto e il processo G; poi si valuta se standardizzarlo in software aumenta il rendimento.

## 5. Margini e condizioni per non trasformarlo in consulenza infinita

Per un'installazione G790 **senza manutenzione**, nel centrale:

`790 × (1 − 5% sconto) × (1 − 3% rimborsi) = 727,99 € di ricavo netto`

`727,99 − 13,98 pagamenti − 120 consegna − 90 vendita − 40 CAC cash − 20,50 supporto/tool primo mese ≈ 443,50 €`

È contribuzione dopo acquisizione, prima di fissi, gestione e avvio. Il primo mese è un'ipotesi di assistenza commerciale; non elimina eventuali obblighi di correzione o responsabilità da definire nel contratto. Senza manutenzione non si presume hosting o assistenza perpetui di LinkedHome.

La manutenzione G49 genera circa **23,55 €/cliente-mese** di contribuzione prima dei fissi, con 15 minuti di supporto ordinario e 100 ingressi × 5% errori tecnici × 4 minuti. Con il 25% di errori diventa **−16,45 €**. Sono guasti del workflow, non chiamate agli inquilini o lettura di documenti.

Il risultato G490 centrale scompare già con circa 15,9 h/mese di gestione, oppure 5,3 h di consegna per cliente, a parità del resto. Nel caso G790/−30% vendite/senza manutenzione, le soglie corrispondenti salgono a circa 18,2 h e 6,9 h. Sono soglie matematiche, non tolleranze da promettere.

La gestione fissa passa da 40 h/mese nel v1 a 12 nel v2 perché il perimetro è più ristretto. Questo migliora il risultato di 20.160 € in due anni: **l'efficienza è da dimostrare**. Riportando G490 a 40 h il progetto perde 17.359 €; vendite da 6 h più CAC cash 100 € lo portano a −8.224 €. Un costo iniziale maggiore di 5.000 € annulla anch'esso il piccolo utile G490. Le tabelle complete mostrano questi stress, anche per F/H.

Per il compratore, 790 + 12 × 49 = **1.378 € il primo anno**, più licenze e servizi esterni necessari. Valutando il suo tempo a 35 €/h, servono almeno 3,28 h/mese di risparmio per coprire quel prezzo; l'obiettivo provvisorio è 4–5 h nette. Il valore orario è ipotetico e ore liberate non equivalgono automaticamente a un risparmio di cassa. Cento richieste con tre minuti netti risparmiati valgono cinque ore: il test deve misurare sia completamento sia lavoro successivo.

Anche la domanda rimane aperta. Cinquantuno installazioni richiederebbero, per esempio, circa 257 offerte a operatori qualificati con conversione 20%, oppure 515 con conversione 10%. Sono esempi aritmetici, non pipeline trovate: il loro tempo deve rientrare nelle ore commerciali.

## 6. Reddito, partner e rapporto con il prodotto già implementato

Il pull include il [flusso locale di attestazione](../product/04-income-attestation.md), condiviso volontariamente con destinatario e anteprima precisi. Il prototipo usa esempi sintetici e l'emissione reale resta indisponibile. Questo lavoro è conservato: l'ipotesi G non lo trasforma in un servizio commerciale né lo rende un requisito per gli inviti.

[Tink Income Check](https://tink.com/it/prodotti/income-check/) documenta supporto italiano; CRIF NEOS e altri servizi hanno capacità descritte, ma prezzo B2B, minimi, categoria di reddito, uso locativo e riuso restano dipendenze contrattuali. Il [dossier provider](economics-2026-10-03/v1/providers-legal.md) e la [ricerca reddituale integrata](11-income-verification.md) distinguono controllo bancario, documento, reddito e garanzia.

Nell'offerta G eventuali controlli sono scelti e acquistati separatamente dall'agenzia presso il provider: **zero ricavi e zero costi di verifica per LinkedHome nel modello**, ma il costo del compratore resta nel suo preventivo complessivo. Non si presume un'API aperta o compatibilità automatica. Niente ricavi assicurativi inventati: [IVASS](https://www.ivass.it/operatori/intermediari/faq/regolamento-5/index.html) distingue mera segnalazione e attività ulteriori; pagamento diretto al provider non prova l'esenzione.

Nel primo perimetro LinkedHome configura strumenti; l'agenzia gestisce relazione e locazione. I ruoli privacy, l'accesso ai dati, i contratti e l'attività concreta vanno definiti. Marchio dell'agenzia, canone fisso o account intestato al cliente non dimostrano da soli l'esclusione dalla mediazione né la conformità GDPR. I budget legali del modello sono ipotesi, non preventivi.

## 7. Prova economica dei prossimi 30 giorni

Questo è un piano proposto, **non attività già svolta**. Tetto provvisorio: 500 € di spese esterne per osservazione, demo sintetica e prova di prezzo, prima di sviluppare un nuovo prodotto. Questo tetto non include implicitamente la preparazione legale e operativa di un servizio con dati reali: il modello separa 2.500 € cash + 40 h iniziali, da quotare. Il pilot richiede ulteriore lavoro commerciale e 4 h per installazione; il tempo del fondatore non è gratuito.

| Quando e prova | Partecipanti / ipotesi | Misura e soglia provvisoria | Decisione |
| --- | --- | --- | --- |
| Giorni 1–7: osservazione neutrale | 6–8 operatori di affitti; ricostruire l'ultima richiesta, gli strumenti e l'assistenza già inclusa. Nessuna raccolta di documenti finanziari. | Almeno 3 mostrano un problema ricorrente compatibile con 4–5 h/mese di lavoro eliminabile, rispetto al processo effettivo. | Senza problema concreto, fermare questa offerta. |
| Giorni 8–14: demo e preventivo | Casi sintetici sullo stesso workflow. Testare 790 €; confrontare un secondo piccolo gruppo a 490 € con perimetro identico. Campioni piccoli non stimano elasticità. | Cercare 3 acquisti indipendenti a 790 €, con ordine e pagamento; interesse o «lo userei» non contano. Eventuale deposito 99 € si detrae dal setup e non è ricavo aggiuntivo. | Nessun nuovo SaaS senza prova di pagamento. Se paga solo il gruppo490, rifare i margini prima di procedere. |
| Giorni 15–24: consegna circoscritta | Tre installazioni, dopo aver definito responsabilità e strumenti. L'agenzia gestisce candidati e comunicazioni. | ≤4 h/installazione incluse configurazione, collaudo e formazione; registrare tutte le ore commerciali e gli errori. | Ore su misura o reinserimento dati elevati impongono perimetro/prezzo diverso. |
| Giorni 25–30: confronto prima/dopo | Agenzie pilota con episodi comparabili. Separare stagionalità, attesa e tempo attivo; misurare abbandono del modulo. | Risparmio netto indicativo ≥4 h/mese, supporto tecnico indicativo ≤35 minuti/cliente-mese. Per un periodo breve presentare separatamente osservato ed eventuale estrapolazione. | Proseguire solo con acquisto, beneficio e margine; allungare la misura se i volumi non bastano. |

La manutenzione è un ordine separato. Non attribuire il 60% di adesione osservando un cliente interessato; misurare chi paga e i rinnovi. Tre pilot possono confutare un problema evidente, non stimare con precisione conversione, retention o redditività del mercato.

## 8. Cosa rimandare e cosa cambierebbe la scelta

Rimandare marketplace nazionale, pubblicità per acquisire inquilini, provider bancari integrati, upload finanziari, score, polizze, API CRM su misura e sviluppo di un pannello completo. Le funzioni sintetiche e la preparazione SMTP/deploy già presenti rimangono strumenti del prototipo, senza nuovi servizi esterni attivati.

Un'ulteriore soglia progettuale è 20–30 installazioni pagate con almeno l'80% dei passaggi riutilizzabili: a quel punto si può misurare se template e software riducono davvero vendita, consegna e supporto. I numeri sono provvisori. L'obiettivo è passare da ore vendute a un processo ripetibile, mantenendo margine; le installazioni una tantum richiedono comunque nuovi compratori.

Cambiare raccomandazione se l'assistenza CRM risolve già gratis il problema, nessuno paga790, il risparmio netto non copre il costo totale, il flusso aumenta abbandono o lavoro, oppure consegna/supporto superano le soglie. Un accordo distributivo scritto con vendite aggiuntive o responsabilità operative reali potrebbe rendere H migliore; un prodotto F pagato e attivabile in 2 h potrebbe superare G. Preventivi provider o obblighi legali nuovi richiedono un ricalcolo.

**La ricerca documentale risolve l'esistenza delle alternative e rende controllabili i conti. Non può risolvere disponibilità a pagare, tempo risparmiato e costo di assistenza senza prove sul campo.** La spesa più utile ora è ottenere queste tre misure, prima di un'altra fase di sviluppo.

## Allegati e verifica

[Indice completo, formule e riproducibilità](economics-2026-10-03/README.md) · [Modello v2](economics-2026-10-03/v2/economics_v2.md) · [Revisione economica](../reviews/review-08-economics.md).

L'audit indipendente v2 ricalcola 216 righe mensili, 18 aggregazioni e tutte le sensibilità senza importare il modello originale: **12.920 confronti, zero scostamenti**. Il v1 conserva il proprio audit. Questa verifica riguarda l'aritmetica, non la validità commerciale delle ipotesi.

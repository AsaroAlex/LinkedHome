# 08 — Revisione dell'integrazione economica

Data: 3 ottobre 2026. Perimetro: [analisi unificata](../research/12-sustainable-economics.md), [allegati](../research/economics-2026-10-03/README.md), modelli v1/v2 e riproducibilità dopo il pull di `9db6a9c`. Nessuna modifica al codice prodotto.

**Esito: PASS per integrazione documentale e aritmetica; domanda, prezzi e tempi restano ipotesi da validare.** Questa è una revisione organizzata secondo gli otto **ruoli A–H** del [protocollo](README.md), non otto persone intervistate o otto revisioni umane. Combina la critica dell'agente indipendente, filoni di ricerca effettivamente svolti su concorrenza, segmenti, provider, distribuzione e normativa, e ricalcoli che non importano i generatori originali. Non sono state condotte interviste, vendite, campagne o prove con dati reali.

## A — Founder / Strategy

- **CRITICAL ISSUES:** G490 centrale produce solo €2.801 di progetto a 24 mesi; non prova un'attività redditizia. Risolto nella raccomandazione: G790 è un **test di prezzo**, con vendite−30% e manutenzione0% come stress, non domanda prevista. F790 può superare G nei conti e viene mostrato.
- **IMPORTANT ISSUES:** Il risultato dipende da 12 h/mese di gestione e nuove installazioni; la disponibilità a pagare790 e il tempo commerciale non sono osservati. Il prezzo pubblicato di un concorrente non dimostra spesa del compratore.
- **NICE-TO-HAVE IMPROVEMENTS:** Ricalcolare con tempi/preventivi effettivi prima di scegliere tra servizio standard e microSaaS.

## B — Product

- **CRITICAL ISSUES:** Un modulo generico non giustifica il setup. Il documento delimita un workflow, un modulo, calendario/e-mail e passaggio al CRM; il vantaggio deve riguardare un problema residuo rispetto agli strumenti già disponibili.
- **IMPORTANT ISSUES:** Consegna4 h, manutenzione60% e100 richieste/mese sono H. Migrazioni, API su misura e istruttorie finanziarie ampliano il perimetro. Nessuna nuova offerta è implementata dal merge.
- **NICE-TO-HAVE IMPROVEMENTS:** Registrare quali passaggi vengono riutilizzati nelle prime installazioni, anziché aggiungere un pannello completo.

## C — UX

- **CRITICAL ISSUES:** Il risparmio può essere spostato sui candidati o sull'agenzia. Il test richiede tempo netto, importazione/reinserimento, abbandono e lavoro successivo; il candidato resta gratuito e la verifica facoltativa.
- **IMPORTANT ISSUES:** Preventivo e percorso devono rendere chiari costi esterni, dati richiesti, manutenzione separata e proprietario degli account. La demo proposta usa casi sintetici.
- **NICE-TO-HAVE IMPROVEMENTS:** Confrontare episodi prima/dopo omogenei; distinguere attesa, tempo attivo osservato ed estrapolazione mensile.

## D — Engineering

- **CRITICAL ISSUES:** La prima copia aveva link/comandi v2 sotto un percorso inesistente `../v1-v2` e collegamenti a estrazioni non copiate. Corretti nei dossier e nel generatore del report; gli estratti esclusi sono indicati come materiali del workspace originario. Formule, input e CSV invariati.
- **IMPORTANT ISSUES:** Script eseguiti dal cwd `/tmp`, quindi indipendenti dalle precedenti cartelle di analisi. I generatori usano input accanto allo script; gli audit usano solo la standard library e non importano i modelli. Python 3.9+ richiesto per gli audit.
- **NICE-TO-HAVE IMPROVEMENTS:** Mantenere un solo stack supportato fino a misurare le integrazioni. Nessun build/test dell'app richiesto da queste sole modifiche di ricerca; verificati i file finanziari interessati.

## E — Security / Privacy

- **CRITICAL ISSUES:** Moduli gratuiti/file upload non costituiscono un'autorizzazione a raccogliere documenti finanziari. G limita il flusso a dati necessari; eventuali verifiche hanno percorso separato. Account del cliente e pagamento diretto al provider non dimostrano conformità automatica.
- **IMPORTANT ISSUES:** Prima del pilot con dati reali definire accessi, ruoli, retention e strumenti. Budget legali e costi dei tool sono H; quelli del compratore restano nel suo TCO.
- **NICE-TO-HAVE IMPROVEMENTS:** Conservare soltanto evidenze operative minime per misurare il processo.

## F — Legal / Fairness

- **CRITICAL ISSUES:** Primo mese di assistenza commerciale non elimina obblighi di correzione/responsabilità. Il documento lo chiarisce; tariffa fissa, brand dell'agenzia e software non sono esenzioni automatiche da mediazione/privacy. Nessun score o garanzia di pagamento è introdotto.
- **IMPORTANT ISSUES:** Contratto e attività concreta possono cambiare costi/perimetro. Referral/assicurazioni hanno ricavo0 nel modello; quote non pubbliche non sono inventate. Nessuna verifica bancaria reale è attivata.
- **NICE-TO-HAVE IMPROVEMENTS:** Quotare responsabilità, extra e condizioni del servizio quando esiste un compratore concreto; niente promessa di ROI nel test.

## G — Growth / Marketplace

- **CRITICAL ISSUES:** Installazioni e clienti-mese non sono utenti gratuiti o liquidità. Le coorti F/G/H sono confrontabili; G usa candidati del compratore e non richiede acquisizione consumer. Setup riconosciuto alla consegna e canone mensile: non MRR di setup o ricavo aggiuntivo da deposito.
- **IMPORTANT ISSUES:** Partner H richiedono attivazione, quota e supporto: non distribuzione gratis. Cassa€3.500 esclude compenso founder; il modello mostra anche remunerazione/prelievi. Tetto€500 riguarda osservazione/demo/prezzo, **non** l'intero avvio€2.500+40 h o la consegna del pilot.
- **NICE-TO-HAVE IMPROVEMENTS:** Misurare conversione su operatori qualificati, rinnovi pagati e costo di vendita completo; campioni piccoli sono criteri direzionali, non stime di mercato.

## H — Adversarial competitor

- **CRITICAL ISSUES:** CRM con assistenza inclusa e moduli gratuiti possono risolvere già il problema. L'analisi lo esplicita e prevede di fermare G quando manca saving incrementale o pagamento. Nessuna unicità, moat o "genialata" è affermata come fatto.
- **IMPORTANT ISSUES:** F790 matematicamente migliore richiede uguale pagabilità,2 h di attivazione,100 h startup e abbonamento obbligatorio: condizioni non provate. G è la prima prova di costo/complessità contenuti, non il massimo universale.
- **NICE-TO-HAVE IMPROVEMENTS:** Usare le alternative già incluse dal compratore come confronto operativo nel pilot, non solo listini di prodotto.

## Resolution log

| Problema critico | Decisione e modifica | Verifica |
|---|---|---|
| Piccolo positivo G490 presentabile come business validato | [Analisi unificata, sezioni4–5](../research/12-sustainable-economics.md): distinguere casi base, G790/−30%vendite, manutenzione0% e risultati12/24 mesi. | G490 progetto24+€2.800,71; G790/−30%/0% manutenzione+€4.478,12; il secondo resta−€3.413,96 a 12 mesi. Nessuna vendita osservata. |
| Omettere il possibile vantaggio F790 | [Modello v2 e sensibilità](../research/economics-2026-10-03/v2/economics_v2.md): mostrare F790 alle medesime coorti e i diversi costi/tempi. | F790/−30% progetto24+€15.157,44; superiorità condizionata a ipotesi commerciali non dimostrate. |
| Confondere riduzione dei fissi e efficienza misurata | [Analisi, sezione5](../research/12-sustainable-economics.md):12 h gestione H contro40 h v1, stress esplicito. | Differenza€20.160 su24 mesi; G490 con40 h progetto−€17.359,29. Soglia circa15,9h/mese per azzerare il piccolo positivo centrale. |
| Supporto finito, verifica separata o account cliente interpretati come esenzione | [Analisi, sezioni5–6](../research/12-sustainable-economics.md): distinguere supporto commerciale, correzione/responsabilità, TCO e ruoli effettivi. | Nessun ricavo assicurativo, emissione reddituale reale o nuova funzione prodotto. Costi/perimetro legali restano da quotare. |
| Confondere tetto della ricerca, startup, cassa e profitto | [Piano30 giorni, sezione7](../research/12-sustainable-economics.md):€500 solo osservazione/demo/prezzo; separati€2.500cash+40 h di avvio e ore di vendita/consegna. | Per G490 centrale, cash+riserva€3.500 senza compenso; circa€12.049,53 con prelievi30 €/h. Deposito detratto dal setup, non doppio ricavo. |
| Percorsi non portabili e link a estratti esclusi | Corretti [report v2](../research/economics-2026-10-03/v2/economics_v2.md), [review v2](../research/economics-2026-10-03/v2/review-v2.md), [buyer](../research/economics-2026-10-03/v2/buyers-workflow.md), [normativa partner](../research/economics-2026-10-03/v2/partner-law.md), [segmenti](../research/economics-2026-10-03/v1/segments-cities.md) e [fonti legali](../research/economics-2026-10-03/v1/legal-primary.md). | Generatori/audit eseguiti da `/tmp`; file CSV/input/JSON numericamente e byte per byte invariati. Report rigenerati con comandi locali; estratti non inclusi dichiarati, fonti ufficiali mantenute. |
| Confondere revisione per ruoli con persone o interviste | Provenienza esplicita all'inizio di questa review e nel documento principale. | Filoni documentali effettivi e audit indipendente; nessuna intervista, contatto o vendita attribuita alla ricerca. |

## Evidenza di riproducibilità

- v1:216 righe mensili,18 aggregazioni; [audit indipendente](../research/economics-2026-10-03/v1/independent_audit.json) **4.573 confronti, zero scostamenti**.
- v2:216 righe mensili,18 aggregazioni e tutte le sensibilità; [audit indipendente](../research/economics-2026-10-03/v2/independent_audit_v2.json) **12.920 confronti, zero scostamenti**.
- Parametri, CSV e risultati JSON rigenerati nella destinazione e confrontati tramite SHA-256. Sono stabili; le sole correzioni del generatore riguardano i comandi mostrati nel report.
- Il file `v1/economic-validation.json` conserva `output_dir` del run storico nel workspace originario: è metadato di provenienza, nessuno script lo legge per scegliere input/output.
- Verificati **17 documenti Markdown e 60 link locali** della sintesi, dossier e questa review: zero link mancanti o diretti fuori dal repository; nessun collegamento operativo alle vecchie cartelle di ricerca. Le estrazioni raw escluse restano note di provenienza.

I controlli confermano portabilità e aritmetica. Non sostituiscono il pagamento di clienti, il risparmio osservato o preventivi/contratti del servizio.

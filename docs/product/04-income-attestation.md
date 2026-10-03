# Attestazione di reddito facoltativa — decisione e contratto locale

Data: 2026-10-03. Estensione richiesta dal nuovo incarico, che supera il rinvio storico della progettazione del reddito; restano aperti i gate per emettere attestazioni reali. Ricerca: [fonti e limiti](../research/11-income-verification.md). Nessuna intervista o prova con utenti reali è stata condotta.

## Ipotesi e momento di valore

Un riepilogo economico con provenienza, periodo e validità può aiutare un proprietario a proseguire una proposta e iniziare una conversazione pertinente. Soglia richiede comunque che il proprietario invii prima un invito riferito a un immobile: non mostriamo reddito, disponibilità di attestati o badge nella discovery. L’implementazione verifica il controllo della condivisione, non dimostra un aumento del primo invito. Dopo l’invito, il titolare può scegliere di condividere prima o dopo l’accettazione; la chat si apre solo con l’accettazione.

## Tre alternative considerate

| Soluzione | Valore proprietario | Attrito candidato | Dati condivisi | Fattibilità e costo | Decisione |
|---|---|---|---|---|---|
| A. Attestazione privata riutilizzabile, condivisa dal titolare | Riepilogo comparabile per periodo e fonte; consultabile dopo la scelta del titolare | Un controllo riutilizzabile; consenso per ciascun destinatario | Riepilogo minimo solo a un account legato a un invito | Contratto e gestione accessi locali realizzabili; prezzo provider e riuso da negoziare | Scelta per prototipo; nessuna esposizione automatica in discovery |
| B. Richiesta di controllo per invito/immobile | Può precisare il bisogno relativo a un immobile | Richieste ripetute e rischio di percezione di obbligo | Limitata all’invito ma potenziale raccolta ripetuta | Richiede gestione richieste, eventuale pagamento e validazione anti-coercizione | Non implementata come richiesta del proprietario |
| C. Controllo dopo interesse reciproco | Più contesto per passaggi successivi | Minore lavoro prima di un interesse reale | Più limitata temporalmente | Semplice da proporre nella chat; non testa incremento del contatto iniziale | Disponibile come momento alternativo della stessa condivisione A |

Le valutazioni sono ipotesi di progetto, non risultati quantitativi validati. La soluzione A evita il costo di ripetere un controllo ove consentito dal contratto del provider; non presuppone un diritto commerciale di riuso.

## Percorso e messaggi

1. Preparare è facoltativo: la pagina Verifiche dice «Il reddito, solo quando scegli tu» e spiega che inviti e visibilità non dipendono dal controllo. Il profilo può essere pubblicato senza reddito.
2. Prima di qualsiasi condivisione, il titolare vede la stessa anteprima: fascia di entrate nette mensili osservate, categoria/fonte, periodo, emittente, data, scadenza e limite del controllo. Non documenti originali, datore di lavoro, saldo, IBAN, movimenti o calcoli di affidabilità.
3. Nell’invito o nella conversazione, una casella inizialmente vuota richiede la scelta distinta. Il destinatario è l’account proprietario dell’immobile e il codice di quell’invito; prima del match non si rivela il nome scelto. Il testo non afferma che l’identità legale del proprietario sia verificata.
4. Il proprietario vede soltanto il riepilogo autorizzato per quell’invito. Un’altra proprietà dello stesso proprietario richiede una scelta separata. L’assenza di accesso non rivela rifiuto, fallimento, scadenza o contestazione del titolare e non produce un giudizio negativo.
5. Revocare interrompe accessi futuri, non ritira copie già consultate. Contestazione, sostituzione dell’attestato, scadenza, blocco/sospensione o invito non più attivo interrompono la consultazione. Un nuovo attestato non si condivide automaticamente.

## Stati e terminologia

| Stato | Etichetta | Comportamento |
|---|---|---|
| Non richiesta | Non richiesta | Nessun obbligo; continua con profilo e inviti |
| In corso | In corso | Nessun accesso; usa comunque il prodotto |
| Completata | Esempio completato (solo locale) | Anteprima e consenso possibile entro validità |
| Dati insufficienti | Dati insufficienti | Evidenze insufficienti, non reddito basso; alternativa assistita futura |
| Errore | Controllo non riuscito | Riprova senza giudizio sulla persona |
| Scaduta | Scaduta | Accesso negato a runtime; serve aggiornamento e nuova scelta |
| Revocata | Revocata | Accessi futuri interrotti |
| Contestata | Contestata | Accessi interrotti; nessun riesame reale operato nella demo |

Oggi l’etichetta corretta è «Esempio sintetico di attestazione», sempre riconoscibile anche al destinatario. Una autodichiarazione resterebbe «Reddito dichiarato»; un file acquisito resterebbe «Documento ricevuto»; OCR/coerenza del documento richiederebbero «Controllo documentale», specificando il metodo. In futuro «Attestazione di reddito — [emittente]» è utilizzabile solo con soggetto identificabile e controlli tracciabili. Non si usa «certificato» per un importo dichiarato o un documento non verificato.

Il reddito riguarda evidenze di un periodo, non garantisce pagamenti futuri. Fasce, durata di validità e periodo scelti nelle fixture sono convenzioni sintetiche per testare il flusso, non standard approvati per il pilot.

## Categorie e alternative

Dipendenti: controlli documentali/payroll o flussi bancari, distinguendo netto osservato da contratto e continuità futura. Autonomi: incassi non equivalgono automaticamente a reddito netto; serve metodo che consideri costi, periodo fiscale e stagionalità. Entrate variabili: periodo e volatilità non possono essere compressi in una promessa di stabilità. Le fixture mostrano categorie diverse, senza pretendere copertura reale. Pensioni, sussidi, studenti, trasferimenti esteri o altre situazioni richiedono fonti supportate e alternativa assistita. Documentazione insufficiente non blocca contatti, non cambia ranking e non deve essere etichettata come esito economico negativo.

## Pagamento e minimizzazione

Nessun acquisto o fatturazione implementato. Ipotesi da testare: Soglia sostiene i controlli nel pilot per non trasferire attrito al candidato; il costo effettivo deve includere riuso, fallimenti, assistenza e contestazioni. Un eventuale contributo del proprietario richiede validazione della disponibilità a pagare e assenza di verifica obbligatoria implicita. Non è una decisione di prezzo validata.

Il prototipo non raccoglie dati finanziari reali o file. I dati sintetici sono creati dal server, non da input economici del client. Eventi e log non contengono reddito/documenti/identificativi provider. Le API controllano ruolo, proprietà dell’attestato, partecipazione all’invito, consenso, blocchi, sospensioni, scadenza e accesso revocato. Export e cancellazione mantengono diritti sui propri dati e non esportano attestati altrui. L’app resta locale; nessun deploy, servizio acquistato o contatto esterno.

## Dipendenze prima di un pilot reale

- Provider e contratto: confermare copertura IT e banche/fonti per categoria, autorizzazione allo specifico uso abitativo, responsabilità di emissione, prezzi/riuso e livelli di servizio.
- Metodo: definire periodo, netto/lordo, redditi autonomi/variabili, evidenze insufficienti, scadenza e aggiornamento con provider e specialisti.
- Privacy: finalità/base giuridica, ruoli, informative e vendor, minimizzazione, retention effettiva e backup, diritti, valutazione DPIA e alternative senza verifica.
- Integrazione: callback autentiche e idempotenti, correlazione al solo titolare, gestione timeout/consenso ritirato/esiti tardivi, token segregati e assenza di documenti nei log; nessuna route pubblica per promuovere un esito del client.
- Operazioni: responsabile reale per assistenza, contestazioni/rettifiche e problemi di copertura, con comunicazioni realistiche sui tempi.
- Prodotto: ricerca di comprensione e scelta volontaria, costi e disponibilità a pagare; Bologna resta un esempio.

Queste dipendenze non interrompono il flusso locale. L’emissione reale è indisponibile e non si può abilitarla con una semplice variabile di ambiente.

## Prossimo esperimento con utenti reali (da organizzare)

Reclutare un piccolo campione eterogeneo di proprietari con esperienza recente e persone in ricerca, includendo autonomi e redditi variabili. Usare casi sintetici, consenso alla ricerca e nessun documento finanziario reale. Nessun partecipante è già stato contattato.

Domande neutrali: «Raccontami l’ultima volta che hai valutato/proposto una locazione»; «Quali informazioni ti mancavano, e in quale momento?»; «Come hai deciso con chi parlare?»; «Cosa ti farebbe interrompere questo controllo?»; «Che cosa pensi provi questo riepilogo?». Evitare di chiedere se una persona vorrebbe una funzionalità o se un badge la rassicura.

Attività: pubblicare preferenze senza verifica; valutare un invito; leggere fonte/periodo/scadenza; scegliere se condividere; individuare destinatario e dati; revocare; interpretare errore/dati insufficienti; confrontare gli stessi casi A/B/C con ordine alternato. Verificare se il proprietario comprende limiti e assenza di attestato.

Criteri decisionali da fissare prima della prova: comprensione di destinatario e contenuto senza assistenza, assenza di condivisioni involontarie, capacità di continuare senza controllo, distinzione fra evidenza storica e garanzia, tempo e frizioni osservati, ragioni per non usare il flusso. Nessuna soglia o risultato è già validato. Una condivisione involontaria o un’interpretazione sistematica come garanzia richiede revisione prima di dati reali.

Misurazione pilot: conversazioni pertinenti avviate (invito accettato più primo messaggio, pertinenza riferita da entrambe le parti), accettazione per inviti eleggibili, tempo attivo richiesto e tempo di attesa separati, abbandono per fase e motivo opzionale, comprensione di contenuto/destinatario/revoca/limiti. Confrontare offerta facoltativa del flusso con percorso senza proposta, mantenendo discovery e accesso invariati; non confrontare soltanto utenti che scelgono la verifica con quelli che non la scelgono, perché l’autoselezione confonde l’effetto. Considerare ruolo/categoria supportata e censura degli inviti recenti. Aggregare senza importi/documenti; identificativi di episodi e coorti sono ancora un requisito del pilot, non telemetria già dimostrata dal prototipo.

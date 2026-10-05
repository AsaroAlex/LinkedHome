# Indirizzo dell’immobile

Il proprietario può salvare via o piazza e numero civico, poi scegliere
«Solo quartiere» oppure «Indirizzo completo». La scelta iniziale è «Solo
quartiere», anche per gli immobili già salvati. Città e quartiere restano
campi obbligatori e continuano a servire per la ricerca delle zone.

Via e civico sono facoltativi quando si mostra soltanto il quartiere.
Entrambi sono obbligatori per condividere l’indirizzo completo. Il civico
accetta anche valori come `12/A` e `SNC`. I campi restano presenti e la
bozza si conserva quando si cambia la scelta di visibilità. Un’anteprima
mostra l’indirizzo che comparirà negli inviti.

## Condivisione e offerte già accettate

Il proprietario vede sempre l’indirizzo salvato nella propria scheda e
nell’esportazione del proprio account. L’altra persona riceve via e civico
soltanto se il proprietario ha scelto «Indirizzo completo» e l’invito è
valido o è stato accettato. Gli inviti scaduti, ritirati, rifiutati o
annullati non condividono l’indirizzo completo. Blocco, sospensione e
isolamento del workspace revocano l’accesso.

L’offerta accettata conserva i dettagli originali: aggiornare la via
dell’immobile non riscrive l’indirizzo di una conversazione precedente.
Scegliere «Solo quartiere» nasconde anche l’indirizzo già condiviso negli
inviti e nelle conversazioni, inclusi i dati dello snapshot restituiti
dall’API. Scegliere nuovamente «Indirizzo completo» può rendere visibile
soltanto l’indirizzo originale già condiviso. Un’offerta accettata con il
solo quartiere non acquisisce un indirizzo completo in seguito.

Come per gli altri dettagli dell’immobile, una modifica annulla gli
inviti ancora in attesa; le conversazioni accettate restano disponibili.

## Dati e compatibilità

La migrazione015 aggiunge `street`, `street_number` e
`address_visibility`. I valori iniziali sono stringhe vuote e `area`;
non riscrive i dati preesistenti. API e database controllano lunghezze,
caratteri di controllo e completezza dell’indirizzo condiviso.

Le richieste di creazione dei client precedenti possono omettere i nuovi
campi. In modifica, omettere ciascun campo conserva il suo valore già
salvato; una stringa vuota lo cancella se la visibilità è `area`. Il merge
e la validazione avvengono prima di aggiornare l’immobile e annullare gli
inviti, nella stessa transazione.

L’indirizzo non viene aggiunto a eventi, audit, filtri o punteggi. Non sono
previsti geocodifica, coordinate o una mappa: «Solo quartiere» mostra la
città e la zona già indicate dal proprietario.

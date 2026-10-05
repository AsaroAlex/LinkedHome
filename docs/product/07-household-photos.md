# Foto per chi cerca casa insieme

Il profilo di ricerca può rappresentare una persona, una coppia o un gruppo.
Le foto sono facoltative. Il titolare sceglie tra una sola foto (propria o
di gruppo) e una foto per persona, senza dover creare altri account.

La foto principale già salvata viene mantenuta cambiando opzione; la UI
lo comunica e permette di sostituirla. In modalità individuale si possono
aggiungere fino a11 altre persone, ciascuna con un nome da mostrare e una
foto facoltativa. Il nome può essere cambiato e la foto rimossa o sostituita;
«Rimuovi persona» elimina la scheda e la sua foto. Non è una verifica
d’identità e non crea altri contraenti o account.

Cambiare modalità conserva le schede personali, ma in modalità con una
sola foto non condivide nomi o foto aggiuntivi. Il titolare li ritrova
tornando alla modalità individuale. Le bozze di nomi e foto bloccano il
cambio di opzione finché non vengono salvate o annullate. Le bozze delle
preferenze restano intatte durante salvataggi di foto e schede.

Nomi e immagini non compaiono nella scoperta anonima. Dopo un invito
accettato/chiuso, il proprietario vede la rappresentazione scelta dal
profilo dell’inquilino. Entrambe le parti devono essere attive, non
bloccate e, nella preview, nello stesso workspace. Anche gli URL privati
delle foto aggiuntive rispettano la modalità e questo confine. Un account
con entrambi i ruoli non condivide i propri coinquilini con le persone
alle quali affitta un suo immobile.

Il numero totale di persone nelle preferenze resta il criterio per la
capienza dell’immobile: comprende anche chi non ha una scheda o una foto.
La UI ricorda di aggiornarlo se le schede aggiunte superano il totale
indicato. Queste operazioni non modificano revisioni o inviti in attesa.
Una frase invita a usare nomi e foto degli altri soltanto con il loro accordo.

JPEG, PNG o WebP, massimo5 MB per foto. Il server normalizza in WebP senza
metadati nello storage privato persistente esistente. Retry idempotenti,
token ritirati e cleanup persistente coprono sostituzioni, rimozioni,
cancellazione di persone e account. La migrazione012 è aggiuntiva e non
riscrive foto o profili esistenti.

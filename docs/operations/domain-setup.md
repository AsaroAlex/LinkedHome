# Dominio LinkedHome: scelta e configurazione prevista

**linkedhome.eu** è il dominio principale proposto per LinkedHome, adottato su richiesta esplicita dell'utente il **4 ottobre 2026**. **linkedhome.it** è facoltativo per il pubblico italiano e un eventuale redirect. **linkedhome.com è già registrato** e non viene trattato come disponibile per una nuova registrazione. La scelta del brand è descritta nel [documento di naming](../product/03-naming.md).

Il **4 ottobre 2026 alle 00:17 CEST** il form pubblico DominioFaiDaTe mostrava le righe esatte `linkedhome.eu € 5,99 Register` e `linkedhome.it € 8,99 Register`. Per `linkedhome.com` mostrava invece `registered`; il RDAP ufficiale Verisign restituiva HTTP 200 con un oggetto corrispondente al dominio esatto. Nessun dominio è stato riservato, acquistato o configurato. La disponibilità di `.eu` e `.it`, l'eleggibilità del titolare e le condizioni applicabili vanno riconfermate al momento della registrazione.

I prezzi indicativi del primo anno erano **€5,99 + IVA per `.eu`** e **€8,99 + IVA per `.it`**, secondo il form e il [listino annuale](https://www.dominiofaidate.com/en/price-list/). Con IVA ipotizzata al 22% corrispondono rispettivamente a **€7,31** e **€10,97**. Rinnovo, imposte effettive e importo finale non sono stati verificati in un checkout LinkedHome. Il prezzo di catalogo visualizzato accanto al `.com` registrato non è un'offerta di acquisto di quel dominio. Fonti, timestamp e limiti sono nell'[evidenza LinkedHome](evidence/linkedhome-domain-research.json).

## Dopo la registrazione

Questi passaggi sono una guida futura: richiedono la proprietà del dominio e l'accesso agli account dei fornitori.

1. Mantenere l'account registrar sotto controllo del titolare, attivare MFA e rinnovo automatico, e registrare chi gestisce scadenze e DNS. Conservare le credenziali fuori dal repository.
2. Configurare su Render il dominio `linkedhome.eu` per il servizio effettivamente creato. Copiare **i target DNS forniti da quel servizio** nella zona del registrar: non sono ancora disponibili in questa preparazione. Aggiungere `www.linkedhome.eu` e impostare un redirect permanente verso `https://linkedhome.eu`, preservando percorso e query.
3. Configurare staging separato su `staging.linkedhome.eu`, con il target del suo servizio. Verificare DNS e certificati HTTPS dei tre host prima di cambiare l'origine dell'app.
4. Solo dopo le verifiche, impostare `APP_ORIGIN=https://linkedhome.eu` nell'ambiente destinato al prodotto e `APP_ORIGIN=https://staging.linkedhome.eu` in staging. Verificare i redirect e tutti i link di conferma/reset prima di usare account reali. `linkedhome.it`, se acquistato, può reindirizzare al `.eu` dopo la verifica del certificato.
5. Autenticare `linkedhome.eu` in Brevo usando **i valori forniti nel relativo account** per verifica del dominio, DKIM e DMARC. Verificare SPF per il percorso effettivo di invio e integrare eventuali mittenti già presenti in un solo record SPF. Non inventare record e non sovrascrivere quelli della posta esistente. Dopo autenticazione e prova di consegna, usare `MAIL_FROM=no-reply@linkedhome.eu` con la chiave SMTP Brevo.

Se si sposta una zona o un dominio esistente, esportare prima tutti i record, inclusi MX e TXT della posta. Verificare la continuità dell'email e coordinare chiavi DNSSEC/record DS con registrar e nuovo DNS: un DS non coerente può rendere irraggiungibile la zona. La scelta di LinkedHome non autorizza una migrazione dei domini o delle caselle esistenti.

Questa documentazione descrive la configurazione futura. Non modifica DNS, origine dell'app, canonical, mittente o servizi; non attiva registrazioni, certificati o invii. L'approvazione del brand non costituisce una clearance legale: i nomi immobiliari vicini sono riportati nel documento di naming. Per hosting, SMTP e controlli operativi vedere [deployment.md](deployment.md) e [ADR 0002](../adr/0002-deployment-providers.md).

Le precedenti indicazioni su Doorluma sono superate. La relativa [evidenza storica](evidence/domain-research.json) resta conservata senza modifiche e non documenta la disponibilità di LinkedHome.

Fonti: [registrabilità `linkedhome.eu`](https://www.dominiofaidate.com/en/CheckAvailability.aspx?sld=linkedhome&tld=eu), [registrabilità `linkedhome.it`](https://www.dominiofaidate.com/en/CheckAvailability.aspx?sld=linkedhome&tld=it), [stato `linkedhome.com` presso il registrar](https://www.dominiofaidate.com/en/CheckAvailability.aspx?sld=linkedhome&tld=com), [listino e IVA DominioFaiDaTe](https://www.dominiofaidate.com/en/price-list/), [RDAP Verisign `linkedhome.com`](https://rdap.verisign.com/com/v1/domain/linkedhome.com), [evidenza e limiti della ricerca](evidence/linkedhome-domain-research.json).

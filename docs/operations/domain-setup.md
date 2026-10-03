# Dominio Doorluma: scelta e configurazione prevista

**doorluma.com** è il dominio principale raccomandato per il brand internazionale. **doorluma.eu** e **doorluma.it** sono facoltativi per protezione e redirect, senza acquisto obbligatorio di tutti e tre. La scelta deriva dal [confronto sul brand](../product/03-naming.md), oltre alla disponibilità.

Il **3 ottobre 2026 alle22:23 CEST** il form pubblico Dominiofaidate indicava il nome esatto, “Domain is AVAILABLE!” e azione **Register** per `.com`, `.eu` e `.it`. Il RDAP ufficiale Verisign restituiva HTTP404 per `doorluma.com`. Nessun dominio è prenotato o acquistato; riconfermare disponibilità/eleggibilità nel checkout.

Offerta `.com` verificata: **€13,99 + IVA il primo anno e al rinnovo**, equivalenti a **€17,07/anno** con IVA22%, secondo il [listino annuale](https://www.dominiofaidate.com/en/price-list/). Il form riporta €8,99+IVA per `.it` e €5,99+IVA per `.eu`; rinnovo dei domini opzionali e importo applicabile al titolare vanno confermati prima dell'acquisto. OVH resta un'alternativa da quotare per `.com`. Gandi ha restituito403 nell'ultimo controllo, senza elusione; la precedente ricerca di altri nomi è preservata nell'[evidenza](evidence/domain-research.json).

## Dopo la registrazione

1. Mantenere l'account registrar sotto controllo del titolare, attivare MFA e rinnovo automatico, e registrare chi gestisce scadenze e DNS. Conservare le credenziali fuori dal repository.
2. Configurare su Render il dominio `doorluma.com` per il servizio effettivamente creato. Copiare **i target DNS forniti da quel servizio** nella zona del registrar: non sono ancora disponibili in questa preparazione. Aggiungere `www.doorluma.com` e impostare un redirect permanente verso `https://doorluma.com`, preservando percorso e query.
3. Configurare staging separato su `staging.doorluma.com`, con il target del suo servizio. Verificare DNS e certificati HTTPS dei tre host prima di cambiare l'origine dell'app.
4. Solo dopo le verifiche, impostare `APP_ORIGIN=https://doorluma.com` nell'ambiente destinato al prodotto e `APP_ORIGIN=https://staging.doorluma.com` in staging. Verificare i redirect e tutti i link di conferma/reset prima di usare account reali. I domini `.it` e `.eu`, se acquistati, possono reindirizzare al `.com` dopo la verifica del certificato.
5. Autenticare `doorluma.com` in Brevo usando **i valori forniti nel relativo account** per verifica del dominio, DKIM e DMARC. Verificare SPF per il percorso effettivo di invio e integrare eventuali mittenti già presenti in un solo record SPF. Non inventare record e non sovrascrivere quelli della posta esistente. Dopo autenticazione e prova di consegna, usare `MAIL_FROM=no-reply@doorluma.com` con la chiave SMTP Brevo.

Se si sposta una zona o un dominio esistente, esportare prima tutti i record, inclusi MX e TXT della posta. Verificare la continuità dell'email e coordinare chiavi DNSSEC/record DS con registrar e nuovo DNS: un DS non coerente può rendere irraggiungibile la zona. La scelta di un nuovo nome non autorizza una migrazione dei domini o delle caselle esistenti.

Questa documentazione descrive la configurazione futura. Non modifica DNS, origine dell'app, canonical, mittente o servizi; non attiva registrazioni, certificati o invii. Per hosting, SMTP e controlli operativi vedere [deployment.md](deployment.md) e [ADR 0002](../adr/0002-deployment-providers.md).

Fonti: [registrabilità DominioFaiDaTe](https://www.dominiofaidate.com/en/CheckAvailability.aspx?sld=doorluma&tld=com), [listino e IVA DominioFaiDaTe](https://www.dominiofaidate.com/en/price-list/), [form pubblico Gandi](https://shop.gandi.net/), [RDAP Verisign doorluma.com](https://rdap.verisign.com/com/v1/domain/doorluma.com), [evidenza e limiti della ricerca](evidence/domain-research.json).

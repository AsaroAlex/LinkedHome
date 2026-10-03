# ADR 0002 — Hosting e posta per la prima beta

Data: 2026-10-03. Stato: raccomandazione e preparazione autorizzate; nessun account, servizio a pagamento o deploy creato. L'utente ha scelto integrazioni reali e preparazione del deploy e ha chiesto di ricercare la migliore opzione.

## Decisione

Preferire **Render a Frankfurt** per il monolite Fastify/React e PostgreSQL nella stessa regione, con **Brevo per la posta transazionale**. Privilegiare database gestito, ripristino, TLS, deploy e cron gestiti rispetto al solo costo del server. Non servono servizi separati per frontend e API.

Per la prima beta con utenti reali, prevedere PostgreSQL da **1 GB RAM**, app da 512 MB inizialmente e workspace Render Pro: **circa $55/mese di hosting**. Verificare la capacità con carico realistico; un'app da 2 GB costa $18/mese in più. Un singolo fondatore può preparare staging o una configurazione più economica con workspace Hobby, circa $30/mese. Il PostgreSQL da 256 MB del blueprint minimo rende concreta e revisionabile la configurazione, ma non è il dimensionamento raccomandato per la produzione.

Brevo Free è sufficiente per staging entro 300 email/giorno; Starter parte da $9/mese per 5.000 email. Il budget indicativo iniziale è quindi **$55 hosting**, oppure **$64 con Starter**, prima di tasse, dominio, traffico aggiuntivo e altri servizi. Non è una garanzia di costo o capacità, né una conversione in euro.

## Confronto hosting

Prezzi ufficiali consultati il **3 ottobre 2026**. Stime senza IVA/imposte o conversione valutaria; nessuna configurazione include alta disponibilità. Le stime a consumo usano 730 ore/mese e ipotesi esplicite.

| Provider e regione | Configurazione e costo indicativo senza sospensione | Recovery, cron e compromesso |
|---|---|---|
| **Render Frankfurt** | App 512 MB $7 + PG 1 GB $19 + cron minimo $1 + 9 GB di storage aggiuntivi $2,70 = **$29,70/mese** su Hobby. Pro aggiunge $25: **$54,70/mese**. Il PG minimo tecnico 256 MB costa $6. | PG gestito; PITR **3 giorni Hobby / 7 Pro**, export logici conservati 7 giorni. TLS, deploy e cron gestiti. Migliore default operativo; RAM dell'app e limiti del piano da validare. |
| Railway Amsterdam | Pro **$20 minimo**, inclusi $20 di consumo. Esempio 1–2 GB RAM media complessiva app+DB, 0,1 vCPU media e volume 10 GB: **$20–25/mese**, prima di cron, backup ed egress; budget illustrativo $20–30. | Snapshot opt-in; PITR opt-in con finestra circa 4 settimane, storage/egress extra. Cron minimo 5 minuti. I template PostgreSQL sono esplicitamente **unmanaged**: configurazione, manutenzione e monitoraggio restano responsabilità dell'operatore. |
| Hetzner Germania/Finlandia | CX23 x86, 4 GB: €5,49 + IPv4 €0,50 + backup al 20% del server = **€7,09/mese**. Backup DB indipendente escluso. CPX22 parte oggi da €19,49 prima degli extra. | 7 copie giornaliere del disco; consistenza a server acceso non garantita e volumi esclusi. Postgres, PITR, patch, TLS, cron e monitoraggio da gestire. Prezzo inferiore, maggiore lavoro operativo. |
| Scaleway UE, anche Milano | Esempio a listino: container sempre caldo 1 vCPU/512 MB **€28,91/mese** prima del free tier + DB-PLAY2-PICO **€17,01** + storage/backup: **circa €47/mese**. Con DB-DEV-S circa €42, ma è un tier dev. | Container e DB gestiti, backup/snapshot e Jobs con cron. PITR non verificato nelle pagine lette. Alternativa se sede UE del fornitore e localizzazione italiana sono requisiti decisivi; prezzo e disponibilità del nodo a Milano richiedono verifica regionale. |

Fonti hosting: Render [prezzi](https://render.com/pricing.md), [backup/PITR](https://render.com/docs/postgresql-backups.md), [cron](https://render.com/docs/cronjobs.md), [regioni](https://render.com/docs/regions.md); Railway [prezzi](https://railway.com/pricing), [PostgreSQL](https://docs.railway.com/guides/postgresql), [backup/PITR](https://docs.railway.com/guides/postgres-backups-restores), [regioni](https://docs.railway.com/reference/regions); Hetzner [prezzi dal 15 giugno 2026](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/), [backup al 20%](https://docs.hetzner.com/cloud/billing/faq/), [consistenza e limiti](https://docs.hetzner.com/cloud/servers/backups-snapshots/faq/), [IPv4](https://docs.hetzner.com/cloud/servers/primary-ips/overview/); Scaleway [DB](https://www.scaleway.com/en/pricing/managed-databases/), [container/Jobs](https://www.scaleway.com/en/pricing/serverless/), [DB a Milano da marzo 2026](https://www.scaleway.com/en/docs/managed-databases-for-postgresql-and-mysql/), [container a Milano da agosto 2026](https://www.scaleway.com/en/serverless-containers/), [min-scale](https://www.scaleway.com/en/docs/serverless-containers/concepts/).

## Confronto email

Il workstream indipendente sulla posta ha consultato le fonti ufficiali seguenti il 3 ottobre 2026. Questi risultati sono riportati dal suo confronto; non sono pagine rilette personalmente dal workstream hosting.

| Provider | Tariffa iniziale | Regione e lavoro richiesto |
|---|---|---|
| **Brevo** | Free **300/giorno, non cumulabili**; Starter da **$9/5.000 email**. L'abilitazione transazionale può richiedere attivazione. | Buon default per staging e beta italiana. Autenticare dominio, DKIM e DMARC. SMTP `smtp-relay.brevo.com:465`, TLS implicito; **SMTP key diversa dall'API key**. |
| Resend | Free **3.000/mese, 100/giorno**; Pro **$20/50.000**. | Il routing SMTP `eu-west-1` non rende europea l'intera elaborazione: contenuti, log e account sono conservati negli USA secondo la documentazione esaminata. |
| Postmark | Free **100/mese**; Basic **$15/10.000**. | Storage negli USA; conservazione di contenuti e metadati 45 giorni secondo la documentazione esaminata. |
| Amazon SES | A consumo **$0,10/1.000**; per i nuovi account, piano Essentials **$0,16/1.000** dopo luglio 2026. | Sandbox **200/giorno, 1/secondo**, destinatari verificati; uscita dalla sandbox tramite richiesta. Regione UE disponibile, ma maggiore lavoro su account, deliverability e operazioni. |

Fonti email: Brevo [prezzi](https://www.brevo.com/pricing/), [transazionale](https://www.brevo.com/products/transactional-email/), [termini/DPA](https://www.brevo.com/legal/termsofuse/), [SMTP](https://help.brevo.com/hc/en-us/articles/115000188150), [autenticazione dominio](https://help.brevo.com/hc/en-us/articles/12163873383186-Authenticate-your-domain-with-Brevo-Brevo-code-DKIM-record-DMARC-record); Resend [prezzi](https://resend.com/pricing), [GDPR](https://resend.com/security/gdpr); Postmark [prezzi](https://postmarkapp.com/pricing/), [privacy UE](https://postmarkapp.com/eu-privacy); SES [prezzi](https://aws.amazon.com/ses/pricing/). Soglie, attivazione e piano applicabile vanno ricontrollati alla creazione degli account.

## Dominio e DNS

Il brand approvato dall'utente è **LinkedHome**, con **linkedhome.eu** proposto come dominio principale futuro e `.it` facoltativo. `linkedhome.com` è già registrato e non fa parte del piano di nuova registrazione. I [controlli del 4 ottobre 2026 alle 00:17 CEST](../operations/evidence/linkedhome-domain-research.json) e il [piano dominio/DNS](../operations/domain-setup.md) conservano risultati e limiti; nessun dominio è stato acquistato. La clearance del marchio resta aperta, comprese le vicinanze Linkhome e Linkedhomes. Questa scelta non cambia origin o mittenti SMTP reali e non attiva servizi.

Per un eventuale dominio italiano aggiuntivo considerare **OVHcloud come registrar e DNS**: la pagina ufficiale italiana del `.it`, consultata il 3 ottobre 2026, riporta **€2,99 + IVA il primo anno e €8,99 + IVA/anno al rinnovo**, con DNSSEC supportato. Sono prezzi del TLD, non un preventivo per il nome specifico né il costo del `.eu`; eleggibilità e importo finale vanno verificati prima dell'acquisto. [Listino ufficiale .it](https://www.ovhcloud.com/it/domains/tld/it/).

Cloudflare Registrar è una valida alternativa per estensioni supportate, con rinnovi al costo del registro e DNSSEC, ma [richiede i nameserver Cloudflare](https://developers.cloudflare.com/registrar/get-started/register-domain/) e il supporto effettivo del TLD va verificato nella console. Non è stata stabilita la disponibilità del `.it` su Cloudflare. OVHcloud rende quindi più concreta la scelta del dominio italiano senza aggiungere un proxy Cloudflare separato davanti a Render.

Usare l'hostname temporaneo Render per i primi controlli web. Per l'invio SMTP configurare un dominio mittente controllato, DKIM e DMARC con i valori Brevo; SPF va verificato per il percorso effettivo di invio, evitando record duplicati. Non sostituire l'origin o il mittente configurato con `linkedhome.eu` prima di acquisto, controllo del dominio, DNS, TLS e prova di consegna. La disponibilità di un dominio non sostituisce la verifica del marchio.

**Evidenza storica, superata dalla scelta LinkedHome:** il 3 ottobre 2026 la ricerca del brand internazionale aveva scelto **Doorluma / doorluma.com**. Il RDAP ufficiale `.com` non restituiva un oggetto per quel dominio; Dominiofaidate lo confermava disponibile in nuova registrazione a **€13,99 + IVA/anno**, anche al rinnovo (**€17,07** con IVA22%). Il registrar confermava disponibili anche `doorluma.eu` e `doorluma.it`. Era un'offerta nominale verificata per Doorluma, non un preventivo per LinkedHome. Gandi nell'ultimo passaggio aveva bloccato la ricerca con403, senza aggiramento; le conferme precedenti riguardavano altri candidati. La [ricerca naming](../product/03-naming.md) e l'[evidenza precedente](../operations/evidence/domain-research.json) conservano fonti, timestamp e limiti originali. Nessun dominio era stato acquistato.

## Privacy e ingress da risolvere prima del rollout

Frankfurt o Amsterdam descrivono la regione di app e database, non garantiscono che tutti i trattamenti rimangano nell'UE. Render usa la rete globale Cloudflare. Il fetch del DPA Render ha restituito soltanto una pagina indice e quello dei subprocessori non è riuscito: **testo contrattuale e catena dei fornitori restano da verificare**. Non è stata stabilita la regione dei bucket Railway usati dal PITR.

Il DPA Brevo, aggiornato il 1 ottobre 2025 secondo il workstream email, elenca OVH in Francia e GCP in Belgio, ma anche Cloudflare UE/USA e Zendesk UE/USA. Hosting principale europeo e possibili trasferimenti sono quindi compatibili nella stessa catena: ruoli, DPA, trasferimenti e conservazione richiedono verifica specifica. La scelta tecnica non chiude i gate della [release checklist](../operations/release-checklist.md).

La configurazione runtime mantiene **`TRUST_PROXY=false`** finché non è verificato l'ingress. Questo evita di fidarsi di header inoltrati arbitrari, ma dietro Render può usare l'IP del proxy e condividere il rate limit di autenticazione tra utenti diversi.

L'[articolo Render del 1 aprile 2026](https://render.com/articles/how-render-handles-ddos-attacks) descrive Cloudflare più load balancer e mostra `trust proxy = 1`, ma il suo rate limiter legge separatamente il **primo** `X-Forwarded-For`: non dimostra che `Fastify trustProxy: 1` restituisca l'IP cliente. La [porta dell'app non è direttamente raggiungibile dal pubblico](https://render.com/docs/web-services.md), mentre [servizi interni possono raggiungerla](https://render.com/docs/private-network.md). Non sono stati verificati CIDR ingress pubblicati; i [CIDR ufficiali disponibili sono outbound](https://render.com/docs/outbound-ip-addresses.md) e non vanno riutilizzati come proxy fidati. I soli CIDR Cloudflare non identificano il socket del load balancer Render.

Prima del rollout pubblico della configurazione preparata, confermare topologia e normalizzazione con il provider e fare probe di staging con più client e header contraffatti. Preferire indirizzi/CIDR ingress confermati; non abilitare un conteggio di hop o la fiducia generalizzata nelle reti private per supposizione. Completare inoltre verifica dominio e mittente, delivery/bounce, restore del DB e cron/retention. Questi controlli richiedono un ambiente configurato e non risultano eseguiti dalla preparazione locale.

## Evidenza e limiti della ricerca

Il workstream hosting ha richiesto **30 risultati Exa** (sei ricerche da cinque risultati, inclusa l'indagine aggiuntiva sul proxy), email **20** (quattro ricerche da cinque) e il confronto registrar **5**: in totale **55 risultati richiesti**, distinti dalle fonti integralmente verificate. Il workstream hosting ha ottenuto **35 URL ufficiali distinti**, 33 con contenuto sostanziale letto integralmente o per estratti mirati; due erano indice/redirect. Il confronto registrar ha letto tre pagine ufficiali. Prezzi e documentazione dei fornitori descrivono l'offerta, non certificano sicurezza, conformità o prestazioni della nostra applicazione. Nessun account, dominio, credenziale, pagamento o servizio esterno è stato attivato da questa ricerca.

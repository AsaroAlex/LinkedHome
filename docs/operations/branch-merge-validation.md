# Verifica locale del merge dei branch

Verifica nuova eseguita il 2026-10-03, dopo il segnale del coordinatore che i tre conflitti documentali erano risolti. Il checkout testato integra il parent locale `78e0491` con il remoto `25d02c6` che adotta **LinkedHome**, prima della creazione del commit di merge. Nessun file risulta unmerged; il verificatore non ha eseguito mutazioni Git né modifiche al codice. README, modulo brand e HTML indicano LinkedHome.

Node 24.19.0, npm 11.9.0. `package.json` e lockfile non cambiano: sono state riutilizzate le dipendenze già installate con `npm ci`, senza reinstallazione.

| Controllo effettivo | Risultato osservato |
|---|---|
| Comando completo | `npm run check`: exit 0 |
| Build/typecheck | Passati; 117 moduli, JS 393,83 kB / 116,59 kB gzip, CSS 27,94 kB / 7,00 kB gzip |
| Backend/unità/integrati/SMTP | 161 test passati, 7 file, 16,74 s |
| Browser core/reddito/mail | 19 scenari passati, 34,9 s |
| Browser esperienza/mail | 11 scenari passati, 12,9 s |
| Browser distinti | 26; quattro scenari mail sono ripetuti nelle due suite |
| DB applicativo preservato | Conteggi e fingerprint aggregati delle righe identici per tutte le 16 tabelle pubbliche, prima/dopo test e probe |
| Record principali | 5 utenti, 2 profili, 1 immobile, 4 migrazioni |
| Reddito | `income_attestations` e `income_shares` rimangono vuote |
| Config/credenziali demo | File e permessi invariati; nessun contenuto stampato |

Lo snapshot dell'app è stato acquisito con sole letture SQL, in modalità read-only, sul target effettivo `soglia`, `127.0.0.1:55432`. Non erano impostati `DATABASE_URL`, ambiente esterno o SMTP. I runner eseguono i reset soltanto sui propri database sintetici `soglia_test` e `soglia_e2e`; la suite esperienza usa API simulate. Non è stato eseguito alcun bootstrap, seed/reset dell'app o nuova migrazione. L'avvio locale esegue il controllo idempotente delle migrazioni già applicate: il ledger rimane identico con quattro record.

Dopo il comando passato è stato provato anche `npm start` sul frontend compilato: servizio **LinkedHome** pronto in ambiente locale, `/api/health` e `/api/config` 200, configurazione `local` / mail `local`, HTML con titolo LinkedHome e `noindex,nofollow`, asset JavaScript 200. Le sole richieste GET non hanno cambiato il database. L'app è stata fermata con SIGINT per ripristinare lo stato iniziale fermo; nessun listener finale su 3000, 3017 o 55432. Il wrapper npm restituisce exit 1 all'interruzione interattiva, senza errori applicativi osservati.

Non sono emersi fallimenti. Il warning Node `NO_COLOR` / `FORCE_COLOR` è non bloccante. Le verifiche browser configurate coprono i controlli di accessibilità/responsività campionati; i risultati non sono una certificazione, una misura di usabilità con utenti o una prova di produzione. Nessun invio esterno, integrazione reale reddito/pagamenti, deploy o CI remoto è stato eseguito. Commit, push, ancestry e pulizia dei branch sono attività separate del coordinatore.

Evidenze: [JSON](evidence/branch-merge-check.json), [Log](evidence/branch-merge-check.log) e [Runtime](evidence/branch-merge-runtime-probes.json). Le snapshot private di confronto sono state eliminate dopo l'aggregazione, senza pubblicare righe o credenziali.

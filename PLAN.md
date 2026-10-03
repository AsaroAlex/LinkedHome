# Execution ledger — LinkedHome

Updated 2026-10-04. User instruction: **execute all repository phases**, followed by the explicit selection of **LinkedHome** and authorization for the necessary repository changes. The original52-section brief is absent from the checkout; this ledger and the adopted feature contract define the reviewable local scope. LinkedHome supersedes Doorluma as the product name; domain purchase and trademark clearance remain open. Earlier continuation sections retain their historical names and validation results.

Research passed an independent bounded gate for synthetic local development. Production deployment, live provider integrations, outside studies and legal/brand clearance are separate [release gates](docs/operations/release-checklist.md).

| # | Phase | Status / evidence |
|---|---|---|
| 0 | Environment/repository inspection | DONE — current checkout, Node24/npm11/Git; existing isolated `work` branch preserved |
| 1 | International research | DONE — dossiers01/02/04/06; current source corrections and explicit unverified claims |
| 2 | Competitor analysis | DONE — Homeflow pre-launch, LocService29€/month corrections; no moat/traction inference |
| 3 | Italian market | DONE —17 totals/four scenarios checked; current Eurostat/Idealista slices; city remains hypothesis |
| 4 | Legal/privacy research | DONE for desk scope — inspected primary baseline, no deployment clearance; review02 |
| 5 | Product thesis | DONE — docs/product/01; independently reviewed |
| 6 | Priorities | DONE — docs/product/02 acceptance contract; external features deferred explicitly |
| 7 | Naming/branding | DONE — LinkedHome selected by the user; centralized brand and future `.eu` guidance updated and verified; purchase and trademark clearance pending |
| 8 | UX architecture | DONE — docs/design/01, review03 |
| 9 | Design system | DONE — docs/design/02 and implemented responsive CSS |
| 10 | Technical ADR | DONE — Fastify/React/TypeScript/PostgreSQL; review03 and amendments |
| 11 | Scaffolding | DONE — manifest/lockfile/pinned runtime, scripts, CI definition |
| 12 | Database/domain | DONE — three SQL migrations, checksum ledger, native PostgreSQL, generated seed |
| 13 | Authentication | DONE — sessions, local confirmation/reset, role/rights controls |
| 14 | Tenant profile | DONE — private draft, publish/pause, approved matching fields |
| 15 | Landlord/property | DONE — owner edits, self-attestation, availability expiry/reconfirm |
| 16 | Matching | DONE — deterministic explained criteria, no person score, stable cursor order |
| 17 | Invitations | DONE — exact revisions, terminal-state contract and offer snapshot |
| 18 | Messaging | DONE — accepted participants, bounded history, block/close |
| 19 | Verification foundation | DONE — typed states/provenance/expiry/dispute; providers truthfully unavailable |
| 20 | Trust/safety/admin | DONE — case-scoped context, suspension/appeal/restore, export/delete and audit |
| 21 | Analytics | DONE — minimal local action counts, no market KPI claims |
| 22 | Tests | DONE — 71 unit/integration tests and 10 browser scenarios passed; operations/validation |
| 23 | Visual QA | DONE — final desktop/mobile screenshots inspected and retained in operations/evidence |
| 24 | Security | DONE for local scope — independent E/F review, fixes and dependency audit with 0 known vulnerabilities |
| 25 | Performance/accessibility | DONE — axe/keyboard/narrow-screen checks; measured desktop LCP244ms, throttled mobile2252ms, CLS0 |
| 26 | Documentation | DONE — README, demo, operations, evidence and tested cloud install/start instructions; install/start draft saved and repository membership aligned to the verified final local HEAD |
| 27 | Final adversarial review | DONE — eight independent final reviewers; review05 PASS for local synthetic scope |
| 28 | Fix material issues | DONE — material findings corrected and regressions passed; external release gates remain separate |

## Milestones and operating constraints

Project commits: `a5d4e80` research consolidation; `d47a214` independent research corrections; `c0180de` reviewed product/design/ADR; `0185593` implemented and tested local MVP. Final evidence is committed separately in this history. The user-authorized normal push published the complete history to the requested branch; no PR was created. Remote target remains only `claude/sweet-goldberg-5lwng7`; never reset/switch the platform checkout or create a worktree unless explicitly requested.

Only generated local data: `.local/` and credentials remain ignored. Test DBs are `soglia_test` and `soglia_e2e`, distinct from `soglia`. Do not run database-owning lifecycle commands concurrently. The tested cloud install/start instructions are saved in the configuration draft. Saving is not publication or validation of a restored new task; source commits are now available on the authorized remote branch independently of a cloud snapshot.

## Completion and follow-on scope

All phases0–28 are complete for the adopted local synthetic scope. Run instructions are in README and cloud-start; exact verification is in docs/operations/validation.md. The current app is usable locally. Work toward real users must address the separately owned release gates; no current evidence establishes their completion. No public deployment, remote CI, outside study or fresh-task restoration is claimed.


Completion follow-up: clean-source install/start and isolated PostgreSQL logical recovery passed; see operations/validation. Platform snapshot publication remains an interface action unavailable through the current tools, not an unfinished repository implementation phase.

## Authorized continuation — integrations and deployment preparation

On 2026-10-03 the user selected **«Integrazioni reali e preparazione del deploy»** and asked **«Ricerca e dammi la migliore opzione»**. This extends the completed local scope; it does not establish a real-user release.

| Work | Status / evidence |
|---|---|
| Hosting/email/domain comparison | DONE — ADR0002 recommends Render Frankfurt, Brevo SMTP and OVHcloud for a future Italian domain; official sources, prices and residency limits recorded |
| Real transactional transport | DONE — authenticated SMTP465/587, verified TLS, bounded/aborted connections, no deployed local fallback; 33 mail tests including controlled live protocol servers |
| Deployment boundary and UI | DONE — explicit environment, HTTPS origin/external DB/SMTP validation, Secure Host cookies including deletion, narrow proxy trust, liveness/readiness and safe public runtime config; mailbox wording follows configuration |
| Deployable source configuration | DONE for preparation — non-root Docker, Render staging/DB/migrate/preflight/daily-maintenance Blueprint and Compose/Caddy alternative; templates unapplied |
| Verification | DONE — build, 136 unit/integration/SMTP tests and 14 browser scenarios; npm audit0 known vulnerabilities; production-only dependency runtime smoke passed with synthetic external PostgreSQL and unchanged application counts |
| Independent technical review | DONE — review06; missing Docker brand module, Secure cookie deletion and SMTP deadline cancellation corrected |

The default local environment remains synthetic and Docker-free. No real SMTP credentials, verified domain, paid service or public deploy exists. Docker schema/configuration and production-dependency startup were checked, but actual image build/run could not be checked because the environment does not permit access to its Docker socket. Render ingress/rate-limit trust, live email delivery, hosted backup/restore, monitoring and real-user release gates remain target-environment work. Exact follow-on evidence is in operations/validation and deployment.md.

The existing remote/cloud configuration references the earlier published commit. This continuation is saved in the local checkout; additional remote publication is not claimed.

## Authorized continuation — domain research and naming

The user requested autonomous selection of an available domain and the resulting repository changes. **Doorluma / doorluma.com** is selected; optional `doorluma.it` is also offered for new registration. [Naming evidence](docs/product/03-naming.md) distinguishes registry availability, registrar offers and bounded collision research. Public branding and deployment guidance are updated; persistent technical identifiers are unchanged. No domain purchase, verified sender, custom-origin activation or additional push is implied. Verification results are recorded in operations/validation.

## Authorized continuation — saved rental UX integration

The user requested the UX work saved in `codex/rental-ux-save-20261003` at `504a809d7795d340cb639adad60a059c5fba1d40`, while retaining the newer Doorluma/domain/deployment work. The shared checkout already contained the exact saved UX source; integration adopts those files in the current branch and extends the existing verification commands, without replacing the newer project snapshot.

| Work | Status / evidence |
|---|---|
| Home, signup, guided dashboard, FAQ and chat starters | DONE — saved UX source preserved; role-aware guidance, actual account-state progress, editable explicit-send drafts |
| Test integration | DONE — `test:e2e:experience` included in `npm run check` and CI definition; no new dependencies |
| Integrated verification | DONE — build/typecheck,136 backend tests,14 existing browser scenarios and11 mocked-API experience scenarios passed sequentially; four mail-runtime scenarios shared between browser suites |
| Preservation and visual review | DONE — Doorluma/domain/server/deploy files unchanged, synthetic application counts retained, desktop/mobile screenshots inspected; [evidence](docs/operations/evidence/rental-ux-integration.json) |

This continuation is saved locally. Remote CI, a further push and a public deployment were not performed.

## Nuovo incarico: UX e reddito facoltativo — 2026-10-03

Implementata l’estensione richiesta localmente: ricerca mirata, audit browser, confronto A/B/C, anteprima/condivisione per destinatario, revoca/contestazione/scadenza e miglioramenti al percorso principale. `npm run check` PASS (96 unit/API, 15 browser); dettaglio e limiti in [income-validation](docs/operations/income-validation.md). Nessun provider reale, upload finanziario, pagamento, deploy o push. Le fasi storiche restano il ledger originario; questo incarico ne estende lo scope locale senza considerare chiusi i gate reali.

## Integrazione e pubblicazione richieste

Il lavoro reddito `f4cf518` è unito alla storia remota Doorluma/UX/SMTP fino a `65f38ee` mediante merge nel checkout corrente. Verifica integrata completata: build/typecheck, 161 test backend, 19 scenari browser core/reddito/mail e 11 esperienza/mail, tutti passati; quattro scenari mail ripetuti. Review07 e [evidenza](docs/operations/evidence/income-integration.json) registrano correzioni runtime, fixture e marchio. Il branch da pubblicare è quello esistente `claude/sweet-goldberg-5lwng7`; `work` è il nome locale del checkout. Dati e credenziali locali restano preservati e ignorati; nessun deploy o provider reale attivato.

## Ricerca economica e pull richiesto — 2026-10-03

La richiesta di massimizzare redditività e contenere spesa è seguita da «Fai pull e unisci il lavoro». Eseguito pull ordinario fast-forward da `6d4805c` a `9db6a9c` su `origin/claude/sweet-goldberg-5lwng7`, mantenendo il checkout locale `work`. Nessun conflitto o sostituzione della storia.

- [x] Ricerca ampliata su concorrenza, clienti, alternative gratuite, distribuzione, provider e partner.
- [x] Due modelli riproducibili a 12/24 mesi con coorti, ore founder, costi iniziali, cassa, scenari e sensibilità; audit numerici indipendenti.
- [x] [Sintesi economica](docs/research/12-sustainable-economics.md), [allegati](docs/research/economics-2026-10-03/README.md) e [review08](docs/reviews/review-08-economics.md) integrati nel repository.
- [x] Verifica nuova del codice ottenuto dal pull: build/typecheck, 161 backend, 19 browser core/reddito/mail e 11 esperienza/mail, 26 scenari distinti. Evidenza in [pull-economics-integration](docs/operations/evidence/pull-economics-integration.json).

La prima offerta da provare è un'installazione 790 € con manutenzione facoltativa, D-008 proposto. Nessuna vendita/intervista/campagna/acquisto o implementazione del pivot è effettuata. La ricerca reddituale e il flusso sintetico già implementati restano distinti dalla validazione economica. I comandi di test preservano dati e credenziali applicativi; gli esiti del controllo di avvio/migrazione sono registrati nell'evidenza dedicata.

## Authorized continuation — LinkedHome branding, 2026-10-04

Following an explicit user-requested pull, the checkout contains the integrated UX, SMTP and synthetic income history at `9db6a9c`. The user then selected LinkedHome and requested the necessary changes. The product name/slug, HTML metadata, existing mail/export expectations and current product/deployment guidance are updated. [D-007](docs/DECISIONS.md) records the decision; [current domain evidence](docs/operations/evidence/linkedhome-domain-research.json) distinguishes available `.eu`/`.it` from registered `.com` and documents nearby names. Older evidence and immutable synthetic observations retain the names they actually recorded. `npm run check` passed: build/typecheck,161 backend tests,19 application browser scenarios and11 experience scenarios, with4 mail scenarios repeated. Desktop,390px and320px visual checks passed. [Validation](docs/operations/validation.md) records this continuation; no purchase, deployment or further push occurred.

## Pubblicazione e pulizia dei branch richieste — 2026-10-04

Alla richiesta «Unisci, mergia e pulisci i branch», inventario completo: un solo ramo remoto/default `claude/sweet-goldberg-5lwng7`, un solo locale `work`, nessuna PR aperta. Il remoto è avanzato durante il push a `25d02c6`, con il naming LinkedHome. Integrato tramite merge insieme alla ricerca `3658f8a`; risolti i conflitti documentali, con D-007 naming e D-008 proposta economica. Nessun branch aggiuntivo da cancellare. Nuova verifica del codice integrato in [branch-merge-validation](docs/operations/branch-merge-validation.md); pubblicazione ordinaria sul ramo remoto esistente.

# Review04 — independent implementation review, phases11–21

2026-10-03. Eight separate agents `implementation_a` through `implementation_h` inspected the implemented local MVP against review03. These were read-only source reviews, not claims that the agents ran tests. The primary agent executed the validation suites and fixes.

| Reviewer | Findings | Implemented resolution / regression evidence |
|---|---|---|
| A Strategy | Local email wording overstated actual delivery; missing property facts; moderation IDs not actionable | Explicit local token/no delivery copy; sqm/rooms/furnishing before acceptance; selected-message author and scoped account/case IDs shown |
| B Product | Staff route reused wrong response shape; message501 invisible; generic validation errors; capped lists | URL-keyed load state and route keys; recent/cursor history; Italian field guidance with accessible summary; paged invitations/staff lists |
| C UX | Reconfirmation cancelled invitations without warning; lost success; session outage looked logged-out; malformed token crashed render; loading focus | Unchanged reconfirmation preserves invites; pause consequence and success rendered; retry state; strict hex parsing; actual heading/form-mount focus and keyboard/narrow-screen tests |
| D Engineering | External startup applied DDL; message/list caps; shifting discovery offsets; test-host overrides; missing migration files | External check-only startup; history pagination; discovery cursor on fixed hash+ID; query-override/effective test-DB checks; complete checksum ledger comparison |
| E Security | Suspended rights inaccessible; accused could erase another person's report through deletion cascade | Restricted credential-checked rights/appeal login; independent minimal report context with nullable deleted identifiers and operator-run cleanup of records older than30 days (wording corrected in review05) |
| F Legal/fairness | Suspended rights; null verification expiry passed SQL CHECK; exported effective status | Rights regression tests; non-null expiry constraint; consistent effective state and checked-at display; live launch gates retained |
| G Marketplace | Stale inventory counts; freshness rejection differed from invitation display; reconfirmation consumed opportunities | Counts follow available unsuspended publication; expired/unavailable invitation states; unchanged reconfirmation preserves pending offers |
| H Competitor | Accepted offer silently changed after edits; omitted offer facts; destructive reconfirmation | Immutable offered property snapshot plus changed-details notice; complete offer facts; revised reconfirmation contract |

Additional validation found a PostgreSQL type-cast error after cursor introduction and an unhandled idle-pool error during process-group shutdown. The SQL comparison was corrected; connection errors are handled without dumping the client object. Stale generated-cluster locks are removed only after proving the recorded process is dead. No live/foreign cluster reset was added.

## Gate

Functional regression validation:68 unit/integration checks passed, followed by9 browser scenarios with axe and responsive checks. Subsequent lifecycle/performance validation and final adversarial review are tracked in review05 and operations/validation. Initial failed runs were investigated rather than marked passed; final results supersede them only after actual rerun.

No public deployment, provider check, commercial validation or real-user moderation operation is inferred from these results. See the explicit release checklist.

# Review03 — product, design and architecture (phases5–10)

2026-10-03. Eight separate agents `product_a` through `product_h` reviewed the product/design/ADR documents independently. **PASS for a local synthetic implementation**, with no critical blockers. No software had been tested at review time. Findings below summarise their returned reports.

| Reviewer | Important findings | Resolution |
|---|---|---|
| A Strategy | Supply freshness, demo counts vs cohort episodes, ordering terminology | 30-day reconfirmation; single-episode local scope; counts labelled; fixed hash order |
| B Product | Terminal invitation/pause/revision behaviour; essential recovery SHOULD | Exact transition contract in ADR; edits/pause cancel pending, no reinvite terminal pair; errors/empty/accessibility MUST |
| C UX | Pending invites at pause, report disclosure, keyboard recovery | Defined both pause cases; report exposes only declared selected context; MUST keyboard/mobile/error states |
| D Engineering | Pair races, atomic tokens, DB isolation/bootstrap, revision acceptance | Ordered transaction user locks, purpose-bound single use, test DB guard, migration checksum/advisory lock and exact revision checks |
| E Security | Suspension/session access, report relationship checks, export/deletion scope, origin/cache/listener | Detailed ADR contracts; per-request checks and test requirements; loopback/no-store/exact Origin |
| F Legal/fairness | Display-name disclosure, tenant-side explanations, suspension appeal | Pre-action disclosure and invitation comparisons; local operator review with real staffed appeal channel a launch requirement |
| G Marketplace | Counts not cohort KPIs, fixed order not rotation, no standalone utility | Single-episode demo; O7 deferred; truthful zero-result/all-invited states MUST |
| H Competitor | Copyable control/explanation, misleading rotation, negative demo test | No moat claim; fixed order; demo includes access denial, edit invalidation and blocking |

Nice-to-have: dated working name in ledger and a concise demo script; included in final documentation plan. Remaining launch questions are tracked separately and do not justify claiming verified market outcomes.

Verification of resolutions: read revised ADR review-contract section and UX addendum; implementation acceptance tests must now substantiate them. A document PASS is not implementation/security certification.

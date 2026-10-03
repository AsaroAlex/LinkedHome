# Review05 — final independent A–H gate

2026-10-03. Eight distinct read-only agents `final_a`…`final_h` reviewed the current local implementation and operations claims. They did not write the implementation or run the coordinator's full suites. D/F received focused follow-ups after their findings were corrected. Scope: the adopted synthetic local MVP, phases22–28; no implicit legal, commercial or public-release approval.

| Reviewer | Critical issues | Important issues and resolution | Nice-to-have / boundary | Final local gate |
|---|---|---|---|---|
| A Strategy | None | Validation evidence and current phase index were incomplete; now consolidated in operations/validation and PLAN | Demand, differentiation and city choice require real research | PASS |
| B Product | None | Dashboard counted only the first100 invitations; private aggregate now counts all rows and loading is unknown rather than zero | Single-episode terminal invitation policy remains explicit | PASS; correction verified by coordinator regression |
| C UX | None | No material residual issue | Registration/reset autocomplete corrected to new-password | PASS |
| D Engineering | None | Failed advisory unlock could skip client release; nested finally now guarantees release, destroys a broken client and preserves the original error | Source inspection; production operations separate | PASS after focused source re-review |
| E Security/privacy | None | Suspended forgotten-password recovery and own-appeal export were incomplete; both implemented with bounded access and regression | No penetration-test certification inferred | PASS; corrections verified by coordinator regression |
| F Legal/fairness | None | UI promised a hard30-day maximum despite manual cleanup; all current UI/operations/ADR/state wording now describes the actual threshold and manual execution. Suspended password recovery fixed | Current counsel, real delivery and fairness assessment remain release gates | PASS after source follow-up and documentation alignment |
| G Marketplace | None | Prior freshness, reconfirmation and active inventory-count defects confirmed resolved | Unavailable invitations now retain Decline/Withdraw while acceptance stays disabled | PASS |
| H Adversarial competitor | None | Residual retention overclaims in ADR/security/state removed during closure | Features remain copyable; no invented moat/traction or test claims | PASS after documentation alignment |

## Resolution evidence

- `server/app.ts` permits reset issuance/consumption for suspended users without changing suspension, retains verification restrictions and exports only that user's appeal reason/status/dates. The new API regression exercises recovery→restricted login→423 ordinary request→appeal/export, verifies suspension remains set and excludes another user's appeal.
- `/api/dashboard` computes private aggregate counts without the list's100-row limit, excluding expired/unavailable pending offers. UI shows a dash until the response is known. A101-invitation regression verifies pending/accepted counts, third-party isolation, old-invitation lookup and expiry/freshness.
- `scripts/migrate.ts` guarantees release through an unlock failure, with the original exception preserved. `tests/migrate.test.ts` reproduces connection loss plus cleanup failure and verifies destruction of the borrowed client. Reviewer D independently confirmed the corrected source.
- Report retention is explicitly manual everywhere in current product/operations instructions. `npm run maintenance` deletes reports older than30 days; no scheduler or guaranteed maximum storage time is claimed. This local threshold is not a legal conclusion.
- Accessible password autocomplete and unavailable-invitation controls are corrected; all browser scenarios passed after these changes.

## Final validation and gate

`npm run check` passed: strict typecheck/build, **71 unit/integration tests** and **10 browser scenarios**. Axe, keyboard/responsive checks and measured cold-load performance passed within their documented scope. Actual frozen install, repeated bootstrap, compiled/dev startup, representative authenticated HTTP requests and restart with preserved records succeeded. Dependency audit found0 known vulnerabilities. See [validation](../operations/validation.md) for measurements, screenshots and limitations.

**PASS — complete for the adopted local synthetic scope.** No identified critical/material local finding remains open. Real-user legal, operational, provider, recovery, research and naming gates remain explicitly tracked in [release-checklist](../operations/release-checklist.md). A saved cloud draft is not a published/restored environment; no remote CI or push is claimed.

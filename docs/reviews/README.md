# Critical review protocol

Every major phase ends with an independent critical review before the next phase starts.
Reviews are written as if by eight separate senior reviewers who did not do the work.
They are deliberately adversarial: the goal is to find what is wrong, not to confirm what is right.

## Reviewer panel

| ID | Role | Core questions |
|----|------|----------------|
| A | Founder / Strategy | Is the problem painful enough? Why will people switch? What kills the business? What is the moat? Is this merely a feature? |
| B | Product | Is the core loop obvious? Is there feature bloat? What prevents activation? Which assumptions are unvalidated? |
| C | UX | Can a first-time user understand it immediately? Where is friction unnecessary? Where might users feel unsafe or confused? |
| D | Engineering | Is this overengineered? Will the architecture survive growth? Where is technical debt being introduced? |
| E | Security / Privacy | How could this leak personal data? How could this be abused? Are we collecting unnecessary information? |
| F | Legal / Fairness | Could this enable discrimination? Is automated profiling excessive? Does the data model create avoidable legal risk? |
| G | Growth / Marketplace | How does the first user get value with low liquidity? How do we solve chicken-and-egg? What creates repeat usage? |
| H | Adversarial competitor | As Idealista / Immobiliare.it / a funded startup: what can be copied in 3 months? What is defensible? Which weakness would you exploit? |

## Output format

Each review file (`review-NN-<phase>.md`) contains, per reviewer:

- **CRITICAL ISSUES** — must be resolved before the next phase.
- **IMPORTANT ISSUES** — must be scheduled; may be resolved in a later phase if explicitly tracked.
- **NICE-TO-HAVE IMPROVEMENTS** — recorded; not blocking.

Followed by a **Resolution log**: for each critical issue, the decision, the change made (with file references), and the verification.

Findings are concise. No hidden reasoning; conclusions and evidence only.

## Review index

| # | Phase reviewed | File | Status |
|---|----------------|------|--------|
| 01 | Research gate (Phases 1–4) | [review-01-research.md](review-01-research.md) | Historical single-agent checkpoint; superseded by review 02 |
| 02 | Independent research A–H plus A/F follow-up | [review-02-independent-research.md](review-02-independent-research.md) | PASS for internal synthetic development; real-user launch gates remain |
| 03 | Product/design/architecture A–H | [review-03-product-design-architecture.md](review-03-product-design-architecture.md) | PASS local synthetic implementation; contracts adopted |
| 04 | Implementation A–H, phases11–21 | [review-04-implementation.md](review-04-implementation.md) | Resolved; final evidence in review05 |
| 05 | Final independent A–H, phases22–28 | [review-05-final.md](review-05-final.md) | PASS for the adopted local synthetic scope |
| 06 | Independent engineering/security review of SMTP and deployment preparation | [review-06-deployment-preparation.md](review-06-deployment-preparation.md) | Identified runtime/cookie/timeout defects resolved; target-environment release checks remain |
| 06 income | Independent review of optional private synthetic income attestations | [review-06-income.md](review-06-income.md) | PASS for local synthetic scope; preview/consent race resolved |
| 07 | Integration of income, Doorluma, saved UX and mail/runtime preparation | [review-07-income-integration.md](review-07-income-integration.md) | PASS for local integrated scope; build, 161 backend tests and both browser suites passed |

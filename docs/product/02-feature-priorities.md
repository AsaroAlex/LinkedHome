# Priorities and acceptance contract — Phase 6

This adopted scope supersedes historical MUST labels in research04 and technology10. Every MUST must work locally against real PostgreSQL with synthetic data. Optional external services remain unavailable until provisioned and reviewed, never mocked as genuine verification.

| Priority | Feature | Acceptance |
|---|---|---|
| MUST | Account/session lifecycle | Tenant/landlord/both signup, password login/logout, hashed expiring sessions, email verification/reset through local mailbox adapter; operator-only admin/moderator |
| MUST | Tenant search profile | Required city/budget/start/duration/occupants; private by default, preview, explicit publish/pause, editing; no protected matching fields |
| MUST | Property | Owner-only create/update, coarse area, rent, availability/duration/capacity, description; draft/published/paused; permission-to-offer attestation is labelled self-declared |
| MUST | Matching | Deterministic approved criteria, each explained; no score, verification/richness boost or protected fields; fixed per-property hash order documented, pagination bounded |
| MUST | Invitation | Current property/profile required, owner and tenant distinct, one record per pair, acceptance by intended recipient only, no chat before acceptance, stale changes revalidated |
| MUST | Conversation | Participant-only text, bounded input, closed/block states enforced server-side, report message/invitation, no raw HTML |
| MUST | Privacy/control | Own structured data export, pause, account deletion with session revocation, no third-party documents; explicitly separate publication and conversation |
| MUST | Verification foundation | Typed states and provenance/expiry/appeal model; truthful unavailable external integrations; local token confirmation explicitly distinct from real email delivery and identity/income |
| MUST | Trust/admin | Report intake, moderator minimum relevant context, audited close/action reasons, user suspension restricted and reversible; block prevents contact both ways |
| MUST | Analytics | Minimal first-party workflow events; admin aggregates and report counts, no public user metrics, avoid raw content in logs |
| MUST | Environment | One-command bootstrap from lockfile, migration ledger, synthetic seed, Docker-free PostgreSQL, explicit external DB mode |
| MUST | Validation | Unit/domain, real-DB integration, role/ownership/CSRF tests, browser happy/negative flows, responsive screenshots, axe, build/typecheck and dependency review |
| MUST | Useful empty/error states | Concrete next step for no property/profile/invitation, inline form errors and loading states, keyboard/mobile navigation |
| SHOULD | English prepared | Central product strings/locale configuration; complete Italian UX; no claim full translation shipped |
| DEFER | Live ID/income/credit/biometrics | Provider contracts, purpose/coverage/alternatives, current law, retention and appeals staffing first |
| DEFER | Documents/PDF share links | Recipient permissions, scope, download limitations, retention and abuse controls first |
| AVOID | Scoring, paid visibility, public negative registry | Excluded by product boundary |
| DEFER | Payments, insurance, contract filing, SMS/push, native apps | Outside core local scope; independent feasibility required |

Implementation completeness is distinct from launch clearance. Local seed users must be clearly synthetic, credentials generated locally, and external networking unnecessary for the core loop after installation. No production seed or default privileged password.

## Income extension — 2026-10-03

The new product-design brief authorizes and requires local implementation of the income extension. The DEFER row above refers to **live provider issuance**, not to private reusable synthetic examples and recipient controls. The implemented contract is [income04](04-income-attestation.md): optional preparation, exact-preview consent for each invitation, minimized summary, runtime expiry, revoke/dispute and no discovery/ranking effect. Real documents/providers remain unavailable.

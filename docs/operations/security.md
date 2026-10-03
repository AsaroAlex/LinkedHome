# Security, privacy and operations

## Boundary and controls

Local synthetic environment only. Production startup intentionally refuses until release requirements are satisfied. HTTP/PostgreSQL bind loopback; credentials are generated into ignored mode0600 files. No raw documents, bank data, biometrics, external verification provider or payment processing. Private API responses use no-store; CSP, frame denial, no-referrer and content-type protection are set. Static application content contains no user data. Secure __Host cookies/HSTS are coded for a future reviewed HTTPS release, not claimed tested on the local HTTP instance.

Session secrets and purpose-bound confirmation/reset tokens are random256-bit values stored as SHA-256 digests; passwords use Node scrypt with independent salt. Tokens expire after30 minutes and are atomically single-use. Sessions expire after7 days, rotate on login and revoke on reset, logout, deletion or suspension. A suspended user can recover a forgotten password and authenticate into restricted rights/appeal access without lifting suspension. All ordinary routes check suspension, role/ownership and verified local-token state server-side. State-changing requests require exact Origin and JSON. IP-based limits cover general API and authentication; the trusted proxy setting is off. JSON bodies and field lengths are bounded; SQL is parameterised; messages render as text.

Ordered user-row locks serialize invitations, messages, blocking, suspension, profile/property edits and deletion. Accept checks exact current revisions; offered facts are preserved separately for accepted/closed conversations. The global migration advisory lock/checksum ledger refuses changed or missing applied files. External database startup performs only schema checks, with migration an explicit operator action.

## Data and retention

Discovery returns only opaque identifiers and approved compatibility fields. Matching never reads verification, identity, language, income or protected traits; indirect effects of budget/geography/capacity remain a release research question. Fixed per-property hash ordering is not an exposure-fairness claim.

Report creation requires an actual invitation participant. Only selected message context is retained; there is no general staff chat browser. Admin/moderator actions are audited. Account deletion removes own profiles, properties, messages, tokens and own reports. Reports made by others survive independently with the selected context and nulled deleted identifiers until operator-run cleanup removes cases older than 30 days. This threshold is not a guaranteed maximum storage time. Events have no account IDs or message contents. Staff audit records retain action/reason codes with deleted IDs nulled.

Run `npm run maintenance` daily in any persisted demonstration: expired sessions/tokens, reports older than30 days, events older than30 days and audits older than90 days are removed. No scheduler is provisioned; this is an operator responsibility. Local mailbox files contain synthetic email/token data; the maintenance command removes recognised files older than30 minutes. Production retention, lawful purpose and backup propagation need independent approval; these local defaults are not a legal opinion.

## Operations and recovery

Use `npm run bootstrap` to create/configure the generated local cluster, `npm start` to run compiled UI/API, and Ctrl+C for graceful stop. Database files persist. Startup can recover stale lock files only when the stored cluster path matches and the recorded process is demonstrably dead/zombie; it refuses to remove a live or unrecognised process lock. No destructive database reset is part of setup.

Do not use an application database for tests. `npm test` rejects external `DATABASE_URL`, validates effective database/server identity and uses `soglia_test`; E2E owns `soglia_e2e`. The main application data is preserved. Keep port3000 free for E2E. Do not run competing database-owning lifecycle commands concurrently; a task that reuses an existing local server does not own its shutdown.

For external backups, use the PostgreSQL version-matched `pg_dump`/`pg_restore` tooling and a separate encrypted destination under the operator's policy. A local logical backup/restore drill passed against a separate disposable database; see validation evidence. Cloud backup infrastructure and a production recovery drill remain unconfigured. Test restore into a new disposable database before any real-user pilot. Never copy `.local/` into version control, shared reports or support tickets.

Current limits: single application process, local mail adapter, manual moderation/maintenance, no public deployment, no full WCAG certification, no independent penetration test, no real-user fairness or performance-at-scale claim. Each is a release gate or explicit local scope boundary, not a hidden dependency of the demo.

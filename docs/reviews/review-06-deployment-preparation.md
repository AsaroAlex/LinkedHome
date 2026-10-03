# Review 06 — deployment and real email preparation

2026-10-03. Focused independent source review by one engineering reviewer. Scope: runtime configuration, SMTP delivery and failure handling, cookies, proxy trust, container dependencies, Render/Compose templates, deployment instructions, provider ADR and frontend environment wording. This is not another eight-person product panel or public-release approval.

The reviewer inspected source and existing test cases without running tests, building containers or changing database state. Only this review document was written. The coordinator performed implementation and execution checks.

## Findings and resolutions

| Finding | Resolution confirmed in current source | Verification boundary |
| --- | --- | --- |
| **P1: runtime omitted a module imported by the mail service.** `server/mail.ts` imports `src/brand.ts`; the container previously copied no `src` module. Startup and preflight would fail to resolve that import. | `Dockerfile` now copies `src/brand.ts` to its matching runtime path. Runtime `tsx` remains a production dependency. | Source dependency inspection; the coordinator additionally reports a production-dependency smoke run using external synthetic PostgreSQL. This does not prove the Docker image was built. |
| **P2: deployed logout, reset and account deletion omitted `Secure` when expiring a `__Host-` cookie.** Browsers reject that cookie update, although the database session is revoked. | All three `clearCookie` calls in `server/app.ts` now include `secure`, `httpOnly`, `sameSite: "strict"` and `path: "/"`. | `tests/deployment-api.test.ts` asserts the expiry cookie attributes for all three flows. The coordinator reports the updated unit/integration suite passed. |
| **P2: the SMTP deadline previously rejected its wrapper without terminating SMTP I/O.** The inspected Nodemailer 10 non-pool transport's `close()` only emits an event; a delayed send could continue after token rollback. | `server/mail.ts` owns the TCP socket through `getSocket` and destroys it in `finally`, including deadline failure. Nodemailer's connection implementation performs implicit TLS on port 465 over that supplied socket and STARTTLS on port 587. Certificate verification remains enabled; `forceAuth` requires authentication. | Source and dependency inspection; `tests/mail.test.ts` includes an isolated live-connection deadline test, encrypted authenticated delivery and refused TLS/authentication/recipient cases. Socket cancellation cannot recall a message already accepted by a provider. |

No additional unresolved P1/P2 finding was identified within this review's scope after those corrections.

## Explicit remaining boundaries

- The Render proxy-address gap is disclosed in [deployment instructions](../operations/deployment.md) and [ADR 0002](../adr/0002-deployment-providers.md). With `TRUST_PROXY=false`, multiple clients can share proxy-based rate limits. Verified ingress configuration and staging probes remain necessary before public traffic; outbound or Cloudflare CIDRs are not substituted for the immediate Render proxy.
- Compose trusts only the dedicated Caddy address, keeps PostgreSQL off host ports and separates migration/maintenance commands. Its actual container rollout, certificates and restore procedure remain unverified here.
- Frontend runtime configuration comes from `/api/config`. Unknown configuration uses neutral recovery/verification wording and does not claim email was delivered or label the environment as production. Email confirmation remains distinct from identity/income checks.
- Password recovery has the same HTTP status/body for unknown addresses and delivery failure, with transaction rollback preserving an earlier token. These checks do not establish resistance to timing-based enumeration.

## Execution evidence supplied by the coordinator

The coordinator reported **136 passing unit/integration/SMTP tests**, a runtime smoke check with production dependencies and external synthetic PostgreSQL, and **14 passing browser scenarios**. The browser suite was rerun after the cookie correction and all 14 scenarios passed (2026-10-03, 20.7s). The final execution record is in [operations validation](../operations/validation.md).

No hosting application, credential, paid resource or public deployment was created by this review. SMTP-provider delivery, public TLS, backup/restore, provider contracts and the real-user [release checklist](../operations/release-checklist.md) remain outside this local source review. No penetration-test, legal-clearance or vulnerability-free claim follows from it.

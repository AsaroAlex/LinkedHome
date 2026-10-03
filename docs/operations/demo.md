# Local demonstration walkthrough

Use only the generated accounts from `.local/demo-accounts.json`. Open tenant and landlord sessions in separate browser profiles so they have independent cookies. The seed provides a current Bologna property, two compatible synthetic profiles and no invented successful transactions. All names, accounts and property details are examples.

1. As tenant, inspect profile fields and publication audience. Pause, then deliberately republish. Confirm no verification/payment prerequisite beyond the local confirmation-token flow.
2. As landlord, inspect property terms, total monthly cost, self-attestation and availability date. Open discovery and compare each reason. Names/email do not appear. Choose the tenant's opaque profile identifier and invite for that property.
3. As tenant, inspect offer facts, including area/rooms/furnishing, and compatibility. Before acceptance there is no conversation. Accept the displayed revision: chosen display names now appear, email/documents do not.
4. Exchange plain-text messages. Refresh to receive the counterparty's messages. Older history has bounded pages; messages are not silently truncated.
5. Report one selected message. The moderator sees only case identifiers, reason and selected context. Admin can find the reported account and suspend it; actions are audited. The suspended account can log in to request local review/export/delete, but cannot contact others.
6. Block the contact: pending invitations cancel and accepted conversations close both ways. Unblocking does not revive terminal pairs. A fresh property/search episode model is a later pilot feature.
7. Use a different pending pair to demonstrate that a compatible rent edit still invalidates the old invitation. Reconfirming unchanged availability preserves pending invitations. An accepted offer snapshot remains visible after later property edits.
8. Export/delete a synthetic account. The export excludes the counterparty's private data. Reports submitted by someone else preserve minimal selected context independently of account deletion. The operator-run maintenance command removes cases older than 30 days; there is no automatic scheduler or guaranteed maximum storage time in this local demo.

For new signup/reset, no email is sent: the operator reads the corresponding `.local/mail/*.json` message, verifies its intended synthetic recipient and uses its URL. No local-mail token or account password belongs in a screenshot or commit.

A useful demo outcome is an accepted invitation and consensual conversation, plus negative access-control checks. Counts of demo actions do not establish marketplace liquidity or demand.

## Optional synthetic income path

Use a tenant/both account. In Verifiche, expand «Prova il percorso con dati sintetici» and generate a completed example. No input collects real amounts/documents. Review the issuer, period, dates, net-income band and caveat. On a pending/accepted invitation expand «Reddito: scegli cosa condividere»; check the recipient and exact preview, tick the initially empty checkbox and share. In the landlord account open «Informazioni sul reddito condivise» for that invitation. Another invitation, even for the same owner, has no access without its own choice.

Revoke the recipient access or contest/withdraw the example. Refresh the landlord view: the summary is unavailable. Renewing an example revokes old grants and requires new choices. Explore in-progress, insufficient, technical-error and expired examples; contact/visibility still work without them. Real issuance is disabled and returns 503. The demo records a dispute without a staffed provider review. Copies already obtained cannot be recalled.

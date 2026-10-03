# Rental marketplace UX and copy benchmark

Research and local implementation: 3 October 2026. This work improves the existing rental matching product; the current brand is read from `src/brand.ts`.

Four official product pages were inspected for observable interface conventions and published descriptions of the rental process. These are relevant reference products, not a verified ranking of conversion performance. Public pages cannot establish which wording converts best. Search results and fetched pages may reflect cached content; private account flows were not accessed.

| Reference                                                                  | Observed pattern                                                                                            | Applied to this product                                                                                                                               |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HousingAnywhere: matching](https://housinganywhere.com/superior-matching) | Property criteria such as budget, move-in date and duration; tenant profiles; response templates            | Concrete discovery heading and instructions, visible compatibility criteria, editable conversation starters, offered property summary beside the chat |
| [Kamernet: how it works](https://kamernet.nl/en/how-does-it-work)          | Make housing preferences visible so landlords can contact tenants; explain direct contact and the next step | Explain profile publication before receiving invitations; show account setup progress and the next action using actual account state                  |
| [OpenRent homepage](https://www.openrent.co.uk/)                           | Separate tenant and landlord entry points; direct action labels; concise explanation of what each side does | Two prominent homepage actions; switchable three-step tenant/landlord guide; role descriptions during registration                                    |
| [idealista Italy](https://www.idealista.it/)                               | Familiar Italian property vocabulary and explicit publishing/search actions                                 | Replace metaphorical private-page titles and empty states with profile, property, compatibility and invitation language                               |

All substantial Italian copy is written for this product. Generic interface conventions are reused; competitor slogans, testimonials, statistics, imagery and claims are not reproduced. Payment protection, verified identities, immediate notifications and provider guarantees on competitor pages are not capabilities of this application and are not promised here.

## Concrete changes

- Homepage: factual introduction, two role actions, separate three-step guides with the correct signup link, five native expandable FAQ answers.
- Registration: native radio choices with role explanations and query-based landlord preselection; password visibility toggle preserves the entered password and does not submit.
- Dashboard: a setup checklist follows email confirmation, deliberate profile publication and current published property availability. Tenant and landlord accounts request only their applicable resources. Loading and failures remain visible; failed progress requests can be retried.
- Profile, properties, discovery and invitations: direct titles and next actions; invitations explicitly explain that opening a chat creates no rental commitment.
- Chat: offered property facts remain visible; changed current property details are disclosed. Role-specific starters append to an existing draft, focus the composer and require explicit sending. Message length remains bounded; failed sending preserves the draft.

The dedicated browser configuration, `playwright.experience.config.ts`, serves the built frontend on loopback port 3017 with development API proxying disabled and uses mocked API fixtures. It does not start, seed or connect to PostgreSQL. It includes seven new experience scenarios and the four existing mail-runtime scenarios. Run `npm run build` followed by `npm run test:e2e:experience`. The combined `npm run check` and CI definition include this suite after the database-backed checks.

The saved source commit `504a809d7795d340cb639adad60a059c5fba1d40` passed strict TypeScript, production build and **11 browser scenarios**: seven new experience scenarios and four existing runtime/email regressions. Its original validation covered only the frontend and mocked APIs.

On integration into the current Doorluma checkout, `npm run check` passed the build, **136 backend/unit/integration/SMTP tests**, **14 scenarios in the existing browser suite** and **11 scenarios in the experience suite**. The four mail-runtime scenarios appear in both browser suites; these counts do not represent 25 distinct scenarios. The experience checks cover both signup roles, account progress and expired availability, recoverable loading failure, editable conversation starters, retained failed-send drafts, length limits and isolation of drafts when switching contacts. Automated axe checks reported no violations for the configured WCAG 2 A/AA and 2.1 AA tags on the sampled pages; overflow checks passed at widths down to 320 px. Homepage desktop/mobile and chat mobile screenshots were inspected and retained. [Integration evidence](../operations/evidence/rental-ux-integration.json) records the checks and preservation of the newer brand and deployment work.

This is implementation and controlled usability verification; no A/B test, user study or improvement in live conversion has been measured.

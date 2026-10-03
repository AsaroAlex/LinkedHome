# Design system — Phase 9

Visual direction: an editorial Italian home journal with clear transactional controls. Warm ivory canvas, deep pine text/actions, clay accents, thin stone borders; large serif headlines paired with a system sans-serif for controls and body. Generous space, small uppercase section labels, restrained rounded cards. CSS illustration and simple inline icons; no stock-photo dependency or fake listings presented as live supply.

| Token | Value / role |
|---|---|
| Canvas | #f8f5ef |
| Surface | #ffffff |
| Ink | #193d35 |
| Muted | #56635d |
| Primary | #214c40; white button text |
| Accent | #a34f35; decorative terracotta |
| Border | #d9ded6 |
| Radius | 12px controls, 20px panels |
| Space | 4/8/12/16/24/32/48/72px |
| Content | 1160px max, 20px mobile gutter |
| Heading | Georgia, serif; clamp responsive sizes |
| Body | system-ui, min16px; comfortable line height |

Components: text/icon brand, navigation tabs, primary/secondary/destructive buttons, labelled input/select/textarea, summary stat, status pill with text, tenant/property card, criterion list, timeline/message bubble, empty state, form alert and confirmation panel. All have visible focus and disabled/loading/error states. Decorative elements hidden from assistive technology. Minimum44px principal controls. Honour reduced motion; no animation required to understand content.

Visual QA must inspect desktop and narrow mobile screenshots of landing, dashboard, forms, discovery, invitation/chat and staff. Automated axe checks supplement human layout inspection; neither proves full WCAG conformance.

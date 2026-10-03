# 10 — Technology Landscape (input for the stack ADR)

> **Research review — 2026-10-02:** This dossier contains inherited evidence and provisional recommendations. Except for the specifically logged checks in [09](09-sources.md), source access has not been repeated in this continuation. [01](01-market-landscape.md) reconciles conclusions; [08](08-product-opportunities.md) records hypotheses and boundaries; [07](07-legal-privacy-risks.md) controls legal caveats. These documents supersede conflicting implementation/pricing suggestions below. Current primary corrections and access limits are recorded in [the recheck](evidence/primary-recheck.md); the current gate decision is in [review 02](../reviews/review-02-independent-research.md).

**Research / access date for every source:** 2026-10-02
**Author role:** Senior full-stack architect + DevOps (LinkedHome research track)
**Status:** Draft v1 — evidence-based; every unverifiable item is marked
**Feeds:** `docs/adr/` (stack ADR), `docs/architecture/`, `docs/security/`

---

## 0. Method, constraints and labelling

### 0.1 How the facts were obtained

1. **npm registry metadata** (`registry.npmjs.org/<pkg>`) was read for ~160 packages: `dist-tags.latest`, the publish timestamp of that version (and of selected major versions), `license`, `engines`, `peerDependencies` and `deprecated` flags. This is the most reliable source for "what is current" and is used for every version number below. [S1]
2. **GitHub** was the only vendor-documentation host reachable: raw files (CHANGELOGs, READMEs, docs-in-repo for Next.js, Drizzle, Prisma, Sentry, Cloudflare, Scaleway, Fly.io, Neon, Supabase, PostHog, OSMF, …) and `github.com/<org>/<repo>/releases` pages.
3. **Context7** (docs index) was used for Next.js, Better Auth, Drizzle, Prisma and shadcn/ui docs; every Context7 excerpt names the underlying GitHub doc file, which is what is cited.
4. **SDK tarballs** were downloaded from npm and grepped for hard-coded regional endpoints (e.g. `api.eu.axiom.co`, `cookieless_mode`, Stripe Identity resources). These are facts about the SDK, not about vendor policy.
5. The two reachable vendor sites were `platform.claude.com` (Claude pricing / data residency) and `cloud.google.com` (locations page, list not machine-readable).

### 0.2 Limitations (read before reusing any number)

- The session's **WebSearch budget (200 calls, shared with other research streams) was already exhausted** when this stream started; zero searches were run. Everything below is from direct fetches.
- The **network egress proxy blocked every vendor marketing/pricing site** (vercel.com, hetzner.com, railway.com, render.com, scaleway.com, ovhcloud.com, aws.amazon.com, azure, neon.com, supabase.com, resend.com, postmarkapp.com, brevo.com, clerk.com, workos.com, sentry.io, posthog.com, all identity-verification and open-banking vendors, ISTAT, Comune di Milano/Bologna open-data portals, MapTiler, Nominatim). Where a vendor publishes its docs on GitHub, those were used and are tier-A facts. Where it does not, the entry says **NOT VERIFIED** and gives no number.
- GitHub **API** access was gated per repository (only `raw.githubusercontent.com` and `github.com` HTML pages were open), so star counts / open-issue trends could not be pulled. "Maintenance health" is therefore judged from release cadence (npm timestamps, changelog dates) and explicit deprecation notices only.
- Prices are quoted exactly as printed in the cited doc, with currency. "n.d." = not dated on the page.

### 0.3 Labels

- **FACT** — stated on a cited page or in registry metadata.
- **OPINION** — my engineering judgement for this project.
- **NOT VERIFIED** — could not be reached today; nothing is filled from memory unless explicitly flagged "(from memory, re-verify)".
- **NOT FOUND** — page reached, but the item is not on it.

### 0.4 Environment facts that shape the recommendation (FACT, measured in the dev container)

| Item | Value |
|---|---|
| Node | v22.22.0 (Active-LTS line "Jod"; maintenance from 2025-10-21, EOL 2027-04-30 [S34]) |
| pnpm | 10.28.0 |
| PostgreSQL | 16.14 (Ubuntu package). Contrib extensions present (citext, pg_trgm, …). **PostGIS and pgvector packages are NOT installed.** |
| Docker | CLI 29.6.2 present, **no daemon** → Testcontainers, MinIO/Mailpit containers, Coolify/Dokploy are unusable *locally* |
| Playwright | Chromium installed |

---

## A. Application framework

### A.1 Current versions (FACT, npm unless noted)

| Tool | Latest | Published | Licence | Engines / peers | Notes |
|---|---|---|---|---|---|
| **Next.js** `next` | 16.3.8 | 2026-09-30 | MIT | node ≥20.9.0; react ^18.2 ‖ ^19 | 16.0.0 = 2025-10-22; 16.1 = 2025-12-18; 16.2 = 2026-03-18; 16.3 = 2026-08-03. 15.x still patched (15.5.27, 2026-09-30). 16.4 canaries daily. 16.3.8 is a **security release** (SSRF in image optimisation, metadata bypass, SSG/ISR cache poisoning) [S3] |
| **React** | 19.3.0 | 2026-09-09 | MIT | — | 19.2.0 = 2025-10-01. 19.3 adds `<ViewTransition/>`, Fragment refs, `browser()` (react-dom), Trusted Types; transitions render independently [S7] |
| **React Router** (framework mode) | 8.4.0 | 2026-09-15 | MIT | node ≥22.22.0; react ≥19.2.7; Vite 7+ | 8.0.0 = 2026-06-17: **ESM-only**, `react-router-dom` removed, all `future.v8_*` flags default (middleware, Vite environment API, split route modules), yearly major cadence (v9 planned ~June 2027 aligned with Node 22 EOL) [S8] |
| **SvelteKit** | 3.0.0 | **2026-10-01** | MIT | node ≥22.17; svelte ^5.57.1; vite ^8.0.12; **typescript ^6.0.0** | Released yesterday. Breaking: remote-function types moved to `$app/server`, cookie v2 (ASCII names), cookie `path` defaults to `/`, `preloadStrategy` removed, TS 6 minimum, Node 22 minimum [S9] |
| **Nuxt** | 4.5.2 | 2026-08-05 | MIT | node ^22.19 ‖ ^24.11 ‖ ≥26 | 4.0.0 = 2025-07-15 [S1] |
| **Astro** | 7.3.5 | 2026-09-24 | MIT | node ≥22.12 | 7.0.0 = 2026-06-22: Vite 8, Go compiler replaced by Rust compiler, advanced routing default, route caching stable (`cache`/`routeRules`), `@astrojs/db` removed [S10] |
| **TanStack Start** `@tanstack/react-start` | 1.168.60 | 2026-09-30 | MIT | node ≥22.12; vite ≥7; react ≥18 | Docs banner: "**currently in the Release Candidate stage** … feature-complete and its API is considered stable … This does not mean it is bug-free". Vite or Rsbuild. **RSC are experimental** [S11] |
| **Vite** | 8.3.2 | 2026-10-01 | MIT | node ^20.19 ‖ ≥22.12 | 8.0.0 = 2026-03-12 = "the epic `rolldown-vite` merge" (Rolldown bundler is now Vite's bundler) [S12] |
| **Hono** / `@hono/node-server` | 4.13.12 / 2.1.3 | 2026-09-30 / 2026-09-29 | MIT | node ≥16.9 / ≥20 | Web-standard, multi-runtime [S13] |
| **TypeScript** | 7.0.2 | 2026-07-08 | Apache-2.0 | — | **Native Go compiler** ("tsgo") shipped as `typescript@7`; 6.0.2 (2026-03-23) was the last JS-based line; 5.9.3 = 2025-09-30. The `microsoft/typescript-go` staging repo is closed ("native port … now completed", to be archived Sept 2026) [S35][S36]. See M for the typescript-eslint peer-range caveat. |

### A.2 Next.js 16 — what changed vs. 2024 knowledge (FACT, from the official v16 upgrade guide [S4] and docs [S5][S6])

- **Turbopack is stable and the default for `next dev` AND `next build`.** A custom `webpack` config makes `next build` **fail** unless you pass `--webpack`. Filesystem caching for Turbopack is on by default (`experimental.turbopackFileSystemCacheForDev/ForBuild`).
- **Caching model:** `fetch` has not been cached by default since v15. Caching is now explicit: `'use cache'` directive + `cacheLife()` + `cacheTag()`; `cacheComponents: true` in `next.config` replaces `experimental.dynamicIO` and `experimental_ppr` (Partial Prerendering is folded into Cache Components). `revalidateTag(tag)` **now requires a second `cacheLife` profile argument** (single-arg form is deprecated and a TS error); `updateTag()` is the new immediate-expiry call for Server Actions; `refresh()` added. `dynamic = 'error'` should be removed.
- **`middleware.ts` → `proxy.ts`** (export `proxy`). The proxy runtime is Node.js only; the edge runtime is **not** supported in `proxy` (keep `middleware` if you need edge). Config flags renamed (`skipProxyUrlNormalize`).
- **Async request APIs:** synchronous access to `params`, `searchParams`, `cookies()`, `headers()` is removed; `PageProps<'/route'>` helper types generated.
- **React 19.2 canary** bundled in the App Router (View Transitions, `useEffectEvent`, `Activity`). **React Compiler** is supported via `reactCompiler: true`; an experimental Rust port runs inside Turbopack (`experimental.turbopackRustReactCompiler`).
- `next/image` defaults tightened (local-IP restriction, `minimumCacheTTL`, `qualities`, `imageSizes`, max redirects); `images.domains` deprecated for `remotePatterns`.
- ESLint **flat config** is the expected config format. Node.js ≥20.9 (Node 18 dropped).
- **Self-hosting** [S5]: `output: 'standalone'` is "the documented and supported deployment configuration for … a Docker container"; image optimisation works with `next start` with zero config (uses `sharp`; glibc memory-allocator note); ISR/data cache works on a single instance with persistent disk; multi-instance needs a shared cache handler and a stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`; a reverse proxy (nginx) in front is recommended; official deploy templates exist for Docker, Fly.io, Render, Cloud Run, DigitalOcean.
- **Security primitives** [S6]: Server Actions compare `Origin` to `Host`/`X-Forwarded-Host` (CSRF), 1 MB body limit, encrypted action IDs, closure-variable encryption; `serverActions.allowedOrigins` for proxies. CSP **nonces** are implemented in `proxy.ts` (`'nonce-…' 'strict-dynamic'`), which forces dynamic rendering for every page view.
- **Fonts** [S6]: `next/font/google` downloads CSS and font files **at build time** and self-hosts them — "No requests are sent to Google by the browser." (If the build machine is offline, use `next/font/local`.)

### A.3 Frank comparison for this product (OPINION unless marked)

Criteria: mobile-first perf · SEO on public listing/profile pages · auth/session integration · i18n (it/en) · testability · dev speed · lock-in · EU self-hosting (Docker/Node) · future native path.

| | Next.js 16 (App Router) | React Router 8 (framework) | SvelteKit 3 | Nuxt 4 | Astro 7 | TanStack Start (RC) | Vite 8 + Hono (no meta-framework) |
|---|---|---|---|---|---|---|---|
| Mobile perf | Good with RSC + Cache Components; heavier client runtime than Svelte | Good; SSR + streaming, smaller framework surface | Best-in-class bundle sizes | Good | Best for content pages (islands) | Good; Vite-native | Depends entirely on you (SPA ⇒ worst SEO/perf by default) |
| SEO public pages | Excellent (SSR/ISR, metadata API, sitemaps, `'use cache'`) | Excellent (SSR, pre-render) | Excellent | Excellent | Excellent (static/SSR) | Good (full-document SSR) | Requires hand-rolled SSR |
| Auth/session | Better Auth, Auth.js both first-class; cookies via `proxy.ts`/route handlers | Better Auth first-class; middleware default in v8 | Better Auth has SvelteKit integration (peer `svelte ^4‖^5`) | Better Auth (community/Nuxt) | Better Auth via adapters; Astro sessions | Better Auth (server functions) | Better Auth with Hono — simplest server model |
| i18n | `next-intl` 4.x (very active), Paraglide, Lingui | Paraglide/Lingui/i18next | Paraglide (same vendor, inlang) | `@nuxtjs/i18n` | `astro:i18n` + Paraglide | Paraglide/Lingui | anything |
| Testability | Vitest + RTL for components; Playwright E2E; RSC unit-testing still awkward (FACT: Playwright CT model changed in 1.62, see L) | Very good (plain React components + loaders are functions) | Very good | Good | Good | Good | Very good (pure functions) |
| Dev speed (TS team, React skills) | Highest for React teams; largest ecosystem (shadcn, Sentry, OTel, next-intl) | High | High if team knows Svelte | High if Vue | High for marketing site, not for the app | Medium (RC churn) | Lowest (you build routing/SSR/data story) |
| Lock-in | Highest conceptual lock-in (RSC, `'use cache'`, `proxy`, Vercel-shaped primitives) but runs anywhere as a Node server | Low (ESM, standard Request/Response, Vite) | Low–medium | Medium | Low | Low–medium (RC) | Lowest |
| EU self-host | FACT: `output: 'standalone'` + Docker officially supported; image optimisation self-hosted; multi-instance needs shared cache handler | FACT: plain Node/Vite SSR server; trivial Docker | FACT: adapter-node | FACT: Nitro node preset | FACT: node adapter | FACT: Vite/Rsbuild node target | Trivial |
| Native path | Expo/React Native share TS types + Zod schemas + Better Auth client (`expo` plugin exists in Better Auth [S25]); Capacitor/PWA fine | Same as Next (React) | Capacitor/PWA only (no RN) | Capacitor/PWA | n/a (marketing) | Same as Next (React) | Same (React or whatever you pick) |

**Bottom line (OPINION):** For a React/TypeScript team building an SEO-sensitive marketplace that must self-host in the EU, **Next.js 16** remains the pragmatic default *because of the ecosystem* (Better Auth, next-intl, shadcn/ui, Sentry, OTel, Playwright all treat it as tier-1) and the officially supported standalone/Docker path — but the caching model (`'use cache'`/Cache Components) and `proxy.ts` are new 2025–26 concepts the ADR must name explicitly, and the team should **avoid Vercel-only primitives** (edge runtime, Vercel KV/Blob, `@vercel/*` cache handlers). **Runner-up: React Router 8** — lowest lock-in, ESM-only, boring Node SSR, middleware default, yearly major cadence; choose it if the team values simplicity over RSC/`'use cache'`. **Astro 7** is the right tool for the *marketing/SEO site* if it is split from the app later. SvelteKit 3 and Nuxt 4 are excellent but a language/ecosystem bet; TanStack Start is still RC today (FACT) — revisit at 1.0.

---

## B. Data layer

### B.1 Versions (FACT)

| Tool | Latest | Published | Licence | Engines / peers | Notes |
|---|---|---|---|---|---|
| **drizzle-orm** | 0.45.3 (dist-tag `latest`) | 2026-09-21 | Apache-2.0 | — | **1.0.0 is still pre-release**: rc.1 2026-04-30 … rc.4 2026-06-27 (GitHub releases [S14]); 0.45.x is the stable line. Better Auth already declares peer `drizzle-orm ^0.45.2 ‖ ≥1.0.0-rc.1` [S1] |
| **drizzle-kit** | 0.31.11 | 2026-09-21 | MIT | — | v1 brings a full rewrite (DDL snapshots, new migration folder structure "v3", `push --explain`, `pull --init`, `drop` removed) [S16] |
| **prisma** (CLI) | **8.0.0-rc.19 is `latest`** | 2026-09-29 | Apache-2.0 | node ≥22.18 | `@prisma/client` latest = 7.10.0 (2026-08-25). 7.0.0 = 2025-11-19. README: "**Prisma 8 is a release candidate.** `8.0.0` final is expected in the next four to eight weeks … Prisma 7 stays on the `v7` branch with bug fixes and security updates for eighteen months after `8.0.0` final." Prisma 8 = "TypeScript rewrite … extensible, composable, and AI-agent friendly" [S18][S19] |
| **@prisma/adapter-pg** | 7.10.0 | 2026-08-25 | Apache-2.0 | — | Driver adapter required since v7 [S20] |
| **kysely** | 0.29.6 | 2026-09-16 | MIT | node ≥22 | Still 0.x; 0.30.0-beta exists [S1][S21] |
| **postgres** (postgres.js) | 3.4.9 | 2026-04-05 | Unlicense | — | [S1] |
| **pg** (node-postgres) | 8.23.1 | 2026-09-30 | MIT | — | [S1] |
| **@electric-sql/pglite** | 0.5.8 | 2026-08-26 | Apache-2.0 | — | "Postgres in WASM … support for many Postgres extensions, including pgvector and PostGIS" — runs in-process in Node, no Docker [S47] |

### B.2 Drizzle facts relevant to us (FACT [S15][S16][S17][S14])

- **RLS:** `pgTable.withRLS('t', {...})` (replaces `.enableRLS()` in v1), `pgPolicy(...)` and `pgRole(...)` are first-class; adding a policy auto-enables RLS; Neon/Supabase helper roles exist. Policies are emitted by drizzle-kit migrations.
- **PostGIS:** `geometry()` column type (point) + spatial index are supported; `CREATE EXTENSION postgis` must be added as a custom migration (`drizzle-kit generate --custom`).
- **v1 breaking changes (when we eventually upgrade):** Relational Queries v1 removed (RQB v2 only), new casing API, `drizzle-zod`/`drizzle-valibot` folded into `drizzle-orm/zod` etc., `.array()` no longer chainable, new migration folder structure, `schemaFilter` default changed. Features: JIT mappers (claimed 25–30 % latency reduction), codecs, prepared queries, SQLcommenter, Effect integration, `drizzle-kit` MCP server and agent skills.
- Drivers: node-postgres, postgres.js, PGlite, Neon, plus the new Netlify DB driver (0.45.3).

### B.3 Prisma 7/8 facts (FACT [S18][S19][S20])

- **Prisma 7 (2025-11-19):** Rust-free TypeScript query compiler is the default; **driver adapters are mandatory** (`new PrismaClient({ adapter: new PrismaPg({connectionString}) })`); `prisma.config.ts` replaces datasource URL in schema; connection-pool defaults now come from the driver (`pg` has no connect timeout by default, v6 had 5 s); ESM output.
- **Prisma 8 RC (latest tag!):** new "contract" model, `// use prisma-8` schema directive, `.take()/.skip()` → `.limit()/.offset()`, temporal columns move to `Temporal`, enum ordering follows stored values, `@default(sql\`…\`)`. A `@prisma/prisma7` compatibility package allows side-by-side installs.
- Prisma Postgres / Accelerate regions: **NOT VERIFIED** (prisma.io blocked; the regions doc path in `prisma/web` was not found).

### B.4 Comparison (OPINION, informed by the facts above)

| | Drizzle 0.45 | Prisma 7 (8 RC) | Kysely 0.29 | plain `pg`/`postgres` |
|---|---|---|---|---|
| Type safety | Schema-as-code, inferred types; relational queries typed | Generated client, strongest end-to-end types | Typed query builder, types hand-written or generated (`kysely-codegen`) | None |
| Migrations | `drizzle-kit generate/migrate` — SQL files you can read and edit; RLS/policies/roles in schema | `prisma migrate` — mature, but v7→v8 churn is high right now | BYO (e.g. `kysely` migrator or raw SQL) | BYO |
| Raw SQL escape hatch | `sql\`…\`` everywhere, composable | `$queryRaw` / TypedSQL | Native (`sql` template) | Native |
| Performance | No engine process; JIT mappers coming in v1 | Rust engine gone in v7 (good), but client is larger | Minimal | Minimal |
| Local-dev friction | Zero binaries; works with PGlite for tests | Generate step; **`latest` tag is an RC** — pin `7.x` explicitly or you get 8-rc | Zero | Zero |
| Postgres-specific features (RLS, PostGIS, enums, `citext`) | Good (RLS/PostGIS documented) | PostGIS = `Unsupported("geometry")` columns (from memory, re-verify) | Anything (it is SQL) | Anything |

**Recommendation (OPINION):** **Drizzle ORM 0.45.x + drizzle-kit** as the default (pin `~0.45`, plan the v1 migration as a tracked task), `pg` driver (Better Auth, pg-boss, rate-limiter-flexible all support it), raw `sql` for geo queries. **Runner-up: Kysely** if the team prefers "SQL with types" over an ORM. **Prisma** is explicitly *not* recommended for a new project in Oct 2026: the `latest` tag points at an RC with breaking API changes and the 7→8 transition is in flight (FACT); re-evaluate after 8.0 final.

### B.5 Geography: PostGIS vs. zone-ID (mixed)

- FACT: PostGIS is available on Neon and Supabase managed Postgres [S60][S61]; Drizzle documents `geometry` columns [S17]; PGlite ships PostGIS for tests [S47]. FACT: **our dev container's PostgreSQL 16 has no PostGIS package installed** (§0.4), and there is no Docker daemon to run a `postgis/postgis` image.
- FACT: Italian administrative polygons (regions, provinces, 7,896 comuni; ISTAT 2026-01-01 vintage; CC-BY) are downloadable as GeoJSON/TopoJSON from `openpolis/geojson-italy` [S76]. Sub-municipal zones (Milan NIL, Bologna "zone") — **NOT VERIFIED** (open-data portals blocked).
- **OPINION / recommended default:** start with a **zone-ID model** (`zones` table: id, city, name, parent, optional stored polygon as GeoJSON `jsonb`; listings/searches reference zone IDs; matching = set intersection). Add PostGIS only when we need point-in-polygon or radius search from free-text addresses, and when the hosting target is confirmed to support it. This keeps local dev (`apt`-free), tests (PGlite or plain PG16) and migrations boring, and ISTAT comuni polygons can still be pre-computed offline into zone IDs. Record a follow-up ADR trigger: "if >1 city needs free-form radius search, enable PostGIS (`CREATE EXTENSION postgis` via custom Drizzle migration)".

---

## C. Authentication

### C.1 Versions and status (FACT)

| Tool | Latest | Published | Licence | Status / notes |
|---|---|---|---|---|
| **next-auth** (Auth.js) | 4.24.15 (`latest`) / **5.0.0-beta.32** (`beta`) | 2026-07-20 / 2026-07-20 | ISC | **v5 is still beta** (main branch `package.json` = `5.0.0-beta.32`) [S24]. README on `main`: "**Auth js is now part of Better Auth.** We recommend new projects to start with Better Auth unless there are some very specific feature gaps (most notably stateless session management without a database)." [S22]; the notice was added on 2025-09-26 [S23]. `@auth/core` 0.41.3, `@auth/drizzle-adapter` 1.11.3 (both 2026-07-20). |
| **better-auth** | 1.7.7 | 2026-09-30 | MIT | 1.0.0 = 2024-11-23; 1.4 = 2025-11-22; 1.5 = 2026-03-01; 1.6 = 2026-04-06; 1.7.0 = 2026-08-18. Peers: `next ^14‖^15‖^16`, `react ^18‖^19`, `svelte ^4‖^5`, `drizzle-orm ^0.45.2 ‖ ≥1.0.0-rc.1` [S1]. Recent releases: 1.7.7 "critical Magic Link vulnerability fix"; 1.7.6 Vercel BotID CAPTCHA; 1.7.5 Postgres schema-name support; 1.7.4 OpenTelemetry span toggle, Vitest 5 compat, Drizzle Relations v2; 1.7.3 schema validation enforced at init [S25]. `release-1.6` and `release-1.4` maintenance tags exist. |
| **@better-auth/passkey** | 1.7.7 | 2026-09-30 | MIT | WebAuthn/passkeys plugin (`passkey({ rpID, rpName })`) [S26] |
| **lucia** | 3.2.2 | 2024-10-20 | MIT | **DEPRECATED on npm** ("Please see https://lucia-auth.com/lucia-v3/migrate"). Repo: "**Lucia was deprecated on March 2025.** See `code/auth_session.ts` for a complete, single-file replacement" — i.e. the site is now a learning resource, confirmed [S27]. The companion packages `arctic` (3.7.0) and `@oslojs/crypto` (1.0.1) are **also marked deprecated** on npm ("Package no longer supported") [S1]. |
| **@clerk/nextjs** | 7.9.10 | 2026-10-01 | MIT | Hosted. EU data residency and pricing: **NOT VERIFIED** (clerk.com blocked; SDK only hard-codes `api.clerk.com`) |
| **@workos-inc/node** / `authkit-nextjs` | 11.0.0 / 4.4.0 | 2026-09-28 / 2026-09-30 | MIT | Hosted. EU residency / pricing: **NOT VERIFIED** |
| **@supabase/supabase-js** / `@supabase/ssr` | 2.117.2 / 0.12.7 | 2026-09-25 / 2026-09-08 | MIT | Supabase projects can be pinned to a specific AWS region incl. **Central EU (Frankfurt) `eu-central-1`**, Paris, Ireland, Zurich, Stockholm, London [S61]. Pro plan from **$25/month**, includes 100,000 MAU then $0.00325/MAU [S61]. |
| **@simplewebauthn/server** | 14.0.3 | 2026-09-25 | MIT | If you implement passkeys outside Better Auth [S1] |

### C.2 Better Auth capability check (FACT, from docs in the repo [S26])

- Email OTP plugin (`emailOTP({ sendVerificationOTP, overrideDefaultEmailVerification })`) — can replace verification links with codes.
- Magic link plugin (`magicLink({ sendMagicLink })`).
- Two-factor plugin (`twoFactor()`, TOTP + backup codes; `appName` as issuer).
- Organization plugin (teams/roles; "organization role performance" fixes in 1.7.x releases).
- Passkeys via `@better-auth/passkey`.
- Rate limiting: core option plus per-plugin `rateLimit: [{ pathMatcher, limit, window }]` rules; DB-backed storage with "rate-limiting database performance" fixes in 1.7.x.
- Drizzle adapter (`drizzleAdapter(db, { provider: 'pg' })`), Postgres schema-name support (1.7.5).
- Sessions are **database-backed by default** (cookie holds the session token) — the exact property we want for EU/self-hosted session data (the Auth.js README itself names "stateless session management without a database" as the main reason to *not* pick Better Auth).

### C.3 Recommendation (OPINION)

**Better Auth 1.7.x** (self-hosted, sessions in our Postgres via the Drizzle adapter), with **email OTP as the primary flow for landlords** (6-digit code typed on the phone beats magic links across mail-client link-rewriting and cross-device issues), magic link as secondary, passkeys offered post-signup, TOTP 2FA optional for admins. Reasons: Auth.js has formally pointed new projects at Better Auth (FACT), Lucia is deprecated (FACT), hosted providers (Clerk/WorkOS/Supabase Auth) move session/identity data to a third party whose EU residency we could not verify today, and Better Auth's feature list covers everything in the brief. **Runner-up:** Auth.js v5 beta only if we needed stateless JWT sessions without a DB (we do not). Note the **1.7.7 magic-link security fix** — pin ≥1.7.7 and watch the advisories feed.

---

## D. UI

### D.1 Versions (FACT)

| Tool | Latest | Published | Licence | Notes |
|---|---|---|---|---|
| **tailwindcss** | 4.3.3 | 2026-07-16 | MIT | 4.0 = 2025-01-21 (CSS-first `@theme`, Oxide engine, no `tailwind.config.js` by default); 4.1 = 2025-04-01; 4.2 = 2026-02-18 (logical-property utilities `pbs/pbe/mbs/mbe`, `inset-s/e`, new palettes, `@tailwindcss/webpack`); 4.3 = 2026-05-08 (`@container-size`, `scrollbar-*`, `scrollbar-gutter-*`, `zoom-*`, `tab-*`, stacked/compound `@variant`). `v3-lts` tag = 3.4.19. `@tailwindcss/postcss` / `@tailwindcss/vite` 4.3.3 (Vite 5–8 peers) [S28][S1] |
| **shadcn** (CLI) | 4.21.1 | 2026-10-01 | MIT | 4.0.0 = 2026-03-06. **Jan 2026:** full docs for Base UI components (`npx shadcn create` lets you choose Radix or Base UI). **Mar 2026:** `shadcn init --base radix|base` flag. **Jul 2026:** **Base UI became the default**; keep Radix with `npx shadcn init -b radix`. Component imports/APIs are the same across both (`@/components/ui/dialog`) [S29] |
| **radix-ui** (unified package) | 1.6.7 | 2026-07-24 | MIT | Releases dated 2026-06-06, 06-30, 07-06, **07-20** (per-primitive subpath entry points `radix-ui/accordion`, tree-shaking `/* @__PURE__ */`, Dialog ARIA fix) — **after a gap from 2025-08-13 to 2026-06-06** [S30]. Individual `@radix-ui/react-*` packages still published (react-dialog 1.1.23, 2026-07-24). |
| **@base-ui/react** (MUI) | 1.8.0 | 2026-09-04 | MIT | 1.0.0 = 2025-12-11; old `@base-ui-components/react` is deprecated ("renamed to @base-ui/react") [S31][S1] |
| **react-aria-components** (Adobe) | 1.21.1 | 2026-09-04 | Apache-2.0 | Monthly releases [S1] |
| **@headlessui/react** | 2.2.10 | 2026-04-07 | MIT | Slower cadence (2.2.9 = 2025-09-25) [S1] |
| **@ark-ui/react** | 5.39.2 | 2026-09-13 | MIT | [S1] |
| Icons | `lucide-react` 1.50.0 (2026-10-02) **ISC**; `@tabler/icons-react` 3.48.0 (2026-09-22) **MIT**; `@phosphor-icons/react` 2.1.10 (**2025-05-22**, no release in 16 months) **MIT** | | LICENSE files verified [S32] |

### D.2 Notes

- **Radix maintenance (FACT):** the release log shows ten months without a release (Aug 2025 → Jun 2026) followed by four releases in Jun–Jul 2026 [S30]. **OPINION:** usable, but the ecosystem centre of gravity moved — shadcn/ui defaulting to Base UI in July 2026 is the strongest signal. React Aria Components is the accessibility-first alternative with the most consistent cadence (Adobe).
- **Fonts / GDPR (FACT):** `next/font` self-hosts Google Fonts at build time; the browser never contacts Google [S6]. The German ruling usually cited (LG München I, 20 Jan 2022, 3 O 17493/20 — dynamic Google Fonts embedding = unlawful IP transfer) **could not be re-verified today** (court/GDPRhub sites blocked; from memory, re-verify in the legal stream). The `coollabsio/fonts` README independently describes the GDPR concern with Google's font CDN [S80].

### D.3 Recommendation (OPINION)

Tailwind 4.3 (`@theme` tokens in CSS, `@tailwindcss/postcss` for Next.js) + **shadcn/ui on Base UI (the current default)**, Lucide icons (ISC, actively released), `next/font` with a self-hosted variable font. **Runner-up:** React Aria Components if we hit accessibility gaps in Base UI (both are headless; shadcn copy-paste means swapping primitives per component is feasible). Avoid Phosphor (stale).

---

## E. Forms and validation (FACT)

| Tool | Latest | Published | Licence | Notes |
|---|---|---|---|---|
| **zod** | 4.6.5 | 2026-09-13 | MIT | 4.0.0 = 2025-07-09; 4.1 = 2025-08-23; **4.6.0 (2026-09-09)** adds `.validate()` (boolean check, "up to 35× faster than safeParse().success on compiled schemas"), `z.iban()` (MOD-97), `z.withParser()` (CSP-friendly, no `eval`), `z.instanceof().properties()`, broader `fromJSONSchema()`; 3.25.76 (2025-07-08) is the last v3 [S33]. `zod/v3` + `zod/mini` subpaths: from memory, re-verify. Peer-declared by Inngest, Trigger.dev and `@anthropic-ai/sdk` as `^3.25 ‖ ^4` [S1]. |
| **valibot** | 1.5.0 | 2026-09-09 | MIT | 1.0.0 = 2025-03-19 [S1] |
| **react-hook-form** | 7.89.0 | 2026-09-26 | MIT | 8.0.0-beta tags exist; `@hookform/resolvers` 5.9.1 [S1] |
| **@tanstack/react-form** | 1.33.5 | 2026-08-11 | MIT | 2.0.0-alpha tag exists [S1] |
| **@conform-to/react** / `@conform-to/zod` | 1.21.1 | 2026-08-18 | MIT | Progressive-enhancement forms for Server Actions [S1] |
| `next-safe-action` | 8.7.3 | 2026-09-07 | MIT | Typed Server Actions with Zod [S1] |

**Recommendation (OPINION):** Zod 4 as the single schema language (shared with the future Expo app and with Drizzle's `drizzle-orm/zod` in v1), **Conform + Server Actions** for mobile-first progressively-enhanced forms (works without JS on slow connections), React Hook Form only for highly interactive client-only forms. Runner-up: `next-safe-action` + RHF.

---

## F. i18n (FACT)

| Tool | Latest | Published | Licence | Notes |
|---|---|---|---|---|
| **next-intl** | 4.14.9 | 2026-10-02 | MIT | 4.0.0 = 2025-03-12; peers `next ^12…^16`; patch releases almost daily in Sept 2026 [S1] |
| **@inlang/paraglide-js** | 2.25.4 | 2026-09-17 | MIT | Compile-time messages, tree-shaken per locale [S1] |
| **@lingui/core** / `@lingui/react` | 6.9.0 | 2026-10-01 | MIT | 6.0.0 = 2026-04-22; node ≥22.19 [S1] |
| **i18next** / `react-i18next` | 26.4.2 / 17.0.15 | 2026-09-03 / 2026-09-21 | MIT | 26.0.0 = 2026-03-28; peers `typescript ^5‖^6‖^7` [S1] |

**Recommendation (OPINION):** **next-intl 4** — App Router/RSC-native, ICU MessageFormat (plurals/gender matter in Italian), locale routing (`/it` default without prefix, `/en`), typed message keys, and it is the only one that tracks every Next.js minor within days. Runner-up: Paraglide (best bundle size; pick it if we go React Router/SvelteKit).

---

## G. Transactional email

### G.1 Providers (EU residency is the question; facts are thin because vendor sites were blocked)

| Provider | SDK (npm) | EU data residency | Pricing | Evidence |
|---|---|---|---|---|
| **Scaleway Transactional Email (TEM)** | `@scaleway/sdk` 4.2.1 | FACT: "Transactional Email is only available in the `fr-par` region" | FACT: free tier **300 emails/month**; default quota 10,000/month (upgradable, "potentially … millions"); per-email price **NOT FOUND** in docs-content | [S58] |
| **Mailgun** | `mailgun.js` 14.0.1 (MIT) | FACT: EU infrastructure exists; SDK requires `url: 'https://api.eu.mailgun.net'` | NOT VERIFIED | [S62] |
| **Amazon SES** | `@aws-sdk/client-sesv2` 3.1145.0 (Apache-2.0) | eu-south-1 (Milan) availability **NOT VERIFIED** today (AWS docs blocked; from memory SES is in Milan — re-verify) | NOT VERIFIED | [S1] |
| **Brevo** (FR) | `@getbrevo/brevo` 6.0.3 | NOT VERIFIED (French company; `api.brevo.com`) | NOT VERIFIED | [S1] |
| **Mailjet** (Sinch, FR) | `node-mailjet` 6.0.11 | NOT VERIFIED | NOT VERIFIED | [S1] |
| **Postmark** | `postmark` 5.1.0 | NOT VERIFIED (US company, ActiveCampaign) | NOT VERIFIED | [S1] |
| **Resend** | `resend` 6.32.0 | EU region **NOT VERIFIED** (SDK hard-codes `api.resend.com`) | NOT VERIFIED | [S1] |
| **Nodemailer** (SMTP to any of the above) | 10.0.13 (MIT-0) | n/a | n/a | [S1] |

### G.2 Templates and local dev (FACT)

- `react-email` 6.11.0 (2026-09-23; 6.0.0 = 2026-04-16) and `@react-email/render` 2.1.0 are maintained; **`@react-email/components` 1.0.12, `@react-email/tailwind` and `@react-email/preview-server` are marked deprecated on npm** ("Package no longer supported") — check the react-email repo for the consolidated import path before adopting [S64][S1]. `jsx-email` 3.2.1 (2026-05-28, MIT) is the fork alternative.
- **MailDev 3.0.0** (2026-09-23, MIT) — `npm i -D maildev`, SMTP :1025 + web UI, pure Node, **no Docker needed** [S63]. **Mailpit** — Go, "runs entirely from a single static binary" (Docker optional); not on npm [S63].

**Recommendation (OPINION):** Abstract email behind one `EmailProvider` interface with a Nodemailer/SMTP transport. Dev: MailDev (npm). Prod: **Scaleway TEM (fr-par)** as the EU-native default (French provider, same vendor as object storage, free tier covers MVP) with **Mailgun EU** as runner-up (verified EU API host) — SES Milan if we end up on AWS. Keep templates in `react-email` only if the components package situation is clarified; otherwise MJML-free plain React + `@react-email/render`.

---

## H. Background jobs (FACT)

| Tool | Latest | Published | Licence | Engines | Notes |
|---|---|---|---|---|---|
| **pg-boss** | 12.35.1 | 2026-09-30 | MIT | node ≥22.12 | 12.0.0 = 2025-11-09 (11.0 = 2025-09-26). SKIP LOCKED + LISTEN/NOTIFY, cron/RRULE, deferral, priorities, dead-letter + redrive, retries w/ backoff, pub/sub, **create jobs inside an existing DB transaction with Drizzle/Knex/Kysely/Prisma adapters**, OpenTelemetry traces/metrics, multi-master, PGlite backend [S49] |
| **graphile-worker** | 0.18.0 | 2026-09-08 | MIT | node ≥22.18 | Crowd-funded; still 0.x [S50] |
| **bullmq** | 6.3.11 | 2026-10-01 | MIT | — | Requires Redis / Valkey / Dragonfly [S51] |
| **inngest** | 4.21.1 | 2026-10-01 | Apache-2.0 | node ≥20 | Hosted durable functions; EU region NOT VERIFIED (SDK references `inn.gs`) [S1] |
| **@trigger.dev/sdk** | 4.7.2 | 2026-10-02 | Apache-2.0 | node ≥18.20 | Self-hostable (docs); cloud EU region NOT VERIFIED [S1] |

**Recommendation (OPINION):** **pg-boss 12** — one less system (no Redis), transactional enqueue with Drizzle, cron built in, OTel out of the box; run the worker inside the same Node process in dev and as a second container/process in prod. Runner-up: Graphile Worker. BullMQ only if we add Redis for other reasons. Vercel Cron is irrelevant for self-hosting.

---

## I. Object storage, uploads, image safety

### I.1 EU object storage (facts where reachable)

| Provider | Regions (EU) | Pricing | Evidence |
|---|---|---|---|
| **Scaleway Object Storage** | FACT: `fr-par`, `nl-ams` endpoints (`s3.fr-par.scw.cloud`, `s3.nl-ams.scw.cloud`); `pl-waw` from memory, re-verify. Classes: Standard Multi-AZ, One Zone | FACT: 750 GB free for 90 days (new users); per-GB price **NOT FOUND** in docs-content | [S58] |
| **Cloudflare R2** | FACT: **Jurisdictional Restrictions** — `eu` jurisdiction endpoint `https://<account>.eu.r2.cloudflarestorage.com` "guarantee objects in a bucket are stored within a specific jurisdiction … GDPR"; location hints `weur`/`eeur` | FACT: Standard $0.015/GB-month; Class A $4.50/M, Class B $0.36/M; **egress free**; free tier 10 GB + 1 M A + 10 M B ops/month | [S57] |
| **Supabase Storage** | FACT: project region selectable (Frankfurt etc.) | FACT: Pro includes 100 GB then $0.0213/GB | [S61] |
| **Neon Object Storage** | FACT: `aws-eu-central-1` (Frankfurt) available | FACT: $0.023/GB-month (Launch/Scale), 5 GB free | [S60] |
| **AWS S3 eu-south-1 (Milan)** | region exists (from memory — SDK partition grep inconclusive today) | NOT VERIFIED | — |
| **Hetzner Object Storage** | NOT VERIFIED (hetzner.com blocked; from memory: fsn1/nbg1/hel1) | NOT VERIFIED | — |
| **OVHcloud** / **Backblaze EU** | NOT VERIFIED | NOT VERIFIED | — |

### I.2 Local S3-compatible dev without Docker (FACT)

- **MinIO:** repository README now reads "**THIS REPOSITORY IS NO LONGER MAINTAINED**"; the community edition "is now distributed as source code only … no longer provide pre-compiled binary releases"; AGPL-3.0; commercial "AIStor" [S52]. The `minio` npm **client** (8.0.7, Apache-2.0) is fine, the server is not a dev-dependency option any more.
- `s3rver` npm: 3.7.1 from 2021 — stale [S1].
- **OPINION:** implement a `StorageProvider` interface with (a) a **filesystem adapter** for dev/tests (serves files through a Next route handler; "signed URL" = HMAC-signed path with expiry) and (b) an S3-compatible adapter (`@aws-sdk/client-s3` 3.1145.0 + `@aws-sdk/s3-request-presigner`) for prod. This avoids any local S3 emulator.

### I.3 Image processing and file safety (FACT)

- **sharp** 0.35.5 (2026-09-27, Apache-2.0; node ≥20.9; libvips ≥8.18.7 bundled) [S67]. Re-encoding uploads through sharp and *not* calling `keepMetadata()`/`withMetadata()` strips EXIF/GPS (behaviour from sharp docs — docs page not fetched today; re-verify in code review). `exifreader` 4.46.0 (MPL-2.0) if we need to *read* EXIF first.
- **file-type** 22.1.1 (2026-09-17, MIT) — magic-byte MIME sniffing; **ESM-only**, node ≥22 [S66].
- **clamscan** 2.4.0 (MIT, last release 2024-10-21) wraps the ClamAV binary/daemon (TCP or socket) [S68]; ClamAV itself would run as a sidecar in prod; **not available in the dev container** → OPINION: scanning is a queued pg-boss job with a no-op adapter in dev.

---

## J. Hosting (EU) and managed Postgres

### J.1 What could be verified (FACT)

| Provider | Facts |
|---|---|
| **Fly.io** | Regions incl. `ams` Amsterdam, `arn` Stockholm, `cdg` Paris, `fra` Frankfurt, `lhr` London [S59]. **Managed Postgres (MPG)** plans: Basic Shared-2x 1 GB **$38.00/mo**, Starter 2 GB $72, Launch Performance-2x 8 GB $282, Scale $962, Performance $1,922; storage **$0.28/GB-month** (v2 clusters billed on usage); Volumes $0.15/GB-month; dedicated IPv4 **$2/mo**; egress Europe $0.02/GB. Machine (compute) price table **NOT FOUND** in the markdown (rendered component). Next.js has an official Fly deploy template [S5]. |
| **Neon** (serverless Postgres) | Regions: **AWS Europe (Frankfurt) `aws-eu-central-1`**, London; Azure regions deprecated. Plans: Free $0 (100 CU-hours/project, 1 GB/project); **Launch**: $0.106/CU-hour, $0.35/GB-month storage, 500 GB egress incl., no minimum fee; Scale $0.222/CU-hour, SOC2/ISO/GDPR/HIPAA, SLA. PostGIS supported [S60]. |
| **Supabase** | Specific regions incl. Frankfurt `eu-central-1`, Paris `eu-west-3`, Ireland, Zurich, Stockholm, London (docs warn the "Europe" *general* region may land in London/Zurich — pick a specific region for residency). **Pro from $25/mo** (8 GB disk incl. then $0.125/GB, 250 GB egress then $0.09/GB, 100 GB storage, 100k MAU); compute add-on prices not extracted. PostGIS supported [S61]. |
| **Scaleway** | Regions `fr-par`, `nl-ams` (+ `pl-waw` from memory). **No Italian region** (none documented). Managed Databases for PostgreSQL exist (HA, backups; concepts page lists PostgreSQL 9.6–15 — page likely stale, re-verify current versions); prices NOT FOUND in docs-content [S58]. |
| **Cloudflare** | R2 EU jurisdiction (see I) [S57]. |
| **Google Cloud** | Locations page reachable but region list not machine-readable; Milan (`europe-west8`) / Turin (`europe-west12`) are **from memory — re-verify** [S81]. |
| **Coolify** / **Dokploy** | Open-source self-hosted PaaS; Coolify deploys via Nixpacks/Railpack/Dockerfile/Compose over SSH, Dokploy uses Docker Swarm — both need Docker on the *server* only [S82]. |

### J.2 NOT VERIFIED today (sites blocked; do not quote numbers without re-checking)

Vercel (fra1 region, pricing, function limits), Railway (EU region/pricing — docs repo exists but the regions page path was not found), Render (Frankfurt), Hetzner Cloud (Falkenstein/Nuremberg/Helsinki prices), OVHcloud (Milan Local Zone?), Aruba Cloud (Arezzo), Seeweb, AWS eu-south-1 pricing / RDS Milan, Azure Italy North, Aiven, Crunchy Bridge, Xata, TigerData/Timescale.

### J.3 EU hosting cost estimate for the MVP (1 small app + 1 small Postgres + storage + email)

Legend: **F** = figure verified today; **E** = estimate from memory, re-verify before the ADR is signed.

| Setup | App compute | Postgres | Object storage | Email | Extras | **≈ €/month** |
|---|---|---|---|---|---|---|
| **1. Hetzner VPS + Coolify + self-managed PG16** (Falkenstein/Nuremberg) | 1× CX22-class VPS (2 vCPU/4 GB) **E ≈ €4–6** | same box, pg_dump to object storage (E €0) | Scaleway/Hetzner object storage ≤ 50 GB **E ≈ €1–5** | Scaleway TEM free tier (300/mo) **F €0**, then E | backups box/snapshots E €1–3, domain, Sentry free tier | **≈ €10–20** (lowest cost, highest ops burden) |
| **2. Fly.io (fra/ams) + Fly MPG Basic** | 1–2 shared-cpu Machines **E ≈ $5–15** | MPG Basic 1 GB **F $38** + storage F $0.28/GB | Cloudflare R2 EU jurisdiction ≤ 10 GB **F $0** (free tier), egress free | Mailgun EU / Scaleway TEM E €0–15 | IPv4 **F $2** | **≈ $50–75 (≈ €45–70)** |
| **3. Managed everything: Fly/Hetzner app + Neon Launch (Frankfurt) + R2** | as above E $5–15 | Neon Launch pay-as-you-go: e.g. 0.25 CU × 730 h ≈ 183 CU-h × **F $0.106** ≈ $19 + 5 GB × **F $0.35** ≈ $2 | R2 **F $0–2** | E €0–15 | — | **≈ $30–55 (≈ €28–50)**; scale-to-zero can make it lower |
| 3b. Supabase Pro (Frankfurt) as DB+storage+auth alternative | as above | **F $25/mo** base (8 GB disk, 100 GB storage incl.) | included | — | — | **≈ $30–45** (but couples us to Supabase Auth/Storage SDKs — OPINION: avoid for the auth part) |

**OPINION:** Pick **setup 2 or 3** for the MVP (managed Postgres with PITR is worth ~$20–40/month over a hand-rolled VPS database); keep the app a plain Docker image (`output: 'standalone'`) so moving to Hetzner + Coolify later is a config change, not a rewrite. Italian-region hosting (AWS Milan, Azure Italy North, GCP Milan/Turin, Aruba) is only needed if the legal stream requires *Italian* rather than EU residency — none was verifiable today.

---

## K. Observability and analytics (FACT unless marked)

| Tool | Latest | Published | Licence | EU | Notes |
|---|---|---|---|---|---|
| **Sentry** `@sentry/nextjs` / `@sentry/node` | 11.3.0 | 2026-10-02 | MIT | **FACT: EU data-storage location = Frankfurt, Germany**, chosen at org creation, cannot be changed later; errors/transactions/replays/logs stored in region, but user accounts, org settings, audit logs, integration metadata are stored in the US regardless | [S53]; 11.0.0 = 2026-09-23; v10/v9/v8/v7 maintenance tags exist [S1] |
| **OpenTelemetry** `@opentelemetry/sdk-node` / `api` / `auto-instrumentations-node` | 0.222.0 / 1.9.1 / 0.80.0 | 2026-08-31 / 2026-03-25 / 2026-08-31 | Apache-2.0 | n/a | `@vercel/otel` 2.1.3 (works outside Vercel) [S1] |
| **pino** / `pino-http` / `pino-pretty` | 10.3.1 / 11.0.0 / 13.1.3 | 2026-02-09 / 2025-10-04 / 2025-12-01 | MIT | n/a | `redact` option for PII paths (pino docs — not re-fetched today) [S1] |
| **Axiom** `@axiomhq/js` | (latest) | — | — | **FACT: SDK ships `https://api.eu.axiom.co`** endpoint | tarball grep [S79] |
| **Better Stack** `@logtail/pino` | 0.5.11 | 2026-09-30 | ISC | EU ingest **NOT VERIFIED** (SDK has no hard-coded host) | [S1] |
| **Grafana Cloud** | — | — | — | EU stacks **NOT VERIFIED** | — |
| **PostHog** `posthog-js` / `posthog-node` | 1.435.7 / 5.55.0 | 2026-10-02 / 2026-09-30 | Apache-2.0 AND MIT / MIT | **FACT: "PostHog Cloud EU … servers hosted in Frankfurt, ensuring user data never leaves EU jurisdiction"**; self-hostable | **FACT: `cookieless_mode: 'always' | 'on_reject'`** — "PostHog sets no cookies and uses no session or local storage, with user identity handled by a privacy-preserving hash generated on PostHog's servers"; also `persistence: 'memory'` and `posthog.set_config()` for consent switching [S54] |
| **Plausible** CE | — | — | **AGPL-3.0** | FACT: cloud "exclusively processed on EU-owned cloud infrastructure … server in Germany"; cookie-free; self-hostable | [S55] |
| **Umami** | — | — | MIT | FACT: "no cookies"; self-host needs Node ≥18.18 + Postgres; Docker images optional | [S56] |
| Uptime / health checks | NOT RESEARCHED (budget) | | | | OPINION: `/healthz` route + any external pinger (Better Stack Uptime, Uptime Kuma self-hosted) |

**Recommendation (OPINION):** Sentry (EU org) for errors + tracing via the Next.js SDK, OTel SDK with pino logs (redaction on `req.headers.authorization`, emails, phone numbers) shipped to Axiom EU or Grafana Cloud EU (verify), **PostHog EU with `cookieless_mode: 'on_reject'`** for product analytics in the app, **Plausible** (or Umami self-hosted) for the marketing site. Runner-up for logs: Better Stack (verify EU ingest host first).

---

## L. Testing (FACT)

| Tool | Latest | Published | Licence | Engines | Notes |
|---|---|---|---|---|---|
| **vitest** | 5.0.3 | 2026-09-30 | MIT | node ^22.12 ‖ ^24 ‖ ≥26; vite ^6.4 ‖ ^7 ‖ ^8 | 5.0.0 = 2026-09-03: mocks cleared by default before each test, **un-awaited async assertions fail the test**, `sequential` option removed (use `concurrent`), attachments dir `.vitest/attachments/`, `expect`/`@vitest/runner` inlined, nested projects, browser-mode improvements; 4.0 = 2025-10-22 [S42] |
| **@playwright/test** | 1.63.0 | 2026-09-04 | Apache-2.0 | node ≥20 | 1.63: named **test locks** (`{ lock: 'user-settings' }`), `page.frameLocator()` across frames, `locator.visible()`, step `subtitle/params`, aria/screen snapshots in traces. **1.62 changed component testing** to a "stories and galleries" model with a `mount(storyId)` fixture; `@playwright/experimental-ct-react` is still at 1.62.1 (no 1.63 yet) [S41][S1] |
| **@testing-library/react** | 16.3.3 | 2026-08-27 | MIT | — | [S1] |
| **msw** | 3.0.1 | 2026-09-30 | MIT | node ≥22.12; typescript ≥5.9 | **3.0.0 = 2026-09-28: ESM-only**, `defineNetwork()` API, `onUnhandledRequest` → `onUnhandledFrame`, GraphQL moved to `msw/graphql`, no `setTimeout` patching [S43] |
| **fast-check** | 4.10.2 | 2026-09-19 | MIT | — | property-based testing [S1] |
| **@axe-core/playwright** | 4.13.0 | 2026-08-11 | MPL-2.0 | — | version tracks axe-core 4.13.x [S44] |
| **@databases/pg-test** | 4.0.0 | 2026-07-06 | MIT | — | docs site blocked; README points to atdatabases.org [S83] |
| **pg-mem** | 3.0.14 | 2026-02-26 | MIT | — | "experimental in-memory emulation of a postgres database … No native extension is implemented" (no PostGIS, mock `uuid-ossp`) [S45] |
| **@electric-sql/pglite** | 0.5.8 | 2026-08-26 | Apache-2.0 | — | real Postgres (WASM) in-process incl. PostGIS/pgvector — strongest no-Docker option for fast DB tests [S47] |
| **IntegreSQL** | (Go service) | — | MIT | — | template-database pool pattern: migrate once into a template, clone per test [S46] |
| **@testcontainers/postgresql** | 12.2.0 | 2026-09-28 | MIT | — | **needs a Docker daemon — not usable in this container** [S1] |
| **@lhci/cli** (Lighthouse CI) | 0.15.1 | **2025-06-25** | Apache-2.0 | — | slow cadence; `lighthouse` itself 13.5.0 (2026-09-18) [S48][S1] |
| **storybook** / `@storybook/nextjs-vite` | 10.6.1 | 2026-09-29 | MIT | — | 10.0.0 = 2025-10-28: **ESM-only**, module automocking, Vitest addon, "Next 16, Vitest 4" support; 11.0.0-alpha exists [S40] |
| GitHub Actions Postgres | — | — | — | — | FACT: official docs show a `services: postgres: image: postgres` service container with health checks [S70] |

**Recommendation (OPINION):** Vitest 5 (unit + component via RTL), **real PostgreSQL 16 for integration tests** using the IntegreSQL *pattern* implemented in ~50 lines (run migrations into a `template` DB once per run; `CREATE DATABASE test_<n> TEMPLATE …` per worker; drop after) — proposed for local development and CI; not executed in the current checkout at research time; PGlite as the fast lane for pure-SQL unit tests. Playwright 1.63 for E2E with `@axe-core/playwright` on every public page; Lighthouse CI budgets (mobile preset) on the public routes; **Playwright screenshots over Storybook** for visual QA at MVP (Storybook 10 is excellent but another ESM-only toolchain to maintain). Avoid pg-mem for anything touching Postgres-specific SQL.

---

## M. Tooling (FACT)

| Tool | Latest | Published | Licence | Notes |
|---|---|---|---|---|
| **typescript** | 7.0.2 | 2026-07-08 | Apache-2.0 | Native (Go) compiler; see A.1 |
| **typescript-eslint** | 8.71.0 | 2026-09-28 | MIT | **peer `typescript >=4.8.4 <6.1.0`** — i.e. TS 7 is *outside the declared range* today (pnpm will warn; may still work). Also SvelteKit 3 peers `typescript ^6.0.0`, i18next peers `^5‖^6‖^7`, `@prisma/client` `>=5.4` [S1] |
| **eslint** | 10.11.0 | 2026-09-18 | MIT | 10.0.0 = 2026-02-06: requires Node `^20.19 ‖ ^22.13 ‖ ≥24`, jiti ≥2.2, deprecated `LintMessage#nodeType` removed; flat config only; 9.39.5 maintenance (2026-07-10) [S37] |
| **@biomejs/biome** | 2.5.15 | 2026-09-30 | MIT OR Apache-2.0 | 2.0 = 2025-06-17; 2.5.0 = 2026-06-12 (HTML/Vue/Svelte/Astro a11y rules, `concise` reporter, LSP go-to-definition, GritQL rewrites). Formatter + linter in one binary [S38] |
| **oxlint** | 1.86.0 | 2026-09-28 | MIT | [S1] |
| **prettier** | 3.9.9 | 2026-09-23 | MIT | 4.0.0-alpha.13 on `next` [S39] |
| **husky** | 9.1.7 | **2024-11-18** | MIT | no release in ~23 months [S1] |
| **lefthook** | 2.1.16 | 2026-10-01 | MIT | 2.0.0 = 2025-10-20 [S1] |
| **@changesets/cli** | 3.0.3 | 2026-09-14 | MIT | 3.0.0 = 2026-08-11; node ^22.11 ‖ ^24 ‖ ≥26; pnpm ≥10 [S1] |
| **turbo** | 2.11.7 | 2026-10-02 | MIT | README now: "Turborepo is the build system for coding agents" [S1] |
| **nx** | 23.2.1 | 2026-09-09 | MIT | [S1] |
| **renovate** | 44.132.2 | 2026-10-02 | **AGPL-3.0-only** | hosted Mend app is free for GitHub; Dependabot is GitHub-native [S1] |
| **Node.js** | 22.22 in container | — | — | **FACT [S34]:** v22 "Jod" LTS → maintenance 2025-10-21, **EOL 2027-04-30**; v24 "Krypton" LTS since 2025-10-28, maintenance 2026-10-20, EOL 2028-04-30; **v26 enters LTS on 2026-10-28** (EOL 2029-04-30); v25 EOL 2026-06-01. |

**Recommendation (OPINION):** TypeScript **7.0** (10× faster type-check; but keep `typescript-eslint` pinned and verify it passes, or use **Biome 2.5** as the single linter+formatter and drop ESLint/Prettier entirely — Biome's remaining gap is type-aware rules; if we need `@typescript-eslint` type-aware rules, run ESLint 10 flat config + Prettier and accept the peer warning). pnpm workspaces (`apps/web`, `packages/{db,domain,email,ui,config}`) **without Turborepo** at first (single deployable; add `turbo` when CI time hurts). lefthook over husky (husky is dormant). Changesets only if `packages/*` are published — otherwise skip. Renovate (grouped weekly PRs) over Dependabot. GitHub Actions with the Postgres service container. Target **Node 22 now, move to Node 24 LTS before 2027-04** (React Router 8 already requires 22.22; Vitest 5/MSW 3/pg-boss require ≥22.12).

---

## N. Security libraries and CI checks (FACT unless marked)

- **Next.js built-ins** [S6]: CSP with per-request nonce in `proxy.ts` (`'nonce-…' 'strict-dynamic'`, `'unsafe-eval'` only in dev); Server Actions Origin/Host check (`serverActions.allowedOrigins` behind a reverse proxy/CDN), 1 MB body limit, encrypted action IDs, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` for multi-instance; 16.3.8 patched image-optimiser SSRF and cache poisoning — keep Next on the latest patch.
- **Rate limiting:** `rate-limiter-flexible` 11.2.1 (2026-09-17, ISC) — "works with Valkey, Redis, Prisma, DynamoDB, process Memory, Cluster or PM2, Memcached, MongoDB, MySQL, SQLite, and **PostgreSQL**", plus a **Drizzle** wiki page; in-memory block strategy for DoS bursts [S65]. `@upstash/ratelimit` 2.2.0 needs Redis. Better Auth has its own DB-backed limiter for auth routes (C.2).
- **Uploads:** `file-type` 22.1.1 (ESM-only) for sniffing; `sharp` re-encode; ClamAV via `clamscan` 2.4.0 as an async job (I.3).
- **Passwords (if ever):** `argon2` 0.45.1 (MIT, native), `@node-rs/argon2` 2.2.1 (MIT, prebuilt N-API), `bcrypt` 6.0.0 (MIT, 2025-05-11) [S1]. OPINION: OTP/magic-link/passkeys first ⇒ no password column at MVP.
- **Supply chain / secrets in CI:** `gitleaks` (MIT) [S69], `osv-scanner` (Apache-2.0, also `--licenses` scanning) [S69], Semgrep CLI (LGPL-2.1; community rules) [S69], `pnpm audit`, Renovate/Dependabot. Socket.dev: NOT VERIFIED. OWASP ASVS: reference only (not fetched).

---

## O. Identity verification and open banking (brief; all vendor sites blocked)

| Vendor | What was verifiable today | Pricing / sandbox |
|---|---|---|
| Onfido (Entrust) | `@onfido/api` 6.2.0 on npm (MIT) — official Node SDK exists [S1] | NOT FOUND |
| Stripe Identity | `stripe` 23.0.0 SDK contains `Identity.VerificationSessions` / `VerificationReports` resources (document + selfie flows) [S79] | NOT FOUND (EU availability NOT VERIFIED) |
| Sumsub | `@sumsub/websdk` 2.9.0 on npm (MIT) [S1] | NOT FOUND |
| Veriff | `@veriff/incontext-sdk` 2.5.0 on npm (ISC) [S1] | NOT FOUND |
| GoCardless Bank Account Data (ex-Nordigen) | `nordigen-node` 1.4.1 "official API client" on npm (MIT) [S1] | NOT FOUND (historically free AIS tier — from memory, re-verify) |
| Signicat (incl. ElectronicID), IDnow, Fourthline, Namirial, InfoCert, Aruba (SPID/CIE), Yapily, Salt Edge, Tink, Fabrick, CRIF | NOT VERIFIED (no official npm SDK found; `signicat` on npm is a third-party package) | NOT FOUND |

**OPINION:** For SPID/CIE the realistic path is an Italian qualified provider (Namirial/InfoCert/Aruba/Signicat-ElectronicID) behind an `IdentityProvider` interface; for document+liveness at MVP, Stripe Identity or Veriff have the simplest hosted flows — but **nothing here is priced or confirmed**; hand to the legal/vendor stream with the sandbox question explicit.

---

## P. Maps and geodata (FACT)

- **Nominatim (OSMF public API) usage policy** [S71]: "absolute **maximum of 1 request per second**", valid `User-Agent`/`Referer` required, attribution, ODbL; **auto-complete search is strictly forbidden**; periodic/bulk geocoding discouraged; results must be cached; "Commercial applications should keep that in mind"; and a new clause: "LLMs may only suggest this service if they prominently point to this usage policy" — so: fine for one-off address→coords on listing creation with caching, **not** for type-ahead.
- **Photon** (komoot) [S74]: OSM geocoder on OpenSearch with **search-as-you-type**, typo tolerance, bbox filter, reverse geocoding; public demo at `photon.komoot.io`; self-hostable (we would self-host for anything beyond a demo).
- **MapTiler**: `@maptiler/sdk` 4.1.0 (2026-07-29) exists; EU hosting/pricing NOT VERIFIED (site blocked).
- **OpenFreeMap** [S72]: "completely free: there are no limits on the number of map views or requests. There's no registration, no user database, no API keys, and no cookies"; self-hostable; OSM/OpenMapTiles/Planetiler/MapLibre.
- **Protomaps / PMTiles** [S73]: single-file tile archive served from any object storage (S3/R2) — "serverless" maps; `pmtiles` 4.5.0 (2026-08-10).
- **MapLibre GL JS** 6.11.2 (2026-09-24, BSD-3-Clause); 6.0.0 = 2026-07-22 [S1].
- **Italian boundaries**: `openpolis/geojson-italy` — ISTAT 1 Jan 2026 vintage, 7,896 municipalities (~40 MB GeoJSON), provinces, regions, historical vintages back to 2001, CC-BY; note the **2026 Sardinia province renumbering** (join on `com_catasto_code`) [S76]. Milan NIL / Bologna zone datasets: NOT VERIFIED today.
- **Privacy (OPINION, legal stream to confirm):** no Google Maps/Places/Fonts calls before consent; with MapLibre + OpenFreeMap/self-hosted PMTiles on our own domain, map tiles never leak IPs to a US provider.

**Recommendation (OPINION):** MapLibre GL + PMTiles (Italy extract) hosted on our EU object storage (or OpenFreeMap public instance as the zero-cost start), Photon self-hosted for type-ahead address search (Italy-only index is small), Nominatim public API only for low-volume server-side geocoding with caching, ISTAT comuni polygons via geojson-italy pre-processed into the zone table.

---

## Q. AI (post-MVP) — Claude facts (FACT, platform.claude.com, page undated, accessed 2026-10-02 [S77])

| Model | ID | Input / Output per MTok | Batch (−50 %) |
|---|---|---|---|
| Claude Opus 5.5 | `claude-opus-5-5` | $4 / $20 (cache read $0.20) | $2 / $10 |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | $2 / $10 | $1 / $5 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | $1 / $5 | $0.50 / $2.50 |
| Claude Fable 5.1 | `claude-fable-5-1` | $10 / $50 (cache read $0.25) | $5 / $25 |

- SDK: `@anthropic-ai/sdk` 0.131.0 (2026-09-30, MIT; peer zod ^3.25 ‖ ^4).
- **Data residency:** `inference_geo` accepts only `"global"` (default) or `"us"` (+10 % price); **there is no EU inference geo**, and workspace geo (data at rest) is currently `"us"` only [S77]. EU-regional inference is available only via **Amazon Bedrock / Google Cloud regional endpoints** (10 % premium over global) [S77]. OPINION: for listing-description assistance (no special-category data) send only the user's own draft text, no identifiers, via the first-party API or Bedrock `eu-*`; defer until the legal stream signs off.

---

## R. Recommended default stack (draft for the ADR)

Everything in this section is **OPINION** built on the facts above; each row names the runner-up and the reason.

| Layer | Default | Runner-up | Why |
|---|---|---|---|
| Framework | **Next.js 16.3 (App Router, Turbopack, `output: 'standalone'`, `proxy.ts`, Cache Components *off* at MVP)** | React Router 8 | Ecosystem gravity (Better Auth, next-intl, shadcn, Sentry, OTel treat it as tier-1) + official Docker self-hosting; RR8 wins on lock-in/simplicity |
| Language/runtime | **TypeScript 7.0, Node 22 → 24 by 2027-04**, pnpm 10 workspaces, ESM-only | — | TS7 native compiler; Node 22 EOL 2027-04-30 |
| Data | **PostgreSQL 16, Drizzle 0.45 + drizzle-kit, `pg` driver**; zone-ID model first, PostGIS later via custom migration | Kysely | No binaries, readable SQL migrations, RLS/PostGIS documented; Prisma is mid-7→8 RC transition |
| Auth | **Better Auth 1.7.7+** (email OTP primary, magic link, passkeys, optional TOTP; organization plugin for agencies), DB sessions | Auth.js v5 beta | Auth.js itself recommends Better Auth; Lucia deprecated; keeps identity data in our EU Postgres |
| UI | **Tailwind 4.3 + shadcn/ui on Base UI + Lucide + `next/font` self-hosted** | React Aria Components | shadcn made Base UI the default in Jul 2026; Radix had a 10-month release gap |
| Forms/validation | **Zod 4.6 + Conform (Server Actions)** | RHF + next-safe-action | Progressive enhancement for mobile; one schema language shared with native app |
| i18n | **next-intl 4.14** (it default, en) | Paraglide | RSC-native, ICU, tracks every Next minor |
| Email | **SMTP abstraction; MailDev in dev; Scaleway TEM (fr-par) in prod** | Mailgun EU | EU-native, free tier; templates via `@react-email/render` (verify components package) |
| Jobs | **pg-boss 12** in-process worker (separate process in prod) | Graphile Worker | No Redis; transactional enqueue; cron; OTel |
| Storage | **`StorageProvider` interface: filesystem (dev/test) / S3-compatible (prod) — Cloudflare R2 `eu` jurisdiction or Scaleway fr-par**; sharp re-encode + EXIF strip; file-type sniff; ClamAV as async job | Hetzner/OVH object storage (unverified) | MinIO server is unmaintained; R2 has a documented EU jurisdiction + free egress |
| Hosting | **Docker image on Fly.io `fra`/`ams` or Hetzner+Coolify; Neon Launch (Frankfurt) or Fly MPG for Postgres** | Supabase Pro (Frankfurt) | Verified EU regions and prices; app stays portable |
| Observability | **Sentry (EU org) + OTel/pino → Axiom EU; PostHog EU cookieless; Plausible for marketing** | Better Stack / Grafana EU (verify) | Verified EU storage locations |
| Testing | **Vitest 5, RTL, MSW 3, fast-check; real PG16 template-DB pattern (+PGlite); Playwright 1.63 + axe; Lighthouse CI budgets; Playwright screenshots** | Storybook 10 | Proposed target; current checkout had no scripts at research time |
| Tooling | **Biome 2.5 (lint+format)** or ESLint 10 + Prettier if type-aware rules are required; lefthook; Renovate; GH Actions with Postgres service | Turborepo (later) | Single binary, fast; husky dormant |
| Security | Next CSP nonces (`proxy.ts`), Server-Action origin check, rate-limiter-flexible (Postgres), gitleaks + osv-scanner + Semgrep in CI | — | All verified built-ins/libs |

**Proposed startup sequence:** verify PostgreSQL readiness, run migrations to completion, then start the app and any required workers. Never race migrations with dependent services. The final ADR and tested repository scripts supersede this candidate stack.

---

## S. Top facts that changed vs. common 2024 knowledge (FACT)

1. **Next.js 16** (Oct 2025): Turbopack default for dev+build, `middleware`→`proxy`, explicit `'use cache'`/Cache Components, `revalidateTag` signature change, sync request APIs removed; 16.3.8 is a security release.
2. **Auth.js joined Better Auth** (notice Sept 2025); next-auth v5 is still `5.0.0-beta.32`; **Lucia, Arctic and Oslo are deprecated** on npm (Lucia deprecated March 2025).
3. **Zod 4** (Jul 2025) and **Tailwind 4** (Jan 2025) are the baselines; Tailwind is at 4.3, Zod at 4.6 with `.validate()`/`withParser()`.
4. **TypeScript 7 is the Go-native compiler** (Jul 2026); typescript-eslint's peer range still stops at `<6.1`.
5. **shadcn/ui defaults to Base UI (Jul 2026)**; Radix is opt-in; Radix had a 10-month release gap.
6. **Prisma's `latest` npm tag is the 8.0.0 RC**; Drizzle 1.0 is still RC (0.45 stable).
7. **Vite 8 = Rolldown**; Vitest 5, MSW 3, React Router 8, Storybook 10, ESLint 10 are all **ESM-only and/or Node ≥22** — Node 18/20 are gone from the toolchain.
8. **MinIO community repo is unmaintained** (source-only); use a filesystem adapter locally.
9. **React 19.3** (Sept 2026) with View Transitions; SvelteKit 3 shipped on 2026-10-01 (TS 6 minimum).
10. **Claude API has no EU inference geo** (only `us`/`global`); EU regional inference is via Bedrock/Vertex only.

---

## SOURCES

Access date for all: **2026-10-02**. "GH raw" = `raw.githubusercontent.com` file read in full; "GH page" = github.com HTML page summarised; "npm" = registry JSON document.

- [S1] npm registry (npm, Inc.), per-package metadata documents at `https://registry.npmjs.org/<package>` — versions, publish timestamps, licence, engines, peerDependencies, deprecation flags — read for: next, react, react-dom, react-router, @react-router/dev, @sveltejs/kit, svelte, nuxt, astro, @tanstack/react-start, @tanstack/react-router, vite, hono, @hono/node-server, drizzle-orm, drizzle-kit, prisma, @prisma/client, @prisma/adapter-pg, kysely, postgres, pg, next-auth, @auth/core, @auth/drizzle-adapter, better-auth, @better-auth/passkey, lucia, arctic, @oslojs/crypto, @clerk/nextjs, @workos-inc/node, @workos-inc/authkit-nextjs, @supabase/supabase-js, @supabase/ssr, @simplewebauthn/server, tailwindcss, @tailwindcss/postcss, @tailwindcss/vite, shadcn, radix-ui, @radix-ui/react-dialog, @base-ui/react, @base-ui-components/react, react-aria-components, @headlessui/react, @ark-ui/react, lucide-react, @phosphor-icons/react, @tabler/icons-react, zod, valibot, react-hook-form, @hookform/resolvers, @tanstack/react-form, @conform-to/react, @conform-to/zod, next-safe-action, next-intl, @inlang/paraglide-js, @lingui/core, @lingui/react, i18next, react-i18next, resend, postmark, @getbrevo/brevo, mailgun.js, @aws-sdk/client-sesv2, node-mailjet, react-email, @react-email/components, @react-email/render, @react-email/tailwind, @react-email/preview-server, jsx-email, maildev, nodemailer, pg-boss, graphile-worker, bullmq, inngest, @trigger.dev/sdk, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, minio, sharp, file-type, exifreader, clamscan, vitest, @playwright/test, playwright, @playwright/experimental-ct-react, @testing-library/react, msw, fast-check, @databases/pg-test, pg-mem, @electric-sql/pglite, @testcontainers/postgresql, @lhci/cli, lighthouse, storybook, @storybook/nextjs-vite, typescript, eslint, typescript-eslint, @biomejs/biome, oxlint, prettier, husky, lefthook, @changesets/cli, turbo, nx, renovate, rate-limiter-flexible, @upstash/ratelimit, bcrypt, argon2, @node-rs/argon2, @sentry/nextjs, @sentry/node, @opentelemetry/sdk-node, @opentelemetry/api, @opentelemetry/auto-instrumentations-node, @vercel/otel, pino, pino-http, pino-pretty, @logtail/pino, posthog-js, posthog-node, @axe-core/playwright, maplibre-gl, @maptiler/sdk, pmtiles, @anthropic-ai/sdk, @scaleway/sdk, @onfido/api, stripe, @sumsub/websdk, @veriff/incontext-sdk, nordigen-node, signicat, s3rver, @t3-oss/env-nextjs, nuqs, tsx, dotenv, cross-env. (n.d.; live registry.)
- [S2] npm registry — `react` document (see S1).
- [S3] GitHub page: `https://github.com/vercel/next.js/releases` — Vercel; releases v16.3.8 (2026-09-30), v15.5.27, v16.4.0-canary.*; security advisories summary.
- [S4] GH raw: `https://raw.githubusercontent.com/vercel/next.js/canary/docs/01-app/02-guides/upgrading/version-16.mdx` — Vercel, Next.js docs "Upgrading: Version 16" (n.d.).
- [S5] GH raw: `https://raw.githubusercontent.com/vercel/next.js/canary/docs/01-app/02-guides/self-hosting.mdx` — Vercel (n.d.); plus `docs/01-app/01-getting-started/17-deploying.mdx` via Context7.
- [S6] Next.js docs via Context7 (`/vercel/next.js`), underlying files: `docs/01-app/02-guides/content-security-policy.mdx`, `docs/01-app/02-guides/server-actions.mdx`, `docs/01-app/02-guides/data-security.mdx`, `docs/01-app/02-guides/migrating-to-cache-components.mdx`, `docs/01-app/02-guides/instant-navigation.mdx`, `docs/01-app/01-getting-started/13-fonts.mdx`, `docs/01-app/03-api-reference/02-components/font.mdx`, `packages/next/src/server/config-shared.ts` — Vercel (n.d.).
- [S7] GH raw: `https://raw.githubusercontent.com/facebook/react/main/CHANGELOG.md` — Meta; "19.3.0 (September 9, 2026)".
- [S8] GH raw: `https://raw.githubusercontent.com/remix-run/react-router/main/CHANGELOG.md` — Remix/Shopify; "v8.0.0 Date: 2026-06-17", v8.4.0; and GH page `https://github.com/remix-run/react-router/releases/latest`.
- [S9] GH raw: `https://raw.githubusercontent.com/sveltejs/kit/main/packages/kit/CHANGELOG.md` — Svelte team; "3.0.0 Major Changes".
- [S10] GH raw: `https://raw.githubusercontent.com/withastro/astro/main/packages/astro/CHANGELOG.md` — Astro; 7.0.0 major changes, 7.3.5.
- [S11] GH raw: `https://raw.githubusercontent.com/TanStack/router/main/docs/start/framework/react/overview.md` — TanStack; "Release Candidate" note (n.d.).
- [S12] GH raw: `https://raw.githubusercontent.com/vitejs/vite/main/packages/vite/CHANGELOG.md` — Vite team; "8.0.0 (2026-03-12) … the epic rolldown-vite merge".
- [S13] GH raw: `https://raw.githubusercontent.com/honojs/hono/main/README.md` — Hono (n.d.).
- [S14] GH page: `https://github.com/drizzle-team/drizzle-orm/releases` — Drizzle Team; 0.45.3, drizzle-kit@0.31.11, v1.0.0-rc.1–rc.4 dates.
- [S15] GH raw: `https://raw.githubusercontent.com/drizzle-team/drizzle-orm-docs/main/src/content/docs/pg/rls.mdx` — Drizzle docs "Row-Level Security" (n.d.).
- [S16] GH raw: `https://raw.githubusercontent.com/drizzle-team/drizzle-orm-docs/main/src/content/docs/pg/v0-v1-changes.mdx` — Drizzle docs "Changes in v1" (n.d.).
- [S17] GH raw: `https://raw.githubusercontent.com/drizzle-team/drizzle-orm-docs/main/src/content/docs/guides/postgis-geometry-point.mdx` — Drizzle docs (n.d.).
- [S18] GH raw: `https://raw.githubusercontent.com/prisma/prisma/main/README.md` — Prisma; "Prisma 8 is a release candidate…" (n.d.).
- [S19] GH page: `https://github.com/prisma/prisma/releases` — Prisma; 8.0.0-rc.* and 7.10.0 release notes.
- [S20] Prisma docs via Context7 (`/prisma/web`): `apps/docs/content/docs/guides/upgrade-prisma-orm/v7.mdx`, `apps/site/content/changelog/2025-11-19.mdx`, `apps/docs/content/docs/postgres/database/switch-from-accelerate.mdx` — Prisma (dated 2025-11-19 changelog).
- [S21] GH raw: `https://raw.githubusercontent.com/kysely-org/kysely/master/README.md` — Kysely (n.d.).
- [S22] GH raw: `https://raw.githubusercontent.com/nextauthjs/next-auth/main/README.md` — Auth.js; "Auth js is now part of Better Auth…" (n.d.).
- [S23] GH page: `https://github.com/nextauthjs/next-auth/commits/main/README.md` — commits "docs: add notice", "docs: add better-auth migration guide" dated 2025-09-26.
- [S24] GH raw: `https://raw.githubusercontent.com/nextauthjs/next-auth/main/packages/next-auth/package.json` — version `5.0.0-beta.32`.
- [S25] GH page: `https://github.com/better-auth/better-auth/releases` — Better Auth; v1.7.1–v1.7.7 notes.
- [S26] Better Auth docs via Context7 (`/better-auth/better-auth`): `docs/content/docs/plugins/magic-link.mdx`, `email-otp.mdx`, `2fa.mdx`, `docs/content/docs/concepts/plugins.mdx`, `packages/passkey/README.md` (n.d.).
- [S27] GH page: `https://github.com/lucia-auth/lucia` — "Lucia was deprecated on March 2025…"; GH raw `…/lucia-auth/lucia/v3/README.md`; npm deprecation message for `lucia`.
- [S28] GH raw: `https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/CHANGELOG.md` — Tailwind Labs; [4.3.3] 2026-07-16 … [4.2.0] 2026-02-18; and GH page `https://github.com/tailwindlabs/tailwindcss/releases`.
- [S29] shadcn/ui docs via Context7 (`/shadcn-ui/ui`): `apps/v4/content/docs/changelog/2026-01-base-ui.mdx`, `2026-03-cli-v4.mdx`, `2026-07-base-ui-default.mdx`, `skills/shadcn/rules/base-vs-radix.md` — shadcn (dated by filename).
- [S30] GH raw: `https://raw.githubusercontent.com/radix-ui/website/main/data/primitives/docs/overview/releases.mdx` — WorkOS/Radix; entries July 20, July 6, June 30, June 6 2026, August 13 2025.
- [S31] GH raw: `https://raw.githubusercontent.com/mui/base-ui/master/CHANGELOG.md` — MUI; v1.8.0 … v1.0.0.
- [S32] GH raw LICENSE files: `lucide-icons/lucide/main/LICENSE` (ISC), `phosphor-icons/core/main/LICENSE` (MIT), `tabler/tabler-icons/main/LICENSE` (MIT).
- [S33] GH page: `https://github.com/colinhacks/zod/releases` — Zod; v4.6.0 (2026-09-09) notes, v4.6.5.
- [S34] GH raw: `https://raw.githubusercontent.com/nodejs/Release/main/schedule.json` — Node.js Release WG; v22/v24/v25/v26/v27 dates.
- [S35] GH raw: `https://raw.githubusercontent.com/microsoft/typescript-go/main/README.md` — Microsoft; "This Repo Is Closed … TypeScript 7.0 release … native port … completed".
- [S36] GH page: `https://github.com/microsoft/TypeScript/releases` — Microsoft; TypeScript 7.0.2, 6.0.3, 6.0.
- [S37] GH raw: `https://raw.githubusercontent.com/eslint/eslint/main/CHANGELOG.md` — ESLint; v10.11.0 (2026-09-18), v10.0.0 breaking changes.
- [S38] GH raw: `https://raw.githubusercontent.com/biomejs/biome/main/packages/%40biomejs/biome/CHANGELOG.md` — Biome; 2.5.15, 2.5.0 notes.
- [S39] GH raw: `https://raw.githubusercontent.com/prettier/prettier/main/CHANGELOG.md` — Prettier; 3.9.9.
- [S40] GH raw: `https://raw.githubusercontent.com/storybookjs/storybook/next/CHANGELOG.md` — Storybook; 10.6.1, "10.0.0 … ESM-only".
- [S41] GH raw: `https://raw.githubusercontent.com/microsoft/playwright/main/docs/src/release-notes-js.md` — Microsoft; Version 1.63, 1.62 ("New component testing model").
- [S42] GH page: `https://github.com/vitest-dev/vitest/releases` — Vitest; v5.0.0–v5.0.3 notes.
- [S43] GH page: `https://github.com/mswjs/msw/releases` — MSW; v3.0.0 (2026-09-28) breaking changes, v3.0.1.
- [S44] GH raw: `https://raw.githubusercontent.com/dequelabs/axe-core-npm/develop/packages/playwright/README.md` — Deque (n.d.).
- [S45] GH raw: `https://raw.githubusercontent.com/oguimbal/pg-mem/master/readme.md` — pg-mem (n.d.).
- [S46] GH raw: `https://raw.githubusercontent.com/allaboutapps/integresql/master/README.md` — allaboutapps (n.d.).
- [S47] GH raw: `https://raw.githubusercontent.com/electric-sql/pglite/main/README.md` — ElectricSQL (n.d.).
- [S48] GH raw: `https://raw.githubusercontent.com/GoogleChrome/lighthouse-ci/main/README.md` — Google (n.d.).
- [S49] GH raw: `https://raw.githubusercontent.com/timgit/pg-boss/master/README.md` — pg-boss (n.d.).
- [S50] GH raw: `https://raw.githubusercontent.com/graphile/worker/main/README.md` — Graphile (n.d.).
- [S51] GH raw: `https://raw.githubusercontent.com/taskforcesh/bullmq/master/README.md` — Taskforce.sh (n.d.).
- [S52] GH raw: `https://raw.githubusercontent.com/minio/minio/master/README.md` — MinIO; "THIS REPOSITORY IS NO LONGER MAINTAINED" (n.d.).
- [S53] GH raw: `https://raw.githubusercontent.com/getsentry/sentry-docs/master/docs/organization/data-storage-location/index.mdx` — Sentry; "Data Storage Location (US or EU)" (n.d.).
- [S54] GH raw: PostHog docs `https://raw.githubusercontent.com/PostHog/posthog.com/master/contents/docs/privacy/index.mdx`, `…/contents/docs/privacy/gdpr-compliance.md`, `…/contents/docs/libraries/js/config.mdx` (`cookieless_mode`), `…/contents/docs/libraries/js/persistence.mdx` — PostHog (n.d.).
- [S55] GH raw: `https://raw.githubusercontent.com/plausible/analytics/master/README.md` — Plausible (n.d.).
- [S56] GH raw: `https://raw.githubusercontent.com/umami-software/umami/master/README.md` and `LICENSE` — Umami (n.d.).
- [S57] GH raw: Cloudflare docs `https://raw.githubusercontent.com/cloudflare/cloudflare-docs/production/src/content/docs/r2/reference/data-location.mdx` and `…/r2/pricing.mdx` — Cloudflare (n.d.).
- [S58] GH raw: Scaleway docs-content `https://raw.githubusercontent.com/scaleway/docs-content/main/pages/object-storage/concepts.mdx`, `…/object-storage/faq.mdx`, `…/transactional-email/reference-content/tem-capabilities-and-limits.mdx`, `…/transactional-email/faq.mdx`, `…/managed-databases-for-postgresql-and-mysql/concepts.mdx` — Scaleway (n.d.).
- [S59] GH raw: Fly.io docs `https://raw.githubusercontent.com/superfly/docs/main/reference/regions.mdx`, `…/about/pricing.mdx`, `…/postgres/index.mdx` — Fly.io (n.d.); directory listing via GH page `https://github.com/superfly/docs/tree/main/about`.
- [S60] GH raw: Neon docs `https://raw.githubusercontent.com/neondatabase/website/main/content/docs/introduction/regions.md`, `…/introduction/plans.md`, `…/extensions/postgis.md` — Neon (n.d.).
- [S61] GH raw: Supabase `https://raw.githubusercontent.com/supabase/supabase/master/packages/shared-data/regions.ts`, `…/packages/shared-data/plans.ts`, `…/packages/shared-data/pricing.ts`, `…/apps/docs/content/guides/platform/regions.mdx`, `…/apps/docs/content/guides/database/extensions/postgis.mdx` — Supabase (n.d.).
- [S62] GH raw: `https://raw.githubusercontent.com/mailgun/mailgun.js/master/README.md` — Mailgun; EU base URL note (n.d.).
- [S63] GH raw: `https://raw.githubusercontent.com/maildev/maildev/master/README.md`; `https://raw.githubusercontent.com/axllent/mailpit/master/README.md` (n.d.).
- [S64] GH raw: `https://raw.githubusercontent.com/resend/react-email/canary/README.md` — Resend (n.d.); npm deprecation flags (S1).
- [S65] GH raw: `https://raw.githubusercontent.com/animir/node-rate-limiter-flexible/master/README.md` (n.d.).
- [S66] GH raw: `https://raw.githubusercontent.com/sindresorhus/file-type/main/readme.md` (n.d.).
- [S67] GH raw: `https://raw.githubusercontent.com/lovell/sharp/main/package.json` and `README.md` (n.d.).
- [S68] GH raw: `https://raw.githubusercontent.com/kylefarris/clamscan/master/README.md` (n.d.).
- [S69] GH raw: `gitleaks/gitleaks/master/LICENSE` (MIT), `google/osv-scanner/main/LICENSE` (Apache-2.0) and `README.md`, `semgrep/semgrep/develop/README.md` ("License (LGPL-2.1)").
- [S70] GH raw: `https://raw.githubusercontent.com/github/docs/main/content/actions/tutorials/use-containerized-services/create-postgresql-service-containers.md` — GitHub Docs (n.d.).
- [S71] GH raw: `https://raw.githubusercontent.com/openstreetmap/owg-website/master/policies/nominatim.md` — OSMF Operations Working Group, "Nominatim Usage Policy" (n.d.).
- [S72] GH raw: `https://raw.githubusercontent.com/hyperknot/openfreemap/main/README.md` — OpenFreeMap (n.d.).
- [S73] GH raw: `https://raw.githubusercontent.com/protomaps/PMTiles/main/README.md` — Protomaps (n.d.).
- [S74] GH raw: `https://raw.githubusercontent.com/komoot/photon/master/README.md` — komoot (n.d.).
- [S75] npm registry — `maplibre-gl` (BSD-3-Clause), `pmtiles`, `@maptiler/sdk` (see S1).
- [S76] GH raw: `https://raw.githubusercontent.com/openpolis/geojson-italy/master/README.md` — Openpolis; ISTAT-derived boundaries, 1 Jan 2026 vintage, CC-BY.
- [S77] Anthropic, `https://platform.claude.com/docs/en/about-claude/pricing` and `https://platform.claude.com/docs/en/manage-claude/data-residency` (n.d.).
- [S78] Anthropic `claude-api` skill bundled model table (cached 2026-09-25) — used only to cross-check S77.
- [S79] SDK tarballs from npm, grepped locally: `posthog-js` (`cookieless_mode`, `us.i.posthog.com`), `@axiomhq/js` (`api.eu.axiom.co`), `stripe` (`resources/Identity/VerificationSessions`), `mailgun.js`, `@sentry/core`, `inngest`, `@trigger.dev/sdk`, `resend`, `@clerk/backend`, `@workos-inc/node`, `postmark`, `@getbrevo/brevo`, `node-mailjet`, `@aws-sdk/util-endpoints`.
- [S80] GH raw: `https://raw.githubusercontent.com/coollabsio/fonts/main/README.md` — coollabs (secondary; GDPR motivation for self-hosting fonts).
- [S81] Google Cloud, `https://cloud.google.com/about/locations` (page updated 2026-09-23 per its footer; region list not extractable).
- [S82] GH raw: `https://raw.githubusercontent.com/coollabsio/coolify/main/README.md`; `https://raw.githubusercontent.com/Dokploy/dokploy/canary/README.md` (n.d.).
- [S83] GH raw: `https://raw.githubusercontent.com/ForbesLindesay/atdatabases/master/packages/pg-test/README.md` (n.d.).
- [S84] Local environment measurements (psql 16.14, `/usr/share/postgresql/16/extension`, `docker version`, `node -v`, `pnpm -v`) — this session, 2026-10-02.

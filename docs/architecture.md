# Architecture

> Working product name: **Vellum**. The name lives in one place
> (`src/config/site.ts`) and can be changed without touching anything else.

## 1. The one rule

```
Wedding DATA  +  Template PRESENTATION  +  Theme TOKENS  =  Invitation
```

* A **wedding** is rows in Postgres. It knows nothing about how it looks.
* A **template** is React code. It knows nothing about any particular couple.
* A **theme** is a small set of design tokens (colors, fonts, radius, shadow).
  Templates ship defaults; couples store *overrides only*.
* The **editor** edits data and tokens. The **renderer** combines them.

Every surface that shows a wedding — the public page, the editor preview, the
template gallery, OG images, and (later) PDF / offline exports — goes through
the same pipeline:

```
            ┌────────────────────┐
 Postgres ─►│  WeddingBundle     │  plain JSON: wedding, settings, theme,
 (RLS/RPC)  │  (data contract)   │  section rows, events, media rows
            └─────────┬──────────┘
                      │ buildInvitationModel(bundle, template, opts)   ← pure, unit-tested
                      ▼
            ┌────────────────────┐
            │  InvitationModel   │  view-ready: resolved theme, ordered +
            │  (render contract) │  validated sections, public media URLs,
            └─────────┬──────────┘  locale/dir, formatted dates
                      │ template.Renderer
                      ▼
               Rendered invitation   (live /w/{slug}, preview iframe,
                                      sample preview, future exports)
```

`WeddingBundle` is the only shape the data layer produces, and `InvitationModel`
is the only shape templates consume. That separation is what lets us add
templates without touching the database, and add data (RSVP, guests…) without
touching every template.

## 2. Stack

| Concern        | Choice                                             | Why |
| -------------- | -------------------------------------------------- | --- |
| Framework      | Next.js 16 (App Router), React 19, TypeScript       | SSR for public pages + SEO, Server Actions for mutations, Vercel-native |
| Styling        | Tailwind CSS 4 + CSS variables from theme tokens    | Templates style against `var(--inv-*)`, never literal colors |
| UI primitives  | shadcn/ui-style components in `src/components/ui`   | Owned source, Radix under the hood (see note below) |
| Motion         | GSAP (+ `@gsap/react`), Lenis on public invitations | Timeline control for the envelope sequence; CSS for small things |
| Backend        | Supabase: Auth, Postgres, Storage, RLS              | One secure multi-tenant backend; Edge Functions when needed |
| Validation     | Zod 4                                               | One schema per section; shared by editor, server actions, renderer |
| Fonts          | Self-hosted (Fontsource files → `next/font/local`)  | No third-party font requests; works offline/export; faster |
| Tests          | Vitest (unit), SQL test scripts (RLS), Playwright (e2e) | |

**shadcn/ui note:** components are written in shadcn's conventions (CVA
variants, `cn()` helper, Radix primitives) and live in the repo, exactly as the
shadcn CLI would add them. `components.json` is included so `npx shadcn add …`
works on a normal machine.

## 3. Folder structure

```
src/
├── app/                          Routes only — thin; delegate to features/
│   ├── page.tsx                  Landing page
│   ├── (auth)/login, register    Auth screens
│   ├── auth/confirm/route.ts     Email-confirmation / magic-link callback
│   ├── dashboard/                Authenticated app
│   │   ├── page.tsx              My weddings
│   │   ├── new/                  Create-wedding wizard
│   │   └── weddings/[weddingId]/ Editor
│   ├── preview/[weddingId]/      Editor preview iframe (auth, same origin)
│   ├── templates/[templateId]/   Public sample preview of a template
│   └── w/[slug]/                 PUBLIC invitation (+ opengraph-image)
│
├── core/                         Framework-free domain logic (no React, no Supabase)
│   ├── wedding/                  Types, Zod schemas, slug rules, WeddingBundle
│   ├── sections/                 Section library: schema + defaults + editor fields per type
│   ├── template/                 TemplateManifest type (data half of the template contract)
│   ├── theme/                    Token types, merge, → CSS variables, font registry
│   ├── invitation/               InvitationModel + buildInvitationModel()
│   ├── i18n/                     Locales, dictionaries, date formatting, RTL
│   └── export/                   ExportService abstraction (future PDF/HTML/print)
│
├── templates/                    PRESENTATION
│   ├── types.ts                  The template contract
│   ├── registry.ts               All templates (the only list to edit when adding one)
│   ├── shared/                   Presentational helpers any template may use
│   ├── cinematic/                Flagship template (envelope opening)
│   ├── editorial/                Second template — proves the contract
│   └── fixtures/                 Sample wedding used for template previews
│
├── features/                     App features: server actions, queries, UI
│   ├── auth/
│   ├── weddings/                 Queries, create/publish actions, dashboard UI
│   ├── editor/                   Editor shell, panels, autosave, preview bridge
│   └── media/                    Upload + storage path rules
│
├── lib/supabase/                 Clients (browser, server, proxy) + DB types
├── components/ui/                Primitives (button, input, …)
├── config/                       Site config, env access
└── proxy.ts                      Session refresh + route protection (Next 16 "proxy")

supabase/
├── config.toml                   Local Supabase config (`supabase start`)
├── migrations/                   Schema, RLS, storage — the source of truth
├── seed.sql                      Local-only demo data (none required)
└── tests/                        SQL tests for RLS (run with `npm run test:db`)

docs/                             You are here
legacy/                           Original static prototype (reference only)
e2e/                              Playwright end-to-end specs
```

Dependency direction is one way: `app → features → (templates, core, lib)`,
`templates → core`, and `core → nothing`. `core/` can therefore be reused by an
Edge Function, a PDF worker or a future mobile app.

## 4. Multi-tenancy and security

* Every wedding-scoped table carries `wedding_id`. There is **no** assumption
  of one wedding per user.
* Access is decided by `wedding_members (wedding_id, user_id, role)`, not just
  `weddings.owner_id`. The owner gets a member row automatically. This is how
  "explicit permission" (collaborators, planners) works later with **no RLS
  rewrite** — see `docs/database.md`.
* RLS is enabled on every table. The browser only ever holds the **anon** key;
  the service-role key is never used by the app in Phase 1.
* **Public pages never read tables directly.** The `anon` role has no table
  privileges at all. `/w/{slug}` calls one `SECURITY DEFINER` function,
  `get_public_invitation(slug)`, which returns only whitelisted fields of a
  *published* wedding and only *enabled* sections. Owner IDs, member lists,
  draft status and disabled content never leave the database.
* Authorization is enforced in Postgres. Server actions also validate input
  with Zod and check the session, but they are a convenience layer, not the
  security boundary.

## 5. Rendering modes

`InvitationModel.mode` tells a template where it is running:

| Mode      | Where                                  | Behaviour |
| --------- | -------------------------------------- | --------- |
| `live`    | `/w/{slug}`                            | Full experience: opening animation, music, smooth scroll |
| `preview` | Editor iframe                          | Opening skipped by default, "replay" on demand, no autoplay |
| `sample`  | Template gallery                       | Like live, with fixture data |
| `export`  | Future PDF / HTML package              | Static: no animation, no audio, print-safe |

## 6. Live preview

The editor keeps the working `WeddingBundle` in client state. The preview is a
same-origin **iframe** (`/preview/{weddingId}`), so the template sees a real
viewport (`100svh`, media queries, `position: fixed`) and can be switched
between desktop and phone widths. On every change the editor `postMessage`s the
bundle to the iframe, which rebuilds the model and re-renders instantly —
without waiting for the save round-trip. Saves are debounced and go through
Server Actions; the public page reads straight from the database.

## 7. Internationalisation

* `wedding_settings.locale` (`en` | `ar`) drives `lang`, `dir="rtl"`, number and
  date formatting (`Intl`, in the wedding's time zone) and the default copy
  of every section (`core/i18n/dictionaries`).
* Templates use logical CSS (`ms-*`, `pe-*`, `start`/`end`, `inset-inline`) so
  RTL mirrors correctly.
* Arabic fonts (Amiri, Noto Naskh Arabic) are in the font registry and are
  appended to every font stack when the locale is Arabic.
* The dashboard UI is English-only in Phase 1; its strings are isolated so it
  can be translated later.

## 8. Extension points (how future phases plug in)

| Future feature            | Plugs in via |
| ------------------------- | ------------ |
| New template              | New folder in `src/templates/` + one line in `registry.ts`. No DB or dashboard change. |
| New section type          | New definition in `core/sections/` + a component per template that supports it. The editor form is generated from the definition's field descriptors. |
| RSVP / guests (Phase 2)   | New tables keyed by `wedding_id` (`guests`, `rsvp_responses`), a public RPC to submit, and the existing `rsvp` section switches from placeholder to form. |
| Messaging (Phase 3)       | `guests` + an outbox table processed by an Edge Function; QR codes point at `/w/{slug}?g={token}`. |
| Custom domains (Phase 5)  | `wedding_domains` table + a lookup in `proxy.ts` that rewrites `host` → `/w/{slug}`. |
| Payments / plans (Phase 5)| `subscriptions` per user or wedding; templates declare `tier`; entitlements checked in server actions and RLS. |
| Exports / offline         | `core/export/ExportService` — see `docs/roadmap.md#offline`. `export` render mode already exists. |
| Admin (future)            | Separate route group guarded by an `app_admins` table + RLS; never the service key in the browser. |
| AI generation (Phase 7)   | Produces a `WeddingBundle` (content + theme overrides) — the same contract the editor writes — so AI output is just data. |

## Rendering, caching and data (Oct 2026 audit)

- **Static marketing pages.** `/`, `/invitations`, `/websites` and every design
  page (`/invitations/[id]`, `/websites/[id]`) are prerendered. They never read
  `searchParams` on the server: filters, `?palette=`, `?view=`, card options
  and the gallery's "show more" count (`?n=`) are applied in the browser after
  hydration with `useUrlQuery` (`src/lib/use-url-query.ts`). Reading
  `searchParams` in these pages would make them render per request again.
- **Cached previews.** Sample previews are ISR pages refreshed hourly:
  `/templates/[id]/preview` and `/templates/[id]/preview/[palette]` (one page
  per palette, so switching colours reuses a cached page), and the try-flow
  frame `/create/[id]/frame`.
- **Per-request dedupe.** `getCurrentUser` and `loadEditorData` are wrapped in
  React `cache()`; the editor loads its data in one parallel round. Private
  data is never cached across requests.
- **No needless refreshes.** Editor autosaves do not call `revalidatePath`
  (it would refetch every visited page); the public invitation renders per
  request anyway.
- **Smaller downloads.** GSAP and Lenis load on demand (`motion-engine-impl.ts`),
  previews load only the layout they show (`renderers.client.tsx`), website
  thumbnails load only on the websites gallery, and the proxy skips the
  session check on pages that don't use it.
- **Loading and error states.** `loading.tsx` for per-request pages, branded
  `not-found.tsx`, `error.tsx`, `global-error.tsx` and `dashboard/error.tsx`.

## 9. Admin, orders & operations (Oct 2026)

Added after Phase 1; same layering (`app → features/admin → core/lib`, data in Postgres functions).

- **Orders & the pay-wall.** Publishing creates an `orders` row (`pending`);
  a database trigger (`guard_publish`) stops a couple making an invitation
  live until it has a `paid` order within its live period. Staff confirm
  payment (`admin_mark_paid` → `settle_order`), which sets
  `weddings.active_until` and publishes. `get_public_invitation` only returns
  an invitation that is published, not deactivated and not past its period,
  so the pay-wall and expiry are enforced in one place for every reader.
- **Staff model.** `platform_staff (user_id, role)` with roles
  `owner | admin | marketing`. Every `admin_*` function calls
  `private.require_staff(roles[])` first, which also demands two-step login
  (JWT `aal = aal2`). Marketing never receives money or customer emails — the
  functions omit those fields, so it is enforced server-side, not hidden in
  the UI.
- **The private-schema pattern (the security spine).** Every
  `SECURITY DEFINER` function lives in schema `private` (not exposed by the
  API); `public` holds a thin `SECURITY INVOKER` pass-through of the same
  name. Policies and callers use the public name; the real body can't be
  called directly. Rule for any new privileged function: body in `private`,
  pass-through in `public`, `revoke` from `public, anon, authenticated` then
  `grant execute` to `authenticated` only. Keep `set search_path = ''` and a
  pinned search_path on every `SECURITY DEFINER` function.
- **Rate limits & quotas.** `private.hit_limit(action, max, window)` records
  per-user events in `private.rate_events`; triggers and the `limit_action`
  allow-list apply fixed limits (orders, uploads, guest writes, editor saves,
  account deletion). Total caps (invitations per account, guests/photos/events
  per invitation) are `AFTER INSERT` statement triggers that raise `P0413`
  with a human message; the app surfaces `P0413`/`P0429` via `limitError()`.
- **Background jobs.** `private.run_daily_jobs()` runs nightly via pg_cron
  (03:15 Cairo): cancel unpaid orders after 7 days, queue renewal reminders
  for invitations ending within 14 days, prune old rate-limit rows. Each run
  is written to `admin_audit`.
- **Admin UI.** `src/features/admin` (queries, Zod-validated server actions,
  components); pages under `app/admin/(panel)`. Desktop = sidebar + tables;
  phones = an app-style bottom tab bar (`admin-bottom-nav`) and card layouts.
  Row menus use `ActionMenu` (a portal popover) so they are never clipped by a
  table's scroll box.

## 10. Extending it & coding standards

**Dependency rule (unchanged):** `app → features → templates, core, lib`;
`templates → core`; `core → nothing` (no React, no Supabase — so it can run in
an Edge Function or a PDF worker). Keep domain logic in `core/`, data access in
`features/*/queries.ts`, mutations in `features/*/actions.ts`, routes thin.

**Add a template:** create `src/templates/<name>/`, implement the `Renderer`
against `InvitationModel` (style only via `var(--inv-*)` tokens — never literal
colors), and register it in `src/templates/registry.ts` (the one list). No
database change. `templates.test.tsx` checks every template renders and always
offers a reply.

**Add a section type:** define its Zod schema + defaults + editor fields in
`src/core/sections/registry.ts`. Sections are sparse overrides, so it appears
on every existing invitation with sensible defaults and **no backfill
migration**.

**Add an admin feature:** write the `private` SECURITY DEFINER function (role
check first) + public pass-through in a new append-only migration; add a Zod
schema + loader in `features/admin/queries.ts` and an action in `actions.ts`;
build the page under `app/admin/(panel)`. Add a case to `supabase/tests/`.

**Migrations are append-only and numbered.** Never edit an applied migration;
add a new one. DDL with `DROP`/`DELETE` needs manual approval, so prefer
`ALTER`/`CREATE OR REPLACE`; ship anything destructive as a file the operator
runs. Regenerate `database.types.ts` shapes when the schema changes.

**Algorithms already applied — follow the same shapes for new work:**
- **List screens: find-then-hydrate.** Filter to the matching ids (indexed),
  cut the page, *then* join details for just that page — never hydrate the
  whole table and paginate in memory. See `admin_list_orders/weddings`.
- **One pass, not N queries.** Aggregates use `count(*) filter (where …)` and
  a single grouped pass over a date calendar for time series, instead of a
  query per bucket (the overview went 2.7 s → 0.17 s this way).
- **Search is indexed and literal.** Trigram GIN indexes for name/phone/
  reference; `like_pattern()` escapes `%` `_` so user input is matched
  literally, never as a wildcard and never concatenated into SQL.
- **Parallel, deduped loads.** Pages fetch independent data with
  `Promise.all`; per-request reads wrap in React `cache()`.
- **Validate twice, trust the database.** Zod on the server action for a
  friendly message; the database function/constraint is the real boundary.
- **Measure before optimising.** `scripts/bench-admin.mjs --seed` times the
  admin reads on a large synthetic dataset; `get_advisors` flags missing
  indexes and RLS gaps. Add an index only when a query needs it.

**Tests are the safety net for updates:** `npm test` (unit, ~1,600),
`npm run test:db` (RLS + functions as each role), `npm run test:e2e` (the whole
browser journey). CI runs all three plus secret and dependency scans on every
push, so a change that breaks access control or the money flow fails before it
ships.

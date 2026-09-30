# Roadmap

Principle: **simple now, scalable later.** Each phase adds tables keyed by
`wedding_id`, new section types or templates, and server actions — the
`WeddingBundle → InvitationModel → Template` pipeline stays intact.

## Phase 1 — Invitation builder (this release)

- [x] Architecture, docs, deployment-ready config
- [x] Supabase schema, RLS, storage bucket + policies, public RPC
- [x] Email/password auth, session refresh, protected routes
- [x] Dashboard: my weddings, status, edit, preview, publish
- [x] Create-wedding wizard: names → date → template → create
- [x] Template contract + registry; section library (13 sections)
- [x] Cinematic template with envelope opening; Editorial template
- [x] Structured editor with autosave and live preview (desktop split / mobile tabs)
- [x] Hero, gallery and music uploads to Supabase Storage
- [x] Theme tokens with palette presets, custom colors and font pairings
- [x] Public page `/w/{slug}` with dynamic metadata and generated OG image
- [x] English + Arabic-ready (RTL, locale-aware dates, Arabic fonts)
- [x] `ExportService` abstraction (formats not implemented yet)

## Phase 2 — RSVP & guests
* Tables: `guests`, `guest_groups`, `rsvp_responses`, `event_invitations`
  (which guest is invited to which event), `meal_options`.
* Public `submit_rsvp(slug, token, payload)` RPC — `SECURITY DEFINER`,
  rate-limited, guest identified by an unguessable token.
* `rsvp` section becomes a real form; dashboard gets a guest list + RSVP
  analytics.
* Editor: manage multiple events (table already supports it).

## Phase 3 — Communication
* WhatsApp / email / SMS through an `outbound_messages` outbox processed by a
  Supabase Edge Function (provider adapters behind one interface).
* Personal links `/w/{slug}?g={guestToken}` and QR codes that encode them.

## Phase 4 — Templates at scale
* More templates (romantic, classic, …); template `tier` (free/premium).
* Template marketplace: templates stay code, but a `templates` table can hold
  publishing state, pricing and author metadata keyed by `template_id`.

## Phase 5 — Domains & money
* `wedding_domains` + host lookup in `src/proxy.ts` (rewrite to `/w/{slug}`),
  Vercel domains API for provisioning.
* `subscriptions`, `payments` (Stripe/Paymob), entitlement checks.

## Phase 6 — Planning platform
* Registry & gifts, vendors, planning tools, seating (uses Phase 2 guests).

## Phase 7 — AI
* AI invitation/website generation produces a `WeddingBundle` (copy, section
  choices, theme overrides) through the same server actions as the editor.

## Offline, print and PWA  <a id="offline"></a>

`src/core/export/export-service.ts` defines `ExportService` with formats
`pdf`, `print`, `html-package`, `offline-site`. Planned implementations:

| Format          | Approach |
| --------------- | -------- |
| `print` / `pdf` | Render with `mode: 'export'` (static layout, print CSS) at a dedicated route, then headless Chromium (Edge Function or Vercel function with `@sparticuz/chromium`) → PDF stored in Storage. |
| `html-package`  | Render to static HTML with inlined CSS, self-hosted fonts (already local) and media downloaded into a zip. |
| `offline-site`  | Per-invitation web manifest + service worker scoped to `/w/{slug}/` that precaches the page, fonts and media. |

What PWA support will need: a `manifest.webmanifest` route per wedding
(name/colors from the model), icons generated like the OG image, a scoped
service worker, and cache-busting on publish. Self-hosted fonts and the
`export` render mode were chosen now so none of this needs a redesign.

## Admin (future)
Separate `/admin` route group protected by an `app_admins` table checked in
RLS helpers (admins are treated as viewers/editors of every wedding). Manages
users, weddings, template publishing, reports, subscriptions, storage usage.
Server-side only; the service-role key stays in server code, never the browser.

## Known Phase 1 limits
* Publishing is live (no draft/published snapshots yet).
* One ceremony and one reception editable in the UI.
* Orphaned Storage files after failed uploads are not garbage-collected yet
  (a scheduled Edge Function will reconcile `media` vs Storage).
* Dashboard UI is English only.

# Database

Supabase Postgres. The migrations in `supabase/migrations/` are the source of
truth; this document explains the design and the decisions behind it.

## Entity overview

```
auth.users (Supabase Auth)
   │ 1:1
   ├── profiles
   │
   │ 1:N (owner)                     N:M (access)
   └── weddings ◄──────────────── wedding_members (wedding_id, user_id, role)
          │
          ├── 1:1  wedding_settings   locale, timezone, visibility, music
          ├── 1:1  wedding_themes     token overrides (jsonb)
          ├── 1:N  wedding_sections   per-section overrides: enabled, order, content (jsonb)
          ├── 1:N  events             ceremony, reception, …
          └── 1:N  media              metadata for files in Storage
```

## Tables

### `profiles`
| column       | type        | notes |
| ------------ | ----------- | ----- |
| `id`         | uuid PK     | = `auth.users.id`, cascade delete |
| `full_name`  | text        | from sign-up metadata |
| `avatar_url` | text        | |
| `created_at`, `updated_at` | timestamptz | |

Created automatically by a trigger on `auth.users` insert.

### `weddings`
| column             | type               | notes |
| ------------------ | ------------------ | ----- |
| `id`               | uuid PK            | |
| `owner_id`         | uuid → auth.users  | billing/ownership; cannot be changed by clients |
| `slug`             | text UNIQUE        | `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–60 chars → `/w/{slug}` |
| `partner_one_name` | text               | 1–80 chars |
| `partner_two_name` | text               | 1–80 chars |
| `wedding_date`     | date, nullable     | the day; times live on `events` |
| `template_id`      | text               | key in the code template registry |
| `status`           | enum               | `draft` · `published` · `archived` |
| `published_at`     | timestamptz        | set on first publish |
| `created_at`, `updated_at` | timestamptz | |

### `wedding_members`
| column       | type    | notes |
| ------------ | ------- | ----- |
| `wedding_id` | uuid    | PK part |
| `user_id`    | uuid    | PK part |
| `role`       | enum    | `owner` · `editor` · `viewer` |

The owner row is inserted by trigger when a wedding is created and is
protected from being removed or downgraded.

### `wedding_settings` (1:1)
`locale` (`en`/`ar`), `timezone` (IANA, default `Africa/Cairo`),
`visibility` (`unlisted` by default — not indexed by search engines — or `public`), `music_enabled`.

### `wedding_themes` (1:1)
`tokens jsonb` — a **partial** `ThemeTokens` object holding only what the
couple changed. Created empty by trigger.

### `wedding_sections`
| column       | type    | notes |
| ------------ | ------- | ----- |
| `id`         | uuid PK | |
| `wedding_id` | uuid    | |
| `type`       | text    | section type key, e.g. `hero`, `story` |
| `enabled`    | bool    | |
| `sort_order` | int, nullable | `NULL` = template's default position; set only when the couple reorders |
| `content`    | jsonb   | validated by that section's Zod schema in the app |
| UNIQUE       | `(wedding_id, type)` | one instance per type in Phase 1 |

### `events`
`kind` (`ceremony` / `reception` / `other`), `title`, `starts_at`
(timestamptz), `ends_at`, `venue_name`, `address`, `latitude`, `longitude`,
`map_url`, `description`, `sort_order`.

### `media`
`kind` (`image` / `audio`), `purpose` (`hero` / `gallery` / `music` / `og`),
`storage_path` (unique), `alt_text`, `width`, `height`, `sort_order`,
`created_by`. Binaries live in Storage; this table stores metadata only.

## Later additions

* **`media.storage_path` may be `library:<id>`** (migration 0005): a photo from
  the curated library instead of an upload, so visitors can choose photos before
  they have an account. Upload paths stay unique; library references don't.
* **`create_wedding_from_draft(jsonb)`** (0006): saves a no-account draft as a
  wedding in one transaction, `SECURITY INVOKER` so RLS still applies.
* **`wedding_sections.style`** (0007): per-section presentation hints, kept
  apart from content (see docs/templates.md).

* **Guests, replies and wishes** (0008): `guests` (the couple's list; each
  has a random 32-character `token` for their personal link `/w/{slug}?g=…`,
  so names never go in URLs), `replies` (one per listed guest; general-link
  replies have no guest and are matched by name), `wishes` (messages guests
  leave; the couple can hide them). Members read; owner/editor write; the
  token and open counts are set only by the database. Guests never touch the
  tables: they go through `get_guest`, `submit_reply`, `submit_wish` and
  `get_public_wishes`, which only work for published weddings, cap party size
  at the guest's or the invitation's limit (`rsvp.content.maxGuests`), keep
  only answers to the couple's own questions and limit totals per wedding.
  Tests: `supabase/tests/replies.test.sql`.

* **Internal helpers locked** (0009): Supabase grants `anon`/`authenticated`
  EXECUTE on new functions by default, so `revoke … from public` is not
  enough. `published_wedding_id`, `section_on` and `replies_guest_matches`
  are callable only from inside the guest-facing functions; new helpers must
  revoke from `public, anon, authenticated` explicitly.

* **Flood limits** (0010): the publishable key is public, so the guest
  functions can be called without the app. Per invitation, at most 120 new
  general-link replies and 40 wishes per 10 minutes (`busy` after that);
  personal links are not limited. Also an index on `media.created_by`.

* **One read policy on weddings** (0011): "members read" now also covers
  the owner, replacing the separate "owner reads own" (same access, half the
  policy work per row).

* **Full-rights functions out of the API** (0012): every SECURITY DEFINER
  function a role can call lives in the `private` schema (not exposed by the
  API); `public` has a SECURITY INVOKER function with the same name and
  arguments that passes the call on. Policies point at the `private`
  versions. **Rule for new functions:** put a SECURITY DEFINER body in
  `private`, add the pass-through in `public`, and never `create or replace`
  a public pass-through with `security definer`. Supabase's security advisor
  should stay at zero warnings.

* **Wishes wait for approval** (0013): `submit_wish` saves a wish hidden unless
  the wishes section's `approveFirst` is false (it is true when not set) and
  answers `pending`. The couple shows wishes from their guest list.

* **Admin, sales and live periods** (0014, 0015): `platform_staff` (owner ·
  admin · marketing), `orders` (one row per sale; recorded by staff for now,
  Paymob later) and `admin_audit` (every change made from /admin). Weddings
  gain `active_until` (a sale keeps an invitation live for 3 months),
  `deactivated_at` and `deactivated_reason`; guests only see invitations that
  are published, not turned off and not past `active_until`. Clients can't set
  those columns. Staff work only through `admin_*` functions that check the
  role first: marketing sees counts and designs, never money, customer emails
  or changes; only the owner manages staff and can't change their own access.
  Nobody reads the staff or audit tables directly (restrictive `false`
  policies); a couple can read their own orders. Tests:
  `supabase/tests/admin.test.sql`.

* **Faster admin reads** (0016): same functions, answers and role checks,
  built to stay quick as the business grows. The overview counts each table
  once and builds the daily chart in one grouped pass over a calendar of
  dates (days follow Cairo time); lists find the matching ids first, cut the
  page and only then add customer, payment, guest and reply details; sales
  totals come from the database. Indexes on `weddings.created_at`, a trigram
  index for name search, and paid orders by wedding. Search text is literal.
  `node scripts/bench-admin.mjs --seed` times them on 50,000 invitations:
  overview for a year 2.7 s → 0.17 s, sales 0.29 s → 0.04 s, invitation
  pages and search about 10× faster.

## Decisions (and deviations from the initial brief)

1. **`wedding_members` instead of owner-only checks.** The brief requires "own
   *or have explicit permission*". Checking membership through two
   `SECURITY DEFINER` helpers (`can_view_wedding`, `can_edit_wedding`) means
   collaborators, planners and admins later need data, not new policies.

2. **No `weddings.name` column.** The display name is derived from the two
   partner names. A stored name would drift the moment a couple edits their
   names (success criterion 13–15).

3. **`template_id` lives on `weddings`, not in the theme.** It is a
   presentation *choice*, needed in dashboard listings; the theme table only
   holds token overrides.

4. **Theme as JSONB overrides, not fixed columns.** Different templates need
   different tokens; fixed `primary_color`/`secondary_color` columns would
   force a migration for each new token. Overrides-only storage also means an
   improved template default reaches every wedding that didn't customise it.
   The shape is validated by Zod in the app.

5. **Sections are sparse overrides.** A missing row means "use the template's
   default" (enabled flag, position, localized default copy). New section types
   therefore appear on every existing wedding with sensible defaults and **no
   backfill migration**. Rows are upserted the first time a couple edits a
   section.

6. **`events.starts_at timestamptz` instead of separate `date` + `time`.** One
   unambiguous instant; displayed in `wedding_settings.timezone`. Phase 2
   "multiple events" is already supported by the table (the Phase 1 editor
   edits the first ceremony and first reception).

7. **Public read through one function.** `get_public_invitation(slug)` returns
   a JSON `WeddingBundle` for published weddings only: enabled sections, no
   owner/member data. `anon` has **no** table grants, so a mis-written policy
   cannot leak private rows.

8. **Publishing is live.** Published pages read current data, so edits appear
   after a refresh. Draft/versioned publishing (snapshot on publish) is a
   future option documented in the roadmap.

## Row Level Security summary

| Table              | select                | insert/update/delete |
| ------------------ | --------------------- | -------------------- |
| `profiles`         | own row               | update own row |
| `weddings`         | members               | insert: `owner_id = auth.uid()`; update: owner/editor; delete: owner |
| `wedding_members`  | members of that wedding | owner only; owner row protected |
| settings, themes, sections, events, media | members | owner/editor |
| `storage.objects` (`wedding-media`) | members (API); files are served from the public bucket URL | owner/editor of the wedding in the path |

| `guests`           | members               | insert/update/delete: owner/editor (token and counts not writable) |
| `replies`          | members               | owner/editor (guests write through `submit_reply`) |
| `wishes`           | members               | update (`hidden`)/delete: owner/editor (guests write through `submit_wish`) |

`anon`: no table privileges; `EXECUTE` on `get_public_invitation`, `get_guest`, `submit_reply`, `submit_wish` and `get_public_wishes` only.

## Storage

Bucket **`wedding-media`** (public read, 15 MB limit, images + audio MIME
types). Paths:

```
weddings/{weddingId}/hero/{uuid}.{ext}
weddings/{weddingId}/gallery/{uuid}.{ext}
weddings/{weddingId}/music/{uuid}.{ext}
```

Write policies parse `{weddingId}` from the path and require edit rights.
File names are random UUIDs, so draft files are not guessable. When private
invitations arrive, a second private bucket + signed URLs will be added.

## Types

`src/lib/supabase/database.types.ts` mirrors the schema. After changing a
migration, regenerate it against a local instance:

```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

## Testing

`npm run test:db` creates a throwaway database, installs a minimal stand-in for
Supabase's `auth` and `storage` schemas, applies every migration, and runs
`supabase/tests/*.sql`, which switch between the `anon` and `authenticated`
roles with JWT claims the same way PostgREST does, asserting what each role can
and cannot see or change.

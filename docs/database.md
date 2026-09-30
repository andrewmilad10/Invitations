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

`anon`: no table privileges; `EXECUTE` on `get_public_invitation` only.

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

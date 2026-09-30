# Development

## Prerequisites
* Node.js 20.9+ (22 recommended), npm
* Docker (for local Supabase)
* PostgreSQL client tools (`psql`) — only for `npm run test:db`

## First run

```bash
npm install
npx supabase start            # starts local Supabase in Docker, applies migrations
cp .env.example .env.local    # paste the API URL + publishable key printed by `supabase start`
npm run dev                   # http://localhost:3000
```

Local email confirmation is disabled in `supabase/config.toml`, so you can
register and log in immediately. Emails that would be sent are visible in
Mailpit at http://localhost:54324.

## Scripts

| Script              | What it does |
| ------------------- | ------------ |
| `npm run dev`       | Next dev server (Turbopack) |
| `npm run build`     | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint`      | ESLint |
| `npm test`          | Vitest unit tests (domain logic, templates registry, model builder) |
| `npm run test:db`   | Applies all migrations to a scratch Postgres database and runs the RLS tests in `supabase/tests/` |
| `npm run test:e2e`  | Playwright: the Phase 1 success criteria end to end — register → create → upload → edit → publish → guest opens `/w/{slug}` → rename → refresh — plus access-control checks. Needs `npx supabase start`; starts `npm run dev` itself. First run: `npx playwright install chromium` |
| `npm run check`     | typecheck + lint + unit tests |

`test:db` uses `DATABASE_URL` if set (default
`postgres://postgres:postgres@127.0.0.1:5432/postgres`) and creates/drops a
database named `vellum_test`. It does not need Docker — any Postgres 15+ works.

## Conventions

* **No wedding identity in components.** Names, dates, venues, colors and
  images always come from `InvitationModel`. Sample data lives only in
  `src/templates/fixtures/`.
* **Domain logic in `src/core/`** stays free of React, Next and Supabase
  imports so it can run anywhere and is trivially unit-testable.
* **Mutations are Server Actions** in `src/features/*/actions.ts`. Every action:
  gets the user from the server client, validates input with Zod, performs the
  write under RLS, returns `{ ok: true, … } | { ok: false, error }`.
* **Templates use theme variables**, never literal colors.
* **Logical CSS properties** (`ms-`, `pe-`, `text-start`) so RTL works.
* Migrations are append-only. Never edit a migration that has been pushed.

## Useful paths
* `/templates/cinematic/preview` — a template with sample data, no login needed.
* `/dashboard` — your weddings.
* `/w/{slug}` — a published invitation.

## What each test layer proves

| Layer | Proves |
| ----- | ------ |
| `npm test` (Vitest) | Model building, ordering, theming, i18n/time zones, slug rules, editor bundle updates, server-action input guards (invalid input never reaches the DB), templates render only given data, escape user content and contain no literal colors |
| `npm run test:db`   | Schema, triggers and every RLS policy, switching roles exactly as PostgREST does (owner / editor / viewer / other user / anonymous) |
| `npm run test:e2e`  | The real stack: Supabase Auth, PostgREST, Storage uploads, the editor and the public page together |

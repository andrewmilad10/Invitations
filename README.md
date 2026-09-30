# Vellum — wedding invitation platform

Couples create a wedding, pick a template, customise it in a live editor and
publish a cinematic online invitation at `/w/{slug}`.

This is **Phase 1** of a larger wedding platform. The core idea:

```
Wedding DATA  +  Template PRESENTATION  +  Theme TOKENS  =  Invitation
```

Nothing about any couple is hard-coded. Every name, date, venue, color and
image comes from the database, so one wedding can be rendered by any template
and any template can render any wedding.

## Stack
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · GSAP · Lenis ·
Supabase (Auth, Postgres + RLS, Storage) · Zod · Vitest · Playwright

## Quick start
```bash
npm install
npx supabase start
cp .env.example .env.local   # fill in values printed by `supabase start`
npm run dev
```
Open http://localhost:3000, register, create a wedding.
No Supabase yet? `/templates/cinematic/preview` shows a template with sample data.

## Status

Explore-first wedding invitation platform:

1. **Discover** — public homepage, no login required
2. **Two products, one catalogue** — `/invitations` (invitation cards) and
   `/websites` (wedding websites): 48 original designs (all drawn in code, no
   third-party artwork), each sold as a card *and* a website, with style
   tiles, filters, sorting, saved designs and quick view
3. **View a design** — `/templates/{id}`: as a card, on a phone and as a website;
   shape variants, named colour themes, Customize
4. **Try it** — `/create/{id}`: customise without an account (draft kept in the
   browser; an earlier draft is offered back); download the personalised card
   as an image to send on WhatsApp
5. **Create account** — only when saving; the draft moves into the account in one transaction
6. **Continue editing** — three-column editor (sections · live preview · properties)
7. **Publish & share** — `/w/{slug}`, with link, WhatsApp and email sharing

See [docs/roadmap.md](docs/roadmap.md) for what comes next.

## Testing
```bash
npm run check      # typecheck + lint + unit tests
npm run test:db    # schema + RLS against any Postgres 15+
npm run test:e2e   # full flow against `supabase start`
```

## Documentation
| Doc | Contents |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | System design, folder structure, security model, extension points |
| [docs/database.md](docs/database.md) | Schema, RLS, storage, decisions |
| [docs/templates.md](docs/templates.md) | Template contract, the design collection, adding designs and sections, the envelope opening |
| [docs/roadmap.md](docs/roadmap.md) | Phases 2–7, offline/PWA/export plan, admin |
| [docs/development.md](docs/development.md) | Local setup, scripts, conventions |
| [docs/deployment.md](docs/deployment.md) | Supabase + Vercel, environment variables |

## Repository layout
```
src/app        routes          src/core       domain logic (framework-free)
src/templates  presentation    src/features   server actions + feature UI
src/lib        supabase clients supabase/     migrations, RLS tests
docs/          documentation   legacy/        original static prototype (reference)
```

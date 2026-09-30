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

## Documentation
| Doc | Contents |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | System design, folder structure, security model, extension points |
| [docs/database.md](docs/database.md) | Schema, RLS, storage, decisions |
| [docs/templates.md](docs/templates.md) | Template contract, adding templates and sections, the envelope opening |
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

# Deployment

The app is a standard Next.js 16 project and deploys to Vercel with no custom
server. Supabase hosts auth, database and storage.

## Quick test deploy (share with friends)

1. **Vercel** → Add New → Project → import `andrewmilad10/Invitations`.
   Framework: Next.js, no overrides. Deploy.
2. **Settings → Environments → Production → Branch tracking**: set the branch
   to `platform` (the app lives there), then **Deployments → Redeploy**.
   Use the production URL (`https://<project>.vercel.app`) — preview URLs are
   behind Vercel login by default, so friends can't open them.
3. At this point the gallery, design pages, previews and the no-account
   "try it" flow all work. Saving, accounts and publishing need step 4.
4. **Supabase** → New project → **SQL Editor** → paste the combined schema
   (all files in `supabase/migrations/` in order — or `npx supabase db push`)
   → Run. Then in **Authentication → URL configuration** set Site URL to the
   Vercel URL and add `https://<project>.vercel.app/auth/confirm` as a
   redirect URL. For a friends-only test you can switch off
   **Authentication → Sign In / Providers → Email → Confirm email**.
5. Back in Vercel → Settings → Environment Variables, add the three variables
   from the table below (URL and publishable key from Supabase → Project
   Settings → API; `NEXT_PUBLIC_SITE_URL` = the Vercel URL) → Redeploy.

## 1. Supabase project

1. Create a project at supabase.com (choose a region close to your guests,
   e.g. `eu-central-1` for Egypt/Middle East).
2. Link and push the schema from your machine:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push          # applies supabase/migrations/*
   ```
   This creates all tables, RLS policies, the public RPC and the
   `wedding-media` storage bucket with its policies.
3. **Auth → URL configuration**
   * Site URL: `https://your-domain.com`
   * Redirect URLs: `https://your-domain.com/auth/confirm`, plus your Vercel
     preview pattern, e.g. `https://*-your-team.vercel.app/auth/confirm`.
4. **Auth → Email templates → Confirm signup**: point the link at the app's
   confirm route so SSR sessions work:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
   ```
5. Configure a real SMTP provider before launch (Supabase's built-in sender
   is heavily rate-limited).

## 2. Vercel

1. Import the Git repository. Framework preset: Next.js. No build overrides.
2. Environment variables (Production + Preview):

| Variable                                | Value | Exposed to browser |
| --------------------------------------- | ----- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`              | Project URL | yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  | Publishable (anon) key | yes — safe, RLS enforces access |
| `NEXT_PUBLIC_SITE_URL`                  | `https://your-domain.com` | yes |

   **Never** add the service-role / secret key to a `NEXT_PUBLIC_` variable.
   Phase 1 does not use it at all.
3. Deploy. `/w/{slug}` pages render per request, so edits appear on refresh.

## 3. Post-deploy checklist

- [ ] Register, confirm email, log in
- [ ] Create a wedding, upload a hero image, publish
- [ ] Open `/w/{slug}` in a private window — envelope → hero
- [ ] Share the link in WhatsApp/Slack — OG card shows names and date
- [ ] Unpublish → the public URL returns 404

## Custom domains (Phase 5)
Not in Phase 1. See `docs/roadmap.md`.

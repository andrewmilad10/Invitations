# Deployment

The app is a standard Next.js 16 project and deploys to Vercel with no custom
server. Supabase hosts auth, database and storage.

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

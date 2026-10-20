# Security rules

Read before touching auth, data, environment variables, uploads or anything
that leaves the browser. These are not suggestions: a change that breaks one
of them is not finished.

## Secrets

- Never commit secrets. Real values live in `.env.local` (git-ignored) or the
  host's environment settings. `.env.example` lists every variable with an
  empty or local-only value and a comment saying what it is.
- Only `NEXT_PUBLIC_*` variables reach the browser. Anything else is
  server-only. The Supabase **secret / service-role key** is never
  `NEXT_PUBLIC_`, never imported by a client component, and only read in
  server code (`server-only` import at the top of the module).
- API keys for outside services (e.g. the Claude API) follow the same rule:
  server-only, read through one module, never logged.
- Before every commit: `git diff --cached` must contain no keys, tokens,
  passwords or `.env*` files other than `.env.example`.

## Authorization

- Never trust the client. The browser can hide a button; only the database
  and server decide who may read or change what.
- Every table has Row Level Security on, with policies that name the owner
  (`auth.uid()`). New table = new policy in the same migration, plus a test
  in `supabase/tests`.
- Server actions and route handlers check the session and ownership
  themselves, even when the UI already did.
- Passwords are never stored or handled by Vellum. Supabase Auth does that.

## Private wedding data

- Drafts are visible only to their owner. Published invitations expose only
  the fields a guest needs, through the public view/RPC, never the raw tables.
- Guest names, phone numbers, addresses and RSVPs are personal data: never
  in URLs, analytics, logs or error messages.
- Published pages stay out of search engines unless the couple opts in.

## Input and output

- Validate every input on the server with Zod (`src/core/**` schemas), even
  if the client validated it too. Limit lengths.
- Links the couple types (QR codes, website links) must be `http`/`https`
  only (`safeQrUrl`). No `javascript:` or data URLs.
- Never render user text as HTML (`dangerouslySetInnerHTML` is not used for
  user content).
- Uploaded images: check type and size, then redraw them in the browser into a
  new WebP/JPEG (`cleanImage`: drops GPS and camera data and anything hidden in
  the file, max 2560px). The server reads every uploaded file's first bytes
  (`isAllowedMedia`) and deletes anything that isn't a real image or audio
  file before it is recorded. Files go under the owner's folder with storage
  policies; SVG is never accepted.
- Invitation addresses always end in a random 6-character code
  (`withRandomSuffix`), so they can't be guessed from names.
- Every page sends a Content Security Policy (next.config.ts): scripts only
  from this site, data only to this site and Supabase, frames only Google
  Maps. A new outside service must be added there on purpose.

## Dependencies

- Add a package only when it does real work. Prefer well-known, maintained
  packages; pin via the lockfile. Run `npm audit` before releases.

## Checklist for every change

1. No secret in the diff; no secret reachable from a client component.
2. New data access goes through RLS and is tested.
3. Server re-checks the user and validates input.
4. No personal data in logs, URLs or errors.
5. `npm run typecheck`, `npm run lint`, `npx vitest run` pass.


## Hardening (October 2026)

- **Two-step login for staff.** Every `admin_*` database function refuses a
  session without an authenticator code (JWT `aal` = `aal2`, error `P0401`);
  `/admin/verify` sets it up or asks for the code. Never add an admin
  function that skips `private.require_staff`.
- **Bot check.** Cloudflare Turnstile on sign-up, login and "forgot
  password" (`BotCheck`); Supabase Auth verifies it. Off until both keys are
  set (see `.env.example`).
- **Per-account limits** live in the database (`private.hit_limit`,
  `private.limit_action`): new invitations, guest-list writes, uploads,
  orders, cancellations, account deletion. Over the limit → `P0429`.
- **Payments.** Mark as paid asks for confirmation when a reference was
  already used or the amount differs; going ahead is written to the order
  timeline and shown in the Overview's alerts. Optional `ALERT_WEBHOOK_URL`
  gets short summaries (never customer details).
- **Strict script policy** on `/dashboard`, `/admin`, `/preview`, `/login`,
  `/register`, `/forgot-password`: a fresh nonce per request
  (`src/proxy.ts`, `src/lib/security/csp.ts`), no inline scripts without it.
  Those pages must render per request. Import Zod from `@/lib/zod` (lint
  enforced): it turns off Zod's `eval` probe, which the policy forbids.
- **Couples' data.** `/dashboard/account`: download everything as JSON, or
  delete the account (files first, then one transaction; orders are kept
  without name or phone).
- **GitHub.** `.github/workflows/checks.yml` runs lint, types, unit and
  database tests, secret scanning (gitleaks, whole history) and `npm audit`
  on every push and weekly; Dependabot opens update pull requests.
- **Uptime.** `/api/health` answers 200 when the site and database are up,
  503 otherwise (for an uptime monitor).

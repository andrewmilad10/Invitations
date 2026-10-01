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
- Uploaded images: check type and size, downscale on the client, store under
  the owner's folder with storage policies.

## Dependencies

- Add a package only when it does real work. Prefer well-known, maintained
  packages; pin via the lockfile. Run `npm audit` before releases.

## Checklist for every change

1. No secret in the diff; no secret reachable from a client component.
2. New data access goes through RLS and is tested.
3. Server re-checks the user and validates input.
4. No personal data in logs, URLs or errors.
5. `npm run typecheck`, `npm run lint`, `npx vitest run` pass.

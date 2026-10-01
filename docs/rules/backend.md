# Back-end rules

Read with `docs/database.md` before changing data, auth or server code.

- Supabase is the database and the login system. Schema changes are new
  files in `supabase/migrations` only; never edit an applied migration.
- Every new table: RLS enabled, owner policies, and a test in
  `supabase/tests` proving another user cannot read or change it.
- Domain rules live in `src/core` and stay framework-free (no React, no
  Next.js imports) so they can be unit-tested.
- Server code that needs elevated access uses the secret key through one
  server-only module, and only for that one job. Default to the user's own
  session.
- Validate inputs with Zod at the server boundary; return friendly errors,
  never stack traces or SQL.
- Public pages read through the published view/RPC, which exposes only
  guest-facing fields.
- Long or repeated work (emails, image processing) runs server-side and is
  safe to retry (idempotent).
- Develop and test against a local or test Supabase project, never the live
  one.

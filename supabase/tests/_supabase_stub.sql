-- ═══════════════════════════════════════════════════════════════════════════
-- TEST-ONLY stand-in for the parts of Supabase the migrations depend on.
-- Applied by scripts/test-db.mjs to a scratch database on plain Postgres.
-- NEVER apply this to a real Supabase project (it already has these).
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end;
$$;

grant usage on schema public to anon, authenticated, service_role;

-- Supabase's defaults grant everything in `public` to the API roles.
-- Emulate that so our explicit revokes/grants are actually exercised.
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- ── auth ────────────────────────────────────────────────────────────────────
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique,
  raw_user_meta_data  jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

-- Same resolution order as Supabase: request.jwt.claim.sub, then request.jwt.claims.
create function auth.uid() returns uuid
language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      current_setting('request.jwt.claims', true)::jsonb ->> 'sub'
    ), ''
  )::uuid;
$$;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- ── storage ─────────────────────────────────────────────────────────────────
create schema storage;
grant usage on schema storage to anon, authenticated, service_role;

create table storage.buckets (
  id                  text primary key,
  name                text not null unique,
  public              boolean default false,
  file_size_limit     bigint,
  allowed_mime_types  text[],
  created_at          timestamptz default now()
);

create table storage.objects (
  id          uuid primary key default gen_random_uuid(),
  bucket_id   text references storage.buckets (id),
  name        text not null,
  owner       uuid,
  metadata    jsonb,
  created_at  timestamptz default now(),
  unique (bucket_id, name)
);
alter table storage.objects enable row level security;
grant all on storage.objects to anon, authenticated, service_role;
grant select on storage.buckets to anon, authenticated, service_role;

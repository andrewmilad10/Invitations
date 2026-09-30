-- ═══════════════════════════════════════════════════════════════════════════
-- 0001 · Foundation schema
-- Multi-tenant wedding data. Every wedding-scoped table carries wedding_id.
-- See docs/database.md for the design rationale.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enums ───────────────────────────────────────────────────────────────────
create type public.wedding_status     as enum ('draft', 'published', 'archived');
create type public.wedding_visibility as enum ('public', 'unlisted');
create type public.member_role        as enum ('owner', 'editor', 'viewer');
create type public.event_kind         as enum ('ceremony', 'reception', 'other');
create type public.media_kind         as enum ('image', 'audio');
create type public.media_purpose      as enum ('hero', 'gallery', 'music', 'og');

-- ── Shared trigger: updated_at ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) <= 120),
  avatar_url  text check (char_length(avatar_url) <= 2048),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── weddings ────────────────────────────────────────────────────────────────
create table public.weddings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users (id) on delete cascade,
  slug              text not null,
  partner_one_name  text not null,
  partner_two_name  text not null,
  wedding_date      date,
  template_id       text not null default 'cinematic',
  status            public.wedding_status not null default 'draft',
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint weddings_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  constraint weddings_partner_one_len check (char_length(trim(partner_one_name)) between 1 and 80),
  constraint weddings_partner_two_len check (char_length(trim(partner_two_name)) between 1 and 80),
  constraint weddings_template_format check (template_id ~ '^[a-z0-9-]{1,40}$')
);

create unique index weddings_slug_key on public.weddings (slug);
create index weddings_owner_id_idx on public.weddings (owner_id);

create trigger weddings_set_updated_at
  before update on public.weddings
  for each row execute function public.set_updated_at();

-- owner_id is immutable from the client; published_at is managed here.
create or replace function public.weddings_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.owner_id is distinct from old.owner_id then
    raise exception 'owner_id cannot be changed' using errcode = '42501';
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger weddings_guard
  before insert or update on public.weddings
  for each row execute function public.weddings_guard();

-- ── wedding_members ─────────────────────────────────────────────────────────
create table public.wedding_members (
  wedding_id  uuid not null references public.weddings (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.member_role not null,
  created_at  timestamptz not null default now(),
  primary key (wedding_id, user_id)
);

create index wedding_members_user_id_idx on public.wedding_members (user_id);

-- ── wedding_settings (1:1) ──────────────────────────────────────────────────
create table public.wedding_settings (
  wedding_id     uuid primary key references public.weddings (id) on delete cascade,
  locale         text not null default 'en' check (locale in ('en', 'ar')),
  timezone       text not null default 'Africa/Cairo' check (char_length(timezone) between 1 and 64),
  visibility     public.wedding_visibility not null default 'public',
  music_enabled  boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger wedding_settings_set_updated_at
  before update on public.wedding_settings
  for each row execute function public.set_updated_at();

-- ── wedding_themes (1:1) — token overrides only ─────────────────────────────
create table public.wedding_themes (
  wedding_id  uuid primary key references public.weddings (id) on delete cascade,
  tokens      jsonb not null default '{}'::jsonb check (jsonb_typeof(tokens) = 'object'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger wedding_themes_set_updated_at
  before update on public.wedding_themes
  for each row execute function public.set_updated_at();

-- ── wedding_sections — sparse per-section overrides ─────────────────────────
create table public.wedding_sections (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings (id) on delete cascade,
  type        text not null check (type ~ '^[a-z][a-z0-9_]{1,39}$'),
  enabled     boolean not null default true,
  sort_order  integer not null default 0,
  content     jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (wedding_id, type)
);

create trigger wedding_sections_set_updated_at
  before update on public.wedding_sections
  for each row execute function public.set_updated_at();

-- ── events ──────────────────────────────────────────────────────────────────
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  wedding_id   uuid not null references public.weddings (id) on delete cascade,
  kind         public.event_kind not null default 'other',
  title        text not null default '' check (char_length(title) <= 120),
  starts_at    timestamptz,
  ends_at      timestamptz,
  venue_name   text check (char_length(venue_name) <= 160),
  address      text check (char_length(address) <= 400),
  latitude     double precision check (latitude between -90 and 90),
  longitude    double precision check (longitude between -180 and 180),
  map_url      text check (char_length(map_url) <= 2048 and map_url ~* '^https://'),
  description  text check (char_length(description) <= 2000),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint events_time_order check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create index events_wedding_id_idx on public.events (wedding_id, sort_order);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ── media — metadata for files in Storage ───────────────────────────────────
create table public.media (
  id            uuid primary key default gen_random_uuid(),
  wedding_id    uuid not null references public.weddings (id) on delete cascade,
  kind          public.media_kind not null,
  purpose       public.media_purpose not null,
  storage_path  text not null unique,
  alt_text      text not null default '' check (char_length(alt_text) <= 300),
  width         integer check (width > 0),
  height        integer check (height > 0),
  sort_order    integer not null default 0,
  created_by    uuid references auth.users (id) on delete set null default auth.uid(),
  created_at    timestamptz not null default now(),
  -- the file must live inside this wedding's folder
  constraint media_path_in_wedding_folder
    check (storage_path like 'weddings/' || wedding_id::text || '/%'),
  constraint media_kind_matches_purpose
    check ((kind = 'audio') = (purpose = 'music'))
);

create index media_wedding_id_idx on public.media (wedding_id, purpose, sort_order);

-- ── New wedding → owner membership + 1:1 rows ───────────────────────────────
create or replace function public.handle_new_wedding()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.wedding_members (wedding_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  insert into public.wedding_settings (wedding_id) values (new.id);
  insert into public.wedding_themes (wedding_id) values (new.id);
  return new;
end;
$$;

create trigger on_wedding_created
  after insert on public.weddings
  for each row execute function public.handle_new_wedding();

-- The owner's membership can't be removed or downgraded (except by deleting
-- the wedding, which cascades).
create or replace function public.protect_owner_membership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and exists (select 1 from public.weddings w where w.id = old.wedding_id and w.owner_id = old.user_id)
     and (tg_op = 'DELETE' or new.role <> 'owner' or new.user_id <> old.user_id) then
    raise exception 'the owner membership cannot be removed or changed' using errcode = '42501';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger protect_owner_membership
  before update or delete on public.wedding_members
  for each row execute function public.protect_owner_membership();

-- Only the actual owner may hold the 'owner' role.
create or replace function public.check_owner_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role = 'owner' and not exists (
    select 1 from public.weddings w where w.id = new.wedding_id and w.owner_id = new.user_id
  ) then
    raise exception 'only the wedding owner can have the owner role' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger check_owner_role
  before insert or update on public.wedding_members
  for each row execute function public.check_owner_role();

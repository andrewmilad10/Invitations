-- ═══════════════════════════════════════════════════════════════════════════
-- 0002 · Row Level Security
-- Access to wedding data is decided by wedding_members. The anon role gets no
-- table privileges at all; public pages use get_public_invitation() (0003).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Access helpers ──────────────────────────────────────────────────────────
-- SECURITY DEFINER so policies on wedding_members don't recurse into themselves.
create or replace function public.wedding_role(p_wedding_id uuid)
returns public.member_role
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.wedding_members m
  where m.wedding_id = p_wedding_id
    and m.user_id = (select auth.uid());
$$;

create or replace function public.can_view_wedding(p_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.wedding_members m
    where m.wedding_id = p_wedding_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_edit_wedding(p_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.wedding_members m
    where m.wedding_id = p_wedding_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'editor')
  );
$$;

revoke all on function public.wedding_role(uuid)      from public, anon;
revoke all on function public.can_view_wedding(uuid)  from public, anon;
revoke all on function public.can_edit_wedding(uuid)  from public, anon;
grant execute on function public.wedding_role(uuid)     to authenticated;
grant execute on function public.can_view_wedding(uuid) to authenticated;
grant execute on function public.can_edit_wedding(uuid) to authenticated;

-- Trigger/internal functions are not callable over the API.
revoke all on function public.handle_new_user()           from public, anon, authenticated;
revoke all on function public.handle_new_wedding()        from public, anon, authenticated;
revoke all on function public.set_updated_at()            from public, anon, authenticated;
revoke all on function public.weddings_guard()            from public, anon, authenticated;
revoke all on function public.protect_owner_membership()  from public, anon, authenticated;
revoke all on function public.check_owner_role()          from public, anon, authenticated;

-- ── Table privileges ────────────────────────────────────────────────────────
-- Supabase grants broad default privileges on public tables; tighten them.
revoke all on
  public.profiles, public.weddings, public.wedding_members, public.wedding_settings,
  public.wedding_themes, public.wedding_sections, public.events, public.media
from anon, authenticated;

grant select                            on public.profiles         to authenticated;
grant update (full_name, avatar_url)    on public.profiles         to authenticated;
grant select, delete                    on public.weddings         to authenticated;
-- New weddings always start as drafts: status/published_at aren't insertable.
grant insert (owner_id, slug, partner_one_name, partner_two_name, wedding_date, template_id)
                                        on public.weddings         to authenticated;
-- Column-level UPDATE: id, owner_id, created_at and published_at are never
-- client-writable (a table-level grant would override column revokes).
grant update (slug, partner_one_name, partner_two_name, wedding_date, template_id, status)
                                        on public.weddings         to authenticated;
grant select, insert, update, delete    on public.wedding_members  to authenticated;
grant select, update                    on public.wedding_settings to authenticated;
grant select, update                    on public.wedding_themes   to authenticated;
grant select, insert, update, delete    on public.wedding_sections to authenticated;
grant select, insert, update, delete    on public.events           to authenticated;
grant select, insert, update, delete    on public.media            to authenticated;

-- ── Enable RLS everywhere ───────────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.weddings         enable row level security;
alter table public.wedding_members  enable row level security;
alter table public.wedding_settings enable row level security;
alter table public.wedding_themes   enable row level security;
alter table public.wedding_sections enable row level security;
alter table public.events           enable row level security;
alter table public.media            enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ── weddings ────────────────────────────────────────────────────────────────
create policy "weddings: members read"
  on public.weddings for select to authenticated
  using (public.can_view_wedding(id));

create policy "weddings: create as owner"
  on public.weddings for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "weddings: editors update"
  on public.weddings for update to authenticated
  using (public.can_edit_wedding(id))
  with check (public.can_edit_wedding(id));

create policy "weddings: owner deletes"
  on public.weddings for delete to authenticated
  using (owner_id = (select auth.uid()));

-- The creator must be able to read the row back right after insert (the
-- membership row is created by an AFTER trigger in the same statement).
create policy "weddings: owner reads own"
  on public.weddings for select to authenticated
  using (owner_id = (select auth.uid()));

-- ── wedding_members ─────────────────────────────────────────────────────────
create policy "members: members read"
  on public.wedding_members for select to authenticated
  using (public.can_view_wedding(wedding_id));

create policy "members: owner manages"
  on public.wedding_members for insert to authenticated
  with check (public.wedding_role(wedding_id) = 'owner');

create policy "members: owner updates"
  on public.wedding_members for update to authenticated
  using (public.wedding_role(wedding_id) = 'owner')
  with check (public.wedding_role(wedding_id) = 'owner');

create policy "members: owner removes"
  on public.wedding_members for delete to authenticated
  using (public.wedding_role(wedding_id) = 'owner');

-- ── wedding-scoped child tables ─────────────────────────────────────────────
-- settings & themes: rows are created by trigger, so only select + update.
create policy "settings: members read"
  on public.wedding_settings for select to authenticated
  using (public.can_view_wedding(wedding_id));
create policy "settings: editors update"
  on public.wedding_settings for update to authenticated
  using (public.can_edit_wedding(wedding_id))
  with check (public.can_edit_wedding(wedding_id));

create policy "themes: members read"
  on public.wedding_themes for select to authenticated
  using (public.can_view_wedding(wedding_id));
create policy "themes: editors update"
  on public.wedding_themes for update to authenticated
  using (public.can_edit_wedding(wedding_id))
  with check (public.can_edit_wedding(wedding_id));

-- sections, events, media: full CRUD for editors.
do $$
declare
  t text;
begin
  foreach t in array array['wedding_sections', 'events', 'media'] loop
    execute format(
      'create policy "%1$s: members read" on public.%1$I for select to authenticated
         using (public.can_view_wedding(wedding_id))', t);
    execute format(
      'create policy "%1$s: editors insert" on public.%1$I for insert to authenticated
         with check (public.can_edit_wedding(wedding_id))', t);
    execute format(
      'create policy "%1$s: editors update" on public.%1$I for update to authenticated
         using (public.can_edit_wedding(wedding_id))
         with check (public.can_edit_wedding(wedding_id))', t);
    execute format(
      'create policy "%1$s: editors delete" on public.%1$I for delete to authenticated
         using (public.can_edit_wedding(wedding_id))', t);
  end loop;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 0022 · Usage quotas and more limits
--
-- Quotas (totals, checked once per statement so a 500-guest import is one
-- check), error P0413 with a plain message:
--   invitations per account 30 · guests per invitation 1,500 ·
--   photos and music per invitation 80 · events per invitation 20
--   (replies 2,000 and wishes 1,000 per invitation already exist, 0008)
-- Limits (per account, per hour): editor saves 3,000 · data downloads 10.
-- Database checks run for the API too, so they hold even without the app.
-- ═══════════════════════════════════════════════════════════════════════════

create function private.quota_weddings() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.weddings w where w.owner_id in (select distinct owner_id from inserted)
             group by w.owner_id having count(*) > 30) then
    raise exception 'You can have up to 30 invitations. Remove one you no longer need first.' using errcode = 'P0413';
  end if;
  return null;
end;
$$;
create trigger weddings_quota after insert on public.weddings
  referencing new table as inserted for each statement execute function private.quota_weddings();

create function private.quota_guests() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.guests g where g.wedding_id in (select distinct wedding_id from inserted)
             group by g.wedding_id having count(*) > 1500) then
    raise exception 'A guest list can have up to 1,500 guests.' using errcode = 'P0413';
  end if;
  return null;
end;
$$;
create trigger guests_quota after insert on public.guests
  referencing new table as inserted for each statement execute function private.quota_guests();

create function private.quota_media() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.media m where m.wedding_id in (select distinct wedding_id from inserted)
             group by m.wedding_id having count(*) > 80) then
    raise exception 'An invitation can have up to 80 photos and music files.' using errcode = 'P0413';
  end if;
  return null;
end;
$$;
create trigger media_quota after insert on public.media
  referencing new table as inserted for each statement execute function private.quota_media();

create function private.quota_events() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.events e where e.wedding_id in (select distinct wedding_id from inserted)
             group by e.wedding_id having count(*) > 20) then
    raise exception 'An invitation can have up to 20 events.' using errcode = 'P0413';
  end if;
  return null;
end;
$$;
create trigger events_quota after insert on public.events
  referencing new table as inserted for each statement execute function private.quota_events();

-- Editor saves: one count per statement on the tables the editor writes.
create function private.limit_editor_writes() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.hit_limit('editor.write', 3000, interval '1 hour');
  return null;
end;
$$;
create trigger wedding_sections_rate_limit before insert or update on public.wedding_sections
  for each statement execute function private.limit_editor_writes();
create trigger events_rate_limit before insert or update on public.events
  for each statement execute function private.limit_editor_writes();
create trigger wedding_themes_rate_limit before update on public.wedding_themes
  for each statement execute function private.limit_editor_writes();
create trigger wedding_settings_rate_limit before update on public.wedding_settings
  for each statement execute function private.limit_editor_writes();
create trigger weddings_update_rate_limit before update on public.weddings
  for each statement execute function private.limit_editor_writes();

revoke all on function private.quota_weddings() from public, anon, authenticated;
revoke all on function private.quota_guests() from public, anon, authenticated;
revoke all on function private.quota_media() from public, anon, authenticated;
revoke all on function private.quota_events() from public, anon, authenticated;
revoke all on function private.limit_editor_writes() from public, anon, authenticated;

-- Limits the app asks for by name (fixed here; callers can't change them).
create or replace function private.limit_action(p_action text)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  case p_action
    when 'order.request' then perform private.hit_limit(p_action, 15, interval '1 hour');
    when 'order.cancel' then perform private.hit_limit(p_action, 10, interval '1 hour');
    when 'data.export' then perform private.hit_limit(p_action, 10, interval '1 hour');
    else raise exception 'unknown action' using errcode = '22023';
  end case;
end;
$$;
create function public.limit_action(p_action text) returns void language sql volatile security invoker set search_path = '' as $$ select private.limit_action(p_action); $$;
revoke all on function public.limit_action(text) from public, anon, authenticated;
grant execute on function public.limit_action(text) to authenticated;

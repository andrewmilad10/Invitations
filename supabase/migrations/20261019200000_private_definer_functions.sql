-- ═══════════════════════════════════════════════════════════════════════════
-- 0012 · Full-rights functions out of the public API
--
-- Functions that run with the owner's rights (SECURITY DEFINER) now live in
-- the `private` schema, which the API does not expose. `public` keeps a thin
-- SECURITY INVOKER function of the same name and arguments that only passes
-- the call on, so the app, the policies and the tests keep working unchanged:
--
--   RLS helpers     wedding_role, can_view_wedding, can_edit_wedding
--   guest functions get_public_invitation, get_guest, get_public_wishes,
--                   submit_reply, submit_wish
--
-- Policies that used the helpers follow them to `private` (Postgres keeps the
-- reference, not the name). Who may call what is unchanged: guests (anon) the
-- five guest functions, signed-in users those plus the three helpers.
--
-- Also: Supabase's own `rls_auto_enable()` (the event trigger that turns RLS
-- on for new tables) is no longer callable over the API. Revoking EXECUTE does
-- not stop the event trigger from running.
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter function public.wedding_role(uuid) set schema private;
alter function public.can_view_wedding(uuid) set schema private;
alter function public.can_edit_wedding(uuid) set schema private;
alter function public.get_public_invitation(text) set schema private;
alter function public.get_guest(text, text) set schema private;
alter function public.get_public_wishes(text) set schema private;
alter function public.submit_reply(text, text, text, boolean, integer, text, jsonb) set schema private;
alter function public.submit_wish(text, text, text) set schema private;

-- ── Pass-through functions in public ───────────────────────────────────────
create function public.wedding_role(p_wedding_id uuid)
returns public.member_role language sql stable security invoker set search_path = '' as $$
  select private.wedding_role(p_wedding_id);
$$;
create function public.can_view_wedding(p_wedding_id uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.can_view_wedding(p_wedding_id);
$$;
create function public.can_edit_wedding(p_wedding_id uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.can_edit_wedding(p_wedding_id);
$$;
create function public.get_public_invitation(p_slug text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select private.get_public_invitation(p_slug);
$$;
create function public.get_guest(p_slug text, p_token text)
returns jsonb language sql volatile security invoker set search_path = '' as $$
  select private.get_guest(p_slug, p_token);
$$;
create function public.get_public_wishes(p_slug text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select private.get_public_wishes(p_slug);
$$;
create function public.submit_reply(
  p_slug text, p_token text, p_name text, p_attending boolean, p_party integer, p_note text, p_answers jsonb
)
returns jsonb language sql volatile security invoker set search_path = '' as $$
  select private.submit_reply(p_slug, p_token, p_name, p_attending, p_party, p_note, p_answers);
$$;
create function public.submit_wish(p_slug text, p_name text, p_message text)
returns jsonb language sql volatile security invoker set search_path = '' as $$
  select private.submit_wish(p_slug, p_name, p_message);
$$;

comment on function public.get_public_invitation(text) is
  'Public, read-only view of a published wedding. Whitelisted fields only.';

-- ── Who may call what (same as before) ─────────────────────────────────────
revoke all on function
  public.wedding_role(uuid), public.can_view_wedding(uuid), public.can_edit_wedding(uuid),
  public.get_public_invitation(text), public.get_guest(text, text), public.get_public_wishes(text),
  public.submit_reply(text, text, text, boolean, integer, text, jsonb), public.submit_wish(text, text, text)
from public, anon, authenticated;
revoke all on function
  private.wedding_role(uuid), private.can_view_wedding(uuid), private.can_edit_wedding(uuid),
  private.get_public_invitation(text), private.get_guest(text, text), private.get_public_wishes(text),
  private.submit_reply(text, text, text, boolean, integer, text, jsonb), private.submit_wish(text, text, text)
from public, anon, authenticated;

grant execute on function
  public.wedding_role(uuid), public.can_view_wedding(uuid), public.can_edit_wedding(uuid),
  private.wedding_role(uuid), private.can_view_wedding(uuid), private.can_edit_wedding(uuid)
to authenticated;
grant execute on function
  public.get_public_invitation(text), public.get_guest(text, text), public.get_public_wishes(text),
  public.submit_reply(text, text, text, boolean, integer, text, jsonb), public.submit_wish(text, text, text),
  private.get_public_invitation(text), private.get_guest(text, text), private.get_public_wishes(text),
  private.submit_reply(text, text, text, boolean, integer, text, jsonb), private.submit_wish(text, text, text)
to anon, authenticated;

-- ── Supabase's RLS event trigger function (only on hosted projects) ────────
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;

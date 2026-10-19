-- ═══════════════════════════════════════════════════════════════════════════
-- 0013 · Wishes wait for the couple's approval
-- New wishes are saved hidden unless the couple switched "approve first" off
-- (wishes section content `approveFirst`, true when not set). The couple shows
-- a wish from their guest list. The answer says `pending` so the guest is told
-- their wish will appear once the couple sees it.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function private.submit_wish(p_slug text, p_name text, p_message text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_wedding uuid := public.published_wedding_id(p_slug);
  v_name text := btrim(coalesce(p_name, ''));
  v_message text := btrim(coalesce(p_message, ''));
  v_pending boolean;
begin
  if v_wedding is null or not public.section_on(v_wedding, 'wishes', false) then
    return jsonb_build_object('ok', false, 'error', 'closed');
  end if;
  if char_length(v_name) not between 1 and 80 or char_length(v_message) not between 1 and 500 then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  if (select count(*) from public.wishes w where w.wedding_id = v_wedding) >= 1000 then
    return jsonb_build_object('ok', false, 'error', 'full');
  end if;
  if (select count(*) from public.wishes w where w.wedding_id = v_wedding and w.created_at > now() - interval '10 minutes') >= 40 then
    return jsonb_build_object('ok', false, 'error', 'busy');
  end if;
  select coalesce(
           case when jsonb_typeof(ws.content -> 'approveFirst') = 'boolean' then (ws.content ->> 'approveFirst')::boolean end,
           true)
    into v_pending
    from public.wedding_sections ws where ws.wedding_id = v_wedding and ws.type = 'wishes';
  v_pending := coalesce(v_pending, true);
  insert into public.wishes (wedding_id, name, message, hidden) values (v_wedding, v_name, v_message, v_pending);
  return jsonb_build_object('ok', true, 'pending', v_pending);
end;
$$;

revoke all on function private.submit_wish(text, text, text) from public;
grant execute on function private.submit_wish(text, text, text) to anon, authenticated;

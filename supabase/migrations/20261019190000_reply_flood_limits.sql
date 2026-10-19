-- ═══════════════════════════════════════════════════════════════════════════
-- 0010 · Flood limits on guest writes
--
-- The publishable key is public, so anyone can call submit_reply and
-- submit_wish directly, skipping the app's per-visitor brake. The database now
-- limits, per invitation, how fast new entries can arrive:
--   · new replies through the general link: 120 per 10 minutes
--   · wishes: 40 per 10 minutes
-- Over the limit the functions answer 'busy' (the app shows "Too many tries in
-- a short time…"). Personal links are not limited: they need the guest's
-- private code, and a reply there only ever updates one row.
--
-- Also an index for media.created_by (a foreign key without one).
-- ═══════════════════════════════════════════════════════════════════════════

create index if not exists media_created_by_idx on public.media (created_by);
create index if not exists replies_general_recent_idx on public.replies (wedding_id, created_at) where guest_id is null;

create or replace function public.submit_reply(
  p_slug text, p_token text, p_name text, p_attending boolean, p_party integer, p_note text, p_answers jsonb
)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_wedding uuid := public.published_wedding_id(p_slug);
  v_content jsonb;
  v_guest public.guests;
  v_max integer;
  v_party integer;
  v_name text := btrim(coalesce(p_name, ''));
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_answers jsonb := '{}'::jsonb;
  v_q jsonb;
begin
  if v_wedding is null or not public.section_on(v_wedding, 'rsvp', true) then
    return jsonb_build_object('ok', false, 'error', 'closed');
  end if;
  select ws.content into v_content from public.wedding_sections ws where ws.wedding_id = v_wedding and ws.type = 'rsvp';
  v_content := coalesce(v_content, '{}'::jsonb);

  if p_token is not null then
    if p_token !~ '^[0-9a-f]{32}$' then
      return jsonb_build_object('ok', false, 'error', 'guest');
    end if;
    select * into v_guest from public.guests g where g.wedding_id = v_wedding and g.token = p_token;
    if v_guest.id is null then
      return jsonb_build_object('ok', false, 'error', 'guest');
    end if;
    v_name := v_guest.name;
  elsif char_length(v_name) not between 1 and 120 then
    return jsonb_build_object('ok', false, 'error', 'name');
  end if;

  v_max := coalesce(v_guest.max_party,
                    case when (v_content ->> 'maxGuests') ~ '^[0-9]{1,2}$' then (v_content ->> 'maxGuests')::integer end,
                    10);
  v_max := least(greatest(v_max, 1), 20);
  v_party := case when coalesce(p_attending, false) then least(greatest(coalesce(p_party, 1), 1), v_max) else 0 end;
  if v_note is not null and char_length(v_note) > 500 then
    v_note := left(v_note, 500);
  end if;

  -- keep only answers to the couple's own questions, as short text
  if jsonb_typeof(p_answers) = 'object' and jsonb_typeof(v_content -> 'questions') = 'array' then
    for v_q in select * from jsonb_array_elements(v_content -> 'questions') loop
      if jsonb_typeof(v_q -> 'id') = 'string' and p_answers ? (v_q ->> 'id') and jsonb_typeof(p_answers -> (v_q ->> 'id')) = 'string' then
        v_answers := v_answers || jsonb_build_object(v_q ->> 'id', left(btrim(p_answers ->> (v_q ->> 'id')), 300));
      end if;
    end loop;
  end if;

  if v_guest.id is not null then
    update public.replies r
       set attending = coalesce(p_attending, false), party_size = v_party, note = v_note, answers = v_answers
     where r.guest_id = v_guest.id;
    if not found then
      insert into public.replies (wedding_id, guest_id, name, attending, party_size, note, answers)
      values (v_wedding, v_guest.id, v_name, coalesce(p_attending, false), v_party, v_note, v_answers);
    end if;
  else
    update public.replies r
       set attending = coalesce(p_attending, false), party_size = v_party, note = v_note, answers = v_answers
     where r.wedding_id = v_wedding and r.guest_id is null and lower(btrim(r.name)) = lower(v_name);
    if not found then
      if (select count(*) from public.replies r where r.wedding_id = v_wedding and r.guest_id is null) >= 2000 then
        return jsonb_build_object('ok', false, 'error', 'full');
      end if;
      if (select count(*) from public.replies r
           where r.wedding_id = v_wedding and r.guest_id is null and r.created_at > now() - interval '10 minutes') >= 120 then
        return jsonb_build_object('ok', false, 'error', 'busy');
      end if;
      insert into public.replies (wedding_id, guest_id, name, attending, party_size, note, answers)
      values (v_wedding, null, v_name, coalesce(p_attending, false), v_party, v_note, v_answers);
    end if;
  end if;
  return jsonb_build_object('ok', true, 'partySize', v_party);
end;
$$;

create or replace function public.submit_wish(p_slug text, p_name text, p_message text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_wedding uuid := public.published_wedding_id(p_slug);
  v_name text := btrim(coalesce(p_name, ''));
  v_message text := btrim(coalesce(p_message, ''));
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
  insert into public.wishes (wedding_id, name, message) values (v_wedding, v_name, v_message);
  return jsonb_build_object('ok', true);
end;
$$;

-- create or replace keeps grants, but say them again so this file stands alone
revoke all on function public.submit_reply(text, text, text, boolean, integer, text, jsonb) from public;
revoke all on function public.submit_wish(text, text, text) from public;
grant execute on function public.submit_reply(text, text, text, boolean, integer, text, jsonb) to anon, authenticated;
grant execute on function public.submit_wish(text, text, text) to anon, authenticated;

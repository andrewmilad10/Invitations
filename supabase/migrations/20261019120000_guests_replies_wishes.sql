-- ═══════════════════════════════════════════════════════════════════════════
-- 0008 · Guests, replies and wishes
--
-- guests   the couple's guest list. Each guest has a private random `token`
--          for their personal link (/w/{slug}?g={token}); names never go in
--          URLs. Members read; owner/editor write.
-- replies  a guest's answer: coming or not, how many, a note and answers to the
--          couple's own questions. One per listed guest; replies through the
--          general link have no guest. Members read; owner/editor change.
-- wishes   messages guests leave on the invitation. Members read and may hide
--          or delete them; guests see the visible ones.
--
-- Guests never touch these tables: `anon` has no table privileges. They go
-- through four SECURITY DEFINER functions that only work for published
-- weddings and validate every value:
--   get_guest(slug, token)        greeting + current reply, counts the open
--   submit_reply(slug, token, …)  saves or updates a reply
--   submit_wish(slug, name, msg)  adds a wish
--   get_public_wishes(slug)       the visible wishes
-- ═══════════════════════════════════════════════════════════════════════════

create table public.guests (
  id             uuid primary key default gen_random_uuid(),
  wedding_id     uuid not null references public.weddings (id) on delete cascade,
  name           text not null check (char_length(btrim(name)) between 1 and 120),
  greeting       text check (greeting is null or char_length(greeting) <= 60),
  message        text check (message is null or char_length(message) <= 300),
  groups         text[] not null default '{}' check (cardinality(groups) <= 10),
  max_party      smallint check (max_party is null or max_party between 1 and 20),
  token          text not null unique default replace(gen_random_uuid()::text, '-', ''),
  open_count     integer not null default 0,
  last_opened_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index guests_wedding_idx on public.guests (wedding_id);
create trigger guests_set_updated_at before update on public.guests
  for each row execute function public.set_updated_at();

create table public.replies (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings (id) on delete cascade,
  guest_id    uuid unique references public.guests (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 120),
  attending   boolean not null,
  party_size  smallint not null default 0 check (party_size between 0 and 20),
  note        text check (note is null or char_length(note) <= 500),
  answers     jsonb not null default '{}'::jsonb
              check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 4000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index replies_wedding_idx on public.replies (wedding_id);
-- someone replying again through the general link under the same name updates their reply
create unique index replies_general_name_idx on public.replies (wedding_id, lower(btrim(name))) where guest_id is null;
create trigger replies_set_updated_at before update on public.replies
  for each row execute function public.set_updated_at();

create table public.wishes (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  message     text not null check (char_length(btrim(message)) between 1 and 500),
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);
create index wishes_wedding_idx on public.wishes (wedding_id, created_at desc);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.guests  enable row level security;
alter table public.replies enable row level security;
alter table public.wishes  enable row level security;

create policy guests_select on public.guests for select to authenticated using (public.can_view_wedding(wedding_id));
create policy guests_insert on public.guests for insert to authenticated with check (public.can_edit_wedding(wedding_id));
create policy guests_update on public.guests for update to authenticated using (public.can_edit_wedding(wedding_id)) with check (public.can_edit_wedding(wedding_id));
create policy guests_delete on public.guests for delete to authenticated using (public.can_edit_wedding(wedding_id));

create policy replies_select on public.replies for select to authenticated using (public.can_view_wedding(wedding_id));
create policy replies_insert on public.replies for insert to authenticated with check (public.can_edit_wedding(wedding_id));
create policy replies_update on public.replies for update to authenticated using (public.can_edit_wedding(wedding_id)) with check (public.can_edit_wedding(wedding_id));
create policy replies_delete on public.replies for delete to authenticated using (public.can_edit_wedding(wedding_id));

create policy wishes_select on public.wishes for select to authenticated using (public.can_view_wedding(wedding_id));
create policy wishes_update on public.wishes for update to authenticated using (public.can_edit_wedding(wedding_id)) with check (public.can_edit_wedding(wedding_id));
create policy wishes_delete on public.wishes for delete to authenticated using (public.can_edit_wedding(wedding_id));

revoke all on public.guests, public.replies, public.wishes from anon, authenticated;
-- the token, counts and timestamps are set by the database, never by clients
grant select, delete on public.guests to authenticated;
grant insert (wedding_id, name, greeting, message, groups, max_party) on public.guests to authenticated;
grant update (name, greeting, message, groups, max_party) on public.guests to authenticated;
grant select, delete on public.replies to authenticated;
grant insert (wedding_id, guest_id, name, attending, party_size, note, answers) on public.replies to authenticated;
grant update (attending, party_size, note, answers) on public.replies to authenticated;
grant select, delete on public.wishes to authenticated;
grant update (hidden) on public.wishes to authenticated;

-- A guest listed on another wedding can't be attached to this one's replies.
create or replace function public.replies_guest_matches()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.guest_id is not null and not exists (
    select 1 from public.guests g where g.id = new.guest_id and g.wedding_id = new.wedding_id
  ) then
    raise exception 'guest belongs to another wedding' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger replies_guest_matches before insert or update on public.replies
  for each row execute function public.replies_guest_matches();

-- ── Guest-facing functions ─────────────────────────────────────────────────

-- The published wedding with this slug, or null.
create or replace function public.published_wedding_id(p_slug text)
returns uuid language sql stable security definer set search_path = '' as $$
  select w.id from public.weddings w where w.slug = lower(p_slug) and w.status = 'published';
$$;
revoke all on function public.published_wedding_id(text) from public;

-- Whether a section is on: its row's flag, or on when the couple never touched it
-- (except sections that start switched off).
create or replace function public.section_on(p_wedding_id uuid, p_type text, p_default boolean)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select ws.enabled from public.wedding_sections ws where ws.wedding_id = p_wedding_id and ws.type = p_type), p_default);
$$;
revoke all on function public.section_on(uuid, text, boolean) from public;

create or replace function public.get_guest(p_slug text, p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_wedding uuid := public.published_wedding_id(p_slug);
  v_guest public.guests;
  v_reply public.replies;
begin
  if v_wedding is null or p_token is null or p_token !~ '^[0-9a-f]{32}$' then
    return null;
  end if;
  update public.guests g set open_count = g.open_count + 1, last_opened_at = now()
   where g.wedding_id = v_wedding and g.token = p_token
   returning * into v_guest;
  if v_guest.id is null then
    return null;
  end if;
  select * into v_reply from public.replies r where r.guest_id = v_guest.id;
  return jsonb_build_object(
    'name',     v_guest.name,
    'greeting', v_guest.greeting,
    'message',  v_guest.message,
    'maxParty', v_guest.max_party,
    'reply', case when v_reply.id is null then null else jsonb_build_object(
      'attending', v_reply.attending,
      'partySize', v_reply.party_size,
      'note',      v_reply.note,
      'answers',   v_reply.answers
    ) end
  );
end;
$$;

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
    if (select count(*) from public.replies r where r.wedding_id = v_wedding and r.guest_id is null) >= 2000 then
      return jsonb_build_object('ok', false, 'error', 'full');
    end if;
    update public.replies r
       set attending = coalesce(p_attending, false), party_size = v_party, note = v_note, answers = v_answers
     where r.wedding_id = v_wedding and r.guest_id is null and lower(btrim(r.name)) = lower(v_name);
    if not found then
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
  insert into public.wishes (wedding_id, name, message) values (v_wedding, v_name, v_message);
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.get_public_wishes(p_slug text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('name', x.name, 'message', x.message, 'at', x.created_at) order by x.created_at desc), '[]'::jsonb)
  from (
    select w.name, w.message, w.created_at
    from public.wishes w
    where w.wedding_id = public.published_wedding_id(p_slug)
      and not w.hidden
      and public.section_on(w.wedding_id, 'wishes', false)
    order by w.created_at desc
    limit 60
  ) x;
$$;

revoke all on function public.get_guest(text, text) from public;
revoke all on function public.submit_reply(text, text, text, boolean, integer, text, jsonb) from public;
revoke all on function public.submit_wish(text, text, text) from public;
revoke all on function public.get_public_wishes(text) from public;
grant execute on function public.get_guest(text, text) to anon, authenticated;
grant execute on function public.submit_reply(text, text, text, boolean, integer, text, jsonb) to anon, authenticated;
grant execute on function public.submit_wish(text, text, text) to anon, authenticated;
grant execute on function public.get_public_wishes(text) to anon, authenticated;

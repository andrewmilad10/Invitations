-- ═══════════════════════════════════════════════════════════════════════════
-- Guests, replies and wishes: who may read and write them, and what guests
-- can do through the public functions.
-- ═══════════════════════════════════════════════════════════════════════════

create function tests.rwid(p_slug text) returns uuid
language sql security definer set search_path = '' as $$
  select id from public.weddings where slug = p_slug;
$$;
grant execute on function tests.rwid(text) to anon, authenticated;
create function tests.token(p_name text) returns text
language sql security definer set search_path = '' as $$
  select token from public.guests where name = p_name;
$$;
grant execute on function tests.token(text) to anon, authenticated;

insert into auth.users (id, email) values
  ('e0000000-0000-4000-8000-000000000005', 'eve@test.dev'),
  ('f0000000-0000-4000-8000-000000000006', 'fay@test.dev');

-- Eve's wedding, with a reply section that allows 4 guests and one question
set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-000000000005', true);
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
values ('e0000000-0000-4000-8000-000000000005', 'eve-and-ian', 'Eve', 'Ian');
insert into public.wedding_sections (wedding_id, type, content)
values (tests.rwid('eve-and-ian'), 'rsvp', '{"maxGuests":4,"questions":[{"id":"bus","text":"Need transport?","kind":"yesno"}]}');

-- ── The couple manages guests ───────────────────────────────────────────────
insert into public.guests (wedding_id, name, groups, max_party)
values (tests.rwid('eve-and-ian'), 'Mariam & family', '{Bride''s family}', 3),
       (tests.rwid('eve-and-ian'), 'Uncle Hossam', '{}', null);
select tests.eq((select count(*) from public.guests)::int, 2, 'owner adds guests');
select tests.ok((select token ~ '^[0-9a-f]{32}$' from public.guests where name = 'Uncle Hossam'), 'each guest gets a random 32-character link code');
select tests.throws($$update public.guests set token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' where name = 'Uncle Hossam'$$, '42501', 'link codes cannot be chosen by clients');
select tests.throws($$update public.guests set open_count = 99$$, '42501', 'open counts cannot be set by clients');
select tests.throws($$insert into public.guests (wedding_id, name) values (tests.rwid('eve-and-ian'), '   ')$$, '23514', 'a guest needs a name');

-- ── Another user sees nothing and changes nothing ──────────────────────────
select set_config('request.jwt.claim.sub', 'f0000000-0000-4000-8000-000000000006', true);
select tests.eq((select count(*) from public.guests)::int, 0, 'another user cannot read the guest list');
select tests.eq((select count(*) from public.replies)::int, 0, 'another user cannot read replies');
select tests.eq(tests.affected($$update public.guests set name = 'X'$$), 0, 'another user cannot rename guests');
select tests.eq(tests.affected($$delete from public.guests$$), 0, 'another user cannot delete guests');
select tests.throws($$insert into public.guests (wedding_id, name) values (tests.rwid('eve-and-ian'), 'Gatecrasher')$$, '42501', 'another user cannot add guests');

-- ── Guests (anon) never reach the tables ───────────────────────────────────
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.throws($$select * from public.guests$$, '42501', 'anon cannot read guests');
select tests.throws($$select * from public.replies$$, '42501', 'anon cannot read replies');
select tests.throws($$select * from public.wishes$$, '42501', 'anon cannot read wishes');
select tests.throws($$insert into public.replies (wedding_id, name, attending) values (tests.rwid('eve-and-ian'), 'x', true)$$, '42501', 'anon cannot write replies directly');

-- a draft wedding takes no replies and shows no guest
select tests.ok(public.get_guest('eve-and-ian', tests.token('Mariam & family')) is null, 'no guest greeting while the wedding is a draft');
select tests.eq(public.submit_reply('eve-and-ian', null, 'Someone', true, 2, null, null) ->> 'error', 'closed', 'no replies while the wedding is a draft');

-- ── Publish ─────────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-000000000005', true);
update public.weddings set status = 'published' where slug = 'eve-and-ian';

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

-- personal link
select tests.eq(public.get_guest('eve-and-ian', tests.token('Mariam & family')) ->> 'name', 'Mariam & family', 'personal link shows the guest''s name');
select tests.ok(public.get_guest('eve-and-ian', 'ffffffffffffffffffffffffffffffff') is null, 'an unknown link code shows nothing');
select tests.ok(public.get_guest('eve-and-ian', 'not-a-code') is null, 'a malformed link code shows nothing');
select tests.ok(public.get_guest('someone-else', tests.token('Mariam & family')) is null, 'a link code only works on its own wedding');

select tests.eq(public.submit_reply('eve-and-ian', tests.token('Mariam & family'), 'Ignored name', true, 9, 'So happy!', '{"bus":"Yes","evil":"x"}') ->> 'ok', 'true', 'a listed guest replies');
select tests.eq(public.submit_reply('eve-and-ian', tests.token('Uncle Hossam'), null, true, 9, null, null) ->> 'partySize', '4', 'party size is capped at the wedding''s limit');
select tests.eq(public.submit_reply('eve-and-ian', tests.token('Mariam & family'), null, false, 3, null, null) ->> 'partySize', '0', 'changing to "can''t come" saves 0 people');
select tests.eq(public.submit_reply('eve-and-ian', tests.token('Mariam & family'), null, true, 9, 'Changed', '{"bus":"No"}') ->> 'partySize', '3', 'a guest''s own limit wins and the reply can be changed');

-- general link
select tests.eq(public.submit_reply('eve-and-ian', null, '  Karim  ', true, 2, null, null) ->> 'ok', 'true', 'anyone with the general link can reply with a name');
select tests.eq(public.submit_reply('eve-and-ian', null, 'karim', false, 0, null, null) ->> 'ok', 'true', 'replying again under the same name updates it');
select tests.eq(public.submit_reply('eve-and-ian', null, '', true, 1, null, null) ->> 'error', 'name', 'a general reply needs a name');

-- wishes start switched off
select tests.eq(public.submit_wish('eve-and-ian', 'Aunt Hoda', 'Congratulations!') ->> 'error', 'closed', 'no wishes until the couple switches them on');

-- ── What the couple sees ───────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-000000000005', true);
select tests.eq((select count(*) from public.replies)::int, 3, 'three replies saved (two guests, one general)');
select tests.eq((select party_size from public.replies r join public.guests g on g.id = r.guest_id where g.name = 'Mariam & family')::int, 3, 'the latest answer is kept');
select tests.eq((select r.name from public.replies r join public.guests g on g.id = r.guest_id where g.name = 'Mariam & family'), 'Mariam & family', 'a listed guest''s reply carries their listed name, not what they typed');
select tests.eq((select answers from public.replies r join public.guests g on g.id = r.guest_id where g.name = 'Mariam & family'), '{"bus":"No"}'::jsonb, 'only answers to the couple''s questions are kept');
select tests.eq((select attending from public.replies where guest_id is null), false, 'the general reply was updated, not duplicated');
select tests.eq((select open_count from public.guests where name = 'Mariam & family'), 1, 'opening a personal link is counted');

-- wishes on
insert into public.wedding_sections (wedding_id, type, enabled) values (tests.rwid('eve-and-ian'), 'wishes', true);
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.eq(public.submit_wish('eve-and-ian', 'Aunt Hoda', 'Congratulations!') ->> 'ok', 'true', 'a guest leaves a wish');
select tests.eq(public.submit_wish('eve-and-ian', 'Spam', repeat('x', 501)) ->> 'error', 'invalid', 'long wishes are refused');
select tests.eq(jsonb_array_length(public.get_public_wishes('eve-and-ian')), 1, 'guests see the wish');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-000000000005', true);
select tests.eq(tests.affected($$update public.wishes set hidden = true$$), 1, 'the couple can hide a wish');
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.eq(jsonb_array_length(public.get_public_wishes('eve-and-ian')), 0, 'hidden wishes are not shown');

-- another user cannot hide or delete wishes
set local role authenticated;
select set_config('request.jwt.claim.sub', 'f0000000-0000-4000-8000-000000000006', true);
select tests.eq(tests.affected($$update public.wishes set hidden = false$$), 0, 'another user cannot unhide wishes');
select tests.eq(tests.affected($$delete from public.replies$$), 0, 'another user cannot delete replies');

-- a reply can't be pointed at another wedding's guest
reset role;
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
values ('f0000000-0000-4000-8000-000000000006', 'fay-and-gus', 'Fay', 'Gus');
select tests.throws(
  $$insert into public.replies (wedding_id, guest_id, name, attending)
    select tests.rwid('fay-and-gus'), id, 'x', true from public.guests where name = 'Uncle Hossam'$$,
  '23514', 'replies can only use guests of the same wedding');

-- deleting a guest removes their reply
set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-000000000005', true);
delete from public.guests where name = 'Uncle Hossam';
select tests.eq((select count(*) from public.replies)::int, 2, 'deleting a guest removes their reply');

-- ── Flood limits (0010): the public functions slow down a burst ────────────
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.eq((select count(*) from generate_series(1, 39) i where public.submit_wish('eve-and-ian', 'Guest ' || i, 'Hello') ->> 'ok' = 'true')::int, 39, 'a busy evening of wishes goes through');
select tests.eq(public.submit_wish('eve-and-ian', 'Bot', 'spam') ->> 'error', 'busy', 'the 41st wish in ten minutes waits');
select tests.eq((select count(*) from generate_series(1, 119) i where public.submit_reply('eve-and-ian', null, 'Visitor ' || i, true, 1, null, null) ->> 'ok' = 'true')::int, 119, 'a crowd replying through the general link goes through');
select tests.eq(public.submit_reply('eve-and-ian', null, 'One too many', true, 1, null, null) ->> 'error', 'busy', 'the 121st new general reply in ten minutes waits');
select tests.eq(public.submit_reply('eve-and-ian', null, 'Karim', true, 2, null, null) ->> 'ok', 'true', 'someone already on the list can still change their reply');
select tests.eq(public.submit_reply('eve-and-ian', tests.token('Mariam & family'), null, true, 2, null, null) ->> 'ok', 'true', 'personal links are never slowed down');

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS & data-integrity tests. Runs inside a transaction that is rolled back.
-- Roles are switched exactly as PostgREST does it: SET ROLE + JWT sub claim.
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper that bypasses RLS to look up ids for the assertions below.
create function tests.wid(p_slug text) returns uuid
language sql security definer set search_path = '' as $$
  select id from public.weddings where slug = p_slug;
$$;
grant execute on function tests.wid(text) to anon, authenticated;

insert into auth.users (id, email, raw_user_meta_data) values
  ('a0000000-0000-4000-8000-000000000001', 'alice@test.dev', '{"full_name":"Alice"}'),
  ('b0000000-0000-4000-8000-000000000002', 'bob@test.dev',   '{"full_name":"Bob"}'),
  ('c0000000-0000-4000-8000-000000000003', 'carol@test.dev', '{}'),
  ('d0000000-0000-4000-8000-000000000004', 'dave@test.dev',  '{}');

select tests.eq((select count(*) from public.profiles)::int, 4, 'profile created for every auth user');
select tests.eq((select full_name from public.profiles where id = 'a0000000-0000-4000-8000-000000000001'), 'Alice', 'full_name copied from sign-up metadata');

-- ── Alice creates a wedding ─────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);

insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name, wedding_date, template_id)
values ('a0000000-0000-4000-8000-000000000001', 'alice-and-sam', 'Alice', 'Sam', '2027-06-12', 'cinematic');

select tests.eq((select status::text from public.weddings where slug = 'alice-and-sam'), 'draft', 'new wedding starts as draft');
select tests.eq((select role::text from public.wedding_members where wedding_id = tests.wid('alice-and-sam')), 'owner', 'owner membership created by trigger');
select tests.ok(exists (select 1 from public.wedding_settings where wedding_id = tests.wid('alice-and-sam')), 'settings row created by trigger');
select tests.eq((select visibility::text from public.wedding_settings where wedding_id = tests.wid('alice-and-sam')), 'unlisted', 'new weddings are unlisted (not indexed) by default');
select tests.ok(exists (select 1 from public.wedding_themes where wedding_id = tests.wid('alice-and-sam')), 'theme row created by trigger');

select tests.throws(
  $$insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
    values ('b0000000-0000-4000-8000-000000000002', 'spoofed', 'X', 'Y')$$,
  '42501', 'cannot create a wedding owned by someone else');

select tests.throws(
  $$insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name, status)
    values ('a0000000-0000-4000-8000-000000000001', 'sneaky-publish', 'X', 'Y', 'published')$$,
  '42501', 'cannot insert a wedding as already published');

select tests.throws(
  $$insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
    values ('a0000000-0000-4000-8000-000000000001', 'Bad Slug!', 'X', 'Y')$$,
  '23514', 'slug format enforced');

select tests.throws(
  $$update public.weddings set owner_id = 'b0000000-0000-4000-8000-000000000002' where slug = 'alice-and-sam'$$,
  '42501', 'owner_id is not client-writable');

select tests.throws(
  $$update public.weddings set published_at = now() where slug = 'alice-and-sam'$$,
  '42501', 'published_at is not client-writable');

-- content
insert into public.wedding_sections (wedding_id, type, enabled, sort_order, content)
values
  (tests.wid('alice-and-sam'), 'story',  true,  10, '{"heading":"Our story","body":"We met in Cairo."}'),
  (tests.wid('alice-and-sam'), 'closing', false, 20, '{"heading":"SECRET DRAFT"}');

insert into public.events (wedding_id, kind, title, starts_at, venue_name)
values (tests.wid('alice-and-sam'), 'ceremony', 'Ceremony', '2027-06-12 17:00+02', 'St. Mark');

insert into public.media (wedding_id, kind, purpose, storage_path)
values
  (tests.wid('alice-and-sam'), 'image', 'hero',  'weddings/' || tests.wid('alice-and-sam') || '/hero/a.jpg'),
  (tests.wid('alice-and-sam'), 'audio', 'music', 'weddings/' || tests.wid('alice-and-sam') || '/music/song.mp3');

select tests.throws(
  format($$insert into public.media (wedding_id, kind, purpose, storage_path)
           values (%L, 'image', 'gallery', 'weddings/00000000-0000-4000-8000-000000000000/gallery/x.jpg')$$,
         tests.wid('alice-and-sam')),
  '23514', 'media path must be inside the wedding folder');

-- library photos (no upload needed)
insert into public.media (wedding_id, kind, purpose, storage_path)
values (tests.wid('alice-and-sam'), 'image', 'gallery', 'library:rings');
select tests.ok(exists (select 1 from public.media where storage_path = 'library:rings'), 'a wedding can use a library photo');
select tests.throws(
  format($$insert into public.media (wedding_id, kind, purpose, storage_path) values (%L, 'audio', 'music', 'library:rings')$$, tests.wid('alice-and-sam')),
  '23514', 'library references are images only');
select tests.throws(
  format($$insert into public.media (wedding_id, kind, purpose, storage_path) values (%L, 'image', 'gallery', 'https://evil.example/x.jpg')$$, tests.wid('alice-and-sam')),
  '23514', 'arbitrary external URLs are rejected');

-- storage
select tests.eq(tests.affected(format(
  $$insert into storage.objects (bucket_id, name) values ('wedding-media', 'weddings/%s/hero/a.jpg')$$,
  tests.wid('alice-and-sam'))), 1, 'owner can upload into own wedding folder');

select tests.throws(
  $$insert into storage.objects (bucket_id, name) values ('wedding-media', 'weddings/not-a-uuid/hero/a.jpg')$$,
  '42501', 'malformed storage path rejected');

select tests.throws(
  format($$insert into storage.objects (bucket_id, name) values ('wedding-media', 'weddings/%s/secrets/a.jpg')$$,
         tests.wid('alice-and-sam')),
  '42501', 'unknown storage sub-folder rejected');

-- ── Bob (another user) sees and changes nothing ─────────────────────────────
select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-8000-000000000002', true);

select tests.eq((select count(*) from public.weddings)::int, 0, 'other user cannot see the wedding');
select tests.eq((select count(*) from public.wedding_sections)::int, 0, 'other user cannot see sections');
select tests.eq((select count(*) from public.events)::int, 0, 'other user cannot see events');
select tests.eq((select count(*) from public.media)::int, 0, 'other user cannot see media');
select tests.eq((select count(*) from public.wedding_settings)::int, 0, 'other user cannot see settings');
select tests.eq((select count(*) from public.wedding_members)::int, 0, 'other user cannot see members');
select tests.eq((select count(*) from public.profiles)::int, 1, 'user sees only own profile');
select tests.eq((select count(*) from storage.objects)::int, 0, 'other user cannot list the wedding files');

select tests.eq(tests.affected(format($$update public.weddings set partner_one_name = 'Hacked' where id = %L$$, tests.wid('alice-and-sam'))), 0, 'other user cannot update the wedding');
select tests.eq(tests.affected(format($$update public.wedding_themes set tokens = '{"x":1}' where wedding_id = %L$$, tests.wid('alice-and-sam'))), 0, 'other user cannot update the theme');
select tests.eq(tests.affected(format($$delete from public.weddings where id = %L$$, tests.wid('alice-and-sam'))), 0, 'other user cannot delete the wedding');
select tests.eq(tests.affected(format($$delete from public.events where wedding_id = %L$$, tests.wid('alice-and-sam'))), 0, 'other user cannot delete events');

select tests.throws(
  format($$insert into public.wedding_sections (wedding_id, type) values (%L, 'hero')$$, tests.wid('alice-and-sam')),
  '42501', 'other user cannot add sections');
select tests.throws(
  format($$insert into public.wedding_members (wedding_id, user_id, role) values (%L, 'b0000000-0000-4000-8000-000000000002', 'editor')$$, tests.wid('alice-and-sam')),
  '42501', 'other user cannot add themselves as a member');
select tests.throws(
  format($$insert into storage.objects (bucket_id, name) values ('wedding-media', 'weddings/%s/gallery/evil.jpg')$$, tests.wid('alice-and-sam')),
  '42501', 'other user cannot upload into the wedding folder');

-- ── Collaborators: editor and viewer ────────────────────────────────────────
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);
insert into public.wedding_members (wedding_id, user_id, role) values
  (tests.wid('alice-and-sam'), 'c0000000-0000-4000-8000-000000000003', 'editor'),
  (tests.wid('alice-and-sam'), 'd0000000-0000-4000-8000-000000000004', 'viewer');

select tests.throws(
  format($$insert into public.wedding_members (wedding_id, user_id, role) values (%L, 'b0000000-0000-4000-8000-000000000002', 'owner')$$, tests.wid('alice-and-sam')),
  '42501', 'nobody but the owner can hold the owner role');
select tests.throws(
  format($$delete from public.wedding_members where wedding_id = %L and user_id = 'a0000000-0000-4000-8000-000000000001'$$, tests.wid('alice-and-sam')),
  '42501', 'owner membership cannot be removed');

select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-000000000003', true);
select tests.eq((select count(*) from public.weddings)::int, 1, 'editor can see the wedding');
select tests.eq(tests.affected(format($$update public.weddings set partner_two_name = 'Samuel' where id = %L$$, tests.wid('alice-and-sam'))), 1, 'editor can update the wedding');
select tests.eq(tests.affected(format($$update public.wedding_sections set content = '{"heading":"Edited"}' where wedding_id = %L and type = 'story'$$, tests.wid('alice-and-sam'))), 1, 'editor can update sections');
select tests.eq(tests.affected(format($$delete from public.weddings where id = %L$$, tests.wid('alice-and-sam'))), 0, 'editor cannot delete the wedding');
select tests.throws(
  format($$insert into public.wedding_members (wedding_id, user_id, role) values (%L, 'b0000000-0000-4000-8000-000000000002', 'viewer')$$, tests.wid('alice-and-sam')),
  '42501', 'editor cannot add members');

select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-8000-000000000004', true);
select tests.eq((select count(*) from public.wedding_sections)::int, 2, 'viewer can read sections');
select tests.eq(tests.affected(format($$update public.wedding_sections set enabled = false where wedding_id = %L$$, tests.wid('alice-and-sam'))), 0, 'viewer cannot update sections');
select tests.throws(
  format($$insert into public.events (wedding_id, kind) values (%L, 'other')$$, tests.wid('alice-and-sam')),
  '42501', 'viewer cannot add events');
select tests.throws(
  format($$insert into storage.objects (bucket_id, name) values ('wedding-media', 'weddings/%s/gallery/v.jpg')$$, tests.wid('alice-and-sam')),
  '42501', 'viewer cannot upload files');

-- ── Anonymous visitors ──────────────────────────────────────────────────────
set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select tests.throws($$select * from public.weddings$$,         '42501', 'anon has no access to weddings table');
select tests.throws($$select * from public.wedding_sections$$, '42501', 'anon has no access to sections table');
select tests.throws($$select * from public.media$$,            '42501', 'anon has no access to media table');
select tests.throws($$select * from public.profiles$$,         '42501', 'anon has no access to profiles table');
select tests.throws($$select public.can_view_wedding(gen_random_uuid())$$, '42501', 'anon cannot call access helpers');

select tests.ok(public.get_public_invitation('alice-and-sam') is null, 'draft wedding is not publicly visible');

-- ── Publish ─────────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);
update public.weddings set status = 'published' where slug = 'alice-and-sam';
select tests.ok((select published_at is not null from public.weddings where slug = 'alice-and-sam'), 'publishing sets published_at');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select tests.ok(public.get_public_invitation('alice-and-sam') is not null, 'published wedding is publicly visible');
select tests.ok(public.get_public_invitation('ALICE-AND-SAM') is not null, 'slug lookup is case-insensitive');
select tests.eq(public.get_public_invitation('alice-and-sam') #>> '{wedding,partner_two_name}', 'Samuel', 'public page shows latest edits');
select tests.ok(not (public.get_public_invitation('alice-and-sam') -> 'wedding' ? 'owner_id'), 'owner_id is not exposed publicly');
select tests.ok(not (public.get_public_invitation('alice-and-sam') ? 'members'), 'members are not exposed publicly');
select tests.eq(
  (select s -> 'content' from jsonb_array_elements(public.get_public_invitation('alice-and-sam') -> 'sections') s where s ->> 'type' = 'closing'),
  '{}'::jsonb, 'disabled section content is withheld');
select tests.eq(
  (select s -> 'style' from jsonb_array_elements(public.get_public_invitation('alice-and-sam') -> 'sections') s where s ->> 'type' = 'story'),
  '{}'::jsonb, 'section style hints are part of the public bundle');
select tests.eq(
  (select (s ->> 'enabled')::boolean from jsonb_array_elements(public.get_public_invitation('alice-and-sam') -> 'sections') s where s ->> 'type' = 'closing'),
  false, 'disabled flag is still returned so templates do not re-enable it');
select tests.eq(
  (select count(*) from jsonb_array_elements(public.get_public_invitation('alice-and-sam') -> 'media') m where m ->> 'purpose' = 'music')::int,
  0, 'music file hidden while music is disabled');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);
update public.wedding_settings set music_enabled = true where wedding_id = tests.wid('alice-and-sam');
set local role anon;
select tests.eq(
  (select count(*) from jsonb_array_elements(public.get_public_invitation('alice-and-sam') -> 'media') m where m ->> 'purpose' = 'music')::int,
  1, 'music file exposed once music is enabled');

-- ── Unpublish & delete ──────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);
update public.weddings set status = 'draft' where slug = 'alice-and-sam';
set local role anon;
select tests.ok(public.get_public_invitation('alice-and-sam') is null, 'unpublished wedding disappears from the public');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);
select tests.eq(tests.affected($$delete from public.weddings where slug = 'alice-and-sam'$$), 1, 'owner can delete the wedding');
reset role;
select tests.eq((select count(*) from public.wedding_members)::int, 0, 'members cascade-deleted with the wedding');
select tests.eq((select count(*) from public.wedding_sections)::int, 0, 'sections cascade-deleted with the wedding');
select tests.eq((select count(*) from public.media)::int, 0, 'media rows cascade-deleted with the wedding');

-- ── Section rows default to the template's order ───────────────────────────
reset role;
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
values ('a0000000-0000-4000-8000-000000000001', 'order-check', 'A', 'B');
insert into public.wedding_sections (wedding_id, type, content) values (tests.wid('order-check'), 'story', '{"body":"x"}');
select tests.ok((select sort_order is null from public.wedding_sections where wedding_id = tests.wid('order-check')), 'new section rows keep the template default order (sort_order null)');

-- ── Multiple weddings per user, slug uniqueness ─────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'b0000000-0000-4000-8000-000000000002', true);
insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
values ('b0000000-0000-4000-8000-000000000002', 'bob-one', 'Bob', 'Kim'),
       ('b0000000-0000-4000-8000-000000000002', 'bob-two', 'Bob', 'Lee');
select tests.eq((select count(*) from public.weddings)::int, 2, 'a user can own multiple weddings');
insert into public.media (wedding_id, kind, purpose, storage_path) values
  (tests.wid('bob-one'), 'image', 'hero', 'library:couple'),
  (tests.wid('bob-two'), 'image', 'hero', 'library:couple');
select tests.eq((select count(*) from public.media where storage_path = 'library:couple')::int, 2, 'several weddings can use the same library photo');
select tests.throws(
  $$insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name)
    values ('b0000000-0000-4000-8000-000000000002', 'bob-one', 'Dup', 'Dup')$$,
  '23505', 'slugs are globally unique');

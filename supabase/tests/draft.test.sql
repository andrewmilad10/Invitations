-- create_wedding_from_draft: one transaction, runs under the caller's RLS.

insert into auth.users (id, email) values
  ('e0000000-0000-4000-8000-000000000005', 'eve@test.dev'),
  ('f0000000-0000-4000-8000-000000000006', 'frank@test.dev');

-- Anonymous visitors can't call it.
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select tests.throws($$select public.create_wedding_from_draft('{}'::jsonb)$$, '42501', 'anonymous visitors cannot save drafts');

-- Eve saves her draft.
set local role authenticated;
select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-000000000005', true);

select public.create_wedding_from_draft($${
  "slug": "eve-and-omar",
  "templateId": "romantic",
  "partnerOne": "Eve",
  "partnerTwo": "Omar",
  "weddingDate": "2027-05-20",
  "locale": "ar",
  "timezone": "Africa/Cairo",
  "theme": {"colors": {"accent": "#a45a74"}},
  "events": [
    {"kind": "ceremony", "venueName": "St. Mark", "address": "Cairo", "startsAt": "2027-05-20T14:00:00Z"},
    {"kind": "reception", "venueName": "Nile Ritz", "address": null, "startsAt": null}
  ],
  "libraryPhotos": [{"purpose": "hero", "id": "couple", "sort": 0}, {"purpose": "gallery", "id": "rings", "sort": 1}]
}$$::jsonb);

select tests.eq((select count(*) from public.weddings)::int, 1, 'draft becomes a wedding owned by the user');
select tests.eq((select owner_id from public.weddings where slug = 'eve-and-omar'), 'e0000000-0000-4000-8000-000000000005'::uuid, 'owner is the caller');
select tests.eq((select status::text from public.weddings where slug = 'eve-and-omar'), 'draft', 'saved as a draft (not published)');
select tests.eq((select locale || ' ' || timezone from public.wedding_settings), 'ar Africa/Cairo', 'language and time zone saved');
select tests.eq((select tokens -> 'colors' ->> 'accent' from public.wedding_themes), '#a45a74', 'theme saved');
select tests.eq((select string_agg(kind::text || ':' || coalesce(venue_name, ''), ',' order by sort_order) from public.events), 'ceremony:St. Mark,reception:Nile Ritz', 'events saved in order');
select tests.eq((select string_agg(purpose::text || ':' || storage_path, ',' order by sort_order) from public.media), 'hero:library:couple,gallery:library:rings', 'library photos saved');
select tests.eq((select role::text from public.wedding_members), 'owner', 'owner membership created');

-- Same names again → suffixed slug instead of an error.
select public.create_wedding_from_draft('{"slug":"eve-and-omar","templateId":"classic","partnerOne":"Eve","partnerTwo":"Omar"}'::jsonb);
select tests.ok((select count(*) from public.weddings where slug like 'eve-and-omar-%') = 1, 'taken slug gets a random suffix');

-- Invalid input is rejected atomically (nothing half-created).
select tests.throws(
  $$select public.create_wedding_from_draft('{"slug":"bad-photo","templateId":"romantic","partnerOne":"A","partnerTwo":"B","libraryPhotos":[{"purpose":"hero","id":"https://evil"}]}'::jsonb)$$,
  '23514', 'invalid library photo rejected');
select tests.eq((select count(*) from public.weddings where slug = 'bad-photo')::int, 0, 'a rejected draft leaves nothing behind');

select tests.throws(
  $$select public.create_wedding_from_draft('{"slug":"no-names","templateId":"romantic","partnerOne":"","partnerTwo":"B"}'::jsonb)$$,
  '23514', 'names are required');

-- Frank can't see Eve's wedding.
select set_config('request.jwt.claim.sub', 'f0000000-0000-4000-8000-000000000006', true);
select tests.eq((select count(*) from public.weddings)::int, 0, 'other users cannot see the saved draft');

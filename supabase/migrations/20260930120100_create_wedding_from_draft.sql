-- ═══════════════════════════════════════════════════════════════════════════
-- 0006 · Create a wedding from a no-account draft
-- Saves everything a visitor prepared before signing up in ONE transaction.
-- SECURITY INVOKER: it runs as the signed-in user, so every insert/update is
-- still checked by RLS (the user can only create a wedding they own and edit
-- its rows through their owner membership).
-- Input is validated by the app (Zod) and again by table constraints.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.create_wedding_from_draft(p_draft jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_base text := p_draft ->> 'slug';
  v_slug text;
  v_event jsonb;
  v_photo jsonb;
  v_attempt int := 0;
begin
  if v_user is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  -- Readable slug, with a random suffix if it's taken.
  loop
    v_slug := case
      when v_attempt = 0 and v_base is not null and v_base <> '' then v_base
      else left(coalesce(nullif(v_base, ''), 'wedding'), 55) || '-' || substr(md5(random()::text), 1, 4)
    end;
    begin
      insert into public.weddings (owner_id, slug, partner_one_name, partner_two_name, wedding_date, template_id)
      values (
        v_user,
        v_slug,
        p_draft ->> 'partnerOne',
        p_draft ->> 'partnerTwo',
        nullif(p_draft ->> 'weddingDate', '')::date,
        p_draft ->> 'templateId'
      )
      returning id into v_id;
      exit;
    exception when unique_violation then
      v_attempt := v_attempt + 1;
      if v_attempt >= 6 then
        raise;
      end if;
    end;
  end loop;

  -- Settings and theme rows were created by the on_wedding_created trigger.
  update public.wedding_settings
     set locale = coalesce(p_draft ->> 'locale', locale),
         timezone = coalesce(p_draft ->> 'timezone', timezone)
   where wedding_id = v_id;

  update public.wedding_themes
     set tokens = coalesce(p_draft -> 'theme', '{}'::jsonb)
   where wedding_id = v_id;

  for v_event in select * from jsonb_array_elements(coalesce(p_draft -> 'events', '[]'::jsonb)) loop
    insert into public.events (wedding_id, kind, title, venue_name, address, starts_at, sort_order)
    values (
      v_id,
      (v_event ->> 'kind')::public.event_kind,
      initcap(v_event ->> 'kind'),
      v_event ->> 'venueName',
      v_event ->> 'address',
      nullif(v_event ->> 'startsAt', '')::timestamptz,
      case v_event ->> 'kind' when 'ceremony' then 0 else 1 end
    );
  end loop;

  for v_photo in select * from jsonb_array_elements(coalesce(p_draft -> 'libraryPhotos', '[]'::jsonb)) loop
    insert into public.media (wedding_id, kind, purpose, storage_path, sort_order)
    values (
      v_id,
      'image',
      (v_photo ->> 'purpose')::public.media_purpose,
      'library:' || (v_photo ->> 'id'),
      coalesce((v_photo ->> 'sort')::int, 0)
    );
  end loop;

  return v_id;
end;
$$;

revoke all on function public.create_wedding_from_draft(jsonb) from public, anon;
grant execute on function public.create_wedding_from_draft(jsonb) to authenticated;

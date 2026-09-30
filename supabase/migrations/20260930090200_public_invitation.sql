-- ═══════════════════════════════════════════════════════════════════════════
-- 0003 · Public invitation read path
-- The ONLY way unauthenticated visitors read wedding data. Returns a
-- WeddingBundle (see src/core/wedding/bundle.ts) for a *published* wedding,
-- containing whitelisted fields and *enabled* sections only.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.get_public_invitation(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'wedding', jsonb_build_object(
      'id',               w.id,
      'slug',             w.slug,
      'partner_one_name', w.partner_one_name,
      'partner_two_name', w.partner_two_name,
      'wedding_date',     w.wedding_date,
      'template_id',      w.template_id,
      'status',           w.status,
      'published_at',     w.published_at,
      'updated_at',       w.updated_at
    ),
    'settings', (
      select jsonb_build_object(
        'locale',        s.locale,
        'timezone',      s.timezone,
        'visibility',    s.visibility,
        'music_enabled', s.music_enabled
      )
      from public.wedding_settings s where s.wedding_id = w.id
    ),
    'theme', (
      select jsonb_build_object('tokens', t.tokens)
      from public.wedding_themes t where t.wedding_id = w.id
    ),
    -- Disabled rows ARE returned (enabled=false) so a section the couple turned
    -- off doesn't fall back to "enabled by template default". Their content is
    -- withheld.
    'sections', coalesce((
      select jsonb_agg(jsonb_build_object(
        'type',       ws.type,
        'enabled',    ws.enabled,
        'sort_order', ws.sort_order,
        'content',    case when ws.enabled then ws.content else '{}'::jsonb end
      ) order by ws.sort_order nulls last, ws.type)
      from public.wedding_sections ws where ws.wedding_id = w.id
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',          e.id,
        'kind',        e.kind,
        'title',       e.title,
        'starts_at',   e.starts_at,
        'ends_at',     e.ends_at,
        'venue_name',  e.venue_name,
        'address',     e.address,
        'latitude',    e.latitude,
        'longitude',   e.longitude,
        'map_url',     e.map_url,
        'description', e.description,
        'sort_order',  e.sort_order
      ) order by e.sort_order, e.starts_at nulls last)
      from public.events e where e.wedding_id = w.id
    ), '[]'::jsonb),
    'media', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',           m.id,
        'kind',         m.kind,
        'purpose',      m.purpose,
        'storage_path', m.storage_path,
        'alt_text',     m.alt_text,
        'width',        m.width,
        'height',       m.height,
        'sort_order',   m.sort_order
      ) order by m.purpose, m.sort_order, m.created_at)
      from public.media m
      where m.wedding_id = w.id
        -- music files are only exposed when the couple has music switched on
        and (m.purpose <> 'music' or exists (
          select 1 from public.wedding_settings s2
          where s2.wedding_id = w.id and s2.music_enabled
        ))
    ), '[]'::jsonb)
  )
  from public.weddings w
  where w.slug = lower(p_slug)
    and w.status = 'published';
$$;

revoke all on function public.get_public_invitation(text) from public;
grant execute on function public.get_public_invitation(text) to anon, authenticated;

comment on function public.get_public_invitation(text) is
  'Public, read-only view of a published wedding. Whitelisted fields only.';

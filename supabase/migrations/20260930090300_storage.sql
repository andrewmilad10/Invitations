-- ═══════════════════════════════════════════════════════════════════════════
-- 0004 · Storage: wedding media
-- Bucket layout: weddings/{weddingId}/{hero|gallery|music|og}/{uuid}.{ext}
-- Public read (random file names); writes require edit rights on the wedding
-- named in the path.
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media',
  'wedding-media',
  true,
  15728640, -- 15 MB
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif',
    'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav'
  ]
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Extract the wedding id from an object path, or NULL if it isn't one of ours.
create or replace function public.media_path_wedding_id(p_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  parts text[] := string_to_array(p_name, '/');
begin
  if array_length(parts, 1) <> 4
     or parts[1] <> 'weddings'
     or parts[3] not in ('hero', 'gallery', 'music', 'og')
     or parts[2] !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  then
    return null;
  end if;
  return parts[2]::uuid;
end;
$$;

grant execute on function public.media_path_wedding_id(text) to authenticated;

create policy "wedding-media: members list"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'wedding-media'
    and public.can_view_wedding(public.media_path_wedding_id(name))
  );

create policy "wedding-media: editors upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'wedding-media'
    and public.can_edit_wedding(public.media_path_wedding_id(name))
  );

create policy "wedding-media: editors update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'wedding-media'
    and public.can_edit_wedding(public.media_path_wedding_id(name))
  )
  with check (
    bucket_id = 'wedding-media'
    and public.can_edit_wedding(public.media_path_wedding_id(name))
  );

create policy "wedding-media: editors delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'wedding-media'
    and public.can_edit_wedding(public.media_path_wedding_id(name))
  );

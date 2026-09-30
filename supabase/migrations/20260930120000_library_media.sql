-- ═══════════════════════════════════════════════════════════════════════════
-- 0005 · Library media
-- A media row may reference a photo from the curated library
-- (storage_path = 'library:<id>') instead of an uploaded file. Visitors can
-- pick library photos before they have an account (and a Storage folder),
-- and the choice is kept when their draft becomes a wedding.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.media drop constraint media_path_in_wedding_folder;

alter table public.media add constraint media_path_in_wedding_folder check (
  storage_path like 'weddings/' || wedding_id::text || '/%'
  or (storage_path ~ '^library:[a-z0-9-]{1,40}$' and kind = 'image')
);

-- storage_path is globally unique for uploads, but many weddings may use the
-- same library photo.
alter table public.media drop constraint media_storage_path_key;
create unique index media_upload_path_key on public.media (storage_path) where storage_path like 'weddings/%';

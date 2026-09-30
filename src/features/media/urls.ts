import { PHOTO_LIBRARY, type LibraryPhotoId } from "./library";

/** Storage bucket for all wedding media (see supabase/migrations/*_storage.sql). */
export const MEDIA_BUCKET = "wedding-media";

/** Prefix for media rows that reference the curated photo library instead of an uploaded file. */
export const LIBRARY_PREFIX = "library:";

export function libraryPath(id: LibraryPhotoId): string {
  return `${LIBRARY_PREFIX}${id}`;
}

export function isLibraryPath(storagePath: string): boolean {
  return storagePath.startsWith(LIBRARY_PREFIX);
}

/** True for paths that are real objects in our Storage bucket. */
export function isStoragePath(storagePath: string): boolean {
  return storagePath.startsWith("weddings/");
}

/**
 * URL for a media path. Safe on server and client.
 * - `library:<id>` → the curated library photo
 * - `weddings/…`   → public Supabase Storage URL
 * - absolute URLs, `/paths`, `blob:` and `data:` URLs are returned unchanged
 *   (draft previews use blob: URLs for photos not uploaded yet)
 */
export function publicMediaUrl(storagePath: string): string {
  // Draft photos that haven't been resolved to a blob: URL have no public URL.
  if (storagePath.startsWith("local:")) return "";
  if (isLibraryPath(storagePath)) {
    const photo = PHOTO_LIBRARY[storagePath.slice(LIBRARY_PREFIX.length) as LibraryPhotoId];
    return photo ? photo.url : "";
  }
  if (/^(https?:)?\/\//.test(storagePath) || storagePath.startsWith("/") || /^(blob|data):/.test(storagePath)) return storagePath;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

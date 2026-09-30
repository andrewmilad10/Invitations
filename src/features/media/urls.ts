/** Storage bucket for all wedding media (see supabase/migrations/*_storage.sql). */
export const MEDIA_BUCKET = "wedding-media";

/**
 * Public URL for an object in the wedding-media bucket. Safe on server and
 * client. Paths that are already URLs or absolute paths (sample fixtures)
 * are returned unchanged.
 */
export function publicMediaUrl(storagePath: string): string {
  if (/^(https?:)?\/\//.test(storagePath) || storagePath.startsWith("/")) return storagePath;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

/**
 * What a file really is, from its first bytes ("magic numbers"), not from its
 * name or the type the browser claims. Used on the server before an upload is
 * accepted, so a renamed program or web page can never pass as a photo.
 */
export type SniffedType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif"
  | "audio/mpeg"
  | "audio/mp4"
  | "audio/aac"
  | "audio/ogg"
  | "audio/wav";

const ascii = (b: Uint8Array, at: number, text: string) => text.split("").every((c, i) => b[at + i] === c.charCodeAt(0));

export function sniffMediaType(b: Uint8Array): SniffedType | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && ascii(b, 1, "PNG\r\n\x1a\n")) return "image/png";
  if (ascii(b, 0, "RIFF") && ascii(b, 8, "WEBP")) return "image/webp";
  if (ascii(b, 0, "RIFF") && ascii(b, 8, "WAVE")) return "audio/wav";
  if (ascii(b, 4, "ftyp")) {
    const brand = String.fromCharCode(...b.slice(8, 12));
    if (brand === "avif" || brand === "avis") return "image/avif";
    if (["M4A ", "M4B ", "mp42", "isom", "mp41", "dash"].includes(brand)) return "audio/mp4";
    return null;
  }
  if (ascii(b, 0, "OggS")) return "audio/ogg";
  if (ascii(b, 0, "ID3")) return "audio/mpeg";
  // MPEG audio frame sync: 11 set bits; layer bits tell MP3 from AAC (ADTS)
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return (b[1] & 0x06) === 0 ? "audio/aac" : "audio/mpeg";
  return null;
}

const IMAGES: readonly SniffedType[] = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const AUDIO: readonly SniffedType[] = ["audio/mpeg", "audio/mp4", "audio/aac", "audio/ogg", "audio/wav"];

/** True when the bytes are a real image (or, for music, a real audio file). */
export function isAllowedMedia(bytes: Uint8Array, purpose: "hero" | "gallery" | "music"): boolean {
  const t = sniffMediaType(bytes);
  return t !== null && (purpose === "music" ? AUDIO : IMAGES).includes(t);
}

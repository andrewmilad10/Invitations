/**
 * Curated photo library (Unsplash, free licence; hotlinked as Unsplash
 * recommends). Used by the marketing site, template demos and the
 * no-account "try" flow, where visitors can pick a photo before they have
 * anywhere to upload their own.
 *
 * Replace with owned photography before launch if preferred — only this
 * file references these URLs.
 */
export const LIBRARY_HOST = "images.unsplash.com";

export interface LibraryPhoto {
  id: string;
  /** Base URL; sizing is done by next/image. */
  url: string;
  alt: string;
  orientation: "landscape" | "portrait" | "square";
}

const u = (id: string) => `https://${LIBRARY_HOST}/photo-${id}?auto=format&fit=crop&w=2400&q=80`;

export const PHOTO_LIBRARY = {
  couple: { id: "couple", url: u("1519741497674-611481863552"), alt: "A couple embracing at their wedding", orientation: "landscape" },
  rings: { id: "rings", url: u("1511285560929-80b456fea0bc"), alt: "Two wedding rings", orientation: "landscape" },
  celebration: { id: "celebration", url: u("1465495976277-4387d4b0e4a6"), alt: "Guests celebrating at a wedding", orientation: "portrait" },
  flowers: { id: "flowers", url: u("1507504031003-b417219a0fde"), alt: "Wedding flowers", orientation: "landscape" },
  reception: { id: "reception", url: u("1519225421980-715cb0215aed"), alt: "A wedding reception table", orientation: "landscape" },
  detail: { id: "detail", url: u("1518623489648-a173ef7824f3"), alt: "A romantic wedding detail", orientation: "landscape" },
  outdoors: { id: "outdoors", url: u("1522673607200-164d1b6ce486"), alt: "A couple outdoors", orientation: "portrait" },
  bouquet: { id: "bouquet", url: u("1523438885200-e635ba2c371e"), alt: "A bridal bouquet", orientation: "landscape" },
  venue: { id: "venue", url: u("1519167758481-83f550bb49b3"), alt: "A wedding venue", orientation: "landscape" },
} satisfies Record<string, LibraryPhoto>;

export type LibraryPhotoId = keyof typeof PHOTO_LIBRARY;

export function isLibraryUrl(url: string): boolean {
  try {
    return new URL(url).hostname === LIBRARY_HOST;
  } catch {
    return false;
  }
}

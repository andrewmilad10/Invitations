/**
 * Recordings of each website design for the marketing pages, made from the
 * real design (scripts/record-plays.py): `<id>-open.mp4` is its opening as a
 * guest sees it after tapping (only designs that have one; .webm alongside), `<id>-first.webp`
 * that opening's first frame, and `<id>-page.webp` the whole site after the
 * opening, top to bottom. Re-record a design when it changes.
 */
const OPENS = new Set<string>([
  "blush-lace",
  "burgundy-envelope",
  "cotton-press",
  "garden-gate",
  "henna-tent",
  "ivory-veil",
  "lemon-terrace",
  "linen-meadow",
  "moonlit-nile",
  "olive-courtyard",
  "opening-night",
  "paper-fan",
  "pressed-garden",
  "rose-marble",
  "set-sail",
  "sketchbook",
  "something-blue",
  "swan-lake",
  "swan-pond",
  "the-gate",
  "villa-rosa",
  "wisteria-lake",
]);

export const hasOpening = (id: string) => OPENS.has(id);

export const playSrc = (id: string) => ({
  page: `/marketing/play/${id}-page.webp`,
  open: `/marketing/play/${id}-open.mp4`,
  openWebm: `/marketing/play/${id}-open.webm`,
  first: `/marketing/play/${id}-first.webp`,
});

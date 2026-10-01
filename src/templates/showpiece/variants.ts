/**
 * Showpiece variants and their "look".
 *
 * A variant (the manifest's renderer key) owns its hero, opening and
 * emblem. A look owns how the shared sections are dressed (cards, countdown,
 * timeline, gallery) and which colour roles the palette uses:
 *
 * - gate:      bg/surface = paper, fg = ink, accent = a deep room colour
 *              (bands, buttons), accent-fg = the gold on it.
 * - nile:      bg/surface = night, fg = pale text, muted = mist,
 *              accent = a glowing colour, accent-fg = text on it.
 * - herbarium: bg/surface = paper, fg = ink, muted = a warm detail colour,
 *              accent = a deep colour for buttons, accent-fg = paper.
 * - toast:     bg/surface = the room at night, fg = pearl,
 *              muted and accent = gold, accent-fg = text on gold.
 */
export const LOOKS = {
  gate: "gate",
  nile: "nile",
  herbarium: "herbarium",
  toast: "toast",
  // Creative
  stars: "nile",
  popup: "herbarium",
  glass: "gate",
  keepsake: "gate",
  // Egypt's venues
  giza: "gate",
  baron: "toast",
  montaza: "herbarium",
  luxor: "gate",
} as const;

export type Variant = keyof typeof LOOKS;
export type Look = (typeof LOOKS)[Variant];

export const SHOWPIECE_VARIANTS = Object.keys(LOOKS) as Variant[];

export const lookOf = (v: Variant): Look => LOOKS[v] ?? "gate";

/** How long each opening plays before the overlay leaves, and how long leaving takes (ms). */
export const TIMING: Record<Variant, [number, number]> = {
  gate: [1700, 900],
  nile: [2600, 1000],
  herbarium: [2500, 900],
  toast: [2300, 1400],
  stars: [2600, 1100],
  popup: [2400, 900],
  glass: [2700, 1000],
  keepsake: [2600, 1000],
  giza: [2900, 1100],
  baron: [2800, 1000],
  montaza: [2000, 1200],
  luxor: [2700, 900],
};

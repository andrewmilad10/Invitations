/**
 * Designs with a photographed phone screen in public/marketing/screens
 * (<id>-hero.webp: the first screen of the site; <id>-opening.webp: the opening).
 * Showing these instead of the live design keeps the marketing pages light:
 * nothing re-renders as you scroll. Re-shoot them when a design changes.
 */
export const SCREENS = new Set([
  "swan-lake",
  "ivory-veil", "blush-lace", "wisteria-lake", "gouna-lagoon", "gouna-sunset", "ribbon-pearls", "peony-blush", "wild-posy", "burgundy-envelope", "pressed-garden", "paper-fan", "garden-gate", "lemon-terrace", "linen-meadow", "opening-night", "olive-courtyard", "henna-tent", "sketchbook",
]);
export const screenSrc = (id: string, kind: "hero" | "opening") => `/marketing/screens/${id}-${kind}.webp`;

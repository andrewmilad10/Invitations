/**
 * Designs with a photographed phone screen in public/marketing/screens
 * (<id>-hero.webp: the first screen of the site; <id>-opening.webp: the opening).
 * Showing these instead of the live design keeps the marketing pages light:
 * nothing re-renders as you scroll. Re-shoot them when a design changes.
 */
export const SCREENS = new Set([
  "swan-lake", "villa-rosa", "something-blue", "cotton-press", "rose-marble",
  "burgundy-envelope", "the-gate", "moonlit-nile", "pressed-garden", "swan-pond", "set-sail", "message-in-a-bottle", "garden-gate", "lemon-terrace",
]);
export const screenSrc = (id: string, kind: "hero" | "opening") => `/marketing/screens/${id}-${kind}.webp`;

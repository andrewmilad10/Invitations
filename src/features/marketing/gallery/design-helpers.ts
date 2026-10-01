import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme } from "@/core/theme/tokens";
import { productHref, productOf } from "../products";

/*
 * Plain helpers for design cards. They live outside the client component so
 * server code can call them too, and they don't pull the template registry
 * into the browser.
 */

/** Shared-element name: a gallery card and the card on its design page. */
export const morphName = (id: string) => `design-card-${id}`;

/** A design's product page (in the collection it belongs to). */
export function designHref(template: Pick<TemplateManifest, "id" | "features">, paletteId: string | null) {
  const q = new URLSearchParams();
  if (paletteId) q.set("palette", paletteId);
  return productHref(productOf(template), template.id, q);
}

/** Couples used only to make gallery cards feel varied; not real weddings. */
const CARD_COUPLES: [string, string, string][] = [
  ["Layla", "Omar", "14 October"],
  ["Olivia", "Daniel", "20 June"],
  ["Nour", "Karim", "12 April"],
  ["Salma", "Youssef", "8 September"],
  ["Mariam", "Andrew", "21 March"],
  ["Hana", "Adam", "2 May"],
  ["Grace", "Henry", "30 August"],
  ["Farida", "Ziad", "17 November"],
];

export function cardCouple(index: number) {
  return CARD_COUPLES[index % CARD_COUPLES.length];
}

/** Two-tone dot for a palette: its paper colour and its accent. */
export function paletteSwatch(template: TemplateManifest, paletteId: string) {
  const palette = template.palettes.find((p) => p.id === paletteId) ?? template.palettes[0];
  const c = resolveTheme(template.themeDefaults, { colors: palette.colors }).colors;
  return { label: palette.label, background: `linear-gradient(135deg, ${c.surface} 0 50%, ${c.accent} 50% 100%)` };
}

export function paletteOverrides(template: TemplateManifest, paletteId: string | null) {
  const palette = template.palettes.find((p) => p.id === paletteId);
  return palette && Object.keys(palette.colors).length ? { colors: palette.colors } : undefined;
}

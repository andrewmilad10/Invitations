import type { CardShape, StationeryLayout, TemplateCategory, TemplateManifest } from "@/core/template/manifest";
import type { SectionType } from "@/core/sections/registry";
import type { FontKey } from "@/core/theme/fonts";
import type { ColorFamily, PhotoTone, ThemeTokens } from "@/core/theme/tokens";

/**
 * Helpers for a family of templates that share one layout (renderer) and
 * differ in palette, type and photo treatment. Each palette is a complete
 * colour set so every preset reads as its own finished product.
 */

export type Colors = ThemeTokens["colors"];
export interface Palette {
  id: string;
  label: string;
  family: ColorFamily;
  colors: Colors;
}

/** bg, surface, fg, muted, accent, accent-fg, border. */
export const colors = (bg: string, surface: string, fg: string, muted: string, accent: string, accentFg: string, border: string): Colors => ({
  background: bg, surface, foreground: fg, muted, accent, accentForeground: accentFg, border,
});

export interface LayoutTemplateSpec {
  id: string;
  name: string;
  tagline: string;
  description: string;
  categories: TemplateCategory[];
  palettes: Palette[];
  fonts: { heading: FontKey; body: FontKey; accent: FontKey };
  photoTone?: PhotoTone;
  card: { layout: StationeryLayout; shape?: CardShape };
}

export function layoutTemplate(
  renderer: string,
  sections: readonly SectionType[],
  s: LayoutTemplateSpec,
  options: { defaultDisabled?: readonly SectionType[] } = {},
): TemplateManifest {
  const [first, ...rest] = s.palettes;
  return {
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    description: s.description,
    renderer,
    categories: s.categories,
    stationery: { ornament: "none", layout: s.card.layout, shape: s.card.shape },
    supportedSections: sections,
    defaultSectionOrder: sections,
    defaultDisabled: options.defaultDisabled,
    themeDefaults: {
      colors: { ...first.colors },
      fonts: { ...s.fonts },
      radius: 0,
      shadow: "none",
      photoTone: s.photoTone ?? "natural",
    },
    palettes: [{ id: first.id, label: first.label, family: first.family, colors: {} }, ...rest.map((p) => ({ ...p, colors: { ...p.colors } }))],
    features: { opening: "none", music: true, hero: "photo" },
    status: "available",
  };
}

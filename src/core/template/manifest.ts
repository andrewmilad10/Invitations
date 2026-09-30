import type { SectionType } from "../sections/registry";
import type { ThemePalette, ThemeTokens } from "../theme/tokens";
import type { CardOptionOverrides, Orientation } from "../card/options";

/**
 * Gallery styles. A template can belong to several; the first is its main
 * style. The first nine are shown as the gallery's style tiles.
 */
export const TEMPLATE_CATEGORIES = [
  "elegant",
  "minimalist",
  "floral",
  "typography",
  "monogram",
  "rustic",
  "greenery",
  "vintage",
  "whimsical",
  "photo",
  "classic",
  "modern",
  "romantic",
  "luxury",
  "botanical",
  "outdoor",
  "traditional",
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export function isTemplateCategory(value: unknown): value is TemplateCategory {
  return typeof value === "string" && (TEMPLATE_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Decorative motif of a design, drawn in the theme's accent colour. All
 * motifs are original line art (src/templates/shared/stationery).
 */
export const STATIONERY_ORNAMENTS = [
  "none", "crest", "floral", "hairline", "leaves", "gilded", "seal", "rule",
  "garland", "stems", "wildflowers", "double-border", "wreath", "deco", "scallop",
  "olive", "celestial", "confetti", "tile", "watercolor", "ribbon", "citrus",
  "flourish", "twine", "cascade", "rose-corners", "ornate", "petals",
  "vines", "meadow-border", "line-florals", "florals-band", "peonies",
] as const;
export type StationeryOrnament = (typeof STATIONERY_ORNAMENTS)[number];

/** How the words (and photos) are arranged on the card. */
export const STATIONERY_LAYOUTS = [
  "classic", "script", "typographic", "monogram", "photo-top", "photo-full", "photo-grid", "polaroid", "photo-script",
  "magazine", "framed", "postcard",
  "refined", "photo-overlay", "asymmetric", "spaced", "photo-side",
] as const;
export type StationeryLayout = (typeof STATIONERY_LAYOUTS)[number];

/** Card silhouette. */
export const CARD_SHAPES = ["portrait", "square", "arch", "landscape", "corner"] as const;
export type CardShape = (typeof CARD_SHAPES)[number];

export interface StationeryArt {
  ornament: StationeryOrnament;
  layout?: StationeryLayout;
  shape?: CardShape;
  /** The design's own finish, e.g. gold foil or letterpress (see core/card/options). */
  finish?: CardOptionOverrides;
  /** Pressed into the paper (letterpress) — shown as a badge and filter. */
  letterpress?: boolean;
}

export const PHOTO_LAYOUTS: readonly StationeryLayout[] = [
  "photo-top", "photo-full", "photo-grid", "polaroid", "photo-script", "magazine", "framed", "postcard", "photo-overlay", "photo-side",
];

/** Resolved art with defaults filled in. */
export function stationeryArt(art: StationeryArt): Required<StationeryArt> {
  return { ornament: art.ornament, layout: art.layout ?? "classic", shape: art.shape ?? "portrait", finish: art.finish ?? {}, letterpress: art.letterpress ?? false };
}

/** Shapes that can be turned: a portrait design can print landscape and back. */
export function canRotate(shape: CardShape): boolean {
  return shape === "portrait" || shape === "landscape";
}

/** The design's shape once the chosen orientation is applied. */
export function orientedShape(shape: CardShape, orientation: Orientation | undefined): CardShape {
  if (!canRotate(shape) || !orientation) return shape;
  return orientation;
}

/** The shape a design is drawn in once the finishing options are applied. */
export function cardShape(art: StationeryArt, options?: CardOptionOverrides): CardShape {
  const orientation = options?.orientation ?? designCardDefaults(art).orientation;
  return orientedShape(art.shape ?? "portrait", orientation);
}

/** The design's default finishing options (its own foil, orientation…). */
export function designCardDefaults(art: StationeryArt): CardOptionOverrides {
  return { ...(art.shape === "landscape" ? { orientation: "landscape" as const } : {}), ...art.finish };
}

export function usesPhoto(art: StationeryArt): boolean {
  return PHOTO_LAYOUTS.includes(art.layout ?? "classic");
}

/**
 * The divider motif used between sections of the full invitation. Many
 * card ornaments share one family, so every design has matching dividers
 * without each needing its own.
 */
export type DecorFamily = "plain" | "crest" | "floral" | "leaves" | "gilded";

const DECOR_FAMILY: Record<StationeryOrnament, DecorFamily> = {
  none: "plain", hairline: "plain", rule: "plain", seal: "plain", "double-border": "plain", confetti: "plain", tile: "plain", twine: "plain",
  crest: "crest", wreath: "crest", ornate: "crest", ribbon: "crest", celestial: "crest",
  vines: "leaves", "meadow-border": "floral", "line-florals": "floral", "florals-band": "floral", peonies: "floral",
  floral: "floral", garland: "floral", wildflowers: "floral", scallop: "floral", watercolor: "floral", "rose-corners": "floral", petals: "floral", flourish: "floral",
  leaves: "leaves", stems: "leaves", olive: "leaves", cascade: "leaves", citrus: "leaves",
  gilded: "gilded", deco: "gilded",
};

export function decorFamily(ornament: StationeryOrnament): DecorFamily {
  return DECOR_FAMILY[ornament] ?? "plain";
}

/**
 * Template manifest — the data half of a template (no React). Imported by the
 * dashboard, the wizard, the model builder and tests without pulling in any
 * rendering code or animation libraries.
 */
export interface TemplateManifest {
  /** Stored in weddings.template_id. Never rename once released. */
  id: string;
  name: string;
  tagline: string;
  description: string;
  /**
   * Which layout renders it (a key in src/templates/renderers.tsx). Several
   * templates can share a layout and differ in theme, type, decoration and
   * features — or a template can bring its own renderer.
   */
  renderer: string;
  /** Gallery categories, most characteristic first. */
  categories: readonly TemplateCategory[];
  /**
   * The design's card: motif, layout and shape. Drawn in galleries, and as
   * the opening screen of the invitation when `features.hero` is "card".
   */
  stationery: StationeryArt;
  /** Designs sharing a family are variants (e.g. portrait / square) of each other. */
  family?: string;
  /** Shown with a "New" badge; also sorts first under "Newest". */
  isNew?: boolean;
  /** Section types this template can render. Others are kept in the data but not shown. */
  supportedSections: readonly SectionType[];
  /** Default order of sections (subset of supportedSections). */
  defaultSectionOrder: readonly SectionType[];
  /** Sections that start switched off for new weddings. */
  defaultDisabled?: readonly SectionType[];
  /** Complete token set; couples' overrides are merged on top. */
  themeDefaults: ThemeTokens;
  /** One-click color presets in the theme editor. The first is the default look. */
  palettes: readonly ThemePalette[];
  features: {
    opening: "envelope" | "none";
    music: boolean;
    /**
     * First screen of the invitation: a full-bleed photo with the names
     * ("photo", default), or the design's card itself ("card").
     */
    hero?: "photo" | "card";
  };
  status: "available" | "beta" | "hidden";
}

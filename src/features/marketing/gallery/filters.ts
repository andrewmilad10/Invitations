import { FOILS, type CardOptionOverrides, type Foil } from "@/core/card/options";
import { canRotate, CARD_SHAPES, designCardDefaults, isTemplateCategory, usesPhoto, type CardShape, type TemplateCategory, type TemplateManifest } from "@/core/template/manifest";
import { COLOR_FAMILIES, type ColorFamily } from "@/core/theme/tokens";

/**
 * Gallery filtering and sorting — pure, so it runs the same on the server
 * (first render, from the URL) and in the browser (as filters change).
 */

export const SORTS = { featured: "Featured", newest: "Newest", az: "A–Z" } as const;
export type Sort = keyof typeof SORTS;

export const ORIENTATION_FILTERS = ["portrait", "landscape", "square"] as const;
export type OrientationFilter = (typeof ORIENTATION_FILTERS)[number];

export interface GalleryFilters {
  style: TemplateCategory | null;
  color: ColorFamily | null;
  shape: CardShape | null;
  photo: "with" | "without" | null;
  /** Show every card stamped in this foil (foil designs first). */
  foil: Exclude<Foil, "none"> | null;
  letterpress: boolean;
  orientation: OrientationFilter | null;
  sort: Sort;
  saved: boolean;
}

export const NO_FILTERS: GalleryFilters = { style: null, color: null, shape: null, photo: null, foil: null, letterpress: false, orientation: null, sort: "featured", saved: false };

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseFilters(params: Params): GalleryFilters {
  const style = one(params.style);
  const color = one(params.color);
  const shape = one(params.shape);
  const photo = one(params.photo);
  const sort = one(params.sort);
  const foil = one(params.foil);
  const orientation = one(params.orientation);
  return {
    style: isTemplateCategory(style) ? style : null,
    color: (COLOR_FAMILIES as readonly string[]).includes(color ?? "") ? (color as ColorFamily) : null,
    shape: (CARD_SHAPES as readonly string[]).includes(shape ?? "") ? (shape as CardShape) : null,
    photo: photo === "with" || photo === "without" ? photo : null,
    foil: foil && foil !== "none" && (FOILS as readonly string[]).includes(foil) ? (foil as Exclude<Foil, "none">) : null,
    letterpress: one(params.letterpress) === "1",
    orientation: (ORIENTATION_FILTERS as readonly string[]).includes(orientation ?? "") ? (orientation as OrientationFilter) : null,
    sort: sort && sort in SORTS ? (sort as Sort) : "featured",
    saved: one(params.saved) === "1",
  };
}

/** Query string for the filters (only what differs from the defaults). */
export function filtersToQuery(f: GalleryFilters): string {
  const q = new URLSearchParams();
  if (f.style) q.set("style", f.style);
  if (f.color) q.set("color", f.color);
  if (f.shape) q.set("shape", f.shape);
  if (f.photo) q.set("photo", f.photo);
  if (f.foil) q.set("foil", f.foil);
  if (f.letterpress) q.set("letterpress", "1");
  if (f.orientation) q.set("orientation", f.orientation);
  if (f.sort !== "featured") q.set("sort", f.sort);
  if (f.saved) q.set("saved", "1");
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(f: GalleryFilters): number {
  return [f.style, f.color, f.shape, f.photo, f.foil, f.orientation].filter(Boolean).length + (f.saved ? 1 : 0) + (f.letterpress ? 1 : 0);
}

export interface GalleryItem {
  template: TemplateManifest;
  /** Palette to show the card in (the one matching the colour filter). */
  paletteId: string;
  /** Finish to preview the card in (the foil or orientation filtered for). */
  options?: CardOptionOverrides;
}

/** Does the design come stamped in foil? */
export const hasFoil = (t: TemplateManifest) => (designCardDefaults(t.stationery).foil ?? "none") !== "none";

export function shapeOf(t: TemplateManifest): CardShape {
  return t.stationery.shape ?? "portrait";
}

/** Templates matching the filters, in the chosen order (input order = featured). */
export function filterTemplates(all: readonly TemplateManifest[], f: GalleryFilters, saved: readonly string[] = []): GalleryItem[] {
  const items: GalleryItem[] = [];
  for (const t of all) {
    if (f.style && !t.categories.includes(f.style)) continue;
    if (f.shape && shapeOf(t) !== f.shape) continue;
    if (f.photo === "with" && !usesPhoto(t.stationery)) continue;
    if (f.photo === "without" && usesPhoto(t.stationery)) continue;
    if (f.saved && !saved.includes(t.id)) continue;
    if (f.letterpress && !t.stationery.letterpress) continue;
    const shape = shapeOf(t);
    if (f.orientation === "square" && shape !== "square") continue;
    if (f.orientation === "landscape" && !canRotate(shape)) continue;
    if (f.orientation === "portrait" && (shape === "square" || shape === "landscape" ? !canRotate(shape) : false)) continue;
    const palette = f.color ? t.palettes.find((p) => p.family === f.color) : t.palettes[0];
    if (!palette) continue;
    const options: CardOptionOverrides = {};
    if (f.foil) options.foil = f.foil;
    if (f.orientation === "landscape" || (f.orientation === "portrait" && canRotate(shape))) options.orientation = f.orientation;
    items.push({ template: t, paletteId: palette.id, options: Object.keys(options).length ? options : undefined });
  }
  if (f.foil) items.sort((a, b) => Number(hasFoil(b.template)) - Number(hasFoil(a.template)));
  if (f.sort === "az") items.sort((a, b) => a.template.name.localeCompare(b.template.name));
  if (f.sort === "newest") items.sort((a, b) => Number(Boolean(b.template.isNew)) - Number(Boolean(a.template.isNew)));
  return items;
}

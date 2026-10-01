import { z } from "zod";

/**
 * Card finishing options — how a design is printed (or drawn for download):
 * orientation, silhouette (corner cut), foil and paper. They are independent
 * of the design and of the colour theme, so any design can take any finish.
 * Stored with the theme overrides under `card` (wedding_themes.tokens).
 */

export const ORIENTATIONS = ["portrait", "landscape"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const SILHOUETTES = ["standard", "rounded", "scalloped"] as const;
export type Silhouette = (typeof SILHOUETTES)[number];

export const FOILS = ["none", "gold", "rose-gold", "silver"] as const;
export type Foil = (typeof FOILS)[number];

export const PAPERS = ["smooth", "eggshell", "linen", "recycled", "pearlescent", "natural", "double-thick", "triple-thick"] as const;
export type Paper = (typeof PAPERS)[number];

export const BLESSINGS = ["none", "bismillah"] as const;
export type Blessing = (typeof BLESSINGS)[number];

export interface CardOptions {
  orientation: Orientation;
  silhouette: Silhouette;
  foil: Foil;
  paper: Paper;
  /** An opening blessing above the words (بسم الله الرحمن الرحيم). */
  blessing: Blessing;
}

export const DEFAULT_CARD_OPTIONS: CardOptions = { orientation: "portrait", silhouette: "standard", foil: "none", paper: "smooth", blessing: "none" };

export const cardOptionsSchema = z.object({
  orientation: z.enum(ORIENTATIONS).optional(),
  silhouette: z.enum(SILHOUETTES).optional(),
  foil: z.enum(FOILS).optional(),
  paper: z.enum(PAPERS).optional(),
  blessing: z.enum(BLESSINGS).optional(),
});

export type CardOptionOverrides = Partial<CardOptions>;

/** Tolerant parse: keeps valid values, drops anything unknown. */
export function sanitizeCardOptions(raw: unknown): CardOptionOverrides {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const out: CardOptionOverrides = {};
  for (const key of ["orientation", "silhouette", "foil", "paper", "blessing"] as const) {
    const parsed = cardOptionsSchema.shape[key].safeParse(input[key]);
    if (parsed.success && parsed.data !== undefined) (out as Record<string, string>)[key] = parsed.data;
  }
  return out;
}

export function resolveCardOptions(...layers: (CardOptionOverrides | undefined)[]): CardOptions {
  return Object.assign({}, DEFAULT_CARD_OPTIONS, ...layers.filter(Boolean));
}

/** Human labels and one-line descriptions, for option pickers. */
export const CARD_OPTION_INFO = {
  orientation: { portrait: "Portrait", landscape: "Landscape" },
  silhouette: { standard: "Standard", rounded: "Rounded", scalloped: "Scalloped" },
  foil: { none: "No foil", gold: "Gold", "rose-gold": "Rose gold", silver: "Silver" },
  blessing: { none: "None", bismillah: "Bismillah" },
  paper: {
    smooth: ["Smooth", "A crisp, bright matte finish."],
    eggshell: ["Eggshell", "A soft, lightly textured surface."],
    linen: ["Linen", "A fine woven crosshatch, like cloth."],
    recycled: ["Recycled", "Flecked with natural fibres."],
    pearlescent: ["Pearlescent", "A subtle shimmer that catches the light."],
    natural: ["Natural", "A warm, uncoated off-white."],
    "double-thick": ["Double thick", "Two layers pressed together — sturdy and luxurious."],
    "triple-thick": ["Triple thick", "Our heaviest card, with a visible edge."],
  },
} as const satisfies {
  orientation: Record<Orientation, string>;
  silhouette: Record<Silhouette, string>;
  foil: Record<Foil, string>;
  blessing: Record<Blessing, string>;
  paper: Record<Paper, readonly [string, string]>;
};

/** Metallic colours of each foil: base, highlight and shadow. */
export const FOIL_TONES: Record<Exclude<Foil, "none">, { base: string; light: string; dark: string }> = {
  gold: { base: "#b8923f", light: "#f3dc98", dark: "#7c5a1c" },
  "rose-gold": { base: "#c58a78", light: "#f5d3c6", dark: "#8a5446" },
  silver: { base: "#9ea3a8", light: "#f1f3f5", dark: "#62676c" },
};

/** Card URL query ⇄ options (only what differs from the defaults). */
export function cardOptionsFromQuery(params: Record<string, string | string[] | undefined>): CardOptionOverrides {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return sanitizeCardOptions({
    orientation: one(params.orientation),
    silhouette: one(params.silhouette),
    foil: one(params.foil),
    paper: one(params.paper),
    blessing: one(params.blessing),
  });
}

export function cardOptionsToQuery(options: CardOptionOverrides, base?: CardOptions): URLSearchParams {
  const q = new URLSearchParams();
  const d = base ?? DEFAULT_CARD_OPTIONS;
  for (const key of ["orientation", "silhouette", "foil", "paper", "blessing"] as const) {
    const v = options[key];
    if (v && v !== d[key]) q.set(key, v);
  }
  return q;
}

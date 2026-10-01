import type { TemplateManifest } from "@/core/template/manifest";
import { colors as c, layoutTemplate, type LayoutTemplateSpec, type Palette } from "../shared/layout-family";

/**
 * The Showpiece family: four wedding websites, each with its own opening
 * moment and motion — The Gate (palace doors), Moonlit Nile (lanterns),
 * Pressed Garden (a herbarium book) and Gilded Toast (champagne, Art Deco).
 * One layout (src/templates/showpiece/Renderer.tsx) draws all four; the
 * renderer key picks the variant.
 *
 * Colour roles differ per variant and are documented in the renderer.
 */

const SECTIONS = [
  "hero", "couple", "date", "countdown", "story", "ceremony", "reception", "venue",
  "schedule", "gallery", "rsvp", "faq", "closing", "footer",
] as const;

const P = {
  // The Gate — bg/surface = paper, fg = ink, accent = the room colour (doors, dark bands), accent-fg = the gold on it.
  gateEmerald: { id: "emerald", label: "Emerald & gold", family: "green", colors: c("#f8f4ea", "#fffdf6", "#13261f", "#5d6e65", "#0f4a39", "#e9cf8e", "#e3d7c0") },
  gateMidnight: { id: "midnight", label: "Midnight & champagne", family: "blue", colors: c("#f6f2ea", "#fffdf8", "#16213a", "#5f6880", "#14223f", "#e2c999", "#e2dccd") },
  gateBordeaux: { id: "bordeaux", label: "Bordeaux & rose gold", family: "red", colors: c("#f8f1ee", "#fffbf9", "#2b1218", "#7b5a60", "#5c1527", "#f0c9a8", "#ecd9d3") },
  // Moonlit Nile — bg/surface = the night, fg = champagne text, muted = mist, accent = lantern light, accent-fg = text on it.
  nileNight: { id: "night", label: "Nile night", family: "blue", colors: c("#0b1430", "#142250", "#ecd9b0", "#c9d3ea", "#ffb347", "#2a1406", "#2b3767") },
  nileDusk: { id: "dusk", label: "Violet dusk", family: "purple", colors: c("#1a1030", "#261a45", "#f1dcc0", "#d8cbe6", "#f39c6b", "#2a1208", "#3a2c5c") },
  nileDeep: { id: "deep-teal", label: "Deep teal", family: "green", colors: c("#06222a", "#0d3340", "#e9e1c8", "#b9d2d4", "#f2c14e", "#2a1d04", "#1f4a55") },
  // Pressed Garden — bg/surface = paper, fg = ink, muted = petal colour, accent = leaf (cover, buttons), accent-fg = paper.
  gardenBlush: { id: "blush-sage", label: "Blush & sage", family: "pink", colors: c("#faf5ec", "#fffdf8", "#3a3631", "#a85a64", "#5b7a5a", "#fffdf8", "#e3d8c6") },
  gardenLavender: { id: "lavender", label: "Lavender & olive", family: "purple", colors: c("#f7f4fa", "#fffdff", "#35304a", "#8a5f9e", "#6c6a3f", "#fffdf8", "#e2dcea") },
  gardenPeach: { id: "peach", label: "Peach & eucalyptus", family: "orange", colors: c("#fcf3ec", "#fffaf6", "#3b2f2a", "#b8604f", "#3f6b62", "#fffaf6", "#efdccf") },
  // Gilded Toast — bg/surface = the night room, fg = pearl, muted = gold labels, accent = gold, accent-fg = text on gold.
  toastOnyx: { id: "onyx", label: "Onyx & gold", family: "black", colors: c("#0c0c0d", "#17171a", "#f3eee4", "#d4af6a", "#d4af6a", "#0c0c0d", "#3a3324") },
  toastNavy: { id: "navy", label: "Navy & gold", family: "blue", colors: c("#0b1124", "#131c36", "#f2eee6", "#d8b878", "#d8b878", "#0b1124", "#2b3350") },
  toastEmerald: { id: "emerald-deco", label: "Emerald & gold", family: "green", colors: c("#071f19", "#0d2b23", "#f1ede2", "#d2ab62", "#d2ab62", "#071f19", "#21443a") },
} satisfies Record<string, Palette>;

/** A showpiece opens with its own moment (the editor's "Replay opening" works for it). */
const showpiece = (renderer: string, s: LayoutTemplateSpec): TemplateManifest => {
  const m = layoutTemplate(renderer, SECTIONS, s, { defaultDisabled: ["date"] });
  return { ...m, features: { ...m.features, opening: "envelope" }, isNew: true };
};

export const SHOWPIECE_MANIFESTS: TemplateManifest[] = [
  showpiece("gate", {
    id: "the-gate",
    name: "The Gate",
    tagline: "Palace doors that open on your names.",
    description:
      "Guests arrive at tall doors sealed with your initials in gold. One tap breaks the seal, the doors swing open in 3D and gold falls over your names. Inside: a fanned story, a gold timeline that draws itself and a ticket to the venue.",
    categories: ["luxury", "traditional", "elegant"],
    palettes: [P.gateEmerald, P.gateMidnight, P.gateBordeaux],
    fonts: { heading: "cormorant", body: "jost", accent: "pinyon" },
    card: { layout: "classic", shape: "arch" },
  }),
  showpiece("nile", {
    id: "moonlit-nile",
    name: "Moonlit Nile",
    tagline: "An evening on the river, lit by lanterns.",
    description:
      "A starry night over the Nile: a tap sends lanterns rising into the sky. Inside, the sky, moon, palms and river move at their own depth, lanterns light up along the evening, and your story hangs like postcards on a string.",
    categories: ["romantic", "modern", "outdoor"],
    palettes: [P.nileNight, P.nileDusk, P.nileDeep],
    fonts: { heading: "marcellus", body: "jost", accent: "greatvibes" },
    card: { layout: "classic" },
  }),
  showpiece("herbarium", {
    id: "pressed-garden",
    name: "Pressed Garden",
    tagline: "A herbarium of two hearts.",
    description:
      "A linen book opens in 3D and a flower blooms petal by petal. Your story becomes pressed-flower pages that turn in as guests scroll, stems draw themselves beside the day, and every card is soft paper.",
    categories: ["botanical", "floral", "romantic"],
    palettes: [P.gardenBlush, P.gardenLavender, P.gardenPeach],
    fonts: { heading: "playfair", body: "jost", accent: "allura" },
    card: { layout: "script" },
  }),
  showpiece("toast", {
    id: "gilded-toast",
    name: "Gilded Toast",
    tagline: "Art Deco, gold and a champagne toast.",
    description:
      "A gold Deco frame draws itself around a champagne coupe; one tap fills it and the bubbles lift the curtain. Names in gold under a Deco arch, a sunburst that turns as you scroll, the evening as a menu card and the venue as a ticket.",
    categories: ["luxury", "modern", "elegant"],
    palettes: [P.toastOnyx, P.toastNavy, P.toastEmerald],
    fonts: { heading: "bodoni", body: "jost", accent: "italiana" },
    card: { layout: "typographic" },
  }),
];

import type { TemplateManifest } from "@/core/template/manifest";
import { colors as c, type Palette } from "../shared/layout-family";
import { kitTemplate } from "./manifest";

/**
 * The Kit collection: full wedding websites, each with its own layout,
 * typography, motion and section design (one renderer per template under
 * src/templates/kit/<name>/). Built in batches of four.
 *
 * Colour roles (see each Renderer's header for how it uses them):
 * bg/surface = paper, fg = ink, muted = secondary colour, accent = the
 * template's signature colour, accent-fg = text on the accent.
 */

const P = {
  // 1 · Editorial Romance
  roseInk: { id: "rose-ink", label: "Rose ink", family: "red", colors: c("#f6f1ec", "#fffaf6", "#1c1716", "#8b5e5a", "#7a2e3b", "#fffaf6", "#e6dbd3") },
  noir: { id: "noir", label: "Noir", family: "black", colors: c("#f2f0ec", "#faf9f6", "#141414", "#6b6b6b", "#141414", "#faf9f6", "#dedbd5") },
  blushSand: { id: "blush-sand", label: "Blush & sand", family: "pink", colors: c("#f7efe8", "#fffaf5", "#2a201d", "#a0705f", "#9a5038", "#fffaf5", "#ecdcd0") },
  // 2 · Old Money
  navyCream: { id: "navy-cream", label: "Navy & cream", family: "blue", colors: c("#f4efe4", "#fbf8f1", "#1c2638", "#8a6d3b", "#1c2a4a", "#f4efe4", "#ddd3bf") },
  racingGreen: { id: "racing-green", label: "Racing green", family: "green", colors: c("#f2eee3", "#faf7ef", "#1b2a22", "#866a35", "#1f3d2c", "#f2eee3", "#d9d2bd") },
  claret: { id: "claret", label: "Claret", family: "red", colors: c("#f5eee8", "#fbf7f3", "#2b1a1c", "#8b6a3e", "#5a1f2a", "#f5eee8", "#e2d4cb") },
  // 3 · Modern Minimal
  whiteVermilion: { id: "white-vermilion", label: "White & vermilion", family: "white", colors: c("#ffffff", "#f5f5f3", "#0e0e0e", "#8a8a8a", "#d24a22", "#ffffff", "#e6e6e3") },
  boneOlive: { id: "bone-olive", label: "Bone & olive", family: "green", colors: c("#f4f2ec", "#ebe8df", "#191a14", "#87856f", "#5b6236", "#f4f2ec", "#dcd9cf") },
  stoneBlue: { id: "stone-blue", label: "Stone & blue", family: "blue", colors: c("#eef0f1", "#e3e7ea", "#121820", "#7c8691", "#2347e6", "#ffffff", "#d5dadf") },
  // 4 · Italian Summer
  limone: { id: "limone", label: "Limone", family: "yellow", colors: c("#fbf6e9", "#fffdf6", "#1d2b57", "#e2b93b", "#1f4fa3", "#fffdf6", "#ecdfb8") },
  terracottaSole: { id: "terracotta-sole", label: "Terracotta sole", family: "orange", colors: c("#fbf1e6", "#fffaf3", "#3a1f14", "#e0a33a", "#b04e2a", "#fffaf3", "#eed9c2") },
  verdeOliva: { id: "verde-oliva", label: "Verde oliva", family: "green", colors: c("#f7f4e6", "#fffef6", "#23301f", "#d9b84a", "#4c6b3c", "#fffef6", "#e3dfc2") },
} satisfies Record<string, Palette>;

export const KIT_MANIFESTS: TemplateManifest[] = [
  kitTemplate("romance", {
    id: "editorial-romance",
    name: "Editorial Romance",
    tagline: "A fashion-magazine love story in black and white.",
    description:
      "Opens on a tall black-and-white portrait with your names set huge in an italic Didone. Inside: a drop-cap letter, numbered spreads for the ceremony and party, captioned photo plates, a pull quote and a slow, cinematic scroll.",
    categories: ["photo", "romantic", "typography", "elegant"],
    palettes: [P.roseInk, P.noir, P.blushSand],
    fonts: { heading: "bodoni", body: "manrope", accent: "instrument" },
    photoTone: "mono",
    card: { layout: "magazine" },
  }),
  kitTemplate("heritage", {
    id: "old-money",
    name: "Old Money",
    tagline: "Club stripes, a laurel crest and engraved cards.",
    description:
      "An engraved card under a hand-drawn laurel crest, your names in spaced capitals and a club-tie stripe. The day is an 'Order of the day' in Roman numerals, photos hang as framed prints and the reply looks like a proper reply card.",
    categories: ["classic", "luxury", "traditional", "monogram"],
    palettes: [P.navyCream, P.racingGreen, P.claret],
    fonts: { heading: "garamond", body: "garamond", accent: "cinzel" },
    card: { layout: "crest" },
  }),
  kitTemplate("minimal", {
    id: "modern-minimal",
    name: "Modern Minimal",
    tagline: "A Swiss grid, giant type and one colour.",
    description:
      "Your names set giant and light on a faint column grid, every section numbered with a hairline that draws itself, the details as a clean table, photos in a sideways scrolling strip and the reply as a solid block of colour.",
    categories: ["modern", "minimalist", "typography"],
    palettes: [P.whiteVermilion, P.boneOlive, P.stoneBlue],
    fonts: { heading: "manrope", body: "manrope", accent: "spacemono" },
    card: { layout: "asymmetric" },
  }),
  kitTemplate("limone", {
    id: "italian-summer",
    name: "Italian Summer",
    tagline: "Lemons, a striped awning and majolica tiles.",
    description:
      "A striped awning flutters over your names, lemon branches sway and your photo sits in an arched window on painted tiles. The day reads like a trattoria menu, the countdown sits on ceramic tiles and the photos are scattered like holiday snapshots.",
    categories: ["outdoor", "whimsical", "romantic", "botanical"],
    palettes: [P.limone, P.terracottaSole, P.verdeOliva],
    fonts: { heading: "fraunces", body: "jost", accent: "allura" },
    card: { layout: "arch-panel" },
  }),
];

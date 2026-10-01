import type { TemplateManifest } from "@/core/template/manifest";
import { colors as c, layoutTemplate, type LayoutTemplateSpec, type Palette } from "../shared/layout-family";

/**
 * The Showpiece family: wedding websites, each with its own opening moment
 * and motion. One layout (src/templates/showpiece/Renderer.tsx) draws them
 * all; the renderer key picks the variant, and the variant's "look"
 * (./variants.ts) sets the colour roles each palette follows.
 *
 * - The Gate, Moonlit Nile, Pressed Garden, Gilded Toast
 * - Creative: Written in the Stars, Paper Theatre, Rose Window, The Keepsake Box
 * - Egypt's venues: Giza at Dusk, Baron Palace, Montaza by the Sea, Luxor Temple
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
  // Written in the Stars — the "nile" look: night page, pale text, a glowing accent.
  starsMidnight: { id: "midnight-silver", label: "Midnight & silver", family: "blue", colors: c("#0a0f24", "#131a38", "#e8ecf6", "#b9c2dc", "#e6dcb8", "#141a33", "#2a335a") },
  starsIndigo: { id: "indigo-gold", label: "Indigo & gold", family: "purple", colors: c("#120f2e", "#1d1945", "#f1e9d6", "#cbc3e3", "#f0c766", "#1d1407", "#352f66") },
  starsAubergine: { id: "aubergine-rose", label: "Aubergine & rose", family: "pink", colors: c("#1c0f22", "#2a1733", "#f6e6e9", "#dcc6d6", "#f2b8c6", "#2a0f19", "#46294f") },
  // Paper Theatre — the "herbarium" look: paper page, a warm detail colour (muted), a deep paper colour (accent).
  popupTeal: { id: "teal-coral", label: "Teal & coral", family: "blue", colors: c("#f6f1e7", "#fffaf1", "#2c3440", "#b9533a", "#2f6b7c", "#fffaf1", "#e6dccb") },
  popupSage: { id: "sage-butter", label: "Sage & butter", family: "green", colors: c("#f7f4e6", "#fffdf3", "#2f3a2e", "#a87d1c", "#4f6f52", "#fffdf3", "#e5e0c8") },
  popupLilac: { id: "lilac-peach", label: "Lilac & peach", family: "purple", colors: c("#f7f2f6", "#fffaff", "#3a2f45", "#c06a46", "#6a4c8c", "#fffaff", "#e8dde8") },
  // Rose Window — the "gate" look: stone page, a jewel colour, gold on it.
  glassSapphire: { id: "sapphire", label: "Sapphire & gold", family: "blue", colors: c("#f5f3ee", "#fffefa", "#1a2033", "#5f6578", "#1d3270", "#e6c77e", "#e0dccf") },
  glassGarnet: { id: "garnet", label: "Garnet & gold", family: "red", colors: c("#f7f2ef", "#fffcfa", "#2a1517", "#765c5e", "#6b1a2a", "#ecc98d", "#e8d9d4") },
  glassAmethyst: { id: "amethyst", label: "Amethyst & gold", family: "purple", colors: c("#f6f3f7", "#fffdff", "#241a2e", "#6c6177", "#3f2361", "#e3c98f", "#e2dbe6") },
  // The Keepsake Box — the "gate" look: accent = the box, accent-fg = the ribbon.
  keepRose: { id: "rose-champagne", label: "Rose & champagne", family: "pink", colors: c("#faf4f0", "#fffbf8", "#33201f", "#7d6260", "#8a4b55", "#f8e6c6", "#ecdcd5") },
  keepNavy: { id: "navy-gold", label: "Navy & gold", family: "blue", colors: c("#f5f4f0", "#fffefb", "#18203a", "#5d6377", "#1c2a4f", "#e8cf94", "#e0ddd2") },
  keepBlack: { id: "black-ivory", label: "Black & ivory", family: "black", colors: c("#f6f4ef", "#fffefa", "#1b1b1b", "#646260", "#1f1d1c", "#efe5cf", "#e2ded4") },
  // Giza — the "gate" look: sand page, the dusk sky (accent), the sun's gold (accent-fg).
  gizaDusk: { id: "desert-dusk", label: "Desert dusk", family: "blue", colors: c("#f7f0e3", "#fffaf0", "#2b2118", "#75644f", "#2c2a52", "#f0c674", "#e8dcc4") },
  gizaSunset: { id: "sunset", label: "Sunset terracotta", family: "orange", colors: c("#f8efe6", "#fffaf4", "#2e1b14", "#7a5a4b", "#7a3322", "#f6cf86", "#ecd8c8") },
  gizaNight: { id: "night-sand", label: "Night & sand", family: "black", colors: c("#f4efe6", "#fffcf6", "#1e1d24", "#66615a", "#15182b", "#e3c58a", "#e4dccd") },
  // Baron Palace — the "toast" look: night page, gold.
  baronNight: { id: "heliopolis-night", label: "Heliopolis night", family: "black", colors: c("#0d0f14", "#171a22", "#f2ede2", "#d6b46f", "#d6b46f", "#0d0f14", "#34302a") },
  baronRosewood: { id: "rosewood", label: "Rosewood & gold", family: "red", colors: c("#1a0e0e", "#261616", "#f4e9e1", "#e0b07a", "#e0b07a", "#1a0e0e", "#44302a") },
  baronTeal: { id: "teal-night", label: "Teal night & gold", family: "green", colors: c("#08191b", "#102528", "#eef0e8", "#d8bb7a", "#d8bb7a", "#08191b", "#24403f") },
  // Montaza — the "herbarium" look: sea-mist page, terracotta detail (muted), the sea (accent).
  montazaMed: { id: "mediterranean", label: "Mediterranean", family: "blue", colors: c("#f3f6f7", "#fdfefe", "#14283a", "#b4593a", "#1f5f8b", "#fdfefe", "#d9e3e8") },
  montazaGreen: { id: "sea-green", label: "Sea green", family: "green", colors: c("#f2f6f2", "#fcfefc", "#16302b", "#a86a33", "#22675a", "#fcfefc", "#d8e5df") },
  montazaDusk: { id: "dusk-peach", label: "Dusk & peach", family: "orange", colors: c("#f8f3ef", "#fffcfa", "#232a44", "#c06e4b", "#36457a", "#fffcfa", "#eadfd8") },
  // Luxor — the "gate" look: limestone page, a deep stone colour, floodlight gold.
  luxorLapis: { id: "lapis", label: "Lapis & gold", family: "blue", colors: c("#f6f0e2", "#fffaf0", "#1f1c17", "#6f6556", "#1b3a6b", "#e9c97a", "#e6dcc6") },
  luxorGreen: { id: "nile-green", label: "Nile green & gold", family: "green", colors: c("#f4f0e2", "#fffcf1", "#1b221d", "#626657", "#1f4b40", "#e7c77c", "#e2dcc6") },
  luxorCarnelian: { id: "carnelian", label: "Carnelian & gold", family: "red", colors: c("#f7efe4", "#fffaf2", "#2a1a12", "#765e4e", "#7d2e1d", "#f1cd8a", "#ead9c6") },
} satisfies Record<string, Palette>;

/** A showpiece opens with its own moment (the editor's "Replay opening" works for it). */
const showpiece = (renderer: string, s: LayoutTemplateSpec, isNew = false): TemplateManifest => {
  const m = layoutTemplate(renderer, SECTIONS, s, { defaultDisabled: ["date"] });
  return { ...m, features: { ...m.features, opening: "envelope" }, ...(isNew ? { isNew } : {}) };
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

  // ── Creative ──
  showpiece("stars", {
    id: "written-in-the-stars",
    name: "Written in the Stars",
    tagline: "Your names in a night full of stars.",
    description:
      "A night sky where a few stars wait to be joined: one tap draws them into a heart and a shooting star crosses. Inside, a gold armillary sphere turns around your initials, the sky twinkles and every moment of the day lights up like a star.",
    categories: ["romantic", "modern", "whimsical"],
    palettes: [P.starsMidnight, P.starsIndigo, P.starsAubergine],
    fonts: { heading: "italiana", body: "jost", accent: "allura" },
    card: { layout: "script" },
  }, true),
  showpiece("popup", {
    id: "paper-theatre",
    name: "Paper Theatre",
    tagline: "A pop-up card that opens into a little stage.",
    description:
      "Guests open a folded card and a cut-paper stage pops up layer by layer: sun, clouds, hills, an arch and the curtains. On the page, every paper layer moves at its own depth and little paper stars hang from the curtain.",
    categories: ["whimsical", "modern", "romantic"],
    palettes: [P.popupTeal, P.popupSage, P.popupLilac],
    fonts: { heading: "dmserif", body: "jost", accent: "caveat" },
    card: { layout: "classic", shape: "arch" },
  }, true),
  showpiece("glass", {
    id: "rose-window",
    name: "Rose Window",
    tagline: "Stained glass and coloured light.",
    description:
      "Pieces of coloured glass float in the dark; one tap sets them into a rose window and the light pours in. Your names sit beneath the glowing window while coloured light falls across the page.",
    categories: ["traditional", "elegant", "luxury"],
    palettes: [P.glassSapphire, P.glassGarnet, P.glassAmethyst],
    fonts: { heading: "cormorant", body: "jost", accent: "pinyon" },
    card: { layout: "crest", shape: "arch" },
  }, true),
  showpiece("keepsake", {
    id: "keepsake-box",
    name: "The Keepsake Box",
    tagline: "A gift box tied with silk, for guests to open.",
    description:
      "A gift box tied with a silk ribbon turns slowly in 3D. One tap unties the bow, the lid lifts away and your card rises out of the box. On the page, a photo, a ticket and a pressed flower float above your names.",
    categories: ["romantic", "elegant", "modern"],
    palettes: [P.keepRose, P.keepNavy, P.keepBlack],
    fonts: { heading: "playfair", body: "jost", accent: "greatvibes" },
    card: { layout: "formal-script" },
  }, true),

  // ── Egypt's venues ──
  showpiece("giza", {
    id: "giza-at-dusk",
    name: "Giza at Dusk",
    tagline: "The pyramids of Giza at sunset.",
    description:
      "Guests arrive at night under the pyramids; one tap and the sun rises behind them, lighting their faces in gold. On the page the pyramids, the dunes and a slow camel caravan move at their own depth while desert dust drifts in the light.",
    categories: ["egyptian", "traditional", "outdoor"],
    palettes: [P.gizaDusk, P.gizaSunset, P.gizaNight],
    fonts: { heading: "marcellus", body: "jost", accent: "pinyon" },
    card: { layout: "classic", shape: "arch" },
  }, true),
  showpiece("baron", {
    id: "baron-palace",
    name: "Baron Palace",
    tagline: "The Baron Palace in Heliopolis, drawn in gold.",
    description:
      "The palace draws itself in gold lines against the night; one tap lights every window, one by one. On the page the palace glows under a gold arch frame, its windows flickering as if the party has begun.",
    categories: ["egyptian", "luxury", "elegant"],
    palettes: [P.baronNight, P.baronRosewood, P.baronTeal],
    fonts: { heading: "didone", body: "jost", accent: "greatvibes" },
    card: { layout: "refined" },
  }, true),
  showpiece("montaza", {
    id: "montaza-by-the-sea",
    name: "Montaza by the Sea",
    tagline: "Montaza Palace and the Alexandria sea.",
    description:
      "The Montaza tower, the palace arcade and the little bridge to the tea island, over a moving Mediterranean. Guests tap and a wave rolls in to reveal your page, with gulls overhead and a sail crossing the bay.",
    categories: ["egyptian", "outdoor", "romantic"],
    palettes: [P.montazaMed, P.montazaGreen, P.montazaDusk],
    fonts: { heading: "instrument", body: "jost", accent: "allura" },
    card: { layout: "postcard", shape: "landscape" },
  }, true),
  showpiece("luxor", {
    id: "luxor-temple",
    name: "Luxor Temple",
    tagline: "A night walk through Luxor's columns.",
    description:
      "Two rows of papyrus columns, lit gold at night, lead to the temple gate. Guests tap to step inside and walk through the colonnade into the light. On the page the columns keep gliding past, and your names sit in a gold cartouche.",
    categories: ["egyptian", "traditional", "luxury"],
    palettes: [P.luxorLapis, P.luxorGreen, P.luxorCarnelian],
    fonts: { heading: "cinzel", body: "jost", accent: "italiana" },
    card: { layout: "crest" },
  }, true),
];

import type { TemplateManifest } from "@/core/template/manifest";
import { colors as c, layoutTemplate, type Palette } from "../shared/layout-family";

/**
 * The Essentials family: four simple wedding websites with no opening and
 * almost no motion (src/templates/essentials/Renderer.tsx draws all four).
 * Colours: bg/surface = paper, fg = ink, muted = secondary text, accent =
 * names, rules and buttons, accent-fg = text on the accent.
 */

const SECTIONS = [
  "hero", "couple", "date", "countdown", "story", "ceremony", "reception", "venue",
  "schedule", "gallery", "rsvp", "faq", "closing", "footer",
] as const;

const P = {
  linenIvory: { id: "ivory-charcoal", label: "Ivory & charcoal", family: "white", colors: c("#faf8f3", "#ffffff", "#2b2b2b", "#666666", "#2b2b2b", "#faf8f3", "#e7e3da") },
  linenSage: { id: "sage", label: "Sage", family: "green", colors: c("#f6f7f2", "#ffffff", "#2e3a30", "#5f6a5d", "#5a7160", "#ffffff", "#e1e5dc") },
  linenBlue: { id: "dusty-blue", label: "Dusty blue", family: "blue", colors: c("#f5f7f9", "#ffffff", "#25303d", "#5f6976", "#4a6683", "#ffffff", "#dfe5eb") },
  monoNavy: { id: "navy", label: "Navy", family: "blue", colors: c("#f8f6f1", "#fffefb", "#1d2433", "#5e6370", "#1d2433", "#f8f6f1", "#e4e0d6") },
  monoBurgundy: { id: "burgundy", label: "Burgundy", family: "red", colors: c("#faf6f4", "#fffdfc", "#2d1a1e", "#6a575b", "#6e2233", "#faf6f4", "#eadfdc") },
  monoForest: { id: "forest", label: "Forest", family: "green", colors: c("#f6f6f1", "#fffffb", "#1f2b24", "#5b645e", "#2c4a3b", "#f6f6f1", "#e0e2d8") },
  splitSand: { id: "sand", label: "Sand", family: "neutral", colors: c("#f5f1ea", "#fffdf9", "#2a2520", "#675f55", "#7f6343", "#ffffff", "#e6dfd3") },
  splitBlush: { id: "blush", label: "Blush", family: "pink", colors: c("#f9f3f2", "#fffbfb", "#2e2224", "#695a5c", "#9a525b", "#ffffff", "#ecdfdf") },
  splitSlate: { id: "slate", label: "Slate", family: "neutral", colors: c("#f3f4f5", "#ffffff", "#22262b", "#5d6269", "#3d4651", "#ffffff", "#dfe2e6") },
  modernMono: { id: "black-white", label: "Black & white", family: "black", colors: c("#ffffff", "#f4f4f2", "#111111", "#585858", "#111111", "#ffffff", "#e4e4e2") },
  modernTerracotta: { id: "terracotta", label: "Terracotta", family: "orange", colors: c("#fbf7f3", "#ffffff", "#24201d", "#655d56", "#a84d2b", "#ffffff", "#ece3da") },
  modernOlive: { id: "olive", label: "Olive", family: "green", colors: c("#f7f7f2", "#ffffff", "#22241c", "#5e6056", "#575f2f", "#ffffff", "#e3e4d9") },
} satisfies Record<string, Palette>;

const simple = (renderer: string, s: Parameters<typeof layoutTemplate>[2]): TemplateManifest => ({
  ...layoutTemplate(renderer, SECTIONS, s, { defaultDisabled: ["date"] }),
  isNew: true,
});

export const ESSENTIALS_MANIFESTS: TemplateManifest[] = [
  simple("linen", {
    id: "simple-linen",
    name: "Simple Linen",
    tagline: "Centred, classic and quiet.",
    description: "Your names in a light serif with a script ampersand, a framed photo and every detail set plainly in the middle of the page. Nothing to wait for: guests see everything straight away.",
    categories: ["minimalist", "classic", "elegant"],
    palettes: [P.linenIvory, P.linenSage, P.linenBlue],
    fonts: { heading: "cormorant", body: "jost", accent: "allura" },
    card: { layout: "classic" },
  }),
  simple("monogram", {
    id: "simple-monogram",
    name: "Monogram",
    tagline: "Your initials in a double ring.",
    description: "Opens on your initials inside a double ring, with your names in one line beneath. The ceremony, the party and the reply sit in neat ruled boxes.",
    categories: ["monogram", "minimalist", "classic"],
    palettes: [P.monoNavy, P.monoBurgundy, P.monoForest],
    fonts: { heading: "didone", body: "jost", accent: "pinyon" },
    card: { layout: "monogram" },
  }),
  simple("split", {
    id: "side-by-side",
    name: "Side by Side",
    tagline: "Your photo on one side, the details on the other.",
    description: "On a computer your photo stays on the left while the details scroll on the right; on a phone the photo comes first. Made for one photo you love.",
    categories: ["photo", "modern", "minimalist"],
    palettes: [P.splitSand, P.splitBlush, P.splitSlate],
    fonts: { heading: "playfair", body: "inter", accent: "greatvibes" },
    card: { layout: "photo-side" },
  }),
  simple("modern", {
    id: "modern-type",
    name: "Modern Type",
    tagline: "Big type, the date in numerals, nothing extra.",
    description: "Your names set large and left-aligned, the date in big numerals and the details in clean rows divided by hairlines. Simple, direct and easy to read.",
    categories: ["modern", "typography", "minimalist"],
    palettes: [P.modernMono, P.modernTerracotta, P.modernOlive],
    fonts: { heading: "instrument", body: "inter", accent: "spacemono" },
    card: { layout: "typographic" },
  }),
];

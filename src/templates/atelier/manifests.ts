import type { TemplateCategory, TemplateManifest } from "@/core/template/manifest";
import type { ColorFamily, ThemeTokens } from "@/core/theme/tokens";

/**
 * The Atelier family: editorial, calligraphic invitation websites sharing
 * the atelier layout. Each palette is a complete set — paper (background),
 * sheet (surface), ink (foreground), and the deep "room" colour (accent)
 * that washes the opening photo and fills the dark sections.
 */

const SECTIONS = [
  "hero", "couple", "countdown", "ceremony", "reception", "venue", "schedule",
  "story", "gallery", "rsvp", "faq", "date", "closing", "footer",
] as const;

type Colors = ThemeTokens["colors"];
type Palette = { id: string; label: string; family: ColorFamily; colors: Colors };

const c = (bg: string, surface: string, fg: string, muted: string, accent: string, accentFg: string, border: string): Colors => ({
  background: bg, surface, foreground: fg, muted, accent, accentForeground: accentFg, border,
});

const P = {
  olive: { id: "olive", label: "Olive", family: "green", colors: c("#ebe8df", "#f4f2ec", "#1c1c18", "#65655a", "#434d2e", "#f3f0e5", "#cfcabb") },
  eucalyptus: { id: "eucalyptus", label: "Eucalyptus", family: "green", colors: c("#e9ebe7", "#f3f4f1", "#1b1f1d", "#5f6863", "#3b5450", "#eef2ef", "#cad1cc") },
  dusk: { id: "dusk", label: "Dusk blue", family: "blue", colors: c("#eaecee", "#f3f4f5", "#1a1d22", "#5f6570", "#394a5d", "#eef1f4", "#c9ced6") },
  clay: { id: "clay", label: "Clay", family: "orange", colors: c("#efe8e0", "#f6f1eb", "#221a15", "#6d6159", "#6e3d2a", "#f5ede4", "#d8cabd") },
  charcoal: { id: "charcoal", label: "Charcoal", family: "black", colors: c("#ecebe8", "#f5f4f1", "#161616", "#626260", "#2a2a29", "#f1efe9", "#cdcbc6") },
  ink: { id: "ink", label: "Ink blue", family: "blue", colors: c("#e9eaec", "#f3f3f5", "#15171c", "#5d6069", "#232a3a", "#eceef3", "#c8cad2") },
  espresso: { id: "espresso", label: "Espresso", family: "neutral", colors: c("#ede8e2", "#f5f1ec", "#1d1713", "#6a5f57", "#3a2a21", "#f2ebe3", "#d5cbc0") },
  riviera: { id: "riviera", label: "Riviera", family: "blue", colors: c("#eceff0", "#f5f6f7", "#18202a", "#5c6773", "#33485d", "#edf2f6", "#c8d1d9") },
  seaglass: { id: "seaglass", label: "Sea glass", family: "green", colors: c("#eaeeec", "#f4f6f5", "#172120", "#5b6966", "#3c6360", "#ecf3f1", "#c7d3d0") },
  lavender: { id: "lavender", label: "Lavender dusk", family: "purple", colors: c("#eeecf0", "#f6f5f8", "#1d1a24", "#65606f", "#4b4360", "#f1eef6", "#d2cdda") },
  terracotta: { id: "terracotta", label: "Terracotta", family: "orange", colors: c("#f1e9df", "#f8f3ec", "#24170f", "#71604f", "#7a3e27", "#f7eee4", "#dccbb8") },
  ochre: { id: "ochre", label: "Ochre", family: "yellow", colors: c("#f1ebdf", "#f8f4ec", "#221b0f", "#6f644f", "#6f5117", "#f6efe1", "#dcd0b7") },
  wine: { id: "wine", label: "Wine", family: "red", colors: c("#f1e9e8", "#f8f3f2", "#221416", "#6e5b5d", "#5b2230", "#f6ecec", "#dccbcc") },
  midnight: { id: "midnight", label: "Midnight", family: "black", colors: c("#15171c", "#1c1f26", "#eee8dc", "#a39d91", "#0c0e12", "#e9dfc9", "#30343e") },
  forestNight: { id: "forest-night", label: "Forest night", family: "green", colors: c("#131a16", "#19221d", "#ece7da", "#a1a395", "#0a100c", "#e7dfca", "#2c362f") },
  blush: { id: "blush", label: "Blush", family: "pink", colors: c("#f4ebe8", "#faf5f3", "#23181a", "#6f5f62", "#7a4a52", "#f8eeee", "#e0cfcf") },
  mauve: { id: "mauve", label: "Mauve", family: "purple", colors: c("#f1ebef", "#f8f4f7", "#211a20", "#6b5f69", "#5d465e", "#f5eff5", "#dbcfd9") },
  rosewood: { id: "rosewood", label: "Rosewood", family: "red", colors: c("#f3eae7", "#f9f4f2", "#22161a", "#6f5e5f", "#6c3a3b", "#f7ecea", "#decdcb") },
} satisfies Record<string, Palette>;

interface Spec {
  id: string;
  name: string;
  tagline: string;
  description: string;
  categories: TemplateCategory[];
  palettes: Palette[];
  script: "pinyon" | "greatvibes";
  display?: "didone" | "bodoni" | "cinzel";
  photoTone?: "natural" | "mono";
  isNew?: boolean;
}

function atelier(s: Spec): TemplateManifest {
  const [first, ...rest] = s.palettes;
  return {
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    description: s.description,
    renderer: "atelier",
    categories: s.categories,
    stationery: { ornament: "none", layout: "photo-script" },
    isNew: s.isNew ?? true,
    supportedSections: SECTIONS,
    defaultSectionOrder: SECTIONS,
    defaultDisabled: ["date"],
    themeDefaults: {
      colors: { ...first.colors },
      fonts: { heading: s.display ?? "didone", body: "cormorant", accent: s.script },
      radius: 0,
      shadow: "soft",
      photoTone: s.photoTone ?? "natural",
    },
    palettes: [{ id: first.id, label: first.label, family: first.family, colors: {} }, ...rest.map((p) => ({ ...p, colors: { ...p.colors } }))],
    features: { opening: "none", music: true, hero: "photo" },
    status: "available",
  };
}

export const ATELIER_MANIFESTS: TemplateManifest[] = [
  atelier({
    id: "meadow",
    name: "Meadow",
    tagline: "Calligraphy over a photo washed in olive.",
    description:
      "Your photo washed in a deep olive, your names in flowing calligraphy, and every section set like an editorial page on grained paper — with a sealed envelope for replies and a page of questions & answers.",
    categories: ["elegant", "typography", "greenery", "photo"],
    palettes: [P.olive, P.eucalyptus, P.dusk, P.clay],
    script: "pinyon",
  }),
  atelier({
    id: "monochrome",
    name: "Monochrome",
    tagline: "Black & white photographs, ink-black calligraphy.",
    description: "Every photo in black & white, charcoal sections and crisp ink calligraphy — timeless, editorial and quietly dramatic.",
    categories: ["elegant", "minimalist", "photo", "typography"],
    palettes: [P.charcoal, P.ink, P.espresso],
    script: "greatvibes",
    display: "bodoni",
    photoTone: "mono",
  }),
  atelier({
    id: "riviera",
    name: "Riviera",
    tagline: "Coastal blues and a sealed envelope.",
    description: "A photo washed in sea-blue, soft calligraphy and airy paper sections — made for coastal and destination weddings.",
    categories: ["elegant", "outdoor", "photo"],
    palettes: [P.riviera, P.seaglass, P.lavender],
    script: "pinyon",
  }),
  atelier({
    id: "terracotta",
    name: "Terracotta",
    tagline: "Sun-warmed clay and flowing script.",
    description: "Warm terracotta washes, sand-coloured paper and generous calligraphy — for summer evenings, courtyards and vineyards.",
    categories: ["elegant", "rustic", "outdoor", "photo"],
    palettes: [P.terracotta, P.ochre, P.wine],
    script: "greatvibes",
  }),
  atelier({
    id: "nocturne",
    name: "Nocturne",
    tagline: "Candlelit calligraphy on midnight paper.",
    description: "Dark paper, warm ivory ink and a deep-night photo wash — an evening invitation for black-tie celebrations.",
    categories: ["luxury", "elegant", "photo"],
    palettes: [P.midnight, P.forestNight],
    script: "pinyon",
    display: "cinzel",
  }),
  atelier({
    id: "rosewater",
    name: "Rosewater",
    tagline: "Blush paper and romantic script.",
    description: "Soft blush paper, rosewood washes and romantic calligraphy — tender without being sweet.",
    categories: ["romantic", "elegant", "photo"],
    palettes: [P.blush, P.mauve, P.rosewood],
    script: "greatvibes",
  }),
];

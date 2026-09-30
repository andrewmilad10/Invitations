import type { TemplateManifest } from "@/core/template/manifest";

/**
 * Templates that reuse an existing layout (renderer) with their own theme,
 * typography, decoration and features. Adding one here needs no database,
 * dashboard or editor change.
 */

const ALL_SECTIONS = [
  "hero", "couple", "date", "countdown", "story", "ceremony", "reception",
  "venue", "gallery", "schedule", "rsvp", "closing", "footer",
] as const;

export const romanticManifest: TemplateManifest = {
  id: "romantic",
  name: "Romantic",
  tagline: "Soft blush tones and delicate florals.",
  description: "Hand-drawn florals, blush and rose tones and a flowing script — tender, warm and quietly elegant.",
  renderer: "cinematic",
  categories: ["romantic", "classic"],
  stationery: { ornament: "floral" },
  supportedSections: ALL_SECTIONS,
  defaultSectionOrder: ALL_SECTIONS,
  themeDefaults: {
    colors: {
      background: "#f8efec", surface: "#fffaf8", foreground: "#3b2a2c", muted: "#8c6f72",
      accent: "#b0707a", accentForeground: "#fffaf8", border: "#ecd9d6",
    },
    fonts: { heading: "cormorant", body: "jost", accent: "pinyon" },
    radius: 2,
    shadow: "soft",
  },
  palettes: [
    { id: "blush", label: "Blush", colors: {} },
    { id: "peony", label: "Peony", colors: { background: "#f6ebee", accent: "#a45a74", border: "#ead3da" } },
    { id: "champagne", label: "Champagne", colors: { background: "#f6f0e6", surface: "#fffcf6", accent: "#b08a5a", border: "#e8dcc8", foreground: "#3a2e24" } },
  ],
  features: { opening: "none", music: true },
  status: "available",
};

export const classicManifest: TemplateManifest = {
  id: "classic",
  name: "Classic",
  tagline: "Timeless, formal and beautifully balanced.",
  description: "A monogram crest, framed borders and traditional serif typography — the invitation your grandparents would frame.",
  renderer: "cinematic",
  categories: ["classic", "traditional"],
  stationery: { ornament: "crest" },
  supportedSections: ALL_SECTIONS,
  defaultSectionOrder: ALL_SECTIONS,
  themeDefaults: {
    colors: {
      background: "#f5f1e8", surface: "#fffdf8", foreground: "#1f2a3c", muted: "#5f6878",
      accent: "#a8894f", accentForeground: "#fffdf8", border: "#e2d9c6",
    },
    fonts: { heading: "cormorant", body: "cormorant", accent: "italiana" },
    radius: 0,
    shadow: "soft",
  },
  palettes: [
    { id: "navy", label: "Ivory & navy", colors: {} },
    { id: "bordeaux", label: "Bordeaux", colors: { foreground: "#3d1f24", accent: "#8f2f3d", muted: "#6e5358" } },
    { id: "forest", label: "Forest", colors: { foreground: "#1f3326", accent: "#7c6a3b", muted: "#56645a" } },
  ],
  features: { opening: "none", music: true },
  status: "available",
};

export const botanicalManifest: TemplateManifest = {
  id: "botanical",
  name: "Botanical",
  tagline: "Garden greenery for outdoor celebrations.",
  description: "Leafy branches, sage and olive tones and airy layouts — made for gardens, vineyards and weddings outdoors.",
  renderer: "cinematic",
  categories: ["botanical", "outdoor", "romantic"],
  stationery: { ornament: "leaves" },
  supportedSections: ALL_SECTIONS,
  defaultSectionOrder: ALL_SECTIONS,
  themeDefaults: {
    colors: {
      background: "#eef0e8", surface: "#fbfcf8", foreground: "#25302a", muted: "#65705f",
      accent: "#6f8a5e", accentForeground: "#fbfcf8", border: "#d8ddcf",
    },
    fonts: { heading: "cormorant", body: "jost", accent: "pinyon" },
    radius: 4,
    shadow: "soft",
  },
  palettes: [
    { id: "sage", label: "Sage", colors: {} },
    { id: "olive", label: "Olive grove", colors: { background: "#f0eee4", accent: "#7d7a3f", border: "#dedbc6" } },
    { id: "eucalyptus", label: "Eucalyptus", colors: { background: "#ebf0ee", accent: "#4f7a70", border: "#d2ddd9" } },
  ],
  features: { opening: "none", music: true },
  status: "available",
};

export const luxuryManifest: TemplateManifest = {
  id: "luxury",
  name: "Luxury",
  tagline: "Midnight and gold, for black-tie evenings.",
  description: "A dark, gilded palette with a display serif and fine gold framing — dramatic, formal and unmistakably evening.",
  renderer: "cinematic",
  categories: ["luxury", "modern"],
  stationery: { ornament: "gilded" },
  supportedSections: ALL_SECTIONS,
  defaultSectionOrder: ALL_SECTIONS,
  themeDefaults: {
    colors: {
      background: "#15171c", surface: "#1d2027", foreground: "#efe8dc", muted: "#a59e92",
      accent: "#c9a96e", accentForeground: "#15171c", border: "#34373f",
    },
    fonts: { heading: "italiana", body: "jost", accent: "pinyon" },
    radius: 0,
    shadow: "deep",
  },
  palettes: [
    { id: "midnight", label: "Midnight & gold", colors: {} },
    { id: "emerald", label: "Emerald", colors: { background: "#10201a", surface: "#162a22", border: "#27403a", accent: "#cfae6b" } },
    { id: "noir", label: "Noir & silver", colors: { background: "#121212", surface: "#1b1b1b", border: "#303030", accent: "#c8c8c8", accentForeground: "#121212" } },
  ],
  features: { opening: "none", music: true },
  status: "available",
};

export const modernManifest: TemplateManifest = {
  id: "modern",
  name: "Modern",
  tagline: "Clean lines, bold type, lots of air.",
  description: "Crisp sans-serif headlines, a restrained palette and generous space — for couples who like things simple and considered.",
  renderer: "editorial",
  categories: ["modern", "minimal", "outdoor"],
  stationery: { ornament: "hairline" },
  supportedSections: ["hero", "couple", "date", "story", "ceremony", "reception", "gallery", "schedule", "rsvp", "closing", "footer"],
  defaultSectionOrder: ["hero", "couple", "date", "ceremony", "reception", "schedule", "story", "gallery", "rsvp", "closing", "footer"],
  themeDefaults: {
    colors: {
      background: "#f4f4f1", surface: "#ffffff", foreground: "#151515", muted: "#6d6d68",
      accent: "#3f5c4a", accentForeground: "#ffffff", border: "#e1e1dc",
    },
    fonts: { heading: "jost", body: "jost", accent: "italiana" },
    radius: 0,
    shadow: "none",
  },
  palettes: [
    { id: "stone", label: "Stone & pine", colors: {} },
    { id: "clay", label: "Clay", colors: { accent: "#9a5b3f" } },
    { id: "night", label: "Night", colors: { background: "#161616", surface: "#1f1f1f", foreground: "#f1f1ee", muted: "#9b9b95", border: "#2f2f2f", accent: "#b9c7b2", accentForeground: "#161616" } },
  ],
  features: { opening: "none", music: false },
  status: "available",
};

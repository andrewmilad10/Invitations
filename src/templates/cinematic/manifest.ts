import type { TemplateManifest } from "@/core/template/manifest";

export const cinematicManifest: TemplateManifest = {
  id: "cinematic",
  name: "Cinematic",
  tagline: "Opens like a letter, unfolds like a film.",
  description:
    "A sealed envelope opens into a full-screen hero, followed by an elegant, image-led invitation with countdown, venues, gallery and schedule.",
  renderer: "cinematic",
  categories: ["photo", "elegant", "luxury", "romantic"],
  stationery: { ornament: "seal" },
  supportedSections: [
    "hero", "couple", "date", "countdown", "story", "ceremony", "reception",
    "venue", "gallery", "schedule", "rsvp", "faq", "closing", "footer",
  ],
  defaultSectionOrder: [
    "hero", "couple", "date", "countdown", "story", "ceremony", "reception",
    "venue", "gallery", "schedule", "rsvp", "faq", "closing", "footer",
  ],
  themeDefaults: {
    colors: {
      background: "#f6f1ea",
      surface: "#fffdf9",
      foreground: "#2b211d",
      muted: "#7a6a60",
      accent: "#a8845a",
      accentForeground: "#fffdf9",
      border: "#e3d7c8",
    },
    fonts: { heading: "cormorant", body: "jost", accent: "pinyon" },
    radius: 2,
    shadow: "deep",
  },
  palettes: [
    { id: "ivory", label: "Ivory & gold", family: "gold", colors: {} },
    {
      id: "midnight",
      label: "Midnight",
      family: "black",
      colors: {
        background: "#14161c", surface: "#1d2029", foreground: "#efe8dc", muted: "#a39c90",
        accent: "#c9a96e", accentForeground: "#14161c", border: "#2e323d",
      },
    },
    {
      id: "sage",
      label: "Sage",
      family: "green",
      colors: {
        background: "#eef0e8", surface: "#fbfcf8", foreground: "#26302a", muted: "#6b766d",
        accent: "#7d8f6a", accentForeground: "#fbfcf8", border: "#d6dccd",
      },
    },
    {
      id: "rose",
      label: "Dusty rose",
      family: "pink",
      colors: {
        background: "#f7eeec", surface: "#fffafa", foreground: "#3a2528", muted: "#8a6b6f",
        accent: "#b0707a", accentForeground: "#fffafa", border: "#ead6d6",
      },
    },
  ],
  features: { opening: "envelope", music: true },
  status: "available",
};

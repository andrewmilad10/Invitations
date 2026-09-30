import type { TemplateManifest } from "@/core/template/manifest";

/**
 * A deliberately different second template: typographic, no opening
 * animation, and no countdown or map sections. It exists to prove the
 * contract — the same wedding data renders here without any change, and the
 * data for sections it doesn't support is kept for other templates.
 */
export const editorialManifest: TemplateManifest = {
  id: "editorial",
  name: "Editorial",
  tagline: "Quiet, typographic, magazine-like.",
  description:
    "A clean, type-led layout with generous whitespace. No opening animation — the invitation reads like a beautifully set page.",
  previewImage: "/templates/editorial.svg",
  categories: ["modern", "minimal"],
  stationery: { ornament: "rule" },
  supportedSections: [
    "hero", "couple", "date", "story", "ceremony", "reception",
    "gallery", "schedule", "rsvp", "closing", "footer",
  ],
  defaultSectionOrder: [
    "hero", "couple", "date", "ceremony", "reception", "schedule",
    "story", "gallery", "rsvp", "closing", "footer",
  ],
  themeDefaults: {
    colors: {
      background: "#ffffff",
      surface: "#f5f4f1",
      foreground: "#111111",
      muted: "#6b6b6b",
      accent: "#8c2f39",
      accentForeground: "#ffffff",
      border: "#e6e4df",
    },
    fonts: { heading: "playfair", body: "inter", accent: "italiana" },
    radius: 0,
    shadow: "none",
  },
  palettes: [
    { id: "paper", label: "Paper & claret", colors: {} },
    { id: "ink", label: "Ink", colors: { background: "#101010", surface: "#1a1a1a", foreground: "#f2f0eb", muted: "#9a978f", accent: "#d4b483", accentForeground: "#101010", border: "#2a2a2a" } },
    { id: "cobalt", label: "Cobalt", colors: { accent: "#2346a0", border: "#e2e5ee" } },
  ],
  features: { opening: "none", music: false },
  status: "available",
};

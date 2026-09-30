import type { TemplateManifest } from "@/core/template/manifest";
import { colors as c, layoutTemplate, type LayoutTemplateSpec, type Palette } from "../shared/layout-family";

/**
 * The Galerie family: the invitation as an exhibition. White walls,
 * framed photographs with wall labels, rooms numbered in order.
 */

const SECTIONS = [
  "hero", "couple", "story", "gallery", "date", "countdown", "ceremony", "reception",
  "venue", "schedule", "rsvp", "faq", "closing", "footer",
] as const;

const P = {
  klein: { id: "klein", label: "White wall & blue", family: "white", colors: c("#f7f7f5", "#ecebe7", "#111111", "#5f5f5c", "#1f3fbf", "#ffffff", "#d9d8d3") },
  concrete: { id: "concrete", label: "Concrete", family: "neutral", colors: c("#e8e6e1", "#f3f2ee", "#161616", "#5b5a56", "#1b1b1b", "#f3f2ee", "#cfccc5") },
  sage: { id: "sage", label: "Sage", family: "green", colors: c("#eef0ea", "#e2e6dd", "#151a15", "#5a6358", "#3f5e3f", "#f4f7f1", "#cfd5c9") },
  salon: { id: "salon", label: "Salon red", family: "orange", colors: c("#efe6dc", "#f7f1ea", "#1f1714", "#6c5f58", "#8c3b2e", "#fbf3ec", "#dccbbd") },
  plum: { id: "plum", label: "Plum", family: "purple", colors: c("#efe9ec", "#f7f3f5", "#1e161c", "#6a5d66", "#5e2f55", "#f8eff6", "#dccfd8") },
  ochre: { id: "ochre", label: "Ochre", family: "yellow", colors: c("#f1ebdd", "#f8f4ea", "#1f1a10", "#6c6350", "#7f5c12", "#fbf5e6", "#ddd2b8") },
} satisfies Record<string, Palette>;

const galerie = (s: LayoutTemplateSpec) => layoutTemplate("galerie", SECTIONS, s, { defaultDisabled: ["date"] });

export const GALERIE_MANIFESTS: TemplateManifest[] = [
  galerie({
    id: "galerie",
    name: "Galerie",
    tagline: "An exhibition of the two of you.",
    description:
      "A museum-minimal website: white walls, photographs hung in hairline frames with wall labels, numbered rooms and one electric accent — quiet, confident, modern.",
    categories: ["minimalist", "modern", "photo", "typography"],
    palettes: [P.klein, P.concrete, P.sage],
    fonts: { heading: "instrument", body: "inter", accent: "instrument" },
    card: { layout: "framed", shape: "square" },
  }),
  galerie({
    id: "salon",
    name: "Salon",
    tagline: "A warm-walled private view.",
    description:
      "The Galerie layout in a period salon — plaster-coloured walls, a deep red accent, Playfair headings and black & white photographs framed like old prints.",
    categories: ["elegant", "vintage", "photo", "minimalist"],
    palettes: [P.salon, P.plum, P.ochre],
    fonts: { heading: "playfair", body: "jost", accent: "playfair" },
    photoTone: "mono",
    card: { layout: "framed" },
  }),
];

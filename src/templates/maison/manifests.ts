import type { TemplateManifest } from "@/core/template/manifest";
import { colors as c, layoutTemplate, type LayoutTemplateSpec, type Palette } from "../shared/layout-family";

/**
 * The Maison family: the invitation as a fashion-magazine issue. Paper,
 * ink and a single signature colour; the dark "Couture" editions invert it.
 */

const SECTIONS = [
  "hero", "couple", "date", "countdown", "story", "ceremony", "reception", "venue",
  "gallery", "schedule", "rsvp", "faq", "closing", "footer",
] as const;

const P = {
  oxblood: { id: "oxblood", label: "Ivory & oxblood", family: "white", colors: c("#f4f0e8", "#ebe5d9", "#14120f", "#6b6358", "#6e1c22", "#f7efe6", "#d7cfc2") },
  camel: { id: "camel", label: "Camel", family: "neutral", colors: c("#efe8dc", "#e5dccc", "#1c1711", "#6e6456", "#8b5a2b", "#f8f1e6", "#d4c8b5") },
  rouge: { id: "rouge", label: "Rouge", family: "red", colors: c("#f3eeea", "#e9e2dc", "#121010", "#676160", "#b3202a", "#fff6f2", "#d9d0ca") },
  marine: { id: "marine", label: "Marine", family: "blue", colors: c("#eef0f0", "#e2e6e7", "#0f1726", "#5c6573", "#1e3765", "#eef2f8", "#cdd3d8") },
  noir: { id: "noir", label: "Noir & champagne", family: "black", colors: c("#0f0e0d", "#1a1917", "#efe9df", "#a29a8f", "#c8a66a", "#16120c", "#34302b") },
  bordeaux: { id: "bordeaux", label: "Bordeaux night", family: "red", colors: c("#1a0d10", "#241317", "#f2e6e3", "#b39a9c", "#dcae96", "#1a0d10", "#3d2528") },
  emerald: { id: "emerald", label: "Emerald night", family: "green", colors: c("#0d1612", "#14201b", "#ece8dc", "#9fa89f", "#bfa36b", "#0d1612", "#2a3831") },
  blush: { id: "blush", label: "Blush editorial", family: "pink", colors: c("#f5ece9", "#ecdfdb", "#1c1416", "#6f5f62", "#8e3a4e", "#fbf1f1", "#dccbc8") },
} satisfies Record<string, Palette>;

const maison = (s: LayoutTemplateSpec) => layoutTemplate("maison", SECTIONS, s, { defaultDisabled: ["date"] });

export const MAISON_MANIFESTS: TemplateManifest[] = [
  maison({
    id: "maison",
    name: "Maison",
    tagline: "Your wedding as the cover story.",
    description:
      "A fashion-editorial website: towering Didone names cut across your portrait, chapters numbered like a magazine issue, an asymmetric photo portfolio and a running order for the day.",
    categories: ["luxury", "typography", "modern", "photo"],
    palettes: [P.oxblood, P.camel, P.rouge, P.marine, P.blush],
    fonts: { heading: "bodoni", body: "jost", accent: "bodoni" },
    card: { layout: "magazine" },
  }),
  maison({
    id: "couture",
    name: "Couture",
    tagline: "The black-tie edition.",
    description:
      "The Maison layout printed on midnight stock — ivory Didone headlines, champagne numerals and black & white photographs for an evening celebration.",
    categories: ["luxury", "elegant", "typography", "photo"],
    palettes: [P.noir, P.bordeaux, P.emerald],
    fonts: { heading: "didone", body: "inter", accent: "bodoni" },
    photoTone: "mono",
    card: { layout: "magazine" },
  }),
];

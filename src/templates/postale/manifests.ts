import type { TemplateManifest } from "@/core/template/manifest";
import { colors as c, layoutTemplate, type LayoutTemplateSpec, type Palette } from "../shared/layout-family";

/**
 * The Postale family: the wedding as a journey — postcards, stamps, a
 * departures board and boarding passes. Made for destination weddings.
 * Colours: fg = the deep sea/ink, muted = the warm stamp colour (also small
 * print, so it must stay readable), accent = the ticket colour.
 */

const SECTIONS = [
  "hero", "couple", "date", "countdown", "story", "ceremony", "reception", "venue",
  "schedule", "gallery", "rsvp", "faq", "closing", "footer",
] as const;

const P = {
  limone: { id: "limone", label: "Navy & lemon", family: "blue", colors: c("#f4efe6", "#fbf8f2", "#14315a", "#a3472a", "#f2cf4a", "#14315a", "#dcd3c3") },
  capri: { id: "capri", label: "Capri", family: "blue", colors: c("#eef3f3", "#f9fbfb", "#0f3b4a", "#a8412d", "#f0b04a", "#0f3b4a", "#cfdcdc") },
  provence: { id: "provence", label: "Provence", family: "purple", colors: c("#f2efea", "#faf8f4", "#35295a", "#8a4f2a", "#c3b2e0", "#2a2045", "#dad3ca") },
  sahara: { id: "sahara", label: "Sahara", family: "orange", colors: c("#f2e8da", "#faf4ea", "#3a2418", "#9a4a24", "#e6b27c", "#3a2418", "#dfcfba") },
  olive: { id: "olive", label: "Olive grove", family: "green", colors: c("#eeede3", "#f8f7f0", "#263222", "#8a4f24", "#d4bf5e", "#263222", "#d6d3c1") },
  riad: { id: "riad", label: "Riad", family: "red", colors: c("#f4ebe4", "#fbf6f1", "#4a1a1c", "#1f5b5a", "#e7a9a0", "#4a1a1c", "#e0cfc4") },
} satisfies Record<string, Palette>;

const postale = (s: LayoutTemplateSpec) => layoutTemplate("postale", SECTIONS, s, { defaultDisabled: ["date"] });

export const POSTALE_MANIFESTS: TemplateManifest[] = [
  postale({
    id: "postale",
    name: "Postale",
    tagline: "Greetings from your wedding.",
    description:
      "A Mediterranean travel story: your invitation arrives as a postcard, the countdown is a departures board, the ceremony and party are boarding passes and replies come back by airmail.",
    categories: ["whimsical", "outdoor", "modern", "photo"],
    palettes: [P.limone, P.capri, P.provence],
    fonts: { heading: "dmserif", body: "jost", accent: "spacemono" },
    card: { layout: "postcard" },
  }),
  postale({
    id: "voyage",
    name: "Voyage",
    tagline: "A desert-to-coast destination wedding.",
    description:
      "The Postale journey in sun-baked colours — sand, rust and an apricot ticket — with an elegant italic serif for riads, vineyards and island weddings.",
    categories: ["outdoor", "rustic", "whimsical", "photo"],
    palettes: [P.sahara, P.olive, P.riad],
    fonts: { heading: "instrument", body: "jost", accent: "spacemono" },
    card: { layout: "postcard", shape: "square" },
  }),
];

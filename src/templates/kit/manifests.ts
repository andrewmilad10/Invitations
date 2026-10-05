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
  // 5 · Black Tie
  onyx: { id: "onyx-champagne", label: "Onyx & champagne", family: "black", colors: c("#0e0e10", "#18181c", "#f3efe6", "#a8a197", "#cdb683", "#0e0e10", "#2b2a2e") },
  midnight: { id: "midnight-silver", label: "Midnight & silver", family: "blue", colors: c("#0b1020", "#141a2e", "#eef1f6", "#9aa3b5", "#c9ced8", "#0b1020", "#252c42") },
  oxblood: { id: "oxblood-gold", label: "Oxblood & gold", family: "red", colors: c("#140b0d", "#1f1215", "#f4ece4", "#b09a8c", "#c9a25e", "#140b0d", "#33201f") },
  // 6 · French Garden
  sageBlush: { id: "sage-blush", label: "Sage & blush", family: "green", colors: c("#f5f3ec", "#fbfaf5", "#233127", "#c99a94", "#4f6b4a", "#fbfaf5", "#dde0d2") },
  lavande: { id: "lavande", label: "Lavande", family: "purple", colors: c("#f4f2f6", "#fbfafc", "#2b2838", "#a99cc4", "#5b5486", "#fbfafc", "#e0dce8") },
  buis: { id: "buis-or", label: "Box & gilt", family: "green", colors: c("#f3f1e8", "#faf9f2", "#1f2a1f", "#b9975b", "#2f4a32", "#faf9f2", "#dcd8c6") },
  // 7 · Luxury Magazine
  rouge: { id: "rouge", label: "Rouge", family: "red", colors: c("#ffffff", "#f4f1ee", "#0d0d0d", "#7a7a7a", "#c8102e", "#ffffff", "#e2ded9") },
  noirGold: { id: "noir-gold", label: "Noir & gold", family: "gold", colors: c("#faf8f4", "#f0ebe3", "#111111", "#8a7a5c", "#9a7b3c", "#ffffff", "#e0d9cc") },
  fuchsia: { id: "fuchsia", label: "Fuchsia", family: "pink", colors: c("#fff8fa", "#fbeef2", "#1a0f14", "#8b6b77", "#c41e66", "#ffffff", "#f0dde4") },
  // 8 · Vintage Paper
  sepia: { id: "sepia", label: "Sepia & red ink", family: "neutral", colors: c("#f1e6cf", "#f8f0dd", "#3a2a1c", "#8c6f4e", "#9b3b2a", "#f8f0dd", "#dccaa6") },
  fadedBlue: { id: "faded-blue", label: "Faded blue ink", family: "blue", colors: c("#ece6d6", "#f6f1e3", "#22303f", "#7b8794", "#2f4f78", "#f6f1e3", "#d6ccb4") },
  oliveInk: { id: "olive-ink", label: "Olive ink", family: "green", colors: c("#ede5cf", "#f6efdc", "#2c2a1d", "#8a8257", "#5d6332", "#f6efdc", "#d8cda9") },
  // 9 · The Arch
  terracotta: { id: "terracotta", label: "Terracotta", family: "orange", colors: c("#f3ece3", "#faf6f0", "#3b2a22", "#d9b99b", "#b35c3c", "#faf6f0", "#e5d9cb") },
  olivePlaster: { id: "olive-plaster", label: "Olive & plaster", family: "green", colors: c("#f1efe6", "#f9f8f2", "#2f3324", "#c8c6a2", "#6b7240", "#f9f8f2", "#e0decf") },
  roseStone: { id: "rose-stone", label: "Rose stone", family: "pink", colors: c("#f5ece9", "#fbf6f4", "#3a2a2c", "#e2bfb8", "#a4545e", "#fbf6f4", "#eadad6") },
  // 10 · Film Story
  projector: { id: "projector", label: "Projector amber", family: "black", colors: c("#0f0d0b", "#1a1714", "#f1e9dc", "#8f8574", "#e8b04a", "#0f0d0b", "#2c2722") },
  silverScreen: { id: "silver-screen", label: "Silver screen", family: "white", colors: c("#ecebe7", "#f7f6f3", "#121212", "#7d7b75", "#b0262c", "#f7f6f3", "#d6d4ce") },
  noirTeal: { id: "noir-teal", label: "Noir teal", family: "blue", colors: c("#0c1314", "#142022", "#e6efee", "#7f9593", "#6fc3b8", "#0c1314", "#213133") },
  // 11 · Botanical
  fern: { id: "fern", label: "Fern", family: "green", colors: c("#eef0e8", "#f8f9f4", "#1d2b22", "#9fbf96", "#2e5b43", "#f8f9f4", "#d8ddd0") },
  nightHouse: { id: "night-glasshouse", label: "Night glasshouse", family: "green", colors: c("#142019", "#1c2b22", "#e9efe6", "#4f7a58", "#c9d8a8", "#142019", "#2a3b30") },
  pots: { id: "terracotta-pots", label: "Terracotta pots", family: "orange", colors: c("#f4ece4", "#fbf7f2", "#2b211c", "#a9b98f", "#8a4b32", "#fbf7f2", "#e6d9cc") },
  // 12 · Monogram House
  ivoryNoir: { id: "ivory-noir", label: "Ivory & noir", family: "black", colors: c("#f6f3ee", "#fffdfa", "#141414", "#a39a8c", "#141414", "#e9e2d6", "#e4ded4") },
  sageMaison: { id: "sage-maison", label: "Sage", family: "green", colors: c("#f3f4ef", "#fbfcf8", "#1b221d", "#9aa596", "#3f5747", "#e7ecdf", "#dfe3d9") },
  bordeaux: { id: "bordeaux", label: "Bordeaux", family: "red", colors: c("#f7f1ee", "#fffbf9", "#22141a", "#a8939a", "#5b1a28", "#ecd9c6", "#eadfdb") },
  // Swan Lake: one palette, matched to its embroidered linen artwork
  swanLinen: { id: "swan-linen", label: "Blue-grey linen", family: "blue", colors: c("#969fa8", "#f6f3ee", "#1d2a42", "#27354f", "#1d2a42", "#f6f3ee", "#d9d3c8") },
  // Cotton Press
  cottonSage: { id: "sage-gold", label: "Sage linen & gold", family: "green", colors: c("#a7ad9f", "#f6f1e6", "#2c2a25", "#5e594f", "#9a7430", "#f6f1e6", "#d8d0bf") },
  // Burgundy Envelope
  burgundyCream: { id: "wine-cream", label: "Wine & cream", family: "red", colors: c("#fcf4e5", "#f3e5d1", "#643d2e", "#b78a39", "#811a2b", "#fcf4e5", "#dac3a0") },
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
  kitTemplate(
    "blacktie",
    {
      id: "black-tie",
      name: "Black Tie",
      tagline: "An evening affair under a spotlight.",
      description:
        "Opens on a pair of satin lapels that part when guests tap the bow tie. Inside: your names in wide-set capitals under a soft spotlight, champagne hairlines, bevel-cornered ivory cards for the ceremony and the reply, and a programme strung on a single line.",
      categories: ["luxury", "elegant", "modern", "typography"],
      palettes: [P.onyx, P.midnight, P.oxblood],
      fonts: { heading: "didone", body: "jost", accent: "pinyon" },
      card: { layout: "refined" },
    },
    { opening: true },
  ),
  kitTemplate("jardin", {
    id: "french-garden",
    name: "French Garden",
    tagline: "A formal parterre, trellis and topiary.",
    description:
      "A French formal garden seen from above draws itself in box-hedge lines around a fountain. Photos sit behind trellis, the date is written on a garden stake, the countdown grows in clipped topiary and the day is a walk of stepping stones.",
    categories: ["botanical", "greenery", "outdoor", "elegant"],
    palettes: [P.sageBlush, P.lavande, P.buis],
    fonts: { heading: "baskerville", body: "cormorant", accent: "greatvibes" },
    card: { layout: "framed" },
  }),
  kitTemplate("glossy", {
    id: "luxury-magazine",
    name: "Luxury Magazine",
    tagline: "Your wedding as a glossy cover story.",
    description:
      "A full-bleed cover with your initials as the masthead, cover lines and a barcode. Inside: a contents page that links to every section, a feature in columns with a pull quote, the countdown 'by the numbers', a running order, a portfolio spread and a tear-out reply card.",
    categories: ["photo", "modern", "luxury", "typography"],
    palettes: [P.rouge, P.noirGold, P.fuchsia],
    fonts: { heading: "playfair", body: "inter", accent: "bebas" },
    card: { layout: "photo-overlay" },
  }),
  kitTemplate("ephemera", {
    id: "vintage-paper",
    name: "Vintage Paper",
    tagline: "Letterpress, typewriter and an inked postmark.",
    description:
      "A box of old paper things: a deckle-edged letterpress card with a postmark that thumps down, a typed letter under a paperclip, a tear-off calendar page, luggage tags for the ceremony and party, a ruled index card for the day, deckled snapshots and a library card for replies.",
    categories: ["vintage", "rustic", "romantic", "whimsical"],
    palettes: [P.sepia, P.fadedBlue, P.oliveInk],
    fonts: { heading: "oldstandard", body: "spacemono", accent: "homemade" },
    card: { layout: "torn-photo" },
  }),
  kitTemplate("arch", {
    id: "the-arch",
    name: "The Arch",
    tagline: "Mediterranean arches, terracotta and plaster.",
    description:
      "Everything is framed in an arch: a colonnade around your photo, nested arches for the date, arched panes for the countdown, an arcade for the day, a gallery of arched windows and an open doorway for the reply. Arches open upwards as guests scroll.",
    categories: ["modern", "outdoor", "romantic", "minimalist"],
    palettes: [P.terracotta, P.olivePlaster, P.roseStone],
    fonts: { heading: "italiana", body: "jost", accent: "allura" },
    card: { layout: "split-arch" },
  }),
  kitTemplate(
    "film",
    {
      id: "film-story",
      name: "Film Story",
      tagline: "Your love story as a feature film.",
      description:
        "Opens on a projector countdown, then a letterboxed title sequence. The date is a clapperboard, the ceremony and party are screenplay scenes, the day rolls like end credits, photos run on a film strip and the reply is a 'coming soon' poster under marquee bulbs.",
      categories: ["photo", "modern", "whimsical", "typography"],
      palettes: [P.projector, P.silverScreen, P.noirTeal],
      fonts: { heading: "bebas", body: "jost", accent: "dmserif" },
      card: { layout: "photo-full" },
    },
    { opening: true },
  ),
  kitTemplate("glasshouse", {
    id: "botanical-glasshouse",
    name: "Botanical Glasshouse",
    tagline: "A Victorian glasshouse full of leaves.",
    description:
      "Your photo seen through the glazing of a domed glasshouse, with oversized leaves that sway and drift as guests scroll. Frosted-glass panels, the date on a terracotta pot, the countdown in a glazed frame, a climbing vine for the day and a wall of glazed photographs.",
    categories: ["botanical", "greenery", "photo", "outdoor"],
    palettes: [P.fern, P.nightHouse, P.pots],
    fonts: { heading: "dmserif", body: "manrope", accent: "caveat" },
    card: { layout: "photo-top" },
  }),
  kitTemplate("house", {
    id: "monogram-house",
    name: "Monogram House",
    tagline: "Your initials as a fashion house.",
    description:
      "Your initials woven into a monogram canvas and a house seal. A gift box whose lid lifts to show your photo, the date blind-embossed, the countdown on watch dials, the day on a woven label, a lookbook of photos and a shopping bag for the reply.",
    categories: ["monogram", "luxury", "modern", "typography"],
    palettes: [P.ivoryNoir, P.sageMaison, P.bordeaux],
    fonts: { heading: "syne", body: "inter", accent: "cinzeldeco" },
    card: { layout: "monogram" },
  }),
  kitTemplate(
    "swan",
    {
      id: "swan-lake",
      name: "Swan Lake",
      tagline: "Hand embroidery on linen, swans and a moonlit lake.",
      description:
        "Opens on a stitched linen envelope with a pearl wax seal; the flap lifts and the invitation dissolves in. Inside: an embroidered arch of feathers and water lilies under a full moon, pearl-ringed countdown, your photo in a pearl frame, an embroidered château for the venue and the day inside a feather wreath.",
      categories: ["romantic", "luxury", "botanical", "elegant"],
      palettes: [P.swanLinen],
      fonts: { heading: "pinyon", body: "cormorant", accent: "pinyon" },
      card: { layout: "arch-panel" },
    },
    { opening: true },
  ),
  kitTemplate(
    "cotton",
    {
      id: "cotton-press",
      name: "Cotton Press",
      tagline: "Letterpress and gold foil on deckled cotton paper.",
      description:
        "Opens on a cotton envelope sealed in gold wax; the flap lifts to show a foil liner. Inside, a stationery suite on a linen tablecloth: the invitation on deckled cotton with a blind-embossed monogram and your names in gold foil, an edge-painted countdown card, letterpress event cards, the evening on vellum, photo prints in foil corners and a reply card.",
      categories: ["luxury", "classic", "elegant", "typography"],
      palettes: [P.cottonSage],
      fonts: { heading: "pinyon", body: "cormorant", accent: "bodoni" },
      card: { layout: "classic" },
    },
    { opening: true },
  ),
  {
    // Its media are placeholders from a third-party demo: see public/templates/burgundy-envelope/MEDIA-NOTICE.md
    ...kitTemplate(
      "burgundy",
      {
        id: "burgundy-envelope",
        name: "Burgundy Envelope",
        tagline: "A candle-lit evening that opens from an embossed envelope.",
        description:
          "Opens on an embossed burgundy envelope with a gold leaf crest that lifts slowly, then a cinematic hero video with your names in script. Cream pages in wine and gold for the welcome, countdown, a calendar with your day circled, the celebration, the venue, guidelines and the reply.",
        categories: ["luxury", "romantic", "elegant", "classic"],
        palettes: [P.burgundyCream],
        fonts: { heading: "pinyon", body: "cormorant", accent: "jost" },
        card: { layout: "classic" },
      },
      { opening: true },
    ),
  },
];

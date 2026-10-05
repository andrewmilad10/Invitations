import type { TemplateManifest } from "@/core/template/manifest";
import { ATELIER_MANIFESTS } from "./atelier/manifests";
import { cinematicManifest } from "./cinematic/manifest";
import { botanicalManifest, classicManifest, luxuryManifest, modernManifest, romanticManifest } from "./collection/manifests";
import { BOUTIQUE_MANIFESTS } from "./collection/boutique";
import { KEEPSAKE_MANIFESTS } from "./collection/keepsakes";
import { DESIGN_MANIFESTS } from "./collection/designs";
import { editorialManifest } from "./editorial/manifest";
import { ESSENTIALS_MANIFESTS } from "./essentials/manifests";
import { GALERIE_MANIFESTS } from "./galerie/manifests";
import { KIT_MANIFESTS } from "./kit/manifests";
import { MAISON_MANIFESTS } from "./maison/manifests";
import { POSTALE_MANIFESTS } from "./postale/manifests";
import { SHOWPIECE_MANIFESTS } from "./showpiece/manifests";

/**
 * Every template the platform knows about (metadata only — safe to import
 * anywhere). Renderers are registered separately in ./renderers.tsx so the
 * dashboard doesn't load animation code.
 *
 * Adding a template = add its manifest here. A template with a new layout
 * also registers its renderer in ./renderers.tsx.
 */
const ALL: TemplateManifest[] = [
  romanticManifest,
  classicManifest,
  cinematicManifest,
  modernManifest,
  botanicalManifest,
  luxuryManifest,
  editorialManifest,
  ...DESIGN_MANIFESTS,
  ...BOUTIQUE_MANIFESTS,
  ...KEEPSAKE_MANIFESTS,
  ...ATELIER_MANIFESTS,
  ...MAISON_MANIFESTS,
  ...GALERIE_MANIFESTS,
  ...POSTALE_MANIFESTS,
  ...SHOWPIECE_MANIFESTS,
  ...ESSENTIALS_MANIFESTS,
  ...KIT_MANIFESTS,
];

/** Gallery "Featured" order; anything not listed follows in registry order. */
const FEATURED = [
  "message-in-a-bottle", "swan-lake", "swan-pond", "set-sail", "villa-rosa", "something-blue", "cotton-press", "rose-marble", "burgundy-envelope", "the-gate", "moonlit-nile", "pressed-garden",
  "editorial-romance", "old-money", "modern-minimal", "italian-summer", "black-tie", "french-garden", "luxury-magazine", "vintage-paper",
  "the-arch", "film-story", "botanical-glasshouse", "monogram-house",
  "bon-voyage", "velvet-tulips", "botanical-line", "joyride", "rose-arch", "golden-fronds", "twilight-arch", "pressed-keepsake", "gardenia",
  "baroque-crest", "calla-lily", "golden-oval", "monochrome-bloom", "save-the-date", "wild-garden", "velvet-calla", "gilded-crest",
  "marlowe", "garden-toile", "verdant", "horizon", "gilded-garden", "serena", "peony-press", "wildwood", "cypress", "aurelia",
  "giza-at-dusk", "written-in-the-stars", "baron-palace", "keepsake-box", "luxor-temple", "rose-window", "montaza-by-the-sea", "paper-theatre",
  "simple-linen", "simple-monogram", "side-by-side", "modern-type",
  "the-gate", "moonlit-nile", "pressed-garden", "gilded-toast",
  "maison", "cinematic", "postale", "galerie", "meadow", "couture", "delft-garland", "willow-arch", "laurel-crest", "gilded-deco", "wild-meadow",
  "monochrome", "romantic", "four-frames", "olive-grove", "moonlit", "chapel-window", "classic",
  "riviera", "big-day", "satin-bow", "limoncello", "botanical", "amalfi-tile", "rose-corners",
  "voyage", "salon", "nocturne", "terracotta", "rosewater", "luxury", "morning-wash", "heritage", "golden-hour", "eucalyptus", "flourish",
];

const rank = (id: string) => {
  const i = FEATURED.indexOf(id);
  return i === -1 ? FEATURED.length + ALL.findIndex((t) => t.id === id) : i;
};

/**
 * The website designs on sale right now. Every other website design stays
 * registered (so weddings already made with one keep rendering) but is
 * hidden from the gallery and the wizard.
 */
const LIVE_WEBSITES = new Set(["the-gate", "moonlit-nile", "pressed-garden", "swan-lake", "burgundy-envelope", "cotton-press", "rose-marble", "something-blue", "villa-rosa", "swan-pond", "set-sail", "message-in-a-bottle"]);
const isWebsite = (t: TemplateManifest) => (t.features.hero ?? "photo") !== "card";
const withVisibility = (t: TemplateManifest): TemplateManifest => (isWebsite(t) && !LIVE_WEBSITES.has(t.id) ? { ...t, status: "hidden" } : t);

export const TEMPLATE_MANIFESTS: readonly TemplateManifest[] = [...ALL].map(withVisibility).sort((a, b) => rank(a.id) - rank(b.id));

export const DEFAULT_TEMPLATE_ID = cinematicManifest.id;
/** The design the "new wedding" wizard starts on. */
export const DEFAULT_NEW_TEMPLATE_ID = "swan-lake";

const byId = new Map(TEMPLATE_MANIFESTS.map((t) => [t.id, t]));

export function getTemplateManifest(id: string): TemplateManifest | undefined {
  return byId.get(id);
}

/**
 * The manifest to render a wedding with. If a stored template id is unknown
 * (e.g. a template was retired), fall back to the default rather than 404 —
 * the wedding's data is template-independent, so nothing is lost.
 */
export function resolveTemplateManifest(id: string): TemplateManifest {
  return byId.get(id) ?? byId.get(DEFAULT_TEMPLATE_ID)!;
}

/** Templates a couple can choose in the wizard / theme panel. */
export function selectableTemplates(): TemplateManifest[] {
  return TEMPLATE_MANIFESTS.filter((t) => t.status !== "hidden");
}

export function isSelectableTemplateId(id: string): boolean {
  const t = byId.get(id);
  return Boolean(t && t.status !== "hidden");
}

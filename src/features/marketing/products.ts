import type { TemplateManifest } from "@/core/template/manifest";

/**
 * What Vellum sells, as two separate collections: invitation cards (designs
 * made to be printed or sent as an image) and wedding websites (layouts made
 * to be scrolled). Each design belongs to exactly one, with its own gallery
 * and its own product page.
 */
export const PRODUCTS = {
  cards: {
    path: "/invitations",
    label: "Invitation cards",
    title: "Wedding invitations",
    intro: "Invitations so beautiful you'll want to keep one. Choose a colour, silhouette, foil and paper — then personalise it free.",
    crumb: "Invitations",
    view: "card",
  },
  websites: {
    path: "/websites",
    label: "Wedding websites",
    title: "Wedding websites",
    intro: "A beautiful website for your wedding with its own link: your story, schedule, venues with maps, countdown, photos and RSVP — on every phone.",
    crumb: "Websites",
    view: "website",
  },
} as const;

export type Product = keyof typeof PRODUCTS;

export function isProduct(value: unknown): value is Product {
  return value === "cards" || value === "websites";
}

/** What a website's opening moment is, in a few words (null when it has none). */
const OPENINGS: Record<string, [label: string, sentence: string]> = {
  gate: ["Palace-door opening", "Opens with palace doors sealed with your initials: guests tap the seal and the doors swing open."],
  nile: ["Lantern opening", "Opens on a starry night over the Nile: guests tap and lanterns rise into the sky."],
  herbarium: ["Book opening", "Opens as a linen book: guests tap and the cover swings open on a blooming flower."],
  toast: ["Champagne opening", "Opens with a champagne coupe in a gold Deco frame: guests tap and the bubbles lift the curtain."],
  stars: ["Constellation opening", "Opens on a night sky: guests tap and the stars join into a heart as a shooting star crosses."],
  popup: ["Pop-up opening", "Opens as a folded card: guests tap and a paper stage pops up, layer by layer."],
  glass: ["Stained-glass opening", "Opens on pieces of coloured glass: guests tap and they set into a rose window as the light pours in."],
  keepsake: ["Gift-box opening", "Opens on a gift box tied with silk: guests tap, the bow unties, the lid lifts and your card rises out."],
  giza: ["Sunrise opening", "Opens at night under the pyramids: guests tap and the sun rises behind them."],
  baron: ["Palace-lights opening", "Opens as the palace draws itself in gold: guests tap and every window lights up."],
  montaza: ["Wave opening", "Opens by the sea at Montaza: guests tap and a wave rolls in to reveal your page."],
  luxor: ["Temple opening", "Opens in Luxor's colonnade at night: guests tap and walk through the columns into the light."],
};
export function openingOf(t: Pick<TemplateManifest, "features" | "renderer">): { label: string; sentence: string } | null {
  if (t.features.opening !== "envelope") return null;
  const [label, sentence] = OPENINGS[t.renderer] ?? ["Envelope opening", "Opens with a sealed envelope your guests tap to open."];
  return { label, sentence };
}

/** Website highlights of a template, for labels on website cards. */
export function websiteFeatures(t: TemplateManifest): string[] {
  const out: string[] = [];
  const opening = openingOf(t);
  if (opening) out.push(opening.label);
  if (t.supportedSections.includes("countdown")) out.push("Countdown");
  if (t.supportedSections.includes("venue")) out.push("Maps");
  if (t.supportedSections.includes("rsvp")) out.push("RSVP");
  if (t.features.music) out.push("Music");
  return out;
}

/** Websites gallery order: designs whose site opens on a full photo first. */
export function websiteOrder(templates: readonly TemplateManifest[]): TemplateManifest[] {
  return [...templates].sort((a, b) => Number((a.features.hero ?? "photo") === "card") - Number((b.features.hero ?? "photo") === "card"));
}

/** The collection a design belongs to: card designs open on their card; layouts on a photo. */
export function productOf(t: Pick<TemplateManifest, "features">): Product {
  return (t.features.hero ?? "photo") === "card" ? "cards" : "websites";
}

export function templatesFor(product: Product, all: readonly TemplateManifest[]): TemplateManifest[] {
  return all.filter((t) => productOf(t) === product);
}

/** A design's product page. */
export function productHref(product: Product, id: string, query?: URLSearchParams | string): string {
  const q = typeof query === "string" ? query : query?.toString() ?? "";
  return `${PRODUCTS[product].path}/${id}${q ? `?${q.replace(/^\?/, "")}` : ""}`;
}

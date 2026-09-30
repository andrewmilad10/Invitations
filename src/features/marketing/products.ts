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

/** Website highlights of a template, for labels on website cards. */
export function websiteFeatures(t: TemplateManifest): string[] {
  const out: string[] = [];
  if (t.features.opening === "envelope") out.push("Envelope opening");
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

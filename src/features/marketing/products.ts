import type { TemplateManifest } from "@/core/template/manifest";

/**
 * What Vellum sells. Every design is both: a card the couple can send (and,
 * later, print) and a small invitation website with its own link. The two
 * galleries show the same designs through different eyes.
 */
export const PRODUCTS = {
  cards: {
    path: "/invitations",
    label: "Invitation cards",
    title: "Invitation cards",
    intro: "Original card designs, each in several colours. Personalise one, download it to send on WhatsApp or by email — printed cards are coming soon.",
    view: "card",
  },
  websites: {
    path: "/websites",
    label: "Wedding websites",
    title: "Wedding websites",
    intro: "A small website for your wedding with its own link: your story, schedule, venues with maps, countdown, photos and RSVP — on every phone.",
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

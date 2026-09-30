import type { WeddingBundle } from "@/core/wedding/bundle";

/**
 * Sample wedding for template previews (/templates/{id}/preview) and tests.
 * This is FIXTURE DATA — the only place in the codebase where a couple's
 * details are written down. Components never import it directly; it enters
 * the same buildInvitationModel() pipeline as real data.
 *
 * Images are bundled under /public/samples so previews work offline.
 */
export function sampleBundle(templateId: string, now: Date = new Date()): WeddingBundle {
  // Always ~5 months ahead so the countdown is meaningful.
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 5, 14));
  const day = date.toISOString().slice(0, 10);

  return {
    wedding: {
      id: "00000000-0000-4000-8000-000000000000",
      slug: "sample",
      partner_one_name: "Layla",
      partner_two_name: "Omar",
      wedding_date: day,
      template_id: templateId,
      status: "published",
      published_at: null,
      updated_at: null,
    },
    settings: { locale: "en", timezone: "Africa/Cairo", visibility: "unlisted", music_enabled: false },
    theme: { tokens: {} },
    sections: [
      {
        type: "story",
        enabled: true,
        sort_order: null,
        content: {
          body:
            "We met on a rainy afternoon in a bookshop, both reaching for the last copy of the same novel.\n\nSix years, two cities and one very patient cat later, we're ready for our next chapter — and we'd love for you to be there.",
        },
      },
      {
        type: "schedule",
        enabled: true,
        sort_order: null,
        content: {
          items: [
            { time: "4:30 PM", title: "Guests arrive", note: "" },
            { time: "5:00 PM", title: "Ceremony", note: "" },
            { time: "7:30 PM", title: "Dinner & dancing", note: "" },
          ],
        },
      },
    ],
    events: [
      {
        id: "00000000-0000-4000-8000-00000000e001",
        kind: "ceremony",
        title: "Ceremony",
        starts_at: `${day}T14:00:00.000Z`,
        ends_at: null,
        venue_name: "The Garden Chapel",
        address: "Zamalek, Cairo, Egypt",
        latitude: null,
        longitude: null,
        map_url: null,
        description: null,
        sort_order: 0,
      },
      {
        id: "00000000-0000-4000-8000-00000000e002",
        kind: "reception",
        title: "Reception",
        starts_at: `${day}T16:30:00.000Z`,
        ends_at: null,
        venue_name: "The Nile Terrace",
        address: "Corniche El Nil, Cairo, Egypt",
        latitude: null,
        longitude: null,
        map_url: null,
        description: null,
        sort_order: 1,
      },
    ],
    media: [
      { id: "s-hero", kind: "image", purpose: "hero", storage_path: "/samples/hero.jpg", alt_text: "", width: 1600, height: 1067, sort_order: 0 },
      ...[1, 2, 3, 4, 5].map((n) => ({
        id: `s-g${n}`,
        kind: "image" as const,
        purpose: "gallery" as const,
        storage_path: `/samples/gallery-${n}.jpg`,
        alt_text: "",
        width: 1200,
        height: n % 2 ? 1500 : 800,
        sort_order: n,
      })),
    ],
  };
}

/** Sample media paths are already public URLs. */
export const sampleMediaUrl = (path: string) => path;

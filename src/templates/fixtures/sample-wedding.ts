import type { WeddingBundle } from "@/core/wedding/bundle";
import { PHOTO_LIBRARY, type LibraryPhotoId } from "@/features/media/library";
import { libraryPath, publicMediaUrl } from "@/features/media/urls";

/**
 * Demo wedding used by template previews, the gallery, the homepage and as
 * the starting point of the no-account "try" flow. This is FIXTURE DATA — the
 * only place a couple's details are written down. It enters the normal
 * buildInvitationModel() pipeline like any real wedding.
 */
export const DEMO = {
  partnerOne: "Emma",
  partnerTwo: "James",
  month: 10,
  day: 14,
  ceremony: { venue: "St. Mary's Church", address: "12 Church Lane, Kensington, London", time: "15:00" },
  reception: { venue: "The Garden Estate", address: "Holland Park, London", time: "18:00" },
  timezone: "Europe/London",
} as const;

/** The next 14 October (today counts), so the demo countdown never runs out. */
export function demoDate(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const thisYear = Date.UTC(year, DEMO.month - 1, DEMO.day);
  const today = Date.UTC(year, now.getUTCMonth(), now.getUTCDate());
  const y = thisYear >= today ? year : year + 1;
  return `${y}-${String(DEMO.month).padStart(2, "0")}-${String(DEMO.day).padStart(2, "0")}`;
}

const photo = (id: LibraryPhotoId, purpose: "hero" | "gallery", sort: number, width: number, height: number) => ({
  id: `demo-${id}`,
  kind: "image" as const,
  purpose,
  storage_path: libraryPath(id),
  alt_text: PHOTO_LIBRARY[id].alt,
  width,
  height,
  sort_order: sort,
});

/**
 * A demo photo that ships with the repo (public/…), used when a template is
 * designed around its own imagery rather than the shared library. publicMediaUrl
 * returns `/`-rooted paths unchanged, so these resolve on the server and client
 * and need no network — the preview recorder sees them too.
 */
const localPhoto = (
  path: string,
  purpose: "hero" | "gallery",
  sort: number,
  width: number,
  height: number,
  alt: string,
) => ({ id: `demo-local-${sort}`, kind: "image" as const, purpose, storage_path: path, alt_text: alt, width, height, sort_order: sort });

/**
 * Per-template demo media. A template built around a specific look (its own
 * cover and gallery, drawn or shot for it) overrides the shared library so the
 * preview and the first "use this template" screen show that exact design.
 */
function sampleMedia(templateId: string) {
  if (templateId === "aurelia-suite") {
    const p = "/templates/aurelia/";
    return [
      localPhoto(`${p}hero.jpg`, "hero", 0, 944, 1680, "A couple at golden hour above an Italian lake"),
      localPhoto(`${p}g-lead.jpg`, "gallery", 1, 944, 756, "A couple walking above the lake"),
      localPhoto(`${p}g1.jpg`, "gallery", 2, 584, 536, "A couple embracing at golden hour"),
      localPhoto(`${p}g3.jpg`, "gallery", 3, 568, 612, "Coupe glasses on a wooden boat"),
      localPhoto(`${p}g-arch.jpg`, "gallery", 4, 540, 544, "A couple beneath a garden arch"),
      localPhoto(`${p}g2.jpg`, "gallery", 5, 568, 628, "A ring resting on ivory silk"),
    ];
  }
  return [
    photo("couple", "hero", 0, 2400, 1600),
    photo("outdoors", "gallery", 1, 1600, 2400),
    photo("rings", "gallery", 2, 2400, 1600),
    photo("bouquet", "gallery", 3, 2400, 1600),
    photo("celebration", "gallery", 4, 1600, 2400),
    photo("reception", "gallery", 5, 2400, 1600),
    photo("venue", "gallery", 6, 2400, 1600),
  ];
}

/** London is UTC+1 in mid-October (BST), so 15:00 local = 14:00Z. */
function londonIso(date: string, time: string) {
  const [h, m] = time.split(":").map(Number);
  return new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)), h - 1, m)).toISOString();
}

export const DEMO_WEDDING_ID = "00000000-0000-4000-8000-000000000000";

export function sampleBundle(templateId: string, now: Date = new Date()): WeddingBundle {
  const day = demoDate(now);
  return {
    wedding: {
      id: DEMO_WEDDING_ID,
      slug: "emma-and-james",
      partner_one_name: DEMO.partnerOne,
      partner_two_name: DEMO.partnerTwo,
      wedding_date: day,
      template_id: templateId,
      status: "published",
      published_at: null,
      updated_at: null,
    },
    settings: { locale: "en", timezone: DEMO.timezone, visibility: "unlisted", music_enabled: false },
    theme: { tokens: {} },
    sections: [
      {
        type: "story",
        enabled: true,
        sort_order: null,
        content: {
          body:
            "We met on a rainy Tuesday in a bookshop on Charing Cross Road, both reaching for the last copy of the same novel. James let Emma have it — on the condition that she tell him how it ended, over coffee.\n\nSeven years, two flats and one very opinionated cat later, we're getting married. We can't imagine the day without you.",
          quote: "Love is patient, love is kind. It always protects, always trusts, always hopes, always perseveres.",
          quoteSource: "1 Corinthians 13",
        },
      },
      {
        type: "schedule",
        enabled: true,
        sort_order: null,
        content: {
          items: [
            { time: "2:30 pm", title: "Guests arrive", note: "St. Mary's Church" },
            { time: "3:00 pm", title: "Ceremony", note: "" },
            { time: "6:00 pm", title: "Dinner & dancing", note: "The Garden Estate" },
            { time: "11:30 pm", title: "Carriages", note: "" },
          ],
        },
      },
      {
        type: "faq",
        enabled: true,
        sort_order: null,
        content: {
          items: [
            { question: "Is there a dress code?", answer: "Black tie optional. Think evening dresses and dark suits — and comfortable shoes for the garden." },
            { question: "Are children invited?", answer: "We love your little ones, but the evening is for adults. Babes in arms are very welcome." },
            { question: "Is there parking?", answer: "Yes, free parking at The Garden Estate. Taxis can wait at the main gate from 11 pm." },
          ],
        },
      },
      {
        type: "rsvp",
        enabled: true,
        sort_order: null,
        content: { deadline: `Kindly reply by 1 September` },
      },
    ],
    events: [
      {
        id: "00000000-0000-4000-8000-00000000e001",
        kind: "ceremony",
        title: "Ceremony",
        starts_at: londonIso(day, DEMO.ceremony.time),
        ends_at: null,
        venue_name: DEMO.ceremony.venue,
        address: DEMO.ceremony.address,
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
        starts_at: londonIso(day, DEMO.reception.time),
        ends_at: null,
        venue_name: DEMO.reception.venue,
        address: DEMO.reception.address,
        latitude: null,
        longitude: null,
        map_url: null,
        description: "Dinner, speeches and dancing under the old oak.",
        sort_order: 1,
      },
    ],
    media: sampleMedia(templateId),
  };
}

/** Demo media are library references; resolved like any media path. */
export const sampleMediaUrl = publicMediaUrl;

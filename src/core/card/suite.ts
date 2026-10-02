import { z } from "zod";
import { cardOptionsSchema, type CardOptionOverrides } from "./options";

/**
 * A card suite: everything the couple designs in the card studio — the
 * invitation (front and back), an optional details enclosure, and the
 * envelope. Pure data; drawn by src/templates/shared/stationery/suite.tsx.
 */

export const BACK_LAYOUTS = ["blank", "monogram", "photo", "note", "pattern"] as const;
export type BackLayout = (typeof BACK_LAYOUTS)[number];

export const ENCLOSURE_BACKS = ["blank", "monogram", "pattern"] as const;
export type EnclosureBack = (typeof ENCLOSURE_BACKS)[number];

/** Envelope papers: name and colour (display only). */
export const ENVELOPE_COLORS = {
  white: ["Basic white", "#fbfbf9"],
  ivory: ["Ivory", "#f5efe1"],
  kraft: ["Kraft", "#c9a47a"],
  blush: ["Blush", "#ecc9c6"],
  sage: ["Sage", "#b8c4ad"],
  "dusty-blue": ["Dusty blue", "#a9bccd"],
  navy: ["Navy", "#1d2b4a"],
  emerald: ["Emerald", "#1f4a3b"],
  burgundy: ["Burgundy", "#5c1b2a"],
  terracotta: ["Terracotta", "#b5603f"],
  charcoal: ["Charcoal", "#3b3b3d"],
  black: ["Black", "#151515"],
} as const satisfies Record<string, readonly [string, string]>;
export type EnvelopeColor = keyof typeof ENVELOPE_COLORS;

export const LINERS = ["none", "accent", "dots", "stripes", "gingham", "lattice", "botanical", "design"] as const;
export type Liner = (typeof LINERS)[number];
export const LINER_LABELS: Record<Liner, string> = {
  none: "No lining",
  accent: "Solid colour",
  dots: "Polka dots",
  stripes: "Stripes",
  gingham: "Gingham",
  lattice: "Lattice",
  botanical: "Leaves",
  design: "Your design",
};

export const SUITE_LANGS = ["en", "ar"] as const;
export type SuiteLang = (typeof SUITE_LANGS)[number];

export interface SuiteText {
  /** The card's language: English, or Arabic (right to left). */
  lang: SuiteLang;
  partnerOne: string;
  partnerTwo: string;
  eyebrow: string;
  line: string;
  /** yyyy-mm-dd or "" */
  date: string;
  time: string;
  place: string;
  /** Free lines the couple adds ("Reception to follow", a dress code…). */
  extra: string;
}

export interface EnclosureSection {
  title: string;
  body: string;
}

export interface CardSuite {
  v: 1;
  templateId: string;
  paletteId: string | null;
  options: CardOptionOverrides;
  /** Paper colour override (hex) or null for the design's own. */
  background: string | null;
  text: SuiteText;
  /** A photo for photo designs and the photo back (data URL kept on this device). */
  photo: string | null;
  back: { layout: BackLayout; note: string; qr: boolean; qrUrl: string };
  enclosure: { enabled: boolean; heading: string; sections: EnclosureSection[]; back: EnclosureBack; qr: boolean; qrUrl: string };
  envelope: { color: EnvelopeColor; liner: Liner; returnAddress: string; guestName: string; guestAddress: string };
}

export function defaultSuite(templateId: string, paletteId: string | null = null, options: CardOptionOverrides = {}, sample: { eyebrow?: string; line?: string } = {}): CardSuite {
  return {
    v: 1,
    templateId,
    paletteId,
    options,
    background: null,
    text: {
      lang: "en",
      partnerOne: "Emma",
      partnerTwo: "James",
      eyebrow: sample.eyebrow ?? "Together with their families",
      line: sample.line ?? "invite you to celebrate their wedding",
      date: "2026-10-17",
      time: "7:00 pm",
      place: "Villa Aurelia · Rome",
      extra: "",
    },
    photo: null,
    back: { layout: "monogram", note: "We can't wait to celebrate with you.", qr: false, qrUrl: "" },
    enclosure: {
      enabled: true,
      heading: "The details",
      sections: [
        { title: "Reception", body: "Villa Aurelia\nLargo di Porta San Pancrazio, Rome" },
        { title: "Attire", body: "Black tie optional" },
        { title: "Accommodations", body: "Hotel Lord Byron\nVia Giuseppe de Notaris 5, Rome" },
        { title: "More information", body: "Our wedding website has everything else you need." },
      ],
      back: "blank",
      qr: false,
      qrUrl: "",
    },
    envelope: { color: "white", liner: "design", returnAddress: "Emma & James\n12 Garden Street\nCairo", guestName: "Mr & Mrs Adams", guestAddress: "45 Nile Corniche\nCairo, Egypt" },
  };
}

/**
 * Starting choices that belong to a design's theme: the travel design
 * ("boarding-pass") starts with a black envelope and travel notes.
 */
export function travelDefaults(suite: CardSuite, layout: string | undefined): CardSuite {
  if (layout !== "boarding-pass") return suite;
  return {
    ...suite,
    enclosure: {
      ...suite.enclosure,
      heading: "Travel details",
      sections: [
        { title: "Where to stay", body: "Rooms are held for our guests at Hotel Lord Byron.\nMention our names when you book." },
        { title: "Getting there", body: "Fly into Rome Fiumicino (FCO).\nA shuttle will bring you to the villa." },
        { title: "The venue", body: "Villa Aurelia\nLargo di Porta San Pancrazio, Rome" },
      ],
    },
    envelope: { ...suite.envelope, color: "black" },
  };
}

const text = (max: number) => z.string().max(max);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const suiteSchema = z.object({
  v: z.literal(1),
  templateId: z.string().max(40),
  paletteId: z.string().max(40).nullable(),
  options: cardOptionsSchema,
  background: hex.nullable(),
  text: z.object({
    lang: z.enum(SUITE_LANGS).default("en"),
    partnerOne: text(80),
    partnerTwo: text(80),
    eyebrow: text(140),
    line: text(200),
    date: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
    time: text(40),
    place: text(160),
    extra: text(300),
  }),
  photo: z.string().max(4_000_000).nullable(),
  back: z.object({ layout: z.enum(BACK_LAYOUTS), note: text(400), qr: z.boolean(), qrUrl: text(500) }),
  enclosure: z.object({
    enabled: z.boolean(),
    heading: text(80),
    sections: z.array(z.object({ title: text(80), body: text(400) })).max(6),
    back: z.enum(ENCLOSURE_BACKS),
    qr: z.boolean(),
    qrUrl: text(500),
  }),
  envelope: z.object({
    color: z.enum(Object.keys(ENVELOPE_COLORS) as [EnvelopeColor, ...EnvelopeColor[]]),
    liner: z.enum(LINERS),
    returnAddress: text(300),
    guestName: text(120),
    guestAddress: text(300),
  }),
});

/** Parses a stored suite; anything invalid is discarded. */
export function parseSuite(raw: unknown): CardSuite | null {
  const r = suiteSchema.safeParse(raw);
  return r.success ? (r.data as CardSuite) : null;
}

/** Only http(s) links become QR codes. */
export function safeQrUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Wording each language starts with (swapped in when the couple switches language). */
export const SUITE_WORDING: Record<SuiteLang, { eyebrow: string; line: string; partnerOne: string; partnerTwo: string; place: string; time: string; heading: string }> = {
  en: { eyebrow: "Together with their families", line: "invite you to celebrate their wedding", partnerOne: "Emma", partnerTwo: "James", place: "Villa Aurelia · Rome", time: "7:00 pm", heading: "The details" },
  ar: { eyebrow: "بمشاركة عائلتيهما", line: "يتشرفان بدعوتكم لمشاركتهما فرحة زفافهما", partnerOne: "ليلى", partnerTwo: "عمر", place: "قصر البارون · القاهرة", time: "٧:٠٠ مساءً", heading: "التفاصيل" },
};

/**
 * Switch the suite's language. Words the couple left as the sample wording
 * are translated; anything they typed themselves is kept.
 */
export function withLanguage(suite: CardSuite, lang: SuiteLang, sample: { eyebrow?: string; line?: string } = {}): CardSuite {
  if (suite.text.lang === lang) return suite;
  // The design's own English wording counts as sample wording too.
  const english = { ...SUITE_WORDING.en, eyebrow: sample.eyebrow ?? SUITE_WORDING.en.eyebrow, line: sample.line ?? SUITE_WORDING.en.line };
  const from = suite.text.lang === "en" ? english : SUITE_WORDING[suite.text.lang];
  const to = lang === "en" ? english : SUITE_WORDING[lang];
  const swap = <K extends keyof typeof from>(value: string, key: K) => (value === from[key] || value === SUITE_WORDING[suite.text.lang][key] || value === "" ? to[key] : value);
  const isSampleSection = suite.enclosure.heading === from.heading;
  return {
    ...suite,
    options: lang === "ar" && suite.options.blessing === undefined ? { ...suite.options, blessing: "bismillah" } : suite.options,
    text: {
      ...suite.text,
      lang,
      partnerOne: swap(suite.text.partnerOne, "partnerOne"),
      partnerTwo: swap(suite.text.partnerTwo, "partnerTwo"),
      eyebrow: swap(suite.text.eyebrow, "eyebrow"),
      line: swap(suite.text.line, "line"),
      place: swap(suite.text.place, "place"),
      time: swap(suite.text.time, "time"),
    },
    enclosure: isSampleSection ? { ...suite.enclosure, heading: to.heading } : suite.enclosure,
  };
}

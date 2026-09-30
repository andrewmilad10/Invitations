import { z } from "zod";
import { zonedTimeToIso } from "@/core/i18n/format";
import { LOCALES, type Locale } from "@/core/i18n/locales";
import type { TemplateManifest } from "@/core/template/manifest";
import { cardOptionsSchema, sanitizeCardOptions } from "@/core/card/options";
import type { ThemeOverrides } from "@/core/theme/tokens";
import type { BundleEvent, BundleMedia, WeddingBundle } from "@/core/wedding/bundle";
import { PHOTO_LIBRARY, type LibraryPhotoId } from "@/features/media/library";
import { libraryPath } from "@/features/media/urls";
import { sampleBundle } from "@/templates/fixtures/sample-wedding";

/**
 * The no-account "try" flow stores only what the visitor typed or chose —
 * their ANSWERS. Two views are derived from them:
 *
 *  - previewBundle(): answers laid over the demo wedding, so the invitation
 *    always looks finished while they type (blank = sample content).
 *  - draftToCreate(): only the visitor's own answers, for saving to an
 *    account. Demo names, venues, story and photos are never saved.
 */

export const DRAFT_VERSION = 1;

const libraryIds = Object.keys(PHOTO_LIBRARY) as [LibraryPhotoId, ...LibraryPhotoId[]];

export const photoRefSchema = z.discriminatedUnion("source", [
  z.object({ source: z.literal("library"), id: z.enum(libraryIds) }),
  z.object({
    source: z.literal("local"),
    /** Key of the file in the browser's IndexedDB draft store. */
    key: z.string().min(1).max(80),
    name: z.string().max(200),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
  }),
]);
export type PhotoRef = z.infer<typeof photoRefSchema>;

const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).or(z.literal(""));

const eventAnswers = z.object({
  venue: z.string().max(160),
  address: z.string().max(400),
  time: timeString,
});
export type EventAnswers = z.infer<typeof eventAnswers>;

export const answersSchema = z.object({
  v: z.literal(DRAFT_VERSION),
  templateId: z.string().max(40),
  partnerOne: z.string().max(80),
  partnerTwo: z.string().max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  ceremony: eventAnswers,
  reception: eventAnswers,
  timezone: z.string().max(64),
  locale: z.enum(LOCALES),
  /** A palette id of the chosen template (reset when the template changes). */
  palette: z.string().max(40).nullable(),
  /** Card finishing options chosen on the card's page (orientation, foil…). */
  card: cardOptionsSchema.optional(),
  photos: z.object({
    hero: photoRefSchema.nullable(),
    gallery: z.array(photoRefSchema).max(12),
  }),
  updatedAt: z.string(),
});
export type TryAnswers = z.infer<typeof answersSchema>;

export const MAX_DRAFT_GALLERY = 12;

const emptyEvent = (): EventAnswers => ({ venue: "", address: "", time: "" });

export function emptyAnswers(templateId: string, timezone = "Africa/Cairo"): TryAnswers {
  return {
    v: DRAFT_VERSION,
    templateId,
    partnerOne: "",
    partnerTwo: "",
    date: null,
    ceremony: emptyEvent(),
    reception: emptyEvent(),
    timezone,
    locale: "en",
    palette: null,
    photos: { hero: null, gallery: [] },
    updatedAt: new Date(0).toISOString(),
  };
}

/** Parses stored answers; anything invalid or from an old version is discarded. */
export function parseAnswers(raw: unknown): TryAnswers | null {
  const result = answersSchema.safeParse(raw);
  return result.success ? result.data : null;
}

/** True once the visitor has entered something worth saving. */
export function hasProgress(a: TryAnswers): boolean {
  return Boolean(
    a.partnerOne.trim() || a.partnerTwo.trim() || a.date || a.ceremony.venue.trim() || a.reception.venue.trim() || a.photos.hero || a.photos.gallery.length,
  );
}

/** Switching template keeps every answer; only the palette (a presentation choice of the old template) resets. */
export function withTemplate(a: TryAnswers, templateId: string): TryAnswers {
  return a.templateId === templateId ? a : { ...a, templateId, palette: null };
}

export function themeOverrides(a: TryAnswers, template: TemplateManifest): ThemeOverrides {
  const palette = template.palettes.find((p) => p.id === a.palette);
  const out: ThemeOverrides = palette && Object.keys(palette.colors).length ? { colors: palette.colors } : {};
  const card = sanitizeCardOptions(a.card);
  if (Object.keys(card).length) out.card = card;
  return out;
}

/** Media path used for a photo ref: library references are permanent, local files are resolved to blob: URLs by the browser. */
export function photoPath(ref: PhotoRef): string {
  return ref.source === "library" ? libraryPath(ref.id) : `local:${ref.key}`;
}

function toMedia(ref: PhotoRef, purpose: "hero" | "gallery", sort: number): BundleMedia {
  const lib = ref.source === "library" ? PHOTO_LIBRARY[ref.id] : null;
  return {
    id: `draft-${purpose}-${sort}`,
    kind: "image",
    purpose,
    storage_path: photoPath(ref),
    alt_text: lib ? lib.alt : "",
    width: ref.source === "local" ? ref.width : lib?.orientation === "portrait" ? 1600 : 2400,
    height: ref.source === "local" ? ref.height : lib?.orientation === "portrait" ? 2400 : 1600,
    sort_order: sort,
  };
}

function eventInstant(date: string | null, time: string, timezone: string): string | null {
  if (!date) return null;
  try {
    return zonedTimeToIso(date, time || "00:00", timezone);
  } catch {
    return null;
  }
}

/** Answers over the demo wedding, for the live preview. */
export function previewBundle(a: TryAnswers, template: TemplateManifest, now: Date = new Date()): WeddingBundle {
  const demo = sampleBundle(template.id, now);
  const date = a.date ?? demo.wedding.wedding_date;
  const timezone = a.date ? a.timezone : demo.settings.timezone;

  const events = demo.events.map((e): BundleEvent => {
    if (e.kind !== "ceremony" && e.kind !== "reception") return e;
    const ans = a[e.kind];
    const touched = ans.venue.trim() || ans.address.trim() || ans.time;
    if (!touched && !a.date) return e;
    // Date given but no time yet: use a typical ceremony / reception hour.
    const fallbackTime = e.kind === "ceremony" ? "15:00" : "18:00";
    return {
      ...e,
      starts_at: eventInstant(date, ans.time || fallbackTime, timezone),
      venue_name: ans.venue.trim() || e.venue_name,
      address: touched ? ans.address.trim() || null : e.address,
      description: touched ? null : e.description,
    };
  });

  const demoHero = demo.media.find((m) => m.purpose === "hero");
  const demoGallery = demo.media.filter((m) => m.purpose === "gallery");
  const media: BundleMedia[] = [
    ...(a.photos.hero ? [toMedia(a.photos.hero, "hero", 0)] : demoHero ? [demoHero] : []),
    ...(a.photos.gallery.length ? a.photos.gallery.map((ref, i) => toMedia(ref, "gallery", i + 1)) : demoGallery),
  ];

  return {
    ...demo,
    wedding: {
      ...demo.wedding,
      partner_one_name: a.partnerOne.trim() || demo.wedding.partner_one_name,
      partner_two_name: a.partnerTwo.trim() || demo.wedding.partner_two_name,
      wedding_date: date,
      template_id: template.id,
      status: "draft",
    },
    settings: { ...demo.settings, locale: a.locale, timezone },
    theme: { tokens: themeOverrides(a, template) as Record<string, unknown> },
    events,
    media,
  };
}

/** What gets saved when the visitor creates an account (validated again on the server). */
export interface DraftToCreate {
  templateId: string;
  partnerOne: string;
  partnerTwo: string;
  weddingDate: string | null;
  locale: Locale;
  timezone: string;
  theme: ThemeOverrides;
  events: {
    kind: "ceremony" | "reception";
    venueName: string | null;
    address: string | null;
    startsAt: string | null;
  }[];
  /** Library photos are saved directly; local files are uploaded after the wedding exists. */
  libraryPhotos: { purpose: "hero" | "gallery"; id: LibraryPhotoId; sort: number }[];
}

export function draftToCreate(a: TryAnswers, template: TemplateManifest): DraftToCreate {
  const events: DraftToCreate["events"] = [];
  for (const kind of ["ceremony", "reception"] as const) {
    const e = a[kind];
    if (!e.venue.trim() && !e.address.trim() && !e.time) continue;
    events.push({
      kind,
      venueName: e.venue.trim() || null,
      address: e.address.trim() || null,
      startsAt: e.time ? eventInstant(a.date, e.time, a.timezone) : null,
    });
  }
  const libraryPhotos: DraftToCreate["libraryPhotos"] = [];
  if (a.photos.hero?.source === "library") libraryPhotos.push({ purpose: "hero", id: a.photos.hero.id, sort: 0 });
  a.photos.gallery.forEach((ref, i) => {
    if (ref.source === "library") libraryPhotos.push({ purpose: "gallery", id: ref.id, sort: i });
  });

  return {
    templateId: template.id,
    partnerOne: a.partnerOne.trim(),
    partnerTwo: a.partnerTwo.trim(),
    weddingDate: a.date,
    locale: a.locale,
    timezone: a.timezone,
    theme: themeOverrides(a, template),
    events,
    libraryPhotos,
  };
}

/** Local (not yet uploaded) photos, in the order they must be uploaded after signup. */
export function localPhotos(a: TryAnswers): { purpose: "hero" | "gallery"; ref: Extract<PhotoRef, { source: "local" }>; sort: number }[] {
  const out: ReturnType<typeof localPhotos> = [];
  if (a.photos.hero?.source === "local") out.push({ purpose: "hero", ref: a.photos.hero, sort: 0 });
  a.photos.gallery.forEach((ref, i) => {
    if (ref.source === "local") out.push({ purpose: "gallery", ref, sort: i });
  });
  return out;
}

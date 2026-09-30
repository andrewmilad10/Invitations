import { z } from "zod";
import { dictionaries } from "../i18n/dictionaries";
import type { Locale } from "../i18n/locales";

/**
 * Section library — template-agnostic definitions.
 *
 * A definition says WHAT a section holds (Zod schema), what it starts with
 * (localized defaults) and how the editor edits it (field descriptors).
 * HOW it looks is up to each template.
 */

export const SECTION_TYPES = [
  "hero",
  "couple",
  "date",
  "countdown",
  "story",
  "ceremony",
  "reception",
  "venue",
  "gallery",
  "schedule",
  "rsvp",
  "closing",
  "footer",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export function isSectionType(value: unknown): value is SectionType {
  return typeof value === "string" && (SECTION_TYPES as readonly string[]).includes(value);
}

// ── Field descriptors (drive the auto-generated editor forms) ────────────────
export type FieldDescriptor =
  | { name: string; label: string; kind: "text"; maxLength: number; placeholder?: string }
  | { name: string; label: string; kind: "textarea"; maxLength: number; placeholder?: string; rows?: number }
  | {
      name: string;
      label: string;
      kind: "list";
      maxItems: number;
      itemLabel: string;
      itemFields: { name: string; label: string; maxLength: number; placeholder?: string }[];
    };

const text = (max: number) => z.string().max(max);

// ── Content schemas ─────────────────────────────────────────────────────────
const scheduleItem = z.object({ time: text(40), title: text(120), note: text(300) });

export const sectionSchemas = {
  hero: z.object({ eyebrow: text(80), tagline: text(160) }),
  couple: z.object({ eyebrow: text(80), heading: text(120), message: text(600) }),
  date: z.object({ heading: text(80), note: text(200) }),
  countdown: z.object({ heading: text(80) }),
  story: z.object({ heading: text(80), body: text(4000) }),
  ceremony: z.object({ heading: text(80), note: text(400) }),
  reception: z.object({ heading: text(80), note: text(400) }),
  venue: z.object({ heading: text(80), note: text(600) }),
  gallery: z.object({ heading: text(80), caption: text(200) }),
  schedule: z.object({ heading: text(80), items: z.array(scheduleItem).max(20) }),
  rsvp: z.object({ heading: text(80), message: text(400), deadline: text(80) }),
  closing: z.object({ heading: text(120), message: text(600), signature: text(120) }),
  footer: z.object({ note: text(200) }),
} satisfies Record<SectionType, z.ZodObject>;

export type SectionContent<T extends SectionType> = z.infer<(typeof sectionSchemas)[T]>;
export type AnySectionContent = { [T in SectionType]: SectionContent<T> }[SectionType];

// ── Definitions ─────────────────────────────────────────────────────────────
export interface SectionDefinition<T extends SectionType = SectionType> {
  type: T;
  /** Dashboard label (English; dashboard i18n is future work). */
  label: string;
  description: string;
  /** Can the couple switch it off? */
  canDisable: boolean;
  fields: FieldDescriptor[];
  /** Extra data the section's editor panel manages besides `content`. */
  manages?: { event?: "ceremony" | "reception"; media?: "hero" | "gallery" };
  defaults: (locale: Locale) => SectionContent<T>;
}

const d = (locale: Locale) => dictionaries[locale].defaults;

const heading = (max = 80): FieldDescriptor => ({ name: "heading", label: "Heading", kind: "text", maxLength: max });

export const SECTION_DEFINITIONS: { [T in SectionType]: SectionDefinition<T> } = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "The first thing guests see: your names, the date and a photo.",
    canDisable: false,
    manages: { media: "hero" },
    fields: [
      { name: "eyebrow", label: "Small line above your names", kind: "text", maxLength: 80 },
      { name: "tagline", label: "Line below the date", kind: "text", maxLength: 160, placeholder: "Optional" },
    ],
    defaults: (l) => ({ ...d(l).hero }),
  },
  couple: {
    type: "couple",
    label: "Invitation",
    description: "The invitation wording.",
    canDisable: true,
    fields: [
      { name: "eyebrow", label: "Opening line", kind: "text", maxLength: 80 },
      heading(120),
      { name: "message", label: "Message", kind: "textarea", maxLength: 600, rows: 4 },
    ],
    defaults: (l) => ({ ...d(l).couple }),
  },
  date: {
    type: "date",
    label: "Date",
    description: "The wedding date, beautifully set.",
    canDisable: true,
    fields: [heading(), { name: "note", label: "Note", kind: "text", maxLength: 200, placeholder: "Optional" }],
    defaults: (l) => ({ ...d(l).date }),
  },
  countdown: {
    type: "countdown",
    label: "Countdown",
    description: "Days, hours and minutes until the ceremony.",
    canDisable: true,
    fields: [heading()],
    defaults: (l) => ({ ...d(l).countdown }),
  },
  story: {
    type: "story",
    label: "Our story",
    description: "How you met. Separate paragraphs with a blank line.",
    canDisable: true,
    fields: [heading(), { name: "body", label: "Story", kind: "textarea", maxLength: 4000, rows: 8 }],
    defaults: (l) => ({ ...d(l).story }),
  },
  ceremony: {
    type: "ceremony",
    label: "Ceremony",
    description: "Where and when you say “I do”.",
    canDisable: true,
    manages: { event: "ceremony" },
    fields: [heading(), { name: "note", label: "Note for guests", kind: "textarea", maxLength: 400, rows: 3 }],
    defaults: (l) => ({ ...d(l).ceremony }),
  },
  reception: {
    type: "reception",
    label: "Reception",
    description: "Where the celebration continues.",
    canDisable: true,
    manages: { event: "reception" },
    fields: [heading(), { name: "note", label: "Note for guests", kind: "textarea", maxLength: 400, rows: 3 }],
    defaults: (l) => ({ ...d(l).reception }),
  },
  venue: {
    type: "venue",
    label: "Directions",
    description: "Maps and directions for every venue with an address.",
    canDisable: true,
    fields: [heading(), { name: "note", label: "Travel & parking notes", kind: "textarea", maxLength: 600, rows: 4 }],
    defaults: (l) => ({ ...d(l).venue }),
  },
  gallery: {
    type: "gallery",
    label: "Gallery",
    description: "Your favourite photos.",
    canDisable: true,
    manages: { media: "gallery" },
    fields: [heading(), { name: "caption", label: "Caption", kind: "text", maxLength: 200, placeholder: "Optional" }],
    defaults: (l) => ({ ...d(l).gallery }),
  },
  schedule: {
    type: "schedule",
    label: "Schedule",
    description: "The order of the day. Leave empty to list your events automatically.",
    canDisable: true,
    fields: [
      heading(),
      {
        name: "items",
        label: "Timeline",
        kind: "list",
        maxItems: 20,
        itemLabel: "moment",
        itemFields: [
          { name: "time", label: "Time", maxLength: 40, placeholder: "5:00 PM" },
          { name: "title", label: "Title", maxLength: 120, placeholder: "Ceremony" },
          { name: "note", label: "Note", maxLength: 300, placeholder: "Optional" },
        ],
      },
    ],
    defaults: (l) => ({ heading: d(l).schedule.heading, items: [] }),
  },
  rsvp: {
    type: "rsvp",
    label: "RSVP",
    description: "A reply section. Online RSVP forms arrive in a later release.",
    canDisable: true,
    fields: [
      heading(),
      { name: "message", label: "Message", kind: "textarea", maxLength: 400, rows: 3 },
      { name: "deadline", label: "Reply by", kind: "text", maxLength: 80, placeholder: "e.g. 1 May 2027" },
    ],
    defaults: (l) => ({ ...d(l).rsvp }),
  },
  closing: {
    type: "closing",
    label: "Closing",
    description: "A final word to your guests.",
    canDisable: true,
    fields: [
      heading(120),
      { name: "message", label: "Message", kind: "textarea", maxLength: 600, rows: 3 },
      { name: "signature", label: "Signature", kind: "text", maxLength: 120, placeholder: "e.g. With love, the families" },
    ],
    defaults: (l) => ({ ...d(l).closing }),
  },
  footer: {
    type: "footer",
    label: "Footer",
    description: "Your names and date at the very end.",
    canDisable: false,
    fields: [{ name: "note", label: "Note", kind: "text", maxLength: 200, placeholder: "Optional, e.g. a hashtag" }],
    defaults: (l) => ({ ...d(l).footer }),
  },
};

export function getSectionDefinition<T extends SectionType>(type: T): SectionDefinition<T> {
  return SECTION_DEFINITIONS[type];
}

/**
 * Stored content merged over localized defaults, validated key by key: a
 * field that fails validation (e.g. after a schema change) falls back to its
 * default instead of breaking the whole section.
 */
export function resolveSectionContent<T extends SectionType>(
  type: T,
  stored: Record<string, unknown> | undefined,
  locale: Locale,
): SectionContent<T> {
  const defaults = SECTION_DEFINITIONS[type].defaults(locale) as Record<string, unknown>;
  const shape = sectionSchemas[type].shape as Record<string, z.ZodType>;
  const result: Record<string, unknown> = { ...defaults };
  if (stored) {
    for (const [key, schema] of Object.entries(shape)) {
      if (!(key in stored)) continue;
      const parsed = schema.safeParse(stored[key]);
      if (parsed.success) result[key] = parsed.data;
    }
  }
  return result as SectionContent<T>;
}

/** Strict validation for writes (server actions). */
export function validateSectionContent(type: SectionType, content: unknown) {
  return sectionSchemas[type].partial().safeParse(content);
}

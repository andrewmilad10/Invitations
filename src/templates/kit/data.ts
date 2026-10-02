import type { EventModel, InvitationModel, MediaAsset } from "@/core/invitation/model";
import type { SectionContent } from "@/core/sections/registry";

/**
 * Data helpers shared by the kit templates: the same facts every template
 * needs (schedule, mapped venues, photos, labels), shaped once so each
 * template only decides how they look.
 */

export const KIT_SECTIONS = [
  "hero", "couple", "date", "countdown", "story", "ceremony", "reception", "venue",
  "schedule", "gallery", "rsvp", "faq", "closing", "footer",
] as const;

export interface ScheduleItem {
  time: string;
  title: string;
  note: string;
}

/** The day's programme: the couple's own items, or one line per timed event. */
export function scheduleItems(model: InvitationModel, content: SectionContent<"schedule">): ScheduleItem[] {
  if (content.items.length > 0) return content.items;
  return model.events.all
    .filter((e) => e.timeLabel)
    .map((e) => ({ time: e.timeLabel!, title: e.title || (e.venueName ?? ""), note: e.venueName ?? "" }));
}

/** Events with a map to show. */
export const mappedEvents = (model: InvitationModel): EventModel[] => model.events.all.filter((e) => e.mapEmbedUrl);

/** FAQ entries that have a question. */
export const faqItems = (content: SectionContent<"faq">) => content.items.filter((i) => i.question.trim());

/** Up to `n` gallery photos. */
export const photos = (model: InvitationModel, n = 9): MediaAsset[] => model.media.gallery.slice(0, n);

/** The hero photo, or the first gallery photo as a stand-in. */
export const heroPhoto = (model: InvitationModel): MediaAsset | null => model.media.hero ?? model.media.gallery[0] ?? null;

/** An event's date line: its own date when it differs, else the wedding's. */
export const eventDate = (model: InvitationModel, e: EventModel) => e.dateLabel ?? model.wedding.date?.long ?? null;

const COPY = {
  en: {
    ourStory: "Our story", details: "The details", ceremony: "Ceremony", reception: "Reception", schedule: "The day",
    gallery: "Moments", rsvp: "Kindly reply", faq: "Good to know", countdown: "Until we say yes", venue: "Where",
    date: "Date", time: "Time", place: "Place", address: "Address", with: "With love", reply: "Reply", by: "by",
    chapter: "Chapter", plate: "Plate", no: "No.", question: "Q.", answer: "A.", days: "days", and: "and",
    invite: "invite you to celebrate their wedding", together: "Together with their families",
  },
  ar: {
    ourStory: "حكايتنا", details: "التفاصيل", ceremony: "عقد القران", reception: "الحفل", schedule: "برنامج اليوم",
    gallery: "لحظات", rsvp: "تأكيد الحضور", faq: "معلومات تهمّكم", countdown: "حتى اليوم الموعود", venue: "المكان",
    date: "التاريخ", time: "الوقت", place: "المكان", address: "العنوان", with: "مع الحب", reply: "الرد", by: "قبل",
    chapter: "الفصل", plate: "صورة", no: "رقم", question: "س.", answer: "ج.", days: "يومًا", and: "و",
    invite: "يتشرفان بدعوتكم لحضور حفل زفافهما", together: "مع عائلتيهما",
  },
} as const;

export type KitCopy = { [K in keyof (typeof COPY)["en"]]: string };

/** Small fixed words (labels, kickers) in the guest's language. */
export const kitCopy = (model: InvitationModel): KitCopy => (model.locale === "ar" ? COPY.ar : COPY.en);

/** Roman numerals for numbered chapters and programmes. */
export function roman(n: number): string {
  const map: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

/** Two-digit number ("01"). */
export const pad2 = (n: number) => String(n).padStart(2, "0");

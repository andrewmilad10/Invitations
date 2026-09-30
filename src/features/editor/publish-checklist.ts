import type { WeddingBundle } from "@/core/wedding/bundle";

export interface CheckItem {
  label: string;
  done: boolean;
  required?: boolean;
}

/** What's worth checking before guests see it. Only names are required. */
export function publishChecklist(b: WeddingBundle): CheckItem[] {
  return [
    { label: "Both of your names", done: Boolean(b.wedding.partner_one_name.trim() && b.wedding.partner_two_name.trim()), required: true },
    { label: "Your wedding date", done: Boolean(b.wedding.wedding_date) },
    { label: "Ceremony or reception details", done: b.events.some((e) => e.venue_name || e.starts_at) },
    { label: "A main photo", done: b.media.some((m) => m.purpose === "hero") },
  ];
}

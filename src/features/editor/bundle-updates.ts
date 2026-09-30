import { zonedTimeToIso } from "@/core/i18n/format";
import type { SectionType } from "@/core/sections/registry";
import type { ThemeOverrides } from "@/core/theme/tokens";
import type { BundleEvent, BundleMedia, BundleSettings, WeddingBundle } from "@/core/wedding/bundle";

/**
 * Pure, immutable updates of the editor's working WeddingBundle. The editor
 * applies these immediately (the preview re-renders from the result) and
 * saves the same change through a server action in the background.
 */

export function setDetails(b: WeddingBundle, d: { partnerOne: string; partnerTwo: string; weddingDate: string | null }): WeddingBundle {
  return {
    ...b,
    wedding: { ...b.wedding, partner_one_name: d.partnerOne, partner_two_name: d.partnerTwo, wedding_date: d.weddingDate },
  };
}

export function setTemplate(b: WeddingBundle, templateId: string): WeddingBundle {
  return { ...b, wedding: { ...b.wedding, template_id: templateId } };
}

export function setSlug(b: WeddingBundle, slug: string): WeddingBundle {
  return { ...b, wedding: { ...b.wedding, slug } };
}

export function setStatus(b: WeddingBundle, status: WeddingBundle["wedding"]["status"]): WeddingBundle {
  return { ...b, wedding: { ...b.wedding, status } };
}

export function setSettings(b: WeddingBundle, s: Partial<BundleSettings>): WeddingBundle {
  return { ...b, settings: { ...b.settings, ...s } };
}

export function setTheme(b: WeddingBundle, overrides: ThemeOverrides): WeddingBundle {
  return { ...b, theme: { tokens: overrides as Record<string, unknown> } };
}

export function setSection(
  b: WeddingBundle,
  type: SectionType,
  patch: { enabled?: boolean; content?: Record<string, unknown>; style?: Record<string, unknown> },
): WeddingBundle {
  const exists = b.sections.some((s) => s.type === type);
  const sections = exists
    ? b.sections.map((s) => (s.type === type ? { ...s, ...patch } : s))
    : [...b.sections, { type, enabled: patch.enabled ?? true, sort_order: null, content: patch.content ?? {} }];
  return { ...b, sections };
}

/** Applies a full custom order (null resets to the template's order). */
export function setSectionOrder(b: WeddingBundle, order: SectionType[] | null): WeddingBundle {
  if (order === null) return { ...b, sections: b.sections.map((s) => ({ ...s, sort_order: null })) };
  const position = new Map(order.map((t, i) => [t, (i + 1) * 10]));
  const sections = b.sections.map((s) => (position.has(s.type as SectionType) ? { ...s, sort_order: position.get(s.type as SectionType)! } : s));
  for (const type of order) {
    if (!sections.some((s) => s.type === type)) {
      sections.push({ type, enabled: true, sort_order: position.get(type)!, content: {} });
    }
  }
  return { ...b, sections };
}

export interface EventFields {
  title: string;
  date: string | null;
  time: string | null;
  venueName: string;
  address: string;
  mapUrl: string;
  description: string;
}

/** Upserts the first event of a kind; clearing everything removes it. */
export function setEvent(b: WeddingBundle, kind: "ceremony" | "reception", f: EventFields, tempId = `draft-${kind}`): WeddingBundle {
  const isEmpty = !f.date && !f.venueName.trim() && !f.address.trim() && !f.mapUrl.trim() && !f.description.trim();
  const index = b.events.findIndex((e) => e.kind === kind);
  if (isEmpty) return index === -1 ? b : { ...b, events: b.events.filter((_, i) => i !== index) };

  const values: Omit<BundleEvent, "id" | "kind" | "sort_order"> = {
    title: f.title,
    starts_at: f.date ? safeZoned(f.date, f.time ?? "00:00", b.settings.timezone) : null,
    ends_at: null,
    venue_name: f.venueName.trim() || null,
    address: f.address.trim() || null,
    latitude: null,
    longitude: null,
    map_url: /^https:\/\//i.test(f.mapUrl.trim()) ? f.mapUrl.trim() : null,
    description: f.description.trim() || null,
  };
  if (index === -1) {
    return { ...b, events: [...b.events, { id: tempId, kind, sort_order: kind === "ceremony" ? 0 : 1, ...values }] };
  }
  return { ...b, events: b.events.map((e, i) => (i === index ? { ...e, ...values } : e)) };
}

function safeZoned(date: string, time: string, tz: string): string | null {
  try {
    return zonedTimeToIso(date, time, tz);
  } catch {
    return null;
  }
}

export function addMedia(b: WeddingBundle, m: BundleMedia): WeddingBundle {
  const singleSlot = m.purpose === "hero" || m.purpose === "music";
  const media = singleSlot ? b.media.filter((x) => x.purpose !== m.purpose) : b.media;
  return { ...b, media: [...media, m] };
}

export function removeMedia(b: WeddingBundle, mediaId: string): WeddingBundle {
  return { ...b, media: b.media.filter((m) => m.id !== mediaId) };
}

export function reorderMedia(b: WeddingBundle, ids: string[]): WeddingBundle {
  const order = new Map(ids.map((id, i) => [id, i]));
  return { ...b, media: b.media.map((m) => (order.has(m.id) ? { ...m, sort_order: order.get(m.id)! } : m)) };
}

export function setMediaAlt(b: WeddingBundle, mediaId: string, alt: string): WeddingBundle {
  return { ...b, media: b.media.map((m) => (m.id === mediaId ? { ...m, alt_text: alt } : m)) };
}

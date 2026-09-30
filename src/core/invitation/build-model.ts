import { dictionaries } from "../i18n/dictionaries";
import { dateInZone, formatDateOnly, formatTime, zonedTimeToIso } from "../i18n/format";
import { LOCALE_META, toLocale, type Locale } from "../i18n/locales";
import { resolveSectionStyle, sectionToneVars } from "../sections/style";
import { isSectionType, resolveSectionContent, SECTION_DEFINITIONS, type SectionType } from "../sections/registry";
import type { TemplateManifest } from "../template/manifest";
import { resolveTheme, sanitizeOverrides, themeToCssVars, type ThemeTokens } from "../theme/tokens";
import type { BundleEvent, BundleMedia, WeddingBundle } from "../wedding/bundle";
import type { EventModel, InvitationModel, MediaAsset, RenderedSection, RenderMode } from "./model";

export interface BuildOptions {
  mode: RenderMode;
  /** Maps a storage path to a public URL. Injected so core stays backend-agnostic. */
  mediaUrl: (storagePath: string) => string;
}

/**
 * WeddingBundle + TemplateManifest → InvitationModel.
 *
 * Pure and deterministic: the same inputs always produce the same model, on
 * the server (public page), in the browser (live preview) or in a worker
 * (future exports).
 */
export function buildInvitationModel(
  bundle: WeddingBundle,
  template: TemplateManifest,
  options: BuildOptions,
): InvitationModel {
  const locale = toLocale(bundle.settings.locale);
  const timezone = bundle.settings.timezone;
  const { wedding } = bundle;

  const theme = resolveTheme(template.themeDefaults, sanitizeOverrides(bundle.theme.tokens));

  const media = buildMedia(bundle.media, options.mediaUrl);
  const events = bundle.events
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || compareInstants(a.starts_at, b.starts_at))
    .map((e) => buildEvent(e, locale, timezone, wedding.wedding_date));

  const ceremony = events.find((e) => e.kind === "ceremony") ?? null;
  const reception = events.find((e) => e.kind === "reception") ?? null;

  const countdownTarget =
    ceremony?.startsAt ??
    events.find((e) => e.startsAt)?.startsAt ??
    (wedding.wedding_date ? zonedTimeToIso(wedding.wedding_date, "00:00", timezone) : null);

  const partnerOne = wedding.partner_one_name.trim();
  const partnerTwo = wedding.partner_two_name.trim();

  const facts: SectionFacts = {
    hasDate: Boolean(wedding.wedding_date),
    hasCountdown: Boolean(countdownTarget),
    hasCeremony: Boolean(ceremony),
    hasReception: Boolean(reception),
    hasVenue: events.some((e) => e.mapEmbedUrl),
    hasGallery: media.gallery.length > 0,
    hasTimedEvents: events.some((e) => e.timeLabel),
  };

  return {
    mode: options.mode,
    templateId: template.id,
    template: { renderer: template.renderer, opening: template.features.opening, decor: template.stationery.ornament },
    locale,
    dir: LOCALE_META[locale].dir,
    wedding: {
      id: wedding.id,
      slug: wedding.slug,
      partnerOne,
      partnerTwo,
      coupleName: `${partnerOne} & ${partnerTwo}`,
      initials: [initial(partnerOne), initial(partnerTwo)],
      weddingDate: wedding.wedding_date,
      date: wedding.wedding_date ? formatDateOnly(wedding.wedding_date, locale) : null,
      timezone,
    },
    theme,
    cssVars: themeToCssVars(theme, locale),
    sections: resolveSections(bundle, template, locale, facts, theme),
    events: { all: events, ceremony, reception },
    media,
    music: {
      enabled: template.features.music && bundle.settings.music_enabled && Boolean(media.music),
      src: bundle.settings.music_enabled ? (media.music?.url ?? null) : null,
    },
    countdownTarget,
    strings: dictionaries[locale].ui,
  };
}

// ── Sections ────────────────────────────────────────────────────────────────

interface SectionFacts {
  hasDate: boolean;
  hasCountdown: boolean;
  hasCeremony: boolean;
  hasReception: boolean;
  hasVenue: boolean;
  hasGallery: boolean;
  hasTimedEvents: boolean;
}

/**
 * Order + visibility:
 *  1. Only types the template supports are considered.
 *  2. A stored row decides enabled/order; otherwise the template default does
 *     (sparse overrides — see docs/database.md).
 *  3. Sections with nothing to show (e.g. a gallery with no photos) are skipped.
 */
function resolveSections(
  bundle: WeddingBundle,
  template: TemplateManifest,
  locale: Locale,
  facts: SectionFacts,
  theme: ThemeTokens,
): RenderedSection[] {
  const rows = new Map(bundle.sections.filter((s) => isSectionType(s.type)).map((s) => [s.type as SectionType, s]));
  const supported = new Set(template.supportedSections);
  const disabledByDefault = new Set(template.defaultDisabled ?? []);

  const candidates: SectionType[] = [
    ...template.defaultSectionOrder,
    ...template.supportedSections.filter((t) => !template.defaultSectionOrder.includes(t)),
  ];

  const resolved = candidates
    .filter((type) => supported.has(type))
    .map((type) => {
      const row = rows.get(type);
      return {
        type,
        enabled: row ? row.enabled : !disabledByDefault.has(type),
        order: row?.sort_order ?? null,
        content: resolveSectionContent(type, row?.content, locale),
        style: resolveSectionStyle(row?.style),
      };
    });

  return orderSections(resolved)
    // Sections that can't be disabled (hero, footer) always render.
    .filter((s) => s.enabled || !SECTION_DEFINITIONS[s.type].canDisable)
    .map(({ type, content, style }) => ({ type, content, style, toneVars: sectionToneVars(theme, style.tone) }) as RenderedSection)
    .filter((section) => hasSomethingToShow(section, facts));
}

/**
 * Sections with an explicit order (the couple reordered) come in that order.
 * A section without one (e.g. a section type released later) is placed right
 * after its predecessor in the template's default order, so it never lands
 * in a random spot. Input must be in template default order.
 */
function orderSections<T extends { type: SectionType; order: number | null }>(inDefaultOrder: T[]): T[] {
  const explicit = inDefaultOrder
    .map((s, index) => ({ s, index }))
    .filter(({ s }) => s.order !== null)
    .sort((a, b) => a.s.order! - b.s.order! || a.index - b.index)
    .map(({ s }) => s);
  if (explicit.length === 0) return inDefaultOrder;

  const result = [...explicit];
  inDefaultOrder.forEach((section, index) => {
    if (section.order !== null) return;
    let insertAt = 0;
    for (let i = index - 1; i >= 0; i--) {
      const at = result.indexOf(inDefaultOrder[i]);
      if (at !== -1) {
        insertAt = at + 1;
        break;
      }
    }
    result.splice(insertAt, 0, section);
  });
  return result;
}

function hasSomethingToShow(section: RenderedSection, facts: SectionFacts): boolean {
  switch (section.type) {
    case "date":
      return facts.hasDate;
    case "countdown":
      return facts.hasCountdown;
    case "ceremony":
      return facts.hasCeremony;
    case "reception":
      return facts.hasReception;
    case "venue":
      return facts.hasVenue;
    case "gallery":
      return facts.hasGallery;
    case "story":
      return section.content.body.trim().length > 0;
    case "schedule":
      return section.content.items.length > 0 || facts.hasTimedEvents;
    default:
      return true;
  }
}

/**
 * Every section type the template supports, in display order (ignoring
 * enabled/empty). Used by the editor's section list so it always matches the
 * rendered invitation.
 */
export function sectionDisplayOrder(
  sections: { type: string; sort_order: number | null }[],
  template: Pick<TemplateManifest, "defaultSectionOrder" | "supportedSections">,
): SectionType[] {
  const rows = new Map(sections.map((s) => [s.type, s.sort_order]));
  const all = [
    ...template.defaultSectionOrder,
    ...template.supportedSections.filter((t) => !template.defaultSectionOrder.includes(t)),
  ];
  return orderSections(all.map((type) => ({ type, order: rows.get(type) ?? null }))).map((s) => s.type);
}

// ── Events ──────────────────────────────────────────────────────────────────

function buildEvent(e: BundleEvent, locale: Locale, timezone: string, weddingDate: string | null): EventModel {
  const onWeddingDay = e.starts_at && weddingDate ? dateInZone(e.starts_at, timezone) === weddingDate : false;
  return {
    id: e.id,
    kind: e.kind,
    title: e.title,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    timeLabel: e.starts_at ? formatTime(e.starts_at, locale, timezone) : null,
    dateLabel: e.starts_at && !onWeddingDay ? formatDateOnly(dateInZone(e.starts_at, timezone), locale).long : null,
    venueName: e.venue_name,
    address: e.address,
    mapUrl: e.map_url ?? directionsUrl(e),
    mapEmbedUrl: embedUrl(e),
    description: e.description,
  };
}

function mapQuery(e: BundleEvent): string | null {
  if (e.latitude != null && e.longitude != null) return `${e.latitude},${e.longitude}`;
  const parts = [e.venue_name, e.address].filter(Boolean);
  return e.address ? parts.join(", ") : null;
}

function directionsUrl(e: BundleEvent): string | null {
  const q = mapQuery(e);
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

function embedUrl(e: BundleEvent): string | null {
  const q = mapQuery(e);
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed` : null;
}

function compareInstants(a: string | null, b: string | null) {
  if (a === b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a < b ? -1 : 1;
}

// ── Media ───────────────────────────────────────────────────────────────────

function buildMedia(rows: BundleMedia[], mediaUrl: BuildOptions["mediaUrl"]): InvitationModel["media"] {
  // Media without a resolvable URL (e.g. a draft photo no longer in the browser) is skipped.
  const sorted = rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((m) => mediaUrl(m.storage_path) !== "");
  const toAsset = (m: BundleMedia): MediaAsset => ({
    id: m.id,
    url: mediaUrl(m.storage_path),
    alt: m.alt_text,
    width: m.width,
    height: m.height,
  });
  const hero = sorted.find((m) => m.purpose === "hero" && m.kind === "image");
  const music = sorted.find((m) => m.purpose === "music" && m.kind === "audio");
  return {
    hero: hero ? toAsset(hero) : null,
    gallery: sorted.filter((m) => m.purpose === "gallery" && m.kind === "image").map(toAsset),
    music: music ? toAsset(music) : null,
  };
}

function initial(name: string): string {
  return Array.from(name.trim())[0]?.toLocaleUpperCase() ?? "";
}

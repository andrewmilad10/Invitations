import type { SectionContent, SectionType } from "../sections/registry";
import type { SectionStyle } from "../sections/style";
import type { DateParts } from "../i18n/format";
import type { InvitationDictionary } from "../i18n/dictionaries";
import type { Locale } from "../i18n/locales";
import type { CardOptions } from "../card/options";
import type { DecorFamily, StationeryArt } from "../template/manifest";
import type { ThemeTokens } from "../theme/tokens";

/**
 * InvitationModel — the RENDER contract.
 *
 * Everything a template needs, already resolved: no template ever touches the
 * database, parses dates, merges themes or decides which sections are on.
 */

export type RenderMode = "live" | "preview" | "sample" | "export";

export interface MediaAsset {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface EventModel {
  id: string;
  kind: "ceremony" | "reception" | "other";
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  /** Local wall-clock time in the wedding's time zone, e.g. "5:00 PM". */
  timeLabel: string | null;
  /** Long date if the event is not on the wedding day (or there is no wedding date). */
  dateLabel: string | null;
  venueName: string | null;
  address: string | null;
  mapUrl: string | null;
  /** Embeddable map URL, derived from coordinates or address. */
  mapEmbedUrl: string | null;
  description: string | null;
}

export type RenderedSection = {
  [T in SectionType]: { type: T; content: SectionContent<T>; style: SectionStyle; toneVars: Record<string, string> };
}[SectionType];

export interface InvitationModel {
  mode: RenderMode;
  templateId: string;
  /** Layout key and presentation options from the template manifest. */
  template: {
    renderer: string;
    opening: "envelope" | "none";
    /** Divider motif family (data-decor on the root). */
    decor: DecorFamily;
    /** The design's card (for the "card" hero). */
    art: Required<StationeryArt>;
    /** The card's finishing options: the design's defaults and the couple's choices. */
    card: CardOptions;
    hero: "photo" | "card";
  };
  locale: Locale;
  dir: "ltr" | "rtl";
  wedding: {
    id: string;
    slug: string;
    partnerOne: string;
    partnerTwo: string;
    /** "Andrew & Mariam" — derived, never stored. */
    coupleName: string;
    /** First letters, e.g. ["A", "M"], for monograms and seals. */
    initials: [string, string];
    weddingDate: string | null;
    date: DateParts | null;
    timezone: string;
  };
  theme: ThemeTokens;
  cssVars: Record<string, string>;
  /** Enabled sections, in display order, with validated content. */
  sections: RenderedSection[];
  events: {
    all: EventModel[];
    ceremony: EventModel | null;
    reception: EventModel | null;
  };
  media: {
    hero: MediaAsset | null;
    gallery: MediaAsset[];
    music: MediaAsset | null;
  };
  music: { enabled: boolean; src: string | null };
  /** ISO instant the countdown targets, or null. */
  countdownTarget: string | null;
  strings: InvitationDictionary["ui"];
}

export function getSection<T extends SectionType>(model: InvitationModel, type: T) {
  return model.sections.find((s) => s.type === type) as { type: T; content: SectionContent<T> } | undefined;
}

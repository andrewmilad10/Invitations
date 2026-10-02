import type { CSSProperties } from "react";
import type { CardOptionOverrides } from "@/core/card/options";
import { usesPhoto, type TemplateManifest } from "@/core/template/manifest";
import { resolveTheme, themeToCssVars, type ThemeOverrides } from "@/core/theme/tokens";
import { formatDateOnly } from "@/core/i18n/format";
import { PHOTO_LIBRARY } from "@/features/media/library";
import { StationeryCard, type StationeryPhoto } from "@/templates/shared/stationery/card";

/** Sample photos for photo designs in galleries (the couple's own replace them). */
const SAMPLE_PHOTOS: StationeryPhoto[] = [PHOTO_LIBRARY.couple, PHOTO_LIBRARY.outdoors, PHOTO_LIBRARY.rings, PHOTO_LIBRARY.bouquet].map((p) => ({ url: p.url, alt: p.alt }));

/** Sample dates shown on gallery cards (label → yyyy-mm-dd). Not real weddings. */
const SAMPLE_DATES: Record<string, string> = {
  "14 October": "2026-10-14",
  "20 June": "2026-06-20",
  "2 May": "2026-05-02",
  "8 September": "2026-09-08",
  "12 April": "2026-04-12",
  "30 August": "2026-08-30",
  "21 March": "2026-03-21",
  "Saturday, 17 October": "2026-10-17",
};

/** Layouts that show the venue on gallery samples (the older ones read best without). */
const DETAILED = new Set(["boarding-pass", "formal-script", "drive", "torn-photo", "date-row", "script-date", "script-bars", "split-arch", "arch-panel", "oval-photo", "photo-details", "photo-half"]);

/**
 * A template drawn as a printed invitation card, in the template's own theme
 * (or a palette of it). Used for gallery cards, the homepage and the try
 * flow — a thumbnail, not the invitation itself (that is always rendered by
 * the template's Renderer).
 */
export function Stationery({
  template,
  overrides,
  partnerOne,
  partnerTwo,
  dateLabel,
  place,
  eyebrow,
  line,
  isoDate,
  time,
  photos,
  sizes,
  options,
  side,
  className,
  style,
}: {
  template: Pick<TemplateManifest, "themeDefaults" | "stationery">;
  overrides?: ThemeOverrides;
  partnerOne: string;
  partnerTwo: string;
  dateLabel?: string | null;
  place?: string | null;
  /** Defaults to the design's sample line ("Together with their families"); "" hides it. */
  eyebrow?: string;
  /** A short invitation line; defaults to a sample for full-size cards. */
  line?: string | null;
  /** The date as yyyy-mm-dd, for layouts that set the day apart. */
  isoDate?: string | null;
  time?: string | null;
  /** Photos for photo designs; sample photos are used when omitted. */
  photos?: StationeryPhoto[];
  sizes?: string;
  /** Finishing options (orientation, silhouette, foil, paper) to preview. */
  options?: CardOptionOverrides;
  side?: "front" | "back";
  className?: string;
  style?: CSSProperties;
}) {
  const theme = resolveTheme(template.themeDefaults, overrides ?? {});
  const sample = template.stationery.sample;
  const thumbnail = eyebrow === "";
  const iso = isoDate ?? (dateLabel ? SAMPLE_DATES[dateLabel] : undefined) ?? null;
  const isSample = Boolean(dateLabel && SAMPLE_DATES[dateLabel]);
  const date = iso ? formatDateOnly(iso, "en") : null;
  const vars = themeToCssVars(theme) as CSSProperties;
  return (
    <StationeryCard
      art={template.stationery}
      text={{
        partnerOne,
        partnerTwo,
        dateLabel,
        place: place ?? (isSample && !thumbnail && DETAILED.has(template.stationery.layout ?? "classic") ? "The Orangery, Cairo" : place),
        eyebrow: eyebrow ?? sample?.eyebrow ?? "Together with their families",
        line: line ?? (thumbnail ? null : (sample?.line ?? "invite you to celebrate their wedding")),
        date: date && !thumbnail ? { weekday: date.weekday, day: date.day, month: date.month, year: date.year, short: date.short } : null,
        time: time ?? (isSample && !thumbnail ? "7:00 pm" : null),
      }}
      photos={usesPhoto(template.stationery) ? (photos?.length ? photos : SAMPLE_PHOTOS) : []}
      sizes={sizes}
      options={options}
      side={side}
      className={className}
      style={{ ...vars, ...style }}
    />
  );
}

import type { CSSProperties } from "react";
import { usesPhoto, type TemplateManifest } from "@/core/template/manifest";
import { resolveTheme, themeToCssVars, type ThemeOverrides } from "@/core/theme/tokens";
import { PHOTO_LIBRARY } from "@/features/media/library";
import { StationeryCard, type StationeryPhoto } from "@/templates/shared/stationery/card";

/** Sample photos for photo designs in galleries (the couple's own replace them). */
const SAMPLE_PHOTOS: StationeryPhoto[] = [PHOTO_LIBRARY.couple, PHOTO_LIBRARY.outdoors, PHOTO_LIBRARY.rings, PHOTO_LIBRARY.bouquet].map((p) => ({ url: p.url, alt: p.alt }));

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
  eyebrow = "Together with their families",
  photos,
  sizes,
  className,
  style,
}: {
  template: Pick<TemplateManifest, "themeDefaults" | "stationery">;
  overrides?: ThemeOverrides;
  partnerOne: string;
  partnerTwo: string;
  dateLabel?: string | null;
  place?: string | null;
  eyebrow?: string;
  /** Photos for photo designs; sample photos are used when omitted. */
  photos?: StationeryPhoto[];
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const theme = resolveTheme(template.themeDefaults, overrides ?? {});
  const vars = themeToCssVars(theme) as CSSProperties;
  return (
    <StationeryCard
      art={template.stationery}
      text={{ partnerOne, partnerTwo, dateLabel, place, eyebrow }}
      photos={usesPhoto(template.stationery) ? (photos?.length ? photos : SAMPLE_PHOTOS) : []}
      sizes={sizes}
      className={className}
      style={{ ...vars, ...style }}
    />
  );
}

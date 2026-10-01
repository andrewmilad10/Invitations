"use client";

import qrcode from "qrcode-generator";
import { useMemo, type CSSProperties } from "react";
import { safeQrUrl, type CardSuite } from "@/core/card/suite";
import { formatDateOnly } from "@/core/i18n/format";
import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme, themeToCssVars } from "@/core/theme/tokens";
import { PHOTO_LIBRARY } from "@/features/media/library";
import {
  StationeryCard,
  type StationeryText,
} from "@/templates/shared/stationery/card";
import { EnvelopeView } from "./envelope";

export const PIECES = [
  "front",
  "back",
  "enclosure-front",
  "enclosure-back",
  "envelope-front",
  "envelope-back",
] as const;
export type Piece = (typeof PIECES)[number];

const SAMPLE_PHOTO = {
  url: PHOTO_LIBRARY.couple.url,
  alt: PHOTO_LIBRARY.couple.alt,
};

/** QR modules for a link (null when the link isn't http/https). */
export function useQr(url: string, on: boolean): boolean[][] | null {
  return useMemo(() => {
    const safe = on ? safeQrUrl(url) : null;
    if (!safe) return null;
    const qr = qrcode(0, "M");
    qr.addData(safe);
    qr.make();
    const n = qr.getModuleCount();
    return Array.from({ length: n }, (_, y) =>
      Array.from({ length: n }, (_, x) => qr.isDark(y, x)),
    );
  }, [url, on]);
}

/** Theme variables for the suite: the chosen palette, then the paper colour. */
export function suiteVars(
  template: TemplateManifest,
  suite: CardSuite,
): CSSProperties {
  const palette = template.palettes.find((p) => p.id === suite.paletteId);
  const colors = {
    ...(palette?.colors ?? {}),
    ...(suite.background ? { surface: suite.background } : {}),
  };
  return themeToCssVars(
    resolveTheme(template.themeDefaults, { colors }),
    suite.text.lang,
  ) as CSSProperties;
}

export function suiteText(suite: CardSuite): StationeryText {
  const t = suite.text;
  const ar = t.lang === "ar";
  const d = t.date ? formatDateOnly(t.date, t.lang) : null;
  return {
    partnerOne: t.partnerOne,
    partnerTwo: t.partnerTwo,
    eyebrow: t.eyebrow || null,
    line: t.line || null,
    // Built from parts: Node and browsers disagree on the comma in a long date.
    dateLabel: d
      ? ar
        ? `${d.weekday}، ${d.day} ${d.month} ${d.year}`
        : `${d.weekday}, ${d.day} ${d.month} ${d.year}`
      : null,
    date: d
      ? {
          weekday: d.weekday,
          day: d.day,
          month: d.month,
          year: d.year,
          short: d.short,
        }
      : null,
    time: t.time || null,
    place: t.place || null,
    and: ar ? "و" : undefined,
    amp: ar ? "و" : undefined,
    labels: ar ? { day: "اليوم", month: "الشهر", year: "السنة" } : undefined,
  };
}

/** One piece of the suite, drawn at the size of its container. */
export function SuitePiece({
  suite,
  template,
  piece,
  sizes = "640px",
  className,
}: {
  suite: CardSuite;
  template: TemplateManifest;
  piece: Piece;
  sizes?: string;
  className?: string;
}) {
  const vars = suiteVars(template, suite);
  const text = suiteText(suite);
  const photos = suite.photo
    ? [{ url: suite.photo, alt: "Your photo" }]
    : [SAMPLE_PHOTO];
  const backQr = useQr(suite.back.qrUrl, suite.back.qr);
  const enclosureQr = useQr(suite.enclosure.qrUrl, suite.enclosure.qr);
  const art = template.stationery;
  const lang = suite.text.lang;
  const dir = lang === "ar" ? "rtl" : "ltr";

  if (piece === "envelope-front" || piece === "envelope-back") {
    return (
      <div dir={dir} lang={lang} className={className} style={vars}>
        <EnvelopeView
          suite={suite}
          ornament={art.ornament}
          side={piece === "envelope-front" ? "front" : "back"}
        />
      </div>
    );
  }

  if (piece === "enclosure-front" || piece === "enclosure-back") {
    const details = {
      ...art,
      layout: "details" as const,
      shape: "portrait" as const,
      // Photo-led designs get a quiet hairline frame on their enclosure.
      ornament: art.ornament === "none" ? ("hairline" as const) : art.ornament,
    };
    return (
      <div dir={dir} lang={lang} className={className}>
        <StationeryCard
          art={details}
          text={{
            ...text,
            details: {
              heading: suite.enclosure.heading,
              sections: suite.enclosure.sections,
            },
          }}
          options={{
            ...suite.options,
            orientation: "portrait",
            blessing: "none",
          }}
          side={piece === "enclosure-front" ? "front" : "back"}
          back={{
            layout:
              suite.enclosure.back === "blank" ? "blank" : suite.enclosure.back,
          }}
          qr={enclosureQr}
          sizes={sizes}
          style={vars}
        />
      </div>
    );
  }

  return (
    <div dir={dir} lang={lang} className={className}>
      <StationeryCard
        art={art}
        text={text}
        photos={photos}
        options={suite.options}
        side={piece}
        back={{
          layout: suite.back.layout,
          note: suite.back.note,
          photo: photos[0],
        }}
        qr={backQr}
        sizes={sizes}
        style={vars}
      />
    </div>
  );
}

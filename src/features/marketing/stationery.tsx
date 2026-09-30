import type { CSSProperties } from "react";
import type { StationeryOrnament, TemplateManifest } from "@/core/template/manifest";
import { fontStack } from "@/core/theme/fonts";
import { resolveTheme, themeToCssVars, type ThemeOverrides } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";

/**
 * A template drawn as a printed invitation card, using the template's own
 * theme tokens and fonts. Used for gallery cards, the homepage and the try
 * flow's step previews — it is a thumbnail, not the invitation itself (that
 * is always rendered by the template's Renderer).
 */
export function Stationery({
  template,
  overrides,
  partnerOne,
  partnerTwo,
  dateLabel,
  eyebrow = "Together with their families",
  className,
  style,
}: {
  template: Pick<TemplateManifest, "themeDefaults" | "stationery">;
  overrides?: ThemeOverrides;
  partnerOne: string;
  partnerTwo: string;
  dateLabel?: string | null;
  eyebrow?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const theme = resolveTheme(template.themeDefaults, overrides ?? {});
  const ornament = template.stationery.ornament;
  const vars = themeToCssVars(theme) as CSSProperties;

  return (
    <div
      aria-label={`${partnerOne} & ${partnerTwo} invitation`}
      role="img"
      className={cn("relative isolate aspect-[5/7] overflow-hidden [container-type:inline-size]", className)}
      style={{
        ...vars,
        background: theme.colors.surface,
        color: theme.colors.foreground,
        ...style,
      }}
    >
      <Ornament kind={ornament} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[12%] text-center" style={{ fontFamily: fontStack(theme.fonts.body) }}>
        {ornament === "crest" ? <Monogram a={partnerOne} b={partnerTwo} font={fontStack(theme.fonts.accent)} /> : null}
        <p className="text-[3.4cqw] tracking-[0.18em] opacity-70">{eyebrow}</p>
        <p className="mt-[5cqw] text-[11cqw] font-light leading-[1.02]" style={{ fontFamily: fontStack(theme.fonts.heading) }}>
          {partnerOne || " "}
        </p>
        <p className="my-[1.5cqw] text-[7cqw] leading-none" style={{ fontFamily: fontStack(theme.fonts.accent), color: theme.colors.accent }}>
          &amp;
        </p>
        <p className="text-[11cqw] font-light leading-[1.02]" style={{ fontFamily: fontStack(theme.fonts.heading) }}>
          {partnerTwo || " "}
        </p>
        {dateLabel ? <p className="mt-[6cqw] text-[3.6cqw] tracking-[0.16em] opacity-80">{dateLabel}</p> : null}
        {ornament === "seal" ? <Seal a={partnerOne} b={partnerTwo} font={fontStack(theme.fonts.accent)} /> : null}
      </div>
    </div>
  );
}

function initial(s: string) {
  return Array.from(s.trim())[0]?.toUpperCase() ?? "";
}

function Monogram({ a, b, font }: { a: string; b: string; font: string }) {
  return (
    <div className="mb-[6cqw] grid size-[20cqw] place-items-center rounded-full border border-[var(--inv-accent)] text-[7cqw] text-[var(--inv-accent)]" style={{ fontFamily: font }}>
      {initial(a)}
      {initial(b)}
    </div>
  );
}

function Seal({ a, b, font }: { a: string; b: string; font: string }) {
  return (
    <div
      className="mt-[8cqw] grid size-[16cqw] place-items-center rounded-full text-[5cqw] text-[var(--inv-accent-fg)] shadow-[0_2px_6px_rgb(0_0_0/0.25)]"
      style={{ fontFamily: font, background: "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--inv-accent) 65%, white), var(--inv-accent) 60%, color-mix(in oklab, var(--inv-accent) 70%, black))" }}
    >
      {initial(a)}
      {initial(b)}
    </div>
  );
}

/** Original line-art ornaments, colored by the template's accent. */
function Ornament({ kind }: { kind: StationeryOrnament }) {
  const accent = "var(--inv-accent)";
  switch (kind) {
    case "floral":
      return (
        <svg aria-hidden viewBox="0 0 100 140" className="absolute inset-0 size-full" preserveAspectRatio="none">
          <g fill="none" stroke={accent} strokeWidth="0.35" opacity="0.9">
            <FloralSpray transform="translate(0 0)" />
            <FloralSpray transform="translate(100 140) rotate(180)" />
          </g>
          <rect x="7" y="7" width="86" height="126" fill="none" stroke={accent} strokeWidth="0.25" opacity="0.5" />
        </svg>
      );
    case "leaves":
      return (
        <svg aria-hidden viewBox="0 0 100 140" className="absolute inset-0 size-full" preserveAspectRatio="none">
          <g fill={accent} opacity="0.55">
            <Branch transform="translate(-4 18) rotate(-8)" />
            <Branch transform="translate(104 122) rotate(172)" />
          </g>
        </svg>
      );
    case "gilded":
      return (
        <svg aria-hidden viewBox="0 0 100 140" className="absolute inset-0 size-full" preserveAspectRatio="none">
          <g fill="none" stroke={accent}>
            <rect x="5" y="5" width="90" height="130" strokeWidth="0.6" />
            <rect x="8" y="8" width="84" height="124" strokeWidth="0.25" />
            {[
              [8, 8, 0],
              [92, 8, 90],
              [92, 132, 180],
              [8, 132, 270],
            ].map(([x, y, r]) => (
              <path key={`${x}-${y}`} d="M0 10 C 0 4, 4 0, 10 0 M3 10 C 3 6, 6 3, 10 3" strokeWidth="0.35" transform={`translate(${x} ${y}) rotate(${r})`} />
            ))}
          </g>
        </svg>
      );
    case "crest":
      return (
        <svg aria-hidden viewBox="0 0 100 140" className="absolute inset-0 size-full" preserveAspectRatio="none">
          <rect x="6" y="6" width="88" height="128" fill="none" stroke={accent} strokeWidth="0.3" opacity="0.7" />
          <rect x="9" y="9" width="82" height="122" fill="none" stroke={accent} strokeWidth="0.15" opacity="0.7" />
        </svg>
      );
    case "seal":
      return (
        <svg aria-hidden viewBox="0 0 100 140" className="absolute inset-0 size-full" preserveAspectRatio="none">
          <rect x="7" y="7" width="86" height="126" fill="none" stroke={accent} strokeWidth="0.2" opacity="0.6" />
        </svg>
      );
    case "rule":
      return <div aria-hidden className="absolute inset-x-[12%] top-[10%] h-px bg-[var(--inv-fg)] opacity-80" />;
    case "hairline":
    default:
      return <div aria-hidden className="absolute inset-[6%] border border-[var(--inv-border)]" />;
  }
}

function FloralSpray(props: { transform: string }) {
  // A curving stem with leaves and three open blossoms.
  const blossom = (cx: number, cy: number, r: number) => (
    <g transform={`translate(${cx} ${cy})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r} rx={r * 0.55} ry={r} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.28} />
    </g>
  );
  return (
    <g {...props}>
      <path d="M2 36 C 12 26, 20 16, 36 4" />
      <path d="M4 30 C 10 30, 14 26, 15 22 C 11 22, 7 25, 4 30 Z" />
      <path d="M18 18 C 24 19, 27 16, 29 12 C 24 12, 20 14, 18 18 Z" />
      <path d="M10 26 C 8 20, 9 15, 13 12 C 14 17, 13 22, 10 26 Z" />
      {blossom(34, 6, 3.4)}
      {blossom(22, 13, 2.4)}
      {blossom(6, 33, 2.8)}
    </g>
  );
}

function Branch(props: { transform: string }) {
  const leaves = Array.from({ length: 9 }, (_, i) => i);
  return (
    <g {...props}>
      <path d="M0 0 C 20 -2, 40 2, 60 12" fill="none" stroke="var(--inv-accent)" strokeWidth="0.4" />
      {leaves.map((i) => {
        const x = 5 + i * 6;
        const y = i * i * 0.14;
        const up = i % 2 === 0;
        return <ellipse key={i} cx={x} cy={y + (up ? -3 : 3)} rx="1.4" ry="3.4" transform={`rotate(${up ? -40 : 40} ${x} ${y})`} />;
      })}
    </g>
  );
}

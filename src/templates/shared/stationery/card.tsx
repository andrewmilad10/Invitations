import { SmartImage as Image } from "@/components/smart-image";
import type { CSSProperties, ReactNode } from "react";
import { resolveCardOptions, type CardOptionOverrides } from "@/core/card/options";
import { designCardDefaults, orientedShape, stationeryArt, type CardShape, type StationeryArt } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { foilVars, paperOverlay, silhouetteStyle } from "./finish";
import { FlourishLine, framePath, Ornament, Ribbon, Wreath } from "./ornaments";

export interface StationeryText {
  partnerOne: string;
  partnerTwo: string;
  eyebrow?: string | null;
  dateLabel?: string | null;
  place?: string | null;
}

export interface StationeryPhoto {
  url: string;
  alt: string;
}

const HEIGHT: Record<CardShape, number> = { portrait: 140, arch: 140, square: 100, landscape: 71.43, corner: 140 };

/** CSS aspect ratio and outline of each card shape. */
export const SHAPE_STYLE: Record<CardShape, CSSProperties> = {
  portrait: { aspectRatio: "5 / 7" },
  square: { aspectRatio: "1 / 1" },
  landscape: { aspectRatio: "7 / 5" },
  // One soft corner: a quarter circle 60% of the width across.
  corner: { aspectRatio: "5 / 7", borderTopRightRadius: "60% 42.857%" },
  // A semicircular top: horizontal radius 50% of the width, vertical radius
  // the same length expressed as a share of the height (0.5 × 5/7).
  arch: { aspectRatio: "5 / 7", borderRadius: "50% 50% 0 0 / 35.714% 35.714% 0 0" },
};

/**
 * A design drawn as a printed card. It reads only the theme's --inv-*
 * variables, which the caller sets (the invitation root, or the gallery's
 * Stationery wrapper), so the same card renders any palette.
 *
 * Sizes are in `cqmin` (the card's shorter side), so every layout also works
 * turned to landscape. Finishing options — orientation, silhouette, foil and
 * paper — apply on top of any design; `side="back"` draws the reverse.
 */
export function StationeryCard({
  art: rawArt,
  text,
  photos = [],
  sizes = "(min-width: 1024px) 22vw, 45vw",
  options,
  side = "front",
  className,
  style,
}: {
  art: StationeryArt;
  text: StationeryText;
  photos?: StationeryPhoto[];
  sizes?: string;
  /** Finishing options; the design's own defaults (e.g. its foil) apply underneath. */
  options?: CardOptionOverrides;
  side?: "front" | "back";
  className?: string;
  style?: CSSProperties;
}) {
  const base = stationeryArt(rawArt);
  const finish = resolveCardOptions(designCardDefaults(rawArt), options);
  const art = { ...base, shape: orientedShape(base.shape, finish.orientation) };
  const h = HEIGHT[art.shape];
  const photoFull = art.layout === "photo-full" || art.layout === "photo-script" || art.layout === "photo-overlay";
  const paper = paperOverlay(finish.paper);

  return (
    <div
      role="img"
      aria-label={`${text.partnerOne} & ${text.partnerTwo} invitation${side === "back" ? " (back)" : ""}`}
      data-shape={art.shape}
      data-foil={finish.foil === "none" ? undefined : finish.foil}
      data-letterpress={art.letterpress ? "" : undefined}
      className={cn("stationery relative isolate overflow-hidden bg-inv-surface text-inv-fg [container-type:size]", className)}
      style={{ ...SHAPE_STYLE[art.shape], ...silhouetteStyle(art.shape, finish.silhouette), ...style, ...foilVars(finish.foil) }}
    >
      {side === "back" ? (
        <Back art={art} text={text} foil={finish.foil !== "none"} />
      ) : (
        <>
          {photoFull ? null : <Ornament kind={art.ornament} h={h} shape={art.shape} />}
          {/* Square cards are shorter, so the words are set a little smaller. */}
          <div className="absolute inset-0" style={art.shape === "square" ? { zoom: 0.8 } : undefined}>
            <Layout art={art} text={text} photos={photos} sizes={sizes} />
          </div>
        </>
      )}
      {finish.foil !== "none" ? <div aria-hidden className="stationery-foil-sheen pointer-events-none absolute inset-0" /> : null}
      {paper ? <div aria-hidden className="pointer-events-none absolute inset-0" style={paper} /> : null}
    </div>
  );
}

/** The reverse of the card: the accent colour with a monogram and a hairline frame. */
function Back({ art, text, foil }: { art: Required<StationeryArt>; text: StationeryText; foil: boolean }) {
  const h = HEIGHT[art.shape];
  // Foil cards keep a paper back with a stamped monogram; others are printed in colour.
  return (
    <div className={cn("absolute inset-0", foil ? "bg-inv-surface" : "bg-[color-mix(in_oklab,var(--inv-accent)_82%,var(--inv-fg))] text-inv-surface")}>
      <svg aria-hidden viewBox={`0 0 100 ${h}`} className="absolute inset-0 size-full">
        <path d={framePath(5, h, art.shape)} fill="none" stroke={foil ? "var(--inv-accent)" : "currentColor"} strokeWidth="0.25" opacity="0.55" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3cqmin] font-inv-body">
        <div className={cn("flex flex-col items-center gap-[3cqmin]", foil && "text-inv-accent")}>
        <p className="font-inv-heading text-[14cqmin] leading-none">
          {initial(text.partnerOne)}
          <span className="mx-[1.5cqmin] font-inv-accent text-[8cqmin] opacity-80">&amp;</span>
          {initial(text.partnerTwo)}
        </p>
        {text.dateLabel ? <p className="text-[2.8cqmin] uppercase tracking-[0.35em] opacity-80">{text.dateLabel}</p> : null}
        </div>
      </div>
    </div>
  );
}

function initial(s: string) {
  return Array.from(s.trim())[0]?.toUpperCase() ?? "";
}

function Photo({ photo, sizes, className }: { photo: StationeryPhoto | undefined; sizes: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-[color-mix(in_oklab,var(--inv-accent)_18%,var(--inv-surface))]", className)}>
      {photo?.url ? (
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          unoptimized={/^(\/|blob:|data:)/.test(photo.url)}
          className="object-cover"
          style={{ filter: "var(--inv-photo-filter, none)" }}
        />
      ) : null}
    </div>
  );
}

/** Eyebrow line (small, spaced). */
function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={cn("text-[3.1cqmin] uppercase tracking-[0.2em] opacity-75", className)}>{children}</p>;
}

function DateLine({ text, className }: { text: StationeryText; className?: string }) {
  if (!text.dateLabel && !text.place) return null;
  return (
    <div className={cn("text-[3.3cqmin] uppercase tracking-[0.18em]", className)}>
      {text.dateLabel ? <p>{text.dateLabel}</p> : null}
      {text.place ? <p className="mt-[1.2cqmin] opacity-70">{text.place}</p> : null}
    </div>
  );
}

function Ampersand({ className }: { className?: string }) {
  return <p className={cn("font-inv-accent leading-none text-inv-accent", className)}>&amp;</p>;
}

function Topper({ ornament }: { ornament: string }) {
  if (ornament === "ribbon") return <div className="mb-[4cqmin]"><Ribbon /></div>;
  if (ornament === "flourish") return <div className="mb-[4cqmin]"><FlourishLine /></div>;
  return null;
}

function Footer({ ornament }: { ornament: string }) {
  if (ornament === "flourish") return <div className="mt-[4cqmin]"><FlourishLine flip /></div>;
  return null;
}

/** Vertical padding so the words clear each motif. */
function contentInset(ornament: string, shape: CardShape) {
  const base = shape === "arch" ? "pt-[26cqmin] pb-[10cqmin]" : "py-[12cqmin]";
  if (ornament === "wildflowers") return shape === "arch" ? "pt-[24cqmin] pb-[30cqmin]" : "pt-[8cqmin] pb-[30cqmin]";
  if (ornament === "tile") return shape === "arch" ? "pt-[22cqmin] pb-[20cqmin]" : "py-[22cqmin]";
  if (ornament === "olive") return "pt-[22cqmin] pb-[18cqmin]";
  if (ornament === "garland") return "py-[16cqmin] px-[20%]";
  if (ornament === "twine") return shape === "arch" ? "pt-[70cqmin] pb-[10cqmin]" : "pt-[28cqmin] pb-[10cqmin]";
  return base;
}

function Layout({ art, text, photos, sizes }: { art: Required<StationeryArt>; text: StationeryText; photos: StationeryPhoto[]; sizes: string }) {
  const { layout, ornament, shape } = art;
  const column = "absolute inset-0 flex flex-col items-center justify-center px-[13%] text-center font-inv-body";

  switch (layout) {
    case "script":
      return (
        <div className={cn(column, contentInset(ornament, shape))}>
          <Topper ornament={ornament} />
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <p className="mt-[4cqmin] font-inv-accent text-[13.5cqmin] leading-[1.05] text-inv-accent">{text.partnerOne || " "}</p>
          <p className="my-[1cqmin] font-inv-heading text-[4cqmin] uppercase tracking-[0.3em] opacity-70">and</p>
          <p className="font-inv-accent text-[13.5cqmin] leading-[1.05] text-inv-accent">{text.partnerTwo || " "}</p>
          <DateLine text={text} className="mt-[5cqmin]" />
          <Footer ornament={ornament} />
        </div>
      );

    case "typographic":
      return (
        <div className={cn(column, contentInset(ornament, shape))}>
          <Eyebrow className="tracking-[0.32em]">{text.eyebrow}</Eyebrow>
          <p className="mt-[5cqmin] break-words font-inv-heading text-[14cqmin] uppercase leading-[0.92] tracking-[-0.01em]">{text.partnerOne || " "}</p>
          <div className="my-[2.5cqmin] flex w-full items-center gap-[3cqmin]">
            <span className="h-px flex-1 bg-current opacity-40" />
            <Ampersand className="text-[8cqmin]" />
            <span className="h-px flex-1 bg-current opacity-40" />
          </div>
          <p className="break-words font-inv-heading text-[14cqmin] uppercase leading-[0.92] tracking-[-0.01em]">{text.partnerTwo || " "}</p>
          <DateLine text={text} className="mt-[6cqmin] tracking-[0.28em]" />
        </div>
      );

    case "monogram":
      return (
        <div className={cn(column, contentInset(ornament, shape))}>
          <div className="relative mb-[6cqmin] grid size-[30cqmin] place-items-center">
            {ornament === "wreath" ? <Wreath /> : <span className="absolute inset-[8%] rounded-full border border-inv-accent" />}
            <span className="font-inv-heading text-[10cqmin] leading-none text-inv-accent">
              {initial(text.partnerOne)}
              <span className="mx-[0.6cqmin] align-middle text-[4cqmin] opacity-70">&amp;</span>
              {initial(text.partnerTwo)}
            </span>
          </div>
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <p className="mt-[3.5cqmin] font-inv-heading text-[7.5cqmin] uppercase leading-[1.15] tracking-[0.12em]">
            {text.partnerOne || " "}
            <span className="font-inv-accent normal-case text-inv-accent"> &amp; </span>
            {text.partnerTwo || " "}
          </p>
          <DateLine text={text} className="mt-[5cqmin]" />
        </div>
      );

    case "photo-top":
      return (
        <div className="absolute inset-0 flex flex-col font-inv-body">
          <Photo
            photo={photos[0]}
            sizes={sizes}
            className={cn(
              shape === "arch" ? "mx-[7%] mt-[7%] h-[54%] rounded-t-[50cqmin]" : shape === "square" ? "h-[52%]" : "mx-[7%] mt-[7%] h-[52%]",
            )}
          />
          <div className="flex flex-1 flex-col items-center justify-center px-[10%] text-center">
            <Eyebrow>{text.eyebrow}</Eyebrow>
            <p className="mt-[2.5cqmin] font-inv-heading text-[9cqmin] leading-[1.05]">
              {text.partnerOne || " "} <span className="font-inv-accent text-inv-accent">&amp;</span> {text.partnerTwo || " "}
            </p>
            <DateLine text={text} className="mt-[3cqmin]" />
          </div>
        </div>
      );

    case "photo-full":
      return (
        <div className="absolute inset-0 font-inv-body">
          <Photo photo={photos[0]} sizes={sizes} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-[10%] pb-[11cqmin] text-center text-white">
            <Eyebrow className="opacity-85">{text.eyebrow}</Eyebrow>
            <p className="mt-[2.5cqmin] font-inv-heading text-[12cqmin] leading-[1]">{text.partnerOne || " "}</p>
            <p className="font-inv-accent text-[7cqmin] leading-none opacity-90">&amp;</p>
            <p className="font-inv-heading text-[12cqmin] leading-[1]">{text.partnerTwo || " "}</p>
            <DateLine text={text} className="mt-[4cqmin] opacity-90" />
          </div>
        </div>
      );

    case "photo-script":
      // A colour-washed photo with calligraphy names (the Atelier look).
      return (
        <div className="absolute inset-0 font-inv-body">
          <Photo photo={photos[0]} sizes={sizes} className="absolute inset-0" />
          <div className="absolute inset-0 bg-inv-accent opacity-60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-[8%] text-center text-white">
            <Eyebrow className="tracking-[0.4em] opacity-85">{text.eyebrow}</Eyebrow>
            <p className="mt-[5cqmin] font-inv-accent text-[13cqmin] leading-[1.05]">{text.partnerOne || " "}</p>
            <p className="font-inv-accent text-[8cqmin] leading-none opacity-85">&amp;</p>
            <p className="font-inv-accent text-[13cqmin] leading-[1.05]">{text.partnerTwo || " "}</p>
            <DateLine text={text} className="mt-[6cqmin] tracking-[0.35em] opacity-90" />
          </div>
        </div>
      );

    case "photo-grid":
      return (
        <div className="absolute inset-0 flex flex-col p-[6%] font-inv-body">
          <div className={cn("grid grid-cols-2 gap-[2.5%]", shape === "square" ? "h-[56%]" : "h-[58%]")}>
            {[0, 1, 2, 3].map((i) => (
              <Photo key={i} photo={photos.length ? photos[i % photos.length] : undefined} sizes={sizes} />
            ))}
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Eyebrow>{text.eyebrow}</Eyebrow>
            <p className="mt-[2cqmin] font-inv-heading text-[9cqmin] uppercase leading-[1] tracking-[0.04em]">
              {text.partnerOne || " "} <span className="font-inv-accent normal-case text-inv-accent">&amp;</span> {text.partnerTwo || " "}
            </p>
            <DateLine text={text} className="mt-[3cqmin]" />
          </div>
        </div>
      );

    case "polaroid":
      return (
        <div className={cn(column, "px-[10%]", shape === "arch" ? "pt-[22cqmin]" : "")}>
          <div className="w-[74%] -rotate-3 bg-[color-mix(in_oklab,var(--inv-surface)_40%,white)] p-[3.5%] pb-[12%] shadow-[0_2cqmin_5cqmin_-2cqmin_rgb(0_0_0/0.35)]">
            <Photo photo={photos[0]} sizes={sizes} className="aspect-square w-full" />
            <p className="mt-[3cqmin] font-inv-accent text-[7.5cqmin] leading-none text-inv-fg">
              {text.partnerOne || " "} &amp; {text.partnerTwo || " "}
            </p>
          </div>
          <Eyebrow className="mt-[7cqmin]">{text.eyebrow}</Eyebrow>
          <DateLine text={text} className="mt-[2cqmin]" />
        </div>
      );

    case "magazine":
      // Maison: a magazine cover — masthead, tall portrait, names over it.
      return (
        <div className="absolute inset-0 bg-inv-bg font-inv-body text-inv-fg">
          <div className="absolute inset-x-[7%] top-[5%] flex items-baseline justify-between border-b border-current pb-[1.5cqmin] text-[2.6cqmin] uppercase tracking-[0.3em]">
            <span>N°01</span>
            <span className="truncate ps-[2cqmin] opacity-70">{text.eyebrow}</span>
          </div>
          <Photo photo={photos[0]} sizes={sizes} className="absolute end-[7%] top-[12%] h-[52%] w-[60%]" />
          <div className="absolute inset-x-[7%] bottom-[12%]">
            <p className="break-words font-inv-heading text-[16cqmin] uppercase leading-[0.84] tracking-[-0.03em]">{text.partnerOne || " "}</p>
            <p className="font-inv-accent text-[9cqmin] italic leading-[0.9] text-inv-accent">&amp;</p>
            <p className="break-words font-inv-heading text-[16cqmin] uppercase leading-[0.84] tracking-[-0.03em]">{text.partnerTwo || " "}</p>
          </div>
          <DateLine text={text} className="absolute inset-x-[7%] bottom-[5%] border-t border-current pt-[2cqmin] text-[2.8cqmin] tracking-[0.28em]" />
        </div>
      );

    case "framed":
      // Galerie: a framed print on a white wall with a wall label.
      return (
        <div className="absolute inset-0 flex flex-col bg-inv-bg px-[12%] pt-[11%] font-inv-body text-inv-fg">
          <div className="border border-inv-fg/70 bg-inv-surface p-[6%]">
            <Photo photo={photos[0]} sizes={sizes} className={shape === "square" ? "aspect-[4/3] w-full" : "aspect-[4/5] w-full"} />
          </div>
          <div className="mt-[6cqmin] flex gap-[3cqmin]">
            <span className="w-[0.8cqmin] shrink-0 bg-inv-accent" />
            <div className="min-w-0">
              <p className="font-inv-heading text-[8.5cqmin] leading-[1]">
                {text.partnerOne || " "} <span className="italic text-inv-accent">&amp;</span> {text.partnerTwo || " "}
              </p>
              {text.dateLabel ? <p className="mt-[1.5cqmin] text-[2.8cqmin] uppercase tracking-[0.2em] text-inv-muted">{text.dateLabel}</p> : null}
              {text.place ? <p className="text-[2.8cqmin] uppercase tracking-[0.2em] text-inv-muted">{text.place}</p> : null}
            </div>
          </div>
        </div>
      );

    case "postcard":
      // Postale: a tilted postcard with airmail edging, a stamp and postmark.
      return (
        <div className="absolute inset-0 overflow-hidden bg-inv-bg font-inv-body text-inv-fg">
          <div
            className="absolute inset-x-0 top-0 h-[3.5%]"
            style={{ background: "repeating-linear-gradient(-45deg, var(--inv-fg) 0 3cqmin, transparent 3cqmin 4.5cqmin, var(--inv-muted) 4.5cqmin 7.5cqmin, transparent 7.5cqmin 9cqmin)" }}
          />
          <p className="absolute start-[8%] top-[8%] font-inv-accent text-[2.6cqmin] uppercase tracking-[0.2em] text-inv-muted">Par avion</p>
          <div className={cn("absolute inset-x-[9%] -rotate-3 bg-white p-[3%] shadow-[0_2cqmin_5cqmin_-2cqmin_rgb(0_0_0/0.35)]", shape === "square" ? "top-[16%] h-[50%]" : "top-[15%] h-[44%]")}>
            <Photo photo={photos[0]} sizes={sizes} className="size-full" />
          </div>
          <div className={cn("absolute end-[7%] grid size-[17cqmin] rotate-6 place-items-center border-[0.8cqmin] border-dotted border-inv-muted bg-inv-accent font-inv-heading text-[6cqmin] text-inv-accent-fg", shape === "square" ? "top-[8%]" : "top-[10%]")}>
            {initial(text.partnerOne)}
            {initial(text.partnerTwo)}
          </div>
          <div className="absolute inset-x-[8%] bottom-[7%]">
            <p className="font-inv-accent text-[2.8cqmin] uppercase tracking-[0.2em] text-inv-muted">{text.eyebrow}</p>
            <p className="mt-[1.5cqmin] font-inv-heading text-[11cqmin] leading-[0.95]">
              {text.partnerOne || " "} <span className="italic text-inv-muted">&amp;</span> {text.partnerTwo || " "}
            </p>
            {text.dateLabel ? <p className="mt-[2cqmin] font-inv-accent text-[2.8cqmin] uppercase tracking-[0.18em]">{text.dateLabel}</p> : null}
          </div>
        </div>
      );

    case "refined":
      // Refined typography: tall capitals, a script "and", small spaced lines.
      return (
        <div className={cn(column, contentInset(ornament, shape), "gap-0")}>
          {text.eyebrow ? <p className="max-w-[80%] text-[2.6cqmin] uppercase leading-[1.7] tracking-[0.28em] opacity-80">{text.eyebrow}</p> : null}
          <p className="mt-[5cqmin] break-words font-inv-heading text-[17cqmin] uppercase leading-[0.86] tracking-[-0.01em]">{text.partnerOne || " "}</p>
          <div className="my-[2.2cqmin] flex w-[62%] items-center gap-[3cqmin]">
            <span className="h-px flex-1 bg-current opacity-40" />
            <span className="font-inv-accent text-[7cqmin] leading-none text-inv-accent">and</span>
            <span className="h-px flex-1 bg-current opacity-40" />
          </div>
          <p className="break-words font-inv-heading text-[17cqmin] uppercase leading-[0.86] tracking-[-0.01em]">{text.partnerTwo || " "}</p>
          {text.dateLabel ? <p className="mt-[6cqmin] font-inv-accent text-[6cqmin] leading-none">{text.dateLabel}</p> : null}
          {text.place ? <p className="mt-[3cqmin] text-[2.6cqmin] uppercase tracking-[0.3em] opacity-75">{text.place}</p> : null}
        </div>
      );

    case "photo-overlay":
      // A full-bleed photo; the words sit in its sky, in spaced white capitals.
      return (
        <div className="absolute inset-0 font-inv-body">
          <Photo photo={photos[0]} sizes={sizes} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex flex-col items-center px-[10%] pt-[9cqmin] text-center text-white">
            <Eyebrow className="text-[2.4cqmin] tracking-[0.34em] opacity-85">{text.eyebrow}</Eyebrow>
            <p className="mt-[4cqmin] font-inv-heading text-[5.6cqmin] uppercase tracking-[0.34em]">{text.partnerOne || " "}</p>
            <p className="my-[1cqmin] font-inv-accent text-[8cqmin] leading-none">and</p>
            <p className="font-inv-heading text-[5.6cqmin] uppercase tracking-[0.34em]">{text.partnerTwo || " "}</p>
            <DateLine text={text} className="mt-[4cqmin] text-[2.4cqmin] tracking-[0.3em] opacity-90" />
          </div>
        </div>
      );

    case "asymmetric":
      // Names set apart — one to the start, one to the end — with a script
      // "and" crossing between them.
      return (
        <div className={cn("absolute inset-0 flex flex-col justify-center px-[11%] font-inv-body", shape === "arch" ? "pt-[24cqmin]" : "py-[12cqmin]")}>
          {text.eyebrow ? <p className="max-w-[70%] text-[2.6cqmin] leading-[1.7] tracking-[0.06em] opacity-80">{text.eyebrow}</p> : null}
          <p className="mt-[6cqmin] break-words font-inv-heading text-[11cqmin] uppercase leading-[0.95] tracking-[0.02em]">{text.partnerOne || " "}</p>
          <p className="-my-[2cqmin] ms-[34%] font-inv-accent text-[11cqmin] leading-none text-inv-accent">and</p>
          <p className="self-end break-words text-end font-inv-heading text-[11cqmin] uppercase leading-[0.95] tracking-[0.02em]">{text.partnerTwo || " "}</p>
          <div className="mt-[8cqmin] self-end text-end text-[2.6cqmin] leading-[1.8] tracking-[0.12em]">
            {text.dateLabel ? <p className="uppercase">{text.dateLabel}</p> : null}
            {text.place ? <p className="opacity-75">{text.place}</p> : null}
          </div>
        </div>
      );

    case "spaced":
      // Small, widely spaced capitals and italic lines — quiet and classic.
      return (
        <div className={cn(column, contentInset(ornament, shape))}>
          {text.eyebrow ? <p className="font-inv-heading text-[3.4cqmin] italic opacity-80">{text.eyebrow}</p> : null}
          <p className="mt-[5cqmin] font-inv-heading text-[6.6cqmin] uppercase leading-[1.2] tracking-[0.32em]">{text.partnerOne || " "}</p>
          <p className="my-[1.5cqmin] font-inv-accent text-[6cqmin] leading-none text-inv-accent">and</p>
          <p className="font-inv-heading text-[6.6cqmin] uppercase leading-[1.2] tracking-[0.32em]">{text.partnerTwo || " "}</p>
          {text.dateLabel ? <p className="mt-[6cqmin] text-[2.8cqmin] uppercase tracking-[0.34em]">{text.dateLabel}</p> : null}
          {text.place ? <p className="mt-[2cqmin] font-inv-heading text-[3.4cqmin] italic opacity-80">{text.place}</p> : null}
        </div>
      );

    case "photo-side": {
      // Photo on one half, words on the other (stacked on tall cards).
      const wide = shape === "landscape";
      return (
        <div className={cn("absolute inset-0 flex font-inv-body", wide ? "flex-row" : "flex-col")}>
          <Photo photo={photos[0]} sizes={sizes} className={wide ? "h-full w-[48%]" : "h-[50%] w-full"} />
          <div className="flex flex-1 flex-col items-center justify-center px-[6%] text-center">
            <Eyebrow className="text-[2.6cqmin]">{text.eyebrow}</Eyebrow>
            <p className="mt-[3cqmin] font-inv-accent text-[12cqmin] leading-[1] text-inv-accent">{text.partnerOne || " "}</p>
            <p className="font-inv-heading text-[3.6cqmin] uppercase tracking-[0.3em] opacity-70">and</p>
            <p className="font-inv-accent text-[12cqmin] leading-[1] text-inv-accent">{text.partnerTwo || " "}</p>
            <DateLine text={text} className="mt-[4cqmin] text-[2.8cqmin]" />
          </div>
        </div>
      );
    }

    case "classic":
    default:
      return (
        <div className={cn(column, contentInset(ornament, shape))}>
          <Topper ornament={ornament} />
          {ornament === "crest" ? (
            <div className="mb-[6cqmin] grid size-[20cqmin] place-items-center rounded-full border border-inv-accent font-inv-accent text-[7cqmin] text-inv-accent">
              {initial(text.partnerOne)}
              {initial(text.partnerTwo)}
            </div>
          ) : null}
          {ornament === "celestial" ? <div className="h-[8cqmin]" /> : null}
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <p className="mt-[5cqmin] font-inv-heading text-[11cqmin] font-light leading-[1.02]">{text.partnerOne || " "}</p>
          <Ampersand className="my-[1.5cqmin] text-[9cqmin]" />
          <p className="font-inv-heading text-[11cqmin] font-light leading-[1.02]">{text.partnerTwo || " "}</p>
          <DateLine text={text} className="mt-[6cqmin]" />
          {ornament === "seal" ? (
            <div
              className="mt-[8cqmin] grid size-[16cqmin] place-items-center rounded-full font-inv-accent text-[5cqmin] text-inv-accent-fg shadow-[0_2px_6px_rgb(0_0_0/0.25)]"
              style={{ background: "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--inv-accent) 65%, white), var(--inv-accent) 60%, color-mix(in oklab, var(--inv-accent) 70%, black))" }}
            >
              {initial(text.partnerOne)}
              {initial(text.partnerTwo)}
            </div>
          ) : null}
          <Footer ornament={ornament} />
        </div>
      );
  }
}

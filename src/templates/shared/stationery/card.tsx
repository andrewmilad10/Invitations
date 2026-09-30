import { SmartImage as Image } from "@/components/smart-image";
import type { CSSProperties, ReactNode } from "react";
import { stationeryArt, type CardShape, type StationeryArt } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { FlourishLine, Ornament, Ribbon, Wreath } from "./ornaments";

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

const HEIGHT: Record<CardShape, number> = { portrait: 140, arch: 140, square: 100 };

/** CSS aspect ratio and outline of each card shape. */
export const SHAPE_STYLE: Record<CardShape, CSSProperties> = {
  portrait: { aspectRatio: "5 / 7" },
  square: { aspectRatio: "1 / 1" },
  // A semicircular top: horizontal radius 50% of the width, vertical radius
  // the same length expressed as a share of the height (0.5 × 5/7).
  arch: { aspectRatio: "5 / 7", borderRadius: "50% 50% 0 0 / 35.714% 35.714% 0 0" },
};

/**
 * A design drawn as a printed card. It reads only the theme's --inv-*
 * variables, which the caller sets (the invitation root, or the gallery's
 * Stationery wrapper), so the same card renders any palette.
 */
export function StationeryCard({
  art: rawArt,
  text,
  photos = [],
  sizes = "(min-width: 1024px) 22vw, 45vw",
  className,
  style,
}: {
  art: StationeryArt;
  text: StationeryText;
  photos?: StationeryPhoto[];
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const art = stationeryArt(rawArt);
  const h = HEIGHT[art.shape];
  const photoFull = art.layout === "photo-full" || art.layout === "photo-script";

  return (
    <div
      role="img"
      aria-label={`${text.partnerOne} & ${text.partnerTwo} invitation`}
      data-shape={art.shape}
      className={cn("relative isolate overflow-hidden bg-inv-surface text-inv-fg [container-type:inline-size]", className)}
      style={{ ...SHAPE_STYLE[art.shape], ...style }}
    >
      {photoFull ? null : <Ornament kind={art.ornament} h={h} shape={art.shape} />}
      {/* Square cards are shorter, so the words are set a little smaller. */}
      <div className="absolute inset-0" style={art.shape === "square" ? { zoom: 0.8 } : undefined}>
        <Layout art={art} text={text} photos={photos} sizes={sizes} />
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
  return <p className={cn("text-[3.1cqw] uppercase tracking-[0.2em] opacity-75", className)}>{children}</p>;
}

function DateLine({ text, className }: { text: StationeryText; className?: string }) {
  if (!text.dateLabel && !text.place) return null;
  return (
    <div className={cn("text-[3.3cqw] uppercase tracking-[0.18em]", className)}>
      {text.dateLabel ? <p>{text.dateLabel}</p> : null}
      {text.place ? <p className="mt-[1.2cqw] opacity-70">{text.place}</p> : null}
    </div>
  );
}

function Ampersand({ className }: { className?: string }) {
  return <p className={cn("font-inv-accent leading-none text-inv-accent", className)}>&amp;</p>;
}

function Topper({ ornament }: { ornament: string }) {
  if (ornament === "ribbon") return <div className="mb-[4cqw]"><Ribbon /></div>;
  if (ornament === "flourish") return <div className="mb-[4cqw]"><FlourishLine /></div>;
  return null;
}

function Footer({ ornament }: { ornament: string }) {
  if (ornament === "flourish") return <div className="mt-[4cqw]"><FlourishLine flip /></div>;
  return null;
}

/** Vertical padding so the words clear each motif. */
function contentInset(ornament: string, shape: CardShape) {
  const base = shape === "arch" ? "pt-[26cqw] pb-[10cqw]" : "py-[12cqw]";
  if (ornament === "wildflowers") return shape === "arch" ? "pt-[24cqw] pb-[30cqw]" : "pt-[8cqw] pb-[30cqw]";
  if (ornament === "tile") return shape === "arch" ? "pt-[22cqw] pb-[20cqw]" : "py-[22cqw]";
  if (ornament === "olive") return "pt-[22cqw] pb-[18cqw]";
  if (ornament === "garland") return "py-[16cqw] px-[20%]";
  if (ornament === "twine") return shape === "arch" ? "pt-[70cqw] pb-[10cqw]" : "pt-[28cqw] pb-[10cqw]";
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
          <p className="mt-[4cqw] font-inv-accent text-[13.5cqw] leading-[1.05] text-inv-accent">{text.partnerOne || " "}</p>
          <p className="my-[1cqw] font-inv-heading text-[4cqw] uppercase tracking-[0.3em] opacity-70">and</p>
          <p className="font-inv-accent text-[13.5cqw] leading-[1.05] text-inv-accent">{text.partnerTwo || " "}</p>
          <DateLine text={text} className="mt-[5cqw]" />
          <Footer ornament={ornament} />
        </div>
      );

    case "typographic":
      return (
        <div className={cn(column, contentInset(ornament, shape))}>
          <Eyebrow className="tracking-[0.32em]">{text.eyebrow}</Eyebrow>
          <p className="mt-[5cqw] break-words font-inv-heading text-[14cqw] uppercase leading-[0.92] tracking-[-0.01em]">{text.partnerOne || " "}</p>
          <div className="my-[2.5cqw] flex w-full items-center gap-[3cqw]">
            <span className="h-px flex-1 bg-current opacity-40" />
            <Ampersand className="text-[8cqw]" />
            <span className="h-px flex-1 bg-current opacity-40" />
          </div>
          <p className="break-words font-inv-heading text-[14cqw] uppercase leading-[0.92] tracking-[-0.01em]">{text.partnerTwo || " "}</p>
          <DateLine text={text} className="mt-[6cqw] tracking-[0.28em]" />
        </div>
      );

    case "monogram":
      return (
        <div className={cn(column, contentInset(ornament, shape))}>
          <div className="relative mb-[6cqw] grid size-[30cqw] place-items-center">
            {ornament === "wreath" ? <Wreath /> : <span className="absolute inset-[8%] rounded-full border border-inv-accent" />}
            <span className="font-inv-heading text-[10cqw] leading-none text-inv-accent">
              {initial(text.partnerOne)}
              <span className="mx-[0.6cqw] align-middle text-[4cqw] opacity-70">&amp;</span>
              {initial(text.partnerTwo)}
            </span>
          </div>
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <p className="mt-[3.5cqw] font-inv-heading text-[7.5cqw] uppercase leading-[1.15] tracking-[0.12em]">
            {text.partnerOne || " "}
            <span className="font-inv-accent normal-case text-inv-accent"> &amp; </span>
            {text.partnerTwo || " "}
          </p>
          <DateLine text={text} className="mt-[5cqw]" />
        </div>
      );

    case "photo-top":
      return (
        <div className="absolute inset-0 flex flex-col font-inv-body">
          <Photo
            photo={photos[0]}
            sizes={sizes}
            className={cn(
              shape === "arch" ? "mx-[7%] mt-[7%] h-[54%] rounded-t-[50cqw]" : shape === "square" ? "h-[52%]" : "mx-[7%] mt-[7%] h-[52%]",
            )}
          />
          <div className="flex flex-1 flex-col items-center justify-center px-[10%] text-center">
            <Eyebrow>{text.eyebrow}</Eyebrow>
            <p className="mt-[2.5cqw] font-inv-heading text-[9cqw] leading-[1.05]">
              {text.partnerOne || " "} <span className="font-inv-accent text-inv-accent">&amp;</span> {text.partnerTwo || " "}
            </p>
            <DateLine text={text} className="mt-[3cqw]" />
          </div>
        </div>
      );

    case "photo-full":
      return (
        <div className="absolute inset-0 font-inv-body">
          <Photo photo={photos[0]} sizes={sizes} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-[10%] pb-[11cqw] text-center text-white">
            <Eyebrow className="opacity-85">{text.eyebrow}</Eyebrow>
            <p className="mt-[2.5cqw] font-inv-heading text-[12cqw] leading-[1]">{text.partnerOne || " "}</p>
            <p className="font-inv-accent text-[7cqw] leading-none opacity-90">&amp;</p>
            <p className="font-inv-heading text-[12cqw] leading-[1]">{text.partnerTwo || " "}</p>
            <DateLine text={text} className="mt-[4cqw] opacity-90" />
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
            <p className="mt-[5cqw] font-inv-accent text-[13cqw] leading-[1.05]">{text.partnerOne || " "}</p>
            <p className="font-inv-accent text-[8cqw] leading-none opacity-85">&amp;</p>
            <p className="font-inv-accent text-[13cqw] leading-[1.05]">{text.partnerTwo || " "}</p>
            <DateLine text={text} className="mt-[6cqw] tracking-[0.35em] opacity-90" />
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
            <p className="mt-[2cqw] font-inv-heading text-[9cqw] uppercase leading-[1] tracking-[0.04em]">
              {text.partnerOne || " "} <span className="font-inv-accent normal-case text-inv-accent">&amp;</span> {text.partnerTwo || " "}
            </p>
            <DateLine text={text} className="mt-[3cqw]" />
          </div>
        </div>
      );

    case "polaroid":
      return (
        <div className={cn(column, "px-[10%]", shape === "arch" ? "pt-[22cqw]" : "")}>
          <div className="w-[74%] -rotate-3 bg-[color-mix(in_oklab,var(--inv-surface)_40%,white)] p-[3.5%] pb-[12%] shadow-[0_2cqw_5cqw_-2cqw_rgb(0_0_0/0.35)]">
            <Photo photo={photos[0]} sizes={sizes} className="aspect-square w-full" />
            <p className="mt-[3cqw] font-inv-accent text-[7.5cqw] leading-none text-inv-fg">
              {text.partnerOne || " "} &amp; {text.partnerTwo || " "}
            </p>
          </div>
          <Eyebrow className="mt-[7cqw]">{text.eyebrow}</Eyebrow>
          <DateLine text={text} className="mt-[2cqw]" />
        </div>
      );

    case "magazine":
      // Maison: a magazine cover — masthead, tall portrait, names over it.
      return (
        <div className="absolute inset-0 bg-inv-bg font-inv-body text-inv-fg">
          <div className="absolute inset-x-[7%] top-[5%] flex items-baseline justify-between border-b border-current pb-[1.5cqw] text-[2.6cqw] uppercase tracking-[0.3em]">
            <span>N°01</span>
            <span className="truncate ps-[2cqw] opacity-70">{text.eyebrow}</span>
          </div>
          <Photo photo={photos[0]} sizes={sizes} className="absolute end-[7%] top-[12%] h-[52%] w-[60%]" />
          <div className="absolute inset-x-[7%] bottom-[12%]">
            <p className="break-words font-inv-heading text-[16cqw] uppercase leading-[0.84] tracking-[-0.03em]">{text.partnerOne || " "}</p>
            <p className="font-inv-accent text-[9cqw] italic leading-[0.9] text-inv-accent">&amp;</p>
            <p className="break-words font-inv-heading text-[16cqw] uppercase leading-[0.84] tracking-[-0.03em]">{text.partnerTwo || " "}</p>
          </div>
          <DateLine text={text} className="absolute inset-x-[7%] bottom-[5%] border-t border-current pt-[2cqw] text-[2.8cqw] tracking-[0.28em]" />
        </div>
      );

    case "framed":
      // Galerie: a framed print on a white wall with a wall label.
      return (
        <div className="absolute inset-0 flex flex-col bg-inv-bg px-[12%] pt-[11%] font-inv-body text-inv-fg">
          <div className="border border-inv-fg/70 bg-inv-surface p-[6%]">
            <Photo photo={photos[0]} sizes={sizes} className={shape === "square" ? "aspect-[4/3] w-full" : "aspect-[4/5] w-full"} />
          </div>
          <div className="mt-[6cqw] flex gap-[3cqw]">
            <span className="w-[0.8cqw] shrink-0 bg-inv-accent" />
            <div className="min-w-0">
              <p className="font-inv-heading text-[8.5cqw] leading-[1]">
                {text.partnerOne || " "} <span className="italic text-inv-accent">&amp;</span> {text.partnerTwo || " "}
              </p>
              {text.dateLabel ? <p className="mt-[1.5cqw] text-[2.8cqw] uppercase tracking-[0.2em] text-inv-muted">{text.dateLabel}</p> : null}
              {text.place ? <p className="text-[2.8cqw] uppercase tracking-[0.2em] text-inv-muted">{text.place}</p> : null}
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
            style={{ background: "repeating-linear-gradient(-45deg, var(--inv-fg) 0 3cqw, transparent 3cqw 4.5cqw, var(--inv-muted) 4.5cqw 7.5cqw, transparent 7.5cqw 9cqw)" }}
          />
          <p className="absolute start-[8%] top-[8%] font-inv-accent text-[2.6cqw] uppercase tracking-[0.2em] text-inv-muted">Par avion</p>
          <div className={cn("absolute inset-x-[9%] -rotate-3 bg-white p-[3%] shadow-[0_2cqw_5cqw_-2cqw_rgb(0_0_0/0.35)]", shape === "square" ? "top-[16%] h-[50%]" : "top-[15%] h-[44%]")}>
            <Photo photo={photos[0]} sizes={sizes} className="size-full" />
          </div>
          <div className={cn("absolute end-[7%] grid size-[17cqw] rotate-6 place-items-center border-[0.8cqw] border-dotted border-inv-muted bg-inv-accent font-inv-heading text-[6cqw] text-inv-accent-fg", shape === "square" ? "top-[8%]" : "top-[10%]")}>
            {initial(text.partnerOne)}
            {initial(text.partnerTwo)}
          </div>
          <div className="absolute inset-x-[8%] bottom-[7%]">
            <p className="font-inv-accent text-[2.8cqw] uppercase tracking-[0.2em] text-inv-muted">{text.eyebrow}</p>
            <p className="mt-[1.5cqw] font-inv-heading text-[11cqw] leading-[0.95]">
              {text.partnerOne || " "} <span className="italic text-inv-muted">&amp;</span> {text.partnerTwo || " "}
            </p>
            {text.dateLabel ? <p className="mt-[2cqw] font-inv-accent text-[2.8cqw] uppercase tracking-[0.18em]">{text.dateLabel}</p> : null}
          </div>
        </div>
      );

    case "classic":
    default:
      return (
        <div className={cn(column, contentInset(ornament, shape))}>
          <Topper ornament={ornament} />
          {ornament === "crest" ? (
            <div className="mb-[6cqw] grid size-[20cqw] place-items-center rounded-full border border-inv-accent font-inv-accent text-[7cqw] text-inv-accent">
              {initial(text.partnerOne)}
              {initial(text.partnerTwo)}
            </div>
          ) : null}
          {ornament === "celestial" ? <div className="h-[8cqw]" /> : null}
          <Eyebrow>{text.eyebrow}</Eyebrow>
          <p className="mt-[5cqw] font-inv-heading text-[11cqw] font-light leading-[1.02]">{text.partnerOne || " "}</p>
          <Ampersand className="my-[1.5cqw] text-[9cqw]" />
          <p className="font-inv-heading text-[11cqw] font-light leading-[1.02]">{text.partnerTwo || " "}</p>
          <DateLine text={text} className="mt-[6cqw]" />
          {ornament === "seal" ? (
            <div
              className="mt-[8cqw] grid size-[16cqw] place-items-center rounded-full font-inv-accent text-[5cqw] text-inv-accent-fg shadow-[0_2px_6px_rgb(0_0_0/0.25)]"
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

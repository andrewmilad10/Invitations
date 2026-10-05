import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme, themeToCssVars } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";
import { MiniSite } from "../gallery/website-thumb";
import { FirstScreen } from "./first-screen";
import { ScaledScreen } from "./scaled-screen";
import { SCREENS, screenSrc } from "./screens";

/** Designs that open on their own scene (doors, lanterns, a book) rather than an envelope. */
const SCENE_OPENINGS = new Set(["gate", "nile", "herbarium"]);

const SAMPLE = { partnerOne: "Nour", partnerTwo: "Adam", dateLabel: "12 · 06 · 2027" };

/**
 * A wedding website shown the way guests first meet it: a phone with the
 * opening screen and, beside it, the envelope it arrives in (in the design's
 * own colours). Name, a short description and a "Try demo" button below.
 */
export function WebsiteCard({
  template,
  className,
  href,
  subtitle,
  extra,
}: {
  template: TemplateManifest;
  className?: string;
  /** Where the picture and name lead (the demo by default). */
  href?: string;
  /** A second line under the name (e.g. the name in Arabic). */
  subtitle?: string;
  /** Rendered under the tagline (e.g. "Shown with your names"). */
  extra?: ReactNode;
}) {
  const vars = themeToCssVars(resolveTheme(template.themeDefaults, {})) as CSSProperties;
  const demo = `/templates/${template.id}/preview`;
  const main = href ?? demo;
  const scene = SCENE_OPENINGS.has(template.renderer);
  return (
    <article
      className={cn(
        "group flex flex-col rounded-[1.6rem] border border-black/10 bg-[#f1e9e4] p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgb(60_30_20/0.35)] sm:p-3.5",
        className,
      )}
    >
      <Link href={main} aria-label={href ? `${template.name}: see the design` : `Try the ${template.name} demo`} tabIndex={href ? -1 : undefined} className="block overflow-hidden rounded-[1.1rem]">
        <div aria-hidden className="relative flex aspect-square items-center justify-center gap-[4%] bg-[#ead9c8] px-[5%] [container-type:inline-size]" style={vars}>
          <div className="w-[46%] shrink-0 transition-transform duration-700 ease-out group-hover:-translate-y-[2%] group-hover:-rotate-1">
            <div className="overflow-hidden rounded-[7cqw] border-[1.6cqw] border-neutral-900 bg-neutral-900 shadow-[0_6cqw_8cqw_-4cqw_rgb(0_0_0/0.5)]">
              <div className="relative aspect-[9/19] overflow-hidden rounded-[5cqw] [container-type:inline-size]">
                {SCREENS.has(template.id) ? (
                  <Image src={screenSrc(template.id, "hero")} alt="" fill sizes="(min-width: 1024px) 140px, 22vw" className="object-cover object-top" />
                ) : scene ? (
                  <ScaledScreen>
                    <FirstScreen templateId={template.id} />
                  </ScaledScreen>
                ) : (
                  <MiniSite template={template} {...SAMPLE} device="phone" openingOnly />
                )}
                <span className="absolute left-1/2 top-[2.5%] h-[3.6%] w-[34%] -translate-x-1/2 rounded-full bg-neutral-900" />
              </div>
            </div>
          </div>
          {scene ? <OpeningScene template={template} /> : <Envelope template={template} />}
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-2 pb-1 pt-4 sm:px-3">
        <h3 className="font-serif text-xl italic leading-tight sm:text-2xl">
          {href ? (
            <Link href={href} className="hover:underline hover:underline-offset-4">
              {template.name}
            </Link>
          ) : (
            template.name
          )}
        </h3>
        {subtitle ? (
          <p dir="rtl" lang="ar" className="mt-0.5 font-[family-name:var(--font-amiri)] text-base text-accent">
            {subtitle}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-3 flex-1 text-[0.82rem] leading-relaxed text-muted-foreground sm:line-clamp-4 sm:text-sm">{template.tagline}</p>
        {extra}
        <Link
          href={demo}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#1f2620] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#2c372e] sm:h-12 sm:text-xs"
        >
          Try demo
        </Link>
      </div>
    </article>
  );
}

/** The flap's outline (the kit envelope's shape): edges meet the sides a third of the way down and slope to a wide rounded tip at 58%. */
const FLAP = "polygon(0% 0%, 100% 0%, 100% 33%, 61% 55.24%, 59.17% 56.19%, 57.33% 56.97%, 55.5% 57.59%, 53.67% 58.02%, 51.83% 58.28%, 50% 58.37%, 48.17% 58.28%, 46.33% 58.02%, 44.5% 57.59%, 42.67% 56.97%, 40.83% 56.19%, 39% 55.24%, 0% 33%)";
const FLAP_PATH = "M0 33 L39 55.27 Q50 61.5 61 55.27 L100 33";

/**
 * The envelope beside the phone, drawn with crisp fold lines: a pointed top
 * flap with a rounded tip and the seal on it, the bottom flap rising to meet
 * it. The design's own envelope art when it has one, its colours otherwise.
 */
function Envelope({ template }: { template: TemplateManifest }) {
  const swan = template.renderer === "swan";
  const burgundy = template.renderer === "burgundy";
  const cotton = template.renderer === "cotton";
  const marble = template.renderer === "marble";
  const blue = template.renderer === "blue";
  const rosa = template.renderer === "rosa";
  const pond = template.renderer === "pond";
  const voyage = template.renderer === "voyage";
  const paper: CSSProperties = swan
    ? { backgroundImage: "url(/templates/swan-lake/linen.webp)", backgroundSize: "90px" }
    : cotton
      ? { backgroundColor: "var(--inv-fg)", backgroundImage: "url(/templates/cotton-press/paper.webp)", backgroundSize: "120px", backgroundBlendMode: "soft-light" }
      : marble
        ? { backgroundColor: "color-mix(in oklab, var(--inv-accent) 28%, var(--inv-surface))", backgroundImage: "url(/templates/rose-marble/paper.webp)", backgroundSize: "120px", backgroundBlendMode: "multiply" }
        : voyage
          ? { backgroundImage: "url(/templates/set-sail/linen.webp)", backgroundSize: "120px", backgroundBlendMode: "multiply" }
          : {};
  return (
    <div className="relative aspect-[10/17] w-[40%] shrink-0 overflow-hidden rounded-[1.4cqw] shadow-[0_5cqw_7cqw_-4cqw_rgb(0_0_0/0.45)] transition-transform duration-700 ease-out group-hover:translate-y-[1.5%] group-hover:rotate-1">
      {burgundy ? (
        <div className="absolute inset-0 bg-[url(/templates/burgundy-envelope/opening-poster.webp)] bg-cover bg-center" />
      ) : rosa ? (
        <div className="absolute inset-0 grid place-items-center bg-inv-bg">
          <div className="relative aspect-[1080/760] w-[92%] rounded-[1cqw] bg-[rgb(236_189_185)] shadow-[0_2cqw_4cqw_-2cqw_rgb(94_52_56/0.45)]">
            <span className="absolute inset-x-0 top-0 h-[66%] bg-[rgb(231_180_176)] [clip-path:polygon(0_0,100%_0,54%_86%,50%_90%,46%_86%)]" />
            <span className="absolute left-1/2 top-[58%] aspect-square w-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.8cqw] border-[rgb(200_140_122)]" />
          </div>
        </div>
      ) : blue ? (
        <>
          <div className="absolute inset-0 bg-[url(/templates/something-blue/envelope.webp)] bg-cover bg-center" />
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d="M0 63 L50 49 L100 63 M0 33 L39 55.27 Q50 61.5 61 55.27 L100 33" fill="none" stroke="rgb(0 0 0 / 0.16)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d="M0 32.4 L39 54.67 Q50 60.9 61 54.67 L100 32.4" fill="none" stroke="rgb(255 255 255 / 0.9)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="absolute left-1/2 top-[55%] grid aspect-square w-[28%] -translate-x-1/2 -translate-y-1/2 place-items-center bg-[url(/templates/something-blue/seal.webp)] bg-contain bg-center bg-no-repeat font-inv-heading text-[3.6cqw] text-[#8fa9d6]">
            {SAMPLE.partnerOne[0]}&amp;{SAMPLE.partnerTwo[0]}
          </span>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-inv-accent" style={paper} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.08),rgb(0_0_0/0)_45%,rgb(255_255_255/0.06))]" />
          {/* fold lines of the bottom and side flaps: a dark crease with a light edge beside it */}
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d="M0 63 L50 49 L100 63" fill="none" stroke="rgb(0 0 0 / 0.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d="M0 62.4 L50 48.4 L100 62.4" fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* the top flap, its shadow and its edge */}
          <div className="absolute inset-0 translate-y-[0.9cqw] bg-black/35 blur-[1.4cqw]" style={{ clipPath: FLAP }} />
          <div className="absolute inset-0 bg-inv-accent" style={{ clipPath: FLAP, ...paper }}>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.1),rgb(255_255_255/0)_40%,rgb(0_0_0/0.06))]" />
            {swan ? <span className="absolute left-1/2 top-[5%] aspect-square w-[64%] -translate-x-1/2 bg-[url(/templates/swan-lake/wreath.webp)] bg-contain bg-center bg-no-repeat [mask:radial-gradient(circle_closest-side,#000_78%,transparent)]" /> : null}
          </div>
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={FLAP_PATH} fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span
            className={cn("absolute left-1/2 top-[55%] grid aspect-square w-[28%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-inv-heading text-[3.4cqw] shadow-[0_1cqw_1.4cqw_rgb(0_0_0/0.35)]", swan ? "bg-[url(/templates/swan-lake/seal.webp)] bg-contain bg-center bg-no-repeat text-[#7d6f58]" : cotton ? "bg-[url(/templates/cotton-press/seal.webp)] bg-contain bg-center bg-no-repeat text-[#7a5a20] shadow-none" : voyage ? "bg-[url(/templates/set-sail/seal.webp)] bg-contain bg-center bg-no-repeat text-[#e8eefb]/80 brightness-[.8] shadow-none" : pond ? "bg-[url(/templates/swan-pond/seal.webp)] bg-contain bg-center bg-no-repeat text-[#f4d6dc]/70 shadow-none" : marble ? "bg-[url(/templates/rose-marble/seal.webp)] bg-contain bg-center bg-no-repeat text-[#8a4f40] shadow-none" : "bg-[radial-gradient(circle_at_38%_32%,#fbf8f2,#e7e0d3_55%,#c9bfae)] text-[#8a7c64]")}
          >
            {SAMPLE.partnerOne[0]}&amp;{SAMPLE.partnerTwo[0]}
          </span>
          <p className={cn("absolute inset-x-0 bottom-[9%] text-center font-inv-heading text-[2.8cqw] italic opacity-85", cotton || marble ? "text-inv-accent" : "text-inv-accent-fg")}>This invitation is for you</p>
        </>
      )}
    </div>
  );
}

/** The design's opening scene (doors, lanterns, a book) as a card beside the phone. */
function OpeningScene({ template }: { template: TemplateManifest }) {
  return (
    <div className="relative aspect-[10/17] w-[40%] shrink-0 overflow-hidden rounded-[1.4cqw] shadow-[0_5cqw_7cqw_-4cqw_rgb(0_0_0/0.45)] ring-1 ring-black/10 transition-transform duration-700 ease-out [container-type:inline-size] group-hover:translate-y-[1.5%] group-hover:rotate-1">
      {SCREENS.has(template.id) ? (
        <Image src={screenSrc(template.id, "opening")} alt="" fill sizes="(min-width: 1024px) 120px, 20vw" className="object-cover object-top" />
      ) : (
        <MiniSite template={template} {...SAMPLE} device="phone" openingOnly />
      )}
    </div>
  );
}

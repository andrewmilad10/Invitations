import { SmartImage as Image } from "@/components/smart-image";
import type { CSSProperties, ReactNode } from "react";
import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme, themeToCssVars, type ThemeOverrides } from "@/core/theme/tokens";
import { PHOTO_LIBRARY } from "@/features/media/library";
import { cn } from "@/lib/utils";
import { StationeryCard } from "@/templates/shared/stationery/card";

const HERO_PHOTO = PHOTO_LIBRARY.couple;
const PHOTOS = [PHOTO_LIBRARY.couple, PHOTO_LIBRARY.outdoors, PHOTO_LIBRARY.rings, PHOTO_LIBRARY.bouquet].map((p) => ({ url: p.url, alt: p.alt }));

/**
 * A design shown as a website: a browser window and a phone with the
 * invitation's opening screen and the start of its sections, in the
 * design's theme. A drawing of the real layout, cheap enough for a gallery
 * of dozens (the design page shows the live site).
 */
export function WebsiteThumb({
  template,
  overrides,
  partnerOne,
  partnerTwo,
  dateLabel,
  className,
}: {
  template: TemplateManifest;
  overrides?: ThemeOverrides;
  partnerOne: string;
  partnerTwo: string;
  dateLabel: string;
  className?: string;
}) {
  const theme = resolveTheme(template.themeDefaults, overrides ?? {});
  const vars = themeToCssVars(theme) as CSSProperties;
  const site = { template, partnerOne, partnerTwo, dateLabel };
  return (
    <div aria-hidden className={cn("relative [container-type:inline-size]", className)} style={vars}>
      <div className="absolute start-[5%] top-[12%] w-[80%] overflow-hidden rounded-md bg-white shadow-[0_18px_40px_-20px_rgb(0_0_0/0.45)]">
        <div className="flex h-[7cqw] items-center gap-[1cqw] bg-[color-mix(in_oklab,white_85%,black)] px-[2cqw]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-[1.4cqw] rounded-full bg-black/15" />
          ))}
        </div>
        <div className="aspect-[4/3.2] [container-type:inline-size]">
          <MiniSite {...site} device="desktop" />
        </div>
      </div>
      <div className="absolute bottom-[7%] end-[5%] w-[27%] overflow-hidden rounded-[3.2cqw] border-[1.1cqw] border-neutral-900 bg-neutral-900 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.55)]">
        <div className="aspect-[9/18.5] overflow-hidden rounded-[2.2cqw] [container-type:inline-size]">
          <MiniSite {...site} device="phone" />
        </div>
      </div>
    </div>
  );
}

function MiniSite({ template, partnerOne, partnerTwo, dateLabel, device }: { template: TemplateManifest; partnerOne: string; partnerTwo: string; dateLabel: string; device: "desktop" | "phone" }) {
  const cardHero = (template.features.hero ?? "photo") === "card";
  const atelier = template.renderer === "atelier";
  const phone = device === "phone";
  return (
    <div className="flex h-full flex-col bg-inv-bg font-inv-body text-inv-fg">
      <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden", phone ? "h-[78%]" : "h-[64%]")}>
        {LAYOUT_HEROES[template.renderer] ? (
          LAYOUT_HEROES[template.renderer]({ partnerOne, partnerTwo, dateLabel, phone })
        ) : cardHero ? (
          <>
            <div className="absolute inset-0" style={{ background: "radial-gradient(60% 55% at 50% 45%, color-mix(in oklab, var(--inv-accent) 14%, transparent), transparent)" }} />
            <StationeryCard
              art={template.stationery}
              text={{ partnerOne, partnerTwo, dateLabel, eyebrow: "" }}
              photos={PHOTOS}
              sizes="160px"
              className={cn("shadow-[0_3cqw_6cqw_-3cqw_rgb(0_0_0/0.45)]", phone ? "w-[74%]" : template.stationery.shape === "square" ? "w-[40%]" : "w-[32%]")}
            />
          </>
        ) : (
          <>
            <Image src={HERO_PHOTO.url} alt="" fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" style={{ filter: "var(--inv-photo-filter, none)" }} />
            {atelier ? <div className="absolute inset-0 bg-inv-accent opacity-60 mix-blend-multiply" /> : null}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/55" />
            <div className="relative text-center text-white">
              <p className={cn(atelier ? "font-inv-accent leading-[1.05]" : "font-inv-heading font-light leading-[0.95]", phone ? "text-[13cqw]" : "text-[8cqw]")}>
                {partnerOne}
                <span className={cn("block font-inv-accent opacity-85", phone ? "text-[8cqw]" : "text-[4.5cqw]")}>&amp;</span>
                {partnerTwo}
              </p>
              <p className={cn("mt-[2cqw] uppercase tracking-[0.3em] opacity-85", phone ? "text-[3.6cqw]" : "text-[1.8cqw]")}>{dateLabel}</p>
            </div>
            {template.features.opening === "envelope" ? (
              <span className={cn("absolute rounded-full bg-white/90 font-medium text-neutral-800", phone ? "bottom-[3cqw] px-[3cqw] py-[1cqw] text-[3.4cqw]" : "bottom-[2cqw] px-[1.8cqw] py-[0.6cqw] text-[1.6cqw]")}>
                Opens like a letter
              </span>
            ) : null}
          </>
        )}
      </div>
      {/* the start of the sections below the opening screen */}
      <div className={cn("flex flex-1 flex-col items-center text-center", phone ? "gap-[2.5cqw] pt-[5cqw]" : "gap-[1.2cqw] pt-[3cqw]")}>
        <span className={cn("bg-inv-accent", phone ? "h-[0.6cqw] w-[10cqw]" : "h-[0.35cqw] w-[6cqw]")} />
        <p className={cn("font-inv-heading leading-none", phone ? "text-[7cqw]" : "text-[3.6cqw]")}>Our story</p>
        <div className={cn("flex", phone ? "gap-[2cqw]" : "gap-[1.2cqw]")}>
          {["24", "09", "41", "12"].map((n) => (
            <span key={n} className={cn("grid place-items-center border border-inv-border bg-inv-surface font-inv-heading", phone ? "size-[11cqw] text-[5cqw]" : "size-[6cqw] text-[2.6cqw]")}>
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Heroes of layouts with their own opening screen ─────────────────────────

interface HeroProps {
  partnerOne: string;
  partnerTwo: string;
  dateLabel: string;
  phone: boolean;
}

function HeroPhoto({ className }: { className?: string }) {
  return (
    <div className={cn("absolute overflow-hidden bg-inv-surface", className)}>
      <Image src={HERO_PHOTO.url} alt="" fill sizes="(min-width: 1024px) 12vw, 30vw" className="object-cover" style={{ filter: "var(--inv-photo-filter, none)" }} />
    </div>
  );
}

const gold = "color-mix(in oklab, var(--inv-accent-fg) 100%, transparent)";
const LAYOUT_HEROES: Record<string, (p: HeroProps) => ReactNode> = {
  // The Gate: emerald doors with gold arches and the seal.
  gate: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 bg-inv-accent" style={{ backgroundImage: "repeating-conic-gradient(from 45deg at 50% 50%, color-mix(in oklab, var(--inv-accent-fg) 12%, transparent) 0 25%, transparent 0 50%)", backgroundSize: phone ? "7cqw 7cqw" : "3.4cqw 3.4cqw" }}>
      <div className="absolute inset-y-[9%] start-[15%] end-1/2 rounded-ss-[100%_34%] border border-e-0" style={{ borderColor: gold }} />
      <div className="absolute inset-y-[9%] end-[15%] start-1/2 rounded-se-[100%_34%] border border-s-0" style={{ borderColor: gold }} />
      <div className="absolute inset-y-0 start-1/2 w-px bg-black/30" />
      <span className={cn("absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-inv-accent text-inv-accent shadow-[0_1cqw_2cqw_rgb(0_0_0/0.4)]", phone ? "size-[20cqw] text-[7cqw]" : "size-[9cqw] text-[3.4cqw]")} style={{ background: `radial-gradient(circle at 36% 30%, color-mix(in oklab, ${gold} 45%, white), ${gold} 50%, color-mix(in oklab, ${gold} 60%, black))` }}>
        {partnerOne[0]}&amp;{partnerTwo[0]}
      </span>
    </div>
  ),
  // Moonlit Nile: moon, lanterns, the river.
  nile: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--inv-bg) 55%, black), var(--inv-bg) 60%, var(--inv-surface))" }}>
      <span className={cn("absolute end-[14%] top-[10%] rounded-full bg-inv-fg shadow-[0_0_4cqw_1cqw_color-mix(in_oklab,var(--inv-fg)_30%,transparent)]", phone ? "size-[14cqw]" : "size-[7cqw]")} />
      {[18, 32, 70, 84, 58].map((x, i) => (
        <span key={x} className={cn("absolute rounded-[40%] bg-inv-accent shadow-[0_0_3cqw_1cqw_color-mix(in_oklab,var(--inv-accent)_55%,transparent)]", phone ? "h-[6cqw] w-[4.5cqw]" : "h-[3cqw] w-[2.2cqw]")} style={{ left: `${x}%`, top: `${30 + (i % 3) * 14}%` }} />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-[24%] bg-inv-surface" />
      <p className={cn("absolute inset-x-0 top-[38%] text-center font-inv-accent text-inv-fg", phone ? "text-[11cqw]" : "text-[5.5cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // Pressed Garden: a linen book.
  herbarium: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 grid place-items-center bg-inv-bg">
      <div className={cn("grid place-items-center rounded-e-[1cqw] bg-inv-accent text-center text-inv-accent-fg shadow-[0_3cqw_5cqw_-2cqw_rgb(0_0_0/0.45)]", phone ? "h-[70%] w-[66%]" : "h-[78%] w-[34%]")}>
        <div className="w-[76%] border border-current/50 py-[8%]">
          <p className={cn("uppercase tracking-[0.2em]", phone ? "text-[3cqw]" : "text-[1.3cqw]")}>Herbarium</p>
          <p className={cn("font-inv-accent leading-tight", phone ? "text-[9cqw]" : "text-[4cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
        </div>
      </div>
    </div>
  ),
  // Gilded Toast: a Deco frame, rays and a coupe.
  toast: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 bg-inv-bg">
      <div className="absolute inset-0" style={{ background: "repeating-conic-gradient(from 0deg at 50% 50%, color-mix(in oklab, var(--inv-accent) 12%, transparent) 0 4deg, transparent 4deg 12deg)" }} />
      <div className="absolute inset-[6%] border border-inv-accent/70" />
      <svg viewBox="0 0 120 150" className={cn("absolute left-1/2 top-[18%] -translate-x-1/2 text-inv-accent", phone ? "w-[26cqw]" : "w-[11cqw]")}>
        <path d="M10 28 Q60 92 110 28 Z" fill="currentColor" opacity=".4" />
        <path d="M10 28 Q60 92 110 28 M10 28 H110 M60 66 V128 M36 132 H84" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
      <p className={cn("absolute inset-x-0 bottom-[18%] text-center font-inv-heading italic text-inv-accent", phone ? "text-[9cqw]" : "text-[4.4cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // Magazine cover: tall portrait, towering names across it.
  maison: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-inv-fg">
      <p className={cn("absolute start-[6%] top-[5%] uppercase tracking-[0.3em]", phone ? "text-[3cqw]" : "text-[1.5cqw]")}>N°01</p>
      <HeroPhoto className={phone ? "end-0 top-[10%] h-[55%] w-[62%]" : "end-[6%] top-[10%] h-[80%] w-[40%]"} />
      <div className={cn("absolute start-[6%] font-inv-heading uppercase leading-[0.82] tracking-[-0.03em]", phone ? "bottom-[14%] text-[17cqw]" : "bottom-[16%] text-[10cqw]")}>
        <p>{partnerOne}</p>
        <p className="font-inv-accent text-[0.5em] normal-case italic leading-none text-inv-accent">&amp;</p>
        <p>{partnerTwo}</p>
      </div>
      <p className={cn("absolute inset-x-[6%] border-t border-current font-inv-accent italic", phone ? "bottom-[3%] pt-[1.5cqw] text-[4cqw]" : "bottom-[4%] pt-[0.8cqw] text-[2cqw]")}>{dateLabel}</p>
    </div>
  ),
  // Exhibition: a framed print and a wall label.
  galerie: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className={cn("absolute inset-0 flex bg-inv-bg text-inv-fg", phone ? "flex-col items-center justify-center gap-[5cqw] px-[12%]" : "items-center justify-center gap-[6%] px-[10%]")}>
      <div className={cn("relative shrink-0 border border-inv-fg/70 bg-inv-surface", phone ? "aspect-[4/5] w-[80%] p-[7%]" : "aspect-[4/5] h-[74%] p-[3%]")}>
        <div className="relative size-full">
          <HeroPhoto className="inset-0" />
        </div>
      </div>
      <div className={phone ? "w-full" : ""}>
        <p className={cn("font-inv-heading leading-[0.95]", phone ? "text-[11cqw]" : "text-[6.5cqw]")}>
          {partnerOne}
          <br />
          <span className="italic text-inv-accent">&amp;</span> {partnerTwo}
        </p>
        <div className={cn("flex", phone ? "mt-[3cqw] gap-[2cqw]" : "mt-[2cqw] gap-[1cqw]")}>
          <span className={cn("shrink-0 bg-inv-accent", phone ? "w-[0.8cqw]" : "w-[0.4cqw]")} />
          <p className={cn("text-inv-muted", phone ? "text-[3.4cqw]" : "text-[1.6cqw]")}>{dateLabel}</p>
        </div>
      </div>
    </div>
  ),
  // Travel: airmail edging, a tilted postcard, a stamp.
  postale: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-inv-fg">
      <div
        className={cn("absolute inset-x-0 top-0", phone ? "h-[2.5cqw]" : "h-[1.3cqw]")}
        style={{ background: "repeating-linear-gradient(-45deg, var(--inv-fg) 0 2cqw, transparent 2cqw 3cqw, var(--inv-muted) 3cqw 5cqw, transparent 5cqw 6cqw)" }}
      />
      <div className={cn("absolute -rotate-3 bg-white shadow-[0_2cqw_4cqw_-2cqw_rgb(0_0_0/0.4)]", phone ? "inset-x-[9%] top-[12%] h-[48%] p-[3%]" : "start-[8%] top-[16%] h-[66%] w-[50%] p-[1.6%]")}>
        <div className="relative size-full">
          <HeroPhoto className="inset-0" />
        </div>
      </div>
      <span className={cn("absolute grid rotate-6 place-items-center border-dotted border-inv-muted bg-inv-accent font-inv-heading text-inv-accent-fg", phone ? "end-[7%] top-[7%] size-[15cqw] border-[0.8cqw] text-[6cqw]" : "start-[50%] top-[10%] size-[8cqw] border-[0.4cqw] text-[3cqw]")}>
        ♡
      </span>
      <div className={cn("absolute", phone ? "inset-x-[9%] bottom-[8%]" : "end-[6%] top-1/2 w-[34%] -translate-y-1/2")}>
        <p className={cn("font-inv-heading leading-[0.95]", phone ? "text-[12cqw]" : "text-[6cqw]")}>
          {partnerOne} <span className="italic text-inv-muted">&amp;</span> {partnerTwo}
        </p>
        <p className={cn("font-inv-accent uppercase tracking-[0.18em] text-inv-muted", phone ? "mt-[2cqw] text-[3cqw]" : "mt-[1.5cqw] text-[1.5cqw]")}>{dateLabel}</p>
      </div>
    </div>
  ),
};

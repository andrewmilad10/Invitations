import { SmartImage as Image } from "@/components/smart-image";
import type { CSSProperties, ReactNode } from "react";
import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme, themeToCssVars, type ThemeOverrides } from "@/core/theme/tokens";
import { PHOTO_LIBRARY } from "@/features/media/library";
import { cn } from "@/lib/utils";
import { StationeryCard } from "@/templates/shared/stationery/card";
import { Bow, Drape, RoseWindow } from "@/templates/showpiece/creative";
import { Column, Montaza, Palace, Pyramids } from "@/templates/showpiece/landmarks";

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

export function MiniSite({ template, partnerOne, partnerTwo, dateLabel, device, openingOnly }: { template: TemplateManifest; partnerOne: string; partnerTwo: string; dateLabel: string; device: "desktop" | "phone"; /** Only the opening screen, filling the frame. */ openingOnly?: boolean }) {
  const cardHero = (template.features.hero ?? "photo") === "card";
  const atelier = template.renderer === "atelier";
  const phone = device === "phone";
  return (
    <div className="flex h-full flex-col bg-inv-bg font-inv-body text-inv-fg">
      <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden", openingOnly ? "h-full" : phone ? "h-[78%]" : "h-[64%]")}>
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
      {openingOnly ? null : <div className={cn("flex flex-1 flex-col items-center text-center", phone ? "gap-[2.5cqw] pt-[5cqw]" : "gap-[1.2cqw] pt-[3cqw]")}>
        <span className={cn("bg-inv-accent", phone ? "h-[0.6cqw] w-[10cqw]" : "h-[0.35cqw] w-[6cqw]")} />
        <p className={cn("font-inv-heading leading-none", phone ? "text-[7cqw]" : "text-[3.6cqw]")}>Our story</p>
        <div className={cn("flex", phone ? "gap-[2cqw]" : "gap-[1.2cqw]")}>
          {["24", "09", "41", "12"].map((n) => (
            <span key={n} className={cn("grid place-items-center border border-inv-border bg-inv-surface font-inv-heading", phone ? "size-[11cqw] text-[5cqw]" : "size-[6cqw] text-[2.6cqw]")}>
              {n}
            </span>
          ))}
        </div>
      </div>}
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
  // ── Creative showpieces ──
  // Written in the Stars: a night sky, gold rings around the initials.
  stars: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% 0%, var(--inv-surface), var(--inv-bg) 60%)" }}>
      {[[12, 18], [80, 12], [30, 70], [88, 60], [62, 28], [20, 44], [72, 84], [45, 10]].map(([x, y]) => (
        <span key={`${x}-${y}`} className="absolute size-[0.8cqw] rounded-full bg-inv-fg/80" style={{ left: `${x}%`, top: `${y}%` }} />
      ))}
      <div className={cn("absolute left-1/2 -translate-x-1/2", phone ? "top-[14%] size-[44cqw]" : "top-[10%] size-[22cqw]")}>
        {["rotate(0deg) scaleY(.3)", "rotate(60deg) scaleY(.3)", "rotate(-60deg) scaleY(.3)", "scaleX(.45)"].map((t) => (
          <span key={t} className="absolute inset-0 rounded-full border border-inv-accent/70" style={{ transform: t }} />
        ))}
        <span className={cn("absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-inv-accent font-inv-accent text-inv-accent-fg", phone ? "size-[15cqw] text-[6cqw]" : "size-[7cqw] text-[3cqw]")}>
          {partnerOne[0]}&amp;{partnerTwo[0]}
        </span>
      </div>
      <p className={cn("absolute inset-x-0 text-center font-inv-accent text-inv-fg", phone ? "bottom-[16%] text-[11cqw]" : "bottom-[14%] text-[6cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // Paper Theatre: a cut-paper arch between curtains.
  popup: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--inv-accent) 22%, var(--inv-bg)), var(--inv-bg))" }}>
      <span className={cn("absolute left-1/2 -translate-x-1/2 rounded-full", phone ? "top-[18%] size-[26cqw]" : "top-[14%] size-[12cqw]")} style={{ background: "color-mix(in oklab, var(--inv-muted) 50%, var(--inv-bg))" }} />
      <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-[50%_22%]", phone ? "top-[12%] w-[80%]" : "top-[12%] w-[46%]")} style={{ boxShadow: "0 0 0 100cqw color-mix(in oklab, var(--inv-accent) 14%, var(--inv-surface))" }} />
      <Drape className="absolute left-0 top-0 h-full w-[22%] fill-inv-accent" />
      <Drape className="absolute right-0 top-0 h-full w-[22%] -scale-x-100 fill-inv-accent" />
      <div className={cn("absolute inset-x-0 top-0 bg-inv-accent", phone ? "h-[5cqw]" : "h-[2.5cqw]")} />
      <p className={cn("absolute inset-x-0 text-center font-inv-accent leading-tight", phone ? "top-[46%] text-[10cqw]" : "top-[44%] text-[5cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // Rose Window: the glass glowing in the dark.
  glass: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0" style={{ background: "radial-gradient(70% 50% at 50% 30%, var(--inv-accent), color-mix(in oklab, var(--inv-accent), black 50%))", ["--gold" as string]: "var(--inv-accent-fg)" }}>
      <div className={cn("absolute left-1/2 -translate-x-1/2 rounded-full p-[1%]", phone ? "top-[10%] w-[66%]" : "top-[8%] w-[30%]")} style={{ background: "color-mix(in oklab, var(--inv-accent-fg) 32%, var(--inv-accent))" }}>
        <RoseWindow />
      </div>
      <p className={cn("absolute inset-x-0 text-center font-inv-accent text-inv-accent-fg", phone ? "bottom-[14%] text-[10cqw]" : "bottom-[10%] text-[5.5cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // The Keepsake Box: ribbon, bow and names on the box colour.
  keepsake: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 bg-inv-accent">
      <span className={cn("absolute inset-x-0 bg-inv-accent-fg", phone ? "top-[12%] h-[6cqw]" : "top-[12%] h-[3cqw]")} />
      <span className={cn("absolute left-1/2 top-0 -translate-x-1/2 bg-inv-accent-fg", phone ? "h-[16%] w-[6cqw]" : "h-[16%] w-[3cqw]")} />
      <Bow className={cn("absolute left-1/2 -translate-x-1/2 fill-inv-accent-fg", phone ? "top-[5%] w-[36cqw]" : "top-[3%] w-[17cqw]")} />
      <p className={cn("absolute inset-x-0 text-center font-inv-accent leading-tight text-inv-accent-fg", phone ? "top-[44%] text-[11cqw]" : "top-[46%] text-[6cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // ── Egypt's venues ──
  // Giza at Dusk: the pyramids against a dusk sky and the sun.
  giza: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--inv-accent), black 30%), var(--inv-accent) 40%, color-mix(in oklab, var(--inv-accent), var(--inv-accent-fg) 45%) 66%, color-mix(in oklab, var(--inv-accent-fg), white 25%) 80%)" }}>
      <span className={cn("absolute left-[57%] -translate-x-1/2 rounded-full bg-inv-accent-fg shadow-[0_0_6cqw_2cqw_var(--inv-accent-fg)]", phone ? "bottom-[24%] size-[22cqw]" : "bottom-[24%] size-[10cqw]")} />
      <Pyramids className={cn("absolute bottom-[8%] left-1/2 -translate-x-1/2", phone ? "w-[175%]" : "w-full")} />
      <div className="absolute inset-x-0 bottom-0 h-[11%]" style={{ background: "color-mix(in oklab, var(--inv-accent) 55%, var(--inv-accent-fg))" }} />
      <p className={cn("absolute inset-x-0 text-center font-inv-accent text-inv-accent-fg", phone ? "top-[12%] text-[10cqw]" : "top-[10%] text-[5.5cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // Baron Palace: the palace drawn in gold at night.
  baron: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "radial-gradient(90% 55% at 50% 100%, color-mix(in oklab, var(--inv-accent) 16%, var(--inv-bg)), var(--inv-bg) 70%)", ["--gold" as string]: "var(--inv-accent)" }}>
      <Palace className={cn("absolute bottom-0 left-1/2 -translate-x-1/2", phone ? "w-[150%]" : "w-[70%]")} />
      <p className={cn("absolute inset-x-0 text-center font-inv-accent text-inv-accent", phone ? "top-[14%] text-[10cqw]" : "top-[10%] text-[5.5cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // Montaza by the Sea: the tower and the arcade over the sea.
  montaza: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--inv-accent) 28%, var(--inv-bg)), var(--inv-bg) 62%)" }}>
      <Montaza className="absolute inset-x-0 bottom-0 h-[62%] w-full" />
      <p className={cn("absolute inset-x-0 text-center font-inv-accent", phone ? "top-[10%] text-[10cqw]" : "top-[8%] text-[5.5cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
    </div>
  ),
  // Luxor Temple: two rows of lit columns and a cartouche.
  luxor: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--inv-accent), black 55%), color-mix(in oklab, var(--inv-accent), black 10%) 55%, color-mix(in oklab, var(--inv-accent), black 60%) 56%)" }}>
      {[0, 1, 2, 3].flatMap((i) => {
        const h = 92 - i * 18, w = 16 - i * 3, x = (phone ? 2 : 14) + i * (phone ? 9 : 7);
        return [x, 100 - x - w].map((left) => (
          <div key={`${i}-${left}`} className="absolute" style={{ left: `${left}%`, bottom: `${44 - h / 2.3}%`, width: `${w}%`, height: `${h}%` }}>
            <Column className="size-full" />
          </div>
        ));
      })}
      <div className={cn("absolute left-1/2 grid -translate-x-1/2 place-items-center rounded-full border border-inv-accent-fg/80 text-center font-inv-accent text-inv-accent-fg", phone ? "top-[24%] h-[38%] w-[64%] text-[8cqw]" : "top-[18%] h-[48%] w-[34%] text-[4.5cqw]")} style={{ background: "color-mix(in oklab, var(--inv-accent) 75%, transparent)" }}>
        <span>{partnerOne}<br />&amp;<br />{partnerTwo}</span>
      </div>
    </div>
  ),
  // ── Essentials ──
  linen: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 flex flex-col items-center bg-inv-bg pt-[8%] text-center text-inv-fg">
      <p className={cn("font-inv-heading font-light leading-none", phone ? "text-[10cqw]" : "text-[5cqw]")}>{partnerOne}</p>
      <p className={cn("font-inv-accent leading-none text-inv-accent", phone ? "text-[6cqw]" : "text-[3cqw]")}>&amp;</p>
      <p className={cn("font-inv-heading font-light leading-none", phone ? "text-[10cqw]" : "text-[5cqw]")}>{partnerTwo}</p>
      <p className={cn("mt-[2%] text-inv-muted", phone ? "text-[3.4cqw]" : "text-[1.6cqw]")}>{dateLabel}</p>
      <HeroPhoto className={cn("relative mt-[5%] aspect-[4/5] outline outline-1 outline-offset-[1cqw] outline-inv-border", phone ? "w-[56%]" : "w-[22%]")} />
    </div>
  ),
  monogram: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-inv-bg text-center text-inv-fg">
      <span className={cn("grid place-items-center rounded-full border border-inv-accent font-inv-accent text-inv-accent shadow-[inset_0_0_0_0.6cqw_var(--inv-bg),inset_0_0_0_0.75cqw_var(--inv-accent)]", phone ? "size-[34cqw] text-[11cqw]" : "size-[16cqw] text-[5cqw]")}>
        {partnerOne[0]}&amp;{partnerTwo[0]}
      </span>
      <p className={cn("mt-[5%] font-inv-heading tracking-wide", phone ? "text-[8cqw]" : "text-[4cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
      <p className={cn("text-inv-muted", phone ? "text-[3.4cqw]" : "text-[1.6cqw]")}>{dateLabel}</p>
    </div>
  ),
  split: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className={cn("absolute inset-0 flex bg-inv-bg text-inv-fg", phone ? "flex-col" : "")}>
      <div className={cn("relative", phone ? "h-[58%] w-full" : "h-full w-1/2")}>
        <HeroPhoto className="inset-0" />
      </div>
      <div className={cn("flex flex-1 flex-col justify-center", phone ? "px-[8%]" : "px-[5%]")}>
        <p className={cn("font-inv-heading leading-[1.02]", phone ? "text-[10cqw]" : "text-[5cqw]")}>
          {partnerOne} <span className="font-inv-accent text-inv-accent">&amp;</span> {partnerTwo}
        </p>
        <p className={cn("mt-[3%] text-inv-muted", phone ? "text-[3.4cqw]" : "text-[1.6cqw]")}>{dateLabel}</p>
      </div>
    </div>
  ),
  modern: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className={cn("absolute inset-0 bg-inv-bg text-inv-fg", phone ? "px-[8%] pt-[14%]" : "px-[7%] pt-[7%]")}>
      <p className={cn("font-inv-heading leading-[0.92] tracking-[-0.02em]", phone ? "text-[15cqw]" : "text-[8cqw]")}>
        {partnerOne}
        <br />
        <span className="font-inv-accent text-[0.4em] text-inv-accent">&amp; </span>
        {partnerTwo}
      </p>
      <p className={cn("mt-[4%] font-inv-accent text-inv-accent", phone ? "text-[9cqw]" : "text-[4.5cqw]")}>{dateLabel}</p>
      <div className={cn("absolute inset-x-0 bottom-0 border-t border-inv-border", phone ? "h-[18%]" : "h-[16%]")} />
    </div>
  ),
  // Editorial Romance: a black-and-white portrait, huge italic names over it.
  romance: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-inv-fg">
      <HeroPhoto className={cn("grayscale", phone ? "inset-x-[6%] top-[6%] h-[64%]" : "inset-y-[6%] start-[34%] end-[6%]")} />
      <div className={cn("absolute font-inv-heading italic leading-[0.85] tracking-[-0.03em] text-white mix-blend-difference", phone ? "start-[9%] top-[44%] text-[16cqw]" : "start-[6%] top-[30%] text-[9cqw]")}>
        <p>{partnerOne}</p>
        <p className="ps-[0.6em]">&amp; {partnerTwo}</p>
      </div>
      <p className={cn("absolute start-[6%] uppercase tracking-[0.3em]", phone ? "bottom-[8%] text-[3.4cqw]" : "bottom-[8%] text-[1.4cqw]")}>{dateLabel}</p>
    </div>
  ),
  // Old Money: club stripes over an engraved card with a laurel ring.
  heritage: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-inv-fg">
      <div className={cn("absolute inset-x-0 top-0", phone ? "h-[5%]" : "h-[7%]")} style={{ background: "repeating-linear-gradient(-45deg, var(--inv-accent) 0 6%, var(--inv-bg) 6% 8%, var(--inv-muted) 8% 10%, var(--inv-bg) 10% 12%)" }} />
      <div className={cn("absolute left-1/2 grid -translate-x-1/2 place-items-center border border-inv-accent bg-inv-surface text-center shadow-[inset_0_0_0_0.6cqw_var(--inv-surface),inset_0_0_0_0.75cqw_var(--inv-muted)]", phone ? "top-[14%] h-[66%] w-[80%] gap-[3cqw]" : "top-[16%] h-[74%] w-[42%] gap-[1.4cqw]")}>
        <span className={cn("grid place-items-center rounded-full border-2 border-dotted border-inv-muted font-inv-accent text-inv-accent", phone ? "size-[18cqw] text-[6cqw]" : "size-[8cqw] text-[2.6cqw]")}>{partnerOne[0]}{partnerTwo[0]}</span>
        <p className={cn("font-inv-accent uppercase tracking-[0.25em] text-inv-accent", phone ? "text-[5.4cqw]" : "text-[2.4cqw]")}>{partnerOne}<br />&amp; {partnerTwo}</p>
        <p className={cn("italic", phone ? "text-[3.6cqw]" : "text-[1.5cqw]")}>{dateLabel}</p>
      </div>
    </div>
  ),
  // Modern Minimal: a column grid, giant light names, one coloured dot.
  minimal: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-inv-fg" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 calc(25% - 1px), color-mix(in oklab, var(--inv-fg) 8%, transparent) calc(25% - 1px) 25%)" }}>
      <p className={cn("absolute inset-x-[6%] top-[5%] flex justify-between border-b border-inv-fg/20 pb-[1%] font-inv-accent", phone ? "text-[3cqw]" : "text-[1.3cqw]")}><span>(01)</span><span>{dateLabel}</span></p>
      <div className={cn("absolute inset-x-[6%] font-inv-heading font-light leading-[0.86] tracking-[-0.05em]", phone ? "bottom-[24%] text-[19cqw]" : "bottom-[16%] text-[11cqw]")}>
        <p>{partnerOne}</p>
        <p className="flex items-center gap-[0.15em] text-[0.2em] tracking-normal text-inv-accent"><span className="inline-block size-[0.7em] rounded-full bg-inv-accent" />&amp;</p>
        <p className="text-end">{partnerTwo}</p>
      </div>
    </div>
  ),
  // Italian Summer: a striped awning, names in italic, an arched window on tiles.
  limone: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-inv-fg">
      <div className={cn("absolute inset-x-0 top-0", phone ? "h-[9%]" : "h-[13%]")} style={{ background: "repeating-linear-gradient(90deg, var(--inv-accent) 0 6%, var(--inv-surface) 6% 12%)", maskImage: "radial-gradient(circle at 50% 0, black 70%, transparent 71%)", maskSize: "12% 140%", maskRepeat: "repeat-x" }} />
      <p className={cn("absolute inset-x-0 text-center font-inv-heading italic leading-[0.95] text-inv-accent", phone ? "top-[16%] text-[12cqw]" : "top-[22%] text-[5.6cqw]")}>{partnerOne}<br />&amp; {partnerTwo}</p>
      <div className={cn("absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-t-full border-[0.8cqw] border-inv-muted", phone ? "bottom-[6%] h-[40%] w-[62%]" : "bottom-[6%] h-[40%] w-[22%]")}>
        <HeroPhoto className="inset-0" />
      </div>
    </div>
  ),
  // Black Tie: night, a spotlight, wide capitals and a bow tie.
  blacktie: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 grid place-items-center bg-inv-bg text-center text-inv-fg" style={{ backgroundImage: "radial-gradient(ellipse 50% 60% at 50% 0%, color-mix(in oklab, var(--inv-fg) 16%, transparent), transparent 70%)" }}>
      <div>
        <svg viewBox="0 0 120 50" className={cn("mx-auto text-inv-accent", phone ? "w-[16cqw]" : "w-[7cqw]")} fill="none" stroke="currentColor" strokeWidth="2"><path d="M52 19 C40 6 22 2 8 6 C2 16 2 34 8 44 C22 48 40 44 52 31 Z M68 19 C80 6 98 2 112 6 C118 16 118 34 112 44 C98 48 80 44 68 31 Z" /><rect x="52" y="17" width="16" height="16" rx="3" /></svg>
        <p className={cn("mt-[3%] font-inv-heading uppercase leading-[1.1] tracking-[0.2em]", phone ? "text-[9cqw]" : "text-[4.6cqw]")}>{partnerOne}<br /><span className="font-inv-accent normal-case tracking-normal text-inv-accent">and</span><br />{partnerTwo}</p>
        <div className={cn("mx-auto my-[4%] border-y border-inv-accent", phone ? "h-[1.2cqw] w-[30cqw]" : "h-[0.6cqw] w-[14cqw]")} />
        <p className={cn("uppercase tracking-[0.3em]", phone ? "text-[3cqw]" : "text-[1.3cqw]")}>{dateLabel}</p>
      </div>
    </div>
  ),
  // French Garden: a parterre plan above italic names.
  jardin: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 grid place-items-center bg-inv-bg text-center text-inv-fg">
      <div className="w-full">
        <svg viewBox="0 0 400 260" className={cn("mx-auto text-inv-accent", phone ? "w-[80%]" : "w-[44%]")} fill="none" stroke="currentColor" strokeWidth="4">
          <rect x="12" y="12" width="376" height="236" rx="4" />
          {["", "matrix(-1 0 0 1 400 0)", "matrix(1 0 0 -1 0 260)", "matrix(-1 0 0 -1 400 260)"].map((t) => <path key={t} transform={t || undefined} d="M30 30 H184 V86.9 A46 46 0 0 0 156.9 114 H30 Z" />)}
          <circle cx="200" cy="130" r="30" />
        </svg>
        <p className={cn("mt-[4%] font-inv-heading italic leading-none", phone ? "text-[11cqw]" : "text-[5.4cqw]")}>{partnerOne} <span className="font-inv-accent text-inv-accent">&amp;</span> {partnerTwo}</p>
        <p className={cn("mt-[3%] uppercase tracking-[0.3em]", phone ? "text-[3cqw]" : "text-[1.3cqw]")}>{dateLabel}</p>
      </div>
    </div>
  ),
  // Luxury Magazine: a cover with the initials as masthead.
  glossy: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 text-inv-bg">
      <HeroPhoto className="inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.45),transparent_35%,transparent_55%,rgb(0_0_0/0.6))]" />
      <p className={cn("absolute inset-x-0 top-[3%] text-center font-inv-heading font-semibold uppercase leading-none tracking-[-0.04em]", phone ? "text-[34cqw]" : "text-[17cqw]")}>{partnerOne[0]}<i className="font-normal text-inv-accent">&amp;</i>{partnerTwo[0]}</p>
      <div className={cn("absolute start-[5%] bottom-[6%]", phone ? "end-[5%]" : "end-[40%]")}>
        <p className={cn("inline-block bg-inv-accent px-[1%] font-inv-accent uppercase text-inv-accent-fg", phone ? "text-[3.6cqw]" : "text-[1.6cqw]")}>The wedding issue</p>
        <p className={cn("font-inv-heading italic leading-none", phone ? "text-[10cqw]" : "text-[5cqw]")}>{partnerOne} &amp; {partnerTwo}</p>
        <p className={cn(phone ? "text-[3cqw]" : "text-[1.4cqw]")}>{dateLabel}</p>
      </div>
    </div>
  ),
  // Vintage Paper: a deckled card, a snapshot and a postmark.
  ephemera: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-inv-fg">
      <div className={cn("absolute -rotate-2 bg-inv-surface text-center shadow-[0_2cqw_3cqw_-1.5cqw_rgb(0_0_0/0.35)]", phone ? "inset-x-[8%] top-[8%] py-[10%]" : "start-[8%] top-[14%] w-[48%] py-[6%]")}>
        <p className={cn("font-inv-body", phone ? "text-[2.8cqw]" : "text-[1.2cqw]")}>— You are invited —</p>
        <p className={cn("font-inv-heading italic leading-tight", phone ? "text-[11cqw]" : "text-[5cqw]")}>{partnerOne}<br /><span className="font-inv-accent text-[0.45em] text-inv-accent">&amp;</span><br />{partnerTwo}</p>
        <p className={cn("font-inv-body", phone ? "text-[2.8cqw]" : "text-[1.2cqw]")}>{dateLabel}</p>
      </div>
      <div className={cn("absolute rotate-3 bg-inv-surface p-[1.2%] pb-[4%] shadow-[0_2cqw_3cqw_-1.5cqw_rgb(0_0_0/0.35)]", phone ? "bottom-[6%] end-[10%] w-[48%]" : "end-[10%] top-[18%] w-[28%]")}>
        <div className="relative aspect-[4/5]"><HeroPhoto className="inset-0 sepia-[.5]" /></div>
      </div>
      <span className={cn("absolute grid -rotate-12 place-items-center rounded-full border-2 border-inv-accent font-inv-heading text-inv-accent opacity-80", phone ? "bottom-[30%] start-[8%] size-[22cqw] text-[3cqw]" : "bottom-[10%] start-[46%] size-[11cqw] text-[1.6cqw]")}>{dateLabel}</span>
    </div>
  ),
  // The Arch: a colonnade of three arches over the names.
  arch: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-center text-inv-fg">
      <div className={cn("absolute left-1/2 flex -translate-x-1/2 items-end gap-[3%]", phone ? "top-[6%] w-[84%]" : "top-[6%] w-[46%]")}>
        <span className="aspect-[3/5] w-[22%] rounded-t-full bg-inv-muted" />
        <div className="relative aspect-[3/4.4] w-[50%] overflow-hidden rounded-t-full"><HeroPhoto className="inset-0" /></div>
        <span className="aspect-[3/4] w-[22%] rounded-t-full bg-inv-accent" />
      </div>
      <p className={cn("absolute inset-x-0 font-inv-heading leading-none", phone ? "top-[52%] text-[10cqw]" : "top-[64%] text-[5cqw]")}>{partnerOne} <span className="font-inv-accent text-inv-accent">&amp;</span> {partnerTwo}</p>
      <p className={cn("absolute inset-x-0 uppercase tracking-[0.3em]", phone ? "top-[62%] text-[3cqw]" : "top-[78%] text-[1.3cqw]")}>{dateLabel}</p>
    </div>
  ),
  // Film Story: a letterboxed frame with title credits.
  film: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 bg-black text-white">
      <div className={cn("absolute inset-x-0 overflow-hidden", phone ? "inset-y-[12%]" : "inset-y-[10%]")}>
        <HeroPhoto className="inset-0 sepia-[.2]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse,transparent_35%,rgb(0_0_0/0.75))]" />
        <div className="absolute inset-0 grid place-content-center text-center">
          <p className={cn("font-inv-heading uppercase leading-[0.9] tracking-[0.08em]", phone ? "text-[13cqw]" : "text-[7cqw]")}>{partnerOne}<br /><span className="font-inv-accent text-[0.35em] normal-case italic text-inv-accent">&amp;</span><br />{partnerTwo}</p>
          <p className={cn("mt-[4%] font-inv-heading uppercase tracking-[0.3em] text-inv-accent", phone ? "text-[3.4cqw]" : "text-[1.6cqw]")}>{dateLabel}</p>
        </div>
      </div>
    </div>
  ),
  // Botanical Glasshouse: a domed glasshouse with the photo inside and a leaf.
  glasshouse: ({ partnerOne, partnerTwo, phone }) => (
    <div className="absolute inset-0 bg-inv-bg text-center text-inv-fg">
      <div className={cn("absolute left-1/2 -translate-x-1/2", phone ? "top-[6%] w-[90%]" : "top-[4%] w-[56%]")}>
        <div className="relative aspect-[4/3]">
          <div className="absolute inset-0" style={{ clipPath: "polygon(7.5% 96%, 7.5% 52%, 30% 40%, 36% 22%, 50% 10%, 64% 22%, 70% 40%, 92.5% 52%, 92.5% 96%)" }}><HeroPhoto className="inset-0" /></div>
          <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 size-full text-inv-fg/70" fill="none" stroke="currentColor" strokeWidth="3"><path d="M30 290 V160 Q30 150 40 148 L120 120 Q140 50 200 30 Q260 50 280 120 L360 148 Q370 150 370 160 V290 Z M200 30 V290 M30 205 H370 M120 150 H280" /></svg>
        </div>
      </div>
      <p className={cn("absolute inset-x-0 font-inv-heading leading-none", phone ? "top-[50%] text-[10cqw]" : "top-[74%] text-[5cqw]")}>{partnerOne} <span className="font-inv-accent text-inv-accent">&amp;</span> {partnerTwo}</p>
    </div>
  ),
  // Monogram House: a seal and wide wordmark beside a canvas gift box.
  house: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className={cn("absolute inset-0 flex items-center justify-center bg-inv-bg text-inv-fg", phone ? "flex-col gap-[6%]" : "gap-[8%]")}>
      <div className="text-center">
        <span className={cn("mx-auto grid place-items-center rounded-full border border-inv-accent font-inv-accent text-inv-accent", phone ? "size-[18cqw] text-[7cqw]" : "size-[8cqw] text-[3cqw]")}>{partnerOne[0]}{partnerTwo[0]}</span>
        <p className={cn("mt-[6%] font-inv-heading font-bold uppercase leading-tight tracking-[0.16em]", phone ? "text-[7cqw]" : "text-[3.2cqw]")}>{partnerOne}<br />&amp; {partnerTwo}</p>
        <p className={cn("uppercase tracking-[0.3em] text-inv-muted", phone ? "text-[2.6cqw]" : "text-[1.1cqw]")}>{dateLabel}</p>
      </div>
      <div className={cn("relative bg-inv-accent", phone ? "aspect-square w-[50%]" : "aspect-square w-[28%]")} style={{ backgroundImage: "radial-gradient(circle, color-mix(in oklab, var(--inv-accent-fg) 45%, transparent) 1.5px, transparent 2px)", backgroundSize: "12% 12%" }}>
        <span className="absolute inset-y-0 left-1/2 w-[11%] -translate-x-1/2 bg-inv-bg" />
        <span className="absolute inset-x-0 top-[38%] h-[11%] bg-inv-bg" />
      </div>
    </div>
  ),
  // Swan Lake: the embroidered arch with the names.
  swan: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 grid place-items-center bg-inv-bg" style={{ backgroundImage: "url(/templates/swan-lake/linen.webp)", backgroundSize: "220px" }}>
      <div className={cn("relative bg-contain bg-center bg-no-repeat", phone ? "h-[96%] w-full" : "h-[96%] aspect-[1120/1869]")} style={{ backgroundImage: "url(/templates/swan-lake/hero.webp)" }}>
        <div className="absolute inset-x-[28%] top-[30%] text-center text-inv-fg">
          <p className={cn("font-inv-heading leading-[0.95]", phone ? "text-[11cqw]" : "text-[4.6cqw]")}>{partnerOne}<br /><span className="text-[0.5em]">&amp;</span><br />{partnerTwo}</p>
          <p className={cn("mt-[6%] font-semibold tracking-[0.2em]", phone ? "text-[2.6cqw]" : "text-[1.1cqw]")}>{dateLabel}</p>
        </div>
      </div>
    </div>
  ),
  // Cotton Press: the letterpress invitation on a linen tablecloth, names in gold foil.
  cotton: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 grid place-items-center bg-inv-bg bg-blend-multiply" style={{ backgroundImage: "url(/templates/cotton-press/linen.webp)", backgroundSize: "130px" }}>
      <div className={cn("-rotate-1 bg-inv-surface bg-blend-multiply text-center text-inv-fg shadow-[0_1px_1px_rgb(0_0_0/0.25),0_10px_18px_-8px_rgb(0_0_0/0.35)]", phone ? "w-[80%] px-[6%] py-[14%]" : "h-[86%] aspect-[3/4] px-[4%] py-[8%]")} style={{ backgroundImage: "url(/templates/cotton-press/paper.webp)", backgroundSize: "120px" }}>
        <p className={cn("font-inv-accent uppercase tracking-[0.3em]", phone ? "text-[2.2cqw]" : "text-[0.9cqw]")}>Together with their families</p>
        <p className={cn("mt-[8%] bg-[linear-gradient(104deg,color-mix(in_oklab,var(--inv-accent)_70%,black),var(--inv-accent)_25%,color-mix(in_oklab,var(--inv-accent)_30%,white)_45%,var(--inv-accent)_65%,color-mix(in_oklab,var(--inv-accent)_70%,black))] bg-clip-text font-inv-heading leading-[1] text-transparent", phone ? "text-[12cqw]" : "text-[4.4cqw]")}>{partnerOne}<br /><span className="text-[0.6em]">&amp;</span><br />{partnerTwo}</p>
        <p className={cn("mt-[8%] tracking-[0.18em]", phone ? "text-[3cqw]" : "text-[1.2cqw]")}>{dateLabel}</p>
      </div>
    </div>
  ),
  // Burgundy Envelope: the candle-lit hero with the names in script.
  burgundy: ({ partnerOne, partnerTwo, dateLabel, phone }) => (
    <div className="absolute inset-0 grid place-items-center bg-[url(/templates/burgundy-envelope/hero-poster.webp)] bg-cover bg-center text-center text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgb(0_0_0/0.15),rgb(0_0_0/0.45))]" />
      <div className="relative">
        <p className={cn("font-inv-heading leading-[1.1]", phone ? "text-[13cqw]" : "text-[6cqw]")}>{partnerOne}<br /><span className="text-[0.5em] text-[#d9bb69]">&amp;</span><br />{partnerTwo}</p>
        <p className={cn("mt-[6%] uppercase tracking-[0.25em]", phone ? "text-[3cqw]" : "text-[1.3cqw]")}>{dateLabel}</p>
      </div>
    </div>
  ),
};

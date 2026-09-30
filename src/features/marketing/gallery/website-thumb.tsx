import { SmartImage as Image } from "@/components/smart-image";
import type { CSSProperties } from "react";
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
        {cardHero ? (
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

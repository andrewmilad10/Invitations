import type { SectionProps } from "../types";
import { orientedShape } from "@/core/template/manifest";
import { StationeryCard } from "./stationery/card";

/**
 * The "card" hero: the first screen of the invitation is the design's
 * printed card, filled in with the couple's own names, date and photos —
 * so what they chose in the gallery is exactly what guests see first.
 */
export function CardHero({ model, content }: SectionProps<"hero">) {
  const { wedding, media, template } = model;
  const photos = [media.hero, ...media.gallery].filter((m) => m !== null).map((m) => ({ url: m.url, alt: m.alt }));
  const venue = model.events.ceremony?.venueName ?? model.events.reception?.venueName ?? null;
  const shape = orientedShape(template.art.shape, template.card.orientation);

  return (
    <header
      id="hero"
      data-section="hero"
      className="relative isolate flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden bg-inv-bg px-5 py-16 text-inv-fg"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 50% at 50% 45%, color-mix(in oklab, var(--inv-accent) 12%, transparent), transparent)" }}
      />
      <div
        data-hero-content
        className={
          "[filter:drop-shadow(0_30px_30px_rgb(0_0_0/0.25))] " +
          (shape === "landscape"
            ? "w-[min(92vw,44rem,calc((100svh-10rem)*1.4))]"
            : shape === "square"
              ? "w-[min(88vw,34rem,calc(100svh-10rem))]"
              : "w-[min(86vw,28rem,calc((100svh-10rem)*0.714))]")
        }
      >
        <StationeryCard
          art={template.art}
          text={{ partnerOne: wedding.partnerOne, partnerTwo: wedding.partnerTwo, eyebrow: content.eyebrow, dateLabel: wedding.date?.long ?? null, place: venue }}
          photos={photos}
          sizes="(min-width: 640px) 44rem, 92vw"
          options={template.card}

        />
      </div>
      {content.tagline ? <p className="max-w-md text-center text-inv-muted">{content.tagline}</p> : null}
      <div aria-hidden className="flex flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-inv-muted">
        {model.strings.scroll}
        <span className="h-8 w-px bg-current opacity-50" />
      </div>
    </header>
  );
}

import { PlaneSealMark } from "@/templates/shared/stationery/travel";
import type { CSSProperties, ReactNode } from "react";
import type { CardOptionOverrides } from "@/core/card/options";
import { cardShape, type TemplateManifest } from "@/core/template/manifest";
import type { ThemeOverrides } from "@/core/theme/tokens";
import { resolveTheme, themeToCssVars } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";
import { Stationery } from "../stationery";

/**
 * Staged views of a card for its product page: front, back, in its
 * envelope, as a flat-lay suite and a close-up of the paper. Everything is
 * drawn with the design's own colours; nothing is a photograph.
 */

export const CARD_VIEWS = ["front", "back", "envelope", "suite", "detail"] as const;
export type CardView = (typeof CARD_VIEWS)[number];
export const VIEW_LABELS: Record<CardView, string> = { front: "Front", back: "Back", envelope: "Envelope", suite: "Suite", detail: "Close-up" };

export interface SampleText {
  partnerOne: string;
  partnerTwo: string;
  dateLabel: string;
  place: string;
}

interface Props {
  template: TemplateManifest;
  overrides?: ThemeOverrides;
  options: CardOptionOverrides;
  text: SampleText;
  sizes?: string;
}


function Card({ template, overrides, options, text, sizes, side, className, style }: Props & { side?: "front" | "back"; className?: string; style?: CSSProperties }) {
  return (
    <Stationery
      template={template}
      overrides={overrides}
      options={options}
      side={side}
      partnerOne={text.partnerOne}
      partnerTwo={text.partnerTwo}
      dateLabel={text.dateLabel}
      place={text.place}
      sizes={sizes}
      className={className}
      style={style}
    />
  );
}

/** Width of the card on the stage, by shape, as a share of the stage. */
function cardWidth(shape: string) {
  return shape === "landscape" ? "w-[82%]" : shape === "square" ? "w-[62%]" : "w-[52%]";
}

/** Theme variables on a wrapper, so envelope and liner can use the palette. */
function Themed({ template, overrides, children, className }: { template: TemplateManifest; overrides?: ThemeOverrides; children: ReactNode; className?: string }) {
  const vars = themeToCssVars(resolveTheme(template.themeDefaults, overrides ?? {})) as CSSProperties;
  return (
    <div className={className} style={vars}>
      {children}
    </div>
  );
}

/** A soft cast shadow that follows the card's silhouette (scallops, arches). */
export const CARD_SHADOW = "[filter:drop-shadow(0_22px_20px_rgb(34_29_26/0.26))_drop-shadow(0_3px_4px_rgb(34_29_26/0.14))]";

export function CardStage(props: Props & { view: CardView }) {
  const { view, template, overrides } = props;
  const shape = cardShape(template.stationery, props.options);
  // The travel design comes in a dark envelope sealed with a plane.
  const travel = template.stationery.layout === "boarding-pass";

  if (view === "front" || view === "back") {
    return (
      <div className={cn("stationery-shine", CARD_SHADOW, cardWidth(shape))}>
        <Card {...props} side={view} />
      </div>
    );
  }

  if (view === "detail") {
    // A close-up: the card enlarged inside a window, so paper, foil and
    // pressed type can be seen.
    return (
      <div className="stationery-shine relative size-full overflow-hidden">
        <div className={cn("absolute left-1/2 top-[8%] origin-top -translate-x-1/2 scale-[1.9]", CARD_SHADOW, cardWidth(shape))}>
          <Card {...props} sizes="1400px" />
        </div>
      </div>
    );
  }

  if (view === "envelope") {
    const wide = shape === "landscape";
    return (
      <Themed template={template} overrides={overrides} className={cn("relative", CARD_SHADOW, wide ? "aspect-[7/6.4] w-[70%]" : "aspect-[7/8.2] w-[60%]")}>
        <Envelope initials={[props.text.partnerOne, props.text.partnerTwo]} height={wide ? 78 : 61} travel={travel}>
          <div className={cn("stationery-shine absolute bottom-[7%] left-1/2 -translate-x-1/2", wide ? "w-[84%]" : shape === "square" ? "w-[74%]" : "w-[66%]")}>
            <Card {...props} />
          </div>
        </Envelope>
      </Themed>
    );
  }

  // Suite: card, its back and the sealed envelope, laid flat on the table.
  return (
    <Themed template={template} overrides={overrides} className="relative aspect-[4/3] w-[94%]">
      <div className={cn("absolute -rotate-[9deg]", travel ? "left-[2%] top-[50%] w-[42%]" : "left-[4%] top-[18%] w-[46%]")}>
        <ClosedEnvelope initials={[props.text.partnerOne, props.text.partnerTwo]} travel={travel} />
      </div>
      <div className={cn("absolute right-[5%] top-[10%] rotate-[7deg]", CARD_SHADOW, shape === "landscape" ? "w-[46%]" : "w-[30%]")}>
        <Card {...props} side="back" />
      </div>
      <div className={cn("stationery-shine absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[1.5deg]", travel ? "top-[40%]" : "top-1/2", CARD_SHADOW, shape === "landscape" ? "w-[56%]" : shape === "square" ? "w-[40%]" : "w-[36%]")}>
        <Card {...props} />
      </div>
    </Themed>
  );
}

const ENVELOPE = "bg-[color-mix(in_oklab,var(--inv-surface)_70%,var(--inv-bg))]";
const ENVELOPE_DARK = "bg-[color-mix(in_oklab,var(--inv-accent)_92%,var(--inv-fg))]";
const ENVELOPE_INSIDE = "bg-[color-mix(in_oklab,var(--inv-bg)_80%,var(--inv-fg))]";

/**
 * An open envelope seen from the front: the lined flap folded up behind, the
 * card rising out of the pocket. `height` is the envelope body's share of
 * the stage (the rest is room for the card and flap above it).
 */
function Envelope({ initials, height, travel, children }: { initials: [string, string]; height: number; travel?: boolean; children: ReactNode }) {
  const body = { height: `${height}%` };
  const paper = travel ? ENVELOPE_DARK : ENVELOPE;
  return (
    <div className="absolute inset-0">
      {/* Inside of the envelope and its open, lined flap */}
      <div className={cn("absolute inset-x-0 bottom-0", ENVELOPE_INSIDE)} style={body} />
      <div
        className="absolute inset-x-0 h-[34%]"
        style={{ bottom: `${height}%`, clipPath: "polygon(0 100%, 50% 0, 100% 100%)", background: "color-mix(in oklab, var(--inv-accent) 80%, var(--inv-fg))" }}
      >
        <Liner />
      </div>
      {children}
      {/* Front pocket, folded in from the sides and bottom */}
      <div className="absolute inset-x-0 bottom-0" style={body}>
        <div className={cn("absolute inset-0", paper)} style={{ clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.06] to-transparent" style={{ clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)" }} />
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d="M0 0 L50 52 L100 0 M0 100 L42 58 M100 100 L58 58" fill="none" stroke="rgb(0 0 0 / 0.08)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className={cn("absolute bottom-[10%] right-[7%] font-inv-accent text-[clamp(0.9rem,2.4vw,1.5rem)]", travel ? "text-inv-accent-fg/80" : "text-inv-fg/60")}>
          {Array.from(initials[0])[0]} &amp; {Array.from(initials[1])[0]}
        </span>
      </div>
    </div>
  );
}

/** Liner pattern: small lozenges in the accent colour over a darker ground. */
function Liner() {
  return (
    <div
      className="absolute inset-0 opacity-60"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--inv-surface) 55%, transparent) 0 18%, transparent 20%)",
        backgroundSize: "14px 14px",
      }}
    />
  );
}

/** A sealed envelope with a wax seal carrying the couple's initials (or, for the travel design, a plane). */
function ClosedEnvelope({ initials, travel }: { initials: [string, string]; travel?: boolean }) {
  const paper = travel ? ENVELOPE_DARK : ENVELOPE;
  return (
    <div className={cn("relative aspect-[7/5]", CARD_SHADOW)}>
      <div className={cn("absolute inset-0", paper)} />
      <div className="absolute inset-x-0 top-0 h-[58%] [filter:drop-shadow(0_1px_1px_rgb(0_0_0/0.25))]">
        <div className={cn("size-full", paper)} style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
      </div>
      {travel ? (
        <div
          className="absolute left-1/2 top-[58%] grid size-[20%] -translate-x-1/2 -translate-y-1/2 place-items-center shadow-[0_2px_6px_rgb(0_0_0/0.35)]"
          style={{ borderRadius: "48% 52% 50% 46% / 52% 47% 53% 48%", background: "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--inv-accent-fg) 55%, white), var(--inv-accent-fg) 55%, color-mix(in oklab, var(--inv-accent-fg) 60%, black))" }}
        >
          <PlaneSealMark className="w-[48%] text-[color-mix(in_oklab,var(--inv-accent-fg)_45%,black)]" />
        </div>
      ) : (
        <div
          className="absolute left-1/2 top-[58%] grid size-[20%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-inv-accent text-[clamp(0.7rem,1.8vw,1.1rem)] text-inv-accent-fg shadow-[0_2px_6px_rgb(0_0_0/0.3)]"
          style={{ background: "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--inv-accent) 65%, white), var(--inv-accent) 60%, color-mix(in oklab, var(--inv-accent) 70%, black))" }}
        >
          {Array.from(initials[0])[0]}
          {Array.from(initials[1])[0]}
        </div>
      )}
    </div>
  );
}

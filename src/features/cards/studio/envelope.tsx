import type { CSSProperties, ReactNode } from "react";
import { ENVELOPE_COLORS, type CardSuite, type Liner } from "@/core/card/suite";
import type { StationeryOrnament } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { Ornament } from "@/templates/shared/stationery/ornaments";

/** Relative luminance of #rrggbb (0 black … 1 white). */
export function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The liner's surface, in the design's colours (the caller sets --inv-*). */
export function LinerFill({ liner, ornament, className }: { liner: Liner; ornament: StationeryOrnament; className?: string }) {
  const style: Record<Exclude<Liner, "none" | "design" | "botanical">, CSSProperties> = {
    accent: { background: "var(--inv-accent)" },
    dots: { background: "radial-gradient(circle, var(--inv-accent) 0 22%, transparent 25%) 0 0 / 14px 14px, var(--inv-surface)" },
    stripes: { background: "repeating-linear-gradient(90deg, var(--inv-accent) 0 7px, var(--inv-surface) 7px 16px)" },
    gingham: {
      background:
        "linear-gradient(90deg, color-mix(in oklab, var(--inv-accent) 45%, transparent) 50%, transparent 50%) 0 0 / 18px 18px, linear-gradient(color-mix(in oklab, var(--inv-accent) 45%, transparent) 50%, transparent 50%) 0 0 / 18px 18px, var(--inv-surface)",
    },
    lattice: {
      background:
        "repeating-linear-gradient(45deg, var(--inv-accent) 0 1.5px, transparent 1.5px 14px), repeating-linear-gradient(-45deg, var(--inv-accent) 0 1.5px, transparent 1.5px 14px), var(--inv-surface)",
    },
  };
  if (liner === "none") return null;
  if (liner === "design" || liner === "botanical") {
    const kind: StationeryOrnament = liner === "botanical" ? "line-garden" : ornament === "none" ? "vines" : ornament;
    return (
      <div className={cn("relative overflow-hidden bg-inv-surface text-inv-fg [container-type:size]", className)}>
        <div className="absolute inset-0 scale-[1.15]">
          <Ornament kind={kind} h={100} shape="square" />
        </div>
      </div>
    );
  }
  return <div className={className} style={style[liner]} />;
}

/**
 * The envelope, front (addresses) or back (the flap, sealed — or open on its
 * liner). Paper colours come from ENVELOPE_COLORS; the liner uses the
 * design's colours. Both sides are the same size, so it turns over cleanly;
 * the open flap rises above the envelope.
 */
export function EnvelopeView({ suite, ornament, side, open = false, className }: { suite: CardSuite; ornament: StationeryOrnament; side: "front" | "back"; open?: boolean; className?: string }) {
  const [, paper] = ENVELOPE_COLORS[suite.envelope.color];
  const dark = luminance(paper) < 0.3;
  const ink = dark ? "rgb(255 255 255 / 0.92)" : "rgb(30 26 22 / 0.88)";
  const shade = dark ? "rgb(255 255 255 / 0.08)" : "rgb(0 0 0 / 0.06)";
  const lines = (s: string): ReactNode => s.split("\n").map((l, i) => <span key={i} className="block">{l}</span>);

  if (side === "back") {
    const flap = "polygon(0 0, 100% 0, 50% 100%)";
    return (
      <div className={cn("relative aspect-[7/5] [container-type:size]", className)}>
        {/* The body: the inside shows at the top when the flap is open */}
        <div className="absolute inset-0 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.45)]" style={{ background: paper }}>
          <div className={cn("absolute inset-x-0 top-0 h-[7%] transition-opacity duration-700", open ? "opacity-100" : "opacity-0")} style={{ background: `linear-gradient(to bottom, color-mix(in oklab, ${paper} 85%, black), transparent)` }} />
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <path d="M0 100 L46 46 M100 100 L54 46 M0 0 L46 46 L54 46 L100 0" fill="none" stroke={shade} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="absolute inset-x-0 bottom-[9%] text-center text-[3.6cqmin] leading-[1.45]" style={{ color: ink }}>
            {lines(suite.envelope.returnAddress)}
          </p>
        </div>
        {/* The flap: sealed outside, liner inside */}
        <div className="absolute inset-x-0 top-0 h-[58%] [perspective:1400px]" style={{ zIndex: open ? 0 : 2 }}>
          <div
            className="relative size-full origin-top transition-transform duration-[900ms] ease-[cubic-bezier(.5,0,.2,1)] [transform-style:preserve-3d]"
            style={{ transform: open ? "rotateX(180deg)" : "none" }}
          >
            <div className="absolute inset-0 [backface-visibility:hidden] [filter:drop-shadow(0_3px_3px_rgb(0_0_0/0.18))]">
              <div className="size-full" style={{ clipPath: flap, background: `linear-gradient(to bottom, ${paper}, color-mix(in oklab, ${paper} 95%, black))` }} />
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]" style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 0)", background: paper }}>
              <LinerFill liner={suite.envelope.liner} ornament={ornament} className="absolute inset-x-[4%] bottom-0 top-[6%] [clip-path:polygon(0_100%,100%_100%,50%_0)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[7/5] shadow-[0_20px_40px_-20px_rgb(0_0_0/0.45)] [container-type:size]", className)} style={{ background: paper }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${shade}, transparent 40%)` }} />
      <p className="absolute start-[5%] top-[7%] font-inv-body text-[3.2cqmin] leading-[1.5]" style={{ color: ink }}>
        {lines(suite.envelope.returnAddress)}
      </p>
      <div className="absolute end-[6%] top-[7%] grid h-[18%] w-[11%] place-items-center border border-dashed text-[2.4cqmin] uppercase" style={{ borderColor: ink, color: ink, opacity: 0.5 }}>
        Stamp
      </div>
      <div className="absolute inset-x-0 top-[48%] text-center font-inv-heading" style={{ color: ink }}>
        <p className="font-inv-accent text-[7cqmin] leading-tight">{suite.envelope.guestName}</p>
        <p className="mt-[1.5cqmin] text-[3.6cqmin] leading-[1.5]">{lines(suite.envelope.guestAddress)}</p>
      </div>
    </div>
  );
}

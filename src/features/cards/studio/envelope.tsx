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
 * The envelope, front (addresses) or back (flap open on its liner). Paper
 * colours come from ENVELOPE_COLORS; the liner uses the design's colours.
 */
export function EnvelopeView({ suite, ornament, side, className }: { suite: CardSuite; ornament: StationeryOrnament; side: "front" | "back"; className?: string }) {
  const [, paper] = ENVELOPE_COLORS[suite.envelope.color];
  const dark = luminance(paper) < 0.3;
  const ink = dark ? "rgb(255 255 255 / 0.92)" : "rgb(30 26 22 / 0.88)";
  const shade = dark ? "rgb(255 255 255 / 0.08)" : "rgb(0 0 0 / 0.06)";
  const lines = (s: string): ReactNode => s.split("\n").map((l, i) => <span key={i} className="block">{l}</span>);

  if (side === "back") {
    return (
      <div className={cn("relative aspect-[7/7.4] [container-type:size]", className)}>
        {/* Open flap with the liner, then the body */}
        <div className="absolute inset-x-0 top-0 h-[66%]" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)", background: paper }}>
          <LinerFill liner={suite.envelope.liner} ornament={ornament} className="absolute inset-x-[4%] bottom-0 top-[6%] [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[52%] shadow-[0_20px_40px_-20px_rgb(0_0_0/0.45)]" style={{ background: paper }}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${shade}, transparent 30%)` }} />
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <path d="M0 0 L50 46 L100 0 M0 100 L44 52 M100 100 L56 52" fill="none" stroke={shade} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="absolute start-[6%] top-[10%] text-[3.4cqmin] leading-[1.5]" style={{ color: ink }}>
            {lines(suite.envelope.returnAddress)}
          </p>
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

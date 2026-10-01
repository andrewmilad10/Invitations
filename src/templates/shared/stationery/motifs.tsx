import type { ReactNode } from "react";
import type { CardShape } from "@/core/template/manifest";
import { ACCENT, Blossom, FG, Leaf, LEAF, LineBloom, LineLeaf, LinePeony, MUTED, round, seeded, Svg } from "./ornaments";

/**
 * A second set of original motifs — tulips and lace, roses, gardenias,
 * calla lilies, long gilded leaves, a vintage car and an ornate crest.
 * Same rules as ornaments.tsx: drawn procedurally in the theme's colours,
 * on a card 100 units wide and `h` units tall.
 */

const CREAM = "color-mix(in oklab, var(--inv-fg) 88%, var(--inv-bg))";
const LACE = "color-mix(in oklab, var(--inv-fg) 13%, var(--inv-bg))";
const PETAL = "color-mix(in oklab, var(--inv-surface) 82%, white)";

// ── Tulips and lace ─────────────────────────────────────────────────────────

/** A cup-shaped tulip with cream petals feathered in the paper colour. */
function Tulip({ x, y, s = 1, rotate = 0 }: { x: number; y: number; s?: number; rotate?: number }) {
  const petal = (d: string, key: string, shade = 0) => (
    <g key={key}>
      <path d={d} fill="url(#tulip-petal)" opacity={1 - shade} />
      <path d={d} fill="none" stroke="color-mix(in oklab, var(--inv-bg) 70%, transparent)" strokeWidth="0.25" />
    </g>
  );
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${rotate}) scale(${s})`}>
      {/* Stem and leaves */}
      <path d="M0 6 C 1 16, -1 26, 2 38" fill="none" stroke={LEAF} strokeWidth="1" strokeLinecap="round" />
      <Leaf x={1} y={30} angle={-28} len={22} width={4.2} />
      <Leaf x={1.5} y={34} angle={24} len={18} width={3.6} opacity={0.7} />
      {/* Back petals, then the front petal */}
      {petal("M-0.8 5.5 C -6.5 2.5, -8.5 -5, -7 -11.5 C -5.5 -15, -3.2 -14.5, -2.4 -12 C -3 -6, -2 0, -0.8 5.5 Z", "l", 0.15)}
      {petal("M0.8 5.5 C 6.5 2.5, 8.5 -5, 7 -11.5 C 5.5 -15, 3.2 -14.5, 2.4 -12 C 3 -6, 2 0, 0.8 5.5 Z", "r", 0.15)}
      {petal("M0 6 C -5 4.5, -6.6 -3.5, -5.4 -9.5 C -4.6 -13.6, -2.2 -15.4, 0 -13 C 2.2 -15.4, 4.6 -13.6, 5.4 -9.5 C 6.6 -3.5, 5 4.5, 0 6 Z", "c")}
      {/* Feathered flames of the paper colour */}
      <g fill="var(--inv-bg)" opacity="0.62">
        <path d="M-0.6 5 C -2.2 -0.5, -2.4 -6.5, -1.2 -12.4 C -1.2 -6, -0.6 -1, -0.1 5 Z" />
        <path d="M0.6 5 C 2.4 0, 2.8 -6, 2 -11.6 C 1.6 -6, 1 -1, 0.3 5 Z" />
        <path d="M-2.6 4 C -4.4 0, -4.8 -4.5, -4.2 -9 C -3.8 -5, -3.2 -1, -2 4 Z" />
        <path d="M2.6 4 C 4.4 0, 4.8 -4.5, 4.2 -9 C 3.8 -5, 3.2 -1, 2 4 Z" />
      </g>
    </g>
  );
}

/** An oval band of lace: rings of small rosettes between scalloped edges. */
function LaceOval({ h }: { h: number }) {
  const cx = 50;
  const cy = h / 2;
  const rx = 37;
  const ry = h * 0.4;
  const band = 7;
  const items: ReactNode[] = [];
  [0.18, 0.5, 0.82].forEach((k, ring) => {
    const ax = rx - band * k;
    const ay = ry - band * k;
    const n = Math.round(46 - ring * 4);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2 + ring * 0.07;
      items.push(<LineBloom key={`${ring}-${i}`} x={cx + ax * Math.cos(t)} y={cy + ay * Math.sin(t)} r={ring === 1 ? 1.5 : 1} rotate={i * 23} color={LACE} />);
    }
  });
  const scallops = (ax: number, ay: number, key: string) => {
    const n = 64;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const x = cx + ax * Math.cos(t);
      const y = cy + ay * Math.sin(t);
      d += i === 0 ? `M${round(x)} ${round(y)}` : ` A1.2 1.2 0 0 1 ${round(x)} ${round(y)}`;
    }
    return <path key={key} d={d} fill="none" stroke={LACE} strokeWidth="0.35" />;
  };
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx - band / 2} ry={ry - band / 2} fill="none" stroke="color-mix(in oklab, var(--inv-fg) 5%, var(--inv-bg))" strokeWidth={band} />
      {scallops(rx + 0.6, ry + 0.6, "out")}
      {scallops(rx - band - 0.6, ry - band - 0.6, "in")}
      {items}
    </g>
  );
}

function TulipsLace({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <defs>
        <linearGradient id="tulip-petal" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="color-mix(in oklab, var(--inv-bg) 55%, var(--inv-fg))" />
          <stop offset="0.55" stopColor={CREAM} />
          <stop offset="1" stopColor="color-mix(in oklab, var(--inv-fg) 96%, white)" />
        </linearGradient>
      </defs>
      <LaceOval h={h} />
      {/* Heads lean in towards the words; stems run out to the corners. */}
      <g>
        <Tulip x={90} y={17} s={1.25} rotate={205} />
        <Tulip x={99} y={35} s={1.05} rotate={236} />
        <Tulip x={75} y={5} s={0.95} rotate={186} />
      </g>
      <g>
        <Tulip x={10} y={h - 17} s={1.25} rotate={25} />
        <Tulip x={1} y={h - 35} s={1.05} rotate={56} />
        <Tulip x={25} y={h - 5} s={0.95} rotate={6} />
      </g>
    </Svg>
  );
}

// ── Hand-drawn corner curls ─────────────────────────────────────────────────

function Curls({ h }: { h: number }) {
  const corner = "M2 16 C 2 6, 6 2, 14 3 C 18 3.5, 19 8, 15.5 9 C 12 10, 12 5, 16 5 C 22 5, 26 3, 32 3 M3 4 C 6 2, 9 4, 7 7 C 5 9, 3 7, 4 5 M2 16 C 4 20, 2 26, 3 32";
  const at = (t: string, k: string) => <path key={k} d={corner} transform={t} fill="none" stroke={ACCENT} strokeWidth="0.55" strokeLinecap="round" />;
  return (
    <Svg h={h}>
      {at("translate(3 3)", "a")}
      {at("translate(97 3) scale(-1 1)", "b")}
      {at(`translate(3 ${h - 3}) scale(1 -1)`, "c")}
      {at(`translate(97 ${h - 3}) scale(-1 -1)`, "d")}
    </Svg>
  );
}

/** A vintage car seen from behind, dressed with flowers and ribbons. */
export function VintageCar({ className }: { className?: string }) {
  const garland = (x: number, flip: boolean, key: string) => (
    <g key={key} transform={flip ? `translate(${x} 0) scale(-1 1)` : `translate(${x} 0)`}>
      {[
        [0, 0, 2.6],
        [-3.4, 3.2, 2.2],
        [-5.6, 7.4, 2.4],
        [-6.4, 12, 2],
        [2.6, 3.6, 1.8],
        [-2, 9.6, 1.8],
      ].map(([bx, by, r], i) => (
        <Blossom key={i} x={bx} y={by} r={r} rotate={i * 37} fill={PETAL} width={0.28} />
      ))}
      <LineLeaf x={-7} y={14} angle={-150} len={4.5} width={1.4} />
      <LineLeaf x={3} y={6} angle={60} len={4} width={1.2} />
      <path d="M-5 13 C -7 22, -3 28, -6 36 C -8 42, -4 48, -6 56 M-4 13 C -3 24, -6 30, -3 38 C -1 44, -4 50, -2 56" fill="none" stroke={ACCENT} strokeWidth="0.3" />
    </g>
  );
  return (
    <svg aria-hidden viewBox="0 0 100 64" className={className}>
      <g fill="none" stroke={ACCENT} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 50 C 11 37, 17 29, 29 26 L 33 13 C 34 9, 37 7, 41 7 L 59 7 C 63 7, 66 9, 67 13 L 71 26 C 83 29, 89 37, 87 50 Z" fill="var(--inv-surface)" />
        <path d="M38 12 L 62 12 C 63.5 12, 64.5 13, 65 15 L 67 23 L 33 23 L 35 15 C 35.5 13, 36.5 12, 38 12 Z" />
        <path d="M23 30 C 40 27, 60 27, 77 30" />
        <circle cx="21" cy="39" r="3" />
        <circle cx="21" cy="39" r="1.4" />
        <circle cx="79" cy="39" r="3" />
        <circle cx="79" cy="39" r="1.4" />
        <path d="M44 18 C 47 15, 53 21, 56 18" />
        <path d="M43 34 L 57 34 L 57 41 L 43 41 Z" />
      </g>
      <rect x="9" y="49" width="82" height="5" rx="2.5" fill={ACCENT} />
      <rect x="15" y="54" width="9" height="6" rx="1.5" fill={ACCENT} />
      <rect x="76" y="54" width="9" height="6" rx="1.5" fill={ACCENT} />
      {garland(34, false, "l")}
      {garland(66, true, "r")}
    </svg>
  );
}

/** A small bird in flight (used in pairs). */
export function Bird({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 40 20" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M4 12 C 9 9, 14 9, 18 11 L 23 10 L 19 12.5 C 15 15, 9 15, 4 12 Z" fill={ACCENT} />
      <path d="M16 10.5 C 18 4, 24 1, 30 1 C 25 4, 22 7, 19 11" fill={ACCENT} opacity="0.85" />
      <path d="M4 12 C 2 13, 0 15, -2 18 M5 12.5 C 3 15, 2 17, 1 19" fill="none" stroke={ACCENT} strokeWidth="0.5" />
    </svg>
  );
}

// ── Pressed flower and tape (collage) ───────────────────────────────────────

export function PressedFlower({ className }: { className?: string }) {
  const rand = seeded(41);
  const heads: ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 1.6 - Math.PI * 0.8;
    const r = 6 + rand() * 9;
    heads.push(
      <g key={i}>
        <path d={`M30 52 Q ${round(30 + Math.sin(a) * r * 0.5)} ${round(36)} ${round(30 + Math.sin(a) * r)} ${round(28 - Math.cos(a) * r * 0.8)}`} fill="none" stroke="color-mix(in oklab, var(--inv-muted) 60%, var(--inv-fg))" strokeWidth="0.35" />
        <Blossom x={30 + Math.sin(a) * r} y={28 - Math.cos(a) * r * 0.8} r={2.4 + rand()} rotate={i * 29} fill="color-mix(in oklab, var(--inv-muted) 70%, white)" stroke="color-mix(in oklab, var(--inv-muted) 80%, var(--inv-fg))" width={0.2} />
      </g>,
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 60 130" className={className}>
      <path d="M30 52 C 31 80, 27 104, 30 130" fill="none" stroke="color-mix(in oklab, var(--inv-muted) 50%, var(--inv-fg))" strokeWidth="1.2" />
      <Leaf x={30} y={88} angle={-48} len={26} width={7} fill="color-mix(in oklab, var(--inv-muted) 45%, var(--inv-fg))" opacity={0.75} />
      <Leaf x={29} y={98} angle={40} len={22} width={6} fill="color-mix(in oklab, var(--inv-muted) 55%, var(--inv-fg))" opacity={0.65} />
      {heads}
    </svg>
  );
}

// ── Line garden (dense florals in two corners) ──────────────────────────────

function GardenCluster({ seed, faint }: { seed: number; faint?: boolean }) {
  const rand = seeded(seed);
  const color = faint ? `color-mix(in oklab, ${ACCENT} 35%, transparent)` : ACCENT;
  const out: ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 0.5;
    const r = 4 + rand() * 30;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const kind = i % 4;
    if (kind === 0) out.push(<LinePeony key={i} x={x} y={y} r={3.4 + rand() * 3} rotate={rand() * 90} color={color} />);
    if (kind === 1) out.push(<LineBloom key={i} x={x} y={y} r={2.6 + rand() * 2} rotate={rand() * 72} color={color} />);
    if (kind >= 2) out.push(<LineLeaf key={i} x={x} y={y} angle={rand() * 360} len={6 + rand() * 6} width={2 + rand()} color={color} />);
    if (rand() > 0.6) out.push(<circle key={`b${i}`} cx={round(x + 3)} cy={round(y + 2)} r={0.9 + rand() * 0.6} fill={color} opacity="0.85" />);
  }
  return <>{out}</>;
}

function Sprig({ transform, color = FG }: { transform: string; color?: string }) {
  return (
    <g transform={transform}>
      <path d="M0 0 C 4 -6, 6 -12, 12 -20" fill="none" stroke={color} strokeWidth="0.25" />
      <LineBloom x={12} y={-20} r={2.2} color={color} />
      <LineBloom x={6} y={-12} r={1.6} rotate={30} color={color} />
      <LineLeaf x={2} y={-3} angle={-70} len={4} width={1.2} color={color} />
      <LineLeaf x={8} y={-15} angle={60} len={3.6} width={1.1} color={color} />
    </g>
  );
}

function LineGarden({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <g transform="translate(-2 -2) scale(1.35)">
        <GardenCluster seed={7} faint />
        <GardenCluster seed={3} />
      </g>
      <g transform={`translate(102 ${h + 2}) rotate(180) scale(1.35)`}>
        <GardenCluster seed={11} faint />
        <GardenCluster seed={5} />
      </g>
      <Sprig transform="translate(84 30) rotate(-10)" />
      <Sprig transform={`translate(6 ${h - 16}) rotate(14)`} />
    </Svg>
  );
}

// ── Long gilded leaves ──────────────────────────────────────────────────────

/** A slender leaf drawn with fine veins. */
function VeinLeaf({ x, y, angle, len, width, faint }: { x: number; y: number; angle: number; len: number; width: number; faint?: boolean }) {
  const veins = Array.from({ length: 6 }, (_, i) => {
    const t = 0.15 + i * 0.13;
    return <path key={i} d={`M0 ${round(-len * t)} L ${round(width * 0.8)} ${round(-len * (t + 0.12))} M0 ${round(-len * t)} L ${round(-width * 0.8)} ${round(-len * (t + 0.12))}`} />;
  });
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${round(angle)})`}>
      {faint ? (
        <path d={`M0 0 C ${width * 1.2} ${-len * 0.3}, ${width * 0.8} ${-len * 0.8}, 0 ${-len} C ${-width * 0.8} ${-len * 0.8}, ${-width * 1.2} ${-len * 0.3}, 0 0 Z`} fill={`color-mix(in oklab, ${ACCENT} 14%, transparent)`} />
      ) : (
        <g fill="none" stroke={ACCENT} strokeWidth="0.22" strokeLinecap="round" opacity="0.85">
          <path d={`M0 0 C ${width} ${-len * 0.3}, ${width * 0.7} ${-len * 0.8}, 0 ${-len} C ${-width * 0.7} ${-len * 0.8}, ${-width} ${-len * 0.3}, 0 0 Z`} />
          <path d={`M0 0 L0 ${-len * 0.92}`} />
          {veins}
        </g>
      )}
    </g>
  );
}

function LeafSpray({ transform, seed }: { transform: string; seed: number }) {
  const rand = seeded(seed);
  return (
    <g transform={transform}>
      <path d="M0 0 C 10 4, 22 10, 34 22" fill="none" stroke={ACCENT} strokeWidth="0.3" opacity="0.8" />
      {Array.from({ length: 7 }, (_, i) => {
        const t = i / 6;
        const x = t * 34 - t * t * 4;
        const y = t * 22 - (1 - t) * t * 6;
        return <VeinLeaf key={i} x={x} y={y} angle={(i % 2 ? 40 : 130) + rand() * 20} len={9 - t * 3} width={2.4} />;
      })}
      <VeinLeaf x={6} y={12} angle={160} len={14} width={3.6} faint />
      <VeinLeaf x={18} y={4} angle={70} len={12} width={3} faint />
    </g>
  );
}

function Dots({ x, y, seed }: { x: number; y: number; seed: number }) {
  const rand = seeded(seed);
  return (
    <g fill={ACCENT} opacity="0.8">
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={round(x + (i % 3) * 2.6 + rand() * 1.2)} cy={round(y + Math.floor(i / 3) * 2.8 + rand() * 1.2)} r={round(0.55 + rand() * 0.35)} />
      ))}
    </g>
  );
}

function GoldLeaves({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <LeafSpray transform="translate(-2 6) rotate(-10) scale(0.72)" seed={3} />
      <LeafSpray transform="translate(102 -2) rotate(100) scale(0.72)" seed={5} />
      <LeafSpray transform={`translate(-2 ${h + 2}) rotate(-80) scale(0.72)`} seed={7} />
      <LeafSpray transform={`translate(102 ${h - 6}) rotate(170) scale(0.72)`} seed={9} />
      <Dots x={2} y={h * 0.24} seed={1} />
      <Dots x={90} y={h * 0.78} seed={2} />
      <Dots x={62} y={2} seed={4} />
    </Svg>
  );
}

// ── Calla lilies and tropical leaves (fine copper line) ─────────────────────

const COPPER = { fill: "none", stroke: MUTED, strokeWidth: 0.26, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Calla({ x, y, s = 1, rotate = 0 }: { x: number; y: number; s?: number; rotate?: number }) {
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${rotate}) scale(${s})`} {...COPPER}>
      <path d="M0 0 C -0.6 -14, 0.6 -30, 0 -44" />
      <path d="M0.6 0 C 0 -14, 1.2 -30, 0.6 -44" opacity="0.6" />
      {/* The spathe: a slender trumpet with a curled, pointed lip */}
      <path d="M0 -44 C -3.2 -47, -4.6 -52, -4 -57 C -3.6 -61, -1 -64, 2.5 -66 C 5 -67.5, 7.5 -67, 9 -68.5 C 8 -64, 6 -61, 4 -58 C 2.6 -53, 2.4 -48, 0.6 -44" />
      <path d="M-4 -57 C -1 -58.5, 2 -60, 4 -58" />
      <path d="M-2.6 -50 C -1.8 -54, -0.4 -58, 1.8 -61" opacity="0.6" />
      {/* The spadix */}
      <path d="M0.4 -52 C 0.4 -55, 1 -58, 2 -60" strokeWidth="0.7" />
    </g>
  );
}

function BigLeaf({ x, y, s = 1, rotate = 0 }: { x: number; y: number; s?: number; rotate?: number }) {
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${rotate}) scale(${s})`} {...COPPER}>
      <path d="M0 0 C 8 -6, 10 -18, 0 -32 C -10 -18, -8 -6, 0 0 Z" />
      <path d="M0 0 L 0 -30" />
      {[6, 11, 16, 21, 26].map((t) => (
        <path key={t} d={`M0 ${-t} C 3 ${-t - 1}, 5 ${-t - 3}, 6 ${-t - 5} M0 ${-t} C -3 ${-t - 1}, -5 ${-t - 3}, -6 ${-t - 5}`} />
      ))}
    </g>
  );
}

function SpikyLeaves({ transform }: { transform: string }) {
  return (
    <g transform={transform} {...COPPER}>
      {[-60, -35, -10, 15, 40].map((a, i) => (
        <g key={i} transform={`rotate(${a})`}>
          <path d={`M0 0 C 2 -8, 1.5 -18, 0 ${-24 - i}`} />
          <path d={`M0 0 C -2 -8, -1.5 -18, 0 ${-24 - i}`} />
          <path d={`M0 -4 L0 ${-22 - i}`} opacity="0.6" />
        </g>
      ))}
    </g>
  );
}

function CallaBorder({ h, shape }: { h: number; shape: CardShape }) {
  const tall = shape !== "landscape";
  return (
    <Svg h={h}>
      <SpikyLeaves transform="translate(2 2) rotate(150)" />
      <SpikyLeaves transform="translate(98 2) rotate(-150)" />
      {tall ? (
        <>
          <Calla x={3} y={h * 0.8} s={0.95} rotate={6} />
          <Calla x={6} y={h * 0.86} s={0.7} rotate={18} />
          <BigLeaf x={3} y={h * 0.86} s={0.6} rotate={34} />
          <Calla x={97} y={h * 0.8} s={0.95} rotate={-6} />
          <Calla x={94} y={h * 0.86} s={0.7} rotate={-18} />
          <BigLeaf x={97} y={h * 0.86} s={0.6} rotate={-34} />
        </>
      ) : null}
      {[12, 30, 50, 70, 88].map((x, i) => (
        <g key={x}>
          <LinePeony x={x} y={h - 4 + (i % 2) * 2} r={5 + (i % 2)} rotate={i * 40} color={MUTED} />
          <BigLeaf x={x + 7} y={h + 2} s={0.45} rotate={i % 2 ? 40 : -40} />
        </g>
      ))}
    </Svg>
  );
}

// ── Painted roses (for the rose arch) ───────────────────────────────────────

const ROSE = "color-mix(in oklab, var(--inv-accent) 78%, var(--inv-surface))";
const ROSE_DEEP = "color-mix(in oklab, var(--inv-accent) 85%, var(--inv-fg))";
const FOLIAGE = "color-mix(in oklab, var(--inv-muted) 75%, var(--inv-fg))";

/** A soft, painterly rose: layered translucent petals around a curled heart. */
export function PaintedRose({ x, y, r, rotate = 0 }: { x: number; y: number; r: number; rotate?: number }) {
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${rotate})`}>
      <circle r={r} fill={ROSE} opacity="0.55" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <ellipse key={`o${i}`} cx="0" cy={round(-r * 0.55)} rx={round(r * 0.55)} ry={round(r * 0.48)} fill={ROSE} opacity="0.4" transform={`rotate(${i * 51})`} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={`i${i}`} cx="0" cy={round(-r * 0.3)} rx={round(r * 0.38)} ry={round(r * 0.3)} fill={ROSE_DEEP} opacity="0.35" transform={`rotate(${i * 72 + 20})`} />
      ))}
      <path d={`M${round(-r * 0.25)} 0 A ${round(r * 0.25)} ${round(r * 0.25)} 0 1 1 ${round(r * 0.22)} ${round(r * 0.1)} A ${round(r * 0.14)} ${round(r * 0.14)} 0 1 1 ${round(-r * 0.05)} ${round(-r * 0.12)}`} fill="none" stroke={ROSE_DEEP} strokeWidth={round(r * 0.06)} opacity="0.8" />
    </g>
  );
}

function RoseBorder({ h }: { h: number }) {
  const rand = seeded(19);
  const spots: [number, number, number][] = [];
  const add = (x: number, y: number, r: number) => spots.push([x, y, r]);
  // Leaves first, then roses on top, all round the edge.
  const leaves: ReactNode[] = [];
  const perimeter = (t: number): [number, number, number] => {
    // walk the border: top → right → bottom → left
    const w = 100;
    const total = 2 * (w + h);
    let d = t * total;
    if (d < w) return [d, 5, 90];
    d -= w;
    if (d < h) return [95, d, 180];
    d -= h;
    if (d < w) return [w - d, h - 5, 270];
    d -= w;
    return [5, h - d, 0];
  };
  for (let i = 0; i < 70; i++) {
    const [x, y, a] = perimeter(i / 70);
    leaves.push(<Leaf key={i} x={x + (rand() - 0.5) * 4} y={y + (rand() - 0.5) * 4} angle={a + (rand() - 0.5) * 140} len={5 + rand() * 4} width={1.8} fill={FOLIAGE} opacity={0.75} />);
  }
  add(15, 13, 11);
  add(85, h - 12, 10);
  add(94, h * 0.36, 5.5);
  add(6, h * 0.52, 6);
  add(42, h - 4, 5);
  add(66, 5, 5);
  add(5, h * 0.82, 4.5);
  add(95, h * 0.62, 4.6);
  add(30, 3, 3.8);
  return (
    <Svg h={h}>
      {leaves}
      {spots.map(([x, y, r], i) => (
        <PaintedRose key={i} x={x} y={y} r={r} rotate={i * 47} />
      ))}
    </Svg>
  );
}

/** A faint repeat of outlined leaves for the card ground. */
function LeafPattern({ h }: { h: number }) {
  const items: ReactNode[] = [];
  for (let y = 4; y < h; y += 14) {
    for (let x = (y / 14) % 2 ? 4 : 11; x < 100; x += 14) {
      items.push(<LineLeaf key={`${x}-${y}`} x={x} y={y + 5} angle={((x + y) * 13) % 360} len={5} width={2} color="color-mix(in oklab, var(--inv-muted) 30%, transparent)" />);
    }
  }
  return <Svg h={h}>{items}</Svg>;
}

// ── Gardenias and watercolour leaves ────────────────────────────────────────

function Gardenia({ x, y, r, rotate = 0 }: { x: number; y: number; r: number; rotate?: number }) {
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${rotate})`}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={`o${i}`}
          d={`M0 0 C ${round(r * 0.5)} ${round(-r * 0.2)}, ${round(r * 0.55)} ${round(-r * 0.9)}, 0 ${round(-r)} C ${round(-r * 0.55)} ${round(-r * 0.9)}, ${round(-r * 0.5)} ${round(-r * 0.2)}, 0 0 Z`}
          fill={PETAL}
          stroke="color-mix(in oklab, var(--inv-fg) 22%, transparent)"
          strokeWidth="0.18"
          transform={`rotate(${i * 51.4})`}
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={`i${i}`} d={`M0 0 C ${round(r * 0.3)} ${round(-r * 0.15)}, ${round(r * 0.3)} ${round(-r * 0.5)}, 0 ${round(-r * 0.55)} C ${round(-r * 0.3)} ${round(-r * 0.5)}, ${round(-r * 0.3)} ${round(-r * 0.15)}, 0 0 Z`} fill={PETAL} stroke="color-mix(in oklab, var(--inv-fg) 18%, transparent)" strokeWidth="0.15" transform={`rotate(${i * 72 + 30})`} />
      ))}
      <circle r={round(r * 0.12)} fill="color-mix(in oklab, var(--inv-accent) 55%, var(--inv-muted))" />
    </g>
  );
}

function Fronds({ transform, seed, count = 9 }: { transform: string; seed: number; count?: number }) {
  const rand = seeded(seed);
  return (
    <g transform={transform}>
      <path d="M0 0 C 8 -10, 14 -22, 18 -36" fill="none" stroke={LEAF} strokeWidth="0.45" />
      {Array.from({ length: count }, (_, i) => {
        const t = 0.08 + (i / count) * 0.9;
        const x = 18 * t * t + 8 * t * (1 - t) * 2;
        const y = -36 * t;
        return <Leaf key={i} x={x} y={y} angle={(i % 2 ? 50 : -50) + (rand() - 0.5) * 20} len={8 - t * 3} width={2.4} opacity={0.55 + rand() * 0.35} />;
      })}
    </g>
  );
}

function GardeniaCorners({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <Fronds transform="translate(2 30) rotate(-34) scale(1.45)" seed={1} />
      <Fronds transform="translate(80 4) rotate(70) scale(1.2)" seed={2} count={7} />
      <Fronds transform={`translate(4 ${h - 2}) rotate(22) scale(1.25)`} seed={3} count={7} />
      <Fronds transform={`translate(96 ${h + 2}) rotate(-24) scale(1.45)`} seed={4} />
      <Gardenia x={86} y={11} r={12} rotate={10} />
      <Gardenia x={98} y={27} r={8} rotate={40} />
      <Gardenia x={12} y={h - 13} r={11.5} rotate={-20} />
      <Gardenia x={0} y={h - 28} r={7.5} rotate={15} />
      {[
        [78, 20],
        [80, 26],
        [22, h - 6],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="0.9" ry="1.6" fill={LEAF} opacity="0.7" transform={`rotate(30 ${x} ${y})`} />
      ))}
    </Svg>
  );
}

// ── Black line blooms for the photo half-cards ──────────────────────────────

function BloomCorners({ h }: { h: number }) {
  const cluster = (transform: string, key: string) => (
    <g key={key} transform={transform}>
      <LineBloom x={6} y={4} r={5} rotate={10} color={FG} />
      <LineBloom x={-2} y={13} r={3.6} rotate={40} color={FG} />
      <LineLeaf x={10} y={10} angle={140} len={7} width={2} color={FG} />
      <LineLeaf x={-4} y={4} angle={-60} len={6} width={1.8} color={FG} />
      <path d="M-2 13 C -4 20, -3 26, -6 32" fill="none" stroke={FG} strokeWidth="0.28" />
      <LineLeaf x={-4} y={24} angle={-120} len={5} width={1.6} color={FG} />
    </g>
  );
  return (
    <Svg h={h}>
      {cluster("translate(94 2)", "a")}
      {cluster(`translate(${100 - 4} ${h - 4}) rotate(180) scale(-1 1)`, "b")}
    </Svg>
  );
}

// ── Ornate crest (cartouche) ────────────────────────────────────────────────

/** A symmetrical cartouche of scrolls and leaves, framing initials. */
export function Cartouche({ className }: { className?: string }) {
  const half = (
    <g fill="none" stroke={ACCENT} strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 14 C 42 14, 36 18, 33 24 C 30 30, 31 44, 34 58 C 36 70, 33 82, 28 88 C 34 96, 42 100, 50 104" opacity="0.7" />
      <path d="M50 8 C 40 8, 32 12, 28 20 C 24 28, 18 30, 14 26 C 10 22, 14 16, 19 18" />
      <path d="M28 20 C 22 34, 22 48, 26 60 C 30 72, 26 84, 20 90 C 16 94, 12 90, 15 86 C 18 82, 23 86, 20 90" />
      <path d="M26 60 C 20 58, 14 62, 16 68 C 18 72, 22 70, 21 67" />
      <path d="M20 90 C 28 100, 40 104, 50 112" />
      <path d="M30 22 C 27 34, 27 48, 30 60 C 33 72, 30 82, 26 88" opacity="0.6" />
      <path d="M36 10 C 38 4, 44 2, 46 6 C 47 9, 44 11, 42 9" />
      <path d="M34 104 C 30 108, 31 113, 36 113 C 39 113, 40 110, 38 108" />
      {[
        [17, 40, -70],
        [15, 48, -100],
        [19, 76, -50],
        [36, 100, 200],
        [30, 6, -20],
      ].map(([x, y, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M0 0 C 2 -2, 2 -6, 0 -8 C -2 -6, -2 -2, 0 0 Z" />
          <path d="M0 0 L0 -7" opacity="0.6" />
        </g>
      ))}
      <path d="M44 4 C 46 0, 50 -1, 50 -1" />
    </g>
  );
  return (
    <svg aria-hidden viewBox="0 -4 100 120" className={className}>
      {half}
      <g transform="translate(100 0) scale(-1 1)">{half}</g>
      <circle cx="50" cy="2" r="1.6" fill={ACCENT} />
      <circle cx="50" cy="113" r="1.4" fill={ACCENT} />
    </svg>
  );
}

/** Watercolour roses and leaves for the twilight split-arch card. */
export function RoseSpray({ className, seed = 1 }: { className?: string; seed?: number }) {
  const rand = seeded(seed);
  return (
    <svg aria-hidden viewBox="0 0 60 40" className={className}>
      {Array.from({ length: 9 }, (_, i) => (
        <Leaf key={i} x={10 + rand() * 40} y={12 + rand() * 20} angle={rand() * 360} len={6 + rand() * 5} width={2.4} fill={i % 2 ? FOLIAGE : LEAF} opacity={0.75} />
      ))}
      <PaintedRose x={34} y={18} r={9} rotate={20} />
      <PaintedRose x={18} y={24} r={6} rotate={80} />
      <PaintedRose x={48} y={28} r={5} rotate={140} />
      <Blossom x={8} y={16} r={2.6} fill={ROSE} stroke={ROSE_DEEP} width={0.2} />
      <Blossom x={54} y={12} r={2.2} rotate={30} fill={ROSE} stroke={ROSE_DEEP} width={0.2} />
    </svg>
  );
}

/** Motifs from this file, by ornament name; null when not one of them. */
export function Motif({ kind, h, shape }: { kind: string; h: number; shape: CardShape }): ReactNode | undefined {
  switch (kind) {
    case "tulips-lace":
      return <TulipsLace h={h} />;
    case "curls":
      return <Curls h={h} />;
    case "line-garden":
      return <LineGarden h={h} />;
    case "gold-leaves":
      return <GoldLeaves h={h} />;
    case "calla":
      return <CallaBorder h={h} shape={shape} />;
    case "rose-border":
      return (
        <>
          <Svg h={h}>
            <rect width="100" height={h} fill="var(--inv-bg)" />
          </Svg>
          <LeafPattern h={h} />
          <RoseBorder h={h} />
        </>
      );
    case "gardenia":
      return <GardeniaCorners h={h} />;
    case "bloom-corners":
      return <BloomCorners h={h} />;
    default:
      return undefined;
  }
}

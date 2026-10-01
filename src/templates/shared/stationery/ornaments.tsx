import type { CSSProperties, ReactNode } from "react";
import type { CardShape, StationeryOrnament } from "@/core/template/manifest";
import { Motif } from "./motifs";

/**
 * Original line-art motifs for stationery cards. Everything is drawn here,
 * procedurally, in the theme's own colours (--inv-accent, --inv-fg,
 * --inv-muted, --inv-border) — no image files, no third-party artwork.
 *
 * Coordinates: the card is 100 units wide and `h` units tall (140 for
 * portrait and arch, 100 for square). An arch card's top is a semicircle
 * centred at (50, 50).
 */

export const ACCENT = "var(--inv-accent)";
export const FG = "var(--inv-fg)";
export const MUTED = "var(--inv-muted)";
export const LEAF = "color-mix(in oklab, var(--inv-accent) 55%, var(--inv-muted))";

/** Border path inset from the card edge, following the card's shape. */
export function framePath(inset: number, h: number, shape: CardShape): string {
  const r = 50 - inset;
  if (shape === "arch") return `M${inset} ${h - inset} V50 A${r} ${r} 0 0 1 ${100 - inset} 50 V${h - inset} Z`;
  if (shape === "corner") {
    const c = 60 - inset;
    return `M${inset} ${inset} H${100 - inset - c} A${c} ${c} 0 0 1 ${100 - inset} ${inset + c} V${h - inset} H${inset} Z`;
  }
  return `M${inset} ${inset} H${100 - inset} V${h - inset} H${inset} Z`;
}

/** Small deterministic pseudo-random sequence, so art is identical on server and client. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const round = (n: number) => Math.round(n * 100) / 100;

export function Svg({ h, children, style }: { h: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox={`0 0 100 ${h}`} className="pointer-events-none absolute inset-0 size-full" style={style}>
      {children}
    </svg>
  );
}

export function Frame({ inset, h, shape, width = 0.3, color = ACCENT, opacity = 0.7, dash }: { inset: number; h: number; shape: CardShape; width?: number; color?: string; opacity?: number; dash?: string }) {
  return <path d={framePath(inset, h, shape)} fill="none" stroke={color} strokeWidth={width} opacity={opacity} strokeDasharray={dash} strokeLinecap="round" />;
}

/** The four corners (arch cards have only the bottom two). */
function corners(h: number, shape: CardShape, inset: number): [number, number, number][] {
  const bottom: [number, number, number][] = [
    [100 - inset, h - inset, 180],
    [inset, h - inset, 270],
  ];
  if (shape === "arch") return bottom;
  if (shape === "corner") return [[inset, inset, 0], ...bottom];
  return [[inset, inset, 0], [100 - inset, inset, 90], ...bottom];
}

// ── Botanical pieces ────────────────────────────────────────────────────────

export function Blossom({ x, y, r, petals = 5, rotate = 0, fill = "none", stroke = ACCENT, width = 0.3 }: { x: number; y: number; r: number; petals?: number; rotate?: number; fill?: string; stroke?: string; width?: number }) {
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${rotate})`} fill={fill} stroke={stroke} strokeWidth={width}>
      {Array.from({ length: petals }, (_, i) => (
        <ellipse key={i} cx="0" cy={round(-r * 0.62)} rx={round(r * 0.42)} ry={round(r * 0.62)} transform={`rotate(${round((360 / petals) * i)})`} />
      ))}
      <circle r={round(r * 0.22)} fill={stroke} stroke="none" />
    </g>
  );
}

export function Leaf({ x, y, angle, len, width, fill = LEAF, opacity = 0.85 }: { x: number; y: number; angle: number; len: number; width: number; fill?: string; opacity?: number }) {
  // A pointed leaf whose base sits at (x, y), pointing along `angle`.
  return (
    <path
      d={`M0 0 C ${round(width)} ${round(-len * 0.3)}, ${round(width * 0.6)} ${round(-len * 0.8)}, 0 ${round(-len)} C ${round(-width * 0.6)} ${round(-len * 0.8)}, ${round(-width)} ${round(-len * 0.3)}, 0 0 Z`}
      transform={`translate(${round(x)} ${round(y)}) rotate(${round(angle)})`}
      fill={fill}
      opacity={opacity}
    />
  );
}

/** Leaves along a quadratic curve from p0 to p2 (control p1). */
export function LeafyStem({ p0, p1, p2, count, len, width, stroke = LEAF, fill = LEAF, alternate = true, roundLeaves = false }: { p0: [number, number]; p1: [number, number]; p2: [number, number]; count: number; len: number; width: number; stroke?: string; fill?: string; alternate?: boolean; roundLeaves?: boolean }) {
  const at = (t: number): [number, number] => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
  ];
  const tangent = (t: number) => {
    const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  const leaves = Array.from({ length: count }, (_, i) => {
    const t = 0.12 + (0.86 * i) / Math.max(1, count - 1);
    const [x, y] = at(t);
    const side = alternate ? (i % 2 ? 1 : -1) : 1;
    const a = tangent(t) + 90 + side * 50;
    const scale = 1 - t * 0.35;
    return roundLeaves ? (
      <ellipse key={i} cx={round(x + Math.cos(((a - 90) * Math.PI) / 180) * len * 0.45 * scale)} cy={round(y + Math.sin(((a - 90) * Math.PI) / 180) * len * 0.45 * scale)} rx={round(width * scale)} ry={round(width * 0.85 * scale)} fill={fill} opacity={0.75} />
    ) : (
      <Leaf key={i} x={x} y={y} angle={a} len={len * scale} width={width * scale} fill={fill} />
    );
  });
  return (
    <g>
      <path d={`M${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} fill="none" stroke={stroke} strokeWidth="0.35" />
      {leaves}
    </g>
  );
}

function FloralSpray(props: { transform: string }) {
  return (
    <g {...props} fill="none" stroke={ACCENT} strokeWidth="0.35" opacity="0.9">
      <path d="M2 36 C 12 26, 20 16, 36 4" />
      <path d="M4 30 C 10 30, 14 26, 15 22 C 11 22, 7 25, 4 30 Z" />
      <path d="M18 18 C 24 19, 27 16, 29 12 C 24 12, 20 14, 18 18 Z" />
      <path d="M10 26 C 8 20, 9 15, 13 12 C 14 17, 13 22, 10 26 Z" />
      <Blossom x={34} y={6} r={4.4} />
      <Blossom x={22} y={13} r={3.2} rotate={20} />
      <Blossom x={6} y={33} r={3.6} rotate={40} />
    </g>
  );
}

export function Rose({ x, y, r, rotate = 0 }: { x: number; y: number; r: number; rotate?: number }) {
  // A rose drawn as a loose spiral of petals.
  const petals = [
    `M${-r * 0.3} 0 A ${r * 0.3} ${r * 0.3} 0 1 1 ${r * 0.3} 0`,
    `M${-r * 0.55} ${r * 0.1} A ${r * 0.55} ${r * 0.5} 0 0 0 ${r * 0.55} ${r * 0.1}`,
    `M${-r * 0.5} ${-r * 0.2} A ${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.45} ${-r * 0.45}`,
    `M${-r * 0.85} ${-r * 0.05} A ${r * 0.85} ${r * 0.8} 0 0 0 ${r * 0.2} ${r * 0.85}`,
    `M${r * 0.85} ${-r * 0.1} A ${r * 0.85} ${r * 0.85} 0 0 1 ${r * 0.1} ${r * 0.85}`,
    `M${-r * 0.8} ${-r * 0.35} A ${r * 0.9} ${r * 0.9} 0 0 1 ${r * 0.8} ${-r * 0.45}`,
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <circle r={r} fill={ACCENT} opacity="0.14" />
      <g fill="none" stroke={ACCENT} strokeWidth="0.4" strokeLinecap="round">
        {petals.map((d, i) => (
          <path key={i} d={d.replace(/-?\d+\.\d+/g, (n) => String(round(Number(n))))} />
        ))}
      </g>
    </g>
  );
}

function RoseCluster(props: { transform: string }) {
  return (
    <g {...props}>
      <LeafyStem p0={[2, 30]} p1={[6, 14]} p2={[26, 4]} count={4} len={7} width={2.4} />
      <LeafyStem p0={[4, 8]} p1={[18, 10]} p2={[34, 2]} count={3} len={6} width={2} />
      <Rose x={12} y={12} r={7} />
      <Rose x={24} y={6} r={4.6} rotate={60} />
      <Rose x={5} y={24} r={4} rotate={140} />
      <circle cx="30" cy="12" r="0.9" fill={ACCENT} opacity="0.7" />
      <circle cx="33" cy="9" r="0.7" fill={ACCENT} opacity="0.6" />
      <circle cx="15" cy="23" r="0.8" fill={ACCENT} opacity="0.6" />
    </g>
  );
}

// ── Motifs ──────────────────────────────────────────────────────────────────

function Garland({ h }: { h: number }) {
  // An oval wreath of leaves and blossoms around the words.
  const cx = 50;
  const cy = h / 2;
  const rx = 41;
  const ry = h / 2 - 9;
  const n = 46;
  const items: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = cx + rx * Math.cos(t);
    const y = cy + ry * Math.sin(t);
    const tangent = (Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) * 180) / Math.PI;
    const side = i % 2 ? 1 : -1;
    items.push(<Leaf key={`l${i}`} x={x} y={y} angle={tangent + 90 + side * 55} len={5.2} width={1.9} />);
  }
  const blossoms = [0.07, 0.2, 0.33, 0.43, 0.57, 0.7, 0.83, 0.93].map((f, i) => {
    const t = f * Math.PI * 2;
    return <Blossom key={`b${i}`} x={cx + rx * Math.cos(t)} y={cy + ry * Math.sin(t)} r={i % 2 ? 2.6 : 3.4} rotate={i * 17} fill={`color-mix(in oklab, ${ACCENT} 18%, transparent)`} width={0.35} />;
  });
  return (
    <Svg h={h}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={LEAF} strokeWidth="0.3" />
      {items}
      {blossoms}
    </Svg>
  );
}

function Stems({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <LeafyStem p0={[9, h - 4]} p1={[4, h * 0.55]} p2={[13, h * 0.12]} count={9} len={7} width={2.2} />
      <LeafyStem p0={[91, h - 4]} p1={[96, h * 0.55]} p2={[87, h * 0.12]} count={9} len={7} width={2.2} />
      <Blossom x={13} y={h * 0.12} r={3.6} fill={`color-mix(in oklab, ${ACCENT} 22%, transparent)`} />
      <Blossom x={87} y={h * 0.12} r={3.6} rotate={30} fill={`color-mix(in oklab, ${ACCENT} 22%, transparent)`} />
    </Svg>
  );
}

function Wildflowers({ h }: { h: number }) {
  const rand = seeded(7);
  const stems: ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const x = 3 + (i * 94) / 25 + (rand() - 0.5) * 3;
    const height = 10 + rand() * 20 * (i % 3 === 0 ? 1.2 : 0.8);
    const top = h - 2 - height;
    const lean = (rand() - 0.5) * 8;
    const kind = i % 4;
    stems.push(
      <g key={i}>
        <path d={`M${round(x)} ${h} Q ${round(x + lean * 0.3)} ${round(top + height * 0.5)} ${round(x + lean)} ${round(top)}`} fill="none" stroke={LEAF} strokeWidth="0.3" />
        {kind === 0 ? <Blossom x={x + lean} y={top} r={2.4} rotate={i * 23} fill={`color-mix(in oklab, ${ACCENT} 30%, transparent)`} width={0.25} /> : null}
        {kind === 1 ? <circle cx={round(x + lean)} cy={round(top)} r="1.1" fill={ACCENT} opacity="0.75" /> : null}
        {kind === 2 ? <Leaf x={x + lean * 0.5} y={top + height * 0.45} angle={lean > 0 ? 40 : -40} len={5} width={1.6} /> : null}
        {kind === 3 ? (
          <g>
            {[0, 1, 2].map((k) => (
              <ellipse key={k} cx={round(x + lean + (k - 1) * 0.9)} cy={round(top + k * 1.6)} rx="0.7" ry="1.1" fill={ACCENT} opacity={0.5 + k * 0.15} />
            ))}
          </g>
        ) : null}
      </g>,
    );
  }
  return <Svg h={h}>{stems}</Svg>;
}

function Wreath({ size = 40 }: { size?: number }) {
  // Laurel wreath drawn inline around a monogram, open at the top. The left
  // branch is drawn once and mirrored for the right.
  const c = size / 2;
  const r = size * 0.42;
  const leaves: ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const deg = 100 + i * 18;
    const t = (deg * Math.PI) / 180;
    const heading = (Math.atan2(Math.cos(t), -Math.sin(t)) * 180) / Math.PI;
    const side = i % 2 ? 1 : -1;
    leaves.push(<Leaf key={i} x={c + r * Math.cos(t)} y={c + r * Math.sin(t)} angle={heading + 90 + side * 38} len={size * 0.15 * (1 - i * 0.04)} width={size * 0.05} fill={ACCENT} opacity={0.8} />);
  }
  const start = (100 * Math.PI) / 180;
  const end = (262 * Math.PI) / 180;
  const branch = (
    <g>
      <path d={`M${round(c + r * Math.cos(start))} ${round(c + r * Math.sin(start))} A ${round(r)} ${round(r)} 0 0 1 ${round(c + r * Math.cos(end))} ${round(c + r * Math.sin(end))}`} fill="none" stroke={ACCENT} strokeWidth={size * 0.01} opacity="0.7" />
      {leaves}
    </g>
  );
  return (
    <svg aria-hidden viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 size-full overflow-visible">
      {branch}
      <g transform={`translate(${size} 0) scale(-1 1)`}>{branch}</g>
    </svg>
  );
}

function Deco({ h, shape }: { h: number; shape: CardShape }) {
  const fan = (
    <g fill="none" stroke={ACCENT} strokeWidth="0.35">
      {[6, 10, 14].map((r) => (
        <path key={r} d={`M${r} 0 A ${r} ${r} 0 0 1 0 ${r}`} />
      ))}
      {[15, 30, 45, 60, 75].map((a) => (
        <line key={a} x1="0" y1="0" x2={round(14 * Math.cos((a * Math.PI) / 180))} y2={round(14 * Math.sin((a * Math.PI) / 180))} />
      ))}
    </g>
  );
  return (
    <Svg h={h}>
      <Frame inset={4} h={h} shape={shape} width={0.7} opacity={0.9} />
      <Frame inset={6.5} h={h} shape={shape} width={0.25} opacity={0.9} />
      {corners(h, shape, 6.5).map(([x, y, r]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
          {fan}
        </g>
      ))}
      {/* stepped sunburst at the top */}
      <g transform={`translate(50 ${shape === "arch" ? 12 : 10})`} fill="none" stroke={ACCENT} strokeWidth="0.35">
        {[-60, -40, -20, 0, 20, 40, 60].map((a) => (
          <line key={a} x1="0" y1="8" x2={round(10 * Math.sin((a * Math.PI) / 180))} y2={round(8 - 10 * Math.cos((a * Math.PI) / 180))} />
        ))}
        <path d="M-5 8 A5 5 0 0 1 5 8" />
        <path d="M-14 8 H14" />
      </g>
      <g transform={`translate(50 ${h - 10})`} fill={ACCENT}>
        <path d="M-3 0 L0 -3 L3 0 L0 3 Z" />
        <path d="M-16 0 H-5 M5 0 H16" stroke={ACCENT} strokeWidth="0.35" />
      </g>
    </Svg>
  );
}

function Scallop({ h, shape }: { h: number; shape: CardShape }) {
  if (shape === "arch") {
    return (
      <Svg h={h}>
        <Frame inset={5} h={h} shape={shape} width={1.4} dash="0 3" opacity={0.8} />
        <Frame inset={8} h={h} shape={shape} width={0.25} />
      </Svg>
    );
  }
  const r = 2.5;
  const inset = 6;
  const segs: string[] = [];
  const nx = Math.round((100 - inset * 2) / (r * 2));
  const ny = Math.round((h - inset * 2) / (r * 2));
  const sx = (100 - inset * 2) / nx;
  const sy = (h - inset * 2) / ny;
  let d = `M${inset} ${inset}`;
  for (let i = 0; i < nx; i++) d += ` a ${round(sx / 2)} ${round(sx / 2)} 0 0 1 ${round(sx)} 0`;
  for (let i = 0; i < ny; i++) d += ` a ${round(sy / 2)} ${round(sy / 2)} 0 0 1 0 ${round(sy)}`;
  for (let i = 0; i < nx; i++) d += ` a ${round(sx / 2)} ${round(sx / 2)} 0 0 1 ${round(-sx)} 0`;
  for (let i = 0; i < ny; i++) d += ` a ${round(sy / 2)} ${round(sy / 2)} 0 0 1 0 ${round(-sy)}`;
  segs.push(d);
  return (
    <Svg h={h}>
      <path d={segs[0]} fill="none" stroke={ACCENT} strokeWidth="0.4" opacity="0.85" />
      <Frame inset={9.5} h={h} shape={shape} width={0.8} dash="0 2.2" opacity={0.7} />
    </Svg>
  );
}

function Olive({ h }: { h: number }) {
  const branch = (flip: boolean, y: number) => {
    const s = flip ? -1 : 1;
    const x0 = 50 - s * 4;
    return (
      <g>
        <LeafyStem p0={[x0, y]} p1={[50 - s * 20, y - 8]} p2={[50 - s * 40, y + 2]} count={10} len={6.5} width={1.3} />
        {[0.35, 0.6, 0.82].map((t, i) => (
          <ellipse key={i} cx={round(50 - s * (6 + t * 32))} cy={round(y - 4 + i * 1.4)} rx="1.3" ry="1.7" fill={ACCENT} opacity="0.7" />
        ))}
      </g>
    );
  };
  return (
    <Svg h={h}>
      {branch(false, 16)}
      {branch(true, 16)}
      <g transform={`translate(0 ${h}) scale(1 -1)`} opacity="0.7">
        {branch(false, 12)}
        {branch(true, 12)}
      </g>
    </Svg>
  );
}

function Celestial({ h }: { h: number }) {
  const rand = seeded(11);
  const stars: ReactNode[] = [];
  for (let i = 0; i < 34; i++) {
    const x = rand() * 100;
    const edge = rand() < 0.5 ? rand() * h * 0.22 : h - rand() * h * 0.2;
    const y = i % 3 === 0 ? rand() * h : edge;
    if (x > 20 && x < 80 && y > h * 0.25 && y < h * 0.8) continue;
    const s = 0.5 + rand() * 1.6;
    stars.push(
      i % 2 ? (
        <path key={i} d={`M0 ${-s} Q0 0 ${s} 0 Q0 0 0 ${s} Q0 0 ${-s} 0 Q0 0 0 ${-s} Z`} transform={`translate(${round(x)} ${round(y)})`} fill={ACCENT} opacity={0.6 + rand() * 0.4} />
      ) : (
        <circle key={i} cx={round(x)} cy={round(y)} r={round(s * 0.25)} fill={ACCENT} opacity="0.7" />
      ),
    );
  }
  return (
    <Svg h={h}>
      {stars}
      <path d="M50 8 a7 7 0 1 0 6 11 a5.5 5.5 0 1 1 -6 -11 Z" transform="translate(-3 0)" fill={ACCENT} opacity="0.9" />
    </Svg>
  );
}

function Confetti({ h }: { h: number }) {
  const rand = seeded(23);
  const bits: ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const x = rand() * 100;
    const y = rand() * h;
    const inCenter = x > 14 && x < 86 && y > h * 0.18 && y < h * 0.82;
    if (inCenter) continue;
    const color = i % 3 === 0 ? FG : i % 3 === 1 ? ACCENT : MUTED;
    const s = 0.6 + rand() * 1.4;
    bits.push(
      i % 4 === 0 ? (
        <rect key={i} x={round(x)} y={round(y)} width={round(s * 1.6)} height={round(s * 0.6)} transform={`rotate(${round(rand() * 180)} ${round(x)} ${round(y)})`} fill={color} opacity="0.7" />
      ) : (
        <circle key={i} cx={round(x)} cy={round(y)} r={round(s * 0.7)} fill={color} opacity={i % 2 ? 0.8 : 0.45} />
      ),
    );
  }
  return <Svg h={h}>{bits}</Svg>;
}

function Tile({ h, shape }: { h: number; shape: CardShape }) {
  const tile = (x: number, y: number, key: string) => (
    <g key={key} transform={`translate(${x} ${y})`}>
      <rect width="16" height="16" fill={`color-mix(in oklab, ${ACCENT} 12%, transparent)`} stroke={ACCENT} strokeWidth="0.35" />
      <circle cx="8" cy="8" r="2" fill={ACCENT} />
      {[0, 90, 180, 270].map((a) => (
        <ellipse key={a} cx="8" cy="3.8" rx="1.5" ry="2.6" fill="none" stroke={ACCENT} strokeWidth="0.4" transform={`rotate(${a} 8 8)`} />
      ))}
      {[45, 135, 225, 315].map((a) => (
        <path key={a} d="M8 0.8 L9 2.2 L8 3.6 L7 2.2 Z" fill={ACCENT} opacity="0.7" transform={`rotate(${a} 8 8)`} />
      ))}
      {[
        [0, 0],
        [16, 0],
        [0, 16],
        [16, 16],
      ].map(([cx, cy]) => (
        <path key={`${cx}${cy}`} d={`M${cx} ${cy} m-2.6 0 a2.6 2.6 0 0 0 5.2 0 a2.6 2.6 0 0 0 -5.2 0`} fill={ACCENT} opacity="0.35" />
      ))}
    </g>
  );
  const row = (y: number, prefix: string) => Array.from({ length: 6 }, (_, i) => tile(2 + i * 16, y, `${prefix}${i}`));
  return (
    <Svg h={h}>
      {shape === "arch" ? null : row(2, "t")}
      {row(h - 18, "b")}
      {shape === "arch" ? <Frame inset={5} h={h - 16} shape={shape} width={0.3} opacity={0.6} /> : <line x1="2" x2="98" y1="21" y2="21" stroke={ACCENT} strokeWidth="0.3" opacity="0.6" />}
      <line x1="2" x2="98" y1={h - 21} y2={h - 21} stroke={ACCENT} strokeWidth="0.3" opacity="0.6" />
    </Svg>
  );
}

function Ribbon() {
  // A satin bow, drawn inline above the names.
  return (
    <svg aria-hidden viewBox="0 0 60 30" className="mx-auto h-[12cqmin] w-auto">
      <g fill={`color-mix(in oklab, ${ACCENT} 20%, transparent)`} stroke={ACCENT} strokeWidth="0.6" strokeLinejoin="round">
        <path d="M30 13 C 22 3, 8 2, 7 9 C 6 16, 20 17, 30 14 Z" />
        <path d="M30 13 C 38 3, 52 2, 53 9 C 54 16, 40 17, 30 14 Z" />
        <path d="M28 15 C 24 20, 19 25, 14 29 L 19 28 L 21 30 C 25 25, 28 20, 29.5 16 Z" />
        <path d="M32 15 C 36 20, 41 25, 46 29 L 41 28 L 39 30 C 35 25, 32 20, 30.5 16 Z" />
        <ellipse cx="30" cy="14" rx="3" ry="3.4" fill={ACCENT} />
      </g>
      <path d="M11 8 C 17 7, 23 9, 27 12 M49 8 C 43 7, 37 9, 33 12" fill="none" stroke={ACCENT} strokeWidth="0.35" opacity="0.7" />
    </svg>
  );
}

function Citrus({ h }: { h: number }) {
  const lemon = (x: number, y: number, r: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M${-r} 0 C ${-r} ${-r * 0.75}, ${r} ${-r * 0.75}, ${r} 0 C ${r} ${r * 0.75}, ${-r} ${r * 0.75}, ${-r} 0 Z`} fill={ACCENT} />
      <path d={`M${r} 0 l ${r * 0.18} ${-r * 0.1} l 0 ${r * 0.2} Z M${-r} 0 l ${-r * 0.18} ${-r * 0.1} l 0 ${r * 0.2} Z`} fill={ACCENT} />
      <ellipse cx={-r * 0.3} cy={-r * 0.25} rx={r * 0.35} ry={r * 0.14} fill="white" opacity="0.35" />
    </g>
  );
  const cluster = (
    <g>
      <Leaf x={12} y={12} angle={40} len={14} width={4.4} fill={MUTED} opacity={0.8} />
      <Leaf x={12} y={12} angle={100} len={12} width={4} fill={MUTED} opacity={0.65} />
      <Leaf x={12} y={12} angle={160} len={10} width={3.6} fill={MUTED} opacity={0.75} />
      <path d="M0 4 Q 8 6, 12 12" fill="none" stroke={MUTED} strokeWidth="0.5" />
      {lemon(18, 22, 6, 30)}
      {lemon(28, 12, 5, -20)}
      <Blossom x={8} y={24} r={2.4} stroke={MUTED} fill="white" width={0.3} />
    </g>
  );
  return (
    <Svg h={h}>
      <g transform="translate(100 0) scale(-1 1)">{cluster}</g>
      <g transform={`translate(0 ${h}) scale(1 -1)`}>{cluster}</g>
    </Svg>
  );
}

function FlourishLine({ flip = false }: { flip?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 80 12" className="mx-auto h-[5cqmin] w-auto" style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <path
        d="M4 8 C 14 2, 24 2, 30 6 C 34 9, 38 9, 40 6 C 42 3, 38 1, 36 4 M76 8 C 66 2, 56 2, 50 6 C 46 9, 42 9, 40 6 C 38 3, 42 1, 44 4"
        fill="none"
        stroke={ACCENT}
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <circle cx="40" cy="10" r="0.9" fill={ACCENT} />
    </svg>
  );
}

function Twine({ h, shape }: { h: number; shape: CardShape }) {
  return (
    <Svg h={h}>
      <Frame inset={5} h={h} shape={shape} width={0.35} dash="1.6 1.2" color={FG} opacity={0.45} />
      <path d={`M-2 ${shape === "arch" ? 60 : 16} Q 50 ${shape === "arch" ? 70 : 26} 102 ${shape === "arch" ? 60 : 16}`} fill="none" stroke={ACCENT} strokeWidth="0.7" strokeDasharray="2 0.6" />
      <g transform={`translate(50 ${shape === "arch" ? 65 : 21})`} fill="none" stroke={ACCENT} strokeWidth="0.6">
        <path d="M0 0 C -4 -5, -9 -3, -7 1 C -5 4, -2 2, 0 0 Z" />
        <path d="M0 0 C 4 -5, 9 -3, 7 1 C 5 4, 2 2, 0 0 Z" />
        <path d="M0 0 L -3 7 M0 0 L 3 7" />
      </g>
    </Svg>
  );
}

function Cascade({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <LeafyStem p0={[-2, 4]} p1={[20, 8]} p2={[34, 30]} count={9} len={8} width={2.8} roundLeaves />
      <LeafyStem p0={[-2, 16]} p1={[10, 26]} p2={[12, 46]} count={7} len={8} width={2.6} roundLeaves />
      <LeafyStem p0={[8, -2]} p1={[30, 2]} p2={[48, 12]} count={7} len={7} width={2.2} roundLeaves />
      <g transform={`translate(100 ${h}) rotate(180)`} opacity="0.85">
        <LeafyStem p0={[-2, 4]} p1={[16, 8]} p2={[26, 24]} count={7} len={7} width={2.4} roundLeaves />
        <LeafyStem p0={[4, -2]} p1={[22, 2]} p2={[36, 10]} count={6} len={6} width={2} roundLeaves />
      </g>
    </Svg>
  );
}

function Ornate({ h, shape }: { h: number; shape: CardShape }) {
  const curl = (
    <g fill="none" stroke={ACCENT} strokeWidth="0.4" strokeLinecap="round">
      <path d="M0 14 C 0 5, 5 0, 14 0" />
      <path d="M3 18 C 3 8, 8 3, 18 3" />
      <path d="M14 0 C 18 0, 20 3, 18 5 C 16 7, 13 5, 15 3.5" />
      <path d="M0 14 C 0 18, 3 20, 5 18 C 7 16, 5 13, 3.5 15" />
      <circle cx="6" cy="6" r="1.1" fill={ACCENT} />
    </g>
  );
  return (
    <Svg h={h}>
      <Frame inset={5} h={h} shape={shape} width={0.6} opacity={0.85} />
      <Frame inset={7.5} h={h} shape={shape} width={0.2} opacity={0.85} />
      {corners(h, shape, 7.5).map(([x, y, r]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
          {curl}
        </g>
      ))}
      {shape === "arch" ? null : (
        <g transform="translate(50 7.5)" fill="none" stroke={ACCENT} strokeWidth="0.4">
          <path d="M-12 0 C -8 5, -3 5, 0 2 C 3 5, 8 5, 12 0" />
          <circle cx="0" cy="5" r="1" fill={ACCENT} />
        </g>
      )}
      <g transform={`translate(50 ${h - 7.5}) scale(1 -1)`} fill="none" stroke={ACCENT} strokeWidth="0.4">
        <path d="M-12 0 C -8 5, -3 5, 0 2 C 3 5, 8 5, 12 0" />
        <circle cx="0" cy="5" r="1" fill={ACCENT} />
      </g>
    </Svg>
  );
}

function Petals({ h }: { h: number }) {
  const rand = seeded(5);
  const petals: ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const x = rand() * 100;
    const y = rand() * h * 0.5 * (i % 5 === 0 ? 2 : 1);
    if (x > 18 && x < 82 && y > h * 0.22 && y < h * 0.82) continue;
    const s = 1.2 + rand() * 1.8;
    petals.push(
      <path
        key={i}
        d={`M0 0 C ${s} ${-s}, ${s * 2} ${-s * 0.2}, ${s * 1.6} ${s} C ${s} ${s * 1.4}, 0 ${s}, 0 0 Z`}
        transform={`translate(${round(x)} ${round(y)}) rotate(${round(rand() * 360)})`}
        fill={ACCENT}
        opacity={round(0.3 + rand() * 0.5)}
      />,
    );
  }
  return <Svg h={h}>{petals}</Svg>;
}

/** Soft colour washes, like watercolour blooms, in the accent colour. */
function Watercolor() {
  const wash = (className: string, strength: number) => (
    <div
      className={`absolute rounded-full ${className}`}
      style={{ background: `radial-gradient(closest-side, color-mix(in oklab, var(--inv-accent) ${strength}%, transparent), transparent)` }}
    />
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {wash("-left-[18%] -top-[12%] size-[70%]", 42)}
      {wash("left-[22%] -top-[18%] size-[46%]", 26)}
      {wash("-bottom-[14%] -right-[16%] size-[72%]", 40)}
      {wash("-bottom-[8%] right-[30%] size-[40%]", 22)}
    </div>
  );
}

// ── Fine line florals (drawn with a pen, no fills) ──────────────────────────

export const LINE = { fill: "none", stroke: ACCENT, strokeWidth: 0.28, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** A layered peony in outline: rings of ruffled petals around a small heart. */
export function LinePeony({ x, y, r, rotate = 0, color = ACCENT }: { x: number; y: number; r: number; rotate?: number; color?: string }) {
  const rings: ReactNode[] = [];
  [0.34, 0.62, 0.92].forEach((k, ring) => {
    const n = 5 + ring * 2;
    for (let i = 0; i < n; i++) {
      const a0 = ((i / n) * 360 + ring * 17) * (Math.PI / 180);
      const a1 = (((i + 1) / n) * 360 + ring * 17) * (Math.PI / 180);
      const rr = r * k;
      const [x0, y0] = [Math.cos(a0) * rr * 0.55, Math.sin(a0) * rr * 0.55];
      const [x1, y1] = [Math.cos(a1) * rr * 0.55, Math.sin(a1) * rr * 0.55];
      const am = (a0 + a1) / 2;
      const [cx, cy] = [Math.cos(am) * rr * 1.25, Math.sin(am) * rr * 1.25];
      // A petal with a small notch at its tip, for a ruffled edge.
      const [nx, ny] = [Math.cos(am) * rr * 0.98, Math.sin(am) * rr * 0.98];
      rings.push(
        <path
          key={`${ring}-${i}`}
          d={`M${round(x0)} ${round(y0)} Q ${round((x0 + cx) / 2 + Math.cos(a0) * rr * 0.2)} ${round((y0 + cy) / 2 + Math.sin(a0) * rr * 0.2)} ${round(nx)} ${round(ny)} Q ${round((x1 + cx) / 2 + Math.cos(a1) * rr * 0.2)} ${round((y1 + cy) / 2 + Math.sin(a1) * rr * 0.2)} ${round(x1)} ${round(y1)}`}
        />,
      );
    }
  });
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${rotate})`} {...LINE} stroke={color}>
      {rings}
      {[0, 72, 144, 216, 288].map((a) => (
        <line key={a} x1="0" y1="0" x2={round(Math.cos((a * Math.PI) / 180) * r * 0.16)} y2={round(Math.sin((a * Math.PI) / 180) * r * 0.16)} />
      ))}
    </g>
  );
}

/** A leaf in outline with its midrib. */
export function LineLeaf({ x, y, angle, len, width, color = ACCENT }: { x: number; y: number; angle: number; len: number; width: number; color?: string }) {
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${round(angle)})`} {...LINE} stroke={color}>
      <path d={`M0 0 C ${round(width)} ${round(-len * 0.3)}, ${round(width * 0.6)} ${round(-len * 0.8)}, 0 ${round(-len)} C ${round(-width * 0.6)} ${round(-len * 0.8)}, ${round(-width)} ${round(-len * 0.3)}, 0 0 Z`} />
      <path d={`M0 0 L0 ${round(-len * 0.85)}`} opacity="0.7" />
    </g>
  );
}

/** A simple five-petal flower in outline. */
export function LineBloom({ x, y, r, rotate = 0, color = ACCENT }: { x: number; y: number; r: number; rotate?: number; color?: string }) {
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${round(rotate)})`} {...LINE} stroke={color}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M0 0 C ${round(r * 0.5)} ${round(-r * 0.3)}, ${round(r * 0.45)} ${round(-r)}, 0 ${round(-r)} C ${round(-r * 0.45)} ${round(-r)}, ${round(-r * 0.5)} ${round(-r * 0.3)}, 0 0`} transform={`rotate(${i * 72})`} />
      ))}
      <circle r={round(r * 0.18)} />
    </g>
  );
}

/** A corner cluster of peonies, buds and leaves in fine line. */
function PeonyCluster(props: { transform: string }) {
  return (
    <g {...props}>
      <LineLeaf x={20} y={20} angle={-20} len={16} width={4} />
      <LineLeaf x={20} y={20} angle={100} len={14} width={3.6} />
      <LineLeaf x={10} y={6} angle={60} len={11} width={3} />
      <path d="M-2 34 C 8 26, 12 22, 20 20 C 28 18, 34 10, 40 -2" {...LINE} />
      <LinePeony x={18} y={16} r={11} />
      <LinePeony x={4} y={30} r={6.5} rotate={40} />
      <LinePeony x={34} y={4} r={5.5} rotate={80} />
      <LineBloom x={30} y={24} r={2.6} rotate={20} />
      <circle cx="40" cy="14" r="0.7" fill={ACCENT} opacity="0.7" />
      <circle cx="12" cy="36" r="0.6" fill={ACCENT} opacity="0.6" />
    </g>
  );
}

function PeonyCorners({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <PeonyCluster transform="translate(104 -6) scale(-1.05 1.05)" />
      <PeonyCluster transform={`translate(-4 ${h + 6}) scale(1.05 -1.05)`} />
    </Svg>
  );
}

/** A band of line roses, blooms and leaves along a straight run (0…len). */
function LineBand({ len, seed, depth = 12 }: { len: number; seed: number; depth?: number }) {
  const rand = seeded(seed);
  const out: ReactNode[] = [];
  let x = 2;
  let i = 0;
  while (x < len - 2) {
    const y = depth * (0.35 + rand() * 0.3);
    const kind = i % 3;
    if (kind === 0) out.push(<LinePeony key={i} x={x} y={y} r={3.6 + rand() * 1.4} rotate={rand() * 90} />);
    if (kind === 1) {
      out.push(<LineLeaf key={`${i}a`} x={x} y={y + 2} angle={-50 + rand() * 30} len={6} width={1.8} />);
      out.push(<LineLeaf key={`${i}b`} x={x} y={y + 2} angle={40 + rand() * 30} len={5} width={1.6} />);
    }
    if (kind === 2) out.push(<LineBloom key={i} x={x} y={y} r={2.2 + rand()} rotate={rand() * 72} />);
    if (rand() > 0.5) out.push(<circle key={`d${i}`} cx={round(x + 3)} cy={round(y - 3)} r="0.45" fill={ACCENT} opacity="0.7" />);
    x += 5.2 + rand() * 1.6;
    i++;
  }
  return <>{out}</>;
}

/** An all-over border of line florals (every side). */
function LineFloralFrame({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <LineBand len={100} seed={3} />
      <g transform={`translate(100 ${h}) rotate(180)`}>
        <LineBand len={100} seed={5} />
      </g>
      <g transform={`translate(0 ${h}) rotate(-90)`}>
        <LineBand len={h} seed={11} />
      </g>
      <g transform="translate(100 0) rotate(90)">
        <LineBand len={h} seed={13} />
      </g>
    </Svg>
  );
}

/** Line florals across the top and bottom only (for foil). */
function LineFloralBands({ h }: { h: number }) {
  return (
    <Svg h={h}>
      <LineBand len={100} seed={17} depth={Math.min(22, h * 0.16)} />
      <LineBand len={100} seed={19} depth={Math.min(12, h * 0.1)} />
      <g transform={`translate(100 ${h}) rotate(180)`}>
        <LineBand len={100} seed={23} depth={Math.min(22, h * 0.16)} />
        <LineBand len={100} seed={29} depth={Math.min(12, h * 0.1)} />
      </g>
    </Svg>
  );
}

/** Leafy branches with small buds curling in from two opposite corners. */
function Vines({ h }: { h: number }) {
  const bud = `color-mix(in oklab, ${MUTED} 55%, transparent)`;
  const corner = (key: string, transform: string) => (
    <g key={key} transform={transform}>
      <LeafyStem p0={[-2, 3]} p1={[22, -2]} p2={[50, 9]} count={11} len={5.4} width={1.7} />
      <LeafyStem p0={[3, -2]} p1={[-2, 20]} p2={[8, 42]} count={8} len={5} width={1.6} />
      <LeafyStem p0={[8, 6]} p1={[20, 12]} p2={[30, 22]} count={5} len={4} width={1.3} />
      {[
        [50, 9, 1.5],
        [44, 4, 1.1],
        [8, 42, 1.4],
        [30, 22, 1.2],
        [26, 4, 1],
        [3, 30, 1],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={bud} />
          <circle cx={x + r * 0.9} cy={y - r * 0.6} r={r * 0.6} fill={bud} />
        </g>
      ))}
    </g>
  );
  return (
    <Svg h={h}>
      {corner("a", "translate(0 0)")}
      {corner("b", `translate(100 ${h}) rotate(180)`)}
    </Svg>
  );
}

/** Wildflowers climbing both side edges. */
function MeadowBorder({ h }: { h: number }) {
  const side = (seed: number, flip: boolean) => {
    const rand = seeded(seed);
    const out: ReactNode[] = [];
    const n = Math.max(6, Math.round(h / 9));
    for (let i = 0; i < n; i++) {
      const y = 4 + (i * (h - 8)) / (n - 1) + (rand() - 0.5) * 3;
      const x = 3 + rand() * 6;
      const tilt = -20 + rand() * 40;
      const kind = i % 4;
      out.push(
        <g key={i}>
          <path d={`M${round(x - 3)} ${round(y + 4)} Q ${round(x + 1)} ${round(y + 1)} ${round(x + 4)} ${round(y - 2)}`} fill="none" stroke={LEAF} strokeWidth="0.3" />
          <Leaf x={x} y={y + 2} angle={60 + tilt} len={4.4} width={1.4} />
          {kind === 0 ? <Blossom x={x + 4} y={y - 2} r={2.2} rotate={i * 31} fill={`color-mix(in oklab, ${ACCENT} 35%, transparent)`} width={0.22} /> : null}
          {kind === 1 ? <Blossom x={x + 4} y={y - 2} r={1.8} rotate={i * 19} fill={`color-mix(in oklab, ${MUTED} 40%, transparent)`} stroke={MUTED} width={0.2} /> : null}
          {kind === 2 ? <circle cx={round(x + 4)} cy={round(y - 2)} r="0.9" fill={ACCENT} opacity="0.7" /> : null}
          {kind === 3 ? (
            <g>
              {[0, 1, 2].map((k) => (
                <ellipse key={k} cx={round(x + 3.4 + k * 0.7)} cy={round(y - 1 - k * 1.3)} rx="0.55" ry="0.9" fill={MUTED} opacity={0.5 + k * 0.15} />
              ))}
            </g>
          ) : null}
        </g>,
      );
    }
    return <g transform={flip ? `translate(100 0) scale(-1 1)` : undefined}>{out}</g>;
  };
  return (
    <Svg h={h}>
      {side(31, false)}
      {side(37, true)}
    </Svg>
  );
}

/**
 * The card-wide motif. Motifs that sit *in* the text column (bow, flourish,
 * wreath) are exported separately and placed by the layout.
 */
export function Ornament({ kind, h, shape }: { kind: StationeryOrnament; h: number; shape: CardShape }) {
  switch (kind) {
    case "none":
      return null;
    case "floral":
      return (
        <Svg h={h}>
          <FloralSpray transform="translate(0 0)" />
          <FloralSpray transform={`translate(100 ${h}) rotate(180)`} />
          <Frame inset={7} h={h} shape={shape} width={0.25} opacity={0.5} />
        </Svg>
      );
    case "leaves":
      return (
        <Svg h={h}>
          <LeafyStem p0={[-4, 18]} p1={[20, 10]} p2={[56, 24]} count={9} len={6} width={1.8} />
          <LeafyStem p0={[104, h - 18]} p1={[80, h - 10]} p2={[44, h - 24]} count={9} len={6} width={1.8} />
        </Svg>
      );
    case "gilded":
      return (
        <Svg h={h}>
          <Frame inset={5} h={h} shape={shape} width={0.6} opacity={1} />
          <Frame inset={8} h={h} shape={shape} width={0.25} opacity={1} />
          {corners(h, shape, 8).map(([x, y, r]) => (
            <path key={`${x}-${y}`} d="M0 10 C 0 4, 4 0, 10 0 M3 10 C 3 6, 6 3, 10 3" fill="none" stroke={ACCENT} strokeWidth="0.35" transform={`translate(${x} ${y}) rotate(${r})`} />
          ))}
        </Svg>
      );
    case "crest":
    case "ribbon":
      return (
        <Svg h={h}>
          <Frame inset={6} h={h} shape={shape} width={0.3} />
          <Frame inset={9} h={h} shape={shape} width={0.15} />
        </Svg>
      );
    case "seal":
    case "wreath":
      return (
        <Svg h={h}>
          <Frame inset={7} h={h} shape={shape} width={0.2} opacity={0.6} />
        </Svg>
      );
    case "rule":
      return (
        <Svg h={h}>
          <line x1="12" x2="88" y1={shape === "arch" ? 30 : h * 0.1} y2={shape === "arch" ? 30 : h * 0.1} stroke={FG} strokeWidth="0.3" opacity="0.8" />
          <line x1="12" x2="88" y1={h * 0.9} y2={h * 0.9} stroke={FG} strokeWidth="0.3" opacity="0.8" />
        </Svg>
      );
    case "hairline":
      return (
        <Svg h={h}>
          <Frame inset={6} h={h} shape={shape} width={0.35} color="var(--inv-border)" opacity={1} />
        </Svg>
      );
    case "double-border":
      return (
        <Svg h={h}>
          <Frame inset={5} h={h} shape={shape} width={0.9} opacity={0.9} />
          <Frame inset={8} h={h} shape={shape} width={0.25} opacity={0.9} />
        </Svg>
      );
    case "garland":
      return <Garland h={h} />;
    case "stems":
      return <Stems h={h} />;
    case "wildflowers":
      return <Wildflowers h={h} />;
    case "deco":
      return <Deco h={h} shape={shape} />;
    case "scallop":
      return <Scallop h={h} shape={shape} />;
    case "olive":
      return <Olive h={h} />;
    case "celestial":
      return <Celestial h={h} />;
    case "confetti":
      return <Confetti h={h} />;
    case "tile":
      return <Tile h={h} shape={shape} />;
    case "watercolor":
      return <Watercolor />;
    case "citrus":
      return <Citrus h={h} />;
    case "flourish":
      return null;
    case "twine":
      return <Twine h={h} shape={shape} />;
    case "cascade":
      return <Cascade h={h} />;
    case "rose-corners":
      return (
        <Svg h={h}>
          <RoseCluster transform="translate(-2 -2) scale(1.45)" />
          <RoseCluster transform={`translate(102 ${h + 2}) rotate(180) scale(1.45)`} />
        </Svg>
      );
    case "ornate":
      return <Ornate h={h} shape={shape} />;
    case "petals":
      return <Petals h={h} />;
    case "vines":
      return <Vines h={h} />;
    case "meadow-border":
      return <MeadowBorder h={h} />;
    case "line-florals":
      return <LineFloralFrame h={h} />;
    case "florals-band":
      return <LineFloralBands h={h} />;
    case "peonies":
      return <PeonyCorners h={h} />;
    default:
      return <>{Motif({ kind, h, shape })}</>;
  }
}

export { FlourishLine, Ribbon, Wreath };

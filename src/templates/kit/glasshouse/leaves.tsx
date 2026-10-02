import { cn } from "@/lib/utils";
import s from "./glasshouse.module.css";

/*
 * Original leaf drawings for the glasshouse: a split leaf, a palm frond and
 * a fern. Filled with the template's leaf colour; the splits are cut with
 * the page colour so they read on any palette.
 */

export function SplitLeaf({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 220" className={cn(s.leafArt, className)}>
      <path className={s.leafFill} d="M100 214 C96 190 92 176 84 170 C40 160 8 120 10 74 C12 34 46 8 92 12 C100 13 104 20 108 14 C150 8 190 40 190 88 C190 136 152 168 116 172 C110 180 104 196 100 214Z" />
      <path className={s.leafCut} d="M100 168 C100 120 102 70 100 22 M100 60 L40 48 M100 84 L18 92 M100 110 L30 132 M102 64 L170 52 M102 90 L186 100 M102 116 L170 140" />
    </svg>
  );
}

export function Frond({ className }: { className?: string }) {
  const leaflets = Array.from({ length: 13 }, (_, i) => {
    const t = (i + 1) / 14;
    const x = 20 + t * 150;
    const y = 180 - Math.sin(t * Math.PI * 0.9) * 120 - t * 30;
    const len = 34 + Math.sin(t * Math.PI) * 26;
    return (
      <g key={i}>
        <path className={s.leafFill} d={`M${x} ${y} q ${-len * 0.3} ${-len * 0.9} ${-len * 0.1} ${-len * 1.1} q ${len * 0.12} ${len * 0.6} ${len * 0.1} ${len * 1.1}Z`} />
        <path className={s.leafFill} d={`M${x} ${y} q ${len * 0.8} ${len * 0.2} ${len} ${len * 0.6} q ${-len * 0.5} ${-len * 0.05} ${-len} ${-len * 0.6}Z`} />
      </g>
    );
  });
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={cn(s.leafArt, className)}>
      <path className={s.stemLine} d="M12 196 C60 130 110 70 186 44" />
      {leaflets}
    </svg>
  );
}

export function Fern({ className }: { className?: string }) {
  const pinnae = Array.from({ length: 16 }, (_, i) => {
    const y = 190 - i * 11;
    const w = 46 - Math.abs(i - 6) * 3.2;
    return (
      <g key={i}>
        <ellipse className={s.leafFill} cx={60 - w / 2} cy={y} rx={w / 2} ry={4.2} transform={`rotate(-14 60 ${y})`} />
        <ellipse className={s.leafFill} cx={60 + w / 2} cy={y} rx={w / 2} ry={4.2} transform={`rotate(14 60 ${y})`} />
      </g>
    );
  });
  return (
    <svg aria-hidden viewBox="0 0 120 210" className={cn(s.leafArt, className)}>
      <path className={s.stemLine} d="M60 206 V12" />
      {pinnae}
    </svg>
  );
}

/** The glasshouse: an outline of a domed conservatory with iron glazing bars. */
export const HOUSE_PATH = "M30 290 V160 Q30 150 40 148 L120 120 Q140 50 200 30 Q260 50 280 120 L360 148 Q370 150 370 160 V290 Z";

export function GlassFrame({ className }: { className?: string }) {
  const roofY = (x: number) => (x < 120 ? 148 - ((x - 40) * 28) / 80 : x > 280 ? 148 - ((360 - x) * 28) / 80 : 150);
  const mullions = [55, 80, 105, 140, 170, 230, 260, 295, 320, 345];
  return (
    <svg aria-hidden viewBox="0 0 400 300" preserveAspectRatio="none" className={cn(s.frameArt, className)}>
      <path d={HOUSE_PATH} className={s.ironThick} />
      {mullions.map((x) => <path key={x} d={`M${x} ${roofY(x)} V290`} className={s.iron} />)}
      <path d="M30 205 H370 M30 160 H120 M280 160 H370 M120 150 H280" className={s.iron} />
      <path d="M200 30 V290 M200 30 Q168 70 152 150 M200 30 Q232 70 248 150 M200 30 Q186 80 178 150 M200 30 Q214 80 222 150 M128 98 Q200 84 272 98" className={s.iron} />
      <path d="M182 290 V252 Q200 234 218 252 V290" className={s.ironThick} />
      <circle cx="200" cy="26" r="5" className={s.finial} />
    </svg>
  );
}

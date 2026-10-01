import type { ComponentType, CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { HeroSky } from "./effects";
import l from "./landmarks.module.css";
import type { EmblemProps, HeroArtProps } from "./scene";
import s from "./showpiece.module.css";
import type { Variant } from "./variants";

/**
 * Heroes, emblems and drawings of the Egypt venue Showpieces (openings in
 * ./landmarks-open.tsx). Every drawing is original, made from simple shapes
 * in the theme's colours:
 *
 * - giza:    the three pyramids of Giza at dusk, a caravan crossing the dunes.
 * - baron:   the Baron Palace in Heliopolis, its towers outlined in gold.
 * - montaza: Montaza Palace in Alexandria: the tower, the sea and the bridge.
 * - luxor:   a colonnade of papyrus columns at Luxor Temple, lit at night.
 */

const v = (o: Record<string, string | number>) => o as CSSProperties;

/**
 * The line an opening greets guests with: the couple's own venue when they
 * gave one, otherwise the place the design draws. Samples always show the
 * place, so the design reads as itself in the gallery.
 */
export function venueLine(model: InvitationModel, place: string): string {
  if (model.mode === "sample") return place;
  return model.events.reception?.venueName || model.events.ceremony?.venueName || place;
}

// ── Giza ───────────────────────────────────────────────────────────────────

const pyramid = (ax: number, ay: number, half: number, ridge: number, base = 300) => ({
  lit: `M${ax} ${ay} L${ax - half} ${base} L${ax + ridge} ${base}Z`,
  shade: `M${ax} ${ay} L${ax + ridge} ${base} L${ax + half} ${base}Z`,
});
const PYRAMIDS = [
  pyramid(640, 58, 178, 40), // Khafre, behind, on higher ground
  pyramid(835, 168, 92, 12), // Menkaure
  pyramid(905, 250, 34, 4),
  pyramid(948, 262, 26, 3),
  pyramid(984, 270, 20, 2),
  pyramid(430, 72, 205, 30), // Khufu, nearest
];

/** The pyramids of Giza. `litClass` lets the opening light their sunward faces. */
export function Pyramids({ className, litClass }: { className?: string; litClass?: string }) {
  return (
    <svg viewBox="0 0 1000 300" className={className} aria-hidden>
      {PYRAMIDS.map((p, i) => (
        <g key={i}>
          <path d={p.shade} className={l.pShade} />
          <path d={p.lit} className={cn(l.pLit, litClass)} />
        </g>
      ))}
      {/* Khafre keeps a little of its casing at the top */}
      <path d="M640 58 L617 96 L648 96Z" className={l.pCap} />
    </svg>
  );
}

function Camel({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M3 19 C4 15 7 13 11 13 C13 5 23 4 27 12 C30 12 32 13 34 15 L38 8 C39 5 43 5 45 7 L46 9 L43 10 C42 14 40 18 37 21 C36 22 35 23 35 24 L36 34 L34 34 L32 24 C28 25 22 25 18 24 L17 34 L15 34 L14 24 C12 25 10 27 9 34 L7 34 L8 24 C6 23 4 22 3 19Z" />
      <path d="M19 6 C19 2 24 2 24 6 L25 11 L18 11Z" />
    </g>
  );
}

export function Caravan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 230 36" className={className} aria-hidden>
      <Camel x={0} />
      <Camel x={58} />
      <Camel x={116} />
      <path d="M182 34 L186 18 C186 14 192 14 192 18 L195 34Z M186 13 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" />
    </svg>
  );
}

function Dunes({ className, front }: { className?: string; front?: boolean }) {
  return (
    <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className={className} aria-hidden>
      {front ? (
        <path d="M0 60 C140 30 260 34 380 62 C500 90 640 40 760 46 C860 50 940 70 1000 64 V120 H0Z" />
      ) : (
        <path d="M0 40 C120 20 220 50 340 40 C480 28 560 10 700 26 C820 40 900 20 1000 30 V120 H0Z" />
      )}
    </svg>
  );
}

function GizaHero({ model, text }: HeroArtProps) {
  return (
    <>
      <div aria-hidden className={l.duskSky} />
      <div aria-hidden className={s.layer} data-depth="0.12"><span className={l.sun} /></div>
      <div aria-hidden className={s.layer} data-depth="0.25"><Pyramids className={l.pyramids} /></div>
      <div aria-hidden className={s.layer} data-depth="0.45">
        <Dunes className={cn(l.dunes, l.duneBack)} />
        <div className={l.caravanTrack}><Caravan className={l.caravan} /></div>
      </div>
      <div aria-hidden className={s.layer} data-depth="0.7"><Dunes front className={cn(l.dunes, l.duneFront)} /></div>
      <div aria-hidden className={l.dust}><HeroSky model={model} kind="dust" /></div>
      <div className={cn(s.col, s.heroInner, l.skyText, l.gizaText)}>{text}</div>
    </>
  );
}

function GizaEmblem() {
  return (
    <svg viewBox="0 0 100 70" className={l.emblemSvg}>
      <circle cx="62" cy="30" r="14" fill="currentColor" opacity=".35" />
      <path d="M36 14 L6 66 H66Z" fill="currentColor" />
      <path d="M36 14 L44 66 H66Z" fill="currentColor" opacity=".55" />
      <path d="M74 36 L56 66 H94Z" fill="currentColor" opacity=".8" />
    </svg>
  );
}

// ── Baron Palace ───────────────────────────────────────────────────────────

type Win = { d: string };
/** The palace's outline (one path) and its windows. */
const PALACE = (() => {
  const parts: string[] = [];
  const wins: Win[] = [];
  const rect = (x1: number, y1: number, x2: number, y2: number) => parts.push(`M${x1} ${y2} V${y1} H${x2} V${y2}Z`);
  // A tier of a tower: a band with little finials at its corners.
  const tier = (cx: number, w: number, yb: number, h: number) => {
    const x1 = cx - w / 2, x2 = cx + w / 2, yt = yb - h;
    parts.push(`M${x1} ${yb} V${yt + 3} L${x1 + 3} ${yt - 3} L${x1 + 6} ${yt + 3} H${x2 - 6} L${x2 - 3} ${yt - 3} L${x2} ${yt + 3} V${yb}Z`);
  };
  const tower = (cx: number, base: number, widths: number[], h: number) => {
    widths.forEach((w, i) => tier(cx, w, base - i * h, h));
    const top = base - widths.length * h;
    parts.push(`M${cx - 4} ${top} L${cx} ${top - 22} L${cx + 4} ${top}Z`);
    return top;
  };
  const arch = (x: number, yb: number, w: number, h: number) => wins.push({ d: `M${x} ${yb} v-${h - w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 v${h - w / 2}z` });

  rect(30, 284, 570, 300); // terrace
  rect(110, 200, 490, 284); // ground floor
  for (let x = 124; x <= 470; x += 29) arch(x, 270, 14, 34);
  rect(160, 160, 440, 200); // first floor
  for (let x = 172; x <= 420; x += 28) arch(x, 192, 10, 22);
  rect(255, 120, 345, 160); // the great tower's base
  for (const x of [266, 293, 320]) arch(x, 152, 8, 22);
  tower(300, 120, [90, 76, 64, 52, 42, 32, 22], 13);
  for (const cx of [140, 460]) {
    rect(cx - 25, 170, cx + 25, 200);
    arch(cx - 5, 194, 10, 18);
    tower(cx, 170, [44, 36, 28, 20], 11);
  }
  for (const cx of [55, 545]) {
    rect(cx - 14, 236, cx + 14, 284);
    parts.push(`M${cx - 15} 236 Q${cx} 204 ${cx + 15} 236Z M${cx} 214 V200`);
    arch(cx - 5, 276, 10, 26);
  }
  parts.push("M250 300 V292 H350 V300"); // steps
  return { outline: parts.join(" "), wins };
})();

/** The Baron Palace in gold line. `lineClass` / `winClass` let the opening draw it and light it. */
export function Palace({ className, lineClass, winClass }: { className?: string; lineClass?: string; winClass?: string }) {
  return (
    <svg viewBox="0 0 600 310" className={className} aria-hidden>
      <path d={PALACE.outline} className={cn(l.palace, lineClass)} pathLength={1} />
      {PALACE.wins.map((w, i) => (
        <path key={i} d={w.d} className={cn(l.win, winClass)} style={v({ "--i": i })} />
      ))}
    </svg>
  );
}

export function Palm({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 140 220" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path d="M70 220 C72 170 74 120 70 64" fill="none" strokeWidth="6" strokeLinecap="round" />
      <path d="M70 64 C48 52 26 56 8 72 C30 62 50 64 70 66Z M70 64 C58 40 40 30 18 30 C40 38 56 50 70 66Z M70 64 C80 38 100 28 124 30 C102 38 86 50 70 66Z M70 64 C92 54 114 58 132 74 C110 64 90 64 70 66Z M70 64 C68 42 74 22 88 8 C80 28 76 46 70 66Z" />
    </svg>
  );
}

function BaronHero({ model, text }: HeroArtProps) {
  return (
    <>
      <div aria-hidden className={l.palaceNight}><HeroSky model={model} kind="stars" /></div>
      <div aria-hidden className={s.layer} data-depth="0.18"><span className={l.palaceGlow} /></div>
      <div aria-hidden className={cn(s.layer, l.palaceRow)} data-depth="0.3">
        <Palm className={cn(l.palm, l.palmL)} />
        <Palace className={l.palaceArt} />
        <Palm className={cn(l.palm, l.palmR)} flip />
      </div>
      <div className={cn(s.col, s.heroInner, l.skyText, l.baronText)}>
        <div className={l.filigree}>{text}</div>
      </div>
    </>
  );
}

function BaronEmblem() {
  return (
    <svg viewBox="0 0 80 90" className={l.emblemSvg}>
      {[48, 40, 32, 24, 16].map((w, i) => (
        <path key={w} d={`M${40 - w / 2} ${86 - i * 13} V${76 - i * 13} H${40 + w / 2} V${86 - i * 13}Z`} fill="none" stroke="currentColor" strokeWidth="1.6" />
      ))}
      <path d="M36 21 L40 2 L44 21Z" fill="currentColor" />
    </svg>
  );
}

// ── Montaza ────────────────────────────────────────────────────────────────

const MONTAZA = (() => {
  const walls: string[] = [];
  const trims: string[] = [];
  const wins: string[] = [];
  const rect = (to: string[], x1: number, y1: number, x2: number, y2: number) => to.push(`M${x1} ${y2} V${y1} H${x2} V${y2}Z`);
  const crenels = (x1: number, x2: number, y: number) => { for (let x = x1; x + 6 <= x2; x += 12) rect(trims, x, y - 7, x + 6, y); };
  // The long wing with its arcade
  rect(walls, 250, 236, 560, 300);
  rect(trims, 246, 232, 564, 238);
  crenels(250, 560, 232);
  for (let x = 262; x + 22 <= 556; x += 33) wins.push(`M${x} 300 v-22 a11 11 0 0 1 22 0 v22z`);
  for (let x = 266; x + 10 <= 556; x += 33) rect(wins, x, 246, x + 10, 262);
  // The small west tower
  rect(walls, 268, 186, 302, 236);
  rect(trims, 264, 180, 306, 188);
  crenels(266, 306, 180);
  wins.push("M280 222 v-14 a5 5 0 0 1 10 0 v14z");
  // The great tower
  rect(walls, 430, 92, 478, 236);
  for (const y of [132, 172, 212]) wins.push(`M448 ${y} v-18 a6 6 0 0 1 12 0 v18z`);
  rect(trims, 422, 80, 486, 94);
  crenels(422, 486, 80);
  rect(walls, 438, 52, 470, 80);
  wins.push("M449 74 v-12 a5 5 0 0 1 10 0 v12z");
  trims.push("M434 53 L454 30 L474 53Z M454 30 V16");
  // The bridge to the tea island, and its pavilion
  trims.push("M600 330 L612 312 H762 V318 H612Z");
  for (let x = 622; x + 26 <= 760; x += 30) wins.push(`M${x} 330 v-8 a13 13 0 0 1 26 0 v8z`);
  walls.push("M736 330 C750 316 786 314 800 324 V330Z");
  rect(walls, 762, 292, 792, 318);
  trims.push("M758 294 Q777 268 796 294Z");
  for (const x of [768, 782]) wins.push(`M${x} 314 v-12 a3 3 0 0 1 6 0 v12z`);
  return { walls: walls.join(" "), trims: trims.join(" "), wins: wins.join(" ") };
})();

/** Montaza Palace from the sea. */
export function Montaza({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 440" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <path d="M0 340 H800 C820 340 832 358 840 370 H0Z" className={l.land} />
      <rect x="0" y="370" width="1200" height="70" className={l.seaFill} />
      <g transform="translate(200 40)">
        <path d={MONTAZA.walls} className={l.wall} />
        <path d={MONTAZA.trims} className={l.trim} />
        <path d={MONTAZA.wins} className={l.mWin} />
      </g>
    </svg>
  );
}

function Waves({ className }: { className?: string }) {
  const d = "q25 -12 50 0 t50 0 ".repeat(8).trim();
  return (
    <svg viewBox="0 0 800 40" preserveAspectRatio="none" className={className} aria-hidden>
      <path d={`M0 14 ${d} V40 H0Z`} />
    </svg>
  );
}

function Gull({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 30 12" className={l.gull} style={style} aria-hidden>
      <path d="M1 8 C6 2 11 2 15 8 C19 2 24 2 29 8" fill="none" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MontazaHero({ text }: HeroArtProps) {
  return (
    <>
      <div aria-hidden className={l.seaSky}><span className={l.seaSun} /></div>
      <div aria-hidden className={s.layer} data-depth="0.15">
        <Gull style={{ top: "50%", left: "16%" }} />
        <Gull style={{ top: "46%", left: "24%", animationDelay: "-1.4s", width: "1.3rem" }} />
        <Gull style={{ top: "54%", left: "78%", animationDelay: "-.7s", width: "1.1rem" }} />
      </div>
      <div aria-hidden className={s.layer} data-depth="0.3">
        <Montaza className={l.montaza} />
        <Palm className={cn(l.mPalm, l.mPalmA)} />
        <Palm className={cn(l.mPalm, l.mPalmB)} flip />
      </div>
      <div aria-hidden className={l.sea}>
        <span className={l.sail} />
        <Waves className={cn(l.wave, l.w1)} />
        <Waves className={cn(l.wave, l.w2)} />
        <Waves className={cn(l.wave, l.w3)} />
      </div>
      <div className={cn(s.col, s.heroInner, l.skyText, l.montazaText)}>{text}</div>
    </>
  );
}

function MontazaEmblem() {
  return (
    <svg viewBox="0 0 80 80" className={l.emblemSvg}>
      <path d="M32 58 V22 H48 V58Z M28 22 V16 H52 V22Z M34 16 L40 6 L46 16Z" fill="currentColor" />
      <path d="M6 66 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="var(--inv-accent)" strokeWidth="2.4" />
      <path d="M6 74 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="var(--inv-accent)" strokeWidth="2.4" opacity=".6" />
    </svg>
  );
}

// ── Luxor ──────────────────────────────────────────────────────────────────

/** An open papyrus column, as at Luxor. */
export function Column({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 300" className={className} aria-hidden>
      <path className={l.stone} d="M18 10 V0 H42 V10Z M14 70 C6 60 0 40 2 22 C2 14 6 10 10 10 H50 C54 10 58 14 58 22 C60 40 54 60 46 70Z M12 290 L14 70 H46 L48 290Z M4 300 V290 H56 V300Z" />
      <path className={l.carve} d="M14 76 H46 M14 82 H46 M14 88 H46 M8 26 C20 30 40 30 52 26 M16 54 C26 58 34 58 44 54 M22 70 C22 50 20 30 18 12 M38 70 C38 50 40 30 42 12 M30 70 V12" />
      <path className={l.stoneShade} d="M30 70 H46 L48 290 H30Z M30 12 H50 C54 12 58 14 58 22 C60 40 54 60 46 70 H30Z" />
    </svg>
  );
}

const AISLE = Array.from({ length: 16 }, (_, i) => ({ side: i % 2 ? 1 : -1, n: Math.floor(i / 2) }));

/** Two rows of columns receding to a pylon. `moving` walks slowly down the aisle. */
export function Colonnade({ moving, className, aisleClass }: { moving?: boolean; className?: string; aisleClass?: string }) {
  return (
    <div className={cn(l.colonnade, className)} aria-hidden>
      <svg viewBox="0 0 200 90" className={l.pylon}>
        <path d="M10 90 L22 20 H84 L92 90Z M108 90 L116 20 H178 L190 90Z M92 90 V44 H108 V90Z" />
        <path d="M2 90 L5 8 L7 2 L9 8 L12 90Z" />
      </svg>
      <div className={cn(l.aisle, aisleClass)}>
        {AISLE.map((p, i) => (
          <div
            key={i}
            className={cn(l.pillar, moving && l.walking)}
            style={v({ "--x": `${p.side * 11}rem`, "--z": `${200 - p.n * 340}px`, animationDelay: `${-p.n * 5 - (p.side > 0 ? 2.5 : 0)}s` })}
          >
            <Column />
          </div>
        ))}
      </div>
    </div>
  );
}

function LuxorHero({ text }: HeroArtProps) {
  return (
    <>
      <div aria-hidden className={l.templeNight} />
      <Colonnade moving />
      <div className={cn(s.col, s.heroInner, l.skyText, l.luxorText)}>
        <div className={l.cartouche}>{text}</div>
      </div>
    </>
  );
}

function LuxorEmblem() {
  return (
    <svg viewBox="0 0 80 80" className={l.emblemSvg}>
      <path d="M40 66 C30 50 30 26 40 8 C50 26 50 50 40 66Z" fill="currentColor" />
      <path d="M40 66 C26 60 14 46 12 26 C24 32 34 46 40 66Z M40 66 C54 60 66 46 68 26 C56 32 46 46 40 66Z" fill="currentColor" opacity=".6" />
      <path d="M20 72 H60" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export const LANDMARK_HEROES: Partial<Record<Variant, ComponentType<HeroArtProps>>> = {
  giza: GizaHero,
  baron: BaronHero,
  montaza: MontazaHero,
  luxor: LuxorHero,
};

export const LANDMARK_EMBLEMS: Partial<Record<Variant, ComponentType<EmblemProps>>> = {
  giza: GizaEmblem,
  baron: BaronEmblem,
  montaza: MontazaEmblem,
  luxor: LuxorEmblem,
};

export { Dunes, Waves };

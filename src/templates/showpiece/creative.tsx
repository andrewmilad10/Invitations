import type { ComponentType, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { InvitationImage } from "../shared/invitation-image";
import c from "./creative.module.css";
import { HeroSky } from "./effects";
import { Flower } from "./flower";
import { copyFor, type EmblemProps, type HeroArtProps } from "./scene";
import s from "./showpiece.module.css";
import type { Variant } from "./variants";

/**
 * Heroes and RSVP emblems of the creative Showpieces (their openings are in
 * ./creative-open.tsx):
 *
 * - stars:    Written in the Stars — a turning armillary sphere in a night sky.
 * - popup:    Paper Theatre — a cut-paper stage, every layer at its own depth.
 * - glass:    Rose Window — a stained-glass rose throwing coloured light.
 * - keepsake: The Keepsake Box — a ribboned gift and keepsakes that float up.
 *
 * Everything is drawn here, in the couple's theme colours.
 */

const v = (o: Record<string, string | number>) => o as CSSProperties;

// ── Written in the Stars ───────────────────────────────────────────────────

function StarsHero({ model, text }: HeroArtProps) {
  const [a, b] = model.wedding.initials;
  return (
    <>
      <div aria-hidden className={c.night}>
        <HeroSky model={model} kind="stars" />
      </div>
      <div className={cn(s.col, s.heroInner, c.starsInner)}>
        <div aria-hidden className={c.orrery}>
          <div className={c.orreryTilt} data-tilt>
            <div className={c.sphere}>
              <i className={c.ring} style={v({ "--t": "rotateX(90deg)" })} />
              <i className={c.ring} style={v({ "--t": "rotateY(0deg)" })} />
              <i className={c.ring} style={v({ "--t": "rotateY(60deg)" })} />
              <i className={c.ring} style={v({ "--t": "rotateY(120deg)" })} />
              <i className={cn(c.ring, c.ecliptic)} style={v({ "--t": "rotateX(66deg) rotateY(14deg)" })} />
            </div>
          </div>
          <span className={c.orb}>{a}&amp;{b}</span>
        </div>
        {text}
      </div>
    </>
  );
}

/** A four-pointed star. */
function Star({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} style={style} aria-hidden>
      <path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z" fill="currentColor" />
    </svg>
  );
}

function StarsEmblem() {
  return (
    <svg viewBox="-50 -50 100 100" className={c.emblemSvg}>
      <circle r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity=".6" />
      <ellipse rx="40" ry="13" fill="none" stroke="currentColor" strokeWidth="1" opacity=".6" transform="rotate(-20)" />
      <path d="M0 -24 C2 -5 5 -2 24 0 C5 2 2 5 0 24 C-2 5 -5 2 -24 0 C-5 -2 -2 -5 0 -24Z" fill="currentColor" />
      <circle cx="34" cy="-20" r="3" fill="currentColor" />
    </svg>
  );
}

// ── Paper Theatre ──────────────────────────────────────────────────────────

/** The curtain drape, cut from one sheet (mirrored for the right side). */
export function Drape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 400" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M0 0 H120 C112 60 92 120 74 180 C66 210 64 232 70 252 C50 262 34 300 24 400 H0Z" />
      <path d="M30 0 C30 80 40 160 58 230" fill="none" strokeWidth="1.2" />
      <path d="M62 0 C60 60 64 120 72 170" fill="none" strokeWidth="1.2" />
    </svg>
  );
}

export function Cloud({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 120 50" className={className} style={style} aria-hidden>
      <path d="M8 46 C0 46 0 32 12 32 C10 20 26 14 34 22 C38 6 62 4 68 20 C76 10 96 14 94 30 C108 28 116 46 104 46Z" />
    </svg>
  );
}

const HANGERS = [
  { x: 14, len: 12, shape: "star", d: -0.6 },
  { x: 27, len: 20, shape: "heart", d: -2.1 },
  { x: 73, len: 16, shape: "moon", d: -1.2 },
  { x: 86, len: 10, shape: "star", d: -3 },
];

function Hanger({ shape }: { shape: string }) {
  if (shape === "heart") return <svg viewBox="0 0 20 18"><path d="M10 17 C-4 8 2 -2 10 4 C18 -2 24 8 10 17Z" /></svg>;
  if (shape === "moon") return <svg viewBox="0 0 20 20"><path d="M14 2 A9 9 0 1 0 18 15 A7 7 0 1 1 14 2Z" /></svg>;
  return <Star />;
}

function PopupHero({ text }: HeroArtProps) {
  return (
    <>
      <div aria-hidden className={c.paperSky}>
        <div className={s.layer} data-depth="0.1"><span className={c.paperSun} /></div>
        <div className={s.layer} data-depth="0.25">
          <Cloud className={c.cloud} style={{ top: "22%", left: "calc(50% - min(40vw, 13rem))" }} />
          <Cloud className={c.cloud} style={{ top: "34%", right: "calc(50% - min(40vw, 13rem))", width: "6rem", animationDelay: "-6s" }} />
        </div>
        <div className={s.layer} data-depth="0.4">
          <svg viewBox="0 0 400 100" preserveAspectRatio="none" className={c.hills}>
            <path className={c.hillBack} d="M0 40 C60 10 120 20 170 44 C230 70 290 18 340 26 C370 30 390 40 400 46 V100 H0Z" />
            <path className={c.hillFront} d="M0 70 C70 46 130 60 200 74 C270 88 330 52 400 64 V100 H0Z" />
          </svg>
        </div>
        <div className={s.layer} data-depth="0.6"><div className={c.archFrame} /></div>
        <div className={s.layer} data-depth="0.85">
          <Drape className={cn(c.drape, c.drapeL)} />
          <Drape className={cn(c.drape, c.drapeR)} />
          <div className={c.valance} />
          {HANGERS.map((h, i) => (
            <span key={i} className={c.hanger} style={v({ insetInlineStart: `${h.x}%`, "--len": `${h.len}vh`, animationDelay: `${h.d}s` })}>
              <Hanger shape={h.shape} />
            </span>
          ))}
        </div>
      </div>
      <div className={cn(s.col, s.heroInner, c.popInner)}>{text}</div>
    </>
  );
}

function PopupEmblem() {
  return (
    <svg viewBox="0 0 100 90" className={c.emblemSvg}>
      <path d="M50 84 C10 58 4 34 18 20 C30 8 46 14 50 26Z" fill="var(--inv-accent)" />
      <path d="M50 84 C90 58 96 34 82 20 C70 8 54 14 50 26Z" fill="color-mix(in oklab, var(--inv-accent) 70%, white)" />
      <path d="M50 26 V84" stroke="color-mix(in oklab, var(--inv-accent) 60%, black)" strokeWidth="1" />
    </svg>
  );
}

// ── Rose Window ────────────────────────────────────────────────────────────

const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [+(r * Math.cos(a)).toFixed(2), +(r * Math.sin(a)).toFixed(2)];
};
const sector = (r1: number, r2: number, a1: number, a2: number) => {
  const [x1, y1] = polar(r2, a1), [x2, y2] = polar(r2, a2), [x3, y3] = polar(r1, a2), [x4, y4] = polar(r1, a1);
  return `M${x1} ${y1} A${r2} ${r2} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 0 0 ${x4} ${y4}Z`;
};

/** Every piece of glass in the rose: its outline, its tone (1–5) and where it scatters to before the opening. */
type Shard = { d: string; tone: number; x: number; y: number; r: number };
export const ROSE_SHARDS: Shard[] = (() => {
  const out: Shard[] = [];
  const add = (d: string, tone: number) => {
    const i = out.length + 1;
    out.push({ d, tone, x: ((i * 97) % 150) - 75, y: ((i * 61) % 130) - 65, r: ((i * 53) % 140) - 70 });
  };
  for (let k = 0; k < 16; k++) add(sector(72, 96, k * 22.5 + 1, (k + 1) * 22.5 - 1), k % 2 ? 1 : 2);
  // Petals: the rotation is baked into the points, so CSS transforms stay free for the opening.
  const turn = (x: number, y: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${+(x * Math.cos(a) - y * Math.sin(a)).toFixed(2)} ${+(x * Math.sin(a) + y * Math.cos(a)).toFixed(2)}`;
  };
  for (let k = 0; k < 8; k++) {
    const g = k * 45;
    add(`M${turn(0, -22, g)} Q${turn(22, -45, g)} ${turn(0, -68, g)} Q${turn(-22, -45, g)} ${turn(0, -22, g)}Z`, k % 2 ? 3 : 4);
  }
  for (let k = 0; k < 8; k++) {
    const [x, y] = polar(56, k * 45 + 22.5);
    add(`M${x - 8} ${y} a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0Z`, 2);
  }
  add("M-18 0 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0Z", 5);
  add("M-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0Z", 1);
  return out;
})();

/** The rose window. `shardClass` and per-shard CSS variables let the opening assemble it. */
export function RoseWindow({ className, shardClass }: { className?: string; shardClass?: string }) {
  return (
    <svg viewBox="-104 -104 208 208" className={cn(c.rose, className)} aria-hidden>
      <circle r="100" className={c.lead} strokeWidth="6" fill="none" />
      {ROSE_SHARDS.map((p, i) => (
        <path
          key={i}
          d={p.d}
          className={cn(c[`g${p.tone}`], c.lead, shardClass)}
          strokeWidth="2"
          style={shardClass ? v({ "--i": i, "--x": `${p.x}px`, "--y": `${p.y}px`, "--r": `${p.r}deg` }) : undefined}
        />
      ))}
      <circle r="70" className={c.lead} strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function GlassHero({ text }: HeroArtProps) {
  return (
    <>
      <div aria-hidden className={c.chapel}>
        <span className={c.beam} />
        <span className={cn(c.caustic, c.c1)} />
        <span className={cn(c.caustic, c.c2)} />
        <span className={cn(c.caustic, c.c3)} />
      </div>
      <div className={cn(s.col, s.heroInner, c.glassInner)}>
        <div aria-hidden className={c.windowArch} data-depth="0.12">
          <RoseWindow className={c.turning} />
        </div>
        {text}
      </div>
    </>
  );
}

function GlassEmblem() {
  return <RoseWindow className={c.emblemSvg} />;
}

// ── The Keepsake Box ───────────────────────────────────────────────────────

const KEEP = {
  en: { admit: "Admit two", keep: "Keep this day" },
  ar: { admit: "دعوة لشخصين", keep: "احفظوا هذا اليوم" },
};

export function Bow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <path d="M60 34 C40 6 6 4 8 26 C10 44 40 42 60 34Z" />
      <path d="M60 34 C80 6 114 4 112 26 C110 44 80 42 60 34Z" />
      <path d="M56 36 C48 52 40 66 30 78 L42 76 L48 80 C54 64 58 50 60 38Z" />
      <path d="M64 36 C72 52 80 66 90 78 L78 76 L72 80 C66 64 62 50 60 38Z" />
      <rect x="52" y="27" width="16" height="15" rx="5" />
      <path d="M22 18 C34 16 46 22 56 30 M98 18 C86 16 74 22 64 30" fill="none" className={c.bowFold} />
    </svg>
  );
}

function KeepsakeHero({ model, text }: HeroArtProps) {
  const t = copyFor(model, KEEP);
  const { initials, date } = model.wedding;
  return (
    <>
      <div aria-hidden className={c.lining}>
        <span className={c.ribbonH} />
        <span className={c.ribbonV} />
        <Bow className={c.heroBow} />
      </div>
      <div className={cn(s.col, s.heroInner, c.keepInner)}>
        <div aria-hidden className={c.keeps}>
          <div className={cn(c.keep, c.polaroid)} data-tilt="page">
            <div className={c.polaroidPhoto}>
              {model.media.hero ? (
                <InvitationImage asset={model.media.hero} alt="" fill sizes="140px" priority className="object-cover" />
              ) : (
                <span className={c.polaroidIni}>{initials[0]}&amp;{initials[1]}</span>
              )}
            </div>
            <span className={c.polaroidNote}>{t.keep}</span>
          </div>
          <div className={cn(c.keep, c.ticket)}>
            <span>{t.admit}</span>
            {date ? <b>{date.short}</b> : null}
          </div>
          <div className={cn(c.keep, c.pressed)}><Flower /></div>
        </div>
        {text}
      </div>
    </>
  );
}

function KeepsakeEmblem() {
  return <Bow className={cn(c.emblemSvg, c.emblemBow)} />;
}

export const CREATIVE_HEROES: Partial<Record<Variant, ComponentType<HeroArtProps>>> = {
  stars: StarsHero,
  popup: PopupHero,
  glass: GlassHero,
  keepsake: KeepsakeHero,
};

export const CREATIVE_EMBLEMS: Partial<Record<Variant, ComponentType<EmblemProps>>> = {
  stars: StarsEmblem,
  popup: PopupEmblem,
  glass: GlassEmblem,
  keepsake: KeepsakeEmblem,
};

export { Star };

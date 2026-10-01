"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import c from "./creative.module.css";
import { Bow, Cloud, Drape, RoseWindow, Star } from "./creative";
import { copyFor, type SceneEntry, type SceneProps } from "./scene";
import type { Variant } from "./variants";

/**
 * Openings of the creative Showpieces. Each scene sits in the shared overlay
 * and reacts to its data-phase (see ./scene.ts); the guest's tap calls open().
 */

const v = (o: Record<string, string | number>) => o as CSSProperties;

const COPY = {
  en: {
    stars: "Written in the stars", connect: "Connect the stars",
    paper: "You are invited", openCard: "Open the card",
    light: "Let the light in", glassKicker: "Beneath the rose window",
    box: "Something to keep", untie: "Untie the ribbon",
  },
  ar: {
    stars: "مكتوب في النجوم", connect: "صِل النجوم",
    paper: "أنتم مدعوون", openCard: "افتح البطاقة",
    light: "دع النور يدخل", glassKicker: "تحت النافذة الوردية",
    box: "هديّة للذكرى", untie: "فُكّ الشريطة",
  },
};

// ── Written in the Stars: connect the constellation ────────────────────────

/** Points of a heart, as a constellation (deterministic so server and client agree). */
const HEART_T = [0, 0.42, 0.85, 1.28, 1.72, 2.2, 2.68];
const HEART = [...HEART_T, Math.PI, ...HEART_T.slice(1).reverse().map((t) => Math.PI * 2 - t)].map((t) => {
  const x = 16 * Math.sin(t) ** 3;
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return [+x.toFixed(2), +y.toFixed(2)] as const;
});
const HEART_PATH = `M${HEART.map(([x, y]) => `${x} ${y}`).join(" L")}Z`;
const SKY = Array.from({ length: 70 }, (_, i) => ({ left: (i * 37.7) % 100, top: (i * 23.3) % 100, size: 1 + ((i * 7) % 3), d: ((i * 13) % 30) / 10 }));

function StarsScene({ model, open, skip }: SceneProps) {
  const t = copyFor(model, COPY);
  const { partnerOne, partnerTwo } = model.wedding;
  return (
    <>
      {SKY.map((p, i) => (
        <span key={i} aria-hidden className={c.dot} style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDelay: `${p.d}s` }} />
      ))}
      <span aria-hidden className={c.shooting} />
      <div className={c.starsMid}>
        <p className={c.openKicker}>{t.stars}</p>
        <svg viewBox="-20 -16 40 36" className={c.constellation} aria-hidden>
          <path d={HEART_PATH} pathLength={1} className={c.cline} />
          {HEART.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="1.15" className={c.halo} style={v({ "--i": i })} />
              <circle r=".55" className={c.cstar} />
            </g>
          ))}
        </svg>
        <p className={c.openNames}>{partnerOne} &amp; {partnerTwo}</p>
        <button type="button" className={c.openBtn} onClick={open}>
          <Star className={c.btnStar} />
          {t.connect}
        </button>
      </div>
      {skip}
    </>
  );
}

// ── Paper Theatre: a pop-up card ───────────────────────────────────────────

function PopupScene({ model, open, skip }: SceneProps) {
  const t = copyFor(model, COPY);
  const { partnerOne, partnerTwo, date } = model.wedding;
  return (
    <>
      <div className={c.popStage}>
        <div className={c.popCard}>
          <div className={c.popBase}><span className={c.popSun} /></div>
          <div className={cn(c.pop, c.pop1)}>
            <Cloud className={c.popCloud} style={{ left: "8%", top: "18%" }} />
            <Cloud className={c.popCloud} style={{ right: "6%", top: "8%", width: "28%" }} />
          </div>
          <div className={cn(c.pop, c.pop2)}>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={c.popHills}>
              <path className={c.hillBack} d="M0 18 C20 4 40 8 56 20 C70 30 86 10 100 16 V40 H0Z" />
              <path className={c.hillFront} d="M0 30 C24 20 50 26 70 32 C84 36 92 28 100 28 V40 H0Z" />
            </svg>
          </div>
          <div className={cn(c.pop, c.pop3)}>
            <div className={c.popArch}>
              <p className={c.popNames}>{partnerOne}<small>&amp;</small>{partnerTwo}</p>
              {date ? <p className={c.popDate}>{date.short}</p> : null}
            </div>
          </div>
          <div className={cn(c.pop, c.pop4)}>
            <Drape className={cn(c.popDrape, c.drapeL)} />
            <Drape className={cn(c.popDrape, c.drapeR)} />
            <div className={c.popValance} />
          </div>
          <button type="button" className={c.popCover} onClick={open} aria-label={model.strings.openInvitation}>
            <span className={c.popFront}>
              <span className={c.popFrontInner}>
                <span className={c.openKicker}>{t.paper}</span>
                <span className={c.popCoverNames}>{partnerOne} &amp; {partnerTwo}</span>
              </span>
            </span>
            <span className={c.popBack} />
          </button>
        </div>
      </div>
      <button type="button" className={cn(c.openBtn, c.popBtn)} onClick={open}>{t.openCard}</button>
      {skip}
    </>
  );
}

// ── Rose Window: the glass assembles and the light comes in ────────────────

function GlassScene({ model, open, skip }: SceneProps) {
  const t = copyFor(model, COPY);
  const { partnerOne, partnerTwo } = model.wedding;
  return (
    <>
      <span aria-hidden className={c.rays} />
      <div className={c.glassMid}>
        <p className={c.openKicker}>{t.glassKicker}</p>
        <button type="button" className={c.roseBtn} onClick={open} aria-label={t.light}>
          <RoseWindow className={c.openRose} shardClass={c.shard} />
        </button>
        <p className={c.openNames}>{partnerOne} &amp; {partnerTwo}</p>
        <button type="button" className={c.openBtn} onClick={open}>{t.light}</button>
      </div>
      {skip}
    </>
  );
}

// ── The Keepsake Box: untie the ribbon, lift the lid ───────────────────────

function KeepsakeScene({ model, open, skip }: SceneProps) {
  const t = copyFor(model, COPY);
  const { partnerOne, partnerTwo, date } = model.wedding;
  return (
    <>
      <p className={cn(c.openKicker, c.boxKicker)}>{t.box}</p>
      <button type="button" className={c.boxStage} onClick={open} aria-label={t.untie}>
        <span className={c.box}>
          <span className={cn(c.face, c.fFront)} />
          <span className={cn(c.face, c.fBack)} />
          <span className={cn(c.face, c.fLeft)} />
          <span className={cn(c.face, c.fRight)} />
          <span className={cn(c.face, c.fBottom)} />
          <span className={c.glow} />
          <span className={c.boxCard}>
            <span className={c.boxCardNames}>{partnerOne}<small>&amp;</small>{partnerTwo}</span>
            {date ? <span className={c.boxCardDate}>{date.short}</span> : null}
          </span>
          <span className={c.lid}>
            <span className={cn(c.face, c.lTop)} />
            <span className={cn(c.face, c.lFront)} />
            <span className={cn(c.face, c.lBack)} />
            <span className={cn(c.face, c.lLeft)} />
            <span className={cn(c.face, c.lRight)} />
            <Bow className={c.boxBow} />
          </span>
        </span>
      </button>
      <button type="button" className={cn(c.openBtn, c.boxBtn)} onClick={open}>{t.untie}</button>
      {skip}
    </>
  );
}

export const CREATIVE_SCENES: Partial<Record<Variant, SceneEntry>> = {
  stars: { className: c.starsOpen, Scene: StarsScene },
  popup: { className: c.popupOpen, Scene: PopupScene },
  glass: { className: c.glassOpen, Scene: GlassScene },
  keepsake: { className: c.keepOpen, Scene: KeepsakeScene },
};

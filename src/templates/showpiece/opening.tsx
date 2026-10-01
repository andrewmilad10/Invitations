"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { OPENED_EVENT } from "../cinematic/opening/envelope-opening";
import { CREATIVE_SCENES } from "./creative-open";
import { LANDMARK_SCENES } from "./landmarks-open";
import type { Phase, SceneEntry } from "./scene";
import { Flower } from "./flower";
import styles from "./showpiece.module.css";
import { TIMING, type Variant } from "./variants";

export type { Variant } from "./variants";
export { Flower } from "./flower";

const SCENES: Partial<Record<Variant, SceneEntry>> = { ...CREATIVE_SCENES, ...LANDMARK_SCENES };

const COPY = {
  en: { invited: "You are invited", evening: "An evening on the Nile", lanterns: "Tap to light the lanterns", book: "Tap the book to open it", herbarium: "A herbarium of", hearts: "Two hearts", toast: "You are invited to a toast", glass: "Tap the glass", skip: "Skip" },
  ar: { invited: "أنتم مدعوون", evening: "أمسية على النيل", lanterns: "اضغط لإضاءة الفوانيس", book: "اضغط على الكتاب لفتحه", herbarium: "كتاب زهور", hearts: "قلبان", toast: "أنتم مدعوون إلى نخب", glass: "اضغط على الكأس", skip: "تخطّي" },
} as const;

/**
 * The opening moment of a Showpiece template, as an overlay on top of the
 * page (which is already rendered underneath, readable without JavaScript).
 * live / sample: shown on load. preview: only after "Replay opening".
 * export: never mounted. Reduced motion: opens straight away.
 */
export function ShowpieceOpening({ model, variant }: { model: InvitationModel; variant: Variant }) {
  const autoShow = model.mode === "live" || model.mode === "sample";
  const [phase, setPhase] = useState<Phase>(autoShow ? "closed" : "done");
  const timers = useRef<number[]>([]);
  const t = COPY[model.locale as keyof typeof COPY] ?? COPY.en;
  const { partnerOne, partnerTwo, initials, date } = model.wedding;

  // Scroll stays locked at the top while the overlay is up.
  const locked = phase !== "done";
  useLayoutEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      html.style.overflow = previous;
    };
  }, [locked]);

  useEffect(() => {
    const pending = timers.current;
    const replay = () => {
      pending.forEach(clearTimeout);
      window.scrollTo(0, 0);
      setPhase("closed");
    };
    window.addEventListener("invitation:replay-opening", replay);
    return () => {
      window.removeEventListener("invitation:replay-opening", replay);
      pending.forEach(clearTimeout);
    };
  }, []);

  const open = useCallback(() => {
    if (phase !== "closed") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [play, leave] = reduced ? [0, 300] : TIMING[variant];
    setPhase("opening");
    timers.current.push(
      window.setTimeout(() => setPhase("leaving"), play),
      window.setTimeout(() => {
        setPhase("done");
        window.dispatchEvent(new CustomEvent(OPENED_EVENT));
      }, play + leave),
    );
  }, [phase, variant]);

  // Lanterns for the Nile: positions fixed per render so server and client agree.
  const lanterns = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ left: (i * 37) % 92 + 4, dx: ((i * 53) % 80) - 40, delay: ((i * 29) % 14) / 10, scale: 0.6 + ((i * 17) % 7) / 10 })), []);

  if (phase === "done") return null;
  const scene = SCENES[variant];
  const cls = scene?.className ?? { gate: styles.gateOpen, nile: styles.nileOpen, herbarium: styles.gardenOpen, toast: styles.toastOpen }[variant as "gate"];
  const skip = (
    <button type="button" className={styles.skip} onClick={open}>
      {t.skip}
    </button>
  );

  return (
    <div className={`${styles.open} ${cls}`} data-phase={phase} data-v={variant} role="dialog" aria-label={model.strings.openInvitation}>
      {scene ? <scene.Scene model={model} phase={phase} open={open} skip={skip} /> : null}

      {variant === "gate" ? (
        <>
          <div aria-hidden className={`${styles.door} ${styles.doorL}`}><div className={styles.doorArch} /><span className={styles.handle} /></div>
          <div aria-hidden className={`${styles.door} ${styles.doorR}`}><div className={styles.doorArch} /><span className={styles.handle} /></div>
          <p className={styles.gateTitle}>{t.invited}</p>
          <button type="button" className={styles.bigSeal} onClick={open} aria-label={model.strings.openInvitation}>
            <span className={`${styles.half} ${styles.halfA}`} />
            <span className={`${styles.half} ${styles.halfB}`} />
            <span className={styles.ini}>{initials[0]}&amp;{initials[1]}</span>
          </button>
          <p className={styles.hint}>{model.strings.tapToOpen}</p>
          {skip}
        </>
      ) : null}

      {variant === "nile" ? (
        <>
          <div aria-hidden className={styles.moon} />
          <div aria-hidden className={styles.water} />
          <div aria-hidden className={styles.felucca}>
            <svg viewBox="0 0 120 90"><path d="M20 70 L100 70 L92 80 L28 80 Z" fill="currentColor" /><path d="M60 6 L60 68 M60 8 L100 64 L60 64 Z" fill="var(--inv-fg)" stroke="currentColor" strokeWidth="1.5" opacity=".9" /></svg>
          </div>
          {lanterns.map((l, i) => (
            <span key={i} aria-hidden className={styles.flying} style={{ left: `${l.left}%`, ["--dx" as string]: `${l.dx}px`, animationDelay: `${l.delay}s`, scale: String(l.scale) }} />
          ))}
          <div className={styles.nileCenter}>
            <p>{t.evening}</p>
            <p className={styles.big}>{partnerOne} &amp; {partnerTwo}</p>
            <button type="button" className={styles.tap} onClick={open}><i aria-hidden />{t.lanterns}</button>
          </div>
          {skip}
        </>
      ) : null}

      {variant === "herbarium" ? (
        <>
          <div aria-hidden className={styles.book}>
            <div className={styles.page}>
              <div>
                <Flower />
                <div className={styles.n}>{partnerOne}</div>
                <small>&amp;</small>
                <div className={styles.n}>{partnerTwo}</div>
                {date ? <small>{date.long}</small> : null}
              </div>
            </div>
            <div className={styles.cover}>
              <div className={styles.coverFront}>
                <div className={styles.coverLabel}><p>{t.herbarium}</p><p className={styles.t}>{t.hearts}</p><p>{date?.year ?? ""}</p></div>
              </div>
              <div className={styles.coverInside} />
            </div>
          </div>
          <p className={styles.hint}>{t.book}</p>
          <button type="button" className={styles.bookTap} onClick={open} aria-label={model.strings.openInvitation} />
          {skip}
        </>
      ) : null}

      {variant === "toast" ? (
        <>
          <div aria-hidden className={styles.rays} />
          <svg aria-hidden className={styles.frame} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path pathLength={1} d="M8 0 H92 L100 8 V92 L92 100 H8 L0 92 V8 Z" />
            <path pathLength={1} d="M10 3 H90 L97 10 V90 L90 97 H10 L3 90 V10 Z" />
          </svg>
          <div className={styles.toastMid}>
            <p>{t.toast}</p>
            <button type="button" className={styles.coupe} onClick={open} aria-label={model.strings.openInvitation}>
              <svg viewBox="0 0 120 150" aria-hidden>
                <defs><clipPath id="sp-bowl"><path d="M14 30 Q60 86 106 30 Z" /></clipPath></defs>
                <rect className={styles.wine} x="0" y="30" width="120" height="40" clipPath="url(#sp-bowl)" />
                <path d="M10 28 Q60 92 110 28" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M10 28 H110" stroke="currentColor" strokeWidth="2.5" />
                <path d="M60 66 V128 M36 132 H84" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className={`${styles.toastNames} ${styles.foil}`}>{partnerOne} &amp; {partnerTwo}</div>
            <p style={{ marginTop: 12 }}>{t.glass}</p>
          </div>
          <Bubbles active={phase !== "closed"} />
          {skip}
        </>
      ) : null}
    </div>
  );
}

/** Champagne bubbles rising from the glass. */
function Bubbles({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!active || !c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d");
    if (!g) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth, H = c.clientHeight;
    c.width = W * d; c.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
    const gold = getComputedStyle(c).getPropertyValue("--gold").trim() || "white";
    const P = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - 0.5) * 90, y: H / 2 - 10, vx: (Math.random() - 0.5) * 1.2, vy: -1 - Math.random() * 4, r: 1 + Math.random() * 3 }));
    const t0 = performance.now();
    let raf = 0;
    const f = (t: number) => {
      const age = (t - t0) / 1000;
      g.clearRect(0, 0, W, H);
      g.fillStyle = gold;
      for (const p of P) {
        p.x += p.vx; p.y += p.vy;
        g.globalAlpha = Math.max(0, 1 - age / 3);
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.fill();
      }
      if (age < 3) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={ref} aria-hidden className={styles.canvas} style={{ zIndex: 3 }} />;
}

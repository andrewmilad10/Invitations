"use client";

import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import s from "./meadow.module.css";

/**
 * Words embroidered in place: a navy running stitch is sewn round each letter,
 * then red satin fills it in. The SVG fits itself to the text once the font
 * has loaded. Shown complete without motion; the sewing is triggered by the
 * root's data-ready (hero) or by the reveal engine's data-in (elsewhere).
 */
export function Sewn({ text, label, className, size = 96 }: { text: string; label?: string; className?: string; size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let alive = true;
    const fit = () => {
      const svg = ref.current, t = svg?.querySelector("text");
      if (!alive || !svg || !t) return;
      const b = t.getBBox();
      if (b.width) svg.setAttribute("viewBox", `${b.x - 8} ${b.y - 8} ${b.width + 16} ${b.height + 16}`);
    };
    if (document.fonts) document.fonts.ready.then(fit);
    else fit();
    return () => {
      alive = false;
    };
  }, [text]);
  const t = { x: 500, y: size, fontSize: size, textAnchor: "middle" as const };
  return (
    <svg ref={ref} className={cn(s.sewn, className)} viewBox={`0 0 1000 ${Math.round(size * 1.4)}`} role="img" aria-label={label ?? text}>
      <defs>
        <pattern id={`${id}s`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <rect width="5" height="5" className={s.satA} />
          <rect width="1.8" height="5" className={s.satB} />
          <rect x="3.6" width=".7" height="5" className={s.satC} />
        </pattern>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="-3000" y="-2000" width="7000" height="5000">
          <text {...t} className={s.mk} strokeWidth={size * 0.14}>{text}</text>
        </mask>
      </defs>
      <text {...t} className={s.fl} fill={`url(#${id}s)`}>{text}</text>
      <text {...t} className={s.ol} mask={`url(#${id}m)`}>{text}</text>
    </svg>
  );
}

/** Scroll progress of an element through the screen, written to a CSS variable on it. */
function useScrollVar(name: string, calc: (r: DOMRect) => number) {
  const ref = useRef<HTMLDivElement>(null);
  const calcRef = useRef(calc);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const run = () => {
      raf = 0;
      el.style.setProperty(name, `${(Math.max(0, Math.min(1, calcRef.current(el.getBoundingClientRect()))) * 100).toFixed(1)}%`);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [name]);
  return ref;
}

/** Two threads rise out of their spools as the guest scrolls, and meet in a heart. */
export function Spools({ src }: { src: string }) {
  const ref = useScrollVar("--rise", (r) => (innerHeight * 0.92 - r.top) / (r.height * 1.05));
  return (
    <div ref={ref} className={s.spools}>
      {/* eslint-disable-next-line @next/next/no-img-element -- transparent embroidery cut-out */}
      <img src={src} alt="" loading="lazy" />
    </div>
  );
}

/** The day: a navy running stitch is sewn down the timeline as the guest scrolls, a needle at its tip. */
export function Thread({ children }: { children: ReactNode }) {
  const ref = useScrollVar("--grow", (r) => (innerHeight * 0.65 - r.top) / r.height);
  return (
    <div ref={ref} className={s.day}>
      <span className={s.thread} aria-hidden />
      <svg className={s.needle} viewBox="0 0 10 34" aria-hidden>
        <path d="M5 0 L6.4 26 Q5 34 3.6 26 Z" className={s.needleBody} />
        <ellipse cx="5" cy="5" rx="1" ry="2.6" className={s.needleEye} />
      </svg>
      <ol className={s.tl}>{children}</ol>
    </div>
  );
}

/** Photos changing inside the stitched frame; swipe or tap a dot. */
export function FrameShow({ frame, children, label }: { frame: string; children: ReactNode; label: string }) {
  const slides = Children.toArray(children);
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);
  const start = useRef(0);
  const n = slides.length;
  useEffect(() => {
    if (!auto || n < 2) return;
    const id = window.setInterval(() => setCur((c) => (c + 1) % n), 4200);
    return () => clearInterval(id);
  }, [auto, n]);
  const go = (i: number) => {
    setAuto(false);
    setCur(((i % n) + n) % n);
  };
  return (
    <>
      <div
        className={s.frame}
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          const dx = e.clientX - start.current;
          if (Math.abs(dx) > 30) go(cur + (dx < 0 ? 1 : -1));
        }}
      >
        <div className={s.ph}>
          {slides.map((c, i) => (
            <div key={i} className={cn(s.slide, i === cur && s.on)}>
              {c}
            </div>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- transparent embroidered frame over the photo */}
        <img src={frame} alt="" loading="lazy" className={s.frameArt} />
      </div>
      {n > 1 ? (
        <div className={s.dots}>
          {slides.map((_, i) => (
            <button key={i} type="button" aria-label={`${label} ${i + 1}`} aria-current={i === cur} onClick={() => go(i)} />
          ))}
        </div>
      ) : null}
    </>
  );
}

"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import s from "./olive.module.css";

/** The sun-and-moon switch: night turns the courtyard and the whole page to evening. */
export function DayNight({ labels }: { labels: [string, string] }) {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="olive"]');
    if (!root) return;
    if (night) root.setAttribute("data-night", "");
    else root.removeAttribute("data-night");
  }, [night]);
  return (
    <div className={s.dn} role="group" aria-label={`${labels[0]} / ${labels[1]}`}>
      <button type="button" aria-pressed={!night} aria-label={labels[0]} onClick={() => setNight(false)}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </button>
      <button type="button" aria-pressed={night} aria-label={labels[1]} onClick={() => setNight(true)}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
      </button>
    </div>
  );
}

/** The stone wall and gate rise from the bottom of the day as the guest scrolls. */
export function RisingGate({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const run = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const q = Math.max(0, Math.min(1, (innerHeight - r.top) / (r.height * 1.6)));
      el.style.clipPath = `inset(${((1 - q) * 100).toFixed(1)}% 0 0 0)`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    addEventListener("scroll", on, { passive: true });
    return () => {
      removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
      el.style.clipPath = "";
    };
  }, []);
  // eslint-disable-next-line @next/next/no-img-element -- transparent ink sketch
  return <img ref={ref} className={s.gate} src={src} alt="" loading="lazy" />;
}

/** Photos changing inside the shuttered window; swipe or tap a dot. */
export function WindowShow({ frame, children, label }: { frame: string; children: ReactNode; label: string }) {
  const slides = Children.toArray(children);
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);
  const start = useRef(0);
  const n = slides.length;
  useEffect(() => {
    if (!auto || n < 2) return;
    const id = window.setInterval(() => setCur((c) => (c + 1) % n), 4500);
    return () => clearInterval(id);
  }, [auto, n]);
  const go = (i: number) => {
    setAuto(false);
    setCur(((i % n) + n) % n);
  };
  return (
    <>
      <div
        className={s.window}
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          const d = e.clientX - start.current;
          if (Math.abs(d) > 30) go(cur + (d < 0 ? 1 : -1));
        }}
      >
        <div className={s.ph}>
          {slides.map((c, i) => (
            <div key={i} className={cn(s.slide, i === cur && s.on)}>
              {c}
            </div>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- transparent window with shutters */}
        <img src={frame} alt="" loading="lazy" className={s.windowArt} />
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

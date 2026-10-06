"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import s from "./fan.module.css";

/** The sky and the branches move at different speeds behind the arch as the guest scrolls or moves the pointer. */
export function DepthWindow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = [...el.querySelectorAll<HTMLElement>("[data-depth]")];
    let raf = 0, mx = 0;
    const run = () => {
      raf = 0;
      const y = Math.min(scrollY, innerHeight);
      layers.forEach((l) => {
        const d = Number(l.dataset.depth);
        l.style.transform = `translate3d(${(mx * d * 30).toFixed(1)}px, ${(y * d).toFixed(1)}px, 0)`;
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    const move = (e: PointerEvent) => {
      mx = e.clientX / innerWidth - 0.5;
      on();
    };
    addEventListener("scroll", on, { passive: true });
    addEventListener("pointermove", move);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className={s.window}>
      {children}
    </div>
  );
}

/** The day as a folded paper card: each panel unfolds as it scrolls into view. */
export function FoldCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const panels = [...list.children] as HTMLElement[];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    panels.forEach((p) => p.setAttribute("data-folded", ""));
    const timers: number[] = [];
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = panels.indexOf(e.target as HTMLElement);
          timers.push(window.setTimeout(() => e.target.removeAttribute("data-folded"), (i % 3) * 170));
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    panels.forEach((p) => io.observe(p));
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      panels.forEach((p) => p.removeAttribute("data-folded"));
    };
  }, []);
  return (
    <ol ref={ref} className={s.fold}>
      {children}
    </ol>
  );
}

/** Photos changing inside the paper-cut arch; swipe or tap a dot. */
export function ArchShow({ frame, children, label }: { frame: string; children: ReactNode; label: string }) {
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
        className={s.frame}
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
        {/* eslint-disable-next-line @next/next/no-img-element -- transparent paper-cut frame */}
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

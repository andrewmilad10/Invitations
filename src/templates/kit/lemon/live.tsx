"use client";

import { useEffect, useRef, type ReactNode } from "react";
import s from "./lemon.module.css";

/** Photos that turn in 3D as the guest swipes, like a coverflow. */
export function Coverflow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const car = ref.current;
    if (!car) return;
    let raf = 0;
    const turn = () => {
      raf = 0;
      const c = car.getBoundingClientRect(), mid = c.left + c.width / 2;
      car.querySelectorAll<HTMLElement>(":scope > *").forEach((f) => {
        const b = f.getBoundingClientRect();
        const k = Math.max(-1.5, Math.min(1.5, (b.left + b.width / 2 - mid) / b.width));
        f.style.transform = `translateZ(${-Math.abs(k) * 120}px) rotateY(${-k * 32}deg)`;
        f.style.zIndex = String(10 - Math.round(Math.abs(k) * 4));
        f.style.opacity = String(1 - Math.min(0.45, Math.abs(k) * 0.3));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(turn);
    };
    const first = car.children[1] as HTMLElement | undefined;
    if (first) car.scrollLeft = first.offsetLeft - (car.clientWidth - first.offsetWidth) / 2;
    turn();
    car.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      car.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className={s.car}>
      {children}
    </div>
  );
}

/** The day's timeline: a gold line grows down it as the guest scrolls. */
export function GrowingLine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const tl = ref.current;
    if (!tl) return;
    let raf = 0;
    const grow = () => {
      raf = 0;
      const r = tl.getBoundingClientRect();
      tl.style.setProperty("--grow", `${Math.max(0, Math.min(100, ((innerHeight * 0.7 - r.top) / r.height) * 100))}%`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(grow);
    };
    grow();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <ol ref={ref} className={s.tl}>
      {children}
    </ol>
  );
}

/** The dress-code card leans towards the finger. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const b = el.getBoundingClientRect();
        el.style.setProperty("--ry", `${(((e.clientX - b.left) / b.width) * 2 - 1) * 6}deg`);
        el.style.setProperty("--rx", `${-(((e.clientY - b.top) / b.height) * 2 - 1) * 6}deg`);
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--rx", "0deg");
        ref.current?.style.setProperty("--ry", "0deg");
      }}
    >
      {children}
    </div>
  );
}

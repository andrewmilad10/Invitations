"use client";

/* eslint-disable @next/next/no-img-element -- transparent ticket and petal cut-outs */
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import s from "./theatre.module.css";

const ART = "/templates/opening-night";
const PETALS = Array.from({ length: 16 }, (_, i) => ({ left: (i * 41) % 96, x: ((i % 5) - 2) * 40, r: (i % 2 ? 1 : -1) * (180 + i * 30), d: 4.5 + (i % 4) * 0.9, delay: i * 0.17, w: 22 + (i % 3) * 8, src: `${ART}/petal${(i % 3) + 1}.webp` }));

function Ticket({ label, value, small, tearLabel, onTorn }: { label: string; value: string; small?: boolean; tearLabel: string; onTorn: () => void }) {
  const [torn, setTorn] = useState(false);
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const start = useRef<number | null>(null);
  const tear = () => {
    if (torn) return;
    setTorn(true);
    navigator.vibrate?.(8);
    onTorn();
  };
  return (
    <div className={cn(s.tk, torn && s.torn)}>
      <img src={`${ART}/ticket-body.webp`} alt="" />
      <div className={s.tkBody}>
        <span className={s.tkLabel}>{label}</span>
        <span className={cn(s.tkVal, small && s.tkSmall)} aria-hidden={!torn}>{value}</span>
      </div>
      <img
        className={s.stub}
        src={`${ART}/ticket-stub.webp`}
        alt=""
        style={{ "--dx": `${dx}px`, transform: torn ? undefined : `translateX(${dx}px) rotate(${dx / 5}deg)`, transition: drag ? "none" : undefined } as React.CSSProperties}
      />
      <span className={s.tear} aria-hidden>{tearLabel}</span>
      <button
        type="button"
        className={s.grab}
        aria-label={`${tearLabel}: ${label}`}
        onPointerDown={(e) => {
          start.current = e.clientX;
          setDrag(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (start.current === null) return;
          const d = Math.max(0, Math.min(60, e.clientX - start.current));
          setDx(d);
          if (d > 44) {
            start.current = null;
            setDrag(false);
            tear();
          }
        }}
        onPointerUp={() => {
          if (start.current === null) return;
          start.current = null;
          setDrag(false);
          if (dx < 6) tear();
          else setDx(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDrag(false);
          setDx(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            tear();
          }
        }}
      />
    </div>
  );
}

/** Three tickets: tear each stub off along its perforation to reveal the day, the month and the year. */
export function Tickets({ items, tearLabel, done }: { items: { label: string; value: string; small?: boolean }[]; tearLabel: string; done: string }) {
  const [count, setCount] = useState(0);
  const all = count >= items.length;
  return (
    <div className={cn(s.tickets, all && s.allTorn)}>
      <div className={s.tkRow}>
        {items.map((it, i) => (
          <Ticket key={i} {...it} tearLabel={tearLabel} onTorn={() => setCount((c) => c + 1)} />
        ))}
      </div>
      <p className={s.married} aria-live="polite">{all ? done : ""}</p>
      {all ? (
        <span className={s.rain} aria-hidden>
          {PETALS.map((p, i) => (
            <img key={i} src={p.src} alt="" style={{ left: `${p.left}%`, width: p.w, "--x": `${p.x}px`, "--r": `${p.r}deg`, animationDuration: `${p.d}s`, animationDelay: `${p.delay + 0.5}s` } as React.CSSProperties} />
          ))}
        </span>
      ) : null}
    </div>
  );
}

/** Photos changing inside the opera-box frame; swipe or tap a diamond. */
export function OperaBox({ frame, children, label }: { frame: string; children: ReactNode; label: string }) {
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
        className={s.oval}
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          const d = e.clientX - start.current;
          if (Math.abs(d) > 30) go(cur + (d < 0 ? 1 : -1));
        }}
      >
        <div className={s.ovalPh}>
          {slides.map((c, i) => (
            <div key={i} className={cn(s.slide, i === cur && s.on)}>
              {c}
            </div>
          ))}
        </div>
        <img src={frame} alt="" loading="lazy" className={s.ovalArt} />
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

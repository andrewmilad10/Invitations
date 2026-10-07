"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { drawCurtains, OPEN_MS, paintPaste } from "./paint";
import s from "./henna.module.css";

const ART = "/templates/henna-tent";
export type CurtainMode = "closed" | "opening" | "open";

/** The red henna-velvet curtains, drawn to fill their box. Closed they hang still; opening they gather to the sides; open they frame the stage. */
export function Curtains({ mode }: { mode: CurtainMode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef({ mode, t0: 0 });
  useEffect(() => {
    modeRef.current = { mode, t0: performance.now() };
  }, [mode]);
  useEffect(() => {
    const cv = ref.current, ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = new Image(), right = new Image();
    left.src = `${ART}/curtain-l.webp`;
    right.src = `${ART}/curtain-r.webp`;
    let W = 0, H = 0, raf = 0, ready = false, alive = true;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const frame = (now: number) => {
      raf = 0;
      if (!alive || !ready) return;
      const { mode: m, t0 } = modeRef.current;
      const ms = m === "open" || reduced ? 1e9 : m === "opening" ? now - t0 : 0;
      drawCurtains(ctx, W, H, left, right, ms);
      if (m === "opening" && ms < OPEN_MS + 200) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(() => {
      size();
      kick();
    });
    ro.observe(cv);
    Promise.all([left.decode(), right.decode()])
      .then(() => {
        ready = true;
        size();
        kick();
      })
      .catch(() => {});
    const id = window.setInterval(kick, 250); // picks up mode changes
    return () => {
      alive = false;
      ro.disconnect();
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={ref} className={s.curtains} aria-hidden />;
}

const MOTIFS = ["hand", "lantern", "paisley", "rose", "candles", "cone"];
/** Faint gold henna motifs drifting slowly (fixed positions so the server and the browser agree). */
export function Motifs({ count, className }: { count: number; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- transparent line-art motif
        <img key={i} src={`${ART}/m-${MOTIFS[(i + 2) % 6]}.webp`} alt="" style={{ left: `${(i * 29 + 7) % 88}%`, top: `${10 + ((i * 43) % 80)}%`, width: 46 + (i % 3) * 16, animationDelay: `${-i * 1.7}s` }} />
      ))}
    </span>
  );
}

function petals(n: number) {
  for (let i = 0; i < n; i++) {
    const q = document.createElement("i");
    q.className = cn(s.petal, i % 4 === 0 && s.petalGold);
    q.style.left = `${Math.random() * 100}vw`;
    q.style.setProperty("--x", `${Math.random() * 160 - 80}px`);
    q.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    q.style.animationDuration = `${3.5 + Math.random() * 3}s`;
    q.style.animationDelay = `${Math.random() * 1.2}s`;
    document.body.append(q);
    window.setTimeout(() => q.remove(), 8000);
  }
}

/** One brass tray with dried henna on it; rub it away to read the value underneath. */
function Tray({ value, label, rub, seed, onDone }: { value: string; label: string; rub: boolean; seed: number; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (rub && ref.current) paintPaste(ref.current, seed);
  }, [rub, seed]);
  const st = useRef<{ down: boolean; last: [number, number] | null; moves: number }>({ down: false, last: null, moves: 0 });
  const finish = () => {
    if (done) return;
    setDone(true);
    navigator.vibrate?.(20);
    onDone();
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current, g = c?.getContext("2d");
    if (!c || !g || !st.current.down || done) return;
    const r = c.getBoundingClientRect();
    const p: [number, number] = [((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height];
    g.globalCompositeOperation = "destination-out";
    g.lineCap = "round";
    g.lineWidth = c.width * 0.15;
    g.beginPath();
    g.moveTo(...(st.current.last ?? p));
    g.lineTo(...p);
    g.stroke();
    st.current.last = p;
    if (++st.current.moves % 6 === 0) {
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let left = 0, n = 0;
      for (let i = 3; i < d.length; i += 4 * 37) {
        n++;
        if (d[i] > 40) left++;
      }
      if (left / n < 0.42) finish();
    }
  };
  return (
    <div className={cn(s.tray, done && s.trayDone)}>
      <span className={s.brass} aria-hidden />
      <span className={s.trayVal}>{value}</span>
      {rub ? (
        <canvas
          ref={ref}
          width={300}
          height={300}
          className={s.paste}
          tabIndex={0}
          role="button"
          aria-label={label}
          onPointerDown={(e) => {
            st.current.down = true;
            st.current.last = null;
            e.currentTarget.setPointerCapture(e.pointerId);
            move(e);
          }}
          onPointerMove={move}
          onPointerUp={() => (st.current.down = false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") finish();
          }}
        />
      ) : null}
    </div>
  );
}

/** Three brass trays: day, month, year. Rubbing all three clear rains petals and shows the line underneath. */
export function Trays({ values, label, rub, after }: { values: [string, string, string]; label: string; rub: boolean; after: ReactNode }) {
  const [count, setCount] = useState(0);
  const all = !rub || count >= 3;
  useEffect(() => {
    if (rub && count === 3) petals(40);
  }, [rub, count]);
  return (
    <>
      <div className={s.trays}>
        {values.map((v, i) => (
          <Tray key={i} value={v} label={label} rub={rub} seed={i + 3} onDone={() => setCount((c) => c + 1)} />
        ))}
      </div>
      <div className={cn(s.revealed, all && s.revealedOn)}>{after}</div>
    </>
  );
}

/** Photos changing inside the mashrabiya frame; swipe or tap a dot. */
export function FrameShow({ children, label }: { children: ReactNode; label: string }) {
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
        {/* eslint-disable-next-line @next/next/no-img-element -- transparent carved frame over the photo */}
        <img src={`${ART}/mashrabiya.webp`} alt="" loading="lazy" className={s.frameArt} />
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

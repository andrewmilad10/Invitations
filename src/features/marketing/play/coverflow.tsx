"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PlayScreen } from "./play-screen";
import { usePreview, type PreviewDesign } from "./preview-dialog";

/**
 * The most-loved designs in depth: the one in the middle comes forward and
 * plays (its opening, then a slow scroll through the site); the others turn
 * away on both sides, smaller and paler the further they are. Arrows, dots,
 * arrow keys, swiping, or a tap on a side design bring another forward.
 * When one has played through, the next comes forward; hovering holds it.
 */
export function Coverflow({ designs }: { designs: PreviewDesign[] }) {
  const n = designs.length;
  const [cur, setCur] = useState(0);
  const [seen, setSeen] = useState(false);
  const [w, setW] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const hold = useRef(false);
  const timer = useRef(0);
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  const preview = usePreview();

  const go = useCallback((i: number) => setCur(((i % n) + n) % n), [n]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const measure = () => {
      setW(first.current?.offsetWidth ?? 300);
      setNarrow(window.innerWidth < 760);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onScrollStart = useCallback(
    (dur: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (!hold.current) go(cur + 1);
      }, (dur + 3.4) * 1000);
    },
    [cur, go],
  );

  const reach = narrow ? 2 : 4;
  return (
    <div>
      <div
        ref={root}
        role="region"
        aria-roledescription="carousel"
        aria-label="Most loved designs"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(cur + 1);
          if (e.key === "ArrowLeft") go(cur - 1);
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && (hold.current = true)}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          hold.current = false;
        }}
        onPointerDown={(e) => (swipe.current = { x: e.clientX, moved: false })}
        onPointerUp={(e) => {
          const s = swipe.current;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 40) {
            s.moved = true;
            go(cur + (dx < 0 ? 1 : -1));
          }
        }}
        className="relative mx-auto h-[calc(var(--cw)*844/390+2.5rem)] touch-pan-y select-none overflow-hidden outline-none [--cw:min(62vw,15rem)] md:[--cw:clamp(15rem,23vw,20rem)]"
      >
        <div className="absolute inset-0 [perspective:1700px] [perspective-origin:50%_45%]">
          {designs.map((d, i) => {
            let off = i - cur;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            const a = Math.abs(off);
            const s = Math.sign(off);
            const x = a === 0 ? 0 : s * (w * (narrow ? 0.5 : 0.62) + (a - 1) * w * (narrow ? 0.22 : 0.34));
            const z = -a * (narrow ? 160 : 150) - (a ? 60 : 0);
            const ry = a === 0 ? 0 : -s * (a === 1 ? 34 : 42);
            const hidden = a > reach;
            return (
              <button
                key={d.id}
                ref={i === 0 ? first : undefined}
                type="button"
                aria-label={a === 0 ? `${d.name}, open the preview` : `Bring ${d.name} forward`}
                aria-current={a === 0}
                tabIndex={hidden ? -1 : 0}
                onClick={() => {
                  if (swipe.current?.moved) {
                    swipe.current = null;
                    return;
                  }
                  if (a === 0) preview(d);
                  else go(i);
                }}
                className={cn(
                  "absolute start-1/2 top-4 aspect-[390/844] w-[var(--cw)] -ms-[calc(var(--cw)/2)] overflow-hidden rounded-[1.5rem] bg-muted transition-[transform,opacity] duration-[850ms] ease-[cubic-bezier(.22,.8,.24,1)] [transform-style:preserve-3d] motion-reduce:transition-none",
                  a === 0 ? "shadow-[0_46px_70px_-30px_rgb(34_29_26/0.6)]" : "shadow-[0_30px_50px_-28px_rgb(34_29_26/0.55)]",
                  hidden && "pointer-events-none",
                )}
                style={{ transform: `translateX(${x}px) translateZ(${z}px) rotateY(${ry}deg)`, zIndex: 100 - a, opacity: hidden ? 0 : 1 }}
              >
                <PlayScreen id={d.id} playing={a === 0 && seen} eager={a <= 1} speed={150} onScrollStart={a === 0 ? onScrollStart : undefined} className="size-full" />
                <span aria-hidden className="pointer-events-none absolute inset-0 bg-background transition-opacity duration-700" style={{ opacity: a === 0 ? 0 : Math.min(0.75, 0.12 + a * 0.14) }} />
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => go(cur - 1)} aria-label="Previous design" className="absolute start-3 top-1/2 z-[200] grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow-[0_10px_24px_-14px_rgb(34_29_26/0.5)] transition-transform hover:scale-105 md:start-[max(1.2rem,calc(50%-36rem))] md:size-13">
          <ChevronLeft className="size-5" />
        </button>
        <button type="button" onClick={() => go(cur + 1)} aria-label="Next design" className="absolute end-3 top-1/2 z-[200] grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow-[0_10px_24px_-14px_rgb(34_29_26/0.5)] transition-transform hover:scale-105 md:end-[max(1.2rem,calc(50%-36rem))] md:size-13">
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div aria-live="polite" className="mx-auto mt-4 grid max-w-6xl items-center gap-4 px-5 text-center sm:px-8 md:grid-cols-[1fr_auto_1fr] md:text-start">
        <div className="grid gap-0.5">
          <p className="font-serif text-3xl leading-tight">{designs[cur].name}</p>
          {designs[cur].ar ? (
            <p lang="ar" dir="rtl" className="font-[family-name:var(--font-amiri)] text-muted-foreground md:text-left">
              {designs[cur].ar}
            </p>
          ) : null}
        </div>
        <div role="tablist" aria-label="Choose a design" className="order-first flex flex-wrap justify-center gap-1.5 md:order-none">
          {designs.map((d, i) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={i === cur}
              aria-label={d.name}
              onClick={() => go(i)}
              className={cn("h-2 rounded-full transition-[width,background-color] duration-400", i === cur ? "w-9 bg-primary" : "w-2 bg-input hover:bg-muted-foreground/50")}
            />
          ))}
        </div>
        <div className="flex justify-center gap-2 md:justify-end">
          <button type="button" onClick={() => preview(designs[cur])} className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm hover:border-muted-foreground">
            Preview
          </button>
          <Link href={designs[cur].href} className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
            Use this design
          </Link>
        </div>
      </div>
    </div>
  );
}

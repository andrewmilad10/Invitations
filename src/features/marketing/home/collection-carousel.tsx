"use client";

import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { TemplateManifest } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { cardCouple, designHref } from "../gallery/design-card";
import { Stationery } from "../stationery";

/**
 * The homepage collection: invitation cards laid on a gentle curve, like
 * stationery spread across a table. Drag, swipe, arrow keys or the buttons
 * move it; the centre card opens its design. It never moves on its own and
 * never takes over the page scroll.
 *
 * Geometry: cards sit on the inside of a cylinder facing the viewer. Every
 * frame is computed from one number (`pos`), written straight to the DOM —
 * no React re-render while it moves.
 */

interface Geometry {
  card: number; // card width, px
  radius: number; // cylinder radius, px
  depth: number; // 0..1 — how much the sides come forward
  visible: number; // cards beyond this offset fade out
}

const DESKTOP: Geometry = { card: 230, radius: 1150, depth: 0.55, visible: 3.2 };
const MOBILE: Geometry = { card: 150, radius: 560, depth: 0.35, visible: 2.2 };
const FLAT: Geometry = { card: 200, radius: 100000, depth: 0, visible: 3.2 }; // reduced motion

/** Transform and opacity of card `i` — shared by the first (server) render and every frame. */
function layout(d: number, spread: number, geo: Geometry) {
  const step = ((geo.card * 1.22) / geo.radius) * spread; // angle between cards
  const a = d * step;
  const x = Math.sin(a) * geo.radius;
  const z = (1 - Math.cos(a)) * geo.radius * geo.depth;
  const opacity = Math.min(1, Math.max(0, geo.visible - Math.abs(d)));
  return {
    transform: `translate3d(-50%, -50%, 0) translateX(${x.toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateY(${(-a * (180 / Math.PI)).toFixed(2)}deg)`,
    opacity,
    zIndex: 100 - Math.round(Math.abs(d) * 10),
  };
}

export function CollectionCarousel({ designs }: { designs: TemplateManifest[] }) {
  const n = designs.length;
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const state = useRef({ pos: 0, spread: 1, geo: DESKTOP, reduced: false });
  const [active, setActive] = useState(0);
  const wrap = useCallback((d: number) => ((((d + n / 2) % n) + n) % n) - n / 2, [n]);
  // Draw only the cards near the centre; the rest are empty shells.
  const near = (i: number) => Math.abs(wrap(i - active)) <= 5;

  /** Write every card's transform for the current position. */
  const render = useCallback(() => {
    const { pos, spread, geo } = state.current;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const l = layout(wrap(i - pos), spread, geo);
      el.style.transform = l.transform;
      el.style.opacity = l.opacity.toFixed(3);
      el.style.visibility = l.opacity <= 0 ? "hidden" : "visible";
      el.style.zIndex = String(l.zIndex);
    });
    const current = ((Math.round(pos) % n) + n) % n;
    setActive((prev) => (prev === current ? prev : current));
  }, [n, wrap]);

  const goTo = useCallback(
    (target: number, velocity = 0) => {
      const s = state.current;
      gsap.killTweensOf(s, "pos");
      gsap.to(s, {
        pos: target,
        duration: s.reduced ? 0 : Math.min(1.5, 0.7 + Math.abs(target - s.pos) * 0.1 + Math.abs(velocity) * 0.06),
        ease: "power4.out",
        onUpdate: render,
      });
    },
    [render],
  );

  const move = useCallback((by: number) => goTo(Math.round(state.current.pos) + by), [goTo]);

  // Geometry per screen, reduced motion, and a one-time fan-out when the section is first seen.
  useEffect(() => {
    const s = state.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      s.reduced = reduced.matches;
      s.geo = reduced.matches ? { ...FLAT, card: small.matches ? MOBILE.card : FLAT.card } : small.matches ? MOBILE : DESKTOP;
      stage.current?.style.setProperty("--card", `${s.geo.card}px`);
      render();
    };
    apply();
    reduced.addEventListener("change", apply);
    small.addEventListener("change", apply);

    let observer: IntersectionObserver | null = null;
    const el = stage.current;
    const inView = el && el.getBoundingClientRect().top < window.innerHeight;
    if (el && !s.reduced && !inView) {
      s.spread = 0.25;
      render();
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer?.disconnect();
          gsap.to(s, { spread: 1, duration: 1.6, ease: "power3.out", delay: 0.15, onUpdate: render });
        },
        { threshold: 0.25 },
      );
      observer.observe(el);
    }
    return () => {
      reduced.removeEventListener("change", apply);
      small.removeEventListener("change", apply);
      observer?.disconnect();
      gsap.killTweensOf(s);
    };
  }, [render]);

  // Drag / swipe with a little momentum.
  const drag = useRef<{ x: number; pos: number; moved: boolean; samples: [number, number][] } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    gsap.killTweensOf(state.current, "pos");
    drag.current = { x: e.clientX, pos: state.current.pos, moved: false, samples: [[e.clientX, e.timeStamp]] };
  };
  const onPointerMove = (e: PointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    if (!g.moved && Math.abs(dx) > 6) {
      g.moved = true;
      stage.current?.setPointerCapture(e.pointerId);
    }
    if (!g.moved) return;
    const per = state.current.geo.card * 1.22;
    state.current.pos = g.pos - dx / per;
    g.samples.push([e.clientX, e.timeStamp]);
    if (g.samples.length > 5) g.samples.shift();
    render();
  };
  const onPointerUp = () => {
    const g = drag.current;
    if (!g) return;
    if (g.moved) {
      const [x0, t0] = g.samples[0];
      const [x1, t1] = g.samples[g.samples.length - 1];
      const v = (x1 - x0) / Math.max(16, t1 - t0); // px per ms
      const per = state.current.geo.card * 1.22;
      // Momentum: a quick flick glides several cards, a slow drag settles on the nearest.
      const fling = Math.max(-6, Math.min(6, (-v * 320) / per));
      goTo(Math.round(state.current.pos + fling), v);
    }
    // Keep `moved` until the click that follows the drag has been swallowed.
    setTimeout(() => (drag.current = null), 0);
  };

  // Sideways trackpad / shift-wheel scrolling glides the cards, then settles.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let settle = 0;
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      const s = state.current;
      gsap.killTweensOf(s, "pos");
      s.pos += dx / (s.geo.card * 1.22);
      render();
      window.clearTimeout(settle);
      settle = window.setTimeout(() => goTo(Math.round(s.pos)), 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settle);
    };
  }, [render, goTo]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
  };

  const current = designs[active];

  return (
    <div>
      {/* The stage bleeds to the edges of the section; the caption stays in the column. */}
      <div
        ref={stage}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured invitation designs"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-[330px] cursor-grab touch-pan-y select-none overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-[470px] [--card:230px]"
        style={{ perspective: "1500px", perspectiveOrigin: "50% 45%" } as CSSProperties}
      >
        {/* A soft shadow for the cards to rest on. */}
        <span aria-hidden className="pointer-events-none absolute bottom-[13%] left-1/2 h-8 w-[60%] -translate-x-1/2 rounded-[50%] bg-foreground/10 blur-2xl" />

        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {designs.map((t, i) => {
            const [a, b, date] = cardCouple(i);
            const centre = i === active;
            const first = layout(wrap(i), 1, DESKTOP);
            return (
              <Link
                key={t.id}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                href={designHref(t.id, null)}
                draggable={false}
                tabIndex={centre ? 0 : -1}
                aria-hidden={!centre}
                aria-label={centre ? `Open ${t.name}` : undefined}
                onClick={(e) => {
                  if (drag.current?.moved) return e.preventDefault();
                  if (!centre) {
                    e.preventDefault();
                    goTo(state.current.pos + wrap(i - state.current.pos));
                  }
                }}
                className="absolute left-1/2 top-1/2 block w-[var(--card)] will-change-transform [backface-visibility:hidden]"
                style={{ transform: first.transform, opacity: first.opacity, zIndex: first.zIndex, visibility: first.opacity <= 0 ? "hidden" : "visible" }}
              >
                {near(i) ? (
                  <Stationery
                    template={t}
                    partnerOne={a}
                    partnerTwo={b}
                    dateLabel={date}
                    sizes="240px"
                    className={cn("rounded-[3px] shadow-[0_24px_40px_-24px_rgb(34_29_26/0.55)]", t.stationery.shape === "square" && "mx-auto w-[88%]")}
                  />
                ) : (
                  <span className="block aspect-[5/7]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Caption and controls */}
      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-2 items-end gap-x-4 gap-y-5 px-5 sm:grid-cols-[1fr_auto_1fr] sm:px-8 xl:px-0">
        <Link href="/invitations" className="self-center text-sm underline underline-offset-4 hover:text-muted-foreground">
          See all {n} designs
        </Link>
        <div className="order-first col-span-2 text-center sm:order-none sm:col-span-1" aria-live="polite">
          <p className="mb-3 hidden text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground sm:block">Drag · Swipe · Scroll sideways</p>
          <Link href={designHref(current.id, null)} className="font-serif text-3xl font-light hover:underline hover:underline-offset-4 sm:text-4xl">
            {current.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="capitalize">{current.categories.slice(0, 2).join(" · ")}</span> · {current.palettes.length} colours
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => move(-1)} aria-label="Previous design" className="grid size-11 place-items-center rounded-full border bg-background transition hover:border-foreground/40">
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next design" className="grid size-11 place-items-center rounded-full border bg-background transition hover:border-foreground/40">
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

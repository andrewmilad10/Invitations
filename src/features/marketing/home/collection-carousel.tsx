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
 * The homepage collection: invitation cards standing on the inside of a deep
 * curve that wraps around the viewer — the front card sits furthest away,
 * the cards on either side come forward and turn in towards you. It turns
 * slowly on its own in one smooth, continuous motion and pauses while you
 * look (hover, focus) or touch it. Drag, swipe, scroll sideways, arrow keys
 * or the buttons turn it; the card in the middle opens its design.
 *
 * Every frame is computed from one number (`pos`), written straight to the
 * DOM — no React re-render while it moves.
 */

interface Geometry {
  card: number; // card width, px
  radius: number; // curve radius, px
  gap: number; // space between cards, × card width
  visible: number; // cards each side before fading out
  speed: number; // cards per second when turning on its own
}

const DESKTOP: Geometry = { card: 190, radius: 1050, gap: 1.28, visible: 4.6, speed: 0.22 };
const MOBILE: Geometry = { card: 128, radius: 480, gap: 1.24, visible: 2.8, speed: 0.2 };

/** Transform and fade of the card at offset `d` from the middle. */
function layout(d: number, spread: number, geo: Geometry) {
  const step = (geo.card * geo.gap) / geo.radius; // angle between cards
  const a = d * step * spread;
  const x = Math.sin(a) * geo.radius;
  const z = (1 - Math.cos(a)) * geo.radius; // sides come towards you
  const fade = Math.min(1, Math.max(0, geo.visible + 0.6 - Math.abs(d)));
  return {
    transform: `translate3d(-50%, -50%, 0) translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${((-a * 180) / Math.PI).toFixed(2)}deg)`,
    fade,
    zIndex: Math.round(1000 - Math.abs(d) * 10),
  };
}

export function CollectionCarousel({ designs }: { designs: TemplateManifest[] }) {
  const n = designs.length;
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const state = useRef({ pos: 0, spread: 1, geo: DESKTOP, reduced: false, hover: false, focus: false, seen: true, idleUntil: 0, tweening: false });
  const [active, setActive] = useState(0);
  const drag = useRef<{ x: number; pos: number; moved: boolean; samples: [number, number][] } | null>(null);
  const wrap = useCallback((d: number) => ((((d + n / 2) % n) + n) % n) - n / 2, [n]);
  // Draw only the cards on the ring; the rest are empty shells.
  const near = (i: number) => Math.abs(wrap(i - active)) <= DESKTOP.visible + 2;

  /** Write every card's transform for the current position. */
  const render = useCallback(() => {
    const { pos, spread, geo } = state.current;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const d = wrap(i - pos);
      if (Math.abs(d) > geo.visible + 1) {
        if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
        return;
      }
      const l = layout(d, spread, geo);
      el.style.transform = l.transform;
      // Fade the faces, not the card: opacity on the card would flatten its 3D (and show fronts at the back).
      el.style.setProperty("--fade", l.fade.toFixed(3));
      el.style.visibility = l.fade <= 0 ? "hidden" : "visible";
      el.style.zIndex = String(l.zIndex);
    });
    const current = ((Math.round(pos) % n) + n) % n;
    setActive((prev) => (prev === current ? prev : current));
  }, [n, wrap]);

  /** After someone turns the ring, it waits a moment before drifting on. */
  const rest = (ms = 3500) => {
    state.current.idleUntil = performance.now() + ms;
  };

  const goTo = useCallback(
    (target: number, velocity = 0) => {
      const s = state.current;
      gsap.killTweensOf(s, "pos");
      s.tweening = true;
      rest();
      gsap.to(s, {
        pos: target,
        duration: s.reduced ? 0 : Math.min(1.8, 0.9 + Math.abs(target - s.pos) * 0.08 + Math.abs(velocity) * 0.06),
        ease: "power3.out",
        onUpdate: render,
        onComplete: () => {
          s.tweening = false;
          rest();
        },
      });
    },
    [render],
  );

  const move = useCallback((by: number) => goTo(Math.round(state.current.pos) + by), [goTo]);

  // Geometry per screen, reduced motion, the opening fan-out, and the slow turn.
  useEffect(() => {
    const s = state.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      s.reduced = reduced.matches;
      s.geo = small.matches ? MOBILE : DESKTOP;
      stage.current?.style.setProperty("--card", `${s.geo.card}px`);
      render();
    };
    apply();
    reduced.addEventListener("change", apply);
    small.addEventListener("change", apply);

    const el = stage.current;
    const inView = el && el.getBoundingClientRect().top < window.innerHeight;
    let opened = Boolean(inView) || s.reduced;
    if (!opened) {
      s.spread = 0.15;
      render();
    }
    // Only turn while on screen; the first time it is seen, the ring opens out.
    const observer = new IntersectionObserver(
      ([entry]) => {
        s.seen = entry.isIntersecting;
        if (entry.isIntersecting && !opened) {
          opened = true;
          gsap.to(s, { spread: 1, duration: 1.8, ease: "power3.out", delay: 0.1, onUpdate: render });
        }
      },
      { threshold: 0.2 },
    );
    if (el) observer.observe(el);

    const tick = (_time: number, deltaMs: number) => {
      if (s.reduced || s.hover || s.focus || !s.seen || s.tweening || drag.current || document.hidden) return;
      if (performance.now() < s.idleUntil) return;
      s.pos += (Math.min(deltaMs, 64) / 1000) * s.geo.speed;
      render();
    };
    gsap.ticker.add(tick);

    return () => {
      reduced.removeEventListener("change", apply);
      small.removeEventListener("change", apply);
      observer.disconnect();
      gsap.ticker.remove(tick);
      gsap.killTweensOf(s);
    };
  }, [render]);

  // Drag / swipe with a little momentum.
  const perCard = () => perCardOf(state.current.geo);
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    gsap.killTweensOf(state.current, "pos");
    state.current.tweening = false;
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
    state.current.pos = g.pos - dx / perCard();
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
      // Momentum: a quick flick glides several cards, a slow drag settles on the nearest.
      const fling = Math.max(-6, Math.min(6, (-v * 320) / perCard()));
      goTo(Math.round(state.current.pos + fling), v);
    } else rest();
    // Keep `moved` until the click that follows the drag has been swallowed.
    setTimeout(() => (drag.current = null), 0);
  };

  // Sideways trackpad / shift-wheel scrolling turns the ring, then settles.
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
      s.tweening = true;
      s.pos += dx / perCardOf(s.geo);
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
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") state.current.hover = true;
        }}
        onPointerLeave={() => {
          state.current.hover = false;
          rest(1200);
        }}
        onFocus={() => (state.current.focus = true)}
        onBlur={() => (state.current.focus = false)}
        className="relative h-[300px] cursor-grab touch-pan-y select-none overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-[460px] [--card:190px]"
        style={{ perspective: "1100px", perspectiveOrigin: "50% 50%" } as CSSProperties}
      >
        {/* A faint ampersand watermark behind the curve, and soft light on the floor. */}
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] select-none font-serif text-[15rem] font-light leading-none text-foreground/[0.045] sm:text-[24rem]">
          &amp;
        </span>
        <span aria-hidden className="pointer-events-none absolute bottom-[6%] left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[50%] bg-foreground/[0.07] blur-3xl" />

        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {designs.map((t, i) => {
            const [a, b, date] = cardCouple(i);
            const centre = i === active;
            const d0 = wrap(i);
            const first = Math.abs(d0) > DESKTOP.visible + 1 ? null : layout(d0, 1, DESKTOP);
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
                className="absolute left-1/2 top-1/2 block w-[var(--card)] opacity-[var(--fade,1)] will-change-transform"
                style={first ? ({ transform: first.transform, zIndex: first.zIndex, "--fade": first.fade } as CSSProperties) : { visibility: "hidden" }}
              >
                {near(i) ? (
                  <span className={cn("relative block overflow-hidden rounded-[14px] shadow-[0_16px_28px_-14px_rgb(34_29_26/0.4),0_2px_6px_rgb(34_29_26/0.08)] transition-transform duration-500 hover:-translate-y-1.5", t.stationery.shape === "square" && "mx-auto w-[88%]")}>
                    <Stationery template={t} partnerOne={a} partnerTwo={b} dateLabel={date} sizes="240px" />
                    {/* The middle card catches the light as it arrives. */}
                    {centre ? <span key={active} aria-hidden className="carousel-glint pointer-events-none absolute inset-0" /> : null}
                  </span>
                ) : (
                  <span className="block aspect-[5/7]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Caption and controls */}
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-2 items-end gap-x-4 gap-y-5 px-5 sm:grid-cols-[1fr_auto_1fr] sm:px-8 xl:px-0">
        <Link href="/invitations" className="self-center text-sm underline underline-offset-4 hover:text-muted-foreground">
          See all {n} designs
        </Link>
        <div className="order-first col-span-2 text-center sm:order-none sm:col-span-1" aria-live="polite">
          <p className="mb-3 hidden text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground sm:block">Drag · Swipe · Scroll sideways</p>
          <Link key={current.id} href={designHref(current.id, null)} className="carousel-caption inline-block font-serif text-3xl font-light hover:underline hover:underline-offset-4 sm:text-4xl">
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

const perCardOf = (g: Geometry) => g.card * g.gap;

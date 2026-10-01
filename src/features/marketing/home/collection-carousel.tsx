"use client";

import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
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
  perspective: number; // px — smaller is deeper
  speed: number; // cards per second when turning on its own
}

const DESKTOP: Geometry = { card: 200, radius: 1000, gap: 1.22, visible: 4.4, perspective: 900, speed: 0.25 };
const MOBILE: Geometry = { card: 132, radius: 430, gap: 1.2, visible: 2.6, perspective: 560, speed: 0.25 };

/** Transform, fade and side light of the card at offset `d` from the middle. */
function layout(d: number, spread: number, geo: Geometry) {
  const step = (geo.card * geo.gap) / geo.radius; // angle between cards
  const a = d * step * spread;
  const x = Math.sin(a) * geo.radius;
  const z = (1 - Math.cos(a)) * geo.radius; // the sides come towards you
  return {
    transform: `translate3d(-50%, -50%, 0) translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${((-a * 180) / Math.PI).toFixed(2)}deg)`,
    fade: Math.min(1, Math.max(0, geo.visible + 0.6 - Math.abs(d))),
    // Light from the middle: a card turned in is shaded on its outer edge.
    shade: Math.min(0.32, Math.abs(Math.sin(a)) * 0.45),
    side: a < 0 ? -1 : 1,
  };
}


/** One card on the curve. Memoised: moving the curve never re-renders it. */
const CurveCard = memo(function CurveCard({
  template,
  index,
  centre,
  drawn,
  first,
  setRef,
  onPick,
}: {
  template: TemplateManifest;
  index: number;
  centre: boolean;
  drawn: boolean;
  first: CSSProperties;
  setRef: (i: number, el: HTMLAnchorElement | null) => void;
  onPick: (i: number, e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const [a, b, date] = cardCouple(index);
  return (
    <Link
      ref={(el) => setRef(index, el)}
      href={designHref(template.id, null)}
      draggable={false}
      tabIndex={centre ? 0 : -1}
      aria-hidden={!centre}
      aria-label={centre ? `Open ${template.name}` : undefined}
      onClick={(e) => onPick(index, e)}
      className="absolute left-1/2 top-1/2 block w-[var(--card)] will-change-transform [backface-visibility:hidden]"
      style={first}
    >
      {drawn ? (
        <span className={cn("relative block overflow-hidden rounded-[14px] shadow-[0_18px_30px_-16px_rgb(34_29_26/0.45),0_2px_6px_rgb(34_29_26/0.08)]", template.stationery.shape === "square" && "mx-auto w-[88%]")}>
          <Stationery template={template} partnerOne={a} partnerTwo={b} dateLabel={date} sizes="240px" />
          {/* Side light: written per frame as plain opacity (cheap for the browser). */}
          <span aria-hidden data-shade className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(34_29_26/0.9),transparent_70%)] opacity-0 will-change-[opacity,transform]" />
          {/* The middle card catches a glint of light as it arrives. */}
          {centre ? (
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="carousel-glint absolute inset-y-0 left-0 w-1/2" />
            </span>
          ) : null}
        </span>
      ) : (
        <span className="block aspect-[5/7] rounded-[14px] bg-muted" />
      )}
    </Link>
  );
});

export function CollectionCarousel({ designs }: { designs: TemplateManifest[] }) {
  const n = designs.length;
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const last = useRef<{ t: string; o: string; v: string; s: string; z: string; side: number }[]>([]);
  const state = useRef({ pos: 0, spread: 1, geo: DESKTOP, reduced: false, hover: false, focus: false, seen: true, idleUntil: 0, tweening: false, active: 0 });
  const drag = useRef<{ x: number; pos: number; moved: boolean; samples: [number, number][] } | null>(null);
  const [active, setActive] = useState(0);
  // Cards are drawn once and kept: the ones near the start straight away, the rest while the page is idle.
  const [drawnUpTo, setDrawnUpTo] = useState(6);
  const wrap = useCallback((d: number) => ((((d + n / 2) % n) + n) % n) - n / 2, [n]);

  /** Write every card's position for the current frame — DOM only, no React. */
  const render = useCallback(() => {
    const s = state.current;
    const { pos, spread, geo } = s;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const prev = (last.current[i] ??= { t: "", o: "", v: "", s: "", z: "", side: 0 });
      const d = wrap(i - pos);
      const show = Math.abs(d) <= geo.visible + 0.6;
      // Cards off the curve leave the page entirely (fewer layers for the browser to juggle).
      const v = show ? "block" : "none";
      if (prev.v !== v) {
        el.style.display = prev.v = v;
        el.style.visibility = "visible";
      }
      if (!show) return;
      const l = layout(d, spread, geo);
      if (prev.t !== l.transform) el.style.transform = prev.t = l.transform;
      const o = l.fade.toFixed(3);
      if (prev.o !== o) el.style.opacity = prev.o = o;
      const shade = el.querySelector<HTMLElement>("[data-shade]");
      if (shade) {
        const sh = l.shade.toFixed(3);
        if (prev.s !== sh) shade.style.opacity = prev.s = sh;
        // A card left of the middle is shaded on its left (outer) edge, and the other way round.
        if (prev.side !== l.side) {
          shade.style.transform = l.side < 0 ? "none" : "scaleX(-1)";
          prev.side = l.side;
        }
      }
      const z = String(1000 - Math.round(Math.abs(d) * 10));
      if (prev.z !== z) el.style.zIndex = prev.z = z;
    });
    const current = ((Math.round(pos) % n) + n) % n;
    if (current !== s.active) {
      s.active = current;
      setActive(current);
    }
  }, [n, wrap]);

  const setRef = useCallback(
    (i: number, el: HTMLAnchorElement | null) => {
      cards.current[i] = el;
      if (el && last.current[i]) last.current[i] = { t: "", o: "", v: "", s: "", z: "", side: 0 };
    },
    [],
  );

  /** After someone turns the curve, it waits a moment before drifting on. */
  const rest = (ms = 3000) => {
    state.current.idleUntil = performance.now() + ms;
  };

  const goTo = useCallback(
    (target: number, velocity = 0) => {
      const s = state.current;
      gsap.killTweensOf(s, "pos");
      s.tweening = true;
      gsap.to(s, {
        pos: target,
        duration: s.reduced ? 0 : Math.min(1.6, 0.8 + Math.abs(target - s.pos) * 0.08 + Math.abs(velocity) * 0.05),
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

  const onPick = useCallback(
    (i: number, e: MouseEvent<HTMLAnchorElement>) => {
      if (drag.current?.moved) return e.preventDefault();
      if (i !== state.current.active) {
        e.preventDefault();
        goTo(state.current.pos + wrap(i - state.current.pos));
      }
    },
    [goTo, wrap],
  );

  // Draw the remaining cards a few at a time while the browser is idle, nearest first.
  useEffect(() => {
    if (drawnUpTo >= n) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 120));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setDrawnUpTo((k) => Math.min(n, k + 4)));
    return () => cancel(id);
  }, [drawnUpTo, n]);
  // The order cards are drawn in: outwards from the first, both ways round.
  // Where each card starts (also the server's drawing, before any script runs).
  const firstStyles = useMemo(
    () =>
      designs.map((_, i): CSSProperties => {
        const d = wrap(i);
        if (Math.abs(d) > DESKTOP.visible + 0.6) return { display: "none" };
        const l = layout(d, 1, DESKTOP);
        return { transform: l.transform, opacity: l.fade, zIndex: 1000 - Math.round(Math.abs(d) * 10) };
      }),
    [designs, wrap],
  );
  const order = useMemo(() => {
    const rank = new Array<number>(n);
    for (let i = 0; i < n; i++) rank[i] = Math.abs(wrap(i)) * 2 - (wrap(i) > 0 ? 1 : 0);
    return rank;
  }, [n, wrap]);

  // Geometry per screen, reduced motion, the opening fan-out, and the slow turn.
  useEffect(() => {
    const s = state.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      s.reduced = reduced.matches;
      s.geo = small.matches ? MOBILE : DESKTOP;
      const el = stage.current;
      el?.style.setProperty("--card", `${s.geo.card}px`);
      if (el) el.style.perspective = `${s.geo.perspective}px`;
      render();
    };
    apply();
    reduced.addEventListener("change", apply);
    small.addEventListener("change", apply);

    const el = stage.current;
    let opened = s.reduced || Boolean(el && el.getBoundingClientRect().top < window.innerHeight * 0.8);
    if (!opened) {
      s.spread = 0.2;
      render();
    }
    // Only turn while on screen; the first time it is seen, the curve opens out.
    const observer = new IntersectionObserver(
      ([entry]) => {
        s.seen = entry.isIntersecting;
        if (entry.isIntersecting && !opened) {
          opened = true;
          gsap.to(s, { spread: 1, duration: 1.6, ease: "power3.out", onUpdate: render });
        }
      },
      { threshold: 0.15 },
    );
    if (el) observer.observe(el);

    const tick = (_t: number, deltaMs: number) => {
      if (s.reduced || s.hover || s.focus || !s.seen || s.tweening || drag.current || document.hidden) return;
      if (performance.now() < s.idleUntil) return;
      s.pos += (Math.min(deltaMs, 50) / 1000) * s.geo.speed;
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

  // Newly drawn cards need their position written.
  useEffect(() => {
    render();
  }, [drawnUpTo, render]);

  // Drag / swipe follows the finger 1:1, then glides on with momentum.
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
    state.current.pos = g.pos - dx / perCardOf(state.current.geo);
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
      const fling = Math.max(-6, Math.min(6, (-v * 300) / perCardOf(state.current.geo)));
      goTo(Math.round(state.current.pos + fling), v);
    } else rest();
    // Keep `moved` until the click that follows the drag has been swallowed.
    setTimeout(() => (drag.current = null), 0);
  };

  // Sideways trackpad / shift-wheel scrolling turns the curve, then settles.
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
          rest(800);
        }}
        onFocus={() => (state.current.focus = true)}
        onBlur={() => (state.current.focus = false)}
        className="relative h-[310px] cursor-grab touch-pan-y select-none overflow-hidden outline-none [perspective:900px] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-[470px] [--card:200px]"
      >
        {/* A faint ampersand watermark behind the curve. */}
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] select-none font-serif text-[15rem] font-light leading-none text-foreground/[0.045] sm:text-[24rem]">
          &amp;
        </span>
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {designs.map((t, i) => (
            <CurveCard key={t.id} template={t} index={i} centre={i === active} drawn={order[i] < drawnUpTo} first={firstStyles[i]} setRef={setRef} onPick={onPick} />
          ))}
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

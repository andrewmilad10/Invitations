"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { OPENED_EVENT } from "../cinematic/opening/envelope-opening";
import styles from "./showpiece.module.css";
import type { Variant } from "./opening";

/**
 * Motion for a Showpiece page, switched on only for live / sample pages and
 * never with reduced motion. It sets data-fx="on" on the root (which arms
 * the hidden "before" states in CSS) and then:
 * - [data-fx] elements get data-in when they scroll into view;
 * - [data-progress] timelines draw (--p) and their [data-step]s light up;
 * - [data-tilt] cards lean towards the pointer;
 * - [data-depth] layers drift with pointer and scroll.
 * Without it, every element is shown in its final state.
 */
export function ShowpieceEffects({ model }: { model: InvitationModel }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!(model.mode === "live" || model.mode === "sample")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = marker.current?.closest<HTMLElement>("[data-showpiece]");
    if (!root) return;
    root.dataset.fx = "on";

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.25 },
    );
    root.querySelectorAll("[data-fx]").forEach((el) => {
      // What's already on screen stays as it is.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.85) el.setAttribute("data-in", "");
      else io.observe(el);
    });

    const timelines = [...root.querySelectorAll<HTMLElement>("[data-progress]")];
    const tilts = [...root.querySelectorAll<HTMLElement>("[data-tilt]")];
    const layers = [...root.querySelectorAll<HTMLElement>("[data-depth]")];
    let px = 0, py = 0, frame = 0;
    const draw = () => {
      frame = 0;
      const mid = window.innerHeight * 0.62;
      for (const tl of timelines) {
        const r = tl.getBoundingClientRect();
        tl.style.setProperty("--p", Math.min(1, Math.max(0, (mid - r.top) / r.height)).toFixed(3));
        tl.querySelectorAll("[data-step]").forEach((s) => s.toggleAttribute("data-lit", s.getBoundingClientRect().top < mid));
      }
      const sy = Math.min(window.scrollY, window.innerHeight);
      for (const l of layers) {
        const d = Number(l.dataset.depth);
        l.style.transform = `translate3d(${(px * 26 * d).toFixed(1)}px, ${(sy * d * 0.35 + py * 14 * d).toFixed(1)}px, 0)`;
      }
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const onPointer = (e: PointerEvent) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      for (const t of tilts) {
        const r = t.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const local = t.dataset.tilt === "page";
        const x = local ? (e.clientX - r.left) / r.width - 0.5 : px;
        const y = local ? (e.clientY - r.top) / r.height - 0.5 : py;
        if (local && (x < -0.6 || x > 0.6 || y < -0.6 || y > 0.6)) { t.style.transform = ""; continue; }
        t.style.transform = `rotateY(${(x * (local ? 12 : 22)).toFixed(2)}deg) rotateX(${(-y * (local ? 10 : 16)).toFixed(2)}deg)`;
      }
      queue();
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    draw();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(frame);
      delete root.dataset.fx;
    };
  }, [model.mode]);
  return <span ref={marker} hidden />;
}

/**
 * The hero's sky: gold flecks and petals falling after the gate opens, or
 * twinkling stars over the Nile. Pauses when off screen.
 */
export function HeroSky({ model, variant }: { model: InvitationModel; variant: Variant }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || model.mode === "export") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const g = c.getContext("2d");
    if (!g) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const css = getComputedStyle(c);
    const tint = (variant === "nile" ? css.getPropertyValue("--inv-fg") : css.getPropertyValue("--gold")).trim() || "white";
    let W = 0, H = 0;
    type P = { x: number; y: number; r: number; v: number; s: number; petal: boolean };
    let parts: P[] = [];
    const size = () => {
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * d; c.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
      const n = variant === "nile" ? 140 : 46;
      parts = Array.from({ length: n }, (_, i) => ({ x: Math.random() * W, y: variant === "nile" ? Math.random() * H * 0.7 : -Math.random() * H, r: variant === "nile" ? Math.random() * 1.3 + 0.3 : 2 + Math.random() * 4, v: 0.4 + Math.random() * 0.9, s: Math.random() * 6.28, petal: i % 3 === 0 }));
    };
    size();
    window.addEventListener("resize", size);

    let on = false, raf = 0, started = variant === "nile" || model.mode === "preview";
    const t0 = performance.now();
    const frame = (t: number) => {
      raf = 0;
      if (!on) return;
      g.clearRect(0, 0, W, H);
      g.fillStyle = tint;
      for (const p of parts) {
        if (variant === "nile") {
          g.globalAlpha = reduced ? 0.8 : 0.45 + 0.45 * Math.sin(t / 900 + p.s);
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.28); g.fill();
        } else if (started) {
          const fast = (t - t0) / 1000 < 4 ? 1.6 : 0.7;
          p.y += p.v * fast; p.s += 0.02; p.x += Math.sin(p.s) * 0.5;
          if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
          g.globalAlpha = p.petal ? 0.55 : 0.85;
          g.save(); g.translate(p.x, p.y); g.rotate(p.s);
          if (p.petal) { g.beginPath(); g.ellipse(0, 0, p.r * 1.6, p.r * 0.8, 0, 0, 6.28); g.fill(); }
          else g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
          g.restore();
        }
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(c);
    const begin = () => { started = true; };
    window.addEventListener(OPENED_EVENT, begin);
    if (model.mode === "live" || model.mode === "sample") {
      // Without an opening on screen (replayed or skipped), start anyway.
      const fallback = window.setTimeout(begin, 6000);
      return () => { clearTimeout(fallback); io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("resize", size); window.removeEventListener(OPENED_EVENT, begin); };
    }
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("resize", size); window.removeEventListener(OPENED_EVENT, begin); };
  }, [model.mode, variant]);
  return <canvas ref={ref} aria-hidden className={styles.canvas} />;
}

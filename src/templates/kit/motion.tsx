"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";

/**
 * The kit's one motion engine. It does nothing visible by itself: it sets
 * data-fx="on" on the template root (which arms the hidden "before" states in
 * CSS) and then marks things as they arrive, so each template's CSS decides
 * what the motion looks like.
 *
 * - [data-k]          gets data-in when it scrolls into view (once);
 *                     children of [data-k-stagger] get --i (their index).
 * - [data-k-parallax] moves with scroll by its factor (translateY only).
 * - [data-k-progress] gets --p, 0 → 1 as it crosses the viewport.
 *
 * Live and sample pages only, never with reduced motion. Without it, every
 * element shows in its final state (editor, exports, no JavaScript).
 */
export function KitMotion({ model }: { model: InvitationModel }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!(model.mode === "live" || model.mode === "sample")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = marker.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    root.dataset.fx = "on";

    root.querySelectorAll<HTMLElement>("[data-k-stagger]").forEach((group) => {
      Array.from(group.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));
    });

    // Clip-path variants start fully clipped, which IntersectionObserver
    // reports as never visible, so those are watched through their parent.
    const CLIPPED = new Set(["mask", "mask-up", "wipe"]);
    const waiting = new Map<Element, Element[]>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          waiting.get(e.target)?.forEach((el) => el.setAttribute("data-in", ""));
          waiting.delete(e.target);
          io.unobserve(e.target);
        }),
      // Fires once the top edge is 12% up the screen, however tall the element.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    root.querySelectorAll<HTMLElement>("[data-k]").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return el.setAttribute("data-in", "");
      const target = CLIPPED.has(el.dataset.k ?? "") && el.parentElement ? el.parentElement : el;
      const list = waiting.get(target);
      if (list) list.push(el);
      else {
        waiting.set(target, [el]);
        io.observe(target);
      }
    });

    const parallax = [...root.querySelectorAll<HTMLElement>("[data-k-parallax]")];
    const progress = [...root.querySelectorAll<HTMLElement>("[data-k-progress]")];
    const small = window.matchMedia("(max-width: 767px)").matches;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of parallax) {
        const r = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect();
        const centre = r.top + r.height / 2 - vh / 2;
        const f = Number(el.dataset.kParallax) * (small ? 0.5 : 1);
        el.style.transform = `translate3d(0, ${(-centre * f).toFixed(1)}px, 0)`;
      }
      for (const el of progress) {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty("--p", p.toFixed(3));
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    if (parallax.length || progress.length) {
      window.addEventListener("scroll", queue, { passive: true });
      window.addEventListener("resize", queue);
      draw();
    }
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(frame);
      delete root.dataset.fx;
    };
  }, [model.mode]);
  return <span ref={marker} hidden />;
}

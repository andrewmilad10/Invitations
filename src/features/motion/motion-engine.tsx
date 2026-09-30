"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * The one engine behind ./motion.tsx. Mounted once per marketing page.
 *
 * - Elements start hidden only when <html> has the `motion` class, which an
 *   inline script adds before first paint unless the visitor prefers reduced
 *   motion. If this engine never starts, a failsafe reveals everything.
 * - Each element animates once. Elements already scrolled past when the page
 *   loads (reload mid-page, back navigation) are shown instantly, so scrolling
 *   back up never finds holes.
 * - Only transform, opacity and clip-path are animated.
 * - Phones: shorter distances, no parallax, native scrolling.
 */

// A gentle, even settle (expo front-loads the movement and reads as fast).
const EASE = "power3.out";
/** One knob for the whole site's pace: every duration, delay and stagger is multiplied by it. */
const TEMPO = 1.45;
const T = (seconds: number) => seconds * TEMPO;
const START = 0.82; // reveal when the element's top reaches 82% of the viewport (~18–20% scrolled in)
const DONE = "motionInit";

type Play = (instant: boolean) => void;

export function MotionEngine() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("motion")) return;

    const small = window.matchMedia("(max-width: 767px)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const dist = small ? 0.5 : 1; // movement distance multiplier
    const ctx = gsap.context(() => {});
    const mm = gsap.matchMedia();
    const initialised: HTMLElement[] = [];
    html.classList.remove("motion-failed");

    /** Run `play` when the element reaches the reveal line (or now / instantly). */
    const whenVisible = (el: Element, play: Play, start = START) => {
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0) return play(true);
      if (r.top < window.innerHeight * start) return play(false);
      ctx.add(() => ScrollTrigger.create({ trigger: el, start: `top ${start * 100}%`, once: true, onEnter: () => play(false) }));
    };

    const fromVars = (variant: string | undefined): gsap.TweenVars => {
      switch (variant) {
        case "fade":
          return {};
        case "left":
          return { x: -40 * dist };
        case "right":
          return { x: 40 * dist };
        case "scale":
          return { scale: 0.96, y: 16 * dist };
        default:
          return { y: 50 * dist };
      }
    };

    const shown = { opacity: 1, x: 0, y: 0, scale: 1 };
    const settle = (targets: gsap.TweenTarget, vars: gsap.TweenVars, instant: boolean) =>
      Array.isArray(targets) && targets.length === 0
        ? null
        : instant
          ? gsap.set(targets, { ...shown, clearProps: "transform" })
          : gsap.to(targets, { ...shown, ease: EASE, clearProps: "transform", ...vars });

    const all = (scope: Element | Document, selector: string): HTMLElement[] => {
      const found = Array.from(scope.querySelectorAll<HTMLElement>(selector));
      if (scope instanceof HTMLElement && scope.matches(selector)) found.unshift(scope);
      return found.filter((el) => {
        if (el.dataset[DONE]) return false;
        el.dataset[DONE] = "1";
        initialised.push(el);
        return true;
      });
    };

    const setup = (scope: Element | Document) =>
      ctx.add(() => {
        // Single elements
        for (const el of all(scope, "[data-motion]")) {
          const from = fromVars(el.dataset.motion);
          gsap.set(el, from);
          const duration = T(Number(el.dataset.duration ?? 900) / 1000);
          const delay = T(Number(el.dataset.delay ?? 0) / 1000);
          whenVisible(el, (instant) => settle(el, { duration, delay }, instant));
        }

        // Sequences: children one after another
        for (const el of all(scope, "[data-stagger]")) {
          const items = Array.from(el.children) as HTMLElement[];
          if (!items.length) continue;
          gsap.set(items, { y: 30 * dist });
          const step = T(Number(el.dataset.stagger || 110) / 1000);
          whenVisible(el, (instant) => settle(items, { duration: T(0.85), stagger: step }, instant));
        }

        // Long grids: each child when it arrives
        for (const el of all(scope, "[data-reveal-group]")) {
          const step = T(Number(el.dataset.revealGroup || 100) / 1000);
          const items = Array.from(el.children) as HTMLElement[];
          if (!items.length) continue;
          gsap.set(items, { y: 36 * dist });
          // Items arriving in the same frame are staggered together.
          let batch: HTMLElement[] = [];
          const queue = (item: HTMLElement) => {
            batch.push(item);
            if (batch.length === 1)
              requestAnimationFrame(() => {
                settle(batch, { duration: T(0.8), stagger: step }, false);
                batch = [];
              });
          };
          const waiting: HTMLElement[] = [];
          for (const item of items) {
            const r = item.getBoundingClientRect();
            if (r.bottom <= 0) settle(item, {}, true);
            else if (r.top < window.innerHeight * 0.92) waiting.push(item);
            else
              ScrollTrigger.create({
                trigger: item,
                start: "top 92%",
                once: true,
                onEnter: () => queue(item),
              });
          }
          settle(waiting, { duration: T(0.8), stagger: step }, false);
        }

        // Masked lines (large headings)
        for (const el of all(scope, "[data-lines]")) {
          const lines = el.querySelectorAll("[data-line]");
          if (!lines.length) continue;
          whenVisible(el, (instant) =>
            // Keep the final inline transform: the hidden state is in CSS.
            // (GSAP reads the CSS translateY(110%) as px, so y goes to 0.)
            instant ? gsap.set(lines, { y: 0, yPercent: 0 }) : gsap.to(lines, { y: 0, yPercent: 0, duration: T(1.05), ease: EASE, stagger: T(0.09) }),
          );
        }

        // Editorial photo reveals
        for (const el of all(scope, "[data-image-reveal]")) {
          const media = el.querySelector("[data-image-media]");
          if (!media) continue;
          gsap.set(media, { scale: 1.08, y: 20 * dist });
          whenVisible(
            el,
            (instant) => {
              if (instant) {
                gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
                gsap.set(media, { scale: 1, y: 0, clearProps: "transform" });
                return;
              }
              gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: T(1.2), ease: EASE });
              gsap.to(media, { scale: 1, y: 0, duration: T(1.4), ease: EASE, clearProps: "transform" });
            },
            0.88,
          );
        }

        // Connecting lines drawn once
        for (const el of all(scope, "[data-draw]")) {
          gsap.set(el, { scaleX: 0, transformOrigin: "left center" });
          whenVisible(el, (instant) => (instant ? gsap.set(el, { scaleX: 1 }) : gsap.to(el, { scaleX: 1, duration: T(1.6), ease: "power2.inOut" })));
        }

        // Parallax: desktop only, gentle
        const parallax = all(scope, "[data-parallax]");
        if (parallax.length)
          mm.add("(min-width: 768px)", () => {
            for (const el of parallax) {
              const speed = Number(el.dataset.parallax || 0.08) * 100;
              const fromTop = el.dataset.parallaxFrom === "top";
              gsap.fromTo(
                el,
                { yPercent: fromTop ? 0 : -speed / 2 },
                {
                  yPercent: fromTop ? speed : speed / 2,
                  ease: "none",
                  scrollTrigger: { trigger: el.parentElement ?? el, start: fromTop ? "top top" : "top bottom", end: "bottom top", scrub: true },
                },
              );
            }
          });
      });

    // Smooth scrolling for wheel and trackpad; touch keeps native scrolling.
    let lenis: Lenis | null = null;
    let raf: ((time: number) => void) | null = null;
    if (!touch) {
      lenis = new Lenis({
        lerp: 0.11,
        wheelMultiplier: 0.95,
        anchors: { offset: -80 },
        prevent: (node) => Boolean(node.closest?.("dialog, [data-lenis-prevent]")),
      });
      lenis.on("scroll", ScrollTrigger.update);
      raf = (time) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    try {
      setup(document);
      html.classList.add("motion-ready");
    } catch {
      html.classList.add("motion-failed");
    }

    // Content added later (gallery filters, "show more") joins the system.
    // Children added to an already-running sequence or grid ("show more",
    // re-rendered items) reveal on their own instead of staying hidden.
    const lateChild = (el: HTMLElement) =>
      ctx.add(() => {
        gsap.set(el, { y: 30 * dist });
        whenVisible(el, (instant) => settle(el, { duration: T(0.8) }, instant), 0.92);
      });
    const observer = new MutationObserver((records) => {
      for (const record of records)
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const parent = node.parentElement;
          if (parent?.dataset[DONE] && (parent.hasAttribute("data-stagger") || parent.hasAttribute("data-reveal-group"))) lateChild(node);
          setup(node);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Fonts and images can change layout: recompute trigger positions once settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    void document.fonts?.ready.then(refresh);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", refresh);
      mm.revert();
      ctx.revert();
      // Let a remount (React strict mode, fast refresh) set everything up again.
      for (const el of initialised) delete el.dataset[DONE];
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}

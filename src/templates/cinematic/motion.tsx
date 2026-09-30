"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { OPENED_EVENT } from "./opening/envelope-opening";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Scroll motion for the cinematic template: gentle reveals of elements marked
 * `data-reveal`, and Lenis smooth scrolling. Only on live/sample pages, only
 * after the envelope has opened, and never with prefers-reduced-motion.
 * Content is fully visible without it (SSR, preview, export, no JS).
 */
export function CinematicMotion({ model }: { model: InvitationModel }) {
  const enabled = model.mode === "live" || model.mode === "sample";
  // With an envelope, motion starts once it's open; otherwise straight away.
  const [opened, setOpened] = useState(false);
  const started = enabled && (model.template.opening === "none" || opened);
  const scope = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled || model.template.opening === "none") return;
    const start = () => setOpened(true);
    window.addEventListener(OPENED_EVENT, start, { once: true });
    return () => window.removeEventListener(OPENED_EVENT, start);
  }, [enabled, model.template.opening]);

  useGSAP(
    () => {
      if (!started || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const root = scope.current?.closest("[data-template]");
      if (!root) return;

      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-reveal]"));
      // Only animate what is still below the fold; what's on screen stays put.
      const below = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
      gsap.set(below, { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch(below, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12, overwrite: true }),
      });

      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    },
    { dependencies: [started] },
  );

  return <span ref={scope} hidden />;
}

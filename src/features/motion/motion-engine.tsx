"use client";

import { useEffect } from "react";

/**
 * Mounted once per marketing page. Loads the motion engine (GSAP, Lenis) only
 * when motion is on, after the page is interactive, so it never delays the
 * first paint; the 4 s failsafe in the root layout reveals everything if it
 * doesn't arrive.
 */
export function MotionEngine() {
  useEffect(() => {
    if (!document.documentElement.classList.contains("motion")) return;
    let cleanup: (() => void) | void;
    let cancelled = false;
    void import("./motion-engine-impl").then(({ startMotion }) => {
      if (!cancelled) cleanup = startMotion();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}

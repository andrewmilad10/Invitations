"use client";

import { useEffect, useRef } from "react";

/**
 * Butter Letter has no opening: the first screen is the invitation itself.
 * Once the page is on screen it is marked ready, so the photo, names and
 * jasmine settle in gently (with reduced motion they are simply there).
 */
export function ButterReady() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => root.setAttribute("data-ready", "")));
    return () => cancelAnimationFrame(id);
  }, []);
  return <span ref={ref} hidden />;
}

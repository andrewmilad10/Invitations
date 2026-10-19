"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Longest a guest waits before the invitation shows, even on a slow connection. */
const MAX_WAIT = 2500;

/**
 * Covers the invitation, in its own background colour, until its first
 * screen is ready: the fonts and the pictures of the opening (the envelope,
 * curtain, fan…) or, without one, of the first screen. Then it fades away,
 * so guests never see the letter drawn piece by piece or the names change
 * font. Only on a slow connection does a small spinner appear. Without
 * JavaScript, CSS lifts it after a few seconds.
 */
export function FirstPaint({ vars }: { vars: Record<string, string> }) {
  const [state, setState] = useState<"wait" | "leaving" | "gone">("wait");

  useEffect(() => {
    let alive = true;
    let fade = 0;
    const finish = () => {
      if (!alive || fade) return;
      setState("leaving");
      fade = window.setTimeout(() => alive && setState("gone"), 450);
    };
    const cap = window.setTimeout(finish, MAX_WAIT);
    void firstScreenReady().then(finish, finish);
    return () => {
      alive = false;
      window.clearTimeout(cap);
      window.clearTimeout(fade);
    };
  }, []);

  if (state === "gone") return null;
  return (
    <div
      aria-hidden
      data-first-paint={state}
      className={cn("pointer-events-none fixed inset-0 z-[100] grid place-items-center bg-inv-bg text-inv-fg transition-opacity duration-[450ms] ease-out", state === "leaving" && "opacity-0")}
      style={{ ...(vars as CSSProperties), animation: "first-paint-lift .4s ease 3.2s forwards" }}
    >
      <span className="relative grid size-11 place-items-center opacity-0 [animation:open-fade_.4s_ease_.7s_forwards]">
        <span className="absolute inset-0 rounded-full border border-current opacity-20" />
        <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-current opacity-70 [animation-duration:1.3s] motion-reduce:animate-none" />
      </span>
    </div>
  );
}

const URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/g;

/** Fonts plus every picture in the opening overlay, or in the first screen when there is none. */
async function firstScreenReady() {
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  const overlay = document.querySelector<HTMLElement>("[data-phase]:not([data-phase='done'])");
  const root = overlay ?? document.body;
  const vh = window.innerHeight;
  const imgs: HTMLImageElement[] = [];
  const urls = new Set<string>();
  const els = root.querySelectorAll<HTMLElement>("*");
  const n = Math.min(els.length, 2500);
  for (let i = 0; i < n; i++) {
    const el = els[i];
    if (el.closest("[data-first-paint]")) continue;
    if (!overlay) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh || r.width === 0) continue;
    }
    if (el instanceof HTMLImageElement) {
      imgs.push(el);
      continue;
    }
    const styles = overlay ? [getComputedStyle(el), getComputedStyle(el, "::before"), getComputedStyle(el, "::after")] : [getComputedStyle(el)];
    for (const s of styles) {
      const bg = s.backgroundImage;
      if (bg && bg !== "none") for (const m of bg.matchAll(URL_RE)) if (!m[1].startsWith("data:")) urls.add(m[1]);
    }
  }
  await Promise.all([
    document.fonts?.ready,
    ...imgs.map((im) => (im.complete && im.naturalWidth ? null : im.decode().catch(() => undefined))),
    ...[...urls].map((u) => {
      const im = new Image();
      im.src = u;
      return im.decode().catch(() => undefined);
    }),
  ]);
}

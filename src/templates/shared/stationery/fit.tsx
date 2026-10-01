"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Words must keep this far (fraction of the card) from the edge. */
const MARGIN = 0.035;
const MIN_ZOOM = 0.55;

/**
 * Holds a card's words and, if they would run off the card (a landscape
 * card, a long name, a long line), sets them a little smaller until they
 * fit. Measured in the browser; the server draws them at the base size.
 */
export function FitWords({ base = 1, children }: { base?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = ref.current;
    const card = box?.parentElement;
    if (!box || !card) return;

    const fit = () => {
      box.style.zoom = String(base);
      const c = card.getBoundingClientRect();
      if (!c.width || !c.height) return;
      let top = Infinity;
      let bottom = -Infinity;
      let left = Infinity;
      let right = -Infinity;
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent?.trim()) continue;
        range.selectNodeContents(n);
        const r = range.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
        left = Math.min(left, r.left);
        right = Math.max(right, r.right);
      }
      if (top === Infinity) return;
      const mh = c.height * MARGIN;
      const mw = c.width * MARGIN;
      const over = top < c.top + mh || bottom > c.bottom - mh || left < c.left + mw || right > c.right - mw;
      if (!over) return;
      const scale = Math.min((c.height - 2 * mh) / (bottom - top), (c.width - 2 * mw) / (right - left), 1);
      box.style.zoom = String(Math.max(MIN_ZOOM, base * scale * 0.98));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(card);
    let alive = true;
    void document.fonts?.ready.then(() => alive && fit());
    return () => {
      alive = false;
      ro.disconnect();
    };
  });

  return (
    <div ref={ref} className="absolute inset-0" style={base === 1 ? undefined : { zoom: base }}>
      {children}
    </div>
  );
}

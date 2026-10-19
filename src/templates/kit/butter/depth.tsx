"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A scene of paper pieces at different depths. Each child marked with
 * data-depth drifts with the guest's pointer (or the phone's tilt) and with
 * scrolling, more for pieces "closer" to the guest, so the collage feels like
 * real layered paper. Only transforms are set; reduced motion leaves it still.
 */
export function Depth({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let id = 0;
    const tick = () => {
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      const r = el.getBoundingClientRect();
      const sy = Math.max(-1, Math.min(1, -r.top / Math.max(1, r.height)));
      el.style.setProperty("--px", px.toFixed(4));
      el.style.setProperty("--py", py.toFixed(4));
      el.style.setProperty("--sy", sy.toFixed(4));
      id = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 25));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("deviceorientation", tilt, { passive: true });
    id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("deviceorientation", tilt);
    };
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

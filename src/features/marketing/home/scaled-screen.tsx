"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Renders children at a phone's real width (390px) and scales them down to fit the frame. */
export function ScaledScreen({ children, width = 390 }: { children: ReactNode; width?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      <div inert className="pointer-events-none origin-top-left" style={{ width, height: (width * 19) / 9, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "../home/live-demo";

/** True device sizes the previews are rendered at, then scaled to fit. */
const DEVICES = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
} as const;

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Scales a fixed-size iframe to the width of its container. */
function useFitScale(targetWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / targetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [targetWidth]);
  return { ref, scale };
}

export function BrowserFrame({ src, title }: { src: string; title: string }) {
  const { width, height } = DEVICES.desktop;
  const { ref, scale } = useFitScale(width);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-[0_30px_70px_-40px_rgb(34_29_26/0.55)]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="ms-3 flex-1 truncate rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">vellum.app/w/emma-and-james</span>
      </div>
      <div ref={ref} className="relative w-full overflow-hidden" style={{ height: scale ? height * scale : undefined, aspectRatio: scale ? undefined : `${width} / ${height}` }}>
        {scale ? (
          <iframe
            key={src}
            src={src}
            title={title}
            className="absolute left-0 top-0 origin-top-left border-0"
            style={{ width, height, transform: `scale(${scale})` }}
          />
        ) : null}
      </div>
    </div>
  );
}

/** The homepage's phone frame, scaled to fit the visitor's screen. */
export function FittedPhone({ src, title }: { src: string; title: string }) {
  const { width, height } = DEVICES.phone;
  const [scale, setScale] = useState(0.8);
  useEffect(() => {
    const update = () => setScale(Math.min(0.8, (window.innerHeight - 160) / height, (window.innerWidth - 60) / width));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [height, width]);
  return <PhoneFrame key={src} src={src} title={title} scale={scale} />;
}

/** Sticky "Customize" bar for phones. */
export function MobileTryBar({ href, templateName }: { href: string; templateName: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <Button asChild size="lg" className="w-full rounded-full">
        <Link href={href}>Customize {templateName}</Link>
      </Button>
    </div>
  );
}

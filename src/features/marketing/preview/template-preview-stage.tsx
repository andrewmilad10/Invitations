"use client";

import { Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import type { ThemePalette } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";
import { PhoneFrame } from "../home/live-demo";

const DEVICES = {
  desktop: { width: 1440, height: 900, label: "Desktop" },
  phone: { width: 390, height: 844, label: "Phone" },
} as const;

type Device = keyof typeof DEVICES;

/**
 * The real template (rendered with the demo wedding) at true device size,
 * scaled to fit: a 1440px browser window or a 390px phone. The page inside
 * is the actual renderer, so what visitors see is exactly what guests get.
 */
export function TemplatePreviewStage({
  templateId,
  templateName,
  palettes,
  swatches,
}: {
  templateId: string;
  templateName: string;
  palettes: ThemePalette[];
  /** Resolved [background, foreground, accent] per palette, for the swatches. */
  swatches: Record<string, [string, string, string]>;
}) {
  const [chosenDevice, setDevice] = useState<Device>("desktop");
  const [palette, setPalette] = useState(palettes[0]?.id ?? "");
  // Small screens always get the phone view; there's no room for a desktop window.
  const small = useMediaQuery("(max-width: 767px)");
  const device: Device = small ? "phone" : chosenDevice;

  const src = `/templates/${templateId}/preview${palette && palette !== palettes[0]?.id ? `?palette=${palette}` : ""}`;

  return (
    <div className="bg-muted">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div role="radiogroup" aria-label="Color palette" className="flex flex-wrap items-center gap-2">
          <span className="me-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">Palette</span>
          {palettes.map((p) => {
            const [bg, fg, accent] = swatches[p.id];
            const active = p.id === palette;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPalette(p.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border bg-background py-1.5 pe-3 ps-1.5 text-xs transition-colors",
                  active ? "border-foreground" : "border-border hover:border-foreground/40",
                )}
              >
                <span className="flex">
                  {[bg, fg, accent].map((c, i) => (
                    <span key={i} className="-ms-1 size-4 rounded-full border border-black/10 first:ms-0" style={{ background: c }} />
                  ))}
                </span>
                {p.label}
              </button>
            );
          })}
        </div>
        <div role="radiogroup" aria-label="Device" className="hidden items-center rounded-full border bg-background p-1 md:flex">
          {(Object.keys(DEVICES) as Device[]).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={device === d}
              onClick={() => setDevice(d)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors",
                device === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {d === "desktop" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
              {DEVICES[d].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 sm:pb-16">
        {device === "desktop" ? (
          <BrowserFrame src={src} title={`${templateName} template — desktop preview`} />
        ) : (
          <div className="flex justify-center">
            <FittedPhone src={src} title={`${templateName} template — phone preview`} />
          </div>
        )}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Shown with sample details. It&apos;s interactive — scroll, open the gallery
          {templateId === "cinematic" ? ", and tap the wax seal" : ""}.{" "}
          <Link href={src} target="_blank" className="underline underline-offset-4">
            Open full screen
          </Link>
        </p>
      </div>
    </div>
  );
}

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

function BrowserFrame({ src, title }: { src: string; title: string }) {
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
function FittedPhone({ src, title }: { src: string; title: string }) {
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

/** Sticky "Try this template" bar for phones. */
export function MobileTryBar({ templateId, templateName }: { templateId: string; templateName: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <Button asChild size="lg" className="w-full rounded-full">
        <Link href={`/create/${templateId}`}>Try the {templateName} template</Link>
      </Button>
    </div>
  );
}

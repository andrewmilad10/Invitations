"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The studio's table: the surface the suite is laid on. Each is drawn in
 * CSS (no images) with a soft window light falling across it.
 */
export const DESKS = {
  linen: { label: "Linen", swatch: "#e6dfd3" },
  marble: { label: "Marble", swatch: "#eeece8" },
  walnut: { label: "Walnut", swatch: "#5b3d2a" },
} as const;
export type Desk = keyof typeof DESKS;

const SURFACE: Record<Desk, CSSProperties> = {
  linen: {
    backgroundColor: "#e6dfd3",
    backgroundImage: [
      "repeating-linear-gradient(0deg, rgb(120 100 80 / 0.05) 0 1px, transparent 1px 3px)",
      "repeating-linear-gradient(90deg, rgb(120 100 80 / 0.045) 0 1px, transparent 1px 3px)",
    ].join(", "),
  },
  marble: {
    backgroundColor: "#eeece8",
    backgroundImage: [
      "linear-gradient(115deg, transparent 38%, rgb(150 145 140 / 0.18) 40%, transparent 43%)",
      "linear-gradient(160deg, transparent 58%, rgb(150 145 140 / 0.12) 60%, transparent 62%)",
      "linear-gradient(80deg, transparent 70%, rgb(150 145 140 / 0.1) 71.5%, transparent 73%)",
      "radial-gradient(120% 80% at 20% 10%, rgb(255 255 255 / 0.6), transparent 60%)",
    ].join(", "),
  },
  walnut: {
    backgroundColor: "#5b3d2a",
    backgroundImage: [
      "repeating-linear-gradient(92deg, rgb(255 255 255 / 0.035) 0 2px, transparent 2px 9px)",
      "repeating-linear-gradient(88deg, rgb(0 0 0 / 0.08) 0 1px, transparent 1px 13px)",
      "linear-gradient(90deg, rgb(0 0 0 / 0.12), transparent 30%, rgb(255 255 255 / 0.04) 60%, rgb(0 0 0 / 0.1))",
    ].join(", "),
  },
};

export function DeskSurface({ desk, children, className }: { desk: Desk; children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative isolate overflow-x-clip", desk === "walnut" ? "text-white" : "text-foreground", className)} style={SURFACE[desk]}>
      {/* Window light across the table, and a soft vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgb(255_255_255/0.32),transparent_45%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgb(0_0_0/0.14))]" />
      {children}
    </div>
  );
}

const DESK_KEY = "vellum:desk";
const DESK_EVENT = "vellum:desk";

function readDesk(): Desk {
  try {
    const d = localStorage.getItem(DESK_KEY);
    return d && d in DESKS ? (d as Desk) : "linen";
  } catch {
    return "linen";
  }
}
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(DESK_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(DESK_EVENT, cb);
  };
}

/** The table the couple chose, remembered on this device. */
export function useDesk(): [Desk, (d: Desk) => void] {
  const desk = useSyncExternalStore(subscribe, readDesk, () => "linen" as Desk);
  const choose = (d: Desk) => {
    try {
      localStorage.setItem(DESK_KEY, d);
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new Event(DESK_EVENT));
  };
  return [desk, choose];
}

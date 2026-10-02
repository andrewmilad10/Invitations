"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { OPENED_EVENT } from "../cinematic/opening/envelope-opening";

export type IntroPhase = "closed" | "opening" | "leaving" | "done";

/**
 * An opening moment for a kit template, as an overlay over the page (which is
 * already rendered underneath and readable without JavaScript).
 *
 * live / sample: shown on load. preview: only after "Replay opening".
 * export: never mounted (the template doesn't render it). Reduced motion:
 * opens straight away. The overlay's data-phase is "closed" until the guest
 * taps, then "opening" and "leaving"; templates style their scene from it.
 * `auto` plays it without waiting for a tap (after `auto` ms).
 */
export function KitIntro({
  model,
  className,
  timing,
  auto,
  label,
  children,
}: {
  model: InvitationModel;
  className?: string;
  /** How long the scene plays before leaving, and how long leaving takes (ms). */
  timing: [play: number, leave: number];
  auto?: number;
  label?: string;
  children: (p: { phase: IntroPhase; open: () => void; skip: ReactNode }) => ReactNode;
}) {
  const autoShow = model.mode === "live" || model.mode === "sample";
  const [phase, setPhase] = useState<IntroPhase>(autoShow ? "closed" : "done");

  const locked = phase !== "done";
  useLayoutEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      html.style.overflow = previous;
    };
  }, [locked]);

  const open = useCallback(() => setPhase((p) => (p === "closed" ? "opening" : p)), []);

  // The scene plays, then leaves; changing phase (or a replay) cancels the timers.
  const [play, leave] = timing;
  const running = phase === "opening" || phase === "leaving";
  useEffect(() => {
    if (!running) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [p, l] = reduced ? [0, 300] : [play, leave];
    const a = window.setTimeout(() => setPhase("leaving"), p);
    const b = window.setTimeout(() => {
      setPhase("done");
      window.dispatchEvent(new CustomEvent(OPENED_EVENT));
    }, p + l);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [running, play, leave]);

  useEffect(() => {
    const replay = () => {
      window.scrollTo(0, 0);
      setPhase("closed");
    };
    window.addEventListener("invitation:replay-opening", replay);
    return () => window.removeEventListener("invitation:replay-opening", replay);
  }, []);

  useEffect(() => {
    if (phase !== "closed" || auto === undefined) return;
    const id = window.setTimeout(open, auto);
    return () => clearTimeout(id);
  }, [phase, auto, open]);

  if (phase === "done") return null;
  const skip = (
    <button
      type="button"
      onClick={open}
      className="absolute end-4 top-4 z-10 rounded-full border border-current/60 bg-black/10 px-3.5 py-1.5 font-inv-body text-xs opacity-80 transition-opacity hover:opacity-100"
    >
      {model.locale === "ar" ? "تخطّي" : "Skip"}
    </button>
  );
  return (
    <div
      role="dialog"
      aria-label={label ?? model.strings.openInvitation}
      data-phase={phase}
      className={cn("fixed inset-0 z-[60] overflow-hidden transition-opacity duration-700 data-[phase=leaving]:opacity-0", className)}
    >
      {children({ phase, open, skip })}
    </div>
  );
}

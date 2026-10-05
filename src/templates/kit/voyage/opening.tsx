"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { OPENED_EVENT } from "../../cinematic/opening/envelope-opening";
import { KitIntro } from "../intro";
import { Anchor } from "./art";
import s from "./voyage.module.css";

const CHIPS = [
  ["-160%", "-180%"],
  ["120%", "-210%"],
  ["-220%", "60%"],
  ["200%", "80%"],
  ["-40%", "-260%"],
];

/**
 * Set Sail's opening: a navy cotton envelope sealed in blue wax stamped with
 * an anchor. The seal cracks in two (with a few chips of wax), the flap lifts
 * and a parchment scroll rises out; the hero then unrolls (see UnrollHero).
 */
export function VoyageOpening({ model }: { model: InvitationModel }) {
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[2700, 1100]}>
      {({ open, skip }) => (
        <>
          <div className={s.stage} onClick={open}>
            <div className={s.envBack} aria-hidden />
            <div className={s.scroll} aria-hidden />
            <div className={s.pocket} aria-hidden />
            <svg className={s.folds} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path d="M0 100 L46 53 M100 100 L54 53" />
            </svg>
            <div className={s.flap} aria-hidden />
            <button type="button" className={s.seal} onClick={open} aria-label={model.strings.openInvitation}>
              <span className={cn(s.half, s.halfL)} aria-hidden />
              <span className={cn(s.half, s.halfR)} aria-hidden />
              <Anchor className={s.sealAnchor} />
              {CHIPS.map(([x, y], i) => (
                <span key={i} className={s.chip} style={{ "--cx": x, "--cy": y } as React.CSSProperties} aria-hidden />
              ))}
            </button>
          </div>
          <p className={s.introTap}>{ar ? "اكسروا الختم للفتح" : "Tap the seal to open"}</p>
          {skip}
        </>
      )}
    </KitIntro>
  );
}

/**
 * The hero scroll. With motion on (live and sample), it waits rolled up under
 * the envelope and unrolls once the envelope has opened; a replay rolls it up
 * again. Without script, in the editor and in exports it is simply open.
 */
export function UnrollHero({ model, className, children }: { model: InvitationModel; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [rolled, setRolled] = useState(false);
  const [h, setH] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = 0;
    const roll = () => {
      if (!reduced) setRolled(true);
    };
    const unroll = () => {
      clearTimeout(t);
      t = window.setTimeout(() => setRolled(false), 150);
    };
    if (model.mode === "live" || model.mode === "sample") roll();
    window.addEventListener(OPENED_EVENT, unroll);
    window.addEventListener("invitation:replay-opening", roll);
    return () => {
      ro.disconnect();
      clearTimeout(t);
      window.removeEventListener(OPENED_EVENT, unroll);
      window.removeEventListener("invitation:replay-opening", roll);
    };
  }, [model.mode]);

  return (
    <header
      ref={ref}
      id="hero"
      data-section="hero"
      data-rolled={rolled ? "" : undefined}
      className={className}
      style={h ? ({ "--h": `${h}px` } as React.CSSProperties) : undefined}
    >
      {children}
    </header>
  );
}

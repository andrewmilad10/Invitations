"use client";
/* eslint-disable @next/next/no-img-element -- transparent art layers that animate with the opening */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { OPENED_EVENT } from "../../cinematic/opening/envelope-opening";
import { KitIntro } from "../intro";
import s from "./voyage.module.css";

const CHIPS = [
  ["-210%", "-220%", "160deg"],
  ["150%", "-260%", "-140deg"],
  ["-280%", "90%", "120deg"],
  ["240%", "110%", "-200deg"],
  ["-40%", "260%", "90deg"],
];
const CRACK = "M50 0 L46 14 L53 28 L45 42 L52 56 L47 70 L54 84 L49 100";

/**
 * Set Sail's opening, one continuous scene once the seal is tapped (all timed
 * in CSS from data-phase="opening"): a crack runs through the slate wax and the
 * seal breaks in two; the flap swings open on a watercolour sea liner; a
 * parchment scroll tied with twine slides out; the envelope drops away as the
 * scroll comes forward; the twine slips off; then the overlay fades and the
 * hero scroll unrolls over the sea (UnrollHero).
 */
export function VoyageOpening({ model }: { model: InvitationModel }) {
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[4100, 700]}>
      {({ open, skip }) => (
        <>
          <div className={s.scene} onClick={open}>
            <div className={cn(s.part, s.back)} aria-hidden />
            <div className={s.scroll} aria-hidden>
              <div className={s.scrollIn}>
                <img src="/templates/set-sail/scroll.webp" alt="" />
                <img src="/templates/set-sail/twine.webp" alt="" className={s.twine} />
              </div>
            </div>
            <div className={cn(s.part, s.pocket)} aria-hidden />
            <svg className={cn(s.part, s.folds)} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path className={s.foldDark} d="M0 100 L45 54 Q50 50 55 54 L100 100" />
              <path className={s.foldLight} d="M0 99 L45 53 Q50 49 55 53 L100 99" />
            </svg>
            <div className={cn(s.part, s.flapShade)} aria-hidden />
            <div className={cn(s.part, s.hinge)} aria-hidden>
              <div className={s.flap}>
                <i className={s.flapFront} />
                <i className={s.flapInside} />
              </div>
            </div>
            <button type="button" className={cn(s.part, s.seal)} onClick={open} aria-label={model.strings.openInvitation}>
              <span className={cn(s.half, s.halfL)} aria-hidden />
              <span className={cn(s.half, s.halfR)} aria-hidden />
              <svg className={s.crack} viewBox="0 0 100 100" aria-hidden>
                <path className={s.crackDark} pathLength={1} d={CRACK} />
                <path className={s.crackLight} pathLength={1} d={CRACK} />
                <path className={s.crackBranch} pathLength={1} d="M53 28 L64 24 L72 30 M45 42 L34 46 L27 42 M47 70 L38 76 M52 56 L62 62" />
              </svg>
              {CHIPS.map(([x, y, r], i) => (
                <span key={i} className={s.chip} style={{ "--x": x, "--y": y, "--r": r } as React.CSSProperties} aria-hidden />
              ))}
            </button>
          </div>
          <p className={s.tap}>{ar ? "اكسروا الختم للفتح" : "Tap the seal to open"}</p>
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
  const ref = useRef<HTMLDivElement>(null);
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
      t = window.setTimeout(() => setRolled(false), 80);
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
    <div ref={ref} data-rolled={rolled ? "" : undefined} className={className} style={h ? ({ "--h": `${h}px` } as React.CSSProperties) : undefined}>
      {children}
    </div>
  );
}

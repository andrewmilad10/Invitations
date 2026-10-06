"use client";

/* eslint-disable @next/next/no-img-element -- transparent paper-cut fan pieces */
import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./fan.module.css";

const ART = "/templates/paper-fan";
// eleven blades fanning over 100 degrees, left to right
const BLADES = Array.from({ length: 11 }, (_, i) => -50 + i * 10);

/**
 * Paper Fan's opening. A closed paper-cut fan tied with a plum cord floats on
 * a lavender meadow under a crescent moon, the couple's names above it. Tap:
 * the closed fan fades as eleven lace blades spread slowly into a half circle,
 * widening as they go; the pivot medallion settles with its tassel swaying,
 * and while the fan is still opening the screen eases into the arch window.
 */
export function FanOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[3000, 1900]}>
      {({ phase, open, skip }) => (
        <>
          <div className={s.top}>
            <p className={s.caps}>{ar ? "مع عائلتيهما" : "Together with their families"}</p>
            <p className={s.names}>
              {wedding.partnerOne} {ar ? "و" : "&"} {wedding.partnerTwo}
            </p>
            <p className={cn(s.caps, s.hint)}>{ar ? "اضغطوا على المروحة لفتحها" : "Tap the fan to open"}</p>
          </div>
          <div className={s.fan}>
            <div className={s.float}>
              <span className={s.glow} aria-hidden />
              {BLADES.map((a, i) => (
                <img key={i} className={s.blade} src={`${ART}/blade.webp`} alt="" style={{ "--a": `${a}deg`, zIndex: 10 + i } as React.CSSProperties} />
              ))}
              <img className={s.closedFan} src={`${ART}/closed.webp`} alt="" />
              <img className={s.hub} src={`${ART}/hub.webp`} alt="" />
            </div>
            <button type="button" className={s.fanBtn} onClick={open} aria-label={model.strings.openInvitation} />
          </div>
          <LeavingMark phase={phase} />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

/** The arch window wakes as the opening starts to fade, so it settles underneath it. */
function LeavingMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="fan"]');
    if (!root) return;
    if (phase === "leaving") root.setAttribute("data-ready", "");
    if (phase === "closed") root.removeAttribute("data-ready");
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function FanReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

"use client";
/* eslint-disable @next/next/no-img-element -- the envelope */

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./butter.module.css";

/**
 * Butter Letter's opening, kept quiet: the couple's names, the butter-yellow
 * envelope with its lace-trimmed flap and jasmine wax seal lying large in the
 * middle of the cream page, and "Tap to open". A tap: the envelope softly
 * lifts and fades while the invitation appears behind it.
 */
export function ButterOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[50, 1200]}>
      {({ phase, open }) => (
        <>
          <div className={s.introInner} aria-hidden>
            <p className={s.introSmall}>{ar ? "رسالة حب من" : "A love letter from"}</p>
            <p className={s.introNames}>
              {wedding.partnerOne} <span className={s.introAmp}>{ar ? "و" : "&"}</span> {wedding.partnerTwo}
            </p>
            <img src="/templates/butter-letter/closed.webp" alt="" className={s.introEnv} width={1351} height={867} fetchPriority="high" />
            <p className={s.introTap}>{ar ? "اضغطوا للفتح" : "Tap to open"}</p>
          </div>
          <button type="button" className={s.introBtn} onClick={open} aria-label={model.strings.openInvitation} />
          <ReadyMark phase={phase} />
        </>
      )}
    </KitIntro>
  );
}

/** The page is made ready as the envelope leaves, so the collage builds itself behind it. */
function ReadyMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="butter"]');
    if (!root) return;
    if (phase === "closed") root.removeAttribute("data-ready");
    else root.setAttribute("data-ready", "");
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function ButterReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

"use client";
/* eslint-disable @next/next/no-img-element -- the lace envelope */

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./lace.module.css";

/**
 * Blush Lace's opening: a quiet cream page with "An invitation from" and the
 * couple's names, and the blush lace envelope settling into focus below them,
 * with "Tap to open". A tap does nothing to the envelope itself: the whole
 * page softly dissolves (fade and blur) into the invitation, whose first
 * screen of flowers is already waiting underneath.
 */
export function LaceOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[60, 1400]}>
      {({ phase, open }) => (
        <>
          <div className={s.introInner} aria-hidden>
            <p className={s.introSmall}>{ar ? "دعوة من" : "An invitation from"}</p>
            <p className={s.introNames}>
              {wedding.partnerOne} <span className={s.introAmp}>{ar ? "و" : "&"}</span> {wedding.partnerTwo}
            </p>
            <img src="/templates/blush-lace/envelope.webp" alt="" className={s.introEnv} width={982} height={733} fetchPriority="high" />
            <p className={s.introTap}>{ar ? "اضغطوا للفتح" : "Tap to open"}</p>
          </div>
          <button type="button" className={s.introBtn} onClick={open} aria-label={model.strings.openInvitation} />
          <ReadyMark phase={phase} />
        </>
      )}
    </KitIntro>
  );
}

/** The page is made ready as the opening dissolves, so the first screen's words rise in behind it. */
function ReadyMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="lace"]');
    if (!root) return;
    if (phase === "closed") root.removeAttribute("data-ready");
    else root.setAttribute("data-ready", "");
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function LaceReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

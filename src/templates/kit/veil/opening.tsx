"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./veil.module.css";

/**
 * Ivory Veil's opening: the ivory envelope fills the screen, with a small lace
 * heart seal at the flap's tip. On the flap, the couple's names in script and
 * "Tap to open" in small capitals. A tap does nothing to the envelope itself:
 * the whole page softly dissolves into the invitation underneath.
 */
export function VeilOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[60, 1400]}>
      {({ phase, open }) => (
        <>
          <div className={s.introEnv} aria-hidden>
            <div className={s.introText}>
              <p className={s.introNames}>
                {wedding.partnerOne} <span className={s.introAmp}>{ar ? "و" : "&"}</span> {wedding.partnerTwo}
              </p>
              <p className={s.introTap}>{ar ? "اضغطوا للفتح" : "Tap to open"}</p>
            </div>
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
    const root = document.querySelector<HTMLElement>('[data-kit="veil"]');
    if (!root) return;
    if (phase === "closed") root.removeAttribute("data-ready");
    else root.setAttribute("data-ready", "");
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function VeilReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

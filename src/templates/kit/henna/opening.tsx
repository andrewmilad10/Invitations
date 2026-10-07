"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { KitIntro, type IntroPhase } from "../intro";
import { Curtains, Motifs } from "./live";
import s from "./henna.module.css";

/**
 * Henna Tent's opening. Red velvet curtains stitched with gold henna patterns
 * fill the screen under a tasselled valance, gold motifs drifting on them. Tap
 * the hennaed hand: the curtains part from the middle and gather to the sides,
 * and the overlay steps away leaving the same gathered curtains framing the
 * couple's names on the stage underneath.
 */
export function HennaOpening({ model }: { model: InvitationModel }) {
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[3800, 1]}>
      {({ phase, open, skip }) => (
        <>
          <Curtains mode={phase === "closed" ? "closed" : "opening"} />
          <Motifs count={10} className={cn(s.motifs, phase !== "closed" && s.motifsOff)} />
          {/* eslint-disable-next-line @next/next/no-img-element -- transparent velvet valance */}
          <img className={s.valance} src="/templates/henna-tent/valance.webp" alt="" />
          <button type="button" className={cn(s.tap, phase !== "closed" && s.tapOff)} onClick={open} aria-label={model.strings.openInvitation}>
            <span>
              {/* eslint-disable-next-line @next/next/no-img-element -- transparent henna hand */}
              <img src="/templates/henna-tent/hand.webp" alt="" />
            </span>
            <b>{ar ? "اضغطوا للدخول" : "Tap to enter"}</b>
          </button>
          <OpeningMark phase={phase} />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

/** The names start appearing on the stage as soon as the curtains begin to part. */
function OpeningMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="henna"]');
    if (!root) return;
    if (phase === "opening") root.setAttribute("data-ready", "");
    if (phase === "closed") root.removeAttribute("data-ready");
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function HennaReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

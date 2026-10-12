"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./sketch.module.css";

/**
 * The Sketchbook's opening. A green linen sketchbook held shut with an elastic
 * band rests on watercolour paper. Tap: the band slides off, the cover swings
 * open like a real book while the view widens to the whole spread, a painting
 * soaks into the right-hand page and the names are written on the left, then
 * the screen fades into the page.
 */
export function SketchOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  const amp = ar ? " و " : " & ";
  return (
    <KitIntro model={model} className={s.intro} timing={[3600, 1900]}>
      {({ phase, open, skip }) => {
        const go = phase !== "closed";
        return (
          <>
            <p className={cn(s.who, go && s.gone)}>
              {wedding.partnerOne}
              {amp}
              {wedding.partnerTwo}
            </p>
            <button type="button" className={cn(s.scene, go && s.go)} onClick={open} aria-label={model.strings.openInvitation}>
              <span className={s.shadow} />
              <span className={cn(s.half, s.right)} />
              <span className={s.paint} />
              <span className={cn(s.half, s.hinge)}>
                <i className={s.front} />
                <i className={s.back} />
              </span>
              <span className={s.leftText}>
                <b>
                  {wedding.partnerOne}
                  {amp}
                  {wedding.partnerTwo}
                </b>
                {wedding.date?.short ? <small>{wedding.date.short}</small> : null}
              </span>
              <span className={cn(s.half, s.elastic)} />
            </button>
            <p className={cn(s.hint, go && s.gone)}>{ar ? "اضغطوا لفتح الكراسة" : "tap to open the sketchbook"}</p>
            <LeavingMark phase={phase} />
            {skip}
          </>
        );
      }}
    </KitIntro>
  );
}

/** The page underneath settles in as soon as the sketchbook starts to fade. */
function LeavingMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="sketch"]');
    if (!root) return;
    if (phase === "leaving") root.setAttribute("data-ready", "");
    if (phase === "closed") root.removeAttribute("data-ready");
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function SketchReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

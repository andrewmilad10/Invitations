"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./theatre.module.css";

const ART = "/templates/opening-night";

/**
 * Opening Night's opening. A closed teal velvet curtain embroidered with
 * swallows, the couple's names on it and a gold tassel on a cord at the side.
 * Tap: the tassel is pulled down a little, the whole curtain rises slowly, and
 * while it is still rising the stage behind it lights up and the names appear.
 */
export function TheatreOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[3700, 700]}>
      {({ phase, open, skip }) => (
        <>
          <button type="button" className={s.curtain} onClick={open} aria-label={model.strings.openInvitation}>
            <span className={s.plate} aria-hidden />
            <span className={s.inv}>{ar ? "أنتم مدعوون إلى ليلة الافتتاح" : "You are invited to the opening night of"}</span>
            <span className={s.who}>
              <span>{wedding.partnerOne}</span> <span className={s.amp}>{ar ? "و" : "&"}</span> <span>{wedding.partnerTwo}</span>
            </span>
            <span className={s.hint}>{ar ? "اسحبوا الشرّابة" : "Pull the tassel"}</span>
            <span className={s.pull} aria-hidden>
              <span className={s.cord} />
              {/* eslint-disable-next-line @next/next/no-img-element -- transparent gold tassel cut-out */}
              <img className={s.tassel} src={`${ART}/tassel.webp`} alt="" />
            </span>
          </button>
          <RisingMark phase={phase} />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

/** Lights the stage as soon as the curtain starts to rise, so it shows under it. */
function RisingMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="theatre"]');
    if (!root) return;
    if (phase === "closed") {
      root.removeAttribute("data-ready");
      return;
    }
    const t = window.setTimeout(() => root.setAttribute("data-ready", ""), 450);
    return () => clearTimeout(t);
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function TheatreReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

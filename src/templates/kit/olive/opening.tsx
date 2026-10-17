"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import { initials } from "./util";
import s from "./olive.module.css";

/**
 * Olive Courtyard's opening, made like a simple envelope reveal: an upright
 * film of the sage envelope, full screen on phones (whole and centred on wide
 * screens). Its first frame waits, with the couple's initials in gold foil on
 * the flap. A tap plays 2.8s: the flap lifts part way by itself; then the
 * film fades softly (1.2s) into the page, already settled underneath.
 */
const FILM = "/templates/olive-courtyard/opening";

export function OliveOpening({ model }: { model: InvitationModel }) {
  const mono = initials(model);
  return (
    <KitIntro model={model} className={s.intro} timing={[2800, 1200]}>
      {({ phase, open, skip }) => (
        <>
          <Film phase={phase} mono={mono} />
          <p className={s.hint}>{model.locale === "ar" ? "اضغطوا للفتح" : "Tap to open"}</p>
          <button type="button" className={s.envBtn} onClick={open} aria-label={model.strings.openInvitation} />
          <ReadyMark phase={phase} />
          {phase === "closed" ? null : skip}
        </>
      )}
    </KitIntro>
  );
}

function Film({ phase, mono }: { phase: IntroPhase; mono: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (phase === "closed") {
      v.pause();
      v.currentTime = 0;
    } else if (phase === "opening") {
      void v.play().catch(() => {});
    }
  }, [phase]);
  return (
    <div className={s.film} aria-hidden>
      <video ref={ref} className={s.filmVid} poster={`${FILM}-poster.webp`} muted playsInline preload="auto" disablePictureInPicture>
        <source src={`${FILM}.webm`} type="video/webm" />
        <source src={`${FILM}.mp4`} type="video/mp4" />
      </video>
      <span className={s.filmMono}>
        <span className={s.gold}>{mono}</span>
      </span>
    </div>
  );
}

/** The page is made ready under the opening, so it already matches the card when the opening lifts away. */
function ReadyMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="olive"]');
    if (!root) return;
    if (phase === "closed") {
      root.removeAttribute("data-ready");
      return;
    }
    const t = window.setTimeout(() => root.setAttribute("data-ready", ""), 300);
    return () => clearTimeout(t);
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function OliveReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}


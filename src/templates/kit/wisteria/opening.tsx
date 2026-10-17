"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./wisteria.module.css";

/**
 * Wisteria Lake's opening: an upright film of the watercolour terrace with the
 * blush envelope, full screen on phones (on wide screens it stands in the
 * middle and melts into the same lake painting at its sides). The first frame
 * waits with the couple's names in the sky. A tap plays 5.2s: the flap lifts
 * by itself, the cream card rises and the invitation appears on it (names, date,
 * time and place); then the film fades softly (1.2s) into the page underneath.
 */
const FILM = "/templates/wisteria-lake/opening";

export function WisteriaOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  const amp = ar ? "و" : "&";
  const first = model.events.ceremony ?? model.events.reception;
  return (
    <KitIntro model={model} className={s.intro} timing={[5200, 1200]}>
      {({ phase, open, skip }) => (
        <>
          <div className={s.film} aria-hidden>
            <Film phase={phase} />
            <p className={s.filmNames}>
              {wedding.partnerOne} <span className={s.filmAmp}>{amp}</span> {wedding.partnerTwo}
            </p>
            <div className={s.cardText}>
              <p className={s.cardSmall}>{ar ? "بمباركة عائلتيهما" : "Together with their families"}</p>
              <p className={s.cardNames}>{wedding.partnerOne}</p>
              <p className={s.cardAmp}>{amp}</p>
              <p className={s.cardNames}>{wedding.partnerTwo}</p>
              <p className={s.cardInvite}>{ar ? "يتشرفان بدعوتكم لحضور حفل زفافهما" : "request the pleasure of your company"}</p>
              {wedding.date ? <p className={s.cardDate}>{wedding.date.long}</p> : null}
              {first?.timeLabel ? <p className={s.cardDate}>{first.timeLabel}</p> : null}
              {first?.venueName ? <p className={s.cardVenue}>{first.venueName}</p> : null}
            </div>
          </div>
          <p className={s.hint}>{model.locale === "ar" ? "اضغطوا للفتح" : "Tap to open"}</p>
          <button type="button" className={s.envBtn} onClick={open} aria-label={model.strings.openInvitation} />
          <ReadyMark phase={phase} />
          {phase === "closed" ? null : skip}
        </>
      )}
    </KitIntro>
  );
}

function Film({ phase }: { phase: IntroPhase }) {
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
    <video ref={ref} className={s.filmVid} poster={`${FILM}-poster.webp`} muted playsInline preload="auto" disablePictureInPicture>
      <source src={`${FILM}.webm`} type="video/webm" />
      <source src={`${FILM}.mp4`} type="video/mp4" />
    </video>
  );
}

/** The page is made ready under the opening, so it has settled when the opening lifts away. */
function ReadyMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="wisteria"]');
    if (!root) return;
    if (phase === "closed") {
      root.removeAttribute("data-ready");
      return;
    }
    const t = window.setTimeout(() => root.setAttribute("data-ready", ""), 3000);
    return () => clearTimeout(t);
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function WisteriaReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

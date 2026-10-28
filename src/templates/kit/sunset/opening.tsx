"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./sunset.module.css";

/**
 * El Gouna Sunset's opening: a cream envelope tied with ivory silk. Its first
 * frame waits (the strapped envelope); a tap plays ~7.5s — the strap slips off,
 * the envelope opens and the card inside grows to fill the screen — then the
 * film fades softly into the first page, already settled underneath (its last
 * frame is that page, so the hand-off is seamless). Art/film in
 * public/templates/gouna-sunset.
 */
const FILM = "/templates/gouna-sunset/opening";

export function SunsetOpening({ model }: { model: InvitationModel }) {
  return (
    <KitIntro model={model} className={s.intro} timing={[7200, 1300]}>
      {({ phase, open, skip }) => (
        <>
          <Film phase={phase} />
          <p className={s.openHint}>{model.locale === "ar" ? "اضغطوا للفتح" : "Tap to open"}</p>
          <button type="button" className={s.openBtn} onClick={open} aria-label={model.strings.openInvitation} />
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
    <div className={s.film} aria-hidden>
      <video ref={ref} className={s.filmVid} poster={`${FILM}-poster.webp`} muted playsInline preload="auto" disablePictureInPicture>
        <source src={`${FILM}.webm`} type="video/webm" />
        <source src={`${FILM}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}

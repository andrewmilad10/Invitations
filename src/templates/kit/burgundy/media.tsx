"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./burgundy.module.css";

export const MEDIA = "/templates/burgundy-envelope";

/**
 * The opening: an embossed burgundy envelope (a pre-rendered video, paused
 * on its first frame). Tapping plays it at 0.7× so the flap lifts slowly,
 * then the invitation fades in. Reduced motion skips the video.
 */
export function BurgundyOpening({ model }: { model: InvitationModel }) {
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.opening} timing={[5600, 900]}>
      {({ phase, open, skip }) => (
        <>
          <OpeningVideo phase={phase} />
          {phase === "closed" ? (
            <button type="button" className={s.openButton} onClick={open} autoFocus>
              <span>{ar ? "اضغط للفتح" : "Click to open"}</span>
              <small>{ar ? "دعوة زفاف" : "A wedding invitation"}</small>
            </button>
          ) : (
            skip
          )}
        </>
      )}
    </KitIntro>
  );
}

function OpeningVideo({ phase }: { phase: IntroPhase }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (phase === "opening") {
      v.playbackRate = 0.7;
      void v.play().catch(() => {});
    }
    if (phase === "closed") {
      v.pause();
      v.currentTime = 0;
    }
  }, [phase]);
  return <video ref={video} className={s.introVideo} src={`${MEDIA}/opening.mp4`} poster={`${MEDIA}/opening-poster.webp`} muted playsInline preload="auto" aria-hidden />;
}

/** The hero's looping background video; a still poster with reduced motion and in exports. */
export function HeroVideo({ still }: { still: boolean }) {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);
  if (still || reduced) return <span className={s.heroPoster} aria-hidden />;
  return <video className={s.heroVideo} src={`${MEDIA}/hero.mp4`} poster={`${MEDIA}/hero-poster.webp`} autoPlay muted loop playsInline preload="metadata" aria-hidden />;
}

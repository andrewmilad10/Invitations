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
 * by itself, the cream card rises carrying the invitation (names, date, time and
 * place), its writing tied to the card frame by frame; then the film fades softly (1.2s) into the page underneath.
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
            <div className={s.cardClip}>
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

/**
 * Where the card's top edge is in the film (seconds → share of the film's height), traced from the film itself.
 * The writing on the card follows it frame by frame, so it rises with the card instead of after it.
 */
const CARD: [number, number][] = [[0, 0.4367], [2.9, 0.4367], [3.0, 0.4306], [3.25, 0.4182], [3.5, 0.4005], [3.75, 0.3773], [4.0, 0.3549], [4.25, 0.3322], [4.5, 0.3129], [4.75, 0.2959], [5.0, 0.2828], [5.2, 0.2755]];
const END = CARD[CARD.length - 1][1];
function cardTop(t: number) {
  for (let i = 1; i < CARD.length; i++) {
    const [t1, y1] = CARD[i];
    const [t0, y0] = CARD[i - 1];
    if (t <= t1) return y0 + ((y1 - y0) * (t - t0)) / (t1 - t0);
  }
  return END;
}

function Film({ phase }: { phase: IntroPhase }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    const box = v?.parentElement;
    if (!v || !box) return;
    // offset of the writing below its final place, in film widths (the film is 1296/720 widths tall)
    const place = (t: number) => {
      box.style.setProperty("--rise", `${((cardTop(t) - END) * 1296) / 7.2}cqw`);
      box.style.setProperty("--show", `${Math.min(1, Math.max(0, (t - 1.55) / 0.35))}`);
    };
    place(0);
    if (phase === "closed") {
      v.pause();
      v.currentTime = 0;
      return;
    }
    if (phase !== "opening") return;
    void v.play().catch(() => {});
    let id = 0;
    const tick = () => {
      place(v.currentTime);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
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

"use client";

/* eslint-disable @next/next/no-img-element -- the film's first frame, exactly under the film */
import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import { FILM_TRACK, FILM_TRACK_FPS } from "./film-track";
import { initials } from "./util";
import s from "./olive.module.css";

/**
 * Olive Courtyard's opening, made like the Burgundy envelope: a rendered film
 * shown full screen as a steady close-up of the sage envelope (its first frame
 * waits, with the couple's initials in gold foil on the flap). A tap plays it:
 * the flap lifts and turns over, the olive liner shows, the card rises and
 * fills the screen with the courtyard; then the page, with the same courtyard
 * and the couple's names, takes over.
 */
const FILM = "/templates/olive-courtyard/opening";

export function OliveOpening({ model }: { model: InvitationModel }) {
  const mono = initials(model);
  return (
    <KitIntro model={model} className={s.intro} timing={[7100, 900]}>
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

/** The film's push-in at time t (seconds), interpolated between samples. */
function trackAt(t: number): [number, number, number] {
  const f = Math.max(0, t * FILM_TRACK_FPS);
  const i = Math.min(FILM_TRACK.length - 1, Math.floor(f));
  const j = Math.min(FILM_TRACK.length - 1, i + 1);
  const u = Math.min(1, f - i);
  const [s0, x0, y0] = FILM_TRACK[i];
  const [s1, x1, y1] = FILM_TRACK[j];
  return [s0 + (s1 - s0) * u, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
}
const ease = (v: number) => {
  const x = Math.max(0, Math.min(1, v));
  return x * x * (3 - 2 * x);
};
/** The envelope keeps its size until the card is out; then the film's own move into the card comes back, so the ending is unchanged. */
const HOLD_UNTIL = 4.6;
const RELEASED_AT = 6.8;

function Film({ phase, mono }: { phase: IntroPhase; mono: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (phase === "closed") {
      v.pause();
      v.currentTime = 0;
      v.style.transform = "";
      v.style.setProperty("--edge", "0%");
      return;
    }
    if (phase !== "opening") return;
    void v.play().catch(() => {});
    let id = 0;
    const frame = () => {
      const box = v.parentElement;
      if (box) {
        const k = box.offsetWidth / 864; // screen pixels per film pixel
        const t = v.currentTime;
        const [s, x, y] = trackAt(t);
        const a = ease((t - HOLD_UNTIL) / (RELEASED_AT - HOLD_UNTIL)); // 0: cancel the push-in, 1: the film as it is
        const scale = Math.pow(1 / s, 1 - a);
        const tx = (-x / s) * (1 - a) * k;
        const ty = (-y / s) * (1 - a) * k;
        v.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${scale.toFixed(4)})`;
        // soft edges only while the film is drawn smaller than the screen
        v.style.setProperty("--edge", `${((1 - scale) * 40).toFixed(2)}%`);
      }
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [phase]);
  return (
    <div className={s.film} aria-hidden>
      {/* the first frame stays underneath: the table and the envelope around the film while the push-in is cancelled */}
      <img className={s.filmBack} src={`${FILM}-poster.webp`} alt="" />
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


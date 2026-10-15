"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import { initials } from "./util";
import s from "./olive.module.css";

/**
 * Olive Courtyard's opening. The whole sage envelope lies on olive-printed
 * paper with the couple's initials in gold foil on the flap. A tap plays a
 * short film in which the flap opens by itself to its olive liner; then the
 * couple's own invitation (the courtyard with their names, exactly as the
 * page's first screen) rises out of the pocket, and the view moves into it
 * until it fills the screen, where the page takes over without a jump.
 */
export function OliveOpening({ model }: { model: InvitationModel }) {
  const mono = initials(model);
  return (
    <KitIntro model={model} className={s.intro} timing={[6100, 700]}>
      {({ phase, open, skip }) => (
        <>
          <Film model={model} phase={phase} mono={mono} />
          <p className={s.hint}>{model.locale === "ar" ? "اضغطوا للفتح" : "Tap to open"}</p>
          <button type="button" className={s.envBtn} onClick={open} aria-label={model.strings.openInvitation} />
          <ReadyMark phase={phase} />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

const FILM = "/templates/olive-courtyard/opening";
/** When, after the tap, the card rises and when the view moves into it (ms). */
const RISE = 2500;
const ZOOM = 4500;

function Film({ model, phase, mono }: { model: InvitationModel; phase: IntroPhase; mono: string }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const zoom = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"rest" | "film" | "rise" | "zoom">("rest");

  // The card is a scaled-down copy of the page's first screen: scale = card width / screen width.
  useEffect(() => {
    const fit = () => {
      const c = card.current;
      if (c) c.style.setProperty("--cs", String(c.offsetWidth / window.innerWidth));
    };
    fit();
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (phase === "closed") {
      setStep("rest");
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
      if (zoom.current) zoom.current.style.transform = "";
      return;
    }
    if (phase !== "opening") return;
    setStep("film");
    v?.play().catch(() => {});
    const a = window.setTimeout(() => setStep("rise"), RISE);
    const b = window.setTimeout(() => {
      // Move the view so the card ends exactly where the page's first screen is: full width, at the top.
      const c = card.current?.getBoundingClientRect();
      const z = zoom.current;
      if (c && z) {
        const k = window.innerWidth / c.width;
        z.style.transform = `translate(${-c.left * k}px, ${-c.top * k}px) scale(${k})`;
      }
      setStep("zoom");
    }, ZOOM);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [phase]);

  const hero = model.sections.find((x) => x.type === "hero")?.content as { eyebrow?: string } | undefined;
  const ar = model.locale === "ar";
  const { partnerOne, partnerTwo, date } = model.wedding;
  return (
    <div ref={root} className={s.film} data-step={step} aria-hidden>
      <div ref={zoom} className={s.zoom}>
        <div className={s.filmBox}>
          <video ref={video} className={s.filmVid} poster={`${FILM}-poster.webp`} muted playsInline preload="auto" disablePictureInPicture>
            <source src={`${FILM}.webm`} type="video/webm" />
            <source src={`${FILM}.mp4`} type="video/mp4" />
          </video>
          <span className={s.filmExt} />
          <span className={s.filmMono}>
            <span className={s.gold}>{mono}</span>
          </span>
          {/* the pocket: the card is only seen above the front of the envelope until it is lifted out */}
          <div className={s.pocket}>
            <div ref={card} className={s.card}>
              <div className={s.cardScreen}>
                <span className={s.cardPic} />
                <div className={s.heroText}>
                  <p className={s.caps}>{hero?.eyebrow || (ar ? "سنتزوّج" : "We are getting married")}</p>
                  <h1 className={s.heroH1}>
                    <span>{partnerOne}</span>
                    <span className={s.amp}>{ar ? "و" : "&"}</span>
                    <span>{partnerTwo}</span>
                  </h1>
                  {date?.short ? <p className={s.heroDate}>{date.short}</p> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

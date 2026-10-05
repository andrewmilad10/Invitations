"use client";

import { useEffect } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { showerPetals } from "../blue/petals";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./rosa.module.css";

const ROSE_PETALS = ["rgb(244 205 205)", "rgb(236 182 186)", "rgb(250 226 222)", "rgb(226 160 168)", "rgb(252 240 232)"];

function PetalsOnOpen({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    if (phase === "opening") showerPetals(18, 1.4, ROSE_PETALS);
  }, [phase]);
  return null;
}

/**
 * Villa Rosa's opening: a landscape blush envelope with a die-cut lace flap
 * and a rose-gold seal, the names above it. Tapping swings the lace flap open,
 * the invitation card slides up out of the envelope and petals fall, then the
 * site fades in.
 */
export function RosaOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const [a, b] = wedding.initials;
  const ar = model.locale === "ar";
  const amp = ar ? "و" : "&";
  return (
    <KitIntro model={model} className={s.intro} timing={[3600, 1200]}>
      {({ phase, open, skip }) => (
        <>
          <PetalsOnOpen phase={phase} />
          <span className={s.introPosy} aria-hidden />
          <p className={s.introNames}>
            {wedding.partnerOne} {amp} {wedding.partnerTwo}
          </p>
          <p className={s.introTap}>{ar ? "اضغطوا للفتح" : "Tap to open"}</p>
          <div className={s.envL} onClick={open}>
            <div className={s.envBack} aria-hidden />
            <div className={s.envCard} aria-hidden>
              <span className={s.envCardSpray} />
              <span className={s.envCardNames}>
                {wedding.partnerOne} {amp} {wedding.partnerTwo}
              </span>
              <span className={s.envCardScript}>{ar ? "سيتزوّجان" : "are getting married"}</span>
              {wedding.date ? <span className={s.envCardDate}>{wedding.date.short}</span> : null}
            </div>
            <div className={s.envPocket} aria-hidden />
            <svg className={s.envLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path className={s.dk} d="M0 100 L46 52 M100 100 L54 52" />
              <path className={s.lt} d="M0 99.4 L46 51.4 M100 99.4 L54 51.4" />
            </svg>
            <div className={s.envFlap}>
              <div className={s.envFlapFace} aria-hidden />
              <button type="button" className={s.envSeal} onClick={open} aria-label={model.strings.openInvitation}>
                <span className={s.envMono} aria-hidden>
                  {a}&amp;{b}
                </span>
              </button>
            </div>
          </div>
          <span className={s.introPosy} aria-hidden />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

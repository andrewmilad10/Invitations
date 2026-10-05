"use client";

import { useEffect } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import { showerPetals } from "./petals";
import s from "./blue.module.css";

/** Petals drift down as the flap lifts. */
function PetalsOnOpen({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    if (phase === "opening") showerPetals(16, 0.6);
  }, [phase]);
  return null;
}

/**
 * Something Blue's opening: a white cotton envelope with paper flowers pressed
 * into it, sealed in powder-blue wax. Tapping it lifts the flap part-way (seal
 * and all) on a blue liner while petals drift down; the wreath blooms in as
 * the envelope fades. No card pops out.
 */
export function BlueOpening({ model }: { model: InvitationModel }) {
  const [a, b] = model.wedding.initials;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[1600, 1500]}>
      {({ phase, open, skip }) => (
        <>
          <PetalsOnOpen phase={phase} />
          <div className={s.env} onClick={open}>
            <div className={s.back} aria-hidden />
            <div className={`${s.paperBg} ${s.sideL}`} aria-hidden />
            <div className={`${s.paperBg} ${s.sideR}`} aria-hidden />
            <div className={s.bottomWrap} aria-hidden>
              <div className={`${s.paperBg} ${s.bottom}`} />
            </div>
            <svg className={s.creases} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path className={s.dk} d="M0 100 L47.5 51.4 Q50 49.4 52.5 51.4 L100 100" />
              <path className={s.lt} d="M0 99.3 L47.5 50.7 Q50 48.7 52.5 50.7 L100 99.3" />
            </svg>
            <div className={s.flapShadow} aria-hidden />
            <div className={s.flap}>
              <div className={s.flapFace} aria-hidden />
              <svg className={s.flapEdge} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <path d="M0 1.6 L45.8 92.4 Q50 102 54.2 92.4 L100 1.6" />
              </svg>
              <button type="button" className={s.seal} onClick={open} aria-label={model.strings.openInvitation}>
                <span className={s.ring} aria-hidden />
                <span className={s.mono} aria-hidden>
                  {a}&amp;{b}
                </span>
              </button>
            </div>
            <p className={s.tap}>{ar ? "اضغطوا للفتح" : "Tap to open"}</p>
          </div>
          {skip}
        </>
      )}
    </KitIntro>
  );
}

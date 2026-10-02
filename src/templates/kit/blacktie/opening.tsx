"use client";

import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro } from "../intro";
import { BowTie } from "./bow-tie";
import s from "./blacktie.module.css";

/**
 * Black Tie's opening: two satin lapels meet in a V across the screen with a
 * bow tie at the collar. Tapping the bow tie parts the lapels like a jacket
 * opening onto the evening.
 */
export function BlackTieOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  return (
    <KitIntro model={model} className={s.intro} timing={[1500, 700]}>
      {({ open, skip }) => (
        <>
          <span className={s.lapelL} aria-hidden />
          <span className={s.lapelR} aria-hidden />
          <div className={s.introCentre}>
            <p className={s.introNames}>
              {wedding.partnerOne} <i>{model.locale === "ar" ? "و" : "and"}</i> {wedding.partnerTwo}
            </p>
            <button type="button" onClick={open} className={s.introButton} aria-label={model.strings.openInvitation}>
              <BowTie className={s.introBow} />
            </button>
            <button type="button" onClick={open} className={s.introHint} tabIndex={-1}>
              {model.strings.openInvitation}
            </button>
          </div>
          {skip}
        </>
      )}
    </KitIntro>
  );
}

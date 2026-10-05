"use client";

import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { KitIntro } from "../intro";
import s from "./pond.module.css";

/** Swan Pond's opening: an olive felt envelope with a painted liner and a burgundy seal; the flap opens and the card rises. */
export function PondOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const [a, b] = wedding.initials;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[2600, 1200]}>
      {({ open, skip }) => (
        <>
          <p className={s.introNames}>
            {wedding.partnerOne} {ar ? "و" : "&"} {wedding.partnerTwo}
          </p>
          <div className={s.env} onClick={open}>
            <div className={s.back} aria-hidden>
              <span className={s.liner} />
            </div>
            <div className={s.peek} aria-hidden>
              {a} &amp; {b}
            </div>
            <div className={s.pocket} aria-hidden />
            <svg className={s.edge} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path d="M0 100 L47 52 M100 100 L53 52" />
            </svg>
            <div className={s.flap}>
              <button type="button" className={cn(s.seal, s.envSeal)} onClick={open} aria-label={model.strings.openInvitation}>
                <span aria-hidden>
                  {a}&amp;{b}
                </span>
              </button>
            </div>
          </div>
          <p className={s.introTap}>{ar ? "اضغطوا على الختم للفتح" : "Tap the seal to open"}</p>
          {skip}
        </>
      )}
    </KitIntro>
  );
}

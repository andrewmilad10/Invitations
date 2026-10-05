"use client";

import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro } from "../intro";
import s from "./cotton.module.css";

/**
 * Cotton Press's opening: a cotton envelope on the tablecloth, sealed in gold
 * wax. Tapping it lifts the flap part-way on its crease (seal and all) to show
 * the foil liner; the suite fades in before the flap finishes. No card pops out.
 */
export function CottonOpening({ model }: { model: InvitationModel }) {
  const [a, b] = model.wedding.initials;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[1500, 1500]}>
      {({ open, skip }) => (
        <>
          <div className={s.env} onClick={open}>
            <div className={`${s.panel} ${s.back}`} aria-hidden>
              <span className={s.liner} />
            </div>
            <div className={`${s.panel} ${s.sideL}`} aria-hidden />
            <div className={`${s.panel} ${s.sideR}`} aria-hidden />
            <div className={s.bottomWrap} aria-hidden>
              <div className={`${s.panel} ${s.bottom}`} />
            </div>
            <svg className={s.creases} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path className={s.dk} d="M0 100 L47.6 49.4 Q50 47.6 52.4 49.4 L100 100" />
              <path className={s.lt} d="M0 99 L47.6 48.4 Q50 46.6 52.4 48.4 L100 99" />
            </svg>
            <div className={s.flapShadow} aria-hidden />
            <div className={s.flap}>
              <div className={s.flapFace} aria-hidden />
              <svg className={s.flapEdge} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <path d="M0 1.8 L46 92.6 Q50 102 54 92.6 L100 1.8" />
              </svg>
              <button type="button" className={s.seal} onClick={open} aria-label={model.strings.openInvitation}>
                <span className={s.ring} aria-hidden />
                <span className={s.mono} aria-hidden>
                  {a}
                  <i>&amp;</i>
                  {b}
                </span>
              </button>
            </div>
          </div>
          <div className={s.prompt}>
            <p className={`${s.to} ${s.foil}`}>{ar ? "إلى أحبّائنا" : "For our dearest guests"}</p>
            <p className={`${s.caps} ${s.press}`}>{ar ? "اضغطوا على الختم للفتح" : "Tap the seal to open"}</p>
          </div>
          {skip}
        </>
      )}
    </KitIntro>
  );
}

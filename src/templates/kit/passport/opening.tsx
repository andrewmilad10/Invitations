"use client";

/* eslint-disable @next/next/no-img-element -- photographed passport layered in 3D */
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro } from "../intro";
import s from "./passport.module.css";

const ART = "/templates/wedding-passport";

/**
 * Wedding Passport's opening: the closed navy passport lies on the desk with
 * the couple's names in gold under the crest. A tap swings the front cover
 * open in 3D (its inside is the guilloche lining), the book slides to the
 * middle so the open spread shows the first page, and then the page is
 * revealed underneath.
 */
export function PassportOpening({ model }: { model: InvitationModel }) {
  const ar = model.locale === "ar";
  const { partnerOne, partnerTwo, date } = model.wedding;
  return (
    <KitIntro model={model} className={s.intro} timing={[2300, 900]} label={ar ? "افتح جواز السفر" : "Open your wedding passport"}>
      {({ open, skip }) => (
        <div className={s.desk}>
          {skip}
          <div className={s.stage}>
            <div className={s.book}>
              <div className={s.under} aria-hidden="true">
                <img src={`${ART}/page-first.webp`} alt="" className={s.underPage} width={353} height={566} />
                <span className={s.welcome}>
                  <span className={s.welcomeKick}>{ar ? "أهلاً بكم على متن رحلتنا" : "Welcome aboard"}</span>
                  {date ? <span className={s.welcomeDate}>{date.short}</span> : null}
                </span>
              </div>
              <button type="button" className={s.cover} onClick={open} aria-label={ar ? "افتح جواز السفر" : "Open the passport"}>
                <span className={s.front}>
                  <img src={`${ART}/cover.webp`} alt="" width={640} height={938} fetchPriority="high" />
                  <span className={s.coverNames}>
                    {partnerOne} <i>&amp;</i> {partnerTwo}
                  </span>
                </span>
                <span className={s.inside} aria-hidden="true">
                  <img src={`${ART}/lining.webp`} alt="" width={350} height={566} />
                </span>
              </button>
            </div>
          </div>
          <p className={s.hint}>{ar ? "اضغط على الجواز لفتحه" : "Tap the passport to open"}</p>
        </div>
      )}
    </KitIntro>
  );
}

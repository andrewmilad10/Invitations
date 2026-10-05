"use client";

import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro } from "../intro";
import s from "./swan.module.css";

/**
 * Swan Lake's opening: a stitched linen envelope with a pearl wax seal on the
 * flap's tip. Tapping it lifts the flap part-way on its crease (seal and all)
 * while the invitation dissolves in through the envelope. No card pops out.
 */
export function SwanOpening({ model }: { model: InvitationModel }) {
  const [a, b] = model.wedding.initials;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[700, 1900]}>
      {({ open, skip }) => (
        <div className={s.envelope} onClick={open}>
          <span className={s.interior} aria-hidden />
          <span className={s.sideL} aria-hidden />
          <span className={s.sideR} aria-hidden />
          <span className={s.bottom} aria-hidden />
          <span className={s.flapShadow} aria-hidden />
          <div className={s.flap}>
            <span className={s.flapFace} aria-hidden>
              <span className={s.flapArt} />
              <svg className={s.hem} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <path d="M3 4.5 L50 94 L97 4.5" />
              </svg>
            </span>
            <button type="button" className={s.seal} onClick={open} aria-label={model.strings.openInvitation}>
              <span className={s.mono} aria-hidden>
                {a}
                <small>&amp;</small>
                {b}
              </span>
            </button>
          </div>
          <div className={s.note}>
            <p>{ar ? "رسالة لكم، مختومة بالحب" : "A letter for you, sealed with love"}</p>
            <small>{ar ? "اضغطوا على الختم للفتح" : "Tap the seal to open"}</small>
          </div>
          {skip}
        </div>
      )}
    </KitIntro>
  );
}

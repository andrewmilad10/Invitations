"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import { initials } from "./util";
import s from "./olive.module.css";

/**
 * Olive Courtyard's opening, steady like the Burgundy envelope: the sage
 * envelope fills the screen and the view never moves. The couple's initials
 * are in gold foil on the flap. A tap lifts the flap up and over, out of the
 * top, showing the olive liner; the couple's own invitation (the page's first
 * screen, with their names) rises out of the pocket, then grows to fill the
 * screen, where the page itself is waiting underneath.
 */
export function OliveOpening({ model }: { model: InvitationModel }) {
  const mono = initials(model);
  return (
    <KitIntro model={model} className={s.intro} timing={[4300, 500]}>
      {({ phase, open, skip }) => (
        <>
          <Envelope model={model} phase={phase} mono={mono} />
          <p className={s.hint}>{model.locale === "ar" ? "اضغطوا للفتح" : "Tap to open"}</p>
          <button type="button" className={s.envBtn} onClick={open} aria-label={model.strings.openInvitation} />
          <ReadyMark phase={phase} />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

function Envelope({ model, phase, mono }: { model: InvitationModel; phase: IntroPhase; mono: string }) {
  const hero = model.sections.find((x) => x.type === "hero")?.content as { eyebrow?: string } | undefined;
  const ar = model.locale === "ar";
  const { partnerOne, partnerTwo, date } = model.wedding;
  return (
    <div className={s.env} data-open={phase !== "closed" ? "" : undefined} aria-hidden>
      <span className={s.under} />
      {/* the pocket: the card is only seen above the front of the envelope until it comes out */}
      <div className={s.pocket}>
        <div className={s.card}>
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
      <span className={s.shade} />
      <span className={s.hinge}>
        <i className={s.front}>
          <span className={s.mono}>
            <span className={s.gold}>{mono}</span>
          </span>
        </i>
        <i className={s.back} />
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

"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { OPENED_EVENT } from "../../cinematic/opening/envelope-opening";
import { KitIntro } from "../intro";
import s from "./garden.module.css";

// fixed so the server and the browser agree: left %, drift px, spin deg, duration s, delay s, size
const PETALS = [
  [6, 40, 220, 4.2, 0.1, 1], [14, -30, -260, 5.1, 0.6, 0.8], [22, 60, 300, 4.6, 0.3, 1.1], [31, -50, -200, 5.6, 0.9, 0.9], [39, 20, 340, 4.4, 0.2, 1.2],
  [47, -70, -320, 5.2, 1.1, 0.8], [55, 50, 260, 4.8, 0.5, 1], [63, -20, -280, 5.4, 0.8, 1.1], [71, 70, 200, 4.3, 0.4, 0.9], [79, -40, -240, 5, 1.2, 1],
  [87, 30, 310, 4.7, 0.7, 1.2], [94, -60, -300, 5.3, 0.3, 0.8], [10, 50, 280, 5.8, 1.5, 0.9], [43, -30, -220, 6, 1.7, 1], [68, 40, 260, 5.7, 1.4, 1.1],
];

/**
 * Garden Gate's opening: a painted floral envelope sealed in blush wax. Tap:
 * the seal lifts away, the flap opens slowly and stops partway (tilted back,
 * showing its flowered lining), petals fall, and the view drifts into the
 * envelope as the garden fades in. All timed in CSS from data-phase.
 */
export function GardenOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[4600, 1600]}>
      {({ open, skip }) => (
        <>
          <p className={s.hello}>
            {wedding.partnerOne} {ar ? "و" : "&"} {wedding.partnerTwo}
          </p>
          <div className={s.scene} onClick={open}>
            <span className={s.shadow} aria-hidden />
            <span className={s.under} aria-hidden />
            <span className={s.front} aria-hidden />
            <span className={s.hinge} aria-hidden>
              <i className={s.flapOut} />
              <i className={s.flapIn} />
            </span>
            <button type="button" className={s.seal} onClick={open} aria-label={model.strings.openInvitation} />
          </div>
          <p className={s.tap}>{ar ? "اضغطوا على الختم للفتح" : "Tap the seal to open"}</p>
          <span className={s.petals} aria-hidden>
            {PETALS.map(([l, x, r, d, w, z], i) => (
              <i key={i} style={{ left: `${l}%`, "--x": `${x}px`, "--r": `${r}deg`, animationDuration: `${d}s`, animationDelay: `${2 + w}s`, scale: z } as React.CSSProperties} />
            ))}
          </span>
          {skip}
        </>
      )}
    </KitIntro>
  );
}

/**
 * Marks the root "ready" once the envelope has opened (or straight away when
 * there is no opening), so the hero's words fade in in front of the guest
 * rather than under the envelope. A replay hides them again.
 */
export function GardenReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    const ready = () => root.setAttribute("data-ready", "");
    const reset = () => root.removeAttribute("data-ready");
    if (!intro) ready();
    window.addEventListener(OPENED_EVENT, ready);
    window.addEventListener("invitation:replay-opening", reset);
    return () => {
      window.removeEventListener(OPENED_EVENT, ready);
      window.removeEventListener("invitation:replay-opening", reset);
    };
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

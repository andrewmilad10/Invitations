"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { KitIntro, type IntroPhase } from "../intro";
import { initials } from "./util";
import s from "./olive.module.css";

/**
 * Olive Courtyard's opening. A close-up sage envelope fills the screen with
 * the couple's initials in gold foil on the flap; it leans a little with the
 * pointer or the phone. Tap: the flap starts folding back at once, slowly, in
 * 3D, the olive liner and the card slot appear, and while it is still opening
 * the screen eases into the courtyard.
 */
export function OliveOpening({ model }: { model: InvitationModel }) {
  const mono = initials(model);
  return (
    <KitIntro model={model} className={s.intro} timing={[2200, 2000]}>
      {({ phase, open, skip }) => (
        <>
          <Envelope phase={phase} mono={mono} />
          <p className={s.hint}>{model.locale === "ar" ? "اضغطوا للفتح" : "Tap to open"}</p>
          <button type="button" className={s.envBtn} onClick={open} aria-label={model.strings.openInvitation} />
          <ReadyMark phase={phase} />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

function Envelope({ phase, mono }: { phase: IntroPhase; mono: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => el.style.setProperty("--envW", `${el.getBoundingClientRect().width}px`);
    fit();
    addEventListener("resize", fit);
    if (phase !== "closed") return () => removeEventListener("resize", fit);
    const tilt = (x: number, y: number) => {
      el.style.setProperty("--ty", `${(x * 4).toFixed(2)}deg`);
      el.style.setProperty("--tx", `${(-y * 3).toFixed(2)}deg`);
    };
    const move = (e: PointerEvent) => tilt((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    const orient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt(Math.max(-1, Math.min(1, e.gamma / 25)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    };
    addEventListener("pointermove", move);
    addEventListener("deviceorientation", orient);
    return () => {
      removeEventListener("resize", fit);
      removeEventListener("pointermove", move);
      removeEventListener("deviceorientation", orient);
      tilt(0, 0);
    };
  }, [phase]);
  return (
    <div ref={ref} className={s.env} aria-hidden>
      <span className={s.under} />
      <span className={s.hinge}>
        <i className={s.front}>
          <span className={s.mono}>
            <span className={s.gold}>{mono}</span>
          </span>
        </i>
        <i className={s.back} />
      </span>
      <span className={s.still}>
        <span className={s.mono} style={{ top: "45.3%" }}>
          <span className={s.gold}>{mono}</span>
        </span>
      </span>
    </div>
  );
}

/** The courtyard settles in while the flap is still lifting. */
function ReadyMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="olive"]');
    if (!root) return;
    if (phase === "closed") {
      root.removeAttribute("data-ready");
      return;
    }
    const t = window.setTimeout(() => root.setAttribute("data-ready", ""), 1500);
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

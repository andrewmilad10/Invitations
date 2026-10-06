"use client";

import { useEffect, useRef } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { KitIntro, type IntroPhase } from "../intro";
import s from "./meadow.module.css";

// fixed positions so the server and the browser agree
const PETALS = Array.from({ length: 12 }, (_, i) => ({ left: (i * 37) % 100, x: ((i % 5) - 2) * 50, r: (i % 2 ? 1 : -1) * (200 + i * 20), d: 13 + (i % 4) * 3, delay: -i * 1.9, white: i % 3 === 0 }));

/**
 * Linen Meadow's opening. A stitched linen envelope closed with a red fabric
 * button rests on linen while petals drift past. Tap: the button and its loop
 * fade as the flap starts lifting straight away, the leaf lining shows, the
 * flap rises slowly until it stands open, and while it is still rising the
 * whole screen eases into the meadow.
 */
export function MeadowOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[2400, 2300]}>
      {({ phase, open, skip }) => (
        <>
          <span className={s.petals} aria-hidden>
            {PETALS.map((p, i) => (
              <i key={i} className={cn(p.white && s.petalW)} style={{ left: `${p.left}%`, "--x": `${p.x}px`, "--r": `${p.r}deg`, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` } as React.CSSProperties} />
            ))}
          </span>
          <p className={s.who}>
            {wedding.partnerOne} {ar ? "و" : "&"} {wedding.partnerTwo}
          </p>
          <button type="button" className={s.scene} onClick={open} aria-label={model.strings.openInvitation}>
            <span className={s.shadow} />
            <span className={cn(s.lay, s.under)} />
            <span className={cn(s.lay, s.band)} />
            <span className={s.hinge}>
              <i className={s.out} />
              <i className={cn(s.out, s.oc)} />
              <i className={s.in} />
            </span>
            <span className={s.ring} />
            <span className={cn(s.lay, s.still)} />
          </button>
          <p className={s.hint}>{ar ? "اضغطوا على الزر للفتح" : "Tap the button to open"}</p>
          <LeavingMark phase={phase} />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

/** Marks the template root as ready as soon as the envelope starts to fade, so the meadow settles underneath it. */
function LeavingMark({ phase }: { phase: IntroPhase }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="meadow"]');
    if (!root) return;
    if (phase === "leaving") root.setAttribute("data-ready", "");
    if (phase === "closed") root.removeAttribute("data-ready");
  }, [phase]);
  return null;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function MeadowReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

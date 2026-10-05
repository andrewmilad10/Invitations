"use client";

import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { KitIntro, type IntroPhase } from "./intro";
import e from "./envelope.module.css";

/**
 * The shared envelope opening (see envelope.module.css for the shape and the
 * variables each template sets). `className` carries the template's dressing;
 * `flapArt` sits on the flap, `seal` on its tip; `extra` renders alongside
 * (e.g. petals) and sees the phase.
 */
export function KitEnvelope({
  model,
  className,
  seal,
  flapArt,
  extra,
}: {
  model: InvitationModel;
  className?: string;
  seal: ReactNode;
  flapArt?: ReactNode;
  extra?: (phase: IntroPhase) => ReactNode;
}) {
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={cn(e.intro, e.root, className)} timing={[2000, 1200]}>
      {({ phase, open, skip }) => (
        <>
          {extra?.(phase)}
          <div className={e.env} onClick={open}>
            <div className={e.stage}>
              <div className={e.inside} aria-hidden />
              <div className={cn(e.paper, e.sideL)} aria-hidden />
              <div className={cn(e.paper, e.sideR)} aria-hidden />
              <div className={e.bottomWrap} aria-hidden>
                <div className={cn(e.paper, e.bottom)} />
              </div>
              <svg className={e.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <path className={e.dk} d="M0 63 L50 49 L100 63" />
                <path className={e.lt} d="M0 62.4 L50 48.4 L100 62.4" />
              </svg>
              <div className={e.flapShadow} aria-hidden />
              <div className={e.flap}>
                <div className={e.flapFace} aria-hidden>
                  {flapArt}
                </div>
                <svg className={e.flapEdge} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  <path d="M0 56.54 L39 94.63 Q50 105.37 61 94.63 L100 56.54" />
                </svg>
                <button type="button" className={e.seal} onClick={open} aria-label={model.strings.openInvitation}>
                  {seal}
                </button>
              </div>
            </div>
            <div className={e.label}>
              <span className={e.tap}>{ar ? "اضغطوا للفتح" : "Tap to open"}</span>
              <span className={e.what}>{ar ? "دعوة زفاف" : "A wedding invitation"}</span>
            </div>
          </div>
          {skip}
        </>
      )}
    </KitIntro>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { KitIntro, type IntroPhase } from "../intro";
import { FlowCanvas, type FlowMode } from "./flow";
import s from "./lemon.module.css";

const ART = "/templates/lemon-terrace";
// fixed positions so the server and the browser agree
const SPARKS = [[6, 3], [94, 3], [50, 43], [4, 30], [96, 34], [4, 62], [96, 66], [6, 97], [94, 97], [50, 93], [30, 1.5], [70, 1.5]];
const BLOSSOMS = Array.from({ length: 9 }, (_, i) => ({ left: (i * 11.3 + 3) % 100, x: ((i % 3) - 1) * 60, r: (i % 2 ? 1 : -1) * 280, d: 11 + (i % 4) * 2.5, delay: -i * 1.7, z: 0.6 + (i % 3) * 0.25 }));
const MOTES = Array.from({ length: 18 }, (_, i) => ({ left: 38 + ((i * 37) % 24), top: 26 + ((i * 13) % 10), x: ((i * 29) % 120) - 60, delay: 5.2 + ((i * 0.37) % 2.2) }));

function Blossom() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <g className={s.petal}>
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="10" cy="5" rx="3" ry="4.6" transform={`rotate(${r} 10 10)`} />
        ))}
      </g>
      <circle cx="10" cy="10" r="2" className={s.pistil} />
    </svg>
  );
}

/** The envelope: the light, the tilt and the flap, all from the intro's phase. */
function Envelope({ model, phase, open }: { model: InvitationModel; phase: IntroPhase; open: () => void }) {
  const env = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState(false);
  const mode: FlowMode = phase === "closed" ? "idle" : dim ? "dim" : "fill";

  // once the light has filled every line, it settles to a faint gold
  useEffect(() => {
    const t = window.setTimeout(() => setDim(phase !== "closed"), phase === "closed" ? 0 : 4900);
    return () => clearTimeout(t);
  }, [phase]);

  // a gentle 3D tilt with the finger, the mouse or the phone
  useEffect(() => {
    const el = env.current;
    if (!el || phase !== "closed") return;
    const tilt = (x: number, y: number) => {
      el.style.setProperty("--ty", `${(x * 7).toFixed(2)}deg`);
      el.style.setProperty("--tx", `${(-y * 6).toFixed(2)}deg`);
    };
    const move = (e: PointerEvent) => tilt((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    const orient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt(Math.max(-1, Math.min(1, e.gamma / 25)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    };
    addEventListener("pointermove", move);
    addEventListener("deviceorientation", orient);
    return () => {
      removeEventListener("pointermove", move);
      removeEventListener("deviceorientation", orient);
      tilt(0, 0);
    };
  }, [phase]);

  return (
    <div className={s.stage}>
      <div className={s.bob}>
        <div ref={env} className={s.env} onClick={open}>
          <span className={s.shadow} aria-hidden />
          <span className={cn(s.layer, s.under)} aria-hidden />
          <span className={cn(s.layer, s.inLight)} aria-hidden />
          <span className={cn(s.layer, s.front)} aria-hidden />
          <FlowCanvas src={`${ART}/flow-body.png`} mode={mode} className={cn(s.layer, s.flow)} />
          <span className={s.hinge} aria-hidden>
            <i className={s.fOut}>
              <FlowCanvas src={`${ART}/flow-flap.png`} mode={mode} className={s.flowFlap} />
            </i>
            <i className={s.fIn} />
          </span>
          {SPARKS.map(([x, y], i) => (
            <i key={i} className={s.spark} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${((i * 0.53) % 3.4) + 1.6}s` }} aria-hidden />
          ))}
          <span className={s.ring} aria-hidden />
          <button type="button" className={s.ornament} onClick={open} aria-label={model.strings.openInvitation} />
          <span className={cn(s.layer, s.sheen)} aria-hidden />
        </div>
      </div>
    </div>
  );
}

/**
 * Lemon Terrace's opening. A powder-blue envelope with an embossed frame floats
 * on a watercolour sea, light rays turning slowly behind it and blossoms
 * drifting down. Tap the ornament: gold flows slowly along every embossed line,
 * the flap lifts on a blossom lining with light from inside, and halfway open
 * the whole screen fades into the terrace.
 */
export function LemonOpening({ model }: { model: InvitationModel }) {
  const { wedding } = model;
  const ar = model.locale === "ar";
  return (
    <KitIntro model={model} className={s.intro} timing={[6500, 2400]}>
      {({ phase, open, skip }) => (
        <>
          <span className={s.rays} aria-hidden />
          <span className={s.bloss} aria-hidden>
            {BLOSSOMS.map((b, i) => (
              <span key={i} style={{ left: `${b.left}%`, "--x": `${b.x}px`, "--r": `${b.r}deg`, animationDuration: `${b.d}s`, animationDelay: `${b.delay}s`, scale: b.z } as React.CSSProperties}>
                <Blossom />
              </span>
            ))}
          </span>
          <p className={s.who}>
            {wedding.partnerOne} {ar ? "و" : "&"} {wedding.partnerTwo}
          </p>
          <Envelope model={model} phase={phase} open={open} />
          <p className={s.hint}>{ar ? "اضغطوا على الزخرفة للفتح" : "Tap the envelope to open"}</p>
          <span className={s.motes} aria-hidden>
            {MOTES.map((m, i) => (
              <i key={i} style={{ left: `${m.left}%`, top: `${m.top}%`, "--x": `${m.x}px`, animationDelay: `${m.delay}s` } as React.CSSProperties} />
            ))}
          </span>
          <LeavingMark phase={phase} />
          {skip}
        </>
      )}
    </KitIntro>
  );
}

/** Marks the template root as ready as soon as the envelope starts to fade, so the terrace settles underneath it. */
function LeavingMark({ phase }: { phase: IntroPhase }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-kit="lemon"]');
    if (!root) return;
    if (phase === "leaving") root.setAttribute("data-ready", "");
    if (phase === "closed") root.removeAttribute("data-ready");
  }, [phase]);
  return <span ref={ref} hidden />;
}

/** Without an opening (editor, exports, reduced motion), everything is ready at once. */
export function LemonReady({ model }: { model: InvitationModel }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-kit]");
    if (!root) return;
    const intro = model.mode === "live" || model.mode === "sample";
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-ready", "");
  }, [model.mode]);
  return <span ref={ref} hidden />;
}

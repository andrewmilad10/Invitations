"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { getSection } from "@/core/invitation/model";
import { InvitationImage } from "../../shared/invitation-image";
import styles from "./opening.module.css";

gsap.registerPlugin(useGSAP);

type Phase = "closed" | "opening" | "done";

/** Fired on window when the opening has finished and the page is interactive. */
export const OPENED_EVENT = "invitation:opened";

/**
 * Envelope → seal → flap → card rises → card zooms into the hero.
 *
 * The invitation page is rendered underneath from the start (hero at the
 * top, normal document flow). This component is a fixed overlay on top of
 * it; once the card exactly covers the viewport with the hero's image, the
 * overlay fades out and is removed from the DOM. Nothing in the page moves,
 * so there is no blank space and no layout jump.
 *
 * - live / sample: shown on load.
 * - preview: hidden until "Replay opening" (invitation:replay-opening).
 * - export: never rendered (the renderer doesn't mount it).
 */
export function EnvelopeOpening({ model }: { model: InvitationModel }) {
  const autoShow = model.mode === "live" || model.mode === "sample";
  const [phase, setPhase] = useState<Phase>(autoShow ? "closed" : "done");
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Lock scrolling while the envelope is showing, and start at the very top.
  const locked = phase !== "done";
  useLayoutEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      html.style.overflow = previous;
    };
  }, [locked]);

  // Focus the seal for keyboard users — but only when the invitation is the
  // page itself. Inside an iframe (editor preview, homepage demo) focusing
  // would scroll the host page.
  const seal = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (phase === "closed" && window.self === window.top) seal.current?.focus({ preventScroll: true });
  }, [phase]);

  // Replay from the editor preview.
  useEffect(() => {
    const replay = () => {
      tl.current?.kill();
      window.scrollTo(0, 0);
      setPhase("closed");
    };
    window.addEventListener("invitation:replay-opening", replay);
    return () => window.removeEventListener("invitation:replay-opening", replay);
  }, []);

  const finish = useCallback(() => {
    setPhase("done");
    window.dispatchEvent(new CustomEvent(OPENED_EVENT));
  }, []);

  const { contextSafe } = useGSAP({ scope: root, dependencies: [phase] });

  // contextSafe is applied at click time (not during render) so the tweens
  // are owned by the GSAP context and cleaned up with the component.
  const open = () => contextSafe(runOpening)();

  function runOpening() {
    if (phase !== "closed" || !root.current) return;
    setPhase("opening");
    // Browsers only allow audio after a user gesture — this click is one.
    window.dispatchEvent(new CustomEvent("invitation:play-music"));

    const q = gsap.utils.selector(root);
    const card = q(`.${styles.card}`)[0] as HTMLElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      tl.current = gsap.timeline({ onComplete: finish }).to(root.current, { autoAlpha: 0, duration: 0.45, ease: "power1.out" });
      return;
    }

    const paper = q(`.${styles.back}, .${styles.front}, .${styles.flap}`);
    const t = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: finish });
    tl.current = t;

    t.to(q(`.${styles.seal}`), { scale: 1.25, duration: 0.18, ease: "power1.out" })
      .to(q(`.${styles.seal}`), { scale: 0, rotate: -35, autoAlpha: 0, duration: 0.35, ease: "back.in(2)" })
      .to(q(`.${styles.hint}`), { autoAlpha: 0, duration: 0.3 }, "<")
      // Flap opens; halfway through it passes behind the card.
      .to(q(`.${styles.flap}`), { rotationX: 180, transformPerspective: 1400, duration: 0.85 }, "-=0.05")
      .set(q(`.${styles.flap}`), { zIndex: 0 }, "-=0.42")
      .set(card, { visibility: "visible" }, "<")
      // Card rises out of the pocket.
      .to(card, { yPercent: -62, duration: 0.95, ease: "power2.out" }, "-=0.15")
      // Envelope falls away; the card settles to the centre.
      .to(paper, { y: "70vh", rotation: (i) => [-4, 3, -2][i] ?? 0, autoAlpha: 0, duration: 0.9, ease: "power2.in" }, "+=0.1")
      .to(card, { yPercent: -10, duration: 0.9, ease: "power2.inOut" }, "<")
      // Zoom: from its current box to exactly the viewport.
      .add(() => {
        const r = card.getBoundingClientRect();
        gsap.set(card, { position: "fixed", top: r.top, left: r.left, width: r.width, height: r.height, yPercent: 0, y: 0, margin: 0, zIndex: 10 });
      })
      .to(card, {
        top: 0,
        left: 0,
        width: () => window.innerWidth,
        height: () => window.innerHeight,
        borderRadius: 0,
        duration: 1.15,
        ease: "power3.inOut",
      })
      // Swap paper for the hero photo early, so the zoom reads as "the card
      // becomes the hero" rather than a grey crossfade.
      .to(q(`.${styles.cardFace}`), { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, "<")
      .to(q(`.${styles.heroLayer}`), { opacity: 1, duration: 0.4, ease: "power1.out" }, "<0.05")
      // The card now matches the hero underneath; reveal it.
      .to(root.current, { autoAlpha: 0, duration: 0.6, ease: "power1.out" }, "+=0.05");
  }

  if (phase === "done") return null;

  const hero = getSection(model, "hero");
  const { wedding, strings, media } = model;

  return (
    <div ref={root} className={styles.stage} data-opening="" aria-label={strings.openInvitation} role="dialog" aria-modal="true">
      {/* Without JavaScript, skip the overlay entirely. */}
      <noscript>
        <style>{"[data-opening]{display:none!important}"}</style>
      </noscript>
      <div className={styles.center}>
        <div className={styles.envelope} onClick={open}>
          <div className={styles.back} aria-hidden />
          <div className={styles.card} aria-hidden>
            <div className={styles.heroLayer}>
              {media.hero ? <InvitationImage asset={media.hero} alt="" fill priority sizes="100vw" className="object-cover" /> : null}
              {media.hero ? <div className={styles.heroScrim} /> : null}
            </div>
            <div className={styles.cardFace}>
              {hero?.content.eyebrow ? <span className={styles.small}>{hero.content.eyebrow}</span> : null}
              <span className={styles.names}>
                {wedding.partnerOne}
                <span className={styles.amp}>&amp;</span>
                {wedding.partnerTwo}
              </span>
              {wedding.date ? <span className={styles.small}>{wedding.date.long}</span> : null}
            </div>
          </div>
          <div className={styles.front} aria-hidden />
          <div className={styles.flap} aria-hidden />
          <button type="button" className={styles.seal} onClick={(e) => (e.stopPropagation(), open())} aria-label={strings.openInvitation} ref={seal}>
            <span aria-hidden>
              {wedding.initials[0]}
              {wedding.initials[1] ? `·${wedding.initials[1]}` : ""}
            </span>
          </button>
        </div>
        <p className={styles.hint}>{strings.tapToOpen}</p>
      </div>
    </div>
  );
}

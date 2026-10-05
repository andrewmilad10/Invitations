"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { OPENED_EVENT } from "../../cinematic/opening/envelope-opening";
import type { Stage, StagePhase } from "./stage";
import s from "./bottle.module.css";

/** Sea, cork and paper sounds, made in Web Audio (no files); silent until the guest turns them on. */
function makeSound() {
  let ctx: AudioContext | null = null, master: GainNode | null = null, on = false;
  const buf = (sec: number, brown: boolean) => {
    const b = ctx!.createBuffer(1, ctx!.sampleRate * sec, ctx!.sampleRate), d = b.getChannelData(0);
    let l = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) {
        l = (l + 0.02 * w) / 1.02;
        d[i] = l * 3.5;
      } else d[i] = w;
    }
    return b;
  };
  const start = () => {
    if (ctx) return void ctx.resume();
    ctx = new AudioContext();
    master = ctx.createGain();
    master.connect(ctx.destination);
    const sea = ctx.createBufferSource();
    sea.buffer = buf(6, true);
    sea.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(), lg2 = ctx.createGain();
    lfo.frequency.value = 0.11;
    lg.gain.value = 300;
    lg2.gain.value = 0.2;
    lfo.connect(lg).connect(lp.frequency);
    lfo.connect(lg2).connect(g.gain);
    sea.connect(lp).connect(g).connect(master);
    sea.start();
    lfo.start();
  };
  return {
    toggle() {
      on = !on;
      if (on) start();
      else void ctx?.suspend();
      return on;
    },
    pop() {
      if (!on || !ctx || !master) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(420, t);
      o.frequency.exponentialRampToValueAtTime(90, t + 0.12);
      g.gain.setValueAtTime(0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.2);
    },
    rustle(len: number) {
      if (!on || !ctx || !master) return;
      const t = ctx.currentTime, n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = buf(len + 0.2, false);
      hp.type = "highpass";
      hp.frequency.value = 2500;
      g.gain.setValueAtTime(0, t);
      for (let k = 0; k < len * 8; k++) g.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.1, t + k / 8);
      g.gain.linearRampToValueAtTime(0, t + len);
      n.connect(hp).connect(g).connect(master);
      n.start(t);
    },
    stop() {
      void ctx?.close();
    },
  };
}

const fontOf = (root: Element, v: string, fallback: string) => getComputedStyle(root).getPropertyValue(v).trim() || fallback;

/**
 * The live scene and its few controls. Only for live and sample invitations
 * with motion allowed and WebGL available; otherwise nothing renders and the
 * page keeps its still hero (a letter on a painted sea).
 */
export function BottleScene({ model }: { model: InvitationModel }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tap = useRef<HTMLButtonElement>(null);
  const stage = useRef<Stage | null>(null);
  const sound = useRef<ReturnType<typeof makeSound> | null>(null);
  const [phase, setPhase] = useState<StagePhase | "off">("off");
  const [soundOn, setSoundOn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ar = model.locale === "ar";
  const live = model.mode === "live" || model.mode === "sample";

  useEffect(() => {
    if (!live || !canvas.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = canvas.current.closest("[data-kit]");
    if (!root || reduced) return;
    let cancelled = false;
    const snd = (sound.current = makeSound());
    const html = document.documentElement;
    const { wedding } = model;
    const place = model.events.ceremony ?? model.events.reception;
    import("./stage")
      .then(({ createStage }) => {
        if (cancelled || !canvas.current) return;
        stage.current = createStage(canvas.current, {
          reduced,
          text: {
            eyebrow: ar ? "مع عائلتيهما" : "Together with their families",
            lead: ar ? "تبدأ مغامرتنا" : "Our adventure begins",
            one: wedding.partnerOne,
            two: wedding.partnerTwo,
            amp: ar ? "و" : "&",
            date: wedding.date?.long ?? "",
            place: ((full) => (full.length > 40 ? (place?.venueName ?? full) : full))([place?.venueName, place?.address].filter(Boolean).join(", ")),
          },
          fonts: { script: fontOf(root, "--inv-font-heading", "cursive"), serif: fontOf(root, "--inv-font-body", "serif"), caps: fontOf(root, "--inv-font-accent", "serif") },
          onPhase: (p) => {
            setPhase(p);
            html.style.overflow = p === "read" ? "" : "hidden";
            if (p === "read") window.dispatchEvent(new CustomEvent(OPENED_EVENT));
          },
          onTap: (x, y) => {
            if (tap.current) tap.current.style.transform = `translate(${x}px, ${y}px)`;
          },
          sound: { pop: () => snd.pop(), rustle: (l) => snd.rustle(l) },
        });
        root.setAttribute("data-scene", "on");
        scrollTo(0, 0);
      })
      .catch(() => {
        // no WebGL (or the module failed): keep the still page
        html.style.overflow = "";
        setPhase("off");
      });
    const replay = () => stage.current?.replay();
    const onScroll = () => setScrolled(scrollY > 40);
    window.addEventListener("invitation:replay-opening", replay);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("invitation:replay-opening", replay);
      window.removeEventListener("scroll", onScroll);
      stage.current?.dispose();
      stage.current = null;
      snd.stop();
      root.removeAttribute("data-scene");
      html.style.overflow = "";
    };
    // the scene is built once per invitation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  if (!live) return null;
  const opening = phase === "arrive" || phase === "idle";
  return (
    <>
      <canvas ref={canvas} className={cn(s.canvas, phase === "off" && s.off)} aria-hidden />
      {phase !== "off" ? (
        <div className={s.ui}>
          <div className={s.chrome}>
            <button
              type="button"
              className={s.chip}
              aria-pressed={soundOn}
              onClick={() => setSoundOn(sound.current?.toggle() ?? false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M4 9v6h4l5 4V5L8 9z" />
                <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" opacity={soundOn ? 1 : 0.35} />
              </svg>
              <span>{ar ? "الصوت" : "Sound"}</span>
            </button>
            {opening ? (
              <button type="button" className={s.chip} onClick={() => stage.current?.skip()}>
                {ar ? "تخطّي" : "Skip"}
              </button>
            ) : null}
          </div>
          <div className={cn(s.title, !opening && s.hidden)} aria-hidden={!opening}>
            <p>{ar ? "وصلتكم رسالة من البحر" : "A message has washed ashore"}</p>
            <p className={s.forYou}>{ar ? "لكم" : "for you"}</p>
          </div>
          <button ref={tap} type="button" className={cn(s.tapRing, phase !== "idle" && s.hidden)} onClick={() => stage.current?.open()} aria-label={model.strings.openInvitation} />
          <p className={cn(s.tapLabel, phase !== "idle" && s.hidden)} aria-hidden>
            {ar ? "اضغطوا على الزجاجة" : "Tap the bottle"}
          </p>
          <div className={cn(s.cue, (phase !== "read" || scrolled) && s.hidden)} aria-hidden>
            {ar ? "انزلوا" : "Scroll"}
            <i />
          </div>
        </div>
      ) : null}
    </>
  );
}

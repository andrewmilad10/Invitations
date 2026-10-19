"use client";
/* eslint-disable @next/next/no-img-element -- a long still of the whole site, moved with a transform */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { hasOpening, playSrc } from "./play-data";

type Phase = "idle" | "scrolling";

/**
 * A design played inside a phone screen, the way a guest meets it: its own
 * opening first (the recorded envelope, curtain or fan, when it has one),
 * then a slow scroll from the first screen down through every section.
 * `playing` starts and stops it; stopping returns to the first frame.
 * With reduced motion it stays on the first frame.
 */
export function PlayScreen({
  id,
  playing,
  speed = 130,
  eager = false,
  onScrollStart,
  className,
}: {
  id: string;
  playing: boolean;
  /** Pixels (of the screen as drawn) scrolled per second. */
  speed?: number;
  /** Show its first screen straight away (designs near the middle of a carousel). */
  eager?: boolean;
  /** Called when the scroll begins, with its length in seconds. */
  onScrollStart?: (seconds: number) => void;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [run, setRun] = useState({ sh: 0, dur: 14 });
  // Something is still arriving while it should be playing: show a small spinner over the still.
  const [busy, setBusy] = useState(false);
  // The tall still of the whole site is only fetched once the design plays, then kept.
  const [kept, setKept] = useState(false);
  const opens = hasOpening(id);
  const src = playSrc(id);
  const cb = useRef(onScrollStart);
  useEffect(() => {
    cb.current = onScrollStart;
  });

  useEffect(() => {
    const v = vid.current;
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (v) {
        v.pause();
        try {
          v.currentTime = 0;
        } catch {}
      }
      return;
    }
    let alive = true;
    let t = 0;
    let slow = 0;
    let started = false;
    const scroll = () => {
      if (!alive || started) return;
      started = true;
      window.clearTimeout(t);
      const el = box.current;
      const im = img.current;
      if (!el || !im) return;
      const go = () => {
        if (!alive) return;
        setBusy(false);
        const sh = el.clientHeight;
        const h = im.naturalWidth ? el.clientWidth * (im.naturalHeight / im.naturalWidth) : sh * 8;
        const dur = Math.max(12, Math.min(26, (h - sh) / speed));
        setRun({ sh, dur });
        setPhase("scrolling");
        cb.current?.(dur);
      };
      if (im.complete && im.naturalWidth) go();
      else {
        setBusy(true);
        im.addEventListener("load", go, { once: true });
        im.addEventListener("error", () => alive && setBusy(false), { once: true });
      }
    };
    if (opens && v) {
      v.preload = "auto";
      try {
        v.currentTime = 0;
      } catch {}
      v.onended = scroll;
      v.onerror = scroll;
      v.onwaiting = () => alive && setBusy(true);
      v.onplaying = () => alive && setBusy(false);
      v.querySelectorAll("source").forEach((s) => (s.onerror = () => v.networkState === v.NETWORK_NO_SOURCE && scroll()));
      // only show the spinner when the opening is actually slow to arrive
      slow = window.setTimeout(() => alive && v.readyState < 3 && setBusy(true), 300);
      // never wait on a video that can't play
      t = window.setTimeout(scroll, 15000);
      const p = v.play();
      if (p) p.catch(() => (t = window.setTimeout(scroll, 600)));
    } else {
      t = window.setTimeout(scroll, 400);
    }
    return () => {
      alive = false;
      window.clearTimeout(t);
      window.clearTimeout(slow);
      if (v) {
        v.onended = null;
        v.onerror = null;
        v.onwaiting = null;
        v.onplaying = null;
      }
      setPhase("idle");
      setBusy(false);
    };
  }, [playing, opens, speed]);

  const scrolling = playing && phase === "scrolling";
  return (
    <div ref={box} className={cn("relative overflow-hidden bg-muted", className)}>
      {/* the first screen: small, so every card shows its design straight away */}
      <img src={src.first} alt="" draggable={false} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"} className="absolute inset-0 size-full object-cover object-top" />
      <img
        ref={img}
        src={playing || kept ? src.page : undefined}
        alt=""
        draggable={false}
        decoding="async"
        onLoad={() => setKept(true)}
        className={cn("absolute inset-x-0 top-0 h-auto w-full max-w-none will-change-transform", !kept && "opacity-0")}
        style={{
          transform: scrolling ? `translateY(calc(-100% + ${run.sh}px))` : "translateY(0)",
          transition: scrolling ? `transform ${run.dur}s cubic-bezier(.4,.02,.45,1) .9s` : "transform .7s cubic-bezier(.22,.8,.24,1)",
        }}
      />
      {opens ? (
        <video
          ref={vid}
          muted
          playsInline
          disablePictureInPicture
          preload="none"
          poster={src.first}
          className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", scrolling ? "opacity-0" : "opacity-100")}
        >
          {/* WebM is about half the size; browsers that can't play it take the MP4 */}
          <source src={src.openWebm} type='video/webm; codecs="vp9"' />
          <source src={src.open} type="video/mp4" />
        </video>
      ) : null}
      <span aria-hidden className={cn("pointer-events-none absolute inset-0 z-10 grid place-items-center transition-opacity duration-300", busy ? "opacity-100 delay-150" : "opacity-0")}>
        <span className="grid size-10 place-items-center rounded-full bg-black/45 backdrop-blur-sm">
          <span className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none" />
        </span>
      </span>
      <span aria-hidden className={cn("absolute inset-x-[12%] bottom-2.5 z-10 h-0.5 overflow-hidden rounded-full bg-white/35 transition-opacity", scrolling ? "opacity-100" : "opacity-0")}>
        <i
          className="block h-full origin-left bg-white"
          style={{ transform: scrolling ? "scaleX(1)" : "scaleX(0)", transition: scrolling ? `transform ${run.dur + 0.9}s linear` : "none" }}
        />
      </span>
    </div>
  );
}

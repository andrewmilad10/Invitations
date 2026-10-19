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
  /** Load the media straight away (the design in the middle of a carousel). */
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
        const sh = el.clientHeight;
        const h = im.naturalWidth ? el.clientWidth * (im.naturalHeight / im.naturalWidth) : sh * 8;
        const dur = Math.max(12, Math.min(26, (h - sh) / speed));
        setRun({ sh, dur });
        setPhase("scrolling");
        cb.current?.(dur);
      };
      if (im.complete && im.naturalWidth) go();
      else im.addEventListener("load", go, { once: true });
    };
    if (opens && v) {
      v.preload = "auto";
      try {
        v.currentTime = 0;
      } catch {}
      v.onended = scroll;
      v.onerror = scroll;
      v.querySelectorAll("source").forEach((s) => (s.onerror = () => v.networkState === v.NETWORK_NO_SOURCE && scroll()));
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
      if (v) {
        v.onended = null;
        v.onerror = null;
      }
      setPhase("idle");
    };
  }, [playing, opens, speed]);

  const scrolling = playing && phase === "scrolling";
  return (
    <div ref={box} className={cn("relative overflow-hidden bg-muted", className)}>
      <img
        ref={img}
        src={src.page}
        alt=""
        draggable={false}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-x-0 top-0 h-auto w-full max-w-none will-change-transform"
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
          preload={eager ? "auto" : "none"}
          poster={src.first}
          className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", scrolling ? "opacity-0" : "opacity-100")}
        >
          <source src={src.open} type="video/mp4" />
          <source src={src.openWebm} type="video/webm" />
        </video>
      ) : null}
      <span aria-hidden className={cn("absolute inset-x-[12%] bottom-2.5 z-10 h-0.5 overflow-hidden rounded-full bg-white/35 transition-opacity", scrolling ? "opacity-100" : "opacity-0")}>
        <i
          className="block h-full origin-left bg-white"
          style={{ transform: scrolling ? "scaleX(1)" : "scaleX(0)", transition: scrolling ? `transform ${run.dur + 0.9}s linear` : "none" }}
        />
      </span>
    </div>
  );
}

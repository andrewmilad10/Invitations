"use client";
/* eslint-disable @next/next/no-img-element -- a transparent wax seal that animates as it is pressed */

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import s from "./bottle.module.css";


/**
 * The reply: a wax seal the guest presses and holds. A ring fills, the seal
 * stamps with a little burst and a buzz, then the couple's reply link opens.
 * The keyboard (Enter or Space) stamps it at once.
 */
export function HoldSeal({ href, label, hint, done }: { href: string | null; label: string; hint: string; done: string }) {
  const [state, setState] = useState<"rest" | "pressing" | "stamped">("rest");
  const timer = useRef(0);
  const burst = useRef<HTMLSpanElement>(null);

  const stamp = () => {
    setState("stamped");
    navigator.vibrate?.([12, 40, 24]);
    const b = burst.current;
    if (b) {
      for (let i = 0; i < 18; i++) {
        const el = document.createElement("i");
        const a = Math.random() * 6.28, r = 60 + Math.random() * 60;
        el.style.setProperty("--x", `${Math.cos(a) * r}px`);
        el.style.setProperty("--y", `${Math.sin(a) * r}px`);
        el.style.setProperty("--r", `${Math.random() * 400}deg`);
        el.dataset.c = String(i % 3);
        b.append(el);
        setTimeout(() => el.remove(), 1100);
      }
    }
    if (href) setTimeout(() => window.open(href, "_blank", "noopener,noreferrer"), 650);
  };
  const start = () => {
    setState("pressing");
    clearTimeout(timer.current);
    timer.current = window.setTimeout(stamp, 1100);
  };
  const cancel = () => {
    clearTimeout(timer.current);
    setState((st) => (st === "pressing" ? "rest" : st));
  };

  return (
    <div className={s.holdWrap}>
      <button
        type="button"
        className={cn(s.hold, state === "pressing" && s.pressing, state === "stamped" && s.stamped)}
        aria-label={label}
        onPointerDown={(e) => {
          e.preventDefault();
          start();
        }}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
            e.preventDefault();
            stamp();
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="48" />
        </svg>
        <img src="/templates/set-sail/seal-reply.webp" alt="" />
        <span ref={burst} className={s.burst} aria-hidden />
      </button>
      <p className={s.holdHint} aria-live="polite">
        {state === "stamped" ? done : hint}
      </p>
    </div>
  );
}

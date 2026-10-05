"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { showerPetals } from "./petals";
import s from "./blue.module.css";

/**
 * A pearl scratch-off over its children: guests rub it away with a finger to
 * reveal what's underneath, then petals fall. Exports and the editor show the
 * reveal directly (`off`).
 */
export function Scratch({ children, label, hint, doneHint, off }: { children: ReactNode; label: string; hint: string; doneHint: string; off?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || off) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let down = false;
    let last: [number, number] | null = null;
    let finished = false;
    const paint = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      const { width: w, height: h } = cv;
      const g = ctx.createLinearGradient(0, 0, w, h);
      ["rgb(238 241 248)", "rgb(223 230 244)", "rgb(246 234 240)", "rgb(231 227 245)", "rgb(238 244 246)", "rgb(243 233 238)", "rgb(228 235 246)"].forEach((c, i, all) => g.addColorStop(i / (all.length - 1), c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const sheen = ctx.createRadialGradient(w * 0.32, h * 0.28, 0, w * 0.32, h * 0.28, w * 0.7);
      sheen.addColorStop(0, "rgb(255 255 255 / .85)");
      sheen.addColorStop(1, "rgb(255 255 255 / 0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < (w * h) / 90; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? `rgb(255 255 255 / ${Math.random() * 0.25})` : `rgb(150 160 190 / ${Math.random() * 0.25})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, dpr, dpr);
      }
      const font = getComputedStyle(cv).getPropertyValue("--script").trim() || "cursive";
      ctx.fillStyle = "rgb(125 141 179)";
      ctx.textAlign = "center";
      ctx.font = `${22 * dpr}px ${font}`;
      ctx.fillText(label, w / 2, h / 2 + 8 * dpr);
    };
    const at = (e: PointerEvent): [number, number] => {
      const r = cv.getBoundingClientRect();
      const k = cv.width / r.width;
      return [(e.clientX - r.left) * k, (e.clientY - r.top) * k];
    };
    const rub = (e: PointerEvent) => {
      if (!down || finished) return;
      const p = at(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineWidth = 34 * (cv.width / cv.getBoundingClientRect().width);
      ctx.beginPath();
      ctx.moveTo(...(last ?? p));
      ctx.lineTo(...p);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      last = p;
    };
    const check = () => {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0;
      for (let i = 3; i < d.length; i += 64) if (d[i] < 20) clear++;
      if (clear / (d.length / 64) > 0.45) {
        finished = true;
        setDone(true);
        showerPetals(26);
      }
    };
    const onDown = (e: PointerEvent) => { down = true; last = null; cv.setPointerCapture(e.pointerId); rub(e); };
    const onUp = () => { if (!down) return; down = false; check(); };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", rub);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    document.fonts.ready.then(paint);
    return () => {
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", rub);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
    };
  }, [label, off]);

  return (
    <>
      <div className={s.oval}>
        <div className={s.ovalIn}>
          {children}
          {off ? null : <canvas ref={canvas} className={s.foilCanvas} data-done={done ? "" : undefined} aria-label={label} role="img" />}
        </div>
        <span className={s.posyBR} aria-hidden />
      </div>
      {off ? null : <p className={s.hint}>{done ? doneHint : hint}</p>}
    </>
  );
}

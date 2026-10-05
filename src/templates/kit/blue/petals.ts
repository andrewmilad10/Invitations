import s from "./blue.module.css";

const COLOURS = ["rgb(207 220 241)", "rgb(185 203 234)", "rgb(244 217 221)", "rgb(239 198 205)", "rgb(230 220 245)", "rgb(251 243 234)"];

/** A light shower of paper petals over the page (client only; skipped with reduced motion). */
export function showerPetals(count = 18, after = 0) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = document.createElement("div");
  host.className = s.petals;
  host.setAttribute("aria-hidden", "true");
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = s.petal;
    const turn = (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random() * 400);
    p.style.cssText = `left:${Math.random() * 100}%;--c:${COLOURS[i % COLOURS.length]};--s:${10 + Math.random() * 10}px;--d:${4 + Math.random() * 3}s;--w:${after + Math.random() * 1.2}s;--x:${-80 + Math.random() * 160}px;--r:${turn}deg`;
    host.append(p);
  }
  document.body.append(host);
  window.setTimeout(() => host.remove(), (after + 9) * 1000);
}

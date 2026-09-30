import type { CSSProperties } from "react";
import { FOIL_TONES, type CardOptions, type Paper } from "@/core/card/options";
import type { CardShape } from "@/core/template/manifest";

/**
 * How a card's finishing options look on screen: silhouette (a clip or
 * mask), foil (the accent colour turned metallic) and paper (a texture laid
 * over the printed surface). Pure style objects, shared by every layout.
 */

/** Width ÷ height of each shape (the card's own size can't be measured in CSS). */
const RATIO: Record<CardShape, number> = { portrait: 5 / 7, arch: 5 / 7, corner: 5 / 7, square: 1, landscape: 7 / 5 };

/** Scallops along the shorter side. */
const SCALLOPS = 17;

export function silhouetteStyle(shape: CardShape, silhouette: CardOptions["silhouette"]): CSSProperties {
  const ratio = RATIO[shape];
  // Radii and tile sizes are in % of the card, so convert the shorter side.
  const [sx, sy] = ratio < 1 ? [1, ratio] : [1 / ratio, 1];
  if (silhouette === "rounded") {
    const r = `${(7 * sx).toFixed(2)}% / ${(7 * sy).toFixed(2)}%`;
    if (shape === "arch") return { borderBottomLeftRadius: r, borderBottomRightRadius: r };
    if (shape === "corner") return { borderRadius: `${(7 * sx).toFixed(2)}% 60% ${(7 * sx).toFixed(2)}% ${(7 * sx).toFixed(2)}% / ${(7 * sy).toFixed(2)}% 42.857% ${(7 * sy).toFixed(2)}% ${(7 * sy).toFixed(2)}%` };
    return { borderRadius: r };
  }
  if (silhouette === "scalloped") {
    // A tiled row of discs round the edge, over a solid centre.
    const nx = Math.round(SCALLOPS / sx);
    const ny = Math.round(SCALLOPS / sy);
    const w = 100 / nx;
    const h = 100 / ny;
    const mask = [
      `radial-gradient(closest-side, black 96%, transparent) 0 0 / ${w.toFixed(3)}% ${h.toFixed(3)}%`,
      `linear-gradient(black 0 0) center / ${(100 - w).toFixed(3)}% ${(100 - h).toFixed(3)}% no-repeat`,
    ].join(", ");
    return { WebkitMask: mask, mask };
  }
  return {};
}

/** Foil: the accent becomes the metal; highlights are used for the sheen. */
export function foilVars(foil: CardOptions["foil"]): CSSProperties {
  if (foil === "none") return {};
  const t = FOIL_TONES[foil];
  return {
    "--inv-accent": t.base,
    "--foil-light": t.light,
    "--foil-dark": t.dark,
  } as CSSProperties;
}

const noise = (opacity: number, frequency = 0.9) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 ${opacity} 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  ).replace(/%2523/g, "%23")}")`;

/** A texture layer drawn over the card (null for plain smooth paper). */
export function paperOverlay(paper: Paper): CSSProperties | null {
  switch (paper) {
    case "smooth":
      return null;
    case "double-thick":
    case "triple-thick": {
      // The card's edge, seen as stacked layers along the bottom and side.
      const n = paper === "triple-thick" ? 3 : 2;
      const layers = Array.from({ length: n }, (_, i) => [`inset 0 -${i * 1.5 + 1}px 0 rgb(0 0 0 / ${0.07 + i * 0.02})`, `inset -${i + 1}px 0 0 rgb(0 0 0 / 0.04)`]).flat();
      return { boxShadow: layers.join(", ") };
    }
    case "eggshell":
      return { backgroundImage: noise(0.16, 1.1), mixBlendMode: "multiply" };
    case "linen":
      return {
        backgroundImage: [
          "repeating-linear-gradient(0deg, rgb(90 80 70 / 0.035) 0 1px, transparent 1px 3px)",
          "repeating-linear-gradient(90deg, rgb(90 80 70 / 0.03) 0 1px, transparent 1px 3px)",
          noise(0.08, 1.4),
        ].join(", "),
        mixBlendMode: "multiply",
      };
    case "recycled":
      return {
        backgroundImage: [
          "radial-gradient(circle at 17% 23%, rgb(110 90 70 / 0.35) 0 0.6px, transparent 1px)",
          "radial-gradient(circle at 71% 64%, rgb(80 70 60 / 0.3) 0 0.5px, transparent 1px)",
          "radial-gradient(circle at 43% 87%, rgb(120 100 80 / 0.3) 0 0.7px, transparent 1.1px)",
          noise(0.2, 0.7),
        ].join(", "),
        backgroundSize: "23px 29px, 31px 19px, 37px 41px, auto",
        mixBlendMode: "multiply",
      };
    case "pearlescent":
      return {
        backgroundImage:
          "linear-gradient(125deg, rgb(255 225 240 / 0.55), rgb(220 235 255 / 0.5) 30%, rgb(255 250 220 / 0.55) 55%, rgb(225 255 245 / 0.5) 80%, rgb(255 230 245 / 0.55))",
        mixBlendMode: "soft-light",
      };
    case "natural":
      return { backgroundImage: `linear-gradient(rgb(230 214 185 / 0.28), rgb(230 214 185 / 0.28)), ${noise(0.12, 0.8)}`, mixBlendMode: "multiply" };
  }
}

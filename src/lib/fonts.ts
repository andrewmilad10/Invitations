import localFont from "next/font/local";

// Self-hosted fonts (files vendored by scripts/vendor-fonts.mjs). Each exposes
// a CSS variable matching src/core/theme/fonts.ts. next/font requires literal
// options, hence the repetition. Only the app UI fonts are preloaded; template
// fonts are fetched by the browser only when a page actually uses them.

const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "../assets/fonts/cormorant-garamond/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond/cormorant-garamond-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "../assets/fonts/cormorant-garamond/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const playfair = localFont({
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/playfair-display/playfair-display-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/playfair-display/playfair-display-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/playfair-display/playfair-display-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const italiana = localFont({
  variable: "--font-italiana",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/italiana/italiana-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../assets/fonts/inter/inter-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../assets/fonts/inter/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/inter/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/inter/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const jost = localFont({
  variable: "--font-jost",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/jost/jost-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../assets/fonts/jost/jost-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/jost/jost-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
});

const pinyon = localFont({
  variable: "--font-pinyon",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/pinyon-script/pinyon-script-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
});

const amiri = localFont({
  variable: "--font-amiri",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/amiri/amiri-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/amiri/amiri-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

const naskh = localFont({
  variable: "--font-naskh",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/noto-naskh-arabic/noto-naskh-arabic-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/noto-naskh-arabic/noto-naskh-arabic-arabic-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

/** Class list that defines every font CSS variable; applied to <html>. */
export const fontVariables = [cormorant, playfair, italiana, inter, jost, pinyon, amiri, naskh].map((font) => font.variable).join(" ");

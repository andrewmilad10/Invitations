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
  // A template font only (the app UI is set in Jost and Cormorant).
  preload: false,
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

const cinzel = localFont({
  variable: "--font-cinzel",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/cinzel/cinzel-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/cinzel/cinzel-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const bodoni = localFont({
  variable: "--font-bodoni",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/bodoni-moda/bodoni-moda-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/bodoni-moda/bodoni-moda-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/bodoni-moda/bodoni-moda-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const greatVibes = localFont({
  variable: "--font-greatvibes",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/great-vibes/great-vibes-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
});

const marcellus = localFont({
  variable: "--font-marcellus",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/marcellus/marcellus-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
});

const anticDidone = localFont({
  variable: "--font-didone",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/antic-didone/antic-didone-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
});

const dmSerif = localFont({
  variable: "--font-dmserif",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/dm-serif-display/dm-serif-display-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/dm-serif-display/dm-serif-display-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const instrument = localFont({
  variable: "--font-instrument",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/instrument-serif/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/instrument-serif/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const spaceMono = localFont({
  variable: "--font-spacemono",
  display: "swap",
  preload: false,
  src: [{ path: "../assets/fonts/space-mono/space-mono-latin-400-normal.woff2", weight: "400", style: "normal" }],
});

const caveat = localFont({
  variable: "--font-caveat",
  display: "swap",
  preload: false,
  src: [{ path: "../assets/fonts/caveat/caveat-latin-500-normal.woff2", weight: "500", style: "normal" }],
});

const allura = localFont({
  variable: "--font-allura",
  display: "swap",
  preload: false,
  src: [{ path: "../assets/fonts/allura/allura-latin-400-normal.woff2", weight: "400", style: "normal" }],
});

/** Class list that defines every font CSS variable; applied to <html>. */
const garamondFont = localFont({
  variable: "--font-garamond",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/eb-garamond/eb-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/eb-garamond/eb-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/eb-garamond/eb-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const frauncesFont = localFont({
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/fraunces/fraunces-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../assets/fonts/fraunces/fraunces-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/fraunces/fraunces-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/fraunces/fraunces-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "../assets/fonts/fraunces/fraunces-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const manropeFont = localFont({
  variable: "--font-manrope",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/manrope/manrope-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../assets/fonts/manrope/manrope-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/manrope/manrope-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/manrope/manrope-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const oldstandardFont = localFont({
  variable: "--font-oldstandard",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/old-standard-tt/old-standard-tt-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/old-standard-tt/old-standard-tt-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../assets/fonts/old-standard-tt/old-standard-tt-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const frakturFont = localFont({
  variable: "--font-fraktur",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/unifrakturmaguntia/unifrakturmaguntia-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
});

const homemadeFont = localFont({
  variable: "--font-homemade",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/homemade-apple/homemade-apple-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
});

const cinzeldecoFont = localFont({
  variable: "--font-cinzeldeco",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/cinzel-decorative/cinzel-decorative-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/cinzel-decorative/cinzel-decorative-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

const baskervilleFont = localFont({
  variable: "--font-baskerville",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/libre-baskerville/libre-baskerville-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/libre-baskerville/libre-baskerville-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../assets/fonts/libre-baskerville/libre-baskerville-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

const syneFont = localFont({
  variable: "--font-syne",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/syne/syne-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/syne/syne-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/syne/syne-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
});

const bebasFont = localFont({
  variable: "--font-bebas",
  display: "swap",
  preload: false,
  src: [
    { path: "../assets/fonts/bebas-neue/bebas-neue-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
});

export const fontVariables = [cormorant, playfair, italiana, inter, jost, pinyon, cinzel, bodoni, greatVibes, marcellus, anticDidone, dmSerif, instrument, spaceMono, caveat, allura, garamondFont, frauncesFont, manropeFont, oldstandardFont, frakturFont, homemadeFont, cinzeldecoFont, baskervilleFont, syneFont, bebasFont, amiri, naskh].map((font) => font.variable).join(" ");

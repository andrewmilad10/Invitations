#!/usr/bin/env node
// Copies the font files the app uses from @fontsource packages (devDependencies)
// into src/assets/fonts so they are self-hosted and committed. Re-run after
// changing the list below:  node scripts/vendor-fonts.mjs
import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "src/assets/fonts");

/** package → [subset, weight, style][] */
const FONTS = {
  "cormorant-garamond": [
    ["latin", 300, "normal"], ["latin", 400, "normal"], ["latin", 500, "normal"],
    ["latin", 600, "normal"], ["latin", 300, "italic"], ["latin", 400, "italic"],
  ],
  "playfair-display": [["latin", 400, "normal"], ["latin", 600, "normal"], ["latin", 400, "italic"]],
  italiana: [["latin", 400, "normal"]],
  inter: [["latin", 300, "normal"], ["latin", 400, "normal"], ["latin", 500, "normal"], ["latin", 600, "normal"]],
  jost: [["latin", 300, "normal"], ["latin", 400, "normal"], ["latin", 500, "normal"]],
  "pinyon-script": [["latin", 400, "normal"]],
  cinzel: [["latin", 400, "normal"], ["latin", 600, "normal"]],
  "bodoni-moda": [["latin", 400, "normal"], ["latin", 600, "normal"], ["latin", 400, "italic"]],
  "great-vibes": [["latin", 400, "normal"]],
  marcellus: [["latin", 400, "normal"]],
  "antic-didone": [["latin", 400, "normal"]],
  "dm-serif-display": [["latin", 400, "normal"], ["latin", 400, "italic"]],
  "instrument-serif": [["latin", 400, "normal"], ["latin", 400, "italic"]],
  "space-mono": [["latin", 400, "normal"]],
  amiri: [["arabic", 400, "normal"], ["arabic", 700, "normal"]],
  "noto-naskh-arabic": [["arabic", 400, "normal"], ["arabic", 600, "normal"]],
};

// Open Graph images are rendered by Satori, which reads WOFF but not WOFF2.
const OG_FONTS = [
  ["cormorant-garamond", "cormorant-garamond-latin-400-normal.woff"],
  ["cormorant-garamond", "cormorant-garamond-latin-400-italic.woff"],
  ["jost", "jost-latin-400-normal.woff"],
  ["amiri", "amiri-arabic-400-normal.woff"],
];

await rm(out, { recursive: true, force: true });
for (const [pkg, files] of Object.entries(FONTS)) {
  const src = path.join(root, "node_modules/@fontsource", pkg);
  const dest = path.join(out, pkg);
  await mkdir(dest, { recursive: true });
  for (const [subset, weight, style] of files) {
    const name = `${pkg}-${subset}-${weight}-${style}.woff2`;
    await copyFile(path.join(src, "files", name), path.join(dest, name));
  }
  await copyFile(path.join(src, "LICENSE"), path.join(dest, "LICENSE"));
  console.log(`vendored ${pkg} (${files.length} files)`);
}

const ogOut = path.join(out, "og");
await mkdir(ogOut, { recursive: true });
for (const [pkg, file] of OG_FONTS) {
  await copyFile(path.join(root, "node_modules/@fontsource", pkg, "files", file), path.join(ogOut, file));
}
console.log(`vendored ${OG_FONTS.length} OG fonts`);

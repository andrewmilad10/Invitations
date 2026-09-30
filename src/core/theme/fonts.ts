/**
 * Curated, self-hosted font registry (files in src/assets/fonts, loaded in
 * src/lib/fonts.ts). Themes refer to fonts by key, never by family name, so
 * the stored data stays valid if a font file or fallback changes.
 */
export const FONT_KEYS = [
  "cormorant",
  "playfair",
  "italiana",
  "inter",
  "jost",
  "pinyon",
  "cinzel",
  "bodoni",
  "greatvibes",
  "marcellus",
  "amiri",
  "naskh",
] as const;

export type FontKey = (typeof FONT_KEYS)[number];

export type FontCategory = "serif" | "display" | "sans" | "script";

export interface FontDefinition {
  label: string;
  category: FontCategory;
  /** CSS custom property set by next/font on <html>. */
  cssVar: `--font-${string}`;
  fallback: string;
  script: "latin" | "arabic";
}

export const FONTS: Record<FontKey, FontDefinition> = {
  cormorant: { label: "Cormorant Garamond", category: "serif", cssVar: "--font-cormorant", fallback: "Georgia, 'Times New Roman', serif", script: "latin" },
  playfair: { label: "Playfair Display", category: "serif", cssVar: "--font-playfair", fallback: "Georgia, serif", script: "latin" },
  italiana: { label: "Italiana", category: "display", cssVar: "--font-italiana", fallback: "Georgia, serif", script: "latin" },
  inter: { label: "Inter", category: "sans", cssVar: "--font-inter", fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif", script: "latin" },
  jost: { label: "Jost", category: "sans", cssVar: "--font-jost", fallback: "system-ui, sans-serif", script: "latin" },
  pinyon: { label: "Pinyon Script", category: "script", cssVar: "--font-pinyon", fallback: "cursive", script: "latin" },
  cinzel: { label: "Cinzel", category: "display", cssVar: "--font-cinzel", fallback: "Georgia, serif", script: "latin" },
  bodoni: { label: "Bodoni Moda", category: "serif", cssVar: "--font-bodoni", fallback: "Didot, Georgia, serif", script: "latin" },
  greatvibes: { label: "Great Vibes", category: "script", cssVar: "--font-greatvibes", fallback: "cursive", script: "latin" },
  marcellus: { label: "Marcellus", category: "display", cssVar: "--font-marcellus", fallback: "Georgia, serif", script: "latin" },
  amiri: { label: "Amiri", category: "serif", cssVar: "--font-amiri", fallback: "serif", script: "arabic" },
  naskh: { label: "Noto Naskh Arabic", category: "serif", cssVar: "--font-naskh", fallback: "serif", script: "arabic" },
};

export function isFontKey(value: unknown): value is FontKey {
  return typeof value === "string" && (FONT_KEYS as readonly string[]).includes(value);
}

/**
 * CSS font-family stack for a font key. For Arabic, an Arabic face is placed
 * right after the chosen font so Latin glyphs keep the chosen design and
 * Arabic glyphs fall through to a proper Arabic typeface.
 */
export function fontStack(key: FontKey, locale: string = "en"): string {
  const font = FONTS[key];
  const parts = [`var(${font.cssVar})`];
  if (locale === "ar" && font.script !== "arabic") {
    const arabic = font.category === "sans" ? FONTS.naskh : FONTS.amiri;
    parts.push(`var(${arabic.cssVar})`);
  }
  parts.push(font.fallback);
  return parts.join(", ");
}

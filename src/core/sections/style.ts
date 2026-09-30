import { z } from "zod";
import type { ThemeTokens } from "../theme/tokens";

/**
 * Per-section presentation hints, stored apart from content
 * (wedding_sections.style). Every template receives them; each decides how
 * (or whether) to honour them. Defaults mean "as the template designed it".
 */
export const SECTION_TONES = ["default", "light", "dark", "accent"] as const;
export const SECTION_SPACINGS = ["compact", "normal", "airy"] as const;
export const SECTION_ALIGNS = ["start", "center"] as const;

export type SectionTone = (typeof SECTION_TONES)[number];
export type SectionSpacing = (typeof SECTION_SPACINGS)[number];
export type SectionAlign = (typeof SECTION_ALIGNS)[number];

export interface SectionStyle {
  tone: SectionTone;
  spacing: SectionSpacing;
  align: SectionAlign;
}

export const DEFAULT_SECTION_STYLE: SectionStyle = { tone: "default", spacing: "normal", align: "center" };

export const sectionStyleSchema = z
  .object({
    tone: z.enum(SECTION_TONES),
    spacing: z.enum(SECTION_SPACINGS),
    align: z.enum(SECTION_ALIGNS),
  })
  .partial()
  .strict();

/** Tolerant read: unknown or invalid values fall back to the defaults. */
export function resolveSectionStyle(raw: unknown): SectionStyle {
  const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback;
  return {
    tone: pick(input.tone, SECTION_TONES, DEFAULT_SECTION_STYLE.tone),
    spacing: pick(input.spacing, SECTION_SPACINGS, DEFAULT_SECTION_STYLE.spacing),
    align: pick(input.align, SECTION_ALIGNS, DEFAULT_SECTION_STYLE.align),
  };
}

/**
 * A tone re-maps the theme's own color variables for one section, so every
 * template gets light / dark / accent sections without knowing about them —
 * and colors still come only from the couple's theme.
 */
export function sectionToneVars(theme: ThemeTokens, tone: SectionTone): Record<string, string> {
  const c = theme.colors;
  const mix = (a: string, b: string, pct: number) => `color-mix(in oklab, ${a} ${pct}%, ${b})`;
  switch (tone) {
    case "light":
      return { "--inv-bg": c.surface, "--inv-surface": c.background };
    case "dark":
      return {
        "--inv-bg": c.foreground,
        "--inv-surface": mix(c.foreground, c.background, 90),
        "--inv-fg": c.background,
        "--inv-muted": mix(c.background, c.foreground, 70),
        "--inv-border": mix(c.background, c.foreground, 22),
      };
    case "accent":
      return {
        "--inv-bg": c.accent,
        "--inv-surface": mix(c.accent, c.accentForeground, 88),
        "--inv-fg": c.accentForeground,
        "--inv-muted": mix(c.accentForeground, c.accent, 78),
        "--inv-border": mix(c.accentForeground, c.accent, 30),
        "--inv-accent": c.accentForeground,
        "--inv-accent-fg": c.accent,
      };
    default:
      return {};
  }
}

import { z } from "zod";
import { fontStack, FONT_KEYS, type FontKey } from "./fonts";

/**
 * Theme tokens — the only way templates receive color, type, radius and
 * shadow. Templates ship complete defaults; couples store partial overrides
 * (wedding_themes.tokens). Components read the resulting --inv-* variables.
 */
export const COLOR_TOKENS = ["background", "surface", "foreground", "muted", "accent", "accentForeground", "border"] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

export const SHADOWS = ["none", "soft", "deep"] as const;
export type ShadowToken = (typeof SHADOWS)[number];

export interface ThemeTokens {
  colors: Record<ColorToken, string>;
  fonts: { heading: FontKey; body: FontKey; accent: FontKey };
  /** Corner radius in px. */
  radius: number;
  shadow: ShadowToken;
}

export type ThemeOverrides = {
  colors?: Partial<ThemeTokens["colors"]>;
  fonts?: Partial<ThemeTokens["fonts"]>;
  radius?: number;
  shadow?: ShadowToken;
};

export interface ThemePalette {
  id: string;
  label: string;
  colors: Partial<ThemeTokens["colors"]>;
}

export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color like #1a2b3c.");
const fontKey = z.enum(FONT_KEYS);

/** Validates stored overrides; unknown keys are stripped. */
export const themeOverridesSchema = z.object({
  colors: z.object(Object.fromEntries(COLOR_TOKENS.map((k) => [k, hexColor.optional()])) as Record<ColorToken, z.ZodOptional<typeof hexColor>>).partial().optional(),
  fonts: z.object({ heading: fontKey.optional(), body: fontKey.optional(), accent: fontKey.optional() }).optional(),
  radius: z.number().int().min(0).max(32).optional(),
  shadow: z.enum(SHADOWS).optional(),
});

/**
 * Tolerant parse: an invalid value (e.g. a font removed from the registry)
 * drops only that value instead of discarding the whole theme.
 */
export function sanitizeOverrides(raw: unknown): ThemeOverrides {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const out: ThemeOverrides = {};

  if (input.colors && typeof input.colors === "object") {
    const colors: Partial<ThemeTokens["colors"]> = {};
    for (const key of COLOR_TOKENS) {
      const value = (input.colors as Record<string, unknown>)[key];
      if (hexColor.safeParse(value).success) colors[key] = value as string;
    }
    if (Object.keys(colors).length) out.colors = colors;
  }
  if (input.fonts && typeof input.fonts === "object") {
    const fonts: Partial<ThemeTokens["fonts"]> = {};
    for (const key of ["heading", "body", "accent"] as const) {
      const value = (input.fonts as Record<string, unknown>)[key];
      if (fontKey.safeParse(value).success) fonts[key] = value as FontKey;
    }
    if (Object.keys(fonts).length) out.fonts = fonts;
  }
  const radius = themeOverridesSchema.shape.radius.safeParse(input.radius);
  if (radius.success && radius.data !== undefined) out.radius = radius.data;
  const shadow = themeOverridesSchema.shape.shadow.safeParse(input.shadow);
  if (shadow.success && shadow.data !== undefined) out.shadow = shadow.data;
  return out;
}

export function resolveTheme(defaults: ThemeTokens, overrides: ThemeOverrides): ThemeTokens {
  return {
    colors: { ...defaults.colors, ...overrides.colors },
    fonts: { ...defaults.fonts, ...overrides.fonts },
    radius: overrides.radius ?? defaults.radius,
    shadow: overrides.shadow ?? defaults.shadow,
  };
}

const SHADOW_VALUES: Record<ShadowToken, string> = {
  none: "none",
  soft: "0 10px 30px -12px rgb(0 0 0 / 0.18)",
  deep: "0 30px 80px -20px rgb(0 0 0 / 0.45)",
};

/** CSS custom properties for a resolved theme. Apply on the invitation root. */
export function themeToCssVars(theme: ThemeTokens, locale: string = "en"): Record<`--inv-${string}`, string> {
  return {
    "--inv-bg": theme.colors.background,
    "--inv-surface": theme.colors.surface,
    "--inv-fg": theme.colors.foreground,
    "--inv-muted": theme.colors.muted,
    "--inv-accent": theme.colors.accent,
    "--inv-accent-fg": theme.colors.accentForeground,
    "--inv-border": theme.colors.border,
    "--inv-font-heading": fontStack(theme.fonts.heading, locale),
    "--inv-font-body": fontStack(theme.fonts.body, locale),
    "--inv-font-accent": fontStack(theme.fonts.accent, locale),
    "--inv-radius": `${theme.radius}px`,
    "--inv-shadow": SHADOW_VALUES[theme.shadow],
  };
}

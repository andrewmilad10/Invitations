import { describe, expect, it } from "vitest";
import { COLOR_FAMILIES, hexColor, resolveTheme } from "@/core/theme/tokens";
import { CARD_SHAPES, STATIONERY_LAYOUTS, STATIONERY_ORNAMENTS, TEMPLATE_CATEGORIES } from "@/core/template/manifest";
import { SECTION_TYPES } from "@/core/sections/registry";
import { FONT_KEYS } from "@/core/theme/fonts";
import { DEFAULT_TEMPLATE_ID, getTemplateManifest, resolveTemplateManifest, TEMPLATE_MANIFESTS } from "./registry";

describe("template registry", () => {
  it("has unique, storable ids", () => {
    const ids = TEMPLATE_MANIFESTS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]{1,40}$/); // matches weddings_template_format
  });

  it("falls back to the default template for unknown ids", () => {
    expect(resolveTemplateManifest("retired-template").id).toBe(DEFAULT_TEMPLATE_ID);
    expect(getTemplateManifest(DEFAULT_TEMPLATE_ID)).toBeDefined();
  });

  describe.each(TEMPLATE_MANIFESTS.map((t) => [t.id, t] as const))("%s", (_id, t) => {
    it("supports the required sections", () => {
      expect(t.supportedSections).toContain("hero");
      expect(t.supportedSections).toContain("footer");
    });

    it("only references known section types, and orders only supported ones", () => {
      for (const s of t.supportedSections) expect(SECTION_TYPES).toContain(s);
      for (const s of t.defaultSectionOrder) expect(t.supportedSections).toContain(s);
    });

    it("has valid gallery metadata", () => {
      expect(t.categories.length).toBeGreaterThan(0);
      for (const c of t.categories) expect(TEMPLATE_CATEGORIES).toContain(c);
      expect(STATIONERY_ORNAMENTS).toContain(t.stationery.ornament);
      if (t.stationery.layout) expect(STATIONERY_LAYOUTS).toContain(t.stationery.layout);
      if (t.stationery.shape) expect(CARD_SHAPES).toContain(t.stationery.shape);
      const paletteIds = t.palettes.map((p) => p.id);
      expect(new Set(paletteIds).size).toBe(paletteIds.length);
      for (const p of t.palettes) expect(COLOR_FAMILIES).toContain(p.family);
      if (t.family) expect(TEMPLATE_MANIFESTS.filter((o) => o.family === t.family).length).toBeGreaterThan(1);
    });

    it("keeps text readable in every palette", () => {
      for (const p of t.palettes) {
        const c = resolveTheme(t.themeDefaults, { colors: p.colors }).colors;
        expect(contrast(c.foreground, c.background), `${p.id} foreground/background`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(c.foreground, c.surface), `${p.id} foreground/surface`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(c.accentForeground, c.accent), `${p.id} button text`).toBeGreaterThanOrEqual(3);
      }
    });

    it("has a complete, valid theme", () => {
      for (const color of Object.values(t.themeDefaults.colors)) expect(hexColor.safeParse(color).success).toBe(true);
      for (const font of Object.values(t.themeDefaults.fonts)) expect(FONT_KEYS).toContain(font);
      for (const palette of t.palettes) {
        for (const color of Object.values(palette.colors)) expect(hexColor.safeParse(color).success).toBe(true);
      }
    });
  });
});

/** WCAG contrast ratio of two #rrggbb colours. */
function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

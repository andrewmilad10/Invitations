import { describe, expect, it } from "vitest";
import { hexColor } from "@/core/theme/tokens";
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

    it("has a complete, valid theme", () => {
      for (const color of Object.values(t.themeDefaults.colors)) expect(hexColor.safeParse(color).success).toBe(true);
      for (const font of Object.values(t.themeDefaults.fonts)) expect(FONT_KEYS).toContain(font);
      for (const palette of t.palettes) {
        for (const color of Object.values(palette.colors)) expect(hexColor.safeParse(color).success).toBe(true);
      }
    });
  });
});

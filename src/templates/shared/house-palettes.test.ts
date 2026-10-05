import { describe, expect, it } from "vitest";
import { HOUSE_PALETTES } from "./house-palettes";

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

describe("house colour pairs", () => {
  for (const p of Object.values(HOUSE_PALETTES)) {
    it(`${p.label} reads well`, () => {
      const c = p.colors;
      expect(contrast(c.foreground!, c.background!), "ink on page").toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.foreground!, c.surface!), "ink on card").toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.muted!, c.surface!), "soft ink on card").toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.accent!, c.background!), "accent on page").toBeGreaterThanOrEqual(3);
      expect(contrast(c.accentForeground!, c.accent!), "button text").toBeGreaterThanOrEqual(4.5);
    });
  }
});

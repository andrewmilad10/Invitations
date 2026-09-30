import { describe, expect, it } from "vitest";
import { FONT_KEYS, FONTS, fontStack } from "./fonts";

describe("fontStack", () => {
  it("uses the font variable then its fallback", () => {
    expect(fontStack("cormorant")).toBe("var(--font-cormorant), Georgia, 'Times New Roman', serif");
  });

  it("inserts an Arabic face for Arabic invitations", () => {
    expect(fontStack("cormorant", "ar")).toContain("var(--font-amiri)");
    expect(fontStack("inter", "ar")).toContain("var(--font-naskh)");
    expect(fontStack("amiri", "ar")).toBe("var(--font-amiri), serif");
  });

  it("every font has a unique CSS variable", () => {
    const vars = FONT_KEYS.map((k) => FONTS[k].cssVar);
    expect(new Set(vars).size).toBe(vars.length);
  });
});

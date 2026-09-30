import { describe, expect, it } from "vitest";
import { slugSchema, slugify, suggestSlug, withRandomSuffix } from "./slug";

describe("slugs", () => {
  it("suggests a readable slug from the couple's names", () => {
    expect(suggestSlug("Andrew", "Mariam")).toBe("andrew-and-mariam");
    expect(suggestSlug("Zoë Anne", "José")).toBe("zoe-anne-and-jose");
  });

  it("returns empty when names have no Latin form, so callers can fall back", () => {
    expect(suggestSlug("أندرو", "مريم")).toBe("");
    expect(withRandomSuffix("", () => 0)).toBe("wedding-aaaa");
  });

  it("slugify strips punctuation and collapses separators", () => {
    expect(slugify("  Hello,   World!! ")).toBe("hello-world");
    expect(slugify("A & B")).toBe("a-and-b");
  });

  it("validates format and reserved words", () => {
    expect(slugSchema.safeParse("andrew-and-mariam").success).toBe(true);
    expect(slugSchema.safeParse(" Andrew-And-Mariam ").data).toBe("andrew-and-mariam");
    for (const bad of ["ab", "has space", "double--hyphen", "-edge", "admin", "x".repeat(61)]) {
      expect(slugSchema.safeParse(bad).success).toBe(false);
    }
  });

  it("random suffix keeps the slug valid and within length", () => {
    const s = withRandomSuffix("x".repeat(60));
    expect(s.length).toBeLessThanOrEqual(60);
    expect(slugSchema.safeParse(s).success).toBe(true);
  });
});

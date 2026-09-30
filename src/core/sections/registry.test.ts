import { describe, expect, it } from "vitest";
import { resolveSectionContent, SECTION_DEFINITIONS, SECTION_TYPES, validateSectionContent } from "./registry";

describe("section registry", () => {
  it("has a definition with localized defaults for every section type", () => {
    for (const type of SECTION_TYPES) {
      const def = SECTION_DEFINITIONS[type];
      expect(def.type).toBe(type);
      expect(def.defaults("en")).toBeTypeOf("object");
      expect(def.defaults("ar")).toBeTypeOf("object");
    }
  });

  it("accepts only https reply links", () => {
    expect(validateSectionContent("rsvp", { linkUrl: "https://example.com/rsvp" }).success).toBe(true);
    expect(validateSectionContent("rsvp", { linkUrl: "" }).success).toBe(true);
    expect(validateSectionContent("rsvp", { linkUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(validateSectionContent("rsvp", { linkUrl: "http://example.com" }).success).toBe(false);
    expect(validateSectionContent("rsvp", { linkUrl: 'https://x.com/"onmouseover=' }).success).toBe(false);
  });

  it("validates FAQ items and caps their number", () => {
    const item = { question: "Dress code?", answer: "Black tie." };
    expect(validateSectionContent("faq", { items: [item] }).success).toBe(true);
    expect(validateSectionContent("faq", { items: Array(13).fill(item) }).success).toBe(false);
    expect(validateSectionContent("faq", { items: [{ question: "x".repeat(161), answer: "" }] }).success).toBe(false);
  });

  it("keeps older stored stories valid when new fields are added", () => {
    const story = resolveSectionContent("story", { body: "How we met." }, "en");
    expect(story).toEqual({ heading: "Our story", body: "How we met.", quote: "", quoteSource: "" });
  });
});

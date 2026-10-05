import { describe, expect, it } from "vitest";
import { defaultSuite, parseSuite, safeQrUrl, SUITE_WORDING, withLanguage } from "./suite";

describe("withLanguage", () => {
  it("translates sample wording, including the design's own, without adding a blessing", () => {
    const sample = { eyebrow: "Please join us to celebrate the wedding of" };
    const ar = withLanguage(defaultSuite("x", null, {}, sample), "ar", sample);
    expect(ar.text.lang).toBe("ar");
    expect(ar.text.eyebrow).toBe(SUITE_WORDING.ar.eyebrow);
    expect(ar.text.partnerOne).toBe(SUITE_WORDING.ar.partnerOne);
    expect(ar.enclosure.heading).toBe(SUITE_WORDING.ar.heading);
    expect(ar.options.blessing).toBeUndefined();
    // and back again
    const en = withLanguage(ar, "en", sample);
    expect(en.text.eyebrow).toBe(sample.eyebrow);
    expect(en.text.partnerOne).toBe("Emma");
  });

  it("keeps words the couple typed", () => {
    const s = defaultSuite("x");
    s.text.partnerOne = "Nour";
    s.options = { blessing: "none" };
    const ar = withLanguage(s, "ar");
    expect(ar.text.partnerOne).toBe("Nour");
    expect(ar.options.blessing).toBe("none");
  });

  it("old saved suites without a language read as English", () => {
    const s = defaultSuite("x") as unknown as { text: Record<string, unknown> };
    delete s.text.lang;
    expect(parseSuite(s)?.text.lang).toBe("en");
  });
});

describe("safeQrUrl", () => {
  it("only accepts web links", () => {
    expect(safeQrUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(safeQrUrl("javascript:alert(1)")).toBeNull();
    expect(safeQrUrl("not a url")).toBeNull();
  });
});

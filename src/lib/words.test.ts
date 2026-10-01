import { describe, expect, it } from "vitest";
import { listWords } from "./words";

describe("listWords", () => {
  it("joins like a sentence", () => {
    expect(listWords([])).toBe("");
    expect(listWords(["Floral"])).toBe("floral");
    expect(listWords(["Floral", "Luxury"], { sentence: true })).toBe("Floral and luxury");
    expect(listWords(["a", "b", "c"])).toBe("a, b and c");
    expect(listWords(["Countdown", "Maps", "RSVP"], { lower: false })).toBe("Countdown, Maps and RSVP");
  });
});

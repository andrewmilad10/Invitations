import { describe, expect, it } from "vitest";
import type { SectionType } from "@/core/sections/registry";
import { designBlocks, keepDesignShape } from "./build-model";

const DEFAULT: SectionType[] = ["hero", "couple", "date", "countdown", "story", "ceremony", "reception", "venue", "schedule", "gallery", "rsvp", "faq", "closing", "footer"];

describe("keeping a design's shape when sections move", () => {
  it("keeps the first screen first and the closing and footer last", () => {
    const moved: SectionType[] = ["footer", "rsvp", "closing", "hero", "couple", "gallery"];
    expect(keepDesignShape(moved, DEFAULT)).toEqual(["hero", "rsvp", "couple", "gallery", "closing", "footer"]);
  });

  it("keeps ceremony and reception together, in the design's order, where the first of them was", () => {
    const moved: SectionType[] = ["hero", "reception", "gallery", "couple", "ceremony", "closing"];
    expect(keepDesignShape(moved, DEFAULT)).toEqual(["hero", "ceremony", "reception", "gallery", "couple", "closing"]);
  });

  it("does not join them when the design shows them apart", () => {
    const apart: SectionType[] = ["hero", "ceremony", "gallery", "reception", "footer"];
    expect(keepDesignShape(["hero", "reception", "gallery", "ceremony", "footer"], apart)).toEqual(["hero", "reception", "gallery", "ceremony", "footer"]);
  });

  it("gives the editor blocks that move as one", () => {
    expect(designBlocks(["hero", "couple", "ceremony", "reception", "rsvp", "closing", "footer"], DEFAULT)).toEqual([
      ["hero"],
      ["couple"],
      ["ceremony", "reception"],
      ["rsvp"],
      ["closing", "footer"],
    ]);
  });
});

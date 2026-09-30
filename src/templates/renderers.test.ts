import { describe, expect, it } from "vitest";
import { TEMPLATE_MANIFESTS } from "./registry";
import { TEMPLATE_RENDERERS } from "./renderers";

describe("template renderers", () => {
  it("every registered template has a renderer, and vice versa", () => {
    expect(Object.keys(TEMPLATE_RENDERERS).sort()).toEqual(TEMPLATE_MANIFESTS.map((t) => t.id).sort());
  });
});

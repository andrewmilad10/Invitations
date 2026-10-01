import { describe, expect, it } from "vitest";
import { TEMPLATE_MANIFESTS } from "./registry";
import { TEMPLATE_RENDERERS } from "./renderers";
import { CLIENT_RENDERERS } from "./renderers.client";

describe("template renderers", () => {
  it.each(TEMPLATE_MANIFESTS.map((t) => [t.id, t.renderer]))("%s uses an existing renderer (%s)", (_id, renderer) => {
    expect(TEMPLATE_RENDERERS[renderer]).toBeDefined();
  });

  it("every renderer is used by at least one template", () => {
    const used = new Set(TEMPLATE_MANIFESTS.map((t) => t.renderer));
    for (const key of Object.keys(TEMPLATE_RENDERERS)) expect(used.has(key)).toBe(true);
  });

  it("the client (per-chunk) map covers the same layouts", () => {
    expect(Object.keys(CLIENT_RENDERERS).sort()).toEqual(Object.keys(TEMPLATE_RENDERERS).sort());
  });
});

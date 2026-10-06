import { describe, expect, it } from "vitest";
import { selectableTemplates } from "@/templates/registry";
import { productHref, productOf, templatesFor } from "./products";

describe("product collections", () => {
  it("puts every design in exactly one collection", () => {
    const all = selectableTemplates();
    const cards = templatesFor("cards", all);
    const sites = templatesFor("websites", all);
    expect(cards.length + sites.length).toBe(all.length);
    expect(cards.some((t) => sites.includes(t))).toBe(false);
    expect(cards.length).toBeGreaterThan(30);
    expect(sites.map((t) => t.id).sort()).toEqual(["burgundy-envelope", "cotton-press", "garden-gate", "lemon-terrace", "linen-meadow", "message-in-a-bottle", "moonlit-nile", "opening-night", "pressed-garden", "rose-marble", "set-sail", "something-blue", "swan-lake", "swan-pond", "the-gate", "villa-rosa"]);
  });

  it("links each design to its own collection's page", () => {
    const marlowe = selectableTemplates().find((t) => t.id === "marlowe")!;
    const swan = selectableTemplates().find((t) => t.id === "swan-lake")!;
    expect(productHref(productOf(marlowe), marlowe.id)).toBe("/invitations/marlowe");
    expect(productHref(productOf(swan), swan.id, "palette=x")).toBe("/websites/swan-lake?palette=x");
  });
});

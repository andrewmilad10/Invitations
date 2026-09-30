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
    expect(sites.length).toBeGreaterThan(10);
  });

  it("links each design to its own collection's page", () => {
    const marlowe = selectableTemplates().find((t) => t.id === "marlowe")!;
    const maison = selectableTemplates().find((t) => t.id === "maison")!;
    expect(productHref(productOf(marlowe), marlowe.id)).toBe("/invitations/marlowe");
    expect(productHref(productOf(maison), maison.id, "palette=noir")).toBe("/websites/maison?palette=noir");
  });
});

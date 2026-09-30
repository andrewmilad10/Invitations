import { describe, expect, it } from "vitest";
import { TEMPLATE_MANIFESTS } from "@/templates/registry";
import { filtersToQuery, filterTemplates, NO_FILTERS, parseFilters } from "./filters";

describe("gallery filters", () => {
  it("parses the URL and ignores unknown values", () => {
    expect(parseFilters({ style: "floral", color: "green", shape: "arch", photo: "with", sort: "az", saved: "1" })).toEqual({
      style: "floral", color: "green", shape: "arch", photo: "with", sort: "az", saved: true,
    });
    expect(parseFilters({ style: "<script>", color: "plaid", shape: "hexagon", photo: "maybe", sort: "random" })).toEqual(NO_FILTERS);
  });

  it("round-trips through the query string", () => {
    const f = { ...NO_FILTERS, style: "rustic" as const, color: "blue" as const, sort: "newest" as const };
    expect(parseFilters(Object.fromEntries(new URLSearchParams(filtersToQuery(f))))).toEqual(f);
    expect(filtersToQuery(NO_FILTERS)).toBe("");
  });

  it("filters by style, shape and photo", () => {
    const floral = filterTemplates(TEMPLATE_MANIFESTS, { ...NO_FILTERS, style: "floral" });
    expect(floral.length).toBeGreaterThan(3);
    expect(floral.every((i) => i.template.categories.includes("floral"))).toBe(true);
    expect(filterTemplates(TEMPLATE_MANIFESTS, { ...NO_FILTERS, shape: "arch" }).every((i) => i.template.stationery.shape === "arch")).toBe(true);
    const withPhoto = filterTemplates(TEMPLATE_MANIFESTS, { ...NO_FILTERS, photo: "with" }).map((i) => i.template.id);
    expect(withPhoto).toContain("four-frames");
    expect(withPhoto).not.toContain("delft-garland");
  });

  it("shows each design in the palette matching the colour filter", () => {
    const green = filterTemplates(TEMPLATE_MANIFESTS, { ...NO_FILTERS, color: "green" });
    expect(green.length).toBeGreaterThan(5);
    for (const item of green) expect(item.template.palettes.find((p) => p.id === item.paletteId)?.family).toBe("green");
  });

  it("filters to saved designs and sorts", () => {
    expect(filterTemplates(TEMPLATE_MANIFESTS, { ...NO_FILTERS, saved: true }, ["moonlit"]).map((i) => i.template.id)).toEqual(["moonlit"]);
    const az = filterTemplates(TEMPLATE_MANIFESTS, { ...NO_FILTERS, sort: "az" }).map((i) => i.template.name);
    expect(az).toEqual([...az].sort((a, b) => a.localeCompare(b)));
    const newest = filterTemplates(TEMPLATE_MANIFESTS, { ...NO_FILTERS, sort: "newest" });
    expect(newest[0].template.isNew).toBe(true);
  });
});

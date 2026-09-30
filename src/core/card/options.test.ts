import { describe, expect, it } from "vitest";
import { cardShape, designCardDefaults } from "../template/manifest";
import { sanitizeOverrides } from "../theme/tokens";
import { cardOptionsFromQuery, cardOptionsToQuery, DEFAULT_CARD_OPTIONS, resolveCardOptions, sanitizeCardOptions } from "./options";

describe("card options", () => {
  it("keeps valid values and drops the rest", () => {
    expect(sanitizeCardOptions({ foil: "gold", paper: "linen", silhouette: "hexagon", orientation: 3, extra: "x" })).toEqual({ foil: "gold", paper: "linen" });
    expect(sanitizeCardOptions(null)).toEqual({});
  });

  it("layers design defaults under the couple's choices", () => {
    const art = { ornament: "none" as const, shape: "landscape" as const, finish: { foil: "gold" as const } };
    expect(resolveCardOptions(designCardDefaults(art))).toEqual({ ...DEFAULT_CARD_OPTIONS, orientation: "landscape", foil: "gold" });
    expect(resolveCardOptions(designCardDefaults(art), { foil: "none" }).foil).toBe("none");
  });

  it("turns only rectangular designs", () => {
    expect(cardShape({ ornament: "none" }, { orientation: "landscape" })).toBe("landscape");
    expect(cardShape({ ornament: "none", shape: "landscape" })).toBe("landscape");
    expect(cardShape({ ornament: "none", shape: "landscape" }, { orientation: "portrait" })).toBe("portrait");
    expect(cardShape({ ornament: "none", shape: "arch" }, { orientation: "landscape" })).toBe("arch");
  });

  it("round-trips through the URL, omitting defaults", () => {
    const q = cardOptionsToQuery({ foil: "silver", paper: "smooth", silhouette: "scalloped" });
    expect(q.toString()).toBe("silhouette=scalloped&foil=silver");
    expect(cardOptionsFromQuery(Object.fromEntries(q))).toEqual({ silhouette: "scalloped", foil: "silver" });
  });

  it("is stored with the theme overrides", () => {
    expect(sanitizeOverrides({ card: { foil: "rose-gold", paper: "cardboard" } })).toEqual({ card: { foil: "rose-gold" } });
    expect(sanitizeOverrides({ card: { paper: "cardboard" } })).toEqual({});
  });
});

import { colors as c, type Palette } from "./layout-family";

/**
 * Vellum's house colour pairs: a calm paper colour with one deep signature
 * colour. New designs start from these (see docs/rules/design.md "House
 * colour pairs"). Roles: page, card, ink, soft ink, accent (the signature
 * colour: buttons, names, ornaments), text on the accent, hairlines.
 * house-palettes.test.ts checks every pair for contrast.
 */
export const HOUSE_PALETTES = {
  greigeTeal: { id: "greige-teal", label: "Greige & deep teal", family: "green", colors: c("#e8e3dc", "#f4f1ec", "#1d3436", "#5f6f6c", "#1f5c5f", "#f4f1ec", "#d4cdc3") },
  greyDustyBlue: { id: "grey-dusty-blue", label: "Soft grey & dusty blue", family: "blue", colors: c("#e6e7e9", "#f3f4f5", "#26303c", "#626e7f", "#55728f", "#ffffff", "#d2d6dc") },
  offWhiteTerracotta: { id: "offwhite-terracotta", label: "Off-white & terracotta", family: "orange", colors: c("#f8f5f0", "#fffdf9", "#3a2a24", "#80665a", "#a8542f", "#fffdf9", "#eaded2") },
  creamChocolate: { id: "cream-chocolate", label: "Cream & chocolate brown", family: "neutral", colors: c("#f5ecdc", "#fbf6ec", "#3b2a20", "#745c4b", "#5c3a28", "#f5ecdc", "#e3d5bd") },
  beigeOlive: { id: "beige-olive", label: "Warm beige & olive green", family: "green", colors: c("#ece2d0", "#f6efe3", "#2f3324", "#656a50", "#5a6637", "#f6efe3", "#d9cbb2") },
} satisfies Record<string, Palette>;

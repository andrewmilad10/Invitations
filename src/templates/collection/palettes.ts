import type { ColorFamily, ThemeTokens } from "@/core/theme/tokens";

/**
 * Named colour themes shared by the design collection. Each is a complete
 * colour set, so any design can wear any palette; designs pick the few that
 * suit them (the first is the design's default look).
 */
export interface NamedPalette {
  label: string;
  family: ColorFamily;
  colors: ThemeTokens["colors"];
}

const p = (label: string, family: ColorFamily, c: [bg: string, surface: string, fg: string, muted: string, accent: string, accentFg: string, border: string]): NamedPalette => ({
  label,
  family,
  colors: { background: c[0], surface: c[1], foreground: c[2], muted: c[3], accent: c[4], accentForeground: c[5], border: c[6] },
});

export const PALETTES = {
  // light
  ivory: p("Ivory & gold", "gold", ["#f4eee4", "#fffdf8", "#2b221d", "#76675c", "#a07d52", "#fffdf8", "#e3d7c8"]),
  champagne: p("Champagne", "gold", ["#f3ece0", "#fffbf4", "#3a2e24", "#7a6a5a", "#a88457", "#fffbf4", "#e6d9c4"]),
  blush: p("Blush", "pink", ["#f6ebe8", "#fffaf8", "#3b2a2c", "#86696c", "#a8646f", "#fffaf8", "#ecd9d6"]),
  roseGold: p("Rose gold", "pink", ["#f5e9e4", "#fffaf7", "#3d2a27", "#866a65", "#a86f5e", "#fffaf7", "#ecd8d0"]),
  coral: p("Coral", "orange", ["#fbede7", "#fffaf7", "#3a2622", "#86675f", "#c4563b", "#ffffff", "#f1dcd3"]),
  terracotta: p("Terracotta", "orange", ["#f3e8df", "#fffaf4", "#3a2419", "#826456", "#a9573a", "#fffaf4", "#e9d5c6"]),
  burgundy: p("Burgundy", "red", ["#f4ecec", "#fffafa", "#2e1519", "#795a5f", "#7d2433", "#fffafa", "#e7d3d5"]),
  lemon: p("Lemon grove", "yellow", ["#f8f4e1", "#fffdf2", "#2c3326", "#5c6a47", "#b08a1c", "#fffdf2", "#e9e1c2"]),
  ochre: p("Ochre", "yellow", ["#f5eedf", "#fffcf3", "#2f2a1f", "#71685a", "#a57520", "#fffcf3", "#e6dcc3"]),
  sage: p("Sage", "green", ["#edf0e7", "#fbfcf7", "#26302a", "#66715f", "#65795a", "#fbfcf7", "#d6dccd"]),
  olive: p("Olive", "green", ["#efede2", "#fbfaf3", "#2f2e22", "#6a6853", "#6c6a33", "#fbfaf3", "#dedbc6"]),
  forest: p("Forest", "green", ["#e9ece5", "#f8f9f4", "#1f2d24", "#586a5d", "#2f4a38", "#f8f9f4", "#d0d8cf"]),
  teal: p("Eucalyptus", "green", ["#e8f0ee", "#f8fcfb", "#1f3533", "#5a716e", "#3c7169", "#f8fcfb", "#d2e2df"]),
  delft: p("Delft blue", "blue", ["#edf1f7", "#fbfcfe", "#1d2b4a", "#56627b", "#2f4f8f", "#fbfcfe", "#d6deea"]),
  dustyBlue: p("Dusty blue", "blue", ["#ebf0f3", "#fafcfd", "#2a3440", "#5f6b78", "#56718c", "#fafcfd", "#d8e0e7"]),
  lavender: p("Lavender", "purple", ["#f0edf5", "#fcfbfe", "#2d2638", "#6b6280", "#6f5a98", "#fcfbfe", "#ddd6e8"]),
  plum: p("Plum", "purple", ["#f2ebf0", "#fdf9fc", "#2e1a2a", "#705a6b", "#6d3560", "#fdf9fc", "#e5d4e0"]),
  paper: p("Paper & ink", "white", ["#ffffff", "#ffffff", "#141414", "#686868", "#141414", "#ffffff", "#e4e2dd"]),
  claret: p("Paper & claret", "white", ["#ffffff", "#fbfaf8", "#151515", "#6a6a6a", "#8c2f39", "#ffffff", "#e6e4df"]),
  stone: p("Stone", "neutral", ["#eeebe5", "#faf8f4", "#23211e", "#6c675f", "#5d574d", "#faf8f4", "#ddd8cf"]),
  kraft: p("Kraft", "neutral", ["#e3d6c1", "#d6c2a0", "#33281c", "#5c4c38", "#6b3f23", "#f6efe3", "#bfa77f"]),
  // dark
  midnight: p("Midnight & gold", "black", ["#14161c", "#1d2029", "#efe8dc", "#a39c90", "#c9a96e", "#14161c", "#2e323d"]),
  noir: p("Noir", "black", ["#111111", "#1a1a1a", "#f1efea", "#9b9891", "#d8d4cc", "#111111", "#2e2e2e"]),
  emerald: p("Emerald", "green", ["#0f1f19", "#152a22", "#eee8da", "#a2a898", "#cfae6b", "#0f1f19", "#27403a"]),
  navy: p("Navy & gold", "blue", ["#131b2d", "#1a2337", "#eef0f4", "#9ea6b6", "#c8b48a", "#131b2d", "#2b3550"]),
  wine: p("Wine", "red", ["#231116", "#2e161d", "#f3e9e6", "#b39a9c", "#d6a88a", "#231116", "#48262f"]),
} satisfies Record<string, NamedPalette>;

export type PaletteId = keyof typeof PALETTES;

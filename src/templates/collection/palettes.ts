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
  snow: p("Snow", "white", ["#f4f4f2", "#ffffff", "#161616", "#6b6b6b", "#2a2a2a", "#ffffff", "#e2e2df"]),
  almond: p("Almond", "neutral", ["#f3ede3", "#fbf8f2", "#2d2620", "#7a6d61", "#8b6f4e", "#ffffff", "#e5dccd"]),
  blushSage: p("Sage & blush", "green", ["#f1f0ea", "#fdfcf8", "#2c3129", "#a86a70", "#667656", "#ffffff", "#e1e0d6"]),
  meadow: p("Meadow", "white", ["#f5f1e8", "#fffdf7", "#2f3a3a", "#946684", "#5f7fa1", "#ffffff", "#e6e0d2"]),
  mist: p("Mist blue", "blue", ["#eef1f4", "#fbfcfd", "#22303f", "#677586", "#5f7896", "#ffffff", "#dde3ea"]),
  pearl: p("Pearl grey", "white", ["#f3f3f1", "#ffffff", "#2c2c2c", "#7d7d78", "#7d7d78", "#ffffff", "#e4e4e0"]),
  carRed: p("Ribbon red", "red", ["#fbf6ea", "#fdf8ec", "#3a1a14", "#7a5048", "#9e2a1c", "#fdf8ec", "#ecdcc6"]),
  carNavy: p("Navy ink", "blue", ["#f6f4ee", "#fbfaf5", "#1b2436", "#5b6474", "#1f3a68", "#fbfaf5", "#e2e0d6"]),
  carGreen: p("Racing green", "green", ["#f6f4ea", "#fbf9f0", "#1d2a1d", "#5d6a58", "#2f5233", "#fbf9f0", "#e1e2d2"]),
  collage: p("Pressed paper", "neutral", ["#ede6da", "#ece4d6", "#2a221c", "#9a7b2e", "#7a6656", "#fbf7f0", "#d8ccb9"]),
  collageRose: p("Dried rose", "pink", ["#efe6e1", "#eee3dc", "#2c211f", "#a8862e", "#9a6b6b", "#fbf5f2", "#dccbc4"]),
  lineGreen: p("Garden green", "green", ["#f3f3ee", "#f6f6f2", "#2f3f2c", "#6f7d63", "#4e6a37", "#ffffff", "#dfe2d6"]),
  lineBlue: p("Garden blue", "blue", ["#f1f3f5", "#f6f7f9", "#24324a", "#5f6b7d", "#3f5d82", "#ffffff", "#dde2e9"]),
  goldLeaf: p("Gold leaf", "gold", ["#fffdf8", "#ffffff", "#6d5232", "#a08a6b", "#a57d48", "#ffffff", "#efe5d4"]),
  goldBlush: p("Blush & gold", "pink", ["#fffaf8", "#ffffff", "#6b4740", "#a3847d", "#b07a72", "#ffffff", "#f0e0dc"]),
  calla: p("Copper & olive", "neutral", ["#f7f4ef", "#f8f6f2", "#5a4a1c", "#b98a6e", "#6b5a22", "#ffffff", "#e5ddd0"]),
  twilight: p("Twilight", "blue", ["#f6dfe8", "#f8e6ee", "#13284a", "#2f5f6a", "#c86f92", "#ffffff", "#e9c7d6"]),
  twilightGreen: p("Forest & peach", "green", ["#f3e7da", "#f6ece1", "#163a2e", "#4f6e55", "#c97a5a", "#ffffff", "#e6d4c2"]),
  roseArch: p("Rose arch", "pink", ["#ece3d8", "#ffffff", "#4a3530", "#5e3d3f", "#8a5652", "#ffffff", "#e2d6c8"]),
  gardenia: p("Gardenia", "green", ["#f4efe7", "#f7f3ec", "#3b3a30", "#8a9a7e", "#4f6e52", "#ffffff", "#e4dccd"]),
  goldenOval: p("Golden meadow", "gold", ["#fbfaf2", "#fdfcf6", "#4a3410", "#6f8a5a", "#c3a046", "#2b1d05", "#ece6cf"]),
  keepsake: p("Keepsake", "black", ["#2b2620", "#3a332b", "#f4efe6", "#b9ad9c", "#e9dcc4", "#2b2620", "#4a4238"]),
  monoBloom: p("Monochrome", "white", ["#fbf8f6", "#fbf8f6", "#1c1c22", "#6a6a70", "#1c1c22", "#ffffff", "#e6e1dd"]),
  kraft: p("Kraft", "neutral", ["#e3d6c1", "#d6c2a0", "#33281c", "#5c4c38", "#6b3f23", "#f6efe3", "#bfa77f"]),
  // dark
  midnight: p("Midnight & gold", "black", ["#14161c", "#1d2029", "#efe8dc", "#a39c90", "#c9a96e", "#14161c", "#2e323d"]),
  noir: p("Noir", "black", ["#111111", "#1a1a1a", "#f1efea", "#9b9891", "#d8d4cc", "#111111", "#2e2e2e"]),
  emerald: p("Emerald", "green", ["#0f1f19", "#152a22", "#eee8da", "#a2a898", "#cfae6b", "#0f1f19", "#27403a"]),
  navy: p("Navy & gold", "blue", ["#131b2d", "#1a2337", "#eef0f4", "#9ea6b6", "#c8b48a", "#131b2d", "#2b3550"]),
  deepEmerald: p("Dark emerald", "green", ["#0f2a25", "#12332d", "#e9efe9", "#9fb5ad", "#b9cfc5", "#0f2a25", "#24463f"]),
  slate: p("Slate", "black", ["#2f3436", "#3a4043", "#f1efe9", "#b8b6ae", "#c9ab6a", "#1f2224", "#4a5154"]),
  oxblood: p("Oxblood", "red", ["#2a1215", "#3a181c", "#f4e8e4", "#c4a3a3", "#e0b8a8", "#2a1215", "#4d2328"]),
  tulipWine: p("Velvet wine", "red", ["#3d1018", "#4a1420", "#f3e3d3", "#c9a98f", "#c9a27a", "#3d1018", "#5e2230"]),
  tulipNight: p("Velvet night", "blue", ["#131c33", "#1a2440", "#efe6d8", "#a9a296", "#c9a86a", "#131c33", "#2a3554"]),
  wine: p("Wine", "red", ["#231116", "#2e161d", "#f3e9e6", "#b39a9c", "#d6a88a", "#231116", "#48262f"]),
} satisfies Record<string, NamedPalette>;

export type PaletteId = keyof typeof PALETTES;

import type { SectionType } from "../sections/registry";
import type { ThemePalette, ThemeTokens } from "../theme/tokens";

/**
 * Template manifest — the data half of a template (no React). Imported by the
 * dashboard, the wizard, the model builder and tests without pulling in any
 * rendering code or animation libraries.
 */
export interface TemplateManifest {
  /** Stored in weddings.template_id. Never rename once released. */
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Public path of the picker thumbnail. */
  previewImage: string;
  /** Section types this template can render. Others are kept in the data but not shown. */
  supportedSections: readonly SectionType[];
  /** Default order of sections (subset of supportedSections). */
  defaultSectionOrder: readonly SectionType[];
  /** Sections that start switched off for new weddings. */
  defaultDisabled?: readonly SectionType[];
  /** Complete token set; couples' overrides are merged on top. */
  themeDefaults: ThemeTokens;
  /** One-click color presets in the theme editor. The first is the default look. */
  palettes: readonly ThemePalette[];
  features: {
    opening: "envelope" | "none";
    music: boolean;
  };
  status: "available" | "beta" | "hidden";
}

import type { TemplateManifest } from "@/core/template/manifest";

// Kept out of the client picker so server pages can call it.
export type TemplateOption = Pick<TemplateManifest, "id" | "name" | "tagline" | "status" | "themeDefaults" | "stationery">;

/** Serializable subset of a manifest for client pickers. */
export function toTemplateOption(t: TemplateManifest): TemplateOption {
  return {
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    status: t.status,
    themeDefaults: t.themeDefaults,
    stationery: t.stationery,
  };
}

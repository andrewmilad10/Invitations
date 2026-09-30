import type { TemplateManifest } from "@/core/template/manifest";
import { cinematicManifest } from "./cinematic/manifest";
import { botanicalManifest, classicManifest, luxuryManifest, modernManifest, romanticManifest } from "./collection/manifests";
import { editorialManifest } from "./editorial/manifest";

/**
 * Every template the platform knows about (metadata only — safe to import
 * anywhere). Renderers are registered separately in ./renderers.tsx so the
 * dashboard doesn't load animation code.
 *
 * Adding a template = add its manifest here. A template with a new layout
 * also registers its renderer in ./renderers.tsx.
 */
export const TEMPLATE_MANIFESTS: readonly TemplateManifest[] = [
  romanticManifest,
  classicManifest,
  cinematicManifest,
  modernManifest,
  botanicalManifest,
  luxuryManifest,
  editorialManifest,
];

export const DEFAULT_TEMPLATE_ID = cinematicManifest.id;

const byId = new Map(TEMPLATE_MANIFESTS.map((t) => [t.id, t]));

export function getTemplateManifest(id: string): TemplateManifest | undefined {
  return byId.get(id);
}

/**
 * The manifest to render a wedding with. If a stored template id is unknown
 * (e.g. a template was retired), fall back to the default rather than 404 —
 * the wedding's data is template-independent, so nothing is lost.
 */
export function resolveTemplateManifest(id: string): TemplateManifest {
  return byId.get(id) ?? byId.get(DEFAULT_TEMPLATE_ID)!;
}

/** Templates a couple can choose in the wizard / theme panel. */
export function selectableTemplates(): TemplateManifest[] {
  return TEMPLATE_MANIFESTS.filter((t) => t.status !== "hidden");
}

export function isSelectableTemplateId(id: string): boolean {
  const t = byId.get(id);
  return Boolean(t && t.status !== "hidden");
}

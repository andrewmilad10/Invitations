import type { TemplateManifest } from "@/core/template/manifest";
import { layoutTemplate, type LayoutTemplateSpec } from "../shared/layout-family";
import { KIT_SECTIONS } from "./data";

/**
 * A kit template's manifest: every section, the date section off by default
 * (the hero carries the date), and an optional opening (which also gives the
 * editor its "Replay opening" button).
 */
export function kitTemplate(renderer: string, spec: LayoutTemplateSpec, options: { opening?: boolean; isNew?: boolean } = {}): TemplateManifest {
  const m = layoutTemplate(renderer, KIT_SECTIONS, spec, { defaultDisabled: ["date"] });
  return {
    ...m,
    features: { ...m.features, opening: options.opening ? "envelope" : "none" },
    ...(options.isNew === false ? {} : { isNew: true }),
  };
}

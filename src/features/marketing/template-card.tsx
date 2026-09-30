import type { TemplateManifest } from "@/core/template/manifest";
import { cardCouple, DesignCard } from "./gallery/design-card";

export { cardCouple };

/** A design card outside the gallery (homepage, "more designs"). */
export function TemplateCard({ template, index, className }: { template: TemplateManifest; index: number; className?: string }) {
  return <DesignCard template={template} index={index} className={className} />;
}

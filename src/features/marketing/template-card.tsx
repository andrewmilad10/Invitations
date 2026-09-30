import type { TemplateManifest } from "@/core/template/manifest";
import { cardCouple, DesignCard } from "./gallery/design-card";
import type { Product } from "./products";

export { cardCouple };

/** A design card outside the gallery (homepage, "more designs"). */
export function TemplateCard({ template, index, product, className }: { template: TemplateManifest; index: number; product?: Product; className?: string }) {
  return <DesignCard template={template} index={index} product={product} className={className} />;
}

import { notFound } from "next/navigation";
import { buildInvitationModel } from "@/core/invitation/build-model";
import { getTemplateManifest } from "@/templates/registry";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import { InvitationRenderer } from "@/templates/renderers";

/**
 * A template rendered with the sample wedding through the normal pipeline,
 * in one of its own palettes (never arbitrary colours from a URL).
 */
export function SamplePage({ templateId, paletteId }: { templateId: string; paletteId?: string }) {
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();
  const bundle = sampleBundle(template.id);
  if (paletteId !== undefined) {
    const chosen = template.palettes.find((p) => p.id === paletteId);
    if (!chosen) notFound();
    bundle.theme.tokens = { colors: chosen.colors };
  }
  const model = buildInvitationModel(bundle, template, { mode: "sample", mediaUrl: sampleMediaUrl });
  return <InvitationRenderer model={model} />;
}

import { buildInvitationModel } from "@/core/invitation/build-model";
import { getTemplateManifest } from "@/templates/registry";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import { InvitationRenderer } from "@/templates/renderers";

/** The first screen of a design's website (its hero), with the sample wedding and no opening. */
export function FirstScreen({ templateId }: { templateId: string }) {
  const template = getTemplateManifest(templateId);
  if (!template) return null;
  const model = buildInvitationModel(sampleBundle(template.id), template, { mode: "export", mediaUrl: sampleMediaUrl });
  return <InvitationRenderer model={{ ...model, sections: model.sections.filter((s) => s.type === "hero") }} />;
}

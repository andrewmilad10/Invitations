import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildInvitationModel } from "@/core/invitation/build-model";
import { getTemplateManifest, TEMPLATE_MANIFESTS } from "@/templates/registry";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import { InvitationRenderer } from "@/templates/renderers";

// Sample dates are relative to "now", so render per request.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return TEMPLATE_MANIFESTS.map((t) => ({ templateId: t.id }));
}

export async function generateMetadata(props: PageProps<"/templates/[templateId]/preview">): Promise<Metadata> {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  return { title: template ? `${template.name} template preview` : "Template not found", robots: { index: false } };
}

/** A template rendered with fixture data through the normal pipeline. */
export default async function TemplatePreviewPage(props: PageProps<"/templates/[templateId]/preview">) {
  const { templateId } = await props.params;
  const { locale, palette } = await props.searchParams;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();

  const bundle = sampleBundle(template.id);
  if (locale === "ar") bundle.settings.locale = "ar";
  // Only the template's own palettes are accepted (no arbitrary colors via URL).
  const chosen = template.palettes.find((p) => p.id === palette);
  if (chosen) bundle.theme.tokens = { colors: chosen.colors };

  const model = buildInvitationModel(bundle, template, { mode: "sample", mediaUrl: sampleMediaUrl });
  return <InvitationRenderer model={model} />;
}

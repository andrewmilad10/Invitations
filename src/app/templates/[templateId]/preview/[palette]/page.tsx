import type { Metadata } from "next";
import { getTemplateManifest } from "@/templates/registry";
import { SamplePage } from "@/templates/fixtures/sample-page";

// Sample dates are relative to "now": rendered once, then refreshed hourly.
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/templates/[templateId]/preview/[palette]">): Promise<Metadata> {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  return { title: template ? `${template.name} template preview` : "Template not found", robots: { index: false } };
}

/** A template with the sample wedding, in one of its own palettes. */
export default async function TemplatePalettePreviewPage(props: PageProps<"/templates/[templateId]/preview/[palette]">) {
  const { templateId, palette } = await props.params;
  return <SamplePage templateId={templateId} paletteId={palette} />;
}

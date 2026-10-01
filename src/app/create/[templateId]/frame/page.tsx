import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewClient } from "@/features/preview/preview-client";
import { buildPreviewModel } from "@/features/preview/preview-model";
import { emptyAnswers, previewBundle } from "@/features/try/answers";
import { getTemplateManifest } from "@/templates/registry";

export const metadata: Metadata = { robots: { index: false, follow: false } };
// The demo date is relative to today: rendered once, then refreshed hourly.
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

/** Preview iframe for the try flow: starts as the demo, then mirrors the visitor's draft. */
export default async function CreateFramePage(props: PageProps<"/create/[templateId]/frame">) {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();
  const initial = previewBundle(emptyAnswers(template.id), template);
  return <PreviewClient initialBundle={initial} initialModel={buildPreviewModel(initial)} />;
}

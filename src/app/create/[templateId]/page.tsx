import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TryFlow } from "@/features/try/try-flow";
import { getTemplateManifest, selectableTemplates } from "@/templates/registry";

export async function generateMetadata(props: PageProps<"/create/[templateId]">): Promise<Metadata> {
  const { templateId } = await props.params;
  const t = getTemplateManifest(templateId);
  return { title: t ? `Create your invitation — The ${t.name}` : "Create your invitation" };
}

/**
 * Try a template with your own details — no account. Answers live in the
 * browser until the visitor chooses to save (see src/features/try).
 */
export default async function CreatePage(props: PageProps<"/create/[templateId]">) {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();

  // Details typed on the homepage's "make it yours" card.
  const q = await props.searchParams;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const date = str(q.date, 10);
  const palette = str(q.palette, 40);
  const prefill = {
    partnerOne: str(q.one, 80),
    partnerTwo: str(q.two, 80),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    palette: template.palettes.some((p) => p.id === palette) ? palette : null,
  };
  const hasPrefill = Boolean(prefill.partnerOne || prefill.partnerTwo || prefill.date || prefill.palette);

  return <TryFlow templateId={template.id} templates={selectableTemplates()} prefill={hasPrefill ? prefill : undefined} />;
}

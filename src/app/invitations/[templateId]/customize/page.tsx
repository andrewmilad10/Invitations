import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cardOptionsFromQuery } from "@/core/card/options";
import { defaultSuite } from "@/core/card/suite";
import { CardStudio } from "@/features/cards/studio/card-studio";
import { productOf } from "@/features/marketing/products";
import { getTemplateManifest } from "@/templates/registry";

export async function generateMetadata(props: PageProps<"/invitations/[templateId]/customize">): Promise<Metadata> {
  const { templateId } = await props.params;
  const t = getTemplateManifest(templateId);
  return { title: t ? `Customize ${t.name} — invitation suite` : "Customize your invitation", robots: { index: false } };
}

/** The card studio for one card design (no account needed). */
export default async function CustomizeCardPage(props: PageProps<"/invitations/[templateId]/customize">) {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();
  if (productOf(template) !== "cards") redirect(`/create/${template.id}`);
  const q = await props.searchParams;
  const palette = typeof q.palette === "string" && template.palettes.some((p) => p.id === q.palette) ? q.palette : null;
  const options = cardOptionsFromQuery(q);
  const fromLink = Boolean(palette || Object.keys(options).length);
  const initial = defaultSuite(template.id, palette, options);
  return <CardStudio template={template} initial={initial} fromLink={fromLink} />;
}

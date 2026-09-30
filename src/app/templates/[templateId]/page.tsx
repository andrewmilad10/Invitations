import { notFound, redirect } from "next/navigation";
import { productHref, productOf } from "@/features/marketing/products";
import { getTemplateManifest } from "@/templates/registry";

/** Old design links: every design now lives in its own collection. */
export default async function TemplateRedirect(props: PageProps<"/templates/[templateId]">) {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(await props.searchParams)) if (typeof v === "string" && k !== "view") q.set(k, v);
  redirect(productHref(productOf(template), template.id, q));
}

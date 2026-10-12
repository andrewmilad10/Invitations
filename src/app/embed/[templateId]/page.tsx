import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildInvitationModel } from "@/core/invitation/build-model";
import { SECTION_TYPES } from "@/core/sections/registry";
import { getTemplateManifest } from "@/templates/registry";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import { InvitationRenderer } from "@/templates/renderers";

export const metadata: Metadata = { title: "Invitation preview", robots: { index: false } };

/** Sections a shopper may switch off in the shop's form (the opening, names and footer always stay). */
const OPTIONAL = new Set<string>(SECTION_TYPES.filter((t) => !["hero", "footer"].includes(t)));

const clean = (v: string | string[] | undefined, max: number) =>
  (Array.isArray(v) ? v[0] : v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);

/**
 * The shop's live preview: a template with the sample wedding, showing the
 * shopper's own names, date and language as they type, without the sections
 * they switched off. Read-only, nothing is stored; every value is length-capped
 * and rendered as text. `quiet=1` skips the opening (used while typing).
 */
export default async function EmbedPage(props: PageProps<"/embed/[templateId]">) {
  const { templateId } = await props.params;
  const q = await props.searchParams;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();

  const bundle = sampleBundle(template.id);
  const n1 = clean(q.n1, 40);
  const n2 = clean(q.n2, 40);
  const date = clean(q.d, 10);
  if (n1) bundle.wedding.partner_one_name = n1;
  if (n2) bundle.wedding.partner_two_name = n2;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date))) bundle.wedding.wedding_date = date;
  if (clean(q.lang, 2) === "ar") bundle.settings.locale = "ar";

  const venue = clean(q.venue, 80);
  if (venue && bundle.events[0]) bundle.events[0].venue_name = venue;

  const hide = clean(q.hide, 200).split(",").filter((t) => OPTIONAL.has(t));
  for (const type of hide) {
    const existing = bundle.sections.find((s) => s.type === type);
    if (existing) existing.enabled = false;
    else bundle.sections.push({ type, enabled: false, sort_order: null, content: {} });
  }
  if (hide.includes("ceremony")) bundle.events = bundle.events.filter((e) => e.kind !== "ceremony");
  if (hide.includes("reception")) bundle.events = bundle.events.filter((e) => e.kind !== "reception");

  const quiet = clean(q.quiet, 1) === "1";
  const model = buildInvitationModel(bundle, template, { mode: quiet ? "preview" : "sample", mediaUrl: sampleMediaUrl });
  return <InvitationRenderer model={model} />;
}

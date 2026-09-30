import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBundle, toModel } from "@/features/invitations/public";
import { InvitationRenderer } from "@/templates/renderers";

// Published pages read live data so edits appear on refresh (see docs/database.md §8).
export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/w/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const bundle = await getPublicBundle(slug);
  if (!bundle) return { title: "Invitation not found", robots: { index: false } };

  const model = toModel(bundle, "live");
  const title = `${model.wedding.coupleName} — ${model.locale === "ar" ? "دعوة زفاف" : "Wedding Invitation"}`;
  const description = [
    model.locale === "ar" ? `ندعوكم لحضور زفاف ${model.wedding.coupleName}` : `You're invited to celebrate the wedding of ${model.wedding.coupleName}`,
    model.wedding.date?.long,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/w/${bundle.wedding.slug}` },
    robots: bundle.settings.visibility === "unlisted" ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: `/w/${bundle.wedding.slug}`,
      locale: model.locale === "ar" ? "ar_EG" : "en_GB",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicInvitationPage(props: PageProps<"/w/[slug]">) {
  const { slug } = await props.params;
  const bundle = await getPublicBundle(slug);
  if (!bundle) notFound();

  // The model is built once, on the server, and serialized to client islands —
  // so dates/times can never differ between server and browser.
  return <InvitationRenderer model={toModel(bundle, "live")} />;
}

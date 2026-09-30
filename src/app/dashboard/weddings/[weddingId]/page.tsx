import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { publicEnv } from "@/config/env";
import { PublishToggle } from "@/features/weddings/components/publish-toggle";
import { StatusBadge } from "@/features/weddings/components/status-badge";
import { getWedding } from "@/features/weddings/queries";

export const metadata: Metadata = { title: "Edit wedding" };

// Placeholder until the editor phase: confirms creation and access control.
export default async function WeddingPage(props: PageProps<"/dashboard/weddings/[weddingId]">) {
  const { weddingId } = await props.params;
  const wedding = await getWedding(weddingId);
  if (!wedding) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← My weddings
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="font-serif text-4xl">
          {wedding.partner_one_name} &amp; {wedding.partner_two_name}
        </h1>
        <StatusBadge status={wedding.status} />
      </div>
      <p className="mt-2 text-muted-foreground">/w/{wedding.slug}</p>
      <div className="mt-6 flex gap-2">
        <PublishToggle weddingId={wedding.id} published={wedding.status === "published"} publicUrl={`${publicEnv.siteUrl}/w/${wedding.slug}`} size="default" />
        <Button asChild variant="outline">
          <Link href="/dashboard">Done</Link>
        </Button>
      </div>
    </main>
  );
}

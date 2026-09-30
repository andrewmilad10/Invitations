import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicEnv } from "@/config/env";
import { formatDateOnly } from "@/core/i18n/format";
import { PublishToggle } from "@/features/weddings/components/publish-toggle";
import { StatusBadge } from "@/features/weddings/components/status-badge";
import { listMyWeddings } from "@/features/weddings/queries";
import { resolveTemplateManifest } from "@/templates/registry";

export const metadata: Metadata = { title: "My weddings" };

export default async function DashboardPage() {
  const weddings = await listMyWeddings();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">My weddings</h1>
          <p className="mt-1 text-muted-foreground">Create, edit and publish your invitations.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">
            <Plus /> Create wedding
          </Link>
        </Button>
      </div>

      {weddings.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <h2 className="font-serif text-3xl">Let&apos;s create your first invitation</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            It takes a minute: your names, your date and a template. You can change everything later.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/dashboard/new">Create wedding</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {weddings.map((w) => {
            const publicUrl = `${publicEnv.siteUrl}/w/${w.slug}`;
            return (
              <li key={w.id} className="flex flex-col gap-4 rounded-xl border bg-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-3xl">
                      {w.partner_one_name} &amp; {w.partner_two_name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {w.wedding_date ? formatDateOnly(w.wedding_date, "en").long : "Date to be decided"} ·{" "}
                      {resolveTemplateManifest(w.template_id).name}
                    </p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <p className="truncate text-sm text-muted-foreground">/w/{w.slug}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/dashboard/weddings/${w.id}`}>Edit</Link>
                  </Button>
                  <PublishToggle weddingId={w.id} published={w.status === "published"} publicUrl={publicUrl} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

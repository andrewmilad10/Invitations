import type { Metadata } from "next";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publicEnv } from "@/config/env";
import { DraftImporter } from "@/features/try/draft-importer";
import { WeddingCard } from "@/features/weddings/components/wedding-card";
import { listMyWeddingCards } from "@/features/weddings/queries";

export const metadata: Metadata = { title: "My invitations" };

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const { draft } = await props.searchParams;
  const weddings = await listMyWeddingCards();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <DraftImporter autoSave={draft === "1"} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl font-light">My invitations</h1>
          <p className="mt-2 text-muted-foreground">
            {weddings.length === 0
              ? "Your invitations will appear here."
              : `${weddings.length} ${weddings.length === 1 ? "invitation" : "invitations"} · ${weddings.filter((w) => w.status === "published").length} published`}
          </p>
        </div>
        <Button asChild className="rounded-full px-5">
          <Link href="/websites">
            <Plus /> Create new invitation
          </Link>
        </Button>
      </div>

      {weddings.length === 0 ? (
        <div className="mt-10 border border-dashed bg-card px-6 py-16 text-center">
          <h2 className="font-serif text-4xl font-light">Let&apos;s create your first invitation</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">Pick a template you love, add your names and date, and watch it come together.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href="/websites">Choose a template</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-10 grid gap-5 lg:grid-cols-2">
            {weddings.map((w) => (
              <WeddingCard key={w.id} wedding={w} siteUrl={publicEnv.siteUrl} />
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">
            Planning more than one celebration?{" "}
            <Link href="/websites" className="underline underline-offset-4">
              Start another from a design
            </Link>
            .
          </p>
        </>
      )}
    </main>
  );
}

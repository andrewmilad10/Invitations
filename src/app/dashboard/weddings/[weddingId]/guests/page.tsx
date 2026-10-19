import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicEnv } from "@/config/env";
import { GuestsPage } from "@/features/guests/guests-page";
import { loadGuestsPage } from "@/features/guests/queries";

export const metadata: Metadata = { title: "Guests & replies", robots: { index: false } };

export default async function WeddingGuestsPage(props: PageProps<"/dashboard/weddings/[weddingId]/guests">) {
  const { weddingId } = await props.params;
  const data = await loadGuestsPage(weddingId);
  if (!data) notFound();
  if (data === "not-ready") {
    return (
      <main className="mx-auto grid max-w-xl gap-4 px-5 py-24 text-center">
        <h1 className="font-serif text-4xl">Guests &amp; replies</h1>
        <p className="text-muted-foreground">The guest list is being switched on for your account. Please check back soon; your invitation works as usual in the meantime.</p>
        <Link href={`/dashboard/weddings/${weddingId}`} className="justify-self-center underline underline-offset-4">
          Back to your invitation
        </Link>
      </main>
    );
  }
  return (
    <main>
      <GuestsPage data={data} siteUrl={publicEnv.siteUrl} />
    </main>
  );
}

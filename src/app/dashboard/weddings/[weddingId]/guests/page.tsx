import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicEnv } from "@/config/env";
import { GuestsPage } from "@/features/guests/guests-page";
import { loadGuestsPage } from "@/features/guests/queries";

export const metadata: Metadata = { title: "Guests & replies", robots: { index: false } };

export default async function WeddingGuestsPage(props: PageProps<"/dashboard/weddings/[weddingId]/guests">) {
  const { weddingId } = await props.params;
  const data = await loadGuestsPage(weddingId);
  if (!data) notFound();
  return <GuestsPage data={data} siteUrl={publicEnv.siteUrl} />;
}

import type { Metadata } from "next";
import { CardsComingSoon } from "@/features/marketing/cards/coming-soon";
// The invitation card gallery is paused while the collection is finished.
// To bring it back, restore the import and the return below.
// import { GalleryPage } from "@/features/marketing/gallery/gallery-page";

export const metadata: Metadata = {
  title: "Wedding invitation cards — coming soon",
  description: "Original wedding invitation cards, designed like fine stationery and made to send on WhatsApp or by email. Coming soon.",
};

export default function InvitationsPage() {
  // return <GalleryPage product="cards" />;
  return <CardsComingSoon />;
}

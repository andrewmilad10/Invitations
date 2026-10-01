import type { Metadata } from "next";
import { GalleryPage } from "@/features/marketing/gallery/gallery-page";

export const metadata: Metadata = {
  title: "Wedding websites",
  description:
    "Wedding invitation websites with your own link: story, schedule, venues with maps, countdown, photo gallery, RSVP and music. Try any design free, no account needed.",
};

export default function WebsitesPage() {
  return <GalleryPage product="websites" />;
}

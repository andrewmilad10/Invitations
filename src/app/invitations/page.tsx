import type { Metadata } from "next";
import { GalleryPage } from "@/features/marketing/gallery/gallery-page";

export const metadata: Metadata = {
  title: "Wedding invitation cards",
  description:
    "Original wedding invitation card designs — floral, elegant, minimalist, monogram, rustic, photo and more — in dozens of colours. Personalise one free and send it on WhatsApp or by email.",
};

export default function InvitationsPage() {
  return <GalleryPage product="cards" />;
}

import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { HomeV2 } from "@/features/marketing/home-v2/home-v2";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";

/** The proposed new home page, for review. Not linked and not indexed. */
export const metadata: Metadata = { title: "Home (draft)", robots: { index: false, follow: false } };

export default function HomeV2Page() {
  return (
    <>
      <SiteHeader overlay />
      <PageTransition>
        <main>
          <HomeV2 />
        </main>
      </PageTransition>
      <SiteFooter />
    </>
  );
}

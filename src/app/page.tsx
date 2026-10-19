import { PageTransition } from "@/components/page-transition";
import { HomeV3 } from "@/features/marketing/home-v3/home-v3";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main>
          <HomeV3 />
        </main>
      </PageTransition>
      <SiteFooter />
    </>
  );
}

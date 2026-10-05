import { PageTransition } from "@/components/page-transition";
import { HomeV2 } from "@/features/marketing/home-v2/home-v2";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";

export default function HomePage() {
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

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-[60dvh] max-w-xl place-items-center px-6 py-24 text-center">
        <div>
          <h1 className="font-serif text-5xl">We couldn&apos;t find that page</h1>
          <p className="mt-3 text-muted-foreground">The link may be old, or the page may have moved.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/invitations">See invitation cards</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go to the home page</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

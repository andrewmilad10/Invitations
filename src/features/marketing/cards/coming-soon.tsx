import Link from "next/link";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";

/** Shown on /invitations while the invitation card collection is being finished. */
export function CardsComingSoon() {
  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className="relative overflow-hidden px-5 sm:px-8">
          <section className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-3xl flex-col items-center justify-center py-20 text-center">
            {/* A sealed envelope, drawn in the site's colours */}
            <div aria-hidden className="relative mb-12 aspect-[7/5] w-56 sm:w-64">
              <div className="absolute inset-0 rounded-md bg-[#e9ddd2] shadow-[0_30px_50px_-28px_rgb(60_30_20/0.45)]" />
              <div className="absolute inset-0 rounded-md bg-[#e2d3c5] [clip-path:polygon(0_100%,50%_48%,100%_100%)]" />
              <div className="absolute inset-0 rounded-md bg-[#efe5dc] [clip-path:polygon(0_0,0_100%,50%_52%)]" />
              <div className="absolute inset-0 rounded-md bg-[#efe5dc] [clip-path:polygon(100%_0,100%_100%,50%_52%)]" />
              <div className="absolute inset-x-0 top-0 h-[58%] origin-top animate-[cs-flap_6s_ease-in-out_infinite] rounded-t-md bg-[#f5ede5] shadow-sm [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              <span className="absolute left-1/2 top-[58%] grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_38%_32%,#8a3a3f,#6d2a30_60%,#4f1d22)] font-serif text-sm italic text-[#f3e3d6] shadow-[0_4px_8px_rgb(0_0_0/0.3)]">
                V
              </span>
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">Invitation cards</p>
            <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] text-balance sm:text-7xl">Coming soon</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              We are putting the finishing touches on a collection of invitation cards, designed like fine stationery and made to send on WhatsApp or by email. They will be here very soon.
            </p>
            <span aria-hidden className="mt-10 block h-px w-24 bg-foreground/20" />
            <p className="mt-10 font-serif text-2xl italic">In the meantime, your wedding website is ready.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full px-8">
                <Link href="/websites">Browse wedding websites</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </section>
        </main>
      </PageTransition>
      <SiteFooter />
      <style>{`@keyframes cs-flap { 0%, 70%, 100% { transform: rotateX(0deg); } 82% { transform: rotateX(-24deg); } }
@media (prefers-reduced-motion: reduce) { [class*="cs-flap"] { animation: none !important; } }`}</style>
    </>
  );
}

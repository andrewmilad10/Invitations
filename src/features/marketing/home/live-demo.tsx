import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FadeIn, Reveal } from "@/features/motion/motion";
import { cn } from "@/lib/utils";

/**
 * A phone frame showing a real page at true phone size (390×844), scaled
 * down. The page inside is the actual template renderer, not a screenshot.
 */
export function PhoneFrame({ src, title, scale = 0.72, className, children }: { src?: string; title: string; scale?: number; className?: string; children?: ReactNode }) {
  const w = 390;
  const h = 844;
  return (
    <div
      className={cn("relative shrink-0 rounded-[3rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]", className)}
      style={{ width: w * scale + 20, height: h * scale + 20 }}
    >
      <div className="relative size-full overflow-hidden rounded-[2.35rem] bg-white">
        {src ? (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            className="absolute left-0 top-0 origin-top-left border-0"
            style={{ width: w, height: h, transform: `scale(${scale})` }}
          />
        ) : (
          children
        )}
      </div>
      <div aria-hidden className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
    </div>
  );
}

export function LiveDemo() {
  return (
    <section id="inspiration" className="relative isolate scroll-mt-20 overflow-hidden px-5 py-24 text-forest-foreground sm:px-8 sm:py-32">
      {/* The room dims to forest green, then the product is revealed. */}
      <FadeIn duration={1400} className="absolute inset-0 -z-10 bg-forest" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_auto]">
        <Reveal variant="left" delay={250} duration={1000} className="max-w-xl">
          <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">What your guests will see</h2>
          <p className="mt-6 text-lg leading-relaxed text-forest-foreground/75">
            This is the Cinematic template, running for real. Tap the wax seal: the envelope opens, the card rises and becomes the first page of the wedding website.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-forest-foreground/75">Most guests will open it on a phone, so every design is made for the phone first: easy to read, quick to load, and one tap from directions to the venue.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-forest-foreground px-7 text-forest hover:bg-forest-foreground/90">
              <Link href="/templates/cinematic">Preview the template</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full px-6 text-forest-foreground hover:bg-white/10 hover:text-forest-foreground">
              <Link href="/websites">See all wedding websites</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal variant="scale" delay={500} duration={1200} className="flex justify-center">
          <PhoneFrame src="/templates/cinematic/preview" title="Cinematic template demo" scale={0.78} />
        </Reveal>
      </div>
    </section>
  );
}

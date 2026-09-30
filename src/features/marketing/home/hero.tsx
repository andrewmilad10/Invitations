import { SmartImage as Image } from "@/components/smart-image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDateOnly } from "@/core/i18n/format";
import { PHOTO_LIBRARY } from "@/features/media/library";
import { getTemplateManifest } from "@/templates/registry";
import { DEMO, demoDate } from "@/templates/fixtures/sample-wedding";
import { Parallax } from "@/features/motion/motion";
import { Stationery } from "../stationery";

export function Hero() {
  const front = getTemplateManifest("romantic") ?? getTemplateManifest("cinematic")!;
  const back = getTemplateManifest("editorial") ?? front;
  const date = formatDateOnly(demoDate(), "en");

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest text-white">
      {/* The photo settles from a slight zoom while the page opens, then drifts
          a little slower than the scroll (desktop). */}
      <Parallax from="top" speed={0.08} className="absolute inset-0 -z-20">
        <div className="open-bg absolute inset-0">
          <Image src={PHOTO_LIBRARY.couple.url} alt={PHOTO_LIBRARY.couple.alt} fill preload sizes="100vw" className="object-cover object-[65%_center]" />
        </div>
      </Parallax>
      <div
        aria-hidden
        className="open-overlay absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(20_16_12/0.82)_0%,rgb(20_16_12/0.55)_45%,rgb(20_16_12/0.1)_80%),linear-gradient(0deg,rgb(20_16_12/0.55),transparent_45%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="max-w-2xl">
          <h1 className="font-serif text-[3.4rem] font-light leading-[0.95] sm:text-7xl lg:text-[6.2rem]">
            {["Your love story,", "beautifully invited."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span className="open-line block" style={{ animationDelay: `${150 + i * 120}ms` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p className="open-rise mt-7 max-w-lg text-lg leading-relaxed text-white/85 [animation-delay:480ms]">
            Invitation cards to send and wedding websites to share — in dozens of original designs. Pick one, add your details and watch it come to life.
          </p>
          <div className="open-rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:600ms]">
            <Button asChild size="lg" className="h-13 rounded-full bg-white px-8 text-base text-foreground hover:bg-white/90">
              <Link href="/invitations">Invitation cards</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-13 rounded-full border-white/60 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/websites">Wedding websites</Link>
            </Button>
          </div>
          <p className="open-rise mt-8 text-sm text-white/65 [animation-delay:720ms]">Free to explore. You only create an account when you&apos;re ready to save.</p>
        </div>

        {/* The product, in the first second: a real invitation rendered from a template. */}
        <div aria-hidden className="relative hidden h-[30rem] lg:block">
          <Stationery
            template={back}
            partnerOne="Olivia"
            partnerTwo="Daniel"
            dateLabel="20 June"
            className="card-settle absolute right-40 top-10 w-60 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] [--tilt:-7deg] [animation-delay:450ms]"
          />
          <Stationery
            template={front}
            partnerOne={DEMO.partnerOne}
            partnerTwo={DEMO.partnerTwo}
            dateLabel={`${date.day} ${date.month} ${date.year}`}
            className="card-settle absolute right-4 top-0 w-72 shadow-[0_40px_80px_-24px_rgb(0_0_0/0.7)] [--tilt:4deg] [animation-delay:620ms]"
          />
        </div>
      </div>
    </section>
  );
}

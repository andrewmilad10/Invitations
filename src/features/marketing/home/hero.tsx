import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDateOnly } from "@/core/i18n/format";
import { PHOTO_LIBRARY } from "@/features/media/library";
import { getTemplateManifest } from "@/templates/registry";
import { DEMO, demoDate } from "@/templates/fixtures/sample-wedding";
import { Stationery } from "../stationery";

export function Hero() {
  const front = getTemplateManifest("romantic") ?? getTemplateManifest("cinematic")!;
  const back = getTemplateManifest("editorial") ?? front;
  const date = formatDateOnly(demoDate(), "en");

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest text-white">
      <Image src={PHOTO_LIBRARY.couple.url} alt={PHOTO_LIBRARY.couple.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[65%_center]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(20_16_12/0.82)_0%,rgb(20_16_12/0.55)_45%,rgb(20_16_12/0.1)_80%),linear-gradient(0deg,rgb(20_16_12/0.55),transparent_45%)]" />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="max-w-2xl">
          <h1 className="hero-rise font-serif text-[3.4rem] font-light leading-[0.95] sm:text-7xl lg:text-[6.2rem]">
            Your love story, beautifully invited.
          </h1>
          <p className="hero-rise mt-7 max-w-lg text-lg leading-relaxed text-white/85 [animation-delay:120ms]">
            Design a wedding invitation and website your guests will remember. Pick a template, add your details and watch it come to life.
          </p>
          <div className="hero-rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:220ms]">
            <Button asChild size="lg" className="h-13 rounded-full bg-white px-8 text-base text-foreground hover:bg-white/90">
              <Link href="/templates">Explore templates</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-13 rounded-full px-6 text-base text-white hover:bg-white/10 hover:text-white">
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="hero-rise mt-8 text-sm text-white/65 [animation-delay:320ms]">Free to explore. You only create an account when you&apos;re ready to save.</p>
        </div>

        {/* The product, in the first second: a real invitation rendered from a template. */}
        <div aria-hidden className="relative hidden h-[30rem] lg:block">
          <Stationery
            template={back}
            partnerOne="Olivia"
            partnerTwo="Daniel"
            dateLabel="20 June"
            className="card-settle absolute right-40 top-10 w-60 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] [--tilt:-7deg] [animation-delay:250ms]"
          />
          <Stationery
            template={front}
            partnerOne={DEMO.partnerOne}
            partnerTwo={DEMO.partnerTwo}
            dateLabel={`${date.day} ${date.month} ${date.year}`}
            className="card-settle absolute right-4 top-0 w-72 shadow-[0_40px_80px_-24px_rgb(0_0_0/0.7)] [--tilt:4deg] [animation-delay:420ms]"
          />
        </div>
      </div>
    </section>
  );
}

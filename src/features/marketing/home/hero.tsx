import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTemplateManifest, selectableTemplates } from "@/templates/registry";
import { templatesFor } from "../products";
import { Stationery } from "../stationery";

/**
 * The opening: the product itself. Two real invitation cards, drawn from the
 * collection, lie on a green linen table beside their envelope — no stock
 * photography.
 */
export function Hero() {
  const front = getTemplateManifest("rose-arch") ?? getTemplateManifest("romantic")!;
  const back = getTemplateManifest("velvet-tulips") ?? front;
  const cardCount = templatesFor("cards", selectableTemplates()).length;

  return (
    <section className="linen-forest relative isolate overflow-hidden text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 pb-20 pt-32 sm:px-8 sm:pb-28 lg:min-h-[92svh] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-28">
        <div className="max-w-2xl">
          <h1 className="font-serif text-[3.4rem] font-light leading-[0.95] sm:text-7xl lg:text-[6.2rem]">
            {["Your love story,", "beautifully invited."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span className="open-line block" style={{ animationDelay: `${175 + i * 150}ms` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p className="open-rise mt-7 max-w-lg text-lg leading-relaxed text-white/85 [animation-delay:590ms]">
            Invitation cards to send on WhatsApp and wedding websites to share, in {cardCount} original designs. Write them in English or Arabic.
          </p>
          <div className="open-rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:740ms]">
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
          <p className="open-rise mt-8 text-sm text-white/65 [animation-delay:885ms]">Free to explore. You only create an account when you&apos;re ready to save.</p>
        </div>

        {/* The cards on the table: an envelope, and two invitations laid over it. */}
        <div aria-hidden className="relative mx-auto h-[23rem] w-full max-w-[22rem] sm:h-[28rem] sm:max-w-[26rem] lg:h-[32rem] lg:max-w-none">
          <div className="card-settle absolute left-[8%] top-[60%] h-[38%] w-[80%] rounded-[3px] bg-[#ece4d4] shadow-[0_30px_50px_-24px_rgb(0_0_0/0.65)] [--tilt:-9deg] [animation-delay:450ms]">
            <span className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_49.6%,rgb(0_0_0/0.08)_50%,transparent_50.4%),linear-gradient(to_bottom_left,transparent_49.6%,rgb(0_0_0/0.08)_50%,transparent_50.4%)] [background-size:50%_100%] [background-position:left,right] bg-no-repeat" />
            <span className="absolute left-1/2 top-[44%] grid size-11 -translate-x-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#b5574c,#7d2a26_70%)] font-serif text-sm text-[#f0c8b9] shadow-[0_3px_8px_rgb(0_0_0/0.35)] sm:size-12">
              N&amp;K
            </span>
          </div>
          <Stationery
            template={back}
            partnerOne="Layla"
            partnerTwo="Omar"
            dateLabel="14 October 2026"
            sizes="(min-width: 1024px) 18rem, 46vw"
            className="card-settle absolute left-[2%] top-[2%] w-[48%] shadow-[0_30px_50px_-22px_rgb(0_0_0/0.7)] [--tilt:-6deg] [animation-delay:600ms]"
          />
          <Stationery
            template={front}
            partnerOne="Nour"
            partnerTwo="Karim"
            dateLabel="12 April 2027"
            sizes="(min-width: 1024px) 20rem, 52vw"
            className="card-settle absolute right-[2%] top-[8%] w-[54%] shadow-[0_40px_70px_-24px_rgb(0_0_0/0.75)] [--tilt:5deg] [animation-delay:760ms]"
          />
        </div>
      </div>
    </section>
  );
}

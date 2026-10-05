import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FirstScreen } from "../home/first-screen";
import { ScaledScreen } from "../home/scaled-screen";

/** The line-up: five real designs on phones, fanned out, the centre one in front. */
const LINEUP = [
  { id: "moonlit-nile", x: -86, r: -9, s: 0.78, z: 1, d: 260 },
  { id: "villa-rosa", x: -46, r: -4.5, s: 0.9, z: 2, d: 140 },
  { id: "swan-lake", x: 0, r: 0, s: 1, z: 3, d: 0 },
  { id: "cotton-press", x: 46, r: 4.5, s: 0.9, z: 2, d: 140 },
  { id: "the-gate", x: 86, r: 9, s: 0.78, z: 1, d: 260 },
];

function Phone({ id }: { id: string }) {
  return (
    <div className="overflow-hidden rounded-[2.4rem] border-[7px] border-neutral-950 bg-neutral-950 shadow-[0_50px_80px_-30px_rgb(0_0_0/0.75),0_0_0_1px_rgb(255_255_255/0.08)]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[1.9rem]">
        <ScaledScreen>
          <FirstScreen templateId={id} />
        </ScaledScreen>
        <span className="absolute left-1/2 top-[1.6%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-neutral-950" />
      </div>
    </div>
  );
}

export function HeroLineup() {
  return (
    <section className="relative isolate overflow-hidden bg-[#1c2620] text-white">
      {/* soft light from above, deepening to the edges */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,rgb(230_207_147/0.16),transparent_60%),radial-gradient(120%_80%_at_50%_120%,rgb(0_0_0/0.5),transparent_60%)]" />
      <div className="mx-auto max-w-5xl px-5 pt-32 text-center sm:px-8 sm:pt-40">
        <p className="open-rise text-sm font-medium tracking-[0.18em] text-[#e6cf93] uppercase">Wedding websites · English &amp; Arabic</p>
        <h1 className="mt-5 font-serif text-[3rem] font-light leading-[0.98] tracking-[-0.01em] sm:text-7xl lg:text-[6.4rem]">
          <span className="open-line block">The invitation</span>
          <span className="open-line block [animation-delay:150ms]">they&apos;ll open twice.</span>
        </h1>
        <p className="open-rise mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/75 [animation-delay:450ms] sm:text-xl">
          A wedding website that opens like real stationery on every phone. Your story, the day&apos;s plan, maps, a countdown and replies, in one link.
        </p>
        <div className="open-rise mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:600ms] sm:flex-row">
          <Button asChild size="lg" className="h-13 w-full rounded-full bg-white px-8 text-base text-[#1c2620] hover:bg-white/90 sm:w-auto">
            <Link href="/websites">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-13 w-full rounded-full px-6 text-base text-white hover:bg-white/10 hover:text-white sm:w-auto">
            <Link href="#designs">See all designs →</Link>
          </Button>
        </div>
      </div>

      {/* the line-up */}
      <div aria-hidden className="relative mx-auto mt-14 h-[calc(var(--pw)*19/9*0.78)] max-w-6xl overflow-hidden [contain:layout_paint] [--pw:min(46vw,300px)] sm:mt-16">
        {LINEUP.map((p) => (
          <div
            key={p.id}
            className="lineup-phone absolute top-0 left-1/2 w-[var(--pw)]"
            style={{ zIndex: p.z, ["--x" as string]: `${p.x}%`, ["--r" as string]: `${p.r}deg`, ["--s" as string]: p.s, animationDelay: `${700 + p.d}ms` }}
          >
            <Phone id={p.id} />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1c2620] to-transparent" style={{ zIndex: 4 }} />
      </div>

      {/* facts */}
      <div className="relative z-10 border-t border-white/10 bg-[#1c2620] [transform:translateZ(0)]">
        <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-y-6 px-5 py-8 text-center sm:grid-cols-4 sm:px-8">
          {[
            ["9", "original designs"],
            ["EN · ع", "English or Arabic"],
            ["1 link", "for every guest"],
            ["Free", "to try. Pay when you publish"],
          ].map(([n, t]) => (
            <div key={t}>
              <dt className="font-serif text-4xl text-[#e6cf93]">{n}</dt>
              <dd className="mt-1 text-sm text-white/65">{t}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

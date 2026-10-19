"use client";
/* eslint-disable @next/next/no-img-element -- phone screens drawn as stills */

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** One invitation changing design by itself: the same names, a new look every few seconds. */
export function DesignSwitch({ designs }: { designs: { id: string; name: string }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % designs.length), 2600);
    return () => window.clearInterval(t);
  }, [designs.length]);
  return (
    <section className="px-5 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div aria-hidden className="relative mx-auto h-[26rem] md:h-[30rem]">
          <div className="relative aspect-[390/844] h-full rounded-[2.1rem] bg-[#1d1b19] p-1.5 shadow-[0_40px_60px_-30px_rgb(34_29_26/0.55)]">
            <div className="relative size-full overflow-hidden rounded-[1.75rem] bg-muted">
              {designs.map((d, k) => (
                <img key={d.id} src={`/marketing/screens/${d.id}-hero.webp`} alt="" loading="lazy" className={cn("absolute inset-0 size-full object-cover transition-opacity duration-900", k === i ? "opacity-100" : "opacity-0")} />
              ))}
            </div>
          </div>
          <span className="absolute -bottom-2 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-1.5 text-sm rtl:translate-x-1/2">{designs[i]?.name}</span>
        </div>
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent">Change your mind freely</p>
          <h2 className="mt-3 font-serif text-[clamp(2.3rem,4.6vw,3.4rem)] font-light leading-[1.02] text-balance">Same names, same photos, any design</h2>
          <ul className="mt-5 grid gap-2 text-muted-foreground">
            <li>Switch design and everything you wrote stays.</li>
            <li>The link you already sent keeps working and shows the new design.</li>
            <li>Guest replies stay with you whatever design you choose.</li>
          </ul>
          <div className="mt-7">
            <Link href="/websites" className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground">
              Try a design
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

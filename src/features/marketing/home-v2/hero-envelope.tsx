"use client";

import { useState } from "react";
import { NamesInline, useNames } from "./names";

/**
 * The hero's envelope: charcoal cotton, a gold wax seal. Tap the seal and the
 * flap swings open and the invitation rises with the visitor's own names.
 */
export function HeroEnvelope() {
  const { names } = useNames();
  const [open, setOpen] = useState(false);
  const one = names.one.trim() || "Nour";
  const two = names.two.trim() || "Adam";
  return (
    <div className="relative mx-auto w-full max-w-[26rem] pt-16 [perspective:1100px]">
      <div className="relative aspect-[10/7] drop-shadow-[0_30px_40px_rgb(0_0_0/0.45)]">
        {/* inside of the envelope */}
        <div className="absolute inset-0 rounded-[3px] bg-[linear-gradient(#1b1916,#3a352f)]" />
        {/* the invitation */}
        <div
          className={`absolute inset-x-[6%] top-[5%] bottom-[5%] z-[5] grid place-items-center content-center gap-1 rounded-[2px] bg-[#fbf7ef] px-4 text-center text-[#2c2a25] shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-transform duration-[1400ms] ease-[cubic-bezier(.3,.1,.2,1)] ${open ? "-translate-y-[58%] delay-700" : ""}`}
          style={{ backgroundImage: "url(/templates/cotton-press/paper.webp)", backgroundSize: "200px", backgroundBlendMode: "multiply" }}
        >
          <span className="absolute inset-[5%] border border-[#d8cbb2]" />
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-[#6b6151]">Together with their families</span>
          <span className="font-[family-name:var(--font-pinyon)] text-[clamp(1.9rem,8vw,2.6rem)] leading-[1.05] text-[#9a7430]">
            {one} <span className="text-[0.6em]">&amp;</span> {two}
          </span>
          <span className="text-[0.62rem] uppercase tracking-[0.28em]">{names.date || "12 June 2027"}</span>
        </div>
        {/* front pocket */}
        <div
          className="absolute inset-0 z-[6] rounded-[3px] bg-[#2f2b27] [clip-path:polygon(0_0,50%_56%,100%_0,100%_100%,0_100%)]"
          style={{ backgroundImage: "url(/templates/cotton-press/paper.webp)", backgroundSize: "200px", backgroundBlendMode: "soft-light" }}
        />
        <svg className="pointer-events-none absolute inset-0 z-[6] size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d="M0 100 L46 50 M100 100 L54 50" fill="none" stroke="rgb(0 0 0 / .45)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* the flap */}
        <div
          className={`absolute inset-x-0 top-0 h-[62%] origin-top transition-transform duration-[1300ms] ease-[cubic-bezier(.5,.05,.3,1)] [transform-style:preserve-3d] ${open ? "z-[1] [transform:rotateX(178deg)]" : "z-10"}`}
          style={{ transitionProperty: "transform, z-index", transitionDelay: open ? "0s, .6s" : "0s" }}
        >
          <div
            className="absolute inset-0 bg-[#36322d] [clip-path:polygon(0_0,100%_0,56%_88%,50%_96%,44%_88%)]"
            style={{ backgroundImage: "url(/templates/cotton-press/paper.webp)", backgroundSize: "200px", backgroundBlendMode: "soft-light" }}
          />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close the envelope" : "Open the envelope"}
            className={`absolute left-1/2 top-[92%] grid aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center bg-[url(/templates/cotton-press/seal.webp)] bg-contain bg-center bg-no-repeat drop-shadow-[0_4px_6px_rgb(0_0_0/0.45)] transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e6cf93] ${open ? "opacity-0" : "animate-[pulse_2.6s_ease-in-out_infinite]"}`}
          >
            <span className="font-[family-name:var(--font-bodoni)] text-[clamp(0.9rem,3.6vw,1.2rem)] text-[#7a5a20]">
              {one[0]}&amp;{two[0]}
            </span>
          </button>
        </div>
      </div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="mx-auto mt-5 block text-xs uppercase tracking-[0.28em] text-white/70 hover:text-white">
        {open ? "Close it again" : "Tap the seal to open"}
      </button>
      <NamesInline />
    </div>
  );
}

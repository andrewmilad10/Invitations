"use client";
/* eslint-disable @next/next/no-img-element -- the whole site as one still, scrolled inside the phone */

import { X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { hasOpening, playSrc } from "./play-data";

export interface PreviewDesign {
  id: string;
  name: string;
  ar?: string;
  note?: string;
  /** Where "Use this design" goes. */
  href: string;
}

const Ctx = createContext<(d: PreviewDesign) => void>(() => {});
export const usePreview = () => useContext(Ctx);

/**
 * A large phone in the middle of the screen: the design's opening plays,
 * then its page scrolls slowly by itself until the visitor scrolls it.
 */
export function PreviewProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<PreviewDesign | null>(null);
  const open = useCallback((d: PreviewDesign) => setDesign(d), []);
  return (
    <Ctx.Provider value={open}>
      {children}
      <PreviewDialog design={design} onClose={() => setDesign(null)} />
    </Ctx.Provider>
  );
}

function PreviewDialog({ design, onClose }: { design: PreviewDesign | null; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (design && !d.open) d.showModal();
    if (!design && d.open) d.close();
  }, [design]);

  useEffect(() => {
    if (!design) return;
    if (scroller.current) scroller.current.scrollTop = 0;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const v = vid.current;
    let t = 0;
    const reveal = () => setOpened(true);
    if (hasOpening(design.id) && v && !still) {
      v.currentTime = 0;
      v.onended = reveal;
      v.onerror = reveal;
      t = window.setTimeout(reveal, 15000);
      const p = v.play();
      if (p) p.catch(() => (t = window.setTimeout(reveal, 800)));
    } else t = window.setTimeout(reveal, still ? 0 : 500);
    return () => {
      window.clearTimeout(t);
      setOpened(false);
      if (v) {
        v.onended = null;
        v.pause();
      }
    };
  }, [design]);

  // after the opening, glide down slowly until the visitor takes over
  useEffect(() => {
    const sc = scroller.current;
    if (!opened || !sc || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    let stop = false;
    let last = 0;
    const halt = () => (stop = true);
    sc.addEventListener("wheel", halt, { passive: true });
    sc.addEventListener("touchstart", halt, { passive: true });
    sc.addEventListener("keydown", halt);
    const start = window.setTimeout(() => {
      last = performance.now();
      const tick = (now: number) => {
        if (stop) return;
        sc.scrollTop += (now - last) * 0.06;
        last = now;
        if (sc.scrollTop < sc.scrollHeight - sc.clientHeight - 1) id = requestAnimationFrame(tick);
      };
      id = requestAnimationFrame(tick);
    }, 900);
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(id);
      sc.removeEventListener("wheel", halt);
      sc.removeEventListener("touchstart", halt);
      sc.removeEventListener("keydown", halt);
    };
  }, [opened]);

  const src = design ? playSrc(design.id) : null;
  return (
    <dialog
      ref={dlg}
      onClose={onClose}
      onClick={(e) => e.target === dlg.current && onClose()}
      aria-labelledby="preview-name"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[rgb(34_29_26/0.6)] backdrop:backdrop-blur-sm open:grid open:place-items-center"
    >
      {design && src ? (
        <div className="grid items-center justify-items-center gap-5 p-4 md:grid-cols-[auto_18rem] md:gap-10">
          <div className="relative aspect-[390/844] h-[min(46rem,78dvh)] max-w-[calc(100vw-2rem)] rounded-[2.4rem] bg-[#1d1b19] p-2 shadow-[0_40px_80px_-30px_#000] md:h-[min(46rem,86dvh)]">
            <div className="relative size-full overflow-hidden rounded-[2rem] bg-muted">
              <div ref={scroller} tabIndex={0} aria-label={`${design.name}, scroll to see every section`} className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <img src={src.page} alt={`${design.name}, the whole invitation`} className="block h-auto w-full" />
              </div>
              {hasOpening(design.id) ? (
                <video
                  key={design.id}
                  ref={vid}
                  muted
                  playsInline
                  preload="auto"
                  poster={src.first}
                  className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", opened && "pointer-events-none opacity-0")}
                >
                  <source src={src.open} type="video/mp4" />
          <source src={src.openWebm} type="video/webm" />
                </video>
              ) : null}
            </div>
          </div>
          <div className="grid justify-items-center gap-3 text-center text-[#f6f2ec] md:justify-items-start md:text-start">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#c9b38a]">Preview</p>
            <h2 id="preview-name" className="font-serif text-4xl leading-none md:text-5xl">
              {design.name}
            </h2>
            {design.ar ? (
              <p lang="ar" dir="rtl" className="hidden font-[family-name:var(--font-amiri)] text-xl opacity-80 md:block">
                {design.ar}
              </p>
            ) : null}
            {design.note ? <p className="hidden max-w-xs text-sm opacity-80 md:block">{design.note}</p> : null}
            <p className="hidden text-sm opacity-80 md:block">Scroll inside the phone to see every section.</p>
            <Link href={design.href} className="mt-1 inline-flex h-11 items-center rounded-full bg-[#f6f2ec] px-6 text-sm font-medium text-[#26332b]">
              Use this design
            </Link>
          </div>
          <button type="button" onClick={onClose} aria-label="Close preview" className="fixed end-4 top-4 grid size-11 place-items-center rounded-full bg-[#f6f2ec] text-[#221d1a]">
            <X className="size-5" />
          </button>
        </div>
      ) : null}
    </dialog>
  );
}

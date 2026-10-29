"use client";

import { IntentLink as Link } from "@/components/intent-link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { hasOpening } from "./play-data";
import { PlayScreen } from "./play-screen";
import { usePreview, type PreviewDesign } from "./preview-dialog";

/**
 * A design in the gallery: a phone on soft paper. Hovering (or focusing) plays
 * it, its opening and then the whole site scrolling by; leaving returns it to
 * the start. Preview opens the large phone; Use this design starts it.
 */
export function PlayCard({ design, page, badge, tags }: { design: PreviewDesign; page: string; badge?: "new" | "loved"; tags: string[] }) {
  const [on, setOn] = useState(false);
  const preview = usePreview();
  return (
    <article
      className="group grid content-start gap-3"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOn(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOn(false)}
    >
      <div className={cn("relative grid aspect-[4/5] place-items-center overflow-hidden rounded-2xl transition-colors duration-500", on ? "bg-[#e8dfd2]" : "bg-muted")}>
        {badge ? (
          <span className={cn("absolute start-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em]", badge === "new" ? "bg-primary text-primary-foreground" : "bg-card")}>
            {badge === "new" ? "New" : "Most loved"}
          </span>
        ) : null}
        <span className={cn("absolute end-3 top-3 z-10 rounded-full bg-black/70 px-2.5 py-0.5 text-[0.68rem] text-white transition-opacity", on ? "opacity-100" : "opacity-0")}>
          {hasOpening(design.id) ? "Opening" : "Playing"}
        </span>
        <Link
          href={page}
          aria-label={`${design.name}, see the design`}
          className={cn("relative block aspect-[390/844] h-[88%] rounded-[1.35rem] bg-[#1d1b19] p-[0.3rem] shadow-[0_26px_36px_-24px_rgb(34_29_26/0.6)] transition-transform duration-600 ease-[cubic-bezier(.22,.8,.24,1)]", on && "-translate-y-1 scale-[1.03]")}
        >
          <PlayScreen id={design.id} playing={on} speed={110} className="size-full rounded-[1.1rem]" />
        </Link>
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,15,10,0.62),rgba(20,15,10,0)_46%)]" />
          <div className="relative flex w-full items-center gap-1.5 p-2.5">
            <button
              type="button"
              onClick={() => preview(design)}
              className="h-9 shrink-0 rounded-full bg-white/90 px-3.5 text-[0.75rem] font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              Preview
            </button>
            <Link
              href={design.href}
              className="flex h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-primary px-3 text-[0.75rem] font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Use
            </Link>
          </div>
        </div>
      </div>
      <div className="grid gap-0.5 px-1">
        <h3 className="font-serif text-2xl leading-tight">
          <Link href={page} className="hover:underline hover:underline-offset-4">
            {design.name}
          </Link>
        </h3>
        {design.ar ? (
          <p lang="ar" dir="rtl" className="text-start font-[family-name:var(--font-amiri)] text-muted-foreground">
            {design.ar}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">{tags.join(" · ")}</p>
      </div>
    </article>
  );
}

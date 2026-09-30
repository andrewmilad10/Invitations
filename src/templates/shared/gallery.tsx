"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { InvitationImage } from "./invitation-image";

/**
 * Photo grid with an accessible full-screen lightbox (native <dialog>:
 * focus trap, Esc to close; arrow keys to navigate).
 */
export function Gallery({
  model,
  className,
  itemClassName,
  variant = "mosaic",
  skip = 0,
}: {
  model: InvitationModel;
  className?: string;
  itemClassName?: string;
  /** Props must be serializable (this is a client component), so layouts are named variants. */
  variant?: "mosaic" | "grid";
  /** Leave out the first N photos from the grid (a layout showed them already); the lightbox still has all. */
  skip?: number;
}) {
  const photos = model.media.gallery;
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const step = useCallback((delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.open) return;
      const forward = model.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const back = model.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      if (e.key === forward) step(1);
      if (e.key === back) step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [model.dir, step]);

  if (photos.length <= skip) return null;
  const current = photos[index];

  return (
    <>
      <ul className={cn("grid auto-rows-[minmax(10rem,1fr)] grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3", className)}>
        {photos.map((photo, i) =>
          i < skip ? null : (
            <li key={photo.id} className={cn("relative overflow-hidden", variant === "mosaic" && i % 5 === 0 && "sm:col-span-2 sm:row-span-2", itemClassName)}>
              <button
                type="button"
                onClick={() => open(i)}
                className="group absolute inset-0 block size-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-accent"
                aria-label={`${model.strings.photo} ${i + 1}${photo.alt ? `: ${photo.alt}` : ""}`}
              >
                <InvitationImage asset={photo} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </button>
            </li>
          ),
        )}
      </ul>

      <dialog
        ref={dialog}
        className="m-0 size-full max-h-none max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        aria-label={model.strings.photo}
      >
        {current ? (
          <div className="relative flex size-full items-center justify-center p-4 sm:p-12">
            <div className="relative size-full">
              <InvitationImage asset={current} fill sizes="100vw" className="object-contain" />
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="absolute end-4 top-4 rounded-full bg-white/10 p-3 hover:bg-white/20"
              aria-label={model.strings.close}
            >
              <X className="size-5" />
            </button>
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute start-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20"
                  aria-label={model.strings.previous}
                >
                  <ChevronLeft className="size-5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20"
                  aria-label={model.strings.next}
                >
                  <ChevronRight className="size-5 rtl:rotate-180" />
                </button>
              </>
            ) : null}
            <p className="absolute bottom-4 start-1/2 -translate-x-1/2 text-sm tabular-nums text-white/70 rtl:translate-x-1/2">
              {index + 1} / {photos.length}
            </p>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

"use client";

import { useRef } from "react";

/** A native <dialog> opened as a modal; Escape and clicking outside close it. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-label={title}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border bg-card p-0 text-foreground backdrop:bg-black/40"
    >
      <div className="grid gap-5 p-6">
        <h2 className="font-serif text-3xl">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

export const field = "grid gap-1.5 text-sm";
export const input = "h-11 rounded-lg border bg-background px-3 text-base outline-none focus:border-primary";

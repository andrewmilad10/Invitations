"use client";

import { Children, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mood chips over the design cards. `moods[i]` is the mood of child i. */
export function FilteredGrid({ moods, labels, children }: { moods: string[]; labels: [string, string][]; children: ReactNode }) {
  const [mood, setMood] = useState("all");
  const items = Children.toArray(children);
  return (
    <>
      <div role="group" aria-label="Filter designs" className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        {[["all", "All designs"] as [string, string], ...labels].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mood === id}
            onClick={() => setMood(id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
              mood === id ? "border-forest bg-forest text-forest-foreground" : "border-border bg-card text-foreground hover:border-foreground/40",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {items.map((child, i) => (mood === "all" || moods[i] === mood ? child : null))}
      </div>
    </>
  );
}

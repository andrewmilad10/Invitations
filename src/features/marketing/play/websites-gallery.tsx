"use client";

import { useMemo, useState } from "react";
import { useUrlQuery } from "@/lib/use-url-query";
import { cn } from "@/lib/utils";
import { MOODS, TONES, type Mood, type Tone } from "../design-info";
import { PlayCard } from "./play-card";
import { PreviewProvider, type PreviewDesign } from "./preview-dialog";

export interface GalleryDesign extends PreviewDesign {
  page: string;
  mood: Mood;
  tone: Tone;
  isNew: boolean;
  /** Place in the "most loved" order. */
  rank: number;
  tags: string[];
}
type Sort = "loved" | "new" | "az";

/**
 * The wedding-website gallery: style chips, colour dots and sorting above a
 * grid of designs that play when hovered. Links like /websites?mood=floral or
 * ?sort=new (from the header menu) set the starting filters.
 */
export function WebsitesGallery({ designs }: { designs: GalleryDesign[] }) {
  const q = useUrlQuery();
  const [picked, setPicked] = useState<{ mood?: Mood | "all"; tone?: Tone | null; sort?: Sort }>({});
  const mood = picked.mood ?? ((q?.get("mood") as Mood | null) ?? "all");
  const tone = picked.tone !== undefined ? picked.tone : ((q?.get("tone") as Tone | null) ?? null);
  const sort = picked.sort ?? ((q?.get("sort") as Sort | null) ?? "loved");

  const shown = useMemo(() => {
    const list = designs.filter((d) => (mood === "all" || d.mood === mood) && (!tone || d.tone === tone));
    const by = sort === "az" ? (a: GalleryDesign, b: GalleryDesign) => a.name.localeCompare(b.name) : sort === "new" ? (a: GalleryDesign, b: GalleryDesign) => Number(b.isNew) - Number(a.isNew) || a.rank - b.rank : (a: GalleryDesign, b: GalleryDesign) => a.rank - b.rank;
    return list.slice().sort(by);
  }, [designs, mood, tone, sort]);

  const chip = (on: boolean) => cn("h-9 rounded-full border px-4 text-sm transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-muted-foreground");
  return (
    <PreviewProvider>
      <div className="sticky top-[4.6rem] z-20 -mx-5 mt-10 border-b border-border bg-background/95 px-5 backdrop-blur sm:-mx-8 sm:top-[5rem] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 py-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Style">
            <button type="button" aria-pressed={mood === "all"} className={chip(mood === "all")} onClick={() => setPicked((p) => ({ ...p, mood: "all" }))}>
              All
            </button>
            {MOODS.map(([k, l]) => (
              <button key={k} type="button" aria-pressed={mood === k} className={chip(mood === k)} onClick={() => setPicked((p) => ({ ...p, mood: k }))}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Colour">
            {TONES.map(([k, l, c]) => (
              <button
                key={k}
                type="button"
                aria-pressed={tone === k}
                aria-label={l}
                title={l}
                onClick={() => setPicked((p) => ({ ...p, tone: tone === k ? null : k }))}
                className={cn("size-7 rounded-full border-2 border-card transition-shadow", tone === k ? "shadow-[0_0_0_2px_var(--primary)]" : "shadow-[0_0_0_1px_var(--border)]")}
                style={{ background: c }}
              />
            ))}
          </div>
          <label className="ms-auto flex items-center gap-2 text-sm text-muted-foreground">
            Sort
            <select value={sort} onChange={(e) => setPicked((p) => ({ ...p, sort: e.target.value as Sort }))} className="h-9 rounded-full border border-border bg-card px-3 text-foreground">
              <option value="loved">Most loved</option>
              <option value="new">Newest</option>
              <option value="az">A to Z</option>
            </select>
          </label>
        </div>
      </div>
      <p className="mx-auto mt-5 max-w-7xl text-sm text-muted-foreground" aria-live="polite">
        {shown.length} {shown.length === 1 ? "design" : "designs"}
      </p>
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        {shown.map((d) => (
          <PlayCard key={d.id} design={d} page={d.page} tags={d.tags} badge={d.isNew ? "new" : d.rank < 4 ? "loved" : undefined} />
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No designs in this colour yet.{" "}
          <button type="button" className="underline underline-offset-4" onClick={() => setPicked({ mood: "all", tone: null })}>
            Show all
          </button>
        </p>
      ) : null}
    </PreviewProvider>
  );
}

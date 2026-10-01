"use client";

import { useState } from "react";
import { Stationery } from "@/features/marketing/stationery";
import { cn } from "@/lib/utils";
import type { TemplateOption } from "./template-option";

export { toTemplateOption, type TemplateOption } from "./template-option";

/** Radio-group of templates. Used by the wizard and (later) the theme panel. */
export function TemplatePicker({
  templates,
  value,
  onChange,
  name = "templateId",
  compact = false,
  initialCount,
}: {
  templates: TemplateOption[];
  value: string;
  onChange: (id: string) => void;
  name?: string;
  /** Small cards with names only, for narrow panels. */
  compact?: boolean;
  /** Show this many (the selected one first), with a "show all" button. */
  initialCount?: number;
}) {
  const [showAll, setShowAll] = useState(!initialCount);
  const selectedFirst = [...templates.filter((t) => t.id === value), ...templates.filter((t) => t.id !== value)];
  const shown = showAll ? templates : selectedFirst.slice(0, initialCount);

  if (compact) {
    return (
      <div>
        <div role="radiogroup" aria-label="Template" className="grid grid-cols-3 gap-2">
          {shown.map((t) => {
            const selected = t.id === value;
            return (
              <label
                key={t.id}
                className={cn(
                  "cursor-pointer rounded-md border p-2 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  selected ? "border-primary ring-1 ring-primary" : "hover:border-foreground/30",
                )}
              >
                <input type="radio" name={name} value={t.id} checked={selected} onChange={() => onChange(t.id)} className="sr-only" />
                <span aria-hidden className="flex h-24 items-center justify-center bg-muted">
                  <Stationery template={t} partnerOne="Emma" partnerTwo="James" eyebrow="" sizes="80px" className={t.stationery.shape === "square" ? "w-16" : "w-14"} />
                </span>
                <span className="mt-1.5 block truncate text-xs">{t.name}</span>
              </label>
            );
          })}
        </div>
        {!showAll && templates.length > shown.length ? (
          <button type="button" onClick={() => setShowAll(true)} className="mt-3 w-full rounded-md border py-2 text-sm text-muted-foreground hover:text-foreground">
            Show all {templates.length} designs
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div role="radiogroup" aria-label="Template" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {shown.map((t) => {
          const selected = t.id === value;
          return (
            <label
              key={t.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                selected ? "border-primary ring-1 ring-primary" : "hover:border-foreground/30",
              )}
            >
              <input type="radio" name={name} value={t.id} checked={selected} onChange={() => onChange(t.id)} className="sr-only" />
              <div className="flex justify-center bg-muted px-10 py-6">
                <Stationery template={t} partnerOne="Emma" partnerTwo="James" dateLabel="14 October" className="w-32 shadow-[0_10px_24px_-12px_rgb(34_29_26/0.5)]" />
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {t.name}
                    {t.status === "beta" ? <span className="ms-2 text-xs text-muted-foreground">Beta</span> : null}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                </div>
                <span
                  aria-hidden
                  className={cn("mt-1 grid size-5 shrink-0 place-items-center rounded-full border", selected ? "border-primary bg-primary" : "border-input")}
                >
                  {selected ? <span className="size-2 rounded-full bg-primary-foreground" /> : null}
                </span>
              </div>
            </label>
          );
        })}
      </div>
      {!showAll && templates.length > shown.length ? (
        <button type="button" onClick={() => setShowAll(true)} className="mt-4 w-full rounded-md border py-2.5 text-sm text-muted-foreground hover:text-foreground">
          Show all {templates.length} designs
        </button>
      ) : null}
    </div>
  );
}

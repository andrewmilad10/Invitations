"use client";

import type { TemplateManifest } from "@/core/template/manifest";
import { Stationery } from "@/features/marketing/stationery";
import { cn } from "@/lib/utils";

export type TemplateOption = Pick<TemplateManifest, "id" | "name" | "tagline" | "status" | "themeDefaults" | "stationery">;

/** Serializable subset of a manifest for client pickers. */
export function toTemplateOption(t: TemplateManifest): TemplateOption {
  return { id: t.id, name: t.name, tagline: t.tagline, status: t.status, themeDefaults: t.themeDefaults, stationery: t.stationery };
}

/** Radio-group of templates. Used by the wizard and (later) the theme panel. */
export function TemplatePicker({
  templates,
  value,
  onChange,
  name = "templateId",
}: {
  templates: TemplateOption[];
  value: string;
  onChange: (id: string) => void;
  name?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Template" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {templates.map((t) => {
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
            <input
              type="radio"
              name={name}
              value={t.id}
              checked={selected}
              onChange={() => onChange(t.id)}
              className="sr-only"
            />
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
                className={cn(
                  "mt-1 grid size-5 shrink-0 place-items-center rounded-full border",
                  selected ? "border-primary bg-primary" : "border-input",
                )}
              >
                {selected ? <span className="size-2 rounded-full bg-primary-foreground" /> : null}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}

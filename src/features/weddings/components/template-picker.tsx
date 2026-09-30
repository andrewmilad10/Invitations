"use client";

import Image from "next/image";
import type { TemplateManifest } from "@/core/template/manifest";
import { cn } from "@/lib/utils";

type TemplateOption = Pick<TemplateManifest, "id" | "name" | "tagline" | "previewImage" | "status">;

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
    <div role="radiogroup" aria-label="Template" className="grid gap-4 sm:grid-cols-2">
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
            <div className="relative aspect-[4/3] bg-muted">
              <Image src={t.previewImage} alt="" fill sizes="(min-width: 640px) 300px, 100vw" className="object-cover" />
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

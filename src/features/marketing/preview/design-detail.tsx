"use client";

import { Globe, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TemplateManifest } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { FavoriteButton, SwatchRow } from "../gallery/design-card";
import { websiteFeatures } from "../products";
import { listWords } from "@/lib/words";
import { BrowserFrame, FittedPhone, MobileTryBar } from "./template-preview-stage";

type View = "phone" | "website";


/**
 * The top of a website design's page: the live site on a desktop and on a
 * phone (thumbnails switch the view), its colour picker and Customize.
 * Colour choice carries through both views and into the editor.
 */
export function DesignDetail({
  template,
  initialPalette,
  initialView = "website",
}: {
  template: TemplateManifest;
  initialPalette: string;
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView);
  const [paletteId, setPaletteId] = useState(initialPalette);
  const palette = template.palettes.find((p) => p.id === paletteId) ?? template.palettes[0];
  const isDefault = palette.id === template.palettes[0].id;
  const query = isDefault ? "" : `?palette=${palette.id}`;
  const previewSrc = `/templates/${template.id}/preview${query}`;
  const customizeHref = `/create/${template.id}${query}`;

  function syncUrl(nextPalette: string, nextView: View) {
    const q = new URLSearchParams();
    if (nextPalette !== template.palettes[0].id) q.set("palette", nextPalette);
    if (nextView !== "website") q.set("view", nextView);
    const str = q.toString();
    window.history.replaceState(null, "", `/websites/${template.id}${str ? `?${str}` : ""}`);
  }

  function choosePalette(id: string) {
    setPaletteId(id);
    syncUrl(id, view);
  }

  function chooseView(v: View) {
    setView(v);
    syncUrl(palette.id, v);
  }

  const thumbs: { id: View; label: string; content: React.ReactNode }[] = [
    { id: "website", label: "Desktop", content: <Monitor className="size-6 text-muted-foreground" /> },
    { id: "phone", label: "Phone", content: <Smartphone className="size-6 text-muted-foreground" /> },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
      {/* Views */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row">
        <div role="tablist" aria-label="View" className="flex gap-3 sm:flex-col">
          {thumbs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={view === t.id}
              onClick={() => chooseView(t.id)}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "grid size-16 place-items-center overflow-hidden rounded-md bg-muted transition sm:size-20",
                  view === t.id ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "group-hover:bg-secondary",
                )}
              >
                {t.content}
              </span>
              <span className="text-xs text-muted-foreground">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          {view === "phone" ? (
            <div className="flex justify-center rounded-md bg-muted py-8">
              <FittedPhone src={previewSrc} title={`${template.name} — phone preview`} />
            </div>
          ) : (
            <BrowserFrame src={previewSrc} title={`${template.name} — website preview`} />
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Shown with sample details — you&apos;ll add your own.{" "}
            <Link href={previewSrc} target="_blank" className="underline underline-offset-4">
              Open full screen
            </Link>
          </p>
        </div>
      </div>

      {/* Options — arrive in sequence; the design itself is already in place (it morphs in from the gallery). */}
      <div data-stagger="80">
        <p className="text-sm text-accent">{listWords(template.categories.slice(0, 3), { sentence: true })}</p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">{template.name}</h1>
          <FavoriteButton id={template.id} name={template.name} className="mt-2 shrink-0 border bg-background" />
        </div>
        {template.isNew ? <span className="mt-3 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium">New</span> : null}
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{template.description}</p>

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Theme colour · <span className="normal-case tracking-normal text-foreground">{palette.label}</span>
          </p>
          <div className="mt-3">
            <SwatchRow template={template} value={palette.id} onChange={choosePalette} size="lg" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">You can fine-tune every colour and font in the editor.</p>
        </div>

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Your website includes</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {[...websiteFeatures(template), "Story", "Schedule", "Photo gallery", "Questions & answers"].map((f) => (
              <li key={f} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm">
                <Globe className="size-3.5 text-muted-foreground" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="rounded-full px-10">
            <Link href={customizeHref}>Customize</Link>
          </Button>
          <p className="text-sm text-muted-foreground sm:ms-3">Free to customise · no account needed</p>
        </div>

      </div>

      <MobileTryBar href={customizeHref} templateName={template.name} />
    </div>
  );
}

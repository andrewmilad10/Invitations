"use client";

import { Globe, Mail, Monitor, Printer, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState, ViewTransition } from "react";
import { Button } from "@/components/ui/button";
import type { TemplateManifest } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { FavoriteButton, morphName, paletteOverrides, SwatchRow } from "../gallery/design-card";
import { websiteFeatures } from "../products";
import { Stationery } from "../stationery";
import { BrowserFrame, FittedPhone, MobileTryBar } from "./template-preview-stage";

type View = "card" | "phone" | "website";

const SHAPE_LABEL = { portrait: "Portrait", square: "Square", arch: "Arch" } as const;

/** Paper options for printed cards — shown as a preview of what's coming, not for sale. */
const PAPERS = [
  ["Smooth matte", "Soft white, classic weight"],
  ["Cotton", "Thick, softly textured"],
  ["Pearlescent", "A subtle shimmer"],
  ["Recycled kraft", "Natural brown fibres"],
] as const;

/**
 * The top of a design's page: the design as a card, on a phone and as a
 * website (thumbnails switch the view), with its shape variants, colour
 * picker and Customize. Colour choice carries through every view and into
 * the editor.
 */
export function DesignDetail({
  template,
  variants,
  initialPalette,
  initialView = "card",
}: {
  template: TemplateManifest;
  /** Designs in the same family, including this one. */
  variants: TemplateManifest[];
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

  const card = (className: string, sizes: string) => (
    <Stationery
      template={template}
      overrides={paletteOverrides(template, palette.id)}
      partnerOne="Emma"
      partnerTwo="James"
      dateLabel="Wednesday, 14 October"
      place="London"
      sizes={sizes}
      className={className}
    />
  );

  function syncUrl(nextPalette: string, nextView: View) {
    const q = new URLSearchParams();
    if (nextPalette !== template.palettes[0].id) q.set("palette", nextPalette);
    if (nextView !== "card") q.set("view", nextView);
    const str = q.toString();
    window.history.replaceState(null, "", `/templates/${template.id}${str ? `?${str}` : ""}`);
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
    { id: "card", label: "Card", content: <span aria-hidden className="contents">{card("w-[70%] shadow-sm", "80px")}</span> },
    { id: "phone", label: "Site · phone", content: <Smartphone className="size-6 text-muted-foreground" /> },
    { id: "website", label: "Site · desktop", content: <Monitor className="size-6 text-muted-foreground" /> },
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
          {view === "card" ? (
            <div className="grid min-h-[min(80vh,44rem)] place-items-center rounded-md bg-muted p-[8%]">
              <ViewTransition name={morphName(template.id)} share="morph" default="none">
                <div className={template.stationery.shape === "square" ? "w-[min(100%,30rem)]" : "w-[min(100%,26rem)]"}>
                  {card("w-full shadow-[0_30px_60px_-30px_rgb(34_29_26/0.55)]", "(min-width: 1024px) 26rem, 80vw")}
                </div>
              </ViewTransition>
            </div>
          ) : view === "phone" ? (
            <div className="flex justify-center rounded-md bg-muted py-8">
              <FittedPhone src={previewSrc} title={`${template.name} — phone preview`} />
            </div>
          ) : (
            <BrowserFrame src={previewSrc} title={`${template.name} — website preview`} />
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Shown with sample details — you&apos;ll add your own.{" "}
            {view !== "card" ? (
              <Link href={previewSrc} target="_blank" className="underline underline-offset-4">
                Open full screen
              </Link>
            ) : null}
          </p>
        </div>
      </div>

      {/* Options — arrive in sequence; the design itself is already in place (it morphs in from the gallery). */}
      <div data-stagger="80">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">{template.categories.slice(0, 3).join(" · ")}</p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">{template.name}</h1>
          <FavoriteButton id={template.id} name={template.name} className="mt-2 shrink-0 border bg-background" />
        </div>
        {template.isNew ? <span className="mt-3 inline-block rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em]">New</span> : null}
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{template.description}</p>

        {variants.length > 1 ? (
          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Design</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {variants.map((v) => {
                const active = v.id === template.id;
                const shape = v.stationery.shape ?? "portrait";
                // Keep the chosen colour when switching variants, if the variant has it.
                const shared = !isDefault && v.palettes.some((p) => p.id === palette.id) ? palette.id : null;
                return (
                  <Link
                    key={v.id}
                    href={`/templates/${v.id}${shared ? `?palette=${shared}` : ""}`}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex w-24 flex-col items-center gap-2 rounded-md border p-3 text-xs transition-colors", active ? "border-foreground" : "hover:border-foreground/40")}
                  >
                    <span aria-hidden>
                      <Stationery template={v} overrides={paletteOverrides(v, shared)} partnerOne="E" partnerTwo="J" eyebrow="" dateLabel={null} sizes="64px" className={shape === "square" ? "w-14" : "w-11"} />
                    </span>
                    {SHAPE_LABEL[shape]}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

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
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Included with this design</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["card", Mail, "Invitation card", "Personalised with your details. Download it to send on WhatsApp or by email."],
                ["website", Globe, "Wedding website", `Your own link with ${[...websiteFeatures(template), "story", "schedule", "photos"].join(", ")}.`],
              ] as const
            ).map(([target, Icon, title, text]) => {
              const active = target === "card" ? view === "card" : view !== "card";
              return (
                <button
                  key={target}
                  type="button"
                  onClick={() => chooseView(target === "card" ? "card" : view === "phone" ? "phone" : "website")}
                  aria-pressed={active}
                  className={cn("rounded-md border p-4 text-start transition-colors", active ? "border-foreground" : "hover:border-foreground/40")}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4" /> {title}
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="rounded-full px-10">
            <Link href={customizeHref}>Customize</Link>
          </Button>
          <p className="text-sm text-muted-foreground sm:ms-3">Free to customise · no account needed</p>
        </div>

        <div className="mt-10 rounded-md border border-dashed p-5">
          <div className="flex items-center gap-2">
            <Printer className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">Printed cards</p>
            <span className="ms-auto rounded-full bg-secondary px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Coming soon</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Order this design printed and posted, on your choice of paper. For now, share it as a website and a link.</p>
          <ul className="mt-4 grid grid-cols-2 gap-2" aria-label="Paper types (coming soon)">
            {PAPERS.map(([name, hint]) => (
              <li key={name} className="rounded-md border bg-background/60 p-3 opacity-60">
                <p className="text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <MobileTryBar href={customizeHref} templateName={template.name} />
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TemplateManifest } from "@/core/template/manifest";
import { Stationery } from "../stationery";
import { PRODUCTS, websiteFeatures, type Product } from "../products";
import { designHref, FavoriteButton, paletteOverrides, SwatchRow } from "./design-card";
import { WebsiteThumb } from "./website-thumb";

/** A larger look at a design without leaving the gallery. */
export function QuickView({
  template,
  paletteId: initialPalette,
  product = "cards",
  onClose,
}: {
  template: TemplateManifest | null;
  paletteId: string;
  product?: Product;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [paletteId, setPaletteId] = useState(initialPalette);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (template && !el.open) el.showModal();
    if (!template && el.open) el.close();
  }, [template]);

  const isDefault = template ? paletteId === template.palettes[0].id : true;
  const query = isDefault ? "" : `?palette=${paletteId}`;

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="quick-view-title"
      className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-lg border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/40"
    >
      {template ? (
        <div className="relative grid gap-8 p-6 sm:grid-cols-[1.1fr_1fr] sm:p-10">
          <button type="button" onClick={onClose} className="absolute end-3 top-3 rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Close">
            <X className="size-4" />
          </button>
          {product === "websites" ? (
            <div className="relative aspect-[5/6] bg-muted">
              <WebsiteThumb
                template={template}
                overrides={paletteOverrides(template, paletteId)}
                partnerOne="Emma"
                partnerTwo="James"
                dateLabel="14 October"
                className="absolute inset-0"
              />
            </div>
          ) : (
            <div className="grid place-items-center bg-muted p-[8%]">
              <Stationery
                template={template}
                overrides={paletteOverrides(template, paletteId)}
                partnerOne="Emma"
                partnerTwo="James"
                dateLabel="14 October"
                place="London"
                sizes="(min-width: 640px) 26rem, 80vw"
                className="w-full max-w-sm shadow-[0_20px_40px_-20px_rgb(34_29_26/0.5)]"
              />
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">{template.categories.slice(0, 3).join(" · ")}</p>
            <h2 id="quick-view-title" className="mt-3 font-serif text-4xl font-light leading-tight">
              {template.name}
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{template.description}</p>
            {product === "websites" ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {PRODUCTS.websites.label}: {websiteFeatures(template).join(" · ")}
              </p>
            ) : null}
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Colour · <span className="normal-case tracking-normal text-foreground">{template.palettes.find((p) => p.id === paletteId)?.label}</span>
            </p>
            <div className="mt-3">
              <SwatchRow template={template} value={paletteId} onChange={setPaletteId} size="lg" />
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-8">
              <Button asChild className="rounded-full px-6">
                <Link href={product === "websites" ? `/create/${template.id}${query}` : `/invitations/${template.id}/customize${query}`}>Customize</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link href={designHref(template.id, isDefault ? null : paletteId)}>{product === "websites" ? "See live demo" : "See details"}</Link>
              </Button>
              <FavoriteButton id={template.id} name={template.name} className="ms-auto border bg-background" />
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

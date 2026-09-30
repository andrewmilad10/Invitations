"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";
import { Stationery } from "../stationery";
import { websiteFeatures, type Product } from "../products";
import { favoritesStore, useFavorites } from "./favorites";
import { WebsiteThumb } from "./website-thumb";

/** A design's page, opened on the card or the website view. */
export function designHref(id: string, paletteId: string | null, product: Product = "cards") {
  const q = new URLSearchParams();
  if (paletteId) q.set("palette", paletteId);
  if (product === "websites") q.set("view", "website");
  const s = q.toString();
  return `/templates/${id}${s ? `?${s}` : ""}`;
}

/** Couples used only to make gallery cards feel varied; not real weddings. */
const CARD_COUPLES: [string, string, string][] = [
  ["Emma", "James", "14 October"],
  ["Olivia", "Daniel", "20 June"],
  ["Sophia", "Alex", "2 May"],
  ["Sarah", "Michael", "8 September"],
  ["Nour", "Karim", "12 April"],
  ["Grace", "Henry", "30 August"],
  ["Mariam", "Andrew", "21 March"],
];

export function cardCouple(index: number) {
  return CARD_COUPLES[index % CARD_COUPLES.length];
}

/** Two-tone dot for a palette: its paper colour and its accent. */
export function paletteSwatch(template: TemplateManifest, paletteId: string) {
  const palette = template.palettes.find((p) => p.id === paletteId) ?? template.palettes[0];
  const c = resolveTheme(template.themeDefaults, { colors: palette.colors }).colors;
  return { label: palette.label, background: `linear-gradient(135deg, ${c.surface} 0 50%, ${c.accent} 50% 100%)` };
}

export function paletteOverrides(template: TemplateManifest, paletteId: string | null) {
  const palette = template.palettes.find((p) => p.id === paletteId);
  return palette && Object.keys(palette.colors).length ? { colors: palette.colors } : undefined;
}

export function SwatchRow({
  template,
  value,
  onChange,
  size = "sm",
}: {
  template: TemplateManifest;
  value: string;
  onChange: (id: string) => void;
  size?: "sm" | "lg";
}) {
  return (
    <div role="radiogroup" aria-label="Colour" className={cn("flex flex-wrap items-center", size === "sm" ? "gap-1.5" : "gap-2.5")}>
      {template.palettes.map((p) => {
        const swatch = paletteSwatch(template, p.id);
        const active = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={p.label}
            title={p.label}
            onClick={() => onChange(p.id)}
            className={cn(
              "relative rounded-full ring-offset-2 ring-offset-background transition",
              size === "sm" ? "size-4" : "size-8",
              active ? "ring-1 ring-foreground" : "hover:ring-1 hover:ring-foreground/30",
            )}
          >
            <span className="absolute inset-0 rounded-full border border-black/10" style={{ background: swatch.background }} />
          </button>
        );
      })}
    </div>
  );
}

export function FavoriteButton({ id, name, className }: { id: string; name: string; className?: string }) {
  const favorites = useFavorites();
  const saved = favorites.includes(id);
  return (
    <button
      type="button"
      onClick={() => favoritesStore.toggle(id)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved designs` : `Save ${name}`}
      className={cn("grid size-9 place-items-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur transition hover:scale-105", className)}
    >
      <Heart className={cn("size-4", saved && "fill-[var(--accent)] text-[var(--accent)]")} />
    </button>
  );
}

/**
 * A design in the gallery: the card in a chosen colour, colour dots that
 * recolour it, a heart to save it, and Quick view / Customize actions.
 */
export function DesignCard({
  template,
  index,
  initialPalette,
  onQuickView,
  product = "cards",
  className,
}: {
  template: TemplateManifest;
  index: number;
  initialPalette?: string;
  onQuickView?: (template: TemplateManifest, paletteId: string) => void;
  /** Show the design as a card or as a website. */
  product?: Product;
  className?: string;
}) {
  const [paletteId, setPaletteId] = useState(initialPalette ?? template.palettes[0].id);
  const [a, b, date] = cardCouple(index);
  const isDefault = paletteId === template.palettes[0].id;
  const website = product === "websites";
  const detailHref = designHref(template.id, isDefault ? null : paletteId, product);
  const customizeHref = `/create/${template.id}${isDefault ? "" : `?palette=${paletteId}`}`;
  const shape = template.stationery.shape ?? "portrait";

  return (
    <article className={cn("group relative", className)}>
      <div className="relative grid aspect-[5/6] place-items-center overflow-hidden bg-muted transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-30px_rgb(34_29_26/0.45)]">
        <Link href={detailHref} aria-label={`The ${template.name}`} className="absolute inset-0 z-0" />
        {website ? (
          <WebsiteThumb
            template={template}
            overrides={paletteOverrides(template, paletteId)}
            partnerOne={a}
            partnerTwo={b}
            dateLabel={date}
            className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <Stationery
            template={template}
            overrides={paletteOverrides(template, paletteId)}
            partnerOne={a}
            partnerTwo={b}
            dateLabel={date}
            className={cn(
              "pointer-events-none shadow-[0_12px_30px_-14px_rgb(34_29_26/0.45)] transition-transform duration-700 ease-out group-hover:scale-[1.03]",
              shape === "square" ? "w-[74%]" : "w-[64%]",
            )}
          />
        )}
        {template.isNew ? (
          <span className="absolute start-3 top-3 rounded-full bg-background px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em]">New</span>
        ) : null}
        <FavoriteButton id={template.id} name={template.name} className="absolute end-3 top-3 z-10" />
        <div className="absolute inset-x-0 bottom-0 z-10 flex gap-2 p-3 opacity-100 transition duration-300 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {onQuickView ? (
            <button
              type="button"
              onClick={() => onQuickView(template, paletteId)}
              className="hidden flex-1 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-white sm:block"
            >
              Quick view
            </button>
          ) : null}
          <Link href={customizeHref} className="flex-1 rounded-full bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
            Customize
          </Link>
        </div>
      </div>
      <div className="mt-3">
        <SwatchRow template={template} value={paletteId} onChange={setPaletteId} />
      </div>
      <h3 className="mt-2 font-serif text-xl leading-tight">
        <Link href={detailHref} className="hover:underline hover:underline-offset-4">
          {template.name}
        </Link>
      </h3>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{template.tagline}</p>
      {website ? <p className="mt-1.5 text-xs text-muted-foreground">{websiteFeatures(template).slice(0, 3).join(" · ")}</p> : null}
    </article>
  );
}

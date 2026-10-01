"use client";

import { Heart, ZoomIn } from "lucide-react";
import Link from "next/link";
import { useState, ViewTransition } from "react";
import { cardOptionsToQuery, type CardOptionOverrides } from "@/core/card/options";
import { cardShape, designCardDefaults, type TemplateManifest } from "@/core/template/manifest";
import { resolveTheme } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";
import { Stationery } from "../stationery";
import { getTemplateManifest } from "@/templates/registry";
import { productHref, productOf, websiteFeatures, type Product } from "../products";
import { favoritesStore, useFavorites } from "./favorites";
import { listWords } from "@/lib/words";
import { WebsiteThumb } from "./website-thumb";

/** Shared-element name: a gallery card and the card on its design page. */
export const morphName = (id: string) => `design-card-${id}`;

/** A design's product page (in the collection it belongs to). */
export function designHref(id: string, paletteId: string | null) {
  const template = getTemplateManifest(id);
  const q = new URLSearchParams();
  if (paletteId) q.set("palette", paletteId);
  return productHref(template ? productOf(template) : "cards", id, q);
}

/** Couples used only to make gallery cards feel varied; not real weddings. */
const CARD_COUPLES: [string, string, string][] = [
  ["Layla", "Omar", "14 October"],
  ["Olivia", "Daniel", "20 June"],
  ["Nour", "Karim", "12 April"],
  ["Salma", "Youssef", "8 September"],
  ["Mariam", "Andrew", "21 March"],
  ["Hana", "Adam", "2 May"],
  ["Grace", "Henry", "30 August"],
  ["Farida", "Ziad", "17 November"],
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
  limit,
}: {
  template: TemplateManifest;
  value: string;
  onChange: (id: string) => void;
  size?: "sm" | "lg";
  /** Show at most this many dots, then "+N". */
  limit?: number;
}) {
  const shown = limit ? template.palettes.slice(0, limit) : template.palettes;
  const extra = template.palettes.length - shown.length;
  return (
    <div role="radiogroup" aria-label="Colour" className={cn("flex flex-wrap items-center", size === "sm" ? "gap-2" : "gap-3")}>
      {shown.map((p) => {
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
              size === "sm" ? "size-5" : "size-10",
              active ? "ring-1 ring-foreground" : "hover:ring-1 hover:ring-foreground/30",
            )}
          >
            <span className="absolute inset-0 rounded-full border border-black/10" style={{ background: swatch.background }} />
          </button>
        );
      })}
      {extra > 0 ? <span className="text-xs text-muted-foreground">+{extra} more</span> : null}
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

/** Small label next to a design's name. */
export function Badge({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "foil" | "press" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        tone === "plain" && "bg-foreground text-background",
        tone === "foil" && "bg-[linear-gradient(115deg,#8a6a2c,#f1dc9c_45%,#b8923f_60%,#8a6a2c)] text-[#3b2c10]",
        tone === "press" && "border border-foreground/25 text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function designBadges(template: TemplateManifest) {
  const foil = designCardDefaults(template.stationery).foil;
  return (
    <>
      {template.isNew ? <Badge>New</Badge> : null}
      {foil && foil !== "none" ? <Badge tone="foil">Foil</Badge> : null}
      {template.stationery.letterpress ? <Badge tone="press">Letterpress</Badge> : null}
    </>
  );
}

/**
 * A design in the gallery: the card (or website) in a chosen colour, colour
 * dots that recolour it, a heart to save it, and Quick view / Customize.
 */
export function DesignCard({
  template,
  index,
  initialPalette,
  cardOptions,
  onQuickView,
  product = "cards",
  className,
}: {
  template: TemplateManifest;
  index: number;
  initialPalette?: string;
  /** Finish to preview the card in (e.g. the foil the gallery is filtered by). */
  cardOptions?: CardOptionOverrides;
  onQuickView?: (template: TemplateManifest, paletteId: string) => void;
  /** Show the design as a card or as a website. */
  product?: Product;
  className?: string;
}) {
  const [paletteId, setPaletteId] = useState(initialPalette ?? template.palettes[0].id);
  const [a, b, date] = cardCouple(index);
  const isDefault = paletteId === template.palettes[0].id;
  const website = product === "websites";
  const query = new URLSearchParams(cardOptions ? cardOptionsToQuery(cardOptions) : undefined);
  if (!isDefault) query.set("palette", paletteId);
  const detailHref = productHref(productOf(template), template.id, query);
  const customizeHref = website
    ? `/create/${template.id}${isDefault ? "" : `?palette=${paletteId}`}`
    : `/invitations/${template.id}/customize${query.size ? `?${query}` : ""}`;
  const shape = cardShape(template.stationery, cardOptions);

  return (
    <article className={cn("group relative", className)}>
      <div
        className={cn(
          "stationery-shine relative grid place-items-center overflow-hidden rounded-xl bg-muted transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-30px_rgb(34_29_26/0.45)]",
          website ? "aspect-[5/6]" : "aspect-square",
        )}
      >
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
          <ViewTransition name={morphName(template.id)} share="morph" default="none">
            <div className={cn("pointer-events-none [filter:drop-shadow(0_14px_14px_rgb(34_29_26/0.22))_drop-shadow(0_2px_3px_rgb(34_29_26/0.12))]", shape === "landscape" ? "w-[84%]" : shape === "square" ? "w-[70%]" : "w-[58%]")}>
              <Stationery
                template={template}
                overrides={paletteOverrides(template, paletteId)}
                options={cardOptions}
                partnerOne={a}
                partnerTwo={b}
                dateLabel={date}
                className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </ViewTransition>
        )}
        <FavoriteButton id={template.id} name={template.name} className="absolute end-3 top-3 z-10" />
        <div className="absolute inset-x-0 bottom-0 z-10 flex gap-2 p-3 opacity-100 transition duration-300 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {onQuickView ? (
            <button
              type="button"
              onClick={() => onQuickView(template, paletteId)}
              className="hidden flex-1 items-center justify-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur hover:bg-white sm:flex"
            >
              <ZoomIn className="size-3.5" /> Quick view
            </button>
          ) : null}
          <Link href={customizeHref} className="flex-1 rounded-full bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
            Customize
          </Link>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <h3 className="text-base font-medium leading-tight">
          <Link href={detailHref} className="hover:underline hover:underline-offset-4">
            {template.name}
          </Link>
        </h3>
        {designBadges(template)}
      </div>
      <div className="mt-2">
        <SwatchRow template={template} value={paletteId} onChange={setPaletteId} limit={5} />
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{template.tagline}</p>
      {website ? <p className="mt-1.5 text-xs text-muted-foreground">{listWords(websiteFeatures(template).slice(0, 3), { lower: false })}</p> : null}
    </article>
  );
}

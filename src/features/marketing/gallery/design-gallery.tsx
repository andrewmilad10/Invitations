"use client";

import { Check, ChevronDown, Heart, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CARD_SHAPES, TEMPLATE_CATEGORIES, type TemplateCategory, type TemplateManifest } from "@/core/template/manifest";
import { COLOR_FAMILIES, type ColorFamily } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";
import { Stationery } from "../stationery";
import { DesignCard } from "./design-card";
import { useFavorites } from "./favorites";
import { activeFilterCount, filtersToQuery, filterTemplates, NO_FILTERS, SORTS, type GalleryFilters, type Sort } from "./filters";
import { QuickView } from "./quick-view";

const PAGE = 48;
const STYLE_TILES = TEMPLATE_CATEGORIES.slice(0, 9);

/** Representative colour for each family's filter dot (UI only). */
const FAMILY_DOT: Record<ColorFamily, string> = {
  white: "#ffffff", neutral: "#cfc6b8", black: "#1b1b1b", gold: "#c3a26b", pink: "#e3a9b2", red: "#8d2a37",
  orange: "#d27a55", yellow: "#e6c65a", green: "#6f8a5e", blue: "#4d6a9a", purple: "#8a74b0",
};

const label = (s: string) => s[0].toUpperCase() + s.slice(1);

/**
 * The design gallery: style tiles, filters (style, colour, shape, photo,
 * saved), sorting and the grid. Filters live in the URL, so a filtered view
 * can be shared and survives a reload.
 */
export function DesignGallery({ templates, initialFilters }: { templates: TemplateManifest[]; initialFilters: GalleryFilters }) {
  const [filters, setFilters] = useState(initialFilters);
  const [limit, setLimit] = useState(PAGE);
  const [quick, setQuick] = useState<{ template: TemplateManifest; paletteId: string } | null>(null);
  const favorites = useFavorites();
  const items = useMemo(() => filterTemplates(templates, filters, favorites), [templates, filters, favorites]);

  function apply(patch: Partial<GalleryFilters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    setLimit(PAGE);
    window.history.replaceState(null, "", `/templates${filtersToQuery(next)}`);
  }

  const tileExample = (c: TemplateCategory) => templates.find((t) => t.categories[0] === c) ?? templates.find((t) => t.categories.includes(c));
  const shown = items.slice(0, limit);
  const count = activeFilterCount(filters);

  return (
    <>
      {/* Style tiles */}
      <nav aria-label="Browse by style" className="-mx-5 mt-10 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-3 sm:gap-4 lg:w-full lg:justify-between">
          {STYLE_TILES.map((c, i) => {
            const example = tileExample(c);
            const active = filters.style === c;
            return (
              <li key={c}>
                <button type="button" onClick={() => apply({ style: active ? null : c })} aria-pressed={active} className="group flex w-24 flex-col items-center gap-2 sm:w-28">
                  <span
                    className={cn(
                      "grid size-24 place-items-center overflow-hidden rounded-md bg-muted transition sm:size-28",
                      active ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "group-hover:bg-secondary",
                    )}
                  >
                    {example ? (
                      <Stationery
                        template={example}
                        partnerOne={["Ava", "Lily", "Mia", "Zoe", "Ivy"][i % 5]}
                        partnerTwo={["Leo", "Sam", "Noah", "Max", "Eli"][i % 5]}
                        dateLabel={null}
                        eyebrow=""
                        sizes="112px"
                        className={cn("w-[58%] shadow-[0_6px_14px_-8px_rgb(34_29_26/0.5)] transition-transform duration-500 group-hover:-translate-y-0.5", example.stationery.shape === "square" && "w-[68%]")}
                      />
                    ) : null}
                  </span>
                  <span className={cn("text-sm", active ? "font-medium" : "text-muted-foreground group-hover:text-foreground")}>{label(c)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Filter bar */}
      <div className="sticky top-0 z-20 -mx-5 mt-8 border-y bg-background/95 px-5 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <div className="flex flex-wrap items-center gap-2">
          <FilterMenu label="Sort" value={SORTS[filters.sort]} active={filters.sort !== "featured"}>
            {(close) =>
              (Object.keys(SORTS) as Sort[]).map((s) => (
                <MenuOption key={s} selected={filters.sort === s} onSelect={() => (apply({ sort: s }), close())}>
                  {SORTS[s]}
                </MenuOption>
              ))
            }
          </FilterMenu>
          <FilterMenu label="Style" value={filters.style ? label(filters.style) : null} active={Boolean(filters.style)}>
            {(close) => (
              <>
                <MenuOption selected={!filters.style} onSelect={() => (apply({ style: null }), close())}>
                  All styles
                </MenuOption>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <MenuOption key={c} selected={filters.style === c} onSelect={() => (apply({ style: c }), close())}>
                    {label(c)}
                  </MenuOption>
                ))}
              </>
            )}
          </FilterMenu>
          <FilterMenu label="Colour" value={filters.color ? label(filters.color) : null} active={Boolean(filters.color)}>
            {(close) => (
              <>
                <MenuOption selected={!filters.color} onSelect={() => (apply({ color: null }), close())}>
                  All colours
                </MenuOption>
                {COLOR_FAMILIES.map((c) => (
                  <MenuOption key={c} selected={filters.color === c} onSelect={() => (apply({ color: c }), close())}>
                    <span className="size-3.5 rounded-full border border-black/15" style={{ background: FAMILY_DOT[c] }} />
                    {label(c)}
                  </MenuOption>
                ))}
              </>
            )}
          </FilterMenu>
          <FilterMenu label="Shape" value={filters.shape ? label(filters.shape) : null} active={Boolean(filters.shape)}>
            {(close) => (
              <>
                <MenuOption selected={!filters.shape} onSelect={() => (apply({ shape: null }), close())}>
                  All shapes
                </MenuOption>
                {CARD_SHAPES.map((s) => (
                  <MenuOption key={s} selected={filters.shape === s} onSelect={() => (apply({ shape: s }), close())}>
                    <ShapeIcon shape={s} />
                    {label(s)}
                  </MenuOption>
                ))}
              </>
            )}
          </FilterMenu>
          <FilterMenu label="Photo" value={filters.photo === "with" ? "With photo" : filters.photo === "without" ? "No photo" : null} active={Boolean(filters.photo)}>
            {(close) => (
              <>
                <MenuOption selected={!filters.photo} onSelect={() => (apply({ photo: null }), close())}>
                  Any
                </MenuOption>
                <MenuOption selected={filters.photo === "with"} onSelect={() => (apply({ photo: "with" }), close())}>
                  With a photo
                </MenuOption>
                <MenuOption selected={filters.photo === "without"} onSelect={() => (apply({ photo: "without" }), close())}>
                  Without a photo
                </MenuOption>
              </>
            )}
          </FilterMenu>
          <button
            type="button"
            onClick={() => apply({ saved: !filters.saved })}
            aria-pressed={filters.saved}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors",
              filters.saved ? "border-foreground bg-foreground text-background" : "hover:border-foreground/40",
            )}
          >
            <Heart className={cn("size-3.5", filters.saved && "fill-current")} /> Saved{favorites.length ? ` (${favorites.length})` : ""}
          </button>
          {count ? (
            <button type="button" onClick={() => apply({ ...NO_FILTERS, sort: filters.sort })} className="inline-flex h-9 items-center gap-1 px-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              <X className="size-3.5" /> Clear all
            </button>
          ) : null}
          <p className="ms-auto text-sm text-muted-foreground" aria-live="polite">
            Showing {shown.length ? `1–${shown.length}` : "0"} of {items.length} {items.length === 1 ? "design" : "designs"}
          </p>
        </div>
      </div>

      {items.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((item, i) => (
            <DesignCard
              key={`${item.template.id}:${item.paletteId}`}
              template={item.template}
              index={templates.indexOf(item.template)}
              initialPalette={item.paletteId}
              onQuickView={(template, paletteId) => setQuick({ template, paletteId })}
              className={i < 4 ? undefined : "[content-visibility:auto] [contain-intrinsic-size:auto_520px]"}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="font-serif text-3xl font-light">{filters.saved && !favorites.length ? "No saved designs yet" : "No designs match"}</p>
          <p className="mt-2 text-muted-foreground">
            {filters.saved && !favorites.length ? "Tap the heart on any design to keep it here." : "Try removing a filter."}
          </p>
          <button type="button" onClick={() => apply(NO_FILTERS)} className="mt-6 text-sm underline underline-offset-4">
            Show all designs
          </button>
        </div>
      )}

      {items.length > limit ? (
        <div className="mt-14 text-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="rounded-full border px-8 py-3 text-sm hover:border-foreground/40">
            Show more designs
          </button>
        </div>
      ) : null}

      <QuickView key={quick ? `${quick.template.id}:${quick.paletteId}` : "closed"} template={quick?.template ?? null} paletteId={quick?.paletteId ?? ""} onClose={() => setQuick(null)} />
    </>
  );
}

function ShapeIcon({ shape }: { shape: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block border border-current opacity-70", shape === "square" ? "size-3.5" : "h-4 w-3", shape === "arch" && "rounded-t-full")}
    />
  );
}

function FilterMenu({ label, value, active, children }: { label: string; value: string | null; active: boolean; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors",
          active ? "border-foreground" : "hover:border-foreground/40",
        )}
      >
        <span>
          {label}
          {value ? <span className="font-medium">: {value}</span> : null}
        </span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div role="listbox" aria-label={label} className="absolute start-0 top-11 z-30 max-h-80 w-56 overflow-y-auto rounded-md border bg-card p-1 shadow-xl">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

function MenuOption({ selected, onSelect, children }: { selected: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button type="button" role="option" aria-selected={selected} onClick={onSelect} className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-start text-sm hover:bg-secondary">
      {children}
      {selected ? <Check className="ms-auto size-3.5" /> : null}
    </button>
  );
}

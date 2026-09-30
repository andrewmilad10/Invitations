"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { sectionDisplayOrder } from "@/core/invitation/build-model";
import { SECTION_DEFINITIONS, type SectionType } from "@/core/sections/registry";
import { cn } from "@/lib/utils";
import { resolveTemplateManifest } from "@/templates/registry";
import { saveSection, saveSectionOrder } from "../actions";
import { setSection, setSectionOrder } from "../bundle-updates";
import { useEditor } from "../editor-context";
import { GalleryManager, HeroImageField } from "./media";
import { SectionFields, useSectionState } from "./section-fields";

/** Content of one section: its photo (hero), generated fields and gallery. */
export function SectionContent({ type }: { type: SectionType }) {
  const def = SECTION_DEFINITIONS[type];
  const { enabled } = useSectionState(type);
  return (
    <div className="grid gap-8">
      {!enabled ? <p className="rounded-md bg-secondary px-3 py-2 text-sm">This section is hidden on your invitation.</p> : null}
      {def.manages?.media === "hero" ? <HeroImageField /> : null}
      <SectionFields type={type} />
      {def.manages?.media === "gallery" ? <GalleryManager /> : null}
    </div>
  );
}

/**
 * Compact section list for the editor's left column: order = order on the
 * invitation; select, show/hide and move up/down.
 */
export function SectionList({ selected, onSelect }: { selected: SectionType | null; onSelect: (type: SectionType) => void }) {
  const { weddingId, bundle, update, save, canEdit } = useEditor();
  const template = resolveTemplateManifest(bundle.wedding.template_id);
  const order = sectionDisplayOrder(bundle.sections, template);
  const customised = bundle.sections.some((s) => s.sort_order !== null);

  function move(index: number, delta: number) {
    const next = order.slice();
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    update((b) => setSectionOrder(b, next));
    save("section-order", () => saveSectionOrder(weddingId, next), 300);
  }

  return (
    <div>
      <div className="flex items-center justify-between px-3 pb-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Sections</p>
        {customised && canEdit ? (
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={() => {
              update((b) => setSectionOrder(b, null));
              save("section-order", () => saveSectionOrder(weddingId, null), 0);
            }}
          >
            Reset order
          </button>
        ) : null}
      </div>
      <ol className="grid gap-0.5">
        {order.map((type, index) => {
          const def = SECTION_DEFINITIONS[type];
          const row = bundle.sections.find((s) => s.type === type);
          const enabled = row?.enabled ?? !(template.defaultDisabled ?? []).includes(type);
          const fixed = type === "hero" || type === "footer";
          const active = selected === type;
          return (
            <li key={type} className={cn("group flex items-center gap-1 rounded-md pe-1", active ? "bg-secondary" : "hover:bg-secondary/60")}>
              <button
                type="button"
                onClick={() => onSelect(type)}
                aria-current={active ? "true" : undefined}
                className={cn("min-w-0 flex-1 truncate px-3 py-2 text-start text-sm", active && "font-medium", !enabled && "text-muted-foreground line-through")}
              >
                {def.label}
              </button>
              {!fixed && canEdit ? (
                <span className="hidden items-center group-focus-within:flex group-hover:flex">
                  <button type="button" className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label={`Move ${def.label} up`} disabled={index <= 1} onClick={() => move(index, -1)}>
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button type="button" className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label={`Move ${def.label} down`} disabled={index >= order.length - 2} onClick={() => move(index, 1)}>
                    <ArrowDown className="size-3.5" />
                  </button>
                </span>
              ) : null}
              {def.canDisable ? (
                <button
                  type="button"
                  disabled={!canEdit}
                  aria-label={enabled ? `Hide ${def.label}` : `Show ${def.label}`}
                  aria-pressed={enabled}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    update((b) => setSection(b, type, { enabled: !enabled }));
                    save(`section-enabled:${type}`, () => saveSection(weddingId, type, { enabled: !enabled }), 0);
                  }}
                >
                  {enabled ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

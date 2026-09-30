"use client";

import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { sectionDisplayOrder } from "@/core/invitation/build-model";
import { SECTION_DEFINITIONS, type SectionType } from "@/core/sections/registry";
import { resolveTemplateManifest } from "@/templates/registry";
import { saveSection, saveSectionOrder } from "../actions";
import { setSection, setSectionOrder } from "../bundle-updates";
import { useEditor } from "../editor-context";
import { PanelHeader } from "./panel-header";
import { GalleryManager, HeroImageField } from "./media";
import { SectionEnabledSwitch, SectionFields, useSectionState } from "./section-fields";

/**
 * The template's sections in their current order, with show/hide and move
 * controls. Order shown here = order on the invitation.
 */
export function SectionsPanel({ onEdit }: { onEdit: (type: SectionType) => void }) {
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

  function reset() {
    update((b) => setSectionOrder(b, null));
    save("section-order", () => saveSectionOrder(weddingId, null), 0);
  }

  return (
    <div className="grid gap-6">
      <PanelHeader
        title="Sections"
        description={`Show, hide and reorder the sections of the ${template.name} template.`}
        actions={
          customised ? (
            <Button type="button" size="sm" variant="ghost" disabled={!canEdit} onClick={reset}>
              Reset order
            </Button>
          ) : null
        }
      />
      <ol className="divide-y rounded-lg border bg-card">
        {order.map((type, index) => {
          const def = SECTION_DEFINITIONS[type];
          const row = bundle.sections.find((s) => s.type === type);
          const enabled = row?.enabled ?? !(template.defaultDisabled ?? []).includes(type);
          const fixed = type === "hero" || type === "footer";
          return (
            <li key={type} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label={`Move ${def.label} up`} disabled={!canEdit || fixed || index <= 1} onClick={() => move(index, -1)}>
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label={`Move ${def.label} down`} disabled={!canEdit || fixed || index >= order.length - 2} onClick={() => move(index, 1)}>
                  <ArrowDown className="size-4" />
                </button>
              </div>
              <button type="button" className="flex min-w-0 flex-1 items-center justify-between gap-3 text-start" onClick={() => onEdit(type)}>
                <span className="min-w-0">
                  <span className={enabled ? "font-medium" : "font-medium text-muted-foreground line-through"}>{def.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{def.description}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
              </button>
              {def.canDisable ? (
                <Switch
                  aria-label={`Show ${def.label}`}
                  checked={enabled}
                  disabled={!canEdit}
                  onCheckedChange={(checked) => {
                    update((b) => setSection(b, type, { enabled: checked }));
                    save(`section-enabled:${type}`, () => saveSection(weddingId, type, { enabled: checked }), 0);
                  }}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-muted-foreground">Hero and footer always stay first and last. Sections with nothing to show (for example a gallery without photos) are hidden automatically.</p>
    </div>
  );
}

/** Editor for one section: generated fields plus any data it manages. */
export function SectionPanel({ type, onBack }: { type: SectionType; onBack: () => void }) {
  const def = SECTION_DEFINITIONS[type];
  const { enabled } = useSectionState(type);
  return (
    <div className="grid gap-8">
      <button type="button" onClick={onBack} className="justify-self-start text-sm text-muted-foreground hover:text-foreground">
        ← All sections
      </button>
      <PanelHeader title={def.label} description={def.description} actions={<SectionEnabledSwitch type={type} />} />
      {!enabled ? <p className="rounded-md bg-secondary px-3 py-2 text-sm">This section is hidden on your invitation.</p> : null}
      {def.manages?.media === "hero" ? <HeroImageField /> : null}
      <SectionFields type={type} />
      {def.manages?.media === "gallery" ? <GalleryManager /> : null}
    </div>
  );
}

"use client";

import { ArrowDown, ArrowUp, ChevronDown, GripVertical } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { sectionDisplayOrder } from "@/core/invitation/build-model";
import { toLocale } from "@/core/i18n/locales";
import { resolveSectionContent, SECTION_DEFINITIONS, type FieldDescriptor, type SectionType } from "@/core/sections/registry";
import type { TemplateManifest } from "@/core/template/manifest";
import type { WeddingBundle } from "@/core/wedding/bundle";
import { FieldControl } from "@/features/editor/panels/section-fields";
import { cn } from "@/lib/utils";
import { isFilled, type TryAnswers } from "./answers";

/** Where the parts of a section that aren't text are filled in. */
const ELSEWHERE: Partial<Record<SectionType, string>> = {
  hero: "Your names and date are in steps 1–2, the photo in step 7.",
  ceremony: "The place and time are in step 3.",
  reception: "The place and time are in step 4.",
  venue: "The map comes from the addresses in steps 3–4.",
  gallery: "Photos are in step 7.",
  countdown: "It counts down to your ceremony.",
  rsvp: "Every reply is saved to your guest list once you publish.",
};

/**
 * Every section of the design, in its order on the invitation: write in any of
 * them, switch any of them off, and drag (or use the arrows) to change the
 * order. Fields start empty with the sample's words as a hint; the preview
 * shows the sample until you write your own, and only your own words are saved.
 */
export function SectionsStep({
  answers,
  update,
  template,
  bundle,
}: {
  answers: TryAnswers;
  update: (f: (a: TryAnswers) => TryAnswers) => void;
  template: TemplateManifest;
  bundle: WeddingBundle;
}) {
  const locale = toLocale(answers.locale);
  const order = sectionDisplayOrder(bundle.sections, template);
  const [open, setOpen] = useState<SectionType | null>(null);
  const [drag, setDrag] = useState<SectionType | null>(null);
  const [over, setOver] = useState<SectionType | null>(null);

  const pinned = (t: SectionType) => t === "hero";
  const isOn = (t: SectionType) => {
    const own = answers.sections?.[t]?.enabled;
    if (own !== undefined) return own;
    const row = bundle.sections.find((s) => s.type === t);
    return row?.enabled ?? !((template.defaultDisabled ?? []).includes(t) || SECTION_DEFINITIONS[t].defaultEnabled === false);
  };
  const setOrder = (next: SectionType[]) => update((a) => ({ ...a, order: next }));
  const move = (t: SectionType, by: number) => {
    const i = order.indexOf(t);
    const j = i + by;
    if (j < 1 || j >= order.length) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };
  const setSection = (t: SectionType, patch: { enabled?: boolean; name?: string; value?: unknown }) =>
    update((a) => {
      const cur = a.sections?.[t] ?? {};
      const content = patch.name ? { ...(cur.content ?? {}), [patch.name]: patch.value } : cur.content;
      return { ...a, sections: { ...a.sections, [t]: { ...cur, ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}), ...(content ? { content } : {}) } } };
    });

  return (
    <>
      <header className="mb-6">
        <h1 className="font-serif text-4xl font-light leading-tight">Every section</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Write in any section and watch it change on the invitation. Switch off what you don&apos;t need, and drag <GripVertical className="inline size-3.5" /> to change the order.
        </p>
      </header>
      {answers.order?.length ? (
        <button type="button" className="mb-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground" onClick={() => update((a) => ({ ...a, order: null }))}>
          Back to the design&apos;s order
        </button>
      ) : null}
      <ol className="grid gap-2">
        {order.map((t, i) => {
          const def = SECTION_DEFINITIONS[t];
          const on = isOn(t);
          const expanded = open === t;
          const own = (answers.sections?.[t]?.content ?? {}) as Record<string, unknown>;
          const shown = resolveSectionContent(t, (bundle.sections.find((s) => s.type === t)?.content ?? undefined) as Record<string, unknown> | undefined, locale) as Record<string, unknown>;
          const defaults = resolveSectionContent(t, undefined, locale) as Record<string, unknown>;
          return (
            <li
              key={t}
              draggable={!pinned(t)}
              onDragStart={(e) => {
                setDrag(t);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => {
                setDrag(null);
                setOver(null);
              }}
              onDragOver={(e) => {
                if (!drag || pinned(t)) return;
                e.preventDefault();
                setOver(t);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (!drag || drag === t || pinned(t)) return;
                const next = order.filter((x) => x !== drag);
                next.splice(next.indexOf(t), 0, drag);
                setOrder(next);
                setDrag(null);
                setOver(null);
              }}
              className={cn(
                "rounded-xl border bg-card transition-[box-shadow,opacity]",
                expanded && "shadow-[0_10px_24px_-18px_rgb(34_29_26/0.4)]",
                drag === t && "opacity-40",
                over === t && drag !== t && "shadow-[0_-3px_0_var(--accent)]",
              )}
            >
              <div className="flex items-center gap-1.5 py-1.5 pe-2 ps-1.5">
                <span className={cn("grid size-8 place-items-center text-muted-foreground", pinned(t) ? "opacity-30" : "cursor-grab active:cursor-grabbing")} aria-hidden>
                  <GripVertical className="size-4" />
                </span>
                <button type="button" onClick={() => setOpen(expanded ? null : t)} aria-expanded={expanded} className="grid min-w-0 flex-1 text-start">
                  <span className={cn("text-sm font-medium", !on && "text-muted-foreground line-through decoration-muted-foreground/40")}>{def.label}</span>
                  <span className="truncate text-xs text-muted-foreground">{summary(def.fields, own, shown)}</span>
                </button>
                <button type="button" aria-label={`Move ${def.label} up`} disabled={pinned(t) || i <= 1} onClick={() => move(t, -1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-25">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" aria-label={`Move ${def.label} down`} disabled={pinned(t) || i === order.length - 1} onClick={() => move(t, 1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-25">
                  <ArrowDown className="size-4" />
                </button>
                <Switch checked={on} disabled={!def.canDisable} aria-label={`Show ${def.label}`} onCheckedChange={(v) => setSection(t, { enabled: v })} />
                <button type="button" aria-label={expanded ? "Close" : `Write in ${def.label}`} onClick={() => setOpen(expanded ? null : t)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
                  <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
                </button>
              </div>
              {expanded ? (
                <div className="grid gap-5 border-t px-4 pb-5 pt-4">
                  <p className="text-xs text-muted-foreground">
                    {def.description}
                    {ELSEWHERE[t] ? ` ${ELSEWHERE[t]}` : ""}
                  </p>
                  {def.fields.map((f) => (
                    <FieldControl
                      key={f.name}
                      type={t}
                      field={withHint(f, shown[f.name])}
                      value={own[f.name] ?? (f.kind === "list" ? [] : f.kind === "number" ? defaults[f.name] : "")}
                      disabled={false}
                      onChange={(v) => setSection(t, { name: f.name, value: v })}
                    />
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** Text fields show what the invitation says now as their hint. */
function withHint(f: FieldDescriptor, shown: unknown): FieldDescriptor {
  if ((f.kind === "text" || f.kind === "textarea") && typeof shown === "string" && shown.trim()) return { ...f, placeholder: shown.length > 140 ? `${shown.slice(0, 140)}…` : shown };
  return f;
}

function summary(fields: FieldDescriptor[], own: Record<string, unknown>, shown: Record<string, unknown>): string {
  const first = fields.find((f) => f.kind === "text" || f.kind === "textarea");
  const v = first ? (isFilled(own[first.name]) ? own[first.name] : shown[first.name]) : null;
  return typeof v === "string" && v.trim() ? v : "Tap to write";
}


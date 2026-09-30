"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toLocale } from "@/core/i18n/locales";
import { resolveSectionContent, SECTION_DEFINITIONS, type FieldDescriptor, type SectionType } from "@/core/sections/registry";
import { saveSection } from "../actions";
import { setSection } from "../bundle-updates";
import { useEditor } from "../editor-context";

type ListItem = Record<string, string>;

/** Current (stored or default) content and enabled state of a section. */
export function useSectionState(type: SectionType) {
  const { bundle } = useEditor();
  const row = bundle.sections.find((s) => s.type === type);
  return {
    enabled: row?.enabled ?? true,
    content: resolveSectionContent(type, row?.content, toLocale(bundle.settings.locale)) as Record<string, unknown>,
  };
}

export function SectionEnabledSwitch({ type }: { type: SectionType }) {
  const { weddingId, update, save, canEdit } = useEditor();
  const { enabled } = useSectionState(type);
  if (!SECTION_DEFINITIONS[type].canDisable) return null;
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`enabled-${type}`}
        checked={enabled}
        disabled={!canEdit}
        onCheckedChange={(checked) => {
          update((b) => setSection(b, type, { enabled: checked }));
          save(`section-enabled:${type}`, () => saveSection(weddingId, type, { enabled: checked }), 0);
        }}
      />
      <Label htmlFor={`enabled-${type}`} className="text-sm text-muted-foreground">
        {enabled ? "Shown" : "Hidden"}
      </Label>
    </div>
  );
}

/** Form generated from the section definition's field descriptors. */
export function SectionFields({ type }: { type: SectionType }) {
  const { weddingId, update, save, canEdit } = useEditor();
  const { content } = useSectionState(type);
  const definition = SECTION_DEFINITIONS[type];

  function change(name: string, value: unknown) {
    const next = { ...content, [name]: value };
    update((b) => setSection(b, type, { content: next }));
    save(`section:${type}`, () => saveSection(weddingId, type, { content: next }));
  }

  return (
    <div className="grid gap-5">
      {definition.fields.map((field) => (
        <FieldControl key={field.name} type={type} field={field} value={content[field.name]} disabled={!canEdit} onChange={(v) => change(field.name, v)} />
      ))}
    </div>
  );
}

function FieldControl({
  type,
  field,
  value,
  disabled,
  onChange,
}: {
  type: SectionType;
  field: FieldDescriptor;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
}) {
  const id = `${type}-${field.name}`;
  if (field.kind === "text") {
    return (
      <Field id={id} label={field.label}>
        <Input id={id} value={String(value ?? "")} maxLength={field.maxLength} placeholder={field.placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      </Field>
    );
  }
  if (field.kind === "textarea") {
    const text = String(value ?? "");
    return (
      <Field id={id} label={field.label} hint={`${text.length} / ${field.maxLength}`}>
        <Textarea id={id} value={text} rows={field.rows ?? 4} maxLength={field.maxLength} placeholder={field.placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      </Field>
    );
  }

  // list
  const items = (Array.isArray(value) ? value : []) as ListItem[];
  const set = (next: ListItem[]) => onChange(next);
  const empty = Object.fromEntries(field.itemFields.map((f) => [f.name, ""]));
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-sm font-medium">{field.label}</legend>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">No entries yet.</p> : null}
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-lg border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
            {field.itemFields.map((f) => (
              <div key={f.name} className={f.name === "note" ? "sm:col-span-2" : undefined}>
                <Label htmlFor={`${id}-${index}-${f.name}`} className="mb-1.5 block text-xs text-muted-foreground">
                  {f.label}
                </Label>
                <Input
                  id={`${id}-${index}-${f.name}`}
                  value={item[f.name] ?? ""}
                  maxLength={f.maxLength}
                  placeholder={f.placeholder}
                  disabled={disabled}
                  onChange={(e) => set(items.map((it, i) => (i === index ? { ...it, [f.name]: e.target.value } : it)))}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-1">
            <Button type="button" variant="ghost" size="icon" disabled={disabled || index === 0} aria-label="Move up" onClick={() => set(swap(items, index, index - 1))}>
              <ArrowUp />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={disabled || index === items.length - 1} aria-label="Move down" onClick={() => set(swap(items, index, index + 1))}>
              <ArrowDown />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={disabled} aria-label={`Remove ${field.itemLabel}`} onClick={() => set(items.filter((_, i) => i !== index))}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="justify-self-start" disabled={disabled || items.length >= field.maxItems} onClick={() => set([...items, empty])}>
        <Plus /> Add {field.itemLabel}
      </Button>
    </fieldset>
  );
}

function swap<T>(list: T[], a: number, b: number): T[] {
  const next = list.slice();
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

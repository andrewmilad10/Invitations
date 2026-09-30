"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateDetails } from "../actions";
import { setDetails } from "../bundle-updates";
import { useEditor } from "../editor-context";
import { PanelHeader } from "./panel-header";

export function DetailsPanel() {
  const { weddingId, bundle, update, save, canEdit } = useEditor();
  const w = bundle.wedding;

  function change(patch: Partial<{ partnerOne: string; partnerTwo: string; weddingDate: string | null }>) {
    const next = {
      partnerOne: patch.partnerOne ?? w.partner_one_name,
      partnerTwo: patch.partnerTwo ?? w.partner_two_name,
      weddingDate: patch.weddingDate !== undefined ? patch.weddingDate : w.wedding_date,
    };
    update((b) => setDetails(b, next));
    // Names are required: don't send an empty name, keep the local edit until it's valid.
    if (next.partnerOne.trim() && next.partnerTwo.trim()) {
      save("details", () => updateDetails(weddingId, next));
    }
  }

  return (
    <div className="grid gap-6">
      <PanelHeader title="Couple & date" description="Shown on the envelope, hero, footer and link previews." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="partnerOne" label="First name" error={!w.partner_one_name.trim() ? "Enter a name." : undefined}>
          <Input id="partnerOne" value={w.partner_one_name} maxLength={80} disabled={!canEdit} onChange={(e) => change({ partnerOne: e.target.value })} />
        </Field>
        <Field id="partnerTwo" label="Second name" error={!w.partner_two_name.trim() ? "Enter a name." : undefined}>
          <Input id="partnerTwo" value={w.partner_two_name} maxLength={80} disabled={!canEdit} onChange={(e) => change({ partnerTwo: e.target.value })} />
        </Field>
      </div>
      <Field id="weddingDate" label="Wedding date" hint="Ceremony and reception times are set in their own sections.">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            id="weddingDate"
            type="date"
            className="max-w-xs"
            value={w.wedding_date ?? ""}
            disabled={!canEdit}
            onChange={(e) => change({ weddingDate: e.target.value || null })}
          />
          {w.wedding_date && canEdit ? (
            <button type="button" className="text-sm text-muted-foreground underline underline-offset-4" onClick={() => change({ weddingDate: null })}>
              Clear date
            </button>
          ) : null}
        </div>
      </Field>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { dateInZone, timeInZone } from "@/core/i18n/format";
import type { SectionType } from "@/core/sections/registry";
import { saveEvent } from "../actions";
import { setEvent, type EventFields } from "../bundle-updates";
import { useEditor } from "../editor-context";
import { PanelHeader } from "./panel-header";
import { SectionEnabledSwitch, SectionFields } from "./section-fields";

const COPY = {
  ceremony: { title: "Ceremony", description: "Where and when you say “I do”." },
  reception: { title: "Reception", description: "Where the celebration continues." },
} as const;

export function EventPanel({ kind }: { kind: "ceremony" | "reception" }) {
  const { weddingId, bundle, update, save, canEdit } = useEditor();
  const tz = bundle.settings.timezone;
  const existing = bundle.events.find((e) => e.kind === kind);

  // Local form state: the bundle stores an instant, the form edits wall-clock date + time.
  const [fields, setFields] = useState<EventFields>(() => ({
    title: existing?.title || COPY[kind].title,
    date: existing?.starts_at ? dateInZone(existing.starts_at, tz) : null,
    time: existing?.starts_at ? timeInZone(existing.starts_at, tz) : null,
    venueName: existing?.venue_name ?? "",
    address: existing?.address ?? "",
    mapUrl: existing?.map_url ?? "",
    description: existing?.description ?? "",
  }));

  function change(patch: Partial<EventFields>) {
    const next = { ...fields, ...patch };
    // A time without a date means "on the wedding day".
    if (next.time && !next.date && bundle.wedding.wedding_date) next.date = bundle.wedding.wedding_date;
    setFields(next);
    update((b) => setEvent(b, kind, next));
    if (next.mapUrl && !/^https:\/\//i.test(next.mapUrl)) return; // wait for a valid link
    save(`event:${kind}`, async () => {
      const result = await saveEvent(weddingId, { kind, ...next });
      return result.ok ? { ok: true } : result;
    });
  }

  const mapUrlInvalid = Boolean(fields.mapUrl) && !/^https:\/\//i.test(fields.mapUrl);
  const section = kind as SectionType;

  return (
    <div className="grid gap-8">
      <PanelHeader title={COPY[kind].title} description={COPY[kind].description} actions={<SectionEnabledSwitch type={section} />} />

      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${kind}-date`} label="Date" hint={bundle.wedding.wedding_date ? "Defaults to your wedding date." : undefined}>
            <Input id={`${kind}-date`} type="date" value={fields.date ?? ""} disabled={!canEdit} onChange={(e) => change({ date: e.target.value || null })} />
          </Field>
          <Field id={`${kind}-time`} label="Time" hint={`Local time (${tz.replace(/_/g, " ")})`}>
            <Input id={`${kind}-time`} type="time" value={fields.time ?? ""} disabled={!canEdit} onChange={(e) => change({ time: e.target.value || null })} />
          </Field>
        </div>
        <Field id={`${kind}-venue`} label="Venue name">
          <Input id={`${kind}-venue`} value={fields.venueName} maxLength={160} disabled={!canEdit} onChange={(e) => change({ venueName: e.target.value })} />
        </Field>
        <Field id={`${kind}-address`} label="Address" hint="Used for the map and directions.">
          <Input id={`${kind}-address`} value={fields.address} maxLength={400} disabled={!canEdit} onChange={(e) => change({ address: e.target.value })} />
        </Field>
        <Field id={`${kind}-map`} label="Map link (optional)" error={mapUrlInvalid ? "Use a full https:// link, e.g. from Google Maps → Share." : undefined}>
          <Input id={`${kind}-map`} type="url" inputMode="url" value={fields.mapUrl} placeholder="https://maps.app.goo.gl/…" disabled={!canEdit} onChange={(e) => change({ mapUrl: e.target.value })} />
        </Field>
        <Field id={`${kind}-description`} label="Details (optional)">
          <Textarea id={`${kind}-description`} rows={3} value={fields.description} maxLength={2000} disabled={!canEdit} onChange={(e) => change({ description: e.target.value })} />
        </Field>
        {!existing ? <p className="text-sm text-muted-foreground">Add a date or venue to show this section on your invitation.</p> : null}
      </div>

      <div className="grid gap-4 border-t pt-6">
        <h3 className="text-sm font-medium">Section text</h3>
        <SectionFields type={section} />
      </div>
    </div>
  );
}

"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/select";
import { LOCALE_META, LOCALES, type Locale } from "@/core/i18n/locales";
import { slugSchema } from "@/core/wedding/slug";
import { updateSettings, updateSlug } from "../actions";
import { setSettings, setSlug } from "../bundle-updates";
import { useEditor } from "../editor-context";
import { PanelHeader } from "./panel-header";

export function SettingsPanel() {
  const { weddingId, bundle, update, save, canEdit, siteUrl } = useEditor();
  const s = bundle.settings;
  const [slug, setSlugDraft] = useState(bundle.wedding.slug);
  const [slugError, setSlugError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const publicUrl = `${siteUrl}/w/${bundle.wedding.slug}`;

  const timezones = useMemo(() => {
    const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
    return zones.includes(s.timezone) ? zones : [s.timezone, ...zones];
  }, [s.timezone]);

  function change(patch: Partial<typeof s>) {
    const next = { ...s, ...patch };
    update((b) => setSettings(b, patch));
    save("settings", () =>
      updateSettings(weddingId, { locale: next.locale as Locale, timezone: next.timezone, visibility: next.visibility, musicEnabled: next.music_enabled }),
    );
  }

  function saveSlug() {
    const parsed = slugSchema.safeParse(slug);
    if (!parsed.success) {
      setSlugError(parsed.error.issues[0]?.message);
      return;
    }
    setSlugError(undefined);
    startTransition(async () => {
      const result = await updateSlug(weddingId, parsed.data);
      if (!result.ok) {
        setSlugError(result.fieldErrors?.slug?.[0] ?? result.error);
        return;
      }
      update((b) => setSlug(b, result.data.slug));
      setSlugDraft(result.data.slug);
      toast.success("Web address updated. The old link no longer works.");
    });
  }

  return (
    <div className="grid gap-8">
      <PanelHeader title="Settings & sharing" />

      <section className="grid gap-3">
        <h3 className="text-sm font-medium">Your link</h3>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
          <code className="min-w-0 flex-1 truncate text-sm">{publicUrl}</code>
          <Button type="button" size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(publicUrl).then(() => toast.success("Link copied"))}>
            <Copy /> Copy
          </Button>
          {bundle.wedding.status === "published" ? (
            <Button asChild size="sm" variant="ghost">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open
              </a>
            </Button>
          ) : null}
        </div>
        {bundle.wedding.status !== "published" ? <p className="text-xs text-muted-foreground">The link works once you publish.</p> : null}
      </section>

      <Field id="slug" label="Web address" error={slugError} hint="Lowercase letters, numbers and hyphens. Changing it breaks links you've already shared.">
        <div className="flex gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-md border border-input bg-background ps-3 text-sm focus-within:ring-2 focus-within:ring-ring/30">
            <span className="shrink-0 text-muted-foreground">/w/</span>
            <input
              id="slug"
              value={slug}
              maxLength={60}
              disabled={!canEdit}
              onChange={(e) => setSlugDraft(e.target.value.toLowerCase())}
              className="h-10 min-w-0 flex-1 bg-transparent pe-3 outline-none"
              aria-invalid={Boolean(slugError)}
            />
          </div>
          <Button type="button" disabled={!canEdit || pending || slug === bundle.wedding.slug} onClick={saveSlug}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="locale" label="Invitation language" hint="Sets text direction, dates and default wording.">
          <NativeSelect id="locale" value={s.locale} disabled={!canEdit} onChange={(e) => change({ locale: e.target.value })}>
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_META[l].label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="timezone" label="Time zone" hint="Event times are entered and shown in this zone. If you change it later, re-check your ceremony and reception times.">
          <NativeSelect id="timezone" value={s.timezone} disabled={!canEdit} onChange={(e) => change({ timezone: e.target.value })}>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>

      <Field id="visibility" label="Search engines" hint="Unlisted invitations work for anyone with the link but ask search engines not to index them.">
        <NativeSelect id="visibility" value={s.visibility} disabled={!canEdit} onChange={(e) => change({ visibility: e.target.value as typeof s.visibility })}>
          <option value="unlisted">Unlisted — only people with the link</option>
          <option value="public">Public — may appear in search results</option>
        </NativeSelect>
      </Field>
    </div>
  );
}

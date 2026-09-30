"use client";

import { formatDateOnly } from "@/core/i18n/format";
import { Stationery } from "@/features/marketing/stationery";
import { resolveTemplateManifest } from "@/templates/registry";
import { hasProgress, themeOverrides } from "./answers";
import { useStoredDraft } from "./draft-store";

/** The visitor's own draft, drawn as their invitation card (auth pages). */
export function DraftSummary() {
  const draft = useStoredDraft();
  if (!draft || !hasProgress(draft)) {
    return <p className="max-w-xs text-center text-sm text-muted-foreground">Your invitation will be saved to your account as soon as it&apos;s created.</p>;
  }
  const template = resolveTemplateManifest(draft.templateId);
  return (
    <figure className="w-full max-w-sm">
      <Stationery
        template={template}
        overrides={themeOverrides(draft, template)}
        partnerOne={draft.partnerOne || "…"}
        partnerTwo={draft.partnerTwo || "…"}
        dateLabel={draft.date ? formatDateOnly(draft.date, "en").long : null}
        className="shadow-[0_30px_60px_-30px_rgb(34_29_26/0.5)]"
      />
      <figcaption className="mt-6 text-center text-sm text-muted-foreground">
        Your invitation · The {template.name}
        <br />
        Everything you&apos;ve added comes with you.
      </figcaption>
    </figure>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveTemplateManifest } from "@/templates/registry";
import { hasProgress } from "./answers";
import { draftFiles, draftStore, useStoredDraft } from "./draft-store";
import { SaveDraftAfterAuth } from "./save-draft-after-auth";

/**
 * Dashboard banner for an invitation started without an account in this
 * browser (e.g. the visitor confirmed their email, then logged in).
 * `autoSave` saves it straight away (the visitor just clicked "Save").
 */
export function DraftImporter({ autoSave = false }: { autoSave?: boolean }) {
  const draft = useStoredDraft();
  const [saving, setSaving] = useState(autoSave);

  if (!draft || !hasProgress(draft)) return null;
  if (saving) {
    return (
      <div className="mb-8 rounded-lg border bg-card p-6">
        <SaveDraftAfterAuth />
      </div>
    );
  }

  const names = [draft.partnerOne, draft.partnerTwo].filter((n) => n.trim()).join(" & ") || "your wedding";
  return (
    <div role="region" aria-label="Unsaved invitation" className="mb-8 flex flex-col gap-4 rounded-lg border border-accent/40 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-serif text-2xl">You started an invitation for {names}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The {resolveTemplateManifest(draft.templateId).name} · saved in this browser, not yet in your account.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            if (!window.confirm("Discard this draft? This can't be undone.")) return;
            draftStore.clear();
            void draftFiles.clear().catch(() => undefined);
          }}
        >
          Discard
        </Button>
        <Button onClick={() => setSaving(true)}>Save to my account</Button>
      </div>
    </div>
  );
}

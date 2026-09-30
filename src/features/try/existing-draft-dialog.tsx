"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import type { TemplateManifest } from "@/core/template/manifest";
import { Stationery } from "@/features/marketing/stationery";
import { hasProgress, themeOverrides, type TryAnswers } from "./answers";
import { draftFiles, draftStore } from "./draft-store";

const SEEN_KEY = "vellum:draft-prompt-seen";

// The draft as it was when this page was first opened in this tab — so the
// prompt is about a draft from before, never one being typed right now.
let initialDraft: TryAnswers | null | undefined;
const noop = () => () => {};
function getInitialDraft() {
  if (initialDraft === undefined) initialDraft = draftStore.get();
  return initialDraft;
}
function getSeen() {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * "You already have a draft": shown once per browser session when someone
 * starts a design while an earlier, unsaved draft exists. They can pick it
 * up again, or start over (which deletes it and its photos).
 */
export function ExistingDraftDialog({
  templateId,
  templates,
  skip,
  onEditDraft,
}: {
  templateId: string;
  templates: TemplateManifest[];
  /** e.g. details were handed over from the homepage */
  skip: boolean;
  onEditDraft: (draft: TryAnswers) => void;
}) {
  const draft = useSyncExternalStore(noop, getInitialDraft, () => null);
  const seen = useSyncExternalStore(noop, getSeen, () => true);
  const [dismissed, setDismissed] = useState(false);
  const open = Boolean(!skip && !seen && !dismissed && draft && hasProgress(draft));
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (open && el && !el.open) el.showModal();
  }, [open]);

  function close() {
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    dialog.current?.close();
    setDismissed(true);
  }

  if (!open || !draft) return null;
  const draftTemplate = templates.find((t) => t.id === draft.templateId) ?? templates.find((t) => t.id === templateId)!;
  const updated = new Date(draft.updatedAt);
  const lastUpdated = Number.isNaN(updated.getTime())
    ? null
    : updated.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

  function startNew() {
    draftStore.clear();
    void draftFiles.clear().catch(() => undefined);
    close();
  }

  return (
    <dialog
      ref={dialog}
      onCancel={close}
      aria-labelledby="existing-draft-title"
      className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-lg border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/40"
    >
      <div className="grid gap-6 p-6 sm:grid-cols-[11rem_1fr] sm:p-8">
        <div className="grid place-items-center rounded-md bg-muted p-5">
          <Stationery
            template={draftTemplate}
            overrides={themeOverrides(draft, draftTemplate)}
            partnerOne={draft.partnerOne || "…"}
            partnerTwo={draft.partnerTwo || "…"}
            eyebrow=""
            sizes="140px"
            className="w-full shadow-md"
          />
        </div>
        <div className="flex flex-col">
          <h2 id="existing-draft-title" className="font-serif text-3xl font-light">
            You already have a draft
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {draft.partnerOne || draft.partnerTwo ? `${draft.partnerOne || "…"} & ${draft.partnerTwo || "…"} · ` : ""}
            {draftTemplate.name}
          </p>
          {lastUpdated ? <p className="mt-1 text-sm text-muted-foreground">Last updated {lastUpdated}</p> : null}
          <p className="mt-4 text-sm leading-relaxed">
            {draftTemplate.id === templateId
              ? "Pick up where you left off, or start a new one."
              : "Pick up where you left off, or start fresh with this design. Your details carry over to any design you switch to."}
          </p>
          <div className="mt-auto flex flex-wrap justify-end gap-2 pt-6">
            <Button variant="outline" className="rounded-full" onClick={startNew}>
              Start new
            </Button>
            <Button
              className="rounded-full"
              onClick={() => {
                close();
                onEditDraft(draft);
              }}
            >
              Edit draft
            </Button>
          </div>
          {draftTemplate.id !== templateId ? (
            <button type="button" onClick={close} className="mt-3 self-end text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Use my details with this design instead
            </button>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

"use client";

import { saveSection, saveSectionOrder } from "@/features/editor/actions";
import { uploadMedia } from "@/features/editor/upload";
import { resolveTemplateManifest } from "@/templates/registry";
import { saveDraftAsWedding } from "./actions";
import {
  draftToCreate,
  hasProgress,
  localPhotos,
  sectionsToSave,
} from "./answers";
import { draftFiles, draftStore } from "./draft-store";

export type TransferResult =
  | { ok: true; weddingId: string; photosNotSaved: number }
  | { ok: false; error: string };

let inFlight: Promise<TransferResult> | null = null;

/**
 * Moves the browser draft into the signed-in user's account:
 *   1. one transaction creates the wedding with all details and library photos
 *   2. photos kept in this browser are uploaded to the new wedding's folder
 *   3. the browser draft is cleared
 * Safe to call twice (e.g. a double click): concurrent calls share one run.
 */
export function transferDraft(): Promise<TransferResult> {
  inFlight ??= run()
    .catch((): TransferResult => ({
      ok: false,
      error:
        "No connection, so your invitation wasn't saved yet. It's still in this browser: check your internet and try again.",
    }))
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

async function run(): Promise<TransferResult> {
  const answers = draftStore.get();
  if (!answers || !hasProgress(answers))
    return { ok: false, error: "There's no draft to save." };

  const template = resolveTemplateManifest(answers.templateId);
  const saved = await saveDraftAsWedding(draftToCreate(answers, template));
  if (!saved.ok) return { ok: false, error: saved.error };

  // The wedding exists now; clear the draft so it can never be saved twice,
  // but keep the photo files until they're uploaded.
  const photos = localPhotos(answers);
  draftStore.clear();

  // Sections the visitor wrote in or switched, and their order (each validated on the server).
  await Promise.all(
    sectionsToSave(answers).map((s) =>
      saveSection(saved.data.id, s.type, {
        enabled: s.enabled,
        content: s.content,
      }).catch(() => undefined),
    ),
  );
  if (answers.order?.length)
    await saveSectionOrder(saved.data.id, answers.order).catch(() => undefined);

  let photosNotSaved = 0;
  for (const photo of photos) {
    try {
      const blob = await draftFiles.get(photo.ref.key);
      if (!blob) {
        photosNotSaved++;
        continue;
      }
      const file = new File([blob], photo.ref.name || "photo", {
        type: blob.type,
      });
      const result = await uploadMedia(saved.data.id, photo.purpose, file);
      if (!result.ok) photosNotSaved++;
    } catch {
      photosNotSaved++;
    }
  }
  await draftFiles.clear().catch(() => undefined);

  return { ok: true, weddingId: saved.data.id, photosNotSaved };
}

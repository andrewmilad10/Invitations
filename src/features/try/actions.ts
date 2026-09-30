"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidTimeZone } from "@/core/i18n/format";
import { LOCALES } from "@/core/i18n/locales";
import { themeOverridesSchema } from "@/core/theme/tokens";
import { suggestSlug } from "@/core/wedding/slug";
import { getCurrentUser } from "@/features/auth/session";
import { PHOTO_LIBRARY, type LibraryPhotoId } from "@/features/media/library";
import type { ActionResult } from "@/features/weddings/schemas";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { isSelectableTemplateId } from "@/templates/registry";
import type { DraftToCreate } from "./answers";

const libraryIds = Object.keys(PHOTO_LIBRARY) as [LibraryPhotoId, ...LibraryPhotoId[]];

const draftSchema = z.object({
  templateId: z.string().refine(isSelectableTemplateId, "Unknown template."),
  partnerOne: z.string().trim().min(1, "Add both names.").max(80),
  partnerTwo: z.string().trim().min(1, "Add both names.").max(80),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  locale: z.enum(LOCALES),
  timezone: z.string().refine(isValidTimeZone, "Unknown time zone."),
  theme: themeOverridesSchema.strict(),
  events: z
    .array(
      z.object({
        kind: z.enum(["ceremony", "reception"]),
        venueName: z.string().trim().max(160).nullable(),
        address: z.string().trim().max(400).nullable(),
        startsAt: z.iso.datetime().nullable(),
      }),
    )
    .max(2)
    .refine((events) => new Set(events.map((e) => e.kind)).size === events.length, "Duplicate event."),
  libraryPhotos: z
    .array(z.object({ purpose: z.enum(["hero", "gallery"]), id: z.enum(libraryIds), sort: z.number().int().min(0).max(100) }))
    .max(13)
    .refine((photos) => photos.filter((p) => p.purpose === "hero").length <= 1, "Only one main photo."),
});

/**
 * Turns the visitor's browser draft into a real wedding owned by the
 * signed-in user — one database transaction (create_wedding_from_draft),
 * under their RLS. Local photos are uploaded by the browser afterwards.
 */
export async function saveDraftAsWedding(draft: DraftToCreate): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to save your invitation." };

  const parsed = draftSchema.safeParse(draft);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Some details are invalid.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_wedding_from_draft", {
    p_draft: { ...d, slug: suggestSlug(d.partnerOne, d.partnerTwo) } as unknown as Json,
  });
  if (error || !data) {
    console.error("create_wedding_from_draft failed", error);
    return { ok: false, error: "We couldn't save your invitation. Please try again — your draft is still here." };
  }

  revalidatePath("/dashboard");
  return { ok: true, data: { id: data as string } };
}

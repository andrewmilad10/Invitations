"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { suggestSlug, withRandomSuffix } from "@/core/wedding/slug";
import { getCurrentUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isSelectableTemplateId } from "@/templates/registry";
import { isUuid } from "./queries";
import { createWeddingSchema, type ActionResult, type CreateWeddingInput } from "./schemas";

const UNIQUE_VIOLATION = "23505";
const MAX_SLUG_ATTEMPTS = 5;

/**
 * Creates a wedding owned by the current user. The owner membership, settings
 * and theme rows are created by database triggers in the same transaction.
 * Returns the new id; the client navigates to the editor.
 */
export async function createWedding(input: CreateWeddingInput): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has expired. Please log in again." };

  const parsed = createWeddingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { partnerOne, partnerTwo, weddingDate, templateId } = parsed.data;
  if (!isSelectableTemplateId(templateId)) {
    return { ok: false, error: "Please choose one of the available templates.", fieldErrors: { templateId: ["Unknown template."] } };
  }

  const supabase = await createClient();
  const base = suggestSlug(partnerOne, partnerTwo);

  // The unique index is the source of truth; retry with a random suffix on
  // collision instead of a racy "is it taken?" pre-check.
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 && base ? base : withRandomSuffix(base);
    const { data, error } = await supabase
      .from("weddings")
      .insert({
        owner_id: user.id,
        slug,
        partner_one_name: partnerOne,
        partner_two_name: partnerTwo,
        wedding_date: weddingDate,
        template_id: templateId,
      })
      .select("id")
      .single();

    if (!error) {
      revalidatePath("/dashboard");
      return { ok: true, data: { id: data.id } };
    }
    if (error.code !== UNIQUE_VIOLATION) {
      console.error("createWedding failed", error);
      return { ok: false, error: "We couldn't create your wedding. Please try again." };
    }
  }
  return { ok: false, error: "We couldn't find a free web address. Please try again." };
}

/** Publish or unpublish. RLS ensures only owners/editors can do this. */
export async function setWeddingPublished(weddingId: string, published: boolean): Promise<ActionResult> {
  if (!isUuid(weddingId)) return { ok: false, error: "Wedding not found." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has expired. Please log in again." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weddings")
    .update({ status: published ? "published" : "draft" })
    .eq("id", weddingId)
    .select("slug")
    .maybeSingle();

  if (error) {
    console.error("setWeddingPublished failed", error);
    return { ok: false, error: "We couldn't update the wedding. Please try again." };
  }
  if (!data) return { ok: false, error: "You don't have permission to publish this wedding." };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/weddings/${weddingId}`);
  revalidatePath(`/w/${data.slug}`);
  return { ok: true };
}

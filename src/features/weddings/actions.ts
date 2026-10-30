"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "@/lib/zod";
import { invitationTag } from "@/features/invitations/public";
import { suggestSlug, withRandomSuffix } from "@/core/wedding/slug";
import { getCurrentUser } from "@/features/auth/session";
import { limitError } from "@/lib/supabase/limit-error";
import { createClient } from "@/lib/supabase/server";
import { isSelectableTemplateId } from "@/templates/registry";
import { sampleBundle } from "@/templates/fixtures/sample-wedding";
import { zonedTimeToIso } from "@/core/i18n/format";
import type { Json } from "@/lib/supabase/database.types";
import { isUuid } from "./queries";
import { createWeddingSchema, type ActionResult, type CreateWeddingInput } from "./schemas";

const UNIQUE_VIOLATION = "23505";
const MAX_SLUG_ATTEMPTS = 5;
/**
 * How many invitations one account may have *in progress* (an unpublished,
 * unpaid draft) at once. Published or paid invitations don't count toward this,
 * so a couple with a live site can still start a fresh draft. Keeping the
 * in-progress number at one bounds uploaded draft media per account and pairs
 * with the 14-day cleanup of abandoned drafts.
 */
const MAX_DRAFTS = 1;

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

  // Cap invitations still *in progress* — unpublished, unpaid drafts. Published
  // or paid ones (published_at / active_until set) don't count, so a couple
  // with a live site can start a new draft without removing it.
  const { count } = await supabase
    .from("weddings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .eq("status", "draft")
    .is("published_at", null)
    .is("active_until", null);
  if ((count ?? 0) >= MAX_DRAFTS) {
    const limit = MAX_DRAFTS === 1 ? "one invitation" : `${MAX_DRAFTS} invitations`;
    return { ok: false, error: `You can have ${limit} in progress at a time. Publish or remove it before starting another.` };
  }

  const base = suggestSlug(partnerOne, partnerTwo);

  // The unique index is the source of truth; retry with a random suffix on
  // collision instead of a racy "is it taken?" pre-check.
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    // always a random suffix: addresses must not be guessable from names
    const slug = withRandomSuffix(base);
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
      await seedStarterContent(supabase, data.id, templateId, partnerOne, partnerTwo, weddingDate);
      revalidatePath("/dashboard");
      return { ok: true, data: { id: data.id } };
    }
    if (error.code !== UNIQUE_VIOLATION) {
      const limited = limitError(error);
      if (limited) return limited;
      console.error("createWedding failed", error);
      return { ok: false, error: "We couldn't create your wedding. Please try again." };
    }
  }
  return { ok: false, error: "We couldn't find a free web address. Please try again." };
}

/**
 * Fills a brand-new wedding with starter content — the SAME full design the
 * shop preview shows (story, the day's programme, questions, the reply, a
 * ceremony + reception, and the hero + gallery photos) — so "Use this design"
 * opens the complete, editable invitation, identical to the preview, instead
 * of a near-empty one. The couple then edit each part and swap the placeholder
 * photos for their own. The sample story is personalised with the couple's
 * names; event times follow their date when they gave one. The photos are
 * curated library references (not uploaded files), so they cost no storage.
 * Best-effort: any failure here is logged and never fails the creation —
 * everything can still be added in the editor.
 */
async function seedStarterContent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  weddingId: string,
  templateId: string,
  partnerOne: string,
  partnerTwo: string,
  weddingDate: string | null,
): Promise<void> {
  try {
    const sample = sampleBundle(templateId);
    const p1 = partnerOne.trim() || "Emma";
    const p2 = partnerTwo.trim() || "James";
    const personalise = (text: string) => text.replaceAll("Emma", p1).replaceAll("James", p2);

    // The new wedding's timezone (its settings row is created by a trigger with the wedding).
    const { data: settings } = await supabase.from("wedding_settings").select("timezone").eq("wedding_id", weddingId).single();
    const tz = settings?.timezone ?? "Africa/Cairo";
    const START_TIME: Record<string, string> = { ceremony: "15:00", reception: "18:00" };

    const sections = sample.sections.map((s) => {
      const base = s.content as Record<string, unknown>;
      const content = typeof base.body === "string" ? { ...base, body: personalise(base.body) } : base;
      return { wedding_id: weddingId, type: s.type, enabled: s.enabled, sort_order: s.sort_order, content: content as Json };
    });
    const events = sample.events.map((e) => ({
      wedding_id: weddingId,
      kind: e.kind,
      title: e.title,
      starts_at: weddingDate ? zonedTimeToIso(weddingDate, START_TIME[e.kind] ?? "15:00", tz) : null,
      ends_at: null,
      venue_name: e.venue_name,
      address: e.address,
      latitude: e.latitude,
      longitude: e.longitude,
      map_url: e.map_url,
      description: e.description,
      sort_order: e.sort_order,
    }));

    // Hero + gallery photos (curated library references, so no stored files),
    // so the new invitation shows the same photos as the preview until the
    // couple swap in their own.
    const media = sample.media.map((m) => ({
      wedding_id: weddingId,
      kind: m.kind,
      purpose: m.purpose,
      storage_path: m.storage_path,
      alt_text: m.alt_text,
      width: m.width,
      height: m.height,
      sort_order: m.sort_order,
    }));

    const [sectionsRes, eventsRes, mediaRes] = await Promise.all([
      supabase.from("wedding_sections").insert(sections),
      supabase.from("events").insert(events),
      supabase.from("media").insert(media),
    ]);
    if (sectionsRes.error) console.error("seedStarterContent sections failed", sectionsRes.error);
    if (eventsRes.error) console.error("seedStarterContent events failed", eventsRes.error);
    if (mediaRes.error) console.error("seedStarterContent media failed", mediaRes.error);
  } catch (e) {
    console.error("seedStarterContent threw", e);
  }
}

/**
 * Publish or unpublish. RLS ensures only owners/editors can do this, and the
 * database only lets an invitation go live once it is paid for.
 */
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

  if (error?.code === "P0402") {
    // Database rule: an invitation goes live only after payment.
    return { ok: false, error: "Payment is needed first. Open Publish in the editor to place your order." };
  }
  if (error) {
    console.error("setWeddingPublished failed", error);
    return { ok: false, error: "We couldn't update the wedding. Please try again." };
  }
  if (!data) return { ok: false, error: "You don't have permission to publish this wedding." };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/weddings/${weddingId}`);
  revalidatePath(`/w/${data.slug}`);
  // Refresh the public design cache so the (un)publish shows for guests at once.
  updateTag(invitationTag(data.slug));
  return { ok: true };
}

/**
 * Permanently removes an invitation the current user owns, and everything under
 * it (sections, events, guests, replies, media rows…) via ON DELETE CASCADE.
 * RLS ("weddings: owner deletes") ensures only the owner can. Irreversible.
 */
export async function deleteWedding(weddingId: string): Promise<ActionResult> {
  if (!isUuid(weddingId)) return { ok: false, error: "Invitation not found." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has expired. Please log in again." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("weddings").delete().eq("id", weddingId).select("id").maybeSingle();
  if (error) {
    console.error("deleteWedding failed", error);
    return { ok: false, error: "We couldn't remove this invitation. Please try again." };
  }
  if (!data) return { ok: false, error: "You don't have permission to remove this invitation." };

  revalidatePath("/dashboard");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "@/lib/zod";
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
 * Fills a brand-new wedding with starter content — the same sample the shop
 * preview shows (story, the day's programme, questions, the reply, and a
 * ceremony + reception) — so "Use this design" opens a full, editable
 * invitation instead of a near-empty one. The sample story is personalised
 * with the couple's names; venues, times and photos are left as editable
 * placeholders (the couple sets their own in the editor, so event times stay
 * blank and the gallery stays off until they add photos). Best-effort: any
 * failure here is logged and never fails the creation — everything can still
 * be added in the editor.
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

    const [sectionsRes, eventsRes] = await Promise.all([
      supabase.from("wedding_sections").insert(sections),
      supabase.from("events").insert(events),
    ]);
    if (sectionsRes.error) console.error("seedStarterContent sections failed", sectionsRes.error);
    if (eventsRes.error) console.error("seedStarterContent events failed", eventsRes.error);
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
  return { ok: true };
}

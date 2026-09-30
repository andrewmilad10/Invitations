"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zonedTimeToIso } from "@/core/i18n/format";
import { isSectionType, SECTION_DEFINITIONS, validateSectionContent, type SectionType } from "@/core/sections/registry";
import { themeOverridesSchema } from "@/core/theme/tokens";
import { slugSchema } from "@/core/wedding/slug";
import { getCurrentUser } from "@/features/auth/session";
import { isStoragePath, MEDIA_BUCKET } from "@/features/media/urls";
import type { ActionResult } from "@/features/weddings/schemas";
import { isUuid } from "@/features/weddings/queries";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { isSelectableTemplateId } from "@/templates/registry";
import { detailsSchema, eventSchema, registerMediaSchema, settingsSchema, type EventInput } from "./schemas";

/**
 * Editor mutations. Every action: checks the session, validates input with
 * Zod, and writes with the user's client — RLS is the authority on whether
 * the user may edit this wedding. A write that affects no rows means "no
 * permission".
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;

type Failure = { ok: false; error: string; fieldErrors?: Record<string, string[]> };
const NO_ACCESS: Failure = { ok: false, error: "You don't have permission to edit this wedding." };
const FAILED = (what: string): Failure => ({ ok: false, error: `We couldn't save ${what}. Please try again.` });

async function context(weddingId: string) {
  if (!isUuid(weddingId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  return { supabase: await createClient(), user };
}

function invalid(error: z.ZodError): Failure {
  return { ok: false, error: "Please check the highlighted fields.", fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]> };
}

async function touch(supabase: Supabase, weddingId: string) {
  // The public page renders per request, so this is future-proofing for when
  // it is cached (see docs/roadmap.md).
  const { data } = await supabase.from("weddings").select("slug").eq("id", weddingId).maybeSingle();
  if (data) revalidatePath(`/w/${data.slug}`);
}

// ── Wedding details ─────────────────────────────────────────────────────────

export async function updateDetails(weddingId: string, input: z.input<typeof detailsSchema>): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;
  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { data, error } = await ctx.supabase
    .from("weddings")
    .update({
      partner_one_name: parsed.data.partnerOne,
      partner_two_name: parsed.data.partnerTwo,
      wedding_date: parsed.data.weddingDate,
    })
    .eq("id", weddingId)
    .select("slug")
    .maybeSingle();
  if (error) return FAILED("your details");
  if (!data) return NO_ACCESS;
  revalidatePath(`/w/${data.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTemplate(weddingId: string, templateId: string): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;
  if (!isSelectableTemplateId(templateId)) return { ok: false, error: "Unknown template." };
  const { data, error } = await ctx.supabase.from("weddings").update({ template_id: templateId }).eq("id", weddingId).select("slug").maybeSingle();
  if (error) return FAILED("the template");
  if (!data) return NO_ACCESS;
  revalidatePath(`/w/${data.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateSlug(weddingId: string, rawSlug: string): Promise<ActionResult<{ slug: string }>> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;
  const parsed = slugSchema.safeParse(rawSlug);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid address.", fieldErrors: { slug: parsed.error.issues.map((i) => i.message) } };

  const { data: before } = await ctx.supabase.from("weddings").select("slug").eq("id", weddingId).maybeSingle();
  const { data, error } = await ctx.supabase.from("weddings").update({ slug: parsed.data }).eq("id", weddingId).select("slug").maybeSingle();
  if (error?.code === "23505") return { ok: false, error: "That address is already taken.", fieldErrors: { slug: ["That address is already taken."] } };
  if (error) return FAILED("the address");
  if (!data) return NO_ACCESS;
  if (before) revalidatePath(`/w/${before.slug}`);
  revalidatePath(`/w/${data.slug}`);
  revalidatePath("/dashboard");
  return { ok: true, data: { slug: data.slug } };
}

// ── Settings & theme ────────────────────────────────────────────────────────

export async function updateSettings(weddingId: string, input: z.input<typeof settingsSchema>): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { data, error } = await ctx.supabase
    .from("wedding_settings")
    .update({
      locale: parsed.data.locale,
      timezone: parsed.data.timezone,
      visibility: parsed.data.visibility,
      music_enabled: parsed.data.musicEnabled,
    })
    .eq("wedding_id", weddingId)
    .select("wedding_id")
    .maybeSingle();
  if (error) return FAILED("your settings");
  if (!data) return NO_ACCESS;
  await touch(ctx.supabase, weddingId);
  return { ok: true };
}

export async function updateTheme(weddingId: string, overrides: unknown): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;
  const parsed = themeOverridesSchema.strict().safeParse(overrides);
  if (!parsed.success) return { ok: false, error: "Some theme values are invalid." };
  const { data, error } = await ctx.supabase
    .from("wedding_themes")
    .update({ tokens: parsed.data as Json })
    .eq("wedding_id", weddingId)
    .select("wedding_id")
    .maybeSingle();
  if (error) return FAILED("the theme");
  if (!data) return NO_ACCESS;
  await touch(ctx.supabase, weddingId);
  return { ok: true };
}

// ── Sections ────────────────────────────────────────────────────────────────

export async function saveSection(
  weddingId: string,
  type: string,
  patch: { enabled?: boolean; content?: unknown },
): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;
  if (!isSectionType(type)) return { ok: false, error: "Unknown section." };

  const row: { wedding_id: string; type: SectionType; enabled?: boolean; content?: Json } = { wedding_id: weddingId, type };
  if (patch.enabled !== undefined) {
    if (!patch.enabled && !SECTION_DEFINITIONS[type].canDisable) return { ok: false, error: "This section can't be turned off." };
    row.enabled = Boolean(patch.enabled);
  }
  if (patch.content !== undefined) {
    const parsed = validateSectionContent(type, patch.content);
    if (!parsed.success) return invalid(parsed.error);
    row.content = parsed.data as Json;
  }

  // Upsert only the provided columns; sort_order stays NULL (template order)
  // unless the couple has reordered.
  const { data, error } = await ctx.supabase
    .from("wedding_sections")
    .upsert(row, { onConflict: "wedding_id,type" })
    .select("id")
    .maybeSingle();
  if (error?.code === "42501") return NO_ACCESS;
  if (error) return FAILED("this section");
  if (!data) return NO_ACCESS;
  await touch(ctx.supabase, weddingId);
  return { ok: true };
}

/** Persists a custom order for the given section types (null order = reset to template default). */
export async function saveSectionOrder(weddingId: string, order: string[] | null): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;

  if (order === null) {
    const { error } = await ctx.supabase.from("wedding_sections").update({ sort_order: null }).eq("wedding_id", weddingId);
    if (error) return FAILED("the order");
    await touch(ctx.supabase, weddingId);
    return { ok: true };
  }

  const types = order.filter(isSectionType);
  if (types.length !== order.length || new Set(types).size !== types.length) return { ok: false, error: "Invalid order." };

  const rows = types.map((type, i) => ({ wedding_id: weddingId, type, sort_order: (i + 1) * 10 }));
  const { data, error } = await ctx.supabase.from("wedding_sections").upsert(rows, { onConflict: "wedding_id,type" }).select("id");
  if (error?.code === "42501") return NO_ACCESS;
  if (error) return FAILED("the order");
  if (!data?.length) return NO_ACCESS;
  await touch(ctx.supabase, weddingId);
  return { ok: true };
}

// ── Events (ceremony / reception) ───────────────────────────────────────────

export async function saveEvent(weddingId: string, input: EventInput): Promise<ActionResult<{ id: string | null }>> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const e = parsed.data;

  const { data: settings } = await ctx.supabase.from("wedding_settings").select("timezone").eq("wedding_id", weddingId).maybeSingle();
  if (!settings) return NO_ACCESS;
  const startsAt = e.date ? zonedTimeToIso(e.date, e.time ?? "00:00", settings.timezone) : null;

  const values = {
    title: e.title,
    starts_at: startsAt,
    venue_name: e.venueName,
    address: e.address,
    map_url: e.mapUrl,
    description: e.description,
  };
  const isEmpty = !e.date && !e.venueName && !e.address && !e.mapUrl && !e.description;

  const { data: existing } = await ctx.supabase
    .from("events")
    .select("id")
    .eq("wedding_id", weddingId)
    .eq("kind", e.kind)
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  if (existing && isEmpty) {
    // Clearing every field removes the event (and hides its section).
    const { error } = await ctx.supabase.from("events").delete().eq("id", existing.id);
    if (error) return FAILED("the event");
    await touch(ctx.supabase, weddingId);
    return { ok: true, data: { id: null } };
  }
  if (!existing && isEmpty) return { ok: true, data: { id: null } };

  const result = existing
    ? await ctx.supabase.from("events").update(values).eq("id", existing.id).select("id").maybeSingle()
    : await ctx.supabase
        .from("events")
        .insert({ ...values, wedding_id: weddingId, kind: e.kind, sort_order: e.kind === "ceremony" ? 0 : 1 })
        .select("id")
        .maybeSingle();

  if (result.error?.code === "42501") return NO_ACCESS;
  if (result.error) return FAILED("the event");
  if (!result.data) return NO_ACCESS;
  await touch(ctx.supabase, weddingId);
  return { ok: true, data: { id: result.data.id } };
}

// ── Media ───────────────────────────────────────────────────────────────────

/**
 * Records a file the browser has just uploaded to Storage (the upload itself
 * is authorised by Storage RLS). Hero and music are single-slot: the previous
 * file is replaced.
 */
export async function registerMedia(
  weddingId: string,
  input: z.input<typeof registerMediaSchema>,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await context(weddingId);
  if (!ctx) return NO_ACCESS;
  const parsed = registerMediaSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const m = parsed.data;

  const expectedPrefix = `weddings/${weddingId}/${m.purpose}/`;
  if (!m.storagePath.startsWith(expectedPrefix) || m.storagePath.slice(expectedPrefix.length).includes("/")) {
    return { ok: false, error: "Invalid file location." };
  }

  const replaced: { id: string; storage_path: string }[] = [];
  if (m.purpose === "hero" || m.purpose === "music") {
    const { data } = await ctx.supabase.from("media").select("id, storage_path").eq("wedding_id", weddingId).eq("purpose", m.purpose);
    replaced.push(...(data ?? []));
  }

  let sortOrder = 0;
  if (m.purpose === "gallery") {
    const { data: last } = await ctx.supabase
      .from("media")
      .select("sort_order")
      .eq("wedding_id", weddingId)
      .eq("purpose", "gallery")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (last?.sort_order ?? -1) + 1;
  }

  const { data, error } = await ctx.supabase
    .from("media")
    .insert({
      wedding_id: weddingId,
      kind: m.purpose === "music" ? "audio" : "image",
      purpose: m.purpose,
      storage_path: m.storagePath,
      alt_text: m.altText,
      width: m.width,
      height: m.height,
      sort_order: sortOrder,
    })
    .select("id")
    .single();
  if (error?.code === "42501") return NO_ACCESS;
  if (error) return FAILED("the file");

  if (replaced.length) {
    await ctx.supabase.from("media").delete().in("id", replaced.map((r) => r.id));
    const files = replaced.map((r) => r.storage_path).filter(isStoragePath);
    if (files.length) await ctx.supabase.storage.from(MEDIA_BUCKET).remove(files);
  }
  await touch(ctx.supabase, weddingId);
  return { ok: true, data: { id: data.id } };
}

export async function deleteMedia(weddingId: string, mediaId: string): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx || !isUuid(mediaId)) return NO_ACCESS;
  const { data, error } = await ctx.supabase
    .from("media")
    .delete()
    .eq("id", mediaId)
    .eq("wedding_id", weddingId)
    .select("storage_path")
    .maybeSingle();
  if (error) return FAILED("the change");
  if (!data) return NO_ACCESS;
  // Row first, then file: a failed file removal leaves an orphan (cleaned up
  // later), never a row pointing at a missing file.
  if (isStoragePath(data.storage_path)) await ctx.supabase.storage.from(MEDIA_BUCKET).remove([data.storage_path]);
  await touch(ctx.supabase, weddingId);
  return { ok: true };
}

export async function updateMediaAlt(weddingId: string, mediaId: string, altText: string): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx || !isUuid(mediaId)) return NO_ACCESS;
  const alt = z.string().trim().max(300).safeParse(altText);
  if (!alt.success) return { ok: false, error: "Description is too long." };
  const { data, error } = await ctx.supabase.from("media").update({ alt_text: alt.data }).eq("id", mediaId).eq("wedding_id", weddingId).select("id").maybeSingle();
  if (error) return FAILED("the description");
  if (!data) return NO_ACCESS;
  return { ok: true };
}

export async function reorderGallery(weddingId: string, mediaIds: string[]): Promise<ActionResult> {
  const ctx = await context(weddingId);
  if (!ctx || !mediaIds.every(isUuid)) return NO_ACCESS;
  const results = await Promise.all(
    mediaIds.map((id, index) =>
      ctx.supabase.from("media").update({ sort_order: index }).eq("id", id).eq("wedding_id", weddingId).eq("purpose", "gallery").select("id").maybeSingle(),
    ),
  );
  if (results.some((r) => r.error)) return FAILED("the order");
  await touch(ctx.supabase, weddingId);
  return { ok: true };
}

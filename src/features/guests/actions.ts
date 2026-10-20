"use server";

import { z } from "@/lib/zod";
import { parsePastedGuests } from "@/core/guests/summary";
import type { GuestRow } from "@/lib/supabase/database.types";
import { limitError } from "@/lib/supabase/limit-error";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/session";
import { isUuid } from "@/features/weddings/queries";

/**
 * The couple's changes to their guest list. Every action re-checks the session
 * and validates input; Row Level Security decides whether this user may
 * change this wedding (owner or editor).
 */

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
const NO_ACCESS = { ok: false as const, error: "You don't have access to change this guest list." };
const FAILED = { ok: false as const, error: "That didn't save. Please try again." };

async function ctx(weddingId: string) {
  if (!isUuid(weddingId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  return createClient();
}

const groups = z.array(z.string().trim().min(1).max(40)).max(10);
const guestFields = z.object({
  name: z.string().trim().min(1, "Write the guest's name.").max(120),
  greeting: z.string().trim().max(60).nullable().optional(),
  message: z.string().trim().max(300).nullable().optional(),
  groups: groups.optional(),
  maxParty: z.number().int().min(1).max(20).nullable().optional(),
});

/** One guest, typed in the form. */
export async function addGuest(weddingId: string, input: z.input<typeof guestFields>): Promise<Result<GuestRow>> {
  const supabase = await ctx(weddingId);
  if (!supabase) return NO_ACCESS;
  const p = guestFields.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Please check the guest." };
  const { data, error } = await supabase
    .from("guests")
    .insert({ wedding_id: weddingId, name: p.data.name, greeting: p.data.greeting || null, message: p.data.message || null, groups: p.data.groups ?? [], max_party: p.data.maxParty ?? null })
    .select("*")
    .single();
  if (error?.code === "42501") return NO_ACCESS;
  if (limitError(error)) return limitError(error)!;
  if (error || !data) return FAILED;
  return { ok: true, data };
}

/** Many guests from a pasted list or a spreadsheet column; names already listed are skipped. */
export async function addGuestList(weddingId: string, text: string): Promise<Result<{ added: GuestRow[]; duplicates: number }>> {
  const supabase = await ctx(weddingId);
  if (!supabase) return NO_ACCESS;
  if (typeof text !== "string" || text.length > 200_000) return { ok: false, error: "That list is too long. Add up to 1,000 names at a time." };
  const existing = await supabase.from("guests").select("name").eq("wedding_id", weddingId).limit(3000);
  if (existing.error) return FAILED;
  const parsed = parsePastedGuests(text, existing.data.map((g) => g.name));
  if (!parsed.add.length) return { ok: true, data: { added: [], duplicates: parsed.duplicates } };
  const { data, error } = await supabase
    .from("guests")
    .insert(parsed.add.map((g) => ({ wedding_id: weddingId, name: g.name, groups: g.groups })))
    .select("*");
  if (error?.code === "42501") return NO_ACCESS;
  if (limitError(error)) return limitError(error)!;
  if (error || !data) return FAILED;
  return { ok: true, data: { added: data, duplicates: parsed.duplicates } };
}

/** Change one guest's name, greeting, message, groups or own limit. */
export async function updateGuest(weddingId: string, guestId: string, input: Partial<z.input<typeof guestFields>>): Promise<Result<GuestRow>> {
  const supabase = await ctx(weddingId);
  if (!supabase || !isUuid(guestId)) return NO_ACCESS;
  const p = guestFields.partial().safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Please check the guest." };
  const patch: { name?: string; greeting?: string | null; message?: string | null; groups?: string[]; max_party?: number | null } = {};
  if (p.data.name !== undefined) patch.name = p.data.name;
  if (p.data.greeting !== undefined) patch.greeting = p.data.greeting || null;
  if (p.data.message !== undefined) patch.message = p.data.message || null;
  if (p.data.groups !== undefined) patch.groups = p.data.groups;
  if (p.data.maxParty !== undefined) patch.max_party = p.data.maxParty;
  const { data, error } = await supabase.from("guests").update(patch).eq("id", guestId).eq("wedding_id", weddingId).select("*").maybeSingle();
  if (error || !data) return error ? (limitError(error) ?? FAILED) : NO_ACCESS;
  return { ok: true, data };
}

/** Remove guests (their personal links stop working and their replies go with them). */
export async function deleteGuests(weddingId: string, guestIds: string[]): Promise<Result> {
  const supabase = await ctx(weddingId);
  if (!supabase) return NO_ACCESS;
  const ids = guestIds.filter(isUuid).slice(0, 1000);
  if (!ids.length) return { ok: true, data: undefined };
  const { error } = await supabase.from("guests").delete().eq("wedding_id", weddingId).in("id", ids);
  return error ? FAILED : { ok: true, data: undefined };
}

/** Remove a reply that came through the general link. */
export async function deleteReply(weddingId: string, replyId: string): Promise<Result> {
  const supabase = await ctx(weddingId);
  if (!supabase || !isUuid(replyId)) return NO_ACCESS;
  const { error } = await supabase.from("replies").delete().eq("wedding_id", weddingId).eq("id", replyId);
  return error ? FAILED : { ok: true, data: undefined };
}

/** Hide or show a wish on the invitation, or delete it. */
export async function setWishHidden(weddingId: string, wishId: string, hidden: boolean): Promise<Result> {
  const supabase = await ctx(weddingId);
  if (!supabase || !isUuid(wishId)) return NO_ACCESS;
  const { error } = await supabase.from("wishes").update({ hidden: Boolean(hidden) }).eq("wedding_id", weddingId).eq("id", wishId);
  return error ? FAILED : { ok: true, data: undefined };
}
export async function deleteWish(weddingId: string, wishId: string): Promise<Result> {
  const supabase = await ctx(weddingId);
  if (!supabase || !isUuid(wishId)) return NO_ACCESS;
  const { error } = await supabase.from("wishes").delete().eq("wedding_id", weddingId).eq("id", wishId);
  return error ? FAILED : { ok: true, data: undefined };
}

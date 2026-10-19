"use server";

import { headers } from "next/headers";
import { isSupabaseConfigured } from "@/config/env";
import { replyInput, wishInput, type ReplyInput, type ReplyResult, type WishInput, type WishResult } from "@/core/replies/schema";
import { createAnonClient } from "@/lib/supabase/server";

/**
 * Guest-side writes: a reply and a wish. They go through the public database
 * functions as the anonymous role (no session, no elevated key), which only
 * accept published invitations and re-check every value. Nothing personal is
 * logged.
 */

// A light brake per visitor and invitation, per server instance.
const recent = new Map<string, number[]>();
function tooMany(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > limit;
}
async function visitor(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

export async function submitReply(input: ReplyInput): Promise<ReplyResult> {
  const parsed = replyInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.path[0] === "name" ? "name" : "invalid" };
  if (!isSupabaseConfigured()) return { ok: false, error: "closed" };
  const r = parsed.data;
  if (tooMany(`r:${await visitor()}:${r.slug}`, 20, 10 * 60_000)) return { ok: false, error: "busy" };

  const { data, error } = await createAnonClient().rpc("submit_reply", {
    p_slug: r.slug,
    p_token: r.token,
    p_name: r.name,
    p_attending: r.attending,
    p_party: r.partySize,
    p_note: r.note || null,
    p_answers: r.answers,
  });
  if (error || !data || typeof data !== "object") return { ok: false, error: "failed" };
  const res = data as { ok?: boolean; error?: string; partySize?: number };
  return res.ok ? { ok: true, partySize: Number(res.partySize ?? 0) } : { ok: false, error: res.error ?? "failed" };
}

export async function submitWish(input: WishInput): Promise<WishResult> {
  const parsed = wishInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  if (!isSupabaseConfigured()) return { ok: false, error: "closed" };
  const w = parsed.data;
  if (tooMany(`w:${await visitor()}:${w.slug}`, 6, 10 * 60_000)) return { ok: false, error: "busy" };

  const { data, error } = await createAnonClient().rpc("submit_wish", { p_slug: w.slug, p_name: w.name, p_message: w.message });
  if (error || !data || typeof data !== "object") return { ok: false, error: "failed" };
  const res = data as { ok?: boolean; error?: string; pending?: boolean };
  return res.ok ? { ok: true, pending: res.pending !== false } : { ok: false, error: res.error ?? "failed" };
}

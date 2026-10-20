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
/**
 * Cloudflare Turnstile check for general-link forms (personal links skip it).
 * Only when both keys are set; Cloudflare is asked with the secret key.
 */
async function passesBotCheck(token: string | null | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, ...(ip !== "unknown" ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    return Boolean(((await res.json()) as { success?: boolean }).success);
  } catch {
    // If Cloudflare can't be reached, the per-visitor and per-invitation limits still apply.
    return true;
  }
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
  const ip = await visitor();
  if (tooMany(`r:${ip}:${r.slug}`, 20, 10 * 60_000)) return { ok: false, error: "busy" };
  if (!r.token && !(await passesBotCheck(r.captcha, ip))) return { ok: false, error: "check" };

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
  const ip = await visitor();
  if (tooMany(`w:${ip}:${w.slug}`, 6, 10 * 60_000)) return { ok: false, error: "busy" };
  if (!(await passesBotCheck(w.captcha, ip))) return { ok: false, error: "check" };

  const { data, error } = await createAnonClient().rpc("submit_wish", { p_slug: w.slug, p_name: w.name, p_message: w.message });
  if (error || !data || typeof data !== "object") return { ok: false, error: "failed" };
  const res = data as { ok?: boolean; error?: string; pending?: boolean };
  return res.ok ? { ok: true, pending: res.pending !== false } : { ok: false, error: res.error ?? "failed" };
}

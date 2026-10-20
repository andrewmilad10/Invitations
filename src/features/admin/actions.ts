"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_METHODS, STAFF_ROLES } from "./types";

/**
 * Admin changes. Each one validates every value with Zod, then calls a
 * database function that checks the caller's session and staff role and
 * writes the change to the activity log (one round trip). The browser
 * decides nothing. revalidatePath sends the updated admin pages back with
 * the action's own response, so the browser needs no separate refresh.
 */
type Result = { ok: true } | { ok: false; error: string };
const uuid = z.string().uuid();
const DENIED: Result = { ok: false, error: "You don't have permission to do that." };
const FAILED_TEXT = "That didn't go through. Please try again.";
const FAILED: Result = { ok: false, error: FAILED_TEXT };

async function run(fn: string, args: Record<string, unknown>): Promise<Result> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(fn as never, args as never);
  if (error) return error.code === "42501" ? DENIED : FAILED;
  const res = data as { ok?: boolean; error?: string } | null;
  if (!res?.ok) return { ok: false, error: res?.error ?? FAILED_TEXT };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

const sale = z.object({
  weddingId: uuid,
  amount: z.coerce.number().min(0).max(1_000_000),
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(120).optional().default(""),
  note: z.string().trim().max(500).optional().default(""),
  months: z.coerce.number().int().min(0).max(36),
  publish: z.boolean(),
});
export async function recordSale(input: z.input<typeof sale>): Promise<Result> {
  const p = sale.safeParse(input);
  if (!p.success) return { ok: false, error: "Please check the amount and payment method." };
  const v = p.data;
  return run("admin_record_sale", {
    p_wedding: v.weddingId,
    p_amount: v.amount,
    p_method: v.method,
    p_reference: v.reference || null,
    p_note: v.note || null,
    p_months: v.months,
    p_publish: v.publish,
  });
}

export async function refundSale(orderId: string, deactivate: boolean): Promise<Result> {
  if (!uuid.safeParse(orderId).success) return DENIED;
  return run("admin_refund", { p_order: orderId, p_deactivate: Boolean(deactivate) });
}

export async function setDeactivated(weddingId: string, off: boolean, reason: string): Promise<Result> {
  if (!uuid.safeParse(weddingId).success) return DENIED;
  const r = z.string().trim().max(300).safeParse(reason ?? "");
  if (!r.success) return { ok: false, error: "Keep the reason under 300 characters." };
  return run("admin_set_deactivated", { p_wedding: weddingId, p_off: Boolean(off), p_reason: r.data || null });
}

export async function extendWedding(weddingId: string, days: number): Promise<Result> {
  if (!uuid.safeParse(weddingId).success) return DENIED;
  const d = z.number().int().min(-365).max(3650).refine((n) => n !== 0).safeParse(days);
  if (!d.success) return { ok: false, error: "Choose between -365 and 3650 days." };
  return run("admin_extend", { p_wedding: weddingId, p_days: d.data });
}

export async function setStaff(email: string, role: string): Promise<Result> {
  const e = z.string().trim().email().max(254).safeParse(email);
  if (!e.success) return { ok: false, error: "Enter a valid email address." };
  const r = z.union([z.enum(STAFF_ROLES), z.literal("")]).safeParse(role);
  if (!r.success) return { ok: false, error: "Unknown role." };
  return run("admin_set_staff", { p_email: e.data, p_role: r.data || null });
}

// ── Orders ──────────────────────────────────────────────────────────────────
const paid = z.object({
  orderId: uuid,
  amount: z.coerce.number().min(0).max(1_000_000),
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(120).optional().default(""),
});
export async function markOrderPaid(input: z.input<typeof paid>): Promise<Result> {
  const p = paid.safeParse(input);
  if (!p.success) return { ok: false, error: "Please check the amount and payment method." };
  return run("admin_mark_paid", { p_order: p.data.orderId, p_amount: p.data.amount, p_method: p.data.method, p_reference: p.data.reference || null });
}

export async function cancelOrder(orderId: string, reason: string): Promise<Result> {
  if (!uuid.safeParse(orderId).success) return DENIED;
  return run("admin_cancel_order", { p_order: orderId, p_reason: z.string().trim().max(300).catch("").parse(reason) || null });
}

export async function addOrderComment(orderId: string, text: string): Promise<Result> {
  const t = z.string().trim().min(1).max(1000).safeParse(text);
  if (!uuid.safeParse(orderId).success || !t.success) return { ok: false, error: "Write a comment of up to 1,000 characters." };
  return run("admin_order_note", { p_order: orderId, p_text: t.data });
}

export async function setOrderTags(orderId: string, tags: string[]): Promise<Result> {
  const t = z.array(z.string().trim().min(1).max(30)).max(10).safeParse(tags);
  if (!uuid.safeParse(orderId).success || !t.success) return { ok: false, error: "Up to 10 tags of 30 characters each." };
  return run("admin_set_order_tags", { p_order: orderId, p_tags: t.data });
}

export async function archiveOrder(orderId: string, archived: boolean): Promise<Result> {
  if (!uuid.safeParse(orderId).success) return DENIED;
  return run("admin_archive_order", { p_order: orderId, p_archived: Boolean(archived) });
}

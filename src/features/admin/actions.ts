"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_METHODS, STAFF_ROLES } from "./types";

/**
 * Admin changes. Each one re-checks the session here, validates every value
 * with Zod, and then calls a database function that checks the staff role
 * again and writes the change to the activity log. The browser decides
 * nothing.
 */
type Result = { ok: true } | { ok: false; error: string };
const uuid = z.string().uuid();
const DENIED: Result = { ok: false, error: "You don't have permission to do that." };
const FAILED_TEXT = "That didn't go through. Please try again.";
const FAILED: Result = { ok: false, error: FAILED_TEXT };

async function run(fn: string, args: Record<string, unknown>): Promise<Result> {
  if (!(await getCurrentUser())) return DENIED;
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

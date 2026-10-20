"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { orderBrief, placeOrderSchema, publishState, type OrderBrief, type PayTo, type PublishState } from "./types";

/**
 * The couple's side of ordering. Prices, order numbers and who may order are
 * decided in the database (request_publish); these only validate input and
 * pass it on with the couple's own session.
 */
type Fail = { ok: false; error: string };
const AGAIN = "That didn't go through. Please check your connection and try again.";

function payTo(): PayTo {
  const v = (s: string | undefined) => (s && s.trim() ? s.trim() : null);
  return { instapay: v(process.env.PAY_INSTAPAY), wallet: v(process.env.PAY_WALLET), whatsapp: v(process.env.PAY_WHATSAPP) };
}

export async function loadPublishState(weddingId: string): Promise<{ ok: true; state: PublishState; payTo: PayTo } | Fail> {
  if (!z.string().uuid().safeParse(weddingId).success) return { ok: false, error: "Invitation not found." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_publish_state", { p_wedding: weddingId });
  if (error || !data) return { ok: false, error: error ? AGAIN : "Invitation not found." };
  const parsed = publishState.safeParse(data);
  return parsed.success ? { ok: true, state: parsed.data, payTo: payTo() } : { ok: false, error: AGAIN };
}

export async function placeOrder(input: z.input<typeof placeOrderSchema>): Promise<{ ok: true; paid: boolean; order: OrderBrief | null } | Fail> {
  const p = placeOrderSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Please check your details." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("request_publish", { p_wedding: p.data.weddingId, p_phone: p.data.phone, p_method: p.data.method });
  if (error) return { ok: false, error: AGAIN };
  const res = data as { ok?: boolean; error?: string; paid?: boolean; order?: unknown };
  if (!res?.ok) return { ok: false, error: res?.error ?? AGAIN };
  const order = res.order ? orderBrief.safeParse(res.order) : null;
  revalidatePath("/dashboard");
  return { ok: true, paid: Boolean(res.paid), order: order?.success ? order.data : null };
}

export async function cancelMyOrder(orderId: string): Promise<{ ok: true } | Fail> {
  if (!z.string().uuid().safeParse(orderId).success) return { ok: false, error: "Order not found." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancel_my_order", { p_order: orderId });
  if (error) return { ok: false, error: AGAIN };
  const res = data as { ok?: boolean; error?: string };
  if (!res?.ok) return { ok: false, error: res?.error ?? AGAIN };
  revalidatePath("/dashboard");
  return { ok: true };
}

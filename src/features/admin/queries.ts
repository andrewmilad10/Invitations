import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  activityRow,
  alertRow,
  reminderRow,
  orderDetail,
  orderPage,
  overview,
  salePage,
  staffMe,
  staffRow,
  weddingPage,
  type StaffMe,
  type OrderTab,
  type StaffRole,
  type WeddingFilter,
} from "./types";
import { z } from "@/lib/zod";

/**
 * Admin reads. Every one runs with the signed-in user's own session and goes
 * through a database function that checks their staff role first, so a page
 * can't show anything the database wouldn't allow. Pages call `requireStaff`
 * before anything else: someone who isn't staff gets a plain 404, so the admin
 * area doesn't even reveal that it exists.
 */
export const getStaff = cache(async (): Promise<StaffMe | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_me");
  if (error || !data) return null;
  const parsed = staffMe.safeParse(data);
  return parsed.success ? parsed.data : null;
});

/**
 * No separate sign-in round trip: the proxy already sends signed-out visitors
 * to /login, and `admin_me` reads the same verified session in the database
 * (a missing or expired session simply isn't staff).
 */
export async function requireStaff(roles: readonly StaffRole[] = ["owner", "admin", "marketing"]): Promise<StaffMe> {
  const me = await getStaff();
  if (!me || !roles.includes(me.role)) notFound();
  // Staff must also have entered their authenticator code this session.
  if (!me.verified) redirect("/admin/verify");
  return me;
}

async function call<T>(fn: Parameters<Awaited<ReturnType<typeof createClient>>["rpc"]>[0], args: Record<string, unknown>, schema: z.ZodType<T>): Promise<T> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(fn as never, args as never);
  if (error) {
    if (error.code === "42501") notFound();
    if (error.code === "P0401") redirect("/admin/verify");
    throw new Error("The admin data could not be loaded.");
  }
  return schema.parse(data);
}

export const SALES_PAGE = 100;

/**
 * Pages start these together with `requireStaff` (Promise.all): every admin
 * function checks the role itself, so nothing is shown that the database
 * wouldn't allow, and the page waits for one database round trip, not two.
 */
export const loadOverview = (days: number) => call("admin_overview", { p_days: days }, overview);
export const loadWeddings = (filter: WeddingFilter, search: string, page: number, size = 25) =>
  call("admin_list_weddings", { p_filter: filter, p_search: search || null, p_limit: size, p_offset: page * size }, weddingPage);
export const loadSales = (search: string, page: number, size = SALES_PAGE) =>
  call("admin_list_sales", { p_search: search || null, p_limit: size, p_offset: page * size }, salePage);
export const loadStaff = () => call("admin_list_staff", {}, z.array(staffRow));
export const loadActivity = (limit = 200) => call("admin_activity", { p_limit: limit }, z.array(activityRow));

/**
 * Security alerts (owner and admin only). Asked for in parallel with the
 * overview before the role is known, so for marketing it simply comes back
 * empty instead of failing the page.
 */
export async function loadAlerts(days = 7) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_alerts", { p_days: days });
  if (error) return [];
  const parsed = z.array(alertRow).safeParse(data);
  return parsed.success ? parsed.data : [];
}

/** Renewal reminders queued by the nightly job (owner and admin; empty for others). */
export async function loadReminders() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_reminders");
  if (error) return [];
  const parsed = z.array(reminderRow).safeParse(data);
  return parsed.success ? parsed.data : [];
}

export const ORDERS_PAGE = 50;
export const loadOrders = (tab: OrderTab, search: string, page: number) =>
  call("admin_list_orders", { p_tab: tab, p_search: search || null, p_limit: ORDERS_PAGE, p_offset: page * ORDERS_PAGE }, orderPage);
/** One order with its customer, invitation and timeline; null if it doesn't exist. */
export const loadOrder = (id: string) => call("admin_get_order", { p_order: id }, orderDetail.nullable());

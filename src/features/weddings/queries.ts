import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type WeddingSummary = Pick<
  Tables<"weddings">,
  "id" | "slug" | "partner_one_name" | "partner_two_name" | "wedding_date" | "template_id" | "status" | "published_at" | "updated_at"
>;

const SUMMARY_COLUMNS =
  "id, slug, partner_one_name, partner_two_name, wedding_date, template_id, status, published_at, updated_at";

/** Weddings the current user can access (RLS limits this to their memberships). */
export async function listMyWeddings(): Promise<WeddingSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weddings")
    .select(SUMMARY_COLUMNS)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Could not load weddings: ${error.message}`);
  return data;
}

/** A single wedding, or null if it doesn't exist or the user has no access. */
export async function getWedding(weddingId: string): Promise<WeddingSummary | null> {
  if (!isUuid(weddingId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("weddings").select(SUMMARY_COLUMNS).eq("id", weddingId).maybeSingle();
  if (error) throw new Error(`Could not load wedding: ${error.message}`);
  return data;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

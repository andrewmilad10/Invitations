import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type WeddingSummary = Pick<
  Tables<"weddings">,
  "id" | "slug" | "partner_one_name" | "partner_two_name" | "wedding_date" | "template_id" | "status" | "published_at" | "updated_at" | "active_until" | "deactivated_at" | "created_at"
>;

const SUMMARY_COLUMNS =
  "id, slug, partner_one_name, partner_two_name, wedding_date, template_id, status, published_at, updated_at, active_until, deactivated_at, created_at";

/**
 * How long an untouched draft is kept before the nightly cleanup removes it.
 * Mirrors `private.job_delete_expired_drafts()` in the draft-retention
 * migration — keep the two in step.
 */
export const DRAFT_RETENTION_DAYS = 14;

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

export type WeddingCard = WeddingSummary & {
  themeTokens: Record<string, unknown>;
  daysLeft: number | null;
  /** Paid for and not turned off: the couple can publish it themselves. */
  paid: boolean;
  /** The couple's order waiting for payment, if any. */
  openOrder: { number: number; amount: number; currency: string } | null;
  /**
   * For an abandoned-able draft (never published, never paid), when it was
   * started, the date it will be removed, and how many days remain. Null for
   * anything that is published or has a live period, which is never removed.
   */
  draftExpiry: { createdAt: string; removeOn: string; daysLeft: number } | null;
};

/**
 * Dashboard cards: summaries, theme overrides (for the thumbnails) and open
 * orders. RLS limits each query to what this user may see, so the three run
 * at the same time (one round trip) instead of one after another.
 */
export async function listMyWeddingCards(): Promise<WeddingCard[]> {
  const supabase = await createClient();
  const [weddings, themes, orders] = await Promise.all([
    listMyWeddings(),
    supabase.from("wedding_themes").select("wedding_id, tokens"),
    supabase.from("orders").select("wedding_id, number, amount, currency").eq("status", "pending"),
  ]);
  if (weddings.length === 0) return [];
  if (themes.error) throw new Error(`Could not load themes: ${themes.error.message}`);
  const tokens = new Map((themes.data ?? []).map((t) => [t.wedding_id, (t.tokens ?? {}) as Record<string, unknown>]));
  // Orders are optional on the dashboard: if they fail to load, cards still show.
  const open = new Map((orders.data ?? []).map((o) => [o.wedding_id, { number: Number(o.number), amount: Number(o.amount), currency: o.currency }]));
  const now = Date.now();
  return weddings.map((w) => {
    const daysLeft = w.active_until ? Math.ceil((new Date(w.active_until).getTime() - now) / 86_400_000) : null;
    // A draft is only ever removed while it has never been published and has no
    // live period — matches the nightly job's WHERE clause.
    let draftExpiry: WeddingCard["draftExpiry"] = null;
    if (w.status === "draft" && !w.published_at && !w.active_until && w.created_at) {
      const created = new Date(w.created_at).getTime();
      const removeAt = created + DRAFT_RETENTION_DAYS * 86_400_000;
      draftExpiry = {
        createdAt: w.created_at,
        removeOn: new Date(removeAt).toISOString(),
        daysLeft: Math.max(0, Math.ceil((removeAt - now) / 86_400_000)),
      };
    }
    return {
      ...w,
      themeTokens: tokens.get(w.id) ?? {},
      daysLeft,
      paid: !w.deactivated_at && daysLeft !== null && daysLeft > 0,
      openOrder: open.get(w.id) ?? null,
      draftExpiry,
    };
  });
}

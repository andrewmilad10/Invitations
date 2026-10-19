import "server-only";
import { toLocale } from "@/core/i18n/locales";
import { resolveSectionContent } from "@/core/sections/registry";
import type { GuestRow, ReplyRow, WishRow } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/session";
import { isUuid } from "@/features/weddings/queries";

export interface GuestsPageData {
  wedding: { id: string; slug: string; names: string; status: string; locale: string };
  canEdit: boolean;
  guests: GuestRow[];
  replies: ReplyRow[];
  wishes: WishRow[];
  questions: { id: string; text: string; kind: string }[];
  maxGuests: number;
  wishesOn: boolean;
}

/**
 * Everything the guest list page shows, read with the couple's own session:
 * Row Level Security returns nothing unless they are a member of the wedding.
 */
export async function loadGuestsPage(weddingId: string): Promise<GuestsPageData | "not-ready" | null> {
  if (!isUuid(weddingId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const [w, member, guests, replies, wishes, sections, settings] = await Promise.all([
    supabase.from("weddings").select("id, slug, partner_one_name, partner_two_name, status").eq("id", weddingId).maybeSingle(),
    supabase.from("wedding_members").select("role").eq("wedding_id", weddingId).eq("user_id", user.id).maybeSingle(),
    supabase.from("guests").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: true }).limit(3000),
    supabase.from("replies").select("*").eq("wedding_id", weddingId).order("updated_at", { ascending: false }).limit(5000),
    supabase.from("wishes").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }).limit(1000),
    supabase.from("wedding_sections").select("type, enabled, content").eq("wedding_id", weddingId).in("type", ["rsvp", "wishes"]),
    supabase.from("wedding_settings").select("locale").eq("wedding_id", weddingId).maybeSingle(),
  ]);
  if (w.error || !w.data) return null;
  // The guest tables arrive with migration 0008; until it is applied, say so instead of failing.
  const missing = (e: { code?: string } | null) => e?.code === "42P01" || e?.code === "PGRST205" || e?.code === "PGRST200";
  if ([guests, replies, wishes].some((r) => missing(r.error))) return "not-ready";
  for (const r of [guests, replies, wishes, sections]) if (r.error) throw new Error("Could not load the guest list.");

  const locale = toLocale(settings.data?.locale);
  const rsvpRow = sections.data?.find((s) => s.type === "rsvp");
  const rsvp = resolveSectionContent("rsvp", (rsvpRow?.content ?? undefined) as Record<string, unknown> | undefined, locale);
  const wishesRow = sections.data?.find((s) => s.type === "wishes");

  return {
    wedding: { id: w.data.id, slug: w.data.slug, names: `${w.data.partner_one_name} & ${w.data.partner_two_name}`, status: w.data.status, locale },
    canEdit: member.data?.role === "owner" || member.data?.role === "editor",
    guests: guests.data ?? [],
    replies: replies.data ?? [],
    wishes: wishes.data ?? [],
    questions: rsvp.questions.filter((q) => q.id && q.text.trim()),
    maxGuests: rsvp.maxGuests,
    wishesOn: wishesRow?.enabled ?? false,
  };
}

import { getCurrentUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * "Download my data": everything this person has given us, as one JSON
 * file: their profile, the invitations they own (with sections, events,
 * photo records, guests, replies and wishes) and their orders. Read with
 * their own session, so the database rules decide what's included.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Please log in.", { status: 401 });
  const supabase = await createClient();
  // At most 10 downloads an hour per account (the file can be large).
  const limited = await supabase.rpc("limit_action", { p_action: "data.export" });
  if (limited.error) return new Response("Too many downloads. Please try again in an hour.", { status: 429 });
  const { data: weddings } = await supabase.from("weddings").select("*").eq("owner_id", user.id);
  const ids = (weddings ?? []).map((w) => w.id);
  const none = ["00000000-0000-0000-0000-000000000000"];
  const inIds = ids.length ? ids : none;
  const [profile, settings, themes, sections, events, media, guests, replies, wishes, orders] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("wedding_settings").select("*").in("wedding_id", inIds),
    supabase.from("wedding_themes").select("*").in("wedding_id", inIds),
    supabase.from("wedding_sections").select("*").in("wedding_id", inIds),
    supabase.from("events").select("*").in("wedding_id", inIds),
    supabase.from("media").select("*").in("wedding_id", inIds),
    supabase.from("guests").select("id, wedding_id, name, greeting, message, groups, max_party, open_count, last_opened_at, created_at").in("wedding_id", inIds),
    supabase.from("replies").select("*").in("wedding_id", inIds),
    supabase.from("wishes").select("*").in("wedding_id", inIds),
    supabase.from("orders").select("number, confirmation, wedding_id, amount, currency, method, months, status, kind, created_at, paid_at, refunded_at, cancelled_at"),
  ]);
  const body = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email, createdAt: user.created_at, profile: profile.data },
    invitations: (weddings ?? []).map((w) => ({
      ...w,
      settings: settings.data?.find((s) => s.wedding_id === w.id) ?? null,
      theme: themes.data?.find((t) => t.wedding_id === w.id) ?? null,
      sections: sections.data?.filter((s) => s.wedding_id === w.id) ?? [],
      events: events.data?.filter((e) => e.wedding_id === w.id) ?? [],
      media: media.data?.filter((m) => m.wedding_id === w.id) ?? [],
      guests: guests.data?.filter((g) => g.wedding_id === w.id) ?? [],
      replies: replies.data?.filter((r) => r.wedding_id === w.id) ?? [],
      wishes: wishes.data?.filter((x) => x.wedding_id === w.id) ?? [],
    })),
    orders: orders.data ?? [],
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="vellum-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}

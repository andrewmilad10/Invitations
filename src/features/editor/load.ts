import "server-only";
import { cache } from "react";
import type { WeddingBundle } from "@/core/wedding/bundle";
import type { MemberRole } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/weddings/queries";

export interface EditorData {
  bundle: WeddingBundle;
  role: MemberRole;
}

/**
 * Loads everything the editor and preview need, as a WeddingBundle, using the
 * signed-in user's session (RLS decides access). Returns null when the wedding
 * doesn't exist or the user isn't a member.
 */
export const loadEditorData = cache(async (weddingId: string): Promise<EditorData | null> => {
  if (!isUuid(weddingId)) return null;
  const supabase = await createClient();

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id, slug, partner_one_name, partner_two_name, wedding_date, template_id, status, published_at, updated_at")
    .eq("id", weddingId)
    .maybeSingle();
  if (error) throw new Error(`Could not load wedding: ${error.message}`);
  if (!wedding) return null;

  const { data: auth } = await supabase.auth.getUser();

  const [settings, theme, sections, events, media, member] = await Promise.all([
    supabase.from("wedding_settings").select("locale, timezone, visibility, music_enabled").eq("wedding_id", weddingId).single(),
    supabase.from("wedding_themes").select("tokens").eq("wedding_id", weddingId).single(),
    supabase.from("wedding_sections").select("type, enabled, sort_order, content").eq("wedding_id", weddingId),
    supabase
      .from("events")
      .select("id, kind, title, starts_at, ends_at, venue_name, address, latitude, longitude, map_url, description, sort_order")
      .eq("wedding_id", weddingId)
      .order("sort_order"),
    supabase
      .from("media")
      .select("id, kind, purpose, storage_path, alt_text, width, height, sort_order")
      .eq("wedding_id", weddingId)
      .order("sort_order"),
    supabase.from("wedding_members").select("role").eq("wedding_id", weddingId).eq("user_id", auth.user?.id ?? "").maybeSingle(),
  ]);

  for (const result of [settings, theme, sections, events, media, member]) {
    if (result.error) throw new Error(`Could not load wedding data: ${result.error.message}`);
  }
  if (!member.data) return null;

  return {
    role: member.data.role,
    bundle: {
      wedding,
      settings: settings.data!,
      theme: { tokens: (theme.data!.tokens ?? {}) as Record<string, unknown> },
      sections: (sections.data ?? []).map((s) => ({ ...s, content: (s.content ?? {}) as Record<string, unknown> })),
      events: events.data ?? [],
      media: media.data ?? [],
    },
  };
});

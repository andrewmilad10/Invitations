import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/config/env";
import { buildInvitationModel } from "@/core/invitation/build-model";
import type { GuestGreeting, InvitationModel, PublicWish, RenderMode } from "@/core/invitation/model";
import { GUEST_TOKEN, parseGuest, parseWishes } from "@/core/replies/schema";
import { parseWeddingBundle, type WeddingBundle } from "@/core/wedding/bundle";
import { publicMediaUrl } from "@/features/media/urls";
import { createAnonClient } from "@/lib/supabase/server";
import { resolveTemplateManifest } from "@/templates/registry";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Published wedding by slug, via the public RPC (anon role, no session).
 * Returns null for unknown, unpublished or malformed slugs. Cached per
 * request so generateMetadata, the page and the OG image share one query.
 */
export const getPublicBundle = cache(async (rawSlug: string): Promise<WeddingBundle | null> => {
  const slug = decodeURIComponent(rawSlug).toLowerCase();
  if (!SLUG_PATTERN.test(slug) || slug.length > 60 || !isSupabaseConfigured()) return null;

  const { data, error } = await createAnonClient().rpc("get_public_invitation", { p_slug: slug });
  if (error) throw new Error(`Could not load invitation: ${error.message}`);
  if (!data) return null;

  const bundle = parseWeddingBundle(data);
  if (!bundle) {
    console.error("get_public_invitation returned an invalid bundle for", slug);
    return null;
  }
  return bundle;
});

/**
 * The guest a personal link was made for (?g=<code>), or null. Counts the
 * open. Unknown or malformed codes simply show the general invitation.
 */
export async function getGuest(slug: string, token: string | undefined): Promise<GuestGreeting | null> {
  if (!token || !GUEST_TOKEN.test(token) || !isSupabaseConfigured()) return null;
  const { data, error } = await createAnonClient().rpc("get_guest", { p_slug: slug.toLowerCase(), p_token: token });
  if (error || !data) return null;
  return parseGuest(data, token);
}

/** Visible wishes for a published invitation (none if the section is off). */
export async function getPublicWishes(slug: string): Promise<PublicWish[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await createAnonClient().rpc("get_public_wishes", { p_slug: slug.toLowerCase() });
  if (error) return [];
  return parseWishes(data);
}

/** Bundle → model with the wedding's selected template. */
export function toModel(bundle: WeddingBundle, mode: RenderMode, extra: { guest?: GuestGreeting | null; wishes?: PublicWish[] } = {}): InvitationModel {
  return buildInvitationModel(bundle, resolveTemplateManifest(bundle.wedding.template_id), {
    mode,
    mediaUrl: publicMediaUrl,
    guest: extra.guest,
    wishes: extra.wishes,
  });
}

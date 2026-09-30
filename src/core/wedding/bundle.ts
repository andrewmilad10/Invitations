import { z } from "zod";

/**
 * WeddingBundle — the DATA contract.
 *
 * The one shape the data layer hands to rendering. Produced by:
 *   • get_public_invitation(slug)       (public page, snake_case JSON from SQL)
 *   • loadEditorBundle(weddingId)       (editor/preview, from RLS-protected tables)
 *   • template fixtures                 (sample previews)
 * and consumed only by buildInvitationModel(). Field names mirror the
 * database columns on purpose, so no mapping layer can drift.
 */

const uuid = z.string().min(1);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nullableString = z.string().nullable().optional().transform((v) => v ?? null);
const nullableNumber = z.number().nullable().optional().transform((v) => v ?? null);

export const bundleWeddingSchema = z.object({
  id: uuid,
  slug: z.string(),
  partner_one_name: z.string(),
  partner_two_name: z.string(),
  wedding_date: isoDate.nullable(),
  template_id: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  published_at: nullableString,
  updated_at: nullableString,
});

export const bundleSettingsSchema = z.object({
  locale: z.string(),
  timezone: z.string(),
  visibility: z.enum(["public", "unlisted"]),
  music_enabled: z.boolean(),
});

export const bundleSectionSchema = z.object({
  type: z.string(),
  enabled: z.boolean(),
  /** null = template default position */
  sort_order: z.number().nullable(),
  content: z.record(z.string(), z.unknown()),
  /** Presentation hints (tone, spacing, align); see core/sections/style.ts. */
  style: z.record(z.string(), z.unknown()).optional(),
});

export const bundleEventSchema = z.object({
  id: uuid,
  kind: z.enum(["ceremony", "reception", "other"]),
  title: z.string(),
  starts_at: nullableString,
  ends_at: nullableString,
  venue_name: nullableString,
  address: nullableString,
  latitude: nullableNumber,
  longitude: nullableNumber,
  map_url: nullableString,
  description: nullableString,
  sort_order: z.number(),
});

export const bundleMediaSchema = z.object({
  id: uuid,
  kind: z.enum(["image", "audio"]),
  purpose: z.enum(["hero", "gallery", "music", "og"]),
  storage_path: z.string(),
  alt_text: z.string(),
  width: nullableNumber,
  height: nullableNumber,
  sort_order: z.number(),
});

export const weddingBundleSchema = z.object({
  wedding: bundleWeddingSchema,
  settings: bundleSettingsSchema,
  theme: z.object({ tokens: z.record(z.string(), z.unknown()) }),
  sections: z.array(bundleSectionSchema),
  events: z.array(bundleEventSchema),
  media: z.array(bundleMediaSchema),
});

export type WeddingBundle = z.infer<typeof weddingBundleSchema>;
export type BundleWedding = WeddingBundle["wedding"];
export type BundleSettings = WeddingBundle["settings"];
export type BundleSection = WeddingBundle["sections"][number];
export type BundleEvent = WeddingBundle["events"][number];
export type BundleMedia = WeddingBundle["media"][number];

/** Validate untrusted JSON (RPC result, postMessage payload) as a bundle. */
export function parseWeddingBundle(input: unknown): WeddingBundle | null {
  const result = weddingBundleSchema.safeParse(input);
  return result.success ? result.data : null;
}

import { z } from "zod";
import { isValidTimeZone } from "@/core/i18n/format";
import { LOCALES } from "@/core/i18n/locales";

const optionalText = (max: number) => z.string().trim().max(max).transform((v) => (v === "" ? null : v));

export const detailsSchema = z.object({
  partnerOne: z.string().trim().min(1, "Enter a name.").max(80),
  partnerTwo: z.string().trim().min(1, "Enter a name.").max(80),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.").nullable(),
});

export const settingsSchema = z.object({
  locale: z.enum(LOCALES),
  timezone: z.string().refine(isValidTimeZone, "Unknown time zone."),
  visibility: z.enum(["public", "unlisted"]),
  musicEnabled: z.boolean(),
});

export const eventSchema = z.object({
  kind: z.enum(["ceremony", "reception"]),
  title: z.string().trim().max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM.").nullable(),
  venueName: optionalText(160),
  address: optionalText(400),
  mapUrl: z
    .string()
    .trim()
    .max(2048)
    .refine((v) => v === "" || /^https:\/\//i.test(v), "Use a full https:// link.")
    .transform((v) => (v === "" ? null : v)),
  description: optionalText(2000),
});

export type EventInput = z.input<typeof eventSchema>;

export const MEDIA_LIMITS = {
  imageBytes: 10 * 1024 * 1024,
  audioBytes: 15 * 1024 * 1024,
  galleryMax: 30,
  imageTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  audioTypes: ["audio/mpeg", "audio/mp4", "audio/aac", "audio/ogg", "audio/wav"],
} as const;

export const registerMediaSchema = z.object({
  purpose: z.enum(["hero", "gallery", "music"]),
  storagePath: z.string().min(1).max(300),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  altText: z.string().trim().max(300),
});

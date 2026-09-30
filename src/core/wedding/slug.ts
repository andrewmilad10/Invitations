import { z } from "zod";

export const SLUG_MIN = 3;
export const SLUG_MAX = 60;

/** Paths under /w/ that must never be claimed by a wedding. */
const RESERVED = new Set(["admin", "api", "new", "edit", "preview", "dashboard", "login", "register", "settings", "www"]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN, `Use at least ${SLUG_MIN} characters.`)
  .max(SLUG_MAX, `Use at most ${SLUG_MAX} characters.`)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens.")
  .refine((s) => !RESERVED.has(s), "That address is reserved. Please choose another.");

/**
 * Turns free text into a URL slug. Latin accents are folded ("Zoë" → "zoe");
 * scripts without a Latin form (e.g. Arabic) are dropped, and the caller falls
 * back to a generated slug.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

/** Suggested slug for a couple, e.g. "andrew-and-mariam". */
export function suggestSlug(partnerOne: string, partnerTwo: string): string {
  const a = slugify(partnerOne);
  const b = slugify(partnerTwo);
  const base = a && b ? `${a}-and-${b}` : a || b;
  return base.length >= SLUG_MIN ? base.slice(0, SLUG_MAX - 5).replace(/-+$/g, "") : "";
}

/** "andrew-and-mariam" → "andrew-and-mariam-4k2q" */
export function withRandomSuffix(slug: string, random: () => number = Math.random): string {
  const suffix = Array.from({ length: 4 }, () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(random() * 30)]).join("");
  const base = (slug || "wedding").slice(0, SLUG_MAX - 5).replace(/-+$/g, "");
  return `${base}-${suffix}`;
}

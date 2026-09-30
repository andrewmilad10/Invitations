export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<Locale, { label: string; dir: "ltr" | "rtl"; intl: string }> = {
  en: { label: "English", dir: "ltr", intl: "en-GB" },
  ar: { label: "العربية", dir: "rtl", intl: "ar-EG" },
};

export function toLocale(value: unknown): Locale {
  return (LOCALES as readonly unknown[]).includes(value) ? (value as Locale) : DEFAULT_LOCALE;
}

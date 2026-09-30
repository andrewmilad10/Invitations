import { LOCALE_META, type Locale } from "./locales";

/**
 * Date/time formatting. Pure Intl — no date library.
 *
 * - `wedding_date` is a calendar date with no time zone: format it in UTC so
 *   it never shifts a day.
 * - Event instants (timestamptz) are formatted in the wedding's time zone, so
 *   guests abroad see the local ceremony time.
 */

function intl(locale: Locale) {
  return LOCALE_META[locale].intl;
}

function dateOnlyToUtc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function safeZone(tz: string) {
  return isValidTimeZone(tz) ? tz : "UTC";
}

export interface DateParts {
  weekday: string;
  day: string;
  month: string;
  year: string;
  /** e.g. "Saturday, 12 June 2027" */
  long: string;
  /** e.g. "12.06.2027" (numerals follow the locale) */
  short: string;
}

export function formatDateOnly(date: string, locale: Locale): DateParts {
  const d = dateOnlyToUtc(date);
  const tag = intl(locale);
  const part = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(tag, { timeZone: "UTC", ...opts }).format(d);
  return {
    weekday: part({ weekday: "long" }),
    day: part({ day: "numeric" }),
    month: part({ month: "long" }),
    year: part({ year: "numeric" }),
    long: part({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    short: part({ day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "."),
  };
}

/** "5:00 pm" / "٥:٠٠ م" in the wedding's time zone (12-hour, as invitations are written). */
export function formatTime(instant: string, locale: Locale, timeZone: string): string {
  return new Intl.DateTimeFormat(intl(locale), {
    timeZone: safeZone(timeZone),
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
  }).format(new Date(instant));
}

/** Calendar date (YYYY-MM-DD) of an instant in the given zone. */
export function dateInZone(instant: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Offset of a zone at a given instant, in minutes east of UTC (Cairo summer: 180). */
export function zoneOffsetMinutes(timeZone: string, at: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: safeZone(timeZone), timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  const match = name?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

/**
 * ISO instant for a local wall-clock date+time in a zone.
 * zonedTimeToIso("2027-06-12", "17:00", "Africa/Cairo") → "2027-06-12T14:00:00.000Z"
 */
export function zonedTimeToIso(date: string, time: string, timeZone: string): string {
  const naive = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}Z`);
  // Two passes handle DST transitions correctly.
  let offset = zoneOffsetMinutes(timeZone, naive);
  let utc = new Date(naive.getTime() - offset * 60_000);
  const second = zoneOffsetMinutes(timeZone, utc);
  if (second !== offset) {
    offset = second;
    utc = new Date(naive.getTime() - offset * 60_000);
  }
  return utc.toISOString();
}

/** "HH:MM" wall-clock time of an instant in a zone (for editor inputs). */
export function timeInZone(instant: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: safeZone(timeZone),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("hour")}:${get("minute")}`;
}

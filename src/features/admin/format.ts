const TZ = "Africa/Cairo";
const money = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });
const count = new Intl.NumberFormat("en-GB");
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const dayTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ });

export const fmtMoney = (n: number | null | undefined) => (n == null ? "—" : money.format(n));
export const fmtCount = (n: number) => count.format(n);
export const fmtDay = (iso: string | null | undefined) => (iso ? day.format(new Date(iso)) : "—");
const time = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const ymd = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });
export const fmtTime = (iso: string) => time.format(new Date(iso));

/** "Today", "Yesterday" or the date, by Cairo calendar day. */
export function dayLabel(iso: string, now = new Date()) {
  const d = ymd.format(new Date(iso));
  if (d === ymd.format(now)) return "Today";
  if (d === ymd.format(new Date(now.getTime() - 86_400_000))) return "Yesterday";
  return day.format(new Date(iso));
}
export const fmtDayTime = (iso: string | null | undefined) => (iso ? dayTime.format(new Date(iso)) : "—");

/** Cells that could be read as a formula by a spreadsheet are prefixed with ' (CSV injection). */
export function csvCell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

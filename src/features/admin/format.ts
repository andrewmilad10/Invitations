const TZ = "Africa/Cairo";
const money = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });
const count = new Intl.NumberFormat("en-GB");
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const dayTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ });

export const fmtMoney = (n: number | null | undefined) => (n == null ? "—" : money.format(n));
export const fmtCount = (n: number) => count.format(n);
export const fmtDay = (iso: string | null | undefined) => (iso ? day.format(new Date(iso)) : "—");
export const fmtDayTime = (iso: string | null | undefined) => (iso ? dayTime.format(new Date(iso)) : "—");

import { z } from "zod";

/**
 * Shapes of what the admin database functions return (0014), checked on the
 * way in so a page never renders something unexpected. Money and customer
 * emails are null for the marketing role: the database leaves them out.
 */
export const STAFF_ROLES = ["owner", "admin", "marketing"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export const PAYMENT_METHODS = ["instapay", "vodafone_cash", "cash", "bank_transfer", "card", "paymob", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const METHOD_LABEL: Record<PaymentMethod, string> = {
  instapay: "InstaPay",
  vodafone_cash: "Vodafone Cash",
  cash: "Cash",
  bank_transfer: "Bank transfer",
  card: "Card",
  paymob: "Paymob",
  other: "Other",
};

export const staffMe = z.object({ role: z.enum(STAFF_ROLES), email: z.string().nullable() });
export type StaffMe = z.infer<typeof staffMe>;

const num = z.coerce.number();
const numOrNull = z.coerce.number().nullable();

export const overview = z.object({
  role: z.enum(STAFF_ROLES),
  totals: z.object({
    accounts: num,
    accountsNew: num,
    weddings: num,
    weddingsNew: num,
    published: num,
    live: num,
    expiringSoon: num,
    expired: num,
    deactivated: num,
    paidWeddings: num,
    sales: num,
    salesPeriod: num,
    revenue: numOrNull,
    revenuePeriod: numOrNull,
    refunds: numOrNull,
    guests: num,
    replies: num,
    days: num,
  }),
  daily: z.array(z.object({ day: z.string(), sales: num, revenue: numOrNull, accounts: num, weddings: num })),
  designs: z.array(z.object({ template_id: z.string(), weddings: num, published: num, sales: num })),
});
export type Overview = z.infer<typeof overview>;

export const weddingRow = z.object({
  id: z.string(),
  slug: z.string(),
  names: z.string(),
  templateId: z.string(),
  status: z.string(),
  weddingDate: z.string().nullable(),
  createdAt: z.string(),
  publishedAt: z.string().nullable(),
  activeUntil: z.string().nullable(),
  deactivatedAt: z.string().nullable(),
  deactivatedReason: z.string().nullable(),
  ownerEmail: z.string().nullable(),
  paidTotal: numOrNull,
  sales: num,
  lastPaidAt: z.string().nullable(),
  guests: num,
  replies: num,
});
export type AdminWedding = z.infer<typeof weddingRow>;
export const weddingPage = z.object({ total: num, rows: z.array(weddingRow) });

export const saleRow = z.object({
  id: z.string(),
  weddingId: z.string().nullable(),
  slug: z.string().nullable(),
  names: z.string().nullable(),
  templateId: z.string().nullable(),
  buyerEmail: z.string().nullable(),
  amount: num,
  currency: z.string(),
  method: z.string(),
  reference: z.string().nullable(),
  note: z.string().nullable(),
  months: num,
  status: z.enum(["paid", "refunded"]),
  paidAt: z.string(),
  refundedAt: z.string().nullable(),
  recordedBy: z.string().nullable(),
});
export type AdminSale = z.infer<typeof saleRow>;
export const salePage = z.object({ total: num, paid: num, revenue: num, rows: z.array(saleRow) });

export const staffRow = z.object({ userId: z.string(), email: z.string().nullable(), role: z.enum(STAFF_ROLES), since: z.string() });
export type StaffRow = z.infer<typeof staffRow>;

export const activityRow = z.object({
  at: z.string(),
  actor: z.string().nullable(),
  action: z.string(),
  targetType: z.string().nullable(),
  targetId: z.string().nullable(),
  details: z.record(z.string(), z.unknown()),
});
export type ActivityRow = z.infer<typeof activityRow>;

export const WEDDING_FILTERS = ["all", "live", "expiring", "expired", "deactivated", "paid", "unpaid", "draft"] as const;
export type WeddingFilter = (typeof WEDDING_FILTERS)[number];

/** Whole days from now until `iso` (negative when past), or null. */
export function daysLeft(iso: string | null, now = Date.now()): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - now) / 86_400_000);
}

export const canSeeMoney = (role: StaffRole) => role === "owner" || role === "admin";
export const canManageTeam = (role: StaffRole) => role === "owner";

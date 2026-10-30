import { z } from "@/lib/zod";

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

export const staffMe = z.object({
  role: z.enum(STAFF_ROLES),
  email: z.string().nullable(),
  name: z.string().nullable().optional(),
  /** This session passed two-step login (an authenticator code). */
  verified: z.boolean().optional().default(false),
});
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
    pendingOrders: num.default(0),
    pendingAmount: numOrNull.default(null),
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

/**
 * Draft lifecycle, kept apart from the staff activity feed (it's what couples
 * and the nightly cleanup did, not staff). Counts over all time, plus the most
 * recent events — each one survives the draft's own deletion.
 */
export const DRAFT_EVENTS = ["draft.created", "draft.published", "draft.deleted_user", "draft.expired"] as const;
export type DraftEvent = (typeof DRAFT_EVENTS)[number];
export const draftStats = z
  .record(z.string(), num)
  .transform((raw) => Object.fromEntries(DRAFT_EVENTS.map((e) => [e, raw[e] ?? 0])) as Record<DraftEvent, number>);
export type DraftStats = z.infer<typeof draftStats>;

export const draftLogRow = z.object({
  at: z.string(),
  action: z.enum(DRAFT_EVENTS),
  names: z.string().nullable(),
  slug: z.string().nullable(),
  actor: z.string().nullable(),
});
export type DraftLogRow = z.infer<typeof draftLogRow>;

export const WEDDING_FILTERS = ["all", "live", "expiring", "expired", "deactivated", "paid", "unpaid", "draft"] as const;
export type WeddingFilter = (typeof WEDDING_FILTERS)[number];

/** Whole days from now until `iso` (negative when past), or null. */
export function daysLeft(iso: string | null, now = Date.now()): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - now) / 86_400_000);
}

export const canSeeMoney = (role: StaffRole) => role === "owner" || role === "admin";
export const canManageTeam = (role: StaffRole) => role === "owner";

export const today = z.object({
  role: z.enum(STAFF_ROLES),
  nowHour: num,
  live: num,
  salesToday: num,
  revenueToday: numOrNull,
  ordersToday: num,
  accountsToday: num,
  weddingsToday: num,
  repliesToday: num,
  pendingOrders: num,
  pendingAmount: numOrNull,
  expiringSoon: num,
  hours: z.array(z.object({ hour: num, sales: num, revenue: numOrNull, orders: num })),
});
export type Today = z.infer<typeof today>;

export const alertRow = z.object({
  at: z.string(),
  actor: z.string().nullable(),
  action: z.string(),
  targetType: z.string().nullable(),
  targetId: z.string().nullable(),
  text: z.string(),
});
export type AlertRow = z.infer<typeof alertRow>;

export const reminderRow = z.object({
  id: num,
  weddingId: z.string(),
  slug: z.string(),
  names: z.string(),
  endsAt: z.string(),
  queuedAt: z.string(),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  customerEmail: z.string().nullable(),
});
export type ReminderRow = z.infer<typeof reminderRow>;

// ── Orders (0018) ───────────────────────────────────────────────────────────
export const ORDER_TABS = ["all", "pending", "notLive", "paid", "refunded", "cancelled", "archived"] as const;
export type OrderTab = (typeof ORDER_TABS)[number];
export const ORDER_TAB_LABEL: Record<OrderTab, string> = {
  all: "All",
  pending: "Payment pending",
  notLive: "Not live yet",
  paid: "Paid",
  refunded: "Refunded",
  cancelled: "Cancelled",
  archived: "Archived",
};
export const ORDER_STATUS = ["pending", "paid", "refunded", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];
export const LIVE_STATES = ["live", "notLive", "ended", "off"] as const;
export type LiveState = (typeof LIVE_STATES)[number];

export const orderRow = z.object({
  id: z.string(),
  number: num,
  confirmation: z.string(),
  status: z.enum(ORDER_STATUS),
  amount: num,
  currency: z.string(),
  method: z.string(),
  kind: z.enum(["new", "renewal"]),
  source: z.enum(["customer", "staff", "paymob"]),
  createdAt: z.string(),
  paidAt: z.string().nullable(),
  tags: z.array(z.string()),
  archived: z.boolean(),
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  customerPhone: z.string().nullable(),
  weddingId: z.string().nullable(),
  slug: z.string().nullable(),
  templateId: z.string().nullable(),
  names: z.string().nullable(),
  live: z.enum(LIVE_STATES).nullable(),
});
export type AdminOrder = z.infer<typeof orderRow>;
export const orderPage = z.object({
  total: num,
  counts: z.object(Object.fromEntries(ORDER_TABS.map((t) => [t, num])) as Record<OrderTab, typeof num>),
  rows: z.array(orderRow),
});

export const orderEvent = z.object({
  at: z.string(),
  kind: z.enum(["placed", "confirmation", "paid", "live", "cancelled", "refunded", "archived", "unarchived", "comment"]),
  message: z.string(),
  actor: z.string().nullable(),
});
export type OrderEvent = z.infer<typeof orderEvent>;

export const orderDetail = z.object({
  order: z.object({
    id: z.string(),
    number: num,
    confirmation: z.string(),
    status: z.enum(ORDER_STATUS),
    amount: num,
    currency: z.string(),
    method: z.string(),
    months: num,
    kind: z.enum(["new", "renewal"]),
    createdAt: z.string(),
    paidAt: z.string().nullable(),
    reference: z.string().nullable(),
    note: z.string().nullable(),
    source: z.enum(["customer", "staff", "paymob"]),
    tags: z.array(z.string()),
    refundedAt: z.string().nullable(),
    cancelledAt: z.string().nullable(),
    cancelReason: z.string().nullable(),
    archived: z.boolean(),
    recordedBy: z.string().nullable(),
  }),
  customer: z.object({
    id: z.string().nullable(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    orders: num,
    nth: num,
  }),
  wedding: z
    .object({
      id: z.string(),
      slug: z.string(),
      names: z.string(),
      templateId: z.string(),
      status: z.string(),
      weddingDate: z.string().nullable(),
      activeUntil: z.string().nullable(),
      deactivatedAt: z.string().nullable(),
    })
    .nullable(),
  events: z.array(orderEvent),
});
export type OrderDetail = z.infer<typeof orderDetail>;

/** "1st", "2nd", "3rd", "11th"… */
export function ordinal(n: number) {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${s}`;
}

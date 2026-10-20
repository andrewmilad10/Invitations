import { z } from "zod";

/** How a couple can say they'll pay (staff confirm the money arrived). */
export const CUSTOMER_METHODS = ["instapay", "vodafone_cash", "other"] as const;
export type CustomerMethod = (typeof CUSTOMER_METHODS)[number];
export const CUSTOMER_METHOD_LABEL: Record<CustomerMethod, string> = {
  instapay: "InstaPay",
  vodafone_cash: "Vodafone Cash",
  other: "Another way",
};

const num = z.union([z.number(), z.string()]).transform(Number);

export const orderBrief = z.object({
  id: z.string(),
  number: num,
  confirmation: z.string(),
  status: z.enum(["pending", "paid", "refunded", "cancelled"]),
  amount: num,
  currency: z.string(),
  method: z.string(),
  months: num,
  kind: z.enum(["new", "renewal"]),
  createdAt: z.string(),
  paidAt: z.string().nullable(),
});
export type OrderBrief = z.infer<typeof orderBrief>;

export const publishState = z.object({
  price: num,
  currency: z.string(),
  months: num,
  canPublish: z.boolean(),
  activeUntil: z.string().nullable(),
  turnedOff: z.boolean(),
  order: orderBrief.nullable(),
});
export type PublishState = z.infer<typeof publishState>;

/** Where couples send money; any of these may be missing (see .env.example). */
export type PayTo = { instapay: string | null; wallet: string | null; whatsapp: string | null };

/** Egyptian mobile numbers and international numbers; spaces and dashes allowed. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine((v) => /^\+?[0-9]{8,15}$/.test(v), "Please enter a WhatsApp number we can reach you on.");

export const placeOrderSchema = z.object({
  weddingId: z.string().uuid(),
  phone: phoneSchema,
  method: z.enum(CUSTOMER_METHODS),
});

export const fmtPrice = (amount: number, currency = "EGP") => `${currency} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount)}`;

/** A wa.me link: digits only, Egyptian 01… numbers become 201…. */
export function waLink(phone: string, text: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("01") && d.length === 11) d = `2${d}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

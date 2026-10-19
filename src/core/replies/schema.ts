import { z } from "zod";
import type { GuestGreeting, PublicWish } from "../invitation/model";

/**
 * What guests send and what the public functions return, validated at the
 * server boundary. The database checks everything again (submit_reply,
 * submit_wish); these give friendly errors before the round trip.
 */

export const GUEST_TOKEN = /^[0-9a-f]{32}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const clean = (max: number) => z.string().transform((s) => s.replace(/\s+/g, " ").trim()).pipe(z.string().max(max));

export const replyInput = z.object({
  slug: z.string().max(60).regex(SLUG),
  token: z.string().regex(GUEST_TOKEN).nullable(),
  name: clean(120),
  attending: z.boolean(),
  partySize: z.number().int().min(0).max(20),
  note: z.string().max(500).transform((s) => s.trim()),
  answers: z.record(z.string().max(24), z.string().max(300)).refine((a) => Object.keys(a).length <= 6, "Too many answers."),
}).refine((r) => r.token !== null || r.name.length > 0, { message: "Please write your name.", path: ["name"] });
export type ReplyInput = z.input<typeof replyInput>;

export const wishInput = z.object({
  slug: z.string().max(60).regex(SLUG),
  name: clean(80).pipe(z.string().min(1, "Please write your name.")),
  message: z.string().transform((s) => s.trim()).pipe(z.string().min(1, "Please write a few words.").max(500, "Please keep it under 500 characters.")),
});
export type WishInput = z.input<typeof wishInput>;

export type ReplyResult = { ok: true; partySize: number } | { ok: false; error: string };
export type WishResult = { ok: true; pending?: boolean } | { ok: false; error: string };

const guestRow = z.object({
  name: z.string(),
  greeting: z.string().nullable(),
  message: z.string().nullable(),
  maxParty: z.number().int().nullable(),
  reply: z
    .object({
      attending: z.boolean(),
      partySize: z.number().int(),
      note: z.string().nullable(),
      answers: z.record(z.string(), z.string()).catch({}),
    })
    .nullable(),
});

/** get_guest(...) → the greeting for a personal link, or null. */
export function parseGuest(data: unknown, token: string): GuestGreeting | null {
  const parsed = guestRow.safeParse(data);
  return parsed.success ? { token, ...parsed.data } : null;
}

const wishRows = z.array(z.object({ name: z.string(), message: z.string(), at: z.string() }));

/** get_public_wishes(...) → visible wishes, or none. */
export function parseWishes(data: unknown): PublicWish[] {
  const parsed = wishRows.safeParse(data);
  return parsed.success ? parsed.data : [];
}

/** Friendly words for the codes the database returns. */
export function replyErrorText(code: string, ar: boolean): string {
  const en: Record<string, string> = {
    closed: "Replies aren't open for this invitation.",
    guest: "This link isn't valid any more. Please ask the couple for a new one.",
    name: "Please write your name.",
    full: "Replies are full for this invitation. Please contact the couple.",
    invalid: "Please check what you wrote and try again.",
    busy: "Too many tries in a short time. Please wait a minute and try again.",
    offline: "No connection. Check your internet and press send again.",
  };
  const arabic: Record<string, string> = {
    closed: "تأكيد الحضور غير متاح لهذه الدعوة.",
    guest: "هذا الرابط لم يعد صالحًا. اطلبوا رابطًا جديدًا من العروسين.",
    name: "من فضلكم اكتبوا اسمكم.",
    full: "اكتمل عدد الردود لهذه الدعوة. تواصلوا مع العروسين.",
    invalid: "راجعوا ما كتبتم وحاولوا مرة أخرى.",
    busy: "محاولات كثيرة في وقت قصير. انتظروا دقيقة ثم حاولوا مجددًا.",
    offline: "لا يوجد اتصال. تحققوا من الإنترنت واضغطوا إرسال مرة أخرى.",
  };
  const dict = ar ? arabic : en;
  return dict[code] ?? (ar ? "حدث خطأ. حاولوا مرة أخرى." : "Something went wrong. Please try again.");
}

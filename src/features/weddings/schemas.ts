import { z } from "zod";

const name = (label: string) =>
  z.string().trim().min(1, `Enter ${label}.`).max(80, "Use at most 80 characters.");

export const createWeddingSchema = z.object({
  partnerOne: name("the first name"),
  partnerTwo: name("the second name"),
  weddingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
    .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), "Choose a valid date.")
    .nullable(),
  templateId: z.string().min(1, "Choose a template."),
});

export type CreateWeddingInput = z.input<typeof createWeddingSchema>;

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

import type { InvitationModel } from "@/core/invitation/model";
import type { SectionType } from "@/core/sections/registry";

/** 1 → "I", 14 → "XIV". */
export function roman(n: number): string {
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let rest = Math.max(0, Math.floor(n));
  for (const [value, symbol] of table) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }
  return out;
}

const UNNUMBERED: SectionType[] = ["hero", "footer"];

/**
 * A section's position among the numbered sections the couple has switched
 * on (1-based), so "Chapter III" or "Room 03" always follows the real order.
 */
export function sectionNumber(model: InvitationModel, type: SectionType): number {
  const numbered = model.sections.filter((s) => !UNNUMBERED.includes(s.type));
  return numbered.findIndex((s) => s.type === type) + 1;
}

/** "03" */
export const twoDigits = (n: number) => String(n).padStart(2, "0");

/** Season of a yyyy-mm-dd date (northern hemisphere), in English. */
export function season(date: string | null): string | null {
  if (!date) return null;
  const m = Number(date.slice(5, 7));
  return m <= 2 || m === 12 ? "Winter" : m <= 5 ? "Spring" : m <= 8 ? "Summer" : "Autumn";
}

/** A tiny, stable hash (for decorative patterns such as barcodes). */
export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

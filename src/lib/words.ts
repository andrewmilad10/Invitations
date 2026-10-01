/**
 * Joins words the way a person writes them: "floral", "floral and luxury",
 * "floral, luxury and traditional". The first word is capitalised when
 * `sentence` is set.
 */
export function listWords(words: readonly string[], { sentence = false, lower = true }: { sentence?: boolean; lower?: boolean } = {}): string {
  const w = words.map((x) => (lower ? x.toLowerCase() : x)).filter(Boolean);
  const text = w.length <= 1 ? (w[0] ?? "") : `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}`;
  return sentence && text ? text[0].toUpperCase() + text.slice(1) : text;
}

import type { WeddingBundle } from "@/core/wedding/bundle";

/** Messages between the editor (parent) and the preview iframe. Same-origin only. */
export type PreviewMessage =
  | { type: "vellum:preview-ready" }
  | { type: "vellum:bundle"; bundle: WeddingBundle }
  | { type: "vellum:replay-opening" }
  /** Editor → preview: highlight and scroll to a section (null clears). */
  | { type: "vellum:focus-section"; section: string | null }
  /** Preview → editor: the visitor clicked a section. */
  | { type: "vellum:section-clicked"; section: string };

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  return typeof data === "object" && data !== null && typeof (data as { type?: unknown }).type === "string" && (data as { type: string }).type.startsWith("vellum:");
}

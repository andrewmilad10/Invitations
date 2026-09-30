"use client";

import { LivePreviewFrame } from "@/features/preview/live-preview-frame";
import { useEditor } from "./editor-context";

/** The editor's live preview: the working bundle, before it is saved. */
export function PreviewPane({ className }: { className?: string }) {
  const { previewUrl, bundle } = useEditor();
  return <LivePreviewFrame src={previewUrl} bundle={bundle} className={className} />;
}

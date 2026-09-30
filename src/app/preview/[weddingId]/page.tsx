import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { loadEditorData } from "@/features/editor/load";
import { PreviewClient } from "@/features/editor/preview-client";
import { buildPreviewModel } from "@/features/editor/preview-model";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/**
 * Private preview of a wedding (draft or published) for its members. Used as
 * the editor's live-preview iframe and as the full-page "Preview" link.
 */
export default async function PreviewPage(props: PageProps<"/preview/[weddingId]">) {
  const { weddingId } = await props.params;
  await requireUser(`/preview/${weddingId}`);
  const data = await loadEditorData(weddingId);
  if (!data) notFound();
  return <PreviewClient initialBundle={data.bundle} initialModel={buildPreviewModel(data.bundle)} />;
}

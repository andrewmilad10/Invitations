import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicEnv } from "@/config/env";
import { EditorProvider } from "@/features/editor/editor-context";
import { EditorShell } from "@/features/editor/editor-shell";
import { loadEditorData } from "@/features/editor/load";

export async function generateMetadata(props: PageProps<"/dashboard/weddings/[weddingId]">): Promise<Metadata> {
  const { weddingId } = await props.params;
  const data = await loadEditorData(weddingId);
  return { title: data ? `Edit · ${data.bundle.wedding.partner_one_name} & ${data.bundle.wedding.partner_two_name}` : "Edit wedding" };
}

export default async function EditWeddingPage(props: PageProps<"/dashboard/weddings/[weddingId]">) {
  const { weddingId } = await props.params;
  const { panel } = await props.searchParams;
  const data = await loadEditorData(weddingId);
  if (!data) notFound();

  return (
    <EditorProvider weddingId={weddingId} role={data.role} siteUrl={publicEnv.siteUrl} initialBundle={data.bundle}>
      <EditorShell initialPanel={typeof panel === "string" ? panel : undefined} />
    </EditorProvider>
  );
}

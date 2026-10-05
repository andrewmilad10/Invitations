import type { Metadata } from "next";
import { CreateWeddingWizard } from "@/features/weddings/components/create-wedding-wizard";
import { toTemplateOption } from "@/features/weddings/components/template-option";
import { DEFAULT_NEW_TEMPLATE_ID, selectableTemplates } from "@/templates/registry";

export const metadata: Metadata = { title: "Create wedding" };

export default function NewWeddingPage() {
  const templates = selectableTemplates().map(toTemplateOption);
  return (
    <main className="px-4 py-12">
      <CreateWeddingWizard templates={templates} defaultTemplateId={DEFAULT_NEW_TEMPLATE_ID} />
    </main>
  );
}

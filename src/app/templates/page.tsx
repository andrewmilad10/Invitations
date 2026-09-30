import type { Metadata } from "next";
import { DesignGallery } from "@/features/marketing/gallery/design-gallery";
import { parseFilters } from "@/features/marketing/gallery/filters";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";
import { selectableTemplates } from "@/templates/registry";

export const metadata: Metadata = {
  title: "Wedding invitation designs",
  description:
    "Browse original wedding invitation designs — floral, elegant, minimalist, monogram, rustic, photo and more — in dozens of colours. Preview any design and customise it free, no account needed.",
};

export default async function TemplatesPage(props: PageProps<"/templates">) {
  const filters = parseFilters(await props.searchParams);
  const templates = selectableTemplates();

  return (
    <>
      <SiteHeader />
      <main className="px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl font-light leading-[1.02] sm:text-7xl">Wedding invitations</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {templates.length} original designs, each in several colours. Every one becomes a full wedding website with your story, schedule, venues and photos — customise it free, no account needed.
            </p>
          </div>
          <DesignGallery templates={templates} initialFilters={filters} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

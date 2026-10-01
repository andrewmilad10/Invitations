import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageTransition } from "@/components/page-transition";
import { cardOptionsFromQuery } from "@/core/card/options";
import { FONTS } from "@/core/theme/fonts";
import { CardDetail } from "@/features/marketing/cards/card-detail";
import { productHref, productOf, templatesFor } from "@/features/marketing/products";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";
import { TemplateCard } from "@/features/marketing/template-card";
import { listWords } from "@/lib/words";
import { getTemplateManifest, selectableTemplates } from "@/templates/registry";

export function generateStaticParams() {
  return templatesFor("cards", selectableTemplates()).map((t) => ({ templateId: t.id }));
}

export async function generateMetadata(props: PageProps<"/invitations/[templateId]">): Promise<Metadata> {
  const { templateId } = await props.params;
  const t = getTemplateManifest(templateId);
  if (!t) return { title: "Design not found" };
  return {
    title: `${t.name} — wedding invitation card`,
    description: `${t.description} Choose your colour, silhouette, foil and paper, then personalise it free.`,
  };
}

/** A card design's product page. */
export default async function InvitationCardPage(props: PageProps<"/invitations/[templateId]">) {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();
  const q = await props.searchParams;
  const palette = typeof q.palette === "string" ? q.palette : null;
  // Website layouts have their own page.
  if (productOf(template) !== "cards") redirect(productHref("websites", template.id, palette ? `palette=${palette}` : ""));
  const initialPalette = template.palettes.find((p) => p.id === palette)?.id ?? template.palettes[0].id;

  const cards = templatesFor("cards", selectableTemplates());
  const variants = template.family ? cards.filter((t) => t.family === template.family) : [template];
  const similar = [
    ...cards.filter((t) => !variants.includes(t) && t.categories[0] === template.categories[0]),
    ...cards.filter((t) => !variants.includes(t) && t.categories[0] !== template.categories[0] && t.categories.some((c) => template.categories.includes(c))),
  ].slice(0, 4);
  const fonts = template.themeDefaults.fonts;

  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className="pb-24 pt-6 md:pb-0 sm:pt-10">
          <CardDetail template={template} variants={variants} initialPalette={initialPalette} initialOptions={cardOptionsFromQuery(q)} />

          <section data-stagger="140" className="mx-auto grid max-w-[88rem] gap-12 border-t px-5 py-20 sm:px-8 md:grid-cols-3">
            <div>
              <h2 className="font-serif text-3xl font-light">About this design</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{template.description}</p>
              <p className="mt-4 text-sm text-muted-foreground">Style: {listWords(template.categories)}.</p>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-light">Typography</h2>
              <dl className="mt-6 grid gap-5">
                {(["heading", "accent"] as const).map((role) => (
                  <div key={role} className="border-b pb-4">
                    <dt className="text-sm text-muted-foreground">{role === "heading" ? "Names" : "Script"}</dt>
                    <dd className="mt-1 text-3xl" style={{ fontFamily: `var(${FONTS[fonts[role]].cssVar})` }}>
                      Layla &amp; Omar
                    </dd>
                    <dd className="text-xs text-muted-foreground">{FONTS[fonts[role]].label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-light">Good to know</h2>
              <ul className="mt-6 grid gap-4 text-sm leading-relaxed text-muted-foreground">
                <li>Every word can be changed — names, date, venue and the lines around them.</li>
                <li>Try any colour, silhouette, foil and paper; your choices stay with your design.</li>
                <li>Download a high-resolution image to share on WhatsApp, Instagram or by email.</li>
                <li>Printed cards, posted to you, are coming soon.</li>
              </ul>
            </div>
          </section>

          {similar.length ? (
            <section className="border-t px-5 py-20 sm:px-8">
              <div className="mx-auto max-w-[88rem]">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="font-serif text-4xl font-light">
                    Similar designs
                  </h2>
                  <Link href="/invitations" className="text-sm underline underline-offset-4">
                    See all invitations
                  </Link>
                </div>
                <div data-reveal-group="100" className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
                  {similar.map((t) => (
                    <TemplateCard key={t.id} template={t} index={cards.indexOf(t)} product="cards" />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </main>
      </PageTransition>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SECTION_DEFINITIONS } from "@/core/sections/registry";
import { FONTS } from "@/core/theme/fonts";
import { DesignDetail } from "@/features/marketing/preview/design-detail";
import { productHref, productOf, PRODUCTS, templatesFor, type Product } from "@/features/marketing/products";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";
import { TemplateCard } from "@/features/marketing/template-card";
import { getTemplateManifest, selectableTemplates } from "@/templates/registry";

export function generateStaticParams() {
  return templatesFor("websites", selectableTemplates()).map((t) => ({ templateId: t.id }));
}

export async function generateMetadata(props: PageProps<"/websites/[templateId]">): Promise<Metadata> {
  const { templateId } = await props.params;
  const t = getTemplateManifest(templateId);
  if (!t) return { title: "Template not found" };
  return {
    title: `${t.name} — wedding website`,
    description: `${t.description} Preview it with sample details and try it free — no account needed.`,
  };
}

/**
 * A design's page: the design as a card, on a phone and as a website, with
 * its variants and colours — all before any account.
 */
export default async function TemplatePage(props: PageProps<"/websites/[templateId]">) {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();
  const { palette, view } = await props.searchParams;
  // Card designs have their own product page.
  if (productOf(template) !== "websites") redirect(productHref("cards", template.id, typeof palette === "string" ? `palette=${palette}` : ""));
  const product: Product = "websites";
  const initialPalette = template.palettes.find((p) => p.id === palette)?.id ?? template.palettes[0].id;

  const all = templatesFor("websites", selectableTemplates());
  const variants = [template];
  const others = [
    ...all.filter((t) => t.id !== template.id && !variants.includes(t) && t.categories[0] === template.categories[0]),
    ...all.filter(
      (t) => t.id !== template.id && !variants.includes(t) && t.categories[0] !== template.categories[0] && t.categories.some((c) => template.categories.includes(c)),
    ),
  ].slice(0, 4);
  const fonts = template.themeDefaults.fonts;

  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className="pb-24 md:pb-0">
          <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pb-6 pt-8 text-sm text-muted-foreground sm:px-8">
            <Link href={PRODUCTS[product].path} className="hover:text-foreground">
              {PRODUCTS[product].label}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <Link href={`${PRODUCTS[product].path}?style=${template.categories[0]}`} className="capitalize hover:text-foreground">
              {template.categories[0]}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span aria-current="page">{template.name}</span>
          </nav>

          <DesignDetail
            template={template}
            initialPalette={initialPalette}
            initialView={view === "phone" ? "phone" : "website"}
          />

          <section data-stagger="140" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-3 md:py-28">
            <div>
              <h2 className="font-serif text-3xl font-light">What&apos;s included</h2>
              <p className="mt-3 text-muted-foreground">Every section can be edited, hidden or reordered.</p>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {template.supportedSections.map((s) => (
                  <li key={s} className="border-b border-border py-2">
                    {SECTION_DEFINITIONS[s].label}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-light">Typography</h2>
              <p className="mt-3 text-muted-foreground">Change fonts and colors any time — your words stay put.</p>
              <dl className="mt-6 grid gap-5">
                {(["heading", "body", "accent"] as const).map((role) => (
                  <div key={role} className="border-b border-border pb-4">
                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{role}</dt>
                    <dd className="mt-1 text-3xl" style={{ fontFamily: `var(${FONTS[fonts[role]].cssVar})` }}>
                      {role === "body" ? "Together with their families" : "Emma & James"}
                    </dd>
                    <dd className="text-xs text-muted-foreground">{FONTS[fonts[role]].label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-light">Good to know</h2>
              <ul className="mt-6 grid gap-4 text-sm leading-relaxed text-muted-foreground">
                <li>A complete wedding website: story, schedule, venues with maps, photos and RSVP.</li>
                <li>Looks right on every phone, tablet and computer.</li>
                {template.features.opening === "envelope" ? <li>Opens with a sealed envelope your guests tap to open.</li> : null}
                {template.features.music ? <li>Optional background music once guests open the invitation.</li> : null}
                <li>Switch to any other template later without retyping anything.</li>
              </ul>
            </div>
          </section>

          <section className="border-t border-border px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-serif text-4xl font-light">You might also like</h2>
                <Link href={PRODUCTS[product].path} className="text-sm underline underline-offset-4">
                  See all
                </Link>
              </div>
              <div data-reveal-group="100" className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
                {others.map((t) => (
                  <TemplateCard key={t.id} template={t} index={all.indexOf(t)} product={product} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </PageTransition>
      <SiteFooter />
    </>
  );
}

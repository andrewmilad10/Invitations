import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SECTION_DEFINITIONS } from "@/core/sections/registry";
import { FONTS } from "@/core/theme/fonts";
import { resolveTheme } from "@/core/theme/tokens";
import { MobileTryBar, TemplatePreviewStage } from "@/features/marketing/preview/template-preview-stage";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";
import { TemplateCard } from "@/features/marketing/template-card";
import { getTemplateManifest, selectableTemplates, TEMPLATE_MANIFESTS } from "@/templates/registry";

export function generateStaticParams() {
  return TEMPLATE_MANIFESTS.filter((t) => t.status !== "hidden").map((t) => ({ templateId: t.id }));
}

export async function generateMetadata(props: PageProps<"/templates/[templateId]">): Promise<Metadata> {
  const { templateId } = await props.params;
  const t = getTemplateManifest(templateId);
  if (!t) return { title: "Template not found" };
  return {
    title: `The ${t.name} — wedding invitation template`,
    description: `${t.description} Preview it with sample details and try it free — no account needed.`,
  };
}

/** Public template preview: the real invitation, on desktop and phone, before any account. */
export default async function TemplatePage(props: PageProps<"/templates/[templateId]">) {
  const { templateId } = await props.params;
  const template = getTemplateManifest(templateId);
  if (!template || template.status === "hidden") notFound();

  const all = selectableTemplates();
  const others = all.filter((t) => t.id !== template.id).slice(0, 3);
  const swatches = Object.fromEntries(
    template.palettes.map((p) => {
      const c = resolveTheme(template.themeDefaults, { colors: p.colors }).colors;
      return [p.id, [c.background, c.foreground, c.accent] as [string, string, string]];
    }),
  );
  const fonts = template.themeDefaults.fonts;

  return (
    <>
      <SiteHeader />
      <main className="pb-24 md:pb-0">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">
              Templates
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span aria-current="page">The {template.name}</span>
          </nav>
          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-accent">
                {template.categories.map((c) => c[0].toUpperCase() + c.slice(1)).join(" · ")}
              </p>
              <h1 className="mt-4 font-serif text-5xl font-light leading-[1.02] sm:text-7xl">The {template.name}</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{template.description}</p>
            </div>
            <div className="hidden shrink-0 flex-col items-start gap-3 md:flex lg:items-end">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href={`/create/${template.id}`}>Try this template</Link>
              </Button>
              <p className="text-sm text-muted-foreground">Free to try · no account needed</p>
            </div>
          </div>
        </div>

        <TemplatePreviewStage templateId={template.id} templateName={template.name} palettes={[...template.palettes]} swatches={swatches} />

        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-3 md:py-28">
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
              <li>A complete wedding website, not just a card: story, schedule, venues with maps, photos and RSVP.</li>
              <li>Looks right on every phone, tablet and computer.</li>
              {template.features.opening === "envelope" ? <li>Opens with a sealed envelope your guests tap to open.</li> : null}
              {template.features.music ? <li>Optional background music once guests open the invitation.</li> : null}
              <li>Switch to any other template later without retyping anything.</li>
            </ul>
            <Button asChild size="lg" className="mt-8 hidden rounded-full px-8 md:inline-flex">
              <Link href={`/create/${template.id}`}>Try the {template.name}</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-4xl font-light">More templates</h2>
              <Link href="/templates" className="text-sm underline underline-offset-4">
                See all
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-3">
              {others.map((t) => (
                <TemplateCard key={t.id} template={t} index={all.indexOf(t)} className={others.indexOf(t) === 2 ? "hidden lg:block" : undefined} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileTryBar templateId={template.id} templateName={template.name} />
    </>
  );
}

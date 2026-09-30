import type { Metadata } from "next";
import Link from "next/link";
import { TEMPLATE_CATEGORIES, type TemplateCategory } from "@/core/template/manifest";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";
import { TemplateCard } from "@/features/marketing/template-card";
import { cn } from "@/lib/utils";
import { selectableTemplates } from "@/templates/registry";

export const metadata: Metadata = {
  title: "Wedding invitation templates",
  description: "Browse wedding invitation and website templates — classic, romantic, modern, botanical and more. Preview any design and try it free, no account needed.",
};

function isCategory(value: unknown): value is TemplateCategory {
  return typeof value === "string" && (TEMPLATE_CATEGORIES as readonly string[]).includes(value);
}

export default async function TemplatesPage(props: PageProps<"/templates">) {
  const { style } = await props.searchParams;
  const active = isCategory(style) ? style : null;
  const all = selectableTemplates();
  const templates = active ? all.filter((t) => t.categories.includes(active)) : all;

  return (
    <>
      <SiteHeader />
      <main className="px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl font-light leading-[1.02] sm:text-7xl">Find your invitation</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Every template becomes a full wedding website with your story, schedule, venues and photos. Preview any design, then try it with your own details — no account needed.
            </p>
          </div>

          <nav aria-label="Filter by style" className="-mx-5 mt-10 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              <li>
                <FilterLink href="/templates" active={!active}>
                  All
                </FilterLink>
              </li>
              {TEMPLATE_CATEGORIES.map((c) => (
                <li key={c}>
                  <FilterLink href={`/templates?style=${c}`} active={active === c}>
                    <span className="capitalize">{c}</span>
                  </FilterLink>
                </li>
              ))}
            </ul>
          </nav>

          <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
            {templates.length} {templates.length === 1 ? "template" : "templates"}
            {active ? <> in <span className="capitalize">{active}</span></> : null}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} index={all.indexOf(t)} />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

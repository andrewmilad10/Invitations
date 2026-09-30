import Link from "next/link";
import { PageTransition } from "@/components/page-transition";
import { Stagger } from "@/features/motion/motion";
import { cn } from "@/lib/utils";
import { selectableTemplates } from "@/templates/registry";
import { PRODUCTS, websiteOrder, type Product } from "../products";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import { DesignGallery } from "./design-gallery";
import { parseFilters } from "./filters";

/** A product's gallery page: /invitations (cards) or /websites. */
export function GalleryPage({ product, searchParams }: { product: Product; searchParams: Record<string, string | string[] | undefined> }) {
  const filters = parseFilters(searchParams);
  const all = selectableTemplates();
  const templates = product === "websites" ? websiteOrder(all) : all;
  const info = PRODUCTS[product];

  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className="px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
          <div className="mx-auto max-w-7xl">
            <nav aria-label="Products" className="flex gap-2">
              {(Object.keys(PRODUCTS) as Product[]).map((p) => (
                <Link
                  key={p}
                  href={PRODUCTS[p].path}
                  aria-current={p === product ? "page" : undefined}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    p === product ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {PRODUCTS[p].label}
                </Link>
              ))}
            </nav>
            <Stagger step={110} className="mt-8 max-w-2xl">
              <h1 className="font-serif text-5xl font-light leading-[1.02] sm:text-7xl">{info.title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {templates.length} designs. {info.intro}
              </p>
            </Stagger>
            <DesignGallery templates={templates} initialFilters={filters} product={product} />
          </div>
        </main>
      </PageTransition>
      <SiteFooter />
    </>
  );
}

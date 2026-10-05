import Link from "next/link";
import { PageTransition } from "@/components/page-transition";
import { Stagger } from "@/features/motion/motion";
import { selectableTemplates } from "@/templates/registry";
import { PRODUCTS, templatesFor, websiteOrder, type Product } from "../products";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import { WebsiteCard } from "../home/website-card";
import { DesignGallery } from "./design-gallery";
import { NO_FILTERS } from "./filters";

/** A product's gallery page: /invitations (cards) or /websites. */
/**
 * Rendered statically with no filters; the gallery applies the URL's filters
 * in the browser (see DesignGallery), so the page can be cached and prefetched.
 */
export function GalleryPage({ product }: { product: Product }) {
  const own = templatesFor(product, selectableTemplates());
  const templates = product === "websites" ? websiteOrder(own) : own;
  const info = PRODUCTS[product];

  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className="px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
          <div className="mx-auto max-w-7xl">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <Link href="/" className="underline underline-offset-4 hover:text-foreground">
                Invites &amp; websites
              </Link>
              <span className="mx-2" aria-hidden>
                /
              </span>
              <span aria-current="page">{info.crumb}</span>
              <span className="mx-3 text-border" aria-hidden>
                |
              </span>
              {(Object.keys(PRODUCTS) as Product[])
                .filter((p) => p !== product)
                .map((p) => (
                  <Link key={p} href={PRODUCTS[p].path} className="hover:text-foreground">
                    Looking for {PRODUCTS[p].label.toLowerCase()}? →
                  </Link>
                ))}
            </nav>
            <Stagger step={110} className="mx-auto mt-8 max-w-2xl text-center">
              <h1 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">{info.title}</h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{info.intro}</p>
            </Stagger>
            {product === "websites" ? (
              // Websites: the same cards as the home page (phone + envelope or opening scene).
              <div className="mx-auto mt-12 grid max-w-7xl grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                {templates.map((t) => (
                  <WebsiteCard key={t.id} template={t} href={`/websites/${t.id}`} />
                ))}
              </div>
            ) : (
              <DesignGallery templates={templates} initialFilters={NO_FILTERS} product={product} />
            )}
          </div>
        </main>
      </PageTransition>
      <SiteFooter />
    </>
  );
}

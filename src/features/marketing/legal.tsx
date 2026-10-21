import type { ReactNode } from "react";
import { PageTransition } from "@/components/page-transition";
import { siteConfig } from "@/config/site";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * The shared frame for the plain-text legal pages (privacy, terms, cookies):
 * the site header and footer, a narrow readable column, and prose styling
 * applied once here so each page is only its headings and paragraphs.
 */
export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className="px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
          <div className="mx-auto max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent">{siteConfig.name}</p>
            <h1 className="mt-4 font-serif text-[clamp(2.4rem,5vw,3.4rem)] font-light leading-[1.05]">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
            <div
              className="mt-10 text-[0.975rem] leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_li]:mt-2 [&_p]:mt-4 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:ps-5"
            >
              {children}
            </div>
          </div>
        </main>
      </PageTransition>
      <SiteFooter />
    </>
  );
}

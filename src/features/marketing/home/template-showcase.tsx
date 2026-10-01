import Link from "next/link";
import { Button } from "@/components/ui/button";
import { selectableTemplates } from "@/templates/registry";
import { PRODUCTS, templatesFor, websiteOrder, type Product } from "../products";
import { TemplateCard } from "../template-card";
import { CollectionCarousel } from "./collection-carousel";

/** The two products, side by side: invitation cards and wedding websites. */
export function TemplateShowcase() {
  const all = selectableTemplates();
  const rows: { product: Product; heading: string; text: string; items: typeof all }[] = [
    {
      product: "cards",
      heading: "Invitation cards",
      text: "Designed like fine stationery. Personalise one and send it on WhatsApp or by email — printed cards are coming soon.",
      items: templatesFor("cards", all),
    },
    {
      product: "websites",
      heading: "Wedding websites",
      text: "A small website with its own link: your story, schedule, venues with maps, countdown, photos and RSVP.",
      items: websiteOrder(templatesFor("websites", all)).slice(0, 4),
    },
  ];

  const header = (row: (typeof rows)[number]) => (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <h3 className="font-serif text-4xl font-light">{row.heading}</h3>
        <p className="mt-2 text-muted-foreground">{row.text}</p>
      </div>
      <Button asChild variant="outline" className="self-start rounded-full px-6 sm:self-auto">
        <Link href={PRODUCTS[row.product].path}>See all {row.heading.toLowerCase()}</Link>
      </Button>
    </div>
  );

  return (
    <section id="templates" className="scroll-mt-20 overflow-hidden px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Cards to send, websites to share</h2>
        <p className="mt-5 text-lg text-muted-foreground">
          {templatesFor("cards", all).length} invitation card designs and {templatesFor("websites", all).length} wedding website designs — all original, each in several colours.
        </p>
      </div>

      {rows.map((row) => (
        <div key={row.product} className="mt-20">
          {header(row)}
          {row.product === "cards" ? (
            // Full-bleed: the curve runs to the edges of the screen.
            <div className="-mx-5 mt-6 sm:-mx-8">
              <CollectionCarousel designs={row.items} />
            </div>
          ) : (
            <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
              {row.items.map((t) => (
                <TemplateCard key={t.id} template={t} index={all.indexOf(t)} product={row.product} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

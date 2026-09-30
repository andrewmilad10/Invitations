import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeUp, RevealGroup, RevealLines, Stagger } from "@/features/motion/motion";
import { selectableTemplates } from "@/templates/registry";
import { PRODUCTS, websiteOrder, type Product } from "../products";
import { TemplateCard } from "../template-card";

/** The two products, side by side: invitation cards and wedding websites. */
export function TemplateShowcase() {
  const all = selectableTemplates();
  const rows: { product: Product; heading: string; text: string; items: typeof all }[] = [
    {
      product: "cards",
      heading: "Invitation cards",
      text: "Designed like fine stationery. Personalise one and send it on WhatsApp or by email — printed cards are coming soon.",
      items: all.filter((t) => t.features.hero === "card").slice(0, 4),
    },
    {
      product: "websites",
      heading: "Wedding websites",
      text: "A small website with its own link: your story, schedule, venues with maps, countdown, photos and RSVP.",
      items: websiteOrder(all).slice(0, 4),
    },
  ];

  return (
    <section id="templates" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <RevealLines className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl" lines={["Cards to send.", "Websites to share."]} />
          <FadeUp as="p" delay={180} className="mt-5 text-lg text-muted-foreground">
            {all.length} original designs — every one comes as an invitation card and as a wedding website, in several colours.
          </FadeUp>
        </div>

        {rows.map((row) => (
          <div key={row.product} className="mt-20">
            <Stagger step={120} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <h3 className="font-serif text-4xl font-light">{row.heading}</h3>
                <p className="mt-2 text-muted-foreground">{row.text}</p>
              </div>
              <Button asChild variant="outline" className="self-start rounded-full px-6 sm:self-auto">
                <Link href={PRODUCTS[row.product].path}>See all {row.heading.toLowerCase()}</Link>
              </Button>
            </Stagger>
            <RevealGroup step={100} className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
              {row.items.map((t) => (
                <TemplateCard key={t.id} template={t} index={all.indexOf(t)} product={row.product} />
              ))}
            </RevealGroup>
          </div>
        ))}
      </div>
    </section>
  );
}

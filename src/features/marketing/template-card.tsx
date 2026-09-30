import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TemplateManifest } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { Stationery } from "./stationery";

/** Couples used only to make gallery cards feel varied; not real weddings. */
const CARD_COUPLES: [string, string, string][] = [
  ["Emma", "James", "14 October"],
  ["Olivia", "Daniel", "20 June"],
  ["Sophia", "Alex", "2 May"],
  ["Sarah", "Michael", "8 September"],
  ["Nour", "Karim", "12 April"],
  ["Grace", "Henry", "30 August"],
  ["Mariam", "Andrew", "21 March"],
];

export function cardCouple(index: number) {
  return CARD_COUPLES[index % CARD_COUPLES.length];
}

/**
 * One template in a gallery: its stationery, name and description. On hover
 * (and always on touch screens) it reveals Preview and Try actions.
 */
export function TemplateCard({ template, index, className }: { template: TemplateManifest; index: number; className?: string }) {
  const [a, b, date] = cardCouple(index);
  return (
    <article className={cn("group relative", className)}>
      <div className="relative overflow-hidden bg-muted p-[9%] transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-30px_rgb(34_29_26/0.45)]">
        <Stationery
          template={template}
          partnerOne={a}
          partnerTwo={b}
          dateLabel={date}
          className="shadow-[0_12px_30px_-14px_rgb(34_29_26/0.45)] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-0 gap-2 bg-gradient-to-t from-black/45 to-transparent p-4 pt-12 opacity-100 transition duration-300 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <Button asChild size="sm" variant="secondary" className="flex-1 rounded-full bg-white/95 text-foreground hover:bg-white">
            <Link href={`/templates/${template.id}`}>Preview</Link>
          </Button>
          <Button asChild size="sm" className="flex-1 rounded-full">
            <Link href={`/create/${template.id}`}>Try this template</Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h3 className="font-serif text-xl leading-tight sm:text-2xl">
          <Link href={`/templates/${template.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            The {template.name}
          </Link>
        </h3>
        <span className="text-xs capitalize text-muted-foreground">{template.categories[0]}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{template.tagline}</p>
    </article>
  );
}

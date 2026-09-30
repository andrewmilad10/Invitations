import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TEMPLATE_CATEGORIES } from "@/core/template/manifest";
import { selectableTemplates } from "@/templates/registry";
import { TemplateCard } from "../template-card";

export function TemplateShowcase() {
  const templates = selectableTemplates().slice(0, 4);
  return (
    <section id="templates" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Invitations designed like fine stationery</h2>
          <p className="mt-5 text-lg text-muted-foreground">Every template works with your details. Preview any of them, then try one — no account needed.</p>
        </div>

        <nav aria-label="Template styles" className="mt-10 flex flex-wrap justify-center gap-2">
          <Link href="/templates" className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground">
            All
          </Link>
          {TEMPLATE_CATEGORIES.map((c) => (
            <Link key={c} href={`/templates?style=${c}`} className="rounded-full border border-border px-4 py-1.5 text-sm capitalize text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
              {c}
            </Link>
          ))}
        </nav>

        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
          {templates.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link href="/templates">Browse all templates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

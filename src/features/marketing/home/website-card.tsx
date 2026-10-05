import Link from "next/link";
import type { CSSProperties } from "react";
import type { TemplateManifest } from "@/core/template/manifest";
import { resolveTheme, themeToCssVars } from "@/core/theme/tokens";
import { cn } from "@/lib/utils";
import { MiniSite } from "../gallery/website-thumb";

const SAMPLE = { partnerOne: "Nour", partnerTwo: "Adam", dateLabel: "12 · 06 · 2027" };

/**
 * A wedding website shown the way guests first meet it: a phone with the
 * opening screen and, beside it, the envelope it arrives in (in the design's
 * own colours). Name, a short description and a "Try demo" button below.
 */
export function WebsiteCard({ template, className }: { template: TemplateManifest; className?: string }) {
  const vars = themeToCssVars(resolveTheme(template.themeDefaults, {})) as CSSProperties;
  const demo = `/templates/${template.id}/preview`;
  return (
    <article
      className={cn(
        "group flex flex-col rounded-[1.6rem] border border-black/10 bg-[#f1e9e4] p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgb(60_30_20/0.35)] sm:p-3.5",
        className,
      )}
    >
      <Link href={demo} aria-label={`Try the ${template.name} demo`} className="block overflow-hidden rounded-[1.1rem]">
        <div aria-hidden className="relative flex aspect-square items-center justify-center gap-[4%] bg-[#ead9c8] px-[5%] [container-type:inline-size]" style={vars}>
          <div className="w-[46%] shrink-0 transition-transform duration-700 ease-out group-hover:-translate-y-[2%] group-hover:-rotate-1">
            <div className="overflow-hidden rounded-[7cqw] border-[1.6cqw] border-neutral-900 bg-neutral-900 shadow-[0_6cqw_8cqw_-4cqw_rgb(0_0_0/0.5)]">
              <div className="relative aspect-[9/19] overflow-hidden rounded-[5cqw] [container-type:inline-size]">
                <MiniSite template={template} {...SAMPLE} device="phone" openingOnly />
                <span className="absolute left-1/2 top-[2.5%] h-[3.6%] w-[34%] -translate-x-1/2 rounded-full bg-neutral-900" />
              </div>
            </div>
          </div>
          <Envelope template={template} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-2 pb-1 pt-4 sm:px-3">
        <h3 className="font-serif text-xl italic leading-tight sm:text-2xl">{template.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[0.82rem] leading-relaxed text-muted-foreground sm:line-clamp-4 sm:text-sm">{template.tagline}</p>
        <Link
          href={demo}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#1f2620] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#2c372e] sm:h-12 sm:text-xs"
        >
          Try demo
        </Link>
      </div>
    </article>
  );
}

/** The envelope beside the phone: the design's own envelope when it has one, otherwise one in its colours. */
function Envelope({ template }: { template: TemplateManifest }) {
  const swan = template.renderer === "swan";
  return (
    <div className="relative aspect-[10/17] w-[40%] shrink-0 overflow-hidden rounded-[1.4cqw] shadow-[0_5cqw_7cqw_-4cqw_rgb(0_0_0/0.45)] transition-transform duration-700 ease-out group-hover:translate-y-[1.5%] group-hover:rotate-1">
      <div
        className="absolute inset-0 bg-inv-accent"
        style={swan ? { backgroundImage: "url(/templates/swan-lake/linen.webp)", backgroundSize: "90px" } : { backgroundImage: "radial-gradient(120% 80% at 50% 0%, rgb(255 255 255 / 0.12), transparent 60%)" }}
      />
      {/* the top flap and its shadow */}
      <div className="absolute inset-x-0 top-0 h-[54%] translate-y-[1.2cqw] bg-black/30 blur-[1.6cqw] [clip-path:polygon(0_0,100%_0,100%_3%,50%_100%,0_3%)]" />
      <div
        className="absolute inset-x-0 top-0 h-[54%] bg-inv-accent [clip-path:polygon(0_0,100%_0,100%_3%,50%_100%,0_3%)]"
        style={swan ? { backgroundImage: "url(/templates/swan-lake/linen.webp)", backgroundSize: "90px" } : { backgroundImage: "linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(0 0 0 / 0.08))" }}
      >
        {swan ? <span className="absolute left-1/2 top-[8%] aspect-square w-[60%] -translate-x-1/2 bg-[url(/templates/swan-lake/wreath.webp)] bg-contain bg-center bg-no-repeat [mask:radial-gradient(circle_closest-side,#000_78%,transparent)]" /> : null}
      </div>
      {/* the seal on the flap's tip */}
      <span
        className={cn("absolute left-1/2 top-[54%] grid aspect-square w-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-inv-heading text-[3.4cqw] shadow-[0_1cqw_1.4cqw_rgb(0_0_0/0.35)]", swan ? "bg-[url(/templates/swan-lake/seal.webp)] bg-contain bg-center bg-no-repeat text-[#7d6f58]" : "bg-[radial-gradient(circle_at_38%_32%,#fbf8f2,#e7e0d3_55%,#c9bfae)] text-[#8a7c64]")}
      >
        {SAMPLE.partnerOne[0]}&amp;{SAMPLE.partnerTwo[0]}
      </span>
      <p className="absolute inset-x-0 bottom-[8%] text-center font-inv-heading text-[2.6cqw] italic text-inv-accent-fg opacity-80">Click to open</p>
    </div>
  );
}

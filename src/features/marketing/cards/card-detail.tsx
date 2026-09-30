"use client";

import { Pause, Play, Printer, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, ViewTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CARD_OPTION_INFO,
  cardOptionsToQuery,
  FOIL_TONES,
  FOILS,
  PAPERS,
  resolveCardOptions,
  SILHOUETTES,
  type CardOptionOverrides,
  type CardOptions,
} from "@/core/card/options";
import { canRotate, cardShape, designCardDefaults, type TemplateManifest } from "@/core/template/manifest";
import { cn } from "@/lib/utils";
import { designBadges, FavoriteButton, morphName, paletteOverrides, SwatchRow } from "../gallery/design-card";
import { SHAPE_LABELS } from "../gallery/design-gallery";
import { MobileTryBar } from "../preview/template-preview-stage";
import { PRODUCTS, productHref } from "../products";
import { Stationery } from "../stationery";
import { CARD_VIEWS, CardStage, VIEW_LABELS, type CardView, type SampleText } from "./mockups";

const SAMPLE: SampleText = { partnerOne: "Emma", partnerTwo: "James", dateLabel: "Saturday, 14 October", place: "Villa Aurelia · Rome" };

/**
 * A card's product page: the card staged five ways (front, back, envelope,
 * suite, close-up) beside every finishing choice — design orientation,
 * colour theme, silhouette, foil and paper. Each choice redraws the card and
 * is carried into Customize (and from there into the couple's invitation).
 */
export function CardDetail({
  template,
  variants,
  initialPalette,
  initialOptions,
}: {
  template: TemplateManifest;
  /** Designs in the same family (other shapes), including this one. */
  variants: TemplateManifest[];
  initialPalette: string;
  initialOptions: CardOptionOverrides;
}) {
  const defaults = resolveCardOptions(designCardDefaults(template.stationery));
  const [paletteId, setPaletteId] = useState(initialPalette);
  const [choice, setChoice] = useState<CardOptionOverrides>(initialOptions);
  const [view, setView] = useState<CardView>("front");
  const [playing, setPlaying] = useState(false);
  const [paperHelp, setPaperHelp] = useState(false);
  const options = resolveCardOptions(designCardDefaults(template.stationery), choice);
  const palette = template.palettes.find((p) => p.id === paletteId) ?? template.palettes[0];
  const overrides = paletteOverrides(template, palette.id);
  const baseShape = template.stationery.shape ?? "portrait";

  const query = cardOptionsToQuery(choice, defaults);
  if (palette.id !== template.palettes[0].id) query.set("palette", palette.id);
  const q = query.toString();
  const customizeHref = `/create/${template.id}${q ? `?${q}` : ""}`;

  // Keep the URL in step, so a chosen finish can be shared or reloaded.
  useEffect(() => {
    window.history.replaceState(null, "", productHref("cards", template.id, q));
  }, [q, template.id]);

  // "Play": step through the staged views like a short film.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setView((v) => CARD_VIEWS[(CARD_VIEWS.indexOf(v) + 1) % CARD_VIEWS.length]), 2600);
    return () => window.clearInterval(id);
  }, [playing]);

  function pick<K extends keyof CardOptions>(key: K, value: CardOptions[K]) {
    setChoice((c) => ({ ...c, [key]: value }));
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${template.name} — wedding invitation`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* dismissed */
    }
  }

  const stageProps = { template, overrides, options: choice, text: SAMPLE };

  return (
    <div className="mx-auto grid max-w-[88rem] grid-cols-[minmax(0,1fr)] gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12">
      {/* ── Stage ─────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row lg:sticky lg:top-24 lg:self-start">
        <div role="tablist" aria-label="Views" className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-col sm:overflow-visible sm:px-0">
          {CARD_VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              aria-label={VIEW_LABELS[v]}
              onClick={() => (setView(v), setPlaying(false))}
              className={cn(
                "relative grid size-[4.5rem] shrink-0 place-items-center overflow-hidden rounded-lg bg-muted transition sm:size-24",
                view === v ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100",
              )}
            >
              <span aria-hidden className="pointer-events-none grid size-full origin-center scale-[0.9] place-items-center">
                <CardStage {...stageProps} view={v} sizes="96px" />
              </span>
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="relative grid aspect-[5/4] place-items-center overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--muted)_75%,white)] lg:aspect-[6/5]">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgb(255_255_255/0.7),transparent)]" />
            {view === "front" ? (
              <ViewTransition name={morphName(template.id)} share="morph" default="none">
                <div className="relative grid size-full place-items-center">
                  <CardStage {...stageProps} view="front" sizes="(min-width: 1024px) 34rem, 80vw" />
                </div>
              </ViewTransition>
            ) : (
              <ViewTransition key={view} enter="grid-swap" exit="grid-swap" default="none">
                <div className="relative grid size-full place-items-center">
                  <CardStage {...stageProps} view={view} sizes="(min-width: 1024px) 34rem, 80vw" />
                </div>
              </ViewTransition>
            )}
            <span className="absolute start-4 top-4 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm">{VIEW_LABELS[view]}</span>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play through the views"}
              className="absolute bottom-4 start-4 grid size-11 place-items-center rounded-full bg-background/95 shadow-sm transition hover:scale-105"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
            </button>
            <button
              type="button"
              onClick={share}
              className="absolute bottom-4 end-4 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background shadow-sm transition hover:bg-foreground/90"
            >
              <Share2 className="size-4" /> Share
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Shown with sample details — you&apos;ll add your own names, date and venue.</p>
        </div>
      </div>

      {/* ── Options ───────────────────────────────────────────── */}
      <div data-stagger="70" className="min-w-0">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href={PRODUCTS.cards.path} className="underline underline-offset-4 hover:text-foreground">
            Invitations
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <Link href={`${PRODUCTS.cards.path}?style=${template.categories[0]}`} className="capitalize underline underline-offset-4 hover:text-foreground">
            {template.categories[0]}
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span aria-current="page">{template.name}</span>
        </nav>
        <div className="mt-4 flex items-center gap-3">
          <h1 className="font-serif text-4xl font-light leading-[1.05] sm:text-5xl">{template.name}</h1>
          <FavoriteButton id={template.id} name={template.name} className="shrink-0 border bg-background" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">{designBadges(template)}</div>
        <p className="mt-3 leading-relaxed text-muted-foreground">{template.description}</p>

        {/* Design: orientation and the family's other shapes */}
        {canRotate(baseShape) || variants.length > 1 ? (
          <Group label="Design" value={SHAPE_LABELS[cardShape(template.stationery, choice)]}>
            <div className="flex flex-wrap gap-3">
              {canRotate(baseShape)
                ? (["portrait", "landscape"] as const).map((o) => (
                    <OptionTile key={o} active={options.orientation === o} onClick={() => pick("orientation", o)} label={CARD_OPTION_INFO.orientation[o]}>
                      <Stationery
                        template={template}
                        overrides={overrides}
                        options={{ ...choice, orientation: o, paper: "smooth" }}
                        partnerOne="E"
                        partnerTwo="J"
                        eyebrow=""
                        dateLabel={null}
                        sizes="96px"
                        className={cn("shadow-sm", o === "landscape" ? "w-20" : "w-12")}
                      />
                    </OptionTile>
                  ))
                : null}
              {variants
                .filter((v) => v.id !== template.id)
                .map((v) => (
                  <Link
                    key={v.id}
                    href={productHref("cards", v.id, v.palettes.some((p) => p.id === palette.id) && palette.id !== template.palettes[0].id ? `palette=${palette.id}` : "")}
                    className="flex w-28 flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors hover:border-foreground/40"
                  >
                    <span aria-hidden className="grid h-16 place-items-center">
                      <Stationery template={v} overrides={paletteOverrides(v, palette.id)} partnerOne="E" partnerTwo="J" eyebrow="" dateLabel={null} sizes="64px" className={cn("shadow-sm", v.stationery.shape === "square" ? "w-14" : "w-11")} />
                    </span>
                    {SHAPE_LABELS[v.stationery.shape ?? "portrait"]}
                  </Link>
                ))}
            </div>
          </Group>
        ) : null}

        <Group label="Theme" value={palette.label}>
          <SwatchRow template={template} value={palette.id} onChange={setPaletteId} size="lg" />
        </Group>

        <Group label="Silhouette" value={CARD_OPTION_INFO.silhouette[options.silhouette]}>
          <div role="radiogroup" aria-label="Silhouette" className="flex gap-3">
            {SILHOUETTES.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={options.silhouette === s}
                aria-label={CARD_OPTION_INFO.silhouette[s]}
                onClick={() => pick("silhouette", s)}
                className={cn("grid size-16 place-items-center rounded-xl border-2 transition", options.silhouette === s ? "border-foreground" : "border-transparent bg-secondary hover:border-foreground/25")}
              >
                <SilhouetteIcon kind={s} />
              </button>
            ))}
          </div>
        </Group>

        <Group label="Foil colour" value={CARD_OPTION_INFO.foil[options.foil]}>
          <div role="radiogroup" aria-label="Foil colour" className="flex gap-3">
            {FOILS.map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={options.foil === f}
                aria-label={CARD_OPTION_INFO.foil[f]}
                title={CARD_OPTION_INFO.foil[f]}
                onClick={() => pick("foil", f)}
                className={cn("grid size-12 place-items-center rounded-full ring-offset-2 ring-offset-background transition", options.foil === f ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-foreground/30")}
              >
                {f === "none" ? (
                  <span className="relative size-10 rounded-full border-2 border-foreground/70">
                    <span className="absolute left-1/2 top-1/2 h-0.5 w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground/70" />
                  </span>
                ) : (
                  <span
                    className="size-10 rounded-full shadow-[inset_0_1px_2px_rgb(255_255_255/0.6),inset_0_-2px_4px_rgb(0_0_0/0.15)]"
                    style={{ background: `linear-gradient(135deg, ${FOIL_TONES[f].dark}, ${FOIL_TONES[f].light} 45%, ${FOIL_TONES[f].base} 70%, ${FOIL_TONES[f].dark})` }}
                  />
                )}
              </button>
            ))}
          </div>
          {options.foil !== "none" ? <p className="mt-2 text-xs text-muted-foreground">Foil is stamped where the design uses its accent colour — flowers, script and details.</p> : null}
        </Group>

        <Group
          label="Paper type"
          value={CARD_OPTION_INFO.paper[options.paper][0]}
          aside={
            <button type="button" onClick={() => setPaperHelp((h) => !h)} aria-expanded={paperHelp} className="text-sm font-medium underline-offset-4 hover:underline">
              What&apos;s the difference?
            </button>
          }
        >
          <div role="radiogroup" aria-label="Paper type" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {PAPERS.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={options.paper === p}
                onClick={() => pick("paper", p)}
                className={cn("h-14 rounded-xl border px-2 text-sm transition", options.paper === p ? "border-foreground bg-secondary/60 font-medium" : "hover:border-foreground/40")}
              >
                {CARD_OPTION_INFO.paper[p][0]}
              </button>
            ))}
          </div>
          {paperHelp ? (
            <dl className="mt-4 grid gap-2 rounded-xl bg-secondary/50 p-4 text-sm">
              {PAPERS.map((p) => (
                <div key={p} className="grid grid-cols-[7rem_1fr] gap-3">
                  <dt className="font-medium">{CARD_OPTION_INFO.paper[p][0]}</dt>
                  <dd className="text-muted-foreground">{CARD_OPTION_INFO.paper[p][1]}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Group>

        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-14 flex-1 rounded-full text-base">
              <Link href={customizeHref}>Customize</Link>
            </Button>
          </div>
          <ul className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
            <li>Free to personalise — no account needed to start.</li>
            <li>Download your finished card to send on WhatsApp or by email.</li>
            <li className="flex items-center gap-2">
              <Printer className="size-4" /> Printed and posted cards are coming soon — your finish choices are saved with your design.
            </li>
          </ul>
        </div>
      </div>

      <MobileTryBar href={customizeHref} templateName={template.name} />
    </div>
  );
}

function Group({ label, value, aside, children }: { label: string; value?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-medium">
          {label}
          {value ? <span className="ms-3 font-normal text-muted-foreground">{value}</span> : null}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function OptionTile({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn("flex w-28 flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm transition", active ? "border-foreground" : "border-border hover:border-foreground/40")}
    >
      <span aria-hidden className="grid h-16 place-items-center">
        {children}
      </span>
      {label}
    </button>
  );
}

function SilhouetteIcon({ kind }: { kind: CardOptions["silhouette"] }) {
  if (kind === "scalloped") {
    return (
      <svg aria-hidden viewBox="0 0 40 40" className="size-9 text-foreground">
        <path
          d={`M6 6 ${[10, 14, 18, 22, 26, 30, 34].map((x) => `A2 2 0 0 1 ${x} 6`).join(" ")} ${[10, 14, 18, 22, 26, 30, 34].map((y) => `A2 2 0 0 1 34 ${y}`).join(" ")} ${[30, 26, 22, 18, 14, 10, 6].map((x) => `A2 2 0 0 1 ${x} 34`).join(" ")} ${[30, 26, 22, 18, 14, 10, 6].map((y) => `A2 2 0 0 1 6 ${y}`).join(" ")} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    );
  }
  return <span aria-hidden className={cn("size-9 border-[1.5px] border-foreground bg-background", kind === "rounded" && "rounded-lg")} />;
}

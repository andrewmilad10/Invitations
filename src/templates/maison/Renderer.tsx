import type { ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { getSection } from "@/core/invitation/model";
import type { SectionType } from "@/core/sections/registry";
import { cn } from "@/lib/utils";
import { CinematicMotion } from "../cinematic/motion";
import { Countdown } from "../shared/countdown";
import { InvitationImage } from "../shared/invitation-image";
import { InvitationRoot, Paragraphs, Sections } from "../shared/invitation-root";
import { MapEmbed } from "../shared/map-embed";
import { MusicToggle } from "../shared/music-toggle";
import { roman, season, sectionNumber } from "../shared/numbering";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../types";

/**
 * Maison — a fashion-editorial layout: the invitation as a magazine issue.
 * Towering Didone names bleed over a tall portrait (where they cross the
 * photo they turn to paper colour), issue numbers and chapter numerals,
 * asymmetric spreads, a portfolio of photographs, a running order.
 *
 * Fonts by role: heading = the Didone display face, body = the sans used
 * for small capitals and text, accent = the display face again, set in
 * italic for numerals and pull quotes. Colours: bg = paper, fg = ink,
 * accent = the one colour (oxblood by default), surface = a second paper.
 */

// ── Building blocks ─────────────────────────────────────────────────────────

/** Labels (generic phrases, never wedding identity). */
const COPY = {
  en: { issue: "N°01", plates: "plates", rsvp: "R.S.V.P.", seasons: { Winter: "Winter", Spring: "Spring", Summer: "Summer", Autumn: "Autumn" } },
  ar: { issue: "العدد ١", plates: "صور", rsvp: "لبّوا الدعوة", seasons: { Winter: "شتاء", Spring: "ربيع", Summer: "صيف", Autumn: "خريف" } },
} as const;
const copy = (model: InvitationModel) => COPY[model.locale] ?? COPY.en;

/** Relative luminance of a #rrggbb colour (0 = black, 1 = white). */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** "3:00 pm" → ["3:00", "pm"], so the numerals can be set huge and the suffix small. */
function splitTime(label: string): [string, string] {
  const m = /^(.*\d)\s*(\D+)$/.exec(label.trim());
  return m ? [m[1], m[2]] : [label, ""];
}

/** Small spaced capitals — the magazine's labels. */
function Label({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={cn("text-[0.62rem] font-medium uppercase tracking-[0.32em] sm:text-[0.68rem]", className)}>{children}</p>;
}

/** An editorial spread: a big chapter numeral beside the content. */
function Chapter({
  id,
  model,
  title,
  children,
  tone = "paper",
  className,
}: {
  id: SectionType;
  model: InvitationModel;
  title?: string;
  children: ReactNode;
  tone?: "paper" | "sheet" | "ink";
  className?: string;
}) {
  const n = sectionNumber(model, id);
  return (
    <section
      id={id}
      data-section={id}
      className={cn(
        "px-5 py-20 sm:px-10 sm:py-28 lg:py-36",
        "group-data-[spacing=compact]/sec:py-12 sm:group-data-[spacing=compact]/sec:py-16",
        "group-data-[spacing=airy]/sec:py-28 sm:group-data-[spacing=airy]/sec:py-44",
        tone === "paper" && "bg-inv-bg text-inv-fg",
        tone === "sheet" && "bg-inv-surface text-inv-fg",
        tone === "ink" && "bg-inv-fg text-inv-bg",
        className,
      )}
    >
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-3">
          <div data-reveal className="flex items-baseline gap-4 border-t border-current pt-4 md:block">
            {n > 0 ? <p className="font-inv-accent text-5xl italic leading-none text-inv-accent sm:text-7xl">{roman(n)}</p> : null}
            <Label className="opacity-70 md:mt-6">{title}</Label>
          </div>
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  );
}

function Headline({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <h2 data-reveal className={cn("font-inv-heading text-5xl leading-[0.95] tracking-[-0.02em] sm:text-7xl lg:text-8xl", className)}>
      {children}
    </h2>
  );
}

function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group/link inline-flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.3em]",
        "[background:linear-gradient(currentColor,currentColor)_0_100%/0_1px_no-repeat] pb-1 transition-[background-size] duration-500 hover:[background-size:100%_1px]",
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-transform duration-500 group-hover/link:translate-x-1 rtl:-scale-x-100">
        →
      </span>
    </a>
  );
}

// ── Sections ────────────────────────────────────────────────────────────────

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding, media } = model;
  const t = copy(model);
  const when = season(wedding.weddingDate) as keyof typeof t.seasons | null;
  const issue = [when ? t.seasons[when] : null, wedding.weddingDate ? roman(Number(wedding.weddingDate.slice(0, 4))) : null].filter(Boolean).join(" ");
  const venue = model.events.ceremony?.venueName ?? model.events.reception?.venueName ?? null;
  // Size the names so the longer one always fits the width.
  const longest = Math.max(4, ...[wedding.partnerOne, wedding.partnerTwo].map((n) => Array.from(n).length));
  const size = `clamp(3rem, ${Math.min(21, 108 / longest).toFixed(1)}vw, ${Math.min(13.5, 72 / longest).toFixed(2)}rem)`;
  const names = (
    <p className="font-inv-heading uppercase leading-[0.8] tracking-[-0.045em]" style={{ fontSize: size }}>
      <span className="block">{wedding.partnerOne}</span>
      <span className="my-[0.08em] block font-inv-accent text-[0.5em] normal-case italic leading-[0.9] tracking-normal text-inv-accent">&amp;</span>
      <span className="block">{wedding.partnerTwo}</span>
    </p>
  );
  // The portrait's box, as CSS variables (tall and narrower on wide screens),
  // shared by the photo and by the paper-coloured copy of the names that
  // shows only where they cross it.
  // On dark paper the ink is already light, so the names simply stay ink
  // over the photo (which is dimmed a little); on light paper they turn to
  // paper colour where they cross it.
  const darkPaper = luminance(model.theme.colors.background) < 0.35;
  const box = "[--t:9%] [--r:0rem] [--w:62%] [--h:62%] sm:[--t:5%] sm:[--r:2.5rem] sm:[--w:44%] sm:[--h:74%]";

  return (
    <header id="hero" data-section="hero" className="relative isolate overflow-hidden bg-inv-bg text-inv-fg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 sm:px-10 sm:pt-8">
        <Label>{t.issue} — {content.eyebrow}</Label>
        <Label className="hidden sm:block">{issue}</Label>
      </div>
      <div className={cn("relative mx-auto h-[calc(100svh-4rem)] min-h-[34rem] max-w-6xl sm:h-[56rem] sm:max-h-[calc(100svh-4rem)] sm:min-h-[40rem]", box)}>
        {/* Base names in ink */}
        <div aria-hidden className="absolute inset-x-5 bottom-[17%] sm:inset-x-10 sm:bottom-[16%]">
          {names}
        </div>
        {/* The portrait */}
        <div className="absolute end-[var(--r)] top-[var(--t)] h-[var(--h)] w-[var(--w)] overflow-hidden">
          {media.hero ? (
            <div data-hero-media className="absolute inset-0 will-change-transform">
              <InvitationImage asset={media.hero} alt="" fill priority sizes="(min-width: 1152px) 520px, 62vw" className="object-cover" />
              <div className={cn("absolute inset-0", darkPaper ? "bg-inv-bg/35" : "bg-inv-fg/15")} />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--inv-fg)_22%,var(--inv-bg))]" />
          )}
        </div>
        {/* The names again, in paper colour, visible only over the portrait */}
        <div
          aria-hidden
          hidden={darkPaper}
          className="pointer-events-none absolute inset-0 [clip-path:inset(var(--t)_var(--r)_calc(100%_-_var(--t)_-_var(--h))_calc(100%_-_var(--r)_-_var(--w)))] rtl:[clip-path:inset(var(--t)_calc(100%_-_var(--r)_-_var(--w))_calc(100%_-_var(--t)_-_var(--h))_var(--r))]"
        >
          <div className="absolute inset-x-5 bottom-[17%] text-inv-bg sm:inset-x-10 sm:bottom-[16%]">{names}</div>
        </div>
        <h1 className="sr-only">{wedding.coupleName}</h1>
        {/* Vertical caption along the edge */}
        <p className="absolute bottom-[18%] start-1 origin-bottom-left text-[0.58rem] uppercase tracking-[0.35em] [writing-mode:vertical-rl] rotate-180 sm:start-3 sm:text-[0.62rem] rtl:rotate-0">
          {[wedding.date?.short, venue].filter(Boolean).join(" — ")}
        </p>
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-6 border-t border-current pt-4 sm:inset-x-10">
          {wedding.date ? <p className="font-inv-accent text-lg italic sm:text-2xl">{wedding.date.long}</p> : <span />}
          {content.tagline ? <p className="max-w-xs text-end text-sm opacity-70">{content.tagline}</p> : null}
        </div>
      </div>
    </header>
  );
}

function Invitation({ model, content }: SectionProps<"couple">) {
  return (
    <Chapter id="couple" model={model} title={content.eyebrow}>
      <Headline>{content.heading}</Headline>
      {content.message ? (
        <p data-reveal className="mt-10 max-w-2xl font-inv-accent text-2xl italic leading-[1.45] sm:text-3xl">
          {content.message}
        </p>
      ) : null}
    </Chapter>
  );
}

function DateSpread({ model, content }: SectionProps<"date">) {
  const date = model.wedding.date;
  if (!date) return null;
  return (
    <Chapter id="date" model={model} title={content.heading} tone="sheet">
      <div data-reveal className="flex items-end gap-5 sm:gap-10">
        <span className="font-inv-heading text-[clamp(8rem,34vw,20rem)] leading-[0.72] tracking-[-0.06em]">{date.day}</span>
        <div className="pb-3">
          <p className="font-inv-heading text-4xl uppercase leading-none tracking-[-0.02em] sm:text-6xl">{date.month}</p>
          <Label className="mt-3 opacity-70">
            {date.weekday} · {date.year}
          </Label>
        </div>
      </div>
      {content.note ? <p className="mt-10 max-w-md text-sm leading-relaxed opacity-75">{content.note}</p> : null}
    </Chapter>
  );
}

function CountdownSection({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Chapter id="countdown" model={model} title={content.heading}>
      <div data-reveal>
        <Countdown
          model={model}
          className="grid grid-cols-4 divide-x divide-current/25 border-y border-current/25 rtl:divide-x-reverse"
          unitClassName="flex flex-col py-6 ps-3 sm:py-10 sm:ps-6"
          valueClassName="font-inv-heading text-5xl leading-none tracking-[-0.03em] tabular-nums sm:text-8xl"
          labelClassName="mt-3 text-[0.6rem] font-medium uppercase tracking-[0.3em] opacity-60"
        />
      </div>
    </Chapter>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photo = model.media.gallery[0];
  return (
    <Chapter id="story" model={model} title={content.heading}>
      <div className="grid gap-12 lg:grid-cols-9">
        <div data-reveal className="text-[1.02rem] leading-[1.85] opacity-90 first-letter:float-start first-letter:me-3 first-letter:font-inv-heading first-letter:text-[5.2rem] first-letter:leading-[0.8] first-letter:text-inv-accent lg:col-span-5 [&>p+p]:mt-6">
          <Paragraphs text={content.body} />
        </div>
        {photo ? (
          <figure data-reveal className="lg:col-span-4 lg:mt-24">
            <div className="relative aspect-[4/5] overflow-hidden">
              <InvitationImage asset={photo} fill sizes="(min-width: 1024px) 360px, 90vw" className="object-cover" />
            </div>
          </figure>
        ) : null}
      </div>
      {content.quote ? (
        <figure data-reveal className="mt-20 border-y border-current/30 py-12 text-center">
          <blockquote className="mx-auto max-w-3xl font-inv-accent text-3xl italic leading-[1.3] sm:text-5xl">
            <span className="text-inv-accent">“</span>
            {content.quote}
            <span className="text-inv-accent">”</span>
          </blockquote>
          {content.quoteSource ? <Label className="mt-6 opacity-70">— {content.quoteSource}</Label> : null}
        </figure>
      ) : null}
    </Chapter>
  );
}

function EventSpread({ id, model, content, event, flip }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string }; event: EventModel | null; flip?: boolean }) {
  if (!event) return null;
  return (
    <Chapter id={id} model={model} title={content.heading} tone={flip ? "sheet" : "paper"}>
      <div className={cn("grid gap-10 sm:grid-cols-2", flip && "sm:[&>*:first-child]:order-2")}>
        <div data-reveal>
          <p className="font-inv-heading leading-[0.85] tracking-[-0.04em]">
            <span className="whitespace-nowrap text-7xl sm:text-9xl">{splitTime(event.timeLabel ?? "—")[0]}</span>
            <span className="ms-2 font-inv-accent text-3xl italic tracking-normal text-inv-accent sm:text-5xl">{splitTime(event.timeLabel ?? "—")[1]}</span>
          </p>
          {event.dateLabel ? <Label className="mt-4 opacity-70">{event.dateLabel}</Label> : null}
        </div>
        <div data-reveal className="sm:pt-3">
          {event.venueName ? <p className="font-inv-heading text-3xl leading-tight sm:text-4xl">{event.venueName}</p> : null}
          {event.address ? <p className="mt-3 text-sm leading-relaxed opacity-70">{event.address}</p> : null}
          {content.note ? <p className="mt-6 font-inv-accent text-xl italic leading-snug">{content.note}</p> : null}
          {event.mapUrl ? <ArrowLink href={event.mapUrl} className="mt-8">{model.strings.directions}</ArrowLink> : null}
        </div>
      </div>
    </Chapter>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = model.events.all.filter((e) => e.mapEmbedUrl);
  if (!mapped.length) return null;
  return (
    <Chapter id="venue" model={model} title={content.heading}>
      {content.note ? <p data-reveal className="mb-10 max-w-xl font-inv-accent text-2xl italic">{content.note}</p> : null}
      <div className={cn("grid gap-8", mapped.length > 1 && "sm:grid-cols-2")}>
        {mapped.map((event) => (
          <figure key={event.id} data-reveal>
            {model.mode !== "export" ? <MapEmbed event={event} className="aspect-[4/5] grayscale" /> : null}
            <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-t border-current pt-3">
              <span className="font-inv-heading text-xl">{event.venueName ?? event.title}</span>
              <Label className="opacity-60">{event.title}</Label>
            </figcaption>
          </figure>
        ))}
      </div>
    </Chapter>
  );
}

/** The portfolio: an asymmetric editorial grid, each plate numbered. */
function Portfolio({ model, content }: SectionProps<"gallery">) {
  const photos = model.media.gallery.slice(0, 9);
  if (!photos.length) return null;
  // Column spans on a 12-column grid, repeating: tall + two, wide, two offset.
  const pattern = [
    "md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto",
    "md:col-span-5 aspect-[4/3]",
    "md:col-span-5 aspect-[4/3]",
    "md:col-span-12 aspect-[16/9] md:aspect-[21/9]",
    "md:col-span-5 md:col-start-2 aspect-[3/4]",
    "md:col-span-5 md:mt-24 aspect-[3/4]",
  ];
  return (
    <section id="gallery" data-section="gallery" className="bg-inv-bg px-5 py-20 text-inv-fg sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-current pt-4">
          <div className="flex items-baseline gap-5">
            <p className="font-inv-accent text-5xl italic leading-none text-inv-accent sm:text-7xl">{roman(sectionNumber(model, "gallery"))}</p>
            <Headline className="text-5xl sm:text-7xl">{content.heading}</Headline>
          </div>
          <Label className="shrink-0 opacity-60">{String(photos.length).padStart(2, "0")} {copy(model).plates}</Label>
        </div>
        {content.caption ? <p className="mt-6 max-w-md font-inv-accent text-xl italic">{content.caption}</p> : null}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {photos.map((photo, i) => (
            <figure key={photo.id} data-reveal className={cn("relative", pattern[i % pattern.length], i % 2 === 1 && "ms-[12%] md:ms-0")}>
              <div className="relative size-full min-h-full overflow-hidden">
                <InvitationImage asset={photo} fill sizes="(min-width: 768px) 60vw, 90vw" className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.03]" />
              </div>
              <figcaption className="absolute -bottom-6 start-0 text-[0.6rem] font-medium uppercase tracking-[0.3em] opacity-60">
                {String(i + 1).padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function RunningOrder({ model, content }: SectionProps<"schedule">) {
  const items =
    content.items.length > 0
      ? content.items
      : model.events.all.filter((e) => e.timeLabel).map((e) => ({ time: e.timeLabel!, title: e.title || (e.venueName ?? ""), note: e.venueName ?? "" }));
  return (
    <Chapter id="schedule" model={model} title={content.heading} tone="sheet">
      <ol className="border-t border-current">
        {items.map((item, i) => (
          <li key={i} data-reveal className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-current/25 py-5 sm:grid-cols-[12rem_1fr_auto] sm:py-7">
            <span className="whitespace-nowrap font-inv-heading text-xl tabular-nums sm:text-4xl">
              {splitTime(item.time)[0]}
              <span className="ms-1 font-inv-accent text-[0.6em] italic text-inv-accent">{splitTime(item.time)[1]}</span>
            </span>
            <span className="font-inv-heading text-2xl leading-tight sm:text-4xl">{item.title}</span>
            {item.note ? <Label className="col-start-2 opacity-60 sm:col-start-auto">{item.note}</Label> : null}
          </li>
        ))}
      </ol>
    </Chapter>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <section id="rsvp" data-section="rsvp" className="bg-inv-fg px-5 py-24 text-inv-bg sm:px-10 sm:py-36">
      <div className="mx-auto max-w-6xl text-center">
        <Label className="opacity-60">{roman(sectionNumber(model, "rsvp"))} — {content.heading}</Label>
        <p data-reveal className="mt-8 font-inv-heading text-[clamp(4rem,17vw,11rem)] leading-[0.85] tracking-[-0.04em]">{copy(model).rsvp}</p>
        {content.message ? (
          <p data-reveal className="mx-auto mt-10 max-w-xl font-inv-accent text-2xl italic leading-snug">
            {content.message}
          </p>
        ) : null}
        {content.deadline ? <Label className="mt-8 opacity-70">{content.deadline}</Label> : null}
        {content.linkUrl ? (
          <a
            href={content.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn mt-12 inline-flex items-center gap-4 border border-current px-10 py-4 text-[0.7rem] font-medium uppercase tracking-[0.32em] transition-colors duration-500 hover:bg-inv-bg hover:text-inv-fg"
          >
            {content.linkLabel || content.heading}
            <span aria-hidden className="transition-transform duration-500 group-hover/btn:translate-x-1 rtl:-scale-x-100">
              →
            </span>
          </a>
        ) : null}
      </div>
    </section>
  );
}

function Interview({ model, content }: SectionProps<"faq">) {
  const items = content.items.filter((i) => i.question.trim());
  if (!items.length) return null;
  return (
    <Chapter id="faq" model={model} title={content.heading}>
      <dl className="grid gap-x-12 gap-y-14 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} data-reveal>
            <dt className="flex gap-3">
              <span className="font-inv-accent text-2xl italic text-inv-accent">Q.</span>
              <span className="font-inv-heading text-2xl leading-tight sm:text-3xl">{item.question}</span>
            </dt>
            <dd className="mt-4 flex gap-3 text-[0.98rem] leading-relaxed opacity-85">
              <span className="font-inv-accent text-2xl italic leading-none text-inv-accent">A.</span>
              <span className="whitespace-pre-line">{item.answer}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Chapter>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <section id="closing" data-section="closing" className="bg-inv-bg px-5 py-24 text-center text-inv-fg sm:py-40">
      <div className="mx-auto max-w-4xl">
        <p data-reveal className="font-inv-heading text-5xl leading-[0.95] tracking-[-0.02em] sm:text-8xl">
          {content.heading}
        </p>
        {content.message ? <p data-reveal className="mx-auto mt-10 max-w-xl font-inv-accent text-2xl italic leading-snug opacity-85">{content.message}</p> : null}
        {content.signature ? <Label className="mt-10 opacity-70">{content.signature}</Label> : null}
      </div>
    </section>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  const hero = getSection(model, "hero");
  return (
    <footer data-section="footer" className="bg-inv-fg px-5 py-14 text-inv-bg sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-current/30 pt-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="font-inv-heading text-4xl uppercase leading-none tracking-[-0.03em] sm:text-6xl">
          {model.wedding.partnerOne} <span className="font-inv-accent normal-case italic text-inv-accent">&amp;</span> {model.wedding.partnerTwo}
        </p>
        <div className="text-end">
          <Label className="opacity-60">N°01 — {hero?.content.eyebrow}</Label>
          {content.note ? <p className="mt-2 font-inv-accent text-lg italic opacity-80">{content.note}</p> : null}
        </div>
      </div>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Invitation,
  date: DateSpread,
  countdown: CountdownSection,
  story: Story,
  ceremony: (p) => <EventSpread id="ceremony" model={p.model} content={p.content} event={p.model.events.ceremony} />,
  reception: (p) => <EventSpread id="reception" model={p.model} content={p.content} event={p.model.events.reception} flip />,
  venue: Venue,
  gallery: Portfolio,
  schedule: RunningOrder,
  rsvp: Rsvp,
  faq: Interview,
  closing: Closing,
  footer: Footer,
};

export default function MaisonRenderer({ model }: TemplateRendererProps) {
  return (
    <InvitationRoot model={model} className="font-inv-body">
      <main>
        <Sections model={model} components={sections} />
      </main>
      <CinematicMotion model={model} />
      <MusicToggle model={model} />
    </InvitationRoot>
  );
}

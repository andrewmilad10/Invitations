import type { ReactNode } from "react";
import type {
  EventModel,
  InvitationModel,
  MediaAsset,
} from "@/core/invitation/model";
import type { SectionType } from "@/core/sections/registry";
import { cn } from "@/lib/utils";
import { CinematicMotion } from "../cinematic/motion";
import { Countdown } from "../shared/countdown";
import { InvitationImage } from "../shared/invitation-image";
import {
  InvitationRoot,
  Paragraphs,
  Sections,
} from "../shared/invitation-root";
import { MapEmbed } from "../shared/map-embed";
import { MusicToggle } from "../shared/music-toggle";
import { roman, sectionNumber, twoDigits } from "../shared/numbering";
import type {
  SectionComponents,
  SectionProps,
  TemplateRendererProps,
} from "../types";

/**
 * Galerie — the wedding as an exhibition. Gallery-white walls and
 * hairlines; photographs hung like artworks in a passepartout with wall
 * labels; rooms numbered; events as placards; one vivid accent colour.
 *
 * Fonts by role: heading = the serif for titles, body = the neutral sans
 * of wall labels, accent = the serif in italic. Colours: bg = the wall,
 * surface = the mat, fg = ink, accent = the one vivid colour, border =
 * hairlines.
 */

// ── Building blocks ─────────────────────────────────────────────────────────

/** Labels (generic phrases, never wedding identity). */
const COPY = {
  en: { plate: "Plate", privateView: "Private view" },
  ar: { plate: "لوحة", privateView: "عرض خاص" },
} as const;
const copy = (model: InvitationModel) => COPY[model.locale] ?? COPY.en;

function Room({
  id,
  model,
  title,
  children,
  className,
  wide,
}: {
  id: SectionType;
  model: InvitationModel;
  title?: string;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  const n = sectionNumber(model, id);
  return (
    <section
      id={id}
      data-section={id}
      className={cn(
        "bg-inv-bg px-5 py-16 text-inv-fg sm:px-10 sm:py-24",
        "group-data-[spacing=compact]/sec:py-12 sm:group-data-[spacing=compact]/sec:py-16",
        "group-data-[spacing=airy]/sec:py-28 sm:group-data-[spacing=airy]/sec:py-44",
        className,
      )}
    >
      <div className={cn("mx-auto", wide ? "max-w-6xl" : "max-w-4xl")}>
        <header
          data-reveal
          className="mb-12 flex items-baseline gap-4 sm:mb-16"
        >
          <span className="text-xs tabular-nums text-inv-accent">
            {twoDigits(n)}
          </span>
          <span className="h-px flex-1 bg-inv-border" />
          <span className="text-xs text-inv-muted">{title}</span>
        </header>
        {children}
      </div>
    </section>
  );
}

function Title({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <h2
      data-reveal
      className={cn(
        "font-inv-heading text-5xl leading-[1] tracking-[-0.01em] sm:text-7xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** A wall label: a short accent rule and a few lines of small text. */
function WallLabel({
  lines,
  className,
}: {
  lines: (ReactNode | null | undefined)[];
  className?: string;
}) {
  const shown = lines.filter(Boolean);
  if (!shown.length) return null;
  return (
    <div className={cn("flex gap-3 text-[0.8rem] leading-[1.55]", className)}>
      <span aria-hidden className="w-[3px] shrink-0 bg-inv-accent" />
      <div>
        {shown.map((line, i) => (
          <p key={i} className={i === 0 ? "font-medium" : "text-inv-muted"}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/** A photograph hung in a white mat with a hairline frame. */
function Framed({
  photo,
  sizes,
  className,
  ratio = "aspect-[4/5]",
  priority,
}: {
  photo: MediaAsset | null | undefined;
  sizes: string;
  className?: string;
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-inv-fg bg-inv-surface p-[7%] shadow-[0_1px_0_var(--inv-border)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[color-mix(in_oklab,var(--inv-fg)_10%,var(--inv-surface))]",
          ratio,
        )}
      >
        {photo ? (
          <InvitationImage
            asset={photo}
            alt={photo.alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border-b border-inv-accent pb-0.5 text-sm text-inv-fg transition-colors hover:text-inv-accent"
    >
      {children} <span aria-hidden>↗</span>
    </a>
  );
}

// ── Sections ────────────────────────────────────────────────────────────────

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding, media } = model;
  const [a, b] = wedding.initials;
  const ceremony = model.events.ceremony ?? model.events.reception;
  return (
    <header
      id="hero"
      data-section="hero"
      className="bg-inv-bg px-5 pb-16 pt-6 text-inv-fg sm:px-10 sm:pb-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between text-sm">
          <span className="font-inv-heading text-2xl">
            {a}&amp;{b}
          </span>
          <span className="text-inv-muted">{content.eyebrow}</span>
        </div>
        <div className="mt-12 grid items-end gap-10 md:mt-20 md:grid-cols-12">
          <div data-hero-content className="md:col-span-5 md:col-start-2">
            <Framed
              photo={media.hero}
              priority
              sizes="(min-width: 768px) 420px, 85vw"
            />
          </div>
          <div className="md:col-span-5 md:col-start-8 md:pb-4">
            <h1 className="break-words font-inv-heading text-[clamp(3.8rem,15vw,7.5rem)] leading-[0.92] tracking-[-0.02em] md:text-[clamp(3rem,7.5vw,7.5rem)]">
              {wedding.partnerOne}
              <br />
              <span className="font-inv-accent italic">&amp;</span>{" "}
              {wedding.partnerTwo}
            </h1>
            <WallLabel
              className="mt-10"
              lines={[
                `${wedding.coupleName}`,
                wedding.date ? `Together, ${wedding.date.year}` : null,
                wedding.date?.long,
                [ceremony?.timeLabel, ceremony?.venueName]
                  .filter(Boolean)
                  .join(" — ") || null,
              ]}
            />
            {content.tagline ? (
              <p className="mt-6 font-inv-accent text-lg italic text-inv-muted">
                {content.tagline}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function Note({ model, content }: SectionProps<"couple">) {
  return (
    <Room id="couple" model={model} title={content.eyebrow}>
      <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
        <Title className="font-inv-accent italic">{content.heading}</Title>
        {content.message ? (
          <p
            data-reveal
            className="text-lg leading-[1.75] text-inv-fg/85 md:pt-3"
          >
            {content.message}
          </p>
        ) : null}
      </div>
    </Room>
  );
}

function DateRoom({ model, content }: SectionProps<"date">) {
  const date = model.wedding.date;
  if (!date) return null;
  return (
    <Room id="date" model={model} title={content.heading}>
      <p
        data-reveal
        className="font-inv-heading text-[clamp(4rem,16vw,10rem)] leading-none tracking-[-0.03em] tabular-nums"
      >
        {date.short}
      </p>
      <p className="mt-4 text-inv-muted">{date.weekday}</p>
      {content.note ? (
        <p className="mt-6 max-w-md text-inv-muted">{content.note}</p>
      ) : null}
    </Room>
  );
}

function CountdownRoom({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Room id="countdown" model={model} title={content.heading}>
      <div data-reveal>
        <Countdown
          model={model}
          className="grid grid-cols-4 gap-2 sm:gap-4"
          unitClassName="flex aspect-square flex-col justify-between border border-inv-border bg-inv-surface p-3 sm:p-5"
          valueClassName="font-inv-heading text-4xl leading-none tabular-nums sm:text-7xl"
          labelClassName="text-[0.7rem] text-inv-muted"
        />
      </div>
    </Room>
  );
}

function StoryRoom({ model, content }: SectionProps<"story">) {
  const photo = model.media.gallery[0];
  return (
    <Room id="story" model={model} title={content.heading} wide>
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <Title>{content.heading}</Title>
          <div
            data-reveal
            className="mt-10 text-[1.02rem] leading-[1.8] text-inv-fg/85 [&>p+p]:mt-5"
          >
            <Paragraphs text={content.body} />
          </div>
        </div>
        {photo ? (
          <figure data-reveal className="md:col-span-5 md:col-start-8 md:mt-20">
            <Framed photo={photo} sizes="(min-width: 768px) 380px, 85vw" />
            <WallLabel
              className="mt-5"
              lines={[`${copy(model).plate} ${roman(1)}`, photo.alt]}
            />
          </figure>
        ) : null}
      </div>
      {content.quote ? (
        <figure data-reveal className="mx-auto mt-24 max-w-3xl">
          <blockquote className="font-inv-accent text-3xl italic leading-[1.3] sm:text-5xl">
            {content.quote}
          </blockquote>
          {content.quoteSource ? (
            <figcaption className="mt-5 text-sm text-inv-muted">
              — {content.quoteSource}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </Room>
  );
}

/** An exhibition placard. */
function Placard({
  id,
  model,
  content,
  event,
  align,
}: {
  id: "ceremony" | "reception";
  model: InvitationModel;
  content: { heading: string; note: string };
  event: EventModel | null;
  align: "start" | "end";
}) {
  if (!event) return null;
  return (
    <Room id={id} model={model} title={content.heading} wide>
      <div className="grid items-end gap-10 sm:grid-cols-2 sm:gap-14">
        <div data-reveal className={cn(align === "end" && "sm:order-2")}>
          <p className="break-words font-inv-accent text-6xl italic leading-[0.95] md:text-7xl lg:text-8xl">
            {content.heading}
          </p>
          {(event.dateLabel ?? model.wedding.date?.long) ? (
            <WallLabel
              className="mt-8"
              lines={[
                event.title || content.heading,
                event.dateLabel ?? model.wedding.date?.long ?? "",
              ]}
            />
          ) : null}
        </div>
        <article
          data-reveal
          className="border border-inv-fg bg-inv-surface p-7 sm:p-10"
        >
          <p className="text-sm text-inv-accent">{model.strings.time}</p>
          <p className="mt-6 whitespace-nowrap font-inv-heading text-6xl leading-none tabular-nums xl:text-8xl">
            {event.timeLabel ?? "—"}
          </p>
          {event.dateLabel ? (
            <p className="mt-2 text-sm text-inv-muted">{event.dateLabel}</p>
          ) : null}
          <div className="mt-8 border-t border-inv-border pt-5">
            {event.venueName ? (
              <p className="font-inv-heading text-2xl">{event.venueName}</p>
            ) : null}
            {event.address ? (
              <p className="mt-1 text-sm text-inv-muted">{event.address}</p>
            ) : null}
            {content.note ? (
              <p className="mt-4 font-inv-accent text-lg italic">
                {content.note}
              </p>
            ) : null}
            {event.mapUrl ? (
              <p className="mt-6">
                <TextLink href={event.mapUrl}>
                  {model.strings.directions}
                </TextLink>
              </p>
            ) : null}
          </div>
        </article>
      </div>
    </Room>
  );
}

function VenueRoom({ model, content }: SectionProps<"venue">) {
  const mapped = model.events.all.filter((e) => e.mapEmbedUrl);
  if (!mapped.length) return null;
  return (
    <Room id="venue" model={model} title={content.heading} wide>
      {content.note ? (
        <p data-reveal className="mb-10 max-w-xl text-lg text-inv-fg/85">
          {content.note}
        </p>
      ) : null}
      <div className={cn("grid gap-10", mapped.length > 1 && "md:grid-cols-2")}>
        {mapped.map((event) => (
          <figure key={event.id} data-reveal>
            <div className="border border-inv-fg bg-inv-surface p-[5%]">
              {model.mode !== "export" ? (
                <MapEmbed event={event} className="aspect-[4/3] grayscale" />
              ) : null}
            </div>
            <WallLabel
              className="mt-5"
              lines={[event.venueName ?? event.title, event.address]}
            />
          </figure>
        ))}
      </div>
    </Room>
  );
}

/** A salon hang: framed photographs at varied sizes, each with its plate number. */
function Salon({ model, content }: SectionProps<"gallery">) {
  const photos = model.media.gallery.slice(0, 9);
  if (!photos.length) return null;
  const widths = [
    "md:w-[44%]",
    "md:w-[30%]",
    "md:w-[22%]",
    "md:w-[34%]",
    "md:w-[40%]",
    "md:w-[26%]",
  ];
  const ratios = [
    "aspect-[4/5]",
    "aspect-square",
    "aspect-[3/4]",
    "aspect-[4/3]",
    "aspect-[4/5]",
    "aspect-square",
  ];
  return (
    <Room id="gallery" model={model} title={content.heading} wide>
      <Title>{content.heading}</Title>
      {content.caption ? (
        <p className="mt-6 max-w-md text-inv-muted">{content.caption}</p>
      ) : null}
      <div className="mt-14 flex flex-wrap items-end gap-x-[4%] gap-y-14">
        {photos.map((photo, i) => (
          <figure
            key={photo.id}
            data-reveal
            className={cn(
              "w-[82%] md:ms-0",
              i % 2 ? "ms-auto" : "",
              widths[i % widths.length],
            )}
          >
            <Framed
              photo={photo}
              sizes="(min-width: 768px) 40vw, 80vw"
              ratio={ratios[i % ratios.length]}
            />
            <figcaption className="mt-3 text-xs text-inv-muted">
              <span className="text-inv-accent">
                {copy(model).plate} {roman(i + 1)}
              </span>{" "}
              — {photo.alt}
            </figcaption>
          </figure>
        ))}
      </div>
    </Room>
  );
}

function Programme({ model, content }: SectionProps<"schedule">) {
  const items =
    content.items.length > 0
      ? content.items
      : model.events.all
          .filter((e) => e.timeLabel)
          .map((e) => ({
            time: e.timeLabel!,
            title: e.title || (e.venueName ?? ""),
            note: e.venueName ?? "",
          }));
  return (
    <Room id="schedule" model={model} title={content.heading}>
      <Title>{content.heading}</Title>
      <ol className="mt-12">
        {items.map((item, i) => (
          <li
            key={i}
            data-reveal
            className="grid grid-cols-[5rem_1fr] gap-4 border-t border-inv-border py-5 sm:grid-cols-[8rem_1fr_1fr]"
          >
            <span className="tabular-nums text-inv-accent">{item.time}</span>
            <span className="font-inv-heading text-2xl leading-tight">
              {item.title}
            </span>
            {item.note ? (
              <span className="col-start-2 text-sm text-inv-muted sm:col-start-auto sm:text-end">
                {item.note}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </Room>
  );
}

function Opening({ model, content }: SectionProps<"rsvp">) {
  return (
    <Room id="rsvp" model={model} title={content.heading}>
      <div data-reveal className="border border-inv-fg bg-inv-surface">
        <div className="grid sm:grid-cols-[1fr_auto]">
          <div className="p-7 sm:p-12">
            <p className="text-sm text-inv-accent">{copy(model).privateView}</p>
            <p className="mt-4 font-inv-heading text-5xl leading-none sm:text-7xl">
              {content.heading}
            </p>
            {content.message ? (
              <p className="mt-6 max-w-md leading-relaxed text-inv-fg/85">
                {content.message}
              </p>
            ) : null}
            {content.deadline ? (
              <p className="mt-4 text-sm text-inv-muted">{content.deadline}</p>
            ) : null}
          </div>
          {content.linkUrl ? (
            <a
              href={content.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 border-t border-inv-fg bg-inv-fg px-10 py-6 text-inv-bg transition-colors duration-300 hover:bg-inv-accent hover:text-inv-accent-fg sm:border-s sm:border-t-0"
            >
              {content.linkLabel || content.heading}{" "}
              <span aria-hidden className="rtl:-scale-x-100">
                →
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </Room>
  );
}

function VisitorInfo({ model, content }: SectionProps<"faq">) {
  const items = content.items.filter((i) => i.question.trim());
  if (!items.length) return null;
  return (
    <Room id="faq" model={model} title={content.heading}>
      <Title>{content.heading}</Title>
      <dl className="mt-12">
        {items.map((item, i) => (
          <div
            key={i}
            data-reveal
            className="grid gap-2 border-t border-inv-border py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-10"
          >
            <dt className="font-inv-heading text-xl leading-snug">
              {item.question}
            </dt>
            <dd className="whitespace-pre-line leading-relaxed text-inv-fg/80">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </Room>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <section
      id="closing"
      data-section="closing"
      className="bg-inv-bg px-5 py-24 text-inv-fg sm:py-40"
    >
      <div className="mx-auto max-w-3xl">
        <p
          data-reveal
          className="font-inv-accent text-4xl italic leading-[1.2] sm:text-6xl"
        >
          {content.heading}
        </p>
        {content.message ? (
          <p
            data-reveal
            className="mt-8 max-w-xl text-lg leading-relaxed text-inv-muted"
          >
            {content.message}
          </p>
        ) : null}
        {content.signature ? (
          <p className="mt-8 text-sm">{content.signature}</p>
        ) : null}
      </div>
    </section>
  );
}

function Colophon({ model, content }: SectionProps<"footer">) {
  const [a, b] = model.wedding.initials;
  return (
    <footer
      data-section="footer"
      className="border-t border-inv-border bg-inv-bg px-5 py-10 text-sm text-inv-muted sm:px-10"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <span className="font-inv-heading text-xl text-inv-fg">
          {a}&amp;{b}
        </span>
        <span>
          {[model.wedding.coupleName, model.wedding.date?.year, content.note]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Note,
  date: DateRoom,
  countdown: CountdownRoom,
  story: StoryRoom,
  ceremony: (p) => (
    <Placard
      id="ceremony"
      model={p.model}
      content={p.content}
      event={p.model.events.ceremony}
      align="start"
    />
  ),
  reception: (p) => (
    <Placard
      id="reception"
      model={p.model}
      content={p.content}
      event={p.model.events.reception}
      align="end"
    />
  ),
  venue: VenueRoom,
  gallery: Salon,
  schedule: Programme,
  rsvp: Opening,
  faq: VisitorInfo,
  closing: Closing,
  footer: Colophon,
};

export default function GalerieRenderer({ model }: TemplateRendererProps) {
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

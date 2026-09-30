import type { ReactNode } from "react";
import type { EventModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { CinematicMotion } from "../cinematic/motion";
import { Countdown } from "../shared/countdown";
import { Gallery } from "../shared/gallery";
import { InvitationImage } from "../shared/invitation-image";
import { InvitationRoot, Paragraphs, Sections } from "../shared/invitation-root";
import { MapEmbed } from "../shared/map-embed";
import { MusicToggle } from "../shared/music-toggle";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../types";

/**
 * Atelier — an editorial, calligraphic layout: a colour-washed photo
 * opening, flourished script titles, tall display capitals and italic
 * serif text on grained paper, a sealed envelope for replies.
 *
 * Fonts by role: accent = the calligraphy (names, section titles),
 * heading = display capitals (sub-titles, numbers), body = the serif
 * (set in italic for prose). Colours: bg/surface = paper, fg = ink,
 * accent = the deep "room" colour used for washes and dark sections.
 */

// ── Building blocks ─────────────────────────────────────────────────────────

type Tone = "paper" | "sheet" | "room";

function Section({ id, tone = "paper", className, children }: { id: string; tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <section
      id={id}
      data-section={id}
      className={cn(
        "inv-paper px-6 py-24 text-center sm:py-32",
        "group-data-[spacing=compact]/sec:py-14 sm:group-data-[spacing=compact]/sec:py-20",
        "group-data-[spacing=airy]/sec:py-32 sm:group-data-[spacing=airy]/sec:py-44",
        tone === "paper" && "bg-inv-bg text-inv-fg",
        tone === "sheet" && "bg-inv-surface text-inv-fg",
        tone === "room" && "bg-inv-accent text-inv-accent-fg",
        className,
      )}
    >
      <div className="mx-auto max-w-2xl group-data-[align=start]/sec:text-start">{children}</div>
    </section>
  );
}

/** A flourished calligraphy title. */
function Script({ children, className, as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "p" }) {
  if (!children) return null;
  return (
    <Tag data-reveal className={cn("font-inv-accent text-6xl leading-[0.95] sm:text-8xl", className)}>
      {children}
    </Tag>
  );
}

/** Tall display capitals. */
function Caps({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return <h3 className={cn("font-inv-heading text-3xl uppercase leading-[1.05] tracking-[0.02em] sm:text-4xl", className)}>{children}</h3>;
}

/** Widely spaced small capitals. */
function Spaced({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={cn("inv-label text-[0.68rem] tracking-[0.45em] sm:text-xs", className)}>{children}</p>;
}

/** Italic serif prose. */
function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("font-inv-body text-xl italic leading-[1.7] sm:text-2xl", className)}>{children}</div>;
}

function EventDetails({ event, note, labels }: { event: EventModel; note: string; labels: { location: string; time: string; directions: string } }) {
  return (
    <div className="mt-14 grid gap-12">
      {event.venueName || event.address ? (
        <div data-reveal>
          <Caps>{labels.location}</Caps>
          <Prose className="mt-4">
            {event.venueName ? <p>{event.venueName}</p> : null}
            {event.address ? <p className="text-inv-muted">{event.address}</p> : null}
          </Prose>
          {event.mapUrl ? (
            <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block border-b border-current pb-0.5 text-xs uppercase tracking-[0.3em] opacity-80 transition hover:opacity-100">
              {labels.directions}
            </a>
          ) : null}
        </div>
      ) : null}
      {event.timeLabel || event.dateLabel ? (
        <div data-reveal>
          <Caps>{labels.time}</Caps>
          <Prose className="mt-4">
            {event.dateLabel ? <p>{event.dateLabel}</p> : null}
            {event.timeLabel ? <p>{event.timeLabel}</p> : null}
          </Prose>
        </div>
      ) : null}
      {note ? (
        <Prose className="text-inv-muted">
          <p data-reveal className="whitespace-pre-line">
            {note}
          </p>
        </Prose>
      ) : null}
    </div>
  );
}

// ── Sections ────────────────────────────────────────────────────────────────

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding, media } = model;
  return (
    <header
      id="hero"
      data-section="hero"
      className="inv-paper relative isolate flex min-h-[88svh] items-center justify-center overflow-hidden bg-inv-accent px-6 py-28 text-center text-inv-accent-fg"
    >
      {media.hero ? (
        <>
          <div data-hero-media className="absolute inset-0 -z-20 will-change-transform">
            <InvitationImage asset={media.hero} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
          {/* A wash of the room colour over the photo, deepening towards the bottom. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-inv-accent opacity-60 mix-blend-multiply" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
        </>
      ) : null}
      <div data-hero-content className="text-white">
        <Spaced className="text-white/85">{content.eyebrow}</Spaced>
        <h1 className="mt-8 font-inv-accent text-[4.6rem] leading-[1.02] sm:text-8xl lg:text-9xl">
          {wedding.partnerOne}
          <span className="mx-3 text-4xl opacity-85 sm:text-6xl">&amp;</span>
          <br className="sm:hidden" />
          {wedding.partnerTwo}
        </h1>
        {wedding.date ? <Spaced className="mt-10 text-white/90">{wedding.date.long}</Spaced> : null}
        {content.tagline ? <p className="mx-auto mt-6 max-w-md font-inv-body text-lg italic text-white/80">{content.tagline}</p> : null}
      </div>
    </header>
  );
}

function Welcome({ content }: SectionProps<"couple">) {
  return (
    <Section id="couple" tone="room" className="sm:py-40">
      <Spaced className="mb-8 opacity-75">{content.eyebrow}</Spaced>
      <Script className="text-7xl sm:text-9xl">{content.heading}</Script>
      {content.message ? (
        <p data-reveal className="mx-auto mt-12 max-w-xl font-inv-body text-lg uppercase leading-[1.7] tracking-[0.14em] opacity-90 sm:text-xl">
          {content.message}
        </p>
      ) : null}
    </Section>
  );
}

function DateSection({ model, content }: SectionProps<"date">) {
  const date = model.wedding.date;
  if (!date) return null;
  return (
    <Section id="date" tone="sheet">
      <Script>{content.heading}</Script>
      <div data-reveal className="mt-12 flex items-center justify-center gap-6 sm:gap-10">
        <Spaced className="w-24 text-inv-muted sm:w-32">{date.weekday}</Spaced>
        <span className="font-inv-heading text-8xl leading-none sm:text-9xl">{date.day}</span>
        <Spaced className="w-24 text-inv-muted sm:w-32">{date.month}</Spaced>
      </div>
      <Spaced className="mt-8">{date.year}</Spaced>
      {content.note ? <Prose className="mt-8 text-inv-muted">{content.note}</Prose> : null}
    </Section>
  );
}

function CountdownSection({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Section id="countdown" tone="paper">
      <Spaced className="text-inv-muted">{content.heading}</Spaced>
      <div data-reveal className="mt-10">
        <Countdown
          model={model}
          className="flex justify-center gap-6 sm:gap-12"
          unitClassName="flex flex-col items-center"
          valueClassName="font-inv-heading text-5xl leading-none sm:text-7xl"
          labelClassName="mt-3 text-[0.65rem] uppercase tracking-[0.35em] text-inv-muted"
        />
      </div>
    </Section>
  );
}

function Story({ content }: SectionProps<"story">) {
  return (
    <Section id="story" tone="paper">
      <Script>{content.heading}</Script>
      <Prose className="mx-auto mt-14 grid max-w-xl gap-8 text-start leading-[1.9] group-data-[align=center]/sec:text-center">
        <Paragraphs text={content.body} />
      </Prose>
      {content.quote ? (
        <figure data-reveal className="mx-auto mt-16 max-w-md">
          <blockquote className="font-inv-body text-lg italic leading-[1.9] text-inv-muted">“{content.quote}”</blockquote>
          {content.quoteSource ? <figcaption className="mt-4 font-inv-accent text-4xl">— {content.quoteSource}</figcaption> : null}
        </figure>
      ) : null}
    </Section>
  );
}

function EventSection({ id, tone, model, content, event }: { id: "ceremony" | "reception"; tone: Tone; model: SectionProps<"ceremony">["model"]; content: { heading: string; note: string }; event: EventModel | null }) {
  if (!event) return null;
  return (
    <Section id={id} tone={tone}>
      <Script>{content.heading}</Script>
      <EventDetails event={event} note={content.note} labels={{ location: model.strings.location, time: model.strings.time, directions: model.strings.directions }} />
    </Section>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = model.events.all.filter((e) => e.mapEmbedUrl);
  if (!mapped.length) return null;
  return (
    <Section id="venue" tone="paper">
      <Script>{content.heading}</Script>
      {content.note ? <Prose className="mt-8 text-inv-muted">{content.note}</Prose> : null}
      <div data-reveal className={cn("mt-12 grid gap-8", mapped.length > 1 && "md:-mx-24 md:grid-cols-2")}>
        {mapped.map((event) => (
          <figure key={event.id} className="overflow-hidden rounded-inv bg-inv-surface shadow-inv">
            {model.mode !== "export" ? <MapEmbed event={event} className="aspect-[4/3] grayscale-[0.4]" /> : null}
            <figcaption className="p-5">
              <Caps className="text-xl sm:text-2xl">{event.venueName ?? event.title}</Caps>
              {event.address ? <p className="mt-1 font-inv-body italic text-inv-muted">{event.address}</p> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function GallerySection({ model, content }: SectionProps<"gallery">) {
  const [first, second] = model.media.gallery;
  return (
    <Section id="gallery" tone="paper" className="overflow-hidden">
      <Script>{content.heading}</Script>
      {content.caption ? <Prose className="mt-6 text-inv-muted">{content.caption}</Prose> : null}
      {/* An oval portrait with an instant print laid over it. */}
      <div className="relative mx-auto mt-16 h-[34rem] max-w-md sm:h-[40rem]">
        {first ? (
          <div data-reveal className="absolute end-0 top-0 aspect-[3/4] w-[78%] overflow-hidden rounded-[50%] shadow-inv">
            <InvitationImage asset={first} fill sizes="(min-width: 640px) 22rem, 75vw" className="object-cover" />
          </div>
        ) : null}
        {second ? (
          <div data-reveal className="absolute bottom-0 start-0 w-[58%] -rotate-3 bg-white p-[3.5%] pb-[16%] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.45)]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <InvitationImage asset={second} fill sizes="(min-width: 640px) 16rem, 55vw" className="object-cover" />
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-16 md:-mx-32">
        <Gallery model={model} variant="grid" skip={2} />
      </div>
    </Section>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items =
    content.items.length > 0
      ? content.items
      : model.events.all.filter((e) => e.timeLabel).map((e) => ({ time: e.timeLabel!, title: e.title || (e.venueName ?? ""), note: e.venueName ?? "" }));
  return (
    <Section id="schedule" tone="sheet">
      <Script>{content.heading}</Script>
      <ol className="mx-auto mt-14 grid max-w-md gap-10">
        {items.map((item, i) => (
          <li key={i} data-reveal>
            <Caps>{item.time}</Caps>
            <Prose className="mt-2">{item.title}</Prose>
            {item.note ? <p className="mt-1 font-inv-body italic text-inv-muted">{item.note}</p> : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** A sealed envelope: the reply card. */
function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const backdrop = model.media.gallery[2] ?? model.media.hero;
  const [a, b] = model.wedding.initials;
  return (
    <section id="rsvp" data-section="rsvp" className="inv-paper relative isolate overflow-hidden bg-inv-bg px-6 py-24 text-center text-inv-fg sm:py-32">
      {backdrop ? (
        <div aria-hidden className="absolute inset-x-0 top-[16%] -z-10 h-[44%] opacity-35 grayscale sm:top-[18%]">
          <InvitationImage asset={backdrop} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      ) : null}
      <div data-reveal className="relative mx-auto aspect-[7/5] w-full max-w-xl bg-inv-surface shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]">
        {/* The flap and the folds, drawn in the paper's own border colour. */}
        <svg aria-hidden viewBox="0 0 700 500" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d="M0 0 L350 300 L700 0" fill="none" stroke="var(--inv-border)" strokeWidth="2" />
          <path d="M0 500 L290 250 M700 500 L410 250" fill="none" stroke="var(--inv-border)" strokeWidth="1.5" />
        </svg>
        <p className="absolute inset-x-0 top-[13%] font-inv-accent text-5xl leading-none sm:text-6xl">{content.heading}</p>
        {/* Wax seal with the couple's initials. */}
        <div
          className="absolute left-1/2 top-[60%] grid size-[17%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-inv-accent text-[clamp(1.1rem,4vw,1.8rem)] text-inv-accent-fg shadow-[0_4px_10px_rgb(0_0_0/0.35)]"
          style={{ background: "radial-gradient(circle at 38% 32%, color-mix(in oklab, var(--inv-accent) 72%, white), var(--inv-accent) 58%, color-mix(in oklab, var(--inv-accent) 70%, black))" }}
        >
          <span className="rounded-full border border-current/40 px-[18%] py-[14%] opacity-90">
            {a}
            {b}
          </span>
        </div>
      </div>
      <div className="relative mx-auto mt-10 max-w-lg">
        {content.message ? <Prose className="text-lg sm:text-xl">{content.message}</Prose> : null}
        {content.deadline ? <Spaced className="mt-6">{content.deadline}</Spaced> : null}
        {content.linkUrl ? (
          <a
            href={content.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-inv bg-inv-accent px-9 py-3.5 text-xs uppercase tracking-[0.3em] text-inv-accent-fg transition hover:opacity-90"
          >
            {content.linkLabel || content.heading}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function Faq({ content }: SectionProps<"faq">) {
  const items = content.items.filter((i) => i.question.trim());
  if (!items.length) return null;
  return (
    <section
      id="faq"
      data-section="faq"
      className="inv-paper overflow-hidden px-6 py-24 text-center text-inv-accent-fg sm:py-32"
      style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--inv-accent) 82%, var(--inv-muted)), var(--inv-accent))" }}
    >
      <div className="mx-auto max-w-xl">
        <h2 data-reveal className="font-inv-heading text-4xl uppercase leading-tight tracking-[0.22em] [overflow-wrap:anywhere] sm:text-6xl sm:tracking-[0.35em]">
          {content.heading}
        </h2>
        <dl className="mt-16 grid gap-14">
          {items.map((item, i) => (
            <div key={i} data-reveal>
              <dt>
                <Caps>{item.question}</Caps>
              </dt>
              <dd className="mt-4 whitespace-pre-line font-inv-body text-xl italic leading-[1.6] opacity-90">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Section id="closing" tone="sheet">
      <Script>{content.heading}</Script>
      {content.message ? <Prose className="mt-10 text-inv-muted">{content.message}</Prose> : null}
      {content.signature ? <p className="mt-10 font-inv-accent text-4xl">{content.signature}</p> : null}
    </Section>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className="inv-paper bg-inv-accent px-6 py-20 text-center text-inv-accent-fg">
      <p className="font-inv-accent text-5xl sm:text-6xl">
        {model.wedding.partnerOne} <span className="text-3xl opacity-80">&amp;</span> {model.wedding.partnerTwo}
      </p>
      {model.wedding.date ? <Spaced className="mt-6 opacity-80">{model.wedding.date.long}</Spaced> : null}
      {content.note ? <p className="mt-6 font-inv-body italic opacity-75">{content.note}</p> : null}
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Welcome,
  date: DateSection,
  countdown: CountdownSection,
  story: Story,
  ceremony: (p) => <EventSection id="ceremony" tone="sheet" model={p.model} content={p.content} event={p.model.events.ceremony} />,
  reception: (p) => <EventSection id="reception" tone="paper" model={p.model} content={p.content} event={p.model.events.reception} />,
  venue: Venue,
  gallery: GallerySection,
  schedule: Schedule,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function AtelierRenderer({ model }: TemplateRendererProps) {
  return (
    <InvitationRoot model={model}>
      <main>
        <Sections model={model} components={sections} />
      </main>
      <CinematicMotion model={model} />
      <MusicToggle model={model} />
    </InvitationRoot>
  );
}

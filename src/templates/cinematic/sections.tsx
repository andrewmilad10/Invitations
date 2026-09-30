import type { ReactNode } from "react";
import { Countdown } from "../shared/countdown";
import { Gallery } from "../shared/gallery";
import { InvitationImage } from "../shared/invitation-image";
import { Paragraphs } from "../shared/invitation-root";
import { MapEmbed } from "../shared/map-embed";
import type { EventModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import type { SectionComponents, SectionProps } from "../types";

// ── Building blocks ─────────────────────────────────────────────────────────

function Section({ id, children, className, tone = "bg" }: { id: string; children: ReactNode; className?: string; tone?: "bg" | "surface" }) {
  return (
    <section
      id={id}
      data-section={id}
      className={cn("px-6 py-24 sm:py-32", tone === "surface" ? "bg-inv-surface" : "bg-inv-bg", className)}
    >
      <div className="mx-auto max-w-3xl text-center">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="mb-5 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-inv-accent">{children}</p>;
}

function Heading({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return <h2 className={cn("font-inv-heading text-4xl font-light leading-tight sm:text-5xl", className)}>{children}</h2>;
}

function Ornament() {
  return (
    <div aria-hidden className="mx-auto my-8 flex items-center justify-center gap-3 text-inv-accent">
      <span className="h-px w-12 bg-current opacity-50" />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className="h-px w-12 bg-current opacity-50" />
    </div>
  );
}

function EventCard({ event, heading, note, directions }: { event: EventModel; heading: string; note: string; directions: string }) {
  return (
    <>
      <Heading>{heading}</Heading>
      <Ornament />
      {event.dateLabel ? <p className="text-sm uppercase tracking-[0.2em] text-inv-muted">{event.dateLabel}</p> : null}
      {event.timeLabel ? <p className="mt-2 font-inv-heading text-5xl font-light">{event.timeLabel}</p> : null}
      {event.venueName ? <p className="mt-6 font-inv-heading text-2xl">{event.venueName}</p> : null}
      {event.address ? <p className="mt-2 text-inv-muted">{event.address}</p> : null}
      {note ? <p className="mx-auto mt-6 max-w-lg leading-relaxed text-inv-muted">{note}</p> : null}
      {event.mapUrl ? (
        <a
          href={event.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block border border-inv-fg/30 px-6 py-3 text-xs uppercase tracking-[0.25em] transition hover:border-inv-accent hover:text-inv-accent"
        >
          {directions}
        </a>
      ) : null}
    </>
  );
}

// ── Sections ────────────────────────────────────────────────────────────────

export function CinematicHero({ model, content }: SectionProps<"hero">) {
  const { wedding, media } = model;
  return (
    <header id="hero" data-section="hero" className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-inv-fg text-inv-bg">
      {media.hero ? (
        <InvitationImage asset={media.hero} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/25 to-black/60" />
      <div className="px-6 py-24 text-center text-white">
        <Eyebrow>
          <span className="text-white/80">{content.eyebrow}</span>
        </Eyebrow>
        <h1 className="font-inv-heading text-6xl font-light leading-[0.95] sm:text-8xl">
          <span className="block">{wedding.partnerOne}</span>
          <span className="my-2 block font-inv-accent text-4xl text-white/80 sm:my-3 sm:text-5xl">&amp;</span>
          <span className="block">{wedding.partnerTwo}</span>
        </h1>
        {wedding.date ? (
          <p className="mt-10 text-xs uppercase tracking-[0.4em] text-white/85 sm:text-sm">{wedding.date.long}</p>
        ) : null}
        {content.tagline ? <p className="mx-auto mt-4 max-w-md text-white/75">{content.tagline}</p> : null}
      </div>
      <div aria-hidden className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
        {model.strings.scroll}
        <span className="h-10 w-px bg-white/50" />
      </div>
    </header>
  );
}

function Couple({ content }: SectionProps<"couple">) {
  return (
    <Section id="couple">
      <Eyebrow>{content.eyebrow}</Eyebrow>
      <Heading>{content.heading}</Heading>
      <Ornament />
      {content.message ? <p className="mx-auto max-w-xl text-lg leading-relaxed text-inv-muted">{content.message}</p> : null}
    </Section>
  );
}

function DateSection({ model, content }: SectionProps<"date">) {
  const date = model.wedding.date;
  if (!date) return null;
  return (
    <Section id="date" tone="surface">
      <Eyebrow>{content.heading}</Eyebrow>
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <span className="w-28 border-y border-inv-border py-3 text-xs uppercase tracking-[0.3em] text-inv-muted sm:w-36">{date.weekday}</span>
        <span className="font-inv-heading text-8xl font-light leading-none sm:text-9xl">{date.day}</span>
        <span className="w-28 border-y border-inv-border py-3 text-xs uppercase tracking-[0.3em] text-inv-muted sm:w-36">{date.month}</span>
      </div>
      <p className="mt-6 font-inv-heading text-3xl tracking-[0.2em]">{date.year}</p>
      {content.note ? <p className="mt-6 text-inv-muted">{content.note}</p> : null}
    </Section>
  );
}

function CountdownSection({ model, content }: SectionProps<"countdown">) {
  return (
    <Section id="countdown">
      <Heading>{content.heading}</Heading>
      <Ornament />
      <Countdown
        model={model}
        className="grid grid-cols-4 gap-2 sm:gap-6"
        unitClassName="flex flex-col items-center gap-2 border border-inv-border bg-inv-surface py-6 rounded-inv"
        valueClassName="font-inv-heading text-4xl font-light sm:text-6xl"
        labelClassName="text-[0.6rem] uppercase tracking-[0.25em] text-inv-muted sm:text-xs"
      />
    </Section>
  );
}

function Story({ content }: SectionProps<"story">) {
  return (
    <Section id="story" tone="surface">
      <Heading>{content.heading}</Heading>
      <Ornament />
      <div className="mx-auto grid max-w-xl gap-5 text-lg leading-relaxed text-inv-muted">
        <Paragraphs text={content.body} />
      </div>
    </Section>
  );
}

function Ceremony({ model, content }: SectionProps<"ceremony">) {
  const event = model.events.ceremony;
  if (!event) return null;
  return (
    <Section id="ceremony">
      <EventCard event={event} heading={content.heading} note={content.note} directions={model.strings.directions} />
    </Section>
  );
}

function Reception({ model, content }: SectionProps<"reception">) {
  const event = model.events.reception;
  if (!event) return null;
  return (
    <Section id="reception" tone="surface">
      <EventCard event={event} heading={content.heading} note={content.note} directions={model.strings.directions} />
    </Section>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = model.events.all.filter((e) => e.mapEmbedUrl);
  return (
    <Section id="venue">
      <Heading>{content.heading}</Heading>
      <Ornament />
      {content.note ? <p className="mx-auto mb-10 max-w-xl leading-relaxed text-inv-muted">{content.note}</p> : null}
      <div className={cn("grid gap-6 text-start", mapped.length > 1 && "md:grid-cols-2")}>
        {mapped.map((event) => (
          <figure key={event.id} className="overflow-hidden border border-inv-border bg-inv-surface rounded-inv">
            {model.mode !== "export" ? <MapEmbed event={event} className="aspect-[4/3]" /> : null}
            <figcaption className="p-5">
              <p className="font-inv-heading text-xl">{event.venueName ?? event.title}</p>
              {event.address ? <p className="mt-1 text-sm text-inv-muted">{event.address}</p> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function GallerySection({ model, content }: SectionProps<"gallery">) {
  return (
    <section id="gallery" data-section="gallery" className="bg-inv-surface px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <Heading>{content.heading}</Heading>
          {content.caption ? <p className="mt-4 text-inv-muted">{content.caption}</p> : null}
        </div>
        <Gallery model={model} />
      </div>
    </section>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items =
    content.items.length > 0
      ? content.items
      : model.events.all.filter((e) => e.timeLabel).map((e) => ({ time: e.timeLabel!, title: e.title || (e.venueName ?? ""), note: e.venueName ?? "" }));
  return (
    <Section id="schedule">
      <Heading>{content.heading}</Heading>
      <Ornament />
      <ol className="mx-auto max-w-md text-start">
        {items.map((item, i) => (
          <li key={i} className="grid grid-cols-[6rem_1fr] gap-6 border-b border-inv-border py-5 last:border-0">
            <span className="font-inv-heading text-xl text-inv-accent">{item.time}</span>
            <span>
              <span className="block font-medium">{item.title}</span>
              {item.note ? <span className="mt-1 block text-sm text-inv-muted">{item.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Rsvp({ content }: SectionProps<"rsvp">) {
  return (
    <Section id="rsvp" tone="surface">
      <Heading>{content.heading}</Heading>
      <Ornament />
      {content.message ? <p className="mx-auto max-w-lg leading-relaxed text-inv-muted">{content.message}</p> : null}
      {content.deadline ? <p className="mt-6 text-xs uppercase tracking-[0.3em] text-inv-accent">{content.deadline}</p> : null}
    </Section>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Section id="closing">
      <Heading>{content.heading}</Heading>
      {content.message ? <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-inv-muted">{content.message}</p> : null}
      {content.signature ? <p className="mt-8 font-inv-accent text-3xl text-inv-accent">{content.signature}</p> : null}
    </Section>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className="bg-inv-fg px-6 py-16 text-center text-inv-bg">
      <p className="font-inv-heading text-3xl font-light">{model.wedding.coupleName}</p>
      {model.wedding.date ? <p className="mt-3 text-xs uppercase tracking-[0.35em] opacity-70">{model.wedding.date.short}</p> : null}
      {content.note ? <p className="mt-6 text-sm opacity-70">{content.note}</p> : null}
    </footer>
  );
}

export const cinematicSections: SectionComponents = {
  hero: CinematicHero,
  couple: Couple,
  date: DateSection,
  countdown: CountdownSection,
  story: Story,
  ceremony: Ceremony,
  reception: Reception,
  venue: Venue,
  gallery: GallerySection,
  schedule: Schedule,
  rsvp: Rsvp,
  closing: Closing,
  footer: Footer,
};

import type { ReactNode } from "react";
import { CardHero } from "../shared/card-hero";
import { Gallery } from "../shared/gallery";
import { InvitationImage } from "../shared/invitation-image";
import { InvitationRoot, Paragraphs, Sections } from "../shared/invitation-root";
import type { EventModel } from "@/core/invitation/model";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../types";

function Block({ id, label, children }: { id: string; label?: string; children: ReactNode }) {
  return (
    <section id={id} data-section={id} className="bg-inv-bg text-inv-fg">
      <div
        className={
          "mx-auto grid max-w-5xl gap-6 border-t border-inv-border px-6 py-16 sm:grid-cols-[12rem_1fr] sm:gap-12 sm:py-24 " +
          "group-data-[spacing=compact]/sec:py-10 sm:group-data-[spacing=compact]/sec:py-14 " +
          "group-data-[spacing=airy]/sec:py-24 sm:group-data-[spacing=airy]/sec:py-36"
        }
      >
        <p className="inv-label text-inv-accent">{label}</p>
        <div>{children}</div>
      </div>
    </section>
  );
}

function EventBlock({ id, heading, note, event, directions }: { id: string; heading: string; note: string; event: EventModel; directions: string }) {
  return (
    <Block id={id} label={heading}>
      {event.timeLabel ? <p className="font-inv-heading text-4xl sm:text-5xl">{event.timeLabel}</p> : null}
      {event.dateLabel ? <p className="mt-2 text-inv-muted">{event.dateLabel}</p> : null}
      {event.venueName ? <p className="mt-6 text-xl">{event.venueName}</p> : null}
      {event.address ? <p className="mt-1 text-inv-muted">{event.address}</p> : null}
      {note ? <p className="mt-4 max-w-prose text-inv-muted">{note}</p> : null}
      {event.mapUrl ? (
        <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block border-b border-inv-accent pb-0.5 text-sm text-inv-accent">
          {directions} →
        </a>
      ) : null}
    </Block>
  );
}

const sections: SectionComponents = {
  hero: ({ model, content }: SectionProps<"hero">) =>
    model.template.hero === "card" ? (
      <CardHero model={model} content={content} />
    ) : (
    <header data-section="hero" className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-6 py-20">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.35em] text-inv-accent">{content.eyebrow}</p>
      <h1 className="mt-8 font-inv-heading text-6xl leading-[0.95] sm:text-8xl lg:text-9xl">
        {model.wedding.partnerOne}
        <span className="block font-inv-accent text-inv-accent">&amp; {model.wedding.partnerTwo}</span>
      </h1>
      <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-inv-fg pt-6">
        {model.wedding.date ? <p className="text-lg">{model.wedding.date.long}</p> : <span />}
        {content.tagline ? <p className="max-w-sm text-inv-muted">{content.tagline}</p> : null}
      </div>
      {model.media.hero ? (
        <div className="relative mt-12 aspect-[16/9] overflow-hidden">
          <InvitationImage asset={model.media.hero} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
        </div>
      ) : null}
    </header>
    ),
  couple: ({ content }: SectionProps<"couple">) => (
    <Block id="couple" label={content.eyebrow}>
      <h2 className="font-inv-heading text-4xl sm:text-5xl">{content.heading}</h2>
      {content.message ? <p className="mt-6 max-w-prose text-lg leading-relaxed text-inv-muted">{content.message}</p> : null}
    </Block>
  ),
  date: ({ model, content }: SectionProps<"date">) =>
    model.wedding.date ? (
      <Block id="date" label={content.heading}>
        <p className="font-inv-heading text-5xl sm:text-7xl">{model.wedding.date.long}</p>
        {content.note ? <p className="mt-4 text-inv-muted">{content.note}</p> : null}
      </Block>
    ) : null,
  story: ({ content }: SectionProps<"story">) => (
    <Block id="story" label={content.heading}>
      <div className="grid max-w-prose gap-5 text-lg leading-relaxed first-letter:float-start first-letter:me-2 first-letter:font-inv-heading first-letter:text-6xl first-letter:leading-none">
        <Paragraphs text={content.body} />
      </div>
    </Block>
  ),
  ceremony: ({ model, content }: SectionProps<"ceremony">) =>
    model.events.ceremony ? <EventBlock id="ceremony" heading={content.heading} note={content.note} event={model.events.ceremony} directions={model.strings.directions} /> : null,
  reception: ({ model, content }: SectionProps<"reception">) =>
    model.events.reception ? <EventBlock id="reception" heading={content.heading} note={content.note} event={model.events.reception} directions={model.strings.directions} /> : null,
  gallery: ({ model, content }: SectionProps<"gallery">) => (
    <Block id="gallery" label={content.heading}>
      <Gallery model={model} variant="grid" className="sm:grid-cols-2" />
      {content.caption ? <p className="mt-4 text-sm text-inv-muted">{content.caption}</p> : null}
    </Block>
  ),
  schedule: ({ model, content }: SectionProps<"schedule">) => {
    const items = content.items.length
      ? content.items
      : model.events.all.filter((e) => e.timeLabel).map((e) => ({ time: e.timeLabel!, title: e.title, note: e.venueName ?? "" }));
    return (
      <Block id="schedule" label={content.heading}>
        <dl className="divide-y divide-inv-border">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[7rem_1fr] gap-4 py-4 first:pt-0">
              <dt className="font-inv-heading text-xl">{item.time}</dt>
              <dd>
                {item.title}
                {item.note ? <span className="block text-sm text-inv-muted">{item.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </Block>
    );
  },
  rsvp: ({ content }: SectionProps<"rsvp">) => (
    <Block id="rsvp" label={content.heading}>
      <p className="max-w-prose text-lg">{content.message}</p>
      {content.deadline ? <p className="mt-4 text-inv-accent">{content.deadline}</p> : null}
    </Block>
  ),
  closing: ({ content }: SectionProps<"closing">) => (
    <section data-section="closing" className="mx-auto max-w-5xl border-t border-inv-border px-6 py-24 text-center">
      <h2 className="font-inv-heading text-4xl sm:text-6xl">{content.heading}</h2>
      {content.message ? <p className="mx-auto mt-6 max-w-lg text-lg text-inv-muted">{content.message}</p> : null}
      {content.signature ? <p className="mt-8 font-inv-accent text-2xl text-inv-accent">{content.signature}</p> : null}
    </section>
  ),
  footer: ({ model, content }: SectionProps<"footer">) => (
    <footer data-section="footer" className="border-t border-inv-fg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm">
        <span className="font-inv-heading text-lg">{model.wedding.coupleName}</span>
        {content.note ? <span className="text-inv-muted">{content.note}</span> : null}
        {model.wedding.date ? <span className="text-inv-muted">{model.wedding.date.short}</span> : null}
      </div>
    </footer>
  ),
};

export default function EditorialRenderer({ model }: TemplateRendererProps) {
  return (
    <InvitationRoot model={model}>
      <main>
        <Sections model={model} components={sections} />
      </main>
    </InvitationRoot>
  );
}

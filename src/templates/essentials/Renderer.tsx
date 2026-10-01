import type { ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Countdown } from "../shared/countdown";
import { InvitationImage } from "../shared/invitation-image";
import { InvitationRoot, Paragraphs, Sections } from "../shared/invitation-root";
import { MapEmbed } from "../shared/map-embed";
import { MusicToggle } from "../shared/music-toggle";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../types";
import e from "./essentials.module.css";

/**
 * The Essentials family: four calm, simple wedding websites with no opening
 * and almost no motion — the details, clearly set.
 *
 * - linen:    centred and classic: serif names, a script "&", a framed photo.
 * - monogram: the couple's initials in a double ring; details in ruled boxes.
 * - split:    the photo held on one side, the details scrolling on the other.
 * - modern:   left-aligned type, the date in large numerals, hairline rows.
 *
 * Colours: bg/surface = paper, fg = ink, muted = secondary text, accent =
 * names, rules and buttons, accent-fg = text on the accent.
 */

type V = "linen" | "monogram" | "split" | "modern";
const variantOf = (model: InvitationModel) => model.template.renderer as V;

const LABELS = {
  en: { date: "Date", time: "Time", where: "Where" },
  ar: { date: "التاريخ", time: "الوقت", where: "المكان" },
};
const labels = (model: InvitationModel) => (model.locale === "ar" ? LABELS.ar : LABELS.en);

function Block({ id, children, tone }: { id: string; children: ReactNode; tone?: "surface" }) {
  return (
    <section id={id} data-section={id} className={cn(e.block, tone === "surface" && e.surface)}>
      <div className={e.inner}>{children}</div>
    </section>
  );
}

function Heading({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <h2 className={e.h2}>{children}</h2>;
}

// ── Hero ───────────────────────────────────────────────────────────────────

function Hero({ model, content }: SectionProps<"hero">) {
  const variant = variantOf(model);
  const { wedding, media } = model;
  const place = model.events.ceremony?.venueName ?? model.events.reception?.venueName;
  // The split layout holds its photo beside the page (see EssentialsRenderer).
  const photo = media.hero && variant !== "split" ? (
    <div className={e.heroPhoto}>
      <InvitationImage asset={media.hero} alt="" fill sizes="(min-width: 720px) 640px, 100vw" priority className="object-cover" />
    </div>
  ) : null;

  return (
    <header id="hero" data-section="hero" className={e.hero}>
      <div className={e.heroText}>
        {variant === "monogram" ? (
          <span aria-hidden className={e.monogram}>
            <span>{wedding.initials[0]}</span>
            <i>&amp;</i>
            <span>{wedding.initials[1]}</span>
          </span>
        ) : null}
        {content.eyebrow ? <p className={e.eyebrow}>{content.eyebrow}</p> : null}
        <h1 className={e.names}>
          <span>{wedding.partnerOne}</span>
          <span className={e.amp}>&amp;</span>
          <span>{wedding.partnerTwo}</span>
        </h1>
        {wedding.date ? (
          variant === "modern" ? (
            <p className={e.bigDate}>{wedding.date.short}</p>
          ) : (
            <p className={e.date}>{wedding.date.long}</p>
          )
        ) : null}
        {place ? <p className={e.place}>{place}</p> : null}
        {content.tagline ? <p className={e.tagline}>{content.tagline}</p> : null}
      </div>
      {photo}
    </header>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Block id="couple">
      <Heading>{content.heading}</Heading>
      {content.message ? <p className={e.lead}>{content.message}</p> : null}
      <p className={e.sign}>{model.wedding.coupleName}</p>
    </Block>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  if (!model.wedding.date) return null;
  return (
    <Block id="date">
      <Heading>{content.heading}</Heading>
      <p className={e.lead}>{model.wedding.date.long}</p>
      {content.note ? <p className={e.muted}>{content.note}</p> : null}
    </Block>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Block id="countdown" tone="surface">
      <Heading>{content.heading}</Heading>
      <Countdown model={model} className={e.count} unitClassName={e.unit} valueClassName={e.value} labelClassName={e.label} />
    </Block>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photos = model.media.gallery.slice(0, 2);
  return (
    <Block id="story">
      <Heading>{content.heading}</Heading>
      {content.body ? <div className={e.prose}><Paragraphs text={content.body} /></div> : null}
      {photos.length ? (
        <div className={e.pair}>
          {photos.map((p) => (
            <div key={p.id} className={e.frame}>
              <InvitationImage asset={p} alt={p.alt} fill sizes="(min-width: 720px) 320px, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}
      {content.quote ? (
        <figure className={e.quoteFig}>
          <blockquote className={e.quote}>{content.quote}</blockquote>
          {content.quoteSource ? <figcaption className={e.muted}>{content.quoteSource}</figcaption> : null}
        </figure>
      ) : null}
    </Block>
  );
}

function EventBlock({ id, model, content, event }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string }; event: EventModel | null }) {
  if (!event) return null;
  const t = labels(model);
  const date = event.dateLabel ?? model.wedding.date?.long;
  return (
    <Block id={id} tone={id === "reception" ? "surface" : undefined}>
      <Heading>{content.heading || event.title}</Heading>
      <div className={e.event}>
        <dl className={e.rows}>
          {date ? <div><dt>{t.date}</dt><dd>{date}</dd></div> : null}
          {event.timeLabel ? <div><dt>{t.time}</dt><dd>{event.timeLabel}</dd></div> : null}
          <div>
            <dt>{t.where}</dt>
            <dd>
              {event.venueName ?? event.title}
              {event.address ? <span className={e.muted}>{event.address}</span> : null}
            </dd>
          </div>
        </dl>
        {content.note ? <p className={e.muted}>{content.note}</p> : null}
        {event.mapUrl ? (
          <a className={e.link} href={event.mapUrl} target="_blank" rel="noopener noreferrer">{model.strings.directions}</a>
        ) : null}
      </div>
    </Block>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = model.events.all.filter((x) => x.mapEmbedUrl);
  if (!mapped.length) return null;
  return (
    <Block id="venue">
      <Heading>{content.heading}</Heading>
      {content.note ? <p className={e.muted}>{content.note}</p> : null}
      {mapped.map((x) => (
        <figure key={x.id} className={e.mapFig}>
          {model.mode !== "export" ? <MapEmbed event={x} className={e.map} /> : null}
          <figcaption>
            <strong>{x.venueName ?? x.title}</strong>
            {x.address ? <span className={e.muted}>{x.address}</span> : null}
          </figcaption>
        </figure>
      ))}
    </Block>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items =
    content.items.length > 0
      ? content.items
      : model.events.all.filter((x) => x.timeLabel).map((x) => ({ time: x.timeLabel!, title: x.title || (x.venueName ?? ""), note: x.venueName ?? "" }));
  if (!items.length) return null;
  return (
    <Block id="schedule">
      <Heading>{content.heading}</Heading>
      <ol className={e.schedule}>
        {items.map((item, i) => (
          <li key={i}>
            <time>{item.time}</time>
            <div>
              <h3>{item.title}</h3>
              {item.note ? <p className={e.muted}>{item.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </Block>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const photos = model.media.gallery.slice(0, 9);
  if (!photos.length) return null;
  return (
    <Block id="gallery" tone="surface">
      <Heading>{content.heading}</Heading>
      {content.caption ? <p className={e.muted}>{content.caption}</p> : null}
      <div className={e.grid}>
        {photos.map((p) => (
          <div key={p.id} className={e.cell}>
            <InvitationImage asset={p} alt={p.alt} fill sizes="(min-width: 720px) 260px, 45vw" className="object-cover" />
          </div>
        ))}
      </div>
    </Block>
  );
}

function Reply({ content }: SectionProps<"rsvp">) {
  return (
    <Block id="rsvp">
      <div className={e.reply}>
        <Heading>{content.heading}</Heading>
        {content.message ? <p className={e.lead}>{content.message}</p> : null}
        {content.deadline ? <p className={e.muted}>{content.deadline}</p> : null}
        {content.linkUrl ? (
          <a className={e.btn} href={content.linkUrl} target="_blank" rel="noopener noreferrer">
            {content.linkLabel || content.heading}
          </a>
        ) : null}
      </div>
    </Block>
  );
}

function Faq({ content }: SectionProps<"faq">) {
  const items = content.items.filter((i) => i.question.trim());
  if (!items.length) return null;
  return (
    <Block id="faq" tone="surface">
      <Heading>{content.heading}</Heading>
      <dl className={e.faq}>
        {items.map((item, i) => (
          <div key={i}>
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </Block>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Block id="closing">
      <div className={e.closing}>
        <p className={e.closingLine}>{content.heading}</p>
        {content.message ? <p className={e.muted}>{content.message}</p> : null}
        {content.signature ? <p className={e.sign}>{content.signature}</p> : null}
      </div>
    </Block>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={e.footer}>
      <p>{model.wedding.coupleName}</p>
      <p className={e.muted}>{[model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <EventBlock id="ceremony" model={p.model} content={p.content} event={p.model.events.ceremony} />,
  reception: (p) => <EventBlock id="reception" model={p.model} content={p.content} event={p.model.events.reception} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Reply,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function EssentialsRenderer({ model }: TemplateRendererProps) {
  const variant = variantOf(model);
  return (
    <InvitationRoot model={model} className="font-inv-body">
      <div data-v={variant} className={e.root}>
        {variant === "split" ? (
          <aside className={e.side}>
            {model.media.hero ? (
              <InvitationImage asset={model.media.hero} alt="" fill sizes="(min-width: 900px) 50vw, 100vw" priority className="object-cover" />
            ) : (
              <span aria-hidden className={e.sideIni}>{model.wedding.initials[0]}&amp;{model.wedding.initials[1]}</span>
            )}
          </aside>
        ) : null}
        <main>
          <Sections model={model} components={sections} />
        </main>
      </div>
      <MusicToggle model={model} />
    </InvitationRoot>
  );
}

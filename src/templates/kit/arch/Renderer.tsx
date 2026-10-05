import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./arch.module.css";

/**
 * 9 · The Arch — modern Mediterranean architecture in one shape. Every
 * frame is an arch: a colonnade in the hero, nested arches around the date,
 * arched panes for the countdown, an arcade for the day, a gallery of
 * arched windows of different heights and an open doorway for the reply.
 * Motion: arches open upwards from their sill, photos drift inside them.
 *
 * Colours: bg/surface = plaster, fg = deep earth, muted = sun-washed clay
 * (side arches, fills), accent = terracotta, accent-fg = text on it.
 */

const COPY = {
  en: { door: "The door is open", arcade: "Through the arches" },
  ar: { door: "الباب مفتوح", arcade: "عبر الأقواس" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.colonnade}>
        <span className={cn(s.sideArch, s.sideA)} {...fx("archopen", 200)} aria-hidden />
        <div className={s.mainArch} {...fx("archopen")}>
          <div className={s.drift} data-k-parallax="-0.08">
            <Pic asset={heroPhoto(model)} sizes="(min-width: 900px) 34vw, 80vw" priority className={s.mainPhoto} />
          </div>
        </div>
        <span className={cn(s.sideArch, s.sideB)} {...fx("archopen", 350)} aria-hidden />
        <span className={s.outline} aria-hidden />
      </div>
      <p className={s.kicker} {...fx("rise", 300)}>{content.eyebrow || kitCopy(model).together}</p>
      <h1 className={s.names} {...fx("rise", 400)}>
        {wedding.partnerOne} <span className={s.amp}>{amp(model)}</span> {wedding.partnerTwo}
      </h1>
      <p className={s.meta} {...fx("rise", 550)}>
        <span>{wedding.date?.long}</span>
        {place?.venueName ? <span>{place.venueName}</span> : null}
      </p>
      {content.tagline ? <p className={s.tagline} {...fx("rise", 650)}>{content.tagline}</p> : null}
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.panel} {...fx("archopen")}>
        <p className={s.script}>{content.eyebrow || kitCopy(model).with}</p>
        {content.heading ? <h2 className={s.h2}>{content.heading}</h2> : null}
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        <p className={s.sign}>{model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <div className={s.nested} {...fx("archopen")}>
        <span className={s.ring1} aria-hidden />
        <span className={s.ring2} aria-hidden />
        <div className={s.nestedText}>
          {content.heading ? <p className={s.kicker}>{content.heading}</p> : null}
          <p className={s.bigDay}>{d.day}</p>
          <p className={s.monthLine}>{d.month} {d.year}</p>
          <p className={s.small}>{d.weekday}{content.note ? ` · ${content.note}` : ""}</p>
        </div>
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={cn(s.sec, s.center)}>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("rise", 120)}>
        <Clock model={model} className={s.panes} unit={s.pane} value={s.paneValue} label={s.paneLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      {p ? (
        <div className={s.storyArch} {...fx("archopen")}>
          <div className={s.drift} data-k-parallax="-0.06">
            <Pic asset={p} sizes="(min-width: 900px) 36vw, 80vw" className={s.storyPhoto} />
          </div>
        </div>
      ) : null}
      <div>
        <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).ourStory}</h2>
        {content.body ? (
          <div className={s.prose} {...fx("rise", 120)}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <blockquote className={s.quote} {...fx("rise", 200)}>
            {content.quote}
            {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
          </blockquote>
        ) : null}
      </div>
    </Sec>
  );
}

function Doorway({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.eventSec}>
      <article className={cn(s.eventArch, id === "reception" && s.eventAlt)} {...fx("archopen")}>
        <p className={s.kicker}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.h3}>{content.heading || e.title}</h2>
        {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
        {eventDate(model, e) ? <p className={s.small}>{eventDate(model, e)}</p> : null}
        <span className={s.keystone} aria-hidden />
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.small}>{e.address}</p> : null}
        {content.note ? <p className={s.note}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.link} />
      </article>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={cn(s.small, s.center)}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig} {...fx("archopen")}>
            <div className={s.mapArch}>
              <KitMap model={model} event={e} className={s.map} />
            </div>
            <figcaption>
              <b>{e.venueName ?? e.title}</b>
              {e.address ? <span>{e.address}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.sec}>
      <p className={cn(s.script, s.center)}>{copy(model).arcade}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.arcade}>
        {items.map((it, i) => (
          <li key={i} className={s.bay} style={{ "--i": i, transitionDelay: `${i * 120}ms` } as CSSProperties} {...fx("archopen")}>
            <time>{it.time}</time>
            <p className={s.bayTitle}>{it.title}</p>
            {it.note ? <p className={s.small}>{it.note}</p> : null}
          </li>
        ))}
      </ol>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 8);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.gallery}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.small, s.center)}>{content.caption}</p> : null}
      <div className={s.windows} tabIndex={0} aria-label={content.heading || kitCopy(model).gallery}>
        {list.map((p, i) => (
          <div key={p.id} className={s.window} {...fx("archopen", (i % 4) * 100)}>
            <Pic asset={p} sizes="(min-width: 900px) 25vw, 60vw" className={s.windowPhoto} />
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvpSec}>
      <div className={s.door} {...fx("archopen")}>
        <p className={s.doorKicker}>{copy(model).door}</p>
        <h2 className={s.doorTitle}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={s.doorLine}>{content.deadline}</p> : null}
        {content.message ? <p className={s.doorText}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.button} />
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).faq}</h2>
      <dl className={s.faqList}>
        {items.map((it, i) => (
          <div key={i} {...fx("rise")}>
            <dt>{it.question}</dt>
            <dd>{it.answer}</dd>
          </div>
        ))}
      </dl>
    </Sec>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.sunset} {...fx("archopen")}>
        <span className={s.sun} aria-hidden />
      </div>
      <p className={s.closingTitle} {...fx("rise")}>{content.heading}</p>
      {content.message ? <p className={s.lead} {...fx("rise", 120)}>{content.message}</p> : null}
      {content.signature ? <p className={s.sign} {...fx("fade", 200)}>{content.signature}</p> : null}
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <span className={s.footArch} aria-hidden />
      <p className={s.footNames}>{model.wedding.coupleName}</p>
      <p className={s.small}>{[model.wedding.date?.long, content.note].filter(Boolean).join(" · ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Doorway id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <Doorway id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function ArchRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="arch" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

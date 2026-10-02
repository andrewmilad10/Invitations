import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, pad2, photos, roman, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./romance.module.css";

/**
 * 1 · Editorial Romance — a fashion-editorial spread. A tall black-and-white
 * portrait with the names set huge in italic Didone, inverting where they
 * cross the photo; drop caps, numbered spreads, captioned plates. Motion:
 * slow masked line reveals and photos settling from a zoom.
 *
 * Colours: bg/surface = paper, fg = ink, muted = a dusty secondary ink,
 * accent = one deep colour for rules, numbers and the reply.
 */

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = kitCopy(model);
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <Pic asset={heroPhoto(model)} sizes="(min-width: 900px) 58vw, 100vw" priority className={s.heroPhoto} {...fx("zoom")} />
      <p className={s.vertical}>{content.eyebrow || t.together}</p>
      <h1 className={s.names}>
        <span {...fx("mask-up")}>{wedding.partnerOne}</span>
        <span {...fx("mask-up", 160)} className={s.second}>
          <i>{model.locale === "ar" ? "و" : "&"}</i> {wedding.partnerTwo}
        </span>
      </h1>
      <div className={s.heroMeta} {...fx("rise", 400)}>
        <span className={s.rule} />
        {wedding.date ? <p>{wedding.date.long}</p> : null}
        {model.events.ceremony?.venueName ? <p className={s.mutedLine}>{model.events.ceremony.venueName}</p> : null}
        {content.tagline ? <p className={s.tagline}>{content.tagline}</p> : null}
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.letter}>
      <p className={s.kicker} {...fx("fade")}>{content.eyebrow || kitCopy(model).with}</p>
      {content.heading ? <h2 className={s.h2} {...fx("rise")}>{content.heading}</h2> : null}
      {content.message ? <p className={s.dropcap} {...fx("rise", 120)}>{content.message}</p> : null}
      <p className={s.sign} {...fx("fade", 200)}>{model.wedding.coupleName}</p>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.dateBlock}>
      <p className={s.bigDay} {...fx("mask-up")}>{d.day}</p>
      <div {...fx("rise", 150)}>
        <p className={s.kicker}>{content.heading}</p>
        <p className={s.dateMonth}>{d.month} {d.year}</p>
        <p className={s.mutedLine}>{d.weekday}</p>
        {content.note ? <p className={s.mutedLine}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.countdown}>
      <p className={s.kicker} {...fx("fade")}>{content.heading || kitCopy(model).countdown}</p>
      <div {...fx("rise")}>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [first] = photos(model, 1);
  const t = kitCopy(model);
  return (
    <Sec id="story" className={s.story}>
      <figure className={s.storyFig}>
        <Pic asset={first} sizes="(min-width: 900px) 40vw, 90vw" className={s.storyPhoto} {...fx("zoom")} />
        <figcaption>{t.plate} I — {first?.alt ?? model.wedding.coupleName}</figcaption>
      </figure>
      <div className={s.storyText}>
        <p className={s.kicker} {...fx("fade")}>{t.chapter} I</p>
        <h2 className={s.h2} {...fx("rise")}>{content.heading || t.ourStory}</h2>
        {content.body ? (
          <div className={s.prose} {...fx("rise", 120)}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <blockquote className={s.pull} {...fx("rise", 200)}>
            {content.quote}
            {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
          </blockquote>
        ) : null}
      </div>
    </Sec>
  );
}

function Spread({ id, n, model, content }: { id: "ceremony" | "reception"; n: number; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={cn(s.spread, n % 2 === 0 && s.flip)}>
      <p className={s.number} {...fx("mask-up")}>{pad2(n)}</p>
      <div className={s.spreadBody}>
        <p className={s.kicker} {...fx("fade")}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.h2} {...fx("rise")}>{content.heading}</h2>
        {e.timeLabel ? <p className={s.time} {...fx("rise", 100)}>{e.timeLabel}</p> : null}
        <div className={s.facts} {...fx("rise", 180)}>
          {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
          {e.address ? <p className={s.mutedLine}>{e.address}</p> : null}
          {eventDate(model, e) ? <p className={s.mutedLine}>{eventDate(model, e)}</p> : null}
          {content.note ? <p className={s.note}>{content.note}</p> : null}
          <Directions model={model} event={e} className={s.arrowLink} />
        </div>
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.venueSec}>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={s.mutedLine}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} {...fx("rise")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption>
              <span className={s.venue}>{e.venueName ?? e.title}</span>
              {e.address ? <span className={s.mutedLine}>{e.address}</span> : null}
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
    <Sec id="schedule" className={s.schedule}>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.leaders} data-k-stagger="" {...fx("rise")}>
        {items.map((it, i) => (
          <li key={i}>
            <span className={s.leadTitle}>
              {it.title}
              {it.note ? <small>{it.note}</small> : null}
            </span>
            <span className={s.dots} aria-hidden />
            <time>{it.time}</time>
          </li>
        ))}
      </ol>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 7);
  if (!list.length) return null;
  const t = kitCopy(model);
  return (
    <Sec id="gallery" className={s.gallery}>
      <div className={s.galleryHead}>
        <h2 className={s.h2} {...fx("rise")}>{content.heading || t.gallery}</h2>
        {content.caption ? <p className={s.mutedLine}>{content.caption}</p> : null}
      </div>
      <div className={s.plates}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.plate} {...fx("rise")}>
            <Pic asset={p} sizes="(min-width: 900px) 33vw, 50vw" className={s.platePhoto} {...fx("zoom")} />
            <figcaption>{t.plate} {roman(i + 2)}</figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvp}>
      {content.deadline ? <p className={s.kicker} {...fx("fade")}>{content.deadline}</p> : null}
      <h2 className={s.rsvpTitle} {...fx("mask-up")}>{content.heading || kitCopy(model).rsvp}</h2>
      {content.message ? <p className={s.rsvpText} {...fx("rise", 120)}>{content.message}</p> : null}
      <ReplyLink content={content} className={s.replyLink} />
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  const t = kitCopy(model);
  return (
    <Sec id="faq" className={s.faq}>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || t.faq}</h2>
      <dl>
        {items.map((it, i) => (
          <div key={i} {...fx("rise")}>
            <dt><b>{t.question}</b> {it.question}</dt>
            <dd><b>{t.answer}</b> {it.answer}</dd>
          </div>
        ))}
      </dl>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  const list = photos(model);
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.closingFrame}>
        <div data-k-parallax="0.12" className={s.closingInner}>
          <Pic asset={list[list.length - 1] ?? heroPhoto(model)} sizes="100vw" className={s.closingPhoto} />
        </div>
        <span className={s.closingShade} />
      </div>
      <div className={s.closingText}>
        <p className={s.closingTitle} {...fx("mask-up")}>{content.heading}</p>
        {content.message ? <p {...fx("rise", 120)}>{content.message}</p> : null}
        {content.signature ? <p className={s.sign} {...fx("fade", 200)}>{content.signature}</p> : null}
      </div>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <p className={s.footerNames}>{model.wedding.coupleName}</p>
      <p>{[model.wedding.date?.short, content.note].filter(Boolean).join(" — ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Spread id="ceremony" n={1} model={p.model} content={p.content} />,
  reception: (p) => <Spread id="reception" n={2} model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function RomanceRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="romance" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

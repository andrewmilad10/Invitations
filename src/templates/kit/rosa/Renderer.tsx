import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { getSection } from "@/core/invitation/model";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { RosaOpening } from "./opening";
import s from "./rosa.module.css";

/**
 * Villa Rosa — a romantic garden-villa wedding in blush, dusty rose and
 * ivory. Paper-craft art rendered in 3D (public/templates/villa-rosa): a
 * blush envelope with a die-cut lace flap, the names inside a crown of
 * roses, big copperplate script headings, dusty-rose bands edged in lace for
 * the countdown, timeline and reply, a photo held in a posy, framed cards for
 * the ceremony and reception, and a lace heart to reply.
 *
 * Colours: bg = ivory page, surface = card, fg = wine ink, muted = soft ink,
 * accent = dusty rose (bands, buttons), accent-fg = text on the bands.
 */

const ar = (m: InvitationModel) => m.locale === "ar";

/** A dusty-rose band with lace along its top and bottom edges. */
function Band({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} data-section={id} className={cn(s.band, className)}>
      <span className={s.laceTop} aria-hidden />
      <div className={s.sec}>{children}</div>
      <span className={s.laceBottom} aria-hidden />
    </section>
  );
}

/** Small line drawings for the timeline (thin strokes in the band's text colour). */
function Chapel() {
  return (
    <svg className={s.icon} viewBox="0 0 60 70" aria-hidden>
      <path d="M30 2v8M26 6h8M30 10l-9 12h18L30 10zM21 22v12M39 22v12M14 34l16-10 16 10M14 34v34h32V34M25 68V54a5 5 0 0110 0v14M20 44h4M36 44h4M28 30a2 2 0 104 0 2 2 0 10-4 0" />
    </svg>
  );
}
function Glasses() {
  return (
    <svg className={s.iconSm} viewBox="0 0 60 60" aria-hidden>
      <path d="M14 8l8 2-3 16a6 6 0 01-7 4l-2-0.5M19 30l-4 16M10 46l9 2M46 8l-8 2 3 16a6 6 0 007 4l2-0.5M41 30l4 16M50 46l-9 2M30 4v6M24 6l3 4M36 6l-3 4" />
    </svg>
  );
}
function Rings() {
  return (
    <svg className={s.iconSm} viewBox="0 0 60 60" aria-hidden>
      <path d="M24 22a12 12 0 100 24 12 12 0 100-24zM36 18a12 12 0 100 24 12 12 0 100-24zM33 12l3-4 3 4-3 3z" />
    </svg>
  );
}
const ICONS = [Chapel, Glasses, Rings];

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const photo = heroPhoto(model);
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.heroHead}>
        <h1 className={s.heroNames}>
          {wedding.partnerOne} <span className={s.amp}>{ar(model) ? "و" : "&"}</span> {wedding.partnerTwo}
        </h1>
        <p className={cn(s.caps, s.soft)}>{content.tagline || (ar(model) ? "الأبد يبدأ قريبًا" : "Forever begins soon")}</p>
      </div>
      <div className={s.archWrap}>
        <span className={cn(s.posy, s.archPosyL)} aria-hidden />
        <div className={s.arch}>
          {photo ? <Pic asset={photo} priority sizes="(min-width: 640px) 340px, 80vw" className={s.archPhoto} /> : <span className={s.archEmpty} />}
        </div>
        <span className={s.heartBadge} aria-hidden>
          <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3.2 1.7-2 3.1-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" /></svg>
        </span>
        <span className={cn(s.posy, s.archPosyR)} aria-hidden />
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <div {...fx("rise")}>
        <span className={s.spray} aria-hidden />
        <p className={cn(s.caps, s.soft)}>{content.eyebrow || kitCopy(model).with}</p>
        {content.heading ? <h2 className={s.scriptSm}>{content.heading}</h2> : null}
        {content.message ? <p className={s.italic}>{content.message}</p> : null}
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <div {...fx("rise")}>
        <p className={cn(s.caps, s.soft)}>{d.weekday}</p>
        <h2 className={s.scriptSm}>{content.heading || d.long}</h2>
        {content.note ? <p className={s.italic}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <Sec id="countdown" className={s.sec}>
      <div className={s.glass} {...fx("rise")}>
        <span className={s.glassCrown} aria-hidden />
        <p className={s.caps}>{content.heading || kitCopy(model).countdown}</p>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.label} />
        <p className={s.glassDate}>{[model.wedding.date?.long, place?.venueName].filter(Boolean).join(" · ")}</p>
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photo = photos(model, 1)[0] ?? heroPhoto(model);
  if (!photo && !content.body && !content.heading) return null;
  return (
    <Sec id="story" className={s.sec}>
      <h2 className={s.script} {...fx("blur")}>{content.heading || kitCopy(model).ourStory}</h2>
      {content.body ? (
        <div className={s.prose} {...fx("rise", 120)}>
          <Paragraphs text={content.body} />
        </div>
      ) : null}
      {photo ? (
        <div className={s.portrait} {...fx("rise")}>
          <span className={cn(s.posy, s.posyTop)} aria-hidden />
          <Pic asset={photo} sizes="(min-width: 640px) 330px, 78vw" className={s.photo} />
          <span className={s.posy} aria-hidden />
        </div>
      ) : null}
      {content.quote ? (
        <blockquote className={s.quote} {...fx("rise")}>
          {content.quote}
          {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
        </blockquote>
      ) : null}
    </Sec>
  );
}

type EventId = "ceremony" | "reception";

function EventBody({ id, model, heading, note }: { id: EventId; model: InvitationModel; heading: string; note: string }) {
  const e = model.events[id]!;
  const t = kitCopy(model);
  return (
    <div className={s.eventBody}>
      <h2 className={s.scriptSm}>{heading || e.title || (id === "ceremony" ? t.ceremony : t.reception)}</h2>
      {note ? <p className={s.eventText}>{note}</p> : null}
      {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
      {e.address ? <p className={s.when}>{e.address}</p> : null}
      <p className={s.timeRule}>
        <span>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</span>
      </p>
      <Directions model={model} event={e} className={s.link} />
    </div>
  );
}

/** The ceremony and reception share one card (corner brackets, a diamond between them). */
function Event({ id, model, content }: { id: EventId; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const other: EventId = id === "ceremony" ? "reception" : "ceremony";
  const otherSection = getSection(model, other);
  const together = Boolean(otherSection && model.events[other]);
  if (together && id === "reception") return null; // drawn inside the ceremony's card
  const first = { id, ...content };
  const second = together && otherSection ? { id: other, heading: otherSection.content.heading, note: otherSection.content.note } : null;
  return (
    <Sec id={id} className={s.sec}>
      <div className={s.card} {...fx("rise")}>
        <span className={cn(s.bracket, s.bTL)} aria-hidden />
        <span className={cn(s.bracket, s.bTR)} aria-hidden />
        <span className={cn(s.bracket, s.bBL)} aria-hidden />
        <span className={cn(s.bracket, s.bBR)} aria-hidden />
        <EventBody id={first.id} model={model} heading={first.heading} note={first.note} />
        {second ? (
          <>
            <span className={s.diamond} aria-hidden />
            <div id={second.id} data-section={second.id}>
              <EventBody id={second.id} model={model} heading={second.heading} note={second.note} />
            </div>
          </>
        ) : null}
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <h2 className={s.scriptSm} {...fx("rise")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={s.italic}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig} {...fx("rise")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption>{e.venueName ?? e.title}</figcaption>
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
    <Band id="schedule">
      <h2 className={s.script} {...fx("blur")}>{content.heading || kitCopy(model).schedule}</h2>
      <div {...fx("fade")}>
        <Chapel />
      </div>
      <ol className={s.timeline}>
        {items.map((it, i) => {
          const Icon = i === 1 ? ICONS[1] : i === 3 ? ICONS[2] : undefined;
          return (
            <li key={i} {...fx("rise", 60)}>
              <time>{it.time}</time>
              <span className={s.dot} aria-hidden />
              <span className={s.what}>
                <b>{it.title}</b>
                {it.note ? <small>{it.note}</small> : null}
              </span>
              {Icon && i < items.length - 1 ? (
                <span className={s.between}>
                  <Icon />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Band>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.sec}>
      <h2 className={s.scriptSm} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.caps, s.soft)}>{content.caption}</p> : null}
      <div className={s.gallery}>
        {list.map((p, i) => (
          <div key={p.id} {...fx("rise", (i % 2) * 120)}>
            <Pic asset={p} sizes="(min-width: 640px) 260px, 44vw" className={s.galleryPhoto} />
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const a = ar(model);
  return (
    <section id="rsvp" data-section="rsvp" className={cn(s.band, s.rsvp)}>
      <span className={s.laceTop} aria-hidden />
      <div className={s.sec}>
        <h2 className={s.script} {...fx("blur")}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.message ? <p className={s.italic}>{content.message}</p> : null}
        {content.deadline ? <p className={s.deadline}>{content.deadline}</p> : null}
        {content.linkUrl ? <p className={s.tapHeart}>{a ? "اضغطوا على القلب للرد" : "Tap the heart below to reply"}</p> : null}
      </div>
      <div className={s.vee}>
        {content.linkUrl ? (
          <ReplyLink content={content} className={s.heartBtn}>
            {content.linkLabel || content.heading || kitCopy(model).rsvp}
          </ReplyLink>
        ) : (
          <span className={s.heartBtn} aria-hidden />
        )}
      </div>
    </section>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <h2 className={s.scriptSm} {...fx("rise")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.faq}>
        {items.map((it, i) => (
          <details key={i} className={s.qa}>
            <summary>{it.question}</summary>
            <p>{it.answer}</p>
          </details>
        ))}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.sec}>
      <div {...fx("rise")}>
        <span className={s.closingPosy} role="img" aria-label="A posy of paper roses" />
        {content.heading ? <p className={cn(s.caps, s.soft)}>{content.heading}</p> : null}
        {content.message ? <p className={s.italic}>{content.message}</p> : null}
        <p className={s.scriptSm}>{content.signature || model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      {[model.wedding.coupleName, model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Event id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <Event id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function RosaRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="rosa" className={s.root} after={model.mode === "export" ? null : <RosaOpening model={model} />}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

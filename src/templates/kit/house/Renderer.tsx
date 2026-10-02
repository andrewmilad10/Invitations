import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, pad2, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./house.module.css";

/**
 * 12 · Monogram House — the couple as a fashion house. Their initials set
 * into a repeating monogram canvas; a gift box whose lid lifts to show the
 * photo; the date blind-embossed; the countdown on watch dials; the day on a
 * woven care label; a lookbook for the photos; a shopping bag for the
 * reply. Motion: unhurried slides, the lid lifting, the bow drawing itself.
 *
 * Colours: bg = boutique white, surface = tissue, fg = ink, muted = a soft
 * stone for small print, accent = the house colour (the canvas, the bag),
 * accent-fg = the monogram on the canvas.
 */

const COPY = {
  en: { house: "The house of", est: "Est.", appointment: "By appointment", look: "Look", boutiques: "Our addresses", care: "Care instructions", services: "Client services", bag: "With compliments" },
  ar: { house: "دار", est: "منذ", appointment: "بموعد مسبق", look: "إطلالة", boutiques: "عناويننا", care: "تعليمات العناية", services: "خدمة الضيوف", bag: "مع التحية" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");
const letters = (m: InvitationModel) => `${m.wedding.partnerOne.trim().charAt(0)}${m.wedding.partnerTwo.trim().charAt(0)}`.toUpperCase();

/** A four-point star, the house's small mark. */
const STAR = "M0 -7 C1 -2 2 -1 7 0 C2 1 1 2 0 7 C-1 2 -2 1 -7 0 C-2 -1 -1 -2 0 -7Z";

/** The monogram canvas: the couple's initials and the star, repeated. */
function Canvas({ model, id, className }: { model: InvitationModel; id: string; className?: string }) {
  const pid = `house-canvas-${id}`;
  const l = letters(model);
  return (
    <svg aria-hidden className={cn(s.canvas, className)}>
      <defs>
        <pattern id={pid} width="64" height="64" patternUnits="userSpaceOnUse">
          <text x="16" y="25" className={s.canvasText}>{l}</text>
          <path d={STAR} transform="translate(48 18)" className={s.canvasMark} />
          <path d={STAR} transform="translate(16 50) scale(.8)" className={s.canvasMark} />
          <text x="48" y="57" className={s.canvasText}>{l}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/** Interlaced initials in a ring: the house seal. */
function Seal({ model, className }: { model: InvitationModel; className?: string }) {
  const { partnerOne, partnerTwo } = model.wedding;
  return (
    <div className={cn(s.seal, className)} aria-hidden>
      <span className={s.sealA}>{partnerOne.trim().charAt(0)}</span>
      <span className={s.sealB}>{partnerTwo.trim().charAt(0)}</span>
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const c = copy(model);
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.lockup}>
        <Seal model={model} className={s.heroSeal} />
        <p className={s.kicker} {...fx("rise", 100)}>{content.eyebrow || c.house}</p>
        <h1 className={s.wordmark} {...fx("rise", 200)}>
          <span>{wedding.partnerOne}</span>
          <i>{amp(model)}</i>
          <span>{wedding.partnerTwo}</span>
        </h1>
        <p className={s.est} {...fx("rise", 350)}>
          {c.est} {wedding.date?.year} · {wedding.date?.long}
        </p>
        {content.tagline ? <p className={s.tagline} {...fx("rise", 450)}>{content.tagline}</p> : null}
      </div>
      <div className={s.box} {...fx("lid", 300)}>
        <div className={s.boxInside}>
          <Pic asset={heroPhoto(model)} sizes="(min-width: 900px) 40vw, 90vw" priority className={s.boxPhoto} />
        </div>
        <div className={s.boxFront}>
          <Canvas model={model} id="front" />
          <span className={s.ribbonV} />
        </div>
        <div className={s.lid}>
          <Canvas model={model} id="lid" />
          <span className={s.ribbonV} />
          <svg viewBox="0 0 120 60" className={s.bow} aria-hidden>
            <path d="M60 30 C40 6 12 6 10 22 C8 38 40 40 60 30 C80 40 112 38 110 22 C108 6 80 6 60 30Z M60 30 L44 58 M60 30 L76 58" />
            <circle cx="60" cy="30" r="6" />
          </svg>
        </div>
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.letter}>
      <Seal model={model} className={s.smallSeal} />
      <p className={s.kicker} {...fx("fade")}>{content.eyebrow || kitCopy(model).with}</p>
      {content.heading ? <h2 className={s.h2} {...fx("rise")}>{content.heading}</h2> : null}
      {content.message ? <p className={s.lead} {...fx("rise", 120)}>{content.message}</p> : null}
      <p className={s.signature} {...fx("fade", 200)}>{model.wedding.coupleName}</p>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.embossSec}>
      <div className={s.embossCard} {...fx("rise")}>
        {content.heading ? <p className={s.kicker}>{content.heading}</p> : null}
        <p className={s.emboss}>{d.day}</p>
        <p className={s.embossLine}>{d.month} {d.year}</p>
        <p className={s.small}>{d.weekday}{content.note ? ` · ${content.note}` : ""}</p>
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={cn(s.sec, s.center)}>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("rise", 120)}>
        <Clock model={model} className={s.dials} unit={s.dial} value={s.dialValue} label={s.dialLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      {p ? (
        <div className={s.storyFrame} {...fx("slide")}>
          <Canvas model={model} id="story" className={s.storyCanvas} />
          <Pic asset={p} sizes="(min-width: 900px) 36vw, 80vw" className={s.storyPhoto} />
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

function Appointment({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.apptSec}>
      <article className={cn(s.appt, id === "reception" && s.apptAlt)} {...fx("slide")}>
        <div className={s.apptStrip}>
          <Canvas model={model} id={`appt-${id}`} />
          <span className={s.apptTag}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</span>
        </div>
        <div className={s.apptBody}>
          <p className={s.kicker}>{copy(model).appointment}</p>
          <h2 className={s.h3}>{content.heading || e.title}</h2>
          <div className={s.apptGrid}>
            {e.timeLabel ? <p className={s.apptTime}>{e.timeLabel}</p> : null}
            <div>
              {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
              {e.address ? <p className={s.small}>{e.address}</p> : null}
              {eventDate(model, e) ? <p className={s.small}>{eventDate(model, e)}</p> : null}
            </div>
          </div>
          {content.note ? <p className={s.note}>{content.note}</p> : null}
          <Directions model={model} event={e} className={s.textButton} />
        </div>
      </article>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <p className={cn(s.kicker, s.center)}>{copy(model).boutiques}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={cn(s.small, s.center)}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig} {...fx("slide")}>
            <KitMap model={model} event={e} className={s.map} />
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
      <div className={s.label} {...fx("drop")}>
        <span className={s.labelFold} aria-hidden />
        <p className={s.labelBrand}>{letters(model)}</p>
        <p className={s.labelTitle}>{content.heading || kitCopy(model).schedule}</p>
        <p className={s.labelSub}>{copy(model).care}</p>
        <ol className={s.labelList}>
          {items.map((it, i) => (
            <li key={i}>
              <time>{it.time}</time>
              <span>
                {it.title}
                {it.note ? <small>{it.note}</small> : null}
              </span>
            </li>
          ))}
        </ol>
        <p className={s.labelFoot}>{model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 8);
  if (!list.length) return null;
  const c = copy(model);
  return (
    <Sec id="gallery" className={s.lookbook}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.small, s.center)}>{content.caption}</p> : null}
      <div className={s.looks}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.look} style={{ "--i": i } as CSSProperties} {...fx("slide")}>
            <Pic asset={p} sizes="(min-width: 900px) 40vw, 90vw" className={s.lookPhoto} />
            <figcaption>
              <span>{c.look} {pad2(i + 1)}</span>
              <span>{p.alt}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.bagSec}>
      <div className={s.bag} {...fx("rise")}>
        <span className={s.handle} aria-hidden />
        <div className={s.bagBody}>
          <Canvas model={model} id="bag" />
          <div className={s.bagTag}>
            <p className={s.kicker}>{copy(model).bag}</p>
            <h2 className={s.h3}>{content.heading || kitCopy(model).rsvp}</h2>
            {content.deadline ? <p className={s.small}>{content.deadline}</p> : null}
            {content.message ? <p className={s.tagText}>{content.message}</p> : null}
            <ReplyLink content={content} className={s.button} />
          </div>
        </div>
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <p className={cn(s.kicker, s.center)}>{copy(model).services}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.faqList}>
        {items.map((it, i) => (
          <details key={i} className={s.qa} {...fx("rise")}>
            <summary>{it.question}</summary>
            <p>{it.answer}</p>
          </details>
        ))}
      </div>
    </Sec>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <svg viewBox="0 0 120 60" className={s.closingBow} aria-hidden {...fx("draw")}>
        <path data-draw="" pathLength={1} d="M60 30 C40 6 12 6 10 22 C8 38 40 40 60 30 C80 40 112 38 110 22 C108 6 80 6 60 30Z" />
        <path data-draw="" pathLength={1} d="M60 30 L44 58 M60 30 L76 58" style={{ "--d": 400 } as CSSProperties} />
      </svg>
      <p className={s.closingTitle} {...fx("rise")}>{content.heading}</p>
      {content.message ? <p className={s.lead} {...fx("rise", 120)}>{content.message}</p> : null}
      {content.signature ? <p className={s.signature} {...fx("fade", 200)}>{content.signature}</p> : null}
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <div className={s.footBand}><Canvas model={model} id="foot" /></div>
      <p className={s.footMark}>{model.wedding.coupleName}</p>
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
  ceremony: (p) => <Appointment id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <Appointment id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function HouseRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="house" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

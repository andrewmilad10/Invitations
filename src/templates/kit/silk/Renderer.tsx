import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./silk.module.css";

/**
 * 14 · Romantic Silk — satin, ribbon and pearls. Draped silk that slowly
 * shifts its sheen, a ribbon that draws itself across the hero, strings of
 * pearls, photos with soft feathered edges, a countdown set in pearls and
 * cards tied with a ribbon. Motion: everything arrives softly out of focus
 * and settles; the silk breathes.
 *
 * Colours: bg = satin, surface = a paler satin, fg = ink, muted = the
 * sheen (pearls, highlights), accent = the ribbon colour, accent-fg = text
 * on the ribbon.
 */

const COPY = {
  en: { tied: "Tied with love", ribbon: "The day, as it unfolds" },
  ar: { tied: "مربوطة بالحب", ribbon: "اليوم كما يمضي" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

/** A string of pearls along a gentle arc. */
function Pearls({ count = 17, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(s.pearls, className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1);
        const y = Math.sin(t * Math.PI) * -1;
        const size = 0.7 + Math.sin(t * Math.PI) * 0.35;
        return <span key={i} style={{ "--y": y, "--s": size, "--i": i } as CSSProperties} />;
      })}
    </div>
  );
}

/** A satin ribbon flowing across, drawn in when it arrives. */
function Ribbon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 600 120" preserveAspectRatio="none" className={cn(s.ribbon, className)} {...fx("draw")}>
      <path data-draw="" pathLength={1} className={s.ribbonBack} d="M-10 80 C80 10 160 10 230 60 S380 120 460 50 S560 10 610 40" />
      <path data-draw="" pathLength={1} className={s.ribbonFront} d="M-10 80 C80 10 160 10 230 60 S380 120 460 50 S560 10 610 40" style={{ "--d": 120 } as CSSProperties} />
    </svg>
  );
}

function Bow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 80" className={cn(s.bow, className)}>
      <path className={s.bowLoop} d="M60 34 C44 8 14 6 12 26 C10 44 44 46 60 34Z" />
      <path className={s.bowLoop} d="M60 34 C76 8 106 6 108 26 C110 44 76 46 60 34Z" />
      <path className={s.bowTail} d="M58 36 C52 52 44 64 34 76 L44 76 C52 64 58 52 60 40Z M62 36 C68 52 76 64 86 76 L76 76 C68 64 62 52 60 40Z" />
      <ellipse className={s.bowKnot} cx="60" cy="35" rx="7" ry="6" />
    </svg>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <span className={s.silk} aria-hidden />
      <div className={s.heroInner}>
        <Pearls className={s.heroPearls} />
        <div className={s.portrait} {...fx("blur", 200)}>
          <Pic asset={heroPhoto(model)} sizes="(min-width: 900px) 30vw, 70vw" priority className={s.portraitPhoto} />
        </div>
        <p className={s.kicker} {...fx("blur", 400)}>{content.eyebrow || kitCopy(model).together}</p>
        <h1 className={s.names}>
          <span {...fx("blur", 500)}>{wedding.partnerOne}</span>
          <i {...fx("blur", 650)}>{amp(model)}</i>
          <span {...fx("blur", 750)}>{wedding.partnerTwo}</span>
        </h1>
        <p className={s.meta} {...fx("blur", 900)}>{[wedding.date?.long, place?.venueName].filter(Boolean).join(" · ")}</p>
        {content.tagline ? <p className={s.tagline} {...fx("blur", 1000)}>{content.tagline}</p> : null}
      </div>
      <Ribbon className={s.heroRibbon} />
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.satinCard} {...fx("blur")}>
        <Pearls count={11} className={s.cardPearls} />
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
      <div className={s.tied} {...fx("blur")}>
        <span className={s.band} aria-hidden />
        <Bow className={s.dateBow} />
        <p className={s.script}>{content.heading || copy(model).tied}</p>
        <p className={s.dateDay}>{d.day}</p>
        <p className={s.dateMonth}>{d.month} {d.year}</p>
        <p className={s.small}>{d.weekday}{content.note ? ` · ${content.note}` : ""}</p>
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={cn(s.sec, s.center)}>
      <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("blur", 150)}>
        <Clock model={model} className={s.pearlClock} unit={s.bigPearl} value={s.pearlValue} label={s.pearlLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      {p ? <Pic asset={p} sizes="(min-width: 900px) 40vw, 90vw" className={s.feather} {...fx("blur")} /> : null}
      <div>
        <p className={s.script} {...fx("blur")}>{kitCopy(model).ourStory}</p>
        <h2 className={s.h2} {...fx("blur", 100)}>{content.heading || kitCopy(model).ourStory}</h2>
        {content.body ? (
          <div className={s.prose} {...fx("blur", 200)}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <blockquote className={s.quote} {...fx("blur", 250)}>
            {content.quote}
            {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
          </blockquote>
        ) : null}
      </div>
    </Sec>
  );
}

function SatinEvent({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.eventSec}>
      <article className={cn(s.eventCard, id === "reception" && s.eventAlt)} {...fx("blur")}>
        <span className={s.tab} aria-hidden />
        <p className={s.script}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.h3}>{content.heading || e.title}</h2>
        {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
        {eventDate(model, e) ? <p className={s.small}>{eventDate(model, e)}</p> : null}
        <Pearls count={7} className={s.divider} />
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
      <h2 className={cn(s.h2, s.center)} {...fx("blur")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={cn(s.small, s.center)}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig} {...fx("blur")}>
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
      <p className={cn(s.script, s.center)}>{copy(model).ribbon}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("blur")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.flow}>
        {items.map((it, i) => (
          <li key={i} {...fx("blur")}>
            <span className={s.knot} aria-hidden />
            <time>{it.time}</time>
            <p className={s.flowTitle}>{it.title}</p>
            {it.note ? <p className={s.small}>{it.note}</p> : null}
          </li>
        ))}
      </ol>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 7);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.gallery}>
      <h2 className={cn(s.h2, s.center)} {...fx("blur")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.small, s.center)}>{content.caption}</p> : null}
      <div className={s.cloud}>
        {list.map((p, i) => (
          <Pic key={p.id} asset={p} sizes="(min-width: 900px) 30vw, 60vw" className={s.cloudPhoto} style={{ "--i": i, transitionDelay: `${(i % 3) * 120}ms` } as CSSProperties} {...fx("blur")} />
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvpSec}>
      <span className={s.silk} aria-hidden />
      <div className={s.pillow} {...fx("blur")}>
        <Bow className={s.rsvpBow} />
        <h2 className={s.h2}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={s.script}>{content.deadline}</p> : null}
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
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
      <h2 className={cn(s.h2, s.center)} {...fx("blur")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.faqList}>
        {items.map((it, i) => (
          <details key={i} className={s.qa} {...fx("blur")}>
            <summary>
              <span className={s.pearlDot} aria-hidden />
              {it.question}
            </summary>
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
      <Bow className={s.closingBow} />
      <p className={s.closingTitle} {...fx("blur")}>{content.heading}</p>
      {content.message ? <p className={s.lead} {...fx("blur", 150)}>{content.message}</p> : null}
      {content.signature ? <p className={s.sign} {...fx("blur", 250)}>{content.signature}</p> : null}
      <Pearls className={s.closingPearls} />
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
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
  ceremony: (p) => <SatinEvent id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <SatinEvent id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function SilkRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="silk" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

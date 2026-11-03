import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import { AddToCalendar, Families } from "../../shared/reply/section-extras";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitRoot, KitMap, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./aurelia.module.css";

/**
 * Aurelia — a lakeside Italian suite on warm cream paper. Script names over an
 * arched photo, an olive-branch divider, a drawn-gold day timeline, chamfered
 * event cards with a map link, a hand-circled calendar and a quiet close.
 *
 * Colours: bg = warm cream paper, surface = lighter card cream, fg = ink,
 * muted = soft ink, accent = antique gold (names, rules, seals, buttons),
 * accent-fg = cream on gold.
 */

const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

/** A gold olive-sprig divider, drawn in code so it takes the theme accent. */
function Olive({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 26" className={cn(s.olive, className)}>
      <path className={s.oliveStem} d="M8 13 H112 M60 13 l-3 -4 M60 13 l3 -4" />
      {[22, 38, 54, 82, 98].map((x, i) => (
        <g key={i} className={s.oliveLeaf} transform={`translate(${x} 13)`}>
          <path d={`M0 0 q${i % 2 ? 7 : -7} -6 14 -2 q-7 6 -14 2Z`} transform={x > 60 ? "scale(-1 1)" : undefined} />
        </g>
      ))}
      <circle className={s.oliveSeed} cx="60" cy="7" r="2.4" />
    </svg>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const meta = [wedding.date?.long, place?.venueName].filter(Boolean).join(" · ");
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.arch} {...fx("scale")}>
        <Pic asset={heroPhoto(model)} sizes="(min-width: 820px) 36rem, 92vw" priority className={s.archPhoto} />
        <span className={s.archScrim} aria-hidden />
        <div className={s.archText}>
          <p className={s.eyebrow}>{content.eyebrow || kitCopy(model).together}</p>
          <h1 className={s.coverNames}>
            <span>{wedding.partnerOne}</span>
            <i>{amp(model)}</i>
            <span>{wedding.partnerTwo}</span>
          </h1>
        </div>
      </div>
      {meta ? <p className={s.meta} {...fx("rise", 150)}>{meta}</p> : null}
      {content.tagline ? <p className={s.tagline} {...fx("rise", 250)}>{content.tagline}</p> : null}
      <span className={s.arrow} aria-hidden {...fx("fade", 400)}>{"↓"}</span>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={cn(s.sec, s.center)}>
      {content.eyebrow ? <p className={s.eyebrow} {...fx("fade")}>{content.eyebrow}</p> : null}
      {content.heading ? <h2 className={s.script} {...fx("rise")}>{content.heading}</h2> : null}
      <Olive {...fx("fade", 120)} />
      {content.message ? <p className={s.lead} {...fx("rise", 160)}>{content.message}</p> : null}
      <p className={s.sign} {...fx("rise", 240)}>{model.wedding.coupleName}</p>
      <Families one={content.familyOne} two={content.familyTwo} locale={model.locale} />
    </Sec>
  );
}

/** A calendar month with the wedding day hand-circled. */
function Calendar({ model }: { model: InvitationModel }) {
  const iso = model.wedding.weddingDate;
  if (!iso) return null;
  const d = new Date(iso + (iso.length <= 10 ? "T00:00:00" : ""));
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const heads = model.locale === "ar" ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["S", "M", "T", "W", "T", "F", "S"];
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const label = `${model.wedding.date?.month ?? ""} ${model.wedding.date?.year ?? year}`.trim();
  return (
    <div className={s.cal} {...fx("rise", 160)}>
      <p className={s.calMonth}>{label}</p>
      <div className={s.calGrid}>
        {heads.map((h, i) => <span key={`h${i}`} className={s.calHead}>{h}</span>)}
        {cells.map((n, i) => (
          <span key={i} className={n === day ? s.calDay : undefined}>{n ?? ""}</span>
        ))}
      </div>
    </div>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  if (!model.wedding.date) return null;
  return (
    <Sec id="date" className={cn(s.sec, s.center)}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).date}</h2>
      <p className={s.formalDate} {...fx("fade", 120)}>{model.wedding.date.long}</p>
      <Calendar model={model} />
      {content.note ? <p className={s.small} {...fx("fade", 220)}>{content.note}</p> : null}
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={cn(s.sec, s.center)}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("rise", 120)}>
        <Clock model={model} className={s.clock} unit={s.tile} value={s.tileNum} label={s.tileLab} />
      </div>
      {content.calendar ? <div className={s.calBtn} {...fx("fade", 240)}><AddToCalendar model={model} /></div> : null}
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  return (
    <Sec id="story" className={cn(s.sec, s.center)}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).ourStory}</h2>
      <Olive {...fx("fade", 120)} />
      {content.body ? (
        <div className={cn(s.prose, s.leadWrap)} {...fx("rise", 160)}>
          <Paragraphs text={content.body} />
        </div>
      ) : null}
      {content.quote ? (
        <blockquote className={s.quote} {...fx("rise", 220)}>
          <span>{content.quote}</span>
          {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
        </blockquote>
      ) : null}
    </Sec>
  );
}

function EventCard({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <article className={s.event} {...fx("rise")}>
      <span className={s.frame} aria-hidden />
      <svg aria-hidden viewBox="0 0 48 30" className={s.eventMark}>
        <path d="M24 3 C14 3 7 11 7 22 V27 H41 V22 C41 11 34 3 24 3Z" />
        <path d="M24 10 V22 M18 16 H30" />
      </svg>
      <p className={s.eventTitle}>{content.heading || e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
      {e.timeLabel ? (
        <p className={s.eventWhen}>
          <span>{e.timeLabel}</span>
          {e.venueName ? <> &middot; <i>{e.venueName}</i></> : null}
        </p>
      ) : e.venueName ? <p className={s.eventWhen}><i>{e.venueName}</i></p> : null}
      {e.address ? <p className={s.small}>{e.address}</p> : null}
      {eventDate(model, e) ? <p className={s.small}>{eventDate(model, e)}</p> : null}
      {content.note ? <p className={s.eventNote}>{content.note}</p> : null}
      <Directions model={model} event={e} className={s.eventLink}>
        {model.strings.directions} {"↗"}
      </Directions>
    </article>
  );
}

function Events({ model, content, which }: SectionProps<"ceremony"> & { which: "ceremony" | "reception" }) {
  return (
    <Sec id={which} className={cn(s.sec, s.center)}>
      {which === "ceremony" ? <h2 className={s.script} {...fx("rise")}>{kitCopy(model).details}</h2> : null}
      <div className={s.events}>
        <EventCard id={which} model={model} content={content} />
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={cn(s.sec, s.center)}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={s.lead} {...fx("fade", 120)}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig} {...fx("rise")}>
            <div className={s.mapFrame}><KitMap model={model} event={e} className={s.map} /></div>
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
    <Sec id="schedule" className={cn(s.sec, s.center)}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.timeline} data-k-stagger {...fx("fade", 120)}>
        {items.map((it, i) => (
          <li key={i} className={s.tlRow} style={{ "--i": i } as CSSProperties}>
            <time className={s.tlTime}>{it.time}</time>
            <span className={s.tlNode} aria-hidden />
            <div className={s.tlText}>
              <p className={s.tlTitle}>{it.title}</p>
              {it.note && it.note !== it.title ? <p className={s.small}>{it.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 5);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={cn(s.sec, s.center)}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      <div className={s.collage} data-count={Math.min(list.length, 5)} {...fx("fade", 120)}>
        {list.map((p, i) => (
          <Pic key={p.id} asset={p} sizes="(min-width: 820px) 26rem, 45vw" className={cn(s.shot, i === 0 && s.shotLead)} {...fx("zoom")} />
        ))}
      </div>
      {content.caption ? <p className={s.small} {...fx("fade", 200)}>{content.caption}</p> : null}
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={cn(s.sec, s.center)}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).rsvp}</h2>
      {content.deadline ? <p className={s.eyebrow} {...fx("fade", 100)}>{content.deadline}</p> : null}
      {content.message ? <p className={s.lead} {...fx("rise", 160)}>{content.message}</p> : null}
      <ReplyLink content={content} className={cn(s.button, s.solid)} />
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={cn(s.sec, s.center)}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).faq}</h2>
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
  if (!content.heading && !content.message && !content.signature) return null;
  return (
    <Sec id="closing" className={cn(s.sec, s.center)}>
      <Olive {...fx("fade")} />
      {content.heading ? <h2 className={s.script} {...fx("rise", 100)}>{content.heading}</h2> : null}
      {content.message ? <p className={s.lead} {...fx("rise", 180)}>{content.message}</p> : null}
      {content.signature ? <p className={s.sign} {...fx("fade", 260)}>{content.signature}</p> : null}
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  const { wedding } = model;
  const meta = [wedding.date?.long, content.note].filter(Boolean).join(" · ");
  return (
    <footer data-section="footer" className={s.footer}>
      <Olive className={s.footOlive} />
      <p className={s.footLead}>{kitCopy(model).with}</p>
      <p className={s.footNames}>{wedding.coupleName}</p>
      {meta ? <p className={s.footMeta}>{meta}</p> : null}
      <p className={s.footMono}>{wedding.initials.join(" · ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Events {...p} which="ceremony" />,
  reception: (p) => <Events {...p} which="reception" />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function AureliaRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="aurelia" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

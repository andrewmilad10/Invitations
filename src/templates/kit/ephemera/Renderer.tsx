import type { CSSProperties, ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, pad2, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./ephemera.module.css";

/**
 * 8 · Vintage Paper — a box of old paper things. Grainy aged stock, a
 * deckle-edged letterpress card, a typed letter held by a paperclip, a
 * tear-off calendar page, a mechanical counter, luggage tags for the
 * ceremony and party, a ruled index card for the day, deckled snapshots and
 * a library card for replies — with an inked postmark that thumps down.
 * Motion: things are dropped and stamped onto the page.
 *
 * Colours: bg/surface = aged paper, fg = typewriter ink, muted = faded ink
 * (rules, holes, string), accent = stamp ink (red, blue or olive),
 * accent-fg = paper on the accent.
 */

const COPY = {
  en: { cordially: "You are cordially invited", pleasure: "to celebrate the marriage of", dear: "Dear friends,", due: "Date due", name: "Name", reply: "Reply", fin: "— fin —", no: "No." },
  ar: { cordially: "يسعدنا دعوتكم", pleasure: "لحضور حفل زفاف", dear: "أعزاءنا،", due: "آخر موعد", name: "الاسم", reply: "الرد", fin: "— النهاية —", no: "رقم" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

/** A torn (deckle) edge as a clip-path: small, steady irregularities on every side. */
function deckle(seed: number, steps = 18, depth = 1.1): string {
  let x = seed * 9301 + 49297;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  const pts: string[] = [];
  const j = () => (rnd() * depth).toFixed(2);
  for (let i = 0; i <= steps; i++) pts.push(`${((i / steps) * 100).toFixed(1)}% ${j()}%`);
  for (let i = 1; i <= steps; i++) pts.push(`${(100 - Number(j())).toFixed(2)}% ${((i / steps) * 100).toFixed(1)}%`);
  for (let i = steps - 1; i >= 0; i--) pts.push(`${((i / steps) * 100).toFixed(1)}% ${(100 - Number(j())).toFixed(2)}%`);
  for (let i = steps - 1; i > 0; i--) pts.push(`${j()}% ${((i / steps) * 100).toFixed(1)}%`);
  return `polygon(${pts.join(", ")})`;
}
const torn = (seed: number, steps?: number, depth?: number): CSSProperties => ({ clipPath: deckle(seed, steps, depth) });

/** An inked circular postmark with the date around it. */
function Postmark({ model, className }: { model: InvitationModel; className?: string }) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <div className={cn(s.postmark, className)} {...fx("stamp", 700)} aria-hidden>
      <span className={s.pmMonth}>{d.month}</span>
      <span className={s.pmDay}>{d.day}</span>
      <span className={s.pmYear}>{d.year}</span>
    </div>
  );
}

function Paperclip({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 64" className={cn(s.clip, className)}>
      <path d="M8 18 V50 a6 6 0 0 0 12 0 V10 a8 8 0 0 0 -16 0 V46" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** A snapshot with a white border and photo corners. */
function Snapshot({ asset, className, caption, sizes, priority, rot, children }: { asset: Parameters<typeof Pic>[0]["asset"]; className?: string; caption?: ReactNode; sizes: string; priority?: boolean; rot?: number; children?: ReactNode }) {
  return (
    <figure className={cn(s.snap, className)} style={{ "--rot": `${rot ?? 0}deg` } as CSSProperties} {...fx("drop")}>
      <Pic asset={asset} sizes={sizes} priority={priority} className={s.snapPhoto} />
      <span className={cn(s.corner, s.cTL)} aria-hidden />
      <span className={cn(s.corner, s.cTR)} aria-hidden />
      <span className={cn(s.corner, s.cBL)} aria-hidden />
      <span className={cn(s.corner, s.cBR)} aria-hidden />
      {caption ? <figcaption className={s.hand}>{caption}</figcaption> : null}
      {children}
    </figure>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const c = copy(model);
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.heroCard} style={torn(3, 22, 1)} {...fx("drop")}>
        <p className={s.typed}>— {content.eyebrow || c.cordially} —</p>
        <p className={s.smallCaps}>{c.pleasure}</p>
        <h1 className={s.names}>
          <span>{wedding.partnerOne}</span>
          <span className={s.amp}>{amp(model)}</span>
          <span>{wedding.partnerTwo}</span>
        </h1>
        <p className={s.fleuron} aria-hidden>❧</p>
        <p className={s.typed}>{wedding.date?.long}</p>
        {place ? <p className={s.typed}>{[place.timeLabel, place.venueName].filter(Boolean).join(" · ")}</p> : null}
        {content.tagline ? <p className={s.handNote}>{content.tagline}</p> : null}
      </div>
      <div className={s.heroSide}>
        <Snapshot asset={heroPhoto(model)} sizes="(min-width: 900px) 34vw, 80vw" priority rot={3} className={s.heroSnap} caption={wedding.coupleName} />
        <Postmark model={model} className={s.heroMark} />
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.letter} {...fx("drop")}>
        <Paperclip />
        {content.eyebrow ? <p className={s.smallCaps}>{content.eyebrow}</p> : null}
        <p className={s.hand}>{copy(model).dear}</p>
        {content.heading ? <h2 className={s.h2}>{content.heading}</h2> : null}
        {content.message ? <p className={s.typedBody}>{content.message}</p> : null}
        <p className={s.signature}>{model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <div className={s.calendar} {...fx("drop")}>
        <p className={s.calTop}>{d.month} · {d.year}</p>
        <p className={s.calDay}>{d.day}</p>
        <p className={s.typed}>{d.weekday}</p>
        {content.heading ? <p className={s.handNote}>{content.heading}</p> : null}
        {content.note ? <p className={s.typedSmall}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={cn(s.sec, s.center)}>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div className={s.counterWrap} {...fx("drop")}>
        <Clock model={model} className={s.counter} unit={s.wheel} value={s.digits} label={s.typedSmall} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      {p ? <Snapshot asset={p} sizes="(min-width: 900px) 30vw, 80vw" rot={-4} className={s.storySnap}><span className={s.tape} aria-hidden /></Snapshot> : null}
      <div className={s.strip} style={torn(11, 26, 1.6)} {...fx("drop")}>
        <h2 className={s.h2}>{content.heading || kitCopy(model).ourStory}</h2>
        {content.body ? (
          <div className={s.typedBody}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <blockquote className={s.quote}>
            {content.quote}
            {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
          </blockquote>
        ) : null}
      </div>
    </Sec>
  );
}

function Tag({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={cn(s.tagSec, id === "reception" && s.tagAlt)}>
      <article className={s.tag} {...fx("drop")}>
        <span className={s.string} aria-hidden />
        <p className={s.smallCaps}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.h3}>{content.heading || e.title}</h2>
        {e.timeLabel ? <p className={s.tagTime}>{e.timeLabel}</p> : null}
        {eventDate(model, e) ? <p className={s.typedSmall}>{eventDate(model, e)}</p> : null}
        {e.venueName ? <p className={s.typed}>{e.venueName}</p> : null}
        {e.address ? <p className={s.typedSmall}>{e.address}</p> : null}
        {content.note ? <p className={s.handNote}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.inkLink} />
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
      {content.note ? <p className={cn(s.typedSmall, s.center)}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e, i) => (
          <figure key={e.id} className={s.mapFig} style={{ "--rot": `${i % 2 ? 1.2 : -1.2}deg` } as CSSProperties} {...fx("drop")}>
            <div className={s.folded}>
              <KitMap model={model} event={e} className={s.map} />
            </div>
            <figcaption className={s.typedSmall}>{e.venueName ?? e.title}{e.address ? ` — ${e.address}` : ""}</figcaption>
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
      <div className={s.indexCard} {...fx("drop")}>
        <h2 className={s.cardHead}>{content.heading || kitCopy(model).schedule}</h2>
        <ol className={s.ruled}>
          {items.map((it, i) => (
            <li key={i}>
              <time className={s.handTime}>{it.time}</time>
              <span>
                {it.title}
                {it.note ? <small> — {it.note}</small> : null}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 8);
  if (!list.length) return null;
  const c = copy(model);
  return (
    <Sec id="gallery" className={s.gallery}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.handNote, s.center)}>{content.caption}</p> : null}
      <div className={s.pile}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.deckled} style={{ ...torn(20 + i, 14, 1.4), "--rot": `${[-3, 2, -1.5, 3.5, -2.5, 1.5, -3.5, 2.5][i % 8]}deg` } as CSSProperties} {...fx("drop")}>
            <Pic asset={p} sizes="(min-width: 900px) 28vw, 45vw" className={s.deckledPhoto} />
            <figcaption className={s.hand}>{c.no} {pad2(i + 1)}</figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const c = copy(model);
  return (
    <Sec id="rsvp" className={s.sec}>
      <div className={s.library} {...fx("drop")}>
        <h2 className={s.libTitle}>{content.heading || kitCopy(model).rsvp}</h2>
        <table className={s.libTable}>
          <thead>
            <tr><th>{c.due}</th><th>{c.name}</th><th>{c.reply}</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{content.deadline ? <span className={s.dueStamp} {...fx("stamp", 300)}>{content.deadline}</span> : null}</td>
              <td />
              <td />
            </tr>
            <tr><td /><td /><td /></tr>
            <tr><td /><td /><td /></tr>
          </tbody>
        </table>
        {content.message ? <p className={s.typedBody}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.stampButton} />
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
      <div className={s.slips}>
        {items.map((it, i) => (
          <div key={i} className={s.slip} style={{ "--rot": `${i % 2 ? .8 : -.8}deg` } as CSSProperties} {...fx("drop")}>
            <p className={s.typed}>{it.question}</p>
            <p className={s.typedSmall}>{it.answer}</p>
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.note} style={torn(7, 20, 1)} {...fx("drop")}>
        <p className={s.closingTitle}>{content.heading}</p>
        {content.message ? <p className={s.typedBody}>{content.message}</p> : null}
        {content.signature ? <p className={s.signature}>{content.signature}</p> : null}
      </div>
      <span className={s.seal} {...fx("stamp", 400)}>{model.wedding.initials}</span>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <p className={s.typed}>{copy(model).fin}</p>
      <p className={s.typedSmall}>{[model.wedding.coupleName, model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Tag id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <Tag id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function EphemeraRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="ephemera" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

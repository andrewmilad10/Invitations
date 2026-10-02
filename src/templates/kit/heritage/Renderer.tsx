import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, roman, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./heritage.module.css";

/**
 * 2 · Old Money — an engraved invitation on heavy cream stock. A laurel crest
 * around the monogram, names in spaced Garamond capitals, double-rule frames,
 * a club-tie stripe band, a formal "Order of the Day" with roman numerals,
 * framed prints with mats and a reply card. Motion: slow, quiet fades; the
 * laurel draws itself.
 *
 * Colours: bg/surface = cream stock, fg = ink, muted = old gold (rules,
 * ornaments), accent = the house colour (navy, racing green, claret).
 */

const COPY = {
  en: { request: "request the pleasure of your company at the marriage of", favour: "The favour of a reply is requested", accepts: "accepts with pleasure", declines: "declines with regret", name: "Name", order: "Order of the day", house: "Est." },
  ar: { request: "يتشرفون بدعوتكم لحضور حفل زفاف", favour: "نرجو التكرّم بالرد", accepts: "يسعدني الحضور", declines: "أعتذر عن الحضور", name: "الاسم", order: "برنامج اليوم", house: "" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const yearRoman = (m: InvitationModel) => (m.locale === "ar" || !m.wedding.weddingDate ? m.wedding.date?.year ?? "" : roman(Number(m.wedding.weddingDate.slice(0, 4))));

/** A laurel wreath: two branches of leaves around a circle, drawn in old gold. */
function Laurel({ className, children }: { className?: string; children?: React.ReactNode }) {
  // Leaves along a circle (r 40): the left branch climbs from the bottom
  // (105°) to the top (255°), the right one mirrors it; each leaf follows
  // the stem and leans out, alternating a little in and out.
  const leaves = (side: 1 | -1) =>
    Array.from({ length: 11 }, (_, i) => {
      const deg = side === -1 ? 105 + i * 15 : 75 - i * 15;
      const r = 40 + (i % 2 ? 2.2 : -2.2);
      const a = (deg * Math.PI) / 180;
      const x = 50 + r * Math.cos(a);
      const y = 50 + r * Math.sin(a);
      const rot = side === -1 ? deg + 90 - 30 : deg - 90 + 30;
      return <path key={`${side}${i}`} d="M0 0 C2.6 -2.6 7 -2.8 9.6 0 C7 2.8 2.6 2.6 0 0Z" transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(1)})`} style={{ "--i": i } as CSSProperties} />;
    });
  return (
    <div className={cn(s.laurel, className)}>
      <svg aria-hidden viewBox="0 0 100 100" className={s.laurelArt} {...fx("draw")}>
        <path pathLength={1} d="M39.6 88.6 A40 40 0 0 1 39.6 11.4" className={s.stem} />
        <path pathLength={1} d="M60.4 88.6 A40 40 0 0 0 60.4 11.4" className={s.stem} />
        <g className={s.leaves}>
          {leaves(1)}
          {leaves(-1)}
        </g>
      </svg>
      <div className={s.laurelInner}>{children}</div>
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = kitCopy(model);
  const c = copy(model);
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.stripes} aria-hidden />
      <div className={s.card} {...fx("fade")}>
        <Laurel>
          <span className={s.mono}>
            {wedding.initials[0]}
            <i>{model.locale === "ar" ? "و" : "&"}</i>
            {wedding.initials[1]}
          </span>
        </Laurel>
        <p className={s.italic}>{content.eyebrow || t.together}</p>
        <p className={s.caps}>{c.request}</p>
        <h1 className={s.names}>
          <span>{wedding.partnerOne}</span>
          <i>{t.and}</i>
          <span>{wedding.partnerTwo}</span>
        </h1>
        {wedding.date ? <p className={s.dateLine}>{wedding.date.long}</p> : null}
        {place?.timeLabel ? <p className={s.caps}>{place.timeLabel}</p> : null}
        {place?.venueName ? <p className={s.venue}>{place.venueName}</p> : null}
        {content.tagline ? <p className={s.italic}>{content.tagline}</p> : null}
      </div>
      {heroPhoto(model) ? (
        <div className={s.matted} {...fx("rise", 300)}>
          <Pic asset={heroPhoto(model)} sizes="(min-width: 800px) 640px, 90vw" priority className={s.heroPhoto} />
        </div>
      ) : null}
    </header>
  );
}

function Divider() {
  return (
    <svg aria-hidden viewBox="0 0 120 12" className={s.divider} {...fx("fade")}>
      <path d="M0 6 H48 M72 6 H120" stroke="currentColor" strokeWidth=".6" />
      <path d="M60 1 L65 6 L60 11 L55 6 Z" fill="none" stroke="currentColor" strokeWidth=".7" />
      <circle cx="51" cy="6" r="1" fill="currentColor" />
      <circle cx="69" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

function Title({ children, kicker }: { children: React.ReactNode; kicker?: string }) {
  return (
    <div className={s.title} {...fx("rise")}>
      {kicker ? <p className={s.caps}>{kicker}</p> : null}
      <h2 className={s.h2}>{children}</h2>
      <Divider />
    </div>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.narrow}>
      <Title kicker={content.eyebrow || undefined}>{content.heading || kitCopy(model).with}</Title>
      {content.message ? <p className={s.lead} {...fx("rise")}>{content.message}</p> : null}
      <p className={s.signature} {...fx("fade")}>{model.wedding.coupleName}</p>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={cn(s.narrow, s.dateSec)}>
      <p className={s.caps}>{content.heading}</p>
      <p className={s.bigDate} {...fx("fade")}>{d.long}</p>
      <p className={s.yearRoman} {...fx("fade", 200)}>{yearRoman(model)}</p>
      {content.note ? <p className={s.italic}>{content.note}</p> : null}
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.band}>
      <p className={s.caps}>{content.heading || kitCopy(model).countdown}</p>
      <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.narrow}>
      <Title>{content.heading || kitCopy(model).ourStory}</Title>
      {p ? (
        <div className={s.ovalMat} {...fx("fade")}>
          <Pic asset={p} sizes="320px" className={s.oval} />
        </div>
      ) : null}
      {content.body ? (
        <div className={s.prose} {...fx("rise")}>
          <Paragraphs text={content.body} />
        </div>
      ) : null}
      {content.quote ? (
        <blockquote className={s.quote} {...fx("rise")}>
          “{content.quote}”{content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
        </blockquote>
      ) : null}
    </Sec>
  );
}

function PlaceCard({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.placeWrap}>
      <article className={s.placeCard} {...fx("rise")}>
        <p className={s.caps}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.h2}>{content.heading}</h2>
        <Divider />
        {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
        {eventDate(model, e) ? <p className={s.italic}>{eventDate(model, e)}</p> : null}
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.small}>{e.address}</p> : null}
        {content.note ? <p className={s.italic}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.smallLink} />
      </article>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.wide}>
      <Title>{content.heading || kitCopy(model).venue}</Title>
      {content.note ? <p className={cn(s.italic, s.center)}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFrame} {...fx("fade")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption>
              <span className={s.venue}>{e.venueName ?? e.title}</span>
              {e.address ? <span className={s.small}>{e.address}</span> : null}
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
    <Sec id="schedule" className={s.narrow}>
      <Title kicker={copy(model).order}>{content.heading || kitCopy(model).schedule}</Title>
      <ol className={s.programme} data-k-stagger="" {...fx("rise")}>
        {items.map((it, i) => (
          <li key={i}>
            <span className={s.numeral}>{model.locale === "ar" ? i + 1 : roman(i + 1)}.</span>
            <span className={s.progTitle}>{it.title}</span>
            <time className={s.italic}>{it.time}</time>
            {it.note ? <span className={s.small}>{it.note}</span> : null}
          </li>
        ))}
      </ol>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.wide}>
      <Title>{content.heading || kitCopy(model).gallery}</Title>
      {content.caption ? <p className={cn(s.italic, s.center)}>{content.caption}</p> : null}
      <div className={s.prints} data-k-stagger="" {...fx("rise")}>
        {list.map((p) => (
          <div key={p.id} className={s.print}>
            <Pic asset={p} sizes="(min-width: 900px) 30vw, 45vw" className={s.printPhoto} />
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const c = copy(model);
  return (
    <Sec id="rsvp" className={s.rsvp}>
      <div className={s.replyCard} {...fx("rise")}>
        <p className={s.italic}>{c.favour}</p>
        {content.deadline ? <p className={s.caps}>{content.deadline}</p> : null}
        <h2 className={s.h2}>{content.heading || kitCopy(model).rsvp}</h2>
        <div aria-hidden className={s.formLines}>
          <p>{c.name} <span /></p>
          <p>☐ {c.accepts}</p>
          <p>☐ {c.declines}</p>
        </div>
        {content.message ? <p className={s.small}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.button} />
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.wide}>
      <Title>{content.heading || kitCopy(model).faq}</Title>
      <dl className={s.faqList}>
        {items.map((it, i) => (
          <div key={i} {...fx("fade")}>
            <dt className={s.caps}>{it.question}</dt>
            <dd>{it.answer}</dd>
          </div>
        ))}
      </dl>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.stripes} aria-hidden />
      <Laurel className={s.smallLaurel}>
        <span className={s.monoSmall}>{model.wedding.initials[0]}{model.wedding.initials[1]}</span>
      </Laurel>
      <p className={s.closingTitle} {...fx("fade")}>{content.heading}</p>
      {content.message ? <p className={s.lead}>{content.message}</p> : null}
      {content.signature ? <p className={s.signature}>{content.signature}</p> : null}
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <p className={s.footerMono}>{model.wedding.initials[0]} · {model.wedding.initials[1]}</p>
      <p>{model.wedding.coupleName}</p>
      <p className={s.small}>{[model.locale === "ar" ? null : `${copy(model).house} ${yearRoman(model)}`, content.note].filter(Boolean).join(" — ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <PlaceCard id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <PlaceCard id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function HeritageRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="heritage" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

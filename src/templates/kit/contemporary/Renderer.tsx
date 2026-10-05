import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, pad2, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./contemporary.module.css";

/**
 * 13 · Contemporary Editorial — art-directed and loud in a good way. Huge
 * extra-wide grotesk names with a photo dropped between the lines, a
 * spinning "save the date" sticker, ticker tapes of names running across
 * the page, outlined numerals, colour-block event panels, an offset photo
 * collage and a giant outlined RSVP. Motion: running tickers, skewed
 * slide-ins and a slowly rotating sticker.
 *
 * Colours: bg = paper, surface = a tint, fg = ink, muted = the second
 * colour (blocks, stickers), accent = the loud colour, accent-fg = text on
 * the loud colour.
 */

const COPY = {
  en: { save: "Save the date", reply: "Reply", by: "by" },
  ar: { save: "احفظوا التاريخ", reply: "الرد", by: "قبل" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

/** A tape of text running across the page forever (static without motion). */
function Ticker({ items, reverse, className }: { items: string[]; reverse?: boolean; className?: string }) {
  const run = items.filter(Boolean);
  const row = (hidden?: boolean) => (
    <span className={s.tickerRow} aria-hidden={hidden || undefined}>
      {Array.from({ length: 3 }).flatMap((_, j) => run.map((t, i) => <span key={`${j}-${i}`}>{t}<i aria-hidden>✺</i></span>))}
    </span>
  );
  return (
    <div className={cn(s.ticker, reverse && s.tickerReverse, className)}>
      <div className={s.tickerTrack}>
        {row()}
        {row(true)}
      </div>
    </div>
  );
}

/** A round sticker with the date running around its edge. */
function Sticker({ model, className }: { model: InvitationModel; className?: string }) {
  const text = `${copy(model).save} · ${model.wedding.date?.short ?? ""} · `;
  return (
    <div className={cn(s.sticker, className)} aria-hidden>
      <svg viewBox="0 0 200 200" className={s.stickerSpin}>
        <defs>
          <path id="contemporary-ring" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
        </defs>
        <text className={s.stickerText}>
          <textPath href="#contemporary-ring" startOffset="0" textLength="460">{text.repeat(2)}</textPath>
        </text>
      </svg>
      <span className={s.stickerCore}>{model.wedding.date?.day}</span>
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <p className={s.eyebrow} {...fx("skew")}>{content.eyebrow || kitCopy(model).together}</p>
      <h1 className={s.names}>
        <span className={s.line1} {...fx("skew", 100)}>{wedding.partnerOne}</span>
        <span className={s.heroPhotoWrap} {...fx("scale", 300)}>
          <Pic asset={heroPhoto(model)} sizes="(min-width: 900px) 30vw, 60vw" priority className={s.heroPhoto} />
        </span>
        <span className={s.amp} {...fx("fade", 400)}>{amp(model)}</span>
        <span className={s.line2} {...fx("skew", 200)}>{wedding.partnerTwo}</span>
      </h1>
      <Sticker model={model} className={s.heroSticker} />
      {content.tagline ? <p className={s.tagline} {...fx("rise", 500)}>{content.tagline}</p> : null}
      <Ticker items={[wedding.coupleName, wedding.date?.long ?? "", (model.events.ceremony ?? model.events.reception)?.venueName ?? ""]} className={s.heroTicker} />
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.statementSec}>
      <p className={s.pill} {...fx("skew")}>{content.eyebrow || kitCopy(model).with}</p>
      {content.heading ? <h2 className={s.h2} {...fx("skew", 100)}>{content.heading}</h2> : null}
      {content.message ? <p className={s.statement} {...fx("rise", 150)}>{content.message}</p> : null}
      <p className={s.sign}>— {model.wedding.coupleName}</p>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d || !model.wedding.weddingDate) return null;
  const [y, m, day] = model.wedding.weddingDate.slice(0, 10).split("-");
  return (
    <Sec id="date" className={s.dateSec}>
      <p className={s.pill}>{content.heading || copy(model).save}</p>
      <p className={s.outlineDate} {...fx("skew")}>
        <span>{day}</span>
        <span className={s.slash}>/</span>
        <span>{m}</span>
        <span className={s.slash}>/</span>
        <span>{y.slice(2)}</span>
      </p>
      <p className={s.small}>{d.long}{content.note ? ` — ${content.note}` : ""}</p>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.sec}>
      <h2 className={s.h2} {...fx("skew")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("rise", 120)}>
        <Clock model={model} className={s.tiles} unit={s.tile} value={s.tileValue} label={s.tileLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [a, b] = photos(model, 2);
  return (
    <Sec id="story" className={s.story}>
      <div className={s.collage}>
        {a ? <Pic asset={a} sizes="(min-width: 900px) 30vw, 70vw" className={s.collageA} {...fx("skew")} /> : null}
        {b ? <Pic asset={b} sizes="(min-width: 900px) 22vw, 50vw" className={s.collageB} {...fx("skew", 200)} /> : null}
      </div>
      <div className={s.storyText}>
        <h2 className={s.h2} {...fx("skew")}>{content.heading || kitCopy(model).ourStory}</h2>
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

function Block({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={cn(s.block, id === "reception" && s.blockAlt)}>
      <div className={s.blockInner}>
        <p className={s.blockLabel} {...fx("skew")}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <p className={s.blockTime} {...fx("skew", 100)}>{e.timeLabel}</p>
        <div className={s.blockSide} {...fx("rise", 200)}>
          <h2 className={s.h3}>{content.heading || e.title}</h2>
          {e.venueName ? <p className={s.blockVenue}>{e.venueName}</p> : null}
          {e.address ? <p>{e.address}</p> : null}
          {eventDate(model, e) ? <p>{eventDate(model, e)}</p> : null}
          {content.note ? <p className={s.blockNote}>{content.note}</p> : null}
          <Directions model={model} event={e} className={s.blockLink}>
            {model.strings.directions} ↗
          </Directions>
        </div>
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <h2 className={s.h2} {...fx("skew")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={s.small}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e, i) => (
          <figure key={e.id} className={s.mapFig} {...fx("rise")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption>
              <span className={s.num}>{pad2(i + 1)}</span>
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
      <h2 className={s.h2} {...fx("skew")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.track}>
        {items.map((it, i) => (
          <li key={i} {...fx("skew", i * 90)}>
            <span className={s.trackNo}>{pad2(i + 1)}</span>
            <time>{it.time}</time>
            <p className={s.trackTitle}>{it.title}</p>
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
      <h2 className={s.h2} {...fx("skew")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={s.small}>{content.caption}</p> : null}
      <div className={s.mosaic}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.tileFig} style={{ "--r": `${[-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.5][i % 8]}deg` } as CSSProperties} {...fx("rise")}>
            <Pic asset={p} sizes="(min-width: 900px) 25vw, 50vw" className={s.mosaicPhoto} />
            <figcaption className={s.num}>{pad2(i + 1)}</figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvpSec}>
      <p className={s.rsvpGiant} aria-hidden {...fx("skew")}>{content.heading || kitCopy(model).rsvp}</p>
      <div className={s.rsvpCard} {...fx("rise", 150)}>
        <h2 className={s.h3}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={s.pill}>{content.deadline}</p> : null}
        {content.message ? <p>{content.message}</p> : null}
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
      <h2 className={s.h2} {...fx("skew")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.faqList}>
        {items.map((it, i) => (
          <details key={i} className={s.qa} {...fx("rise")}>
            <summary>
              <span>{it.question}</span>
              <i aria-hidden />
            </summary>
            <p>{it.answer}</p>
          </details>
        ))}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <Ticker items={[content.heading, model.wedding.coupleName]} reverse className={s.closingTicker} />
      <div className={s.closingBody}>
        {content.message ? <p className={s.statement} {...fx("rise")}>{content.message}</p> : null}
        {content.signature ? <p className={s.sign}>{content.signature}</p> : null}
      </div>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <span>{model.wedding.coupleName}</span>
      <span>{[model.wedding.date?.short, content.note].filter(Boolean).join(" — ")}</span>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Block id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <Block id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function ContemporaryRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="contemporary" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { Fern, Frond, GlassFrame, SplitLeaf } from "./leaves";
import s from "./glasshouse.module.css";

/**
 * 11 · Botanical — a Victorian glasshouse. Your photo seen through the
 * glazing of a domed conservatory, oversized leaves that sway and drift as
 * you scroll, frosted-glass panels, the date on a terracotta pot with a
 * sprout, the countdown in a glazed frame, a climbing vine for the day,
 * a wall of glazed photographs and gabled cold-frame cards. Motion: fog
 * clearing from the glass, leaves in a breeze, parallax.
 *
 * Colours: bg/surface = glasshouse light, fg = iron and ink, muted = the
 * leaf colour, accent = deep green (or terracotta), accent-fg = text on it.
 */

const COPY = {
  en: { planted: "Planted on", grow: "How the day grows", note: "a note from the potting bench" },
  ar: { planted: "يُزرع في", grow: "كيف ينمو اليوم", note: "ملاحظة من طاولة الزرع" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.houseWrap} {...fx("blur")}>
        <div className={s.houseGlass}>
          <Pic asset={heroPhoto(model)} sizes="(min-width: 900px) 60vw, 100vw" priority className={s.housePhoto} />
        </div>
        <GlassFrame className={s.houseFrame} />
        <div className={s.leafL} data-k-parallax="0.06"><SplitLeaf className={s.sway} /></div>
        <div className={s.leafR} data-k-parallax="0.1"><Frond className={s.swayAlt} /></div>
      </div>
      <p className={s.kicker} {...fx("rise", 300)}>{content.eyebrow || kitCopy(model).together}</p>
      <h1 className={s.names} {...fx("rise", 400)}>
        {wedding.partnerOne} <i>{amp(model)}</i> {wedding.partnerTwo}
      </h1>
      <p className={s.meta} {...fx("rise", 550)}>
        {[wedding.date?.long, place?.venueName].filter(Boolean).join(" · ")}
      </p>
      {content.tagline ? <p className={s.hand} {...fx("rise", 650)}>{content.tagline}</p> : null}
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.shade}>
      <div className={s.bgLeaf1} data-k-parallax="0.12"><SplitLeaf /></div>
      <div className={s.bgLeaf2} data-k-parallax="-0.08"><Fern /></div>
      <div className={s.frost} {...fx("blur")}>
        <p className={s.kicker}>{content.eyebrow || kitCopy(model).with}</p>
        {content.heading ? <h2 className={s.h2}>{content.heading}</h2> : null}
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        <p className={s.hand}>{model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={cn(s.sec, s.center)}>
      <div className={s.potWrap}>
        <svg aria-hidden viewBox="0 0 120 90" className={s.sprout} {...fx("draw")}>
          <path data-draw="" pathLength={1} className={s.stemLine} d="M60 90 C60 60 58 40 62 20" />
          <path data-draw-fill="" className={s.leafFill} d="M61 46 C40 44 28 30 30 18 C46 18 58 30 61 46Z" />
          <path data-draw-fill="" className={s.leafFill} d="M62 32 C80 30 94 18 92 4 C76 4 64 16 62 32Z" style={{ "--d": 200 } as CSSProperties} />
        </svg>
        <div className={s.pot} {...fx("rise")}>
          <span className={s.potRim} />
          <p className={s.potLabel}>{content.heading || copy(model).planted}</p>
          <p className={s.potDay}>{d.day}</p>
          <p className={s.potMonth}>{d.month} {d.year}</p>
        </div>
      </div>
      <p className={s.small}>{d.weekday}{content.note ? ` · ${content.note}` : ""}</p>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={cn(s.sec, s.center)}>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div className={s.glazing} {...fx("blur", 120)}>
        <Clock model={model} className={s.glazingGrid} unit={s.glassPane} value={s.paneValue} label={s.paneLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      {p ? (
        <div className={s.glazedPhoto} {...fx("blur")}>
          <Pic asset={p} sizes="(min-width: 900px) 40vw, 90vw" className={s.storyPhoto} />
          <span className={s.muntins} aria-hidden />
          <div className={s.storyLeaf}><Fern className={s.sway} /></div>
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
            <small>{copy(model).note}</small>
            {content.quote}
            {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
          </blockquote>
        ) : null}
      </div>
    </Sec>
  );
}

function ColdFrame({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.frameSec}>
      <article className={cn(s.gable, id === "reception" && s.gableAlt)} {...fx("blur")}>
        <p className={s.kicker}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.h3}>{content.heading || e.title}</h2>
        {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
        {eventDate(model, e) ? <p className={s.small}>{eventDate(model, e)}</p> : null}
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.small}>{e.address}</p> : null}
        {content.note ? <p className={s.hand}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.pill} />
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
          <figure key={e.id} className={s.mapFig} {...fx("blur")}>
            <div className={s.mapGlass}>
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
      <p className={cn(s.hand, s.center)}>{copy(model).grow}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.vine}>
        {items.map((it, i) => (
          <li key={i} {...fx("rise")}>
            <svg aria-hidden viewBox="0 0 40 24" className={s.vineLeaf}>
              <path className={s.leafFill} d="M2 20 C8 6 24 0 38 4 C30 16 18 22 2 20Z" />
            </svg>
            <time>{it.time}</time>
            <p className={s.vineTitle}>{it.title}</p>
            {it.note ? <p className={s.small}>{it.note}</p> : null}
          </li>
        ))}
      </ol>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 9);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.gallery}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.small, s.center)}>{content.caption}</p> : null}
      <div className={s.wall}>
        {list.map((p) => (
          <div key={p.id} className={s.wallPane} {...fx("blur")}>
            <Pic asset={p} sizes="(min-width: 900px) 30vw, 50vw" className={s.wallPhoto} />
            <span className={s.muntins} aria-hidden />
          </div>
        ))}
        <div className={s.wallLeaf} data-k-parallax="0.1"><SplitLeaf className={s.swayAlt} /></div>
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.shade}>
      <div className={s.bgLeaf3} data-k-parallax="0.1"><Frond /></div>
      <div className={cn(s.frost, s.rsvp)} {...fx("blur")}>
        <Fern className={s.rsvpFern} />
        <h2 className={s.h2}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={s.hand}>{content.deadline}</p> : null}
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
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.faqGrid}>
        {items.map((it, i) => (
          <div key={i} className={s.faqPane} {...fx("blur")}>
            <p className={s.faqQ}>{it.question}</p>
            <p className={s.faqA}>{it.answer}</p>
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.closeLeafL}><SplitLeaf className={s.sway} /></div>
      <div className={s.closeLeafR}><Frond className={s.swayAlt} /></div>
      <p className={s.closingTitle} {...fx("blur")}>{content.heading}</p>
      {content.message ? <p className={s.lead} {...fx("rise", 120)}>{content.message}</p> : null}
      {content.signature ? <p className={s.hand} {...fx("fade", 200)}>{content.signature}</p> : null}
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
  ceremony: (p) => <ColdFrame id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <ColdFrame id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function GlasshouseRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="glasshouse" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

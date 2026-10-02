import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { BowTie } from "./bow-tie";
import { BlackTieOpening } from "./opening";
import s from "./blacktie.module.css";

/**
 * 5 · Black Tie — an evening affair. Near-black with a spotlight from above,
 * names in wide-set Didone capitals with a script "and", champagne hairlines,
 * diamond separators and bevel-cornered ivory cards for the details. Opens
 * on a pair of satin lapels that part when the bow tie is tapped. Motion:
 * slow blur-ins and a spotlight that follows the scroll.
 *
 * Colours: bg = night, surface = a lifted black, fg = ivory (also the card
 * stock), muted = a soft grey-champagne for labels, accent = champagne or
 * silver (rules, numbers, the reply button).
 */

const COPY = {
  en: { evening: "An evening celebration", programme: "The programme", favour: "The favour of a reply", until: "Until the evening" },
  ar: { evening: "أمسية احتفال", programme: "برنامج السهرة", favour: "نرجو التكرّم بالرد", until: "حتى المساء" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const and = (m: InvitationModel) => (m.locale === "ar" ? "و" : "and");

function Diamond() {
  return <span className={s.diamond} aria-hidden />;
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <span className={s.spot} aria-hidden data-k-progress="" />
      <div className={s.heroInner}>
        <BowTie className={s.heroBow} />
        <p className={s.kicker} {...fx("blur")}>{content.eyebrow || kitCopy(model).together}</p>
        <h1 className={s.names}>
          <span {...fx("blur", 250)}>{wedding.partnerOne}</span>
          <span className={s.and} {...fx("fade", 600)}>{and(model)}</span>
          <span {...fx("blur", 400)}>{wedding.partnerTwo}</span>
        </h1>
        <div className={s.doubleRule} {...fx("line", 700)} />
        <p className={s.heroDate} {...fx("blur", 800)}>{wedding.date?.long}</p>
        <p className={s.small} {...fx("blur", 900)}>
          {[place?.timeLabel, place?.venueName].filter(Boolean).join(" · ")}
        </p>
        {content.tagline ? <p className={s.tagline} {...fx("blur", 1000)}>{content.tagline}</p> : null}
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  const photo = heroPhoto(model);
  return (
    <Sec id="couple" className={s.couple}>
      {photo ? (
        <div className={s.portraitWrap} {...fx("blur")}>
          <Pic asset={photo} sizes="(min-width: 900px) 30vw, 70vw" className={s.portrait} />
        </div>
      ) : null}
      <div className={s.coupleText}>
        <p className={s.kicker} {...fx("fade")}>{content.eyebrow || copy(model).evening}</p>
        {content.heading ? <h2 className={s.h2} {...fx("blur")}>{content.heading}</h2> : null}
        {content.message ? <p className={s.lead} {...fx("blur", 120)}>{content.message}</p> : null}
        <p className={s.script} {...fx("fade", 240)}>{model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.dateBand}>
      {content.heading ? <p className={s.kicker}>{content.heading}</p> : null}
      <div className={s.dateRow} data-k-stagger="" {...fx("rise")}>
        <span>{d.weekday}</span>
        <b>{d.day}</b>
        <span>{d.month} {d.year}</span>
      </div>
      {content.note ? <p className={s.small}>{content.note}</p> : null}
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.countdown}>
      <p className={s.kicker} {...fx("fade")}>{content.heading || copy(model).until}</p>
      <div {...fx("blur")}>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      <div className={s.storyText}>
        <p className={s.kicker} {...fx("fade")}>{kitCopy(model).ourStory}</p>
        <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).ourStory}</h2>
        {content.body ? (
          <div className={s.prose} {...fx("blur", 120)}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <blockquote className={s.quote} {...fx("blur", 200)}>
            {content.quote}
            {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
          </blockquote>
        ) : null}
      </div>
      {p ? (
        <figure className={s.storyFig} {...fx("blur")}>
          <Pic asset={p} sizes="(min-width: 900px) 36vw, 90vw" className={s.storyPhoto} />
        </figure>
      ) : null}
    </Sec>
  );
}

function EventCard({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.eventSec}>
      <article className={s.card} {...fx("blur")}>
        <p className={s.cardKicker}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.cardTitle}>{content.heading || e.title}</h2>
        <Diamond />
        {e.timeLabel ? <p className={s.cardTime}>{e.timeLabel}</p> : null}
        {eventDate(model, e) ? <p className={s.cardLine}>{eventDate(model, e)}</p> : null}
        {e.venueName ? <p className={s.cardVenue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.cardLine}>{e.address}</p> : null}
        {content.note ? <p className={s.cardNote}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.cardLink} />
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
      <p className={cn(s.kicker, s.center)}>{copy(model).programme}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("blur")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.programme}>
        {items.map((it, i) => (
          <li key={i} {...fx("blur")}>
            <time>{it.time}</time>
            <span className={s.dot} aria-hidden />
            <div>
              <p className={s.progTitle}>{it.title}</p>
              {it.note ? <p className={s.small}>{it.note}</p> : null}
            </div>
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
      <div className={s.galleryGrid}>
        {list.map((p) => (
          <Pic key={p.id} asset={p} sizes="(min-width: 900px) 30vw, 50vw" className={s.galleryPhoto} {...fx("blur")} />
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvpSec}>
      <div className={cn(s.card, s.rsvpCard)} {...fx("blur")}>
        <BowTie className={s.cardBow} />
        <p className={s.cardKicker}>{copy(model).favour}</p>
        <h2 className={s.cardTitle}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={s.cardTime}>{content.deadline}</p> : null}
        {content.message ? <p className={s.cardNote}>{content.message}</p> : null}
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
      <dl className={s.faqList}>
        {items.map((it, i) => (
          <div key={i} {...fx("blur")}>
            <dt><Diamond /> {it.question}</dt>
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
      <span className={s.spot} aria-hidden />
      <svg aria-hidden viewBox="0 0 120 50" className={s.closingBow} {...fx("draw")}>
        <BowTiePaths />
      </svg>
      <p className={s.closingTitle} {...fx("blur")}>{content.heading}</p>
      {content.message ? <p className={s.lead} {...fx("blur", 150)}>{content.message}</p> : null}
      {content.signature ? <p className={s.script} {...fx("fade", 300)}>{content.signature}</p> : null}
    </Sec>
  );
}

/** The bow tie's outline, drawn in when it scrolls into view. */
function BowTiePaths() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
      <path data-draw="" pathLength={1} d="M52 19 C40 6 22 2 8 6 C2 16 2 34 8 44 C22 48 40 44 52 31 Z" />
      <path data-draw="" pathLength={1} d="M68 19 C80 6 98 2 112 6 C118 16 118 34 112 44 C98 48 80 44 68 31 Z" />
      <rect data-draw="" pathLength={1} x="52" y="17" width="16" height="16" rx="3" />
    </g>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <p className={s.monogram}>{model.wedding.initials}</p>
      <p className={s.small}>{[model.wedding.coupleName, model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <EventCard id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <EventCard id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function BlackTieRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="blacktie" className={s.root} after={model.mode === "export" ? null : <BlackTieOpening model={model} />}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

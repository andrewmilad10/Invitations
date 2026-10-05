import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { CottonOpening } from "./opening";
import s from "./cotton.module.css";

/**
 * Cotton Press — a letterpress stationery suite laid on a linen tablecloth.
 * A cotton envelope sealed in gold wax opens on its foil liner; inside, every
 * section is one printed piece: the deckled invitation with a blind-embossed
 * monogram and foil names, an edge-painted countdown card, event cards, a
 * vellum order of the day, photo prints in foil corners, the reply card and
 * a small card sealed in wax. Follows docs/rules/design.md "Real stationery
 * finish": layered shadows, emboss/deboss, paper texture, foil.
 *
 * Colours: bg = tablecloth, surface = cotton paper, fg = letterpress ink (and
 * the envelope), muted = soft ink, accent = the foil (gold), accent-fg = paper.
 */

const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

/** Light and paper: letterpress, blind emboss, foil pressing, wax impression and deckled edges. */
function Filters() {
  return (
    <svg className={s.filters} aria-hidden focusable="false">
      <defs>
        <filter id="cp-deckle" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.17" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="cp-deboss" x="-10%" y="-20%" width="120%" height="140%">
          <feOffset in="SourceAlpha" dx="1" dy="1.2" result="o" />
          <feGaussianBlur in="o" stdDeviation=".7" result="ob" />
          <feComposite in="SourceAlpha" in2="ob" operator="out" result="rim" />
          <feFlood floodColor="black" floodOpacity=".5" />
          <feComposite in2="rim" operator="in" result="shade" />
          <feOffset in="SourceAlpha" dx=".6" dy=".9" result="o2" />
          <feComposite in="o2" in2="SourceAlpha" operator="out" result="lip" />
          <feFlood floodColor="white" floodOpacity=".85" />
          <feComposite in2="lip" operator="in" result="light" />
          <feMerge>
            <feMergeNode in="light" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shade" />
          </feMerge>
        </filter>
        <filter id="cp-emboss" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation=".6" result="a" />
          <feOffset in="a" dx="1.1" dy="1.3" result="dn" />
          <feComposite in="SourceAlpha" in2="dn" operator="out" result="hiMask" />
          <feFlood floodColor="white" floodOpacity=".95" />
          <feComposite in2="hiMask" operator="in" result="hi" />
          <feOffset in="a" dx="-1" dy="-1.1" result="up" />
          <feComposite in="SourceAlpha" in2="up" operator="out" result="loMask" />
          <feFlood floodColor="black" floodOpacity=".32" />
          <feComposite in2="loMask" operator="in" result="lo" />
          <feOffset in="a" dx="1.2" dy="1.6" result="drop" />
          <feGaussianBlur in="drop" stdDeviation=".9" result="dropb" />
          <feComposite in="dropb" in2="SourceAlpha" operator="out" result="castMask" />
          <feFlood floodColor="black" floodOpacity=".22" />
          <feComposite in2="castMask" operator="in" result="cast" />
          <feMerge>
            <feMergeNode in="cast" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="hi" />
            <feMergeNode in="lo" />
          </feMerge>
        </filter>
        <filter id="cp-foil" x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation=".8" result="h" />
          <feSpecularLighting in="h" surfaceScale="2.2" specularConstant=".85" specularExponent="18" lightingColor="white" result="spec">
            <feDistantLight azimuth="225" elevation="48" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="glint" />
          <feOffset in="SourceAlpha" dx="1" dy="1.1" result="o" />
          <feGaussianBlur in="o" stdDeviation=".6" result="ob" />
          <feComposite in="SourceAlpha" in2="ob" operator="out" result="rim" />
          <feFlood floodColor="black" floodOpacity=".45" />
          <feComposite in2="rim" operator="in" result="shade" />
          <feOffset in="SourceAlpha" dx=".5" dy=".8" result="o2" />
          <feComposite in="o2" in2="SourceAlpha" operator="out" result="lip" />
          <feFlood floodColor="white" floodOpacity=".7" />
          <feComposite in2="lip" operator="in" result="light" />
          <feMerge>
            <feMergeNode in="light" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="glint" />
            <feMergeNode in="shade" />
          </feMerge>
        </filter>
        <filter id="cp-wax" x="-10%" y="-10%" width="120%" height="120%">
          <feOffset in="SourceAlpha" dx="1.2" dy="1.4" result="o" />
          <feGaussianBlur in="o" stdDeviation=".9" result="ob" />
          <feComposite in="SourceAlpha" in2="ob" operator="out" result="rim" />
          <feFlood floodColor="black" floodOpacity=".6" />
          <feComposite in2="rim" operator="in" result="shade" />
          <feOffset in="SourceAlpha" dx="-.8" dy="-1" result="o2" />
          <feGaussianBlur in="o2" stdDeviation=".6" result="o2b" />
          <feComposite in="SourceAlpha" in2="o2b" operator="out" result="lit" />
          <feFlood floodColor="white" floodOpacity=".75" />
          <feComposite in2="lit" operator="in" result="light" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shade" />
            <feMergeNode in="light" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/** One printed piece on the table: a paper layer (deckled or straight-cut) and its content. */
function Piece({ children, edge = "deckle", tilt, className, k = "rise", delay }: { children: ReactNode; edge?: "deckle" | "cut" | "vellum"; tilt?: "L" | "R"; className?: string; k?: string; delay?: number }) {
  return (
    <div className={cn(s.piece, tilt === "L" && s.tiltL, tilt === "R" && s.tiltR, edge === "vellum" && s.vellum, className)} {...fx(k, delay)}>
      <span className={cn(s.sheet, edge === "deckle" && s.deckle, edge === "cut" && s.cut)} aria-hidden />
      <div className={s.content}>{children}</div>
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const [a, b] = wedding.initials;
  const place = model.events.ceremony ?? model.events.reception;
  const ar = model.locale === "ar";
  return (
    <header id="hero" data-section="hero" className={s.suite}>
      <Piece tilt="L" k="fade">
        <div className={s.crest} aria-hidden>
          <span>
            {a}
            <small>&amp;</small>
            {b}
          </span>
        </div>
        <p className={cn(s.caps, s.press)}>{content.eyebrow || kitCopy(model).together}</p>
        <h1 className={cn(s.names, s.foil, s.shine)}>
          <span>{wedding.partnerOne}</span>
          <span className={s.amp}>{amp(model)}</span>
          <span>{wedding.partnerTwo}</span>
        </h1>
        <p className={cn(s.lead, s.press)}>
          {content.tagline || (ar ? "يتشرّفان بدعوتكم لمشاركتهما فرحة زفافهما" : "request the pleasure of your company at the celebration of their marriage")}
        </p>
        <span className={s.rule} aria-hidden />
        {wedding.date ? (
          <p className={cn(s.when, s.press)}>
            {wedding.date.long}
            {place?.timeLabel ? (
              <>
                <br />
                {place.timeLabel}
              </>
            ) : null}
          </p>
        ) : null}
        {place?.venueName ? (
          <p className={cn(s.where, s.press)}>
            <b>{place.venueName}</b>
            {place.address}
          </p>
        ) : null}
        {model.events.reception && model.events.ceremony ? (
          <p className={cn(s.after, s.press)}>{ar ? "يليه حفل العشاء" : "Dinner and dancing to follow"}</p>
        ) : null}
      </Piece>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.suite}>
      <Piece edge="cut" tilt="R" className={s.small}>
        <p className={cn(s.caps, s.press)}>{content.eyebrow || kitCopy(model).with}</p>
        {content.heading ? <h2 className={cn(s.script, s.foil)}>{content.heading}</h2> : null}
        {content.message ? <p className={cn(s.lead, s.press)}>{content.message}</p> : null}
      </Piece>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.suite}>
      <Piece edge="cut" tilt="L" className={s.small}>
        <p className={cn(s.caps, s.press)}>{d.weekday}</p>
        <h2 className={cn(s.script, s.foil)}>{content.heading || d.long}</h2>
        {content.note ? <p className={cn(s.lead, s.press)}>{content.note}</p> : null}
      </Piece>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.suite}>
      <Piece edge="cut" tilt="R" className={cn(s.edged, s.small)}>
        <p className={cn(s.caps, s.press)}>{content.heading || kitCopy(model).countdown}</p>
        <div className={s.press}>
          <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.label} />
        </div>
      </Piece>
    </Sec>
  );
}

function Corners() {
  return (
    <>
      <span className={s.corner} aria-hidden />
      <span className={s.corner} aria-hidden />
      <span className={s.corner} aria-hidden />
      <span className={s.corner} aria-hidden />
    </>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photo = photos(model, 1)[0] ?? heroPhoto(model);
  if (!photo && !content.body) return null;
  return (
    <Sec id="story" className={s.suite}>
      {photo ? (
        <figure className={cn(s.print, s.tiltR)} {...fx("rise")}>
          <Pic asset={photo} sizes="(min-width: 640px) 340px, 76vw" className={s.photo} />
          <Corners />
          <figcaption className={s.foil}>{model.wedding.coupleName}</figcaption>
        </figure>
      ) : null}
      <Piece tilt="L">
        <h2 className={cn(s.script, s.foil)}>{content.heading || kitCopy(model).ourStory}</h2>
        {content.body ? (
          <div className={cn(s.prose, s.press)}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <blockquote className={cn(s.quote, s.press)}>
            {content.quote}
            {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
          </blockquote>
        ) : null}
      </Piece>
    </Sec>
  );
}

function Event({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.suite}>
      <Piece tilt={id === "ceremony" ? "L" : "R"}>
        <p className={cn(s.caps, s.press)}>{id === "ceremony" ? t.ceremony : t.reception}</p>
        <h2 className={cn(s.script, s.foil)}>{content.heading || e.title || (id === "ceremony" ? t.ceremony : t.reception)}</h2>
        {e.venueName ? <p className={cn(s.venue, s.press)}>{e.venueName}</p> : null}
        {e.address ? <p className={cn(s.press)} style={{ margin: 0 }}>{e.address}</p> : null}
        <p className={cn(s.time, s.press)}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
        {content.note ? <p className={cn(s.note, s.press)}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.stamp} />
      </Piece>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.suite}>
      <Piece edge="cut" tilt="L">
        <h2 className={cn(s.script, s.foil)}>{content.heading || kitCopy(model).venue}</h2>
        {content.note ? <p className={cn(s.lead, s.press)}>{content.note}</p> : null}
        <div className={s.maps}>
          {mapped.map((e) => (
            <figure key={e.id} className={s.mapFig}>
              <KitMap model={model} event={e} className={s.map} />
              <figcaption className={s.press}>{e.venueName ?? e.title}</figcaption>
            </figure>
          ))}
        </div>
      </Piece>
    </Sec>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.suite}>
      <Piece edge="vellum" tilt="R" className={s.small}>
        <h2 className={cn(s.script, s.press)}>{content.heading || kitCopy(model).schedule}</h2>
        <ol className={cn(s.order, s.press)}>
          {items.map((it, i) => (
            <li key={i}>
              <time>{it.time}</time>
              <i aria-hidden />
              <span>{it.title}</span>
            </li>
          ))}
        </ol>
      </Piece>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.suite}>
      <h2 className={cn(s.script, s.press)} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.caps, s.press)}>{content.caption}</p> : null}
      <div className={s.prints}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.print} {...fx("rise", (i % 2) * 120)}>
            <Pic asset={p} sizes="(min-width: 640px) 260px, 44vw" className={s.photo} />
            <Corners />
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.suite}>
      <Piece tilt="L" className={s.small}>
        <p className={cn(s.caps, s.press)}>{content.deadline || kitCopy(model).rsvp}</p>
        <h2 className={cn(s.script, s.foil)}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.message ? <p className={cn(s.lead, s.press)}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.btn} />
      </Piece>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.suite}>
      <Piece edge="cut" tilt="R">
        <h2 className={cn(s.script, s.foil)}>{content.heading || kitCopy(model).faq}</h2>
        <div className={cn(s.faq, s.press)}>
          {items.map((it, i) => (
            <details key={i} className={s.qa}>
              <summary>{it.question}</summary>
              <p>{it.answer}</p>
            </details>
          ))}
        </div>
      </Piece>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  const [a, b] = model.wedding.initials;
  return (
    <Sec id="closing" className={s.suite}>
      <div className={cn(s.piece, s.closing, s.tiltR)} {...fx("rise")}>
        <span className={cn(s.sheet, s.deckle)} aria-hidden />
        <div className={s.seal} aria-hidden>
          <span className={s.ring} />
          <span className={s.mono}>
            {a}
            <i>&amp;</i>
            {b}
          </span>
        </div>
        {content.heading ? <p className={cn(s.caps, s.press)}>{content.heading}</p> : null}
        {content.message ? <p className={cn(s.lead, s.press)}>{content.message}</p> : null}
        <p className={cn(s.script, s.foil)}>{content.signature || model.wedding.coupleName}</p>
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

export default function CottonRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="cotton" className={s.root} after={model.mode === "export" ? null : <CottonOpening model={model} />}>
      <Filters />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

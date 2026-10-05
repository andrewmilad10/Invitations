import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
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

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.crown}>
        <span className={s.crownArt} role="img" aria-label="A crown of paper roses and eucalyptus" />
        <div className={s.heroText}>
          <h1 className={s.names}>
            <span>{wedding.partnerOne}</span>
            <span className={s.amp}>{ar(model) ? "و" : "&"}</span>
            <span>{wedding.partnerTwo}</span>
          </h1>
          <p className={s.married}>{content.tagline || (ar(model) ? "سيتزوّجان" : "are getting married")}</p>
          {wedding.date ? <p className={s.heroDate}>{wedding.date.short}</p> : null}
          {place?.venueName ? <p className={s.heroPlace}>{place.venueName}</p> : null}
        </div>
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
  return (
    <Band id="countdown">
      <div {...fx("fade")}>
        <h2 className={s.scriptSm}>{content.heading || kitCopy(model).countdown}</h2>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.label} />
        {model.wedding.date ? <p className={s.untilDate}>{model.wedding.date.long}</p> : null}
      </div>
    </Band>
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

function Event({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.sec}>
      <div className={s.card} {...fx("rise")}>
        {id === "ceremony" ? <span className={cn(s.posy, s.cornerTL)} aria-hidden /> : <span className={cn(s.posy, s.cornerBR)} aria-hidden />}
        <h2 className={s.scriptSm}>{content.heading || e.title || (id === "ceremony" ? t.ceremony : t.reception)}</h2>
        {content.note ? <p className={s.italic}>{content.note}</p> : null}
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.when}>{e.address}</p> : null}
        <p className={s.when}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
        <Directions model={model} event={e} className={s.link} />
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
      <ol className={s.timeline}>
        {items.map((it, i) => (
          <li key={i} {...fx("rise", 80)}>
            <time>{it.time}</time>
            <span>{it.title}</span>
          </li>
        ))}
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
        {content.deadline ? <p className={s.italic}>{content.deadline}</p> : null}
        {content.linkUrl ? <p className={s.tapHeart}>{a ? "اضغطوا على القلب للرد" : "Tap the heart to reply"}</p> : null}
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

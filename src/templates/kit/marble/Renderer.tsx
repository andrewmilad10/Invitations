import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type {
  SectionComponents,
  SectionProps,
  TemplateRendererProps,
} from "../../types";
import {
  eventDate,
  faqItems,
  heroPhoto,
  kitCopy,
  mappedEvents,
  photos,
  scheduleItems,
} from "../data";
import {
  Clock,
  Directions,
  fx,
  KitMap,
  KitRoot,
  Paragraphs,
  Pic,
  ReplyLink,
  Sec,
} from "../pieces";
import { MarbleOpening } from "./opening";
import s from "./marble.module.css";

/**
 * Rose Marble — a modern stationery suite on white marble. A blush envelope
 * sealed in rose-gold wax opens on a marbled foil liner; the invitation is a
 * clear acrylic panel on rose-gold standoffs, with ivory cards around it:
 * pressed frames, rose-gold foil, photos under acrylic blocks, the order of
 * the day on a tag hanging from a silk ribbon and a note sealed in wax.
 * Follows docs/rules/design.md "Real stationery finish".
 *
 * Colours: bg = marble, surface = ivory card, fg = ink, muted = soft ink,
 * accent = rose-gold foil (the envelope is a blush mixed from it), accent-fg = card.
 */

/** Light and paper: letterpress, a frame pressed into the card, foil pressing and the wax impression. */
function Filters() {
  return (
    <svg className={s.filters} aria-hidden focusable="false">
      <defs>
        <filter id="rm-deboss" x="-10%" y="-20%" width="120%" height="140%">
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
        <filter id="rm-frame" x="-5%" y="-5%" width="110%" height="110%">
          <feOffset in="SourceAlpha" dx="1" dy="1" result="dn" />
          <feComposite in="SourceAlpha" in2="dn" operator="out" result="tl" />
          <feFlood floodColor="black" floodOpacity=".28" />
          <feComposite in2="tl" operator="in" result="shade" />
          <feOffset in="SourceAlpha" dx="-1" dy="-1" result="up" />
          <feComposite in="SourceAlpha" in2="up" operator="out" result="br" />
          <feFlood floodColor="white" floodOpacity="1" />
          <feComposite in2="br" operator="in" result="light" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shade" />
            <feMergeNode in="light" />
          </feMerge>
        </filter>
        <filter id="rm-foil" x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation=".8" result="h" />
          <feSpecularLighting
            in="h"
            surfaceScale="2.2"
            specularConstant=".85"
            specularExponent="18"
            lightingColor="white"
            result="spec"
          >
            <feDistantLight azimuth="225" elevation="48" />
          </feSpecularLighting>
          <feComposite
            in="spec"
            in2="SourceAlpha"
            operator="in"
            result="glint"
          />
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
        <filter id="rm-wax" x="-10%" y="-10%" width="120%" height="120%">
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

/** One ivory card on the marble, with a frame pressed into it. */
function Piece({
  children,
  tilt,
  className,
  k = "rise",
  frame = true,
}: {
  children: ReactNode;
  tilt?: "L" | "R";
  className?: string;
  k?: string;
  frame?: boolean;
}) {
  return (
    <div
      className={cn(
        s.piece,
        tilt === "L" && s.tiltL,
        tilt === "R" && s.tiltR,
        className,
      )}
      {...fx(k)}
    >
      <span className={s.sheet} aria-hidden />
      {frame ? <span className={s.frame} aria-hidden /> : null}
      <div className={s.content}>{children}</div>
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const ar = model.locale === "ar";
  return (
    <header id="hero" data-section="hero" className={s.suite}>
      <article className={s.acrylic} {...fx("fade")}>
        <span className={s.standoff} aria-hidden />
        <span className={s.standoff} aria-hidden />
        <span className={s.standoff} aria-hidden />
        <span className={s.standoff} aria-hidden />
        <p className={s.caps}>{content.eyebrow || kitCopy(model).together}</p>
        <h1 className={cn(s.names, s.foil, s.shine)}>
          <span>{wedding.partnerOne}</span>
          <span className={s.amp}>{ar ? "و" : "and"}</span>
          <span>{wedding.partnerTwo}</span>
        </h1>
        <p className={s.heroSub}>
          {content.tagline ||
            (ar
              ? "يدعوانكم للاحتفال بزفافهما"
              : "invite you to celebrate their wedding")}
        </p>
        <span className={s.hair} aria-hidden />
        {wedding.date ? (
          <p className={s.heroDate}>{wedding.date.short}</p>
        ) : null}
        <p className={s.heroSub}>
          {[wedding.date?.weekday, place?.timeLabel]
            .filter(Boolean)
            .join(" · ")}
          {place?.venueName ? (
            <>
              <br />
              {[place.venueName, place.address].filter(Boolean).join(", ")}
            </>
          ) : null}
        </p>
      </article>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.suite}>
      <Piece tilt="R" className={s.small}>
        <p className={cn(s.caps, s.press)}>
          {content.eyebrow || kitCopy(model).with}
        </p>
        {content.heading ? (
          <h2 className={cn(s.script, s.foil)}>{content.heading}</h2>
        ) : null}
        {content.message ? (
          <p className={cn(s.lead, s.press)}>{content.message}</p>
        ) : null}
      </Piece>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.suite}>
      <Piece tilt="L" className={s.small}>
        <p className={cn(s.caps, s.press)}>{d.weekday}</p>
        <h2 className={cn(s.script, s.foil)}>{content.heading || d.long}</h2>
        {content.note ? (
          <p className={cn(s.lead, s.press)}>{content.note}</p>
        ) : null}
      </Piece>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.suite}>
      <Piece tilt="R" className={s.small}>
        <p className={cn(s.caps, s.press)}>
          {content.heading || kitCopy(model).countdown}
        </p>
        <div className={s.press}>
          <Clock
            model={model}
            className={s.clock}
            unit={s.unit}
            value={s.value}
            label={s.label}
          />
        </div>
      </Piece>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photo = photos(model, 1)[0] ?? heroPhoto(model);
  if (!photo && !content.body) return null;
  return (
    <Sec id="story" className={s.suite}>
      {photo ? (
        <figure className={cn(s.block, s.tiltR)} {...fx("rise")}>
          <Pic
            asset={photo}
            sizes="(min-width: 640px) 330px, 74vw"
            className={s.photo}
          />
        </figure>
      ) : null}
      <Piece tilt="L">
        <h2 className={cn(s.script, s.foil)}>
          {content.heading || kitCopy(model).ourStory}
        </h2>
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

function Event({
  id,
  model,
  content,
}: {
  id: "ceremony" | "reception";
  model: InvitationModel;
  content: { heading: string; note: string };
}) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.suite}>
      <Piece tilt={id === "ceremony" ? "L" : "R"}>
        <p className={cn(s.caps, s.press)}>
          {id === "ceremony" ? t.ceremony : t.reception}
        </p>
        <h2 className={cn(s.script, s.foil)}>
          {content.heading ||
            e.title ||
            (id === "ceremony" ? t.ceremony : t.reception)}
        </h2>
        {e.venueName ? (
          <p className={cn(s.venue, s.press)}>{e.venueName}</p>
        ) : null}
        {e.address ? (
          <p className={cn(s.press)} style={{ margin: 0 }}>
            {e.address}
          </p>
        ) : null}
        <p className={cn(s.time, s.press)}>
          {[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}
        </p>
        {content.note ? (
          <p className={cn(s.note, s.press)}>{content.note}</p>
        ) : null}
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
      <Piece tilt="L">
        <h2 className={cn(s.script, s.foil)}>
          {content.heading || kitCopy(model).venue}
        </h2>
        {content.note ? (
          <p className={cn(s.lead, s.press)}>{content.note}</p>
        ) : null}
        <div className={s.maps}>
          {mapped.map((e) => (
            <figure key={e.id} className={s.mapFig}>
              <KitMap model={model} event={e} className={s.map} />
              <figcaption className={s.press}>
                {e.venueName ?? e.title}
              </figcaption>
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
      <div className={s.tagWrap} {...fx("rise")}>
        <span className={s.ribbon} aria-hidden />
        <div className={s.tag}>
          <span className={s.tagShadow} aria-hidden />
          <span className={s.eyelet} aria-hidden />
          <div className={s.content}>
            <h2 className={cn(s.script, s.foil)}>
              {content.heading || kitCopy(model).schedule}
            </h2>
            <ol className={cn(s.order, s.press)}>
              {items.map((it, i) => (
                <li key={i}>
                  <time>{it.time}</time>
                  <span>{it.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.suite}>
      <h2 className={cn(s.script, s.press)} {...fx("rise")}>
        {content.heading || kitCopy(model).gallery}
      </h2>
      {content.caption ? (
        <p className={cn(s.caps, s.press)}>{content.caption}</p>
      ) : null}
      <div className={s.blocks}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.block} {...fx("rise", (i % 2) * 120)}>
            <Pic
              asset={p}
              sizes="(min-width: 640px) 260px, 44vw"
              className={s.photo}
            />
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
        <p className={cn(s.caps, s.press)}>
          {content.deadline || kitCopy(model).rsvp}
        </p>
        <h2 className={cn(s.script, s.foil)}>
          {content.heading || kitCopy(model).rsvp}
        </h2>
        {content.message ? (
          <p className={cn(s.lead, s.press)}>{content.message}</p>
        ) : null}
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
      <Piece tilt="R">
        <h2 className={cn(s.script, s.foil)}>
          {content.heading || kitCopy(model).faq}
        </h2>
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
        <span className={s.sheet} aria-hidden />
        <div className={s.content}>
          <div className={s.seal} aria-hidden>
            <span className={s.ring} />
            <span className={s.mono}>
              {a}&amp;{b}
            </span>
          </div>
          {content.heading ? (
            <p className={cn(s.caps, s.press)}>{content.heading}</p>
          ) : null}
          {content.message ? (
            <p className={cn(s.lead, s.press)}>{content.message}</p>
          ) : null}
          <p className={cn(s.script, s.foil)}>
            {content.signature || model.wedding.coupleName}
          </p>
        </div>
      </div>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      {[model.wedding.coupleName, model.wedding.date?.short, content.note]
        .filter(Boolean)
        .join(" · ")}
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
  reception: (p) => (
    <Event id="reception" model={p.model} content={p.content} />
  ),
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function MarbleRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot
      model={model}
      kit="marble"
      className={s.root}
      after={model.mode === "export" ? null : <MarbleOpening model={model} />}
    >
      <Filters />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

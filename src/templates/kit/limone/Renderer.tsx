import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./limone.module.css";

/**
 * 4 · Italian Summer — a striped awning with a scalloped edge, lemon branches
 * that sway in the breeze, majolica tiles framing photos and counting down
 * the days, the programme as a trattoria menu and snapshots scattered on the
 * table. Motion: playful, with a little overshoot.
 *
 * Colours: bg/surface = sun-washed paper, fg = ink, muted = lemon yellow
 * (fruit, badges), accent = the tile colour (cobalt, terracotta, olive);
 * leaves are lemon mixed into the accent.
 */

const v = (o: Record<string, string | number>) => o as CSSProperties;

/** A lemon branch: a stem, leaves and three lemons, each swaying on its own. */
function Branch({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 160 130" className={cn(s.branch, flip && s.flipX, className)}>
      <path d="M0 18 C40 22 70 30 100 52 C120 66 136 84 150 104" className={s.stem} />
      {[
        [26, 18, -18, 1], [52, 28, 24, .9], [70, 34, -40, 1.05], [94, 50, 18, .95], [116, 64, -28, 1], [134, 86, 32, .85],
      ].map(([x, y, r, k], i) => (
        <path key={i} d="M0 0 C6 -8 18 -9 26 0 C18 9 6 8 0 0Z" className={s.leaf} transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`} />
      ))}
      {[
        [58, 36, 0], [104, 60, -1.1], [140, 100, -2.2],
      ].map(([x, y, d], i) => (
        <g key={i} className={s.fruitSwing} style={v({ transformOrigin: `${x}px ${y}px`, animationDelay: `${d}s` })}>
          <path d={`M${x} ${y} v8`} className={s.stem} />
          <path d="M-13 0 C-11 -7 -5 -10 0 -10 C5 -10 11 -7 13 0 C11 7 5 10 0 10 C-5 10 -11 7 -13 0Z" className={s.fruit} transform={`translate(${x} ${y + 18}) rotate(${-20 + i * 14})`} />
          <ellipse cx={x - 4} cy={y + 14} rx="3.5" ry="1.6" className={s.shine} />
        </g>
      ))}
    </svg>
  );
}

/** The striped awning with its scalloped edge. */
function Awning({ className }: { className?: string }) {
  return <div aria-hidden className={cn(s.awning, className)} />;
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <Awning />
      <div className={s.heroGrid}>
        <div className={s.heroText}>
          <Branch className={s.heroBranch} />
          <p className={s.script} {...fx("rise")}>{content.eyebrow || kitCopy(model).together}</p>
          <h1 className={s.names} {...fx("rise", 120)}>
            {wedding.partnerOne}
            <span className={s.and}>{model.locale === "ar" ? "و" : "&"}</span>
            {wedding.partnerTwo}
          </h1>
          {wedding.date ? <p className={s.datePill} {...fx("scale", 300)}>{wedding.date.long}</p> : null}
          {place?.venueName ? <p className={s.place} {...fx("rise", 380)}>{place.venueName}</p> : null}
          {content.tagline ? <p className={s.tagline}>{content.tagline}</p> : null}
        </div>
        <div className={s.window} {...fx("scale", 200)}>
          <Pic asset={heroPhoto(model)} sizes="(min-width: 900px) 40vw, 86vw" priority className={s.windowPhoto} />
        </div>
      </div>
    </header>
  );
}

function Wave() {
  return (
    <svg aria-hidden viewBox="0 0 400 16" preserveAspectRatio="none" className={s.wave}>
      <path d="M0 8 Q25 0 50 8 T100 8 T150 8 T200 8 T250 8 T300 8 T350 8 T400 8" />
    </svg>
  );
}

function Title({ children, script }: { children: React.ReactNode; script?: string }) {
  return (
    <div className={s.title} {...fx("rise")}>
      {script ? <p className={s.script}>{script}</p> : null}
      <h2 className={s.h2}>{children}</h2>
      <Wave />
    </div>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.tiled}>
      <div className={s.scallopCard} {...fx("scale")}>
        <Title script={content.eyebrow || undefined}>{content.heading || kitCopy(model).with}</Title>
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
      <div className={s.lemonBadge} {...fx("scale")}>
        <span className={s.badgeMonth}>{d.month}</span>
        <span className={s.badgeDay}>{d.day}</span>
        <span className={s.badgeYear}>{d.year}</span>
      </div>
      <p className={cn(s.lead, s.center)}>{content.heading}{content.note ? ` — ${content.note}` : ""}</p>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.sec}>
      <Title>{content.heading || kitCopy(model).countdown}</Title>
      <div data-k-stagger="" {...fx("rise")}>
        <Clock model={model} className={s.tiles} unit={s.tile} value={s.tileValue} label={s.tileLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      {p ? (
        <figure className={s.snapshot} {...fx("scale")}>
          <span className={s.tape} aria-hidden />
          <Pic asset={p} sizes="(min-width: 900px) 34vw, 80vw" className={s.snapPhoto} />
          <figcaption className={s.hand}>{model.wedding.coupleName}</figcaption>
        </figure>
      ) : null}
      <div>
        <Title>{content.heading || kitCopy(model).ourStory}</Title>
        {content.body ? (
          <div className={s.prose} {...fx("rise")}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <p className={s.quote} {...fx("rise")}>
            “{content.quote}”{content.quoteSource ? <span> — {content.quoteSource}</span> : null}
          </p>
        ) : null}
      </div>
    </Sec>
  );
}

/** A bell for the ceremony, two glasses for the party. */
function Icon({ kind }: { kind: "ceremony" | "reception" }) {
  return kind === "ceremony" ? (
    <svg aria-hidden viewBox="0 0 40 40" className={s.icon}>
      <path d="M20 6 C12 6 10 14 10 22 L7 28 H33 L30 22 C30 14 28 6 20 6Z M17 31 a3 3 0 0 0 6 0" />
    </svg>
  ) : (
    <svg aria-hidden viewBox="0 0 40 40" className={s.icon}>
      <path d="M8 6 H18 C18 14 16 18 13 18 C10 18 8 14 8 6Z M13 18 V32 M9 33 H17 M22 6 H32 C32 14 30 18 27 18 C24 18 22 14 22 6Z M27 18 V32 M23 33 H31" />
    </svg>
  );
}

function EventCard({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={cn(s.sec, s.eventSec)}>
      <article className={s.eventCard} {...fx("rise")}>
        <Icon kind={id} />
        <p className={s.script}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.h2}>{content.heading}</h2>
        {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
        {eventDate(model, e) ? <p className={s.small}>{eventDate(model, e)}</p> : null}
        {e.venueName ? <p className={s.place}>{e.venueName}</p> : null}
        {e.address ? <p className={s.small}>{e.address}</p> : null}
        {content.note ? <p className={s.small}>{content.note}</p> : null}
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
      <Title>{content.heading || kitCopy(model).venue}</Title>
      {content.note ? <p className={cn(s.lead, s.center)}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapArch} {...fx("scale")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption><b>{e.venueName ?? e.title}</b>{e.address ? <span>{e.address}</span> : null}</figcaption>
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
      <div className={s.menu} {...fx("rise")}>
        <Title script={model.locale === "ar" ? undefined : "Il programma"}>{content.heading || kitCopy(model).schedule}</Title>
        <ol data-k-stagger="" {...fx("rise")}>
          {items.map((it, i) => (
            <li key={i}>
              <span className={s.bullet} aria-hidden />
              <span className={s.menuItem}>
                {it.title}
                {it.note ? <small>{it.note}</small> : null}
              </span>
              <span className={s.menuDots} aria-hidden />
              <time>{it.time}</time>
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
  return (
    <Sec id="gallery" className={s.sec}>
      <Title>{content.heading || kitCopy(model).gallery}</Title>
      {content.caption ? <p className={cn(s.lead, s.center)}>{content.caption}</p> : null}
      <div className={s.scatter} data-k-stagger="" {...fx("rise")}>
        {list.map((p) => (
          <div key={p.id} className={s.scatterItem}>
            <Pic asset={p} sizes="(min-width: 900px) 24vw, 45vw" className={s.scatterPhoto} />
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvp}>
      <Awning className={s.awningSmall} />
      <div className={s.rsvpInner}>
        <div className={s.rsvpBadge} {...fx("scale")}>
          <span>{content.heading || kitCopy(model).rsvp}</span>
        </div>
        {content.deadline ? <p className={s.place}>{content.deadline}</p> : null}
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
      <Title>{content.heading || kitCopy(model).faq}</Title>
      <div className={s.faqList}>
        {items.map((it, i) => (
          <details key={i} className={s.faqItem} {...fx("rise")}>
            <summary><span className={s.tileDot} aria-hidden />{it.question}</summary>
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
      <Branch className={s.closeBranch} flip />
      <p className={s.closingTitle} {...fx("rise")}>{content.heading}</p>
      {content.message ? <p className={s.lead}>{content.message}</p> : null}
      {content.signature ? <p className={s.sign}>{content.signature}</p> : null}
      <span className={s.hidden}>{model.wedding.coupleName}</span>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <p className={s.footerNames}>{model.wedding.coupleName}</p>
      <p>{[model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}</p>
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

export default function LimoneRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="limone" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

import type { CSSProperties, ReactNode } from "react";
import type { InvitationModel, MediaAsset } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./villa.module.css";

/**
 * 15 · Mediterranean Villa — a whitewashed island village. A skyline of
 * white cubes and a blue dome over the sea, bougainvillea spilling over
 * walls, photos behind louvred shutters that swing open, the date on an
 * enamel street plaque, the countdown on painted doors, the day climbing a
 * flight of whitewashed steps and the reply behind a blue front door.
 * Motion: shutters opening, a sun drifting down to the sea.
 *
 * Colours: bg = whitewash, surface = pure white, fg = deep sea ink,
 * muted = bougainvillea, accent = island blue, accent-fg = white on blue.
 */

const COPY = {
  en: { street: "Odos Agapis", steps: "Up the steps", door: "Knock, knock" },
  ar: { street: "شارع الحب", steps: "صعودًا على الدرج", door: "طق طق" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

/** The village: white cubes, steps and a blue dome above the sea. */
function Village({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 600 220" preserveAspectRatio="xMidYMax slice" className={cn(s.village, className)}>
      <circle cx="470" cy="70" r="34" className={s.sun} />
      <rect x="0" y="176" width="600" height="44" className={s.sea} />
      <path d="M0 176 H600" className={s.horizon} />
      <g className={s.walls}>
        <rect x="20" y="120" width="70" height="60" />
        <rect x="80" y="96" width="60" height="84" />
        <rect x="130" y="128" width="80" height="52" />
        <rect x="250" y="104" width="90" height="76" />
        <rect x="330" y="132" width="70" height="48" />
        <rect x="395" y="114" width="58" height="66" />
        <rect x="445" y="140" width="90" height="40" />
        <rect x="525" y="122" width="60" height="58" />
      </g>
      <path d="M262 104 A33 33 0 0 1 328 104 Z" className={s.dome} />
      <rect x="292" y="62" width="6" height="12" className={s.dome} />
      <path d="M296 62 V52 M291 57 H301" className={s.cross} />
      <g className={s.openings}>
        <rect x="40" y="140" width="12" height="16" rx="6" />
        <rect x="100" y="112" width="12" height="18" />
        <rect x="160" y="146" width="14" height="20" rx="7" />
        <rect x="284" y="130" width="22" height="30" rx="11" />
        <rect x="410" y="134" width="12" height="16" />
        <rect x="545" y="140" width="12" height="16" rx="6" />
      </g>
      <path d="M210 180 L210 170 L222 170 L222 160 L234 160 L234 150 L246 150 L246 140 L250 140 L250 180 Z" className={s.stepsArt} />
      <Bougainvillea x={130} y={128} />
      <Bougainvillea x={395} y={114} />
      <Bougainvillea x={20} y={120} />
    </svg>
  );
}

/** A spill of bougainvillea at (x, y) in the village drawing. */
function Bougainvillea({ x, y }: { x: number; y: number }) {
  const dots = [[0, 0, 7], [9, 4, 6], [-6, 7, 5], [3, 10, 5], [14, -2, 4], [-10, -1, 4], [7, 16, 4], [-2, 18, 3]];
  return (
    <g className={s.flowers} transform={`translate(${x} ${y})`}>
      {dots.map(([dx, dy, r], i) => <circle key={i} cx={dx} cy={dy} r={r} />)}
    </g>
  );
}

/** A larger cluster of bougainvillea for corners. */
function Blossom({ className }: { className?: string }) {
  const petals = Array.from({ length: 22 }, (_, i) => {
    const a = i * 2.4;
    const r = 10 + (i % 7) * 9;
    return [60 + Math.cos(a) * r, 60 + Math.sin(a) * r * 0.8, 9 + (i % 3) * 3] as const;
  });
  return (
    <svg aria-hidden viewBox="0 0 140 130" className={cn(s.blossom, className)}>
      <path d="M10 120 C40 90 60 70 120 20" className={s.vineStem} />
      {petals.map(([x, y, r], i) => (
        <path key={i} className={s.petal} d={`M${x} ${y - r} C${x + r} ${y - r} ${x + r} ${y + r * 0.4} ${x} ${y + r * 0.6} C${x - r} ${y + r * 0.4} ${x - r} ${y - r} ${x} ${y - r}Z`} style={{ "--i": i } as CSSProperties} />
      ))}
    </svg>
  );
}

/** A photo behind a pair of louvred shutters that swing open. */
function Shuttered({ asset, className, sizes, priority, children }: { asset: MediaAsset | null | undefined; className?: string; sizes: string; priority?: boolean; children?: ReactNode }) {
  return (
    <div className={cn(s.window, className)} {...fx("shutters")}>
      <Pic asset={asset} sizes={sizes} priority={priority} className={s.windowPhoto} />
      <span className={cn(s.shutter, s.shutL)} aria-hidden />
      <span className={cn(s.shutter, s.shutR)} aria-hidden />
      {children}
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.heroText}>
        <p className={s.hand} {...fx("rise")}>{content.eyebrow || kitCopy(model).together}</p>
        <h1 className={s.names} {...fx("rise", 150)}>
          <span>{wedding.partnerOne}</span>
          <i>{amp(model)}</i>
          <span>{wedding.partnerTwo}</span>
        </h1>
        <p className={s.meta} {...fx("rise", 300)}>{[wedding.date?.long, place?.venueName].filter(Boolean).join(" · ")}</p>
        {content.tagline ? <p className={s.tagline} {...fx("rise", 400)}>{content.tagline}</p> : null}
      </div>
      <Shuttered asset={heroPhoto(model)} sizes="(min-width: 900px) 30vw, 70vw" priority className={s.heroWindow}>
        <Blossom className={s.heroBlossom} />
      </Shuttered>
      <Village className={s.heroVillage} />
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.wall} {...fx("rise")}>
        <Blossom className={s.wallBlossom} />
        <p className={s.hand}>{content.eyebrow || kitCopy(model).with}</p>
        {content.heading ? <h2 className={s.h2}>{content.heading}</h2> : null}
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
    <Sec id="date" className={cn(s.sec, s.center)}>
      <div className={s.plaque} {...fx("scale")}>
        <p className={s.plaqueTop}>{content.heading || copy(model).street}</p>
        <p className={s.plaqueDay}>{d.day}</p>
        <p className={s.plaqueMonth}>{d.month} {d.year}</p>
      </div>
      <p className={s.small}>{d.weekday}{content.note ? ` · ${content.note}` : ""}</p>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={cn(s.sec, s.center)}>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("rise", 120)}>
        <Clock model={model} className={s.doors} unit={s.door} value={s.doorValue} label={s.doorLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      {p ? <Shuttered asset={p} sizes="(min-width: 900px) 34vw, 80vw" className={s.storyWindow} /> : null}
      <div>
        <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).ourStory}</h2>
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

function Chapel({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.eventSec}>
      <article className={cn(s.cube, id === "reception" && s.cubeAlt)} {...fx("rise")}>
        <span className={s.cubeDome} aria-hidden />
        <p className={s.hand}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
        <h2 className={s.h3}>{content.heading || e.title}</h2>
        {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
        {eventDate(model, e) ? <p className={s.small}>{eventDate(model, e)}</p> : null}
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.small}>{e.address}</p> : null}
        {content.note ? <p className={s.note}>{content.note}</p> : null}
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
          <figure key={e.id} className={s.mapFig} {...fx("rise")}>
            <div className={s.mapFrame}>
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
      <p className={cn(s.hand, s.center)}>{copy(model).steps}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.stairs} style={{ "--n": items.length } as CSSProperties}>
        {items.map((it, i) => (
          <li key={i} style={{ "--i": i, transitionDelay: `${i * 120}ms` } as CSSProperties} {...fx("rise")}>
            <time>{it.time}</time>
            <p className={s.stepTitle}>{it.title}</p>
            {it.note ? <p className={s.small}>{it.note}</p> : null}
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
    <Sec id="gallery" className={s.gallery}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.small, s.center)}>{content.caption}</p> : null}
      <div className={s.facade}>
        {list.map((p) => (
          <Shuttered key={p.id} asset={p} sizes="(min-width: 900px) 28vw, 45vw" className={s.facadeWindow} />
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvpSec}>
      <div className={s.frontDoor} {...fx("rise")}>
        <Blossom className={s.doorBlossom} />
        <span className={s.knocker} aria-hidden />
        <p className={s.hand}>{copy(model).door}</p>
        <h2 className={s.doorTitle}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={s.doorLine}>{content.deadline}</p> : null}
        {content.message ? <p className={s.doorText}>{content.message}</p> : null}
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
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.sunset} aria-hidden>
        <span className={s.setSun} data-k-progress="" />
        <span className={s.setSea} />
      </div>
      <p className={s.closingTitle} {...fx("rise")}>{content.heading}</p>
      {content.message ? <p className={s.lead} {...fx("rise", 120)}>{content.message}</p> : null}
      {content.signature ? <p className={s.sign} {...fx("fade", 200)}>{content.signature}</p> : null}
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
  ceremony: (p) => <Chapel id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <Chapel id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function VillaRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="villa" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

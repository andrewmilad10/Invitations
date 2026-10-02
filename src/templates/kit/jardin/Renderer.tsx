import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./jardin.module.css";

/**
 * 6 · French Garden — a formal jardin à la française. A parterre plan seen
 * from above draws itself in box-hedge lines around a fountain; trellis
 * (treillage) lattices frame the photos; the date is written on a garden
 * stake, the countdown sits in clipped topiary, the day is a gravel walk of
 * stepping stones and the photos are set in a diamond lattice. Motion: line
 * drawing and gentle growth.
 *
 * Colours: bg/surface = limestone, fg = deep garden ink, muted = the flower
 * colour (blush, lavender, gilt), accent = clipped box green, accent-fg =
 * text on it.
 */

const COPY = {
  en: { garden: "In the garden", walk: "A walk through the day", packet: "Répondez s'il vous plaît" },
  ar: { garden: "في الحديقة", walk: "جولة في برنامج اليوم", packet: "نرجو الرد" },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

/** One quarter of the parterre (top-left); the others are mirrors of it. */
function Quarter({ delay }: { delay: number }) {
  const d = { "data-draw": "", pathLength: 1, style: { "--d": delay } as CSSProperties };
  return (
    <g>
      <path {...d} className={s.hedge} d="M30 30 H184 V86.9 A46 46 0 0 0 156.9 114 H30 Z" />
      <path data-draw-fill="" className={s.bed} d="M38 38 H176 V90 A38 38 0 0 0 152 106 H38 Z" style={{ "--d": delay } as CSSProperties} />
      <path {...d} className={s.scroll} d="M48 92 C56 52 104 48 116 70 C124 86 104 96 96 84 C90 74 102 66 108 74" />
      <path {...d} className={s.scroll} d="M66 46 C96 40 128 50 156 46 M128 98 C140 82 160 70 170 52" />
    </g>
  );
}

/** The parterre seen from above: four mirrored beds around a fountain. */
function Parterre({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 400 260" className={cn(s.parterre, className)} {...fx("draw")}>
      <rect data-draw="" pathLength={1} className={s.hedge} x="12" y="12" width="376" height="236" rx="4" />
      <Quarter delay={0} />
      <g transform="matrix(-1 0 0 1 400 0)"><Quarter delay={150} /></g>
      <g transform="matrix(1 0 0 -1 0 260)"><Quarter delay={300} /></g>
      <g transform="matrix(-1 0 0 -1 400 260)"><Quarter delay={450} /></g>
      <circle data-draw="" pathLength={1} className={s.hedge} cx="200" cy="130" r="30" />
      <circle data-draw-fill="" className={s.water} cx="200" cy="130" r="20" />
      {[[200, 50], [200, 210], [110, 130], [290, 130]].map(([x, y], i) => (
        <circle key={i} data-draw-fill="" className={s.topiary} cx={x} cy={y} r="6" style={{ "--d": 600 + i * 120 } as CSSProperties} />
      ))}
    </svg>
  );
}

/** A small leafy sprig. */
function Sprig({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 60 30" className={cn(s.sprig, className)}>
      <path d="M4 26 C20 20 36 14 56 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {[10, 20, 30, 40].map((x, i) => (
        <path key={x} d={`M${x} ${24 - i * 5} c-4 -7 2 -12 7 -12 c0 6 -3 11 -7 12Z`} fill="currentColor" opacity=".85" />
      ))}
    </svg>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <p className={s.kicker} {...fx("fade")}>{content.eyebrow || kitCopy(model).together}</p>
      <Parterre className={s.heroPlan} />
      <h1 className={s.names}>
        <span {...fx("rise", 300)}>{wedding.partnerOne}</span>
        <span className={s.amp} {...fx("fade", 600)}>{amp(model)}</span>
        <span {...fx("rise", 450)}>{wedding.partnerTwo}</span>
      </h1>
      <p className={s.heroDate} {...fx("rise", 700)}>
        {wedding.date?.long}
        {place?.venueName ? <span>{place.venueName}</span> : null}
      </p>
      {content.tagline ? <p className={s.tagline} {...fx("rise", 800)}>{content.tagline}</p> : null}
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  const photo = heroPhoto(model);
  return (
    <Sec id="couple" className={s.couple}>
      {photo ? (
        <div className={s.trellis} {...fx("scale")}>
          <Pic asset={photo} sizes="(min-width: 900px) 40vw, 90vw" className={s.trellisPhoto} />
        </div>
      ) : null}
      <div className={s.coupleText}>
        <Sprig />
        <p className={s.script} {...fx("fade")}>{content.eyebrow || kitCopy(model).with}</p>
        {content.heading ? <h2 className={s.h2} {...fx("rise")}>{content.heading}</h2> : null}
        {content.message ? <p className={s.lead} {...fx("rise", 120)}>{content.message}</p> : null}
        <p className={s.sign} {...fx("fade", 200)}>{model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.dateSec}>
      <div className={s.stake} {...fx("drop")}>
        <p className={s.stakeWeekday}>{d.weekday}</p>
        <p className={s.stakeDay}>{d.day}</p>
        <p className={s.stakeMonth}>{d.month} {d.year}</p>
      </div>
      {content.heading ? <p className={s.kicker}>{content.heading}</p> : null}
      {content.note ? <p className={s.small}>{content.note}</p> : null}
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.sec}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("scale")}>
        <Clock model={model} className={s.topiaries} unit={s.topiaryUnit} value={s.topiaryValue} label={s.topiaryLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.story}>
      <div className={s.storyText}>
        <p className={s.script} {...fx("fade")}>{copy(model).garden}</p>
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
      {p ? <Pic asset={p} sizes="(min-width: 900px) 34vw, 80vw" className={s.diamondPhoto} {...fx("scale")} /> : null}
    </Sec>
  );
}

function Allee({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.alleeSec}>
      <article className={cn(s.allee, id === "reception" && s.alleeAlt)} {...fx("rise")}>
        <span className={s.hedgeTop} aria-hidden />
        <div className={s.alleeBody}>
          <p className={s.script}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
          <h2 className={s.h3}>{content.heading || e.title}</h2>
          {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
          {eventDate(model, e) ? <p className={s.small}>{eventDate(model, e)}</p> : null}
          {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
          {e.address ? <p className={s.small}>{e.address}</p> : null}
          {content.note ? <p className={s.note}>{content.note}</p> : null}
          <Directions model={model} event={e} className={s.pill} />
        </div>
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
          <figure key={e.id} className={s.mapFig} {...fx("scale")}>
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
      <p className={cn(s.script, s.center)}>{copy(model).walk}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.walk}>
        {items.map((it, i) => (
          <li key={i} {...fx("rise")}>
            <span className={s.stone} aria-hidden style={{ "--r": `${(i * 37) % 60 - 30}deg` } as CSSProperties} />
            <time>{it.time}</time>
            <p className={s.walkTitle}>{it.title}</p>
            {it.note ? <p className={s.small}>{it.note}</p> : null}
          </li>
        ))}
      </ol>
    </Sec>
  );
}

/**
 * Where photo i sits in the diamond lattice: rows of three then two on wide
 * screens, two then one on phones, each row tucked half into the one above.
 */
function latticeSpot(i: number, n: number): CSSProperties {
  const spot = (per: number, wide: number[], narrow: number[]) => {
    const g = Math.floor(i / per);
    const k = i % per;
    const first = wide.length;
    if (k >= first) return { row: 2 + 2 * g, col: narrow[k - first] };
    // A short last row is centred instead of hugging the start.
    const left = Math.min(first, n - g * per);
    const cols = left === first ? wide : left === 1 ? [wide[0] + (wide[first - 1] - wide[0]) / 2] : narrow;
    return { row: 1 + 2 * g, col: cols[k] };
  };
  const d = spot(5, [1, 3, 5], [2, 4]);
  const m = spot(3, [1, 3], [2]);
  return { "--row-d": d.row, "--col-d": d.col, "--row-m": m.row, "--col-m": m.col } as CSSProperties;
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 8);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.gallery}>
      <h2 className={cn(s.h2, s.center)} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={cn(s.small, s.center)}>{content.caption}</p> : null}
      <div className={s.lattice}>
        {list.map((p, i) => (
          <div key={p.id} className={s.latticeCell} style={latticeSpot(i, list.length)} {...fx("scale")}>
            <Pic asset={p} sizes="(min-width: 900px) 30vw, 50vw" className={s.latticePhoto} />
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvpSec}>
      <div className={s.packet} {...fx("rise")}>
        <span className={s.flap} aria-hidden />
        <p className={s.packetKicker}>{copy(model).packet}</p>
        <Sprig className={s.packetSprig} />
        <h2 className={s.h2}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={s.deadline}>{content.deadline}</p> : null}
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
      <div className={s.faqList}>
        {items.map((it, i) => (
          <details key={i} className={s.qa} {...fx("rise")}>
            <summary>
              <Sprig className={s.qaSprig} />
              {it.question}
            </summary>
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
      <svg aria-hidden viewBox="0 0 120 120" className={s.fountain} {...fx("draw")}>
        <circle data-draw="" pathLength={1} cx="60" cy="60" r="54" className={s.hedge} />
        <circle data-draw="" pathLength={1} cx="60" cy="60" r="40" className={s.hedge} style={{ "--d": 200 } as CSSProperties} />
        <circle data-draw-fill="" cx="60" cy="60" r="30" className={s.water} />
        <path data-draw="" pathLength={1} d="M60 6 V20 M60 100 V114 M6 60 H20 M100 60 H114" className={s.scroll} />
      </svg>
      <p className={s.closingTitle} {...fx("rise")}>{content.heading}</p>
      {content.message ? <p className={s.lead} {...fx("rise", 120)}>{content.message}</p> : null}
      {content.signature ? <p className={s.sign} {...fx("fade", 200)}>{content.signature}</p> : null}
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <p className={s.footerNames}>{model.wedding.coupleName}</p>
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
  ceremony: (p) => <Allee id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <Allee id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function JardinRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="jardin" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

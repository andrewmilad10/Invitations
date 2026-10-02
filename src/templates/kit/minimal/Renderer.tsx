import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, pad2, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./minimal.module.css";

/**
 * 3 · Modern Minimal — a Swiss grid. Faint column lines behind everything,
 * giant light names set tight, a meta row in monospace, sections numbered
 * (01)…(12) with a hairline that draws itself, a scrolling photo strip and
 * a solid colour block for the reply. Motion: quick, precise line reveals.
 *
 * Colours: bg = white/bone, surface = a step darker, fg = ink, muted = grey
 * labels, accent = the single colour (a dot, the RSVP block).
 */

/** Section numbers follow the order the couple chose. */
const indexOf = (model: InvitationModel, id: string) => model.sections.findIndex((x) => x.type === id) + 1;

function Head({ model, id, title, aside }: { model: InvitationModel; id: string; title: ReactNode; aside?: ReactNode }) {
  return (
    <div className={s.head}>
      <span className={s.rule} {...fx("line")} />
      <p className={s.num}>({pad2(indexOf(model, id))})</p>
      <h2 className={s.h2} {...fx("mask-up")}>{title}</h2>
      {aside ? <p className={s.aside}>{aside}</p> : null}
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const photo = heroPhoto(model);
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.meta} data-k-stagger="" {...fx("rise")}>
        <span>{content.eyebrow || kitCopy(model).together}</span>
        <span>{wedding.date?.short}</span>
        <span>{place?.venueName}</span>
      </div>
      <h1 className={s.names}>
        <span {...fx("mask-up")}>{wedding.partnerOne}</span>
        <span className={s.amp} {...fx("fade", 300)}>{model.locale === "ar" ? "و" : "&"}</span>
        <span className={s.two} {...fx("mask-up", 120)}>{wedding.partnerTwo}</span>
      </h1>
      <div className={s.heroFoot}>
        {content.tagline ? <p className={s.tagline} {...fx("rise", 400)}>{content.tagline}</p> : <span />}
        {photo ? (
          <figure className={s.heroFig} {...fx("wipe", 300)}>
            <Pic asset={photo} sizes="(min-width: 900px) 26vw, 60vw" priority className={s.heroPhoto} />
            <figcaption>(01) {wedding.coupleName}</figcaption>
          </figure>
        ) : null}
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <Head model={model} id="couple" title={content.heading || kitCopy(model).with} aside={content.eyebrow} />
      <div className={s.body}>
        {content.message ? <p className={s.statement} {...fx("rise")}>{content.message}</p> : null}
        <p className={s.mono} {...fx("fade")}>— {model.wedding.coupleName}</p>
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <Head model={model} id="date" title={content.heading} />
      <div className={s.body}>
        <p className={s.giantDate} {...fx("mask-up")}>{d.short}</p>
        <p className={s.mono}>{d.weekday}{content.note ? ` — ${content.note}` : ""}</p>
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.sec}>
      <Head model={model} id="countdown" title={content.heading || kitCopy(model).countdown} />
      <div className={s.body} {...fx("rise")}>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.sec}>
      <Head model={model} id="story" title={content.heading || kitCopy(model).ourStory} />
      <div className={s.body}>
        {content.body ? (
          <div className={s.columns} {...fx("rise")}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <p className={s.statement} {...fx("rise")}>
            “{content.quote}”{content.quoteSource ? <span className={s.mono}> — {content.quoteSource}</span> : null}
          </p>
        ) : null}
      </div>
      {p ? <Pic asset={p} sizes="100vw" className={s.wideShot} {...fx("wipe")} /> : null}
    </Sec>
  );
}

function EventRow({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.sec}>
      <Head model={model} id={id} title={content.heading || e.title} aside={e.title || (id === "ceremony" ? t.ceremony : t.reception)} />
      <dl className={s.table} data-k-stagger="" {...fx("rise")}>
        <div><dt>{t.time}</dt><dd className={s.big}>{e.timeLabel ?? "—"}</dd></div>
        <div><dt>{t.date}</dt><dd>{eventDate(model, e) ?? "—"}</dd></div>
        <div><dt>{t.place}</dt><dd>{e.venueName ?? "—"}{e.address ? <span className={s.muted}>{e.address}</span> : null}</dd></div>
        <div><dt />
          <dd>
            {content.note ? <span className={s.muted}>{content.note}</span> : null}
            <Directions model={model} event={e} className={s.arrow} />
          </dd>
        </div>
      </dl>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <Head model={model} id="venue" title={content.heading || kitCopy(model).venue} aside={content.note} />
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} {...fx("wipe")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption className={s.mono}>{e.venueName ?? e.title}{e.address ? ` — ${e.address}` : ""}</figcaption>
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
      <Head model={model} id="schedule" title={content.heading || kitCopy(model).schedule} />
      <ol className={s.timeline} data-k-stagger="" {...fx("rise")}>
        {items.map((it, i) => (
          <li key={i}>
            <time>{it.time}</time>
            <p>{it.title}</p>
            {it.note ? <p className={s.muted}>{it.note}</p> : null}
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
    <Sec id="gallery" className={cn(s.sec, s.gallerySec)}>
      <Head model={model} id="gallery" title={content.heading || kitCopy(model).gallery} aside={content.caption || `${pad2(list.length)}`} />
      <div className={s.strip} tabIndex={0} aria-label={content.heading || kitCopy(model).gallery}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.frame} {...fx("rise")}>
            <Pic asset={p} sizes="(min-width: 900px) 30vw, 75vw" className={s.framePhoto} />
            <figcaption className={s.mono}>({pad2(i + 1)})</figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvp}>
      <p className={s.mono}>({pad2(indexOf(model, "rsvp"))}) {content.deadline}</p>
      <h2 className={s.rsvpTitle} {...fx("mask-up")}>{content.heading || kitCopy(model).rsvp}</h2>
      <div className={s.rsvpRow}>
        {content.message ? <p {...fx("rise")}>{content.message}</p> : <span />}
        <ReplyLink content={content} className={s.rsvpLink} />
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <Head model={model} id="faq" title={content.heading || kitCopy(model).faq} />
      <div className={s.body}>
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
      <p className={s.closingTitle} {...fx("mask-up")}>{content.heading}</p>
      {content.message ? <p className={s.muted}>{content.message}</p> : null}
      {content.signature ? <p className={s.mono}>{content.signature}</p> : null}
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <span>{model.wedding.coupleName}</span>
      <span>{[model.wedding.date?.short, content.note].filter(Boolean).join(" / ")}</span>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <EventRow id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <EventRow id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function MinimalRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="minimal" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

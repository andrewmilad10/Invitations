import type { CSSProperties } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, pad2, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { FilmOpening } from "./opening";
import s from "./film.module.css";

/**
 * 10 · Film Story — the wedding as a feature film. Opens on a projector
 * leader counting down; the hero is letterboxed with title credits; the
 * date is a clapperboard; the ceremony and party are screenplay scenes with
 * sluglines; the day rolls like end credits; photos run on a film strip
 * with sprocket holes; the reply is a "coming soon" poster under marquee
 * bulbs; it closes on an iris-out "The End". Motion: flicker, iris and
 * letterbox wipes, film grain throughout.
 *
 * Colours: bg = the dark of the cinema (or a silver screen), surface = a
 * lifted dark, fg = screen light, muted = dim grey, accent = projector
 * amber (bulbs, slate, timecodes), accent-fg = text on it.
 */

const COPY = {
  en: {
    presents: "A love story", premiere: "Premiering", starring: "Starring", scene: "Scene", take: "Take", roll: "Roll", prod: "Production",
    date: "Date", int: "INT.", locations: "Locations", credits: "The day", strip: "Stills", soon: "Coming soon", seat: "Save your seat",
    bts: "Behind the scenes", end: "The End",
  },
  ar: {
    presents: "قصة حب", premiere: "العرض الأول", starring: "بطولة", scene: "مشهد", take: "لقطة", roll: "بكرة", prod: "إنتاج",
    date: "التاريخ", int: "داخلي.", locations: "مواقع التصوير", credits: "برنامج اليوم", strip: "لقطات", soon: "قريبًا", seat: "احجز مقعدك",
    bts: "خلف الكواليس", end: "النهاية",
  },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);
const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");
/** A timecode for the n-th paragraph, steady across renders. */
const timecode = (n: number) => `00:${pad2(3 + n * 7)}:${pad2((n * 23) % 60)}:${pad2((n * 11) % 24)}`;

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const c = copy(model);
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.screen}>
        <Pic asset={heroPhoto(model)} sizes="100vw" priority className={s.heroPhoto} {...fx("zoom")} />
        <span className={s.vignette} aria-hidden />
        <div className={s.titles}>
          <p className={s.presents} {...fx("blur", 300)}>{content.eyebrow || c.presents}</p>
          <h1 className={s.title}>
            <span {...fx("blur", 500)}>{wedding.partnerOne}</span>
            <i {...fx("fade", 800)}>{amp(model)}</i>
            <span {...fx("blur", 650)}>{wedding.partnerTwo}</span>
          </h1>
          <p className={s.premiere} {...fx("blur", 950)}>
            {c.premiere} <b>{wedding.date?.long}</b>
          </p>
        </div>
      </div>
      {content.tagline ? <p className={s.subtitle} {...fx("fade", 1100)}>{content.tagline}</p> : null}
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  const c = copy(model);
  return (
    <Sec id="couple" className={s.billing}>
      <p className={s.label} {...fx("fade")}>{content.eyebrow || c.starring}</p>
      <p className={s.billNames} {...fx("blur")}>
        {model.wedding.partnerOne} <i>{amp(model)}</i> {model.wedding.partnerTwo}
      </p>
      {content.heading ? <h2 className={s.h2} {...fx("blur", 120)}>{content.heading}</h2> : null}
      {content.message ? <p className={s.subtitleText} {...fx("fade", 220)}>{content.message}</p> : null}
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  const c = copy(model);
  return (
    <Sec id="date" className={s.sec}>
      <div className={s.slate} {...fx("rise")}>
        <span className={s.clapper} aria-hidden />
        <div className={s.slateGrid}>
          <div className={s.slateWide}><small>{c.prod}</small><b>{model.wedding.coupleName}</b></div>
          <div><small>{c.scene}</small><b>01</b></div>
          <div><small>{c.take}</small><b>01</b></div>
          <div><small>{c.roll}</small><b>{d.year}</b></div>
          <div className={s.slateWide}><small>{content.heading || c.date}</small><b>{d.long}</b></div>
        </div>
        {content.note ? <p className={s.small}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={cn(s.sec, s.center)}>
      <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("fade", 150)}>
        <Clock model={model} className={s.leaders} unit={s.leaderUnit} value={s.leaderValue} label={s.leaderLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  const paras = content.body ? content.body.split(/\n\s*\n/).filter(Boolean) : [];
  return (
    <Sec id="story" className={s.sec}>
      <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).ourStory}</h2>
      {p ? <Pic asset={p} sizes="100vw" className={s.scope} {...fx("letterbox")} /> : null}
      <ol className={s.scenes}>
        {paras.map((text, i) => (
          <li key={i} {...fx("rise")}>
            <span className={s.tc}>{timecode(i)}</span>
            <Paragraphs text={text} />
          </li>
        ))}
      </ol>
      {content.quote ? (
        <blockquote className={s.subtitleQuote} {...fx("fade")}>
          {content.quote}
          {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
        </blockquote>
      ) : null}
    </Sec>
  );
}

function Scene({ id, n, model, content }: { id: "ceremony" | "reception"; n: number; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const c = copy(model);
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.sec}>
      <article className={s.script} {...fx("rise")}>
        <p className={s.sceneNo}>{c.scene} {pad2(n)}</p>
        <p className={s.slug}>
          {c.int} {(e.venueName ?? e.title ?? "").toUpperCase()} — {(e.timeLabel ?? "").toUpperCase()}
        </p>
        <p className={s.character}>{(e.title || (id === "ceremony" ? t.ceremony : t.reception)).toUpperCase()}</p>
        <h2 className={s.dialogue}>{content.heading || e.title}</h2>
        <p className={s.action}>{[eventDate(model, e), e.address].filter(Boolean).join(". ")}{e.address || eventDate(model, e) ? "." : ""}</p>
        {content.note ? <p className={s.action}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.cut}>
          {model.strings.directions} →
        </Directions>
      </article>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <p className={cn(s.label, s.center)}>{copy(model).locations}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("blur")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={cn(s.small, s.center)}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e, i) => (
          <figure key={e.id} className={s.mapFig} {...fx("letterbox")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption>
              <span className={s.tc}>LOC {pad2(i + 1)}</span> {e.venueName ?? e.title}
              {e.address ? <span className={s.small}> — {e.address}</span> : null}
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
    <Sec id="schedule" className={s.credits}>
      <h2 className={s.h2} {...fx("blur")}>{content.heading || copy(model).credits}</h2>
      <div className={s.roll} data-k-progress="">
        <dl className={s.rollInner}>
          {items.map((it, i) => (
            <div key={i}>
              <dt>{it.time}</dt>
              <dd>
                {it.title}
                {it.note ? <small>{it.note}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 9);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.stripSec}>
      <div className={s.stripHead}>
        <p className={s.label}>{copy(model).strip}</p>
        <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).gallery}</h2>
        {content.caption ? <p className={s.small}>{content.caption}</p> : null}
      </div>
      <div className={s.strip} tabIndex={0} aria-label={content.heading || kitCopy(model).gallery}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.frame} style={{ "--n": i } as CSSProperties}>
            <Pic asset={p} sizes="(min-width: 900px) 30vw, 70vw" className={s.framePhoto} />
            <figcaption>{pad2(i + 12)}A</figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const c = copy(model);
  return (
    <Sec id="rsvp" className={s.sec}>
      <div className={s.marquee} {...fx("rise")}>
        <div className={s.poster}>
          <p className={s.label}>{c.soon}</p>
          <h2 className={s.posterTitle}>{content.heading || kitCopy(model).rsvp}</h2>
          {content.deadline ? <p className={s.posterLine}>{content.deadline}</p> : null}
          {content.message ? <p className={s.posterText}>{content.message}</p> : null}
          <ReplyLink content={content} className={s.button}>
            {content.linkLabel || c.seat}
          </ReplyLink>
        </div>
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <p className={cn(s.label, s.center)}>{copy(model).bts}</p>
      <h2 className={cn(s.h2, s.center)} {...fx("blur")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.faqList}>
        {items.map((it, i) => (
          <details key={i} className={s.qa} {...fx("rise")}>
            <summary>
              <span className={s.tc}>{pad2(i + 1)}</span> {it.question}
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
      <div className={s.iris} {...fx("iris")}>
        <p className={s.theEnd}>{copy(model).end}</p>
        {content.heading ? <p className={s.h2}>{content.heading}</p> : null}
        {content.message ? <p className={s.subtitleText}>{content.message}</p> : null}
        {content.signature ? <p className={s.label}>{content.signature}</p> : null}
      </div>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <p>{model.wedding.coupleName}</p>
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
  ceremony: (p) => <Scene id="ceremony" n={2} model={p.model} content={p.content} />,
  reception: (p) => <Scene id="reception" n={3} model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function FilmRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="film" className={s.root} after={model.mode === "export" ? null : <FilmOpening model={model} />}>
      <span className={s.grain} aria-hidden />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

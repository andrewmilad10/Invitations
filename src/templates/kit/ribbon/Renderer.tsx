/* eslint-disable @next/next/no-img-element -- photographed paper objects layered over the page */
import type { ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./ribbon.module.css";

/**
 * Ribbon & Pearls — soft ivory paper with one long satin ribbon that runs down
 * the side of the whole page. It is tied in a bow on the first screen, and a
 * small cluster of pearls sits where it crosses each section line. Names in a
 * light high-contrast serif in dusty rose, the rest quiet. The ribbon, bow,
 * pearls, frames, seals, gold sprig and rose paper are photographed objects made
 * for Vellum (public/templates/ribbon-pearls). Motion: the
 * ribbon draws down once on arrival; sections fade in gently.
 *
 * Colours: bg = ivory paper, surface = a lighter card, fg = ink, muted = soft
 * text, accent = warm copper-brown (names, titles, links), accent-fg = paper,
 * border = hairlines.
 */

const T = {
  en: { together: "Together with their families", invite: "We invite you to celebrate our love", story: "Our story", schedule: "Evening schedule", moments: "Moments", qa: "Questions & answers", love: "With love," },
  ar: { together: "بمباركة عائلتيهما", invite: "ندعوكم لمشاركتنا فرحتنا", story: "حكايتنا", schedule: "برنامج الليلة", moments: "لحظات", qa: "أسئلة وأجوبة", love: "مع حبنا،" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const ART = "/templates/ribbon-pearls";

/** Three pearls tied with thread (on the ribbon, or centred on a section line). */
function Pearls({ className }: { className?: string }) {
  return <img src={`${ART}/pearls.webp`} alt="" className={`${s.pearls} ${className ?? ""}`} width={140} height={138} loading="lazy" />;
}

/** The satin bow at the top of the ribbon. */
function Bow() {
  return <img src={`${ART}/bow.webp`} alt="" className={s.bow} width={300} height={417} fetchPriority="high" />;
}

/** A gold foil leafy stem (decoration beside the ceremony). */
function Leaf({ className }: { className?: string }) {
  return <img src={`${ART}/leaf.webp`} alt="" className={`${s.leaf} ${className ?? ""}`} width={260} height={401} loading="lazy" />;
}

/** A copper wax seal pressed with the reply letters. */
function Seal({ text }: { text: string }) {
  return (
    <span className={s.seal} aria-hidden="true">
      <img src={`${ART}/seal-copper.webp`} alt="" width={300} height={305} loading="lazy" />
      <span>{text}</span>
    </span>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className={s.h2}>{children}</h2>;
}

/** Every section ends on a hairline with pearls in the middle and on the ribbon. */
function Part({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <Sec id={id} className={`${s.sec} ${className ?? ""}`}>
      <div className={s.inner} {...fx("rise")}>{children}</div>
      <div className={s.line} aria-hidden="true">
        <Pearls className={s.midPearls} />
        <Pearls className={s.ribbonPearls} />
      </div>
    </Sec>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = tr(model);
  const first = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <Bow />
      <div className={s.heroText} {...fx("fade")}>
        <p className={s.together}>{content.eyebrow || t.together}</p>
        <h1 className={s.names}>
          <span>{wedding.partnerOne}</span>
          <span className={s.amp}>{model.locale === "ar" ? "و" : "&"}</span>
          <span>{wedding.partnerTwo}</span>
        </h1>
        {wedding.date ? <p className={s.date}>{wedding.date.long}</p> : null}
        {first?.venueName ? <p className={s.small}>{first.venueName}</p> : null}
        <p className={s.invite}>{content.tagline || t.invite}</p>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
      <div className={s.line} aria-hidden="true">
        <Pearls className={s.midPearls} />
        <Pearls className={s.ribbonPearls} />
      </div>
    </header>
  );
}

function Couple({ content }: SectionProps<"couple">) {
  if (!content.message && !content.heading) return null;
  return (
    <Part id="couple">
      {content.heading ? <Title>{content.heading}</Title> : null}
      {content.message ? <p className={s.body}>{content.message}</p> : null}
    </Part>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Part id="date">
      <Title>{content.heading || kitCopy(model).date}</Title>
      <p className={s.date}>{d.long}</p>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
    </Part>
  );
}

/** The countdown sits on the first screen, so its own section shows nothing. */
function CountdownBlock() {
  return null;
}

function Story({ model, content }: SectionProps<"story">) {
  const p = heroPhoto(model);
  return (
    <Part id="story">
      <Title>{content.heading || tr(model).story}</Title>
      <div className={p ? s.storyRow : undefined}>
        <div className={s.storyText}>
          {content.body ? <Paragraphs text={content.body} /> : null}
          {content.quote ? <p className={s.quote}>{content.quote}{content.quoteSource ? <span className={s.small}> — {content.quoteSource}</span> : null}</p> : null}
        </div>
        {p ? (
          <div className={s.pearlFrame}>
            <Pic asset={p} sizes="(min-width: 600px) 160px, 30vw" className={s.snapshot} />
            <img src={`${ART}/pearl-frame.webp`} alt="" className={s.frameArt} width={640} height={531} loading="lazy" />
          </div>
        ) : null}
      </div>
    </Part>
  );
}

function EventBlock({ model, e, label }: { model: InvitationModel; e: EventModel; label: string }) {
  return (
    <div className={s.event}>
      <Title>{label}</Title>
      <p className={s.body}>
        {[e.timeLabel, e.venueName].filter(Boolean).join(", ")}
        {e.address ? <><br />{e.address}</> : null}
      </p>
      <p className={s.small}>{eventDate(model, e)}</p>
      <Directions model={model} event={e} className={s.link} />
    </div>
  );
}

const has = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);
const headingOf = (m: InvitationModel, type: "ceremony" | "reception") => {
  const sec = m.sections.find((x) => x.type === type);
  return sec ? (sec.content as { heading?: string }).heading ?? "" : "";
};

/** Ceremony and party share one part when both are shown. */
function Events({ model, id, note }: { model: InvitationModel; id: "ceremony" | "reception"; note: string }) {
  const t = kitCopy(model);
  if (id === "reception" && has(model, "ceremony")) return null;
  const ids: ("ceremony" | "reception")[] = id === "ceremony" && has(model, "reception") ? ["ceremony", "reception"] : [id];
  const shown = ids
    .map((k) => [model.events[k], headingOf(model, k) || (k === "ceremony" ? t.ceremony : t.reception)] as const)
    .filter((x): x is readonly [EventModel, string] => Boolean(x[0]));
  if (!shown.length) return null;
  return (
    <Part id={id} className={s.withLeaves}>
      <Leaf className={s.leafStart} />
      <Leaf className={s.leafEnd} />
      {shown.map(([e, label]) => <EventBlock key={e.id} model={model} e={e} label={label} />)}
      {note ? <p className={s.small}>{note}</p> : null}
    </Part>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Part id="venue">
      <Title>{content.heading || kitCopy(model).venue}</Title>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
      {mapped.map((e) => (
        <figure key={e.id} className={s.mapFrame}>
          <KitMap model={model} event={e} className={s.map} />
          <figcaption className={s.small}>{e.venueName ?? e.title}</figcaption>
        </figure>
      ))}
    </Part>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Part id="schedule">
      <Title>{content.heading || tr(model).schedule}</Title>
      <ol className={s.timeline}>
        {items.map((it, i) => (
          <li key={i}>
            <span className={s.time}>{it.time}</span>
            <span className={s.what}>
              {it.title}
              {it.note ? <span className={s.note}>{it.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </Part>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Part id="gallery">
      {content.heading ? <Title>{content.heading}</Title> : null}
      {content.caption ? <p className={s.small}>{content.caption}</p> : null}
      <div className={s.grid}>
        {list.map((p) => (
          <div key={p.id} className={s.frame}>
            <Pic asset={p} sizes="(min-width: 600px) 220px, 42vw" className={s.photo} />
            <img src={`${ART}/copper-frame.webp`} alt="" className={s.frameArt} width={480} height={488} loading="lazy" />
          </div>
        ))}
      </div>
    </Part>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Part id="faq">
      <Title>{content.heading || tr(model).qa}</Title>
      <ul className={s.qa}>
        {items.map((it, i) => (
          <li key={i}>
            <span className={s.dot} aria-hidden="true" />
            <span>
              <span className={s.q}>{it.question}</span>
              <span className={s.a}>{it.answer}</span>
            </span>
          </li>
        ))}
      </ul>
    </Part>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Part id="rsvp" className={s.rsvpPart}>
      <div className={s.card}>
        <Title>{content.heading || kitCopy(model).rsvp}</Title>
        {content.deadline ? <p className={s.small}>{content.deadline}</p> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.button} />
        <Seal text={model.locale === "ar" ? "رد" : "R.S.V.P."} />
      </div>
    </Part>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={`${s.sec} ${s.closing}`}>
      <div className={s.inner} {...fx("rise")}>
        <img src={`${ART}/seal-pearl.webp`} alt="" className={s.pearlSeal} width={260} height={265} loading="lazy" />
        <p className={s.sign}>{content.heading || tr(model).love}</p>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <p className={s.sign}>{content.signature || model.wedding.coupleName}</p>
      </div>
      <Pearls className={s.endPearls} />
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <span>{model.wedding.coupleName}</span>
      {content.note ? <span>{content.note}</span> : null}
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Events model={p.model} id="ceremony" note={p.content.note} />,
  reception: (p) => <Events model={p.model} id="reception" note={p.content.note} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function RibbonRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="ribbon" className={s.root}>
      <span className={s.ribbon} aria-hidden="true" />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

/* eslint-disable @next/next/no-img-element -- photographs and line drawings layered over the paper */
import type { CSSProperties, ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitRoot, Paragraphs, Pic, Sec } from "../pieces";
import { VeilOpening, VeilReady } from "./opening";
import { ReplyForm } from "./reply";
import s from "./veil.module.css";

/**
 * Ivory Veil — all ivory and cream, vintage lace and soft photographs. It
 * opens on an ivory envelope filling the screen with a lace heart seal; a tap
 * dissolves it into a first screen of tulle and lace with the names in widely
 * spaced capitals. Below, one quiet ivory column: the couple's words in a soft
 * italic with the date spaced out and a round photo of a rose, the countdown,
 * the story beside the couple's photo in a thin oval frame, the reply card
 * resting tilted on lace, the day with a round photo of flowers in a bowl,
 * the timeline as fine line drawings in two columns, ceremony and celebration
 * under a small leaf wreath, questions, and a last word.
 * The photographs and drawings were made for Vellum (public/templates/ivory-veil).
 *
 * Colours: bg = ivory paper, surface = the cards, fg = warm grey-brown ink,
 * muted = soft taupe, accent = taupe (titles, buttons), accent-fg = ivory,
 * border = hairlines.
 */

const ART = "/templates/ivory-veil";
const ICONS = ["arch", "toast", "plate", "cake"] as const;

const T = {
  en: { story: "Our story", count: "Until we say I do", day: "The day", details: "View details", timeline: "Timeline", moments: "Moments", qa: "Questions", love: "With love,", contact: "See you soon" },
  ar: { story: "حكايتنا", count: "حتى نقول نعم", day: "يوم الزفاف", details: "التفاصيل", timeline: "البرنامج", moments: "لحظات", qa: "أسئلة", love: "مع حبنا،", contact: "نراكم قريبًا" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);
const has = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);
const v = (i: number) => ({ "--i": i }) as CSSProperties;

function Script({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={`${s.script} ${className ?? ""}`}>{children}</h2>;
}

/** First screen: tulle and lace, the names in widely spaced capitals, the date. */
function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const amp = model.locale === "ar" ? "و" : "&";
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.heroPic} role="img" aria-label="Ivory tulle and vintage lace on linen" />
      <div className={s.heroText}>
        {content.eyebrow ? <p className={`${s.caps} ${s.w}`} style={v(0)}>{content.eyebrow}</p> : null}
        <h1 className={s.names}>
          <span className={s.w} style={v(1)}>{wedding.partnerOne}</span>
          <span className={`${s.amp} ${s.w}`} style={v(2)}>{amp}</span>
          <span className={s.w} style={v(3)}>{wedding.partnerTwo}</span>
        </h1>
        {wedding.date ? <p className={`${s.heroDate} ${s.w}`} style={v(4)}>{wedding.date.short}</p> : null}
        {content.tagline ? <p className={`${s.heroTag} ${s.w}`} style={v(5)}>{content.tagline}</p> : null}
      </div>
    </header>
  );
}

/** The couple's words in a soft italic, the date spaced out, and a round photo of a rose. */
function Couple({ model, content }: SectionProps<"couple">) {
  const d = model.wedding.date;
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        {content.eyebrow ? <p className={s.caps}>{content.eyebrow}</p> : null}
        {content.heading ? <Script>{content.heading}</Script> : null}
        {content.message ? <p className={s.italic}>{content.message}</p> : null}
        {d ? <p className={s.spaced}>{d.short.split(/[./]/).join(" · ")}</p> : null}
        <span className={s.roundSmall} aria-hidden="true" />
      </div>
    </Sec>
  );
}

function DateBlock() {
  return null;
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.sec}>
      <div className={s.col} {...fx("fade")}>
        <p className={s.caps}>{content.heading || tr(model).count}</p>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

/** The story, then the couple's photo in a thin oval frame. */
function Story({ model, content }: SectionProps<"story">) {
  const p = heroPhoto(model);
  return (
    <Sec id="story" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || tr(model).story}</Script>
        {content.body ? <div className={s.body}><Paragraphs text={content.body} /></div> : null}
        {content.quote ? (
          <p className={s.italic}>
            {content.quote}
            {content.quoteSource ? <span className={s.small}> — {content.quoteSource}</span> : null}
          </p>
        ) : null}
        {p ? (
          <div className={s.oval}>
            <Pic asset={p} sizes="(min-width: 600px) 260px, 60vw" className={s.ovalPic} />
          </div>
        ) : null}
      </div>
    </Sec>
  );
}

/** The reply card resting, slightly tilted, on lace and tulle. */
function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const copy = kitCopy(model);
  return (
    <Sec id="rsvp" className={s.reply}>
      <div className={s.replyPic} aria-hidden="true" />
      <div className={s.replyCard} {...fx("rise")}>
        <h2 className={s.replyTitle}>{content.heading || copy.rsvp}</h2>
        {content.deadline ? <p className={s.caps}>{content.deadline}</p> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <ReplyForm locale={model.locale} linkUrl={content.linkUrl} linkLabel={content.linkLabel || content.heading || copy.rsvp} demo={model.mode !== "live"} />
      </div>
    </Sec>
  );
}

const headingOf = (m: InvitationModel, type: "ceremony" | "reception") => {
  const sec = m.sections.find((x) => x.type === type);
  return sec ? (sec.content as { heading?: string }).heading ?? "" : "";
};

/** Ceremony and celebration under a small leaf wreath, each with the way there. */
function Events({ model, id, note }: { model: InvitationModel; id: "ceremony" | "reception"; note: string }) {
  const t = kitCopy(model);
  if (id === "reception" && has(model, "ceremony")) return null;
  const ids: ("ceremony" | "reception")[] = id === "ceremony" && has(model, "reception") ? ["ceremony", "reception"] : [id];
  const shown = ids
    .map((k) => [model.events[k], headingOf(model, k) || (k === "ceremony" ? t.ceremony : t.reception)] as const)
    .filter((x): x is readonly [EventModel, string] => Boolean(x[0]));
  if (!shown.length) return null;
  return (
    <Sec id={id} className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <div className={s.wreath} aria-hidden="true">
          <img src={`${ART}/wreath.webp`} alt="" width={560} height={538} loading="lazy" />
        </div>
        {shown.map(([e, label]) => (
          <div key={e.id} className={s.event}>
            <Script>{label}</Script>
            <p className={s.spaced}>{eventDate(model, e)}</p>
            {e.timeLabel ? <p className={s.spaced}>{e.timeLabel}</p> : null}
            {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
            {e.address ? <p className={s.small}>{e.address}</p> : null}
            {e.description ? <p className={s.body}>{e.description}</p> : null}
            <Directions model={model} event={e} className={s.outline} />
          </div>
        ))}
        {note ? <p className={s.body}>{note}</p> : null}
      </div>
    </Sec>
  );
}

/** The venue note (the places and their links are with the ceremony and celebration). */
function Venue({ content }: SectionProps<"venue">) {
  if (!content.note) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        {content.heading ? <Script>{content.heading}</Script> : null}
        <p className={s.body}>{content.note}</p>
      </div>
    </Sec>
  );
}

/** The day: a short word with a "View details" button, a round photo of flowers in a bowl, then the timeline drawings. */
function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  const t = tr(model);
  return (
    <Sec id="schedule" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || t.day}</Script>
        <a className={s.outline} href="#timeline">{t.details}</a>
        <span className={s.bowl} aria-hidden="true" />
      </div>
      <div id="timeline" className={s.timeBox} {...fx("rise", 120)}>
        <Script>{t.timeline}</Script>
        <ol className={s.timeline}>
          {items.map((it, i) => (
            <li key={i}>
              <img src={`${ART}/icon-${ICONS[i % ICONS.length]}.webp`} alt="" className={s.icon} width={120} height={120} loading="lazy" aria-hidden="true" />
              <span className={s.time}>{it.time}</span>
              <span className={s.what}>{it.title}</span>
              {it.note ? <span className={s.small}>{it.note}</span> : null}
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (list.length < 2) return null;
  return (
    <Sec id="gallery" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || tr(model).moments}</Script>
        {content.caption ? <p className={s.small}>{content.caption}</p> : null}
        <div className={s.grid}>
          {list.map((p) => (
            <Pic key={p.id} asset={p} sizes="(min-width: 600px) 240px, 44vw" className={s.gridPic} />
          ))}
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
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || tr(model).qa}</Script>
        <div className={s.faq}>
          {items.map((it, i) => (
            <details key={i}>
              <summary>{it.question}</summary>
              <p>{it.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  const t = tr(model);
  return (
    <Sec id="closing" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || t.contact}</Script>
        {content.message ? <p className={s.italic}>{content.message}</p> : null}
        <p className={s.caps}>{t.love}</p>
        <p className={s.signed}>{content.signature || model.wedding.coupleName}</p>
      </div>
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

export default function VeilRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="veil" className={s.root} after={model.mode === "export" ? null : <VeilOpening model={model} />}>
      <VeilReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

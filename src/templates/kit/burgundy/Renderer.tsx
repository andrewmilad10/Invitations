import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { BurgundyOpening, HeroVideo } from "./media";
import s from "./burgundy.module.css";

/**
 * Burgundy Envelope — a candle-lit evening. Opens on an embossed burgundy
 * envelope (video) that lifts slowly; a cinematic hero video with the names
 * in script; cream pages with wine and gold for the welcome, countdown, a
 * calendar with the day circled, the celebration time, the venue in an arch,
 * event guidelines and the reply.
 *
 * Media (public/templates/burgundy-envelope) are placeholders to replace —
 * see MEDIA-NOTICE.md there. Colours: bg = cream, surface = warm sand,
 * fg = brown ink, muted = gold (labels, rules), accent = wine, accent-fg = cream.
 */

const WEEK = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ar: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"] };

function Rule({ mark = "✦" }: { mark?: string }) {
  return (
    <div className={s.rule} aria-hidden>
      {mark}
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <HeroVideo still={model.mode === "export"} />
      <div className={s.heroContent}>
        <p className={s.eyebrowLight}>{content.eyebrow || kitCopy(model).together}</p>
        <h1 className={s.names}>
          {wedding.partnerOne} <em>{model.locale === "ar" ? "و" : "&"}</em> {wedding.partnerTwo}
        </h1>
        <Rule mark="◇" />
        {wedding.date ? <p className={s.heroDate}>{wedding.date.long}</p> : null}
        {content.tagline ? <p className={s.heroTagline}>{content.tagline}</p> : null}
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <p className={s.eyebrow} {...fx("rise")}>{content.eyebrow || kitCopy(model).with}</p>
      {content.heading ? <h2 className={s.h2} {...fx("rise")}>{content.heading}</h2> : null}
      <Rule />
      {content.message ? <p className={s.intro} {...fx("rise", 120)}>{content.message}</p> : null}
    </Sec>
  );
}

/** The month of the wedding with the day circled. */
function Calendar({ model }: { model: InvitationModel }) {
  const iso = model.wedding.weddingDate;
  const d = model.wedding.date;
  if (!iso || !d) return null;
  const [y, m, day] = iso.slice(0, 10).split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return (
    <div className={s.calendar} {...fx("rise")}>
      <p className={s.eyebrow}>{model.locale === "ar" ? "احفظوا التاريخ" : "Save the date"}</p>
      <p className={s.calTitle}>
        {d.month} <span>{d.year}</span>
      </p>
      <Rule mark="❧" />
      <div className={s.calGrid}>
        {WEEK[model.locale === "ar" ? "ar" : "en"].map((w) => (
          <b key={w}>{w}</b>
        ))}
        {Array.from({ length: first }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => (
          <span key={i} className={i + 1 === day ? s.theDay : undefined} aria-label={i + 1 === day ? d.long : undefined}>
            {i + 1}
          </span>
        ))}
      </div>
      <Rule mark="♡" />
      <p className={s.calNote}>{model.locale === "ar" ? "لا نطيق الانتظار للاحتفال معكم" : "We can't wait to celebrate with you"}</p>
    </div>
  );
}

function DateBlock({ model }: SectionProps<"date">) {
  return (
    <Sec id="date" className={s.sec}>
      <Calendar model={model} />
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  const showCalendar = !model.sections.some((x) => x.type === "date");
  return (
    <Sec id="countdown" className={s.sec}>
      <p className={s.eyebrow}>{model.locale === "ar" ? "اليوم الكبير" : "The big day"}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("rise", 120)}>
        <Clock model={model} className={s.countdown} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
      {showCalendar ? (
        <div className={s.calendarWrap}>
          <Calendar model={model} />
        </div>
      ) : null}
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.sec}>
      <p className={s.eyebrow}>{kitCopy(model).ourStory}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).ourStory}</h2>
      <Rule />
      {p ? <Pic asset={p} sizes="(min-width: 700px) 420px, 80vw" className={s.archPhoto} {...fx("rise")} /> : null}
      {content.body ? (
        <div className={s.prose} {...fx("rise", 120)}>
          <Paragraphs text={content.body} />
        </div>
      ) : null}
      {content.quote ? <p className={s.intro}>“{content.quote}”</p> : null}
    </Sec>
  );
}

function Event({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  const first = model.sections.find((x) => x.type === "ceremony" || x.type === "reception")?.type === id;
  return (
    <Sec id={id} className={s.sec}>
      <p className={s.eyebrow}>{e.title || (id === "ceremony" ? t.ceremony : t.reception)}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || e.title}</h2>
      <Rule mark="◈" />
      {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
      {eventDate(model, e) ? <p>{eventDate(model, e)}</p> : null}
      <div className={cn(s.venueBlock, !first && s.venueSolo)}>
        <div {...fx("rise")}>
          {e.venueName ? <h3 className={s.h3}>{e.venueName}</h3> : null}
          {e.address ? <p>{e.address}</p> : null}
          {content.note ? <p className={s.note}>{content.note}</p> : null}
          <Directions model={model} event={e} className={s.button} />
        </div>
        {first ? <span className={s.venueArt} role="img" aria-label={e.venueName ?? e.title ?? ""} {...fx("rise", 120)} /> : null}
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <p className={s.eyebrow}>{model.locale === "ar" ? "انضموا إلينا في" : "Join us at"}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} {...fx("rise")}>
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
    <Sec id="schedule" className={s.sec}>
      <p className={s.eyebrow}>{model.locale === "ar" ? "برنامج السهرة" : "Evening schedule"}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).schedule}</h2>
      <Rule mark="◈" />
      <ol className={s.schedule}>
        {items.map((it, i) => (
          <li key={i} {...fx("rise")}>
            <p className={s.time}>{it.time}</p>
            <p>{it.title}</p>
            {it.note ? <p className={s.note}>{it.note}</p> : null}
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
    <Sec id="gallery" className={s.sec}>
      <p className={s.eyebrow}>{content.caption || (model.locale === "ar" ? "لحظات" : "Moments")}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      <div className={s.gallery}>
        {list.map((p) => (
          <Pic key={p.id} asset={p} sizes="(min-width: 700px) 320px, 45vw" className={s.galleryPhoto} {...fx("rise")} />
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <p className={s.eyebrow}>RSVP</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).rsvp}</h2>
      <Rule />
      {content.message ? <p className={s.intro}>{content.message}</p> : null}
      {content.deadline ? <p className={s.eyebrow}>{content.deadline}</p> : null}
      <ReplyLink content={content} className={s.button} />
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <p className={s.eyebrow}>{model.locale === "ar" ? "معلومات تهمّكم" : "Good to know"}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.guidelines}>
        {items.map((it, i) => (
          <article key={i} {...fx("rise")}>
            <h3 className={s.h3}>{it.question}</h3>
            <p>{it.answer}</p>
          </article>
        ))}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <Rule />
      <p className={s.closingTitle}>{content.heading}</p>
      {content.message ? <p>{content.message}</p> : null}
      <p className={s.signature}>{content.signature || model.wedding.coupleName}</p>
      {model.wedding.date ? <p className={s.eyebrow}>{model.wedding.date.long}</p> : null}
    </Sec>
  );
}

function Footer({ content }: SectionProps<"footer">) {
  if (!content.note) return null;
  return (
    <footer data-section="footer" className={s.footer}>
      {content.note}
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

export default function BurgundyRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="burgundy" className={s.root} after={model.mode === "export" ? null : <BurgundyOpening model={model} />}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

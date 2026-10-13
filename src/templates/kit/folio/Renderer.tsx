import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, roman, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./folio.module.css";

/**
 * Ivory Folio — a letterpress suite on ivory paper, drawn from a Stitch concept.
 * No pictures of its own: hairline gold frames, a dotted monogram ring, small
 * caps kickers over Garamond titles and matted photos. Each section is a
 * different piece of the same suite: a cartouche for the welcome, a band for the
 * countdown, a folio for the ceremony and party, a ruled timeline, a matted
 * gallery with roman numerals and a double-matted reply card. Motion: gentle
 * fades only.
 *
 * Colours: bg = ivory, surface = a step darker for mats and bands, fg = ink,
 * muted = grey-brown text, accent = antique gold (kickers, frames, ornaments),
 * accent-fg = paper (text on the dark button), border = pale hairlines.
 */

const T = {
  en: { together: "Together with their families", invitation: "An invitation", story: "Our story", events: "The day", order: "Order of events", moments: "Moments", info: "Good to know", rsvp: "R.S.V.P.", love: "With all our love", venue: "Where" },
  ar: { together: "بمباركة عائلتيهما", invitation: "دعوة", story: "حكايتنا", events: "اليوم", order: "برنامج الحفل", moments: "لحظات", info: "معلومات تهمّكم", rsvp: "تأكيد الحضور", love: "مع كل الحب", venue: "المكان" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

function Diamond({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" fill="currentColor" />
    </svg>
  );
}

function Rule() {
  return (
    <div className={s.rule} aria-hidden="true">
      <span />
      <Diamond className={s.diamond} />
      <span />
    </div>
  );
}

function Head({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className={s.head}>
      {title && title.trim().toLowerCase() === kicker.trim().toLowerCase() ? null : <p className={s.kicker}>{kicker}</p>}
      {title ? <h2 className={s.h2}>{title}</h2> : null}
    </div>
  );
}

const enabled = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = tr(model);
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.heroTop} {...fx("fade")}>
        <div className={s.mono} aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" strokeDasharray="2 3" />
            <circle cx="32" cy="32" r="26" />
          </svg>
          <span>{wedding.initials[0]} &amp; {wedding.initials[1]}</span>
        </div>
        <p className={s.kicker}>{content.eyebrow || t.together}</p>
      </div>
      <div className={s.heroMid} {...fx("rise", 200)}>
        <h1 className={s.names}>
          {wedding.partnerOne} <span className={s.amp}>{model.locale === "ar" ? "و" : "&"}</span> {wedding.partnerTwo}
        </h1>
        <Rule />
        {wedding.date ? <p className={s.date}>{wedding.date.long}</p> : null}
        {place?.venueName ? <p className={s.place}>{place.venueName}</p> : null}
        {content.tagline ? <p className={s.tagline}>{content.tagline}</p> : null}
      </div>
      <div className={s.heroFoot} aria-hidden="true">
        <span>{t.invitation}</span>
        <i />
      </div>
    </header>
  );
}

function Couple({ content }: SectionProps<"couple">) {
  if (!content.message && !content.heading) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.cartouche} {...fx("rise")}>
        {content.heading ? <p className={s.kicker}>{content.heading}</p> : null}
        {content.message ? <p className={s.quote}>{content.message}</p> : null}
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <div className={s.center} {...fx("rise")}>
        <Head kicker={kitCopy(model).date} title={content.heading} />
        <p className={s.date}>{d.long}</p>
        {content.note ? <p className={s.body}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.sec}>
      <div {...fx("rise")}>
        {content.heading ? <p className={`${s.kicker} ${s.centerText}`}>{content.heading}</p> : null}
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const p = heroPhoto(model);
  return (
    <Sec id="story" className={s.sec}>
      <div className={s.center} {...fx("rise")}>
        <Head kicker={tr(model).story} title={content.heading} />
        {p ? (
          <div className={s.mat}>
            <div className={s.matIn}>
              <Pic asset={p} sizes="(min-width: 600px) 400px, 90vw" className={s.storyPhoto} />
            </div>
          </div>
        ) : null}
        {content.body ? <div className={s.prose}><Paragraphs text={content.body} /></div> : null}
        {content.quote ? (
          <p className={s.quote}>
            {content.quote}
            {content.quoteSource ? <span className={s.source}> — {content.quoteSource}</span> : null}
          </p>
        ) : null}
        <Rule />
      </div>
    </Sec>
  );
}

function EventPart({ model, e, label }: { model: InvitationModel; e: EventModel; label: string }) {
  const title = e.title && e.title.trim().toLowerCase() !== label.trim().toLowerCase() ? e.title : "";
  return (
    <div className={s.event}>
      <p className={s.kicker}>{label}</p>
      {title ? <h3 className={s.h3}>{title}</h3> : null}
      {e.timeLabel ? <p className={s.italic}>{e.timeLabel}</p> : null}
      <p className={s.small}>{eventDate(model, e)}</p>
      {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
      {e.address ? <p className={s.small}>{e.address}</p> : null}
      {e.description ? <p className={s.small}>{e.description}</p> : null}
      <Directions model={model} event={e} className={s.link} />
    </div>
  );
}

const headingOf = (m: InvitationModel, type: "ceremony" | "reception") => {
  const sec = m.sections.find((x) => x.type === type);
  return sec ? (sec.content as { heading?: string }).heading ?? "" : "";
};

/** Ceremony and party share one folio when both are shown; each section's heading becomes its kicker. */
function Folio({ model, id, note }: { model: InvitationModel; id: "ceremony" | "reception"; note: string }) {
  const t = kitCopy(model);
  if (id === "reception" && enabled(model, "ceremony")) return null;
  const ids: ("ceremony" | "reception")[] = id === "ceremony" && enabled(model, "reception") ? ["ceremony", "reception"] : [id];
  const shown = ids
    .map((k) => [model.events[k], headingOf(model, k) || (k === "ceremony" ? t.ceremony : t.reception)] as const)
    .filter((x): x is readonly [EventModel, string] => Boolean(x[0]));
  if (!shown.length) return null;
  return (
    <Sec id={id} className={s.sec}>
      <div className={s.folio} {...fx("rise")}>
        {shown.map(([e, label], i) => (
          <div key={e.id} className={s.center}>
            {i > 0 ? <span className={s.short} aria-hidden="true" /> : null}
            <EventPart model={model} e={e} label={label} />
          </div>
        ))}
        {note ? <p className={`${s.small} ${s.centerText}`}>{note}</p> : null}
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <div className={s.center} {...fx("rise")}>
        <Head kicker={tr(model).venue} title={content.heading} />
        {content.note ? <p className={s.body}>{content.note}</p> : null}
        {mapped.map((e) => (
          <figure key={e.id} className={s.mat}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption className={s.caption}>{e.venueName ?? e.title}</figcaption>
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
      <div className={s.center} {...fx("rise")}>
        <Head kicker={tr(model).order} title={content.heading} />
        <ol className={s.timeline}>
          {items.map((it, i) => (
            <li key={i}>
              <p className={s.kickerSm}>{it.time}</p>
              <p className={s.h4}>{it.title}</p>
              {it.note ? <p className={s.small}>{it.note}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.sec}>
      <div className={s.center} {...fx("rise")}>
        <Head kicker={tr(model).moments} title={content.heading} />
        {content.caption ? <p className={s.body}>{content.caption}</p> : null}
        <div className={s.gallery}>
          {list.map((p, i) => (
            <figure key={p.id} className={s.matLight}>
              <Pic asset={p} sizes="(min-width: 600px) 400px, 90vw" className={i % 3 === 0 ? s.wide : s.square} />
              <figcaption className={s.caption}>{model.locale === "ar" ? i + 1 : roman(i + 1)}.{p.alt ? ` ${p.alt}` : ""}</figcaption>
            </figure>
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
      <div className={s.center} {...fx("rise")}>
        <Head kicker={tr(model).info} title={content.heading} />
        <div className={s.faq}>
          {items.map((it, i) => (
            <div key={i} className={s.qa}>
              <h4 className={s.h4}>{it.question}</h4>
              <p className={s.small}>{it.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <div className={s.reply} {...fx("rise")}>
        <Head kicker={tr(model).rsvp} title={content.heading || kitCopy(model).rsvp} />
        {content.deadline ? <p className={s.italic}>{content.deadline}</p> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.button}>
          <span>{content.linkLabel || kitCopy(model).reply}</span>
          <Diamond className={s.btnDiamond} />
        </ReplyLink>
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.center} {...fx("rise")}>
        <p className={s.goldItalic}>{content.heading || tr(model).love}</p>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <p className={s.signature}>{content.signature || model.wedding.coupleName}</p>
        <span className={s.short} aria-hidden="true" />
        {model.wedding.date ? <p className={s.kickerSm}>{model.wedding.date.long}</p> : null}
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
  ceremony: (p) => <Folio model={p.model} id="ceremony" note={p.content.note} />,
  reception: (p) => <Folio model={p.model} id="reception" note={p.content.note} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function FolioRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="folio" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

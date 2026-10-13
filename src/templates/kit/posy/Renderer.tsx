/* eslint-disable @next/next/no-img-element -- transparent painted art layered over the paper */
import type { InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./posy.module.css";

/**
 * Wild Posy — a quiet printed card. The first screen is the invitation itself:
 * hand-painted watercolour wildflowers (hydrangeas, small pink flowers, daisies,
 * fern and grasses) gathered in the four corners of warm paper, and the words in
 * the middle in one serif family: names in spaced capitals, small words in italic.
 * Every section below sits under the same painted sprig. No opening and no
 * effects; sections only fade in gently.
 * The paintings live in public/templates/wild-posy (made for Vellum).
 *
 * Colours: bg = paper, surface = a lighter card, fg = ink, muted = soft lines of
 * text, accent = ink for buttons, accent-fg = paper, border = hairlines.
 */

const ART = "/templates/wild-posy";

const T = {
  en: { together: "Together", families: "with their families", and: "and", request: "request the pleasure of your company at the celebration of their marriage", at: "at", count: "Until the day", photos: "Moments" },
  ar: { together: "بمباركة", families: "عائلتيهما", and: "و", request: "يتشرفان بدعوتكم لحضور حفل زفافهما", at: "الساعة", count: "باقي على اليوم", photos: "لحظات" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

function Sprig() {
  return <img src={`${ART}/sprig.webp`} alt="" className={s.sprig} loading="lazy" width={1200} height={136} />;
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sprig />
      <h2 className={s.h2}>{children}</h2>
    </>
  );
}

/** The card always reads "Together, with their families"; the couple's own line goes under the venue (tagline). */
function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = tr(model);
  const first = model.events.ceremony ?? model.events.reception ?? model.events.all[0] ?? null;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <img src={`${ART}/corner-big.webp`} alt="" className={`${s.corner} ${s.tl}`} width={900} height={891} fetchPriority="high" />
      <img src={`${ART}/corner-small.webp`} alt="" className={`${s.corner} ${s.tr}`} width={772} height={930} />
      <img src={`${ART}/corner-small.webp`} alt="" className={`${s.corner} ${s.bl}`} width={772} height={930} />
      <img src={`${ART}/corner-big.webp`} alt="" className={`${s.corner} ${s.br}`} width={900} height={891} />
      <div className={s.card} data-k-stagger="" {...fx("fade")}>
        <p className={s.together}>{t.together}</p>
        <p className={s.small}>{t.families}</p>
        <h1 className={s.names}>
          <span>{wedding.partnerOne}</span>
          <span className={s.and}>{t.and}</span>
          <span>{wedding.partnerTwo}</span>
        </h1>
        <p className={s.line}>{t.request}</p>
        {wedding.date ? (
          <p className={s.line}>
            {wedding.date.long}
            {first?.timeLabel ? <><br />{t.at} {first.timeLabel}</> : null}
          </p>
        ) : null}
        {first?.venueName ? <p className={s.venue}>{first.venueName}</p> : null}
        {first?.address ? <p className={s.line}>{first.address}</p> : null}
        {content.tagline ? <p className={s.line}>{content.tagline}</p> : null}
      </div>
    </header>
  );
}

function Couple({ content }: SectionProps<"couple">) {
  if (!content.message && !content.heading) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <div {...fx("rise")}>
        <Title>{content.heading}</Title>
        {content.message ? <p className={s.prose}>{content.message}</p> : null}
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <div {...fx("rise")}>
        <Title>{content.heading || kitCopy(model).date}</Title>
        <p className={s.caps}>{d.long}</p>
        {content.note ? <p className={s.prose}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.sec}>
      <div {...fx("rise")}>
        <Title>{content.heading || tr(model).count}</Title>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const p = heroPhoto(model);
  return (
    <Sec id="story" className={s.sec}>
      <div {...fx("rise")}>
        <Title>{content.heading || kitCopy(model).ourStory}</Title>
        {p ? <Pic asset={p} sizes="(min-width: 600px) 300px, 70vw" className={s.arch} /> : null}
        {content.body ? <div className={s.prose}><Paragraphs text={content.body} /></div> : null}
        {content.quote ? (
          <p className={s.quote}>
            {content.quote}
            {content.quoteSource ? <span className={s.small}> — {content.quoteSource}</span> : null}
          </p>
        ) : null}
      </div>
    </Sec>
  );
}

function EventBlock({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.sec}>
      <div {...fx("rise")}>
        <Title>{content.heading || e.title || (id === "ceremony" ? t.ceremony : t.reception)}</Title>
        {e.timeLabel ? <p className={s.caps}>{e.timeLabel}</p> : null}
        <p className={s.line}>{eventDate(model, e)}</p>
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.line}>{e.address}</p> : null}
        {content.note ? <p className={s.prose}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.link} />
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <div {...fx("rise")}>
        <Title>{content.heading || kitCopy(model).venue}</Title>
        {content.note ? <p className={s.prose}>{content.note}</p> : null}
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption className={s.small}>{e.venueName ?? e.title}</figcaption>
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
      <div {...fx("rise")}>
        <Title>{content.heading || kitCopy(model).schedule}</Title>
        <ol className={s.list}>
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
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.sec}>
      <div {...fx("rise")}>
        <Title>{content.heading || tr(model).photos}</Title>
        {content.caption ? <p className={s.small}>{content.caption}</p> : null}
        <div className={s.grid}>
          {list.map((p) => (
            <Pic key={p.id} asset={p} sizes="(min-width: 600px) 280px, 45vw" className={s.photo} />
          ))}
        </div>
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <div {...fx("rise")}>
        <Title>{content.heading || kitCopy(model).rsvp}</Title>
        {content.deadline ? <p className={s.small}>{content.deadline}</p> : null}
        {content.message ? <p className={s.prose}>{content.message}</p> : null}
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
      <div {...fx("rise")}>
        <Title>{content.heading || kitCopy(model).faq}</Title>
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

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={`${s.sec} ${s.closing}`}>
      <div {...fx("rise")}>
        <Sprig />
        {content.heading ? <p className={s.small}>{content.heading}</p> : null}
        {content.message ? <p className={s.prose}>{content.message}</p> : null}
        {content.signature ? <p className={s.signature}>{content.signature}</p> : null}
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
  ceremony: (p) => <EventBlock id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <EventBlock id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function PosyRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="posy" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

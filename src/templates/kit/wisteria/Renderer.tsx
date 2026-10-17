/* eslint-disable @next/next/no-img-element -- watercolour pieces layered over the paper */
import type { ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitRoot, Paragraphs, Pic, Sec } from "../pieces";
import { WisteriaOpening, WisteriaReady } from "./opening";
import { ReplyEnvelope } from "./reply";
import s from "./wisteria.module.css";

/**
 * Wisteria Lake — a lakeside terrace under a wisteria pergola, painted in soft
 * watercolour. It opens on a film of a blush envelope with a pressed-flower wax
 * seal lying on that terrace: the flap lifts by itself and a cream card rises
 * with the couple's names. The first screen is the same painting with the
 * names in the sky. Below, cream cotton paper with hanging wisteria: the story
 * in a deckled paper frame, a countdown over the lake, ceremony and party on
 * one card framed in wisteria, the day on a deep rose band with small cream
 * line drawings, and the reply under the wax seal. The paintings and pieces
 * were made for Vellum (public/templates/wisteria-lake).
 *
 * Colours: bg = cream paper, surface = the card, fg = warm brown ink, muted =
 * soft brown, accent = deep rose (titles, buttons), accent-fg = cream, border =
 * hairlines. The blush and lilac belong to the paintings.
 */

const ART = "/templates/wisteria-lake";
const ICONS = ["rings", "glass", "plate", "dance"] as const;

const T = {
  en: { together: "Together with their families", invite: "invite you to celebrate their wedding", story: "Our story", count: "Until we say I do", day: "The day", moments: "Moments", qa: "Questions", love: "With love,", map: "Finding your way", seal: "Tap the seal to open", open: "Open the reply envelope" },
  ar: { together: "بمباركة عائلتيهما", invite: "يدعوانكم لمشاركتهما فرحة زفافهما", story: "حكايتنا", count: "حتى نقول نعم", day: "برنامج اليوم", moments: "لحظات", qa: "أسئلة", love: "مع حبنا،", map: "الطريق إلينا", seal: "اضغطوا على الختم للفتح", open: "افتحوا ظرف الرد" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

function Divider() {
  return <img src={`${ART}/divider.webp`} alt="" className={s.divider} width={1165} height={200} loading="lazy" aria-hidden="true" />;
}

/** One section on the paper: optional wisteria hanging from a top corner, the content, then a sprig. */
function Part({ id, className, side, children, last }: { id: string; className?: string; side?: "start" | "end"; children: ReactNode; last?: boolean }) {
  return (
    <Sec id={id} className={`${s.sec} ${className ?? ""}`}>
      {side ? <img src={`${ART}/corner.webp`} alt="" className={`${s.corner} ${side === "end" ? s.cornerEnd : ""}`} width={728} height={900} loading="lazy" aria-hidden="true" /> : null}
      <div className={s.inner} {...fx("rise")}>{children}</div>
      {last ? null : <Divider />}
    </Sec>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className={s.h2}>{children}</h2>;
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = tr(model);
  const first = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.heroPic} role="img" aria-label="A watercolour terrace by a lake under a wisteria pergola" />
      <img src={`${ART}/corner.webp`} alt="" className={s.heroWisteria} width={728} height={900} aria-hidden="true" />
      <div className={s.heroText}>
        <p className={`${s.caps} ${s.w}`} style={{ "--i": 0 } as React.CSSProperties}>{content.eyebrow || t.together}</p>
        <h1 className={s.names}>
          <span className={s.w} style={{ "--i": 1 } as React.CSSProperties}>{wedding.partnerOne}</span>
          <span className={`${s.amp} ${s.w}`} style={{ "--i": 2 } as React.CSSProperties}>{model.locale === "ar" ? "و" : "&"}</span>
          <span className={s.w} style={{ "--i": 3 } as React.CSSProperties}>{wedding.partnerTwo}</span>
        </h1>
        <p className={`${s.invite} ${s.w}`} style={{ "--i": 4 } as React.CSSProperties}>{content.tagline || t.invite}</p>
        {wedding.date ? <p className={`${s.caps} ${s.heroDate} ${s.w}`} style={{ "--i": 5 } as React.CSSProperties}>{wedding.date.long}</p> : null}
        {first?.venueName ? <p className={`${s.small} ${s.w}`} style={{ "--i": 6 } as React.CSSProperties}>{first.venueName}</p> : null}
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
      <p className={s.caps}>{d.long}</p>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
    </Part>
  );
}

/** The countdown over a pale band of the lake painting. */
function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.countdown}>
      <div className={s.lakeBand} aria-hidden="true" />
      <div className={s.countText} {...fx("fade")}>
        <p className={s.caps}>{content.heading || tr(model).count}</p>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const p = heroPhoto(model);
  return (
    <Part id="story" side="end">
      <Title>{content.heading || tr(model).story}</Title>
      {p ? (
        <figure className={s.framed}>
          <Pic asset={p} sizes="(min-width: 600px) 300px, 70vw" className={s.framedPic} />
          <img src={`${ART}/photo-frame.webp`} alt="" className={s.frameArt} width={860} height={1120} loading="lazy" aria-hidden="true" />
        </figure>
      ) : null}
      {content.body ? <div className={s.body}><Paragraphs text={content.body} /></div> : null}
      {content.quote ? (
        <p className={s.quote}>
          {content.quote}
          {content.quoteSource ? <span className={s.small}> — {content.quoteSource}</span> : null}
        </p>
      ) : null}
    </Part>
  );
}

const has = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);
const headingOf = (m: InvitationModel, type: "ceremony" | "reception") => {
  const sec = m.sections.find((x) => x.type === type);
  return sec ? (sec.content as { heading?: string }).heading ?? "" : "";
};

function EventBlock({ model, e, label }: { model: InvitationModel; e: EventModel; label: string }) {
  return (
    <div className={s.event}>
      <h3 className={s.h3}>{label}</h3>
      {e.timeLabel ? <p className={s.caps}>{e.timeLabel}</p> : null}
      <p className={s.small}>{eventDate(model, e)}</p>
      {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
      {e.address ? <p className={s.small}>{e.address}</p> : null}
      <Directions model={model} event={e} className={s.link} />
    </div>
  );
}

/** Ceremony and party share one card framed in wisteria when both are shown. */
function Events({ model, id, note }: { model: InvitationModel; id: "ceremony" | "reception"; note: string }) {
  const t = kitCopy(model);
  if (id === "reception" && has(model, "ceremony")) return null;
  const ids: ("ceremony" | "reception")[] = id === "ceremony" && has(model, "reception") ? ["ceremony", "reception"] : [id];
  const shown = ids
    .map((k) => [model.events[k], headingOf(model, k) || (k === "ceremony" ? t.ceremony : t.reception)] as const)
    .filter((x): x is readonly [EventModel, string] => Boolean(x[0]));
  if (!shown.length) return null;
  return (
    <Part id={id}>
      <div className={s.eventCard}>
        <img src={`${ART}/frame.webp`} alt="" className={s.eventFrame} width={1079} height={1340} loading="lazy" aria-hidden="true" />
        {shown.map(([e, label], i) => (
          <div key={e.id} className={s.eventWrap}>
            {i > 0 ? <span className={s.rule} aria-hidden="true" /> : null}
            <EventBlock model={model} e={e} label={label} />
          </div>
        ))}
      </div>
      {note ? <p className={s.body}>{note}</p> : null}
    </Part>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Part id="venue" side="start">
      <Title>{content.heading || tr(model).map}</Title>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
      <ul className={s.places}>
        {mapped.map((e) => (
          <li key={e.id}>
            <span className={s.venue}>{e.venueName ?? e.title}</span>
            {e.address ? <span className={s.small}>{e.address}</span> : null}
            <Directions model={model} event={e} className={s.link} />
          </li>
        ))}
      </ul>
    </Part>
  );
}

/** The day on a deep rose band, each moment with a small cream drawing. */
function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.band}>
      <div className={s.bandInner} {...fx("rise")}>
        <h2 className={`${s.h2} ${s.onBand}`}>{content.heading || tr(model).day}</h2>
        <ol className={s.timeline}>
          {items.map((it, i) => (
            <li key={i}>
              <img src={`${ART}/icon-${ICONS[i % ICONS.length]}.webp`} alt="" className={s.icon} width={120} height={120} loading="lazy" aria-hidden="true" />
              <span className={s.time}>{it.time}</span>
              <span className={s.what}>{it.title}</span>
              {it.note ? <span className={s.note}>{it.note}</span> : null}
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
    <Part id="gallery">
      <Title>{content.heading || tr(model).moments}</Title>
      {content.caption ? <p className={s.small}>{content.caption}</p> : null}
      <div className={s.grid}>
        {list.map((p) => (
          <Pic key={p.id} asset={p} sizes="(min-width: 600px) 240px, 44vw" className={s.print} />
        ))}
      </div>
    </Part>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Part id="faq" side="end">
      <Title>{content.heading || tr(model).qa}</Title>
      <div className={s.faq}>
        {items.map((it, i) => (
          <details key={i}>
            <summary>{it.question}</summary>
            <p>{it.answer}</p>
          </details>
        ))}
      </div>
    </Part>
  );
}

/** The reply: the blush envelope; its wax seal opens it and the reply card rises out. */
function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const t = tr(model);
  const copy = kitCopy(model);
  return (
    <Sec id="rsvp" className={s.reply}>
      <div className={s.replyInner} {...fx("rise")}>
        <Title>{content.heading || copy.rsvp}</Title>
        <ReplyEnvelope
          message={content.message}
          deadline={content.deadline}
          linkUrl={content.linkUrl}
          linkLabel={content.linkLabel || content.heading || copy.rsvp}
          openLabel={t.open}
          hint={t.seal}
          locale={model.locale}
          demo={model.mode !== "live"}
          heading={content.heading || copy.rsvp}
        />
      </div>
    </Sec>
  );
}

/** The lake again at the end, with the last words in the sky. */
function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.closePic} aria-hidden="true" />
      <div className={s.closeText} {...fx("fade")}>
        <p className={s.caps}>{content.heading || tr(model).love}</p>
        <p className={s.sign}>{content.signature || model.wedding.coupleName}</p>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
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

export default function WisteriaRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="wisteria" className={s.root} after={model.mode === "export" ? null : <WisteriaOpening model={model} />}>
      <WisteriaReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

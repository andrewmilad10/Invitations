/* eslint-disable @next/next/no-img-element -- photographs and line drawings layered over the paper */
import type { ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitRoot, Paragraphs, Pic, Sec } from "../pieces";
import { LaceOpening, LaceReady } from "./opening";
import { ReplyForm } from "./reply";
import s from "./lace.module.css";

/**
 * Blush Lace — soft, natural and photographic. It opens on a cream page with
 * the couple's names above a blush lace envelope; a tap dissolves the page into
 * a full-screen photograph of blush flowers with the names in white script.
 * Below, cream paper and one quiet column: a welcome with the couple's words, a
 * photo with a round second photo resting on it, the countdown on a blush band,
 * the wedding week as a small calendar with the day ringed, the love story
 * beside two overlapping photos, the day's moments with small rose-brown line
 * drawings over a sky of pink clouds, the place over a band of flowers, the
 * reply written on a cream card, and a last word.
 * The photographs and drawings were made for Vellum (public/templates/blush-lace).
 *
 * Colours: bg = cream paper, surface = the cards, fg = warm brown ink, muted =
 * soft brown, accent = dusty rose (titles, buttons), accent-fg = cream, border
 * = hairlines. The blush of the band and the envelope belong to the pictures.
 */

const ART = "/templates/blush-lace";
const ICONS = ["bouquet", "toast", "cake", "car"] as const;

const T = {
  en: { welcome: "Welcome to", our: "our wedding", story: "Our story", count: "Until we say I do", day: "The day", place: "The place", moments: "Moments", qa: "Questions", love: "With love,", until: "See you soon" },
  ar: { welcome: "أهلًا بكم في", our: "حفل زفافنا", story: "حكايتنا", count: "حتى نقول نعم", day: "برنامج اليوم", place: "المكان", moments: "لحظات", qa: "أسئلة", love: "مع حبنا،", until: "نراكم قريبًا" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const first = (name: string) => Array.from(name.trim())[0] ?? "";

function Script({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={`${s.script} ${className ?? ""}`}>{children}</h2>;
}

/** First screen: the flower photograph, a thin ring with the initials, the names in white script and the date. */
function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const amp = model.locale === "ar" ? "و" : "&";
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.heroPic} role="img" aria-label="Blush flowers in soft evening light" />
      <div className={s.heroShade} aria-hidden="true" />
      <div className={s.heroText}>
        <span className={`${s.mono} ${s.w}`} style={{ "--i": 0 } as React.CSSProperties} aria-hidden="true">
          {first(wedding.partnerOne)}
          <i>{amp}</i>
          {first(wedding.partnerTwo)}
        </span>
        {content.eyebrow ? <p className={`${s.caps} ${s.w}`} style={{ "--i": 1 } as React.CSSProperties}>{content.eyebrow}</p> : null}
        <h1 className={s.names}>
          <span className={s.w} style={{ "--i": 1 } as React.CSSProperties}>{wedding.partnerOne}</span>
          <span className={`${s.amp} ${s.w}`} style={{ "--i": 2 } as React.CSSProperties}>{amp}</span>
          <span className={s.w} style={{ "--i": 3 } as React.CSSProperties}>{wedding.partnerTwo}</span>
        </h1>
        {wedding.date ? <p className={`${s.caps} ${s.heroDate} ${s.w}`} style={{ "--i": 4 } as React.CSSProperties}>{wedding.date.short}</p> : null}
        {content.tagline ? <p className={`${s.heroTag} ${s.w}`} style={{ "--i": 5 } as React.CSSProperties}>{content.tagline}</p> : null}
      </div>
    </header>
  );
}

/** The welcome: small capitals, a script line, the couple's words and their names signed below. */
function Couple({ model, content }: SectionProps<"couple">) {
  const t = tr(model);
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <p className={s.caps}>{content.eyebrow || t.welcome}</p>
        <Script>{content.heading || t.our}</Script>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <p className={s.signed}>{model.wedding.coupleName}</p>
      </div>
      <PhotoPair model={model} />
    </Sec>
  );
}

/** A photo with a round second photo resting on its corner. */
function PhotoPair({ model }: { model: InvitationModel }) {
  const list = photos(model, 3);
  const main = heroPhoto(model);
  const round = list.find((p) => p.id !== main?.id) ?? null;
  if (!main) return null;
  return (
    <div className={s.pair} {...fx("rise", 120)}>
      <Pic asset={main} sizes="(min-width: 600px) 300px, 62vw" className={s.pairMain} />
      {round ? <Pic asset={round} sizes="(min-width: 600px) 160px, 34vw" className={s.pairRound} /> : null}
    </div>
  );
}

function DateBlock() {
  return null;
}

/** The countdown on a blush band, numbers set apart by colons. */
function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.band}>
      <div className={s.bandInner} {...fx("fade")}>
        <p className={s.caps}>{content.heading || tr(model).count}</p>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

/** The wedding week as a small calendar with the day ringed, then the date, time and place. */
function Calendar({ model }: { model: InvitationModel }) {
  const iso = model.wedding.weddingDate;
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d));
  const start = new Date(day);
  start.setUTCDate(d - day.getUTCDay());
  const tag = model.locale === "ar" ? "ar-EG" : "en-GB";
  const week = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setUTCDate(start.getUTCDate() + i);
    return x;
  });
  const wk = (x: Date) => new Intl.DateTimeFormat(tag, { weekday: "short", timeZone: "UTC" }).format(x);
  const num = (x: Date) => new Intl.DateTimeFormat(tag, { day: "numeric", timeZone: "UTC" }).format(x);
  const month = new Intl.DateTimeFormat(tag, { month: "long", timeZone: "UTC" }).format(day);
  return (
    <div className={s.cal} aria-hidden="true">
      <p className={s.calMonth}>{month}</p>
      <div className={s.calGrid}>
        {week.map((x) => (
          <span key={x.toISOString()} className={s.calHead}>{wk(x)}</span>
        ))}
        {week.map((x) => (
          <span key={`d${x.toISOString()}`} className={s.calDay} data-on={x.getUTCDate() === d || undefined}>
            {num(x)}
          </span>
        ))}
      </div>
    </div>
  );
}

const has = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);
const headingOf = (m: InvitationModel, type: "ceremony" | "reception") => {
  const sec = m.sections.find((x) => x.type === type);
  return sec ? (sec.content as { heading?: string }).heading ?? "" : "";
};

/** Calendar, then the ceremony and party underneath it, one after the other. */
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
        <Calendar model={model} />
        <span className={s.stem} aria-hidden="true" />
        {shown.map(([e, label]) => (
          <div key={e.id} className={s.event}>
            <p className={s.caps}>{label}</p>
            <p className={s.eventWhen}>
              {eventDate(model, e)}
              {e.timeLabel ? <> · {e.timeLabel}</> : null}
            </p>
            {e.venueName ? (
              e.mapUrl ? (
                <a className={s.venueLink} href={e.mapUrl} target="_blank" rel="noopener noreferrer">{e.venueName}</a>
              ) : (
                <p className={s.venue}>{e.venueName}</p>
              )
            ) : null}
            {e.address ? <p className={s.small}>{e.address}</p> : null}
            <Directions model={model} event={e} className={s.link} />
          </div>
        ))}
        {note ? <p className={s.body}>{note}</p> : null}
      </div>
    </Sec>
  );
}

/** The love story: words on one side, two overlapping photographs on the other. */
function Story({ model, content }: SectionProps<"story">) {
  const list = photos(model, 5).filter((p) => p.id !== heroPhoto(model)?.id);
  const [a, b] = [list[1] ?? list[0], list[2]];
  return (
    <Sec id="story" className={s.sec}>
      <div className={s.story}>
        <div className={s.storyText} {...fx("rise")}>
          <Script>{content.heading || tr(model).story}</Script>
          {content.body ? <div className={s.body}><Paragraphs text={content.body} /></div> : null}
          {content.quote ? (
            <p className={s.quote}>
              {content.quote}
              {content.quoteSource ? <span className={s.small}> — {content.quoteSource}</span> : null}
            </p>
          ) : null}
        </div>
        {a ? (
          <div className={s.overlap} {...fx("rise", 140)}>
            <Pic asset={a} sizes="(min-width: 700px) 220px, 46vw" className={s.ovBack} />
            {b ? <Pic asset={b} sizes="(min-width: 700px) 220px, 46vw" className={s.ovFront} /> : null}
          </div>
        ) : null}
      </div>
    </Sec>
  );
}

/** The day's moments over a sky of pink clouds, each with a small line drawing. */
function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.sky}>
      <div className={s.skyPic} aria-hidden="true" />
      <div className={s.skyCard} {...fx("rise")}>
        <Script>{content.heading || tr(model).day}</Script>
        <ol className={s.timeline}>
          {items.map((it, i) => (
            <li key={i}>
              <img src={`${ART}/icon-${ICONS[i % ICONS.length]}.webp`} alt="" className={s.icon} width={120} height={120} loading="lazy" aria-hidden="true" />
              <span className={s.time}>{it.time}</span>
              <span className={s.caps}>{it.title}</span>
              {it.note ? <span className={s.small}>{it.note}</span> : null}
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  );
}

/** The places over a band of flowers, in white, each with its own pill to find the way. */
function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  const places = (mapped.length ? mapped : model.events.all.filter((e) => e.venueName || e.address)).slice(0, 3);
  return (
    <Sec id="venue" className={s.flowers}>
      <div className={s.flowersPic} aria-hidden="true" />
      {places.length ? (
        <div className={s.flowersText} {...fx("fade")}>
          <p className={s.caps}>{content.heading || tr(model).place}</p>
          {content.note ? <p className={s.flowersNote}>{content.note}</p> : null}
          {places.map((e) => (
            <div key={e.id} className={s.place}>
              {places.length > 1 ? <p className={s.placeWhat}>{e.title}</p> : null}
              {e.venueName ? <p className={s.flowersVenue}>{e.venueName}</p> : null}
              {e.address ? <p className={s.flowersNote}>{e.address}</p> : null}
              <Directions model={model} event={e} className={s.pillLink} />
            </div>
          ))}
        </div>
      ) : null}
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

/** The reply, written on a cream card. */
function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const copy = kitCopy(model);
  return (
    <Sec id="rsvp" className={s.reply}>
      <div className={s.replyStack} {...fx("rise")}>
        <div className={s.replyCard}>
          <Script className={s.replyTitle}>{content.heading || copy.rsvp}</Script>
          {content.deadline ? <p className={s.caps}>{content.deadline}</p> : null}
          {content.message ? <p className={s.body}>{content.message}</p> : null}
          <ReplyForm locale={model.locale} linkUrl={content.linkUrl} linkLabel={content.linkLabel || content.heading || copy.rsvp} demo={model.mode !== "live"} />
        </div>
      </div>
    </Sec>
  );
}

/** The last word, signed, under a small bouquet. */
function Closing({ model, content }: SectionProps<"closing">) {
  const t = tr(model);
  return (
    <Sec id="closing" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || t.until}</Script>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <p className={s.caps}>{t.love}</p>
        <p className={s.signed}>{content.signature || model.wedding.coupleName}</p>
        <img src={`${ART}/icon-bouquet.webp`} alt="" className={s.closeIcon} width={459} height={520} loading="lazy" aria-hidden="true" />
      </div>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <div className={s.footPic} aria-hidden="true" />
      <div className={s.footText}>
        <span>{model.wedding.coupleName}</span>
        {content.note ? <span>{content.note}</span> : null}
      </div>
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

export default function LaceRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="lace" className={s.root} after={model.mode === "export" ? null : <LaceOpening model={model} />}>
      <LaceReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

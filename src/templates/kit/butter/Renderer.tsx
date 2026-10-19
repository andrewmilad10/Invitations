/* eslint-disable @next/next/no-img-element -- paper pieces layered over the page */
import type { CSSProperties, ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitRoot, Paragraphs, Pic, Sec } from "../pieces";
import { Depth } from "./depth";
import { ButterOpening, ButterReady } from "./opening";
import { ReplyForm } from "./reply";
import s from "./butter.module.css";

/**
 * Butter Letter — a love letter made of layered paper. It opens on a
 * butter-yellow envelope with a lace-trimmed flap and a jasmine wax seal,
 * turning gently in 3D; a tap tips it away. The first screen is a paper
 * collage that builds itself: the open envelope, the couple's photo in a cream
 * oval mat rising out of the pocket, a terracotta lace doily carrying the
 * date, the wax seal, and a cascade of jasmine falling down the side — every
 * piece at its own depth, drifting with the pointer, the phone's tilt and
 * scrolling. No backgrounds below: plain cream space, small capitals with
 * script, a slim countdown, olive pill buttons, and a reply written in flat
 * butter-cream blocks. The pieces were made for Vellum (public/templates/butter-letter).
 *
 * Colours: bg = cream page, surface = butter cream (fields, cards), fg = warm
 * ink, muted = soft brown, accent = olive (buttons), accent-fg = cream, border
 * = hairlines. Butter yellow and terracotta belong to the paper pieces.
 */

const ART = "/templates/butter-letter";
const d = (depth: number, i = 0) => ({ "--d": depth, "--i": i }) as CSSProperties;

const T = {
  en: { save: "Save the date", meet: "Meet us in", attend: "Kindly share your attendance", story: "Our story", day: "The day", moments: "Moments", qa: "Questions", love: "With love,", see: "We look forward to celebrating together" },
  ar: { save: "احفظوا التاريخ", meet: "نلقاكم في", attend: "نرجو تأكيد الحضور", story: "حكايتنا", day: "برنامج اليوم", moments: "لحظات", qa: "أسئلة", love: "مع حبنا،", see: "نتطلع للاحتفال معكم" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);
const has = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);

function Script({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={`${s.script} ${className ?? ""}`}>{children}</h2>;
}

/** The paper collage: the open envelope, the photo rising from it, the doily with the date, the seal and the jasmine. */
function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = tr(model);
  const amp = model.locale === "ar" ? "و" : "&";
  const photo = heroPhoto(model);
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <Depth className={s.collage}>
        <div className={s.heading} style={d(0.25)}>
          <p className={`${s.caps} ${s.in}`} style={d(0.25, 0)}>{content.eyebrow || t.save}</p>
          <h1 className={`${s.names} ${s.in}`} style={d(0.25, 1)}>
            <span>{wedding.partnerOne}</span>
            <span className={s.amp}>{amp}</span>
            <span>{wedding.partnerTwo}</span>
          </h1>
        </div>
        <div className={s.env} style={d(0.5)}>
          <img src={`${ART}/open.webp`} alt="" className={s.envBack} width={1185} height={1052} aria-hidden="true" />
          <div className={s.card} style={d(0.9)}>
            <div className={s.cardIn}>
              {photo ? <Pic asset={photo} priority sizes="(min-width: 700px) 260px, 46vw" className={s.cardPhoto} /> : <span className={s.cardBlank} />}
              <img src={`${ART}/oval.webp`} alt="" className={s.cardMat} width={893} height={1170} aria-hidden="true" />
            </div>
          </div>
          <img src={`${ART}/open.webp`} alt="" className={s.envFront} width={1185} height={1052} aria-hidden="true" />
          <div className={s.doily} style={d(1.3)}>
            <div className={s.doilyIn}>
              <img src={`${ART}/doily.webp`} alt="" width={1100} height={1065} aria-hidden="true" />
              {wedding.date ? <span className={s.doilyDate}>{wedding.date.short}</span> : null}
            </div>
          </div>
          <div className={s.seal} style={d(1.1)}>
            <img src={`${ART}/seal.webp`} alt="" className={s.sealIn} width={413} height={560} aria-hidden="true" />
          </div>
        </div>
        <div className={s.jasmine} style={d(1.6)}>
          <img src={`${ART}/jasmine.webp`} alt="" className={s.jasmineIn} width={522} height={1440} aria-hidden="true" />
        </div>
      </Depth>
      {content.tagline ? <p className={`${s.tagline} ${s.in}`} style={d(0, 6)}>{content.tagline}</p> : null}
    </header>
  );
}

/** "Meet us in" with the place in script, the date and time in small capitals, the countdown, and the reply button. */
function Couple({ model, content }: SectionProps<"couple">) {
  const t = tr(model);
  const first = model.events.ceremony ?? model.events.reception;
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <p className={s.caps}>{content.eyebrow || t.meet}</p>
        <Script>{first?.venueName || content.heading || model.wedding.coupleName}</Script>
        {model.wedding.date ? <p className={s.smallCaps}>{model.wedding.date.long}</p> : null}
        {first?.timeLabel ? <p className={s.smallCaps}>{first.timeLabel}</p> : null}
        {first?.venueName && content.heading ? <p className={s.quiet}>{content.heading}</p> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
        {has(model, "rsvp") ? <a className={s.cta} href="#rsvp">{t.attend}</a> : null}
        <p className={s.quiet}>{t.see}</p>
      </div>
    </Sec>
  );
}

function DateBlock() {
  return null;
}

/** The countdown lives with "Meet us in" above; on its own only when that part is turned off. */
function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (has(model, "couple") || !model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.sec}>
      <div className={s.col} {...fx("fade")}>
        {content.heading ? <p className={s.caps}>{content.heading}</p> : null}
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
    </Sec>
  );
}

/** The story beside the couple's photo in the cream oval mat. */
function Story({ model, content }: SectionProps<"story">) {
  const list = photos(model, 3);
  const p = list.find((x) => x.id !== heroPhoto(model)?.id) ?? heroPhoto(model);
  return (
    <Sec id="story" className={s.sec}>
      <div className={s.story}>
        {p ? (
          <div className={s.storyOval} {...fx("rise")}>
            <Pic asset={p} sizes="(min-width: 700px) 260px, 56vw" className={s.cardPhoto} />
            <img src={`${ART}/oval.webp`} alt="" className={s.cardMat} width={893} height={1170} loading="lazy" aria-hidden="true" />
          </div>
        ) : null}
        <div className={s.storyText} {...fx("rise", 120)}>
          <Script>{content.heading || tr(model).story}</Script>
          {content.body ? <div className={s.body}><Paragraphs text={content.body} /></div> : null}
          {content.quote ? (
            <p className={s.quote}>
              {content.quote}
              {content.quoteSource ? <span className={s.smallCaps}> — {content.quoteSource}</span> : null}
            </p>
          ) : null}
        </div>
      </div>
    </Sec>
  );
}

const headingOf = (m: InvitationModel, type: "ceremony" | "reception") => {
  const sec = m.sections.find((x) => x.type === type);
  return sec ? (sec.content as { heading?: string }).heading ?? "" : "";
};

/** Ceremony and celebration side by side (stacked on phones), each under a small seal. */
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
      <div className={s.events}>
        {shown.map(([e, label], i) => (
          <div key={e.id} className={s.event} {...fx("rise", i * 120)}>
            <img src={`${ART}/seal.webp`} alt="" className={s.eventSeal} width={413} height={560} loading="lazy" aria-hidden="true" />
            <p className={s.caps}>{label}</p>
            {e.venueName ? <p className={s.eventPlace}>{e.venueName}</p> : null}
            <p className={s.smallCaps}>{eventDate(model, e)}</p>
            {e.timeLabel ? <p className={s.smallCaps}>{e.timeLabel}</p> : null}
            {e.address ? <p className={s.small}>{e.address}</p> : null}
            {e.description ? <p className={s.body}>{e.description}</p> : null}
            <Directions model={model} event={e} className={s.pillLine} />
          </div>
        ))}
      </div>
      {note ? <p className={`${s.body} ${s.center}`}>{note}</p> : null}
    </Sec>
  );
}

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

/** The day as a slim list: the time in small capitals, the moment in script, joined by a fine rule. */
function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || tr(model).day}</Script>
        <ol className={s.timeline}>
          {items.map((it, i) => (
            <li key={i}>
              <span className={s.smallCaps}>{it.time}</span>
              <span className={s.rule} aria-hidden="true" />
              <span className={s.what}>
                {it.title}
                {it.note ? <span className={s.small}>{it.note}</span> : null}
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
  if (list.length < 2) return null;
  return (
    <Sec id="gallery" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || tr(model).moments}</Script>
        {content.caption ? <p className={s.small}>{content.caption}</p> : null}
        <div className={s.grid}>
          {list.map((p, i) => (
            <Pic key={p.id} asset={p} sizes="(min-width: 700px) 240px, 44vw" className={`${s.gridPic} ${i % 3 === 1 ? s.gridOval : ""}`} />
          ))}
        </div>
      </div>
    </Sec>
  );
}

/** The reply in flat butter-cream blocks, as on the paper. */
function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const copy = kitCopy(model);
  return (
    <Sec id="rsvp" className={s.sec}>
      <div className={s.col} {...fx("rise")}>
        <Script>{content.heading || copy.rsvp}</Script>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        {content.deadline ? <p className={s.smallCaps}>{content.deadline}</p> : null}
        <ReplyForm locale={model.locale} linkUrl={content.linkUrl} linkLabel={content.linkLabel || content.heading || copy.rsvp} demo={model.mode !== "live"} />
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

/** The last word under the jasmine seal, with the couple's initials. */
function Closing({ model, content }: SectionProps<"closing">) {
  const t = tr(model);
  const first = (n: string) => Array.from(n.trim())[0] ?? "";
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.col} {...fx("rise")}>
        <div className={s.closeSeal} aria-hidden="true">
          <img src={`${ART}/seal.webp`} alt="" width={413} height={560} loading="lazy" />
        </div>
        <p className={s.mono} aria-hidden="true">
          {first(model.wedding.partnerOne)} <span>{model.locale === "ar" ? "و" : "&"}</span> {first(model.wedding.partnerTwo)}
        </p>
        {content.heading ? <Script>{content.heading}</Script> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
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

export default function ButterRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="butter" className={s.root} after={model.mode === "export" ? null : <ButterOpening model={model} />}>
      <ButterReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

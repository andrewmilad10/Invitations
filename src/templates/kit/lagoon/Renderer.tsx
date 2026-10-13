/* eslint-disable @next/next/no-img-element -- watercolour paintings layered over the paper */
import type { ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./lagoon.module.css";

/**
 * Gouna Lagoon — a Red Sea lagoon wedding painted in soft watercolour. The
 * first screen is a painting of turquoise water, sand-coloured domed houses,
 * palms and a little boat at sunset, with the names written in the quiet sky.
 * Below, warm cotton paper with pale sand washes; every section ends on a hand
 * painted double wave with two shells, and palm leaves lean in from alternate
 * sides. Photos sit in pointed arches. The ceremony has a small domed chapel,
 * the party two glowing lanterns, the venue a painted lagoon map, the evening
 * runs from a painted sun to a moon, and the page ends at night on the water
 * among floating lanterns. The paintings were made for Vellum
 * (public/templates/gouna-lagoon).
 *
 * Colours: bg = cotton paper, surface = the white reply card, fg = warm brown
 * ink, muted = soft brown, accent = coral (buttons), accent-fg = paper,
 * border = hairlines. The turquoise and night blue belong to the paintings.
 */

const ART = "/templates/gouna-lagoon";

const T = {
  en: { together: "Together with their families", story: "Our story", schedule: "Schedule", afternoon: "Afternoon", night: "Night", moments: "Gallery", qa: "Questions", love: "With love,", map: "Finding your way" },
  ar: { together: "بمباركة عائلتيهما", story: "حكايتنا", schedule: "برنامج اليوم", afternoon: "العصر", night: "الليل", moments: "لحظات", qa: "أسئلة", love: "مع حبنا،", map: "الطريق إلينا" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

/** Two painted waves with two shells resting at one end. */
function Wave({ flip }: { flip?: boolean }) {
  return (
    <div className={`${s.wave} ${flip ? s.flip : ""}`} aria-hidden="true">
      <img src={`${ART}/shells.webp`} alt="" className={s.shells} width={200} height={132} loading="lazy" />
    </div>
  );
}

function Palm({ side }: { side: "start" | "end" }) {
  return <img src={`${ART}/palm.webp`} alt="" className={`${s.palm} ${side === "start" ? s.palmStart : s.palmEnd}`} width={300} height={353} loading="lazy" />;
}

function Wash({ n, side }: { n: 1 | 2 | 3; side: "start" | "end" }) {
  return <img src={`${ART}/wash${n}.webp`} alt="" className={`${s.wash} ${side === "start" ? s.washStart : s.washEnd}`} width={320} height={290} loading="lazy" />;
}

/** One section: soft sand wash behind, optional palm, the content, then the waves. */
function Part({ id, className, i, children }: { id: string; className?: string; i: number; children: ReactNode }) {
  const side = i % 2 ? "end" : "start";
  return (
    <Sec id={id} className={`${s.sec} ${className ?? ""}`}>
      <Wash n={((i % 3) + 1) as 1 | 2 | 3} side={side === "start" ? "end" : "start"} />
      {i % 2 === 0 ? <Palm side={side} /> : null}
      <div className={s.inner} {...fx("rise")}>{children}</div>
      <Wave flip={i % 2 === 1} />
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
      <div className={s.scene}>
        <img src={`${ART}/hero.webp`} alt="" className={s.heroArt} width={768} height={1376} fetchPriority="high" />
        <div className={s.heroText} {...fx("fade")}>
          <p className={s.eyebrow}>{content.eyebrow || t.together}</p>
          <h1 className={s.names}>
            <span>{wedding.partnerOne}</span>
            <span>
              <span className={s.amp}>{model.locale === "ar" ? "و" : "&"}</span> {wedding.partnerTwo}
            </span>
          </h1>
          {wedding.date ? <p className={s.date}>{wedding.date.long}</p> : null}
          {first?.venueName ? <p className={s.small}>{first.venueName}</p> : null}
        </div>
      </div>
      <div className={s.heroFoot}>
        {content.tagline ? <p className={s.tagline}>{content.tagline}</p> : null}
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
      </div>
      <Wave />
    </header>
  );
}

function Couple({ content }: SectionProps<"couple">) {
  if (!content.message && !content.heading) return null;
  return (
    <Part id="couple" i={1}>
      {content.heading ? <Title>{content.heading}</Title> : null}
      {content.message ? <p className={s.body}>{content.message}</p> : null}
    </Part>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Part id="date" i={1}>
      <Title>{content.heading || kitCopy(model).date}</Title>
      <p className={s.date}>{d.long}</p>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
    </Part>
  );
}

/** The countdown sits under the painting on the first screen. */
function CountdownBlock() {
  return null;
}

function Story({ model, content }: SectionProps<"story">) {
  const p = heroPhoto(model);
  return (
    <Part id="story" i={2}>
      <Title>{content.heading || tr(model).story}</Title>
      {p ? <Pic asset={p} sizes="(min-width: 600px) 260px, 62vw" className={`${s.arch} ${s.storyArch}`} /> : null}
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

function EventRow({ model, e, label, kind }: { model: InvitationModel; e: EventModel; label: string; kind: "ceremony" | "reception" }) {
  return (
    <div className={`${s.event} ${kind === "reception" ? s.eventFlip : ""}`}>
      <img src={`${ART}/${kind === "ceremony" ? "chapel" : "lanterns"}.webp`} alt="" className={s.eventArt} width={280} height={kind === "ceremony" ? 291 : 324} loading="lazy" />
      <div className={s.eventText}>
        <h3 className={s.h3}>{label}</h3>
        {e.timeLabel ? <p className={s.time}>{e.timeLabel}</p> : null}
        <p className={s.small}>{eventDate(model, e)}</p>
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.small}>{e.address}</p> : null}
        <Directions model={model} event={e} className={s.link} />
      </div>
    </div>
  );
}

/** Ceremony and party share one part when both are shown. */
function Events({ model, id, note }: { model: InvitationModel; id: "ceremony" | "reception"; note: string }) {
  const t = kitCopy(model);
  if (id === "reception" && has(model, "ceremony")) return null;
  const ids: ("ceremony" | "reception")[] = id === "ceremony" && has(model, "reception") ? ["ceremony", "reception"] : [id];
  const shown = ids
    .map((k) => [k, model.events[k], headingOf(model, k) || (k === "ceremony" ? t.ceremony : t.reception)] as const)
    .filter((x): x is readonly ["ceremony" | "reception", EventModel, string] => Boolean(x[1]));
  if (!shown.length) return null;
  return (
    <Part id={id} i={3}>
      {shown.map(([k, e, label]) => <EventRow key={e.id} model={model} e={e} label={label} kind={k} />)}
      {note ? <p className={s.body}>{note}</p> : null}
    </Part>
  );
}

/** The painted lagoon map with a coral pin for each place, and directions below. */
function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Part id="venue" i={4}>
      <Title>{content.heading || tr(model).map}</Title>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
      <figure className={s.mapFig}>
        <img src={`${ART}/map.webp`} alt="" className={s.mapArt} width={720} height={560} loading="lazy" />
        {mapped.slice(0, 3).map((e, i) => (
          <span key={e.id} className={`${s.pin} ${s[`pin${i + 1}`]}`} aria-hidden="true" />
        ))}
      </figure>
      <ul className={s.places}>
        {mapped.map((e) => (
          <li key={e.id}>
            <span className={s.pinDot} aria-hidden="true" />
            <span className={s.venue}>{e.venueName ?? e.title}</span>
            {e.address ? <span className={s.small}>{e.address}</span> : null}
            <Directions model={model} event={e} className={s.link} />
          </li>
        ))}
      </ul>
    </Part>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  const t = tr(model);
  return (
    <Part id="schedule" i={5}>
      <Title>{content.heading || t.schedule}</Title>
      <div className={s.sky} aria-hidden="true">
        <span className={s.skyEnd}>
          <img src={`${ART}/sun.webp`} alt="" width={160} height={157} loading="lazy" />
          <span>{t.afternoon}</span>
        </span>
        <svg className={s.arc} viewBox="0 0 200 60" preserveAspectRatio="none">
          <path d="M6 56 C 50 4, 150 4, 190 50" />
          <path d="M183 41 L 191 51 L 179 52" className={s.arrow} />
        </svg>
        <span className={s.skyEnd}>
          <img src={`${ART}/moon.webp`} alt="" width={160} height={162} loading="lazy" />
          <span>{t.night}</span>
        </span>
      </div>
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
    <Part id="gallery" i={6}>
      <Title>{content.heading || tr(model).moments}</Title>
      {content.caption ? <p className={s.small}>{content.caption}</p> : null}
      <div className={s.grid}>
        {list.map((p) => (
          <Pic key={p.id} asset={p} sizes="(min-width: 600px) 240px, 44vw" className={s.arch} />
        ))}
      </div>
    </Part>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Part id="faq" i={7}>
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

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Part id="rsvp" i={8}>
      <div className={s.card}>
        <Title>{content.heading || kitCopy(model).rsvp}</Title>
        {content.deadline ? <p className={s.small}>{content.deadline}</p> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.button} />
      </div>
    </Part>
  );
}

/** Night on the lagoon: floating lanterns, and the last words written in the dark sky. */
function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <img src={`${ART}/night.webp`} alt="" className={s.nightArt} width={769} height={1071} loading="lazy" />
      <div className={s.nightText} {...fx("fade")}>
        <p className={s.love}>{content.heading || tr(model).love}</p>
        <p className={s.sign}>{content.signature || model.wedding.coupleName}</p>
        {content.message ? <p className={s.nightNote}>{content.message}</p> : null}
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

export default function LagoonRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="lagoon" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

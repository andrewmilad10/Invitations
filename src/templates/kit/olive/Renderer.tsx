/* eslint-disable @next/next/no-img-element -- transparent sketches and watercolours on paper */
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { DayNight, RisingGate, WindowShow } from "./live";
import { OliveOpening, OliveReady } from "./opening";
import { initials } from "./util";
import s from "./olive.module.css";

/**
 * Olive Courtyard — sage and cream, like a letter on handmade paper. Opens on
 * a close-up sage envelope with the couple's initials in gold foil; the flap
 * folds back slowly onto an olive liner and the screen eases into a
 * sketchbook courtyard under a vine pergola. A sun-and-moon switch turns the
 * courtyard and the whole page from day to night. A sage band holds the
 * countdown in olive wreaths, a deckled card the details, ink sketches mark
 * the day as a stone wall and gate rise beneath it, photos change in a
 * shuttered window and the page ends on olive hills. Art in
 * public/templates/olive-courtyard.
 *
 * Colours: bg = cream paper, surface = pale card, fg = dark olive ink,
 * muted = grey olive, accent = olive (script titles, buttons), accent-fg =
 * cream, border = paper rules. Night uses its own fixed navy and gold.
 */

const ART = "/templates/olive-courtyard";
const T = {
  en: { married: "We are getting married", countdown: "Countdown", special: "To the most special day of our lives", details: "The details", know: "Everything you need to know", location: "Location", day: "The day", planned: "What we have planned for you", gallery: "Moments", favourites: "A few of our favourites", photo: "Photo", faq: "Good to know", rsvp: "RSVP", send: "Reply here", dayLabel: "Day", nightLabel: "Night" },
  ar: { married: "سنتزوّج", countdown: "العد التنازلي", special: "حتى أجمل يوم في حياتنا", details: "التفاصيل", know: "كل ما تحتاجون معرفته", location: "المكان", day: "اليوم", planned: "ما حضّرناه لكم", gallery: "لحظات", favourites: "بعض لحظاتنا المفضّلة", photo: "صورة", faq: "معلومات تهمّكم", rsvp: "تأكيد الحضور", send: "ردّوا من هنا", dayLabel: "نهار", nightLabel: "ليل" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const SKETCHES = ["key", "tree", "chairs", "bike"];
const KEYWORDS: [RegExp, string][] = [
  [/arriv|welcome|guest|استقبال|وصول/i, "key"],
  [/ceremon|vow|ring|i do|عقد|زفاف|مراسم/i, "tree"],
  [/dinner|lunch|meal|cake|table|عشاء|غداء|كيك/i, "chairs"],
  [/danc|party|music|night|send.?off|رقص|حفل|سهرة|وداع/i, "bike"],
];
const sketchFor = (title: string, i: number) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? SKETCHES[i % SKETCHES.length];
const STARS = Array.from({ length: 26 }, (_, i) => ({ left: (i * 37) % 100, top: (i * 17) % 30, delay: -((i * 0.43) % 3.4) }));

function Head({ script, sub }: { script: string; sub?: string }) {
  return (
    <>
      <p className={s.script} {...fx("rise")}>{script}</p>
      {sub ? <h2 className={cn(s.caps, s.sub)} {...fx("rise", 120)}>{sub}</h2> : null}
    </>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = tr(model);
  const words: [string, string?][] = [[wedding.partnerOne], [model.locale === "ar" ? "و" : "&", s.amp], [wedding.partnerTwo]];
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.pic} role="img" aria-label="A sketchbook courtyard with a vine pergola and a long table, by day or by night">
        <span className={s.dayPic} />
        <span className={s.nightPic} />
        <span className={s.glow} aria-hidden />
        <span className={s.stars} aria-hidden>
          {STARS.map((x, i) => (
            <i key={i} style={{ left: `${x.left}%`, top: `${x.top}%`, animationDelay: `${x.delay}s` }} />
          ))}
        </span>
      </div>
      <div className={s.heroText}>
        <p className={cn(s.caps, s.w)} style={{ "--i": 0 } as React.CSSProperties}>{content.eyebrow || t.married}</p>
        <h1 className={s.heroH1}>
          {words.map(([w, c], i) => (
            <span key={i} className={cn(s.w, c)} style={{ "--i": i + 1 } as React.CSSProperties}>
              {w}
            </span>
          ))}
        </h1>
        {wedding.date?.short ? <p className={cn(s.heroDate, s.w)} style={{ "--i": 5 } as React.CSSProperties}>{wedding.date.short}</p> : null}
        {content.tagline ? <p className={cn(s.caps, s.w)} style={{ "--i": 6 } as React.CSSProperties}>{content.tagline}</p> : null}
      </div>
      <DayNight labels={[t.dayLabel, t.nightLabel]} />
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || kitCopy(model).together} sub={content.eyebrow} />
        {content.message ? <p className={s.lead} {...fx("rise", 240)}>{content.message}</p> : null}
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || d.long} sub={d.weekday} />
        {content.note ? <p className={s.lead}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.band}>
      <p className={s.bigMono} {...fx("rise")}>
        <span className={s.gold}>{initials(model)}</span>
      </p>
      <p className={s.script} {...fx("rise", 120)}>{content.heading || tr(model).countdown}</p>
      <p className={s.caps} {...fx("rise", 240)}>{tr(model).special}</p>
      <div {...fx("rise", 320)}>
        <Clock model={model} className={s.count} unit={s.unit} value={s.value} label={s.label} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  if (!content.body && !content.heading && !content.quote) return null;
  return (
    <Sec id="story" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || kitCopy(model).ourStory} />
        {content.body ? (
          <div className={s.lead} {...fx("rise", 200)}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? <p className={cn(s.lead, s.em)}>“{content.quote}”{content.quoteSource ? ` · ${content.quoteSource}` : ""}</p> : null}
      </div>
    </Sec>
  );
}

function Event({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = tr(model);
  const first = id === "ceremony" || !model.events.ceremony;
  return (
    <Sec id={id} className={cn(s.sec, !first && s.tight)}>
      <div className={s.in}>
        {first ? <Head script={t.details} sub={t.know} /> : null}
        <div className={s.card} {...fx("rise", 240)}>
          <p className={s.cardScript}>{id === "ceremony" ? kitCopy(model).ceremony : kitCopy(model).reception}</p>
          <p className={s.vName}>{content.heading || e.venueName || e.title}</p>
          {e.address ? <p className={s.addr}>{e.address}</p> : null}
          <p className={s.when}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
          {first ? <img className={s.villa} src={`${ART}/villa.webp`} alt="" loading="lazy" /> : null}
        </div>
        {content.note ? <p className={s.lead}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.btn} />
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={cn(s.sec, s.tight)}>
      <div className={s.in}>
        {content.heading ? <p className={cn(s.caps, s.sub)}>{content.heading}</p> : null}
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig} {...fx("rise")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption className={s.caps}>{e.venueName ?? e.title}</figcaption>
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
      <div className={s.in}>
        <Head script={content.heading || tr(model).day} sub={tr(model).planned} />
        <ol className={s.day}>
          {items.map((it, i) => (
            <li key={i} className={s.ev} {...fx("ev")}>
              <img src={`${ART}/sk-${sketchFor(it.title, i)}.webp`} alt="" loading="lazy" />
              <time>{it.time}</time>
              <b>{it.title}</b>
              {it.note ? <small>{it.note}</small> : null}
            </li>
          ))}
        </ol>
        <RisingGate src={`${ART}/gate.webp`} />
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 8);
  if (!list.length) return null;
  const t = tr(model);
  return (
    <Sec id="gallery" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || t.gallery} sub={content.caption || t.favourites} />
        <div {...fx("rise", 240)}>
          <WindowShow frame={`${ART}/window.webp`} label={t.photo}>
            {list.map((p) => (
              <Pic key={p.id} asset={p} sizes="(min-width: 640px) 160px, 34vw" className={s.slideImg} />
            ))}
          </WindowShow>
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
      <div className={s.in}>
        <Head script={content.heading || tr(model).faq} />
        <div className={s.faq} {...fx("rise", 200)}>
          {items.map((it, i) => (
            <details key={i} className={s.qa} open={i === 0}>
              <summary>{it.question}</summary>
              <p>{it.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || tr(model).rsvp} sub={content.deadline} />
        <img className={s.rings} src={`${ART}/rings.webp`} alt="" loading="lazy" {...fx("rings", 200)} />
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        {content.linkUrl ? (
          <ReplyLink content={content} className={s.btn}>
            {content.linkLabel || tr(model).send}
          </ReplyLink>
        ) : null}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.end}>
      <p className={s.names} {...fx("rise")}>{content.heading || model.wedding.coupleName}</p>
      {content.message ? <p className={s.lead}>{content.message}</p> : null}
      <p className={cn(s.caps, s.sub)} {...fx("rise", 120)}>{content.signature || model.wedding.date?.long}</p>
      <img className={s.hills} src={`${ART}/hills.webp`} alt="" loading="lazy" {...fx("rise", 240)} />
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      {[model.wedding.coupleName, model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}
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

export default function OliveRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="olive" className={s.root} after={model.mode === "export" ? null : <OliveOpening model={model} />}>
      <OliveReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

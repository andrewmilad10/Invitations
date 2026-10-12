/* eslint-disable @next/next/no-img-element -- watercolours on white, multiplied into the page paper */
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { SketchOpening, SketchReady } from "./opening";
import s from "./sketch.module.css";

/**
 * The Sketchbook — a wedding told in a real watercolour sketchbook. A green
 * linen book opens onto one long sheet of cold-press paper: paintings soak
 * into the paper (a chapel among olive trees, a bouquet, the outfits), small
 * torn pieces of paper with sketches lie on top for the day and the
 * countdown, photos are laid on the page tied with string, and little pencil
 * notes sit above each title. Paintings in public/templates/sketchbook.
 *
 * Colours: bg = warm paper, surface = lighter paper, fg = soft ink,
 * muted = warm grey, accent = terracotta (times, buttons), accent-fg = white,
 * border = paper seams.
 */

const ART = "/templates/sketchbook";
const T = {
  en: { yes: "where we'll say yes", counting: "counting the days", until: "Until we meet", started: "how it started", story: "Our story", plan: "the plan, roughly", day: "The day", find: "how to find us", place: "The place", wear: "what to wear", know: "Good to know", few: "a few we love", moments: "Moments", swipe: "swipe", reply: "kindly reply", come: "Will you come?", send: "Send our reply", love: "With love" },
  ar: { yes: "هنا سنقول نعم", counting: "نعدّ الأيام", until: "حتى نلتقي", started: "كيف بدأت", story: "حكايتنا", plan: "الخطة تقريباً", day: "اليوم", find: "كيف تصلون", place: "المكان", wear: "ماذا ترتدون", know: "معلومات تهمّكم", few: "بعض ما نحب", moments: "لحظات", swipe: "اسحبوا", reply: "نرجو الرد", come: "هل ستحضرون؟", send: "أرسلوا ردّكم", love: "مع الحب" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const SKETCHES = ["rings", "wine", "table", "cake", "band", "moon"];
const KEYWORDS: [RegExp, string][] = [
  [/ceremon|vow|i do|ring|عقد|زفاف|خاتم|مراسم/i, "rings"],
  [/cake|dessert|sweet|كيك|تورت|حلو/i, "cake"],
  [/dinner|lunch|meal|feast|table|عشاء|غداء/i, "table"],
  [/toast|champagne|drink|cocktail|welcome|glass|arriv|نخب|استقبال|مشروب/i, "wine"],
  [/danc|party|music|band|dj|رقص|حفل|موسيقى/i, "band"],
  [/goodnight|farewell|send.?off|night|moon|وداع|تصبحون|ختام/i, "moon"],
];
const sketchFor = (title: string, i: number) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? SKETCHES[i % SKETCHES.length];

function Head({ note, title }: { note?: string; title: string }) {
  return (
    <>
      {note ? <p className={s.note} {...fx("rise")}>{note}</p> : null}
      <h2 className={s.h} {...fx("rise", 120)}>{title}</h2>
    </>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const where = content.tagline || place?.venueName || "";
  const amp = model.locale === "ar" ? "و" : "&";
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      {content.eyebrow ? <p className={cn(s.note, s.heroIn)} style={{ "--i": 0 } as React.CSSProperties}>{content.eyebrow}</p> : null}
      <div className={s.pin}>
        <img className={cn(s.wash, s.heroPaint)} src={`${ART}/chapel.webp`} alt="A watercolour of a small whitewashed chapel among olive trees" />
        <p className={cn(s.note, s.pinNote)}>↑ {tr(model).yes}</p>
      </div>
      <h1 className={cn(s.names, s.heroIn)} style={{ "--i": 1 } as React.CSSProperties}>
        {wedding.partnerOne} <span>{amp}</span> {wedding.partnerTwo}
      </h1>
      {wedding.date?.long ? <p className={cn(s.date, s.heroIn)} style={{ "--i": 2 } as React.CSSProperties}>{wedding.date.long}</p> : null}
      {where ? <p className={cn(s.place, s.heroIn)} style={{ "--i": 3 } as React.CSSProperties}>{where}</p> : null}
      <img className={cn(s.wash, s.vine)} src={`${ART}/vine.webp`} alt="" {...fx("stroke", 300)} />
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <Head note={content.eyebrow} title={content.heading || kitCopy(model).with} />
      {content.message ? <p className={s.lead} {...fx("rise", 240)}>{content.message}</p> : null}
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <Head note={d.weekday} title={content.heading || d.long} />
      {content.note ? <p className={s.lead}>{content.note}</p> : null}
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  const t = tr(model);
  return (
    <Sec id="countdown" className={s.sec}>
      <Head note={t.counting} title={content.heading || t.until} />
      <div {...fx("rise", 240)}>
        <Clock model={model} className={s.count} unit={s.unit} value={s.value} label={s.label} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  if (!content.body && !content.heading && !content.quote) return null;
  const t = tr(model);
  return (
    <Sec id="story" className={s.sec}>
      <div className={s.story}>
        <img className={cn(s.wash, s.bouquet)} src={`${ART}/bouquet.webp`} alt="A watercolour bouquet of garden roses, herbs and olive sprigs" loading="lazy" {...fx("bleed")} />
        <div>
          <Head note={t.started} title={content.heading || t.story} />
          {content.body ? (
            <div className={s.lead} {...fx("rise", 240)}>
              <Paragraphs text={content.body} />
            </div>
          ) : null}
          {content.quote ? <p className={s.quote}>“{content.quote}”{content.quoteSource ? ` · ${content.quoteSource}` : ""}</p> : null}
        </div>
      </div>
    </Sec>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  const t = tr(model);
  return (
    <Sec id="schedule" className={s.sec}>
      <Head note={t.plan} title={content.heading || t.day} />
      <ol className={s.day}>
        {items.map((it, i) => (
          <li key={i} className={s.ev} {...fx("drop")}>
            <img src={`${ART}/s-${sketchFor(it.title, i)}.webp`} alt="" loading="lazy" />
            <span className={s.tx}>
              <time>{it.time}</time>
              <b>{it.title}</b>
              {it.note ? <span>{it.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </Sec>
  );
}

function Event({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const k = kitCopy(model);
  const first = id === "ceremony" || !model.events.ceremony;
  const t = tr(model);
  return (
    <Sec id={id} className={cn(s.sec, !first && s.secTight)}>
      {first ? <Head note={t.find} title={t.place} /> : null}
      <div className={s.card} {...fx("rise", 240)}>
        <p className={s.kind}>{id === "ceremony" ? k.ceremony : k.reception}</p>
        <p className={s.vName}>{content.heading || e.venueName || e.title}</p>
        {e.address ? <p className={s.addr}>{e.address}</p> : null}
        <p className={s.when}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
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
    <Sec id="venue" className={cn(s.sec, s.secTight)}>
      {content.heading ? <p className={s.note}>{content.heading}</p> : null}
      {mapped.map((e) => (
        <figure key={e.id} className={s.mapFig} {...fx("rise")}>
          <KitMap model={model} event={e} className={s.map} />
          <figcaption>{e.venueName ?? e.title}</figcaption>
        </figure>
      ))}
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 8);
  if (!list.length) return null;
  const t = tr(model);
  return (
    <Sec id="gallery" className={s.sec}>
      <Head note={t.few} title={content.heading || t.moments} />
      <div className={s.gal} {...fx("rise", 240)}>
        {list.map((p) => (
          <figure key={p.id} className={s.ph}>
            <img className={s.bow} src={`${ART}/bow.webp`} alt="" loading="lazy" />
            <Pic asset={p} sizes="(min-width: 640px) 300px, 66vw" className={s.phImg} />
          </figure>
        ))}
      </div>
      {content.caption ? <p className={s.note}>{content.caption}</p> : list.length > 1 ? <p className={s.note}>← {t.swipe} →</p> : null}
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  const t = tr(model);
  return (
    <Sec id="faq" className={s.sec}>
      <Head note={t.wear} title={content.heading || t.know} />
      <img className={cn(s.wash, s.outfits)} src={`${ART}/outfits.webp`} alt="" loading="lazy" {...fx("bleed")} />
      <div className={cn(s.card, s.faq)} {...fx("rise", 200)}>
        {items.map((it, i) => (
          <details key={i} className={s.qa} open={i === 0}>
            <summary>{it.question}</summary>
            <p>{it.answer}</p>
          </details>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const t = tr(model);
  return (
    <Sec id="rsvp" className={s.sec}>
      <Head note={content.deadline || t.reply} title={content.heading || t.come} />
      <div className={s.card} {...fx("rise", 240)}>
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        {content.linkUrl ? (
          <ReplyLink content={content} className={s.btn}>
            {content.linkLabel || t.send}
          </ReplyLink>
        ) : null}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.end}>
      <img className={cn(s.wash, s.endBouquet)} src={`${ART}/bouquet.webp`} alt="" loading="lazy" {...fx("bleed")} />
      <p className={s.h} {...fx("rise", 120)}>{content.heading || tr(model).love}</p>
      {content.message ? <p className={s.lead}>{content.message}</p> : null}
      <p className={s.note}>{content.signature || model.wedding.coupleName}</p>
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

export default function SketchRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="sketch" className={s.root} after={model.mode === "export" ? null : <SketchOpening model={model} />}>
      <SketchReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

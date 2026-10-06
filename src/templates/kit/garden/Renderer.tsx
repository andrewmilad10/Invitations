/* eslint-disable @next/next/no-img-element -- transparent painted art (frame, icons) layered over photos and paper */
import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { GardenOpening, GardenReady } from "./opening";
import s from "./garden.module.css";

/**
 * Garden Gate — a painted, romantic garden invitation. Opens on a cream
 * envelope printed with watercolour peonies and lavender, sealed in blush wax;
 * the seal lifts, the flap opens slowly partway on a flowered lining and the
 * view drifts in. The hero is a golden-hour garden gate with light through the
 * door, rising motes and two gold butterflies; the names fade in word by word.
 * Then: arch-topped countdown tiles, the couple's photo in a carved rose frame,
 * the day along a growing vine with watercolour icons, the venue under a
 * painted seaside town, a swipeable gallery and a wax seal to reply.
 * The paintings live in public/templates/garden-gate (made for Vellum).
 *
 * Colours: bg = cream page, surface = white cards, fg = ink, muted = soft
 * captions, accent = rose (script titles, buttons), accent-fg = white,
 * border = warm lines.
 */

const T = {
  en: { married: "We are getting married", save: "Save the date", counting: "Counting the days", story: "Our story", best: "The best day of our lives", schedule: "Schedule", planned: "What we have planned for you", venue: "The venue", where: "Where we'll celebrate", gallery: "Photo gallery", moments: "Moments we treasure", join: "Will you join us?", reply: "Kindly reply", send: "Tap the seal to reply", love: "With love", swipe: "Swipe", questions: "Good to know", asked: "Questions & answers" },
  ar: { married: "سنتزوج", save: "احفظوا التاريخ", counting: "نعدّ الأيام", story: "قصتنا", best: "أجمل أيام حياتنا", schedule: "البرنامج", planned: "ما حضّرناه لكم", venue: "المكان", where: "حيث نحتفل", gallery: "معرض الصور", moments: "لحظات نعتز بها", join: "هل ستكونون معنا؟", reply: "نرجو الرد", send: "اضغطوا على الختم للرد", love: "مع الحب", swipe: "اسحبوا", questions: "معلومات تهمّكم", asked: "أسئلة وأجوبة" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const ICONS = ["watch", "glasses", "plate", "cake", "disco", "balloons"];
const KEYWORDS: [RegExp, string][] = [
  [/dinner|lunch|meal|food|عشاء|غداء/i, "plate"],
  [/cake|dessert|sweet|كيك|تورت/i, "cake"],
  [/danc|party|music|dj|رقص|حفل/i, "disco"],
  [/toast|drink|cocktail|champagne|ceremony|vows|عقد|كوكتيل/i, "glasses"],
  [/arriv|welcome|guest|start|استقبال|وصول/i, "watch"],
  [/farewell|send.?off|brunch|after|وداع/i, "balloons"],
];
const iconFor = (title: string, i: number) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? ICONS[i % ICONS.length];

function Heading({ script, title }: { script: string; title: string }) {
  return (
    <>
      <p className={s.script} {...fx("rise")}>{script}</p>
      <h2 className={s.h} {...fx("rise", 110)}>{title}</h2>
    </>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const words: [ReactNode, string][] = [
    [content.eyebrow || tr(model).married, s.k],
    [wedding.partnerOne, s.name],
    [model.locale === "ar" ? "و" : "&", s.amp],
    [wedding.partnerTwo, s.name],
    [wedding.date?.long ?? "", s.date],
  ];
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <span className={s.bg} aria-hidden />
      <span className={s.rays} aria-hidden />
      <span className={s.motes} aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ left: `${36 + ((i * 37) % 30)}%`, top: `${48 + ((i * 23) % 38)}%`, animationDelay: `${-((i * 0.53) % 7)}s`, "--x": `${((i * 17) % 50) - 25}px` } as React.CSSProperties} />
        ))}
      </span>
      <span className={cn(s.bfly, s.fly1)} aria-hidden />
      <span className={cn(s.bfly, s.fly2)} aria-hidden />
      <div className={s.heroText}>
        <h1 className={s.heroH1}>
          {words.map(([w, c], i) =>
            w ? (
              <span key={i} className={cn(s.w, c)} style={{ "--i": i } as React.CSSProperties}>
                {w}
              </span>
            ) : null,
          )}
        </h1>
        {content.tagline ? <p className={cn(s.w, s.tagline)} style={{ "--i": 6 } as React.CSSProperties}>{content.tagline}</p> : null}
      </div>
      <span className={s.cue} aria-hidden>
        <i />
      </span>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <Heading script={content.eyebrow || kitCopy(model).with} title={content.heading} />
      {content.message ? <p className={s.lead} {...fx("rise", 200)}>{content.message}</p> : null}
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <Heading script={d.weekday} title={content.heading || d.long} />
      {content.note ? <p className={s.lead} {...fx("rise", 200)}>{content.note}</p> : null}
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.sec}>
      <Heading script={tr(model).save} title={content.heading || tr(model).counting} />
      <svg className={s.sprig} viewBox="0 0 110 26" aria-hidden {...fx("fade", 150)}>
        <path d="M5 13 Q 55 2 105 13 M30 9 q4 -8 10 -6 M42 7 q6 -7 11 -3 M68 7 q5 -6 11 -2 M80 9 q6 -6 10 -1 M42 8 q2 8 9 8 M68 8 q-2 8 -9 9" />
      </svg>
      <div {...fx("rise", 220)}>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.label} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photo = heroPhoto(model) ?? photos(model, 1)[0];
  if (!photo && !content.body && !content.heading) return null;
  return (
    <Sec id="story" className={s.sec}>
      <Heading script={tr(model).story} title={content.heading || tr(model).best} />
      {photo ? (
        <div className={s.frame} {...fx("scale", 200)}>
          <Pic asset={photo} sizes="(min-width: 640px) 200px, 45vw" className={s.framePhoto} />
          <img src="/templates/garden-gate/frame.webp" alt="" className={s.frameArt} />
        </div>
      ) : null}
      {content.body ? (
        <div className={s.prose} {...fx("rise", 250)}>
          <Paragraphs text={content.body} />
        </div>
      ) : null}
      {content.quote ? <p className={s.lead}>“{content.quote}”{content.quoteSource ? ` · ${content.quoteSource}` : ""}</p> : null}
    </Sec>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.sec}>
      <Heading script={tr(model).schedule} title={content.heading || tr(model).planned} />
      <ol className={s.vine}>
        {items.map((it, i) => (
          <li key={i} className={s.ev} {...fx("rise")}>
            <span className={s.icon}>
              <img src={`/templates/garden-gate/${iconFor(it.title, i)}.webp`} alt="" loading="lazy" />
            </span>
            <svg className={s.seg} viewBox="0 0 60 160" preserveAspectRatio="none" aria-hidden>
              <path className={s.stem} d={i % 2 ? "M30 0 Q 54 40 30 80 T 30 160" : "M30 0 Q 6 40 30 80 T 30 160"} />
              <path className={s.leaf} d={i % 2 ? "M30 80 q -14 -10 -22 -4 q 8 8 22 4 M30 90 q 14 -8 20 -2 q -8 7 -20 2" : "M30 80 q 14 -10 22 -4 q -8 8 -22 4 M30 90 q -14 -8 -20 -2 q 8 7 20 2"} />
            </svg>
            <span className={s.tx}>
              <b>{it.title}</b>
              <time>{it.time}</time>
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
  const t = kitCopy(model);
  const first = id === "ceremony" || !model.events.ceremony;
  return (
    <Sec id={id} className={cn(s.sec, !first && s.secTight)}>
      {first ? <Heading script={tr(model).venue} title={tr(model).where} /> : null}
      <article className={s.venue} {...fx("rise", 150)}>
        <span className={s.town} aria-hidden />
        <div className={s.venueBody}>
          <span className={s.pin} aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </span>
          <p className={s.kind}>{id === "ceremony" ? t.ceremony : t.reception}</p>
          <h3>{content.heading || e.venueName || e.title}</h3>
          {e.address ? <address>{e.address}</address> : null}
          <p className={s.when}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
          {content.note ? <p className={s.note}>{content.note}</p> : null}
          <Directions model={model} event={e} className={s.dir}>
            <i aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M3 11l18-8-8 18-2-8z" />
              </svg>
            </i>
            <span>
              <b>{model.strings.directions}</b>
            </span>
          </Directions>
        </div>
      </article>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={cn(s.sec, s.secTight)}>
      {content.heading ? <h2 className={s.h} {...fx("rise")}>{content.heading}</h2> : null}
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
  return (
    <Sec id="gallery" className={s.sec}>
      <Heading script={tr(model).gallery} title={content.heading || tr(model).moments} />
      {content.caption ? <p className={s.lead}>{content.caption}</p> : null}
      <div className={s.gal} {...fx("rise", 200)}>
        {list.map((p) => (
          <div key={p.id} className={s.shot}>
            <Pic asset={p} sizes="(min-width: 640px) 420px, 78vw" className={s.shotImg} />
          </div>
        ))}
      </div>
      {list.length > 1 ? <p className={s.swipe}>← {tr(model).swipe} →</p> : null}
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <Heading script={tr(model).questions} title={content.heading || tr(model).asked} />
      <div className={s.faq} {...fx("rise", 200)}>
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
  return (
    <Sec id="rsvp" className={s.sec}>
      <Heading script={tr(model).join} title={content.heading || tr(model).reply} />
      <div className={s.rsvp} {...fx("rise", 200)}>
        {content.deadline ? <p className={s.kind}>{content.deadline}</p> : null}
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.send}>
          <span className={s.sendSeal} aria-hidden />
          <span className={s.sendLabel}>{content.linkLabel || tr(model).send}</span>
        </ReplyLink>
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div {...fx("fade")}>
        <p className={s.love}>{content.heading || tr(model).love}</p>
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        <p className={s.kind}>{content.signature || model.wedding.coupleName}</p>
      </div>
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

export default function GardenRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="garden" className={s.root} after={model.mode === "export" ? null : <GardenOpening model={model} />}>
      <GardenReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

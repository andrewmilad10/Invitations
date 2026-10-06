/* eslint-disable @next/next/no-img-element -- transparent embroidery cut-outs layered on linen */
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { FrameShow, Sewn, Spools, Thread } from "./live";
import { MeadowOpening, MeadowReady } from "./opening";
import s from "./meadow.module.css";

/**
 * Linen Meadow — hand embroidery on oat linen: poppies, chamomile, cornflowers
 * and wheat in red, olive, buttercup and navy thread. Opens on a stitched linen
 * envelope closed with a red fabric button; the flap lifts on an olive-sprig
 * lining and the screen eases into the meadow. The couple's names are sewn in
 * (a navy running stitch, then red satin), the hero is an embroidery hoop with
 * a long table under an olive tree, the countdown sits in four flower hoops,
 * two threads rise from their spools for the story, a needle sews down the
 * day, the dress code hangs on a rail, photos change in a stitched frame and
 * guests reply at the pincushion. Embroidery in public/templates/linen-meadow.
 *
 * Colours: bg = oat linen, surface = pale linen cards, fg = navy thread,
 * muted = warm brown-grey, accent = poppy red (script titles, buttons),
 * accent-fg = white, border = linen seams.
 */

const ART = "/templates/linen-meadow";
const T = {
  en: { together: "Together with their families", invited: "You are invited", countdown: "Save the date", wait: "Counting the days", story: "Our story", threads: "Two threads, one story", day: "The day", planned: "What we have planned", venue: "The venue", where: "Where we'll celebrate", gallery: "Moments", favourites: "A few of our favourites", photo: "Photo", know: "Good to know", dress: "Dress code", join: "Will you join us?", send: "Reply here", end: "With love" },
  ar: { together: "مع عائلتيهما", invited: "أنتم مدعوون", countdown: "احفظوا التاريخ", wait: "نعدّ الأيام", story: "قصتنا", threads: "خيطان وقصة واحدة", day: "اليوم", planned: "ما حضّرناه لكم", venue: "المكان", where: "حيث نحتفل", gallery: "لحظات", favourites: "بعض لحظاتنا المفضّلة", photo: "صورة", know: "معلومات تهمّكم", dress: "اللباس", join: "هل ستكونون معنا؟", send: "ردّوا من هنا", end: "مع الحب" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const ICONS = ["arch", "rings", "glasses", "dinner", "cake", "lantern"];
const KEYWORDS: [RegExp, string][] = [
  [/vow|ring|promise|عهود|خاتم|دبل/i, "rings"],
  [/ceremon|i do|arch|عقد|زفاف|مراسم/i, "arch"],
  [/cake|dessert|sweet|كيك|تورت|حلو/i, "cake"],
  [/dinner|lunch|meal|feast|table|عشاء|غداء|عزومة/i, "dinner"],
  [/toast|champagne|drink|cocktail|welcome|golden|arriv|نخب|استقبال|مشروب/i, "glasses"],
  [/danc|party|music|dj|lantern|night|send.?off|رقص|حفل|سهرة|وداع/i, "lantern"],
];
const iconFor = (title: string, i: number) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? ICONS[i % ICONS.length];
const initial = (name: string) => Array.from(name.trim())[0] ?? "";

function Head({ script, sub }: { script: string; sub?: string }) {
  return (
    <>
      <p className={s.script} {...fx("rise")}>{script}</p>
      {sub ? <h2 className={s.h} {...fx("rise", 120)}>{sub}</h2> : null}
    </>
  );
}

function Seam() {
  return (
    <svg className={s.seam} viewBox="0 0 240 22" aria-hidden {...fx("wipe", 200)}>
      <path d="M4 11 C 44 2, 76 20, 120 11 S 196 2, 236 11" />
    </svg>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const where = content.tagline || place?.venueName || "";
  const amp = model.locale === "ar" ? " و " : " & ";
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <img className={s.hoop} src={`${ART}/hero.webp`} alt="An embroidered long table under an olive tree in a wildflower meadow" />
      <div className={s.heroText}>
        <p className={cn(s.k, s.heroK)}>{content.eyebrow || tr(model).together}</p>
        <h1 className={s.heroH1}>
          <Sewn text={`${wedding.partnerOne}${amp}${wedding.partnerTwo}`} className={s.names} />
        </h1>
        {wedding.date?.long ? <p className={s.date}>{wedding.date.long}</p> : null}
        {where ? <p className={s.place}>{where}</p> : null}
        <span className={s.cue} aria-hidden />
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  const { wedding } = model;
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.in}>
        <p className={s.k} {...fx("rise")}>{content.eyebrow || tr(model).invited}</p>
        <div className={s.mono} {...fx("sew", 200)}>
          <img src={`${ART}/monogram.webp`} alt="" loading="lazy" />
          <Sewn text={`${initial(wedding.partnerOne)}&${initial(wedding.partnerTwo)}`} label={wedding.coupleName} size={90} className={s.monoSewn} />
        </div>
        {content.heading ? <h2 className={s.h} {...fx("rise", 200)}>{content.heading}</h2> : null}
        {content.message ? <p className={s.lead} {...fx("rise", 300)}>{content.message}</p> : null}
        <img className={s.garland} src={`${ART}/garland.webp`} alt="" loading="lazy" {...fx("garland", 300)} />
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
    <Sec id="countdown" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || tr(model).countdown} sub={tr(model).wait} />
        <div {...fx("rise", 240)}>
          <Clock model={model} className={s.count} unit={s.unit} value={s.value} label={s.label} />
        </div>
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photo = heroPhoto(model) ?? photos(model, 1)[0];
  if (!photo && !content.body && !content.heading) return null;
  return (
    <Sec id="story" className={s.sec}>
      <div className={cn(s.in, s.story)}>
        <Spools src={`${ART}/spools.webp`} />
        <div className={s.storyText}>
          <Head script={content.heading || tr(model).story} sub={tr(model).threads} />
          <Seam />
          {content.body ? (
            <div className={s.lead} {...fx("rise", 300)}>
              <Paragraphs text={content.body} />
            </div>
          ) : null}
          {content.quote ? <p className={s.lead}>“{content.quote}”{content.quoteSource ? ` · ${content.quoteSource}` : ""}</p> : null}
        </div>
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
        <Thread>
          {items.map((it, i) => (
            <li key={i} className={s.ev} {...fx("ev")}>
              <img className={s.ic} src={`${ART}/ic-${iconFor(it.title, i)}.webp`} alt="" loading="lazy" />
              <span className={s.tx}>
                <b>{it.title}</b>
                <time>{it.time}</time>
                {it.note ? <span>{it.note}</span> : null}
              </span>
            </li>
          ))}
        </Thread>
      </div>
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
      <div className={s.in}>
        {first ? <Head script={tr(model).venue} sub={tr(model).where} /> : null}
        <div className={s.card} {...fx("rise", 240)}>
          <p className={s.k}>{id === "ceremony" ? t.ceremony : t.reception}</p>
          <p className={s.vName}>{content.heading || e.venueName || e.title}</p>
          {e.address ? <p className={s.addr}>{e.address}</p> : null}
          <p className={s.when}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
          {content.note ? <p className={s.lead}>{content.note}</p> : null}
          <Directions model={model} event={e} className={s.btn} />
        </div>
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={cn(s.sec, s.secTight)}>
      <div className={s.in}>
        {content.heading ? <p className={s.h}>{content.heading}</p> : null}
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig} {...fx("rise")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption>{e.venueName ?? e.title}</figcaption>
          </figure>
        ))}
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
          <FrameShow frame={`${ART}/frame.webp`} label={t.photo}>
            {list.map((p) => (
              <Pic key={p.id} asset={p} sizes="(min-width: 640px) 320px, 66vw" className={s.slideImg} />
            ))}
          </FrameShow>
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
        <Head script={content.heading || tr(model).know} sub={tr(model).dress} />
        <div className={s.rail} {...fx("rise", 240)}>
          <img src={`${ART}/jacket.webp`} alt="" loading="lazy" />
          <img src={`${ART}/dress.webp`} alt="" loading="lazy" />
        </div>
        <div className={cn(s.card, s.faq)} {...fx("rise", 320)}>
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
        <Head script={content.heading || tr(model).join} sub={content.deadline} />
        <div className={s.card} {...fx("rise", 240)}>
          {content.message ? <p className={s.lead}>{content.message}</p> : null}
          {content.linkUrl ? (
            <ReplyLink content={content} className={s.press}>
              <span className={s.pin} aria-hidden />
              <span className={s.pressLabel}>{content.linkLabel || tr(model).send}</span>
            </ReplyLink>
          ) : (
            <span className={s.press} aria-hidden>
              <span className={s.pin} />
            </span>
          )}
        </div>
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.end}>
      <img className={s.bouquet} src={`${ART}/bouquet.webp`} alt="" loading="lazy" {...fx("rise")} />
      <p className={s.script} {...fx("rise", 120)}>{content.heading || tr(model).end}</p>
      {content.message ? <p className={s.lead}>{content.message}</p> : null}
      <p className={s.k}>{content.signature || model.wedding.coupleName}</p>
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

export default function MeadowRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="meadow" className={s.root} after={model.mode === "export" ? null : <MeadowOpening model={model} />}>
      <MeadowReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

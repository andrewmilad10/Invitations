/* eslint-disable @next/next/no-img-element -- transparent paper-cut art layered on paper */
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { ArchShow, DepthWindow, FoldCard } from "./live";
import { FanOpening, FanReady } from "./opening";
import s from "./fan.module.css";

/**
 * Paper Fan — layered paper-cut art in ivory, lavender and plum. Opens on a
 * closed paper fan on a lavender meadow: tap and eleven lace blades spread
 * into a half circle, then the screen eases into an arch window cut into the
 * page, with a moonlit sky and blossom branches moving at different depths
 * behind it. Lace doilies turn slowly behind the countdown, the day unfolds
 * like a folded card, the dress code hangs in a curtained doorway, photos
 * change in a paper arch, a paper plane carries the reply and the page ends
 * on the meadow. Art in public/templates/paper-fan.
 *
 * Colours: bg = warm paper, surface = ivory panels, fg = deep plum ink,
 * muted = plum grey, accent = plum (script titles, buttons), accent-fg =
 * ivory, border = paper seams.
 */

const ART = "/templates/paper-fan";
const T = {
  en: { married: "We are getting married", unfolding: "Unfolding, together", countdown: "Save the date", counting: "Counting the days", venue: "The venue", where: "Where we'll celebrate", day: "The day", evening: "As the evening unfolds", gallery: "Moments", favourites: "A few of our favourites", photo: "Photo", know: "Good to know", dress: "Dress code", join: "Will you join us?", send: "Send my reply", end: "With love" },
  ar: { married: "سنتزوّج", unfolding: "نتفتّح معًا", countdown: "احفظوا التاريخ", counting: "نعدّ الأيام", venue: "المكان", where: "حيث نحتفل", day: "اليوم", evening: "كيف تتفتّح الأمسية", gallery: "لحظات", favourites: "بعض لحظاتنا المفضّلة", photo: "صورة", know: "معلومات تهمّكم", dress: "اللباس", join: "هل ستكونون معنا؟", send: "أرسلوا ردّكم", end: "مع الحب" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const ICONS = ["rings", "glasses", "dinner", "cake", "music", "moon"];
const KEYWORDS: [RegExp, string][] = [
  [/vow|ring|ceremon|i do|عهود|خاتم|عقد|زفاف|مراسم/i, "rings"],
  [/cake|dessert|sweet|كيك|تورت|حلو/i, "cake"],
  [/dinner|lunch|meal|feast|عشاء|غداء/i, "dinner"],
  [/toast|champagne|drink|cocktail|welcome|arriv|نخب|استقبال|مشروب/i, "glasses"],
  [/danc|party|music|dj|رقص|حفل|موسيقى/i, "music"],
  [/night|send.?off|farewell|goodnight|late|وداع|ختام/i, "moon"],
];
const iconFor = (title: string, i: number) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? ICONS[i % ICONS.length];

function Head({ script, sub }: { script: string; sub?: string }) {
  return (
    <>
      <p className={s.script} {...fx("rise")}>{script}</p>
      {sub ? <h2 className={s.h} {...fx("rise", 120)}>{sub}</h2> : null}
    </>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const amp = model.locale === "ar" ? "و" : "&";
  const words: [string, string?][] = [[wedding.partnerOne], [amp, s.amp], [wedding.partnerTwo]];
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <DepthWindow>
        <div className={s.inside} role="img" aria-label="A moonlit lavender sky with blossom branches, seen through a paper-cut arch">
          <span className={cn(s.layer, s.sky)} data-depth=".12" />
          <span className={cn(s.moth, s.m1)} aria-hidden />
          <span className={cn(s.moth, s.m2)} aria-hidden />
          <span className={cn(s.layer, s.branches)} data-depth=".05" />
        </div>
        <img className={s.archArt} src={`${ART}/arch.webp`} alt="" />
        <div className={s.heroText}>
          <p className={cn(s.caps, s.w)} style={{ "--i": 0 } as React.CSSProperties}>{content.eyebrow || tr(model).married}</p>
          <h1 className={s.heroH1}>
            {words.map(([w, c], i) => (
              <span key={i} className={cn(s.w, c)} style={{ "--i": i + 1 } as React.CSSProperties}>
                {w}
              </span>
            ))}
          </h1>
          {wedding.date?.long ? <p className={cn(s.heroDate, s.w)} style={{ "--i": 5 } as React.CSSProperties}>{wedding.date.long}</p> : null}
          {content.tagline ? <p className={cn(s.caps, s.w)} style={{ "--i": 6 } as React.CSSProperties}>{content.tagline}</p> : null}
        </div>
      </DepthWindow>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.in}>
        <img className={s.moonset} src={`${ART}/moonset.webp`} alt="" loading="lazy" {...fx("rise")} />
        <p className={s.script} {...fx("rise", 100)}>{content.heading || tr(model).unfolding}</p>
        {content.eyebrow ? <p className={cn(s.caps, s.muted)}>{content.eyebrow}</p> : null}
        {content.message ? <p className={s.lead} {...fx("rise", 200)}>{content.message}</p> : null}
        <img className={s.garland} src={`${ART}/garland.webp`} alt="" loading="lazy" {...fx("garland", 200)} />
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
        <Head script={content.heading || tr(model).countdown} sub={tr(model).counting} />
        <div {...fx("rise", 240)}>
          <Clock model={model} className={s.count} unit={s.unit} value={s.value} label={s.label} />
        </div>
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

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || tr(model).day} sub={tr(model).evening} />
        <FoldCard>
          {items.map((it, i) => (
            <li key={i} className={s.panel}>
              <img src={`${ART}/ic-${iconFor(it.title, i)}.webp`} alt="" loading="lazy" />
              <span>
                <b>{it.title}</b>
                {it.note ? <small>{it.note}</small> : null}
              </span>
              <time>{it.time}</time>
            </li>
          ))}
        </FoldCard>
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
    <Sec id={id} className={cn(s.sec, !first && s.tight)}>
      <div className={s.in}>
        {first ? <Head script={tr(model).venue} sub={tr(model).where} /> : null}
        {first ? <img className={s.villa} src={`${ART}/villa.webp`} alt="" loading="lazy" {...fx("rise", 240)} /> : null}
        <p className={cn(s.caps, s.muted, s.kind)} {...fx("rise")}>{id === "ceremony" ? t.ceremony : t.reception}</p>
        <p className={s.vName} {...fx("rise", 100)}>{content.heading || e.venueName || e.title}</p>
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
    <Sec id="venue" className={cn(s.sec, s.tight)}>
      <div className={s.in}>
        {content.heading ? <p className={s.h}>{content.heading}</p> : null}
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

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 8);
  if (!list.length) return null;
  const t = tr(model);
  return (
    <Sec id="gallery" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || t.gallery} sub={content.caption || t.favourites} />
        <div {...fx("rise", 240)}>
          <ArchShow frame={`${ART}/frame.webp`} label={t.photo}>
            {list.map((p) => (
              <Pic key={p.id} asset={p} sizes="(min-width: 640px) 200px, 40vw" className={s.slideImg} />
            ))}
          </ArchShow>
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
        <img className={s.doorway} src={`${ART}/doorway.webp`} alt="" loading="lazy" {...fx("rise", 200)} />
        <div className={s.faq} {...fx("rise", 300)}>
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
        <div className={s.reply} {...fx("rise", 240)}>
          <img className={s.plane} src={`${ART}/plane.webp`} alt="" loading="lazy" />
          {content.message ? <p className={s.lead}>{content.message}</p> : null}
          {content.linkUrl ? (
            <ReplyLink content={content} className={s.btn}>
              {content.linkLabel || tr(model).send}
            </ReplyLink>
          ) : null}
        </div>
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.end}>
      <div className={s.endText}>
        <p className={s.endScript} {...fx("rise")}>{content.heading || tr(model).end}</p>
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        <p className={cn(s.caps, s.muted)} {...fx("rise", 160)}>{content.signature || model.wedding.coupleName}</p>
      </div>
      <span className={s.meadow} aria-hidden />
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

export default function FanRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="fan" className={s.root} after={model.mode === "export" ? null : <FanOpening model={model} />}>
      <FanReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

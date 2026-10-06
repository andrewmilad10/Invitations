/* eslint-disable @next/next/no-img-element -- transparent watercolour art layered over the painted sea */
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { Coverflow, GrowingLine, TiltCard } from "./live";
import { LemonOpening, LemonReady } from "./opening";
import s from "./lemon.module.css";

/**
 * Lemon Terrace — a sunny Mediterranean invitation in powder blue and lemon.
 * Opens on a blue envelope with an embossed frame: gold flows slowly along the
 * embossing, the flap lifts on a blossom lining and the screen fades into a
 * painted terrace behind blue shutters, looking out to sea. The page sits on a
 * watercolour sea: lemon branches over each section, the couple's photo in a
 * lemon wreath, the day along a gold line with watercolour icons, a painted
 * orangery for the venue, a dress-code card, a coverflow gallery, a wax seal
 * to reply and string lights to close. Paintings in public/templates/lemon-terrace.
 *
 * Colours: bg = pale sea, surface = white cards, fg = navy ink, muted = soft
 * blue-grey, accent = cobalt (script titles, buttons), accent-fg = white,
 * border = pale blue lines.
 */

const ART = "/templates/lemon-terrace";
const T = {
  en: { love: "Two hearts, one love", countdown: "Countdown", wait: "We can't wait for this moment", story: "Our story", forever: "From a summer by the sea to forever", day: "The day", planned: "What we have planned for you", venue: "The venue", where: "Where we'll celebrate", gallery: "Photo gallery", moments: "Moments we treasure", swipe: "Swipe", know: "Good to know", dress: "Dress code", join: "Will you join us?", send: "Reply here", end: "See you under the lemon trees" },
  ar: { love: "قلبان وحب واحد", countdown: "العد التنازلي", wait: "لا نطيق الانتظار", story: "قصتنا", forever: "من صيف على البحر إلى الأبد", day: "اليوم", planned: "ما حضّرناه لكم", venue: "المكان", where: "حيث نحتفل", gallery: "معرض الصور", moments: "لحظات نعتز بها", swipe: "اسحبوا", know: "معلومات تهمّكم", dress: "اللباس", join: "هل ستكونون معنا؟", send: "ردّوا من هنا", end: "نراكم تحت أشجار الليمون" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const ICONS = ["cocktail", "rings", "bucket", "tart", "gramophone", "sparklers"];
const KEYWORDS: [RegExp, string][] = [
  [/ceremon|vows|i do|عقد|زفاف/i, "rings"],
  [/dinner|lunch|meal|cake|dessert|عشاء|كيك|تورت/i, "tart"],
  [/toast|champagne|bubbl|نخب/i, "bucket"],
  [/welcome|arriv|drink|cocktail|spritz|استقبال|كوكتيل/i, "cocktail"],
  [/danc|party|music|dj|رقص|حفل/i, "gramophone"],
  [/send.?off|farewell|sparkler|goodnight|وداع/i, "sparklers"],
];
const iconFor = (title: string, i: number) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? ICONS[i % ICONS.length];

function Branches() {
  return (
    <>
      <img className={cn(s.branch, s.branchL)} src={`${ART}/branch-l.webp`} alt="" loading="lazy" />
      <img className={cn(s.branch, s.branchR)} src={`${ART}/branch-r.webp`} alt="" loading="lazy" />
    </>
  );
}

function Head({ script, sub }: { script: string; sub?: string }) {
  return (
    <>
      <p className={s.script} {...fx("rise")}>{script}</p>
      {sub ? <p className={s.sub} {...fx("rise", 140)}>{sub}</p> : null}
    </>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const where = content.tagline || place?.venueName || "";
  const words: [string, string][] = [
    [content.eyebrow || tr(model).love, s.k],
    [wedding.partnerOne, s.name],
    [model.locale === "ar" ? "و" : "&", s.amp],
    [wedding.partnerTwo, s.name],
    [wedding.date?.long ?? "", s.date],
    [where, s.place],
  ];
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <span className={s.heroBg} role="img" aria-label="A sunlit terrace behind blue shutters, looking out to sea" />
      <span className={s.sun} aria-hidden />
      <span className={s.glints} aria-hidden>
        {Array.from({ length: 22 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${-((i * 0.41) % 3.6)}s` }} />
        ))}
      </span>
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
      </div>
      <span className={s.cue} aria-hidden />
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <Branches />
      <div className={s.in}>
        <Head script={content.heading || kitCopy(model).with} sub={content.eyebrow} />
        {content.message ? <p className={s.story} {...fx("rise", 280)}>{content.message}</p> : null}
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
        {content.note ? <p className={s.story}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.sec}>
      <Branches />
      <div className={s.in}>
        <Head script={content.heading || tr(model).countdown} sub={tr(model).wait} />
        <div {...fx("rise", 280)}>
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
    <Sec id="story" className={cn(s.sec, s.secTall)}>
      <div className={s.in}>
        <Head script={content.heading || tr(model).story} sub={tr(model).forever} />
        {photo ? (
          <div className={s.wreath} {...fx("rise", 280)}>
            <Pic asset={photo} sizes="(min-width: 640px) 220px, 46vw" className={s.wreathPhoto} />
            <img src={`${ART}/wreath.webp`} alt="" className={s.wreathArt} loading="lazy" />
          </div>
        ) : null}
        {content.body ? (
          <div className={s.story} {...fx("rise", 420)}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? <p className={s.story}>“{content.quote}”{content.quoteSource ? ` · ${content.quoteSource}` : ""}</p> : null}
      </div>
      <img className={s.flowers} src={`${ART}/flowers.webp`} alt="" loading="lazy" />
    </Sec>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.sec}>
      <Branches />
      <div className={s.in}>
        <Head script={content.heading || tr(model).day} sub={tr(model).planned} />
        <GrowingLine>
          {items.map((it, i) => (
            <li key={i} className={s.ev} {...fx("rise")}>
              <span className={s.ic}>
                <img src={`${ART}/${iconFor(it.title, i)}.webp`} alt="" loading="lazy" />
              </span>
              <span className={s.tx}>
                <time>{it.time}</time>
                <b>{it.title}</b>
                {it.note ? <span>{it.note}</span> : null}
              </span>
            </li>
          ))}
        </GrowingLine>
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
    <Sec id={id} className={cn(s.sec, first ? s.secTall : s.secTight)}>
      <div className={s.in}>
        {first ? <Head script={tr(model).venue} sub={tr(model).where} /> : null}
        {first ? (
          <div className={s.orangery} {...fx("rise", 280)}>
            <img src={`${ART}/orangery.webp`} alt="" loading="lazy" />
          </div>
        ) : null}
        <p className={s.kind} {...fx("rise")}>{id === "ceremony" ? t.ceremony : t.reception}</p>
        <p className={s.vName} {...fx("rise", 100)}>{content.heading || e.venueName || e.title}</p>
        {e.address ? <p className={s.addr}>{e.address}</p> : null}
        <p className={s.when}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
        {content.note ? <p className={s.story}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.btn} />
      </div>
      {first ? <img className={cn(s.flowers, s.flowersL)} src={`${ART}/flowers.webp`} alt="" loading="lazy" /> : null}
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={cn(s.sec, s.secTight)}>
      <div className={s.in}>
        {content.heading ? <p className={s.sub}>{content.heading}</p> : null}
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
  return (
    <Sec id="gallery" className={s.sec}>
      <div className={s.in}>
        <Head script={content.heading || tr(model).gallery} sub={content.caption || tr(model).moments} />
      </div>
      <div {...fx("rise", 280)}>
        <Coverflow>
          {list.map((p) => (
            <figure key={p.id} className={s.shot}>
              <Pic asset={p} sizes="(min-width: 640px) 300px, 62vw" className={s.shotImg} />
            </figure>
          ))}
        </Coverflow>
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
      <Branches />
      <div className={s.in}>
        <Head script={content.heading || tr(model).know} />
        <div {...fx("rise", 200)}>
          <TiltCard className={s.card3d}>
            <img src={`${ART}/dress.webp`} alt="" loading="lazy" />
            <div className={s.faq}>
              {items.map((it, i) => (
                <details key={i} className={s.qa} open={i === 0}>
                  <summary>{it.question}</summary>
                  <p>{it.answer}</p>
                </details>
              ))}
            </div>
          </TiltCard>
        </div>
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <Branches />
      <div className={s.in}>
        <Head script={content.heading || tr(model).join} sub={content.deadline} />
        <div className={s.rsvp} {...fx("rise", 280)}>
          {content.message ? <p className={s.story}>{content.message}</p> : null}
          {content.linkUrl ? (
            <ReplyLink content={content} className={s.press}>
              <span className={s.pressSeal} aria-hidden />
              <span className={s.pressLabel}>{content.linkLabel || tr(model).send}</span>
            </ReplyLink>
          ) : (
            <span className={s.press} aria-hidden>
              <span className={s.pressSeal} />
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
      <div className={s.lights} {...fx("fade")}>
        <img src={`${ART}/lights.webp`} alt="" loading="lazy" />
        {[[2.9, 24.1], [12.7, 48.6], [24, 69], [36.8, 80.6], [49.7, 84.4], [62.7, 80.6], [74.8, 70], [86.2, 51.7], [96.5, 27.2]].map(([x, y], i) => (
          <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-i * 0.41}s` }} aria-hidden />
        ))}
      </div>
      <p className={s.script} {...fx("rise", 100)}>{content.heading || tr(model).end}</p>
      {content.message ? <p className={s.story}>{content.message}</p> : null}
      <p className={s.kind}>{content.signature || model.wedding.coupleName}</p>
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

export default function LemonRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="lemon" className={s.root} after={model.mode === "export" ? null : <LemonOpening model={model} />}>
      <LemonReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

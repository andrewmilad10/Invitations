/* eslint-disable @next/next/no-img-element -- transparent cut-outs layered on paper and velvet */
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { OperaBox, Tickets } from "./live";
import { TheatreOpening, TheatreReady } from "./opening";
import s from "./theatre.module.css";

/**
 * Opening Night — the wedding as the opening night of a small old theatre.
 * Opens on a teal velvet curtain embroidered with swallows: pull the gold
 * tassel and the curtain rises slowly onto a lit stage with the names. Then
 * the evening's programme on ivory paper: three tickets to tear for the date,
 * a marquee with chasing bulbs for the countdown, an engraved villa for the
 * venue, the day as acts of a programme, costumes under a velvet arch for the
 * dress code, photos in an opera-box frame, a seat ticket to reply and a
 * curtain call with a rose landing on the stage floor. Art in
 * public/templates/opening-night.
 *
 * Colours: bg = ivory programme paper, surface = pale paper cards, fg = dark
 * brown ink, muted = warm grey-brown, accent = wine red (script titles),
 * accent-fg = ivory, border = paper rules.
 */

const ART = "/templates/opening-night";
const T = {
  en: { premiere: "Tonight, the premiere of", invite: "Request the pleasure of your company", date: "Save the date", tear: "Tear", tearEach: "Tear each ticket", pull: "Pull the stubs to the right to reveal the day.", day: "The day", month: "The month", year: "The year", married: "We're getting married!", countdown: "Countdown", rise: "Until the curtain rises", venue: "The venue", where: "Where the evening takes place", programme: "The programme", tonight: "Tonight's performance", acts: ["Act I", "Act II", "Act III", "Act IV", "Act V", "Act VI", "Act VII", "Act VIII"], encore: "Encore", gallery: "From the box", scenes: "A few of our favourite scenes", photo: "Photo", know: "Good to know", seat: "Reserve your seat", reserve: "Reserve my seat", admit: "Admit one", call: "Curtain call", scroll: "Scroll" },
  ar: { premiere: "الليلة، العرض الأول لـ", invite: "يسعدنا حضوركم", date: "احفظوا التاريخ", tear: "اقطعوا", tearEach: "اقطعوا كل تذكرة", pull: "اسحبوا الكعب لليمين ليظهر التاريخ.", day: "اليوم", month: "الشهر", year: "السنة", married: "سنتزوّج!", countdown: "العد التنازلي", rise: "حتى يُرفع الستار", venue: "المكان", where: "حيث تقام الأمسية", programme: "البرنامج", tonight: "عرض الليلة", acts: ["الفصل الأول", "الفصل الثاني", "الفصل الثالث", "الفصل الرابع", "الفصل الخامس", "الفصل السادس", "الفصل السابع", "الفصل الثامن"], encore: "الختام", gallery: "من الشرفة", scenes: "بعض مشاهدنا المفضّلة", photo: "صورة", know: "معلومات تهمّكم", seat: "احجزوا مقعدكم", reserve: "احجز مقعدي", admit: "دخول", call: "تحية الختام", scroll: "مرّروا" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const ICONS = ["rings", "glasses", "dinner", "cake", "gramophone", "moon"];
const KEYWORDS: [RegExp, string][] = [
  [/vow|ring|ceremon|i do|عهود|خاتم|عقد|زفاف|مراسم/i, "rings"],
  [/cake|dessert|sweet|كيك|تورت|حلو/i, "cake"],
  [/dinner|lunch|meal|feast|عشاء|غداء/i, "dinner"],
  [/toast|champagne|drink|cocktail|welcome|arriv|نخب|استقبال|مشروب/i, "glasses"],
  [/danc|party|music|dj|رقص|حفل|موسيقى/i, "gramophone"],
  [/night|send.?off|farewell|goodnight|late|وداع|ختام/i, "moon"],
];
const iconFor = (title: string, i: number) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? ICONS[i % ICONS.length];
// the marquee's bulbs, measured from the art
const BULBS = [[2.38, 48.16], [2.43, 32.17], [5.63, 23.57], [7.81, 10.25], [11.79, 9.22], [15.82, 9.22], [19.99, 9.22], [24.02, 9.22], [28.43, 9.22], [32.65, 9.02], [36.68, 9.02], [40.85, 9.02], [44.98, 9.02], [49.25, 9.02], [53.42, 9.02], [57.5, 9.22], [61.62, 9.02], [65.74, 9.02], [69.92, 9.02], [74.19, 9.02], [78.26, 9.22], [82.44, 9.22], [86.9, 9.22], [91.8, 9.84], [94.42, 23.36], [97.57, 32.17], [97.62, 48.16], [97.57, 64.14], [94.47, 74.18], [91.75, 89.34], [86.9, 89.55], [82.48, 89.55], [78.26, 89.55], [74.19, 89.55], [69.97, 89.55], [65.79, 89.55], [61.62, 89.55], [57.5, 89.55], [53.42, 89.55], [49.3, 89.55], [44.98, 89.55], [40.85, 89.55], [36.68, 89.55], [32.61, 89.55], [28.43, 89.55], [24.07, 89.55], [19.99, 89.55], [15.82, 89.55], [11.79, 89.55], [7.76, 87.7], [5.58, 74.18], [2.38, 64.34]];
const MOTES = Array.from({ length: 14 }, (_, i) => ({ left: (i * 37) % 100, top: 30 + ((i * 23) % 70), x: ((i % 5) - 2) * 14, delay: -i * 0.7, d: 8 + (i % 4) * 1.5 }));
const FLOOR = [
  { src: "rose", fx: -30, fr: -70, style: { left: "calc(50% - 70px)", bottom: 44, width: 120, rotate: "62deg" } },
  { src: "petal1", fx: 40, fr: 120, style: { left: "18%", bottom: 58, width: 36, rotate: "-20deg" } },
  { src: "petal2", fx: -20, fr: -160, style: { right: "20%", bottom: 50, width: 38, rotate: "14deg" } },
  { src: "petal3", fx: 30, fr: 200, style: { left: "calc(50% + 70px)", bottom: 70, width: 30, rotate: "40deg" } },
  { src: "petal1", fx: -40, fr: -90, style: { left: "34%", bottom: 84, width: 26, rotate: "110deg" } },
  { src: "petal3", fx: 20, fr: 150, style: { right: "33%", bottom: 86, width: 24, rotate: "-60deg" } },
];

function Head({ script, sub }: { script: string; sub?: string }) {
  return (
    <>
      <p className={s.script} {...fx("rise")}>{script}</p>
      {sub ? <h2 className={s.h} {...fx("rise", 120)}>{sub}</h2> : null}
    </>
  );
}

function Rule() {
  return (
    <div className={s.rule} aria-hidden {...fx("rise", 200)}>
      <i />
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const amp = model.locale === "ar" ? "و" : "&";
  const words: [string, string?][] = [[wedding.partnerOne], [amp, s.amp], [wedding.partnerTwo]];
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.stageBox} role="img" aria-label="A lit theatre stage behind a raised velvet curtain">
        <img className={s.swag} src={`${ART}/swag.webp`} alt="" />
        <span className={s.motes} aria-hidden>
          {MOTES.map((m, i) => (
            <i key={i} style={{ left: `${m.left}%`, top: `${m.top}%`, "--x": `${m.x}px`, animationDelay: `${m.delay}s`, animationDuration: `${m.d}s` } as React.CSSProperties} />
          ))}
        </span>
      </div>
      <div className={s.heroText}>
        <p className={cn(s.caps, s.w)} style={{ "--i": 0 } as React.CSSProperties}>{content.eyebrow || tr(model).premiere}</p>
        <h1 className={s.heroH1}>
          {words.map(([w, c], i) => (
            <span key={i} className={cn(s.w, c)} style={{ "--i": i + 1 } as React.CSSProperties}>
              {w}
            </span>
          ))}
        </h1>
        {wedding.date?.long ? <p className={cn(s.heroDate, s.w)} style={{ "--i": 5 } as React.CSSProperties}>{wedding.date.long}</p> : null}
        {content.tagline ? <p className={cn(s.heroPlace, s.w)} style={{ "--i": 6 } as React.CSSProperties}>{content.tagline}</p> : null}
      </div>
      <span className={cn(s.cue, s.caps)} aria-hidden>
        {tr(model).scroll}
        <i />
      </span>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <div className={s.inner}>
        <p className={cn(s.caps, s.wine)} {...fx("rise")}>{content.eyebrow || kitCopy(model).together}</p>
        <h2 className={cn(s.h, s.em)} {...fx("rise", 120)}>{content.heading || tr(model).invite}</h2>
        <Rule />
        {content.message ? <p className={s.lead} {...fx("rise", 300)}>{content.message}</p> : null}
      </div>
    </Sec>
  );
}

function TicketReveal({ model, note }: { model: InvitationModel; note?: string }) {
  const d = model.wedding.date;
  if (!d) return null;
  const t = tr(model);
  return (
    <>
      <p className={s.lead} {...fx("rise", 200)}>{note || t.pull}</p>
      <div {...fx("rise", 280)}>
        <Tickets
          tearLabel={t.tear}
          done={t.married}
          items={[
            { label: t.day, value: d.day },
            { label: t.month, value: d.month, small: true },
            { label: t.year, value: d.year },
          ]}
        />
      </div>
    </>
  );
}

const hasDate = (m: InvitationModel) => m.sections.some((x) => x.type === "date");

function DateBlock({ model, content }: SectionProps<"date">) {
  if (!model.wedding.date) return null;
  const t = tr(model);
  return (
    <Sec id="date" className={cn(s.sec, s.wide)}>
      <div className={s.inner}>
        <Head script={content.heading || t.date} sub={t.tearEach} />
        <TicketReveal model={model} note={content.note} />
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={cn(s.sec, !hasDate(model) && s.wide)}>
      <div className={s.inner}>
        {!hasDate(model) && model.wedding.date ? (
          <div className={s.ticketsFirst}>
            <Head script={tr(model).date} sub={tr(model).tearEach} />
            <TicketReveal model={model} />
          </div>
        ) : null}
        <Head script={content.heading || tr(model).countdown} sub={tr(model).rise} />
        <div className={s.marquee} {...fx("rise", 240)}>
          <img src={`${ART}/marquee.webp`} alt="" loading="lazy" />
          <span className={s.bulbs} aria-hidden>
            {BULBS.map(([x, y], i) => (
              <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-((i / BULBS.length) * 9.6) % 3.2}s` }} />
            ))}
          </span>
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
      <div className={s.inner}>
        <Head script={content.heading || kitCopy(model).ourStory} />
        <Rule />
        {content.body ? (
          <div className={s.lead} {...fx("rise", 280)}>
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
  const t = tr(model);
  return (
    <Sec id="schedule" className={s.sec}>
      <div className={s.inner}>
        <Head script={content.heading || t.programme} sub={t.tonight} />
        <ol className={s.prog} {...fx("prog", 240)}>
          {items.map((it, i) => (
            <li key={i} className={s.act} style={{ "--i": i } as React.CSSProperties}>
              <img src={`${ART}/ic-${iconFor(it.title, i)}.webp`} alt="" loading="lazy" />
              <span>
                <span className={cn(s.caps, s.no)}>{i === items.length - 1 && items.length > 2 ? t.encore : t.acts[i] ?? ""}</span>
                <b>{it.title}</b>
                {it.note ? <small>{it.note}</small> : null}
              </span>
              <time>{it.time}</time>
            </li>
          ))}
        </ol>
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
      <div className={s.inner}>
        {first ? <Head script={tr(model).venue} sub={tr(model).where} /> : null}
        {first ? <img className={s.villa} src={`${ART}/villa.webp`} alt="" loading="lazy" {...fx("rise", 240)} /> : null}
        <p className={cn(s.caps, s.wine, s.kind)} {...fx("rise")}>{id === "ceremony" ? t.ceremony : t.reception}</p>
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
      <div className={s.inner}>
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
      <div className={s.inner}>
        <Head script={content.heading || t.gallery} sub={content.caption || t.scenes} />
        <div {...fx("rise", 240)}>
          <OperaBox frame={`${ART}/oval.webp`} label={t.photo}>
            {list.map((p) => (
              <Pic key={p.id} asset={p} sizes="(min-width: 640px) 300px, 60vw" className={s.slideImg} />
            ))}
          </OperaBox>
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
      <div className={s.inner}>
        <Head script={content.heading || tr(model).know} />
        <div className={s.arch} {...fx("rise", 200)}>
          <img src={`${ART}/arch.webp`} alt="" loading="lazy" />
          <img className={s.costumes} src={`${ART}/costumes.webp`} alt="" loading="lazy" />
          <span className={s.spot} aria-hidden />
        </div>
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
  const t = tr(model);
  return (
    <Sec id="rsvp" className={s.sec}>
      <div className={s.inner}>
        <Head script={content.heading || t.seat} sub={content.deadline} />
        {content.message ? <p className={s.lead} {...fx("rise", 200)}>{content.message}</p> : null}
        <div className={s.seat} {...fx("rise", 280)}>
          <img src={`${ART}/torn.webp`} alt="" loading="lazy" />
          <div className={s.seatBody}>
            <span className={cn(s.caps, s.wine)}>{t.admit}</span>
            <span className={s.seatName}>{model.wedding.coupleName}</span>
          </div>
        </div>
        {content.linkUrl ? (
          <ReplyLink content={content} className={s.btn}>
            {content.linkLabel || t.reserve}
          </ReplyLink>
        ) : null}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.call}>
      <img className={s.swagTop} src={`${ART}/swag.webp`} alt="" loading="lazy" />
      <p className={s.script} {...fx("rise")}>{content.heading || tr(model).call}</p>
      {content.message ? <p className={s.lead} {...fx("rise", 120)}>{content.message}</p> : null}
      <p className={s.caps} {...fx("rise", 240)}>{content.signature || model.wedding.coupleName}</p>
      <div className={s.floor} {...fx("floor")}>
        {FLOOR.map((f, i) => (
          <img key={i} src={`${ART}/${f.src}.webp`} alt="" loading="lazy" style={{ ...(f.style as React.CSSProperties), ...({ "--i": i, "--fx": `${f.fx}px`, "--fr": `${f.fr}deg` } as React.CSSProperties) }} />
        ))}
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

export default function TheatreRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="theatre" className={s.root} after={model.mode === "export" ? null : <TheatreOpening model={model} />}>
      <TheatreReady model={model} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

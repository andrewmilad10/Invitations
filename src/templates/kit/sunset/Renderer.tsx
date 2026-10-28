/* eslint-disable @next/next/no-img-element -- watercolour paintings layered over the paper */
import type { ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { SunsetOpening } from "./opening";
import s from "./sunset.module.css";

/**
 * El Gouna Sunset — an Egyptian Red Sea wedding painted in warm gouache. Opens
 * on a cream envelope tied with silk that unties, opens and hands off to the
 * first screen: a sunset lagoon with bougainvillaea and a felucca, the names
 * written in the cream. Below, warm paper with a bougainvillaea-and-felucca
 * divider between sections: the story under a soft sky with a pressed sprig,
 * the day as a painted programme with lanterns and glasses, the celebration on
 * a deep-teal panel inside a gold frame with doves, a countdown, arched photos,
 * questions and the reply. It ends at night among lanterns on the water. Art in
 * public/templates/gouna-sunset.
 *
 * Colours: bg/surface = cream paper + reply card, fg = warm brown ink, muted =
 * soft brown, accent = sunset coral (kickers, buttons, links), accent-fg =
 * cream, border = sand hairlines. The teal panel and night blue belong to the
 * paintings.
 */

const ART = "/templates/gouna-sunset";

const T = {
  en: { together: "Together with their families", scroll: "The invitation", story: "Our story", day: "The day", celebration: "The celebration", dinner: "Ceremony & dinner", where: "Where", moments: "Moments", qa: "Good to know", love: "With love,", until: "Until we say yes" },
  ar: { together: "بمباركة عائلتيهما", scroll: "الدعوة", story: "حكايتنا", day: "يوم الفرح", celebration: "الاحتفال", dinner: "العقد والعشاء", where: "المكان", moments: "لحظات", qa: "معلومات تهمّكم", love: "مع حبنا،", until: "حتى اليوم الموعود" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

function Divider() {
  return <img src={`${ART}/divider.webp`} alt="" className={s.divider} width={360} height={55} loading="lazy" />;
}

function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <>
      {kicker ? <p className={s.kicker}>{kicker}</p> : null}
      <h2 className={s.h2}>{children}</h2>
    </>
  );
}

/** A section on paper: optional painted banner, content, then the divider. */
function Part({ id, banner, bannerRatio, children }: { id: string; banner?: string; bannerRatio?: [number, number]; children: ReactNode }) {
  return (
    <Sec id={id} className={s.sec}>
      {banner ? (
        <div className={s.banner}>
          <img src={`${ART}/${banner}.webp`} alt="" className={s.bannerImg} width={bannerRatio?.[0] ?? 1400} height={bannerRatio?.[1] ?? 945} loading="lazy" />
        </div>
      ) : null}
      <div className={s.inner} {...fx("rise")}>{children}</div>
      <Divider />
    </Sec>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = tr(model);
  const first = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.scene}>
        <img src={`${ART}/hero.webp`} alt="" className={s.heroArt} width={960} height={1706} fetchPriority="high" />
        <div className={s.heroText} {...fx("fade")}>
          <p className={s.eyebrow}>{content.eyebrow || t.together}</p>
          <h1 className={s.names}>
            <span>{wedding.partnerOne}</span>
            <span className={s.amp}>{model.locale === "ar" ? "و" : "&"}</span>
            <span>{wedding.partnerTwo}</span>
          </h1>
          {wedding.date ? <p className={s.date}>{wedding.date.long}</p> : null}
          {first?.venueName ? <p className={s.place}>{first.venueName}</p> : null}
        </div>
        <p className={s.hint} aria-hidden="true">{t.scroll}</p>
      </div>
    </header>
  );
}

function Couple({ content }: SectionProps<"couple">) {
  if (!content.message && !content.heading) return null;
  return (
    <Part id="couple">
      {content.heading ? <Title>{content.heading}</Title> : null}
      {content.message ? <p className={s.body}>{content.message}</p> : null}
    </Part>
  );
}

function DateBlock() { return null; }

/** The countdown on paper. */
function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Part id="countdown">
      <Title kicker={content.heading ? undefined : tr(model).until}>{content.heading || model.wedding.date?.long || tr(model).until}</Title>
      <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.unitLabel} />
    </Part>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const p = heroPhoto(model);
  return (
    <Part id="story" banner="sky" bannerRatio={[1400, 945]}>
      <Title kicker={content.heading ? undefined : ""}>{content.heading || tr(model).story}</Title>
      {p ? <Pic asset={p} sizes="(min-width: 600px) 220px, 60vw" className={`${s.arch} ${s.storyArch}`} /> : null}
      {content.body ? <div className={s.body}><Paragraphs text={content.body} /></div> : null}
      {content.quote ? (
        <p className={s.quote}>{content.quote}{content.quoteSource ? <span className={s.small}> — {content.quoteSource}</span> : null}</p>
      ) : null}
      <img src={`${ART}/sprig.webp`} alt="" className={s.sprig} width={92} height={125} loading="lazy" />
      <p className={s.sign}>{model.wedding.coupleName}</p>
    </Part>
  );
}

const ICONS: [RegExp, string][] = [
  [/welcome|arriv|reception desk|drinks|توصيل|استقبال|وصول|مشروبات/i, "icon-drinks"],
  [/ceremon|vow|ring|nikah|katb|i ?do|عقد|قران|زفاف|مراسم|إكليل/i, "icon-ceremony"],
  [/cocktail|canap|hour|mingle|كوكتيل/i, "icon-cocktail"],
  [/dinner|lunch|meal|feast|dine|cake|عشاء|غداء|وليمة|طعام/i, "icon-dinner"],
  [/danc|party|after|night|send.?off|celebrat|سهرة|رقص|حفل|وداع/i, "icon-dancing"],
];
const ORDER = ["icon-drinks", "icon-ceremony", "icon-cocktail", "icon-dinner", "icon-dancing"];
const iconFor = (title: string, i: number) => ICONS.find(([re]) => re.test(title))?.[1] ?? ORDER[i % ORDER.length];

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Part id="schedule" banner="resort" bannerRatio={[1400, 945]}>
      <img src={`${ART}/sun.webp`} alt="" className={s.sun} width={58} height={40} loading="lazy" />
      <Title>{content.heading || tr(model).day}</Title>
      <ol className={s.program}>
        {items.map((it, i) => (
          <li key={i} className={s.item} {...fx("rise", i * 60)}>
            <img src={`${ART}/${iconFor(it.title + " " + it.note, i)}.webp`} alt="" className={s.itemIcon} width={66} height={66} loading="lazy" />
            {it.time ? <span className={s.itemTime}>{it.time}</span> : null}
            <span className={s.itemTitle}>{it.title}</span>
            {it.note && it.note !== it.title ? <span className={s.itemNote}>{it.note}</span> : null}
          </li>
        ))}
      </ol>
    </Part>
  );
}

const has = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);
const headingOf = (m: InvitationModel, type: "ceremony" | "reception") => {
  const sec = m.sections.find((x) => x.type === type);
  return sec ? (sec.content as { heading?: string }).heading ?? "" : "";
};

/** Ceremony and party share the deep-teal celebration panel. */
function Celebration({ model, id }: { model: InvitationModel; id: "ceremony" | "reception" }) {
  const t = tr(model);
  const copy = kitCopy(model);
  if (id === "reception" && has(model, "ceremony")) return null;
  const ids: ("ceremony" | "reception")[] = id === "ceremony" && has(model, "reception") ? ["ceremony", "reception"] : [id];
  const shown = ids
    .map((k) => [k, model.events[k], headingOf(model, k) || (k === "ceremony" ? copy.ceremony : copy.reception)] as const)
    .filter((x): x is readonly ["ceremony" | "reception", EventModel, string] => Boolean(x[1]));
  if (!shown.length) return null;
  const main = shown[0][1];
  return (
    <>
      <Sec id={id} className={s.cel}>
        <img src={`${ART}/courtyard.webp`} alt="" className={s.celBanner} width={1400} height={945} loading="lazy" />
        <div className={s.celBody} {...fx("rise")}>
          <p className={s.celKicker}>{t.dinner}</p>
          <h2 className={s.celTitle}>{t.celebration}</h2>
          <div className={s.framed}>
            <div className={s.framedInner}>
              {shown.map(([, e, label]) => (
                <div key={e.id} className={s.celEvent}>
                  <p className={s.framedName}>{e.venueName ?? label}</p>
                  {e.timeLabel ? <p className={s.framedLine}>{e.timeLabel}</p> : null}
                  <p className={s.framedLine}>{eventDate(model, e)}</p>
                </div>
              ))}
            </div>
          </div>
          {main.address ? <p className={s.celNote}>{main.address}</p> : null}
          <Directions model={model} event={main} className={s.celLink} />
        </div>
      </Sec>
      <Divider />
    </>
  );
}

/** Other places, with directions. */
function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Part id="venue">
      <Title>{content.heading || tr(model).where}</Title>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
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

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Part id="gallery" banner="arch" bannerRatio={[960, 1706]}>
      <Title>{content.heading || tr(model).moments}</Title>
      {content.caption ? <p className={s.small}>{content.caption}</p> : null}
      <div className={s.grid}>
        {list.map((p) => <Pic key={p.id} asset={p} sizes="(min-width: 600px) 240px, 44vw" className={s.arch} />)}
      </div>
    </Part>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Part id="faq">
      <Title>{content.heading || tr(model).qa}</Title>
      <div className={s.faq}>
        {items.map((it, i) => (
          <details key={i}><summary>{it.question}</summary><p>{it.answer}</p></details>
        ))}
      </div>
    </Part>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Part id="rsvp">
      <div className={s.card}>
        <Title>{content.heading || kitCopy(model).rsvp}</Title>
        {content.deadline ? <p className={s.small}>{content.deadline}</p> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <ReplyLink content={content} className={s.button} />
      </div>
    </Part>
  );
}

/** Night on the lagoon: floating lanterns and the last words. */
function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <img src={`${ART}/night.webp`} alt="" className={s.nightArt} width={960} height={1706} loading="lazy" />
      <div className={s.nightText} {...fx("fade")}>
        <p className={s.love}>{content.heading || tr(model).love}</p>
        <p className={s.nightSign}>{content.signature || model.wedding.coupleName}</p>
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
  ceremony: (p) => <Celebration model={p.model} id="ceremony" />,
  reception: (p) => <Celebration model={p.model} id="reception" />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function SunsetRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="sunset" className={s.root} after={model.mode === "export" ? null : <SunsetOpening model={model} />}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

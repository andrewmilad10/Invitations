/* eslint-disable @next/next/no-img-element -- transparent henna line art layered on paper */
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { Curtains, FrameShow, Motifs, Trays } from "./live";
import { HennaOpening, HennaReady } from "./opening";
import s from "./henna.module.css";

/**
 * Henna Tent — an Egyptian henna night (ليلة الحنة). Red velvet curtains
 * stitched with gold henna patterns part on a tap and stay gathered at the
 * sides of the stage around the couple's names. Below, on cream paper with
 * faint henna paisleys: the date hidden under dried henna on three brass trays
 * (guests rub it away), a countdown in henna rings, the story beside a felucca
 * on the Nile, the venue under a rooftop of lanterns, the night's programme
 * inside a henna arch, the outfits on their hangers, photos in a mashrabiya
 * frame, a hennaed hand to reply and an arched card to close. Henna line art in
 * public/templates/henna-tent.
 *
 * Colours: bg = warm cream paper, surface = lighter cream cards, fg = deep
 * henna-brown ink, muted = soft brown, accent = velvet red (titles, buttons),
 * accent-fg = cream, border = paper seams.
 */

const ART = "/templates/henna-tent";
const T = {
  en: { kicker: "With love and joy, we invite you to a henna night", reveal: "Reveal the date", drying: "The henna is still drying on the trays…", rubHint: "Rub the henna away with your finger", rubLabel: "Rub the henna away", awaits: "The henna night awaits you!", countdown: "Counting down", story: "Our story", venue: "The venue", night: "The night", know: "Good to know", gallery: "Our moments", photo: "Photo", join: "Will you come?", send: "Reply here", thanks: "Thank you", gift: "Having you with us is the best gift." },
  ar: { kicker: "بكل الحب والفرحة ندعوكم لحضور ليلة حنة", reveal: "اكشفوا الموعد", drying: "الحنة لسه ناشفة على الصواني…", rubHint: "امسحوا الحنة بصباعكم", rubLabel: "امسحوا الحنة", awaits: "ليلة الحنة في انتظاركم!", countdown: "باقي على الليلة", story: "حكايتنا", venue: "مكان السهرة", night: "برنامج الليلة", know: "معلومات تهمكم", gallery: "لحظاتنا", photo: "صورة", join: "أكدوا حضوركم", send: "ردّوا من هنا", thanks: "شكراً لمحبتكم", gift: "وجودكم معانا أحلى هدية" },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

const ICONS = ["lantern", "drum", "henna", "dinner", "darbuka", "moon"];
const KEYWORDS: [RegExp, string][] = [
  [/zaff|procession|drum|entrance|زفة|زفه|دخلة/i, "drum"],
  [/henna|حنة|حنه|نقش/i, "henna"],
  [/dinner|lunch|meal|feast|cake|عشاء|غداء|عزومة|تورتة/i, "dinner"],
  [/danc|party|music|dj|song|رقص|حفل|أغاني|اغاني|سهرة/i, "darbuka"],
  [/goodnight|farewell|end|send.?off|وداع|تصبحوا|ختام/i, "moon"],
  [/arriv|welcome|guest|reception|استقبال|وصول/i, "lantern"],
];
const iconFor = (title: string, i: number) => KEYWORDS.find(([re]) => re.test(title))?.[1] ?? ICONS[i % ICONS.length];

function Head({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <h2 className={s.h} {...fx("rise")}>{title}</h2>
      {sub ? <p className={s.sub} {...fx("rise", 120)}>{sub}</p> : null}
    </>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const where = content.tagline || place?.venueName || "";
  return (
    <header id="hero" data-section="hero" className={s.stage}>
      <div className={s.hero}>
        <p className={s.kicker} style={{ "--i": 0 } as React.CSSProperties}>{content.eyebrow || tr(model).kicker}</p>
        <h1 className={s.names} style={{ "--i": 1 } as React.CSSProperties}>
          <span>{wedding.partnerOne}</span>
          <i>&amp;</i>
          <span>{wedding.partnerTwo}</span>
        </h1>
        <img className={s.heroDivider} style={{ "--i": 2 } as React.CSSProperties} src={`${ART}/divider.webp`} alt="" />
        {wedding.date?.long ? <p className={s.date} style={{ "--i": 3 } as React.CSSProperties}>{wedding.date.long}</p> : null}
        {where ? <p className={s.place} style={{ "--i": 4 } as React.CSSProperties}>{where}</p> : null}
        <span className={s.cue} style={{ "--i": 5 } as React.CSSProperties} aria-hidden />
      </div>
      <Curtains mode="open" />
      <img className={s.valance} src={`${ART}/valance.webp`} alt="" />
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <Head title={content.heading || kitCopy(model).with} sub={content.eyebrow} />
      <img className={s.divider} src={`${ART}/divider.webp`} alt="" loading="lazy" {...fx("wipe", 200)} />
      {content.message ? <p className={s.lead} {...fx("rise", 280)}>{content.message}</p> : null}
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <Head title={content.heading || d.long} sub={d.weekday} />
      {content.note ? <p className={s.lead}>{content.note}</p> : null}
    </Sec>
  );
}

/** The date hidden under dried henna on three brass trays, then the countdown below it. */
function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  const d = model.wedding.date;
  if (!model.countdownTarget && !d) return null;
  const t = tr(model);
  const rub = model.mode !== "export";
  return (
    <Sec id="countdown" className={s.sec}>
      {d ? (
        <>
          <Head title={t.reveal} sub={rub ? t.drying : d.long} />
          <div {...fx("rise", 240)}>
            <Trays values={[d.day, d.month, d.year]} label={t.rubLabel} rub={rub} after={<p className={s.awaits}>{t.awaits}</p>} />
          </div>
          {rub ? <p className={s.rubHint}>{t.rubHint}</p> : null}
        </>
      ) : null}
      {model.countdownTarget ? (
        <div className={s.countWrap}>
          <Head title={content.heading || t.countdown} />
          <img className={s.divider} src={`${ART}/divider.webp`} alt="" loading="lazy" {...fx("wipe", 150)} />
          <div {...fx("rise", 240)}>
            <Clock model={model} className={s.count} unit={s.unit} value={s.value} label={s.label} />
          </div>
        </div>
      ) : null}
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photo = heroPhoto(model) ?? photos(model, 1)[0];
  if (!photo && !content.body && !content.heading) return null;
  return (
    <Sec id="story" className={s.sec}>
      <div className={s.story}>
        <img className={cn(s.draw, s.nile)} src={`${ART}/nile.webp`} alt="" loading="lazy" {...fx("draw")} />
        <div>
          <Head title={content.heading || tr(model).story} />
          {content.body ? (
            <div className={s.lead} {...fx("rise", 200)}>
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
      <Head title={content.heading || tr(model).night} />
      <div className={s.arch} {...fx("rise", 200)}>
        <img src={`${ART}/arch.webp`} alt="" loading="lazy" />
        <ol className={s.prog} style={{ "--n": items.length } as React.CSSProperties}>
          {items.map((it, i) => (
            <li key={i} style={{ "--i": i } as React.CSSProperties}>
              <img src={`${ART}/ic-${iconFor(it.title, i)}.webp`} alt="" loading="lazy" />
              <span>
                <b>{it.title}</b>
                <time>{it.time}</time>
                {it.note ? <small>{it.note}</small> : null}
              </span>
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
    <Sec id={id} className={cn(s.sec, !first && s.secTight)}>
      {first ? <Head title={tr(model).venue} /> : null}
      {first ? <img className={s.draw} src={`${ART}/rooftop.webp`} alt="" loading="lazy" {...fx("draw")} /> : null}
      <div className={s.card} {...fx("rise", 200)}>
        <p className={s.kind}>{id === "ceremony" ? t.ceremony : t.reception}</p>
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
      {content.heading ? <p className={s.sub}>{content.heading}</p> : null}
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
      <Head title={content.heading || t.gallery} sub={content.caption} />
      <div {...fx("rise", 200)}>
        <FrameShow label={t.photo}>
          {list.map((p) => (
            <Pic key={p.id} asset={p} sizes="(min-width: 640px) 220px, 46vw" className={s.slideImg} />
          ))}
        </FrameShow>
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <Head title={content.heading || tr(model).know} />
      <img className={s.outfits} src={`${ART}/outfits.webp`} alt="" loading="lazy" {...fx("rise", 200)} />
      <div className={cn(s.card, s.faq)} {...fx("rise", 280)}>
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
      <Head title={content.heading || tr(model).join} sub={content.deadline} />
      <div className={s.card} {...fx("rise", 200)}>
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        {content.linkUrl ? (
          <ReplyLink content={content} className={s.press}>
            <span className={s.hand} aria-hidden />
            <span className={s.pressLabel}>{content.linkLabel || tr(model).send}</span>
          </ReplyLink>
        ) : (
          <span className={s.press} aria-hidden>
            <span className={s.hand} />
          </span>
        )}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  const t = tr(model);
  return (
    <Sec id="closing" className={s.sec}>
      <div className={s.archCard} {...fx("rise")}>
        <p className={s.h}>{content.heading || t.thanks}</p>
        <p className={s.lead}>{content.message || t.gift}</p>
        <img className={s.cardDivider} src={`${ART}/divider.webp`} alt="" loading="lazy" />
        <p className={s.both}>{content.signature || model.wedding.coupleName}</p>
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

export default function HennaRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="henna" className={s.root} after={model.mode === "export" ? null : <HennaOpening model={model} />}>
      <HennaReady model={model} />
      <Motifs count={14} className={s.watermark} />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

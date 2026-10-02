import type { SectionType } from "@/core/sections/registry";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, pad2, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import s from "./glossy.module.css";

/**
 * 7 · Luxury Magazine — the wedding as a glossy issue. A full-bleed cover
 * with the couple's initials as the masthead, cover lines and a barcode; a
 * contents page that links to every section; a feature in columns with a
 * pull quote; "by the numbers" for the countdown; a running order; a
 * portfolio spread and a tear-out reply card. Motion: page-turn wipes and a
 * slow push-in on the cover.
 *
 * Colours: bg = page white, surface = a tinted page, fg = ink, muted = grey
 * captions, accent = the issue's signature colour (cover lines, numbers),
 * accent-fg = text on it.
 */

const COPY = {
  en: {
    issue: "The wedding issue", inside: "Inside", contents: "Contents", letter: "A letter from the couple", numbers: "By the numbers",
    feature: "The feature", agenda: "The agenda", where: "Where", when: "When", running: "Running order", portfolio: "Portfolio",
    cut: "Cut out and keep", ask: "Ask the couple", photo: "Photograph", page: "p.", last: "The last word", getting: "Getting there",
    labels: {
      couple: "Letter", date: "The date", countdown: "By the numbers", story: "The feature", ceremony: "The ceremony", reception: "The party",
      venue: "Getting there", schedule: "Running order", gallery: "Portfolio", rsvp: "Reply card", faq: "Ask the couple", closing: "The last word",
    } as Partial<Record<SectionType, string>>,
  },
  ar: {
    issue: "عدد الزفاف", inside: "في هذا العدد", contents: "المحتويات", letter: "رسالة من العروسين", numbers: "بالأرقام",
    feature: "القصة", agenda: "الموعد", where: "أين", when: "متى", running: "برنامج اليوم", portfolio: "صور",
    cut: "احتفظ بهذه البطاقة", ask: "أسئلة للعروسين", photo: "صورة", page: "ص.", last: "الكلمة الأخيرة", getting: "الطريق إلينا",
    labels: {
      couple: "رسالة", date: "التاريخ", countdown: "بالأرقام", story: "القصة", ceremony: "عقد القران", reception: "الحفل",
      venue: "الطريق إلينا", schedule: "برنامج اليوم", gallery: "صور", rsvp: "بطاقة الرد", faq: "أسئلة", closing: "الكلمة الأخيرة",
    } as Partial<Record<SectionType, string>>,
  },
};
const copy = (m: InvitationModel) => (m.locale === "ar" ? COPY.ar : COPY.en);

/** Each section's "page" in the issue, from the order the couple chose. */
const pageOf = (model: InvitationModel, id: SectionType) => pad2(Math.max(1, model.sections.findIndex((x) => x.type === id)) * 2 + 2);

function Masthead({ model, className }: { model: InvitationModel; className?: string }) {
  const { partnerOne, partnerTwo } = model.wedding;
  return (
    <p className={cn(s.masthead, className)} aria-label={model.wedding.coupleName}>
      <span>{partnerOne.trim().charAt(0)}</span>
      <i>{model.locale === "ar" ? "و" : "&"}</i>
      <span>{partnerTwo.trim().charAt(0)}</span>
    </p>
  );
}

function Barcode({ label }: { label?: string }) {
  return (
    <div className={s.barcode} aria-hidden>
      <span className={s.bars} />
      <span>{label}</span>
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const c = copy(model);
  const inside = (["ceremony", "reception", "gallery", "rsvp"] as SectionType[]).filter((t) => model.sections.some((x) => x.type === t));
  return (
    <header id="hero" data-section="hero" className={s.cover}>
      <Pic asset={heroPhoto(model)} sizes="100vw" priority className={s.coverPhoto} />
      <span className={s.coverShade} aria-hidden />
      <div className={s.coverTop}>
        <p className={s.issueLine} {...fx("fade")}>
          <span>{c.issue}</span>
          <span>{wedding.date?.short}</span>
        </p>
        <Masthead model={model} />
      </div>
      <div className={s.coverBottom}>
        <div className={s.coverStory}>
          <p className={s.coverKicker} {...fx("wipe", 300)}>{content.eyebrow || kitCopy(model).together}</p>
          <h1 className={s.coverNames} {...fx("rise", 450)}>
            {wedding.partnerOne} <i>{model.locale === "ar" ? "و" : "&"}</i> {wedding.partnerTwo}
          </h1>
          <p className={s.coverDek} {...fx("rise", 600)}>{content.tagline || wedding.date?.long}</p>
        </div>
        <ul className={s.coverLines} data-k-stagger="" {...fx("rise", 700)}>
          <li><b>{c.inside}</b></li>
          {inside.map((t) => (
            <li key={t}>
              {c.labels[t]} <span>{c.page}{pageOf(model, t)}</span>
            </li>
          ))}
        </ul>
        <Barcode label={wedding.date?.short} />
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  const c = copy(model);
  const listed = model.sections.filter((x) => c.labels[x.type]);
  const [face] = photos(model, 2).slice(-1);
  return (
    <Sec id="couple" className={s.spread}>
      <nav className={s.contents} aria-label={c.contents}>
        <p className={s.label}>{c.contents}</p>
        <ol data-k-stagger="" {...fx("rise")}>
          {listed.map((x) => (
            <li key={x.type}>
              <a href={`#${x.type}`}>
                <span className={s.pageNo}>{pageOf(model, x.type)}</span>
                {c.labels[x.type]}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <article className={s.letter}>
        <p className={s.label} {...fx("wipe")}>{content.eyebrow || c.letter}</p>
        {content.heading ? <h2 className={s.h2} {...fx("rise")}>{content.heading}</h2> : null}
        {content.message ? <p className={s.dropcap} {...fx("rise", 120)}>{content.message}</p> : null}
        <div className={s.byline} {...fx("rise", 200)}>
          {face ? <Pic asset={face} sizes="80px" className={s.avatar} /> : null}
          <p>{model.wedding.coupleName}</p>
        </div>
      </article>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.dateSpread}>
      <p className={s.dateDay} {...fx("mask-up")}>{d.day}</p>
      <div className={s.dateSide} {...fx("wipe", 200)}>
        <p className={s.label}>{content.heading || copy(model).labels.date}</p>
        <p className={s.dateMonth}>{d.month} {d.year}</p>
        <p className={s.dateWeek}>{d.weekday}</p>
        {content.note ? <p className={s.caption}>{content.note}</p> : null}
      </div>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.sec}>
      <div className={s.thickRule} {...fx("line")} />
      <p className={s.label}>{copy(model).numbers}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("rise", 150)}>
        <Clock model={model} className={s.stats} unit={s.stat} value={s.statValue} label={s.statLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const c = copy(model);
  const [p] = photos(model, 1);
  return (
    <Sec id="story" className={s.feature}>
      <p className={s.label} {...fx("wipe")}>{c.feature} · {c.page}{pageOf(model, "story")}</p>
      <h2 className={s.headline} {...fx("rise")}>{content.heading || kitCopy(model).ourStory}</h2>
      {p ? (
        <figure className={s.featureFig}>
          <Pic asset={p} sizes="100vw" className={s.featurePhoto} {...fx("wipe")} />
          <figcaption className={s.caption}>{c.photo}: {p.alt || model.wedding.coupleName}</figcaption>
        </figure>
      ) : null}
      <div className={s.columns} {...fx("rise")}>
        {content.body ? <Paragraphs text={content.body} /> : null}
      </div>
      {content.quote ? (
        <blockquote className={s.pull} {...fx("rise")}>
          “{content.quote}”
          {content.quoteSource ? <cite>— {content.quoteSource}</cite> : null}
        </blockquote>
      ) : null}
    </Sec>
  );
}

function Agenda({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const c = copy(model);
  return (
    <Sec id={id} className={cn(s.agendaSec, id === "reception" && s.agendaRight)}>
      <article className={s.agenda} {...fx("wipe")}>
        <header className={s.agendaBar}>
          <span>{e.title || c.labels[id]}</span>
          <span>{c.page}{pageOf(model, id)}</span>
        </header>
        <div className={s.agendaBody}>
          <h2 className={s.h3}>{content.heading || e.title}</h2>
          {e.timeLabel ? <p className={s.agendaTime}>{e.timeLabel}</p> : null}
          <dl className={s.agendaFacts}>
            <div>
              <dt className={s.label}>{c.where}</dt>
              <dd>{e.venueName}{e.address ? <span className={s.caption}>{e.address}</span> : null}</dd>
            </div>
            <div>
              <dt className={s.label}>{c.when}</dt>
              <dd>{eventDate(model, e)}</dd>
            </div>
          </dl>
          {content.note ? <p className={s.caption}>{content.note}</p> : null}
          <Directions model={model} event={e} className={s.textLink} />
        </div>
      </article>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <div className={s.thickRule} {...fx("line")} />
      <p className={s.label}>{copy(model).getting}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={s.caption}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e, i) => (
          <figure key={e.id} {...fx("wipe")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption>
              <span className={s.num}>{i + 1}</span>
              <span>
                <b>{e.venueName ?? e.title}</b>
                {e.address ? <span className={s.caption}>{e.address}</span> : null}
              </span>
            </figcaption>
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
      <div className={s.thickRule} {...fx("line")} />
      <p className={s.label}>{copy(model).running}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).schedule}</h2>
      <ol className={s.running} data-k-stagger="" {...fx("rise")}>
        {items.map((it, i) => (
          <li key={i}>
            <time>{it.time}</time>
            <p>{it.title}</p>
            {it.note ? <span className={s.caption}>{it.note}</span> : <span />}
          </li>
        ))}
      </ol>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 7);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.portfolioSec}>
      <p className={s.label}>{copy(model).portfolio} · {copy(model).page}{pageOf(model, "gallery")}</p>
      <h2 className={s.headline} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={s.caption}>{content.caption}</p> : null}
      <div className={s.portfolio}>
        {list.map((p, i) => (
          <figure key={p.id} className={s.folio} {...fx("wipe")}>
            <Pic asset={p} sizes="(min-width: 900px) 50vw, 100vw" className={s.folioPhoto} />
            <figcaption><span className={s.num}>{i + 1}</span> {p.alt}</figcaption>
          </figure>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.rsvpSec}>
      <div className={s.tearOut} {...fx("rise")}>
        <span className={s.scissors} aria-hidden>✂</span>
        <p className={s.label}>{copy(model).cut}</p>
        <h2 className={s.rsvpTitle}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={s.deadline}>{content.deadline}</p> : null}
        {content.message ? <p>{content.message}</p> : null}
        <ReplyLink content={content} className={s.button} />
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <div className={s.thickRule} {...fx("line")} />
      <p className={s.label}>{copy(model).ask}</p>
      <h2 className={s.h2} {...fx("rise")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.interview}>
        {items.map((it, i) => (
          <div key={i} {...fx("rise")}>
            <p className={s.q}>{it.question}</p>
            <p className={s.a}>{it.answer}</p>
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  const list = photos(model);
  return (
    <Sec id="closing" className={s.back}>
      <Pic asset={list[list.length - 1] ?? heroPhoto(model)} sizes="100vw" className={s.backPhoto} {...fx("zoom")} />
      <span className={s.coverShade} aria-hidden />
      <div className={s.backText}>
        <p className={s.coverKicker}>{copy(model).last}</p>
        <p className={s.backTitle} {...fx("rise")}>{content.heading}</p>
        {content.message ? <p {...fx("rise", 120)}>{content.message}</p> : null}
        {content.signature ? <p className={s.coverKicker}>{content.signature}</p> : null}
      </div>
    </Sec>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={s.footer}>
      <Masthead model={model} className={s.footMast} />
      <p className={s.caption}>{[copy(model).issue, model.wedding.date?.long, content.note].filter(Boolean).join(" · ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Agenda id="ceremony" model={p.model} content={p.content} />,
  reception: (p) => <Agenda id="reception" model={p.model} content={p.content} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function GlossyRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="glossy" className={s.root}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

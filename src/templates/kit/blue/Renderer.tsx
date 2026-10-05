import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { BlueOpening } from "./opening";
import { Scratch } from "./scratch";
import s from "./blue.module.css";

/**
 * Something Blue — a soft floral site in powder blue, lilac and blush. The
 * flowers are paper craft (hydrangeas, roses, blossoms, eucalyptus, pearls)
 * rendered in 3D and lit, in public/templates/something-blue. A white
 * envelope with paper flowers pressed into it and a powder-blue wax seal
 * opens with falling petals; the names sit in a blooming wreath; scalloped
 * cards hold corner posies; a pearl scratch card reveals the couple's photo
 * (or the date); arched cards for the events, pearls for the timeline and a
 * posy to close. Textures only on paper (envelope, cards, flowers).
 *
 * Colours: bg = page, surface = card, fg = navy ink, muted = soft ink,
 * accent = powder blue (buttons, "&"), accent-fg = white, border = pale blue lines.
 */

function Filters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <filter id="sb-wax" x="-10%" y="-10%" width="120%" height="120%">
        <feOffset in="SourceAlpha" dx="1.1" dy="1.3" result="o" />
        <feGaussianBlur in="o" stdDeviation=".8" result="ob" />
        <feComposite in="SourceAlpha" in2="ob" operator="out" result="rim" />
        <feFlood floodColor="black" floodOpacity=".55" />
        <feComposite in2="rim" operator="in" result="shade" />
        <feOffset in="SourceAlpha" dx="-.8" dy="-1" result="o2" />
        <feGaussianBlur in="o2" stdDeviation=".6" result="o2b" />
        <feComposite in="SourceAlpha" in2="o2b" operator="out" result="lit" />
        <feFlood floodColor="white" floodOpacity=".85" />
        <feComposite in2="lit" operator="in" result="light" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="shade" />
          <feMergeNode in="light" />
        </feMerge>
      </filter>
    </svg>
  );
}

/** A scalloped card with paper posies tucked into two corners. */
function Card({ children, posies = true, seal, model, className }: { children: ReactNode; posies?: boolean; seal?: boolean; model?: InvitationModel; className?: string }) {
  const [a, b] = model?.wedding.initials ?? ["", ""];
  return (
    <div className={cn(s.cardWrap, className)} {...fx("rise")}>
      {posies ? <span className={s.posyTL} aria-hidden /> : null}
      {seal ? (
        <span className={s.seal} aria-hidden>
          <span className={s.ring} />
          <span className={s.mono}>
            {a}&amp;{b}
          </span>
        </span>
      ) : null}
      <div className={cn(s.scallop, seal && s.sealed)}>{children}</div>
      {posies ? <span className={s.posyBR} aria-hidden /> : null}
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.wreath} role="img" aria-label="A wreath of paper hydrangeas, roses and eucalyptus">
        <span className={cn(s.layer, s.green)} />
        <span className={cn(s.layer, s.bloom)} />
        <div className={s.namesBox}>
          <p className={s.caps}>{content.eyebrow || kitCopy(model).together}</p>
          <h1 className={s.names}>
            <span>{wedding.partnerOne}</span>
            <span className={s.amp}>{model.locale === "ar" ? "و" : "&"}</span>
            <span>{wedding.partnerTwo}</span>
          </h1>
          {wedding.date ? <p className={s.date}>{wedding.date.short}</p> : null}
          {content.tagline || place?.venueName ? <p className={s.place}>{content.tagline || place?.venueName}</p> : null}
        </div>
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <div {...fx("rise")}>
        <span className={s.spray} aria-hidden />
        <p className={s.caps}>{content.eyebrow || kitCopy(model).with}</p>
        {content.heading ? <h2 className={s.script}>{content.heading}</h2> : null}
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
      </div>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <Card posies={false}>
        <p className={s.caps}>{d.weekday}</p>
        <h2 className={s.script}>{content.heading || d.long}</h2>
        {content.note ? <p className={s.lead}>{content.note}</p> : null}
      </Card>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.sec}>
      <Card>
        <h2 className={s.script}>{content.heading || kitCopy(model).countdown}</h2>
        {model.wedding.date ? <p className={s.caps}>{model.wedding.date.long}</p> : null}
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.label} />
      </Card>
    </Sec>
  );
}

/** The story opens with a surprise: a pearl scratch card over the couple's photo (or the date). */
function Story({ model, content }: SectionProps<"story">) {
  const photo = photos(model, 1)[0] ?? heroPhoto(model);
  const ar = model.locale === "ar";
  const d = model.wedding.date;
  return (
    <Sec id="story" className={s.sec}>
      <div {...fx("rise")}>
        <h2 className={s.script}>{ar ? "مفاجأة صغيرة" : "A little surprise"}</h2>
        <p className={s.caps}>{ar ? "امسحوا اللؤلؤ لتكتشفوا" : "Scratch the pearl to reveal"}</p>
        <Scratch
          off={model.mode === "export"}
          label={ar ? "امسحوا هنا" : "Scratch to reveal"}
          hint={ar ? "استخدموا إصبعكم للمسح" : "Use your finger to scratch"}
          doneHint={ar ? "لا نطيق الانتظار لرؤيتكم" : "We can't wait to see you there"}
        >
          {photo ? (
            <Pic asset={photo} sizes="(min-width: 640px) 320px, 70vw" className={s.ovalPhoto} />
          ) : (
            <>
              <p className={s.caps}>{ar ? "احفظوا التاريخ" : "Save the date"}</p>
              <p className={s.big}>{d?.short ?? model.wedding.coupleName}</p>
              {d ? <p className={s.caps}>{d.weekday}</p> : null}
            </>
          )}
        </Scratch>
      </div>
      {content.heading || content.body ? (
        <div {...fx("rise")} style={{ marginTop: "3rem" }}>
          <span className={s.spray} aria-hidden />
          <h2 className={s.script}>{content.heading || kitCopy(model).ourStory}</h2>
          {content.body ? (
            <div className={s.prose}>
              <Paragraphs text={content.body} />
            </div>
          ) : null}
          {content.quote ? <p className={s.lead}>“{content.quote}”{content.quoteSource ? ` · ${content.quoteSource}` : ""}</p> : null}
        </div>
      ) : null}
    </Sec>
  );
}

function Event({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  return (
    <Sec id={id} className={s.sec}>
      <article className={s.arch} {...fx("rise")}>
        <span className={s.spray} aria-hidden />
        <p className={s.caps}>{id === "ceremony" ? t.ceremony : t.reception}</p>
        <h2 className={s.script}>{content.heading || e.title || (id === "ceremony" ? t.ceremony : t.reception)}</h2>
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p className={s.when}>{e.address}</p> : null}
        <p className={s.when}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
        {content.note ? <p className={s.note}>{content.note}</p> : null}
        <Directions model={model} event={e} className={cn(s.pill, s.ghost)} />
      </article>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <Card posies={false}>
        <h2 className={s.script}>{content.heading || kitCopy(model).venue}</h2>
        {content.note ? <p className={s.lead}>{content.note}</p> : null}
        <div className={s.maps}>
          {mapped.map((e) => (
            <figure key={e.id} className={s.mapFig}>
              <KitMap model={model} event={e} className={s.map} />
              <figcaption>{e.venueName ?? e.title}</figcaption>
            </figure>
          ))}
        </div>
      </Card>
    </Sec>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.sec}>
      <div {...fx("rise")}>
        <h2 className={s.script}>{content.heading || kitCopy(model).schedule}</h2>
        <ol className={s.day}>
          {items.map((it, i) => (
            <li key={i}>
              <time>{it.time}</time>
              <span className={s.pearl} aria-hidden />
              <span>{it.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.sec}>
      <h2 className={s.script} {...fx("rise")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={s.caps}>{content.caption}</p> : null}
      <div className={s.gallery}>
        {list.map((p, i) => (
          <div key={p.id} {...fx("rise", (i % 2) * 120)}>
            <Pic asset={p} sizes="(min-width: 640px) 250px, 44vw" className={s.galleryPhoto} />
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <div style={{ paddingTop: "2.6rem" }}>
        <Card posies={false} seal model={model}>
          {content.deadline ? <p className={s.caps}>{content.deadline}</p> : null}
          <h2 className={s.script}>{content.heading || kitCopy(model).rsvp}</h2>
          {content.message ? <p className={s.lead}>{content.message}</p> : null}
          <ReplyLink content={content} className={s.pill} />
        </Card>
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <Card posies={false}>
        <h2 className={s.script}>{content.heading || kitCopy(model).faq}</h2>
        <div className={s.faq}>
          {items.map((it, i) => (
            <details key={i} className={s.qa}>
              <summary>{it.question}</summary>
              <p>{it.answer}</p>
            </details>
          ))}
        </div>
      </Card>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.sec}>
      <div {...fx("rise")}>
        <span className={s.posy} role="img" aria-label="A posy of paper hydrangeas and roses" />
        {content.heading ? <p className={s.caps}>{content.heading}</p> : null}
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        <p className={s.script}>{content.signature || model.wedding.coupleName}</p>
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

export default function BlueRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="blue" className={s.root} after={model.mode === "export" ? null : <BlueOpening model={model} />}>
      <Filters />
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

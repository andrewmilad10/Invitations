import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { SwanOpening } from "./opening";
import s from "./swan.module.css";

/**
 * Swan Lake — photo-real hand embroidery on blue-grey linen. A wax-sealed
 * linen envelope opens into an arch of feathers and water lilies under a
 * stitched moon with two swans on the lake; pearl-ringed countdown, the
 * couple's photo in a pearl frame, an embroidered château for the venue, the
 * day inside a feather wreath and a swan wreath to close. Motion: soft
 * focus-ins and a slow moonlight glow.
 *
 * The artwork (public/templates/swan-lake) is fixed blue-grey linen, so the
 * template has one palette made to match it: bg = linen, surface = ivory
 * card, fg = navy ink, muted = soft ink, accent = navy, accent-fg = ivory.
 */

const amp = (m: InvitationModel) => (m.locale === "ar" ? "و" : "&");

function Ornament() {
  return <span className={cn(s.art, s.divider)} aria-hidden />;
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <div className={s.heroArt} role="img" aria-label="Embroidered arch of feathers and water lilies under a full moon, with two swans on a lake">
        <span className={s.moonGlow} aria-hidden />
        <div className={s.heroText}>
          <p className={s.eyebrow}>{content.eyebrow || kitCopy(model).together}</p>
          <h1 className={s.names}>
            <span>{wedding.partnerOne}</span>
            <span className={s.amp}>{amp(model)}</span>
            <span>{wedding.partnerTwo}</span>
          </h1>
          {wedding.date ? <p className={s.hDate}>{wedding.date.short}</p> : null}
          {wedding.date ? <p className={s.hDay}>{wedding.date.weekday}</p> : null}
          {content.tagline || place?.venueName ? <p className={s.hPlace}>{content.tagline || place?.venueName}</p> : null}
        </div>
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  return (
    <Sec id="couple" className={s.sec}>
      <Ornament />
      <p className={s.sub} {...fx("blur")}>{content.eyebrow || kitCopy(model).with}</p>
      {content.heading ? <h2 className={s.h2} {...fx("blur")}>{content.heading}</h2> : null}
      {content.message ? <p className={s.lead} {...fx("blur", 120)}>{content.message}</p> : null}
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <Ornament />
      <h2 className={s.h2} {...fx("blur")}>{content.heading || d.long}</h2>
      <p className={s.sub}>{d.weekday}</p>
      {content.note ? <p className={s.lead}>{content.note}</p> : null}
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  return (
    <Sec id="countdown" className={s.sec}>
      <Ornament />
      <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).countdown}</h2>
      <div {...fx("blur", 120)}>
        <Clock model={model} className={s.clock} unit={s.medal} value={s.medalValue} label={s.medalLabel} />
      </div>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photo = photos(model, 1)[0] ?? heroPhoto(model);
  return (
    <Sec id="story" className={s.sec}>
      {photo ? (
        <div className={s.portrait} {...fx("blur")}>
          <Pic asset={photo} sizes="(min-width: 640px) 300px, 74vw" className={s.portraitPhoto} />
          <span className={cn(s.art, s.frame)} aria-hidden />
        </div>
      ) : null}
      <h2 className={cn(s.h2, s.storyTitle)} {...fx("blur")}>{content.heading || kitCopy(model).ourStory}</h2>
      {content.body ? (
        <div className={s.prose} {...fx("blur", 120)}>
          <Paragraphs text={content.body} />
        </div>
      ) : null}
      {content.quote ? (
        <blockquote className={s.quote} {...fx("blur", 200)}>
          {content.quote}
          {content.quoteSource ? <cite>{content.quoteSource}</cite> : null}
        </blockquote>
      ) : null}
    </Sec>
  );
}

function Event({ id, model, content }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string } }) {
  const e = model.events[id];
  if (!e) return null;
  const t = kitCopy(model);
  const first = model.sections.find((x) => x.type === "ceremony" || x.type === "reception")?.type === id;
  return (
    <Sec id={id} className={cn(s.sec, !first && s.secTight)}>
      {first ? (
        <>
          <Ornament />
          <h2 className={s.h2} {...fx("blur")}>{model.locale === "ar" ? "الموعد والمكان" : "When & where"}</h2>
          <p className={s.sub}>{[t.ceremony, t.reception].join(model.locale === "ar" ? " و" : " and ")}</p>
          <div className={s.tapestry} {...fx("blur")}>
            <span className={cn(s.art, s.chateau)} role="img" aria-label="Embroidered château on a lake" />
          </div>
        </>
      ) : (
        <span className={s.stitch} aria-hidden />
      )}
      <div className={s.event} {...fx("blur")}>
        <h3>{content.heading || e.title || (id === "ceremony" ? t.ceremony : t.reception)}</h3>
        {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
        {e.address ? <p>{e.address}</p> : null}
        <p className={s.time}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
        {content.note ? <p className={s.note}>{content.note}</p> : null}
        <Directions model={model} event={e} className={s.btn} />
      </div>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p className={s.lead}>{content.note}</p> : null}
      <div className={s.maps}>
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig} {...fx("blur")}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption>{e.venueName ?? e.title}</figcaption>
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
    <Sec id="schedule" className={cn(s.sec, s.wreathSec)}>
      <div className={s.wreath} {...fx("blur")}>
        <span className={s.moonGlowSmall} aria-hidden />
        <div className={s.wreathInner}>
          <h2 className={s.h2}>{content.heading || kitCopy(model).schedule}</h2>
          {model.wedding.date ? <p className={s.dayDate}>{model.wedding.date.long}</p> : null}
          <ol className={s.timeline}>
            {items.map((it, i) => (
              <li key={i}>
                <time>{it.time}</time>
                <span className={s.dot} aria-hidden />
                <span>{it.title}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.sec}>
      <Ornament />
      <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={s.sub}>{content.caption}</p> : null}
      <div className={s.gallery}>
        {list.map((p) => (
          <div key={p.id} className={s.galleryItem} {...fx("blur")}>
            <Pic asset={p} sizes="(min-width: 640px) 200px, 30vw" className={s.portraitPhoto} />
            <span className={cn(s.art, s.frame)} aria-hidden />
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <Ornament />
      <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).rsvp}</h2>
      {content.deadline ? <p className={s.sub}>{content.deadline}</p> : null}
      <div className={s.card} {...fx("blur", 120)}>
        {content.message ? <p className={s.lead}>{content.message}</p> : null}
        <ReplyLink content={content} className={cn(s.btn, s.btnWide)} />
      </div>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <h2 className={s.h2} {...fx("blur")}>{content.heading || kitCopy(model).faq}</h2>
      <div className={s.faq}>
        {items.map((it, i) => (
          <details key={i} className={s.qa} {...fx("blur")}>
            <summary>{it.question}</summary>
            <p>{it.answer}</p>
          </details>
        ))}
      </div>
    </Sec>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.sec}>
      <span className={cn(s.art, s.closingWreath)} role="img" aria-label="Embroidered wreath of water lilies with two swans under a crescent moon" {...fx("blur")} />
      <p className={s.h2} {...fx("blur")}>{content.heading}</p>
      {content.message ? <p className={s.lead} {...fx("blur", 120)}>{content.message}</p> : null}
      {content.signature ? <p className={s.lead}>{content.signature}</p> : null}
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

export default function SwanRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="swan" className={s.root} after={model.mode === "export" ? null : <SwanOpening model={model} />}>
      <div className={s.column}>
        <Sections model={model} components={sections} />
      </div>
    </KitRoot>
  );
}

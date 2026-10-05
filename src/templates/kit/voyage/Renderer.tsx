/* eslint-disable @next/next/no-img-element -- transparent art layers that animate (CSS transforms on the element itself); sized and preloaded with the page */
import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { Anchor, Chart, Compass, WashingLine } from "./art";
import { UnrollHero, VoyageOpening } from "./opening";
import s from "./voyage.module.css";

/**
 * Set Sail — a message in a bottle. A dusty-blue envelope sealed in slate wax
 * stamped with an anchor: the seal cracks and breaks, the flap opens on a
 * watercolour sea, a parchment scroll tied with twine slides out, slips its
 * twine and unrolls over a painted sea where a glass bottle bobs. Below, ivory
 * cards: a countdown, a watercolour chart of the islands with the route from
 * the ceremony to the reception, the day as a ship's log, numbered questions,
 * a brown wax seal to reply and a washing line of sketched travel things.
 * The bottle, scroll, twine and seals are 3D renders and the sea and chart are
 * painted (public/templates/set-sail), all made for Vellum.
 *
 * Colours: bg = ivory page, surface = card, fg = ink, muted = warm captions,
 * accent = slate (headings, buttons), accent-fg = card on slate, border = rules.
 */

const T = {
  en: { begins: "Our adventure begins", sail: "Until we set sail", where: "Where & when", log: "The ship's log", know: "Navigation questions", aboard: "Count me aboard", shore: "See you on the shore", essentials: "Travel essentials", pack: "Pack light, bring your dancing shoes", key: "Map key", chart: "A watercolour chart of the islands with the route from the ceremony to the reception", scroll: "Scroll" },
  ar: { begins: "تبدأ مغامرتنا", sail: "حتى نُبحر", where: "أين ومتى", log: "سجلّ الرحلة", know: "أسئلة الرحلة", aboard: "سأكون معكم", shore: "نراكم على الشاطئ", essentials: "لوازم الرحلة", pack: "خفّفوا الحقائب ولا تنسوا أحذية الرقص", key: "دليل الخريطة", chart: "خريطة مائية للجزر والطريق من مكان العقد إلى الحفل", scroll: "انزلوا" },
};
const tr = (model: InvitationModel) => (model.locale === "ar" ? T.ar : T.en);

// sun glints on the water (fixed so server and client agree)
const GLINTS = [
  [8, 12, 0], [22, 40, -1.2], [35, 8, -2.6], [48, 30, -.6], [62, 18, -3.4], [74, 44, -1.8], [88, 10, -4], [14, 62, -2.2], [30, 78, -.4],
  [44, 58, -3], [58, 84, -1.4], [70, 66, -2.8], [84, 80, -.9], [92, 52, -3.8], [52, 4, -1.6], [6, 90, -2.4], [66, 96, -.2], [38, 94, -3.2],
];

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(s.card, className)} {...fx("rise")}>
      {children}
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const place = model.events.ceremony ?? model.events.reception;
  const where = content.tagline || [place?.venueName, place?.address].filter(Boolean).join(", ");
  return (
    <header id="hero" data-section="hero" className={s.hero}>
      <span className={s.sea} aria-hidden />
      <span className={s.glints} aria-hidden>
        {GLINTS.map(([x, y, d], i) => (
          <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
        ))}
      </span>
      <Compass className={s.compassArt} />
      <UnrollHero model={model} className={s.banner}>
        <span className={s.bottleWrap} aria-hidden>
          <span className={s.bottle}>
            <img src="/templates/set-sail/bottle.webp" alt="" />
          </span>
        </span>
        <span className={cn(s.roll, s.rollTop)} aria-hidden />
        <div className={s.sheet}>
          <p className={cn(s.caps, s.fade)}>{content.eyebrow || kitCopy(model).together}</p>
          <p className={cn(s.lead, s.fade)}>{tr(model).begins}</p>
          <h1 className={cn(s.names, s.fade)}>
            {wedding.partnerOne} <span className={s.amp}>{model.locale === "ar" ? "و" : "&"}</span> {wedding.partnerTwo}
          </h1>
          <span className={cn(s.rule, s.fade)} aria-hidden>
            <Anchor className={s.ruleIcon} />
          </span>
          {wedding.date || where ? (
            <p className={cn(s.when, s.fade)}>
              {wedding.date?.long}
              {wedding.date && where ? <br /> : null}
              {where}
            </p>
          ) : null}
        </div>
        <span className={cn(s.roll, s.rollBot)} aria-hidden />
      </UnrollHero>
      <span className={s.hint} aria-hidden>
        {tr(model).scroll}
        <i />
      </span>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Sec id="couple" className={s.sec}>
      <Card>
        <p className={s.caps}>{content.eyebrow || kitCopy(model).with}</p>
        {content.heading ? <h2 className={s.h2}>{content.heading}</h2> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
      </Card>
    </Sec>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Sec id="date" className={s.sec}>
      <Card>
        <p className={s.caps}>{d.weekday}</p>
        <h2 className={s.h2}>{content.heading || d.long}</h2>
        {content.note ? <p className={s.body}>{content.note}</p> : null}
      </Card>
    </Sec>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.sec}>
      <Card>
        <p className={s.caps}>{content.heading || tr(model).sail}</p>
        <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.label} />
      </Card>
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  if (!content.heading && !content.body) return null;
  const photo = photos(model, 1)[0];
  return (
    <Sec id="story" className={s.sec}>
      <Card>
        <h2 className={s.h2}>{content.heading || kitCopy(model).ourStory}</h2>
        {photo ? <Pic asset={photo} sizes="(min-width: 640px) 480px, 86vw" className={s.photo} /> : null}
        {content.body ? (
          <div className={s.prose}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? <p className={s.quote}>“{content.quote}”{content.quoteSource ? ` · ${content.quoteSource}` : ""}</p> : null}
      </Card>
    </Sec>
  );
}

/** Where & when: one card with the chart and both events (the reception joins the ceremony's card). */
function Events({ model, content }: { model: InvitationModel; content: { heading: string; note: string } }) {
  const { ceremony, reception } = model.events;
  const list = [ceremony, reception].filter((e) => !!e);
  if (!list.length) return null;
  const t = kitCopy(model);
  const id = ceremony ? "ceremony" : "reception";
  return (
    <Sec id={id} className={s.sec}>
      {ceremony && reception ? <span id="reception" className={s.anchorTarget} aria-hidden /> : null}
      <Card>
        <h2 className={s.h2}>{content.heading || tr(model).where}</h2>
        {content.note ? <p className={s.body}>{content.note}</p> : null}
        <Chart
          from={ceremony?.venueName ?? ceremony?.title}
          to={reception?.venueName ?? reception?.title}
          labels={{ ceremony: t.ceremony, reception: t.reception, key: tr(model).key }}
          label={tr(model).chart}
        />
        <div className={s.legend}>
          {list.map((e) => (
            <div key={e.id} className={s.legendRow}>
              <span>
                <b className={s.legendKind}>{e === ceremony ? t.ceremony : t.reception}</b>
                <span className={s.legendPlace}>{[e.venueName ?? e.title, e.address].filter(Boolean).join(", ")}</span>
                {e.dateLabel ? <span className={s.legendPlace}>{eventDate(model, e)}</span> : null}
              </span>
              {e.timeLabel ? <time className={s.legendTime}>{e.timeLabel}</time> : <span />}
            </div>
          ))}
        </div>
        <div className={s.btns}>
          {list.map((e) => (
            <Directions key={e.id} model={model} event={e} className={s.pill}>
              {list.length > 1 ? `${model.strings.directions} · ${e === ceremony ? t.ceremony : t.reception}` : undefined}
            </Directions>
          ))}
        </div>
      </Card>
    </Sec>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Sec id="venue" className={s.sec}>
      <Card>
        <h2 className={s.h2}>{content.heading || kitCopy(model).venue}</h2>
        {content.note ? <p className={s.body}>{content.note}</p> : null}
        {mapped.map((e) => (
          <figure key={e.id} className={s.mapFig}>
            <KitMap model={model} event={e} className={s.map} />
            <figcaption className={s.caps}>{e.venueName ?? e.title}</figcaption>
          </figure>
        ))}
      </Card>
    </Sec>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Sec id="schedule" className={s.sec}>
      <Card>
        <h2 className={s.h2}>{content.heading || tr(model).log}</h2>
        <ol className={s.log}>
          {items.map((it, i) => (
            <li key={i}>
              <time>{it.time}</time>
              <span>
                <b>{it.title}</b>
                {it.note ? <span className={s.logNote}>{it.note}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </Sec>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Sec id="gallery" className={s.sec}>
      <Card>
        <h2 className={s.h2}>{content.heading || kitCopy(model).gallery}</h2>
        {content.caption ? <p className={s.caps}>{content.caption}</p> : null}
        <div className={s.gallery}>
          {list.map((p, i) => (
            <div key={p.id} className={s.snap} style={{ rotate: `${[-2, 1.5, -1, 2, -1.5, 1][i]}deg` }}>
              <Pic asset={p} sizes="(min-width: 640px) 230px, 40vw" className={s.snapPhoto} />
            </div>
          ))}
        </div>
      </Card>
    </Sec>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Sec id="faq" className={s.sec}>
      <Card>
        <h2 className={s.h2}>{content.heading || tr(model).know}</h2>
        <div className={s.faq}>
          {items.map((it, i) => (
            <div key={i} className={s.qa}>
              <span className={s.num}>{i + 1}</span>
              <div>
                <h3>{it.question}</h3>
                <p>{it.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <Card>
        <h2 className={s.h2}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.deadline ? <p className={cn(s.caps, s.gap)}>{content.deadline}</p> : null}
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        {content.linkUrl ? (
          <ReplyLink content={content} className={s.reply}>
            <img src="/templates/set-sail/seal-reply.webp" alt="" className={s.replySeal} />
            <span className={s.replyLabel}>{content.linkLabel || tr(model).aboard}</span>
          </ReplyLink>
        ) : (
          <span className={s.reply} aria-hidden>
            <img src="/templates/set-sail/seal-reply.webp" alt="" className={s.replySeal} />
          </span>
        )}
      </Card>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.sec}>
      <Card className={s.essentials}>
        <h2 className={s.h2}>{tr(model).essentials}</h2>
        <p className={cn(s.caps, s.gap)}>{tr(model).pack}</p>
        <WashingLine />
      </Card>
      <div className={s.closing} {...fx("fade")}>
        <p className={s.shore}>{content.heading || tr(model).shore}</p>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        <p className={s.caps}>{content.signature || model.wedding.coupleName}</p>
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

export const voyageSections: SectionComponents = {
  hero: Hero,
  couple: Couple,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <Events model={p.model} content={p.content} />,
  reception: (p) => (p.model.events.ceremony ? null : <Events model={p.model} content={p.content} />),
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  faq: Faq,
  rsvp: Rsvp,
  closing: Closing,
  footer: Footer,
};

export default function VoyageRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="voyage" className={s.root} after={model.mode === "export" ? null : <VoyageOpening model={model} />}>
      <Sections model={model} components={voyageSections} />
    </KitRoot>
  );
}

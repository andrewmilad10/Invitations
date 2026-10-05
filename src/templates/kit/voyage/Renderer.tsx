import type { ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { Anchor, Chart, Compass, Pin, WashingLine } from "./art";
import { UnrollHero, VoyageOpening } from "./opening";
import s from "./voyage.module.css";

/**
 * Set Sail — a nautical site for a wedding by the sea. A navy cotton envelope
 * sealed in blue wax stamped with an anchor: the seal cracks, the flap lifts,
 * a parchment scroll rises out and unrolls into the hero. Below, sand-paper
 * cards on navy linen: the countdown, a watercolour chart of the bay with the
 * route from the ceremony to the reception, the day as a ship's log,
 * questions, a wax-seal reply and a washing line of holiday things.
 * Textures only on paper (envelope, scroll, cards).
 *
 * Colours: bg = pale sand (the opening's table), surface = sand card,
 * fg = ink, muted = warm brown captions, accent = navy (the page, the
 * envelope and ink on paper), accent-fg = cream on navy, border = sand lines.
 */

const T = {
  en: { begins: "Our adventure begins", sail: "Until we set sail", where: "Where & when", log: "The ship's log", know: "Good to know", aboard: "Count me aboard", shore: "See you on the shore", chart: "A chart of the bay with the route from the ceremony to the reception" },
  ar: { begins: "تبدأ مغامرتنا", sail: "حتى نُبحر", where: "أين ومتى", log: "سجلّ الرحلة", know: "معلومات تهمّكم", aboard: "سأكون معكم", shore: "نراكم على الشاطئ", chart: "خريطة الخليج والطريق من مكان العقد إلى الحفل" },
};
const tr = (model: InvitationModel) => (model.locale === "ar" ? T.ar : T.en);

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
    <UnrollHero model={model} className={s.hero}>
      <span className={cn(s.roll, s.rollTop)} aria-hidden />
      <div className={s.sheet}>
        <p className={cn(s.caps, s.fade)}>{content.eyebrow || kitCopy(model).together}</p>
        <p className={cn(s.lead, s.fade)}>{tr(model).begins}</p>
        <h1 className={cn(s.names, s.fade)}>
          {wedding.partnerOne} <span className={s.amp}>{model.locale === "ar" ? "و" : "&"}</span> {wedding.partnerTwo}
        </h1>
        <span className={cn(s.rule, s.fade)} aria-hidden />
        {wedding.date || where ? (
          <p className={cn(s.when, s.fade)}>
            {wedding.date?.long}
            {wedding.date && where ? <br /> : null}
            {where}
          </p>
        ) : null}
        <Compass className={s.compass} />
        <Anchor className={s.anchorArt} />
      </div>
      <span className={cn(s.roll, s.rollBot)} aria-hidden />
    </UnrollHero>
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
        <Chart from={ceremony?.venueName ?? ceremony?.title} to={reception?.venueName ?? reception?.title} label={tr(model).chart} />
        <div className={s.legend}>
          {list.map((e) => (
            <div key={e.id} className={s.legendRow}>
              {e === ceremony ? <Anchor className={s.legendIcon} /> : <Pin className={s.legendIcon} />}
              <span>
                <b className={s.legendKind}>{e === ceremony ? t.ceremony : t.reception}</b>
                <span className={s.legendPlace}>{[e.venueName ?? e.title, e.address].filter(Boolean).join(", ")}</span>
                {eventDate(model, e) && e.dateLabel ? <span className={s.legendPlace}>{eventDate(model, e)}</span> : null}
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
        <h2 className={s.h2}>
          <Anchor className={s.h2Anchor} />
          {content.heading || tr(model).know}
          <Anchor className={s.h2Anchor} />
        </h2>
        <div className={s.faq}>
          {items.map((it, i) => (
            <details key={i} className={s.qa} open={i === 0}>
              <summary>{it.question}</summary>
              <p>{it.answer}</p>
            </details>
          ))}
        </div>
      </Card>
    </Sec>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Sec id="rsvp" className={s.sec}>
      <Card className={s.rsvpCard}>
        <h2 className={s.h2}>{content.heading || kitCopy(model).rsvp}</h2>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
        {content.deadline ? <p className={s.caps}>{content.deadline}</p> : null}
        <ReplyLink content={content} className={s.wax}>
          <span>{content.linkLabel || tr(model).aboard}</span>
        </ReplyLink>
        <WashingLine />
      </Card>
    </Sec>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div {...fx("fade")}>
        <p className={s.shore}>{content.heading || tr(model).shore}</p>
        {content.message ? <p className={s.closingMsg}>{content.message}</p> : null}
        <p className={s.capsLight}>{content.signature || model.wedding.coupleName}</p>
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
      <div className={s.page}>
        <Sections model={model} components={sections} />
      </div>
    </KitRoot>
  );
}

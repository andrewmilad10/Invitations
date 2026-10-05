import type { CSSProperties, ReactNode } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitMap, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { PondOpening } from "./opening";
import s from "./pond.module.css";

/**
 * Swan Pond — a flat lay of wedding stationery on a soft table, in olive and
 * burgundy. An olive felt envelope with a painted lake liner and a burgundy
 * seal opens onto the table: a names card, a date card, a "details" sticker,
 * a reply card, black-and-white polaroids and paper flower bunches. Each piece
 * links to its section; with motion on, the sections are drawers that open as
 * paper cards over the table (CSS :target, no script). In the editor and in
 * exports every section shows in place.
 *
 * Art (public/templates/swan-pond) is placeholder until the final images:
 * bunches and seal are paper craft rendered in 3D; liner is Swan Lake's lake.
 *
 * Colours: bg = table, surface = card paper, fg = ink, muted = burgundy
 * (sticker, seal, buttons), accent = olive (envelope, names card),
 * accent-fg = text on olive.
 */

const ar = (m: InvitationModel) => m.locale === "ar";
const has = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);
const tilt = (deg: number) => ({ "--r": `${deg}deg` }) as CSSProperties;

/** A section as a drawer: a paper card with a close link back to the table. */
function Drawer({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Sec id={id} className={s.panel}>
      <div className={s.sheetCard}>
        <a href="#hero" className={s.close} aria-label="Close">
          ×
        </a>
        {children}
      </div>
    </Sec>
  );
}

function Piece({ to, model, className, deg, delay, children }: { to: string; model: InvitationModel; className: string; deg: number; delay: number; children: ReactNode }) {
  const style = tilt(deg);
  return has(model, to) ? (
    <a href={`#${to}`} className={cn(s.piece, className)} style={style} {...fx("drop", delay)}>
      {children}
    </a>
  ) : (
    <div className={cn(s.piece, className)} style={style} {...fx("drop", delay)}>
      {children}
    </div>
  );
}

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const a = ar(model);
  const d = wedding.date;
  const place = model.events.ceremony ?? model.events.reception;
  const pics = photos(model, 3);
  const first = pics[0] ?? heroPhoto(model);
  const polaroids: { to: string; label: ReactNode; cls: string; deg: number; photo: (typeof pics)[number] | null }[] = [
    { to: "story", label: a ? "حكايتنا" : <>Our <i>love</i> story</>, cls: s.p1, deg: -5, photo: first },
    { to: "gallery", label: a ? "صورنا" : "Tap for photos", cls: s.p2, deg: 6, photo: pics[1] ?? null },
    { to: "schedule", label: kitCopy(model).schedule, cls: s.p3, deg: -3, photo: pics[2] ?? null },
  ];
  const more = [
    ["venue", kitCopy(model).venue],
    ["faq", kitCopy(model).faq],
  ].filter(([id]) => has(model, id));
  return (
    <header id="hero" data-section="hero" className={s.table}>
      <p className={s.caps}>{content.eyebrow || (a ? "أنتم مدعوّون" : "You are invited")}</p>
      <div className={s.lay}>
        <span className={cn(s.flowers, s.fa, s.f1)} aria-hidden />
        <span className={cn(s.flowers, s.fb, s.f2)} aria-hidden style={{ rotate: "200deg" }} />
        <span className={cn(s.flowers, s.fa, s.f3)} aria-hidden style={{ rotate: "-40deg" }} />
        <Piece to="couple" model={model} className={s.names} deg={-3} delay={0}>
          <small>{a ? "يتشرفان بدعوتكم لحفل زفاف" : "Please join us for the wedding of"}</small>
          <h1 style={{ margin: 0, display: "contents" }}>
            <b>{wedding.partnerOne}</b>
            <i>{a ? "و" : "&"}</i>
            <b>{wedding.partnerTwo}</b>
          </h1>
        </Piece>
        <Piece to="ceremony" model={model} className={s.date} deg={4} delay={140}>
          {d ? (
            <>
              <span className={s.dNum}>{d.day}</span>
              <span className={s.dMonth}>{d.month}</span>
              <span className={s.dNum}>{d.year}</span>
            </>
          ) : null}
          <small>{[place?.timeLabel, place?.venueName].filter(Boolean).join(" · ")}</small>
        </Piece>
        <Piece to="ceremony" model={model} className={s.sticker} deg={-6} delay={280}>
          <small>{a ? "اضغطوا لرؤية" : "Tap for the"}</small>
          <b>{kitCopy(model).details}</b>
        </Piece>
        <Piece to="rsvp" model={model} className={s.reply} deg={-2} delay={420}>
          <span className={s.seal} aria-hidden>
            <span>
              {wedding.initials[0]}&amp;{wedding.initials[1]}
            </span>
          </span>
          {a ? (
            <big>{kitCopy(model).rsvp}</big>
          ) : (
            <>
              <b>Kindly</b>
              <big>Reply</big>
              <b>Here</b>
            </>
          )}
        </Piece>
        {polaroids.map((p, i) =>
          p.photo ? (
            <Piece key={p.to} to={p.to} model={model} className={cn(s.polaroid, p.cls)} deg={p.deg} delay={560 + i * 140}>
              <Pic asset={p.photo} sizes="(min-width: 640px) 300px, 60vw" className={s.photo} />
              <span>{p.label}</span>
            </Piece>
          ) : null,
        )}
      </div>
      {more.length ? (
        <nav className={s.more} aria-label={a ? "المزيد" : "More"}>
          {more.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.heading && !content.message) return null;
  return (
    <Drawer id="couple">
      <h2 className={s.h}>{content.heading || kitCopy(model).with}</h2>
      {content.eyebrow ? <p className={s.sub}>{content.eyebrow}</p> : null}
      {content.message ? <p>{content.message}</p> : null}
    </Drawer>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Drawer id="date">
      <h2 className={s.h}>{content.heading || d.long}</h2>
      {content.note ? <p>{content.note}</p> : null}
    </Drawer>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Sec id="countdown" className={s.strip}>
      <p className={s.caps} style={{ color: "inherit", opacity: 0.8 }}>
        {content.heading || kitCopy(model).countdown}
      </p>
      <Clock model={model} className={s.clock} unit={s.unit} value={s.value} label={s.label} />
    </Sec>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  if (!content.body && !content.heading && !content.quote) return null;
  return (
    <Drawer id="story">
      <h2 className={s.h}>{content.heading || kitCopy(model).ourStory}</h2>
      {content.body ? (
        <div className={s.prose}>
          <Paragraphs text={content.body} />
        </div>
      ) : null}
      {content.quote ? (
        <p className={s.sub} style={{ marginTop: "1.2rem", textTransform: "none", letterSpacing: 0, fontSize: "1.05rem", fontStyle: "italic" }}>
          “{content.quote}”{content.quoteSource ? ` · ${content.quoteSource}` : ""}
        </p>
      ) : null}
    </Drawer>
  );
}

type EventId = "ceremony" | "reception";
function EventBlock({ id, model, heading, note }: { id: EventId; model: InvitationModel; heading: string; note: string }) {
  const e = model.events[id]!;
  const t = kitCopy(model);
  return (
    <div className={s.event}>
      <h2 className={s.h}>{heading || e.title || (id === "ceremony" ? t.ceremony : t.reception)}</h2>
      <p className={s.sub}>{[eventDate(model, e), e.timeLabel].filter(Boolean).join(" · ")}</p>
      {e.venueName ? <p className={s.venue}>{e.venueName}</p> : null}
      {e.address ? <p style={{ margin: 0 }}>{e.address}</p> : null}
      {note ? <p>{note}</p> : null}
      <KitMap model={model} event={e} className={s.map} />
      <Directions model={model} event={e} className={s.btn} />
    </div>
  );
}

/** The ceremony drawer also holds the reception, so the details sticker opens both. */
function Event({ id, model, content }: { id: EventId; model: InvitationModel; content: { heading: string; note: string } }) {
  if (!model.events[id]) return null;
  const ceremonyShown = has(model, "ceremony") && model.events.ceremony;
  if (id === "reception" && ceremonyShown) return null;
  const reception = id === "ceremony" ? model.sections.find((x) => x.type === "reception") : undefined;
  const rc = reception?.content as { heading: string; note: string } | undefined;
  return (
    <Drawer id={id}>
      <EventBlock id={id} model={model} heading={content.heading} note={content.note} />
      {rc && model.events.reception ? <EventBlock id="reception" model={model} heading={rc.heading} note={rc.note} /> : null}
    </Drawer>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = model.events.all.filter((e) => e.mapEmbedUrl);
  if (!mapped.length) return null;
  return (
    <Drawer id="venue">
      <h2 className={s.h}>{content.heading || kitCopy(model).venue}</h2>
      {content.note ? <p>{content.note}</p> : null}
      {mapped.map((e) => (
        <figure key={e.id} style={{ margin: "1rem 0 0" }}>
          <KitMap model={model} event={e} className={s.map} />
          <figcaption style={{ fontStyle: "italic" }}>{e.venueName ?? e.title}</figcaption>
        </figure>
      ))}
    </Drawer>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Drawer id="schedule">
      <h2 className={s.h}>{content.heading || kitCopy(model).schedule}</h2>
      {model.wedding.date ? <p className={s.sub}>{model.wedding.date.long}</p> : null}
      {items.map((it, i) => (
        <div key={i} className={s.row}>
          <b>{it.time}</b>
          <span>
            {it.title}
            {it.note ? <small>{it.note}</small> : null}
          </span>
        </div>
      ))}
    </Drawer>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 8);
  if (!list.length) return null;
  return (
    <Drawer id="gallery">
      <h2 className={s.h}>{content.heading || kitCopy(model).gallery}</h2>
      {content.caption ? <p className={s.sub}>{content.caption}</p> : null}
      <div className={s.gallery}>
        {list.map((p) => (
          <Pic key={p.id} asset={p} sizes="(min-width: 640px) 220px, 42vw" className={s.gPhoto} />
        ))}
      </div>
    </Drawer>
  );
}

function Rsvp({ model, content }: SectionProps<"rsvp">) {
  return (
    <Drawer id="rsvp">
      <h2 className={s.h}>{content.heading || kitCopy(model).rsvp}</h2>
      {content.deadline ? <p className={s.sub}>{content.deadline}</p> : null}
      {content.message ? <p>{content.message}</p> : null}
      <ReplyLink content={content} className={s.btn} />
    </Drawer>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Drawer id="faq">
      <h2 className={s.h}>{content.heading || kitCopy(model).faq}</h2>
      {items.map((it, i) => (
        <details key={i} className={s.qa}>
          <summary>{it.question}</summary>
          <p>{it.answer}</p>
        </details>
      ))}
    </Drawer>
  );
}

function Closing({ model, content }: SectionProps<"closing">) {
  return (
    <Sec id="closing" className={s.closing}>
      <div {...fx("rise")}>
        {content.heading ? <p className={s.caps}>{content.heading}</p> : null}
        {content.message ? <p>{content.message}</p> : null}
        <b>{content.signature || model.wedding.coupleName}</b>
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

export default function PondRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="pond" className={s.root} after={model.mode === "export" ? null : <PondOpening model={model} />}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

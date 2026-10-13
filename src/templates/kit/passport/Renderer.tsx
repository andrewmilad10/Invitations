/* eslint-disable @next/next/no-img-element -- photographed stamps, frames and paper objects */
import type { CSSProperties, ReactNode } from "react";
import type { EventModel, InvitationModel, MediaAsset } from "@/core/invitation/model";
import { Sections } from "../../shared/invitation-root";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../../types";
import { eventDate, faqItems, heroPhoto, kitCopy, mappedEvents, photos, scheduleItems } from "../data";
import { Clock, Directions, fx, KitRoot, Paragraphs, Pic, ReplyLink, Sec } from "../pieces";
import { PassportOpening } from "./opening";
import s from "./passport.module.css";

/**
 * Wedding Passport — the wedding as a journey. It opens on a closed navy
 * leather passport with the names in gold; a tap swings the cover open. Each
 * section is then a passport page on pale security paper with a page number:
 * the data page with the couple's photo under a holographic seal and a
 * machine-readable line, rubber stamps that land on the page as guests scroll
 * (ceremony, visa, celebration, arrival, welcome), a world map with a gold
 * plane on a dotted route, the itinerary, snapshots clipped in instant-photo
 * frames, travel information on a luggage tag, a boarding pass to reply and a
 * last "with love" stamp before the back cover closes the book. All objects
 * are photographed pieces made for Vellum (public/templates/wedding-passport).
 *
 * Colours: bg = the cream desk, surface = the passport page, fg = navy ink,
 * muted = soft navy, accent = navy (buttons), accent-fg = paper, border =
 * hairlines. Stamp inks (navy, burgundy, green), gold and leather belong to
 * the photographed objects.
 */

const ART = "/templates/wedding-passport";

const T = {
  en: {
    passport: "Wedding Passport", type: "Type", code: "Code", no: "Passport no.", holders: "Holders", travel: "Date of travel", destination: "Destination", departure: "Departure",
    departs: "Departs in", welcome: "Welcome aboard", story: "Our story", ceremony: "Ceremony details", celebration: "Celebration details", route: "Travel route",
    itinerary: "Itinerary", snapshots: "Travel snapshots", info: "Travel information", pass: "Boarding pass", passenger: "Passenger", you: "Our dear guest", from: "From", anywhere: "Anywhere",
    to: "To", date: "Date", boarding: "Boarding", seat: "Seat", reserved: "Reserved", love: "With love,", bon: "Bon voyage",
  },
  ar: {
    passport: "جواز سفر الزفاف", type: "النوع", code: "الرمز", no: "رقم الجواز", holders: "حاملا الجواز", travel: "تاريخ السفر", destination: "الوجهة", departure: "الإقلاع",
    departs: "الإقلاع بعد", welcome: "أهلاً بكم على متن رحلتنا", story: "حكايتنا", ceremony: "تفاصيل المراسم", celebration: "تفاصيل الحفل", route: "خط الرحلة",
    itinerary: "برنامج الرحلة", snapshots: "لقطات من الرحلة", info: "معلومات السفر", pass: "بطاقة الصعود", passenger: "المسافر", you: "ضيفنا العزيز", from: "من", anywhere: "أي مكان",
    to: "إلى", date: "التاريخ", boarding: "الصعود", seat: "المقعد", reserved: "محجوز لك", love: "مع حبنا،", bon: "رحلة سعيدة",
  },
};
const tr = (m: InvitationModel) => (m.locale === "ar" ? T.ar : T.en);

/** Latin capitals only, for the machine-readable line (Arabic names fall back to the couple's slug). */
const mrzText = (v: string) => v.normalize("NFD").replace(/[^A-Za-z ]/g, "").trim().toUpperCase().replace(/\s+/g, "<");
function mrz(m: InvitationModel): [string, string] {
  const a = mrzText(m.wedding.partnerOne) || "PARTNER";
  const b = mrzText(m.wedding.partnerTwo) || "PARTNER";
  const pad = (v: string) => (v + "<".repeat(44)).slice(0, 44);
  const iso = (m.wedding.weddingDate ?? "").replace(/-/g, "").slice(2);
  return [pad(`P<WED${a}<<${b}`), pad(`${(m.wedding.slug || "VELLUM").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9)}<LOVE${iso}<<FOREVER`)];
}

type Ink = "ceremony" | "visa" | "celebration" | "arrived" | "welcome" | "final";

/** A rubber stamp from the photographed set, with the changing words stamped into its empty middle. */
function Stamp({ kind, tilt = 0, delay = 0, className, children }: { kind: Ink; tilt?: number; delay?: number; className?: string; children: ReactNode }) {
  return (
    <span className={`${s.stamp} ${s[`s_${kind}`]} ${className ?? ""}`} style={{ "--r": `${tilt}deg`, "--d": `${delay}ms` } as CSSProperties}>
      <img src={`${ART}/stamp-${kind}.webp`} alt="" width={340} height={260} loading="lazy" />
      <span className={s.stampText}>{children}</span>
    </span>
  );
}

/** One passport page: security paper, a title, the content, a page number (CSS counter). */
function Page({ id, title, className, children }: { id: string; title?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <Sec id={id} className={`${s.page} ${className ?? ""}`}>
      <div className={s.sheet} {...fx("rise")}>
        {title ? <h2 className={s.h2}>{title}</h2> : null}
        {children}
      </div>
    </Sec>
  );
}

/** An instant photo held by a gold paper clip. */
function Snapshot({ asset, sizes, tilt = 0, caption }: { asset: MediaAsset; sizes: string; tilt?: number; caption?: string }) {
  return (
    <figure className={s.snap} style={{ "--r": `${tilt}deg` } as CSSProperties}>
      <Pic asset={asset} sizes={sizes} className={s.snapPhoto} />
      <img src={`${ART}/instant.webp`} alt="" className={s.snapFrame} width={400} height={492} loading="lazy" />
      <img src={`${ART}/clip.webp`} alt="" className={s.clip} width={60} height={207} loading="lazy" />
      {caption ? <figcaption className={s.snapCap}>{caption}</figcaption> : null}
    </figure>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={s.field}>
      <span className={s.label}>{label}</span>
      <span className={s.value}>{children}</span>
    </div>
  );
}

/** The data page: photo under the holographic seal, the couple's details and the machine-readable line. */
function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding } = model;
  const t = tr(model);
  const first = model.events.ceremony ?? model.events.reception;
  const p = heroPhoto(model);
  const [l1, l2] = mrz(model);
  return (
    <header id="hero" data-section="hero" className={s.page}>
      <div className={`${s.sheet} ${s.dataPage}`} {...fx("fade")}>
        <img src={`${ART}/emblem.webp`} alt="" className={s.emblem} width={360} height={360} fetchPriority="high" />
        <p className={s.kicker}>{content.eyebrow || t.passport}</p>
        <h1 className={s.names}>
          {wedding.partnerOne} <i>&amp;</i> {wedding.partnerTwo}
        </h1>
        <div className={s.meta} aria-hidden="true">
          <span>{t.type} W</span>
          <span>{t.code} LOVE</span>
          <span>{t.no} {wedding.date ? wedding.date.short.replace(/\D/g, "") : "000000"}</span>
        </div>
        <div className={p ? s.data : `${s.data} ${s.dataNoPhoto}`}>
          {p ? (
            <div className={s.idPhoto}>
              <Pic asset={p} sizes="(min-width: 600px) 150px, 36vw" className={s.idPic} />
              <img src={`${ART}/holo.webp`} alt="" className={s.holo} width={200} height={200} />
            </div>
          ) : null}
          <div className={s.fields}>
            <Field label={t.holders}>{wedding.coupleName}</Field>
            {wedding.date ? <Field label={t.travel}>{wedding.date.long}</Field> : null}
            {first?.venueName ? <Field label={t.destination}>{first.venueName}</Field> : null}
            {first?.timeLabel ? <Field label={t.departure}>{first.timeLabel}</Field> : null}
          </div>
        </div>
        {content.tagline ? <p className={s.body}>{content.tagline}</p> : null}
        {model.countdownTarget ? (
          <div className={s.departs}>
            <span className={s.label}>{t.departs}</span>
            <Clock model={model} className={s.clock} unit={s.unit} value={s.cval} label={s.clab} />
          </div>
        ) : null}
        <div className={s.mrz} aria-hidden="true">
          <span>{l1}</span>
          <span>{l2}</span>
        </div>
      </div>
    </header>
  );
}

function Couple({ model, content }: SectionProps<"couple">) {
  if (!content.message && !content.heading) return null;
  return (
    <Page id="couple" title={content.heading || tr(model).welcome}>
      {content.message ? <p className={s.body}>{content.message}</p> : null}
      {model.wedding.date ? (
        <Stamp kind="arrived" tilt={-7} className={s.stampMid}>
          <b>{model.wedding.date.short}</b>
        </Stamp>
      ) : null}
    </Page>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  const d = model.wedding.date;
  if (!d) return null;
  return (
    <Page id="date" title={content.heading || kitCopy(model).date}>
      <Stamp kind="welcome" tilt={5} className={s.stampMid}>
        <b>{d.short}</b>
        <span>{d.weekday}</span>
      </Stamp>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
    </Page>
  );
}

/** The countdown is on the data page. */
function CountdownBlock() {
  return null;
}

function Story({ model, content }: SectionProps<"story">) {
  const p = heroPhoto(model);
  return (
    <Page id="story" title={content.heading || tr(model).story}>
      {p ? <Snapshot asset={p} sizes="(min-width: 600px) 220px, 56vw" tilt={-2.5} /> : null}
      {content.body ? <div className={s.body}><Paragraphs text={content.body} /></div> : null}
      {content.quote ? (
        <p className={s.quote}>
          {content.quote}
          {content.quoteSource ? <span className={s.small}> — {content.quoteSource}</span> : null}
        </p>
      ) : null}
    </Page>
  );
}

const has = (m: InvitationModel, type: string) => m.sections.some((x) => x.type === type);
const headingOf = (m: InvitationModel, type: "ceremony" | "reception") => {
  const sec = m.sections.find((x) => x.type === type);
  return sec ? (sec.content as { heading?: string }).heading ?? "" : "";
};

function EventPage({ model, e, kind, heading }: { model: InvitationModel; e: EventModel; kind: "ceremony" | "reception"; heading: string }) {
  const t = tr(model);
  const d = model.wedding.date;
  const when = e.dateLabel ?? d?.short ?? "";
  const ceremony = kind === "ceremony";
  return (
    <Page id={ceremony ? "ceremony" : "reception"} title={heading || (ceremony ? t.ceremony : t.celebration)}>
      <div className={s.stamps}>
        {ceremony ? (
          <>
            <Stamp kind="ceremony" tilt={-8}>
              <b>{when}</b>
              {e.timeLabel ? <span>{e.timeLabel}</span> : null}
            </Stamp>
            <Stamp kind="visa" tilt={6} delay={220}>
              <b>{e.venueName ?? e.title}</b>
            </Stamp>
          </>
        ) : (
          <>
            <Stamp kind="welcome" tilt={-6}>
              <b>{when}</b>
            </Stamp>
            <Stamp kind="celebration" tilt={5} delay={220}>
              {e.timeLabel ? <b>{e.timeLabel}</b> : null}
              <span>{e.venueName ?? e.title}</span>
            </Stamp>
          </>
        )}
      </div>
      <div className={s.details}>
        <p className={s.venue}>{e.venueName ?? e.title}</p>
        {e.address ? <p className={s.small}>{e.address}</p> : null}
        <p className={s.small}>
          {eventDate(model, e)}
          {e.timeLabel ? ` · ${e.timeLabel}` : ""}
        </p>
        <Directions model={model} event={e} className={s.link} />
      </div>
    </Page>
  );
}

/** Ceremony and party are two facing pages when both are shown. */
function Events({ model, id }: { model: InvitationModel; id: "ceremony" | "reception" }) {
  if (id === "reception" && has(model, "ceremony")) return null;
  const ids: ("ceremony" | "reception")[] = id === "ceremony" && has(model, "reception") ? ["ceremony", "reception"] : [id];
  return (
    <>
      {ids.map((k) => {
        const e = model.events[k];
        return e ? <EventPage key={k} model={model} e={e} kind={k} heading={headingOf(model, k)} /> : null;
      })}
    </>
  );
}

/** A world map with a gold plane flying a dotted route, and the places with directions. */
function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = mappedEvents(model);
  if (!mapped.length) return null;
  return (
    <Page id="venue" title={content.heading || tr(model).route}>
      {content.note ? <p className={s.body}>{content.note}</p> : null}
      <div className={s.world} aria-hidden="true">
        <img src={`${ART}/map.webp`} alt="" className={s.mapArt} width={900} height={470} loading="lazy" />
        <svg className={s.route} viewBox="0 0 300 160" preserveAspectRatio="none">
          <path d="M78 64 C 120 8, 160 8, 182 72" />
        </svg>
        <span className={s.from} />
        <span className={s.to} />
        <img src={`${ART}/plane.webp`} alt="" className={s.plane} width={120} height={117} loading="lazy" />
      </div>
      <ul className={s.places}>
        {mapped.map((e) => (
          <li key={e.id}>
            <span className={s.venue}>{e.venueName ?? e.title}</span>
            {e.address ? <span className={s.small}>{e.address}</span> : null}
            <Directions model={model} event={e} className={s.link} />
          </li>
        ))}
      </ul>
    </Page>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items = scheduleItems(model, content);
  if (!items.length) return null;
  return (
    <Page id="schedule" title={content.heading || tr(model).itinerary}>
      <ol className={s.itinerary}>
        {items.map((it, i) => (
          <li key={i}>
            <span className={s.time}>{it.time}</span>
            <span className={s.what}>
              {it.title}
              {it.note ? <span className={s.note}>{it.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </Page>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const list = photos(model, 6);
  if (!list.length) return null;
  return (
    <Page id="gallery" title={content.heading || tr(model).snapshots}>
      {content.caption ? <p className={s.small}>{content.caption}</p> : null}
      <div className={s.grid}>
        {list.map((p, i) => (
          <Snapshot key={p.id} asset={p} sizes="(min-width: 600px) 180px, 40vw" tilt={[-3, 2.5, 2, -2.5, -1.5, 3][i % 6]} />
        ))}
      </div>
    </Page>
  );
}

/** Questions on a luggage tag. */
function Faq({ model, content }: SectionProps<"faq">) {
  const items = faqItems(content);
  if (!items.length) return null;
  return (
    <Page id="faq">
      <div className={s.tag}>
        <img src={`${ART}/tag.webp`} alt="" width={300} height={447} loading="lazy" />
        <h2 className={s.tagTitle}>{content.heading || tr(model).info}</h2>
      </div>
      <dl className={s.qa}>
        {items.map((it, i) => (
          <div key={i}>
            <dt>{it.question}</dt>
            <dd>{it.answer}</dd>
          </div>
        ))}
      </dl>
    </Page>
  );
}

/** The reply as a boarding pass with a tear-off stub. */
function Rsvp({ model, content }: SectionProps<"rsvp">) {
  const t = tr(model);
  const first = model.events.ceremony ?? model.events.reception;
  return (
    <Page id="rsvp" title={content.heading || kitCopy(model).rsvp}>
      <div className={s.pass}>
        <div className={s.passHead}>
          <img src={`${ART}/emblem.webp`} alt="" width={360} height={360} loading="lazy" />
          <span>{t.pass}</span>
        </div>
        <div className={s.passBody}>
          <Field label={t.passenger}>{t.you}</Field>
          <div className={s.passRow}>
            <Field label={t.from}>{t.anywhere}</Field>
            <span className={s.passPlane} aria-hidden="true">
              <img src={`${ART}/plane.webp`} alt="" width={120} height={117} loading="lazy" />
            </span>
            <Field label={t.to}>{first?.venueName ?? model.wedding.coupleName}</Field>
          </div>
          <div className={s.passRow}>
            {model.wedding.date ? <Field label={t.date}>{model.wedding.date.short}</Field> : null}
            {first?.timeLabel ? <Field label={t.boarding}>{first.timeLabel}</Field> : null}
            <Field label={t.seat}>{t.reserved}</Field>
          </div>
        </div>
        <div className={s.perf} aria-hidden="true" />
        <div className={s.stub}>
          <div className={s.stubText}>
            {content.deadline ? <p className={s.small}>{content.deadline}</p> : null}
            {content.message ? <p className={s.body}>{content.message}</p> : null}
            <ReplyLink content={content} className={s.button} />
          </div>
          <img src={`${ART}/barcode.webp`} alt="" className={s.barcode} width={63} height={280} loading="lazy" />
        </div>
      </div>
    </Page>
  );
}

/** The last stamp, then the back cover closes the passport. */
function Closing({ model, content }: SectionProps<"closing">) {
  const t = tr(model);
  return (
    <Sec id="closing" className={s.closing}>
      <div className={s.sheet} {...fx("rise")}>
        <Stamp kind="final" tilt={-4} className={s.finalStamp}>
          <span className={s.loveLine}>{content.heading || t.love}</span>
          <b className={s.loveNames}>{content.signature || model.wedding.coupleName}</b>
        </Stamp>
        {content.message ? <p className={s.body}>{content.message}</p> : null}
      </div>
      <div className={s.backWrap} {...fx("rise")}>
        <img src={`${ART}/back.webp`} alt="" className={s.back} width={640} height={940} loading="lazy" />
        <p className={s.bon}>{t.bon}</p>
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
  ceremony: (p) => <Events model={p.model} id="ceremony" />,
  reception: (p) => <Events model={p.model} id="reception" />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Rsvp,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function PassportRenderer({ model }: TemplateRendererProps) {
  return (
    <KitRoot model={model} kit="passport" className={s.root} after={model.mode === "export" ? null : <PassportOpening model={model} />}>
      <Sections model={model} components={sections} />
    </KitRoot>
  );
}

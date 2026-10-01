import type { CSSProperties, ReactNode } from "react";
import type { EventModel, InvitationModel, MediaAsset } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { CinematicMotion } from "../cinematic/motion";
import { Countdown } from "../shared/countdown";
import { InvitationImage } from "../shared/invitation-image";
import { InvitationRoot, Paragraphs, Sections } from "../shared/invitation-root";
import { MapEmbed } from "../shared/map-embed";
import { MusicToggle } from "../shared/music-toggle";
import { hash } from "../shared/numbering";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../types";

/**
 * Postale — the wedding as a journey. The invitation arrives as a postcard
 * (stamp, postmark, airmail edging); the date is a calendar page, the
 * countdown a departure board, the ceremony and party are boarding passes,
 * photos are postcards home, the day an itinerary.
 *
 * Fonts by role: heading = the characterful display serif, body = the
 * clean sans, accent = the typewriter mono for labels. Colours: bg = chalk,
 * surface = card, fg = the deep sea colour, muted = the warm second colour
 * (terracotta, used for small print and stamps), accent = the sunny ticket
 * colour, accent-fg = text on it.
 */

// ── Building blocks ─────────────────────────────────────────────────────────

/** Themed labels (generic phrases, never wedding identity). */
const COPY = {
  en: {
    parAvion: "Par avion", greetingsFrom: "Greetings from", withLove: "With love", date: "Date", gate: "Gate",
    admit: "Admit", all: "All", reply: "Reply", journal: "Travel journal", gettingThere: "Getting there",
    postcards: "Postcards home", itinerary: "Itinerary", notes: "Travel notes", question: "Q",
  },
  ar: {
    parAvion: "بريد جوي", greetingsFrom: "تحيّات من", withLove: "مع الحب", date: "التاريخ", gate: "البوابة",
    admit: "دعوة", all: "للجميع", reply: "الرد", journal: "يوميات السفر", gettingThere: "الطريق إلينا",
    postcards: "بطاقات من الرحلة", itinerary: "برنامج الرحلة", notes: "ملاحظات السفر", question: "س",
  },
} as const;
const copy = (model: InvitationModel) => COPY[model.locale] ?? COPY.en;

const MONO = "font-inv-accent text-[0.68rem] uppercase tracking-[0.18em]";

/** Airmail edging: diagonal stripes in the two colours. */
const AIRMAIL: CSSProperties = {
  background: "repeating-linear-gradient(-45deg, var(--inv-fg) 0 14px, transparent 14px 22px, var(--inv-muted) 22px 36px, transparent 36px 44px)",
};

/** Perforated edge for stamps (a mask of half-circles). */
const PERFORATED: CSSProperties = {
  // Holes along the edges only: the dotted pattern, plus a solid content box.
  WebkitMask: "radial-gradient(circle 4px at 4px 4px, transparent 98%, black) -4px -4px / 12px 12px, linear-gradient(black, black) content-box",
  mask: "radial-gradient(circle 4px at 4px 4px, transparent 98%, black) -4px -4px / 12px 12px, linear-gradient(black, black) content-box",
};

function Block({ id, children, className, tone = "bg" }: { id: string; children: ReactNode; className?: string; tone?: "bg" | "surface" | "fg" }) {
  return (
    <section
      id={id}
      data-section={id}
      className={cn(
        "overflow-hidden px-5 py-20 sm:px-10 sm:py-28",
        "group-data-[spacing=compact]/sec:py-12 group-data-[spacing=airy]/sec:py-32 sm:group-data-[spacing=airy]/sec:py-40",
        tone === "bg" && "bg-inv-bg text-inv-fg",
        tone === "surface" && "bg-inv-surface text-inv-fg",
        tone === "fg" && "bg-inv-fg text-inv-bg",
        className,
      )}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

function Heading({ kicker, children, className }: { kicker?: string; children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <div data-reveal className={cn("mb-12", className)}>
      {kicker ? <p className={cn(MONO, "text-inv-muted")}>{kicker}</p> : null}
      <h2 className="mt-3 font-inv-heading text-5xl leading-[1] sm:text-7xl">{children}</h2>
    </div>
  );
}

function Stamp({ top, bottom, className }: { top: string; bottom: string; className?: string }) {
  return (
    <div className={cn("bg-inv-surface p-[6px] drop-shadow-[0_2px_4px_rgb(0_0_0/0.15)]", className)} style={PERFORATED}>
      <div className="flex aspect-[4/5] flex-col items-center justify-between bg-inv-accent px-1.5 py-2.5 text-center text-inv-accent-fg outline outline-1 -outline-offset-[3px] outline-current/40">
        <span className="max-w-full truncate font-inv-accent text-[0.55rem] uppercase tracking-[0.12em]">{top}</span>
        <span className="font-inv-heading text-3xl leading-none">♡</span>
        <span className="font-inv-accent text-[0.55rem] uppercase tracking-[0.15em]">{bottom}</span>
      </div>
    </div>
  );
}

/** A round postmark with wavy cancellation lines. */
function Postmark({ text, date, className }: { text: string; date: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 110" className={cn("text-inv-fg", className)}>
      <defs>
        <path id="pm-arc" d="M20 55 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0" />
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55">
        <circle cx="55" cy="55" r="44" />
        <circle cx="55" cy="55" r="30" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M104 ${30 + i * 16} q12 -8 24 0 t24 0 t24 0 t24 0`} />
        ))}
      </g>
      <text fill="currentColor" opacity="0.6" fontSize="8.5" letterSpacing="1.5" className="font-inv-accent uppercase">
        <textPath href="#pm-arc">{text}</textPath>
      </text>
      <text x="55" y="59" textAnchor="middle" fill="currentColor" opacity="0.65" fontSize="9" className="font-inv-accent">
        {date}
      </text>
    </svg>
  );
}

/** A photo printed as a postcard with a white border. */
function Postcard({ photo, rotate = 0, className, sizes, children }: { photo: MediaAsset | null | undefined; rotate?: number; className?: string; sizes: string; children?: ReactNode }) {
  return (
    <div className={cn("bg-inv-surface p-3 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.4)] sm:p-4", className)} style={{ transform: `rotate(${rotate}deg)` }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[color-mix(in_oklab,var(--inv-fg)_18%,var(--inv-surface))]">
        {photo ? <InvitationImage asset={photo} alt={photo.alt} fill sizes={sizes} className="object-cover" /> : null}
      </div>
      {children}
    </div>
  );
}

// ── Sections ────────────────────────────────────────────────────────────────

function Hero({ model, content }: SectionProps<"hero">) {
  const { wedding, media } = model;
  const place = model.events.ceremony?.venueName ?? model.events.reception?.venueName ?? "";
  return (
    <header id="hero" data-section="hero" className="relative overflow-hidden bg-inv-bg text-inv-fg">
      <div aria-hidden className="h-3" style={AIRMAIL} />
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-10 sm:pb-28">
        <div className="flex items-center justify-between">
          <p className={cn(MONO, "text-inv-fg")}>{content.eyebrow}</p>
          <p className={cn(MONO, "hidden text-inv-muted sm:block")}>{copy(model).parAvion}</p>
        </div>
        <div className="relative mt-10 sm:mt-14">
          <div data-hero-content className="relative mx-auto max-w-2xl -rotate-2">
            <Postcard photo={media.hero} sizes="(min-width: 768px) 640px, 90vw">
              <div className="flex items-end justify-between gap-4 px-1 pb-1 pt-5">
                <div>
                  <p className="font-inv-heading text-lg italic text-inv-muted sm:text-2xl">{copy(model).greetingsFrom}</p>
                  <h1 className="mt-1 font-inv-heading text-[clamp(2.4rem,9vw,4.5rem)] leading-[1]">
                    {wedding.partnerOne} <span className="italic text-inv-muted">&amp;</span> {wedding.partnerTwo}
                  </h1>
                </div>
              </div>
            </Postcard>
            <Stamp top={place.split(",")[0].slice(0, 14) || copy(model).withLove} bottom={wedding.date?.year ?? ""} className="absolute -end-2 -top-6 w-[4.6rem] rotate-6 sm:-end-8 sm:w-24" />
            <Postmark text={`${wedding.coupleName} · ${place}`.slice(0, 44)} date={wedding.date?.short ?? ""} className="absolute -top-10 end-14 w-40 sm:end-20 sm:w-52" />
          </div>
        </div>
        {wedding.date ? (
          <p data-reveal className="mt-14 text-center font-inv-heading text-[clamp(3.6rem,15vw,8rem)] leading-none tabular-nums">
            {wedding.date.short}
          </p>
        ) : null}
        {content.tagline ? <p className="mx-auto mt-4 max-w-md text-center text-inv-muted">{content.tagline}</p> : null}
      </div>
    </header>
  );
}

function Letter({ model, content }: SectionProps<"couple">) {
  return (
    <Block id="couple">
      <div data-reveal className="relative mx-auto max-w-2xl rotate-1 bg-inv-surface px-7 py-12 shadow-[0_24px_50px_-28px_rgb(0_0_0/0.45)] sm:px-14 sm:py-16">
        <p className={cn(MONO, "text-inv-muted")}>{content.eyebrow}</p>
        <p className="mt-6 font-inv-heading text-4xl leading-tight sm:text-5xl">{content.heading}</p>
        {content.message ? (
          <p className="mt-8 leading-[2.1] [background:repeating-linear-gradient(transparent_0_calc(2.1em-1px),color-mix(in_oklab,var(--inv-fg)_14%,transparent)_calc(2.1em-1px)_2.1em)]">
            {content.message}
          </p>
        ) : null}
        <p className="mt-8 font-inv-heading text-2xl italic text-inv-muted">— {model.wedding.coupleName}</p>
      </div>
    </Block>
  );
}

/** A calendar page with the day circled by hand. */
function CalendarPage({ model, content }: SectionProps<"date">) {
  const iso = model.wedding.weddingDate;
  if (!iso || !model.wedding.date) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // weeks start on Monday
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(model.locale, { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + i))),
  );
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <Block id="date" tone="surface">
      <Heading kicker={content.heading}>
        {model.wedding.date.month} {model.wedding.date.year}
      </Heading>
      <div data-reveal className="mx-auto max-w-md">
        <div className={cn(MONO, "grid grid-cols-7 border-b border-inv-border pb-3 text-center text-inv-muted")}>
          {weekdays.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-y-2 text-center font-inv-heading text-xl sm:text-2xl">
          {cells.map((day, i) => (
            <span key={i} className={cn("relative grid aspect-square place-items-center", day === d ? "text-inv-fg" : "opacity-45")}>
              {day ?? ""}
              {day === d ? (
                <svg aria-hidden viewBox="0 0 60 60" className="absolute inset-[-12%] text-inv-muted">
                  <path d="M30 6 C 48 5, 56 18, 55 31 C 54 46, 42 55, 29 55 C 14 55, 5 45, 6 30 C 7 16, 18 7, 34 9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              ) : null}
            </span>
          ))}
        </div>
        {content.note ? <p className="mt-8 text-center text-inv-muted">{content.note}</p> : null}
      </div>
    </Block>
  );
}

/** A split-flap departure board. */
function Departures({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Block id="countdown" tone="fg">
      <p data-reveal className={cn(MONO, "text-center opacity-70")}>
        {content.heading}
      </p>
      <div data-reveal className="mt-8">
        <Countdown
          model={model}
          className="mx-auto grid max-w-3xl grid-cols-4 gap-2 sm:gap-4"
          unitClassName="flex flex-col items-center"
          valueClassName="relative w-full rounded-[3px] bg-[color-mix(in_oklab,var(--inv-fg)_78%,black)] py-4 text-center font-inv-accent text-4xl tabular-nums text-inv-accent shadow-[inset_0_-1px_0_rgb(255_255_255/0.06)] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/40 sm:py-7 sm:text-6xl"
          labelClassName={cn(MONO, "mt-3 opacity-70")}
        />
      </div>
    </Block>
  );
}

function Journal({ model, content }: SectionProps<"story">) {
  const [p1, p2] = model.media.gallery;
  return (
    <Block id="story">
      <div className="grid gap-14 md:grid-cols-2">
        <div>
          <Heading kicker={copy(model).journal}>{content.heading}</Heading>
          <div data-reveal className="leading-[1.85] text-inv-fg/85 [&>p+p]:mt-5">
            <Paragraphs text={content.body} />
          </div>
          {content.quote ? (
            <figure data-reveal className="mt-10 border-s-2 border-inv-muted ps-5">
              <blockquote className="font-inv-heading text-2xl italic leading-snug">{content.quote}</blockquote>
              {content.quoteSource ? <figcaption className={cn(MONO, "mt-3 text-inv-muted")}>{content.quoteSource}</figcaption> : null}
            </figure>
          ) : null}
        </div>
        {/* A small scrapbook: two prints, taped. */}
        <div className="relative min-h-[26rem]">
          {p1 ? (
            <div data-reveal className="absolute end-0 top-0 w-[72%]">
              <Postcard photo={p1} rotate={3} sizes="(min-width: 768px) 340px, 70vw" />
              <span aria-hidden className="absolute -top-3 start-1/3 h-6 w-20 -rotate-6 bg-inv-accent/60" />
            </div>
          ) : null}
          {p2 ? (
            <div data-reveal className="absolute bottom-0 start-0 w-[62%]">
              <Postcard photo={p2} rotate={-4} sizes="(min-width: 768px) 300px, 60vw" />
              <span aria-hidden className="absolute -top-3 end-1/4 h-6 w-16 rotate-3 bg-inv-accent/60" />
            </div>
          ) : null}
        </div>
      </div>
    </Block>
  );
}

/** A boarding pass with a tear-off stub and a barcode. */
function BoardingPass({ id, model, content, event, flip }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string }; event: EventModel | null; flip?: boolean }) {
  if (!event) return null;
  const bars = Array.from({ length: 34 }, (_, i) => 1 + ((hash(`${event.id}${i}`) >>> 3) % 4));
  const notch: CSSProperties = {
    WebkitMask: "radial-gradient(circle 12px at var(--cut) 0, transparent 98%, black) top/100% 51% no-repeat, radial-gradient(circle 12px at var(--cut) 100%, transparent 98%, black) bottom/100% 51% no-repeat",
    mask: "radial-gradient(circle 12px at var(--cut) 0, transparent 98%, black) top/100% 51% no-repeat, radial-gradient(circle 12px at var(--cut) 100%, transparent 98%, black) bottom/100% 51% no-repeat",
  };
  return (
    <Block id={id} tone={flip ? "surface" : "bg"}>
      <p data-reveal className={cn(MONO, "mb-6 text-inv-muted")}>
        {content.heading}
      </p>
      <article
        data-reveal
        className={cn("grid bg-inv-accent text-inv-accent-fg [--cut:72%] sm:grid-cols-[72%_28%]", flip ? "rotate-[0.6deg]" : "-rotate-[0.6deg]")}
        style={notch}
      >
        <div className="p-6 sm:p-9">
          <div className={cn(MONO, "flex flex-wrap justify-between gap-2 opacity-80")}>
            <span>{content.heading}</span>
            <span>{model.wedding.coupleName}</span>
          </div>
          <p className="mt-6 font-inv-heading text-4xl leading-[1.02] sm:text-6xl">{event.venueName ?? event.title}</p>
          {event.address ? <p className="mt-2 text-sm opacity-80">{event.address}</p> : null}
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-dashed border-current/40 pt-5">
            {[
              [model.strings.time, event.timeLabel ?? "—"],
              [copy(model).date, event.dateLabel ?? model.wedding.date?.short ?? "—"],
              [copy(model).gate, event.title || id],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className={cn(MONO, "opacity-70")}>{k}</dt>
                <dd className="mt-1 font-inv-heading text-xl leading-tight sm:text-2xl">{v}</dd>
              </div>
            ))}
          </dl>
          {content.note ? <p className="mt-6 text-sm leading-relaxed opacity-85">{content.note}</p> : null}
        </div>
        <div className="flex flex-col justify-between gap-6 border-t-2 border-dashed border-current/35 p-6 sm:border-s-2 sm:border-t-0 sm:p-7">
          <div>
            <p className={cn(MONO, "opacity-70")}>{copy(model).admit}</p>
            <p className="font-inv-heading text-3xl">{copy(model).all}</p>
          </div>
          <svg aria-hidden viewBox="0 0 120 40" preserveAspectRatio="none" className="h-12 w-full">
            {bars.reduce<{ x: number; els: ReactNode[] }>(
              (acc, w, i) => {
                if (i % 2 === 0) acc.els.push(<rect key={i} x={acc.x} y="0" width={w} height="40" fill="currentColor" />);
                acc.x += w + 1;
                return acc;
              },
              { x: 0, els: [] },
            ).els}
          </svg>
          {event.mapUrl ? (
            <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className={cn(MONO, "underline decoration-dotted underline-offset-4 hover:decoration-solid")}>
              {model.strings.directions} →
            </a>
          ) : null}
        </div>
      </article>
    </Block>
  );
}

function MapSection({ model, content }: SectionProps<"venue">) {
  const mapped = model.events.all.filter((e) => e.mapEmbedUrl);
  if (!mapped.length) return null;
  return (
    <Block id="venue">
      <Heading kicker={copy(model).gettingThere}>{content.heading}</Heading>
      {content.note ? <p data-reveal className="-mt-6 mb-10 max-w-xl text-inv-fg/85">{content.note}</p> : null}
      <div className={cn("grid gap-10", mapped.length > 1 && "md:grid-cols-2")}>
        {mapped.map((event, i) => (
          <figure key={event.id} data-reveal className={cn("bg-inv-surface p-3 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)]", i % 2 ? "rotate-1" : "-rotate-1")}>
            {model.mode !== "export" ? <MapEmbed event={event} className="aspect-[4/3] sepia-[0.25]" /> : null}
            <figcaption className="flex items-baseline justify-between gap-4 px-1 pt-3">
              <span className="font-inv-heading text-xl">{event.venueName ?? event.title}</span>
              <span className={cn(MONO, "text-inv-muted")}>{event.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Block>
  );
}

function PostcardsHome({ model, content }: SectionProps<"gallery">) {
  const photos = model.media.gallery.slice(0, 8);
  if (!photos.length) return null;
  const tilt = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5];
  return (
    <Block id="gallery" tone="surface">
      <Heading kicker={copy(model).postcards}>{content.heading}</Heading>
      {content.caption ? <p className="-mt-6 mb-10 max-w-md text-inv-muted">{content.caption}</p> : null}
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <div key={photo.id} data-reveal className={cn("transition-transform duration-500 hover:z-10 hover:!rotate-0 hover:scale-[1.02]", i % 2 ? "sm:mt-10" : "")} style={{ transform: `rotate(${tilt[i % tilt.length]}deg)` }}>
            <Postcard photo={photo} sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw">
              <p className={cn(MONO, "px-1 pt-3 text-inv-muted")}>
                N°{String(i + 1).padStart(2, "0")} — {photo.alt}
              </p>
            </Postcard>
          </div>
        ))}
      </div>
    </Block>
  );
}

function Itinerary({ model, content }: SectionProps<"schedule">) {
  const items =
    content.items.length > 0
      ? content.items
      : model.events.all.filter((e) => e.timeLabel).map((e) => ({ time: e.timeLabel!, title: e.title || (e.venueName ?? ""), note: e.venueName ?? "" }));
  return (
    <Block id="schedule">
      <Heading kicker={copy(model).itinerary}>{content.heading}</Heading>
      <ol className="relative ms-3 border-s-2 border-dashed border-inv-muted/60 ps-8">
        {items.map((item, i) => (
          <li key={i} data-reveal className="relative pb-10 last:pb-0">
            <span aria-hidden className="absolute -start-[2.72rem] top-1 grid size-5 place-items-center rounded-full border-2 border-inv-muted bg-inv-bg">
              <span className="size-1.5 rounded-full bg-inv-muted" />
            </span>
            <p className={cn(MONO, "text-inv-muted")}>{item.time}</p>
            <p className="mt-1 font-inv-heading text-3xl leading-tight">{item.title}</p>
            {item.note ? <p className="mt-1 text-inv-fg/70">{item.note}</p> : null}
          </li>
        ))}
      </ol>
    </Block>
  );
}

function ReplyByPost({ model, content }: SectionProps<"rsvp">) {
  return (
    <Block id="rsvp">
      <div data-reveal className="relative mx-auto max-w-2xl bg-inv-surface p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)]">
        <div className="p-2" style={AIRMAIL}>
          <div className="relative bg-inv-surface px-6 py-12 text-center sm:px-14 sm:py-16">
            <Stamp top={copy(model).reply} bottom={model.wedding.date?.year ?? ""} className="absolute end-4 top-4 w-14 rotate-3 sm:w-16" />
            <p className={cn(MONO, "text-inv-muted")}>{content.deadline}</p>
            <p className="mt-5 font-inv-heading text-5xl leading-none sm:text-6xl">{content.heading}</p>
            {content.message ? <p className="mx-auto mt-6 max-w-md leading-relaxed text-inv-fg/85">{content.message}</p> : null}
            {content.linkUrl ? (
              <a
                href={content.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(MONO, "group/btn mt-10 inline-flex items-center gap-3 bg-inv-accent px-8 py-4 text-inv-accent-fg shadow-[3px_3px_0_var(--inv-fg)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--inv-fg)]")}
              >
                {content.linkLabel || content.heading} <span aria-hidden className="transition-transform group-hover/btn:translate-x-1 rtl:-scale-x-100">→</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Block>
  );
}

function TravelNotes({ model, content }: SectionProps<"faq">) {
  const items = content.items.filter((i) => i.question.trim());
  if (!items.length) return null;
  return (
    <Block id="faq" tone="surface">
      <Heading kicker={copy(model).notes}>{content.heading}</Heading>
      <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} data-reveal>
            <dt className="flex items-baseline gap-3">
              <span className={cn(MONO, "text-inv-muted")}>{copy(model).question}{i + 1}</span>
              <span className="font-inv-heading text-2xl leading-tight">{item.question}</span>
            </dt>
            <dd className="mt-3 whitespace-pre-line leading-relaxed text-inv-fg/80">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </Block>
  );
}

function WishYouWereHere({ content }: SectionProps<"closing">) {
  return (
    <Block id="closing" className="text-center">
      <p data-reveal className="font-inv-heading text-5xl italic leading-[1] sm:text-8xl">
        {content.heading}
      </p>
      {content.message ? <p data-reveal className="mx-auto mt-8 max-w-lg text-inv-fg/80">{content.message}</p> : null}
      {content.signature ? <p className={cn(MONO, "mt-8 text-inv-muted")}>{content.signature}</p> : null}
    </Block>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className="bg-inv-bg text-inv-fg">
      <div aria-hidden className="h-3" style={AIRMAIL} />
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 py-12 text-center">
        <p className="font-inv-heading text-4xl">
          {model.wedding.partnerOne} <span className="italic text-inv-muted">&amp;</span> {model.wedding.partnerTwo}
        </p>
        <p className={cn(MONO, "text-inv-muted")}>{[model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}</p>
      </div>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Letter,
  date: CalendarPage,
  countdown: Departures,
  story: Journal,
  ceremony: (p) => <BoardingPass id="ceremony" model={p.model} content={p.content} event={p.model.events.ceremony} />,
  reception: (p) => <BoardingPass id="reception" model={p.model} content={p.content} event={p.model.events.reception} flip />,
  venue: MapSection,
  gallery: PostcardsHome,
  schedule: Itinerary,
  rsvp: ReplyByPost,
  faq: TravelNotes,
  closing: WishYouWereHere,
  footer: Footer,
};

export default function PostaleRenderer({ model }: TemplateRendererProps) {
  return (
    <InvitationRoot model={model} className="font-inv-body">
      <main>
        <Sections model={model} components={sections} />
      </main>
      <CinematicMotion model={model} />
      <MusicToggle model={model} />
    </InvitationRoot>
  );
}

import type { ReactNode } from "react";
import type { EventModel, InvitationModel } from "@/core/invitation/model";
import { cn } from "@/lib/utils";
import { Countdown } from "../shared/countdown";
import { InvitationImage } from "../shared/invitation-image";
import { InvitationRoot, Paragraphs, Sections } from "../shared/invitation-root";
import { MapEmbed } from "../shared/map-embed";
import { MusicToggle } from "../shared/music-toggle";
import type { SectionComponents, SectionProps, TemplateRendererProps } from "../types";
import { HeroSky, ShowpieceEffects } from "./effects";
import { CREATIVE_EMBLEMS, CREATIVE_HEROES } from "./creative";
import { LANDMARK_EMBLEMS, LANDMARK_HEROES } from "./landmarks";
import { Flower } from "./flower";
import { ShowpieceOpening } from "./opening";
import styles from "./showpiece.module.css";
import { lookOf, type Variant } from "./variants";

/**
 * The Showpiece family — four wedding websites with their own opening moment
 * and motion, drawn by one layout:
 *
 * - gate:      palace doors sealed with the couple's initials. Colours:
 *              bg/surface = paper, fg = ink, accent = the room colour (doors,
 *              dark bands), accent-fg = the gold on it.
 * - nile:      lanterns over the river at night. bg/surface = night, fg =
 *              champagne, muted = mist, accent = lantern light.
 * - herbarium: a linen book of pressed flowers. bg/surface = paper, fg = ink,
 *              muted = petal colour, accent = leaf (cover, buttons).
 * - toast:     Art Deco and champagne. bg/surface = the room at night, fg =
 *              pearl, accent (and muted) = gold, accent-fg = text on gold.
 *
 * Fonts: heading = display serif, body = sans, accent = script or Deco
 * display for names and kickers. Everything reads with no JavaScript; the
 * opening and effects are client islands layered on top.
 */

const KICKERS = {
  en: { story: "Our story", day: "The day", where: "Where", reply: "Kindly reply", moments: "Moments", until: "Until the day", questions: "Good to know", letter: "A note from us" },
  ar: { story: "حكايتنا", day: "اليوم الكبير", where: "المكان", reply: "تأكيد الحضور", moments: "لحظات", until: "العد التنازلي", questions: "معلومات تهمّكم", letter: "كلمة منّا" },
} as const;
const kick = (model: InvitationModel) => KICKERS[model.locale as keyof typeof KICKERS] ?? KICKERS.en;
const variantOf = (model: InvitationModel): Variant => model.template.renderer as Variant;
/** How the shared sections are dressed (see ./variants). */
const look = (model: InvitationModel) => lookOf(variantOf(model));

/** Heroes and RSVP emblems drawn by the newer variants. */
const HEROES = { ...CREATIVE_HEROES, ...LANDMARK_HEROES };
const EMBLEMS = { ...CREATIVE_EMBLEMS, ...LANDMARK_EMBLEMS };
/** Variants whose names are set in gold foil. */
const FOIL: ReadonlySet<Variant> = new Set<Variant>(["gate", "toast", "glass", "keepsake", "baron", "luxor", "giza"]);

function Block({ id, children, className, tone }: { id: string; children: ReactNode; className?: string; tone?: "surface" | "band" }) {
  return (
    <section id={id} data-section={id} className={cn(styles.block, tone === "surface" && styles.surface, tone === "band" && styles.band, className)}>
      {children}
    </section>
  );
}

function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div data-fx="rise" className={styles.center}>
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      {children ? <h2 className={styles.title}>{children}</h2> : null}
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────

function Hero({ model, content }: SectionProps<"hero">) {
  const v = variantOf(model);
  const { wedding, media } = model;
  const names = (
    <h1 className={styles.names}>
      <span className={FOIL.has(v) ? styles.foil : undefined}>{wedding.partnerOne}</span>
      <span className={styles.amp}>&amp;</span>
      <span className={FOIL.has(v) ? styles.foil : undefined}>{wedding.partnerTwo}</span>
    </h1>
  );
  const text = (
    <>
      {content.eyebrow ? <p className={styles.eyebrow}>{content.eyebrow}</p> : null}
      {names}
      {wedding.date ? <p className={styles.date}>{wedding.date.long}</p> : null}
      {content.tagline ? <p className={styles.tagline}>{content.tagline}</p> : null}
      <span className={styles.cue}>{model.strings.scroll}</span>
    </>
  );

  const Art = HEROES[v];
  return (
    <header id="hero" data-section="hero" className={styles.hero}>
      {Art ? <Art model={model} text={text} /> : null}

      {v === "gate" ? (
        <>
          <HeroSky model={model} kind="flecks" />
          <div className={cn(styles.col, styles.heroInner)}>
            <div aria-hidden className={styles.stack}>
              <div className={styles.tilt} data-tilt>
                <div className={cn(styles.pc, styles.pc1)} />
                <div className={cn(styles.pc, styles.pc2)} />
                <div className={cn(styles.pc, styles.pc3)}>
                  {media.hero ? (
                    <InvitationImage asset={media.hero} alt="" fill sizes="170px" priority className="object-cover" />
                  ) : (
                    <div>
                      <div className={styles.n}>{wedding.partnerOne}</div>
                      <small>&amp;</small>
                      <div className={styles.n}>{wedding.partnerTwo}</div>
                      {wedding.date ? <small>{wedding.date.short}</small> : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {text}
          </div>
        </>
      ) : null}

      {v === "nile" ? (
        <>
          <div className={styles.layer} data-depth="0.15"><HeroSky model={model} kind="stars" /></div>
          <div className={styles.layer} data-depth="0.35"><div aria-hidden className={styles.moon} /></div>
          <div className={cn(styles.layer, styles.palms)} data-depth="0.6" aria-hidden>
            <svg viewBox="0 0 200 160" style={{ insetInlineStart: "-4%" }}><path d="M60 160 C62 110 66 80 72 50 M72 50 C50 40 30 44 14 58 M72 50 C60 30 44 22 26 24 M72 50 C80 28 96 18 116 20 M72 50 C94 40 112 44 126 58 M72 50 C70 34 72 20 80 8" stroke="currentColor" strokeWidth="7" fill="none" strokeLinecap="round" /></svg>
            <svg viewBox="0 0 200 160" style={{ insetInlineEnd: "-6%", height: "80%" }}><path d="M120 160 C118 120 112 90 104 60 M104 60 C84 50 66 54 52 66 M104 60 C94 40 80 32 64 34 M104 60 C112 38 126 30 146 32 M104 60 C124 52 140 56 152 68" stroke="currentColor" strokeWidth="7" fill="none" strokeLinecap="round" /></svg>
          </div>
          <div className={styles.layer} data-depth="0.8"><div aria-hidden className={styles.river} /></div>
          <div className={cn(styles.col, styles.heroInner)}>{text}</div>
        </>
      ) : null}

      {v === "herbarium" ? (
        <>
          <Sprig className={cn(styles.sprig, styles.sprigA)} />
          <Sprig className={cn(styles.sprig, styles.sprigB)} />
          <div className={cn(styles.col, styles.heroInner)}>
            {media.hero ? (
              <div className={styles.oval}>
                <InvitationImage asset={media.hero} alt="" fill sizes="180px" priority className="object-cover" />
              </div>
            ) : null}
            {text}
          </div>
        </>
      ) : null}

      {v === "toast" ? (
        <>
          <div aria-hidden className={styles.sun} data-depth="0.25" />
          <div className={cn(styles.col, styles.heroInner)}>
            <div className={styles.arch}>
              {media.hero ? (
                <div className={styles.archPhoto}>
                  <InvitationImage asset={media.hero} alt="" fill sizes="130px" priority className="object-cover" />
                </div>
              ) : null}
              {text}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}

function Sprig({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 80" className={className} data-tilt>
      <path d="M10 70 C30 50 60 30 92 10" stroke="var(--inv-accent)" strokeWidth="1.6" fill="none" />
      <path d="M30 52 c-10 -10 -8 -20 0 -24 c4 8 6 16 0 24z" fill="var(--inv-accent)" opacity=".7" />
      <path d="M50 38 c10 -2 18 4 20 12 c-8 2 -16 -2 -20 -12z" fill="var(--inv-accent)" opacity=".45" />
      <path d="M64 28 c-6 -10 -2 -18 6 -20 c2 8 0 14 -6 20z" fill="var(--inv-accent)" opacity=".7" />
      <circle cx="90" cy="12" r="6" fill="var(--inv-muted)" opacity=".7" />
    </svg>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────

function Letter({ model, content }: SectionProps<"couple">) {
  return (
    <Block id="couple">
      <div className={styles.col}>
        <div data-fx="rise" className={styles.letter} data-tilt="page">
          <p className={styles.kicker}>{content.eyebrow || kick(model).letter}</p>
          {content.heading ? <p className={styles.heading}>{content.heading}</p> : null}
          {content.message ? <p className={cn(styles.prose, "mt-5")}>{content.message}</p> : null}
          <p className={styles.sign}>{model.wedding.coupleName}</p>
        </div>
      </div>
    </Block>
  );
}

function DateBlock({ model, content }: SectionProps<"date">) {
  if (!model.wedding.date) return null;
  return (
    <Block id="date" tone="surface">
      <div className={styles.col}>
        <Title kicker={content.heading}>{model.wedding.date.long}</Title>
        {content.note ? <p className={cn(styles.center, styles.muted, "mt-4")}>{content.note}</p> : null}
      </div>
    </Block>
  );
}

function CountdownBlock({ model, content }: SectionProps<"countdown">) {
  if (!model.countdownTarget) return null;
  return (
    <Block id="countdown">
      <div className={styles.col}>
        <Title kicker={kick(model).until}>{content.heading}</Title>
        <div data-fx="rise">
          <Countdown model={model} className={styles.count} unitClassName={styles.unit} valueClassName={styles.value} labelClassName={styles.label} />
        </div>
      </div>
    </Block>
  );
}

function Story({ model, content }: SectionProps<"story">) {
  const photos = model.media.gallery.slice(0, 3);
  return (
    <Block id="story" tone="surface">
      <div className={styles.col}>
        <Title kicker={kick(model).story}>{content.heading}</Title>
        {photos.length ? (
          <div className={styles.fan} data-fx>
            {photos.map((p) => (
              <div key={p.id} className={styles.shot}>
                <div><InvitationImage asset={p} alt={p.alt} fill sizes="200px" className="object-cover" /></div>
              </div>
            ))}
          </div>
        ) : look(model) === "herbarium" ? (
          <div data-fx="rise" className={cn(styles.center, "mt-8")}><Flower /></div>
        ) : null}
        {content.body ? (
          <div data-fx="rise" className={cn(styles.prose, "mt-8")}>
            <Paragraphs text={content.body} />
          </div>
        ) : null}
        {content.quote ? (
          <figure data-fx="rise" className={styles.center}>
            <blockquote className={styles.quote}>{content.quote}</blockquote>
            {content.quoteSource ? <figcaption className={styles.quoteSource}>{content.quoteSource}</figcaption> : null}
          </figure>
        ) : null}
      </div>
    </Block>
  );
}

function EventCard({ id, model, content, event }: { id: "ceremony" | "reception"; model: InvitationModel; content: { heading: string; note: string }; event: EventModel | null }) {
  if (!event) return null;
  return (
    <Block id={id} tone={id === "reception" ? "surface" : undefined}>
      <div className={styles.col}>
        <Title kicker={event.title || undefined}>{content.heading}</Title>
        <div data-fx="rise" style={{ perspective: "900px" }}>
          <article className={cn(styles.event, styles.tilt3d)} data-tilt="page">
            <h3>{event.venueName ?? event.title}</h3>
            {event.address ? <p className={styles.addr}>{event.address}</p> : null}
            <dl className={styles.facts}>
              {event.dateLabel || model.wedding.date ? (
                <div><dt>{model.locale === "ar" ? "التاريخ" : "Date"}</dt><dd>{event.dateLabel ?? model.wedding.date?.short}</dd></div>
              ) : null}
              {event.timeLabel ? <div><dt>{model.strings.time}</dt><dd>{event.timeLabel}</dd></div> : null}
            </dl>
            {content.note ? <p className={cn(styles.muted, "mt-4")}>{content.note}</p> : null}
            {event.mapUrl ? (
              <a className={styles.btn} href={event.mapUrl} target="_blank" rel="noopener noreferrer">{model.strings.directions}</a>
            ) : null}
          </article>
        </div>
      </div>
    </Block>
  );
}

function Venue({ model, content }: SectionProps<"venue">) {
  const mapped = model.events.all.filter((e) => e.mapEmbedUrl);
  if (!mapped.length) return null;
  return (
    <Block id="venue">
      <div className={styles.col}>
        <Title kicker={kick(model).where}>{content.heading}</Title>
        {content.note ? <p data-fx="rise" className={cn(styles.center, styles.muted, "mt-4")}>{content.note}</p> : null}
        {mapped.map((e) => (
          <figure key={e.id} data-fx="rise" className="m-0 mt-8">
            {model.mode !== "export" ? <MapEmbed event={e} className={styles.map} /> : null}
            <figcaption className={cn(styles.center, "mt-3")}>
              <span className="font-inv-heading text-xl">{e.venueName ?? e.title}</span>
              {e.address ? <span className={cn(styles.muted, "block text-sm")}>{e.address}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Block>
  );
}

function Schedule({ model, content }: SectionProps<"schedule">) {
  const items =
    content.items.length > 0
      ? content.items
      : model.events.all.filter((e) => e.timeLabel).map((e) => ({ time: e.timeLabel!, title: e.title || (e.venueName ?? ""), note: e.venueName ?? "" }));
  if (!items.length) return null;
  const variant = look(model);
  return (
    <Block id="schedule" tone={variant === "nile" || variant === "toast" ? "band" : undefined}>
      <div className={styles.col}>
        <Title kicker={kick(model).day}>{content.heading}</Title>
        {variant === "toast" ? (
          <div data-fx="rise" className={styles.menu}>
            {items.map((item, i) => (
              <div key={i} className={styles.course}>
                <time>{item.time}</time>
                <h3>{item.title}</h3>
                {item.note ? <p>{item.note}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.timeline} data-progress>
            <span aria-hidden className={styles.line} />
            {items.map((item, i) => (
              <div key={i} className={styles.ev} data-step>
                {variant === "herbarium" ? (
                  <svg aria-hidden viewBox="0 0 32 42" className={styles.stem}>
                    <path d={i % 2 ? "M4 40 C10 24 20 30 28 4" : "M4 40 C20 30 12 14 28 4"} stroke="currentColor" strokeWidth="1.6" fill="none" />
                  </svg>
                ) : null}
                <time>{item.time}</time>
                <h3>{item.title}</h3>
                {item.note ? <p>{item.note}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Block>
  );
}

function Gallery({ model, content }: SectionProps<"gallery">) {
  const photos = model.media.gallery.slice(0, 9);
  if (!photos.length) return null;
  return (
    <Block id="gallery" tone="surface">
      <div className={styles.wide}>
        <Title kicker={kick(model).moments}>{content.heading}</Title>
        {content.caption ? <p className={cn(styles.center, styles.muted, "mt-4")}>{content.caption}</p> : null}
        <div className={styles.grid}>
          {photos.map((p) => (
            <div key={p.id} data-fx="rise" className={cn(styles.photo, styles.tilt3d)} data-tilt="page">
              {look(model) === "herbarium" ? (
                <div><InvitationImage asset={p} alt={p.alt} fill sizes="(min-width: 720px) 300px, 45vw" className="object-cover" /></div>
              ) : (
                <InvitationImage asset={p} alt={p.alt} fill sizes="(min-width: 720px) 300px, 45vw" className="object-cover" />
              )}
            </div>
          ))}
        </div>
      </div>
    </Block>
  );
}

function Reply({ model, content }: SectionProps<"rsvp">) {
  const variant = variantOf(model);
  const Emblem = EMBLEMS[variant];
  return (
    <Block id="rsvp" tone={look(model) === "gate" ? "band" : undefined}>
      <div className={cn(styles.col, styles.reply)}>
        <div data-fx="rise">
          {Emblem ? <span aria-hidden className={styles.emblem}><Emblem model={model} /></span> : null}
          {variant === "gate" ? <span aria-hidden className={cn(styles.emblem, styles.seal)}>{model.wedding.initials[0]}&amp;{model.wedding.initials[1]}</span> : null}
          {variant === "nile" ? <span aria-hidden className={cn(styles.emblem, styles.lantern)} /> : null}
          {variant === "herbarium" ? <span className={styles.emblem}><Flower /></span> : null}
          {variant === "toast" ? (
            <svg aria-hidden viewBox="0 0 120 150" className={styles.emblem} style={{ color: "var(--gold)" }}>
              <path d="M10 28 Q60 92 110 28 Z" fill="currentColor" opacity=".35" />
              <path d="M10 28 Q60 92 110 28" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M60 66 V128 M36 132 H84" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : null}
          {content.deadline ? <p className={styles.deadline}>{content.deadline}</p> : null}
          <h2 className={styles.title}>{content.heading || kick(model).reply}</h2>
          {content.message ? <p className={cn(styles.muted, "mx-auto mt-4 max-w-md")}>{content.message}</p> : null}
          {content.linkUrl ? (
            <a className={styles.btn} href={content.linkUrl} target="_blank" rel="noopener noreferrer">
              {content.linkLabel || content.heading}
            </a>
          ) : null}
        </div>
      </div>
    </Block>
  );
}

function Faq({ model, content }: SectionProps<"faq">) {
  const items = content.items.filter((i) => i.question.trim());
  if (!items.length) return null;
  return (
    <Block id="faq" tone="surface">
      <div className={styles.col}>
        <Title kicker={kick(model).questions}>{content.heading}</Title>
        <dl className="mt-8 grid gap-7">
          {items.map((item, i) => (
            <div key={i} data-fx="rise">
              <dt className="font-inv-heading text-xl">{item.question}</dt>
              <dd className={cn(styles.muted, "mt-2 whitespace-pre-line")}>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Block>
  );
}

function Closing({ content }: SectionProps<"closing">) {
  return (
    <Block id="closing">
      <div className={cn(styles.col, styles.center)}>
        <p data-fx="rise" className={styles.title}>{content.heading}</p>
        {content.message ? <p data-fx="rise" className={cn(styles.muted, "mx-auto mt-5 max-w-md")}>{content.message}</p> : null}
        {content.signature ? <p data-fx="rise" className={cn(styles.kicker, "mt-6")}>{content.signature}</p> : null}
      </div>
    </Block>
  );
}

function Footer({ model, content }: SectionProps<"footer">) {
  return (
    <footer data-section="footer" className={styles.footer}>
      <span className={styles.mono}>{model.wedding.initials[0]} &amp; {model.wedding.initials[1]}</span>
      <p className="m-0 font-inv-heading text-lg">{model.wedding.coupleName}</p>
      <p className={cn(styles.muted, "m-0 mt-1")}>{[model.wedding.date?.short, content.note].filter(Boolean).join(" · ")}</p>
    </footer>
  );
}

const sections: SectionComponents = {
  hero: Hero,
  couple: Letter,
  date: DateBlock,
  countdown: CountdownBlock,
  story: Story,
  ceremony: (p) => <EventCard id="ceremony" model={p.model} content={p.content} event={p.model.events.ceremony} />,
  reception: (p) => <EventCard id="reception" model={p.model} content={p.content} event={p.model.events.reception} />,
  venue: Venue,
  schedule: Schedule,
  gallery: Gallery,
  rsvp: Reply,
  faq: Faq,
  closing: Closing,
  footer: Footer,
};

export default function ShowpieceRenderer({ model }: TemplateRendererProps) {
  const variant = variantOf(model);
  return (
    <InvitationRoot model={model} className="font-inv-body">
      <div data-showpiece data-v={variant} data-look={lookOf(variant)} className={styles.root}>
        <main>
          <Sections model={model} components={sections} />
        </main>
        {model.mode !== "export" ? <ShowpieceOpening model={model} variant={variant} /> : null}
        <ShowpieceEffects model={model} />
      </div>
      <MusicToggle model={model} />
    </InvitationRoot>
  );
}

/* eslint-disable @next/next/no-img-element -- phone screens drawn as stills */
import Link from "next/link";
import type { ReactNode } from "react";
import { selectableTemplates } from "@/templates/registry";
import { designInfo } from "../design-info";
import { Coverflow } from "../play/coverflow";
import { PreviewProvider, type PreviewDesign } from "../play/preview-dialog";
import { templatesFor, websiteOrder } from "../products";
import { DesignSwitch } from "./design-switch";
import { Faq } from "./faq";

const PRICE = "1000";

const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent ${className}`}>{children}</p>
);
const H2 = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <h2 className={`font-serif text-[clamp(2.3rem,4.6vw,3.4rem)] font-light leading-[1.02] text-balance ${className}`}>{children}</h2>
);
const Btn = ({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) => (
  <Link
    href={href}
    className={
      light
        ? "inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-[0.95rem] font-medium transition-colors hover:border-muted-foreground"
        : "inline-flex h-12 items-center rounded-full bg-primary px-6 text-[0.95rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    }
  >
    {children}
  </Link>
);

function Hero() {
  return (
    <section className="px-5 pb-14 pt-10 sm:px-8 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>Wedding websites · English &amp; العربية</Eyebrow>
          <h1 className="mt-4 font-serif text-[clamp(2.9rem,6.2vw,5.1rem)] font-light leading-[0.98] tracking-[-0.01em] text-balance">
            Your invitation opens. <em className="text-accent">Their replies</em> come back to you.
          </h1>
          <p className="mt-5 max-w-[31rem] text-lg text-muted-foreground">
            Pick a design, add your names and photos, and send one link on WhatsApp. Every guest&apos;s reply is saved in your own guest list, so you always know who is coming.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn href="/websites">Choose a design</Btn>
            <Btn href="/guests" light>
              See how replies work
            </Btn>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            {["Free to build and preview", `Pay ${PRICE} EGP when you publish`, "Change design any time"].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-success" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden className="relative mx-auto h-[28rem] w-full max-w-[26rem] lg:h-[clamp(29rem,46vw,36rem)] lg:max-w-none">
          <div className="absolute end-[2%] top-[6%] z-[1] aspect-[390/844] h-[88%] rotate-[5deg] rounded-[2.1rem] bg-[#1d1b19] p-1.5 shadow-[0_40px_60px_-30px_rgb(34_29_26/0.55)]">
            <div className="grid size-full content-start gap-2.5 overflow-hidden rounded-[1.75rem] bg-card px-3.5 pt-9 text-[0.7rem]">
              <p className="font-serif text-lg">Replies</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[["84%", "replied"], ["41", "coming"], ["3", "can't come"], ["5", "waiting"]].map(([v, l]) => (
                  <div key={l} className="rounded-lg bg-muted px-2 py-1.5">
                    <b className="block font-serif text-xl font-medium leading-tight">{v}</b>
                    {l}
                  </div>
                ))}
              </div>
              {[["Mariam & family", "4", "ok"], ["Uncle Hossam", "2", "ok"], ["Nour Adel", "…", "wait"], ["The Fahmy family", "0", "no"]].map(([n, c, k]) => (
                <div key={n} className="flex items-center justify-between border-b border-border py-1.5">
                  <span>{n}</span>
                  <span className={k === "ok" ? "rounded-full bg-[#e3ece5] px-2 text-success" : k === "no" ? "rounded-full bg-[#f4e2df] px-2 text-destructive" : "rounded-full bg-[#f3ead6] px-2 text-[#8a6a2c]"}>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute start-[8%] top-0 z-[2] aspect-[390/844] h-full rounded-[2.1rem] bg-[#1d1b19] p-1.5 shadow-[0_40px_60px_-30px_rgb(34_29_26/0.55)]">
            <img src="/marketing/screens/olive-courtyard-hero.webp" alt="" className="size-full rounded-[1.75rem] object-cover" />
          </div>
          <div className="home-toast absolute bottom-[12%] start-[-2%] z-[3] flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-sm shadow-[0_18px_34px_-16px_rgb(34_29_26/0.4)]">
            <span className="grid size-8 place-items-center rounded-full bg-[#e3ece5] font-semibold text-success">✓</span>
            <span>
              <b className="block font-medium">Mariam &amp; family are coming</b>
              <span className="text-xs text-muted-foreground">4 guests · just now</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats({ count }: { count: number }) {
  const items = [
    [String(count), "original designs"],
    ["EN · ع", "English or Arabic"],
    ["1 link", "for every guest"],
    ["Every reply", "saved for you"],
  ];
  return (
    <div className="border-y border-border">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-6 text-center sm:px-8 md:grid-cols-4">
        {items.map(([v, l]) => (
          <div key={l}>
            <dt className="sr-only">{l}</dt>
            <dd className="font-serif text-3xl">{v}</dd>
            <dd className="text-sm text-muted-foreground">{l}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Loved({ designs, total }: { designs: PreviewDesign[]; total: number }) {
  return (
    <section className="scroll-mt-24 pt-20 sm:pt-24" id="designs">
      <div className="mx-auto mb-6 max-w-2xl px-5 text-center">
        <Eyebrow>Most loved</Eyebrow>
        <H2 className="mt-3">Designs couples choose most</H2>
        <p className="mt-3 text-muted-foreground">The design in the middle opens and plays by itself. Tap any other to bring it forward.</p>
      </div>
      <Coverflow designs={designs} />
      <div className="mt-8 text-center">
        <Btn href="/websites" light>
          See all {total} designs →
        </Btn>
      </div>
    </section>
  );
}

const STEP_ART = [
  <svg key="a" viewBox="0 0 300 136" aria-hidden className="h-34 w-full rounded-xl bg-muted">
    <g fill="none" stroke="#9c7a4c" strokeWidth="1.4">
      <rect x="58" y="22" width="52" height="96" rx="9" fill="#fbf9f5" />
      <rect x="124" y="14" width="52" height="104" rx="9" fill="#fbf9f5" stroke="#26332b" strokeWidth="1.8" />
      <rect x="190" y="22" width="52" height="96" rx="9" fill="#fbf9f5" />
      <path d="M70 44h28M74 54h20M136 38h28M140 48h20M202 44h28M206 54h20" />
      <circle cx="150" cy="80" r="12" />
      <path d="M144 80l4 4 8-8" stroke="#3d6b4f" strokeWidth="1.8" />
    </g>
  </svg>,
  <svg key="b" viewBox="0 0 300 136" aria-hidden className="h-34 w-full rounded-xl bg-muted">
    <g fill="none" stroke="#9c7a4c" strokeWidth="1.4">
      <rect x="62" y="16" width="176" height="104" rx="10" fill="#fbf9f5" />
      <path d="M62 34h176" />
      <circle cx="74" cy="25" r="2.5" />
      <circle cx="83" cy="25" r="2.5" />
      <rect x="78" y="48" width="60" height="58" rx="6" />
      <path d="M84 96l14-16 10 10 8-8 16 14" />
      <circle cx="122" cy="62" r="5" />
      <path d="M154 52h66M154 64h48M154 82h66M154 94h40" strokeLinecap="round" />
      <path d="M206 64l16-16 6 6-16 16-8 2z" stroke="#26332b" strokeWidth="1.6" fill="#fbf9f5" />
    </g>
  </svg>,
  <svg key="c" viewBox="0 0 300 136" aria-hidden className="h-34 w-full rounded-xl bg-muted">
    <g fill="none" stroke="#9c7a4c" strokeWidth="1.4">
      <rect x="96" y="10" width="108" height="118" rx="12" fill="#fbf9f5" />
      <path d="M108 32h70a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6h-52l-10 8v-8h-8a6 6 0 0 1-6-6V38a6 6 0 0 1 6-6z" fill="#efe9e1" />
      <path d="M118 44h44M118 52h28" strokeLinecap="round" />
      <path d="M192 76h-70a6 6 0 0 0-6 6v18a6 6 0 0 0 6 6h52l10 8v-8h8a6 6 0 0 0 6-6V82a6 6 0 0 0-6-6z" fill="#e3ece5" stroke="#3d6b4f" />
      <path d="M128 90l5 5 9-9" stroke="#3d6b4f" strokeWidth="1.8" />
      <path d="M150 92h28" stroke="#3d6b4f" strokeLinecap="round" />
    </g>
  </svg>,
];

function HowItWorks() {
  const steps = [
    ["Choose a design", "Watch each one open, then pick the one that feels like you. You can change it later."],
    ["Add your details", "Names, date, venues, the day's plan and your photos, in English, Arabic or both."],
    ["Send one link", "Share it on WhatsApp. Guests reply on the invitation and you see every answer."],
  ];
  return (
    <section id="how-it-works" className="scroll-mt-24 px-5 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>How it works</Eyebrow>
        <H2 className="mt-3">Ready in an evening</H2>
        <p className="mt-3 max-w-xl text-muted-foreground">No design skills needed. Every design already has its colours, fonts and layout chosen for you.</p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(([h, b], i) => (
            <li key={h} className="grid content-start gap-3 rounded-2xl border border-border bg-card p-6">
              {STEP_ART[i]}
              <span className="text-[0.72rem] font-medium uppercase tracking-[0.2em] text-accent">Step {i + 1}</span>
              <h3 className="font-serif text-3xl leading-tight">{h}</h3>
              <p className="text-[0.95rem] text-muted-foreground">{b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Replies() {
  return (
    <section id="replies" className="mt-24 scroll-mt-24 bg-primary text-primary-foreground sm:mt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow className="text-[#c9b38a]">Guests &amp; replies</Eyebrow>
          <H2 className="mt-3">Know who&apos;s coming without counting chats</H2>
          <ul className="mt-6 grid gap-2.5 text-[#cfd6cc]">
            {[
              "Guests reply on the invitation: coming or not, how many, and a note",
              "Every reply is saved straight to your guest list",
              "Give each guest their own link, with their name on the invitation",
              "See replied, coming, can't come and still waiting at a glance",
              "Download the list for seating or the venue",
            ].map((x) => (
              <li key={x} className="grid grid-cols-[1.2rem_1fr] gap-2">
                <span aria-hidden className="text-[#c9b38a]">✓</span>
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <div className="flex flex-wrap gap-3">
              <Link href="/guests" className="inline-flex h-12 items-center rounded-full bg-primary-foreground px-6 font-medium text-primary">
                See your guest list
              </Link>
              <Link href="/websites" className="inline-flex h-12 items-center rounded-full border border-primary-foreground/40 px-6 font-medium text-primary-foreground">
                Start your invitation
              </Link>
            </div>
          </div>
        </div>
        <div aria-hidden className="grid gap-4 rounded-2xl bg-card p-5 text-foreground shadow-[0_30px_50px_-30px_#000]">
          <div className="flex items-baseline justify-between">
            <b className="font-serif text-2xl font-medium">Emma &amp; James</b>
            <span className="text-sm text-muted-foreground">58 guests</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[["84%", "replied", ""], ["41", "coming", "text-success"], ["3", "can't come", "text-destructive"], ["5", "waiting", "text-[#8a6a2c]"]].map(([v, l, c]) => (
              <div key={l} className="rounded-xl border border-border px-3 py-2.5">
                <b className={`block font-serif text-3xl font-medium ${c}`}>{v}</b>
                <span className="text-xs text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <i className="basis-[73%] bg-success" />
            <i className="basis-[9%] bg-destructive" />
            <i className="basis-[18%] bg-[#d8c49a]" />
          </div>
        </div>
      </div>
    </section>
  );
}

const ICONS: Record<string, ReactNode> = {
  env: <><path d="M3 6.5h18v11H3z" /><path d="M3 6.5l9 7 9-7" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  pin: <><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  list: <><path d="M8 6.5h12M8 12h12M8 17.5h12" /><circle cx="4" cy="6.5" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="17.5" r="1" /></>,
  photo: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 16l5-5 4 4 3-3 6 5" /><circle cx="15.5" cy="9" r="1.6" /></>,
  check: <><rect x="4" y="3.5" width="16" height="17" rx="2" /><path d="M8 12l3 3 5-6" /></>,
  lang: <><path d="M4 6h9M8.5 4v2M6 6c.5 3 3 6 6 7.5M11 6c-.5 3-3 6-6 7.5" /><path d="M13 20l4-9 4 9M14.4 17h5.2" /></>,
  music: <><path d="M9 18V6l11-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>,
};
function Features() {
  const items: [string, string, string][] = [
    ["env", "An opening like real paper", "Guests tap a seal or an envelope and the invitation unfolds."],
    ["clock", "Countdown", "Days, hours and minutes to your wedding, with Add to calendar."],
    ["pin", "Venues and directions", "One tap opens the way in Google Maps."],
    ["list", "The day's plan", "Ceremony, dinner, dancing: every time in one place."],
    ["photo", "Your photos", "A gallery of your favourite pictures together."],
    ["check", "Replies saved for you", "Who's coming, how many, and their notes."],
    ["lang", "English and Arabic", "Every design reads right to left too."],
    ["music", "Music", "Your song plays softly when guests open it."],
  ];
  return (
    <section id="features" className="scroll-mt-24 px-5 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>In every design</Eyebrow>
        <H2 className="mt-3">Everything your guests need, in one link</H2>
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
          {items.map(([k, h, b]) => (
            <li key={h} className="grid content-start gap-2">
              <svg viewBox="0 0 24 24" aria-hidden className="size-11 rounded-xl bg-muted p-2.5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[k]}
              </svg>
              <h3 className="font-serif text-2xl leading-tight">{h}</h3>
              <p className="text-sm text-muted-foreground">{b}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Pricing() {
  const tick = (x: string) => (
    <li key={x} className="grid grid-cols-[1.3rem_1fr]">
      <span aria-hidden className="font-semibold text-success">✓</span>
      {x}
    </li>
  );
  return (
    <section id="pricing" className="scroll-mt-24 px-5 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>Price</Eyebrow>
        <H2 className="mt-3">One price, no surprises</H2>
        <div className="mt-8 grid overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-2">
          <div className="grid content-start gap-4 bg-muted p-8 sm:p-10">
            <Eyebrow>Before you pay</Eyebrow>
            <p className="font-serif text-6xl font-light">Free</p>
            <ul className="grid gap-2 text-[0.95rem]">{["Try every design with your own names", "Add your details and photos", "Preview it on your phone as long as you like"].map(tick)}</ul>
          </div>
          <div className="grid content-start gap-4 p-8 sm:p-10">
            <Eyebrow>When you&apos;re ready to send</Eyebrow>
            <p className="font-serif text-6xl font-light">
              {PRICE}
              <small className="ms-2 font-sans text-sm text-muted-foreground">EGP, once</small>
            </p>
            <ul className="grid gap-2 text-[0.95rem]">{["Your own link to share on WhatsApp", "Guest replies saved, with live counts", "Change design or details any time", "English, Arabic or both"].map(tick)}</ul>
            <div className="pt-2">
              <Btn href="/websites">Choose a design</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 pt-24 sm:px-8 sm:pt-28">
      <div className="linen-forest mx-auto grid max-w-6xl items-center gap-6 rounded-3xl px-8 py-12 text-white sm:px-12 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="font-serif text-[clamp(2.2rem,4.6vw,3.4rem)] font-light leading-[1.02]">Start with the design you love</h2>
          <p className="mt-2 text-white/75">Free to build and preview. Pay only when you&apos;re ready to send.</p>
        </div>
        <Link href="/websites" className="inline-flex h-12 items-center justify-center rounded-full bg-[#efe9df] px-7 font-medium text-[#26332b]">
          Choose a design
        </Link>
      </div>
    </section>
  );
}

export function HomeV3() {
  const sites = websiteOrder(templatesFor("websites", selectableTemplates()));
  const toDesign = (t: (typeof sites)[number]): PreviewDesign => ({ id: t.id, name: t.name, ar: designInfo(t.id).ar, note: t.tagline, href: `/create/${t.id}` });
  return (
    <PreviewProvider>
      <Hero />
      <Stats count={sites.length} />
      <Loved designs={sites.slice(0, 12).map(toDesign)} total={sites.length} />
      <HowItWorks />
      <Replies />
      <Features />
      <DesignSwitch designs={sites.slice(0, 6).map((t) => ({ id: t.id, name: t.name }))} />
      <Pricing />
      <Faq />
      <FinalCta />
    </PreviewProvider>
  );
}

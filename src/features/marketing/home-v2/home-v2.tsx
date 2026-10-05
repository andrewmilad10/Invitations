import Link from "next/link";
import { Button } from "@/components/ui/button";
import { selectableTemplates } from "@/templates/registry";
import { templatesFor, websiteOrder } from "../products";
import { HowItWorks } from "../home/how-it-works";
import { LiveDemo } from "../home/live-demo";
import { WebsiteCard } from "../home/website-card";
import { FilteredGrid } from "./filtered-grid";
import { HeroEnvelope } from "./hero-envelope";
import { NamesProvider } from "./names";

/** Each website design's name in Arabic, and its mood for the filter. */
const DESIGN_INFO: Record<string, { ar: string; mood: string }> = {
  "swan-lake": { ar: "بحيرة البجع", mood: "floral" },
  "villa-rosa": { ar: "فيلا روزا", mood: "floral" },
  "something-blue": { ar: "لمسة زرقاء", mood: "floral" },
  "pressed-garden": { ar: "حديقة الزهور المجففة", mood: "floral" },
  "cotton-press": { ar: "حبر وقطن", mood: "classic" },
  "rose-marble": { ar: "رخام وردي", mood: "classic" },
  "burgundy-envelope": { ar: "الظرف العنابي", mood: "classic" },
  "the-gate": { ar: "البوابة", mood: "nights" },
  "moonlit-nile": { ar: "ليلة على النيل", mood: "nights" },
};
const MOODS: [string, string][] = [
  ["floral", "Floral & romantic"],
  ["classic", "Classic & foil"],
  ["nights", "Egyptian nights"],
];

function Hero() {
  return (
    <section className="linen-forest relative isolate overflow-hidden text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 pb-24 pt-28 sm:px-8 lg:min-h-[88svh] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pt-24">
        <div className="max-w-2xl text-center lg:text-start">
          <h1 className="font-serif text-[2.9rem] font-light leading-[1] sm:text-6xl lg:text-[4.4rem]">
            <span className="open-line block">Wedding invitations</span>
            <span className="open-line block [animation-delay:150ms]">your guests will keep.</span>
          </h1>
          <p dir="rtl" lang="ar" className="open-rise mt-4 text-center font-[family-name:var(--font-amiri)] text-2xl text-[#e6cf93] [animation-delay:400ms] sm:text-3xl lg:text-left">
            دعوات زفاف تبقى في الذاكرة
          </p>
          <p className="open-rise mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/85 [animation-delay:550ms] lg:mx-0">
            A wedding website that opens like real stationery on your guests&apos; phones: your story, the day&apos;s plan, maps, a countdown and replies. In English or Arabic.
          </p>
          <div className="open-rise mt-8 flex flex-col items-center gap-3 [animation-delay:700ms] sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="h-13 w-full rounded-full bg-[#e6cf93] px-8 text-base text-[#26332b] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_10px_20px_-10px_rgb(0_0_0/0.5)] hover:bg-[#ecd9a8] sm:w-auto">
              <Link href="#designs">See the designs</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 w-full rounded-full border-white/50 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white sm:w-auto">
              <Link href="#inspiration">What guests see</Link>
            </Button>
          </div>
          <p className="open-rise mt-6 text-sm text-white/65 [animation-delay:850ms]">Free to try. You only create an account when you&apos;re ready to save.</p>
        </div>
        <div className="open-rise [animation-delay:500ms]">
          <HeroEnvelope />
        </div>
      </div>
    </section>
  );
}

function Designs() {
  const sites = websiteOrder(templatesFor("websites", selectableTemplates()));
  return (
    <section id="designs" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Choose your design</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {sites.length} original designs, each opening with its own envelope or scene. Every one works in English and Arabic.
        </p>
      </div>
      <FilteredGrid moods={sites.map((t) => DESIGN_INFO[t.id]?.mood ?? "classic")} labels={MOODS}>
        {sites.map((t) => (
          <WebsiteCard key={t.id} template={t} subtitle={DESIGN_INFO[t.id]?.ar} />
        ))}
      </FilteredGrid>
      <div className="mt-10 text-center">
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/websites">See all wedding websites</Link>
        </Button>
      </div>
    </section>
  );
}

/** How guests receive it: one link in the family chat. */
function OnWhatsApp() {
  const tiles = [
    { t: "Opens like a real envelope", b: "Guests tap the seal and your invitation unfolds, with music if you like." },
    { t: "English and Arabic", b: "Write it in either language, with proper Arabic type set right to left." },
    { t: "Directions in one tap", b: "Each venue opens straight in their maps app." },
    { t: "Nothing to download", b: "No app, no account for guests. Just your link." },
  ];
  return (
    <section className="bg-card px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-start">
          <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">One link in the family chat</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground lg:mx-0">
            Send it on WhatsApp like any message. Your guests open a beautiful invitation, not a file to download.
          </p>
          <ul className="mt-8 grid gap-3 text-start sm:grid-cols-2">
            {tiles.map((x) => (
              <li key={x.t} className="rounded-lg border border-border bg-background p-4">
                <p className="font-serif text-xl">{x.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{x.b}</p>
              </li>
            ))}
          </ul>
        </div>
        {/* A chat, drawn: one message with the invitation's link preview. */}
        <div aria-hidden className="mx-auto w-full max-w-sm overflow-hidden rounded-[1.6rem] border-[8px] border-neutral-900 bg-[#efe7dd] shadow-[0_40px_70px_-30px_rgb(0_0_0/0.5)]">
          <div className="flex items-center gap-3 bg-[#1f5c4f] px-4 py-3 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-white/20 font-serif">F</span>
            <div>
              <p className="text-sm font-semibold">Family</p>
              <p className="text-xs text-white/70">Mama, Sara, Omar, you</p>
            </div>
          </div>
          <div className="space-y-3 p-4 [background-image:radial-gradient(rgb(0_0_0/0.04)_1px,transparent_1px)] [background-size:14px_14px]">
            <div className="ms-auto w-[86%] rounded-xl rounded-tr-sm bg-[#d9f5c9] p-1.5 shadow-sm">
              <div className="overflow-hidden rounded-lg bg-white/70">
                <div className="relative aspect-[1.9] bg-[#969fa8] bg-[url(/templates/swan-lake/hero.webp)] bg-cover bg-[center_30%]">
                  <span className="absolute inset-x-0 bottom-3 text-center font-[family-name:var(--font-pinyon)] text-3xl text-[#1d2a42]">Nour &amp; Adam</span>
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold text-neutral-900">Nour &amp; Adam are getting married</p>
                  <p className="text-xs text-neutral-600">Tap to open your invitation and let us know you&apos;re coming.</p>
                </div>
              </div>
              <p className="px-1.5 pb-0.5 pt-1.5 text-[0.95rem] text-neutral-900">We can&apos;t wait to celebrate with you all</p>
              <p className="pe-1 text-end text-[0.65rem] text-neutral-500">20:41 ✓✓</p>
            </div>
            <div className="w-[60%] rounded-xl rounded-tl-sm bg-white p-2.5 text-[0.95rem] text-neutral-900 shadow-sm">
              It&apos;s beautiful! I opened the envelope three times
              <p className="text-end text-[0.65rem] text-neutral-500">20:43</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pricing in one line, then help on WhatsApp. PRICE is still to be confirmed. */
function Pricing() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 text-center shadow-[0_4px_12px_-2px_rgb(42_39_35/0.04),0_12px_28px_-4px_rgb(38_51_43/0.10)]">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#9c7a4c,#e6cf93,#9c7a4c)]" />
          <h2 className="font-serif text-4xl font-light sm:text-5xl">Free to design. One fee to publish.</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">Make it, change it and preview it with your partner for free. Pay once when you&apos;re ready to send it to your guests.</p>
          <p className="mt-6 font-serif text-5xl">[price]</p>
          <p className="text-sm text-muted-foreground">one time, per wedding</p>
          <ul className="mx-auto mt-6 grid max-w-sm gap-2 text-start text-sm">
            {["Your own link to share on WhatsApp", "Every section: story, schedule, maps, photos, replies", "English or Arabic", "Change it any time before and after you publish"].map((x) => (
              <li key={x} className="flex gap-2">
                <span aria-hidden className="text-accent">✓</span>
                {x}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-8 h-12 rounded-full px-8">
            <Link href="/websites">Start with a design</Link>
          </Button>
        </div>
        <div className="flex flex-col justify-center rounded-xl bg-[#f3e4dc] p-8 text-center">
          <h3 className="font-serif text-3xl">Help with your wording?</h3>
          <p className="mt-3 text-muted-foreground">Send us your names in Arabic or English, your wording or a question. We&apos;ll answer on WhatsApp.</p>
          <Button asChild variant="outline" className="mx-auto mt-6 rounded-full border-foreground/30 px-6">
            <a href="#" rel="noopener noreferrer">Chat with us on WhatsApp</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="linen-forest relative isolate overflow-hidden px-5 py-28 text-center text-white sm:px-8 sm:py-32">
      <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-7xl">Ready when you are</h2>
      <p dir="rtl" lang="ar" className="mt-3 font-[family-name:var(--font-amiri)] text-2xl text-[#e6cf93]">ابدؤوا دعوتكم اليوم</p>
      <p className="mx-auto mt-5 max-w-lg text-lg text-white/80">Pick a design and add your names. It&apos;s free to try, and nobody sees it until you publish.</p>
      <Button asChild size="lg" className="mt-9 h-13 rounded-full bg-[#e6cf93] px-8 text-base text-[#26332b] hover:bg-[#ecd9a8]">
        <Link href="/websites">Choose a design</Link>
      </Button>
    </section>
  );
}

export function HomeV2() {
  return (
    <NamesProvider>
      <Hero />
      <Designs />
      <LiveDemo />
      <OnWhatsApp />
      <HowItWorks />
      <Pricing />
      <FinalCta />
    </NamesProvider>
  );
}

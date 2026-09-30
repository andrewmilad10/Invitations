import { SmartImage as Image } from "@/components/smart-image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PHOTO_LIBRARY } from "@/features/media/library";
import { ImageReveal, Parallax, Reveal, RevealLines, Stagger } from "@/features/motion/motion";
import { PhoneFrame } from "./live-demo";

const REASONS = [
  { title: "Explore before you sign up", body: "Browse, preview and start designing without an account. Create one only to save." },
  { title: "Your details, any template", body: "Change the design whenever you like. Your words, photos and events come with you." },
  { title: "Private until you publish", body: "Drafts are only visible to you. Published invitations stay out of search engines unless you choose otherwise." },
  { title: "English and Arabic", body: "Right-to-left layouts, Arabic typography and dates written the way your guests read them." },
];

export function WhyUs() {
  return (
    <section className="bg-card px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.2fr]">
        <RevealLines className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl" lines={["Made for the way", "couples actually plan"]} />
        <Stagger as="dl" step={110} className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {REASONS.map((r) => (
            <div key={r.title} className="border-t border-border pt-6">
              <dt className="font-serif text-2xl">{r.title}</dt>
              <dd className="mt-2 leading-relaxed text-muted-foreground">{r.body}</dd>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function MobileShowcase() {
  return (
    <section className="overflow-hidden px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[auto_1fr]">
        <div className="order-2 flex justify-center gap-6 lg:order-1">
          <Reveal duration={1100} className="hidden translate-y-10 sm:block">
            <PhoneFrame src="/templates/editorial/preview" title="Editorial template on a phone" scale={0.62} />
          </Reveal>
          <Reveal delay={200} duration={1100}>
            <PhoneFrame src="/templates/romantic/preview" title="Romantic template on a phone" scale={0.62} />
          </Reveal>
        </div>
        <Stagger step={120} className="order-1 max-w-xl lg:order-2">
          <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Most guests will open it on a phone</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            So every template is designed for the phone first: comfortable to read, quick to load, and one tap from directions to the venue.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Share it in a message, an email or on a printed QR code.</p>
        </Stagger>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-forest px-5 py-32 text-center text-white sm:px-8 sm:py-44">
      {/* The photo opens from a slight crop and settles, then the words arrive, the button last. */}
      <ImageReveal className="absolute inset-0 -z-20">
        <Parallax className="absolute inset-x-0 -inset-y-[8%]">
          <Image src={PHOTO_LIBRARY.venue.url} alt="" fill sizes="100vw" className="object-cover" />
        </Parallax>
      </ImageReveal>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[rgb(20_16_12/0.55)]" />
      <div className="mx-auto max-w-3xl">
        <Stagger step={160}>
          <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-7xl">Ready to create your wedding invitation?</h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-white/80">Start with a template you love. It takes a few minutes, and it&apos;s free to try.</p>
          <Button asChild size="lg" className="mt-10 h-13 rounded-full bg-white px-8 text-base text-foreground hover:bg-white/90">
            <Link href="/invitations">Create your wedding invitation</Link>
          </Button>
        </Stagger>
        <ul className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-6 text-sm text-white/75 sm:grid-cols-4">
          <li>Free to explore</li>
          <li>No card required</li>
          <li>Ready in minutes</li>
          <li>Private until published</li>
        </ul>
      </div>
    </section>
  );
}

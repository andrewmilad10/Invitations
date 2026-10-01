import Link from "next/link";
import { Button } from "@/components/ui/button";

const REASONS = [
  { title: "Explore before you sign up", body: "Browse, preview and start designing without an account. Create one only to save." },
  { title: "Your details, any template", body: "Change the design whenever you like. Your words, photos and events come with you." },
  { title: "Private until you publish", body: "Drafts are only visible to you. Published invitations stay out of search engines unless you choose otherwise." },
  { title: "One design, two products", body: "Like a card? Its matching wedding website uses the same design, so everything looks like one set." },
];

export function WhyUs() {
  return (
    <section className="bg-card px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.2fr]">
        <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Made for how couples plan</h2>
        <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {REASONS.map((r) => (
            <div key={r.title} className="border-t border-border pt-6">
              <dt className="font-serif text-2xl">{r.title}</dt>
              <dd className="mt-2 leading-relaxed text-muted-foreground">{r.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="linen-forest relative isolate overflow-hidden px-5 py-28 text-center text-white sm:px-8 sm:py-36">
      <div className="mx-auto max-w-3xl">
        <h2 className="gold-foil font-serif text-5xl font-light leading-[1.02] sm:text-7xl">Ready to make your invitation?</h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-white/80">
          Pick a design and add your names. It&apos;s free to try, and nobody sees it until you publish.
        </p>
        <Button asChild size="lg" className="mt-10 h-13 rounded-full bg-gold px-8 text-base text-gold-foreground hover:bg-gold/90">
          <Link href="/invitations">Choose a design</Link>
        </Button>
      </div>
    </section>
  );
}

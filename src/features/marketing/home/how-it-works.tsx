import { RevealLines, Stagger } from "@/features/motion/motion";

const STEPS = [
  { title: "Choose a template", body: "Browse the collection and preview any design with real wedding details." },
  { title: "Add your details", body: "Your names, date, ceremony, reception and photos. The invitation updates as you type." },
  { title: "Make it yours", body: "Pick colors and typography, write your story, and choose what to show." },
  { title: "Publish and share", body: "Save with a free account, publish, and send one beautiful link to every guest." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-card px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <RevealLines className="max-w-2xl font-serif text-5xl font-light leading-[1.02] sm:text-6xl" lines={["From first idea to shared", "link in an afternoon"]} />
        <div className="relative mt-16">
          {/* One line drawn across, the steps arriving along it. */}
          <span aria-hidden data-draw className="absolute inset-x-0 top-0 hidden h-px bg-border lg:block" />
          <Stagger as="ol" step={170} className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative lg:pt-10">
                <span aria-hidden className="absolute start-0 top-0 hidden size-2 -translate-y-1/2 rounded-full bg-accent lg:block" />
                <span aria-hidden className="block font-serif text-7xl font-light leading-none text-accent/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-serif text-3xl">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
                {i === 3 ? <p className="mt-3 text-sm text-foreground/80">This is the only step that needs an account.</p> : null}
              </li>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

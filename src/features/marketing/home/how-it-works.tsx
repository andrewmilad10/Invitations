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
        <h2 className="max-w-2xl font-serif text-5xl font-light leading-[1.02] sm:text-6xl">From first idea to shared link in an afternoon</h2>
        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              <span aria-hidden className="block font-serif text-7xl font-light leading-none text-accent/80">
                {i + 1}
              </span>
              <h3 className="mt-5 font-serif text-3xl">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
              {i === 3 ? <p className="mt-3 text-sm text-foreground/80">This is the only step that needs an account.</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

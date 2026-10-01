import { selectableTemplates } from "@/templates/registry";
import { templatesFor } from "../products";

function features(
  cards: number,
  websites: number,
): { title: string; body: string }[] {
  return [
    {
      title: "Designs like fine stationery",
      body: `${cards} invitation cards and ${websites} wedding websites, all original, each in several colours.`,
    },
    {
      title: "Your words, your colours",
      body: "Names, wording, colours, foil and paper. No design skills needed.",
    },
    {
      title: "Sent the way people talk",
      body: "Share the card on WhatsApp, by email or with a printed QR code.",
    },
    {
      title: "A website of your own",
      body: "Your story, the schedule and every detail on one page, with its own link.",
    },
    {
      title: "Directions in one tap",
      body: "Each venue has a map, so guests find the ceremony and the party.",
    },
    {
      title: "English or Arabic",
      body: "Right-to-left layouts, Arabic typography and dates written the way your guests read them.",
    },
  ];
}

export function Features() {
  const all = selectableTemplates();
  const FEATURES = features(
    templatesFor("cards", all).length,
    templatesFor("websites", all).length,
  );
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-card px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">
            What you can do today
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground lg:justify-self-end">
            Start with a card. When you want more, the same design becomes your
            wedding website. Replies and guest lists come next.
          </p>
        </div>

        <ul className="mt-12 grid gap-x-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, body }) => (
            <li key={title} className="border-t border-gold/50 py-7">
              <h3 className="font-serif text-2xl leading-tight">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

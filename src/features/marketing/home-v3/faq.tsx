const ITEMS: [string, string][] = [
  ["Do my guests need to download anything?", "No. The invitation opens in any phone's browser from the link you send."],
  ["Can I change the design after I send the link?", "Yes. Switch design or edit any detail and the same link shows the new version straight away."],
  ["How do guests reply?", "On the invitation itself: coming or not, how many, and a note. Every reply is saved to your replies page."],
  ["Can it be in Arabic?", "Yes. Every design works in Arabic, right to left, as well as English."],
  ["Who can see our guest list and replies?", "Only you, after logging in. Guests only see the invitation."],
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 px-5 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent">Questions</p>
          <h2 className="mt-3 font-serif text-[clamp(2.3rem,4.6vw,3.4rem)] font-light leading-[1.02]">Good to know</h2>
        </div>
        <div>
          {ITEMS.map(([q, a]) => (
            <details key={q} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-serif text-xl [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden className="font-sans text-2xl font-light text-accent transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-[40rem] pb-5 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

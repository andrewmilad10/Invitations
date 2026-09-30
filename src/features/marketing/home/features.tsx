import {
  CalendarHeart,
  Globe,
  Images,
  LayoutTemplate,
  MailOpen,
  MapPin,
  MessageCircle,
  Printer,
  Smartphone,
  SwatchBook,
  Users,
  Vote,
  type LucideIcon,
} from "lucide-react";

type Feature = { icon: LucideIcon; title: string; body: string; soon?: boolean };

const FEATURES: Feature[] = [
  { icon: LayoutTemplate, title: "Beautiful templates", body: "Designed like fine stationery, from classic to modern." },
  { icon: SwatchBook, title: "Easy customization", body: "Your names, colors, fonts and words — no design skills needed." },
  { icon: MailOpen, title: "Digital invitations", body: "One link to share by message, email or QR code." },
  { icon: Globe, title: "Wedding website", body: "Your story, schedule and details on a page of your own." },
  { icon: Images, title: "Photo galleries", body: "A gallery of your favourite moments, beautifully laid out." },
  { icon: CalendarHeart, title: "Wedding events", body: "Ceremony, reception and the timeline of your day." },
  { icon: MapPin, title: "Venues & maps", body: "Directions to every venue, one tap away for guests." },
  { icon: Smartphone, title: "Made for phones", body: "Looks as good on a phone as it does on a laptop." },
  { icon: Vote, title: "Online RSVP", body: "Guests reply online; you see every answer in one place.", soon: true },
  { icon: Users, title: "Guest list", body: "Keep track of who's invited, attending and bringing a plus-one.", soon: true },
  { icon: Printer, title: "Printable invitations", body: "The same design, ready for print.", soon: true },
  { icon: MessageCircle, title: "WhatsApp invites", body: "Send personal invitations straight to WhatsApp.", soon: true },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-card px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Everything your invitation needs, and room to grow</h2>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground lg:justify-self-end">
            Start with an invitation. It grows into a complete wedding website — and soon, a place to manage replies and guests.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-5 sm:mt-16 sm:gap-x-10 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body, soon }) => (
            <li key={title} className="border-t border-border py-6 sm:py-7">
              <div className="flex items-center justify-between">
                <Icon aria-hidden className="size-6 text-accent" strokeWidth={1.25} />
                {soon ? <span className="rounded-full border border-border px-2 py-0.5 text-[0.7rem] text-muted-foreground sm:px-2.5 sm:text-xs">Soon</span> : null}
              </div>
              <h3 className="mt-4 font-serif text-xl leading-tight sm:mt-5 sm:text-2xl">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

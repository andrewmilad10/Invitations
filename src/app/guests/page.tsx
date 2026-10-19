import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/page-transition";
import { buildInvitationModel } from "@/core/invitation/build-model";
import { getSection } from "@/core/invitation/model";
import { resolveSectionContent } from "@/core/sections/registry";
import { GuestsPage } from "@/features/guests/guests-page";
import type { GuestsPageData } from "@/features/guests/queries";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";
import { ReplyForm } from "@/templates/shared/reply/reply-form";
import { sampleBundle, sampleMediaUrl } from "@/templates/fixtures/sample-wedding";
import { getTemplateManifest } from "@/templates/registry";

export const metadata: Metadata = {
  title: "Guests & replies",
  description: "Guests reply on your invitation and every answer is saved to your own guest list: who's coming, how many, their notes, personal links and a list you can download.",
};

const DESIGN = "olive-courtyard";

/** An example guest list for the page (nothing here is a real person). */
function exampleList(): GuestsPageData {
  const at = "2026-10-12T18:30:00Z";
  const g = (i: number, name: string, groups: string[], opens: number) => ({
    id: `00000000-0000-4000-8000-00000000000${i}`,
    wedding_id: "example",
    name,
    greeting: null,
    message: null,
    groups,
    max_party: null,
    token: `${i}`.repeat(32),
    open_count: opens,
    last_opened_at: at,
    created_at: at,
    updated_at: at,
  });
  const r = (id: string, guest: number | null, name: string, attending: boolean, party: number, note: string | null, bus?: string) => ({
    id,
    wedding_id: "example",
    guest_id: guest ? `00000000-0000-4000-8000-00000000000${guest}` : null,
    name,
    attending,
    party_size: party,
    note,
    answers: bus ? { bus } : {},
    created_at: at,
    updated_at: at,
  });
  return {
    wedding: { id: "example", slug: "emma-and-james", names: "Emma & James", status: "published", locale: "en" },
    canEdit: true,
    guests: [
      g(1, "Mariam & family", ["Bride's family"], 3),
      g(2, "Uncle Hossam", ["Groom's family"], 2),
      g(3, "Nour Adel", ["University"], 1),
      g(4, "The Fahmy family", ["Neighbours"], 2),
      g(5, "Youssef Tarek", ["University", "Work"], 0),
      g(6, "Aunt Hoda", ["Bride's family"], 4),
    ],
    replies: [
      r("r1", 1, "Mariam & family", true, 4, "So happy for you both!", "Yes"),
      r("r2", 2, "Uncle Hossam", true, 2, null, "No"),
      r("r3", 4, "The Fahmy family", false, 0, "We'll be travelling, sending our love."),
      r("r4", 6, "Aunt Hoda", true, 3, "Can't wait!", "Yes"),
      r("r5", null, "Karim & Salma", true, 2, null, "Yes"),
    ],
    wishes: [
      { id: "w1", wedding_id: "example", name: "Aunt Hoda", message: "Wishing you a lifetime of love and laughter!", hidden: false, created_at: at },
      { id: "w2", wedding_id: "example", name: "Karim & Salma", message: "Can't wait to dance with you both.", hidden: false, created_at: at },
    ],
    questions: [{ id: "bus", text: "Need transport from Cairo?", kind: "yesno" }],
    maxGuests: 4,
    wishesOn: true,
  };
}

export default function GuestsAndRepliesPage() {
  const template = getTemplateManifest(DESIGN)!;
  const bundle = sampleBundle(DESIGN);
  const rsvpRow = bundle.sections.find((s) => s.type === "rsvp");
  const content = { ...resolveSectionContent("rsvp", rsvpRow?.content as Record<string, unknown> | undefined, "en"), maxGuests: 4, questions: [{ id: "bus", text: "Need transport from Cairo?", kind: "yesno" as const }] };
  const model = buildInvitationModel(bundle, template, {
    mode: "sample",
    mediaUrl: sampleMediaUrl,
    guest: { token: "0".repeat(32), name: "Mariam & family", greeting: "Dear", message: null, maxParty: 4, reply: null },
  });
  const heading = getSection(model, "rsvp")?.content.heading || "Kindly reply";

  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main>
          <section className="px-5 pb-6 pt-12 text-center sm:px-8 sm:pt-16">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent">Guests &amp; replies</p>
            <h1 className="mx-auto mt-4 max-w-3xl font-serif text-[clamp(2.8rem,6vw,4.6rem)] font-light leading-[1] text-balance">Know who&apos;s coming without counting chats</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Guests reply on your invitation. Every answer lands in your own guest list, with the totals worked out for you.
            </p>
          </section>

          {/* 1 — what a guest sees */}
          <section className="px-5 pt-14 sm:px-8">
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent">What your guests see</p>
                <h2 className="mt-3 font-serif text-[clamp(2.2rem,4.4vw,3.2rem)] font-light leading-[1.05]">Each guest gets their own link</h2>
                <p className="mt-4 max-w-md text-muted-foreground">Try it: this is the real reply form, inside the Olive Courtyard design. Nothing you send here is saved.</p>
                <ol className="mt-7 grid gap-4">
                  {[
                    ["Their name is already there", "“Dear Mariam & family” on the invitation, the way you wrote it."],
                    ["One tap to answer", "Coming or not, how many (up to the number you allow), your own questions and a note."],
                    ["Saved, and can be changed", "They can open the same link again and change their answer."],
                  ].map(([h, b], i) => (
                    <li key={h} className="grid grid-cols-[2.2rem_1fr] gap-3">
                      <span className="grid size-9 place-items-center rounded-full border border-border font-serif text-lg">{i + 1}</span>
                      <span>
                        <b className="font-medium">{h}</b>
                        <span className="block text-sm text-muted-foreground">{b}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="mx-auto aspect-[390/844] h-[min(44rem,88svh)] max-w-full rounded-[2.4rem] bg-[#1d1b19] p-2 shadow-[0_40px_70px_-34px_rgb(34_29_26/0.6)]">
                <div lang={model.locale} dir={model.dir} style={model.cssVars as CSSProperties} className="relative size-full overflow-y-auto rounded-[2rem] bg-inv-bg px-5 pb-8 pt-10 font-inv-body text-inv-fg [scrollbar-width:none]">
                  <p className="mb-1 text-center font-inv-heading text-4xl">{heading}</p>
                  <p className="mb-6 text-center text-sm text-inv-muted">{content.deadline || "Kindly reply by 1 September"}</p>
                  <ReplyForm model={model} content={content} />
                </div>
              </div>
            </div>
          </section>

          {/* 2 — what the couple sees */}
          <section className="mt-24 bg-card px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-6xl">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent">What you see</p>
              <h2 className="mt-3 font-serif text-[clamp(2.2rem,4.4vw,3.2rem)] font-light leading-[1.05]">Your guest list, always up to date</h2>
              <p className="mt-4 max-w-xl text-muted-foreground">An example list. Try the filters, search a name, add guests or paste a list. Changes here stay on this screen.</p>
              <div className="mt-10 rounded-3xl border border-border bg-background p-5 shadow-[0_30px_60px_-40px_rgb(34_29_26/0.5)] sm:p-8">
                <GuestsPage data={exampleList()} siteUrl="https://vellum.example" demo />
              </div>
            </div>
          </section>

          {/* 3 — the details */}
          <section className="px-5 pt-24 sm:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="font-serif text-[clamp(2.2rem,4.4vw,3.2rem)] font-light leading-[1.05]">Everything in one place</h2>
              <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Personal links", "Add a guest and copy their link. Their name appears on the invitation, and you see how often they opened it."],
                  ["Or one link for everyone", "Share the general link in a group chat; whoever replies appears on your list."],
                  ["Paste a whole list", "One name per line, from a note or a spreadsheet. Names already on your list are skipped."],
                  ["Groups", "Bride's family, groom's family, work… filter by any of them."],
                  ["Your own questions", "Transport, children, food: yes/no or a written answer, with totals worked out."],
                  ["Wishes", "Guests leave you a message on the invitation. Hide any you'd rather not show."],
                  ["Download the list", "A spreadsheet with every reply, for seating or the venue."],
                  ["A limit per invitation", "Set how many guests each invitation can bring, or a different number for one guest."],
                  ["Private", "Only you can see your guest list. Guests only see the invitation."],
                ].map(([h, b]) => (
                  <li key={h}>
                    <h3 className="font-serif text-2xl">{h}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-12 flex flex-wrap gap-3">
                <Link href="/websites" className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground">
                  Choose a design
                </Link>
                <Link href="/dashboard" className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 font-medium">
                  Open my guest list
                </Link>
              </div>
            </div>
          </section>
        </main>
      </PageTransition>
      <SiteFooter />
    </>
  );
}

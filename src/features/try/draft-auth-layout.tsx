import Link from "next/link";
import type { ReactNode } from "react";
import { DraftSummary } from "./draft-summary";

/** Two columns: the visitor's invitation beside the account form. */
export function DraftAuthLayout({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div data-wide className="grid overflow-hidden rounded-lg border bg-card md:grid-cols-2">
      <div className="flex items-center justify-center bg-muted px-8 py-12">
        <DraftSummary />
      </div>
      <div className="px-6 py-10 sm:px-12 sm:py-14">
        <h1 className="font-serif text-4xl font-light">{title}</h1>
        <p className="mb-8 mt-3 text-sm leading-relaxed text-muted-foreground">{intro}</p>
        {children}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Changed your mind?{" "}
          <Link href="/templates" className="underline underline-offset-4">
            Keep exploring
          </Link>{" "}
          — your draft stays in this browser.
        </p>
      </div>
    </div>
  );
}

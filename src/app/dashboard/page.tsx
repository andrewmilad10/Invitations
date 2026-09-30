import type { Metadata } from "next";

export const metadata: Metadata = { title: "My weddings" };

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">My weddings</h1>
      <p className="mt-2 text-muted-foreground">Your weddings will appear here.</p>
    </main>
  );
}

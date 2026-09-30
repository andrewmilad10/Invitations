import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">We couldn&apos;t find that wedding</h1>
      <p className="mt-2 text-muted-foreground">It may have been deleted, or you don&apos;t have access to it.</p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back to my weddings</Link>
      </Button>
    </main>
  );
}

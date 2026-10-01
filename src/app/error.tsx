"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div>
        <h1 className="font-serif text-5xl">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Please try again. If it keeps happening, come back in a few minutes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Go to the home page</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

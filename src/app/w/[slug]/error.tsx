"use client";

export default function InvitationError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div>
        <h1 className="font-serif text-5xl">We couldn&apos;t open this invitation</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">Something went wrong on our side. Please try again in a moment.</p>
        <button type="button" onClick={reset} className="mt-8 text-sm underline underline-offset-4">
          Try again
        </button>
      </div>
    </main>
  );
}

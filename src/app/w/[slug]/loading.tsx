/**
 * The moment between tapping the link and the invitation arriving: a calm
 * blank page, and only if it takes a while, a small sign that it's coming.
 * It never shows a half-drawn design.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground motion-safe:[animation:open-fade_.4s_ease_.5s_both]">
        <span aria-hidden className="relative grid size-12 place-items-center">
          <span className="absolute inset-0 rounded-full border border-current opacity-25" />
          <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-current [animation-duration:1.4s] motion-reduce:animate-none" />
          <span className="size-1.5 rounded-full bg-current opacity-60" />
        </span>
        <span className="text-[0.8rem] tracking-[0.18em] uppercase">Opening your invitation</span>
      </div>
    </div>
  );
}

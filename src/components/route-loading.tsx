/** Shown while a page that renders per request is on its way (see loading.tsx files). */
export function RouteLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[60dvh] place-items-center px-6">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <span aria-hidden className="size-9 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60 motion-reduce:animate-none" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

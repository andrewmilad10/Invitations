/**
 * Shown while a page that renders per request is on its way (see loading.tsx files).
 * It fades in after a moment, so a quick page never flashes a spinner.
 */
export function RouteLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[60dvh] place-items-center px-6">
      <div className="flex flex-col items-center gap-4 text-muted-foreground motion-safe:[animation:open-fade_.3s_ease_.35s_both]">
        <span aria-hidden className="size-9 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60 motion-reduce:animate-none" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

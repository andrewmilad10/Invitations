/**
 * Shown the moment an admin link is clicked (the header and menu stay put)
 * while the page's data arrives. Links prefetch this, so it appears with no
 * wait at all. Shapes echo the real pages: a title, a row of figures, a
 * table.
 */
export default function AdminLoading() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-12 w-56 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-8 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
        ))}
      </div>
      <div className="grid gap-px overflow-hidden rounded-2xl border bg-border">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-6 bg-card px-4 py-4">
            <div className="h-4 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="hidden h-4 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

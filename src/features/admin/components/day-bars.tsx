/**
 * One series per day as thin bars on a shared baseline. Hovering a bar shows
 * the day and value; the same numbers are available as a table below for
 * screen readers and exact reading. One series per chart, so the title names
 * it and there is no legend.
 */
export function DayBars({ title, data, format = (n) => String(n) }: { title: string; data: { day: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 600;
  const H = 140;
  const gap = data.length > 60 ? 1 : 2;
  const bw = Math.max(1, W / data.length - gap);
  const total = data.reduce((s, d) => s + d.value, 0);
  const label = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <figure className="rounded-2xl border bg-card p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="font-serif text-2xl">{format(total)}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="mt-4 h-40 w-full" role="img" aria-label={`${title}: ${format(total)} in total`}>
        <line x1="0" x2={W} y1={H + 0.5} y2={H + 0.5} className="stroke-border" strokeWidth="1" />
        {data.map((d, i) => {
          const h = d.value === 0 ? 0 : Math.max(3, (d.value / max) * (H - 8));
          const x = i * (bw + gap);
          return (
            <g key={d.day} className="group">
              <rect x={x} y={0} width={bw + gap} height={H} fill="transparent">
                <title>{`${label(d.day)}: ${format(d.value)}`}</title>
              </rect>
              {h > 0 ? <rect x={x} y={H - h} width={bw} height={h} rx={Math.min(2, bw / 2)} className="pointer-events-none fill-primary/85 transition-opacity group-hover:fill-primary" /> : null}
            </g>
          );
        })}
        <text x="0" y={H + 15} className="fill-muted-foreground text-[11px]">{label(data[0]?.day ?? "")}</text>
        <text x={W} y={H + 15} textAnchor="end" className="fill-muted-foreground text-[11px]">{label(data.at(-1)?.day ?? "")}</text>
      </svg>
      <details className="mt-2 text-xs text-muted-foreground">
        <summary className="cursor-pointer select-none">Show as a table</summary>
        <table className="mt-2 w-full text-left">
          <thead><tr><th className="py-1 font-medium">Day</th><th className="py-1 text-right font-medium">{title}</th></tr></thead>
          <tbody>
            {data.filter((d) => d.value).map((d) => (
              <tr key={d.day} className="border-t"><td className="py-1">{label(d.day)}</td><td className="py-1 text-right tabular-nums">{format(d.value)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

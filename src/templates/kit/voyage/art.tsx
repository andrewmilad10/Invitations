import { cn } from "@/lib/utils";
import s from "./voyage.module.css";

/** Line art for Set Sail, drawn here (no stock): an anchor, a compass rose, a chart of the bay and a washing line. */

export function Anchor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 48" aria-hidden focusable="false">
      <circle cx="20" cy="6" r="4" />
      <path d="M20 10v32M12 18h16M5 30c2 8 8 12 15 12s13-4 15-12M5 30l-3 3M5 30l4 1M35 30l3 3M35 30l-4 1" />
    </svg>
  );
}

export function Pin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 22s-7-8-7-13a7 7 0 0 1 14 0c0 5-7 13-7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function Compass({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden focusable="false">
      <circle cx="50" cy="50" r="40" />
      <circle cx="50" cy="50" r="33" />
      <path d="M50 4 L56 44 L96 50 L56 56 L50 96 L44 56 L4 50 L44 44Z M50 22 L53 47 L78 50 L53 53 L50 78 L47 53 L22 50 L47 47Z" />
      <text x="47" y="15" fontSize="8" stroke="none" fill="currentColor">N</text>
    </svg>
  );
}

const fit = (t?: string | null) => (t && t.length <= 20 ? t : null);

/** A watercolour chart of the bay: islands, a dotted route from the ceremony to the reception and a little boat sailing it. */
export function Chart({ from, to, label }: { from?: string | null; to?: string | null; label: string }) {
  const a = fit(from);
  const b = fit(to);
  return (
    <div className={s.chart}>
      <svg viewBox="0 0 400 300" role="img" aria-label={label}>
        <defs>
          <filter id="ss-wc" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="9" />
          </filter>
          <filter id="ss-grain">
            <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n" />
            <feColorMatrix in="n" values="0 0 0 0 .3 0 0 0 0 .25 0 0 0 0 .15 0 0 0 .18 0" result="g" />
            <feComposite in="g" in2="SourceGraphic" operator="in" result="gg" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="gg" />
            </feMerge>
          </filter>
        </defs>
        <rect width="400" height="300" className={s.sea} />
        <rect width="400" height="300" className={s.grain} filter="url(#ss-grain)" />
        <g filter="url(#ss-wc)">
          <path className={s.sand} d="M-10 250 C 40 230, 60 260, 110 250 S 150 290, 140 320 L -10 320Z" />
          <path className={s.land} d="M-10 260 C 40 240, 60 270, 110 262 S 140 296, 130 320 L -10 320Z" />
          <path className={s.sand} d="M210 120 C 230 92, 290 96, 300 120 S 285 160, 250 158 S 196 150, 210 120Z" />
          <path className={s.land} d="M218 122 C 236 100, 284 104, 292 124 S 276 152, 250 150 S 206 146, 218 122Z" />
          <path className={s.sand} d="M300 40 C 330 20, 410 20, 420 60 L 420 110 C 380 120, 350 90, 330 92 S 290 70, 300 40Z" />
          <path className={s.land} d="M308 44 C 334 28, 410 28, 420 64 L 420 102 C 384 110, 352 84, 334 86 S 300 66, 308 44Z" />
          <path className={s.sand} d="M120 60 C 140 46, 170 52, 168 70 S 140 92, 126 84 S 108 72, 120 60Z" />
          <path className={s.land} d="M126 62 C 142 52, 164 58, 162 70 S 140 86, 130 80 S 116 72, 126 62Z" />
          <path className={s.sand} d="M40 120 C 54 108, 80 112, 78 128 S 56 146, 46 140 S 30 130, 40 120Z" />
        </g>
        <g className={s.waves}>
          <path d="M10 40 q10 -6 20 0 t20 0" />
          <path d="M190 230 q10 -6 20 0 t20 0" />
          <path d="M260 200 q10 -6 20 0 t20 0" />
          <path d="M60 180 q10 -6 20 0 t20 0" />
          <path d="M330 250 q10 -6 20 0 t20 0" />
        </g>
        <path className={s.route} d="M78 238 C 140 200, 170 120, 250 128 S 330 86, 336 72" />
        <g className={s.boat}>
          <path d="M-9 2 h18 l-4 5 h-10z M0 1 v-14 l8 11z" />
        </g>
        <g transform="translate(70 214)">
          <g className={cn(s.pin, s.pin1)}>
            <path d="M8 24 C 8 24 0 12 0 8 a8 8 0 0 1 16 0 c0 4 -8 16 -8 16z" />
            <circle cx="8" cy="8" r="3" />
          </g>
        </g>
        <g transform="translate(328 48)">
          <g className={cn(s.pin, s.pin2)}>
            <path d="M8 24 C 8 24 0 12 0 8 a8 8 0 0 1 16 0 c0 4 -8 16 -8 16z" />
            <circle cx="8" cy="8" r="3" />
          </g>
        </g>
        {a ? (
          <text x="40" y="282" className={s.chartLabel}>
            {a}
          </text>
        ) : null}
        {b ? (
          <text x="392" y="128" textAnchor="end" className={s.chartLabel}>
            {b}
          </text>
        ) : null}
        <g transform="translate(352 250)" className={s.rose}>
          <circle r="22" />
          <path d="M0 -26 L4 -4 L26 0 L4 4 L0 26 L-4 4 L-26 0 L-4 -4Z" />
        </g>
      </svg>
    </div>
  );
}

/** A washing line with a straw hat, a linen shirt and a camera, swaying in the breeze. */
export function WashingLine() {
  return (
    <div className={s.line} aria-hidden>
      <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMin meet">
        <path className={s.rope} d="M-10 22 Q 200 52, 410 22" />
        <g transform="translate(70 30)">
          <g className={s.item}>
            <path className={s.hat} d="M-34 26 c10 -8 58 -8 68 0 c-10 6 -58 6 -68 0z M-16 22 c0 -20 32 -20 32 0" />
            <path d="M-34 26 c10 -8 58 -8 68 0 c-10 6 -58 6 -68 0z M-16 22 c0 -20 32 -20 32 0 M-14 16 h28 M4 24 l4 26 M10 24 l10 22" />
            <path d="M-4 0 v6 M4 0 v6" />
          </g>
        </g>
        <g transform="translate(200 38)">
          <g className={cn(s.item, s.itemB)}>
            <path className={s.shirt} d="M-14 0 l-26 14 l8 20 l12 -6 v58 h40 v-58 l12 6 l8 -20 l-26 -14 q-14 10 -28 0z" />
            <path d="M-14 0 l-26 14 l8 20 l12 -6 v58 h40 v-58 l12 6 l8 -20 l-26 -14 q-14 10 -28 0z M0 6 v76 M-6 22 h4 M-6 38 h4 M-6 54 h4 M14 34 h10 v12 h-10z" />
            <path d="M-14 -4 v8 M14 -4 v8" />
          </g>
        </g>
        <g transform="translate(320 30)">
          <g className={cn(s.item, s.itemC)}>
            <path d="M-16 -4 q16 20 32 0" />
            <path className={s.cam} d="M-22 26 h44 v30 h-44z" />
            <path d="M-22 26 h44 v30 h-44z M-8 26 l4 -6 h8 l4 6 M14 31 h4" />
            <circle cx="0" cy="41" r="9" className={s.lens} />
            <circle cx="0" cy="41" r="4.5" className={s.glass} />
            <path d="M-16 -4 l-6 30 M16 -4 l6 30" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element -- transparent art layers that animate (CSS transforms on the element itself); sized and preloaded with the page */
import { cn } from "@/lib/utils";
import s from "./voyage.module.css";

/**
 * Line art for Set Sail, drawn here: an anchor, a compass rose, the route and
 * pins over the painted chart, and a washing line of sketched travel things.
 * (The painted and rendered art lives in public/templates/set-sail.)
 */

export function Anchor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 48" aria-hidden focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="20" cy="6" r="4" />
        <path d="M20 10v32M12 18h16M5 30c2 8 8 12 15 12s13-4 15-12M5 30l-3 3M5 30l4 1M35 30l3 3M35 30l-4 1" />
      </g>
    </svg>
  );
}

export function Compass({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="50" cy="50" r="38" />
        <circle cx="50" cy="50" r="31" strokeDasharray="1 3" />
        <path d="M50 2 L55 45 L98 50 L55 55 L50 98 L45 55 L2 50 L45 45Z" />
        <path d="M50 20 L52 48 L80 50 L52 52 L50 80 L48 52 L20 50 L48 48Z" fill="currentColor" fillOpacity=".25" />
      </g>
      <text x="47" y="12" fontSize="9" fill="currentColor">
        N
      </text>
    </svg>
  );
}

const ROUTE = "M188 676 C 250 600, 330 560, 380 520 S 470 470, 512 448";
const fit = (t?: string | null, n = 22) => (t && t.length <= n ? t : null);

/** The painted chart of the bay with the route drawn from the ceremony to the reception, a boat sailing it and two pins. */
export function Chart({ from, to, labels, label }: { from?: string | null; to?: string | null; labels: { ceremony: string; reception: string; key: string }; label: string }) {
  const a = fit(from);
  const b = fit(to);
  return (
    <div className={s.chart}>
      <img src="/templates/set-sail/chart.webp" alt="" className={s.chartImg} />
      <svg className={s.chartSvg} viewBox="0 0 900 1100" role="img" aria-label={label}>
        <mask id="ss-route">
          <path className={s.routeMask} d={ROUTE} />
        </mask>
        <path className={s.route} mask="url(#ss-route)" d={ROUTE} />
        <g className={s.boat}>
          <g transform="scale(1.6)">
            <g className={s.boatRock}>
              <path className={s.hull} d="M-14 4 h28 l-6 8 h-16z" />
              <path className={s.sail} d="M0 2 v-26 l14 22z" />
              <path className={s.sail} d="M-2 2 v-20 l-10 18z" />
            </g>
          </g>
        </g>
        <g transform="translate(162 600) scale(1.6)">
          <g className={cn(s.pin, s.pin1)}>
            <path d="M16 46 C 16 46 0 24 0 16 a16 16 0 0 1 32 0 c0 8 -16 30 -16 30z" />
            <svg x="7" y="5" width="18" height="21" viewBox="0 0 40 48" className={s.pinMark}>
              <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <circle cx="20" cy="6" r="4" />
                <path d="M20 10v32M12 18h16M5 30c2 8 8 12 15 12s13-4 15-12" />
              </g>
            </svg>
          </g>
        </g>
        <g transform="translate(486 374) scale(1.6)">
          <g className={cn(s.pin, s.pin2)}>
            <path d="M16 46 C 16 46 0 24 0 16 a16 16 0 0 1 32 0 c0 8 -16 30 -16 30z" />
            <circle cx="16" cy="16" r="6" className={s.pinDot} />
          </g>
        </g>
        <text className={s.labelCaps} x="80" y="772">
          {labels.ceremony}
        </text>
        {a ? (
          <text className={s.chartLabel} x="80" y="818">
            {a}
          </text>
        ) : null}
        <text className={s.labelCaps} x="560" y="300" textAnchor="middle">
          {labels.reception}
        </text>
        {b ? (
          <text className={s.chartLabel} x="560" y="346" textAnchor="middle">
            {b}
          </text>
        ) : null}
      </svg>
      <div className={s.key} aria-hidden>
        <b>{labels.key}</b>
        <span>
          <Anchor className={s.keyIcon} />
          {labels.ceremony}
        </span>
        <span>
          <i className={s.keyDot} />
          {labels.reception}
        </span>
      </div>
    </div>
  );
}

/** A washing line with a sun hat, a linen shirt and a camera, sketched in ink, swaying. */
export function WashingLine() {
  return (
    <div className={s.lineWrap} aria-hidden>
      <svg viewBox="14 24 572 236">
        <path className={s.rope} d="M-20 30 Q 300 74 620 30" />
        <g className={cn(s.swing, s.swingA)}>
          <rect className={s.peg} x="114" y="34" width="12" height="22" rx="2" />
          <g className={s.ink} transform="translate(30 50)">
            <path className={s.inkFill} d="M8 96 C 4 80 60 72 90 72 C 120 72 176 80 172 96 C 168 112 120 120 90 120 C 60 120 12 112 8 96Z" />
            <path className={s.inkFill} d="M44 92 C 40 60 52 30 90 28 C 128 30 140 60 136 92 C 120 100 60 100 44 92Z" />
            <path d="M56 36 Q 90 52 124 36" />
            <path className={s.inkFill} d="M44 78 C 70 88 110 88 136 78 L 137 92 C 112 101 68 101 43 92Z" />
            <path className={s.hatch} d="M50 81 v10 M56 83 v10 M62 84 v10 M68 85 v10 M74 85 v10 M80 86 v10 M86 86 v10 M92 86 v10 M98 86 v10 M104 86 v10 M110 85 v10 M116 85 v10 M122 84 v10 M128 82 v10" />
            <path className={s.hatch} d="M50 70 C 48 56 54 44 64 38 M58 72 C 56 58 62 46 70 40 M122 72 C 124 58 118 46 110 40 M130 70 C 132 56 126 44 116 38" />
            <path className={s.hatch} d="M20 104 C 50 116 130 116 160 104 M30 108 C 60 118 120 118 150 108 M44 112 C 70 120 110 120 136 112" />
            <path d="M136 92 C 150 96 158 100 160 102" />
          </g>
        </g>
        <g className={cn(s.swing, s.swingB)}>
          <rect className={s.peg} x="250" y="40" width="12" height="22" rx="2" />
          <rect className={s.peg} x="338" y="40" width="12" height="22" rx="2" />
          <g className={s.ink} transform="translate(200 46)">
            <path className={s.inkFill} d="M60 8 L30 20 L6 64 L32 76 L44 58 L44 196 Q100 204 156 196 L156 58 L168 76 L194 64 L170 20 L140 8 Q120 20 100 20 Q80 20 60 8Z" />
            <path className={s.inkFill} d="M60 8 L80 40 L100 22 L120 40 L140 8 Q120 18 100 18 Q80 18 60 8Z" />
            <path d="M100 22 L100 198" />
            <path className={s.hatch} d="M104 22 L104 198" />
            <circle cx="108" cy="54" r="2.4" />
            <circle cx="108" cy="86" r="2.4" />
            <circle cx="108" cy="118" r="2.4" />
            <circle cx="108" cy="150" r="2.4" />
            <circle cx="108" cy="182" r="2.4" />
            <path className={s.inkFill} d="M120 76 h28 v30 q-14 4 -28 0z" />
            <path d="M120 82 h28" />
            <path className={s.hatch} d="M50 70 C 54 110 50 150 54 190 M58 90 C 60 120 58 150 62 186 M150 74 C 146 110 150 150 146 190 M30 30 L14 62 M36 34 L22 66" />
            <path className={s.hatch} d="M70 120 C 76 140 72 160 78 180 M132 130 C 128 150 132 170 128 186 M44 58 L44 70 M156 58 L156 70" />
          </g>
        </g>
        <g className={cn(s.swing, s.swingC)}>
          <rect className={s.peg} x="474" y="36" width="12" height="22" rx="2" />
          <g className={s.ink} transform="translate(390 52)">
            <path d="M40 46 Q 60 4 90 2 Q 120 4 140 46" />
            <path className={s.inkFill} d="M26 50 L26 42 L60 42 L66 32 L114 32 L120 42 L154 42 L154 50Z" />
            <rect className={s.inkFill} x="14" y="50" width="152" height="86" rx="9" />
            <rect className={s.hatch} x="14" y="66" width="152" height="52" />
            <path className={s.hatch} d="M20 70 l8 8 M20 82 l16 16 M20 94 l20 20 M30 70 l18 18 M44 70 l14 14 M126 70 l18 18 M140 70 l20 20 M154 72 l10 10 M126 96 l18 18 M140 98 l16 16" />
            <rect className={s.inkFill} x="130" y="54" width="26" height="10" rx="2" />
            <rect className={s.inkFill} x="24" y="54" width="18" height="10" rx="2" />
            <circle className={s.inkFill} cx="140" cy="36" r="7" />
            <path className={s.hatch} d="M135 33 l10 0 M135 36 l10 0 M135 39 l10 0" />
            <circle className={s.inkFill} cx="90" cy="92" r="36" />
            <circle cx="90" cy="92" r="29" />
            <circle className={s.hatch} cx="90" cy="92" r="24" />
            <circle className={s.lens} cx="90" cy="92" r="17" />
            <circle className={s.glass} cx="90" cy="92" r="9" />
            <path className={s.shine} d="M81 84 a12 12 0 0 1 9 -4" />
            <path className={s.hatch} d="M58 74 l4 4 M54 92 h5 M58 110 l4 -4 M122 74 l-4 4 M126 92 h-5 M122 110 l-4 -4 M90 58 v5 M90 126 v-5" />
          </g>
        </g>
      </svg>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { InvitationModel } from "@/core/invitation/model";
import { LOCALE_META } from "@/core/i18n/locales";
import { cn } from "@/lib/utils";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function remaining(target: number, now: number): Remaining {
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    done: diff === 0,
  };
}

/**
 * Countdown to model.countdownTarget. Renders placeholders on the server and
 * starts ticking after mount, so server and client HTML always match.
 */
export function Countdown({
  model,
  className,
  unitClassName,
  valueClassName,
  labelClassName,
}: {
  model: InvitationModel;
  className?: string;
  unitClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
}) {
  const target = model.countdownTarget ? Date.parse(model.countdownTarget) : NaN;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;
  const r = now === null ? null : remaining(target, now);
  const nf = new Intl.NumberFormat(LOCALE_META[model.locale].intl, { minimumIntegerDigits: 2 });

  if (r?.done) {
    return <p className={cn("text-center", className)}>{model.strings.today}</p>;
  }

  const units: [keyof Omit<Remaining, "done">, string][] = [
    ["days", model.strings.days],
    ["hours", model.strings.hours],
    ["minutes", model.strings.minutes],
    ["seconds", model.strings.seconds],
  ];

  return (
    <div className={className} role="timer" aria-live="off">
      {units.map(([key, label]) => (
        <div key={key} className={unitClassName}>
          <span className={cn("tabular-nums", valueClassName)}>{r ? nf.format(r[key]) : "––"}</span>
          <span className={labelClassName}>{label}</span>
        </div>
      ))}
    </div>
  );
}

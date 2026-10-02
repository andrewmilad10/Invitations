/** A bow tie in line art (currentColor), with an optional self-drawing outline. */
export function BowTie({ className, draw }: { className?: string; draw?: boolean }) {
  const d = draw ? { "data-draw": "", pathLength: 1 } : {};
  return (
    <svg aria-hidden viewBox="0 0 120 50" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path {...d} d="M52 19 C40 6 22 2 8 6 C2 16 2 34 8 44 C22 48 40 44 52 31 Z" />
      <path {...d} d="M68 19 C80 6 98 2 112 6 C118 16 118 34 112 44 C98 48 80 44 68 31 Z" />
      <rect {...d} x="52" y="17" width="16" height="16" rx="3" />
      <path {...d} d="M14 14 C24 18 34 20 44 22 M14 36 C24 32 34 30 44 28 M106 14 C96 18 86 20 76 22 M106 36 C96 32 86 30 76 28" opacity=".55" />
    </svg>
  );
}

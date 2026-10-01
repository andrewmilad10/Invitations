import styles from "./showpiece.module.css";

/** A rose drawn in the theme's colours; each part grows on its own when the book opens. */
export function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 124" width="90" className={`${styles.bloom} ${className ?? ""}`} aria-hidden>
      <path style={{ ["--i" as string]: 0 }} d="M50 120 C50 90 52 70 50 50" stroke="var(--inv-accent)" strokeWidth="2" fill="none" />
      <path style={{ ["--i" as string]: 1 }} d="M50 92 C38 86 30 76 30 66 C42 70 48 78 50 92Z" fill="var(--inv-accent)" opacity=".75" />
      <path style={{ ["--i" as string]: 2 }} d="M50 80 C62 74 70 64 70 54 C58 58 52 66 50 80Z" fill="var(--inv-accent)" opacity=".6" />
      <circle style={{ ["--i" as string]: 3 }} cx="50" cy="40" r="16" fill="var(--inv-muted)" opacity=".35" />
      <circle style={{ ["--i" as string]: 4 }} cx="50" cy="40" r="10" fill="var(--inv-muted)" opacity=".65" />
      <circle style={{ ["--i" as string]: 5 }} cx="50" cy="40" r="4.5" fill="var(--inv-muted)" />
    </svg>
  );
}

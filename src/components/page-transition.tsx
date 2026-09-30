import { ViewTransition, type ReactNode } from "react";

/**
 * Page-level enter/exit for marketing pages: the old page fades out fast,
 * the new one fades in and rises a few pixels (CSS in globals.css). Put it
 * in page.tsx, not a layout — layouts persist across navigations.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}

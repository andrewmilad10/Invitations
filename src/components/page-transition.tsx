import { ViewTransition, type ReactNode } from "react";
import { MotionEngine } from "@/features/motion/motion-engine";

/**
 * Page-level enter/exit for marketing pages: the old page fades out fast,
 * the new one fades in and rises a few pixels (CSS in globals.css). Also
 * starts the scroll-reveal engine for the page. Put it in page.tsx, not a
 * layout — layouts persist across navigations.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>
        {children}
        <MotionEngine />
      </div>
    </ViewTransition>
  );
}

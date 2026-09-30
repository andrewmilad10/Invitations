import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("font-serif text-2xl tracking-wide", className)}>
      {siteConfig.name}
    </Link>
  );
}

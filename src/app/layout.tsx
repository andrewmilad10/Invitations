import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { preconnect } from "react-dom";
import { Toaster } from "sonner";
import { publicEnv } from "@/config/env";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

const MOTION_BOOT = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.classList.add("motion");setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.add("motion-failed")},4000)}catch(e){}})()`;

export const viewport: Viewport = {
  themeColor: "#f6f2ec",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Library photos come straight from Unsplash's CDN: open the connection early.
  preconnect("https://images.unsplash.com");
  // Invitation pages set their own lang/dir on the invitation root; the
  // document default is English/LTR for the app UI.
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh">
        {/* Before first paint: opt in to scroll reveals (see src/features/motion). */}
        <Script id="motion-boot" strategy="beforeInteractive">
          {MOTION_BOOT}
        </Script>
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}

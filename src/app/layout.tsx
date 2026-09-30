import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#f6f2ec",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Invitation pages set their own lang/dir on the invitation root; the
  // document default is English/LTR for the app UI.
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh">
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LegalLayout } from "@/features/marketing/legal";

export const metadata: Metadata = {
  title: "Cookies",
  description: `How ${siteConfig.name} uses cookies — essential ones only.`,
};

const email = siteConfig.contactEmail;

export default function Cookies() {
  return (
    <LegalLayout title="Cookies" updated="21 October 2026">
      <p>
        This page explains how {siteConfig.name} uses cookies — small files a website stores in your browser. The short version: we use
        only the essential ones needed to run the service.
      </p>

      <h2>What we use</h2>
      <p>
        We use <strong>essential cookies only</strong> — mainly to keep you securely logged in and to protect your account while you use
        the service.
      </p>

      <h2>What we don&apos;t use</h2>
      <p>
        We do <strong>not</strong> use analytics, advertising, or tracking cookies, and we don&apos;t share cookie data with third parties for
        marketing. Because we only use strictly necessary cookies, we don&apos;t show a cookie-consent banner — none is required for
        essential cookies.
      </p>

      <h2>The cookies we set</h2>
      <ul>
        <li>
          <strong>Session / sign-in cookies</strong> set by our login system (Supabase) to keep you signed in and to keep your account
          secure. They&apos;re cleared when you log out or when they expire.
        </li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        You can clear or block cookies in your browser settings. Note that without the essential cookies you may not be able to stay
        logged in or use parts of the service.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${email}`}>{email}</a>. See also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalLayout>
  );
}

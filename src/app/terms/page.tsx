import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LegalLayout } from "@/features/marketing/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms for using ${siteConfig.name}.`,
};

const email = siteConfig.contactEmail;

export default function Terms() {
  return (
    <LegalLayout title="Terms &amp; Conditions" updated="21 October 2026">
      <p>
        These terms govern your use of {siteConfig.name}. By creating an account or using the service, you agree to them. Please read
        them alongside our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>The service</h2>
      <p>{siteConfig.name} lets you create an online wedding invitation and website, collect guest replies, and share it with one link.</p>

      <h2>Your account</h2>
      <p>Keep your password safe; you&apos;re responsible for activity under your account. Please give accurate information when you sign up.</p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Use the service only for lawful purposes and for your own event.</li>
        <li>Don&apos;t upload content you don&apos;t have the right to use, or anything unlawful, offensive, or infringing.</li>
        <li>Don&apos;t add other people&apos;s personal details without a genuine reason to contact them.</li>
        <li>Don&apos;t attempt to break, overload, or gain unauthorised access to the service.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You keep ownership of the text, photos and music you add. You give us permission to store and display that content as needed to
        host and show your invitation. You&apos;re responsible for having the rights to everything you upload.
      </p>

      <h2>Our content</h2>
      <p>The designs, templates, and wording of the service are ours (or our licensors&apos;) and may not be copied or resold.</p>

      <h2>Payment and publishing</h2>
      <p>
        An invitation is published after payment, which is arranged with you directly (for example InstaPay, Vodafone Cash, bank
        transfer, or as agreed on WhatsApp). The price is shown before you order. A published invitation stays live for the period you
        paid for and then expires unless you renew it.
      </p>

      <h2>Refunds</h2>
      <p>
        If something goes wrong on our side, contact us and we&apos;ll put it right. Because each invitation is a digital product made live
        specifically for you, we generally don&apos;t offer refunds once an invitation has been published, except where the law requires it.
      </p>

      <h2>Availability</h2>
      <p>
        We work hard to keep the service running, but it is provided &ldquo;as is&rdquo; and we can&apos;t guarantee it will always be available or
        error-free.
      </p>

      <h2>Our liability</h2>
      <p>
        To the extent the law allows, we&apos;re not liable for indirect or consequential losses, and our total liability to you is limited
        to the amount you paid us in the 12 months before the claim.
      </p>

      <h2>Ending your use</h2>
      <p>
        You can delete your account at any time from your account settings. We may suspend or remove an invitation that breaks these
        terms, and we&apos;ll try to tell you why.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Arab Republic of Egypt.</p>

      <h2>Changes</h2>
      <p>We may update these terms; the date at the top shows when. Continuing to use the service means you accept the changes.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </LegalLayout>
  );
}

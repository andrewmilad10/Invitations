import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LegalLayout } from "@/features/marketing/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your information.`,
};

const email = siteConfig.contactEmail;

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="21 October 2026">
      <p>
        This policy explains what personal information {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you use our
        wedding-invitation service, how we use it, and the choices you have. We&apos;ve kept it in plain language.
      </p>

      <h2>Who we are</h2>
      <p>
        {siteConfig.name} is a service for creating and sharing online wedding invitations and websites. If you have any question about
        your information, contact us at <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Your account:</strong> your name, email address, and a password (which we store encrypted — we never see it).</li>
        <li><strong>Your invitation:</strong> the details you add — the couple&apos;s names, your date, events, photos, music, and your guest list, including any guest names and notes you enter.</li>
        <li><strong>Guest replies:</strong> when a guest responds to your invitation, their name, whether they&apos;re coming, how many people, answers to your questions, and any note they leave.</li>
        <li><strong>Orders:</strong> to publish an invitation we collect a WhatsApp number so we can reach you, and any payment reference you give us. We do <strong>not</strong> store card numbers — payment is arranged with you directly.</li>
        <li><strong>Technical:</strong> an essential cookie to keep you securely logged in. We do not use analytics, advertising, or tracking cookies.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        To create your account, build and publish your invitation, collect replies for you, arrange payment, keep the service secure,
        and contact you about your account. We do not sell your information or use it for advertising.
      </p>

      <h2>Legal basis</h2>
      <p>
        Where data-protection law such as the GDPR applies, we rely on performing our contract with you (running your account and
        invitation), your consent where you give it, and our legitimate interest in keeping the service safe and working.
      </p>

      <h2>Guest information — your responsibility</h2>
      <p>
        When you add guests or share your invitation link, you decide whose information to add, and you are responsible for having a
        reason to contact those people. We handle guest data only on your behalf — to display your invitation and collect replies for
        you — and for no other purpose.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We don&apos;t sell your data or show ads. We rely on trusted providers to run the service: <strong>Supabase</strong> (database and
        file storage, hosted in the European Union) and <strong>Vercel</strong> (application hosting). They process data only to provide
        that hosting. We may disclose information if the law requires it.
      </p>

      <h2>Where it&apos;s stored</h2>
      <p>Your data is stored on servers in the European Union (Supabase, Paris region).</p>

      <h2>How long we keep it</h2>
      <p>
        For as long as your account is open. A published invitation stays live for the period you&apos;ve paid for and then expires. You can
        delete your account at any time from <Link href="/dashboard/account">Account</Link> &rarr; Delete my account, which removes your
        invitations, guest lists and replies.
      </p>

      <h2>How we protect it</h2>
      <p>
        Each account can see only its own data (enforced in the database, not just the app), staff access requires two-step login, and
        data is encrypted in transit and at rest.
      </p>

      <h2>Your rights</h2>
      <p>
        You can access, correct, export or delete your information. You can remove everything yourself from Account &rarr; Delete my
        account, or email us at <a href={`mailto:${email}`}>{email}</a> and we&apos;ll help.
      </p>

      <h2>Children</h2>
      <p>The service is intended for adults planning a wedding and is not directed at children under 18.</p>

      <h2>Changes</h2>
      <p>If we change this policy we&apos;ll update this page and the date at the top.</p>

      <h2>Contact</h2>
      <p>
        Questions about your privacy? Email <a href={`mailto:${email}`}>{email}</a>. See also our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/cookies">Cookies</Link> pages.
      </p>
    </LegalLayout>
  );
}

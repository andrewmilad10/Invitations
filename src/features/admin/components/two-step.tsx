"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Enrolment = { factorId: string; qr: string; secret: string };

/**
 * Two-step login for staff: set up an authenticator app once (scan the QR
 * code), then enter its 6-digit code each time you sign in. The code is
 * checked by Supabase Auth; the database then accepts admin requests from
 * this session only (it reads the session's assurance level, "aal2").
 */
export function TwoStep({ factorId, next = "/admin" }: { factorId: string | null; next?: string }) {
  const router = useRouter();
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const target = factorId ?? enrolment?.factorId ?? null;

  function setUp() {
    setError(null);
    start(async () => {
      const supabase = createClient();
      // Clear any setup that was started but never finished.
      const { data: list } = await supabase.auth.mfa.listFactors();
      for (const f of list?.all ?? []) {
        if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error: e } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Vellum ${new Date().toISOString().slice(0, 10)}` });
      if (e || !data) return setError("Two-step login couldn't be set up. Make sure it's turned on in Supabase (Authentication → Multi-factor), then try again.");
      setEnrolment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    });
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!target || busy) return;
    const clean = code.replace(/\D/g, "");
    if (clean.length !== 6) return setError("Enter the 6-digit code from your authenticator app.");
    setError(null);
    start(async () => {
      const supabase = createClient();
      const { error: e } = await supabase.auth.mfa.challengeAndVerify({ factorId: target, code: clean });
      if (e) {
        setCode("");
        return setError("That code didn't work. Codes change every 30 seconds; try the current one.");
      }
      router.replace(next);
      router.refresh();
    });
  }

  if (!factorId && !enrolment) {
    return (
      <div className="grid gap-5">
        <p className="text-muted-foreground">
          Admin shows customers, payments and every invitation, so a password alone isn&apos;t enough. Set up an authenticator app once
          (Google Authenticator, Microsoft Authenticator or 1Password), then enter its code when you sign in.
        </p>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Button size="lg" onClick={setUp} disabled={busy} className="justify-self-start">
          <ShieldCheck /> {busy ? "Preparing…" : "Set up two-step login"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={verify} className="grid gap-5" noValidate>
      {enrolment ? (
        <div className="grid gap-4 sm:grid-cols-[11rem_1fr] sm:items-center">
          {/* The QR code is an SVG data URL made by Supabase for this account. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrolment.qr} alt="QR code to scan with your authenticator app" width={176} height={176} className="rounded-lg border bg-white p-2" />
          <div className="grid gap-2 text-sm">
            <p>1. Open your authenticator app and scan this code.</p>
            <p>2. Can&apos;t scan? Enter this key instead:</p>
            <code className="break-all rounded-md border bg-background px-2 py-1.5 text-xs">{enrolment.secret}</code>
            <p>3. Type the 6-digit code it shows below.</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Open your authenticator app and enter the 6-digit code for Vellum.</p>
      )}
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="totp">
        6-digit code
        <input
          id="totp"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          aria-invalid={Boolean(error)}
          className="h-12 w-44 rounded-lg border bg-background px-3 text-center font-mono text-2xl tracking-[0.3em] outline-none focus:border-primary"
        />
      </label>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={busy} className="justify-self-start">
        <KeyRound /> {busy ? "Checking…" : enrolment ? "Turn on and continue" : "Continue"}
      </Button>
    </form>
  );
}

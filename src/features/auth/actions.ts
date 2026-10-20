"use server";

import { redirect } from "next/navigation";
import { z } from "@/lib/zod";
import { publicEnv } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath, signInSchema, signUpSchema } from "./schemas";

export type AuthFormState = {
  error?: string;
  info?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: { email?: string; fullName?: string };
  /** Signed in, and the page should continue client-side (saving a draft). */
  signedIn?: boolean;
};

/** Forms on the "save your draft" path continue in the browser instead of redirecting. */
const isDraftIntent = (formData: FormData) => formData.get("intent") === "draft";

const SERVICE_UNAVAILABLE = "We couldn't reach the sign-in service. Please try again in a moment.";

/** The bot check's answer (Cloudflare Turnstile), when the check is on. */
const captcha = (formData: FormData) => {
  const t = formData.get("cf-turnstile-response");
  return typeof t === "string" && t ? t : undefined;
};
const CAPTCHA_FAILED = "Please complete the quick check above the button and try again.";

/** Network/5xx failures shouldn't be reported as bad credentials. */
function isServiceError(error: { name?: string; status?: number }) {
  return error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 500 || !error.status;
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: { email: String(formData.get("email") ?? "") },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { captchaToken: captcha(formData) },
  });

  if (error) {
    const message = isServiceError(error)
      ? SERVICE_UNAVAILABLE
      : error.code === "captcha_failed"
        ? CAPTCHA_FAILED
        : error.code === "over_request_rate_limit" || error.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : error.code === "email_not_confirmed"
        ? "Please confirm your email address first — check your inbox."
        : "That email and password don't match an account.";
    return { error: message, values: { email: parsed.data.email } };
  }

  if (isDraftIntent(formData)) return { signedIn: true };
  redirect(safeRedirectPath(parsed.data.next));
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  const values = { email: String(formData.get("email") ?? ""), fullName: String(formData.get("fullName") ?? "") };
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/dashboard`,
      captchaToken: captcha(formData),
    },
  });

  if (error) {
    const message = isServiceError(error)
      ? SERVICE_UNAVAILABLE
      : error.code === "captcha_failed"
        ? CAPTCHA_FAILED
        : error.code === "over_request_rate_limit" || error.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : error.code === "user_already_exists"
        ? "An account with this email already exists. Try logging in."
        : error.code === "weak_password"
          ? "Please choose a stronger password."
          : "We couldn't create your account. Please try again.";
    return { error: message, values };
  }

  // With email confirmation enabled there is no session yet.
  if (!data.session) {
    return {
      info: isDraftIntent(formData)
        ? "We sent you a confirmation link. Open it, log in, and your invitation will be saved to your account — it's kept safe in this browser until then."
        : "Almost there — we sent you a confirmation link. Open it to finish creating your account.",
      values,
    };
  }
  if (isDraftIntent(formData)) return { signedIn: true };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const emailOnly = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address.") });
const RESET_SENT = "If an account uses that email, we've sent a link to choose a new password. It works once, for a short time.";

/** Sends a reset link. The answer is the same whether or not the email has an account. */
export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = emailOnly.safeParse(Object.fromEntries(formData));
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/dashboard/account/password`,
    captchaToken: captcha(formData),
  });
  if (error?.code === "captcha_failed") return { error: CAPTCHA_FAILED, values };
  if (error && isServiceError(error)) return { error: SERVICE_UNAVAILABLE, values };
  // Rate limits and unknown emails get the same answer as success.
  return { info: RESET_SENT };
}

const newPassword = z
  .object({ password: z.string().min(8, "At least 8 characters.").max(72, "At most 72 characters."), confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two passwords don't match." });

/** Changes the signed-in person's password. */
export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = newPassword.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const message = isServiceError(error)
      ? SERVICE_UNAVAILABLE
      : error.code === "same_password"
        ? "That's your current password. Choose a new one."
        : error.code === "weak_password"
          ? "Please choose a stronger password (it may have appeared in a data leak)."
          : error.code === "reauthentication_needed"
            ? "For safety, please log out, log in again and change it straight away."
            : "We couldn't change your password. Please log in again and retry.";
    return { error: message };
  }
  return { info: "Your password is changed. Use the new one next time you log in." };
}

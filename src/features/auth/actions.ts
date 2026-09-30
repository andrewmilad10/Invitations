"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { publicEnv } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath, signInSchema, signUpSchema } from "./schemas";

export type AuthFormState = {
  error?: string;
  info?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: { email?: string; fullName?: string };
};

const SERVICE_UNAVAILABLE = "We couldn't reach the sign-in service. Please try again in a moment.";

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
  });

  if (error) {
    const message = isServiceError(error)
      ? SERVICE_UNAVAILABLE
      : error.code === "email_not_confirmed"
        ? "Please confirm your email address first — check your inbox."
        : "That email and password don't match an account.";
    return { error: message, values: { email: parsed.data.email } };
  }

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
    },
  });

  if (error) {
    const message = isServiceError(error)
      ? SERVICE_UNAVAILABLE
      : error.code === "user_already_exists"
        ? "An account with this email already exists. Try logging in."
        : error.code === "weak_password"
          ? "Please choose a stronger password."
          : "We couldn't create your account. Please try again.";
    return { error: message, values };
  }

  // With email confirmation enabled there is no session yet.
  if (!data.session) {
    return { info: "Almost there — we sent you a confirmation link. Open it to finish creating your account.", values };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

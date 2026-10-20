"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteMyAccount } from "./actions";

/** Delete-account form: typing the email address is the confirmation. */
export function DeleteAccount({ email }: { email: string }) {
  const [state, action, pending] = useActionState(deleteMyAccount, null);
  const [typed, setTyped] = useState("");
  const ready = typed.trim().toLowerCase() === email.toLowerCase();
  return (
    <form action={action} className="grid gap-3">
      <label htmlFor="confirm" className="text-sm">
        Type <strong className="font-medium">{email}</strong> to confirm
      </label>
      <input
        id="confirm"
        name="confirm"
        type="email"
        autoComplete="off"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="h-11 rounded-lg border bg-background px-3 text-base outline-none focus:border-destructive sm:max-w-sm"
      />
      {state?.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="destructive" disabled={!ready || pending} className="justify-self-start">
        {pending ? "Deleting…" : "Delete my account for good"}
      </Button>
    </form>
  );
}

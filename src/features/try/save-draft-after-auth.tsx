"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { transferDraft } from "./transfer";

/**
 * Shown right after sign-up / log-in on the "save your invitation" path:
 * moves the browser draft into the new account, then opens the editor.
 */
export function SaveDraftAfterAuth() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    transferDraft().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.photosNotSaved) toast.warning(`${result.photosNotSaved} photo(s) couldn't be uploaded — you can add them again in the editor.`);
      else toast.success("Your invitation is saved to your account.");
      router.replace(`/dashboard/weddings/${result.weddingId}`);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (error) {
    return (
      <div role="alert" className="grid gap-4 text-center">
        <p className="text-sm">{error}</p>
        <Button asChild>
          <Link href="/dashboard">Go to my weddings</Link>
        </Button>
      </div>
    );
  }
  return (
    <p role="status" className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Saving your invitation…
    </p>
  );
}

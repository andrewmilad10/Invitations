"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteWedding } from "../actions";

/** Remove (permanently delete) an invitation the user owns, after a confirmation. */
export function RemoveButton({ weddingId, coupleName }: { weddingId: string; coupleName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    if (!window.confirm(`Remove "${coupleName}"? This permanently deletes this invitation and everything in it. This can't be undone.`)) return;
    setError(null);
    start(async () => {
      const result = await deleteWedding(weddingId);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onClick}
        disabled={pending}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 /> {pending ? "Removing…" : "Remove"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </>
  );
}

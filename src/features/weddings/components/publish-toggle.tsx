"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setWeddingPublished } from "../actions";

export function PublishToggle({
  weddingId,
  published,
  publicUrl,
  size = "sm",
}: {
  weddingId: string;
  published: boolean;
  publicUrl: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setWeddingPublished(weddingId, !published);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (!published) {
        toast.success("Your invitation is live!", {
          description: publicUrl,
          action: { label: "Copy link", onClick: () => void navigator.clipboard?.writeText(publicUrl) },
        });
      } else {
        toast("Invitation unpublished. The link no longer works.");
      }
      router.refresh();
    });
  }

  return (
    <Button size={size} variant={published ? "outline" : "default"} onClick={toggle} disabled={pending}>
      {pending ? (published ? "Unpublishing…" : "Publishing…") : published ? "Unpublish" : "Publish"}
    </Button>
  );
}

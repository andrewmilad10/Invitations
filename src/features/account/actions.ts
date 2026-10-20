"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/session";
import { MEDIA_BUCKET } from "@/features/media/urls";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: false; error: string };

/**
 * Deletes the signed-in couple's account: first the photos and music they
 * uploaded (Storage only allows that through its API), then, in one
 * database transaction, their invitations, guest lists, replies, wishes and
 * the account itself. Orders stay for the accounts without name or phone.
 * They confirm by typing their email address.
 */
export async function deleteMyAccount(_prev: Result | null, formData: FormData): Promise<Result | null> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has expired. Please log in again." };
  const typed = String(formData.get("confirm") ?? "").trim().toLowerCase();
  if (!user.email || typed !== user.email.toLowerCase()) return { ok: false, error: "Type your email address exactly to confirm." };

  const supabase = await createClient();
  const { data: own } = await supabase.from("weddings").select("id").eq("owner_id", user.id);
  for (const w of own ?? []) {
    const root = `weddings/${w.id}`;
    const { data: entries } = await supabase.storage.from(MEDIA_BUCKET).list(root, { limit: 100 });
    const paths: string[] = [];
    for (const e of entries ?? []) {
      // Folders (hero, gallery, music…) come back without an id.
      if (e.id) paths.push(`${root}/${e.name}`);
      else {
        const { data: files } = await supabase.storage.from(MEDIA_BUCKET).list(`${root}/${e.name}`, { limit: 1000 });
        for (const f of files ?? []) paths.push(`${root}/${e.name}/${f.name}`);
      }
    }
    for (let i = 0; i < paths.length; i += 100) await supabase.storage.from(MEDIA_BUCKET).remove(paths.slice(i, i + 100));
  }

  const { data, error } = await supabase.rpc("delete_my_account");
  const res = data as { ok?: boolean; error?: string } | null;
  if (error) return { ok: false, error: error.code === "P0429" ? "Please wait a little and try again." : "We couldn't delete your account. Please try again." };
  if (!res?.ok) return { ok: false, error: res?.error ?? "We couldn't delete your account." };
  await supabase.auth.signOut();
  redirect("/?account=deleted");
}

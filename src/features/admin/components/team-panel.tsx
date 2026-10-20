"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setStaff } from "../actions";
import { fmtDay } from "../format";
import type { StaffRow } from "../types";

const ROLE = {
  owner: ["Owner", "Everything, including the team"],
  admin: ["Admin", "Everything except the team"],
  marketing: ["Marketing", "Numbers, trends and designs. No money, no customer emails, no changes"],
} as const;

export function TeamPanel({ staff, canManage, myEmail }: { staff: StaffRow[]; canManage: boolean; myEmail: string | null }) {
  const [busy, start] = useTransition();
  const change = (email: string, role: string, done: string) =>
    start(async () => {
      const r = await setStaff(email, role);
      if (!r.ok) return void toast.error(r.error);
      toast.success(done);
    });
  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "");
    change(email, String(f.get("role") ?? "marketing"), `${email} added`);
    e.currentTarget.reset();
  };
  return (
    <div className="grid gap-6">
      <ul className="grid gap-2">
        {staff.map((s) => (
          <li key={s.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
            <div>
              <div className="font-medium">{s.email}{s.email === myEmail ? <span className="text-muted-foreground"> (you)</span> : null}</div>
              <div className="text-sm text-muted-foreground">{ROLE[s.role][0]} · {ROLE[s.role][1]} · since {fmtDay(s.since)}</div>
            </div>
            {canManage && s.email !== myEmail && s.email ? (
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`role-${s.userId}`}>Role for {s.email}</label>
                <select id={`role-${s.userId}`} defaultValue={s.role} disabled={busy} onChange={(e) => change(s.email!, e.target.value, "Role changed")} className="h-9 rounded-lg border bg-background px-2 text-sm">
                  {Object.entries(ROLE).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
                </select>
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => window.confirm(`Remove ${s.email} from the team?`) && change(s.email!, "", "Removed")}>
                  Remove
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {canManage ? (
        <form onSubmit={add} className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <label className="grid gap-1.5 text-sm">
            Add someone by the email they signed up with
            <input name="email" type="email" required maxLength={254} placeholder="name@example.com" className="h-11 rounded-lg border bg-background px-3 text-base outline-none focus:border-primary" />
          </label>
          <label className="grid gap-1.5 text-sm">
            Role
            <select name="role" defaultValue="marketing" className="h-11 rounded-lg border bg-background px-3">
              {Object.entries(ROLE).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </label>
          <Button type="submit" disabled={busy} className="h-11">Add to team</Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Only the owner can add or remove team members.</p>
      )}
    </div>
  );
}

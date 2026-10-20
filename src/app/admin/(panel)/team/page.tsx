import type { Metadata } from "next";
import { TeamPanel } from "@/features/admin/components/team-panel";
import { loadStaff, requireStaff } from "@/features/admin/queries";
import { canManageTeam } from "@/features/admin/types";

export const metadata: Metadata = { title: "Team" };

export default async function AdminTeam() {
  const [me, staff] = await Promise.all([requireStaff(["owner", "admin"]), loadStaff()]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl font-light sm:text-5xl">Team</h1>
        <p className="mt-1 text-muted-foreground">Who can open this admin area, and what each person can see and do.</p>
      </div>
      <TeamPanel staff={staff} canManage={canManageTeam(me.role)} myEmail={me.email} />
    </div>
  );
}

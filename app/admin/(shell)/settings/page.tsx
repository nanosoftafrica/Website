import { getAdminSession } from "@/lib/adminAuth";
import { listAdminUsers } from "@/lib/adminDb";
import SettingsPanel from "@/components/admin/SettingsPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getAdminSession();
  const isSuperAdmin = session?.role === "super_admin";
  const users = isSuperAdmin ? await listAdminUsers() : [];
  return (
    <>
      <ScreenHelp>{"Change your password here. Super admins can also make a backup and manage user accounts."}</ScreenHelp>
      <SettingsPanel isSuperAdmin={isSuperAdmin} users={users} currentUserId={session?.id ?? 0} />
    </>
  );
}

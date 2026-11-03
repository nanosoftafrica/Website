import { getAdminSession } from "@/lib/adminAuth";
import { listAdminUsers } from "@/lib/adminDb";
import SettingsPanel from "@/components/admin/SettingsPanel";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getAdminSession();
  const isSuperAdmin = session?.role === "super_admin";
  const users = isSuperAdmin ? await listAdminUsers() : [];
  return <SettingsPanel isSuperAdmin={isSuperAdmin} users={users} currentUserId={session?.id ?? 0} />;
}

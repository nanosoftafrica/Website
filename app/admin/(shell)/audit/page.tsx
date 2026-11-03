import { listAuditLog } from "@/lib/adminDb";
import AuditLogPanel from "@/components/admin/AuditLogPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const items = await listAuditLog();
  return (
    <>
      <ScreenHelp>{"A record of who changed what in admin. Nothing here changes the website."}</ScreenHelp>
      <AuditLogPanel items={items} />
    </>
  );
}

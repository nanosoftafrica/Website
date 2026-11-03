import { listAuditLog } from "@/lib/adminDb";
import AuditLogPanel from "@/components/admin/AuditLogPanel";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const items = await listAuditLog();
  return <AuditLogPanel items={items} />;
}

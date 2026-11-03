import { listSuppliers } from "@/lib/adminDb";
import SuppliersPanel from "@/components/admin/SuppliersPanel";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();
  return <SuppliersPanel initialItems={suppliers} />;
}

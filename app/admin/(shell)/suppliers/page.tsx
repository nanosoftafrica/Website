import { listSuppliers } from "@/lib/adminDb";
import SuppliersPanel from "@/components/admin/SuppliersPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();
  return (
    <>
      <ScreenHelp>{"Your supplier list. Nothing here changes the website."}</ScreenHelp>
      <SuppliersPanel initialItems={suppliers} />
    </>
  );
}

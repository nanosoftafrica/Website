import { listTechnicians } from "@/lib/adminDb";
import TechniciansPanel from "@/components/admin/TechniciansPanel";

export const dynamic = "force-dynamic";

export default async function TechniciansPage() {
  const technicians = await listTechnicians();
  return <TechniciansPanel initialItems={technicians} />;
}

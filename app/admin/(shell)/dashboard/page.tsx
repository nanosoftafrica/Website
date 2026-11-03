import { getEnrichedDashboardData } from "@/lib/adminDb";
import { getWahaStatus } from "@/lib/wahaService";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [enrichedData, wahaStatus] = await Promise.all([
    getEnrichedDashboardData(),
    getWahaStatus(),
  ]);

  return <DashboardClient initialData={enrichedData} initialWahaStatus={wahaStatus} />;
}

import { getEnrichedDashboardData } from "@/lib/adminDb";
import { getWahaStatus } from "@/lib/wahaService";
import DashboardClient from "@/components/admin/DashboardClient";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [enrichedData, wahaStatus] = await Promise.all([
    getEnrichedDashboardData(),
    getWahaStatus(),
  ]);

  return (
    <>
      <ScreenHelp>{"An overview of leads, sales and support. Nothing here changes the website."}</ScreenHelp>
      <DashboardClient initialData={enrichedData} initialWahaStatus={wahaStatus} />
    </>
  );
}

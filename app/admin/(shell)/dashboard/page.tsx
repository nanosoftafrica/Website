import { getEnrichedDashboardData } from "@/lib/adminDb";
import DashboardClient from "@/components/admin/DashboardClient";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const enrichedData = await getEnrichedDashboardData();

  return (
    <>
      <ScreenHelp>{"An overview of leads, sales and support. Nothing here changes the website."}</ScreenHelp>
      <DashboardClient initialData={enrichedData} />
    </>
  );
}
